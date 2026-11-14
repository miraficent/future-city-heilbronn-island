import { Seitenrahmen } from "@/components/seitenrahmen";
import { HeilbronnAbenteuer } from "@/components/spiel/heilbronn-abenteuer";
import { META, oeffentlicheAngebote } from "@/lib/daten";

export const metadata = { title: "Heilbronn-Abenteuer – bau die COSMOS-Rakete" };

export default function Kind() {
  return (
    <Seitenrahmen modus="kind">
      <HeilbronnAbenteuer angebote={oeffentlicheAngebote()} meta={META} jetzt={META.aktualisiert} />
    </Seitenrahmen>
  );
}
