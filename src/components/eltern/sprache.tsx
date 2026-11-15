"use client";

/**
 * Texte und Datumsformate des Eltern-Bereichs in der gewählten Sprache.
 * Die Spracheinstellung selbst liegt in src/components/ui/sprache.tsx (gilt auch für Kinder).
 * Texte der Anbieter (Titel, Beschreibung) bleiben im Original.
 */
import { LOCALE, tagSchluessel, type Sprache } from "@/lib/eltern-suche";
import { relativ } from "@/lib/format";
import { TEXTE } from "./texte";

export { SprachUmschalter, useSprache } from "@/components/ui/sprache";
import { useSprache } from "@/components/ui/sprache";

/** Texte der gewählten Sprache (siehe texte.ts). */
export function useTexte() {
  return TEXTE[useSprache()];
}

// ---------- Datum und Uhrzeit in der gewählten Sprache ----------

const formate = new Map<string, Intl.DateTimeFormat>();
function format(sprache: Sprache, optionen: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const schluessel = `${sprache}|${JSON.stringify(optionen)}`;
  let f = formate.get(schluessel);
  if (!f) {
    f = new Intl.DateTimeFormat(LOCALE[sprache], { timeZone: "Europe/Berlin", ...optionen });
    formate.set(schluessel, f);
  }
  return f;
}

function relativEnglisch(iso: string, jetzt: Date): string {
  const tage = Math.round((Date.parse(tagSchluessel(iso)) - Date.parse(tagSchluessel(jetzt))) / 86_400_000);
  if (tage <= 0) return "today";
  if (tage === 1) return "tomorrow";
  if (tage < 14) return `in ${tage} days`;
  const wochen = Math.round(tage / 7);
  if (wochen < 9) return `in ${wochen} weeks`;
  return `in ${Math.round(tage / 30)} months`;
}

export function datum(sprache: Sprache) {
  const f = (iso: string, o: Intl.DateTimeFormatOptions) => format(sprache, o).format(new Date(iso));
  const hm = (iso: string) => f(iso, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  return {
    wochentag: (iso: string) => f(iso, { weekday: "short" }).replace(".", ""),
    tagZahl: (iso: string) => f(iso, { day: "numeric" }).replace(".", ""),
    monatKurz: (iso: string) => f(iso, { month: "short" }).replace(".", ""),
    tagKurz: (iso: string) => f(iso, { weekday: "short", day: "numeric", month: "short" }),
    tagLang: (iso: string) => f(iso, { weekday: "long", day: "numeric", month: "long" }),
    stand: (iso: string) => f(iso, { day: "numeric", month: "long", year: "numeric" }),
    zeit: (start: string, ende?: string) => `${hm(start)}${ende ? `–${hm(ende)}` : ""}${sprache === "de" ? " Uhr" : ""}`,
    relativ: (iso: string, jetzt: Date) => (sprache === "de" ? relativ(iso, jetzt) : relativEnglisch(iso, jetzt)),
  };
}

export function useDatum() {
  return datum(useSprache());
}
