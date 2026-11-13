import * as cheerio from "cheerio";

const BLOCK_TAGS = "p, div, li, br, h1, h2, h3, h4, h5, h6, tr, section, article";
const LEERRAUM = /[\s ​]+/g;

/** Vereinheitlicht Leerraum und Unicode-Form (manche Seiten liefern zerlegte Umlaute: u + ̈). */
export function normalisiereLeerraum(text: string): string {
  return text.normalize("NFC").replace(LEERRAUM, " ").trim();
}

/** Wandelt HTML in lesbaren Klartext um; Blockelemente werden zu Zeilenumbrüchen. */
export function htmlZuText(html: string): string {
  const $ = cheerio.load(`<div id="wurzel">${html}</div>`);
  $("script, style, noscript, svg").remove();
  $(BLOCK_TAGS).each((_, el) => {
    $(el).before("\n");
  });
  const roh = $("#wurzel").text();
  return roh
    .split("\n")
    .map(normalisiereLeerraum)
    .filter(Boolean)
    .join("\n");
}

/** Kürzt einen Text an einer Wortgrenze auf höchstens `max` Zeichen. */
export function teaser(text: string, max = 300): string {
  const flach = normalisiereLeerraum(text);
  if (flach.length <= max) return flach;
  const schnitt = flach.slice(0, max - 1);
  const letzteLuecke = schnitt.lastIndexOf(" ");
  const basis = letzteLuecke > max * 0.5 ? schnitt.slice(0, letzteLuecke) : schnitt;
  return `${basis.replace(/[\s,.;:–-]+$/, "")}…`;
}
