"use client";

import type { CSSProperties } from "react";
import type { Angebot } from "@/lib/angebot";
import type { Meta } from "@/lib/daten";
import { elternSuche, kurzTitel, LEERER_ELTERN_FILTER, tagSchluessel, type ElternFilter } from "@/lib/eltern-suche";
import { slugAusId } from "@/lib/routen";
import { useJetzt } from "../browser-werte";
import { kurzname } from "../einrichtung-badge";
import { Symbol } from "../symbol";
import { DatumBlock } from "./datum-block";
import { useElternDaten } from "./daten";
import { datum, useSprache } from "./sprache";
import { TEXTE } from "./texte";

/** Ereignis, mit dem der Kopf einen Filter in der Suche setzt (siehe ElternSuche). */
export const FILTER_EREIGNIS = "cosmos:eltern-filter";

function schnellFiltern(teil: Partial<ElternFilter>) {
  window.dispatchEvent(new CustomEvent(FILTER_EREIGNIS, { detail: teil }));
  document.getElementById("suche")?.scrollIntoView({ block: "start" });
}

/**
 * Kopf der Eltern-Seite: kurzer Text, „Schnell finden“-Knöpfe (setzen einen Filter und springen zur Suche)
 * und „Demnächst in Heilbronn“ mit den nächsten Terminen. Kurz genug, dass die Wünsche auf dem Handy bald folgen.
 */
export function ElternKopf({ angebote, meta: grundMeta, jetzt: start }: { angebote: Angebot[]; meta: Meta; jetzt: string }) {
  const jetzt = useJetzt(start);
  const sprache = useSprache();
  const t = TEXTE[sprache].kopf;
  const d = datum(sprache);
  const { status, alle, meta } = useElternDaten(angebote, grundMeta);
  const kommende = elternSuche(alle, LEERER_ELTERN_FILTER, new Date(jetzt));
  const namen = grundMeta.quellen.map((q) => kurzname(q, q.id));
  const aufgezaehlt = namen.length > 1 ? `${namen.slice(0, -1).join(", ")} ${t.und} ${namen.at(-1)}` : namen.join("");
  // Die drei häufigsten Themen als Schnellknöpfe
  const themen = [...meta.themen]
    .map((x) => ({ ...x, anzahl: kommende.filter((k) => k.angebot.themen.includes(x.id)).length }))
    .sort((x, y) => y.anzahl - x.anzahl)
    .slice(0, 3);
  const demnaechst = kommende.slice(0, 3);
  const laedt = status === "laedt" && alle.length === 0;

  return (
    <header className="el-kopf el-kopf--gross">
      <div>
        <p className="el-oben"><Symbol name="users" /> {t.oben}</p>
        <h1>{t.titel}</h1>
        <p className="el-kopf__text">{t.text(aufgezaehlt)}</p>
        <div className="el-schnell">
          <p className="el-schnell__titel">{t.schnell}</p>
          <div className="el-chips">
            {themen.map((x) => (
              <button key={x.id} type="button" className="el-chip" style={{ ["--farbe" as string]: x.farbe } as CSSProperties} onClick={() => schnellFiltern({ themen: [x.id] })}>
                <span className="el-chip__punkt" aria-hidden="true" />{x.name}
              </button>
            ))}
            <button type="button" className="el-chip" onClick={() => schnellFiltern({ nurKostenlos: true })}><Symbol name="euro" />{t.kostenlos}</button>
            <button type="button" className="el-chip" onClick={() => schnellFiltern({ wochentage: "wochenende" })}><Symbol name="sun" />{t.wochenende}</button>
            <button type="button" className="el-chip" onClick={() => schnellFiltern({ zeitraum: "woche" })}><Symbol name="clock" />{t.sieben}</button>
          </div>
        </div>
        <ul className="el-fakten" aria-label={t.blick}>
          {laedt ? (
            <li className="el-fakt"><Symbol name="refresh" />{t.laedt}</li>
          ) : (
            <>
              <li className="el-fakt"><Symbol name="calendar" /><strong>{kommende.length}</strong> {t.kommende}</li>
              <li className="el-fakt"><Symbol name="euro" /><strong>{kommende.filter((x) => x.angebot.kosten.euro === 0).length}</strong> {t.davonKostenlos}</li>
            </>
          )}
          <li className="el-fakt el-fakt--extra"><Symbol name="check" />{t.ohneKonto}</li>
        </ul>
      </div>

      <section className="el-demnaechst" aria-labelledby="demnaechst-titel">
        <h2 id="demnaechst-titel"><Symbol name="sparkles" /> {t.demnaechst}</h2>
        {demnaechst.length === 0 ? (
          <p className="el-demnaechst__leer">{laedt ? t.demnaechstLaedt : t.demnaechstLeer}</p>
        ) : (
          <ul>
            {demnaechst.map(({ angebot: a, termin }) => {
              const quelle = grundMeta.quellen.find((q) => q.id === a.quelle);
              const event = a.id.startsWith("ev:");
              return (
                <li key={a.id}>
                  <DatumBlock klein iso={termin.start} heute={tagSchluessel(termin.start) === tagSchluessel(jetzt)} />
                  <div>
                    <a href={event ? a.url : `/angebot/${slugAusId(a.id)}/`} {...(event ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{kurzTitel(a.titel)}</a>
                    <span>{d.tagKurz(termin.start)}, {d.zeit(termin.start)} · {kurzname(quelle, a.quelle)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <button type="button" className="el-textknopf" onClick={() => schnellFiltern({})}>{t.alleTermine} <Symbol name="arrow" /></button>
      </section>
    </header>
  );
}
