import Link from "next/link";
import { EinrichtungBadge } from "@/components/einrichtung-badge";
import { Symbol } from "@/components/symbol";
import { META, oeffentlicheAngebote } from "@/lib/daten";
import { angebotsMatrix } from "@/lib/insights";

/**
 * Alle Hintergrundtexte für Eltern (vorher auf der Startseite): Projektüberblick,
 * Hinweise zu Alter, Anmeldung und Datenschutz, Datenweg, offizielle Seiten der Einrichtungen.
 */

/** Die Angebotsseiten, die die aim-Challenge-README als Quellen nennt. */
const QUELLEN_LINKS = [
  {
    id: "aim",
    name: "aim",
    links: [
      { text: "Lernen in Ferien & Freizeit", url: "https://www.aim-akademie.org/kurse?kathaupt=18&suchesetzen=false&kfs_sonderrubrik=1264" },
      { text: "Digitale Bildung", url: "https://www.aim-akademie.org/kurse?kathaupt=18&suchesetzen=false&kfs_sonderrubrik=1277" },
      { text: "Juniorakademie", url: "https://www.aim-akademie.org/kurse/suche?clearallkatfilter=true&suchesetzen=true&kfs_stichwort_schlagwort=juniorakademie&kfs_sonderrubrik=-1&kfs_ort_select=-1&kfs_kennz=&kfs_veranartselect=-1&kfs_aussenst_select=-1&kfs_kursbereich=-1&kfs_beginn_dat1=&kfs_beginn_dat2=" },
      { text: "Coding", url: "https://www.aim-akademie.org/kurse?kathaupt=18&suchesetzen=false&kfs_kursbereich=1278&kfs_sonderrubrik=1277" },
    ],
  },
  { id: "experimenta", name: "experimenta", links: [{ text: "Lernen", url: "https://www.experimenta.science/lernen/" }] },
  {
    id: "hdf",
    name: "Haus der Familie",
    links: [
      { text: "Kinder & Jugendliche", url: "https://hdf-hn.de/kinder-jugendliche/" },
      { text: "Digitale Familienwerkstatt", url: "https://hdf-hn.de/angebote/digitale-familienwerkstatt/" },
    ],
  },
  { id: "ipai", name: "IPAI Foundation", links: [{ text: "Veranstaltungen", url: "https://ipai-foundation.ai/#events" }] },
];

const datum = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", day: "numeric", month: "long", year: "numeric" });

