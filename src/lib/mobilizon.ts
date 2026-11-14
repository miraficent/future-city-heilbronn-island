/**
 * Live-Events direkt aus Mobilizon (GraphQL-API), abgefragt im Browser bei jedem Seitenaufruf.
 *
 * Mobilizon wird vom Team gepflegt und gilt deshalb als geprüfte Quelle (docs/entscheidungen.md):
 * Kinder sehen ein Event, sobald ein Alter erkannt wurde (isForKids). Ohne erkanntes Alter → needsReview.
 * Eingeordnet wird nur mit Stichwörtern aus categories.json – keine KI, keine externen Dienste.
 * Bilder: nur das Titelbild, das die Instanz selbst ausliefert (/media/…) – Bilder fremder Seiten in der Beschreibung nie.
 *
 * Die Umwandlung ist reine Logik (tests/lib/mobilizon.test.ts); nur ladeMobilizonEvents() greift aufs Netz zu.
 */
import type { Category, CategoryId, EventType, LiveEvent } from "@/types";

/** Basis-URL der Instanz; beim Build über NEXT_PUBLIC_MOBILIZON_URL änderbar */
export const MOBILIZON_URL = (process.env.NEXT_PUBLIC_MOBILIZON_URL ?? "http://localhost:4000").replace(/\/$/, "");

/** Mehr als 50 pro Seite lehnt Mobilizon ab (events_max_limit_reached) */
const SEITE = 50;
const EINRICHTUNGEN = new Set(["aim", "experimenta", "hdf", "ipai", "cosmos"]);

export type MobilizonEvent = {
  uuid: string;
  title: string;
  description: string | null;
  beginsOn: string;
  endsOn: string | null;
  status: string;
  onlineAddress: string | null;
  externalParticipationUrl: string | null;
  physicalAddress: { description: string | null; locality: string | null } | null;
  attributedTo: { preferredUsername: string } | null;
  organizerActor: { preferredUsername: string } | null;
  tags: { title: string }[];
  picture: { url: string } | null;
};

const ABFRAGE = `query ($page: Int, $limit: Int) {
  events(page: $page, limit: $limit) {
    total
    elements {
      uuid title description beginsOn endsOn status onlineAddress externalParticipationUrl
      physicalAddress { description locality }
      attributedTo { preferredUsername }
      organizerActor { preferredUsername }
      tags { title }
      picture { url }
    }
  }
}`;

// ---------- HTML → Text (ohne DOM, damit es auch in den Tests läuft) ----------

const ZEICHEN: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function entschluessle(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (ganz, code: string) => {
    if (code[0] === "#") return String.fromCodePoint(code[1]?.toLowerCase() === "x" ? parseInt(code.slice(2), 16) : Number(code.slice(1)));
    return ZEICHEN[code.toLowerCase()] ?? ganz;
  });
}

const leerzeichen = (t: string) => t.replace(/\s+/g, " ").trim();
const nurText = (html: string) => leerzeichen(entschluessle(html.replace(/<[^>]*>/g, " ")));

export function htmlZuText(html: string): string {
  return nurText(html.replace(/<img[^>]*>/gi, ""));
}

// ---------- Einordnung ----------

const ALTER_SPANNE = /(\d{1,2})\s*-?\s*(?:-|–|bis)\s*(\d{1,2})\s*-?\s*(?:jahr|jährig|j\.)/i;
const ALTER_AB = /\bab\s*(\d{1,2})\s*(?:jahr|j\b|j\.)/i;
const KLASSE = /(?:\bklassen?(?:stufe)?|\bkl\.)\s*(\d{1,2})\s*(?:-|–|bis)\s*(\d{1,2})/i;
const ALTERS_TAG = /^(\d{1,2})\s*-\s*(\d{1,2})\s*Jahre$/i;

/** Alter aus dem Text (wie die Pipeline); sonst aus den Alters-Tags („6-10 Jahre“, „Erwachsene“) */
export function erkenneAlter(text: string, tags: string[]): [number | null, number | null] {
  let m;
  if ((m = text.match(ALTER_SPANNE))) return [Number(m[1]), Number(m[2])];
  if ((m = text.match(KLASSE))) return [Number(m[1]) + 5, Number(m[2]) + 6];
  if ((m = text.match(ALTER_AB))) return [Number(m[1]), null];
  const spannen = tags.map((t) => t.match(ALTERS_TAG)).filter((x): x is RegExpMatchArray => x !== null);
  const erwachsene = tags.some((t) => /^erwachsene$/i.test(t));
  if (spannen.length) {
    return [Math.min(...spannen.map((s) => Number(s[1]))), erwachsene ? null : Math.max(...spannen.map((s) => Number(s[2])))];
  }
  return erwachsene ? [18, null] : [null, null];
}

/** Kurze Stichwörter („ki“, „app“) nur als ganzes Wort – sonst passt „ki“ in jedes „Kinder“ */
function enthaelt(text: string, wort: string): boolean {
  const w = wort.trim();
  if (w.length > 3) return text.includes(w);
  return new RegExp(`(^|[^\\p{L}])${w}($|[^\\p{L}])`, "u").test(text);
}

export function erkenneKategorien(text: string, kategorien: Category[]): CategoryId[] {
  const t = text.toLowerCase();
  return kategorien.filter((k) => k.keywords.some((w) => enthaelt(t, w))).map((k) => k.id).slice(0, 3);
}

