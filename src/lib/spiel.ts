import type { Angebot } from "./angebot";
import { filtere, LEERER_FILTER } from "./filter";
import { fuerModus } from "./entdecken";
import type { Checkpoint } from "./checkpoint";
import aim from "../../konfiguration/checkpoints/aim.json";
import experimenta from "../../konfiguration/checkpoints/experimenta.json";
import hdf from "../../konfiguration/checkpoints/hdf.json";
import ipai from "../../konfiguration/checkpoints/ipai.json";

export type Punkt = { x: number; y: number };
export type Rechteck = Punkt & { breite: number; hoehe: number };
export type Richtung = "hoch" | "rechts" | "runter" | "links";
export type { Aktivitaet, HausGrafik, HausSymbol } from "./checkpoint";

/** Ein Lernhaus der Spielwelt. Die Position berechnet `erzeugeStadt` – neue Häuser brauchen keine Koordinaten. */
export type Station = Checkpoint;

/**
 * Die Lernhäuser in Stadt-Reihenfolge. Inhalte stehen je Einrichtung in
 * `konfiguration/checkpoints/<id>.json`; ein neues Haus = neue Datei + Eintrag hier.
 * Geprüft werden die Dateien in `tests/lib/checkpoint.test.ts`.
 */
export const STATIONEN = [aim, experimenta, hdf, ipai] as Station[];

export const abstand = (a: Punkt, b: Punkt) => Math.hypot(a.x - b.x, a.y - b.y);
export const inRechteck = (p: Punkt, r: Rechteck) => p.x >= r.x && p.x <= r.x + r.breite && p.y >= r.y && p.y <= r.y + r.hoehe;

export function passendeSpielAngebote(angebote: Angebot[], thema: string, alter: number | undefined, jetzt: Date): Angebot[] {
  return filtere(fuerModus(angebote, (alter ?? 8) >= 12 ? "teen" : "kind"), { ...LEERER_FILTER, themen: [thema], alter }, jetzt);
}

export function gueltigeErfolge(roh: unknown): string[] {
  return Array.isArray(roh) ? [...new Set(roh.filter((id): id is string => typeof id === "string" && STATIONEN.some((s) => id.startsWith(`${s.id}-`))))] : [];
}
