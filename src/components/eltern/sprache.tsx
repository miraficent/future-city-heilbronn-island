"use client";

/**
 * Sprache des Eltern-Bereichs (Deutsch/Englisch). Die Wahl ist eine Einstellung auf diesem Gerät
 * (localStorage „cosmos.sprache“) und wird nirgendwohin gesendet. Der Server rendert Deutsch.
 * Texte der Anbieter (Titel, Beschreibung) bleiben im Original.
 */
import { useEffect, useSyncExternalStore } from "react";
import { LOCALE, tagSchluessel, type Sprache } from "@/lib/eltern-suche";
import { relativ } from "@/lib/format";
import { lies, schreibe } from "@/lib/speicher";
import { TEXTE } from "./texte";

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

/** Texte der gewählten Sprache (siehe texte.ts). */
export function useTexte() {
  return TEXTE[useSprache()];
}

function setzeSprache(sprache: Sprache) {
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
