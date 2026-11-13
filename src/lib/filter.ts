import type { Angebot, Art, Zielgruppe } from "./angebot";

export type Zeitraum = "alle" | "woche" | "monat";

export type Filter = {
  suche: string;
  themen: string[];
  alter?: number;
  zeitraum: Zeitraum;
  arten: Art[];
  zielgruppen: Zielgruppe[];
  quellen: string[];
  nurKostenlos: boolean;
  nurFrei: boolean;
};

export const LEERER_FILTER: Filter = {
  suche: "",
  themen: [],
  zeitraum: "alle",
  arten: [],
  zielgruppen: [],
  quellen: [],
  nurKostenlos: false,
  nurFrei: false,
};

const TAG_MS = 24 * 60 * 60 * 1000;
const ZEITRAUM_TAGE: Record<Zeitraum, number> = { alle: Infinity, woche: 7, monat: 31 };
const KIND_BIS = 11;
const TEEN_BIS = 17;

/** Kleinbuchstaben, ohne Akzente, Umschreibungen (ue, ae, oe) vereinheitlicht. */
export function normalisiereSuchtext(text: string): string {
  return text
    .toLowerCase()
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/ae/g, "a")
    .replace(/oe/g, "o")
    .replace(/ue/g, "u");
}

export function passtZuAlter(a: Angebot, alter: number): boolean {
  if (a.alterMin !== undefined || a.alterMax !== undefined) {
    return (a.alterMin ?? 0) <= alter && alter <= (a.alterMax ?? 99);
  }
  if (a.zielgruppen.includes("familien")) return true;
  if (alter <= KIND_BIS) return a.zielgruppen.includes("kinder");
  if (alter <= TEEN_BIS) return a.zielgruppen.includes("teens");
  return a.zielgruppen.some((z) => z === "erwachsene" || z === "eltern" || z === "fachkraefte");
}

export function naechsterStart(a: Angebot, jetzt: Date): number {
  const zukunft = a.termine.map((t) => new Date(t.start).getTime()).filter((t) => t >= jetzt.getTime() - TAG_MS);
  return zukunft.length > 0 ? Math.min(...zukunft) : Infinity;
}

function suchIndex(a: Angebot): string {
  return normalisiereSuchtext([a.titel, a.teaser, a.themen.join(" "), a.ort.name, a.quelle, a.art].join(" "));
}

export function filtere(angebote: Angebot[], f: Filter, jetzt: Date): Angebot[] {
  const woerter = normalisiereSuchtext(f.suche).split(/\s+/).filter(Boolean);
  const bis = jetzt.getTime() + ZEITRAUM_TAGE[f.zeitraum] * TAG_MS;

  return angebote
    .filter((a) => {
      if (woerter.length > 0) {
        const index = suchIndex(a);
        if (!woerter.every((w) => index.includes(w))) return false;
      }
      if (f.themen.length > 0 && !a.themen.some((t) => f.themen.includes(t))) return false;
      if (f.alter !== undefined && !passtZuAlter(a, f.alter)) return false;
      if (f.arten.length > 0 && !f.arten.includes(a.art)) return false;
      if (f.zielgruppen.length > 0 && !a.zielgruppen.some((z) => f.zielgruppen.includes(z))) return false;
      if (f.quellen.length > 0 && !f.quellen.includes(a.quelle)) return false;
      if (f.nurKostenlos && a.kosten.euro !== 0) return false;
      if (f.nurFrei && a.status === "ausgebucht") return false;
      return naechsterStart(a, jetzt) <= bis;
    })
    .sort((x, y) => naechsterStart(x, jetzt) - naechsterStart(y, jetzt));
}
