/**
 * Eigene Kinderfigur aus dem Baukasten: Haut, Frisur, Haare, Augen, Gesicht, Pulli, Hose, Schuhe, Tasche.
 * Nur feste Farblisten (keine freie Farbwahl) – so bleibt alles im Stil der Karte.
 * Gespeichert wird nur in der Browsersitzung (wie Alter und Figur, siehe kinder-zustand.ts).
 * Reine Logik ohne Darstellung, getestet in tests/lib/eigene-figur.test.ts.
 */
import type { Sprache } from "@/types";

export type Frisur = "kurz" | "zoepfe" | "locken" | "lang";
export type Mund = "lachen" | "laecheln" | "staunen";

export type Aussehen = {
  haut: number;
  frisur: Frisur;
  haar: string;
  augen: string;
  mund: Mund;
  pulli: string;
  hose: string;
  schuh: string;
  tasche: string | null;
};

type Wahl = { wert: string; name: string };

/** Hauttöne als [hell, schattiert] – dieselben Töne wie bei den vorhandenen Figuren, dazu Zwischenstufen. */
export const HAUT: Array<{ farben: [string, string]; name: string }> = [
  { farben: ["#fbd7b5", "#eeb48e"], name: "hell" },
  { farben: ["#f3c49c", "#e0a477"], name: "pfirsich" },
  { farben: ["#d9a27a", "#c2845c"], name: "mittel" },
  { farben: ["#b97a52", "#9a603d"], name: "braun" },
  { farben: ["#8d5b3d", "#714530"], name: "dunkel" },
];
export const FRISUREN: Array<{ wert: Frisur; name: string }> = [
  { wert: "kurz", name: "kurz" },
  { wert: "zoepfe", name: "Zöpfe" },
  { wert: "locken", name: "Locken" },
  { wert: "lang", name: "lang" },
];
export const HAARFARBEN: Wahl[] = [
  { wert: "#2a1d24", name: "schwarz" },
  { wert: "#3a2a4a", name: "dunkel" },
  { wert: "#8a4b2a", name: "braun" },
  { wert: "#e0b24a", name: "blond" },
  { wert: "#e07a4f", name: "rot" },
  { wert: "#6c4ce0", name: "lila" },
  { wert: "#5bb8c4", name: "blau" },
];
export const AUGENFARBEN: Wahl[] = [
  { wert: "#1f2559", name: "dunkel" },
  { wert: "#6b3f22", name: "braun" },
  { wert: "#3b6fe0", name: "blau" },
  { wert: "#4e9a4a", name: "grün" },
];
export const MUENDER: Array<{ wert: Mund; name: string }> = [
  { wert: "lachen", name: "lachen" },
  { wert: "laecheln", name: "lächeln" },
  { wert: "staunen", name: "staunen" },
];
/** Farben für Pulli, Hose, Schuhe und Tasche – aus den Figuren und den Design-Tokens. */
export const KLEIDERFARBEN: Wahl[] = [
  { wert: "#6c4ce0", name: "lila" },
  { wert: "#22b3a0", name: "türkis" },
  { wert: "#f59a24", name: "orange" },
  { wert: "#ff6b6b", name: "rot" },
  { wert: "#3b6fe0", name: "blau" },
  { wert: "#7bc86c", name: "grün" },
  { wert: "#2b3170", name: "dunkelblau" },
  { wert: "#e8c88a", name: "sand" },
];

export const STANDARD_AUSSEHEN: Aussehen = {
  haut: 0,
  frisur: "kurz",
  haar: "#3a2a4a",
  augen: "#1f2559",
  mund: "lachen",
  pulli: "#22b3a0",
  hose: "#2b3170",
  schuh: "#f59a24",
  tasche: "#ff6b6b",
};

const enthaelt = (liste: Wahl[], wert: unknown): wert is string => typeof wert === "string" && liste.some((w) => w.wert === wert);

