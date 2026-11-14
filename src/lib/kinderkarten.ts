/**
 * Ein gemeinsames Format für alles, was Kinder auf Karte und Einrichtungsseiten sehen –
 * egal ob es aus den Kursen (daten/angebote.json) oder den Live-Events (src/data/events.json) kommt.
 * Sicherheit: nur über fuerModus("kind") bzw. isForKids() – nie eigene Filter.
 */
import type { Angebot } from "./angebot";
import { fuerModus } from "./entdecken";
import { naechsterStart } from "./filter";
import { isForKids, isFree } from "./events";
import type { CategoryId, LiveEvent } from "@/types";

export type KinderKarte = {
  /** Kurs-ID oder "ev:" + Event-ID – dieselbe ID landet im Wunsch-Rucksack */
  id: string;
  institutionId: string;
  titel: string;
  kategorien: CategoryId[];
  start: string;
  ageMin: number | null;
  ageMax: number | null;
  gratis: boolean;
  /** Kurzer Text, den die Eule vorliest */
  geschichte: string;
  anmeldeUrl: string;
  beispiel: boolean;
};

/** Themen der Kurse (konfiguration/themen.csv) → Kategorien der Kinder-Ansicht */
const THEMA_ZU_KATEGORIE: Record<string, CategoryId> = { ki: "it", coding: "coding", gaming: "gaming" };

/** Erster Satz, höchstens ~18 Wörter – Kurs-Texte sind für Erwachsene geschrieben */
function ersterSatz(text: string): string {
  const satz = text.split(/(?<=[.!?])\s+/)[0] ?? "";
  const woerter = satz.split(/\s+/);
  return woerter.length > 18 ? woerter.slice(0, 18).join(" ") + " …" : satz;
}

export function ausAngebot(a: Angebot, jetzt: Date): KinderKarte {
  const start = naechsterStart(a, jetzt);
  return {
    id: a.id,
    institutionId: a.quelle,
    titel: a.titel.replace(/\s*\((?:ab\s)?\d.*?\)\s*$/i, ""), // „(8–11 Jahre)“ steht schon im Alters-Abzeichen
    kategorien: [...new Set(a.themen.map((t) => THEMA_ZU_KATEGORIE[t]).filter((k): k is CategoryId => Boolean(k)))],
    start: new Date(Number.isFinite(start) ? start : Date.parse(a.termine[0]!.start)).toISOString(),
    ageMin: a.alterMin ?? null,
    ageMax: a.alterMax ?? null,
    gratis: a.kosten.euro === 0,
    geschichte: ersterSatz(a.teaser) || a.titel,
    anmeldeUrl: a.url,
    beispiel: false,
  };
}

export function ausEvent(e: LiveEvent): KinderKarte {
  return {
    id: `ev:${e.id}`,
    institutionId: e.institutionId,
    titel: e.title_kids || e.title,
    kategorien: e.categories,
    start: e.start,
    ageMin: e.ageMin,
    ageMax: e.ageMax,
    gratis: isFree(e),
    geschichte: e.story_kids || e.title_kids,
    anmeldeUrl: e.registrationUrl,
    beispiel: e.isDummy,
  };
}

/** Alle Karten, die Kinder sehen dürfen, kommende zuerst. Wird auf dem Server berechnet. */
export function kinderKarten(angebote: Angebot[], events: LiveEvent[], jetzt: Date): KinderKarte[] {
  const ausKursen = fuerModus(angebote, "kind")
    .filter((a) => Number.isFinite(naechsterStart(a, jetzt)))
    .map((a) => ausAngebot(a, jetzt));
  const ausEvents = events
    .filter(isForKids)
    .filter((e) => new Date(e.end ?? e.start).getTime() >= jetzt.getTime())
    .map(ausEvent);
  return [...ausKursen, ...ausEvents].sort((x, y) => x.start.localeCompare(y.start));
}

/** Passt eine Karte zum Alter des Kindes? (ohne Alter: alles) */
export function passtZumAlter(k: KinderKarte, alter: number | null): boolean {
  return alter === null || ((k.ageMin ?? 0) <= alter && alter <= (k.ageMax ?? 99));
}

/** COSMOS ist der „alle Veranstaltungen“-Ort: dort erscheinen alle Karten */
export function kartenFuerOrt(karten: KinderKarte[], ortId: string): KinderKarte[] {
  return ortId === "cosmos" ? karten : karten.filter((k) => k.institutionId === ortId);
}

export function istHeute(k: KinderKarte, jetzt: Date): boolean {
  const tag = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
  return tag(new Date(k.start)) === tag(jetzt);
}

export function istAbends(k: KinderKarte): boolean {
  const teil = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", hour: "numeric", hourCycle: "h23" })
    .formatToParts(new Date(k.start))
    .find((p) => p.type === "hour");
  return Number(teil?.value) >= 17;
}
