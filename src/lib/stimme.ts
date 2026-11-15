/**
 * Welche Stimme liest vor? Übernommen aus dem Branch `arvin` (src/lib/vorlesen.ts, „Stimmen passend zu jeder Figur“).
 * Nur lokal installierte deutsche Stimmen – kein Text verlässt das Gerät. Freundliche, gut verständliche Stimmen
 * zuerst (Windows: Hedda/Katja/Stefan, macOS: Anna/Markus). Reine Logik, getestet in tests/lib/stimme.test.ts.
 */

/** Wer spricht? Danach richten sich Stimme, Tonhöhe und Tempo. */
export type Sprecher = "eule" | "maedchen" | "junge" | "roboter";

/** Nur die Felder, die wir brauchen – so lässt sich die Auswahl ohne Browser testen. */
export type StimmeInfo = Pick<SpeechSynthesisVoice, "name" | "lang" | "localService">;

const BEVORZUGT = [/katja/i, /hedda/i, /anna/i, /petra/i, /helena/i, /marlene/i];
const MAENNLICH = [/stefan/i, /markus/i, /yannick/i, /conrad/i, /klaus/i, /viktor/i];
const WEIBLICH = [/katja/i, /anna/i, /petra/i, /helena/i, /marlene/i, /hedda/i];

const REIHENFOLGE: Record<Sprecher, RegExp[]> = {
  // Katja klingt natürlicher als Hedda (unter Windows die Standardstimme) – so hört man den Unterschied.
  eule: [/katja/i, /anna/i, /petra/i, /hedda/i, ...BEVORZUGT],
  maedchen: WEIBLICH,
  junge: [...MAENNLICH, ...BEVORZUGT],
  roboter: [...MAENNLICH, ...BEVORZUGT],
};

/** Tonhöhe und Tempo je Sprecher; die Eule spricht ruhig und freundlich. */
export const KLANG: Record<Sprecher, { pitch: number; rate: number }> = {
  eule: { pitch: 1.2, rate: 0.95 },
  maedchen: { pitch: 1.3, rate: 1 },
  junge: { pitch: 1.25, rate: 1 },
  roboter: { pitch: 1.7, rate: 0.92 },
};

export function besteStimme<T extends StimmeInfo>(stimmen: T[], sprecher: Sprecher = "eule"): T | undefined {
  const lokal = stimmen.filter((v) => v.localService && v.lang.toLowerCase().startsWith("de"));
  for (const muster of REIHENFOLGE[sprecher]) {
    const treffer = lokal.find((v) => muster.test(v.name));
    if (treffer) return treffer;
  }
  return lokal.find((v) => v.lang.toLowerCase() === "de-de") ?? lokal[0];
}
