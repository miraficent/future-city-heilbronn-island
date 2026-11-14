"use client";

import { useMemo } from "react";
import type { Angebot } from "@/lib/angebot";
import type { Meta } from "@/lib/daten";
import { elternSuche, LEERER_ELTERN_FILTER } from "@/lib/eltern-suche";
import { useBrowserKann, useJetzt, useUrlParameter } from "./browser-werte";
import { ElternKarte } from "./eltern/angebot-karte";
import { useElternDaten } from "./eltern/daten";
import { useTexte } from "./eltern/sprache";
import { useSammlung } from "./sammlung";
import { Button, EmptyState } from "./ui";

const MAX_IDS = 30;

/**
 * Zeigt eine geteilte Merkliste (Link aus „Als Link teilen“ im Eltern-Bereich) – Kurse und Live-Events.
 * Der Link enthält nur Angebots-Kennungen – keinen Namen, kein Alter, keine anderen Daten.
 */
export function GeteilteSammlung({ angebote: kurse, meta: grundMeta }: { angebote: Angebot[]; meta: Meta }) {
  const roh = useUrlParameter("ids");
  const imBrowser = useBrowserKann(() => true);
  const jetzt = useJetzt(grundMeta.aktualisiert);
  const merk = useSammlung("eltern");
  const t = useTexte().sammlung;
  const { status, alle, meta } = useElternDaten(kurse, grundMeta);

  const treffer = useMemo(() => {
    const ids = new Set((roh ?? "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, MAX_IDS));
    return elternSuche(alle.filter((a) => ids.has(a.id)), LEERER_ELTERN_FILTER, new Date(jetzt));
  }, [roh, alle, jetzt]);

  return (
    <main id="inhalt" className="el-seite">
      <header className="el-kopf">
        <p className="el-oben">{t.oben}</p>
        <h1>{t.titel}</h1>
        <p className="el-kopf__text">{t.text}</p>
      </header>

      {!imBrowser || (status === "laedt" && treffer.length === 0) ? (
        <p className="mt-8">{t.laedt}</p>
      ) : treffer.length > 0 ? (
        <div className="mt-8">
          <ul className="el-liste">
            {treffer.map((x) => (
              <li key={x.angebot.id}>
                <ElternKarte angebot={x.angebot} termin={x.termin} weitere={x.weitere} meta={meta} jetzt={jetzt} gemerkt={merk.ids.includes(x.angebot.id)} merken={merk.merken} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState text={t.leer} />
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Button variante="primary" icon="search" href="/eltern/#suche">{t.alle}</Button>
      </div>
      <p className="el-stand">{t.fuss}</p>
    </main>
  );
}
