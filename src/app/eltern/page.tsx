import { Entdecker } from "@/components/entdecker";
import { Seitenrahmen } from "@/components/seitenrahmen";
import { META, oeffentlicheAngebote } from "@/lib/daten";
import { Elternbericht } from "@/components/spiel/elternbericht";
export const metadata = { title: "Angebote für Familien und Fachkräfte" };
export default function Eltern() {
  return <Seitenrahmen modus="eltern"><main id="inhalt"><Entdecker eingebettet modus="eltern" angebote={oeffentlicheAngebote()} meta={META} jetzt={META.aktualisiert} /><Elternbericht angebote={oeffentlicheAngebote()} meta={META} jetzt={META.aktualisiert}/></main></Seitenrahmen>;
}
