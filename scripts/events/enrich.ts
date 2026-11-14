/**
 * Schritt 2: Kategorien, Alter, Art und Kindertexte ergänzen.
 *
 * - Mit ANTHROPIC_API_KEY: Claude (claude-haiku-5-5) bekommt NUR den öffentlichen Event-Text
 *   und antwortet als streng geprüftes JSON (Zod). Unsicher (confidence < 0.7) oder ungültig → needsReview.
 * - Ohne Schlüssel: Stichwort-Zuordnung aus src/data/categories.json → immer needsReview.
 * - Ergebnisse liegen in scripts/events/cache.json. Schlüssel = Hash aus Titel + Text:
 *   ein neuer Termin derselben Veranstaltung wird nicht erneut an die API geschickt.
 * Die Pipeline stürzt hier nie ab – jeder Fehler endet im Fallback.
 */
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { z } from "zod";
import type { Category, CategoryId, EventType } from "../../src/types";
import { hash, type RawEvent } from "./lib";

const MODELL = "claude-haiku-5-5";
const MIN_SICHERHEIT = 0.7;
const CACHE_DATEI = new URL("./cache.json", import.meta.url);
const KATEGORIEN: Category[] = JSON.parse(readFileSync(new URL("../../src/data/categories.json", import.meta.url), "utf8"));
const KATEGORIE_IDS = KATEGORIEN.map((k) => k.id) as [CategoryId, ...CategoryId[]];

export type Anreicherung = {
  categories: CategoryId[];
  ageMin: number | null;
  ageMax: number | null;
  type: EventType;
  title_kids: string;
  story_kids: string;
  needsReview: boolean;
  /** "claude" oder "stichworte" – steht im Cache, damit man sieht, woher es kommt */
  quelle: "claude" | "stichworte";
};

const AntwortSchema = z.object({
  categories: z.array(z.enum(KATEGORIE_IDS)),
  ageMin: z.number().int().nullable(),
  ageMax: z.number().int().nullable(),
  type: z.enum(["workshop", "show", "course", "event"]),
  title_kids: z.string(),
  story_kids: z.string(),
  confidence: z.number(),
});

const SYSTEM = `Du ordnest öffentliche Veranstaltungen aus Heilbronn für eine Kinder-App ein.
Du bekommst nur den öffentlichen Text einer Veranstaltung. Antworte ausschließlich mit dem verlangten JSON.

Regeln:
- Nutze nur Fakten aus dem Text. Erfinde nichts (kein Alter, keinen Inhalt, keinen Preis).
- categories: 1 bis 3 passende IDs aus: ${KATEGORIEN.map((k) => `${k.id} (${k.label_kids})`).join(", ")}.
- ageMin/ageMax: nur wenn der Text ein Alter oder eine Klassenstufe nennt (Klasse 1 ≈ 6 Jahre). Sonst null.
  Richtet sich die Veranstaltung an Erwachsene, Lehrkräfte oder Fachkräfte, setze ageMin auf 18.
- type: workshop (selbst mitmachen), show (zuschauen, z. B. Planetarium), course (mehrere Termine), event (sonstiges).
- title_kids: kurzer Titel für Kinder, höchstens 6 Wörter.
- story_kids: höchstens 2 Sätze in einfachem Deutsch für Kinder von 6 bis 12 Jahren, höchstens 12 Wörter pro Satz.
  Sprich das Kind mit „du“ an. Keine Namen von Personen, keine Kontaktdaten.
- confidence: 0 bis 1 – wie sicher du dir bei Kategorien und Alter bist.`;

// ---------- Fallback ohne KI ----------

const ALTER_SPANNE = /(\d{1,2})\s*-?\s*(?:-|–|bis)\s*(\d{1,2})\s*-?\s*(?:jahr|jährig|j\.)/i;
const ALTER_AB = /\bab\s*(\d{1,2})\s*(?:jahr|j\b|j\.)/i;
const KLASSE = /(?:\bklassen?(?:stufe)?|\bkl\.)\s*(\d{1,2})\s*(?:-|–|bis)\s*(\d{1,2})/i;

function alterAusText(text: string): [number | null, number | null] {
  let m;
  if ((m = text.match(ALTER_SPANNE))) return [Number(m[1]), Number(m[2])];
  if ((m = text.match(KLASSE))) return [Number(m[1]) + 5, Number(m[2]) + 6];
  if ((m = text.match(ALTER_AB))) return [Number(m[1]), null];
  return [null, null];
}

