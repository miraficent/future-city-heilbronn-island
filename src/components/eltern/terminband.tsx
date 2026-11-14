import type { CSSProperties } from "react";
import { tagText, type BandTag } from "@/lib/eltern-suche";

const wochentag = new Intl.DateTimeFormat("de-DE", { timeZone: "UTC", weekday: "short" });
const monat = new Intl.DateTimeFormat("de-DE", { timeZone: "UTC", month: "short" });
const mittag = (tag: string) => new Date(`${tag}T12:00:00Z`);

/**
 * Terminband: die nächsten Wochen als Säulen – „Wann ist viel los?“ auf einen Blick.
 * Ein Tag antippen = nur Angebote an diesem Tag. Die Zahlen folgen allen anderen Filtern.
 */
export function Terminband({ tage, gewaehlt, waehlen }: { tage: BandTag[]; gewaehlt?: string; waehlen: (tag: string | undefined) => void }) {
  const hoechste = Math.max(1, ...tage.map((t) => t.anzahl));
  return (
    <section className="el-band" aria-labelledby="band-titel">
      <div className="el-band__kopf">
        <h3 id="band-titel">Wann ist etwas los?</h3>
        {gewaehlt ? (
          <p className="el-band__hinweis">
            Nur {tagText(gewaehlt)} ·{" "}
            <button type="button" className="el-textknopf" onClick={() => waehlen(undefined)}>alle Tage zeigen</button>
          </p>
        ) : (
          <p className="el-band__hinweis">Die nächsten {tage.length} Tage. Tippen Sie auf einen Tag.</p>
        )}
      </div>
      <ol className="el-band__spur">
        {tage.map((t, i) => {
          const datum = mittag(t.tag);
          const aktiv = gewaehlt === t.tag;
          const text = t.anzahl === 0 ? "keine Angebote" : t.anzahl === 1 ? "1 Angebot" : `${t.anzahl} Angebote`;
          return (
            <li key={t.tag}>
              <button
                type="button"
                className={`el-band__tag${t.wochenende ? " ist-wochenende" : ""}${t.heute ? " ist-heute" : ""}`}
                aria-pressed={aktiv}
                aria-label={`${t.heute ? "Heute, " : ""}${tagText(t.tag)}: ${text}`}
                disabled={t.anzahl === 0 && !aktiv}
                onClick={() => waehlen(aktiv ? undefined : t.tag)}
              >
                <span className="el-band__monat">{i === 0 || t.tag.endsWith("-01") ? monat.format(datum).replace(".", "") : ""}</span>
                <span className="el-band__wt">{wochentag.format(datum).replace(".", "")}</span>
                <span className="el-band__raum">
                  <span className="el-band__saeule" style={{ ["--hoehe" as string]: `${(t.anzahl / hoechste) * 100}%` } as CSSProperties} />
                </span>
                <span className="el-band__datum">{Number(t.tag.slice(8))}</span>
                <span className="el-band__zahl">{t.anzahl > 0 ? t.anzahl : ""}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
