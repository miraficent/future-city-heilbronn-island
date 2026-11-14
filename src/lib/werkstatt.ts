import { z } from "zod";
import { CheckpointSchema, type Checkpoint } from "./checkpoint";

/*
 * Prüflogik der Lernhaus-Werkstatt (/werkstatt/): dieselbe Validierung wie in
 * tests/lib/checkpoint.test.ts, plus verständliche Pfade für die Fehlerliste.
 * Nur die Werkstatt importiert diese Datei – zod landet nicht im Spiel-Bundle.
 */

// Deutsche Fehlermeldungen von zod – nur auf dieser Seite geladen.
z.config(z.locales.de());

/** Ausgangspunkt für eine neue Einrichtung: zeigt eine Lektion und ein Code-Modul. */
export const VORLAGE: Checkpoint = {
  id: "neue-einrichtung",
  name: "Neue Einrichtung",
  titel: "Unser Lernhaus",
  kurz: "Lernhaus",
  farbe: "#7bbfc4",
  thema: "coding",
  interesse: "forschen",
  symbol: "strom",
  grafik: "forscherhaus",
  teil: "Neues Teil",
  geschichte: { klein: "Komm rein und probier es aus!", gross: "Willkommen in unserem Lernhaus. Hier zeigen wir, was man bei uns entdecken kann." },
  aktivitaeten: [
    {
      titel: "Was machen wir hier?",
      modul: "lektion",
      folien: [
        { titel: "Willkommen", text: "Bei uns kannst du forschen, bauen und ausprobieren.", kurz: "Hier darfst du forschen und bauen.", motiv: "frage" },
        { titel: "Ausprobieren", text: "Fehler sind erlaubt. Wer etwas ausprobiert, lernt dabei am meisten.", motiv: "lampe" },
      ],
      abschlussfrage: {
        frage: "Was ist beim Ausprobieren erlaubt?",
        optionen: [
          { id: "fehler", titel: "Fehler machen", motiv: "lampe" },
          { id: "nichts", titel: "Gar nichts", motiv: "mond" },
        ],
        antworten: ["fehler"],
        tipp: "Schau dir die zweite Folie noch einmal an.",
        wissen: "Beim Experimentieren gehören Fehlversuche dazu.",
      },
    },
    { titel: "Muster entdecken", modul: "muster-wahl", variante: 0 },
  ],
};

export type Fehler = { pfad: string; meldung: string };
export type Ergebnis = { checkpoint?: Checkpoint; fehler: Fehler[] };

export const alsText = (c: Checkpoint) => JSON.stringify(c, null, 2) + "\n";

export function pfadText(pfad: PropertyKey[]): string {
  return pfad.map((teil) => (typeof teil === "number" ? `[${teil}]` : `.${String(teil)}`)).join("").replace(/^\./, "") || "(gesamte Datei)";
}

export function pruefe(text: string, themen: string[]): Ergebnis {
  let roh: unknown;
  try {
    roh = JSON.parse(text);
  } catch (e) {
    return { fehler: [{ pfad: "JSON", meldung: `Die Datei ist kein gültiges JSON: ${(e as Error).message}` }] };
  }
  const ergebnis = CheckpointSchema.safeParse(roh);
  if (!ergebnis.success) return { fehler: ergebnis.error.issues.map((i) => ({ pfad: pfadText(i.path), meldung: i.message })) };
  if (!themen.includes(ergebnis.data.thema)) {
    return { fehler: [{ pfad: "thema", meldung: `Unbekanntes Thema. Erlaubt sind: ${themen.join(", ")} (siehe konfiguration/themen.csv).` }] };
  }
  return { checkpoint: ergebnis.data, fehler: [] };
}

