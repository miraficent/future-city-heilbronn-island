import type { Angebot } from "../../src/lib/angebot";

export type QuellErgebnis = { quelle: string; angebote: Angebot[] | null };

function hatZukunft(a: Angebot, jetzt: Date): boolean {
  return a.termine.some((t) => new Date(t.ende ?? t.start).getTime() >= jetzt.getTime());
}

/**
 * Führt die Ergebnisse dieses Laufs mit dem Vorlauf zusammen.
 * - `angebote: null` heißt: Quelle ist fehlgeschlagen → letzte gute Daten (mit zukünftigen Terminen) behalten.
 * - `erstmalsGesehen` bleibt über Läufe hinweg stabil, damit „Neu seit …“ funktioniert.
 */
export function fuehreZusammen(
  ergebnisse: QuellErgebnis[],
  alt: Angebot[],
  heute: string,
  jetzt: Date,
): { angebote: Angebot[]; neu: Map<string, string[]> } {
  const altNachId = new Map(alt.map((a) => [a.id, a]));
  const angebote: Angebot[] = [];
  const neu = new Map<string, string[]>();

  for (const { quelle, angebote: frisch } of ergebnisse) {
    if (frisch === null) {
      angebote.push(...alt.filter((a) => a.quelle === quelle && hatZukunft(a, jetzt)));
      continue;
    }
    const neueIds: string[] = [];
    for (const a of frisch) {
      const vorher = altNachId.get(a.id);
      if (!vorher) neueIds.push(a.id);
      angebote.push({ ...a, erstmalsGesehen: vorher?.erstmalsGesehen ?? heute });
    }
    neu.set(quelle, neueIds);
  }

  return { angebote, neu };
}
