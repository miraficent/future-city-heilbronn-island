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
} as const satisfies Record<string, { name: string; varianten: number }>;

export type ModulId = keyof typeof MODULE;
const MODUL_IDS = Object.keys(MODULE) as [ModulId, ...ModulId[]];

export const HAUS_GRAFIKEN = ["code-labor", "forscherhaus", "spielewerkstatt", "ki-atelier"] as const;
/** Symbol auf Hausschild, Mini-Karte und Raketenleiste (siehe `ThemenSymbol`). */
export const HAUS_SYMBOLE = ["code", "strom", "level", "muster"] as const;
/** Interessen, auf die eine Aufgabe im Elternbericht einzahlt (`WUENSCHE` + „forschen“). */
export const INTERESSEN = ["coding", "gaming", "ki", "forschen"] as const;

export const AktivitaetSchema = z.object({
  titel: z.string().min(1),
  modul: z.enum(MODUL_IDS),
  variante: z.number().int().min(0).optional(),
});

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
      const max = MODULE[a.modul].varianten;
      if ((a.variante ?? 0) >= max) {
        ctx.addIssue({ code: "custom", path: ["aktivitaeten", i, "variante"], message: `Modul „${a.modul}“ kennt nur die Varianten 0–${max - 1}.` });
      }
    });
  });

export type Aktivitaet = z.infer<typeof AktivitaetSchema>;
export type Checkpoint = z.infer<typeof CheckpointSchema>;
export type HausGrafik = Checkpoint["grafik"];
export type HausSymbol = Checkpoint["symbol"];
