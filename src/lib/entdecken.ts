import type { Angebot } from "./angebot";

export type Modus = "kind" | "teen" | "eltern";

export const INTERESSEN = [
  { id: "roboter", symbol: "robot", text: "Roboter zum Leben erwecken", themen: ["coding", "ki"] },
  { id: "spiele", symbol: "controller", text: "Mein eigenes Spiel bauen", themen: ["gaming", "coding"] },
  { id: "detektiv", symbol: "search", text: "Echt oder KI? Rätsel lösen", themen: ["ki"] },
  { id: "geschichten", symbol: "story", text: "Geschichten erfinden", themen: ["coding", "ki"] },
  { id: "tuefteln", symbol: "tools", text: "Tüfteln und ausprobieren", themen: ["coding"] },
  { id: "welten", symbol: "planet", text: "Neue Spielwelten entdecken", themen: ["gaming"] },
];

export function interessenThemen(ids: string[]): string[] {
  const stimmen = new Map<string, number>();
  for (const interesse of INTERESSEN.filter((i) => ids.includes(i.id))) {
    for (const thema of interesse.themen) stimmen.set(thema, (stimmen.get(thema) ?? 0) + 1);
  }
  const maximum = Math.max(0, ...stimmen.values());
  return [...stimmen].filter(([, zahl]) => zahl === maximum).map(([id]) => id);
}

/**
 * Kinder und Teens sehen nur Angebote mit bekannter Altersangabe (aus Titel, Beschreibung,
 * Quell-Kategorie oder einer Korrektur). Eine nur geratene Zielgruppe reicht nicht –
 * Eltern sehen in ihrer Suche trotzdem alles.
 */
export function hatAltersangabe(a: Angebot): boolean {
  return a.alterMin !== undefined || a.alterMax !== undefined;
}

export function fuerModus(angebote: Angebot[], modus: Modus): Angebot[] {
  if (modus === "eltern") return angebote;
  const gruppe = modus === "kind" ? "kinder" : "teens";
  const [min, max] = modus === "kind" ? [6, 11] : [12, 17];
  return angebote.filter((a) =>
    a.zielgruppen.includes(gruppe) &&
    hatAltersangabe(a) &&
    (a.alterMin ?? 0) <= max &&
    (a.alterMax ?? 99) >= min,
  );
}
