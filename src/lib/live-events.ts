"use client";

/**
 * Live-Events aus Mobilizon für Client-Komponenten – einmal laden, dann wiederverwenden.
 *
 * Der erste Aufruf (meist die Kinderkarte, während das Kind sein Alter wählt) lädt im Hintergrund.
 * Das Ergebnis bleibt im Speicher und in der Browsersitzung (sessionStorage, cosmos.live-events):
 * Häuser öffnen dann sofort, auch nach einem Neuladen. Ist der Stand älter als FRISCH_MS,
 * wird beim nächsten Aufruf still im Hintergrund nachgeladen – die alten Events bleiben bis dahin sichtbar.
 * Ist Mobilizon nicht erreichbar und nichts gespeichert, gibt es keine Ersatzdaten – status "fehler" zeigt einen Hinweis.
 */
import { useSyncExternalStore } from "react";
import kategorien from "@/data/categories.json";
import type { Category, LiveEvent } from "@/types";
import { ladeMobilizonEvents } from "./mobilizon";
import { lies, schreibe } from "./speicher";

export type LiveEventsZustand = { status: "laedt" | "ok" | "fehler"; events: LiveEvent[] };

const SCHLUESSEL = "live-events";
const FRISCH_MS = 10 * 60_000;
const LAEDT: LiveEventsZustand = { status: "laedt", events: [] };

type Gespeichert = { zeit: number; events: LiveEvent[] };

let zustand: LiveEventsZustand | null = null; // null = Sitzungsspeicher noch nicht gelesen
let geladenUm = 0;
let laufend: Promise<void> | null = null;
const hoerer = new Set<() => void>();

function aktuell(): LiveEventsZustand {
  if (zustand === null) {
    const g = lies<Gespeichert | null>("sitzung", SCHLUESSEL, null);
    zustand = g ? { status: "ok", events: g.events } : LAEDT;
    geladenUm = g?.zeit ?? 0;
  }
  return zustand;
}

function setze(neu: LiveEventsZustand) {
  zustand = neu;
  hoerer.forEach((h) => h());
}

/** Startet das Laden, falls nichts Frisches da ist. Mehrfach aufrufbar – es läuft höchstens ein Abruf. */
export function ladeLiveEventsVor(): void {
  if (laufend || (aktuell().status === "ok" && Date.now() - geladenUm < FRISCH_MS)) return;
  laufend = ladeMobilizonEvents(kategorien as Category[], AbortSignal.timeout(15_000))
    .then(
      (events) => {
        geladenUm = Date.now();
        schreibe<Gespeichert>("sitzung", SCHLUESSEL, { zeit: geladenUm, events });
        setze({ status: "ok", events });
      },
      (fehler: unknown) => {
        console.warn("Live-Events nicht geladen:", fehler);
        // Schon geladene Events bleiben stehen; nur ohne Daten gibt es den Hinweis
        if (aktuell().status !== "ok") setze({ status: "fehler", events: [] });
      },
    )
    .finally(() => {
      laufend = null;
    });
}

function abonniere(melden: () => void) {
  hoerer.add(melden);
  ladeLiveEventsVor();
  return () => {
    hoerer.delete(melden);
  };
}

/** Der Server rendert immer „lädt“ – der Browser ergänzt gespeicherte oder frisch geladene Events */
export function useLiveEvents(): LiveEventsZustand {
  return useSyncExternalStore(abonniere, aktuell, () => LAEDT);
}
