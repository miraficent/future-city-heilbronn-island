/**
 * Logik der Kinderreise (ohne Darstellung):
 *   Mia fragt Alter + Thema → Häuser leuchten → Orakel (3 Bildfragen) → Event-Karten.
 * Jedes Spiel sammelt eine Information, daraus wird gefiltert bzw. sortiert.
 */
import type { Angebot } from "./angebot";
import { fuerModus } from "./entdecken";
import { naechsterStart } from "./filter";

export const KINDER_ALTER = [6, 7, 8, 9, 10, 11] as const;

/** Themen, nach denen Mia fragt (ids wie in konfiguration/themen.csv) */
export const KINDER_THEMEN = [
  { id: "coding", symbol: "robot", text: "Roboter & Coding" },
  { id: "ki", symbol: "bulb", text: "Künstliche Intelligenz" },
  { id: "gaming", symbol: "controller", text: "Spiele bauen" },
] as const;

/** Echte Angebote, die ein Kind dieses Alters sehen darf (bekanntes Alter, Zielgruppe Kinder) */
export function angeboteFuerKind(angebote: Angebot[], alter: number, jetzt: Date): Angebot[] {
  return fuerModus(angebote, "kind").filter(
    (a) =>
      (a.alterMin ?? 0) <= alter &&
      alter <= (a.alterMax ?? 99) &&
      Number.isFinite(naechsterStart(a, jetzt)),
  );
}

export function passtZuThema(a: Angebot, thema: string | null): boolean {
  return !thema || a.themen.includes(thema);
}

/** { quelle: Anzahl passender Angebote } – für die Sterne auf der Karte */
export function zaehleProOrt(angebote: Angebot[], thema: string | null): Record<string, number> {
  const zahl: Record<string, number> = {};
  for (const a of angebote) if (passtZuThema(a, thema)) zahl[a.quelle] = (zahl[a.quelle] ?? 0) + 1;
  return zahl;
}

// ---------- Orakel ----------

export type OrakelAntworten = { wie?: "bauen" | "zuschauen"; mitWem?: "allein" | "familie"; dauer?: "kurz" | "lang" };

export const ORAKEL_FRAGEN = [
  { id: "wie", frage: "Willst du lieber selbst bauen oder zuschauen?", optionen: [
    { id: "bauen", symbol: "tools", text: "Bauen" },
    { id: "zuschauen", symbol: "masks", text: "Zuschauen" },
  ] },
  { id: "mitWem", frage: "Allein oder mit deiner Familie?", optionen: [
    { id: "allein", symbol: "user", text: "Allein" },
    { id: "familie", symbol: "home", text: "Mit Familie" },
  ] },
  { id: "dauer", frage: "Kurz oder lange?", optionen: [
    { id: "kurz", symbol: "clock", text: "Kurz" },
    { id: "lang", symbol: "calendar", text: "Lange" },
  ] },
] as const;

const STUNDE = 3_600_000;
const istZuschauen = (a: Angebot) => a.art === "veranstaltung" || a.art === "vortrag";
const istLang = (a: Angebot) =>
  a.art === "kurs" || a.art === "ferienprogramm" || a.termine.length > 1 ||
  a.termine.some((t) => t.ende !== undefined && new Date(t.ende).getTime() - new Date(t.start).getTime() > 3 * STUNDE);
const mitFamilie = (a: Angebot) => a.zielgruppen.includes("familien") || a.zielgruppen.includes("eltern");

/** 0–3 Punkte: wie gut ein Angebot zu den Orakel-Antworten passt */
export function orakelPunkte(a: Angebot, o: OrakelAntworten): number {
  let p = 0;
  if (o.wie === "bauen" && !istZuschauen(a)) p++;
  if (o.wie === "zuschauen" && istZuschauen(a)) p++;
  if (o.mitWem === "familie" && mitFamilie(a)) p++;
  if (o.mitWem === "allein" && !mitFamilie(a)) p++;
  if (o.dauer === "lang" && istLang(a)) p++;
  if (o.dauer === "kurz" && !istLang(a)) p++;
  return p;
}

/**
 * Karten für das Wisch-Spiel: Antworten schließen nichts aus, sie sortieren nur –
 * so gibt es immer etwas zu wischen. Bestes zuerst, dann nach Datum.
 */
export function kartenFuerOrakel(angebote: Angebot[], o: OrakelAntworten, jetzt: Date, max = 5): Angebot[] {
  return [...angebote]
    .map((a) => ({ a, p: orakelPunkte(a, o) }))
    .sort((x, y) => y.p - x.p || naechsterStart(x.a, jetzt) - naechsterStart(y.a, jetzt))
    .slice(0, max)
    .map(({ a }) => a);
}
