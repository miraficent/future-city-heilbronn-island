import { readFile } from "node:fs/promises";
import { parse } from "csv-parse/sync";
import type { Korrektur, Quelle, Thema } from "../src/lib/angebot";

export const ADAPTER_NAMEN = ["kufer-wp-api", "kufer-html", "experimenta-kalender", "wp-sitemap-events"] as const;
const KORREKTUR_AKTIONEN: ReadonlyArray<Korrektur["aktion"]> = ["ausblenden", "thema", "alter", "zielgruppe"];

type Zeile = Record<string, string | undefined>;

function leseZeilen(csv: string): Zeile[] {
  return parse(csv, { columns: true, skip_empty_lines: true, trim: true, bom: true }) as Zeile[];
}

function liste(wert: string | undefined): string[] {
  return (wert ?? "")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
}

function pflicht(zeile: Zeile, feld: string, nr: number): string {
  const wert = zeile[feld]?.trim();
  if (!wert) throw new Error(`quellen.csv Zeile ${nr}: Feld "${feld}" fehlt`);
  return wert;
}

export function parseQuellen(csv: string): Quelle[] {
  return leseZeilen(csv).map((z, i) => {
    const nr = i + 2; // Zeile 1 ist die Kopfzeile
    const adapter = pflicht(z, "adapter", nr);
    if (!(ADAPTER_NAMEN as readonly string[]).includes(adapter)) {
      throw new Error(`quellen.csv Zeile ${nr}: unbekannter adapter "${adapter}" (erlaubt: ${ADAPTER_NAMEN.join(", ")})`);
    }
    return {
      id: pflicht(z, "id", nr),
      name: pflicht(z, "name", nr),
      website: pflicht(z, "website", nr),
      adapter,
      startUrls: liste(z.start_urls),
      farbe: z.farbe?.trim() || "#888888",
      adresse: z.adresse?.trim() ?? "",
    };
  });
}

export function parseThemen(csv: string): Thema[] {
  return leseZeilen(csv).map((z) => ({
    id: z.id?.trim() ?? "",
    name: z.name?.trim() ?? "",
    emoji: z.emoji?.trim() ?? "",
    schlagwoerter: liste(z.schlagwoerter),
  }));
}

export function parseKorrekturen(csv: string): Korrektur[] {
  return leseZeilen(csv).map((z, i) => {
    const aktion = z.aktion?.trim() ?? "";
    if (!(KORREKTUR_AKTIONEN as readonly string[]).includes(aktion)) {
      throw new Error(`korrekturen.csv Zeile ${i + 2}: unbekannte aktion "${aktion}"`);
    }
    return { angebotId: z.angebot_id?.trim() ?? "", aktion: aktion as Korrektur["aktion"], wert: z.wert?.trim() ?? "" };
  });
}

/** Liest eine Tabelle aus einer Datei oder – für Google-Sheets „im Web veröffentlicht“ – von einer URL. */
export async function ladeTabelle(dateiOderUrl: string): Promise<string> {
  if (/^https?:\/\//.test(dateiOderUrl)) {
    const res = await fetch(dateiOderUrl, { signal: AbortSignal.timeout(20_000) });
    if (!res.ok) throw new Error(`Tabelle ${dateiOderUrl}: HTTP ${res.status}`);
    return res.text();
  }
  return readFile(dateiOderUrl, "utf8");
}

export async function ladeKonfiguration() {
  const [quellen, themen, korrekturen] = await Promise.all([
    ladeTabelle(process.env.QUELLEN_CSV_URL ?? "konfiguration/quellen.csv"),
    ladeTabelle(process.env.THEMEN_CSV_URL ?? "konfiguration/themen.csv"),
    ladeTabelle(process.env.KORREKTUREN_CSV_URL ?? "konfiguration/korrekturen.csv"),
  ]);
  return { quellen: parseQuellen(quellen), themen: parseThemen(themen), korrekturen: parseKorrekturen(korrekturen) };
}
