/**
 * Logik der Eltern-Suche, ohne Darstellung (getestet in tests/lib/eltern-suche.test.ts):
 * Filter für Tag, Wochentage und Tageszeit, Terminband, Gruppen nach Woche/Monat,
 * aktive Filter als Text und die Wünsche des Kindes in einem gemeinsamen Format.
 * Baut auf filtere() auf. Die Regeln für Kinder (fuerModus, isForKids) bleiben unberührt –
 * Eltern sehen alle öffentlichen Angebote.
 */
import type { Angebot, Art, Status, Termin, Thema, Zielgruppe } from "./angebot";
import { hatAltersangabe } from "./entdecken";
import { isFree } from "./events";
import { filtere, LEERER_FILTER, type Filter } from "./filter";
import { alterText, ART_TEXT } from "./format";
import { slugAusId } from "./routen";
import type { Category, CategoryId, EventType, LiveEvent } from "@/types";

const ZONE = "Europe/Berlin";
const TAG_MS = 24 * 60 * 60 * 1000;
const ZEITRAUM_TAGE = { alle: Infinity, woche: 7, monat: 31 } as const;

export type Tageszeit = "vormittags" | "nachmittags" | "abends";
export type Wochentage = "alle" | "werktags" | "wochenende";

export type ElternFilter = Filter & {
  /** Ein Kalendertag in Berlin („2026-11-17“), gewählt im Terminband */
  tag?: string;
  wochentage: Wochentage;
  tageszeiten: Tageszeit[];
};

export const LEERER_ELTERN_FILTER: ElternFilter = { ...LEERER_FILTER, wochentage: "alle", tageszeiten: [] };

/** Sprache des Eltern-Bereichs. Texte der Anbieter (Titel, Beschreibung) bleiben im Original. */
export type Sprache = "de" | "en";
export const LOCALE: Record<Sprache, string> = { de: "de-DE", en: "en-GB" };

export const TAGESZEIT_TEXTE: Record<Sprache, Record<Tageszeit, string>> = {
  de: { vormittags: "Vormittags", nachmittags: "Nachmittags", abends: "Abends" },
  en: { vormittags: "Mornings", nachmittags: "Afternoons", abends: "Evenings" },
};
export const WOCHENTAGE_TEXTE: Record<Sprache, Record<Wochentage, string>> = {
  de: { alle: "Alle Tage", werktags: "Unter der Woche", wochenende: "Am Wochenende" },
  en: { alle: "All days", werktags: "Weekdays", wochenende: "Weekends" },
};
export const ZIELGRUPPE_TEXTE: Record<Sprache, Record<Zielgruppe, string>> = {
  de: { kinder: "Kinder", teens: "Teens", eltern: "Eltern", familien: "Familien", fachkraefte: "Fachkräfte", erwachsene: "Erwachsene" },
  en: { kinder: "Children", teens: "Teens", eltern: "Parents", familien: "Families", fachkraefte: "Educators", erwachsene: "Adults" },
};
export const ART_TEXTE: Record<Sprache, Record<Art, string>> = {
  de: ART_TEXT,
  en: { kurs: "Course", workshop: "Workshop", veranstaltung: "Event", ferienprogramm: "Holiday programme", vortrag: "Talk" },
};
/** Englische Namen der Themen und Event-Kategorien; unbekannte Themen behalten ihren Namen. */
const THEMA_EN: Record<string, string> = {
  ki: "Artificial intelligence",
  coding: "Coding & robotics",
  gaming: "Gaming & games",
  astronomy: "Space & stars",
  physics: "Physics & experiments",
  biology: "Nature & animals",
  math: "Maths & puzzles",
  it: "Computers & AI",
  art: "Art & creativity",
  family: "With the family",
};
export function themaName(t: { id: string; name: string }, sprache: Sprache = "de"): string {
  return sprache === "en" ? THEMA_EN[t.id] ?? t.name : t.name;
}

