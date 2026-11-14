"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { kurzname } from "@/components/einrichtung-badge";
import { Symbol } from "@/components/symbol";
import { Card } from "@/components/ui";
import { META } from "@/lib/daten";
import { useTexte } from "./eltern/sprache";

/**
 * „Gut zu wissen“ für Eltern: Anmeldung, Alter, Wünsche, Datenschutz, woher die Daten kommen,
 * häufige Fragen und die offiziellen Seiten der Einrichtungen. Kurze Sätze, Sie-Form (bzw. Englisch).
 */

/** Die Angebotsseiten, die die aim-Challenge als Quellen nennt. */
const QUELLEN_LINKS: Record<string, Array<{ text: string; url: string }>> = {
  aim: [
    { text: "Lernen in Ferien & Freizeit", url: "https://www.aim-akademie.org/kurse?kathaupt=18&suchesetzen=false&kfs_sonderrubrik=1264" },
    { text: "Digitale Bildung", url: "https://www.aim-akademie.org/kurse?kathaupt=18&suchesetzen=false&kfs_sonderrubrik=1277" },
    { text: "Juniorakademie", url: "https://www.aim-akademie.org/kurse/suche?clearallkatfilter=true&suchesetzen=true&kfs_stichwort_schlagwort=juniorakademie&kfs_sonderrubrik=-1&kfs_ort_select=-1&kfs_kennz=&kfs_veranartselect=-1&kfs_aussenst_select=-1&kfs_kursbereich=-1&kfs_beginn_dat1=&kfs_beginn_dat2=" },
    { text: "Coding", url: "https://www.aim-akademie.org/kurse?kathaupt=18&suchesetzen=false&kfs_kursbereich=1278&kfs_sonderrubrik=1277" },
  ],
  experimenta: [{ text: "Lernen", url: "https://www.experimenta.science/lernen/" }],
  hdf: [
    { text: "Kinder & Jugendliche", url: "https://hdf-hn.de/kinder-jugendliche/" },
    { text: "Digitale Familienwerkstatt", url: "https://hdf-hn.de/angebote/digitale-familienwerkstatt/" },
  ],
  ipai: [{ text: "Veranstaltungen", url: "https://ipai-foundation.ai/#events" }],
};

export function ElternInfos() {
  const t = useTexte().infos;
  const einrichtungen = META.quellen.map((q) => kurzname(q, q.id));

  return (
    <div>
      <section id="gut-zu-wissen" aria-labelledby="wissen-titel" className="el-infoteil">
        <h2 id="wissen-titel">{t.titel}</h2>
        <p className="el-infoteil__unter">{t.unter}</p>
        <div className="el-wissen">
          {t.wissen.map((w) => (
            <Card key={w.titel}>
              <span className={`el-symbolkreis${w.symbol === "heart" ? " el-symbolkreis--wunsch" : ""}`}><Symbol name={w.symbol} /></span>
              <h3>{w.titel}</h3>
              <p>{w.text}</p>
            </Card>
          ))}
          <Card>
            <span className="el-symbolkreis"><Symbol name="check" /></span>
            <h3>{t.datenschutzTitel}</h3>
            <p>{t.datenschutzText} <Link href="/datenschutz/">{t.datenschutzLink}</Link></p>
          </Card>
        </div>
      </section>

      <section aria-labelledby="daten-titel" className="el-infoteil">
        <h2 id="daten-titel" className="el-titel">{t.datenTitel}</h2>
        <ol className="el-datenweg">
          {t.datenweg.map((s) => (
            <li key={s.titel}><span><strong>{s.titel}</strong>{s.text(einrichtungen.join(", "))}</span></li>
          ))}
        </ol>
        <p className="el-stand">
          <Symbol name="info" />
          <span>{t.stand}</span>
        </p>
      </section>

      <section aria-labelledby="fragen-titel" className="el-infoteil">
        <h2 id="fragen-titel" className="el-titel">{t.fragenTitel}</h2>
        <div className="el-fragen">
          {t.fragen.map((f) => (
            <details key={f.frage}>
              <summary>{f.frage}<Symbol name="plus" /></summary>
              <p>{f.antwort}</p>
            </details>
          ))}
          <details>
            <summary>{t.neuFrage}<Symbol name="plus" /></summary>
            <p>{t.neuAntwort} <Link href="/mitmachen/">{t.neuLink}</Link></p>
          </details>
        </div>
      </section>

      <section aria-labelledby="orte-titel" className="el-infoteil">
        <h2 id="orte-titel" className="el-titel">{t.orteTitel}</h2>
        <p className="el-infoteil__unter">{t.orteUnter}</p>
        <div className="el-orte">
          {META.quellen.map((q) => (
            <article key={q.id} className="el-ort" style={{ ["--farbe" as string]: q.farbe } as CSSProperties}>
              <h3>{kurzname(q, q.id)}</h3>
              <p lang="de">{q.name}</p>
              {q.adresse && <p><Symbol name="pin" className="mr-1 inline !size-4 align-[-2px]" />{q.adresse}</p>}
              <ul>
                {(QUELLEN_LINKS[q.id] ?? [{ text: t.website, url: q.website }]).map((l) => (
                  <li key={l.url}><a href={l.url} target="_blank" rel="noopener noreferrer"><Symbol name="external" />{t.links[l.text] ?? l.text}</a></li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
