import angeboteJson from "../../daten/angebote.json";
import berichtJson from "../../daten/bericht.json";
import metaJson from "../../daten/meta.json";
import type { Angebot, Bericht, Thema } from "./angebot";
import { idAusSlug } from "./routen";
export { slugAusId, idAusSlug } from "./routen";

/** Gleiche Grenze wie in der Pipeline: darunter erst nach menschlicher Freigabe sichtbar. */
export const MIN_SICHERHEIT_OEFFENTLICH = 0.6;

export type QuelleMeta = { id: string; name: string; website: string; farbe: string };
export type Meta = { aktualisiert: string; lesemodus?: "live" | "cache"; quellen: QuelleMeta[]; themen: Thema[] };

// Die JSON-Dateien schreibt die Pipeline; sie wurden dort mit zod validiert.
const ALLE = angeboteJson as Angebot[];
export const META = metaJson as Meta;
export const BERICHT = berichtJson as Bericht;

export function alleAngebote(): Angebot[] {
  return ALLE;
}

export function oeffentlicheAngebote(): Angebot[] {
  return ALLE.filter((a) => a.sicherheit >= MIN_SICHERHEIT_OEFFENTLICH);
}

export function unsichereAngebote(): Angebot[] {
  return ALLE.filter((a) => a.sicherheit < MIN_SICHERHEIT_OEFFENTLICH);
}

export function angebotNachSlug(slug: string): Angebot | undefined {
  const id = idAusSlug(slug);
  return oeffentlicheAngebote().find((a) => a.id === id);
}
