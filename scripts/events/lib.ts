/**
 * Gemeinsame Bausteine der Event-Pipeline:
 * höflicher Abruf (eigener User-Agent, 1 Anfrage pro Sekunde, robots.txt), Rohdaten-Typ, Hilfsfunktionen.
 */
import { createHash } from "node:crypto";

export type Source = {
  institutionId: string; // "auto" = Einrichtung aus Ort/Veranstalter erkennen
  type: "ical" | "html";
  parser?: "experimenta" | "kufer";
  url: string;
  name: string;
};

/** Ein Termin, so wie er von einer Quelle kommt – noch ohne Kategorien/Alter/Kindertext */
export type RawEvent = {
  institutionId: string;
  title: string;
  /** Öffentlicher Text der Veranstaltung (Beschreibung, Zielgruppe, Hinweise) */
  text: string;
  start: string;
  end: string | null;
  location: string;
  cost: string | null;
  image: string | null;
  url: string;
  registrationUrl: string;
};

export const USER_AGENT = "HeilbronnIslandBot/0.2 (Hackathon-Prototyp; Veranstaltungsimport; nicht-kommerziell)";
const PAUSE_MS = 1000;
let letzteAnfrage = 0;

// ---------- robots.txt ----------
const robotsCache = new Map<string, string[]>();

/** Disallow-Regeln für „User-agent: *“ einer Domain */
async function verbote(origin: string): Promise<string[]> {
  if (robotsCache.has(origin)) return robotsCache.get(origin)!;
  let regeln: string[] = [];
  try {
    const text = await (await fetch(`${origin}/robots.txt`, { headers: { "User-Agent": USER_AGENT } })).text();
    let fuerAlle = false;
    for (const zeile of text.split(/\r?\n/)) {
      const [feld, ...rest] = zeile.split(":");
      const wert = rest.join(":").trim();
      if (/^user-agent$/i.test(feld?.trim() ?? "")) fuerAlle = wert === "*";
      else if (fuerAlle && /^disallow$/i.test(feld?.trim() ?? "") && wert) regeln.push(wert);
    }
  } catch {
    regeln = []; // keine robots.txt erreichbar → keine Einschränkung bekannt
  }
  robotsCache.set(origin, regeln);
  return regeln;
}

export async function erlaubt(url: string): Promise<boolean> {
  const u = new URL(url);
  const pfad = u.pathname + u.search;
  return !(await verbote(u.origin)).some((regel) => pfad.startsWith(regel));
}

/** Text abrufen: robots.txt beachten, höchstens 1 Anfrage pro Sekunde */
export async function holeText(url: string): Promise<string> {
  if (!(await erlaubt(url))) throw new Error(`robots.txt verbietet ${url}`);
  const warten = letzteAnfrage + PAUSE_MS - Date.now();
  if (warten > 0) await new Promise((r) => setTimeout(r, warten));
  letzteAnfrage = Date.now();
  const antwort = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(30_000) });
  if (!antwort.ok) throw new Error(`HTTP ${antwort.status} für ${url}`);
  return antwort.text();
}

// ---------- Hilfsfunktionen ----------

export function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export function hash(...teile: string[]): string {
  return createHash("sha256").update(teile.join("\n")).digest("hex").slice(0, 16);
}

export function leerzeichen(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** Einrichtung aus Ort/Veranstalter/Titel erkennen (für den gemeinsamen COSMOS-Kalender) */
export function erkenneEinrichtung(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("experimenta")) return "experimenta";
  if (t.includes("ipai")) return "ipai";
  if (t.includes("haus der familie")) return "hdf";
  if (/\baim\b|akademie für innovative/.test(t)) return "aim";
  return "cosmos";
}

/** „17.02.2027“ + „15:00“ (Berliner Zeit) → ISO in UTC */
export function deutschesDatum(datum: string, zeit = "00:00"): string {
  const [d, m, y] = datum.split(".").map(Number);
  const [h, min] = zeit.split(":").map(Number);
  // Erst als UTC annehmen, dann um den Berliner Versatz korrigieren (Sommer-/Winterzeit)
  const alsUtc = Date.UTC(y!, m! - 1, d!, h!, min!);
  const versatz = new Date(alsUtc).toLocaleString("en-US", { timeZone: "Europe/Berlin", timeZoneName: "longOffset" }).match(/GMT([+-]\d{2}):(\d{2})/);
  const minuten = versatz ? Number(versatz[1]) * 60 + Math.sign(Number(versatz[1])) * Number(versatz[2]) : 60;
  return new Date(alsUtc - minuten * 60_000).toISOString();
}
