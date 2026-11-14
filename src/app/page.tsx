import Link from "next/link";
import { EinrichtungBadge } from "@/components/einrichtung-badge";
import { Planet } from "@/components/planet";
import { Sternenhimmel } from "@/components/sternenhimmel";
import { META, oeffentlicheAngebote } from "@/lib/daten";
import { themenStile } from "@/lib/themen-stil";
import { Symbol } from "@/components/symbol";

const ausgabeFormat = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", day: "numeric", month: "long", year: "numeric" });

export default function Start() {
  const angebote = oeffentlicheAngebote();
  const stile = Object.values(themenStile(META.themen));
  const [erster, zweiter, dritter] = stile;

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
              <span className="mt-1 font-mono text-sm text-[#b9b2cc]">12 bis 17 Jahre · Kurse, Lernpfade & deine Sammlung</span>
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
