/**
 * Live-Events direkt aus Mobilizon (GraphQL-API), abgefragt im Browser bei jedem Seitenaufruf.
 *
 * Mobilizon wird vom Team gepflegt und gilt deshalb als geprüfte Quelle (docs/entscheidungen.md):
 * Kinder sehen ein Event, sobald ein Alter erkannt wurde (isForKids). Ohne erkanntes Alter → needsReview.
 * Eingeordnet wird nur mit Stichwörtern aus categories.json – keine KI, keine externen Dienste.
 * Bilder: nur das Titelbild, das die Instanz selbst ausliefert (/media/…) – Bilder fremder Seiten in der Beschreibung nie.
 * Ist das Titelbild nur das Gruppenbild der Einrichtung (Avatar/Banner = Standardbild ohne eigenes Foto), zeigt die Kachel ihre Farbe
 * (erkenneStandardbilder: Mobilizon speichert Gruppenbilder verkleinert neu, deshalb Seitenverhältnis + Mehrfachnutzung statt Dateivergleich).
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
  picture: { url: string; metadata?: { width: number | null; height: number | null } | null } | null;
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
      picture { url metadata { width height } }
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

const regexSicher = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Stichwörter zählen nur am Wortanfang („Sternenhimmel“ ja, „meistern“ nein; „präsentieren“ ist kein „tiere“).
 * Kurze Stichwörter („ki“, „app“) nur als ganzes Wort – sonst passt „ki“ in jedes „Kinder“.
 * Preis dafür: Wortenden in Zusammensetzungen („Weihnachtsstern“, „Wildtiere“) zählen nicht.
 */
function enthaelt(text: string, wort: string): boolean {
  const w = regexSicher(wort.trim());
  const ende = wort.trim().length > 3 ? "" : "($|[^\\p{L}])";
  return new RegExp(`(^|[^\\p{L}])${w}${ende}`, "u").test(text);
}

/**
 * Text für die Themen-Erkennung: nur, worum es geht – nicht, wo es stattfindet.
 * Weg fallen Listenpunkte/Absätze „Ort: …“, Hinweis-Sätze (z. B. „Im Science Dome können laute Geräusche,
 * Lichteffekte … auftreten“), Links und Einrichtungsnamen. Sonst passt „experiment“ in jedes „experimenta“
 * und der Science-Dome-Hinweis macht jede Show zu „Physik“.
 */
