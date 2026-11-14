import Link from "next/link";
import { EinrichtungBadge } from "@/components/einrichtung-badge";
import { Planet } from "@/components/planet";
import { Sternenhimmel } from "@/components/sternenhimmel";
import { META, oeffentlicheAngebote } from "@/lib/daten";
import { angebotsMatrix } from "@/lib/insights";
import { themenStile } from "@/lib/themen-stil";
import { Symbol } from "@/components/symbol";

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

const ausgabeFormat = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", day: "numeric", month: "long", year: "numeric" });

export default function Start() {
  const angebote = oeffentlicheAngebote();
  const stile = Object.values(themenStile(META.themen));
  const [erster, zweiter, dritter] = stile;
  const matrix = angebotsMatrix(angebote, META.themen);
  const luecken = matrix.filter((z) => z.angebote === 0).length;

  return (
    <main id="inhalt" className="relative mx-auto max-w-6xl px-4 pb-16 pt-5 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-tinte pb-2 font-mono text-[0.7rem] uppercase tracking-[0.14em]">
        <span>Heilbronn · COSMOS HN</span>
        <span>Ausgabe {ausgabeFormat.format(new Date(META.aktualisiert))}</span>
        <span>{angebote.length} Angebote</span>
      </header>

      <section className="relative grid gap-8 pt-8 sm:pt-12 lg:grid-cols-[1.25fr_1fr] lg:items-end">
        <div className="relative z-10">
          <h1 className="font-display text-[clamp(2.9rem,11vw,7.5rem)] font-extrabold uppercase leading-[0.86] tracking-tight">
            <span className="versatz-text block" style={{ ["--versatz-farbe" as string]: erster?.farbe }}>
              Cosmos
            </span>
            <span className="block text-[0.52em] tracking-[0.02em]">Entdecker</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg sm:text-xl">
            Eine Spielwelt für Kinder, ein eigener Bereich für Teens, eine Kurssuche und eine echte Heilbronn-Karte. Mit echten Kursen zu <strong>KI, Coding und Gaming</strong> von aim, experimenta,
            Haus der Familie und IPAI. Ohne Konto. Ohne Tracking.
          </p>
        </div>
        <div aria-hidden className="relative mx-auto h-56 w-full max-w-sm sm:h-72">
          <Sternenhimmel anzahl={24} className="text-tinte" />
          {erster ? (
            <Planet kennung="start-1" farbe={erster.farbe} art={erster.planet} className="absolute left-0 top-6 w-40 sm:w-52" />
          ) : null}
          {zweiter ? (
            <Planet kennung="start-2" farbe={zweiter.farbe} art={zweiter.planet} className="absolute right-0 top-0 w-28 sm:w-36" />
          ) : null}
          {dritter ? (
            <Planet kennung="start-3" farbe={dritter.farbe} art={dritter.planet} className="absolute bottom-0 right-10 w-24 sm:w-32" />
          ) : null}
        </div>
      </section>

      <section aria-labelledby="wer" className="pt-12">
        <h2 id="wer" className="font-display text-2xl font-bold sm:text-3xl">
          Wer schaut gerade?
        </h2>
        <ul className="mt-6 grid gap-5 md:grid-cols-3">
          <li>
            <Link
              href="/kind/"
              className="versatz group relative flex h-full min-h-56 flex-col justify-end overflow-hidden rounded-[28px] border-2 border-tinte bg-flaeche p-6 transition-transform hover:-translate-y-1 hover:-rotate-1"
              style={{ ["--versatz-farbe" as string]: erster?.farbe ?? "#ff5a36" }}
            >
              {erster ? (
                <Planet kennung="tuer-kind" farbe={erster.farbe} art="krater" className="absolute -right-8 -top-8 w-40 transition-transform duration-500 group-hover:rotate-12" />
              ) : null}
              <span aria-hidden className="text-5xl">
                <Symbol name="robot" className="!size-12"/>
              </span>
              <span className="mt-3 font-display text-2xl font-bold">Ich bin ein Kind</span>
              <span className="mt-1 text-base text-tinte-2">6 bis 11 Jahre · Spielwelt: bau die COSMOS-Rakete</span>
            </Link>
          </li>
          <li>
            <Link
              href="/teen/"
              data-modus="teen"
              className="versatz group relative flex h-full min-h-56 flex-col justify-end overflow-hidden rounded-[28px] border-2 border-nacht bg-nacht p-6 text-[#f3ecdc] transition-transform hover:-translate-y-1 hover:rotate-1"
              style={{ ["--versatz-farbe" as string]: "#ff4fa3" }}
            >
              <svg aria-hidden viewBox="0 0 200 120" className="absolute right-3 top-3 w-44 text-[#ff4fa3]">
                <polyline points="10,90 60,40 110,60 150,15 190,45" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 5" />
                {[
                  [10, 90],
                  [60, 40],
                  [110, 60],
                  [150, 15],
                  [190, 45],
                ].map(([x, y]) => (
                  <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill="currentColor" />
                ))}
              </svg>
              <span aria-hidden className="text-5xl">
                <Symbol name="code" className="!size-12"/>
              </span>
              <span className="mt-3 font-display text-2xl font-bold">Ich bin ein Teen</span>
              <span className="mt-1 font-mono text-sm text-[#b9b2cc]">12 bis 17 Jahre · echte Kurse statt Kinderspiel</span>
            </Link>
          </li>
          <li>
            <Link
              href="/eltern/"
              className="versatz group relative flex h-full min-h-56 flex-col justify-end overflow-hidden rounded-[28px] border-2 border-tinte bg-papier-2 p-6 transition-transform hover:-translate-y-1"
              style={{ ["--versatz-farbe" as string]: "#2f4bff" }}
            >
              <span aria-hidden className="raster absolute -right-6 -top-6 size-36 rounded-full text-blau opacity-70" />
              <span aria-hidden className="text-5xl">
                <Symbol name="compass" className="!size-12"/>
              </span>
              <span className="mt-3 font-display text-2xl font-bold">Ich suche für mein Kind</span>
              <span className="mt-1 text-base text-tinte-2">Eltern & Fachkräfte · Suche, Kalender & Karte</span>
            </Link>
          </li>
        </ul>
      </section>

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
            <p className="ueberblick-zitat">Brings together all learning opportunities</p>
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
            <p className="ueberblick-zitat">Keeps families coming back beyond events</p>
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
            <p className="ueberblick-zitat">Shows us what young people want and what&apos;s missing</p>
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

        <h3 className="mt-10 font-display text-xl font-bold">Quellen aus der Challenge</h3>
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
          <p>
            Kein Konto, keine Cookies, kein Tracking.{" "}
            <Link href="/datenschutz/" className="font-bold underline underline-offset-4">
              So gehen wir mit Daten um
            </Link>
          </p>
          <p className="mt-1 text-tinte-2">Echte Angebotsdaten · letzter gespeicherter Stand vom {ausgabeFormat.format(new Date(META.aktualisiert))}.</p>
          <p className="mt-2 flex flex-wrap gap-4 sm:justify-end"><Link className="underline underline-offset-4" href="/impressum/">Impressum</Link><Link className="underline underline-offset-4" href="/projekt/">Projekt & Datenstatus</Link></p>
        </div>
      </footer>
    </main>
  );
}
