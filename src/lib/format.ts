import type { Angebot, Art, Termin } from "./angebot";

const ZONE = "Europe/Berlin";

const tagFormat = new Intl.DateTimeFormat("de-DE", { timeZone: ZONE, weekday: "short", day: "numeric", month: "short" });
const tagLangFormat = new Intl.DateTimeFormat("de-DE", { timeZone: ZONE, weekday: "long", day: "numeric", month: "long" });
const zeitFormat = new Intl.DateTimeFormat("de-DE", { timeZone: ZONE, hour: "2-digit", minute: "2-digit" });
const monatFormat = new Intl.DateTimeFormat("de-DE", { timeZone: ZONE, month: "long", year: "numeric" });
const tagZahlFormat = new Intl.DateTimeFormat("de-DE", { timeZone: ZONE, day: "numeric" });
const monatKurzFormat = new Intl.DateTimeFormat("de-DE", { timeZone: ZONE, month: "short" });
const wochentagFormat = new Intl.DateTimeFormat("de-DE", { timeZone: ZONE, weekday: "short" });

export const formatTag = (iso: string) => tagFormat.format(new Date(iso));
export const formatTagLang = (iso: string) => tagLangFormat.format(new Date(iso));
export const formatZeit = (iso: string) => zeitFormat.format(new Date(iso));
export const formatMonat = (iso: string) => monatFormat.format(new Date(iso));
export const formatTagZahl = (iso: string) => tagZahlFormat.format(new Date(iso));
export const formatMonatKurz = (iso: string) => monatKurzFormat.format(new Date(iso)).replace(".", "");
export const formatWochentag = (iso: string) => wochentagFormat.format(new Date(iso)).replace(".", "");

export function formatTermin(t: Termin): string {
  const zeit = t.ende ? `${formatZeit(t.start)}–${formatZeit(t.ende)}` : formatZeit(t.start);
  return `${formatTag(t.start)} · ${zeit} Uhr`;
}

export function naechsterTermin(a: Angebot, jetzt = new Date()): Termin | undefined {
  return a.termine.find((t) => new Date(t.ende ?? t.start).getTime() >= jetzt.getTime()) ?? a.termine[0];
}

export function alterText(a: Angebot): string {
  if (a.alterMin !== undefined && a.alterMax !== undefined) return `${a.alterMin}–${a.alterMax} Jahre`;
  if (a.alterMin !== undefined) return `ab ${a.alterMin} Jahren`;
  if (a.alterMax !== undefined) return `bis ${a.alterMax} Jahre`;
  if (a.zielgruppen.includes("fachkraefte")) return "für Fachkräfte";
  if (a.zielgruppen.includes("eltern")) return "für Eltern";
  if (a.zielgruppen.includes("familien")) return "für Familien";
  if (a.zielgruppen.includes("kinder")) return "für Kinder · Alter beim Anbieter";
  if (a.zielgruppen.includes("teens")) return "für Teens · Alter beim Anbieter";
  return "für Erwachsene";
}

export const ART_TEXT: Record<Art, string> = {
  kurs: "Kurs",
  workshop: "Workshop",
  veranstaltung: "Veranstaltung",
  ferienprogramm: "Ferienprogramm",
  vortrag: "Vortrag",
};

export function termineText(a: Angebot): string {
  const anzahl = a.termine.length;
  return anzahl === 1 ? "1 Termin" : `${anzahl} Termine`;
}

export function statusText(status: Angebot["status"]): string {
  switch (status) {
    case "frei":
      return "Plätze frei";
    case "wenige":
      return "Wenige Plätze gemeldet";
    case "ausgebucht":
      return "Ausgebucht";
    default:
      return "Plätze: beim Anbieter";
  }
}

/** „in 3 Tagen“, „morgen“, „heute“ – für Kinder greifbarer als ein Datum. */
const kalendertagFormat = new Intl.DateTimeFormat("en-CA", { timeZone: ZONE, year: "numeric", month: "2-digit", day: "2-digit" });

export function relativ(iso: string, jetzt = new Date()): string {
  const kalendertag = (d: Date) => Date.parse(kalendertagFormat.format(d)); // „2026-11-13“ → Mitternacht UTC
  const differenz = Math.round((kalendertag(new Date(iso)) - kalendertag(jetzt)) / 86_400_000);
  if (differenz <= 0) return "heute";
  if (differenz === 1) return "morgen";
  if (differenz < 14) return `in ${differenz} Tagen`;
  const wochen = Math.round(differenz / 7);
  if (wochen < 9) return `in ${wochen} Wochen`;
  return `in ${Math.round(differenz / 30)} Monaten`;
}
