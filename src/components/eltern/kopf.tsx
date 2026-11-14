"use client";

import type { CSSProperties } from "react";
import type { Angebot } from "@/lib/angebot";
import type { Meta } from "@/lib/daten";
import { elternSuche, kurzTitel, LEERER_ELTERN_FILTER, tagSchluessel, type ElternFilter } from "@/lib/eltern-suche";
import { formatTag, formatZeit } from "@/lib/format";
import { slugAusId } from "@/lib/routen";
import { useJetzt } from "../browser-werte";
import { kurzname } from "../einrichtung-badge";
import { Symbol } from "../symbol";
import { DatumBlock } from "./datum-block";
import { useElternDaten } from "./daten";

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
  const { status, alle, meta } = useElternDaten(angebote, grundMeta);
  const kommende = elternSuche(alle, LEERER_ELTERN_FILTER, new Date(jetzt));
  const namen = grundMeta.quellen.map((q) => kurzname(q, q.id));
  const aufgezaehlt = namen.length > 1 ? `${namen.slice(0, -1).join(", ")} und ${namen.at(-1)}` : namen.join("");
  // Die drei häufigsten Themen als Schnellknöpfe
  const themen = [...meta.themen]
    .map((t) => ({ ...t, anzahl: kommende.filter((k) => k.angebot.themen.includes(t.id)).length }))
    .sort((x, y) => y.anzahl - x.anzahl)
    .slice(0, 3);
  const demnaechst = kommende.slice(0, 3);
  const laedt = status === "laedt" && alle.length === 0;

  return (
    <header className="el-kopf el-kopf--gross">
      <div>
        <p className="el-oben"><Symbol name="users" /> Für Eltern und Fachkräfte</p>
        <h1>Kurse zu KI, Coding und Gaming für Ihr Kind</h1>
        <p className="el-kopf__text">
          Alle Angebote von {aufgezaehlt} in Heilbronn an einem Ort. Sie finden hier, was passt – und melden Ihr Kind direkt beim Anbieter an.
        </p>
        <div className="el-schnell">
          <p className="el-schnell__titel">Schnell finden</p>
          <div className="el-chips">
            {themen.map((t) => (
              <button key={t.id} type="button" className="el-chip" style={{ ["--farbe" as string]: t.farbe } as CSSProperties} onClick={() => schnellFiltern({ themen: [t.id] })}>
                <span className="el-chip__punkt" aria-hidden="true" />{t.name}
              </button>
            ))}
            <button type="button" className="el-chip" onClick={() => schnellFiltern({ nurKostenlos: true })}><Symbol name="euro" />Kostenlos</button>
            <button type="button" className="el-chip" onClick={() => schnellFiltern({ wochentage: "wochenende" })}><Symbol name="sun" />Am Wochenende</button>
            <button type="button" className="el-chip" onClick={() => schnellFiltern({ zeitraum: "woche" })}><Symbol name="clock" />Nächste 7 Tage</button>
          </div>
        </div>
        <ul className="el-fakten" aria-label="Auf einen Blick">
          {laedt ? (
            <li className="el-fakt"><Symbol name="refresh" />Termine werden geladen …</li>
          ) : (
            <>
              <li className="el-fakt"><Symbol name="calendar" /><strong>{kommende.length}</strong> kommende Termine</li>
              <li className="el-fakt"><Symbol name="euro" /><strong>{kommende.filter((t) => t.angebot.kosten.euro === 0).length}</strong> davon kostenlos</li>
            </>
          )}
          <li className="el-fakt el-fakt--extra"><Symbol name="check" />Ohne Konto, ohne Tracking</li>
        </ul>
      </div>

      <section className="el-demnaechst" aria-labelledby="demnaechst-titel">
        <h2 id="demnaechst-titel"><Symbol name="sparkles" /> Demnächst in Heilbronn</h2>
        {demnaechst.length === 0 ? (
          <p className="el-demnaechst__leer">{laedt ? "Die nächsten Termine werden geladen …" : "Gerade sind keine Termine eingetragen."}</p>
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
                    <span>{formatTag(termin.start)}, {formatZeit(termin.start)} Uhr · {kurzname(quelle, a.quelle)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <button type="button" className="el-textknopf" onClick={() => schnellFiltern({})}>Alle Termine ansehen <Symbol name="arrow" /></button>
      </section>
    </header>
  );
}
