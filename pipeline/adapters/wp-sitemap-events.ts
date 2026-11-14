import * as cheerio from "cheerio";
import type { Quelle, RohAngebot } from "../../src/lib/angebot";
import type { Http } from "../http";
import { htmlZuText, normalisiereLeerraum } from "../verarbeitung/text";
import { berlinZuIso, parseDeutschesDatum } from "../verarbeitung/zeit";

const UHRZEITEN = /(\d{1,2}:\d{2})(?:\D+(\d{1,2}:\d{2}))?/;
const BESCHREIBUNG_START = /was erwartet (euch|dich|sie)\??/i;
/** Abschnitte mit Personen-Biografien schneiden wir ab – Datensparsamkeit. */
const BESCHREIBUNG_ENDE = /information(en)?\s+(über|zu)\s+(die|den|der|unsere)\s+(trainer|referent|speaker|moderat)/i;
/** Keyfacts, die wir bewusst nicht übernehmen (Personennamen). */
const KEYFACTS_OHNE = /trainer|referent|speaker|moderation/i;

export function parseSitemap(xml: string): string[] {
  const $ = cheerio.load(xml, { xml: true });
  return $("loc")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean);
}

function keyfacts($: cheerio.CheerioAPI): Map<string, string> {
  const fakten = new Map<string, string>();
  $("li").each((_, li) => {
    const label = normalisiereLeerraum($(li).find("b, strong").first().text()).replace(/:$/, "");
    if (!label) return;
    const wert = normalisiereLeerraum($(li).text()).slice(label.length + 1).trim();
    if (wert) fakten.set(label.toLowerCase(), wert);
  });
  return fakten;
}

/** Liest eine Veranstaltungsseite der IPAI-Website (WordPress/Elementor „cruise-event“). */
export function parseWpEvent(html: string, url: string): RohAngebot | null {
  const $ = cheerio.load(html);
  const titel = normalisiereLeerraum($("h1").first().text());
  const infos = $("cruise-event-informations").first();
  const datumText = normalisiereLeerraum(infos.find(".bx-date-time-container > div").first().text());
  const zeitText = normalisiereLeerraum(infos.find(".bx-date-time-container > div").eq(1).text());
  const datum = parseDeutschesDatum(datumText);
  if (!titel || !datum) return null;

  const zeiten = UHRZEITEN.exec(zeitText);
  const start = berlinZuIso(datum, zeiten?.[1] ?? "00:00");
  const ende = zeiten?.[2] ? berlinZuIso(datum, zeiten[2]) : undefined;

  const fakten = keyfacts($);
  const inhalt = $(".bx-news-content-container").first();
  inhalt.find("li").filter((_, li) => KEYFACTS_OHNE.test($(li).find("b, strong").first().text())).remove();
  const volltext = htmlZuText(inhalt.html() ?? "");
  const startIndex = volltext.search(BESCHREIBUNG_START);
  const abStart =
    startIndex >= 0 ? volltext.slice(startIndex).replace(BESCHREIBUNG_START, "").trim() : volltext.replace(/^Keyfacts\s*/i, "");
  const endeIndex = abStart.search(BESCHREIBUNG_ENDE);
  const beschreibung = (endeIndex >= 0 ? abStart.slice(0, endeIndex) : abStart).trim();

  const teilnahme = fakten.get("teilnahme") ?? fakten.get("kosten") ?? "";
  const kostenlos = /kostenfrei|kostenlos|gratis|frei\b/i.test(teilnahme);
  const betrag = /(\d+(?:,\d{1,2})?)\s*(?:€|EUR)/i.exec(teilnahme);
  const kategorie = normalisiereLeerraum($(".bx-category").first().text());

  return {
    externeId: new URL(url).pathname.split("/").filter(Boolean).pop() ?? url,
    titel,
    beschreibung,
    url,
    termine: [ende ? { start, ende } : { start }],
    ort: { name: "IPAI", adresse: normalisiereLeerraum(infos.find(".bx-location").first().text()) || "Im Zukunftspark 11, 74076 Heilbronn" },
    kostenEuro: kostenlos ? 0 : betrag ? Number((betrag[1] ?? "").replace(",", ".")) : null,
    ...(teilnahme && !kostenlos && !betrag ? { kostenText: teilnahme } : {}),
    status: "unbekannt",
    quellTags: [kategorie, fakten.get("zielgruppe") ?? "", fakten.get("sprache") ?? ""].filter(Boolean),
    ...(kategorie ? { artHinweis: kategorie } : {}),
  };
}

export async function ladeWpSitemapEvents(quelle: Quelle, http: Http): Promise<RohAngebot[]> {
  const urls = (await Promise.all(quelle.startUrls.map(async (s) => parseSitemap(await http.text(s))))).flat();
  const ergebnis: RohAngebot[] = [];
  for (const url of [...new Set(urls)]) {
    const roh = parseWpEvent(await http.text(url), url);
    if (roh) ergebnis.push(roh);
  }
  return ergebnis;
}
