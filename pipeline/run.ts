import { readFile, writeFile, mkdir } from "node:fs/promises";
import { AngebotSchema, type Angebot, type Bericht, type Quelle, type QuellenBericht, type RohAngebot } from "../src/lib/angebot";
import { ADAPTER } from "./adapters";
import { schreibeAbos } from "./ausgabe/abos";
import { ergaenzeKoordinaten } from "./geo";
import { erstelleHttp, type Http } from "./http";
import { ladeKonfiguration } from "./konfiguration";
import { wendeKorrekturenAn } from "./verarbeitung/korrekturen";
import { normalisiere } from "./verarbeitung/normalisieren";
import { fuehreZusammen, type QuellErgebnis } from "./verarbeitung/zusammenfuehren";

const DATEN = "daten";
const PFAD_ANGEBOTE = `${DATEN}/angebote.json`;
const PFAD_BERICHT = `${DATEN}/bericht.json`;
const PFAD_META = `${DATEN}/meta.json`;
const PFAD_GEO = `${DATEN}/geo-cache.json`;
const ORDNER_ABOS = "public/abo";
/** Unterhalb dieser Sicherheit erscheint ein Angebot erst nach Freigabe (Prüf-Seite). */
export const MIN_SICHERHEIT_OEFFENTLICH = 0.6;
const GEO_USER_AGENT = "COSMOS-Entdecker/0.1 (Hackathon-Prototyp Heilbronn)";
/** Entwicklerhilfe: ROH_CACHE=1 nutzt zuletzt geladene Rohdaten statt die Websites erneut abzufragen. */
const ORDNER_ROH = ".cache/roh";

async function ladeRoh(quelle: Quelle, http: Http): Promise<RohAngebot[]> {
  const pfad = `${ORDNER_ROH}/${quelle.id}.json`;
  if (process.env.ROH_CACHE === "1") {
    try {
      return JSON.parse(await readFile(pfad, "utf8")) as RohAngebot[];
    } catch {
      // kein Cache vorhanden → normal laden
    }
  }
  const adapter = ADAPTER[quelle.adapter];
  if (!adapter) throw new Error(`Kein Adapter "${quelle.adapter}"`);
  const roh = await adapter(quelle, http);
  await mkdir(ORDNER_ROH, { recursive: true });
  await writeFile(pfad, JSON.stringify(roh));
  return roh;
}

async function ladeAlteAngebote(): Promise<Angebot[]> {
  try {
    return JSON.parse(await readFile(PFAD_ANGEBOTE, "utf8")) as Angebot[];
  } catch {
    return [];
  }
}

async function main() {
  const jetzt = new Date();
  const heute = jetzt.toISOString().slice(0, 10);
  const { quellen, themen, korrekturen } = await ladeKonfiguration();
  const http = erstelleHttp();
  const alt = await ladeAlteAngebote();

  const ergebnisse: QuellErgebnis[] = [];
  const berichte: QuellenBericht[] = [];

  for (const quelle of quellen) {
    const beginn = Date.now();
    try {
      const roh = await ladeRoh(quelle, http);
      const normalisiert = roh.flatMap((r) => normalisiere(r, quelle, themen, jetzt) ?? []);
      const aufgenommen = wendeKorrekturenAn(normalisiert, korrekturen).filter((a) => a.themen.length > 0);
      ergebnisse.push({ quelle: quelle.id, angebote: aufgenommen });
      berichte.push({
        quelle: quelle.id,
        name: quelle.name,
        ok: true,
        anzahlRoh: roh.length,
        anzahlAufgenommen: aufgenommen.length,
        neu: [],
        unsicher: aufgenommen.filter((a) => a.sicherheit < MIN_SICHERHEIT_OEFFENTLICH).map((a) => a.id),
        dauerMs: Date.now() - beginn,
      });
      console.log(`✓ ${quelle.id}: ${roh.length} gelesen, ${aufgenommen.length} zu KI/Coding/Gaming`);
    } catch (e) {
      const fehler = e instanceof Error ? e.message : String(e);
      ergebnisse.push({ quelle: quelle.id, angebote: null });
      berichte.push({ quelle: quelle.id, name: quelle.name, ok: false, fehler, anzahlRoh: 0, anzahlAufgenommen: 0, neu: [], unsicher: [], dauerMs: Date.now() - beginn });
      console.error(`✗ ${quelle.id}: ${fehler} – letzte gute Daten bleiben erhalten`);
    }
  }

  const { angebote: zusammen, neu } = fuehreZusammen(ergebnisse, alt, heute, jetzt);
  for (const b of berichte) b.neu = neu.get(b.quelle) ?? [];

  await mkdir(DATEN, { recursive: true });
  const mitGeo = await ergaenzeKoordinaten(zusammen, PFAD_GEO, GEO_USER_AGENT);
  const gueltig = mitGeo.filter((a) => {
    const ok = AngebotSchema.safeParse(a);
    if (!ok.success) console.error(`⚠ ungültig verworfen: ${a.id}: ${ok.error.issues[0]?.message ?? ""}`);
    return ok.success;
  });
  gueltig.sort((a, b) => (a.termine[0]?.start ?? "").localeCompare(b.termine[0]?.start ?? ""));

  await writeFile(PFAD_ANGEBOTE, `${JSON.stringify(gueltig, null, 1)}\n`);
  const bericht: Bericht = { erstellt: jetzt.toISOString(), quellen: berichte, gesamt: gueltig.length };
  await writeFile(PFAD_BERICHT, `${JSON.stringify(bericht, null, 2)}\n`);
  await writeFile(
    PFAD_META,
    `${JSON.stringify(
      {
        aktualisiert: jetzt.toISOString(),
        quellen: quellen.map(({ id, name, website, farbe }) => ({ id, name, website, farbe })),
        themen,
      },
      null,
      2,
    )}\n`,
  );
  const oeffentlich = gueltig.filter((a) => a.sicherheit >= MIN_SICHERHEIT_OEFFENTLICH);
  const abos = await schreibeAbos(oeffentlich, themen, ORDNER_ABOS);

  console.log(`\n${gueltig.length} Angebote gespeichert (${oeffentlich.length} öffentlich, ${gueltig.length - oeffentlich.length} zur Prüfung), ${abos.length} Kalender-Abos.`);
  if (berichte.some((b) => !b.ok)) process.exitCode = 1;
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
