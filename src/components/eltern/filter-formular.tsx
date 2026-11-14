import { useId, type CSSProperties, type ReactNode } from "react";
import type { Art, Zielgruppe } from "@/lib/angebot";
import type { Meta } from "@/lib/daten";
import { TAGESZEIT_TEXT, ZIELGRUPPE_TEXT, type ElternFilter, type Tageszeit } from "@/lib/eltern-suche";
import { ART_TEXT } from "@/lib/format";
import { kurzname } from "../einrichtung-badge";

const ZEITRAEUME: Array<[ElternFilter["zeitraum"], string]> = [["alle", "Alle Termine"], ["woche", "Nächste 7 Tage"], ["monat", "Nächster Monat"]];
const TAGESZEITEN = Object.keys(TAGESZEIT_TEXT) as Tageszeit[];
const ALTER = Array.from({ length: 16 }, (_, i) => i + 3);

const farbe = (wert?: string) => ({ ["--farbe" as string]: wert }) as CSSProperties;
const umschalten = <T,>(liste: T[], wert: T) => (liste.includes(wert) ? liste.filter((x) => x !== wert) : [...liste, wert]);

/**
 * Alle Filter der Eltern-Suche. Wird zweimal benutzt: links neben der Liste (großer Bildschirm)
 * und im aufklappbaren Blatt (Handy). Die Zahlen an Thema und Einrichtung zeigen,
 * wie viele Treffer diese Wahl zusammen mit den übrigen Filtern ergibt.
 */
export function FilterFormular({ filter, aendere, meta, zahlen, kopf }: {
  filter: ElternFilter;
  aendere: (teil: Partial<ElternFilter>) => void;
  meta: Meta;
  zahlen: { themen: Record<string, number>; quellen: Record<string, number> };
  kopf?: ReactNode;
}) {
  const id = useId();
  return (
    <div className="el-filter">
      {kopf}
      <fieldset>
        <legend>Thema</legend>
        <div className="el-chips">
          {meta.themen.map((t) => (
            <button key={t.id} type="button" className="el-chip" style={farbe(t.farbe)} aria-pressed={filter.themen.includes(t.id)} onClick={() => aendere({ themen: umschalten(filter.themen, t.id) })}>
              <span className="el-chip__punkt" aria-hidden="true" />
              {t.name}
              <span className="el-chip__zahl">{zahlen.themen[t.id] ?? 0}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <label className="el-auswahl" htmlFor={`${id}-alter`}>
        Alter Ihres Kindes
        <select id={`${id}-alter`} value={filter.alter ?? ""} onChange={(e) => aendere({ alter: e.target.value ? Number(e.target.value) : undefined })}>
          <option value="">Jedes Alter</option>
          {ALTER.map((a) => <option key={a} value={a}>{a} Jahre</option>)}
        </select>
      </label>

      <fieldset>
        <legend>Zeitraum</legend>
        <div className="el-chips">
          {ZEITRAEUME.map(([wert, text]) => (
            <button key={wert} type="button" className="el-chip" aria-pressed={filter.zeitraum === wert} onClick={() => aendere({ zeitraum: wert, tag: undefined })}>{text}</button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Tag und Uhrzeit</legend>
        <div className="el-chips">
          <button type="button" className="el-chip" aria-pressed={filter.wochentage === "werktags"} onClick={() => aendere({ wochentage: filter.wochentage === "werktags" ? "alle" : "werktags" })}>Unter der Woche</button>
          <button type="button" className="el-chip" aria-pressed={filter.wochentage === "wochenende"} onClick={() => aendere({ wochentage: filter.wochentage === "wochenende" ? "alle" : "wochenende" })}>Am Wochenende</button>
          {TAGESZEITEN.map((z) => (
            <button key={z} type="button" className="el-chip" aria-pressed={filter.tageszeiten.includes(z)} onClick={() => aendere({ tageszeiten: umschalten(filter.tageszeiten, z) })}>{TAGESZEIT_TEXT[z]}</button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Kosten und Plätze</legend>
        <label className="el-schalter"><input type="checkbox" checked={filter.nurKostenlos} onChange={(e) => aendere({ nurKostenlos: e.target.checked })} />Nur kostenlose Angebote</label>
        <label className="el-schalter"><input type="checkbox" checked={filter.nurFrei} onChange={(e) => aendere({ nurFrei: e.target.checked })} />Nur mit gemeldeten freien Plätzen</label>
      </fieldset>

      <fieldset>
        <legend>Einrichtung</legend>
        <div className="el-chips">
          {meta.quellen.map((q) => (
            <button key={q.id} type="button" className="el-chip" style={farbe(q.farbe)} aria-pressed={filter.quellen.includes(q.id)} onClick={() => aendere({ quellen: umschalten(filter.quellen, q.id) })}>
              <span className="el-chip__punkt" aria-hidden="true" />
              {kurzname(q, q.id)}
              <span className="el-chip__zahl">{zahlen.quellen[q.id] ?? 0}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <label className="el-auswahl" htmlFor={`${id}-art`}>
        Format
        <select id={`${id}-art`} value={filter.arten[0] ?? ""} onChange={(e) => aendere({ arten: e.target.value ? [e.target.value as Art] : [] })}>
          <option value="">Alle Formate</option>
          {Object.entries(ART_TEXT).map(([wert, text]) => <option key={wert} value={wert}>{text}</option>)}
        </select>
      </label>

      <label className="el-auswahl" htmlFor={`${id}-fuer`}>
        Für wen?
        <select id={`${id}-fuer`} value={filter.zielgruppen[0] ?? ""} onChange={(e) => aendere({ zielgruppen: e.target.value ? [e.target.value as Zielgruppe] : [] })}>
          <option value="">Alle</option>
          {(["kinder", "teens", "familien", "eltern", "fachkraefte"] as const).map((z) => <option key={z} value={z}>{ZIELGRUPPE_TEXT[z]}</option>)}
        </select>
      </label>
    </div>
  );
}
