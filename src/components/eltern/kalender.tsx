"use client";

/**
 * Monatskalender für die Eltern-Suche: ein Tag antippen = nur Angebote an diesem Tag.
 * Punkte unter dem Datum zeigen, wie viele Angebote es gibt. Flache Blumen in den Farben der Seite
 * (DESIGN.md-Tokens) geben dem Kalender denselben freundlichen Ton wie Karte und Wunschzettel.
 */
import { useState } from "react";
import { LOCALE, monatsRaster, tagText } from "@/lib/eltern-suche";
import { Symbol } from "../symbol";
import { useSprache } from "./sprache";
import { TEXTE } from "./texte";

/** Eine Blume aus fünf Blütenblättern; Farben als CSS-Variablen (keine festen Farbwerte). */
function Blume({ x, y, r, farbe, drehung = 0 }: { x: number; y: number; r: number; farbe: string; drehung?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${drehung})`}>
      {[0, 72, 144, 216, 288].map((w) => (
        <ellipse key={w} cx={0} cy={-r * 0.62} rx={r * 0.42} ry={r * 0.62} fill={`var(${farbe})`} transform={`rotate(${w})`} />
      ))}
      <circle r={r * 0.34} fill="var(--accent)" />
      <circle r={r * 0.14} cx={-r * 0.08} cy={-r * 0.08} fill="var(--white)" opacity={0.7} />
    </g>
  );
}

function Blatt({ x, y, laenge, drehung }: { x: number; y: number; laenge: number; drehung: number }) {
  return <ellipse cx={x} cy={y} rx={laenge * 0.28} ry={laenge * 0.5} fill="var(--land)" stroke="var(--land-dark)" strokeWidth={1.5} transform={`rotate(${drehung} ${x} ${y})`} />;
}

/** Blumenranke oben rechts und unten links */
function Blumen() {
  return (
    <>
      <svg className="el-kal__blumen el-kal__blumen--oben" viewBox="0 0 120 80" aria-hidden="true" focusable="false">
        <path d="M118 4 Q86 18 70 44 Q60 60 40 66" fill="none" stroke="var(--land-dark)" strokeWidth={2.5} strokeLinecap="round" />
        <Blatt x={92} y={22} laenge={18} drehung={60} />
        <Blatt x={62} y={54} laenge={16} drehung={-30} />
        <Blume x={104} y={14} r={14} farbe="--wish" drehung={10} />
        <Blume x={74} y={38} r={10} farbe="--primary" drehung={-12} />
        <Blume x={42} y={64} r={8} farbe="--sea-shallow" />
      </svg>
      <svg className="el-kal__blumen el-kal__blumen--unten" viewBox="0 0 90 60" aria-hidden="true" focusable="false">
        <path d="M2 58 Q24 46 34 26" fill="none" stroke="var(--land-dark)" strokeWidth={2.5} strokeLinecap="round" />
        <Blatt x={16} y={46} laenge={16} drehung={-55} />
        <Blume x={36} y={22} r={12} farbe="--accent-dark" drehung={20} />
        <Blume x={60} y={44} r={8} farbe="--wish" />
      </svg>
    </>
  );
}

export function Kalender({ zahlen, heute, gewaehlt, waehlen }: {
  zahlen: Map<string, number>;
  /** heutiger Tag-Schlüssel („2026-11-15“) */
  heute: string;
  gewaehlt?: string;
  waehlen: (tag: string | undefined) => void;
}) {
  const sprache = useSprache();
  const t = TEXTE[sprache].kalender;
  const start = gewaehlt ?? heute;
  const [ansicht, setAnsicht] = useState({ jahr: Number(start.slice(0, 4)), monat: Number(start.slice(5, 7)) - 1 });
  const aktuell = { jahr: Number(heute.slice(0, 4)), monat: Number(heute.slice(5, 7)) - 1 };
  const istErster = ansicht.jahr === aktuell.jahr && ansicht.monat === aktuell.monat;
  const blaettern = (schritt: number) =>
    setAnsicht(({ jahr, monat }) => ({ jahr: jahr + Math.floor((monat + schritt) / 12), monat: (monat + schritt + 12) % 12 }));
  const titel = new Intl.DateTimeFormat(LOCALE[sprache], { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(ansicht.jahr, ansicht.monat, 15)));
  const felder = monatsRaster(ansicht.jahr, ansicht.monat);
  const imMonat = felder.reduce((summe, tag) => summe + (tag ? zahlen.get(tag) ?? 0 : 0), 0);

  return (
    <section className="el-kal" aria-labelledby="kal-titel">
      <Blumen />
      <p className="el-kal__oben">{t.oben}</p>
      <div className="el-kal__kopf">
        <button type="button" className="el-kal__pfeil" onClick={() => blaettern(-1)} disabled={istErster} aria-label={t.zurueck}><Symbol name="back" /></button>
        <h3 id="kal-titel" aria-live="polite">{titel}</h3>
        <button type="button" className="el-kal__pfeil" onClick={() => blaettern(1)} aria-label={t.weiter}><Symbol name="arrow" /></button>
      </div>
      <div className="el-kal__raster" role="group" aria-label={titel}>
        {t.wochentage.map((w) => <span key={w} className="el-kal__wt" aria-hidden="true">{w}</span>)}
        {felder.map((tag, i) => {
          if (!tag) return <span key={`leer-${i}`} />;
          const anzahl = zahlen.get(tag) ?? 0;
          const vorbei = tag < heute;
          const aktiv = gewaehlt === tag;
          return (
            <button
              key={tag}
              type="button"
              className={`el-kal__tag${tag === heute ? " ist-heute" : ""}${anzahl > 0 ? " hat-angebote" : ""}`}
              aria-pressed={aktiv}
              aria-label={`${tag === heute ? t.heute : ""}${tagText(tag, sprache)}: ${t.anzahl(anzahl)}`}
              disabled={(vorbei || anzahl === 0) && !aktiv}
              onClick={() => waehlen(aktiv ? undefined : tag)}
            >
              <span>{Number(tag.slice(8))}</span>
              <span className="el-kal__punkte" aria-hidden="true">
                {Array.from({ length: Math.min(anzahl, 3) }, (_, k) => <i key={k} />)}
              </span>
            </button>
          );
        })}
      </div>
      <p className="el-kal__fuss">
        {gewaehlt ? (
          <button type="button" className="el-textknopf" onClick={() => waehlen(undefined)}>{t.alleTage}</button>
        ) : (
          t.imMonat(imMonat)
        )}
      </p>
    </section>
  );
}
