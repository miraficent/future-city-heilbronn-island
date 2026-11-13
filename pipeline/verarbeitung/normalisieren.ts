import type { Angebot, Art, Quelle, RohAngebot, Termin, Thema, Zielgruppe } from "../../src/lib/angebot";
import { bestimmeAlter } from "./alter";
import { klassifiziereThemen } from "./themen";
import { teaser } from "./text";

const KIND_BIS = 11;
const TEEN_BIS = 17;

const TAG_ZIELGRUPPEN: Array<[RegExp, Zielgruppe[]]> = [
  [/eltern|väter|vater|mütter|großeltern/i, ["eltern"]],
  [/familie/i, ["familien"]],
  [/erwachsene|(?<!junior)studierende|auszubildende|interessierte/i, ["erwachsene"]],
  [/fortbildung|pädagog|lehrkr|fachkr|erzieh|schulleitung|referendar|sozialarbeit|ganztag|tagespflege|zusatzkraft|leitungskraft/i, ["fachkraefte"]],
  [/jugendliche|gymnasium|klasse|juniorstud/i, ["teens"]],
  [/grundschul|schulkind|kindergartenkind/i, ["kinder"]],
];

/** Nur wenn das Alter unbekannt ist: „Schüler/in“ heißt dann Kinder oder Teens. */
const TAG_ZIELGRUPPEN_OHNE_ALTER: Array<[RegExp, Zielgruppe[]]> = [[/schüler/i, ["kinder", "teens"]]];

const TAG_ART: Array<[RegExp, Art]> = [
  [/ferien/i, "ferienprogramm"],
  [/workshop|werkstatt|lab\b|labor/i, "workshop"],
  [/vortrag|impuls|lecture|talk|online-vortrag/i, "vortrag"],
  [/^kurs$/i, "kurs"],
];

function zukuenftigeTermine(termine: Termin[], jetzt: Date): Termin[] {
  return termine
    .filter((t) => new Date(t.ende ?? t.start).getTime() >= jetzt.getTime())
    .sort((a, b) => a.start.localeCompare(b.start));
}

/** Ab diesem Mindestalter richtet sich ein „ab …“-Angebot auch an Erwachsene. */
const ERWACHSENE_AB_MIN = 16;

export function zielgruppenAusAlter(min?: number, max?: number): Zielgruppe[] {
  if (min === undefined && max === undefined) return [];
  const von = min ?? 0;
  const bis = max ?? 99;
  const gruppen: Zielgruppe[] = [];
  if (von <= KIND_BIS) gruppen.push("kinder");
  if (von <= TEEN_BIS && bis > KIND_BIS) gruppen.push("teens");
  if (max !== undefined ? bis > TEEN_BIS : von >= ERWACHSENE_AB_MIN) gruppen.push("erwachsene");
  return gruppen;
}

function zielgruppenAusTags(tags: string[], alterBekannt: boolean): Zielgruppe[] {
  const gruppen = new Set<Zielgruppe>();
  const regeln = alterBekannt ? TAG_ZIELGRUPPEN : [...TAG_ZIELGRUPPEN, ...TAG_ZIELGRUPPEN_OHNE_ALTER];
  for (const tag of tags) {
    for (const [rx, ziel] of regeln) if (rx.test(tag)) ziel.forEach((z) => gruppen.add(z));
  }
  return [...gruppen];
}

function bestimmeArt(roh: RohAngebot): Art {
  for (const kandidat of [roh.artHinweis ?? "", ...roh.quellTags]) {
    for (const [rx, art] of TAG_ART) if (rx.test(kandidat)) return art;
  }
  return roh.termine.length > 1 ? "kurs" : "veranstaltung";
}

export function formatiereKosten(euro: number | null | undefined, text?: string): { euro: number | null; text: string } {
  if (euro === 0) return { euro: 0, text: "kostenlos" };
  if (typeof euro === "number") {
    const betrag = euro.toLocaleString("de-DE", { minimumFractionDigits: Number.isInteger(euro) ? 0 : 2, maximumFractionDigits: 2 });
    return { euro, text: `${betrag} €` };
  }
  return { euro: null, text: text?.trim() || "siehe Anbieter" };
}

/**
 * Macht aus einem RohAngebot ein Angebot. Gibt `null` zurück, wenn kein Termin in der
 * Zukunft liegt. Leere `themen` bleiben erhalten, damit Korrekturen ein Angebot noch
 * aufnehmen können; aussortiert wird erst danach.
 */
export function normalisiere(roh: RohAngebot, quelle: Quelle, themen: Thema[], jetzt: Date): Angebot | null {
  const termine = zukuenftigeTermine(roh.termine, jetzt);
  if (termine.length === 0) return null;

  const klass = klassifiziereThemen(roh.titel, `${roh.beschreibung}\n${roh.quellTags.join(" · ")}`, themen);
  const alter = bestimmeAlter(roh.titel, roh.quellTags, roh.beschreibung);
  const alterBekannt = alter.min !== undefined || alter.max !== undefined;
  const ausTags = zielgruppenAusTags(roh.quellTags, alterBekannt);
  // Fortbildungen für Fachkräfte richten sich nicht an Kinder, auch wenn „Kita“ im Titel steht.
  const ausAlter = ausTags.includes("fachkraefte") && !alterBekannt ? [] : zielgruppenAusAlter(alter.min, alter.max);
  const zielgruppen = [...new Set([...ausAlter, ...ausTags])];

  return {
    id: `${quelle.id}:${roh.externeId}`,
    quelle: quelle.id,
    titel: roh.titel.trim(),
    teaser: teaser(roh.beschreibung, 300),
    url: roh.url,
    ...(roh.bild ? { bild: roh.bild } : {}),
    themen: klass.themen,
    art: bestimmeArt(roh),
    zielgruppen: zielgruppen.length > 0 ? zielgruppen : ["erwachsene"],
    ...(alter.min !== undefined ? { alterMin: alter.min } : {}),
    ...(alter.max !== undefined ? { alterMax: alter.max } : {}),
    termine,
    ort: {
      name: roh.ort?.name ?? quelle.name,
      adresse: roh.ort?.adresse ?? quelle.adresse,
      online: roh.ort?.online ?? false,
    },
    kosten: formatiereKosten(roh.kostenEuro, roh.kostenText),
    status: roh.status ?? "unbekannt",
    sicherheit: klass.sicherheit,
    ausloeser: klass.ausloeser,
    erstmalsGesehen: jetzt.toISOString().slice(0, 10),
  };
}
