import type { Angebot } from "./angebot";

const MAX_OKTETTE = 75;
const STANDARD_DAUER_MS = 60 * 60 * 1000;

export function icsEscape(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Faltet eine Inhaltszeile nach RFC 5545 auf höchstens 75 Oktette (UTF-8-sicher). */
export function falte(zeile: string): string {
  const encoder = new TextEncoder();
  const teile: string[] = [];
  let aktuell = "";
  let oktette = 0;
  for (const zeichen of zeile) {
    const laenge = encoder.encode(zeichen).length;
    const grenze = teile.length === 0 ? MAX_OKTETTE : MAX_OKTETTE - 1;
    if (oktette + laenge > grenze) {
      teile.push(aktuell);
      aktuell = "";
      oktette = 0;
    }
    aktuell += zeichen;
    oktette += laenge;
  }
  teile.push(aktuell);
  return teile.map((t, i) => (i === 0 ? t : ` ${t}`)).join("\r\n");
}

function utc(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function erzeugeIcs(angebote: Angebot[], kalenderName: string, jetzt = new Date()): string {
  const zeilen = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//COSMOS-Entdecker//Lernangebote Heilbronn//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${icsEscape(kalenderName)}`,
    "X-WR-TIMEZONE:Europe/Berlin",
    "REFRESH-INTERVAL;VALUE=DURATION:PT12H",
  ];
  const stempel = utc(jetzt.toISOString());

  for (const a of angebote) {
    for (const t of a.termine) {
      const start = utc(t.start);
      const ende = utc(t.ende ?? new Date(new Date(t.start).getTime() + STANDARD_DAUER_MS).toISOString());
      const beschreibung = `${a.teaser}\n\nKosten: ${a.kosten.text}\nInfos und Anmeldung: ${a.url}`;
      zeilen.push(
        "BEGIN:VEVENT",
        `UID:${a.id.replace(/[^\w-]/g, "-")}-${start}@cosmos-entdecker`,
        `DTSTAMP:${stempel}`,
        `DTSTART:${start}`,
        `DTEND:${ende}`,
        `SUMMARY:${icsEscape(a.titel)}`,
        `DESCRIPTION:${icsEscape(beschreibung)}`,
        `LOCATION:${icsEscape(a.ort.adresse ?? a.ort.name)}`,
        `URL:${a.url}`,
        "END:VEVENT",
      );
    }
  }
  zeilen.push("END:VCALENDAR");
  return `${zeilen.map(falte).join("\r\n")}\r\n`;
}
