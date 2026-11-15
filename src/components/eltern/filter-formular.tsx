import { useId, type CSSProperties, type ReactNode } from "react";
import type { Art, Zielgruppe } from "@/lib/angebot";
import type { Meta } from "@/lib/daten";
import { ART_TEXTE, TAGESZEIT_TEXTE, WOCHENTAGE_TEXTE, ZIELGRUPPE_TEXTE, type ElternFilter, type Tageszeit } from "@/lib/eltern-suche";
import { kurzname } from "../einrichtung-badge";
import { useSprache } from "./sprache";
import { TEXTE } from "./texte";

const TAGESZEITEN: Tageszeit[] = ["vormittags", "nachmittags", "abends"];
const ZEITRAEUME: Array<ElternFilter["zeitraum"]> = ["alle", "woche", "monat"];
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
  const sprache = useSprache();
  const t = TEXTE[sprache].filter;
  return (
    <div className="el-filter">
      {kopf}
      <fieldset>
        <legend>{t.thema}</legend>
        <div className="el-chips">
          {meta.themen.map((x) => (
            <button key={x.id} type="button" className="el-chip" style={farbe(x.farbe)} aria-pressed={filter.themen.includes(x.id)} onClick={() => aendere({ themen: umschalten(filter.themen, x.id) })}>
              <span className="el-chip__punkt" aria-hidden="true" />
              {x.name}
              <span className="el-chip__zahl">{zahlen.themen[x.id] ?? 0}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <label className="el-auswahl" htmlFor={`${id}-alter`}>
        {t.alter}
        <select id={`${id}-alter`} value={filter.alter ?? ""} onChange={(e) => aendere({ alter: e.target.value ? Number(e.target.value) : undefined })}>
          <option value="">{t.jedesAlter}</option>
          {ALTER.map((a) => <option key={a} value={a}>{t.jahre(a)}</option>)}
        </select>
      </label>

      <fieldset>
        <legend>{t.zeitraum}</legend>
        <div className="el-chips">
          {ZEITRAEUME.map((wert) => (
            <button key={wert} type="button" className="el-chip" aria-pressed={filter.zeitraum === wert} onClick={() => aendere({ zeitraum: wert, tag: undefined })}>{t.zeitraeume[wert]}</button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>{t.tagZeit}</legend>
        <div className="el-chips">
          {(["werktags", "wochenende"] as const).map((w) => (
            <button key={w} type="button" className="el-chip" aria-pressed={filter.wochentage === w} onClick={() => aendere({ wochentage: filter.wochentage === w ? "alle" : w })}>{WOCHENTAGE_TEXTE[sprache][w]}</button>
          ))}
          {TAGESZEITEN.map((z) => (
            <button key={z} type="button" className="el-chip" aria-pressed={filter.tageszeiten.includes(z)} onClick={() => aendere({ tageszeiten: umschalten(filter.tageszeiten, z) })}>{TAGESZEIT_TEXTE[sprache][z]}</button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>{t.kosten}</legend>
        <label className="el-schalter"><input type="checkbox" checked={filter.nurKostenlos} onChange={(e) => aendere({ nurKostenlos: e.target.checked })} />{t.nurKostenlos}</label>
        <label className="el-schalter"><input type="checkbox" checked={filter.nurFrei} onChange={(e) => aendere({ nurFrei: e.target.checked })} />{t.nurFrei}</label>
      </fieldset>

      <fieldset>
        <legend>{t.einrichtung}</legend>
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
        {t.format}
        <select id={`${id}-art`} value={filter.arten[0] ?? ""} onChange={(e) => aendere({ arten: e.target.value ? [e.target.value as Art] : [] })}>
          <option value="">{t.alleFormate}</option>
          {Object.entries(ART_TEXTE[sprache]).map(([wert, text]) => <option key={wert} value={wert}>{text}</option>)}
        </select>
      </label>

      <label className="el-auswahl" htmlFor={`${id}-fuer`}>
        {t.fuerWen}
        <select id={`${id}-fuer`} value={filter.zielgruppen[0] ?? ""} onChange={(e) => aendere({ zielgruppen: e.target.value ? [e.target.value as Zielgruppe] : [] })}>
          <option value="">{t.alleGruppen}</option>
          {(["kinder", "teens", "familien", "eltern", "fachkraefte"] as const).map((z) => <option key={z} value={z}>{ZIELGRUPPE_TEXTE[sprache][z]}</option>)}
        </select>
      </label>
    </div>
  );
}
