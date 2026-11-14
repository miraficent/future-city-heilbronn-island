import type { Angebot } from "./angebot";
import { filtere, LEERER_FILTER } from "./filter";
import { fuerModus } from "./entdecken";

export type Punkt = { x: number; y: number };
export type Rechteck = Punkt & { breite: number; hoehe: number };
export type Richtung = "hoch" | "rechts" | "runter" | "links";
export type MissionArt = "code" | "muster" | "level" | "strom";
export type HausGrafik = "code-labor" | "forscherhaus" | "spielewerkstatt" | "ki-atelier";

/** Ein Lernhaus der Spielwelt. Die Position berechnet `erzeugeStadt` – neue Häuser brauchen keine Koordinaten. */
export type Station = {
  id: string;
  name: string;
  titel: string;
  kurz: string;
  farbe: string;
  thema: string;
  aufgabe: MissionArt;
  grafik: HausGrafik;
  /** Raketenteil, das dieses Haus beisteuert. */
  teil: string;
};

export const STATIONEN: Station[] = [
  { id: "aim", name: "aim", titel: "Der Roboter-Express", kurz: "Code-Labor", farbe: "#ed805c", thema: "coding", aufgabe: "code", grafik: "code-labor", teil: "Spitze" },
  { id: "experimenta", name: "experimenta", titel: "Licht für die Stadt", kurz: "Forscherhaus", farbe: "#63bdb5", thema: "coding", aufgabe: "strom", grafik: "forscherhaus", teil: "Antrieb" },
  { id: "hdf", name: "Haus der Familie", titel: "Ein Weg für alle", kurz: "Spielewerkstatt", farbe: "#ecc06b", thema: "gaming", aufgabe: "level", grafik: "spielewerkstatt", teil: "Flügel" },
  { id: "ipai", name: "IPAI", titel: "Die Muster-Detektive", kurz: "KI-Atelier", farbe: "#aaa0db", thema: "ki", aufgabe: "muster", grafik: "ki-atelier", teil: "Fenster" },
];

export const abstand = (a: Punkt, b: Punkt) => Math.hypot(a.x - b.x, a.y - b.y);
export const inRechteck = (p: Punkt, r: Rechteck) => p.x >= r.x && p.x <= r.x + r.breite && p.y >= r.y && p.y <= r.y + r.hoehe;

export function passendeSpielAngebote(angebote: Angebot[], thema: string, alter: number | undefined, jetzt: Date): Angebot[] {
  return filtere(fuerModus(angebote, (alter ?? 8) >= 12 ? "teen" : "kind"), { ...LEERER_FILTER, themen: [thema], alter }, jetzt);
}

export function gueltigeErfolge(roh: unknown): string[] {
  return Array.isArray(roh) ? [...new Set(roh.filter((id): id is string => typeof id === "string" && STATIONEN.some((s) => id.startsWith(`${s.id}-`))))] : [];
}
