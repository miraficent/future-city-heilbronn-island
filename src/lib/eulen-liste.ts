/**
 * Zeilen der Prüfliste „Eule & Owl“ (/pruefen/): kommende Veranstaltungen, gleiche Termine nur einmal.
 * „Gleich“ heißt: gleiche Einrichtung, gleicher Titel UND gleiche Kindertexte. Die Kommentare hängen an jedem
 * einzelnen Termin – hat ein Termin einen anderen oder fehlenden Text, bekommt er eine eigene Zeile.
 */
import type { LiveEvent } from "@/types";

export function eulenZeilen(events: LiveEvent[], jetzt: Date): LiveEvent[] {
  const kommend = events.filter((e) => new Date(e.end ?? e.start).getTime() >= jetzt.getTime());
  const schluessel = (e: LiveEvent) => `${e.institutionId}|${e.title}|${JSON.stringify(e.kinder?.de ?? null)}|${JSON.stringify(e.kinder?.en ?? null)}`;
  const zeilen = new Map<string, LiveEvent>();
  for (const e of kommend) if (!zeilen.has(schluessel(e))) zeilen.set(schluessel(e), e);
  return [...zeilen.values()];
}
