"use client";

/**
 * Werte, die es nur im Browser gibt (Uhrzeit, Adresszeile, Fähigkeiten des Geräts).
 * Über useSyncExternalStore: Der Server rendert mit einem Ersatzwert, der Browser ergänzt ihn
 * ohne Hydration-Fehler und ohne setState in einem Effect.
 */
import { useSyncExternalStore } from "react";

const nichts = () => () => {};

function abonniereUhr(melden: () => void) {
  const timer = setInterval(melden, 30_000);
  return () => clearInterval(timer);
}

/** Aktuelle Minute als ISO-Text; beim Server-Rendern der übergebene Startwert. */
export function useJetzt(start: string): string {
  const minute = useSyncExternalStore(abonniereUhr, () => Math.floor(Date.now() / 60_000) * 60_000, () => null);
  return minute === null ? start : new Date(minute).toISOString();
}

function abonniereAdresse(melden: () => void) {
  window.addEventListener("popstate", melden);
  return () => window.removeEventListener("popstate", melden);
}

/** Ein Parameter aus der Adresszeile, z. B. `?modus=teen`; beim Server-Rendern null. */
export function useUrlParameter(name: string): string | null {
  return useSyncExternalStore(abonniereAdresse, () => new URLSearchParams(window.location.search).get(name), () => null);
}

/** „https://…“ der eigenen Seite; beim Server-Rendern leer. */
export function useHerkunft(): string {
  return useSyncExternalStore(nichts, () => window.location.origin, () => "");
}

/** Prüft eine Fähigkeit des Browsers (z. B. Vorlesen); beim Server-Rendern false. */
export function useBrowserKann(pruefen: () => boolean): boolean {
  return useSyncExternalStore(nichts, pruefen, () => false);
}
