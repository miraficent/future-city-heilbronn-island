import type { Angebot, Thema } from "./angebot";
import type { SignalStand } from "./signal-regeln.mjs";

export { bereinigeBegriff, GRUPPEN, leererStand, pruefeSignal, pruefeStand, zaehle } from "./signal-regeln.mjs";
export type { Gruppe, Signal, SignalStand } from "./signal-regeln.mjs";

/**
 * „Zeigt uns, was junge Menschen wollen und was fehlt.“
 * Angebot (aus den echten Kursdaten) und Nachfrage (freiwillige, anonyme Wünsche) je Thema × Altersgruppe.
 */

export const ALTERSGRUPPEN = [
  { id: "6-8", name: "6–8", min: 6, max: 8 },
  { id: "9-11", name: "9–11", min: 9, max: 11 },
  { id: "12-14", name: "12–14", min: 12, max: 14 },
  { id: "15-17", name: "15–17", min: 15, max: 17 },
] as const;
export type AltersgruppeId = (typeof ALTERSGRUPPEN)[number]["id"];

export function altersgruppeFuer(alter: number): AltersgruppeId | undefined {
  return ALTERSGRUPPEN.find((g) => alter >= g.min && alter <= g.max)?.id;
}

/** Ein Angebot zählt für eine Altersgruppe, wenn sich seine Altersspanne mit ihr überschneidet. */
export function passtZuGruppe(a: Angebot, g: (typeof ALTERSGRUPPEN)[number]): boolean {
  if (a.alterMin === undefined && a.alterMax === undefined) {
    return g.max <= 11 ? a.zielgruppen.includes("kinder") : a.zielgruppen.includes("teens");
  }
  return (a.alterMin ?? 0) <= g.max && (a.alterMax ?? 99) >= g.min;
}

export type Zelle = { thema: string; gruppe: AltersgruppeId; angebote: number; wuensche: number };

export function angebotsMatrix(angebote: Angebot[], themen: Thema[]): Zelle[] {
  return themen.flatMap((t) =>
    ALTERSGRUPPEN.map((g) => ({
      thema: t.id,
      gruppe: g.id,
      angebote: angebote.filter((a) => a.themen.includes(t.id) && passtZuGruppe(a, g)).length,
      wuensche: 0,
    })),
  );
}

/** Verbindet Angebot und Nachfrage: Wo wird gewünscht, aber wenig angeboten? */
export function lueckenRadar(matrix: Zelle[], stand: SignalStand): Zelle[] {
  return matrix.map((z) => ({ ...z, wuensche: stand.wuensche[`${z.thema}|${z.gruppe}`] ?? 0 }));
}

/** Die meistgesuchten Begriffe ohne Treffer. */
export function topFehlt(stand: SignalStand, anzahl = 8): Array<{ begriff: string; anzahl: number }> {
  return Object.entries(stand.fehlt)
    .map(([begriff, n]) => ({ begriff, anzahl: n }))
    .sort((a, b) => b.anzahl - a.anzahl || a.begriff.localeCompare(b.begriff))
    .slice(0, anzahl);
}
