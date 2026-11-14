import { Entdecker } from "@/components/entdecker";
import { Seitenrahmen } from "@/components/seitenrahmen";
import { META, oeffentlicheAngebote } from "@/lib/daten";

export const metadata = { title: "Teens – dein nächster Skill" };

export default function Teen() {
  return (
    <Seitenrahmen modus="teen">
      <Entdecker modus="teen" angebote={oeffentlicheAngebote()} meta={META} jetzt={META.aktualisiert} />
    </Seitenrahmen>
  );
}