export function stichwortZuordnung(e: RawEvent): Anreicherung {
  const text = `${e.title} ${e.text}`.toLowerCase();
  const categories = KATEGORIEN.filter((k) => k.keywords.some((w) => text.includes(w))).map((k) => k.id).slice(0, 3);
  const [ageMin, ageMax] = alterAusText(`${e.title} ${e.text}`);
  const type: EventType =
    /3d|show|live|planetarium|science dome|film/i.test(text) ? "show"
    : /workshop|werkstatt|labor|mitmach/i.test(text) ? "workshop"
    : /kurs|juniorakademie/i.test(text) ? "course"
    : "event";
  return {
    categories,
    ageMin,
    ageMax,
    type,
    title_kids: e.title.split(/\s[–(-]\s?/)[0]!.split(" ").slice(0, 6).join(" "),
    story_kids: "",
    needsReview: true,
    quelle: "stichworte",
  };
}

// ---------- Prüfung der Kindertexte ----------

function kindertextOk(story: string): boolean {
  const saetze = story.split(/(?<=[.!?])\s+/).filter(Boolean);
  return saetze.length >= 1 && saetze.length <= 2 && saetze.every((s) => s.split(/\s+/).length <= 12);
}

// ---------- Claude ----------

async function mitClaude(client: Anthropic, e: RawEvent): Promise<Anreicherung> {
  try {
    const antwort = await client.messages.parse({
      model: MODELL,
      max_tokens: 4000,
      system: SYSTEM,
      output_config: { effort: "low", format: zodOutputFormat(AntwortSchema) },
      messages: [{ role: "user", content: `Titel: ${e.title}\nOrt: ${e.location}\nPreis: ${e.cost ?? "unbekannt"}\n\nText:\n${e.text}` }],
    });
    if (antwort.stop_reason === "refusal" || !antwort.parsed_output) return stichwortZuordnung(e);
    const a = antwort.parsed_output;
    const unsicher =
      a.confidence < MIN_SICHERHEIT ||
      a.categories.length === 0 ||
      !kindertextOk(a.story_kids) ||
      (a.ageMin !== null && a.ageMax !== null && a.ageMin > a.ageMax);
    return {
      categories: [...new Set(a.categories)].slice(0, 3),
      ageMin: a.ageMin,
      ageMax: a.ageMax,
      type: a.type,
      title_kids: a.title_kids,
      story_kids: a.story_kids,
      needsReview: unsicher,
      quelle: "claude",
    };
  } catch (fehler) {
    if (fehler instanceof Anthropic.AuthenticationError) throw fehler; // falscher Schlüssel: ganz auf Fallback umschalten
    console.warn(`  ! Claude für „${e.title}“: ${(fehler as Error).message} → Stichwörter`);
    return stichwortZuordnung(e);
  }
}

/**
 * Reichert alle Events an. Gleiche Inhalte (Titel + Text) werden nur einmal bearbeitet.
 * Gibt eine Map Inhalts-Hash → Anreicherung zurück.
 */
export async function reichereAn(events: RawEvent[]): Promise<Map<string, Anreicherung>> {
  const cache: Record<string, Anreicherung> = existsSync(CACHE_DATEI) ? JSON.parse(readFileSync(CACHE_DATEI, "utf8")) : {};
  let client: Anthropic | null = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;
  if (!client) console.log("ℹ Kein ANTHROPIC_API_KEY – Stichwort-Zuordnung, alles wird zur Prüfung markiert.");

  const ergebnis = new Map<string, Anreicherung>();
  let neu = 0;
  for (const e of events) {
    const schluessel = hash(e.title, e.text);
    if (ergebnis.has(schluessel)) continue;
    // Stichwort-Ergebnisse aus dem Cache werden mit Schlüssel neu versucht
    const alt = cache[schluessel];
    if (alt && (alt.quelle === "claude" || !client)) {
      ergebnis.set(schluessel, alt);
      continue;
    }
    let a: Anreicherung;
    try {
      a = client ? await mitClaude(client, e) : stichwortZuordnung(e);
    } catch {
      console.warn("✗ API-Schlüssel ungültig – weiter mit Stichwörtern.");
      client = null;
      a = stichwortZuordnung(e);
    }
    ergebnis.set(schluessel, a);
    cache[schluessel] = a;
    neu++;
  }
  writeFileSync(CACHE_DATEI, JSON.stringify(cache, null, 2) + "\n");
  console.log(`✓ Anreicherung: ${ergebnis.size} Inhalte, davon ${neu} neu bearbeitet`);
  return ergebnis;
}

export const inhaltsSchluessel = (e: RawEvent) => hash(e.title, e.text);
