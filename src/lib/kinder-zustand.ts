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

const FIGUR_SCHLUESSEL = "kinder.figur";
const FIGUR_EREIGNIS = "cosmos:kinder-figur";

function abonniereFigur(melden: () => void) {
  window.addEventListener(FIGUR_EREIGNIS, melden);
  return () => window.removeEventListener(FIGUR_EREIGNIS, melden);
}

/** Gewählte Kinderfigur ("lila" | "tuerkis" | "orange"), nur in der Browsersitzung */
export function useKinderFigur<T extends string>(): [T | null, (figur: T | null) => void] {
  const figur = useSyncExternalStore(
    abonniereFigur,
    () => lies<T | null>("sitzung", FIGUR_SCHLUESSEL, null),
    () => null,
  );
  const setzen = (neu: T | null) => {
    schreibe("sitzung", FIGUR_SCHLUESSEL, neu);
    window.dispatchEvent(new Event(FIGUR_EREIGNIS));
  };
  return [figur, setzen];
}
