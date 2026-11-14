import { Kinderreise } from "@/components/kinderreise/kinderreise";
import { META, oeffentlicheAngebote } from "@/lib/daten";
import { isForKids } from "@/lib/events";
import kategorien from "@/data/categories.json";
import liveEvents from "@/data/events.json";
import type { Category, LiveEvent } from "@/types";

export const metadata = { title: "Heilbronn entdecken – für Kinder" };

/**
 * Kinder-Modus: volle Breite, ohne Seitenrahmen – Karte, Mia und Entscheidungs-Spiele.
 * Live-Events werden schon hier (auf dem Server) auf Kinder-Events gefiltert:
 * „zur Prüfung“ markierte Einträge erreichen das Kindergerät gar nicht.
 */
export default function Kinder() {
  const fuerKinder = (liveEvents as LiveEvent[]).filter(isForKids);
  return (
    <main id="inhalt" className="kr-vollbild">
      <Kinderreise
        angebote={oeffentlicheAngebote()}
        events={fuerKinder}
        kategorien={kategorien as Category[]}
        quellen={META.quellen}
        jetzt={META.aktualisiert}
      />
    </main>
  );
}
