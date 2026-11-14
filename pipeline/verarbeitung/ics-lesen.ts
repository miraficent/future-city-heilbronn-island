import type { Termin } from "../../src/lib/angebot";
import { berlinZuIso } from "./zeit";

const ADRESSE = /([^,;]+?\s\d+[a-z]?,\s*\d{5}\s+[^,;]+)/i;

function entfalte(ics: string): string[] {
  return ics.replace(/\r?\n[ \t]/g, "").split(/\r?\n/);
}

function icsZeitZuIso(wert: string): string | null {
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/.exec(wert.trim());
  if (!m) return null;
  const [, j, mo, t, h, mi, s, utc] = m;
  if (utc) return new Date(`${j}-${mo}-${t}T${h}:${mi}:${s}Z`).toISOString();
  return berlinZuIso(`${j}-${mo}-${t}`, `${h}:${mi}:${s}`);
}

/** Liest VEVENT-Termine aus einer iCalendar-Datei (wie sie KuferWeb pro Kurs anbietet). */
export function leseIcs(ics: string): { termine: Termin[]; ort?: string } {
  const termine: Termin[] = [];
  let ort: string | undefined;
  let aktuell: Partial<Termin> | null = null;

  for (const zeile of entfalte(ics)) {
    if (zeile === "BEGIN:VEVENT") aktuell = {};
    else if (zeile === "END:VEVENT") {
      if (aktuell?.start) termine.push(aktuell.ende ? { start: aktuell.start, ende: aktuell.ende } : { start: aktuell.start });
      aktuell = null;
    } else if (aktuell) {
      const doppelpunkt = zeile.indexOf(":");
      const schluessel = zeile.slice(0, doppelpunkt).split(";")[0];
      const wert = zeile.slice(doppelpunkt + 1);
      if (schluessel === "DTSTART") aktuell.start = icsZeitZuIso(wert) ?? undefined;
      if (schluessel === "DTEND") aktuell.ende = icsZeitZuIso(wert) ?? undefined;
      if (schluessel === "LOCATION" && !ort) ort = ADRESSE.exec(wert.replace(/\\,/g, ","))?.[1]?.trim();
    }
  }
  return { termine: termine.sort((a, b) => a.start.localeCompare(b.start)), ...(ort ? { ort } : {}) };
}
