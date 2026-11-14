import { Seitenrahmen } from "@/components/seitenrahmen";
import { Spielwelt } from "@/components/spiel/spielwelt";
import { META, oeffentlicheAngebote } from "@/lib/daten";

export const metadata = { title: "Spielwelt – bau die COSMOS-Rakete" };

export default function Kind() {
  return (
    <Seitenrahmen modus="kind">
      <Spielwelt angebote={oeffentlicheAngebote()} meta={META} jetzt={META.aktualisiert} />
    </Seitenrahmen>
  );
}
