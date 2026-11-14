"use client";

/**
 * Kleiner Zustand des Kinder-Modus, nur im Browser:
 *  - Alter des Kindes (sessionStorage – weg, wenn der Browser zu ist)
 *  - die aktuelle Minute (für „Heute!“ und kommende Termine)
 * Über useSyncExternalStore: der Server rendert ohne diese Werte, der Browser ergänzt sie ohne Flackern.
 */
import { useSyncExternalStore } from "react";
import { lies, schreibe } from "./speicher";

const SCHLUESSEL = "kinder.alter";
const EREIGNIS = "cosmos:kinder-alter";

function abonniereAlter(melden: () => void) {
  window.addEventListener(EREIGNIS, melden);
  return () => window.removeEventListener(EREIGNIS, melden);
}

export function useKinderAlter(): [number | null, (alter: number | null) => void] {
  const alter = useSyncExternalStore(
    abonniereAlter,
    () => lies<number | null>("sitzung", SCHLUESSEL, null),
    () => null,
  );
  const setzen = (neu: number | null) => {
    schreibe("sitzung", SCHLUESSEL, neu);
    window.dispatchEvent(new Event(EREIGNIS));
  };
  return [alter, setzen];
}

const nichts = () => () => {};

/** Aktuelle Minute als Zeitstempel (null beim Server-Rendern) */
export function useMinute(): number | null {
  return useSyncExternalStore(nichts, () => Math.floor(Date.now() / 60_000) * 60_000, () => null);
}
