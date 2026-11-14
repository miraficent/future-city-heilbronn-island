"use client";

/**
 * Live-Events aus Mobilizon für Client-Komponenten.
 * Jede Seite fragt beim Öffnen neu ab; gleichzeitige Anfragen auf derselben Seite teilen sich einen Abruf.
 * Ist Mobilizon nicht erreichbar, gibt es keine Ersatzdaten – status "fehler" zeigt einen Hinweis.
 */
import { useEffect, useState } from "react";
import kategorien from "@/data/categories.json";
import type { Category, LiveEvent } from "@/types";
import { ladeMobilizonEvents } from "./mobilizon";

export type LiveEventsZustand = { status: "laedt" | "ok" | "fehler"; events: LiveEvent[] };

let laufend: Promise<LiveEvent[]> | null = null;

function lade(): Promise<LiveEvent[]> {
  laufend ??= ladeMobilizonEvents(kategorien as Category[], AbortSignal.timeout(15_000)).finally(() => {
    laufend = null;
  });
  return laufend;
}

export function useLiveEvents(): LiveEventsZustand {
  const [zustand, setZustand] = useState<LiveEventsZustand>({ status: "laedt", events: [] });
  useEffect(() => {
    let aktiv = true;
    lade().then(
      (events) => aktiv && setZustand({ status: "ok", events }),
      (fehler: unknown) => {
        console.warn("Live-Events nicht geladen:", fehler);
        if (aktiv) setZustand({ status: "fehler", events: [] });
      },
    );
    return () => {
      aktiv = false;
    };
  }, []);
  return zustand;
}
