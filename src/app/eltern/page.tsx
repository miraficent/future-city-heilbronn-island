import "../eltern.css";
import { kurzname } from "@/components/einrichtung-badge";
import { ElternKopf } from "@/components/eltern/kopf";
import { ElternSuche } from "@/components/eltern/suche";
import { ElternInfos } from "@/components/eltern-infos";
import { KindWuensche } from "@/components/kind-wuensche";
import { Seitenrahmen } from "@/components/seitenrahmen";
import { WunschBox } from "@/components/wunsch-box";
import { META, oeffentlicheAngebote } from "@/lib/daten";

export const metadata = {
  title: "Für Eltern – Kurse zu KI, Coding und Gaming",
  description: "Alle Kurse zu KI, Coding und Gaming für Kinder in Heilbronn: suchen, filtern, direkt beim Anbieter anmelden.",
};

/**
 * Eltern-Bereich: kurzer Kopf, Wünsche des Kindes, Suche mit Filtern, danach alle Hintergrundinfos.
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
        <WunschBox themen={META.themen} modus="eltern" />
        <ElternInfos />
      </main>
    </Seitenrahmen>
  );
}
