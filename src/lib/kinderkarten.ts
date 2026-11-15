/**
 * Ein gemeinsames Format für alles, was Kinder auf Karte und Einrichtungsseiten sehen –
 * egal ob es aus den Kursen (daten/angebote.json) oder den Live-Events (Mobilizon, src/lib/mobilizon.ts) kommt.
 * Sicherheit: nur über fuerModus("kind") bzw. isForKids() – nie eigene Filter.
 */
import type { Angebot } from "./angebot";
import { fuerModus } from "./entdecken";
import { naechsterStart } from "./filter";
import { isForKids, isFree } from "./events";
import type { CategoryId, EventType, KinderTexte, LiveEvent } from "@/types";

export type KinderKarte = {
  /** Kurs-ID oder "ev:" + Event-ID – dieselbe ID landet im Wunsch-Rucksack */
  id: string;
  institutionId: string;
  titel: string;
  kategorien: CategoryId[];
  start: string;
  ageMin: number | null;
  ageMax: number | null;
  gratis: boolean;
  /** Kurzer Text, den die Eule vorliest (deutsch; Rückfall, wenn kein Eule-Kommentar da ist) */
  geschichte: string;
  /** Kindertitel und -satz je Sprache aus den Kommentaren von eule/owl – Auswahl über kartenText() */
  texte: KinderTexte;
  anmeldeUrl: string;
  /** Titelbild des Events (nur eigene Mobilizon-Instanz), sonst null → Farbe der Kategorie */
  bild: string | null;
  beispiel: boolean;
  /** Art der Veranstaltung (Mitmachen, Show, Kurs …) – für „Was erwartet dich?“; bei Kursen unbekannt */
  art: EventType | null;
};

/** Themen der Kurse (konfiguration/themen.csv) → Kategorien der Kinder-Ansicht */
const THEMA_ZU_KATEGORIE: Record<string, CategoryId> = { ki: "it", coding: "coding", gaming: "gaming" };

/** Erster Satz, höchstens ~18 Wörter – Kurs-Texte sind für Erwachsene geschrieben */
function ersterSatz(text: string): string {
  const satz = text.split(/(?<=[.!?])\s+/)[0] ?? "";
  const woerter = satz.split(/\s+/);
  return woerter.length > 18 ? woerter.slice(0, 18).join(" ") + " …" : satz;
}

export function ausAngebot(a: Angebot, jetzt: Date): KinderKarte {
  const start = naechsterStart(a, jetzt);
  return {
    id: a.id,
    institutionId: a.quelle,
    titel: a.titel.replace(/\s*\((?:ab\s)?\d.*?\)\s*$/i, ""), // „(8–11 Jahre)“ steht schon im Alters-Abzeichen
    kategorien: [...new Set(a.themen.map((t) => THEMA_ZU_KATEGORIE[t]).filter((k): k is CategoryId => Boolean(k)))],
    start: new Date(Number.isFinite(start) ? start : Date.parse(a.termine[0]!.start)).toISOString(),
    ageMin: a.alterMin ?? null,
    ageMax: a.alterMax ?? null,
    gratis: a.kosten.euro === 0,
    geschichte: ersterSatz(a.teaser) || a.titel,
    anmeldeUrl: a.url,
    bild: null,
    beispiel: false,
    art: null,
    texte: {},
  };
}

export function ausEvent(e: LiveEvent): KinderKarte {
  return {
    id: `ev:${e.id}`,
    institutionId: e.institutionId,
    titel: e.title_kids || e.title,
    kategorien: e.categories,
    start: e.start,
    ageMin: e.ageMin,
    ageMax: e.ageMax,
    gratis: isFree(e),
    // Ohne Kindertext bleibt die Geschichte leer – die Oberfläche bildet dann einen Satz (kinderGeschichte)
    geschichte: e.story_kids,
    anmeldeUrl: e.registrationUrl,
    bild: e.image,
    beispiel: e.isDummy,
    art: e.type,
    // ?? {}: Events aus einem Sitzungsspeicher von vor diesem Feld haben noch kein `kinder`
    texte: e.kinder ?? {},
  };
}

/** Karten aus Live-Events: nur was isForKids() erlaubt und noch nicht vorbei ist. Läuft im Browser (Mobilizon). */
export function eventKarten(events: LiveEvent[], jetzt: Date): KinderKarte[] {
  return events
    .filter(isForKids)
    .filter((e) => new Date(e.end ?? e.start).getTime() >= jetzt.getTime())
    .map(ausEvent);
}

/** Kurs- und Event-Karten zusammen, kommende zuerst */
export function mischeKarten(...listen: KinderKarte[][]): KinderKarte[] {
  return listen.flat().sort((x, y) => x.start.localeCompare(y.start));
}

/** Alle Karten, die Kinder sehen dürfen, kommende zuerst. */
export function kinderKarten(angebote: Angebot[], events: LiveEvent[], jetzt: Date): KinderKarte[] {
  const ausKursen = fuerModus(angebote, "kind")
    .filter((a) => Number.isFinite(naechsterStart(a, jetzt)))
    .map((a) => ausAngebot(a, jetzt));
  return mischeKarten(ausKursen, eventKarten(events, jetzt));
}

/** Passt eine Karte zum Alter des Kindes? (ohne Alter: alles) */
export function passtZumAlter(k: KinderKarte, alter: number | null): boolean {
  return alter === null || ((k.ageMin ?? 0) <= alter && alter <= (k.ageMax ?? 99));
}

/**
 * Karten eines Ortes. COSMOS zeigt nur, was zu keiner anderen Einrichtung gehört:
 * Events ohne erkannte Einrichtung bekommen in erkenneEinrichtung() die Kennung „cosmos“.
 */
export function kartenFuerOrt(karten: KinderKarte[], ortId: string): KinderKarte[] {
  return karten.filter((k) => k.institutionId === ortId);
}

export function istHeute(k: KinderKarte, jetzt: Date): boolean {
  const tag = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
  return tag(new Date(k.start)) === tag(jetzt);
}

export function istAbends(k: KinderKarte): boolean {
  const teil = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", hour: "numeric", hourCycle: "h23" })
    .formatToParts(new Date(k.start))
    .find((p) => p.type === "hour");
  return Number(teil?.value) >= 17;
}
