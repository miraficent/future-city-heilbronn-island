export type Alter = { min?: number; max?: number };

const MIN_ALTER = 2;
const MAX_ALTER = 99;

const plausibel = (n: number) => n >= MIN_ALTER && n <= MAX_ALTER;

const SPANNE = /(\d{1,2})\s*(?:[-–—]|bis)\s*(\d{1,2})\s*(?:J\.|Jahre|Jährige|-jahre)/i;
const AB = /ab[\s-]+(\d{1,2})[\s-]*(?:J\.|J\b|Jahr|-jahr)/i;
const KLASSE = /(?:Klassen?(?:stufe)?|Kl\.)\s*(\d{1,2})\s*(?:[-–—]|bis)\s*(\d{1,2})/i;
const AB_KLASSE = /ab[\s-]+(?:Klasse|Kl\.)[\s-]*(\d{1,2})/i;

/** Schulklasse n entspricht grob dem Alter n + 5. */
const KLASSE_ZU_ALTER = 5;

const leer = (a: Alter) => a.min === undefined && a.max === undefined;

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
 * Erkennt Altersangaben. Die Texte werden in Prioritätsreihenfolge übergeben;
 * der erste Treffer mit Spanne gewinnt, sonst der erste „ab …“-Treffer.
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

/** Hülle mehrerer Altersgruppen – z. B. „3–6 Jahre“ + „ab 6 Jahren“ ⇒ „ab 3“. */
export function vereinigeAlter(alter: Alter[]): Alter {
  const relevant = alter.filter((a) => !leer(a));
  if (relevant.length === 0) return {};
  const mins = relevant.map((a) => a.min ?? MIN_ALTER);
  const offen = relevant.some((a) => a.max === undefined);
  const max = offen ? undefined : Math.max(...relevant.map((a) => a.max ?? MAX_ALTER));
  return { min: Math.min(...mins), ...(max !== undefined ? { max } : {}) };
}

/** Konkrete Altersangaben in Titel/Beschreibung vor breiten Website-Kategorien. */
export function bestimmeAlter(titel: string, tags: string[], beschreibung: string): Alter {
  const ausTitel = erkenneAlter([titel]);
  if (!leer(ausTitel)) return ausTitel;
  const ausBeschreibung = erkenneAlter([beschreibung]);
  if (!leer(ausBeschreibung)) return ausBeschreibung;
  const ausTags = vereinigeAlter(tags.map((t) => erkenneAlter([t])));
  if (!leer(ausTags)) return ausTags;
  return {};
}
