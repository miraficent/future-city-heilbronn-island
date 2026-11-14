/**
 * Reine Funktionen für Live-Events (keine Seiteneffekte, gut testbar).
 * Alle Funktionen bekommen die Event-Liste übergeben; die Daten selbst kommen aus src/data/events.json.
 */
import type { CategoryId, LiveEvent } from "@/types";

/** Bis zu diesem Mindestalter gilt ein Event als Kinder-Event */
const KINDER_BIS = 14;

/** Darf im Kindermodus erscheinen: geprüft, mit Altersangabe, nicht nur für Ältere */
export function isForKids(e: LiveEvent): boolean {
  return !e.needsReview && e.ageMin !== null && e.ageMin <= KINDER_BIS;
}

export function getEventsForInstitution(events: LiveEvent[], institutionId: string): LiveEvent[] {
  return events.filter((e) => e.institutionId === institutionId);
}

/** Events, die noch nicht vorbei sind, nach Start sortiert */
export function getUpcoming(events: LiveEvent[], now: Date): LiveEvent[] {
  return events
    .filter((e) => new Date(e.end ?? e.start).getTime() >= now.getTime())
    .sort((a, b) => a.start.localeCompare(b.start));
}

/** { Kategorie: Events } – ein Event mit zwei Kategorien steht in beiden */
export function groupByCategory(events: LiveEvent[]): Partial<Record<CategoryId, LiveEvent[]>> {
  const gruppen: Partial<Record<CategoryId, LiveEvent[]>> = {};
  for (const e of events) for (const k of e.categories) (gruppen[k] ??= []).push(e);
  return gruppen;
}

/** Anzahl kommender Kinder-Events einer Einrichtung (für das Abzeichen am Pin) */
export function countUpcoming(events: LiveEvent[], institutionId: string, now: Date): number {
  return getUpcoming(getEventsForInstitution(events, institutionId), now).filter(isForKids).length;
}

/** Gleicher Kalendertag in Berlin */
export function isToday(e: LiveEvent, now: Date): boolean {
  const tag = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
  return tag(new Date(e.start)) === tag(now);
}

/** Abends = Start ab 17 Uhr (Berliner Zeit) – für Sonne/Mond auf den Karten */
export function isEvening(e: LiveEvent): boolean {
  // formatToParts statt Text: im Deutschen hängt sonst „Uhr“ an der Zahl
  const teil = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", hour: "numeric", hourCycle: "h23" })
    .formatToParts(new Date(e.start))
    .find((p) => p.type === "hour");
  return Number(teil?.value) >= 17;
}

export function isFree(e: LiveEvent): boolean {
  return e.cost !== null && /kostenlos|gratis|frei|0\s?€|keine/i.test(e.cost);
}
