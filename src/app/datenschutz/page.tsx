import { DatenschutzInhalt } from "@/components/eltern/datenschutz-inhalt";
import { Seitenrahmen } from "@/components/seitenrahmen";

export const metadata = { title: "Datenschutz", description: "Kein Konto, keine Cookies, kein Tracking – kurz erklärt." };

/** Datenschutz in kurzen Sätzen; Texte in beiden Sprachen stehen in src/components/eltern/texte.ts. */
export default function Datenschutz() {
  return (
    <Seitenrahmen>
      <DatenschutzInhalt />
    </Seitenrahmen>
  );
}
