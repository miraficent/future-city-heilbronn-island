import { readFile, writeFile } from "node:fs/promises";
import type { Angebot } from "../src/lib/angebot";

export type GeoCache = Record<string, { lat: number; lon: number } | null>;

const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const PAUSE_MS = 1100; // Nominatim-Nutzungsrichtlinie: höchstens 1 Anfrage pro Sekunde
const RAUM = /raum|etage|\bog\b|\beg\b|saal|zimmer/i;

/** Macht aus „Heilbronn, Haus der Familie, Erich-Mendelsohn-Str. 1C, Raum 6“ eine geokodierbare Adresse. */
export function geoSuchtext(adresse: string, standardOrt = "Heilbronn"): string {
  const teile = adresse.split(/[,;]/).map((t) => t.trim()).filter(Boolean);
  const plzOrt = teile.find((t) => /\b\d{5}\b/.test(t));
  const strasse = teile.find((t) => /\d/.test(t) && /[a-zäöüß]{3,}/i.test(t) && !RAUM.test(t) && t !== plzOrt);
  const ort = plzOrt ?? teile.find((t) => !/\d/.test(t) && /^[A-ZÄÖÜ][a-zäöüß-]+$/.test(t)) ?? standardOrt;
  return [strasse, ort].filter(Boolean).join(", ");
}

export async function ladeGeoCache(pfad: string): Promise<GeoCache> {
  try {
    return JSON.parse(await readFile(pfad, "utf8")) as GeoCache;
  } catch {
    return {};
  }
}

async function geokodiere(suchtext: string, userAgent: string): Promise<{ lat: number; lon: number } | null> {
  const url = `${NOMINATIM}?format=json&limit=1&countrycodes=de&q=${encodeURIComponent(suchtext)}`;
  const res = await fetch(url, { headers: { "User-Agent": userAgent }, signal: AbortSignal.timeout(15_000) });
  if (!res.ok) return null;
  const treffer = (await res.json()) as Array<{ lat: string; lon: string }>;
  const erster = treffer[0];
  return erster ? { lat: Number(erster.lat), lon: Number(erster.lon) } : null;
}

/** Ergänzt Koordinaten; jede Adresse wird nur einmal abgefragt und im Cache gespeichert. */
export async function ergaenzeKoordinaten(angebote: Angebot[], cachePfad: string, userAgent: string): Promise<Angebot[]> {
  const cache = await ladeGeoCache(cachePfad);
  let geaendert = false;

  for (const a of angebote) {
    if (a.ort.online || !a.ort.adresse) continue;
    const suchtext = geoSuchtext(a.ort.adresse);
    if (!(suchtext in cache)) {
      try {
        cache[suchtext] = await geokodiere(suchtext, userAgent);
      } catch {
        cache[suchtext] = null;
      }
      geaendert = true;
      await new Promise((r) => setTimeout(r, PAUSE_MS));
    }
  }
  if (geaendert) await writeFile(cachePfad, `${JSON.stringify(cache, null, 2)}\n`);

  return angebote.map((a) => {
    const punkt = a.ort.adresse ? cache[geoSuchtext(a.ort.adresse)] : null;
    return punkt ? { ...a, ort: { ...a.ort, lat: punkt.lat, lon: punkt.lon } } : a;
  });
}
