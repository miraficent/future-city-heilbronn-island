import { formatMonatKurz, formatTagZahl, formatWochentag } from "@/lib/format";

/**
 * Kalenderblatt: Wochentag, Tag, Monat – das Erste, was Eltern auf jeder Karte sehen.
 * Nur Dekoration (aria-hidden): Das volle Datum steht auf jeder Karte zusätzlich als Text.
 */
export function DatumBlock({ iso, heute = false, klein = false }: { iso: string; heute?: boolean; klein?: boolean }) {
  return (
    <span className={`el-datum${heute ? " el-datum--heute" : ""}${klein ? " el-datum--klein" : ""}`} aria-hidden="true">
      <span className="el-datum__tag">{heute ? "Heute" : formatWochentag(iso)}</span>
      <span className="el-datum__zahl">{formatTagZahl(iso)}</span>
      <span className="el-datum__monat">{formatMonatKurz(iso)}</span>
    </span>
  );
}
