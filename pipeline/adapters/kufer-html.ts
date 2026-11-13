import * as cheerio from "cheerio";
import type { Quelle, RohAngebot, Status } from "../../src/lib/angebot";
import type { Http } from "../http";
import { leseIcs } from "../verarbeitung/ics-lesen";
import { htmlZuText, normalisiereLeerraum } from "../verarbeitung/text";

const MAX_SEITEN = 10;
const ENDE_BESCHREIBUNG = /Hinweis zur Datenverarbeitung/i;

export type KuferListenKurs = {
  knr: string;
  titel: string;
  detailUrl: string;
  status: Status;
  ort?: string;
  tags: string[];
};

function statusAusText(text: string): Status {
  if (/ausgebucht|warteliste|begonnen/i.test(text)) return "ausgebucht";
  if (/wenige|restpl/i.test(text)) return "wenige";
  if (/frei/i.test(text)) return "frei";
  return "unbekannt";
}

/** Liest eine KuferWeb-Kursliste (TYPO3-Template der aim). */
export function parseKuferListe(html: string, basisUrl: string): { kurse: KuferListenKurs[]; naechsteSeite?: string } {
  const $ = cheerio.load(html);
  const kurse: KuferListenKurs[] = [];

  $(".kufer-content-kursliste-kurs").each((_, el) => {
    const eintrag = $(el);
    const link = eintrag.find("h2 a").first();
    const knr = normalisiereLeerraum(eintrag.find(".kufer-content-kursliste-knr").first().text());
    const href = link.attr("href");
    if (!knr || !href) return;
    const ortText = normalisiereLeerraum(eintrag.find(".kufer-content-kursdetails-status").first().text()).replace(/^Ort:\s*/, "");
    kurse.push({
      knr,
      titel: normalisiereLeerraum(link.text()),
      detailUrl: new URL(href, basisUrl).toString(),
      status: statusAusText(eintrag.find(".kw_ampel").first().text()),
      ...(ortText ? { ort: ortText } : {}),
      tags: eintrag
        .find(".badge")
        .map((_, b) => normalisiereLeerraum($(b).text()))
        .get()
        .filter(Boolean),
    });
  });

  const weiter = $("a.blaetternindex")
    .filter((_, a) => /browse=forward/.test($(a).attr("href") ?? ""))
    .first()
    .attr("href");
  return { kurse, ...(weiter ? { naechsteSeite: new URL(weiter, basisUrl).toString() } : {}) };
}

/** Liest Beschreibung und Kosten von einer KuferWeb-Detailseite. */
export function parseKuferDetail(html: string): { beschreibung: string; kostenEuro: number | null; kostenText?: string } {
  const $ = cheerio.load(html);
  const titel = $("h1.h2").first();
  const rohHtml = titel
    .nextAll()
    .map((_, el) => $.html(el))
    .get()
    .join("");
  const text = htmlZuText(rohHtml);
  const ende = text.search(ENDE_BESCHREIBUNG);
  const beschreibung = (ende >= 0 ? text.slice(0, ende) : text).trim();

  const kostenRoh = normalisiereLeerraum(
    $("h3")
      .filter((_, h) => /Kosten/.test($(h).text()))
      .first()
      .parent()
      .text(),
  ).replace(/^Kosten:\s*/, "");
  const betrag = /(\d+(?:,\d{1,2})?)\s*(?:€|EUR)/i.exec(kostenRoh);
  const kostenEuro = /keine|kostenlos|kostenfrei|gebührenfrei/i.test(kostenRoh)
    ? 0
    : betrag
      ? Number((betrag[1] ?? "").replace(",", "."))
      : null;

  return { beschreibung, kostenEuro, ...(kostenRoh ? { kostenText: kostenRoh } : {}) };
}

async function ladeListe(startUrl: string, http: Http, basisUrl: string): Promise<KuferListenKurs[]> {
  const sitzung = http.sitzung();
  const kurse: KuferListenKurs[] = [];
  let url: string | undefined = startUrl;
  for (let seite = 0; url && seite < MAX_SEITEN; seite++) {
    const ergebnis = parseKuferListe(await sitzung.text(url), basisUrl);
    kurse.push(...ergebnis.kurse);
    url = ergebnis.naechsteSeite;
  }
  return kurse;
}

export async function ladeKuferHtml(quelle: Quelle, http: Http): Promise<RohAngebot[]> {
  const nachKnr = new Map<string, KuferListenKurs>();
  for (const startUrl of quelle.startUrls) {
    for (const kurs of await ladeListe(startUrl, http, quelle.website)) {
      const bekannt = nachKnr.get(kurs.knr);
      nachKnr.set(kurs.knr, bekannt ? { ...bekannt, tags: [...new Set([...bekannt.tags, ...kurs.tags])] } : kurs);
    }
  }

  const ergebnis: RohAngebot[] = [];
  for (const kurs of nachKnr.values()) {
    const detail = parseKuferDetail(await http.text(kurs.detailUrl));
    const ics = leseIcs(await http.text(new URL(`/kuferweb/webbasys/ics.php?knr=${encodeURIComponent(kurs.knr)}`, quelle.website).toString()));
    ergebnis.push({
      externeId: kurs.knr,
      titel: kurs.titel,
      beschreibung: detail.beschreibung,
      url: kurs.detailUrl,
      termine: ics.termine,
      ort: { name: kurs.ort ?? quelle.name, adresse: ics.ort ?? quelle.adresse },
      kostenEuro: detail.kostenEuro,
      ...(detail.kostenText ? { kostenText: detail.kostenText } : {}),
      status: kurs.status,
      quellTags: kurs.tags,
      artHinweis: "kurs",
    });
  }
  return ergebnis;
}
