import { Kinderreise } from "@/components/kinderreise/kinderreise";
import { META, oeffentlicheAngebote } from "@/lib/daten";

export const metadata = { title: "Heilbronn entdecken – für Kinder" };

/** Kinder-Modus: volle Breite, ohne Seitenrahmen – Karte, Lumi und Entscheidungs-Spiele. */
export default function Kinder() {
  return (
    <main id="inhalt" className="kr-vollbild">
      <Kinderreise angebote={oeffentlicheAngebote()} quellen={META.quellen} jetzt={META.aktualisiert} />
    </main>
  );
}
