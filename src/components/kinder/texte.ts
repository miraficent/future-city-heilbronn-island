/**
 * Alle festen Texte des Kinderbereichs auf Deutsch und Englisch (kurz, du-Form, für 6–14).
 * Englisch hat dieselbe Form (`typeof DE`) – fehlt ein Text, meldet TypeScript das.
 * Texte der Anbieter und Kategorienamen aus den Daten bleiben unverändert; englische Themen-Namen stehen hier.
 */
import { useSprache } from "@/components/ui/sprache";
import type { Category, CategoryId, EventType, Sprache } from "@/types";

type Kachel = { titel: string; wann: string; alter: string; gratis: boolean; gewuenscht: boolean };

const DE = {
  karte: {
    karteVon: "Karte von Heilbronn",
    ortLabel: (name: string, zahl: number, geladen: boolean, heute: boolean) =>
      `${name}${zahl ? `: ${zahl} Veranstaltungen` : geladen ? ": schläft gerade, keine Veranstaltungen" : ""}${heute ? ", heute ist etwas los" : ""}`,
    neuerOrt: "Neuer Ort?",
    neuerOrtLabel: "Neuer Ort? Hier kann eine neue Einrichtung dazukommen",
    euleOeffnen: "Eule öffnen",
    wieAlt: "Hallo! Ich bin die Eule. Wie alt bist du?",
    werBistDu: "Super! Wer bist du? Such dir eine Figur aus.",
    eigeneFigurBauen: "Eigene Figur bauen",
    hallo: (wochentag: string | null) => `Hey! Heute ist ${wochentag ?? "ein schöner Tag"}. Wohin willst du?`,
    alterAendern: "Alter ändern",
    figurAendern: "Figur ändern",
    figurBauen: "Figur bauen",
  },
  welt: {
    zurKarte: "Zur Karte",
    laedt: "Veranstaltungen werden geladen …",
    themen: "Themen",
    alles: "Alles",
    leer: "Hier ist gerade nichts – schau mal in einem anderen Haus!",
    angeboteBei: (ort: string) => `Angebote bei ${ort}`,
    kachel: (k: Kachel) => `${k.titel}, ${k.wann}, ${k.alter} Jahre${k.gratis ? ", gratis" : ""}${k.gewuenscht ? ", gewünscht" : ""}`,
    ab: (alter: number | null) => `ab ${alter ?? ""}`,
    alterKurz: (alter: string) => `${alter} J.`,
    jahre: (alter: string) => `${alter} Jahre`,
    vorherige: "Vorherige Kacheln",
    weitere: "Weitere Kacheln",
    uhrzeit: (zeit: string) => `${zeit} Uhr`,
    gratis: "gratis",
    wunsch: "Da will ich hin!",
    gewuenscht: "Deine Eltern sehen es!",
    andere: "Andere ansehen",
    erwartet: "Was erwartet dich?",
    art: { workshop: "Selbst machen", show: "Zuschauen", course: "Mehrere Treffen", event: "Vorbeikommen" } as Record<EventType, string>,
    mitFamilie: "Mit Familie",
    kostenlos: "Kostenlos",
    /** Kurzer Themen-Name (Knopf) und ganzer Name (Vorlesen) */
    thema: (c: Category) => c.label_kids.split(" & ")[0]!,
    themaLang: (c: Category) => c.label_kids,
  },
  live: {
    fehlerKind: "Die Veranstaltungen konnten gerade nicht geladen werden. Versuch es gleich noch einmal.",
    fehlerEltern: "Die Live-Veranstaltungen (Mobilizon) sind gerade nicht erreichbar. Bitte später neu laden.",
  },
  figur: {
    anleitung: "Bau dir deine Figur! Tippe auf die Farben. Dann auf Fertig.",
    titel: "Deine Figur bauen",
    ueberschrift: "Bau dir deine Figur!",
    vorlesen: "Vorlesen",
    haut: "Haut",
    frisur: "Frisur",
    haare: "Haare",
    augen: "Augen",
    gesicht: "Gesicht",
    pulli: "Pulli",
    hose: "Hose",
    schuhe: "Schuhe",
    tasche: "Tasche",
    keineTasche: "Keine Tasche",
    zufall: "Zufall",
    zufaelligeFigur: "Zufällige Figur",
    fertig: "Fertig!",
    eigeneFigur: "Eigene Figur",
    figuren: {
      lila: "Kind mit lila Pulli und oranger Tasche",
      tuerkis: "Kind mit Zöpfen und türkisem Pulli",
      orange: "Kind mit Locken und orangem Pulli",
    },
  },
};

