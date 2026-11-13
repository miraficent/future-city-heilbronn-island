import { Lerninsel } from "@/components/spiel/lerninsel";
import { Seitenrahmen } from "@/components/seitenrahmen";
import { META, oeffentlicheAngebote } from "@/lib/daten";
export const metadata = { title: "Dein 2D-Lernabenteuer" };
export default function Kind() {
  return <Seitenrahmen modus="kind"><Lerninsel angebote={oeffentlicheAngebote()} meta={META} jetzt={new Date().toISOString()} /></Seitenrahmen>;
}
