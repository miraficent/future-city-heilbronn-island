import { Seitenrahmen } from "@/components/seitenrahmen";
import { StyleguideBeispiele } from "@/components/styleguide-beispiele";

export const metadata = { title: "Styleguide – Heilbronn Island" };

/** Alle Farben aus DESIGN.md § Colors – Anzeige über die CSS-Variablen, keine eigenen Werte */
const FARBEN = [
  "night", "night-2", "sea", "sea-shallow", "sea-deep", "land", "land-dark", "sand", "cliff", "paper",
  "primary", "primary-dark", "accent", "accent-dark", "wish", "wish-dark", "ink", "ink-soft", "snow", "success", "card-border", "roof", "timber",
];

/** Styleguide (DESIGN.md § Pages 9): Tokens und Bausteine auf einen Blick */
export default function Styleguide() {
  return (
    <Seitenrahmen modus="eltern">
      <main id="inhalt" className="seite-inhalt grid gap-10">
        <header>
          <h1 className="font-display text-4xl font-bold">Styleguide</h1>
          <p className="mt-2 max-w-[60ch] text-tinte-2">Quelle: <code>DESIGN.md</code>. Neue Farben, Schriften oder Bausteine zuerst dort eintragen.</p>
        </header>
        <section>
          <h2 className="font-display text-2xl font-bold">Farben</h2>
          <div className="styleguide__farben mt-4">
            {FARBEN.map((f) => (
              <div key={f} className="styleguide__farbe">
                <span style={{ background: `var(--${f})` }} />
                <p><strong>{f}</strong></p>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="font-display text-2xl font-bold">Schrift</h2>
          <p className="mt-2 font-display text-4xl font-bold">Baloo 2 – Überschriften</p>
          <p className="text-lg">Nunito – Fließtext. Kinder: 20px, Eltern: 16px. Höchstens 60 Zeichen pro Zeile.</p>
        </section>
        <StyleguideBeispiele />
      </main>
    </Seitenrahmen>
  );
}