/** Englische Themen-Namen (die Kategorien in src/data/categories.json sind deutsch) */
const THEMA_EN: Record<CategoryId, [kurz: string, lang: string]> = {
  astronomy: ["Space", "Stars and space"],
  physics: ["Physics", "Physics and experiments"],
  biology: ["Nature", "Nature and animals"],
  math: ["Maths", "Maths and puzzles"],
  it: ["Computers", "Computers and AI"],
  coding: ["Coding", "Coding"],
  gaming: ["Games", "Making games"],
  art: ["Art", "Art and crafts"],
  family: ["Family", "With your family"],
};

const EN: typeof DE = {
  karte: {
    karteVon: "Map of Heilbronn",
    ortLabel: (name, zahl, geladen, heute) =>
      `${name}${zahl ? `: ${zahl} events` : geladen ? ": sleeping right now, no events" : ""}${heute ? ", something is on today" : ""}`,
    neuerOrt: "New place?",
    neuerOrtLabel: "New place? A new organisation can join here",
    euleOeffnen: "Open owl",
    wieAlt: "Hello! I am the owl. How old are you?",
    werBistDu: "Great! Who are you? Pick a figure.",
    eigeneFigurBauen: "Build your own figure",
    hallo: (wochentag) => `Hey! Today is ${wochentag ?? "a lovely day"}. Where do you want to go?`,
    alterAendern: "Change age",
    figurAendern: "Change figure",
    figurBauen: "Build figure",
  },
  welt: {
    zurKarte: "To the map",
    laedt: "Loading events …",
    themen: "Topics",
    alles: "Everything",
    leer: "Nothing here right now – take a look in another house!",
    angeboteBei: (ort) => `Things to do at ${ort}`,
    kachel: (k) => `${k.titel}, ${k.wann}, ${k.alter} years${k.gratis ? ", free" : ""}${k.gewuenscht ? ", on your wish list" : ""}`,
    ab: (alter) => `${alter ?? ""}+`,
    alterKurz: (alter) => `${alter} yrs`,
    jahre: (alter) => `${alter} years`,
    vorherige: "Previous tiles",
    weitere: "More tiles",
    uhrzeit: (zeit) => zeit,
    gratis: "free",
    wunsch: "I want to go there!",
    gewuenscht: "Your parents can see it!",
    andere: "See others",
    erwartet: "What can you expect?",
    art: { workshop: "Do it yourself", show: "Watch", course: "Several meetings", event: "Drop by" },
    mitFamilie: "With family",
    kostenlos: "Free",
    thema: (c) => THEMA_EN[c.id]?.[0] ?? c.label_kids,
    themaLang: (c) => THEMA_EN[c.id]?.[1] ?? c.label_kids,
  },
  live: {
    fehlerKind: "The events could not be loaded right now. Try again in a moment.",
    fehlerEltern: "The live events (Mobilizon) cannot be reached right now. Please reload later.",
  },
  figur: {
    anleitung: "Build your figure! Tap the colours. Then tap Done.",
    titel: "Build your figure",
    ueberschrift: "Build your figure!",
    vorlesen: "Read aloud",
    haut: "Skin",
    frisur: "Hairstyle",
    haare: "Hair",
    augen: "Eyes",
    gesicht: "Face",
    pulli: "Jumper",
    hose: "Trousers",
    schuhe: "Shoes",
    tasche: "Bag",
    keineTasche: "No bag",
    zufall: "Surprise",
    zufaelligeFigur: "Surprise figure",
    fertig: "Done!",
    eigeneFigur: "Your own figure",
    figuren: {
      lila: "Kid with a purple jumper and an orange bag",
      tuerkis: "Kid with braids and a turquoise jumper",
      orange: "Kid with curls and an orange jumper",
    },
  },
};

export const KINDER_TEXTE: Record<Sprache, typeof DE> = { de: DE, en: EN };

/** Texte des Kinderbereichs in der gewählten Sprache */
export function useKinderTexte() {
  return KINDER_TEXTE[useSprache()];
}
