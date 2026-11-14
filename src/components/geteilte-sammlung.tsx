"use client";

import { useMemo } from "react";
import type { Angebot } from "@/lib/angebot";
import type { Meta } from "@/lib/daten";
import { elternSuche, LEERER_ELTERN_FILTER } from "@/lib/eltern-suche";
import { useBrowserKann, useJetzt, useUrlParameter } from "./browser-werte";
import { ElternKarte } from "./eltern/angebot-karte";
import { useSammlung } from "./sammlung";
import { Button, EmptyState } from "./ui";

const MAX_IDS = 30;

/**
 * Zeigt eine geteilte Merkliste (Link aus „Als Link teilen“ im Eltern-Bereich).
 * Der Link enthält nur Angebots-Kennungen – keinen Namen, kein Alter, keine anderen Daten.
 */
export function GeteilteSammlung({ angebote, meta }: { angebote: Angebot[]; meta: Meta }) {
  const roh = useUrlParameter("ids");
  const imBrowser = useBrowserKann(() => true);
  const jetzt = useJetzt(meta.aktualisiert);
  const merk = useSammlung("eltern");

  const treffer = useMemo(() => {
    const ids = new Set((roh ?? "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, MAX_IDS));
    return elternSuche(angebote.filter((a) => ids.has(a.id)), LEERER_ELTERN_FILTER, new Date(jetzt));
  }, [roh, angebote, jetzt]);

  return (
    <main id="inhalt" className="el-seite">
      <header className="el-kopf">
        <p className="el-oben">Geteilte Merkliste</p>
        <h1>Diese Angebote hat jemand für Sie ausgesucht</h1>
        <p className="el-kopf__text">Schauen Sie sie in Ruhe an. Die Anmeldung läuft immer direkt beim Anbieter – über „Zur Anmeldung“ auf jeder Karte.</p>
      </header>

      {!imBrowser ? (
        <p className="mt-8">Auswahl wird geladen …</p>
      ) : treffer.length > 0 ? (
        <div className="mt-8">
          <ul className="el-liste">
            {treffer.map((t) => (
              <li key={t.angebot.id}>
                <ElternKarte angebot={t.angebot} termin={t.termin} weitere={t.weitere} meta={meta} jetzt={jetzt} gemerkt={merk.ids.includes(t.angebot.id)} merken={merk.merken} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState text="In diesem Link ist keine gültige Auswahl mehr. Vielleicht sind die Termine schon vorbei." />
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Button variante="primary" icon="search" href="/eltern/#suche">Alle Angebote durchsuchen</Button>
      </div>
      <p className="el-stand">Der Link enthält nur Kennungen der Angebote – keine Namen, kein Alter, keine anderen Daten.</p>
    </main>
  );
}
