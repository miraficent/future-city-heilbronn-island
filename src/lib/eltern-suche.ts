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
import { alterText, ART_TEXT, formatMonat } from "./format";
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

export const TAGESZEIT_TEXT: Record<Tageszeit, string> = { vormittags: "Vormittags", nachmittags: "Nachmittags", abends: "Abends" };
export const WOCHENTAGE_TEXT: Record<Wochentage, string> = { alle: "Alle Tage", werktags: "Unter der Woche", wochenende: "Am Wochenende" };
export const ZIELGRUPPE_TEXT: Record<Zielgruppe, string> = {
  kinder: "Kinder",
  teens: "Teens",
  eltern: "Eltern",
  familien: "Familien",
  fachkraefte: "Fachkräfte",
  erwachsene: "Erwachsene",
};

// ---------- Datum in Berliner Zeit ----------

const tagSchluesselFormat = new Intl.DateTimeFormat("en-CA", { timeZone: ZONE, year: "numeric", month: "2-digit", day: "2-digit" });
const stundeFormat = new Intl.DateTimeFormat("en-GB", { timeZone: ZONE, hour: "numeric", hourCycle: "h23" });
const tagKurzFormat = new Intl.DateTimeFormat("de-DE", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" });

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
export function tagText(tag: string): string {
  return tagKurzFormat.format(new Date(`${tag}T12:00:00Z`));
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
export function terminband(angebote: Angebot[], f: ElternFilter, jetzt: Date, tage = 28): BandTag[] {
  const ohneTag: ElternFilter = { ...f, tag: undefined };
  const zaehler = new Map<string, number>();
  for (const a of filtere(angebote, ohneTag, jetzt)) {
    const tageDesAngebots = new Set(kommendeTermine(a, jetzt).filter((t) => passtTermin(t, ohneTag, jetzt)).map((t) => tagSchluessel(t.start)));
    for (const tag of tageDesAngebots) zaehler.set(tag, (zaehler.get(tag) ?? 0) + 1);
  }
  const heute = tagSchluessel(jetzt);
  return Array.from({ length: tage }, (_, i) => {
    const tag = plusTage(heute, i);
    return { tag, anzahl: zaehler.get(tag) ?? 0, wochenende: [0, 6].includes(wochentagVon(tag)), heute: i === 0 };
  });
}

// ---------- Ergebnisliste in Zeitabschnitten ----------

export type Zeitgruppe = { titel: string; treffer: Treffer[] };

export function nachZeitGruppieren(treffer: Treffer[], jetzt: Date): Zeitgruppe[] {
  const heute = tagSchluessel(jetzt);
  const naechsterMontag = plusTage(heute, 7 - ((wochentagVon(heute) + 6) % 7));
  const uebernaechsterMontag = plusTage(naechsterMontag, 7);
  const gruppen = new Map<string, Treffer[]>();
  for (const t of treffer) {
    const tag = tagSchluessel(t.termin.start);
    const titel = tag < naechsterMontag ? "Diese Woche" : tag < uebernaechsterMontag ? "Nächste Woche" : formatMonat(t.termin.start);
    gruppen.set(titel, [...(gruppen.get(titel) ?? []), t]);
  }
  return [...gruppen].map(([titel, liste]) => ({ titel, treffer: liste }));
}

// ---------- Aktive Filter als entfernbare Chips ----------

export type AktiverFilter = { id: string; text: string; ohne: ElternFilter };

export function aktiveFilter(f: ElternFilter, namen: { themen: Record<string, string>; quellen: Record<string, string> }): AktiverFilter[] {
  const liste: AktiverFilter[] = [];
  const dazu = (id: string, text: string, ohne: Partial<ElternFilter>) => liste.push({ id, text, ohne: { ...f, ...ohne } });
  if (f.suche.trim()) dazu("suche", `„${f.suche.trim()}“`, { suche: "" });
  for (const t of f.themen) dazu(`thema-${t}`, namen.themen[t] ?? t, { themen: f.themen.filter((x) => x !== t) });
  if (f.alter !== undefined) dazu("alter", `${f.alter} Jahre`, { alter: undefined });
  if (f.zeitraum !== "alle") dazu("zeitraum", f.zeitraum === "woche" ? "Nächste 7 Tage" : "Nächster Monat", { zeitraum: "alle" });
  if (f.tag) dazu("tag", tagText(f.tag), { tag: undefined });
  if (f.wochentage !== "alle") dazu("wochentage", WOCHENTAGE_TEXT[f.wochentage], { wochentage: "alle" });
  for (const z of f.tageszeiten) dazu(`zeit-${z}`, TAGESZEIT_TEXT[z], { tageszeiten: f.tageszeiten.filter((x) => x !== z) });
  for (const q of f.quellen) dazu(`quelle-${q}`, namen.quellen[q] ?? q, { quellen: f.quellen.filter((x) => x !== q) });
  for (const art of f.arten) dazu(`art-${art}`, ART_TEXT[art], { arten: f.arten.filter((x) => x !== art) });
  for (const z of f.zielgruppen) dazu(`fuer-${z}`, `Für ${ZIELGRUPPE_TEXT[z]}`, { zielgruppen: f.zielgruppen.filter((x) => x !== z) });
  if (f.nurKostenlos) dazu("kostenlos", "Kostenlos", { nurKostenlos: false });
  if (f.nurFrei) dazu("frei", "Freie Plätze", { nurFrei: false });
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

export function preisText(a: Angebot): string {
  if (a.kosten.euro === 0) return "Kostenlos";
  if (a.kosten.text === "siehe Anbieter") return "Preis beim Anbieter";
  return a.kosten.text;
}

/**
 * Alter ehrlich anzeigen: Fehlt es, steht dort „Alter unklar“ – nie ein geschätzter Wert.
 * Angebote nur für Erwachsene (Eltern, Fachkräfte, Familien) nennen stattdessen die Zielgruppe.
 */
export function alterHinweis(a: Angebot): { text: string; unklar: boolean } {
  if (hatAltersangabe(a)) return { text: alterText(a), unklar: false };
  if (a.zielgruppen.some((z) => z !== "kinder" && z !== "teens")) return { text: alterText(a), unklar: false };
  return { text: "Alter unklar", unklar: true };
}

function alterSpanne(min: number | null, max: number | null): string {
  if (min !== null && max !== null) return `${min}–${max} Jahre`;
  if (min !== null) return `ab ${min} Jahren`;
  if (max !== null) return `bis ${max} Jahre`;
  return "Alter unklar";
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
export function kindWuensche(ids: string[], angebote: Angebot[], events: LiveEvent[], einrichtungen: Record<string, string>, jetzt: Date): Wunsch[] {
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
        alter: alterSpanne(e.ageMin, e.ageMax),
        preis: isFree(e) ? "Kostenlos" : e.cost ?? "Preis beim Anbieter",
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
      alter: alterHinweis(a).text,
      preis: preisText(a),
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