export const TAGESZEIT_TEXT = TAGESZEIT_TEXTE.de;
export const WOCHENTAGE_TEXT = WOCHENTAGE_TEXTE.de;
export const ZIELGRUPPE_TEXT = ZIELGRUPPE_TEXTE.de;

// ---------- Datum in Berliner Zeit ----------

const tagSchluesselFormat = new Intl.DateTimeFormat("en-CA", { timeZone: ZONE, year: "numeric", month: "2-digit", day: "2-digit" });
const stundeFormat = new Intl.DateTimeFormat("en-GB", { timeZone: ZONE, hour: "numeric", hourCycle: "h23" });
const tagKurzFormat: Record<Sprache, Intl.DateTimeFormat> = {
  de: new Intl.DateTimeFormat("de-DE", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" }),
  en: new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" }),
};
const monatFormat: Record<Sprache, Intl.DateTimeFormat> = {
  de: new Intl.DateTimeFormat("de-DE", { timeZone: ZONE, month: "long", year: "numeric" }),
  en: new Intl.DateTimeFormat("en-GB", { timeZone: ZONE, month: "long", year: "numeric" }),
};

/** Kalendertag in Berlin als „2026-11-17“ */
export function tagSchluessel(zeit: string | number | Date): string {
  return tagSchluesselFormat.format(new Date(zeit));
}

/** Rechnet mit Tag-Schlüsseln; 12 Uhr UTC vermeidet Fehler bei der Zeitumstellung. */
function plusTage(tag: string, tage: number): string {
  const d = new Date(`${tag}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + tage);
  return d.toISOString().slice(0, 10);
}

/** 0 = Sonntag … 6 = Samstag */
function wochentagVon(tag: string): number {
  return new Date(`${tag}T12:00:00Z`).getUTCDay();
}

/** „Sa., 21. Nov.“ für einen Tag-Schlüssel */
export function tagText(tag: string, sprache: Sprache = "de"): string {
  return tagKurzFormat[sprache].format(new Date(`${tag}T12:00:00Z`));
}

export function tageszeitVon(iso: string): Tageszeit {
  const teil = stundeFormat.formatToParts(new Date(iso)).find((p) => p.type === "hour");
  const stunde = Number(teil?.value ?? 0);
  return stunde < 12 ? "vormittags" : stunde < 17 ? "nachmittags" : "abends";
}

// ---------- Suche ----------

function kommendeTermine(a: Angebot, jetzt: Date): Termin[] {
  return a.termine
    .filter((t) => new Date(t.ende ?? t.start).getTime() >= jetzt.getTime())
    .sort((x, y) => Date.parse(x.start) - Date.parse(y.start));
}

function passtTermin(t: Termin, f: ElternFilter, jetzt: Date): boolean {
  if (Date.parse(t.start) > jetzt.getTime() + ZEITRAUM_TAGE[f.zeitraum] * TAG_MS) return false;
  const tag = tagSchluessel(t.start);
  if (f.tag && tag !== f.tag) return false;
  if (f.wochentage !== "alle") {
    const wochenende = [0, 6].includes(wochentagVon(tag));
    if ((f.wochentage === "wochenende") !== wochenende) return false;
  }
  return f.tageszeiten.length === 0 || f.tageszeiten.includes(tageszeitVon(t.start));
}

/** Ein Suchtreffer mit dem ersten Termin, der zu allen Filtern passt. */
export type Treffer = { angebot: Angebot; termin: Termin; weitere: number };

export function elternSuche(angebote: Angebot[], f: ElternFilter, jetzt: Date): Treffer[] {
  const treffer: Treffer[] = [];
  for (const a of filtere(angebote, f, jetzt)) {
    const kommende = kommendeTermine(a, jetzt);
    const termin = kommende.find((t) => passtTermin(t, f, jetzt));
    if (termin) treffer.push({ angebot: a, termin, weitere: kommende.length - 1 });
  }
  return treffer.sort((x, y) => Date.parse(x.termin.start) - Date.parse(y.termin.start));
}

// ---------- Terminband: wie viele Angebote an welchem Tag? ----------

export type BandTag = { tag: string; anzahl: number; wochenende: boolean; heute: boolean };

/** Zählt je Tag die Angebote mit passendem Termin. Der gewählte Tag selbst wird dabei ignoriert. */
export type TagesEintrag = { angebot: Angebot; termin: Termin };

/**
 * Alle kommenden Termine je Kalendertag („2026-11-21“ → Einträge, nach Uhrzeit sortiert), passend zu allen
 * Filtern außer dem gewählten Tag. Ein Angebot steht pro Tag höchstens einmal drin.
 */
export function tagesEintraege(angebote: Angebot[], f: ElternFilter, jetzt: Date): Map<string, TagesEintrag[]> {
  const ohneTag: ElternFilter = { ...f, tag: undefined };
  const tage = new Map<string, TagesEintrag[]>();
  for (const a of filtere(angebote, ohneTag, jetzt)) {
    const gesehen = new Set<string>();
    for (const t of kommendeTermine(a, jetzt).filter((x) => passtTermin(x, ohneTag, jetzt))) {
      const tag = tagSchluessel(t.start);
      if (gesehen.has(tag)) continue;
      gesehen.add(tag);
      tage.set(tag, [...(tage.get(tag) ?? []), { angebot: a, termin: t }]);
    }
  }
  for (const liste of tage.values()) liste.sort((x, y) => Date.parse(x.termin.start) - Date.parse(y.termin.start));
  return tage;
}

/** Anzahl Angebote je Kalendertag; der gewählte Tag wird ignoriert. */
export function tagesZahlen(angebote: Angebot[], f: ElternFilter, jetzt: Date): Map<string, number> {
  return new Map([...tagesEintraege(angebote, f, jetzt)].map(([tag, liste]) => [tag, liste.length]));
}

export function terminband(angebote: Angebot[], f: ElternFilter, jetzt: Date, tage = 28): BandTag[] {
  const zaehler = tagesZahlen(angebote, f, jetzt);
  const heute = tagSchluessel(jetzt);
  return Array.from({ length: tage }, (_, i) => {
    const tag = plusTage(heute, i);
    return { tag, anzahl: zaehler.get(tag) ?? 0, wochenende: [0, 6].includes(wochentagVon(tag)), heute: i === 0 };
  });
}

// ---------- Monatskalender ----------

/** Tage eines Monats (monat 0–11) als Tag-Schlüssel, Wochen ab Montag; leere Felder davor und danach sind null. */
export function monatsRaster(jahr: number, monat: number): Array<string | null> {
  const erster = new Date(Date.UTC(jahr, monat, 1, 12));
  const tage = new Date(Date.UTC(jahr, monat + 1, 0, 12)).getUTCDate();
  const vorne = (erster.getUTCDay() + 6) % 7;
  const felder: Array<string | null> = Array.from({ length: vorne }, () => null);
  for (let d = 1; d <= tage; d++) felder.push(`${jahr}-${String(monat + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  while (felder.length % 7 !== 0) felder.push(null);
  return felder;
}

// ---------- Ergebnisliste in Zeitabschnitten ----------

export type Zeitgruppe = { titel: string; treffer: Treffer[] };

const WOCHE_TEXT: Record<Sprache, [string, string]> = { de: ["Diese Woche", "Nächste Woche"], en: ["This week", "Next week"] };

export function nachZeitGruppieren(treffer: Treffer[], jetzt: Date, sprache: Sprache = "de"): Zeitgruppe[] {
  const heute = tagSchluessel(jetzt);
  const naechsterMontag = plusTage(heute, 7 - ((wochentagVon(heute) + 6) % 7));
  const uebernaechsterMontag = plusTage(naechsterMontag, 7);
  const gruppen = new Map<string, Treffer[]>();
  for (const t of treffer) {
    const tag = tagSchluessel(t.termin.start);
    const titel = tag < naechsterMontag ? WOCHE_TEXT[sprache][0] : tag < uebernaechsterMontag ? WOCHE_TEXT[sprache][1] : monatFormat[sprache].format(new Date(t.termin.start));
    gruppen.set(titel, [...(gruppen.get(titel) ?? []), t]);
  }
  return [...gruppen].map(([titel, liste]) => ({ titel, treffer: liste }));
}

// ---------- Aktive Filter als entfernbare Chips ----------

export type AktiverFilter = { id: string; text: string; ohne: ElternFilter };

export function aktiveFilter(f: ElternFilter, namen: { themen: Record<string, string>; quellen: Record<string, string> }, sprache: Sprache = "de"): AktiverFilter[] {
  const en = sprache === "en";
  const liste: AktiverFilter[] = [];
  const dazu = (id: string, text: string, ohne: Partial<ElternFilter>) => liste.push({ id, text, ohne: { ...f, ...ohne } });
  if (f.suche.trim()) dazu("suche", en ? `“${f.suche.trim()}”` : `„${f.suche.trim()}“`, { suche: "" });
  for (const t of f.themen) dazu(`thema-${t}`, namen.themen[t] ?? t, { themen: f.themen.filter((x) => x !== t) });
  if (f.alter !== undefined) dazu("alter", en ? `${f.alter} years` : `${f.alter} Jahre`, { alter: undefined });
  if (f.zeitraum !== "alle") {
    const text = f.zeitraum === "woche" ? (en ? "Next 7 days" : "Nächste 7 Tage") : en ? "Next month" : "Nächster Monat";
    dazu("zeitraum", text, { zeitraum: "alle" });
  }
  if (f.tag) dazu("tag", tagText(f.tag, sprache), { tag: undefined });
  if (f.wochentage !== "alle") dazu("wochentage", WOCHENTAGE_TEXTE[sprache][f.wochentage], { wochentage: "alle" });
  for (const z of f.tageszeiten) dazu(`zeit-${z}`, TAGESZEIT_TEXTE[sprache][z], { tageszeiten: f.tageszeiten.filter((x) => x !== z) });
  for (const q of f.quellen) dazu(`quelle-${q}`, namen.quellen[q] ?? q, { quellen: f.quellen.filter((x) => x !== q) });
  for (const art of f.arten) dazu(`art-${art}`, ART_TEXTE[sprache][art], { arten: f.arten.filter((x) => x !== art) });
  for (const z of f.zielgruppen) dazu(`fuer-${z}`, `${en ? "For" : "Für"} ${ZIELGRUPPE_TEXTE[sprache][z]}`, { zielgruppen: f.zielgruppen.filter((x) => x !== z) });
  if (f.nurKostenlos) dazu("kostenlos", en ? "Free" : "Kostenlos", { nurKostenlos: false });
  if (f.nurFrei) dazu("frei", en ? "Places available" : "Freie Plätze", { nurFrei: false });
  return liste;
}

// ---------- Texte für Karten ----------

/** „Scratch (8–11 Jahre)“ → „Scratch“: das Alter steht auf der Karte schon extra. */
export function kurzTitel(titel: string): string {
  return titel.replace(/\s*\((?:ab\s)?\d[^()]*\)\s*$/i, "") || titel;
}

/** Kurzer Ort für Karten. Steht als Ort nur die Stadt da, hilft der erste Teil der Adresse („Haus der Familie“). */
export function ortText(a: Angebot): string {
  if (a.ort.online) return "Online";
  if (a.ort.name === "Heilbronn" && a.ort.adresse) return a.ort.adresse.replace(/^Heilbronn,\s*/, "").split(",")[0]?.trim() || a.ort.name;
  return a.ort.name;
}

export function preisText(a: Angebot, sprache: Sprache = "de"): string {
  if (a.kosten.euro === 0) return sprache === "en" ? "Free" : "Kostenlos";
  if (a.kosten.text === "siehe Anbieter") return sprache === "en" ? "Price: see provider" : "Preis beim Anbieter";
  return a.kosten.text;
}

/**
 * Alter ehrlich anzeigen: Fehlt es, steht dort „Alter unklar“ – nie ein geschätzter Wert.
 * Angebote nur für Erwachsene (Eltern, Fachkräfte, Familien) nennen stattdessen die Zielgruppe.
 */
export function alterHinweis(a: Angebot, sprache: Sprache = "de"): { text: string; unklar: boolean } {
  if (sprache === "de") {
    if (hatAltersangabe(a)) return { text: alterText(a), unklar: false };
    if (a.zielgruppen.some((z) => z !== "kinder" && z !== "teens")) return { text: alterText(a), unklar: false };
    return { text: "Alter unklar", unklar: true };
  }
  if (hatAltersangabe(a)) return { text: alterSpanne(a.alterMin ?? null, a.alterMax ?? null, "en"), unklar: false };
  for (const [gruppe, text] of [["fachkraefte", "for educators"], ["eltern", "for parents"], ["familien", "for families"], ["erwachsene", "for adults"]] as const) {
    if (a.zielgruppen.includes(gruppe)) return { text, unklar: false };
  }
  return { text: "Age not stated", unklar: true };
}

function alterSpanne(min: number | null, max: number | null, sprache: Sprache = "de"): string {
  const en = sprache === "en";
  if (min !== null && max !== null) return en ? `${min}–${max} years` : `${min}–${max} Jahre`;
  if (min !== null) return en ? `from ${min}` : `ab ${min} Jahren`;
  if (max !== null) return en ? `up to ${max}` : `bis ${max} Jahre`;
  return en ? "Age not stated" : "Alter unklar";
}

const STATUS_TEXTE: Record<Sprache, Record<Status, string>> = {
  de: { frei: "Plätze frei", wenige: "Wenige Plätze gemeldet", ausgebucht: "Ausgebucht", unbekannt: "Plätze: beim Anbieter" },
  en: { frei: "Places available", wenige: "Few places left", ausgebucht: "Fully booked", unbekannt: "Places: see provider" },
};
export function statusAnzeige(status: Status, sprache: Sprache = "de"): string {
  return STATUS_TEXTE[sprache][status];
}

// ---------- Wünsche des Kindes ----------

export type Wunsch = {
  id: string;
  titel: string;
  einrichtung: string;
  ort: string;
  start: string;
  ende?: string;
  alter: string;
  preis: string;
  anmeldeUrl: string;
  /** Nur bei Kursen: eigene Detailseite */
  detailPfad?: string;
  status?: Status;
  beispiel: boolean;
  vorbei: boolean;
};

/**
 * Was das Kind mit „Da will ich hin!“ gewählt hat (IDs aus der Browsersitzung) –
 * Kurse und Live-Events („ev:“ + ID) in einem Format. Unbekannte IDs fallen weg. Kommende zuerst.
 */
export function kindWuensche(ids: string[], angebote: Angebot[], events: LiveEvent[], einrichtungen: Record<string, string>, jetzt: Date, sprache: Sprache = "de"): Wunsch[] {
  const liste: Wunsch[] = [];
  for (const id of new Set(ids)) {
    if (id.startsWith("ev:")) {
      const e = events.find((x) => `ev:${x.id}` === id);
      if (!e) continue;
      liste.push({
        id,
        titel: e.title,
        einrichtung: einrichtungen[e.institutionId] ?? e.institutionId,
        ort: e.location,
        start: e.start,
        ende: e.end ?? undefined,
        alter: alterSpanne(e.ageMin, e.ageMax, sprache),
        preis: isFree(e) ? (sprache === "en" ? "Free" : "Kostenlos") : e.cost ?? (sprache === "en" ? "Price: see provider" : "Preis beim Anbieter"),
        anmeldeUrl: e.registrationUrl,
        beispiel: e.isDummy,
        vorbei: new Date(e.end ?? e.start).getTime() < jetzt.getTime(),
      });
      continue;
    }
    const a = angebote.find((x) => x.id === id);
    if (!a) continue;
    const kommend = kommendeTermine(a, jetzt)[0];
    const termin = kommend ?? a.termine[a.termine.length - 1]!;
    liste.push({
      id,
      titel: kurzTitel(a.titel),
      einrichtung: einrichtungen[a.quelle] ?? a.quelle,
      ort: ortText(a),
      start: termin.start,
      ende: termin.ende,
      alter: alterHinweis(a, sprache).text,
      preis: preisText(a, sprache),
      anmeldeUrl: a.url,
      detailPfad: `/angebot/${slugAusId(a.id)}/`,
      status: a.status,
      beispiel: false,
      vorbei: !kommend,
    });
  }
  return liste.sort((x, y) => Number(x.vorbei) - Number(y.vorbei) || Date.parse(x.start) - Date.parse(y.start));
}

// ---------- Live-Events (Mobilizon) im selben Format wie Kurse ----------

/** Kategorien der Live-Events → Themen-IDs der Kurse; alle anderen Kategorien bleiben eigene Themen. */
const KATEGORIE_ZU_THEMA: Partial<Record<CategoryId, string>> = { it: "ki", coding: "coding", gaming: "gaming" };
const TYP_ZU_ART: Record<EventType, Art> = { workshop: "workshop", course: "kurs", show: "veranstaltung", event: "veranstaltung" };

/**
 * Ein Live-Event als Angebot, damit Suche, Filter und Karten für Eltern nur ein Format kennen.
 * Nur Umformen, nichts erfinden: Plätze sind unbekannt, ein fehlendes Alter bleibt leer.
 */
export function angebotAusEvent(e: LiveEvent): Angebot {
  const frei = isFree(e);
  const zielgruppen: Zielgruppe[] = [];
  if (e.ageMin !== null && e.ageMin <= 11) zielgruppen.push("kinder");
  if (e.ageMin !== null && e.ageMin <= 17 && (e.ageMax ?? 99) >= 12) zielgruppen.push("teens");
  if (e.categories.includes("family")) zielgruppen.push("familien");
  return {
    id: `ev:${e.id}`,
    quelle: e.institutionId,
    titel: e.title,
    teaser: e.description_parents,
    url: e.registrationUrl || e.sourceUrl,
    themen: [...new Set(e.categories.map((k) => KATEGORIE_ZU_THEMA[k] ?? k))],
    art: TYP_ZU_ART[e.type],
    zielgruppen,
    alterMin: e.ageMin ?? undefined,
    alterMax: e.ageMax ?? undefined,
    termine: [{ start: e.start, ende: e.end ?? undefined }],
    ort: { name: e.location, online: false },
    kosten: { euro: frei ? 0 : null, text: frei ? "kostenlos" : e.cost ?? "siehe Anbieter" },
    status: "unbekannt",
    sicherheit: 1,
    ausloeser: [],
    erstmalsGesehen: e.lastUpdated,
  };
}

/** Themen für den Filter: nur die, die in den Angeboten vorkommen – erst die Kurs-Themen, dann die Event-Kategorien. */
export function themenFuer(basis: Thema[], kategorien: Category[], angebote: Angebot[]): Thema[] {
  const vorhanden = new Set(angebote.flatMap((a) => a.themen));
  const ausKategorien: Thema[] = kategorien
    .filter((k) => !basis.some((t) => t.id === k.id))
    .map((k) => ({ id: k.id, name: k.label_kids, symbol: k.icon, farbe: k.color, schlagwoerter: [] }));
  return [...basis, ...ausKategorien].filter((t) => vorhanden.has(t.id));
}
