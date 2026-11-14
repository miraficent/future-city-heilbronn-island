/**
 * Schritt 1 der Pipeline: alle Quellen aus sources.json abrufen und in RawEvents umwandeln.
 *   ical  → node-ical
 *   html  → cheerio, mit einem Parser je Webseiten-Aufbau ("experimenta", "kufer")
 * Fällt eine Quelle aus, wird das gemeldet und die anderen laufen weiter.
 */
import * as cheerio from "cheerio";
import ical, { type VEvent } from "node-ical";
import { deutschesDatum, erkenneEinrichtung, holeText, leerzeichen, type RawEvent, type Source } from "./lib";

/** Werte aus node-ical sind manchmal Objekte ({ val, params }) */
function wert(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && "val" in (v as object)) return String((v as { val: unknown }).val);
  return String(v);
}

async function ladeIcal(q: Source): Promise<RawEvent[]> {
  const daten = ical.sync.parseICS(await holeText(q.url));
  const events: RawEvent[] = [];
  for (const k of Object.values(daten)) {
    if (!k || k.type !== "VEVENT") continue;
    const e = k as VEvent;
    const titel = leerzeichen(wert(e.summary));
    const ort = leerzeichen(wert(e.location));
    const veranstalter = wert((e as unknown as { organizer?: unknown }).organizer);
    const url = wert(e.url) || q.url;
    events.push({
      institutionId: q.institutionId === "auto" ? erkenneEinrichtung(`${ort} ${veranstalter} ${titel}`) : q.institutionId,
      title: titel,
      text: leerzeichen(wert(e.description)),
      start: new Date(e.start).toISOString(),
      end: e.end ? new Date(e.end).toISOString() : null,
      location: ort,
      cost: null,
      image: null,
      url,
      registrationUrl: url,
    });
  }
  return events;
}

// ---------- experimenta: Übersichtsseite → Event-Seiten mit schema.org-Daten (JSON-LD) ----------

type LdEvent = { "@type"?: string; name?: string; startDate?: string; endDate?: string; description?: string; url?: string; location?: { name?: string } };

