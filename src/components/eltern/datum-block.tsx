import { useDatum, useTexte } from "./sprache";

/**
 * Kalenderblatt: Wochentag, Tag, Monat – das Erste, was Eltern auf jeder Karte sehen.
 * Nur Dekoration (aria-hidden): Das volle Datum steht auf jeder Karte zusätzlich als Text.
 */
export function DatumBlock({ iso, heute = false, klein = false }: { iso: string; heute?: boolean; klein?: boolean }) {
  const d = useDatum();
  const t = useTexte().datum;
  return (
    <span className={`el-datum${heute ? " el-datum--heute" : ""}${klein ? " el-datum--klein" : ""}`} aria-hidden="true">
      <span className="el-datum__tag">{heute ? t.heute : d.wochentag(iso)}</span>
      <span className="el-datum__zahl">{d.tagZahl(iso)}</span>
      <span className="el-datum__monat">{d.monatKurz(iso)}</span>
    </span>
  );
}
