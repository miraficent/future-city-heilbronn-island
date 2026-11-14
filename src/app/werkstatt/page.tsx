import Link from "next/link";
import { Seitenrahmen } from "@/components/seitenrahmen";
import { Werkstatt } from "@/components/werkstatt";
import { META, oeffentlicheAngebote } from "@/lib/daten";
import { STATIONEN } from "@/lib/spiel";

export const metadata = { title: "Lernhaus-Werkstatt – Checkpoints für Einrichtungen" };

export default function WerkstattSeite() {
  return (
    <Seitenrahmen>
      <main id="inhalt" className="mx-auto max-w-7xl px-5 pb-16 pt-12 sm:px-8">
        <p className="font-mono text-xs">FÜR EINRICHTUNGEN · PROTOTYP</p>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold">Lernhaus-Werkstatt</h1>
        <div className="lesetext">
          <p>
            Jede Einrichtung gestaltet ihr Haus in der Spielwelt selbst: Texte, Farbe, Gebäude und welche Lernmodule in welcher
            Reihenfolge erscheinen. Hier lässt sich eine Konfiguration bearbeiten und sofort ausprobieren. Die Prüfung ist dieselbe
            wie beim Bauen der Website.
          </p>
          <p>
            <strong>Diese Seite speichert nichts und sendet nichts.</strong> Änderungen bleiben in diesem Browserfenster. Zum
            Übernehmen die Datei herunterladen, in <code>konfiguration/checkpoints/</code> ablegen und die Website neu bauen
            (Ablauf in <code>docs/pflege.md</code>). Anmeldung je Einrichtung, Freigabe durch eine Redaktion und Versionsverlauf sind
            für einen späteren Betrieb vorgesehen und hier nicht umgesetzt.
          </p>
        </div>
        <Werkstatt vorlagen={STATIONEN} angebote={oeffentlicheAngebote()} themen={META.themen.map((t) => t.id)} jetzt={META.aktualisiert} />
        <p className="mt-10 text-sm"><Link href="/kind/" className="underline">Zur Spielwelt</Link> · <Link href="/projekt/" className="underline">Zum Projektstatus</Link></p>
      </main>
    </Seitenrahmen>
  );
}