export function erkenneArt(text: string): EventType {
  return /3d|show|live|planetarium|science dome|film/i.test(text) ? "show"
    : /workshop|werkstatt|labor|mitmach/i.test(text) ? "workshop"
    : /kurs|juniorakademie/i.test(text) ? "course"
    : "event";
}

export function erkenneEinrichtung(gruppe: string, text: string): string {
  if (EINRICHTUNGEN.has(gruppe)) return gruppe;
  const t = `${gruppe} ${text}`.toLowerCase();
  if (t.includes("experimenta")) return "experimenta";
  if (t.includes("ipai")) return "ipai";
  if (t.includes("haus der familie")) return "hdf";
  if (/\baim\b|akademie für innovative/.test(t)) return "aim";
  return "cosmos";
}

// ---------- Mobilizon → LiveEvent ----------

/** Titelbild nur, wenn es von der Mobilizon-Instanz selbst kommt (Datenschutz: keine fremden Bildserver) */
export function eigenesBild(url: string | null | undefined, basis = MOBILIZON_URL): string | null {
  if (!url) return null;
  try {
    return new URL(url).origin === new URL(basis).origin ? url : null;
  } catch {
    return null;
  }
}

export function zuLiveEvent(e: MobilizonEvent, kategorien: Category[], basis = MOBILIZON_URL): LiveEvent {
  const html = e.description ?? "";
  const tags = e.tags.map((t) => t.title);
  const beschreibung = htmlZuText(html);
  const titel = leerzeichen(e.title);
  const suchtext = `${titel} ${beschreibung} ${tags.join(" ")}`;

  // Anmelde-Link der Einrichtung („Anmeldung & Infos“), sonst die Seite in Mobilizon
  const links = [...html.matchAll(/href="(https?:\/\/[^"]+)"/gi)].map((m) => entschluessle(m[1]!)).filter((h) => !h.startsWith(basis));
  const anmeldung = e.externalParticipationUrl ?? links[0] ?? `${basis}/events/${e.uuid}`;

  // Preis aus den Listenpunkten („Preis: …“, „Gebühr: …“, „Teilnahme: kostenfrei“) – sonst unbekannt
  const punkte = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => nurText(m[1]!));
  const preis = punkte.map((p) => p.match(/^(?:Preis|Gebühr|Kosten|Teilnahme):\s*(.+)$/i)?.[1]).find(Boolean) ?? null;

  const [ageMin, ageMax] = erkenneAlter(`${titel} ${beschreibung}`, tags);
  const gruppe = e.attributedTo?.preferredUsername ?? e.organizerActor?.preferredUsername ?? "";
  const ort = e.physicalAddress?.description ?? e.physicalAddress?.locality ?? (e.onlineAddress ? "online" : "");

  return {
    id: `mz-${e.uuid}`,
    institutionId: erkenneEinrichtung(gruppe, `${ort} ${titel}`),
    title: titel,
    title_kids: titel.split(/\s[–(-]\s?/)[0]!.split(" ").slice(0, 6).join(" "),
    categories: erkenneKategorien(suchtext, kategorien),
    ageMin,
    ageMax,
    type: erkenneArt(suchtext),
    start: new Date(e.beginsOn).toISOString(),
    end: e.endsOn ? new Date(e.endsOn).toISOString() : null,
    location: ort.slice(0, 80),
    cost: preis && /^(keine|kostenfrei|kostenlos|frei)$/i.test(preis) ? "kostenlos" : preis,
    image: eigenesBild(e.picture?.url, basis),
    story_kids: "", // ohne KI kein Kindertext – die Karte zeigt dann den Titel
    description_parents: beschreibung.slice(0, 600),
    registrationUrl: anmeldung,
    sourceUrl: `${basis}/events/${e.uuid}`,
    lastUpdated: new Date().toISOString().slice(0, 10),
    needsReview: ageMin === null,
    isDummy: false,
  };
}

/** Alle kommenden, nicht abgesagten Events der Instanz, nach Start sortiert. Wirft bei Netz- oder API-Fehlern. */
export async function ladeMobilizonEvents(kategorien: Category[], signal?: AbortSignal, basis = MOBILIZON_URL): Promise<LiveEvent[]> {
  const roh: MobilizonEvent[] = [];
  for (let seite = 1; ; seite++) {
    const antwort = await fetch(`${basis}/api`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: ABFRAGE, variables: { page: seite, limit: SEITE } }),
      signal,
    });
    if (!antwort.ok) throw new Error(`Mobilizon antwortet mit HTTP ${antwort.status}`);
    const json = (await antwort.json()) as { data?: { events: { total: number; elements: MobilizonEvent[] } }; errors?: { message: string }[] };
    if (json.errors?.length || !json.data) throw new Error(`Mobilizon: ${json.errors?.map((f) => f.message).join(", ") ?? "keine Daten"}`);
    roh.push(...json.data.events.elements);
    if (json.data.events.elements.length < SEITE || roh.length >= json.data.events.total) break;
  }
  const jetzt = Date.now();
  return roh
    .filter((e) => e.status !== "CANCELLED")
    .map((e) => zuLiveEvent(e, kategorien, basis))
    .filter((e) => new Date(e.end ?? e.start).getTime() >= jetzt)
    .sort((a, b) => a.start.localeCompare(b.start));
}
