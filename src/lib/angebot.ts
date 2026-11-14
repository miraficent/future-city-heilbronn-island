import { z } from "zod";

export const ARTEN = ["kurs", "workshop", "veranstaltung", "ferienprogramm", "vortrag"] as const;
export const ZIELGRUPPEN = ["kinder", "teens", "eltern", "familien", "fachkraefte", "erwachsene"] as const;
export const STATUS = ["frei", "wenige", "ausgebucht", "unbekannt"] as const;

export const TerminSchema = z.object({
  start: z.string(),
  ende: z.string().optional(),
});

export const OrtSchema = z.object({
  name: z.string(),
  adresse: z.string().optional(),
  lat: z.number().optional(),
  lon: z.number().optional(),
  online: z.boolean(),
});

export const AngebotSchema = z.object({
  id: z.string().min(1),
  quelle: z.string().min(1),
  titel: z.string().min(1),
  teaser: z.string(),
  url: z.url(),
  bild: z.url().optional(),
  themen: z.array(z.string()).min(1),
  art: z.enum(ARTEN),
  zielgruppen: z.array(z.enum(ZIELGRUPPEN)),
  alterMin: z.number().int().optional(),
  alterMax: z.number().int().optional(),
  termine: z.array(TerminSchema).min(1),
  ort: OrtSchema,
  kosten: z.object({ euro: z.number().nullable(), text: z.string() }),
  status: z.enum(STATUS),
  sicherheit: z.number().min(0).max(1),
  ausloeser: z.array(z.string()),
  erstmalsGesehen: z.string(),
});

export type Termin = z.infer<typeof TerminSchema>;
export type Ort = z.infer<typeof OrtSchema>;
export type Angebot = z.infer<typeof AngebotSchema>;
export type Art = (typeof ARTEN)[number];
export type Zielgruppe = (typeof ZIELGRUPPEN)[number];
export type Status = (typeof STATUS)[number];

/** Rohdaten, wie ein Adapter sie liefert – noch ohne Themen, Zielgruppen und Alter. */
export type RohAngebot = {
  externeId: string;
  titel: string;
  beschreibung: string;
  url: string;
  bild?: string;
  termine: Termin[];
  ort?: Partial<Ort> & { name: string };
  kostenEuro?: number | null;
  kostenText?: string;
  status?: Status;
  /** Kategorien, Zielgruppen, Schlagwörter der Quelle – Rohmaterial für die Klassifizierung. */
  quellTags: string[];
  artHinweis?: string;
};

export type Quelle = {
  id: string;
  name: string;
  website: string;
  adapter: string;
  startUrls: string[];
  farbe: string;
  adresse: string;
};

export type Thema = {
  id: string;
  name: string;
  /** Einfacher Name für den Kinder-Modus, z. B. „Code-Planet“. */
  kindername?: string;
  symbol: string;
  /** Planetenfarbe als Hex-Wert; ohne Angabe wählt die App eine Farbe. */
  farbe?: string;
  schlagwoerter: string[];
};

export type Korrektur = {
  angebotId: string;
  aktion: "ausblenden" | "thema" | "alter" | "zielgruppe";
  wert: string;
};

export type QuellenBericht = {
  quelle: string;
  name: string;
  ok: boolean;
  fehler?: string;
  anzahlRoh: number;
  anzahlAufgenommen: number;
  neu: string[];
  unsicher: string[];
  dauerMs: number;
};

export type Bericht = {
  erstellt: string;
  lesemodus?: "live" | "cache";
  quellen: QuellenBericht[];
  gesamt: number;
};
