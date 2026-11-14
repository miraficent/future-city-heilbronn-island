import { KartenSeite } from "@/components/kinder/karten-seite";
import { META, oeffentlicheAngebote } from "@/lib/daten";
import { kartenOrte } from "@/lib/kinderkarte";
import { kinderKarten } from "@/lib/kinderkarten";
import liveEvents from "@/data/events.json";
import type { LiveEvent } from "@/types";

export const metadata = { title: "Heilbronn entdecken – für Kinder" };

/**
 * Kinder-Karte. Die Daten (Kurse + Live-Events) werden hier auf dem Server zu Kinderkarten:
 * nur bekanntes Alter, nur Kinder-Zielgruppe, nichts „zur Prüfung“ – der Rest erreicht das Gerät gar nicht.
 */
export default function Kinder() {
  const karten = kinderKarten(oeffentlicheAngebote(), liveEvents as LiveEvent[], new Date(META.aktualisiert));
  return (
    <main id="inhalt">
      <KartenSeite orte={kartenOrte(META.quellen)} karten={karten} />
    </main>
  );
}
