import { Entdecker } from "@/components/entdecker";
import { ElternInfos } from "@/components/eltern-infos";
import { Seitenrahmen } from "@/components/seitenrahmen";
import { META, oeffentlicheAngebote } from "@/lib/daten";
import { Elternbericht } from "@/components/spiel/elternbericht";

export const metadata = { title: "Angebote für Familien und Fachkräfte" };

/** Eltern-Bereich: Suche mit allen Filtern, Bericht aus der Spielsitzung, danach alle Hintergrundinfos. */
export default function Eltern() {
  const angebote = oeffentlicheAngebote();
  return (
    <Seitenrahmen modus="eltern">
      <main id="inhalt">
        <Entdecker eingebettet modus="eltern" angebote={angebote} meta={META} jetzt={META.aktualisiert} />
        <Elternbericht angebote={angebote} meta={META} jetzt={META.aktualisiert} />
        <ElternInfos />
      </main>
    </Seitenrahmen>
  );
}
