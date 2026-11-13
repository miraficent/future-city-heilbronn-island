import type { Thema } from "../../src/lib/angebot";

export type Klassifizierung = { themen: string[]; sicherheit: number; ausloeser: string[] };

const BUCHSTABE = "\\p{L}\\p{N}";

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Kurze Abkürzungen in Großbuchstaben (KI, AI) müssen als ganzes Wort und mit exakter
 * Schreibweise vorkommen, sonst träfe „KI“ auch „Kinder“. Alle anderen Schlagwörter
 * treffen am Wortanfang, ohne Rücksicht auf Groß-/Kleinschreibung („Programmier“ → „Programmieren“).
 */
export function schlagwortRegex(schlagwort: string): RegExp {
  const istAbkuerzung = schlagwort.length <= 3 && schlagwort === schlagwort.toUpperCase();
  const kern = escapeRegex(schlagwort);
  if (istAbkuerzung) return new RegExp(`(?<![${BUCHSTABE}])${kern}(?![${BUCHSTABE}])`, "u");
  return new RegExp(`(?<![${BUCHSTABE}])${kern}`, "iu");
}

const SICHERHEIT_TITEL = 0.9;
const SICHERHEIT_MEHRFACH = 0.7;
const SICHERHEIT_EINZELN = 0.5;

export function klassifiziereThemen(titel: string, beschreibung: string, themen: Thema[]): Klassifizierung {
  const gefunden: string[] = [];
  const ausloeser: string[] = [];
  let imTitel = false;
  let trefferBeschreibung = 0;

  for (const thema of themen) {
    let themaGetroffen = false;
    for (const wort of thema.schlagwoerter) {
      const rx = schlagwortRegex(wort);
      const titelTreffer = rx.test(titel);
      const beschreibungTreffer = rx.test(beschreibung);
      if (!titelTreffer && !beschreibungTreffer) continue;
      themaGetroffen = true;
      ausloeser.push(wort);
      if (titelTreffer) imTitel = true;
      else trefferBeschreibung++;
    }
    if (themaGetroffen) gefunden.push(thema.id);
  }

  const sicherheit =
    gefunden.length === 0
      ? 0
      : imTitel
        ? SICHERHEIT_TITEL
        : trefferBeschreibung >= 2
          ? SICHERHEIT_MEHRFACH
          : SICHERHEIT_EINZELN;

  return { themen: gefunden, sicherheit, ausloeser };
}
