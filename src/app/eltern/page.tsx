import { Entdecker } from "@/components/entdecker";
import { ElternInfos } from "@/components/eltern-infos";
import { KindWuensche } from "@/components/kind-wuensche";
import { Seitenrahmen } from "@/components/seitenrahmen";
import { META, oeffentlicheAngebote } from "@/lib/daten";

export const metadata = { title: "Angebote für Familien und Fachkräfte" };

/** Eltern-Bereich: Wünsche des Kindes, Suche mit allen Filtern, danach alle Hintergrundinfos. */
export default function Eltern() {
  const angebote = oeffentlicheAngebote();
  const quellenNamen = Object.fromEntries(META.quellen.map((q) => [q.id, q.name.split(/\s[–-]\s/)[0] ?? q.name]));
  return (
    <Seitenrahmen modus="eltern">
      <main id="inhalt">
        <KindWuensche angebote={angebote} quellenNamen={quellenNamen} />
        <Entdecker eingebettet modus="eltern" angebote={angebote} meta={META} jetzt={META.aktualisiert} />
        <ElternInfos />
      </main>
    </Seitenrahmen>
  );
}
