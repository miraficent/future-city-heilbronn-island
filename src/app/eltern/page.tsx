import "../eltern.css";
import { kurzname } from "@/components/einrichtung-badge";
import { Einrichtungen } from "@/components/eltern/einrichtungen";
import { ElternKopf } from "@/components/eltern/kopf";
import { ElternSuche } from "@/components/eltern/suche";
import { WunschAnfrage } from "@/components/eltern/wunsch-anfrage";
import { ElternInfos } from "@/components/eltern-infos";
import { KindWuensche } from "@/components/kind-wuensche";
import { Seitenrahmen } from "@/components/seitenrahmen";
import { META, oeffentlicheAngebote } from "@/lib/daten";

export const metadata = {
  title: "Für Eltern – Kurse und Veranstaltungen in Heilbronn",
  description: "Alle Kurse und Veranstaltungen für Kinder und Jugendliche in Heilbronn: suchen, filtern, direkt beim Anbieter anmelden.",
};

/**
 * Eltern-Bereich: kurzer Kopf, Wünsche des Kindes, Suche mit Kalender und Filtern, „Was fehlt?“,
 * die Einrichtungen mit Bildern und ganz unten die häufigen Fragen.
 * Die Live-Events lädt der Browser aus Mobilizon; vom Server kommen nur die Kurse (falls vorhanden).
 */
export default function Eltern() {
  const jetzt = new Date().toISOString();
  const angebote = oeffentlicheAngebote();
  const einrichtungen = Object.fromEntries(META.quellen.map((q) => [q.id, kurzname(q, q.id)]));

  return (
    <Seitenrahmen modus="eltern">
      <main id="inhalt" className="el-seite">
        <ElternKopf angebote={angebote} meta={META} jetzt={jetzt} />
        <KindWuensche angebote={angebote} einrichtungen={einrichtungen} jetzt={jetzt} />
        <ElternSuche angebote={angebote} meta={META} jetzt={jetzt} />
        <WunschAnfrage angebote={angebote} meta={META} />
        <Einrichtungen />
        <ElternInfos />
      </main>
    </Seitenrahmen>
  );
}
