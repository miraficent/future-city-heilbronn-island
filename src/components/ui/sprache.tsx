"use client";

/**
 * Sprache der Oberfläche (Deutsch/Englisch) – gilt für Kinder- und Eltern-Bereich.
 * Die Wahl ist eine Einstellung auf diesem Gerät (localStorage „cosmos.sprache“) und wird nirgendwohin gesendet.
 * Der Server rendert Deutsch.
 */
import { useEffect, useSyncExternalStore } from "react";
import { lies, schreibe } from "@/lib/speicher";
import type { Sprache } from "@/types";

const SCHLUESSEL = "sprache";
const EREIGNIS = "cosmos:sprache";

function abonniere(melden: () => void) {
  window.addEventListener(EREIGNIS, melden);
  window.addEventListener("storage", melden);
  return () => {
    window.removeEventListener(EREIGNIS, melden);
    window.removeEventListener("storage", melden);
  };
}

export function useSprache(): Sprache {
  return useSyncExternalStore(abonniere, () => (lies<unknown>("geraet", SCHLUESSEL, "de") === "en" ? "en" : "de"), () => "de");
}

export function setzeSprache(sprache: Sprache) {
  schreibe("geraet", SCHLUESSEL, sprache);
  window.dispatchEvent(new Event(EREIGNIS));
}

/** Umschalter „DE | EN“ in der Top-Leiste, im selben Stil wie „Kinder | Eltern“. */
export function SprachUmschalter() {
  const sprache = useSprache();
  // Screenreader und Silbentrennung sollen die richtige Sprache kennen.
  useEffect(() => {
    document.documentElement.lang = sprache;
  }, [sprache]);
  return (
    <div className="ui-mode el-sprache" role="group" aria-label={sprache === "en" ? "Language" : "Sprache"}>
      {(["de", "en"] as const).map((s) => (
        <button key={s} type="button" className="ui-mode__item" aria-pressed={sprache === s} lang={s} aria-label={s === "de" ? "Deutsch" : "English"} onClick={() => setzeSprache(s)}>
          {s.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
