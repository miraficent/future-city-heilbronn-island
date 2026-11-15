import type { CSSProperties } from "react";
import { LOCALE, tagText, type BandTag } from "@/lib/eltern-suche";
import { useSprache } from "./sprache";
import { TEXTE } from "./texte";

const mittag = (tag: string) => new Date(`${tag}T12:00:00Z`);

/**
 * Terminband: die nächsten Wochen als Säulen – „Wann ist viel los?“ auf einen Blick.
 * Ein Tag antippen = nur Angebote an diesem Tag. Die Zahlen folgen allen anderen Filtern.
 */
export function Terminband({ tage, gewaehlt, waehlen }: { tage: BandTag[]; gewaehlt?: string; waehlen: (tag: string | undefined) => void }) {
  const sprache = useSprache();
  const t = TEXTE[sprache].band;
  const wochentag = new Intl.DateTimeFormat(LOCALE[sprache], { timeZone: "UTC", weekday: "short" });
  const monat = new Intl.DateTimeFormat(LOCALE[sprache], { timeZone: "UTC", month: "short" });
  const hoechste = Math.max(1, ...tage.map((x) => x.anzahl));
  return (
    <section className="el-band" aria-labelledby="band-titel">
      <div className="el-band__kopf">
        <h3 id="band-titel">{t.titel}</h3>
        {gewaehlt ? (
          <p className="el-band__hinweis">
            {t.nur(tagText(gewaehlt, sprache))}{" "}
            <button type="button" className="el-textknopf" onClick={() => waehlen(undefined)}>{t.alleTage}</button>
          </p>
        ) : (
          <p className="el-band__hinweis">{t.hinweis(tage.length)}</p>
        )}
      </div>
      <ol className="el-band__spur">
        {tage.map((x, i) => {
          const datum = mittag(x.tag);
          const aktiv = gewaehlt === x.tag;
          return (
            <li key={x.tag}>
              <button
                type="button"
                className={`el-band__tag${x.wochenende ? " ist-wochenende" : ""}${x.heute ? " ist-heute" : ""}`}
                aria-pressed={aktiv}
                aria-label={`${x.heute ? t.heute : ""}${tagText(x.tag, sprache)}: ${t.anzahl(x.anzahl)}`}
                disabled={x.anzahl === 0 && !aktiv}
                onClick={() => waehlen(aktiv ? undefined : x.tag)}
              >
                <span className="el-band__monat">{i === 0 || x.tag.endsWith("-01") ? monat.format(datum).replace(".", "") : ""}</span>
                <span className="el-band__wt">{wochentag.format(datum).replace(".", "").slice(0, 2)}</span>
                <span className="el-band__raum">
                  <span className="el-band__saeule" style={{ ["--hoehe" as string]: `${(x.anzahl / hoechste) * 100}%` } as CSSProperties} />
                </span>
                <span className="el-band__datum">{Number(x.tag.slice(8))}</span>
                <span className="el-band__zahl">{x.anzahl > 0 ? x.anzahl : ""}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
