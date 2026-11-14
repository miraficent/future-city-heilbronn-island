import { z } from "zod";

/**
 * Lernhaus-Konfiguration („Checkpoint“). Jede Einrichtung beschreibt ihr Haus in
 * `konfiguration/checkpoints/<id>.json`: Name, Farbe, Gebäudegrafik, Geschichte und
 * welche Lernmodule in welcher Reihenfolge erscheinen.
 *
 * Diese Datei enthält nur Typen, die Modulliste und das Prüfschema. Zur Laufzeit
 * wird nichts validiert (die Spielwelt lädt die JSON-Dateien direkt); die Prüfung
 * läuft in `tests/lib/checkpoint.test.ts`, also bei `npm test`.
 */

/**
 * Wiederverwendbare Lernmodule. `varianten` = wie viele vorbereitete Inhalte das
 * Modul kennt; eine Aktivität wählt eine davon über `variante` (Standard 0).
 * Ein neues Modul braucht Code: einen Eintrag hier und eine Ansicht in
 * `src/components/spiel/lernaufgabe.tsx` (TypeScript erzwingt beides).
 */
export const MODULE = {
  "roboter-code": { name: "Roboter programmieren", varianten: 3 },
  "muster-wahl": { name: "Muster erkennen und prüfen", varianten: 3 },
  "material-wahl": { name: "Leiter oder Isolator", varianten: 1 },
  stromkreis: { name: "Stromkreis schalten", varianten: 1 },
  "energie-wahl": { name: "Solarenergie", varianten: 1 },
  "level-bau": { name: "Spiellevel bauen", varianten: 3 },
  /** Demo-Lektion: Folien und Abschlussfrage stehen vollständig in der Checkpoint-Datei. */
  lektion: { name: "Demo-Lektion", varianten: 1 },
} as const satisfies Record<string, { name: string; varianten: number }>;

export type ModulId = keyof typeof MODULE;
/** Module, deren Inhalt im Code vorbereitet ist; die Datei wählt nur Modul und Variante. */
const CODE_MODULE = Object.keys(MODULE).filter((m) => m !== "lektion") as [Exclude<ModulId, "lektion">, ...Exclude<ModulId, "lektion">[]];

/** Eingebaute Bildmotive (SVG, siehe `AufgabenBild`). */
export const MOTIVE = ["ball", "rad", "fenster", "block", "frage", "schild", "gruppe", "sonne", "mond", "metall", "holz", "gummi", "lampe", "batterie"] as const;
export type Motiv = (typeof MOTIVE)[number];

export const HAUS_GRAFIKEN = ["code-labor", "forscherhaus", "spielewerkstatt", "ki-atelier"] as const;
/** Symbol auf Hausschild, Mini-Karte und Raketenleiste (siehe `ThemenSymbol`). */
export const HAUS_SYMBOLE = ["code", "strom", "level", "muster"] as const;
/** Interessen, auf die eine Aufgabe im Elternbericht einzahlt (`WUENSCHE` + „forschen“). */
export const INTERESSEN = ["coding", "gaming", "ki", "forschen"] as const;

const text = z.string().min(1);

const FolieSchema = z
  .object({
    titel: text,
    /** Text ab 9 Jahren. */
    text,
    /** Optional kürzerer Text für 6–8 Jahre. */
    kurz: text.optional(),
    motiv: z.enum(MOTIVE).optional(),
    /** Eigenes Bild der Einrichtung, lokal unter `public/medien/` abgelegt. Kein externer Link. */
    bild: z.string().regex(/^\/medien\/[\w./-]+\.(png|jpe?g|webp|svg)$/).optional(),
    /** Pflicht bei `bild`: kurze Bildbeschreibung für Screenreader. */
    alt: text.optional(),
  })
  .refine((f) => !(f.bild && f.motiv), { message: "Eine Folie hat entweder `bild` oder `motiv`, nicht beides." })
  .refine((f) => !f.bild || f.alt, { message: "Ein eigenes Bild braucht `alt` (Bildbeschreibung)." });

const FrageSchema = z
  .object({
    frage: text,
    optionen: z.array(z.object({ id: text, titel: text, motiv: z.enum(MOTIVE), farbe: z.string().regex(/^#[0-9a-f]{6}$/i).optional() })).min(2),
    antworten: z.array(text).min(1),
    tipp: text,
    wissen: text,
  })
  .refine((f) => f.antworten.every((a) => f.optionen.some((o) => o.id === a)), { message: "Jede Antwort muss eine `id` aus `optionen` sein." });

const ModulAktivitaetSchema = z.strictObject({
  titel: text,
  modul: z.enum(CODE_MODULE),
  variante: z.number().int().min(0).optional(),
});

const LektionSchema = z.strictObject({
  titel: text,
  modul: z.literal("lektion"),
  folien: z.array(FolieSchema).min(1).max(8),
  /** Ohne Abschlussfrage gilt die Lektion nach der letzten Folie als geschafft. */
  abschlussfrage: FrageSchema.optional(),
});

export const AktivitaetSchema = z.discriminatedUnion("modul", [ModulAktivitaetSchema, LektionSchema]);

export const CheckpointSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    name: z.string().min(1),
    titel: z.string().min(1),
    kurz: z.string().min(1),
    farbe: z.string().regex(/^#[0-9a-f]{6}$/i),
    /** Thema aus `konfiguration/themen.csv`, nach dem die echten Kurse im Haus gefiltert werden. */
    thema: z.string().min(1),
    interesse: z.enum(INTERESSEN),
    symbol: z.enum(HAUS_SYMBOLE),
    grafik: z.enum(HAUS_GRAFIKEN),
    /** Raketenteil, das dieses Haus beisteuert. */
    teil: z.string().min(1),
    geschichte: z.object({ klein: z.string().min(1), gross: z.string().min(1) }),
    aktivitaeten: z.array(AktivitaetSchema).min(1),
  })
  .superRefine((c, ctx) => {
    c.aktivitaeten.forEach((a, i) => {
      if (a.modul === "lektion") return;
      const max = MODULE[a.modul].varianten;
      if ((a.variante ?? 0) >= max) {
        ctx.addIssue({ code: "custom", path: ["aktivitaeten", i, "variante"], message: `Modul „${a.modul}“ kennt nur die Varianten 0–${max - 1}.` });
      }
    });
  });

export type Aktivitaet = z.infer<typeof AktivitaetSchema>;
export type Lektion = z.infer<typeof LektionSchema>;
export type Checkpoint = z.infer<typeof CheckpointSchema>;
export type HausGrafik = Checkpoint["grafik"];
export type HausSymbol = Checkpoint["symbol"];
