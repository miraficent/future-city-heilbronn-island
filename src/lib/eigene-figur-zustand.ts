"use client";

/**
 * Die eigene Figur des Kindes – nur in sessionStorage („cosmos.kinder.figur.eigen“), weg, wenn der Browser zu ist.
 * Über useSyncExternalStore wie in kinder-zustand.ts; der Server rendert die Standardfigur.
 */
import { useSyncExternalStore } from "react";
import { pruefeAussehen, STANDARD_AUSSEHEN, type Aussehen } from "./eigene-figur";
import { lies, schreibe } from "./speicher";

const SCHLUESSEL = "kinder.figur.eigen";
const EREIGNIS = "cosmos:kinder-figur-eigen";

// Gleiches Objekt zurückgeben, solange sich der gespeicherte Wert nicht ändert (sonst rendert React endlos).
let zuletzt = "";
let wert: Aussehen = STANDARD_AUSSEHEN;
function lesen(): Aussehen {
  const roh = JSON.stringify(lies<unknown>("sitzung", SCHLUESSEL, null));
  if (roh !== zuletzt) {
    zuletzt = roh;
    wert = pruefeAussehen(JSON.parse(roh));
  }
  return wert;
}

function abonniere(melden: () => void) {
  window.addEventListener(EREIGNIS, melden);
  return () => window.removeEventListener(EREIGNIS, melden);
}

export function useEigeneFigur(): [Aussehen, (neu: Aussehen) => void] {
  const aussehen = useSyncExternalStore(abonniere, lesen, () => STANDARD_AUSSEHEN);
  const setzen = (neu: Aussehen) => {
    schreibe("sitzung", SCHLUESSEL, pruefeAussehen(neu));
    window.dispatchEvent(new Event(EREIGNIS));
  };
  return [aussehen, setzen];
}
