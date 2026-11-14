import { KartenSeiteLive } from "@/components/kinder/live-karten";
import { META } from "@/lib/daten";
import { kartenOrte } from "@/lib/kinderkarte";

export const metadata = { title: "Heilbronn entdecken – für Kinder" };

/**
 * Kinder-Karte. Gezeigt werden nur Live-Events, die der Browser bei jedem Aufruf aus Mobilizon lädt
 * (KartenSeiteLive → isForKids). Die Kurse aus daten/angebote.json erscheinen hier bewusst nicht.
 */
export default function Kinder() {
  return (
    <main id="inhalt">
      <KartenSeiteLive orte={kartenOrte(META.quellen)} />
    </main>
  );
}
