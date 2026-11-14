"use client";

import type { Angebot } from "@/lib/angebot";
import type { Meta } from "@/lib/daten";
import { elternSuche, LEERER_ELTERN_FILTER } from "@/lib/eltern-suche";
import { useJetzt } from "../browser-werte";
import { kurzname } from "../einrichtung-badge";
import { Symbol } from "../symbol";
import { useElternDaten } from "./daten";

/** Kopf der Eltern-Seite: kurz, damit die Wünsche des Kindes auf dem Handy gleich sichtbar sind. */
export function ElternKopf({ angebote, meta, jetzt: start }: { angebote: Angebot[]; meta: Meta; jetzt: string }) {
  const jetzt = useJetzt(start);
  const { status, alle } = useElternDaten(angebote, meta);
  const kommende = elternSuche(alle, LEERER_ELTERN_FILTER, new Date(jetzt));
  const namen = meta.quellen.map((q) => kurzname(q, q.id));
  const aufgezaehlt = namen.length > 1 ? `${namen.slice(0, -1).join(", ")} und ${namen.at(-1)}` : namen.join("");
  return (
    <header className="el-kopf">
      <p className="el-oben"><Symbol name="users" /> Für Eltern und Fachkräfte</p>
      <h1>Kurse zu KI, Coding und Gaming für Ihr Kind</h1>
      <p className="el-kopf__text">
        Alle Angebote von {aufgezaehlt} in Heilbronn an einem Ort. Sie finden hier, was passt – und melden Ihr Kind direkt beim Anbieter an.
      </p>
      <ul className="el-fakten" aria-label="Auf einen Blick">
        {status === "laedt" && alle.length === 0 ? (
          <li className="el-fakt"><Symbol name="refresh" />Termine werden geladen …</li>
        ) : (
          <>
            <li className="el-fakt"><Symbol name="calendar" /><strong>{kommende.length}</strong> kommende Termine</li>
            <li className="el-fakt"><Symbol name="euro" /><strong>{kommende.filter((t) => t.angebot.kosten.euro === 0).length}</strong> davon kostenlos</li>
          </>
        )}
        <li className="el-fakt el-fakt--extra"><Symbol name="building" /><strong>{meta.quellen.length}</strong> Einrichtungen</li>
        <li className="el-fakt el-fakt--extra"><Symbol name="check" />Ohne Konto, ohne Tracking</li>
      </ul>
    </header>
  );
}
