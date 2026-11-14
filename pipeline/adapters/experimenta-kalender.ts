import * as cheerio from "cheerio";
import type { Quelle, RohAngebot, Termin } from "../../src/lib/angebot";
import type { Http } from "../http";
import { normalisiereLeerraum } from "../verarbeitung/text";
import { berlinZuIso, wandzeitUnixZuIso } from "../verarbeitung/zeit";

const AUSGEBUCHT = /\**\s*die veranstaltung ist (bereits )?ausgebucht\.?\s*\**/i;
const UHRZEIT_BIS = /bis\s*(\d{1,2}:\d{2})/;

function ohneTerminParameter(href: string): string {
  const url = new URL(href);
  url.searchParams.delete("termin");
  return url.toString();
}

/** Liest die Kachelansicht des experimenta-Veranstaltungskalenders. */
export function parseExperimentaKalender(html: string): RohAngebot[] {
  const $ = cheerio.load(html);
  const nachUrl = new Map<string, RohAngebot>();

  $(".veranstaltungen-card").each((_, el) => {
    const karte = $(el);
    const link = karte.find("a.link-intern").attr("href");
    const titel = normalisiereLeerraum(karte.find("h5").first().text());
    if (!link || !titel) return;

    const terminUnix = Number(new URL(link).searchParams.get("termin") ?? karte.attr("data-date-start"));
    if (!Number.isFinite(terminUnix)) return;
    const start = wandzeitUnixZuIso(terminUnix);
    const bis = UHRZEIT_BIS.exec(karte.find(".start-monat-uhrzeit").text());
    const termin: Termin = bis ? { start, ende: berlinZuIso(start.slice(0, 10), bis[1] ?? "") } : { start };

    const url = ohneTerminParameter(link);
    const bestehend = nachUrl.get(url);
    if (bestehend) {
      if (!bestehend.termine.some((t) => t.start === termin.start)) bestehend.termine.push(termin);
      return;
    }

    const rohText = normalisiereLeerraum(karte.find("p").first().text());
    let tags: string[] = [];
    try {
      tags = JSON.parse(karte.attr("data-groups") ?? "[]") as string[];
    } catch {
      tags = [];
    }
    const bild = karte.find("img").first().attr("src");

    nachUrl.set(url, {
      externeId: new URL(url).pathname.split("/").filter(Boolean).pop() ?? url,
      titel,
      beschreibung: normalisiereLeerraum(rohText.replace(AUSGEBUCHT, "")),
      url,
      ...(bild ? { bild } : {}),
      termine: [termin],
      ort: { name: "experimenta", adresse: "Experimenta-Platz, 74072 Heilbronn" },
      status: AUSGEBUCHT.test(rohText) ? "ausgebucht" : "unbekannt",
      quellTags: tags,
    });
  });

  return [...nachUrl.values()];
}

export async function ladeExperimentaKalender(quelle: Quelle, http: Http): Promise<RohAngebot[]> {
  const ergebnisse = await Promise.all(quelle.startUrls.map((u) => http.text(u)));
  const alle = ergebnisse.flatMap(parseExperimentaKalender);
  return [...new Map(alle.map((r) => [r.url, r])).values()];
}
