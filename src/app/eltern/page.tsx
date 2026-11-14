import "../eltern.css";
import { kurzname } from "@/components/einrichtung-badge";
import { ElternKopf } from "@/components/eltern/kopf";
import { KalenderAbo } from "@/components/eltern/kalender-abo";
import { ElternSuche } from "@/components/eltern/suche";
import { ElternInfos } from "@/components/eltern-infos";
import { KindWuensche } from "@/components/kind-wuensche";
import { Seitenrahmen } from "@/components/seitenrahmen";
import { WunschBox } from "@/components/wunsch-box";
import liveEvents from "@/data/events.json";
import { META, oeffentlicheAngebote } from "@/lib/daten";
import { elternSuche, LEERER_ELTERN_FILTER } from "@/lib/eltern-suche";
import { isForKids } from "@/lib/events";
import type { LiveEvent } from "@/types";

export const metadata = {
  title: "Für Eltern – Kurse zu KI, Coding und Gaming",
  description: "Alle Kurse zu KI, Coding und Gaming für Kinder in Heilbronn: suchen, filtern, direkt beim Anbieter anmelden.",
};

/** Eltern-Bereich: kurzer Kopf, Wünsche des Kindes, Suche mit Filtern, danach alle Hintergrundinfos. */
export default function Eltern() {
  const jetzt = new Date().toISOString();
  const angebote = oeffentlicheAngebote();
  const kommende = elternSuche(angebote, LEERER_ELTERN_FILTER, new Date(jetzt));
  const einrichtungen = Object.fromEntries(META.quellen.map((q) => [q.id, kurzname(q, q.id)]));
  // Nur Events, die Kinder überhaupt wünschen können – so bleibt die Datenmenge im Browser klein.
  const kinderEvents = (liveEvents as LiveEvent[]).filter(isForKids);

  return (
    <Seitenrahmen modus="eltern">
      <main id="inhalt" className="el-seite">
        <ElternKopf
          anzahl={kommende.length}
          kostenlos={kommende.filter((t) => t.angebot.kosten.euro === 0).length}
          einrichtungen={Object.values(einrichtungen)}
          stand={META.aktualisiert}
        />
        <KindWuensche angebote={angebote} liveEvents={kinderEvents} einrichtungen={einrichtungen} jetzt={jetzt} />
        <ElternSuche angebote={angebote} meta={META} jetzt={jetzt} />
        <KalenderAbo themen={META.themen} />
        <WunschBox themen={META.themen} modus="eltern" />
        <ElternInfos />
      </main>
    </Seitenrahmen>
  );
}
