import { Entdecker } from "@/components/entdecker";
import { Seitenrahmen } from "@/components/seitenrahmen";
import { META, oeffentlicheAngebote } from "@/lib/daten";
import { Lerninsel } from "@/components/spiel/lerninsel";
export const metadata = { title: "Dein nächster Skill" };
export default function Teen() {
  return <Seitenrahmen modus="teen"><Lerninsel startAlter={14} angebote={oeffentlicheAngebote()} meta={META} jetzt={new Date().toISOString()}/><details className="teen-katalog"><summary>Kurse direkt durchsuchen</summary><Entdecker eingebettet modus="teen" angebote={oeffentlicheAngebote()} meta={META} jetzt={new Date().toISOString()} /></details></Seitenrahmen>;
}