async function ladeExperimenta(q: Source): Promise<RawEvent[]> {
  const uebersicht = await holeText(q.url);
  const seiten = [...new Set(uebersicht.match(/https:\/\/www\.experimenta\.science\/besuchen\/veranstaltungskalender\/[a-z0-9-]+\//g) ?? [])];
  const events: RawEvent[] = [];
  for (const seite of seiten) {
    let html: string;
    try {
      html = await holeText(seite);
    } catch (fehler) {
      console.warn(`  ! ${seite}: ${(fehler as Error).message}`);
      continue;
    }
    const $ = cheerio.load(html);
    const ld: LdEvent[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const daten = JSON.parse($(el).text());
        ld.push(...((daten["@graph"] ?? [daten]) as LdEvent[]).filter((x) => x["@type"] === "Event"));
      } catch {
        // kaputtes JSON-LD überspringen
      }
    });
    // Seitentext ohne Menü/Fußzeile – enthält z. B. „Ab 8 Jahren“ und Preise
    $("header, nav, footer, script, style").remove();
    const seitentext = leerzeichen($("main").text() || $("body").text()).slice(0, 4000);
    const preis = seitentext.match(/\d+[,.]?\d*\s?€(?:\s?\/\s?\d+[,.]?\d*\s?€)?/)?.[0] ?? null;
    const bild = $('meta[property="og:image"]').attr("content") ?? null;
    for (const e of ld) {
      if (!e.name || !e.startDate) continue;
      events.push({
        institutionId: "experimenta",
        title: leerzeichen(e.name),
        text: leerzeichen(`${e.description ?? ""} ${seitentext}`),
        start: new Date(e.startDate).toISOString(),
        end: e.endDate ? new Date(e.endDate).toISOString() : null,
        location: e.location?.name ?? "experimenta",
        cost: preis,
        image: bild,
        url: e.url ?? seite,
        registrationUrl: e.url ?? seite,
      });
    }
  }
  return events;
}

// ---------- aim: Kufer-Kurslisten + Kursseiten ----------

/** Zielgruppen-Badges, bei denen Kinder/Jugendliche selbst teilnehmen */
const KINDER_ZIELGRUPPE = /schüler|junior|kinder|jugendliche/i;
const BASIS_AIM = "https://www.aim-akademie.org";
const schonGeladen = new Set<string>();

async function ladeKufer(q: Source): Promise<RawEvent[]> {
  const $ = cheerio.load(await holeText(q.url));
  const events: RawEvent[] = [];
  for (const block of $(".kufer-content-kursliste-kurs").toArray()) {
    const b = $(block);
    const link = b.find("h2 a").first();
    const pfad = link.attr("href");
    if (!pfad) continue;
    const zielgruppen = b.find(".badge").toArray().map((x) => leerzeichen($(x).text()));
    // Kurse nur für Lehrkräfte/Eltern/Fachkräfte gar nicht erst weiterverarbeiten
    if (zielgruppen.length > 0 && !zielgruppen.some((z) => KINDER_ZIELGRUPPE.test(z))) continue;
    const nummer = leerzeichen(b.find(".kufer-content-kursliste-knr").text());
    if (schonGeladen.has(nummer)) continue; // gleicher Kurs in mehreren Kategorien
    schonGeladen.add(nummer);

    const blocktext = leerzeichen(b.text());
    if (/begonnen|abgesagt/i.test(blocktext)) continue;
    const daten = blocktext.match(/\d{2}\.\d{2}\.\d{4}/g) ?? [];
    if (daten.length === 0) continue;
    const zeiten = blocktext.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*Uhr/);
    const ort = blocktext.match(/Ort:\s*([^]+?)(?:$|Details)/)?.[1]?.trim() ?? "Bildungscampus";

    let beschreibung = "";
    let kosten: string | null = null;
    try {
      const d = cheerio.load(await holeText(BASIS_AIM + pfad));
      d("script, style, nav, header, footer").remove();
      const text = leerzeichen(d("body").text());
      const ab = text.indexOf("Kursnummer:");
      const bis = text.indexOf("Termine", ab);
      beschreibung = text.slice(ab, bis > ab ? bis : ab + 2500);
      kosten = text.match(/Kosten:\s*([^]+?)(?:\s{2}|Weitere|Dozent|$)/)?.[1]?.trim() ?? null;
      if (kosten && /^keine$/i.test(kosten)) kosten = "kostenlos";
    } catch (fehler) {
      console.warn(`  ! ${pfad}: ${(fehler as Error).message}`);
    }
    events.push({
      institutionId: "aim",
      title: leerzeichen(link.text()),
      text: leerzeichen(`Zielgruppe: ${zielgruppen.join(", ")}. ${beschreibung}`),
      start: deutschesDatum(daten[0]!, zeiten?.[1]),
      end: deutschesDatum(daten.at(-1)!, zeiten?.[2] ?? "23:59"),
      location: ort.slice(0, 80),
      cost: kosten,
      image: null,
      url: BASIS_AIM + pfad,
      registrationUrl: BASIS_AIM + pfad,
    });
  }
  return events;
}

/** Alle Quellen nacheinander; Ergebnis je Quelle, damit Ausfälle sichtbar bleiben */
export async function holeAlle(quellen: Source[]): Promise<{ quelle: Source; events: RawEvent[]; fehler?: string }[]> {
  const ergebnisse = [];
  for (const q of quellen) {
    try {
      const events =
        q.type === "ical" ? await ladeIcal(q)
        : q.parser === "experimenta" ? await ladeExperimenta(q)
        : q.parser === "kufer" ? await ladeKufer(q)
        : [];
      console.log(`✓ ${q.name}: ${events.length} Termine`);
      ergebnisse.push({ quelle: q, events });
    } catch (fehler) {
      console.warn(`✗ ${q.name}: ${(fehler as Error).message}`);
      ergebnisse.push({ quelle: q, events: [], fehler: (fehler as Error).message });
    }
  }
  return ergebnisse;
}
