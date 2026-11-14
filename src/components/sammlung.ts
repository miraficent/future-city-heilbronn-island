"use client";

import { useSyncExternalStore } from "react";
import { lies, schreibe, loesche } from "@/lib/speicher";
import type { Modus } from "@/lib/entdecken";

/**
 * Gemerkte Angebote je Bereich: Kinder („Da will ich hin!“), Teens und Eltern („Merken“).
 * Standard: nur in der Browsersitzung. Teens und Eltern können „Auf diesem Gerät behalten“ wählen.
 * Ein Zustand je Bereich im Modul – alle Komponenten einer Seite sehen sofort dasselbe.
 * `geladen` ist false, solange der Server rendert (dort gibt es keinen Browserspeicher).
 */
type Zustand = { ids: string[]; dauerhaft: boolean; geladen: boolean };

const SERVER: Zustand = { ids: [], dauerhaft: false, geladen: false };
const EREIGNIS = "cosmos:merkliste";
const zustaende = new Map<Modus, Zustand>();
const abos = new Map<Modus, (melden: () => void) => () => void>();

function ausSpeicher(modus: Modus): Zustand {
  const schluessel = `merkliste.${modus}`;
  const dauerhaft = modus !== "kind" && lies<unknown>("geraet", `${schluessel}.erlaubt`, false) === true;
  const gespeichert = lies<unknown>(dauerhaft ? "geraet" : "sitzung", schluessel, []);
  const ids = Array.isArray(gespeichert) ? gespeichert.filter((id): id is string => typeof id === "string") : [];
  return { ids, dauerhaft, geladen: true };
}

const gleich = (x: Zustand, y: Zustand) => x.dauerhaft === y.dauerhaft && x.ids.join("\n") === y.ids.join("\n");

function zustand(modus: Modus): Zustand {
  let z = zustaende.get(modus);
  if (!z) {
    z = ausSpeicher(modus);
    zustaende.set(modus, z);
  }
  return z;
}

function setze(modus: Modus, neu: Zustand) {
  zustaende.set(modus, neu);
  window.dispatchEvent(new CustomEvent(EREIGNIS, { detail: { modus, ids: neu.ids, dauerhaft: neu.dauerhaft } }));
}

/** Eine feste Abo-Funktion je Bereich (sonst meldet React sich bei jedem Rendern neu an). */
function abonnent(modus: Modus) {
  let abo = abos.get(modus);
  if (!abo) {
    abo = (melden) => {
      // Beim Öffnen einer Seite frisch lesen – z. B. nach „Alles löschen“ auf der Datenschutzseite.
      const frisch = ausSpeicher(modus);
      const vorher = zustaende.get(modus);
      if (!vorher || !gleich(vorher, frisch)) {
        zustaende.set(modus, frisch);
        melden();
      }
      const anderesFenster = (e: StorageEvent) => {
        if (e.key?.startsWith(`cosmos.merkliste.${modus}`)) {
          zustaende.set(modus, ausSpeicher(modus));
          melden();
        }
      };
      window.addEventListener(EREIGNIS, melden);
      window.addEventListener("storage", anderesFenster);
      return () => {
        window.removeEventListener(EREIGNIS, melden);
        window.removeEventListener("storage", anderesFenster);
      };
    };
    abos.set(modus, abo);
  }
  return abo;
}

export function useSammlung(modus: Modus) {
  const z = useSyncExternalStore(abonnent(modus), () => zustand(modus), () => SERVER);
  const schluessel = `merkliste.${modus}`;

  function merken(id: string) {
    const aktuell = zustand(modus);
    const ids = aktuell.ids.includes(id) ? aktuell.ids.filter((i) => i !== id) : [...aktuell.ids, id];
    schreibe(aktuell.dauerhaft ? "geraet" : "sitzung", schluessel, ids);
    setze(modus, { ...aktuell, ids });
  }

  function behalten(wert: boolean) {
    if (modus === "kind") return;
    const { ids } = zustand(modus);
    if (wert) {
      schreibe("geraet", `${schluessel}.erlaubt`, true);
      schreibe("geraet", schluessel, ids);
      loesche("sitzung", schluessel);
    } else {
      loesche("geraet", `${schluessel}.erlaubt`);
      loesche("geraet", schluessel);
      schreibe("sitzung", schluessel, ids);
    }
    setze(modus, { ids, dauerhaft: wert, geladen: true });
  }

  function leeren() {
    loesche("geraet", schluessel);
    loesche("sitzung", schluessel);
    setze(modus, { ...zustand(modus), ids: [] });
  }

  return { ids: z.ids, merken, dauerhaft: z.dauerhaft, behalten, leeren, geladen: z.geladen };
}
