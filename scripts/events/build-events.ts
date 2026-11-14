/**
 * Die ganze Event-Pipeline:  npm run events:update   (mit Demo-Daten:  npm run events:demo)
 *
 *   sources.json → fetch.ts (abrufen) → enrich.ts (Kategorien, Alter, Kindertexte)
 *   → zusammenführen, Vergangenes weg, nach Datum sortieren → src/data/events.json
 *
 * Fällt eine Quelle aus, bleiben ihre letzten Events (mit künftigen Terminen) erhalten.
 * Fehler beenden die Pipeline nie mit einer kaputten events.json.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { LiveEvent } from "../../src/types";
import { reichereAn, inhaltsSchluessel } from "./enrich";
import { holeAlle } from "./fetch";
import { slug, type Source } from "./lib";
import { dummyEvents, echteDemoEvents } from "./seed-dummy";

const ZIEL = new URL("../../src/data/events.json", import.meta.url);
const QUELLEN: Source[] = JSON.parse(readFileSync(new URL("./sources.json", import.meta.url), "utf8"));
const TAGE_VORAUS = 90;
const demo = process.argv.includes("--demo");

async function main() {
  const jetzt = new Date();
  const bis = new Date(jetzt.getTime() + TAGE_VORAUS * 86_400_000);
  const vorher: LiveEvent[] = existsSync(ZIEL) ? JSON.parse(readFileSync(ZIEL, "utf8")) : [];

  // 1. Abrufen
  const ergebnisse = await holeAlle(QUELLEN);
  const roh = ergebnisse
    .flatMap((r) => r.events)
    .filter((e) => new Date(e.end ?? e.start) >= jetzt && new Date(e.start) <= bis);

  // 2. Anreichern (nur neue/geänderte Inhalte gehen an die API)
  const anreicherung = await reichereAn(roh);

  // 3. Zusammenführen
  const stand = jetzt.toISOString().slice(0, 10);
  const neu = new Map<string, LiveEvent>();
  for (const e of roh) {
    const a = anreicherung.get(inhaltsSchluessel(e))!;
    const id = `${e.institutionId}-${slug(e.title)}-${e.start.slice(0, 16)}`;
    neu.set(id, {
      id,
      institutionId: e.institutionId,
      title: e.title,
      title_kids: a.title_kids,
      categories: a.categories,
      ageMin: a.ageMin,
      ageMax: a.ageMax,
      type: a.type,
      start: e.start,
      end: e.end,
      location: e.location,
      cost: e.cost,
      image: e.image,
      story_kids: a.story_kids,
      description_parents: e.text.slice(0, 600),
      registrationUrl: e.registrationUrl,
      sourceUrl: e.url,
      lastUpdated: stand,
      needsReview: a.needsReview,
      isDummy: false,
    });
  }

  // Ausgefallene Quellen: alte Events dieser Einrichtung behalten
  const ausgefallen = new Set(ergebnisse.filter((r) => r.fehler || r.events.length === 0).map((r) => r.quelle.institutionId));
  for (const alt of vorher) {
    if (!alt.isDummy && ausgefallen.has(alt.institutionId) && !neu.has(alt.id) && new Date(alt.end ?? alt.start) >= jetzt) {
      neu.set(alt.id, alt);
    }
  }

  // 4. Demo-Daten
  if (demo) {
    for (const e of [...echteDemoEvents(roh, jetzt), ...dummyEvents(jetzt)]) neu.set(e.id, e);
  }

  const events = [...neu.values()].sort((a, b) => a.start.localeCompare(b.start));
  writeFileSync(ZIEL, JSON.stringify(events, null, 2) + "\n");

  const pruefen = events.filter((e) => e.needsReview);
  console.log(`\n✓ ${events.length} Events → src/data/events.json  (${pruefen.length} zur Prüfung, ${events.filter((e) => e.isDummy).length} Demo)`);
  if (pruefen.length) console.log("  Zur Prüfung: in der App unter /pruefen/ oder im Feld needsReview.");
}

main().catch((fehler) => {
  // Nie mit Exit-Code 0 eine halbe Datei hinterlassen – events.json wurde dann gar nicht geschrieben
  console.error("✗ Pipeline abgebrochen:", fehler);
  process.exit(1);
});