export function ElternInfos() {
  const angebote = oeffentlicheAngebote();
  const matrix = angebotsMatrix(angebote, META.themen);
  const luecken = matrix.filter((z) => z.angebote === 0).length;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-8">
      {/* Hinweise für Eltern */}
      <section aria-labelledby="hinweise" className="pt-16">
        <h2 id="hinweise" className="font-display text-3xl font-bold">Gut zu wissen</h2>
        <div className="ueberblick-saeulen">
          <article className="ueberblick-saeule" style={{ ["--saeulen-farbe" as string]: "#2f4bff" }}>
            <span className="ueberblick-symbol"><Symbol name="search" /></span>
            <h3>So finden wir das passende Alter</h3>
            <p>
              Wir lesen das Alter aus jedem Angebot, z. B. „7–10 Jahre“, „ab 8 Jahren“ oder „Klasse 2–4“. Angebote für
              Lehrkräfte, Fachkräfte oder Erwachsene werden erkannt. Kinder und Teens sehen in ihren Bereichen nur
              Angebote mit bekannter Altersangabe – Sie sehen hier alle.
            </p>
          </article>
          <article className="ueberblick-saeule" style={{ ["--saeulen-farbe" as string]: "#e8513a" }}>
            <span className="ueberblick-symbol"><Symbol name="compass" /></span>
            <h3>Anmeldung</h3>
            <p>
              Wir nehmen keine Buchungen an. Bitte melden Sie Ihr Kind immer auf der offiziellen Seite der Einrichtung
              an. Kinder können nur „Zeig&apos;s Mama oder Papa“ – sie melden sich nie selbst an.
            </p>
          </article>
          <article className="ueberblick-saeule" style={{ ["--saeulen-farbe" as string]: "#1f8a6e" }}>
            <span className="ueberblick-symbol"><Symbol name="bulb" /></span>
            <h3>Datenschutz</h3>
            <p>
              Kein Konto, keine Cookies, kein Tracking, kein KI-Chat. Spielstand und Sammlung bleiben nur in Ihrem
              Browser. <Link href="/datenschutz/" className="font-bold underline underline-offset-4">Mehr dazu</Link>
            </p>
          </article>
        </div>
      </section>

      {/* Projektüberblick */}
      <section aria-labelledby="ueberblick" className="pt-16">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em]">aim-Challenge · Future City Hackathon 2026 · Hochschule Heilbronn</p>
        <h2 id="ueberblick" className="mt-3 font-display text-3xl font-bold sm:text-4xl">Ein Learning Guide für Heilbronn.</h2>
        <ol className="ueberblick-weg">
          <li>
            <small>Wo wir stehen</small>
            <strong>Tolle Lernangebote – verteilt auf viele Websites.</strong>
            <p>aim, experimenta, Haus der Familie und IPAI bieten KI, Coding und Gaming an. Jede Einrichtung auf ihrer eigenen Seite.</p>
          </li>
          <li>
            <small>Das Problem</small>
            <strong>Das Richtige zu finden und dranzubleiben ist schwer.</strong>
            <p>Familien müssen vier Seiten durchsuchen. Termine gehen verloren, Kinder finden keinen eigenen Zugang.</p>
          </li>
          <li>
            <small>Unsere Antwort</small>
            <strong>COSMOS-Entdecker: ein Ort für alles.</strong>
            <p>Spielwelt für Kinder, eigener Bereich für Teens, Suche für Eltern, eine echte Stadtkarte – und Einblicke für die Einrichtungen.</p>
          </li>
        </ol>

        <div className="ueberblick-saeulen">
          <article className="ueberblick-saeule" style={{ ["--saeulen-farbe" as string]: "#2f4bff" }}>
            <span className="ueberblick-symbol"><Symbol name="compass" /></span>
            <h3>Bringt alles zusammen</h3>
            <ul>
              <li>{angebote.length} echte Angebote von {META.quellen.length} Einrichtungen in einer Suche</li>
              <li>Jede Nacht automatisch aktualisiert – neue Einrichtung = eine Zeile in einer Tabelle</li>
              <li>Echte Heilbronn-Karte mit Adressen, Telefon und Route</li>
            </ul>
            <Link className="knopf" href="/einrichtungen/"><Symbol name="map" /> Zur Karte</Link>
          </article>
          <article className="ueberblick-saeule" style={{ ["--saeulen-farbe" as string]: "#e8513a" }}>
            <span className="ueberblick-symbol"><Symbol name="refresh" /></span>
            <h3>Holt Familien zurück</h3>
            <ul>
              <li>Spielwelt: 4 Lernhäuser, 12 Sterne, eine Rakete – mit echten Kursen als Belohnung</li>
              <li>Kalender je Thema: neue Termine landen im eigenen Kalender</li>
              <li>Sammlung und QR-Code: Kinder zeigen ihren Eltern, was sie spannend finden</li>
            </ul>
            <Link className="knopf" href="/kind/"><Symbol name="rocket" /> Zur Spielwelt</Link>
          </article>
          <article className="ueberblick-saeule" style={{ ["--saeulen-farbe" as string]: "#1f8a6e" }}>
            <span className="ueberblick-symbol"><Symbol name="bulb" /></span>
            <h3>Zeigt, was fehlt</h3>
            <ul>
              <li>{luecken} von {matrix.length} Feldern (Thema × Alter) {luecken === 1 ? "hat" : "haben"} kein Angebot – sichtbar im Lücken-Radar</li>
              <li>Teens und Eltern melden Wünsche anonym, ohne Konto</li>
              <li>Suchen ohne Treffer lassen sich mit einem Klick melden</li>
            </ul>
            <Link className="knopf" href="/einblicke/"><Symbol name="bulb" /> Zu den Einblicken</Link>
          </article>
        </div>

        <h3 className="mt-10 font-display text-xl font-bold">So kommen die Daten auf die Seite</h3>
        <p className="ueberblick-ablauf" aria-label="Datenweg">
          <span>Websites der Einrichtungen</span><i>→</i><span>Import jede Nacht</span><i>→</i><span>Themen- und Altersregeln (Tabelle)</span><i>→</i><span>Website ohne Tracking</span><i>→</i><span>Familien</span>
        </p>

        <h3 className="mt-10 font-display text-xl font-bold">Offizielle Seiten der Einrichtungen</h3>
        <div className="ueberblick-quellen">
          {QUELLEN_LINKS.map((q) => (
            <div key={q.id}>
              <h3><i style={{ background: META.quellen.find((x) => x.id === q.id)?.farbe }} />{q.name}</h3>
              <ul>
                {q.links.map((l) => (
                  <li key={l.url}><a href={l.url} target="_blank" rel="noopener noreferrer">{l.text}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-14 grid gap-6 border-t-2 border-tinte pt-5 text-sm sm:grid-cols-2">
        <div>
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em]">Angebote von</p>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
            {META.quellen.map((q) => (
              <li key={q.id}>
                <a href={q.website} className="underline-offset-4 hover:underline" rel="noopener" target="_blank">
                  <EinrichtungBadge quelle={q} id={q.id} />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="sm:text-right">
          <p className="text-tinte-2">Echte Angebotsdaten · letzter gespeicherter Stand vom {datum.format(new Date(META.aktualisiert))}.</p>
          <p className="mt-2 flex flex-wrap gap-4 sm:justify-end">
            <Link className="underline underline-offset-4" href="/datenschutz/">Datenschutz</Link>
            <Link className="underline underline-offset-4" href="/impressum/">Impressum</Link>
            <Link className="underline underline-offset-4" href="/projekt/">Projekt & Datenstatus</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
