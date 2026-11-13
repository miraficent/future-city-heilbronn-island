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
/** Ein Nebenthema ohne Titeltreffer braucht mindestens so viele Treffer in der Beschreibung. */
const MIN_TREFFER_NEBENTHEMA = 2;

type Treffer = { thema: string; imTitel: boolean; inBeschreibung: number; woerter: string[] };

export function klassifiziereThemen(titel: string, beschreibung: string, themen: Thema[]): Klassifizierung {
  const treffer: Treffer[] = [];
  for (const thema of themen) {
    const t: Treffer = { thema: thema.id, imTitel: false, inBeschreibung: 0, woerter: [] };
    for (const wort of thema.schlagwoerter) {
      const rx = schlagwortRegex(wort);
      const imTitel = rx.test(titel);
      const inBeschreibung = rx.test(beschreibung);
      if (!imTitel && !inBeschreibung) continue;
      t.woerter.push(wort);
      if (imTitel) t.imTitel = true;
      else t.inBeschreibung++;
    }
    if (t.woerter.length > 0) treffer.push(t);
  }

  const titelEindeutig = treffer.some((t) => t.imTitel);
  const behalten = titelEindeutig ? treffer.filter((t) => t.imTitel || t.inBeschreibung >= MIN_TREFFER_NEBENTHEMA) : treffer;
  const trefferBeschreibung = behalten.reduce((s, t) => s + t.inBeschreibung, 0);

  const sicherheit =
    behalten.length === 0
      ? 0
      : titelEindeutig
        ? SICHERHEIT_TITEL
        : trefferBeschreibung >= MIN_TREFFER_NEBENTHEMA
          ? SICHERHEIT_MEHRFACH
          : SICHERHEIT_EINZELN;

  return { themen: behalten.map((t) => t.thema), sicherheit, ausloeser: behalten.flatMap((t) => t.woerter) };
}
