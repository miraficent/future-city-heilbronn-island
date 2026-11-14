"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Angebot } from "@/lib/angebot";
import type { Meta } from "@/lib/daten";
import { Angebotskarte } from "./angebotskarte";
import { useSammlung } from "./sammlung";
import { Symbol } from "./symbol";

const MAX_IDS = 30;

/** Zeigt eine per Link oder QR-Code geteilte Auswahl. Der Link enthält nur Angebots-Kennungen. */
export function GeteilteSammlung({ angebote, meta }: { angebote: Angebot[]; meta: Meta }) {
  const [ids, setIds] = useState<string[] | null>(null);
  const [jetzt, setJetzt] = useState(meta.aktualisiert);
  const merk = useSammlung("eltern");

  useEffect(() => {
    const roh = new URLSearchParams(window.location.search).get("ids") ?? "";
    const bekannt = new Set(angebote.map((a) => a.id));
    setIds(
      roh
        .split(",")
        .map((s) => s.trim())
        .filter((id) => bekannt.has(id))
        .slice(0, MAX_IDS),
    );
    setJetzt(new Date().toISOString());
  }, [angebote]);

  const auswahl = ids ? angebote.filter((a) => ids.includes(a.id)) : [];

  return (
    <main id="inhalt" className="mx-auto max-w-6xl px-5 pt-10 sm:px-8">
      <p className="spiel-kennung">Geteilt aus der COSMOS-Spielwelt</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">Diese Kurse möchte jemand ausprobieren</h1>
      <p className="mt-3 max-w-2xl text-lg">
        Schaut sie euch gemeinsam an. Die Anmeldung läuft immer direkt beim Veranstalter – über den Link auf jeder Karte.
      </p>
      {ids === null ? (
        <p className="mt-8">Auswahl wird geladen …</p>
      ) : auswahl.length ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {auswahl.map((a) => (
            <Angebotskarte key={a.id} angebot={a} meta={meta} modus="eltern" gemerkt={merk.ids.includes(a.id)} merken={merk.merken} jetzt={jetzt} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border-2 border-dashed border-tinte p-8 text-center">
          <Symbol name="info" className="mx-auto !size-10" />
          <p className="mt-3">In diesem Link ist keine (mehr) gültige Auswahl. Vielleicht sind die Kurse schon vorbei.</p>
        </div>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link className="knopf knopf-primaer" href="/eltern/"><Symbol name="search" /> Alle Angebote durchsuchen</Link>
        <Link className="knopf" href="/einrichtungen/"><Symbol name="map" /> Karte der Lernorte</Link>
      </div>
      <p className="mt-6 text-sm text-tinte-2">Der Link enthält nur Kurs-Kennungen – keinen Namen, kein Alter, keine Spieldaten.</p>
    </main>
  );
}
