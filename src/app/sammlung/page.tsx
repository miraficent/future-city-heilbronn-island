import { GeteilteSammlung } from "@/components/geteilte-sammlung";
import { Seitenrahmen } from "@/components/seitenrahmen";
import { META, oeffentlicheAngebote } from "@/lib/daten";

export const metadata = { title: "Geteilte Kursauswahl", robots: { index: false } };

export default function Sammlung() {
  return (
    <Seitenrahmen modus="eltern">
      <GeteilteSammlung angebote={oeffentlicheAngebote()} meta={META} />
    </Seitenrahmen>
  );
}
