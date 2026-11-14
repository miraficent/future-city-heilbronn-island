import { Pruefliste } from "@/components/pruefliste";
import { Seitenrahmen } from "@/components/seitenrahmen";

export const metadata = { title: "Veranstaltungen prüfen" };

/** Prüfliste für das Team – die Live-Events lädt der Browser aus Mobilizon (components/pruefliste.tsx). */
export default function Pruefen() {
  return (
    <Seitenrahmen modus="eltern">
      <main id="inhalt" className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
        <Pruefliste />
      </main>
    </Seitenrahmen>
  );
}