export function themenText(titel: string, html: string, tags: string[]): string {
  const ohneOrt = html.replace(/<(p|li)\b[^>]*>\s*(?:<[^>]+>\s*)*ort\s*:[\s\S]*?<\/\1>/gi, " ");
  const saetze = htmlZuText(ohneOrt).split(/(?<=[.!?])\s+/).filter((s) => !/^hinweis|lichteffekt/i.test(s));
  return `${titel} ${saetze.join(" ")} ${tags.join(" ")}`
    .replace(/(?:https?:\/\/|www\.)\S+/gi, " ")
    .replace(/experimenta|haus der familie|\bipai\b/gi, " ");
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

/** Vergleichsschlüssel eines Mobilizon-Bildes: der Datei-Hash in /media/<hash>.<endung> (gleiches Bild = gleicher Hash) */
export function bildSchluessel(url: string): string {
  return url.match(/\/media\/([0-9a-f]{16,})/i)?.[1]?.toLowerCase() ?? url.split("?")[0]!;
}

/** Event-Titelbild, außer es ist fremd oder nur das Standardbild der Gruppe (dann null → Farbkachel) */
export function eventBild(url: string | null | undefined, standardBilder: ReadonlySet<string>, basis = MOBILIZON_URL): string | null {
  const bild = eigenesBild(url, basis);
  return bild && !standardBilder.has(bildSchluessel(bild)) ? bild : null;
}

export function zuLiveEvent(e: MobilizonEvent, kategorien: Category[], basis = MOBILIZON_URL, standardBilder: ReadonlySet<string> = new Set()): LiveEvent {
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
    categories: erkenneKategorien(themenText(titel, html, tags), kategorien),
    ageMin,
    ageMax,
    type: erkenneArt(suchtext),
    start: new Date(e.beginsOn).toISOString(),
    end: e.endsOn ? new Date(e.endsOn).toISOString() : null,
    location: ort.slice(0, 80),
    cost: preis && /^(keine|kostenfrei|kostenlos|frei)$/i.test(preis) ? "kostenlos" : preis,
    image: eventBild(e.picture?.url, standardBilder, basis),
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
  const standardBilder = erkenneStandardbilder(roh, await ladeGruppenbilder(roh, basis, signal));
  const jetzt = Date.now();
  return roh
    .filter((e) => e.status !== "CANCELLED")
    .map((e) => zuLiveEvent(e, kategorien, basis, standardBilder))
    .filter((e) => new Date(e.end ?? e.start).getTime() >= jetzt)
    .sort((a, b) => a.start.localeCompare(b.start));
}

export type Gruppenbild = { schluessel: string; verhaeltnis: number | null };

/** Abweichung im Seitenverhältnis, bis zu der zwei Bilder als dasselbe Motiv gelten (verkleinert/neu gespeichert) */
const VERHAELTNIS_TOLERANZ = 0.01;

/**
 * Welche Event-Titelbilder sind nur das Standardbild der Gruppe? (Ergebnis: Bild-Schlüssel)
 * Mobilizon speichert hochgeladene Gruppenbilder verkleinert neu – Datei und Hash ändern sich. Deshalb gilt ein Titelbild als Standardbild, wenn
 *  - es genau dieselbe Datei wie Avatar oder Banner der Gruppe ist, oder
 *  - es bei mindestens zwei verschiedenen Veranstaltungen der Gruppe vorkommt UND das Seitenverhältnis von Avatar oder Banner hat.
 * Ein eigenes Foto, das nur zu einer Veranstaltung gehört (auch mit mehreren Terminen), bleibt immer ein Foto.
 */
export function erkenneStandardbilder(events: MobilizonEvent[], gruppenbilder: ReadonlyMap<string, Gruppenbild[]>): Set<string> {
  type Nutzung = { gruppe: string; schluessel: string; verhaeltnis: number | null; titel: Set<string> };
  const nutzungen = new Map<string, Nutzung>();
  for (const e of events) {
    const gruppe = e.attributedTo?.preferredUsername;
    if (!gruppe || !e.picture?.url) continue;
    const schluessel = bildSchluessel(e.picture.url);
    const { width, height } = e.picture.metadata ?? {};
    const n = nutzungen.get(`${gruppe}|${schluessel}`) ?? { gruppe, schluessel, verhaeltnis: width && height ? width / height : null, titel: new Set<string>() };
    n.titel.add(e.title.trim().toLowerCase());
    nutzungen.set(`${gruppe}|${schluessel}`, n);
  }
  const standard = new Set<string>();
  for (const { gruppe, schluessel, verhaeltnis, titel } of nutzungen.values()) {
    const bilder = gruppenbilder.get(gruppe) ?? [];
    const gleicheDatei = bilder.some((b) => b.schluessel === schluessel);
    const gleichesFormat =
      verhaeltnis !== null && bilder.some((b) => b.verhaeltnis !== null && Math.abs(b.verhaeltnis / verhaeltnis - 1) <= VERHAELTNIS_TOLERANZ);
    if (gleicheDatei || (titel.size >= 2 && gleichesFormat)) standard.add(schluessel);
  }
  return standard;
}

/** Seitenverhältnis eines Bildes – im Browser über ein <img> (braucht kein CORS); ohne DOM (Tests, Node) unbekannt */
function bildVerhaeltnis(url: string): Promise<number | null> {
  if (typeof Image === "undefined") return Promise.resolve(null);
  return new Promise((fertig) => {
    const bild = new Image();
    bild.referrerPolicy = "no-referrer";
    bild.onload = () => fertig(bild.naturalHeight ? bild.naturalWidth / bild.naturalHeight : null);
    bild.onerror = () => fertig(null);
    bild.src = url;
  });
}

/**
 * Avatar und Banner aller beteiligten Gruppen (eine Abfrage) samt Seitenverhältnis – die Standardbilder der Einrichtungen.
 * Schlägt das fehl, gibt es keine Standardbilder (dann zeigen alle Kacheln ihr Titelbild); die Events laden trotzdem.
 */
export async function ladeGruppenbilder(
  events: MobilizonEvent[],
  basis: string,
  signal?: AbortSignal,
  verhaeltnis: (url: string) => Promise<number | null> = bildVerhaeltnis,
): Promise<Map<string, Gruppenbild[]>> {
  const gruppen = [...new Set(events.map((e) => e.attributedTo?.preferredUsername).filter((g): g is string => !!g && /^[a-z0-9_.-]+$/i.test(g)))];
  const ergebnis = new Map<string, Gruppenbild[]>();
  if (gruppen.length === 0) return ergebnis;
  const abfrage = `{ ${gruppen.map((g, i) => `g${i}: group(preferredUsername: ${JSON.stringify(g)}) { avatar { url } banner { url } }`).join(" ")} }`;
  try {
    const antwort = await fetch(`${basis}/api`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: abfrage }), signal });
    const json = (await antwort.json()) as { data?: Record<string, { avatar: { url: string } | null; banner: { url: string } | null } | null> };
    await Promise.all(
      gruppen.map(async (gruppe, i) => {
        const g = json.data?.[`g${i}`];
        const urls = [g?.avatar?.url, g?.banner?.url].filter((u): u is string => !!u && eigenesBild(u, basis) !== null);
        ergebnis.set(gruppe, await Promise.all(urls.map(async (u) => ({ schluessel: bildSchluessel(u), verhaeltnis: await verhaeltnis(u) }))));
      }),
    );
  } catch {
    // keine Standardbilder bekannt
  }
  return ergebnis;
}