/** Liest gespeicherte Werte vorsichtig: Was nicht in den festen Listen steht, wird durch den Standard ersetzt. */
export function pruefeAussehen(roh: unknown): Aussehen {
  const r = (roh && typeof roh === "object" ? roh : {}) as Record<string, unknown>;
  const s = STANDARD_AUSSEHEN;
  return {
    haut: typeof r.haut === "number" && Number.isInteger(r.haut) && r.haut >= 0 && r.haut < HAUT.length ? r.haut : s.haut,
    frisur: FRISUREN.some((f) => f.wert === r.frisur) ? (r.frisur as Frisur) : s.frisur,
    haar: enthaelt(HAARFARBEN, r.haar) ? r.haar : s.haar,
    augen: enthaelt(AUGENFARBEN, r.augen) ? r.augen : s.augen,
    mund: MUENDER.some((m) => m.wert === r.mund) ? (r.mund as Mund) : s.mund,
    pulli: enthaelt(KLEIDERFARBEN, r.pulli) ? r.pulli : s.pulli,
    hose: enthaelt(KLEIDERFARBEN, r.hose) ? r.hose : s.hose,
    schuh: enthaelt(KLEIDERFARBEN, r.schuh) ? r.schuh : s.schuh,
    tasche: r.tasche === null ? null : enthaelt(KLEIDERFARBEN, r.tasche) ? r.tasche : s.tasche,
  };
}

/** Zufällige Figur aus den festen Listen; `zufall` liefert Zahlen in [0, 1) (für Tests austauschbar). */
export function zufallsAussehen(zufall: () => number = Math.random): Aussehen {
  const eins = <T,>(liste: T[]): T => liste[Math.floor(zufall() * liste.length)] ?? liste[0]!;
  return {
    haut: Math.floor(zufall() * HAUT.length),
    frisur: eins(FRISUREN).wert,
    haar: eins(HAARFARBEN).wert,
    augen: eins(AUGENFARBEN).wert,
    mund: eins(MUENDER).wert,
    pulli: eins(KLEIDERFARBEN).wert,
    hose: eins(KLEIDERFARBEN).wert,
    schuh: eins(KLEIDERFARBEN).wert,
    tasche: zufall() < 0.2 ? null : eins(KLEIDERFARBEN).wert,
  };
}

/** Mischt eine Farbe mit Weiß (anteil > 0) oder mit Dunkelblau (anteil < 0) – für Licht und Schatten. */
export function toene(hex: string, anteil: number): string {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const ziel = anteil >= 0 ? [255, 255, 255] : [31, 37, 89];
  const a = Math.abs(anteil);
  return `#${rgb.map((c, i) => Math.round(c * (1 - a) + (ziel[i] ?? 0) * a).toString(16).padStart(2, "0")).join("")}`;
}

/** Kurzer Satz für Screenreader und Vorlesen, z. B. „Deine Figur mit Locken, Pulli in Blau und Tasche in Rot“. */
/** Englische Namen der Farben, Frisuren und Gesichter (Schlüssel = deutscher Name) */
export const FARBNAME_EN: Record<string, string> = {
  hell: "light", pfirsich: "peach", mittel: "medium", braun: "brown", dunkel: "dark",
  kurz: "short", "Zöpfe": "braids", Locken: "curls", lang: "long",
  schwarz: "black", blond: "blonde", rot: "red", lila: "purple", blau: "blue", "grün": "green",
  lachen: "laughing", "lächeln": "smiling", staunen: "amazed",
  "türkis": "turquoise", orange: "orange", dunkelblau: "dark blue", sand: "sand",
};

/** Name einer Wahl in der gewählten Sprache */
export function farbName(name: string, sprache: Sprache): string {
  return sprache === "en" ? (FARBNAME_EN[name] ?? name) : name;
}

/** Kurze Beschreibung der eigenen Figur für Screenreader */
export function beschreibe(a: Aussehen, sprache: Sprache = "de"): string {
  const name = (wert: string) => KLEIDERFARBEN.find((w) => w.wert === wert)?.name ?? "";
  if (sprache === "en") {
    const frisur = { kurz: "short hair", zoepfe: "braids", locken: "curls", lang: "long hair" }[a.frisur];
    const tasche = a.tasche ? ` and ${farbName(name(a.tasche), "en")} bag` : "";
    return `Your figure with ${frisur}, ${farbName(name(a.pulli), "en")} jumper${tasche}`;
  }
  const farbe = (wert: string) => {
    const n = name(wert);
    return n.charAt(0).toUpperCase() + n.slice(1);
  };
  const frisur = { kurz: "kurzen Haaren", zoepfe: "Zöpfen", locken: "Locken", lang: "langen Haaren" }[a.frisur];
  const tasche = a.tasche ? ` und Tasche in ${farbe(a.tasche)}` : "";
  return `Deine Figur mit ${frisur}, Pulli in ${farbe(a.pulli)}${tasche}`;
}
