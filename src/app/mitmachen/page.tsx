import { MitmachenFormular } from "@/components/mitmachen-formular";
import { Seitenrahmen } from "@/components/seitenrahmen";
import { Symbol } from "@/components/symbol";
import { Card } from "@/components/ui";

export const metadata = { title: "Mitmachen – neue Orte für Heilbronn Island" };

const VORAUSSETZUNGEN = [
  "Ihr bietet Kurse, Workshops oder Veranstaltungen für Kinder oder Jugendliche in Heilbronn an.",
  "Eure Angebote stehen online – am besten als Kalender (iCal) oder auf einer Webseite mit festem Aufbau.",
  "Bei jedem Angebot steht ein Alter (z. B. „8–12 Jahre“) – sonst zeigen wir es Kindern nicht.",
  "Die Anmeldung läuft weiter über eure eigene Webseite. Wir leiten nur dorthin.",
];

/** Mitmach-Seite (DESIGN.md § Pages 8): für neue Einrichtungen. Formular ohne Server. */
export default function Mitmachen() {
  return (
    <Seitenrahmen modus="eltern">
      <main id="inhalt">
        <section className="seite-nacht">
          <div className="seite-inhalt">
            <h1 className="font-display text-4xl font-bold">Willst du unsere Stadt erweitern?</h1>
            <p className="mt-3 max-w-[60ch] text-lg">
              Jede neue Einrichtung bekommt ein eigenes Haus auf der Kinder-Karte – automatisch, sobald sie in unserer Quellenliste steht.
            </p>
          </div>
        </section>
        <div className="seite-inhalt grid gap-8 md:grid-cols-2">
          <Card>
            <h2 className="font-display text-2xl font-bold">Das braucht es</h2>
            <ul className="mitmachen__liste mt-4">
              {VORAUSSETZUNGEN.map((v) => (
                <li key={v}><Symbol name="check" /><span>{v}</span></li>
              ))}
            </ul>
          </Card>
          <Card>
            <h2 className="font-display text-2xl font-bold">Kontakt aufnehmen</h2>
            <MitmachenFormular />
          </Card>
        </div>
      </main>
    </Seitenrahmen>
  );
}
