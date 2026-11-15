import Link from "next/link";
import { EinblickeLive } from "@/components/einblicke-live";
import { kurzname } from "@/components/einrichtung-badge";
import { Seitenrahmen } from "@/components/seitenrahmen";
import { Symbol } from "@/components/symbol";
import { META, oeffentlicheAngebote } from "@/lib/daten";
import { angebotsMatrix } from "@/lib/insights";

export const metadata = { title: "Einblicke – was junge Menschen wollen und was fehlt" };

const monatsFormat = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", month: "short" });

export default function Einblicke() {
  const angebote = oeffentlicheAngebote();
  const jetzt = new Date(META.aktualisiert);
  const matrix = angebotsMatrix(angebote, META.themen);

  // Termine der nächsten sechs Monate: zeigt Ferien- und Kalenderlücken.
  const monate = Array.from({ length: 6 }, (_, i) => {
    const start = new Date(Date.UTC(jetzt.getUTCFullYear(), jetzt.getUTCMonth() + i, 1));
    const ende = new Date(Date.UTC(jetzt.getUTCFullYear(), jetzt.getUTCMonth() + i + 1, 1));
    const anzahl = angebote.filter((a) => a.termine.some((t) => new Date(t.start) >= start && new Date(t.start) < ende && new Date(t.start) >= jetzt)).length;
    return { name: monatsFormat.format(start), anzahl };
  });
  const maxMonat = Math.max(1, ...monate.map((m) => m.anzahl));

  const proEinrichtung = META.quellen.map((q) => {
    const eigene = angebote.filter((a) => a.quelle === q.id);
    return { id: q.id, name: kurzname(q, q.id), farbe: q.farbe, anzahl: eigene.length, kostenlos: eigene.filter((a) => a.kosten.euro === 0).length };
  });
  const maxEinrichtung = Math.max(1, ...proEinrichtung.map((e) => e.anzahl));
  const kostenlos = angebote.filter((a) => a.kosten.euro === 0).length;

  return (
    <Seitenrahmen aktiv="einblicke">
      <main id="inhalt" className="einblicke mx-auto max-w-7xl px-5 pt-9 sm:px-8">
        <p className="font-mono text-xs uppercase tracking-widest">Für Einrichtungen & Stadt · Säule 3 der Challenge</p>
        <h1 className="mt-4 max-w-4xl font-display text-[clamp(2rem,5vw,3.8rem)] font-extrabold leading-[1.08]">Was junge Menschen wollen – und was fehlt.</h1>
        <p className="mt-4 max-w-2xl text-lg text-tinte-2">
          Links das echte Angebot aus {META.quellen.length} Einrichtungen, rechts die anonymen Wünsche von Teens und Eltern. Wo beides auseinandergeht, entsteht die nächste gute Kursidee.
        </p>

        <div className="einblick-kacheln">
          <div><strong>{angebote.length}</strong><span>Angebote mit Termin</span></div>
          <div><strong>{kostenlos}</strong><span>davon kostenlos</span></div>
          <div><strong>{matrix.filter((z) => z.angebote === 0).length}</strong><span>von {matrix.length} Feldern ohne Angebot</span></div>
          <div><strong>0</strong><span>Konten, Cookies, Tracker</span></div>
        </div>

        <EinblickeLive matrix={matrix} themen={META.themen.map((t) => ({ id: t.id, name: t.name }))} />

        <div className="einblick-raster">
          <section aria-labelledby="monate-titel" className="einblick-karte">
            <h2 id="monate-titel">Termine in den nächsten Monaten</h2>
            <p className="einblick-hinweis">Angebote mit mindestens einem Termin im Monat. Niedrige Säulen zeigen Zeiten, in denen Familien wenig finden.</p>
            <ol className="einblick-saeulen" aria-label="Angebote je Monat">
              {monate.map((m) => (
                <li key={m.name} title={`${m.name}: ${m.anzahl} Angebote`}>
                  <strong>{m.anzahl}</strong>
                  <span className="einblick-saeule" style={{ height: `${Math.max(4, (m.anzahl / maxMonat) * 100)}%` }} />
                  <span>{m.name}</span>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="einrichtungen-titel" className="einblick-karte">
            <h2 id="einrichtungen-titel">Angebote je Einrichtung</h2>
            <ul className="einblick-balken">
              {proEinrichtung.map((e) => (
                <li key={e.id} title={`${e.name}: ${e.anzahl} Angebote, ${e.kostenlos} kostenlos`}>
                  <span className="einblick-balken-name"><i style={{ background: e.farbe }} />{e.name}</span>
                  <span className="einblick-balken-spur"><span style={{ width: `${(e.anzahl / maxEinrichtung) * 100}%` }} /></span>
                  <strong>{e.anzahl}</strong>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section aria-labelledby="wie-titel" className="einblick-karte einblick-wie">
          <h2 id="wie-titel"><Symbol name="info" /> So entstehen die Zahlen</h2>
          <ul>
            <li><strong>Angebot:</strong> jede Nacht automatisch von den Websites der Einrichtungen gelesen, nach Thema und Alter geordnet (Regeln in einer Tabelle, keine Blackbox).</li>
            <li><strong>Wünsche:</strong> nur nach einem bewussten Klick bei Teens oder Eltern. Gezählt werden Thema, Altersgruppe und Tag. Keine Namen, keine IP-Adressen, keine Uhrzeit. Der Kinderbereich sendet nichts.</li>
            <li><strong>Suchbegriffe:</strong> nur wenn jemand „fehlt mir“ antippt. E-Mail-Adressen, Telefonnummern, Daten und Adressen werden vorher automatisch entfernt.</li>
          </ul>
          <p className="mt-3"><Link className="underline underline-offset-4" href="/datenschutz/">Datenschutz im Detail</Link> · <Link className="underline underline-offset-4" href="/teen/">Wunsch abgeben (Teens)</Link> · <Link className="underline underline-offset-4" href="/eltern/#wunsch-titel">Wunsch abgeben (Eltern)</Link></p>
        </section>
      </main>
    </Seitenrahmen>
  );
}
