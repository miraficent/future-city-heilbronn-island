export type Alter = { min?: number; max?: number };

const MIN_ALTER = 2;
const MAX_ALTER = 99;

const plausibel = (n: number) => n >= MIN_ALTER && n <= MAX_ALTER;

const SPANNE = /(\d{1,2})\s*[-–—]\s*(\d{1,2})\s*(?:J\.|Jahre|Jährige|-jahre)/i;
const AB = /ab[\s-]+(\d{1,2})[\s-]*(?:J\.|J\b|Jahr|-jahr)/i;
const KLASSE = /Klassen?(?:stufe)?\s*(\d{1,2})\s*(?:[-–—]|bis)\s*(\d{1,2})/i;
const AB_KLASSE = /ab[\s-]+Klasse[\s-]+(\d{1,2})/i;

/** Schulklasse n entspricht grob dem Alter n + 5. */
const KLASSE_ZU_ALTER = 5;

function ausEinemText(text: string): Alter | null {
  const spanne = SPANNE.exec(text);
  if (spanne) {
    const min = Number(spanne[1]);
    const max = Number(spanne[2]);
    if (plausibel(min) && plausibel(max) && min <= max) return { min, max };
  }
  const klasse = KLASSE.exec(text);
  if (klasse) {
    return { min: Number(klasse[1]) + KLASSE_ZU_ALTER, max: Number(klasse[2]) + KLASSE_ZU_ALTER };
  }
  const abKlasse = AB_KLASSE.exec(text);
  if (abKlasse) return { min: Number(abKlasse[1]) + KLASSE_ZU_ALTER };
  const ab = AB.exec(text);
  if (ab) {
    const min = Number(ab[1]);
    if (plausibel(min)) return { min };
  }
  return null;
}

/**
 * Erkennt Altersangaben. Die Texte werden in Prioritätsreihenfolge übergeben
 * (z. B. Titel, Beschreibung, Tags der Quelle); der erste Treffer mit Spanne gewinnt,
 * sonst der erste „ab …“-Treffer.
 */
export function erkenneAlter(texte: string[]): Alter {
  let nurMin: Alter | null = null;
  for (const text of texte) {
    const treffer = ausEinemText(text);
    if (!treffer) continue;
    if (treffer.max !== undefined) return treffer;
    nurMin ??= treffer;
  }
  return nurMin ?? {};
}
