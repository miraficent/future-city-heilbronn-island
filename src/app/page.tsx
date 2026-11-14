import Link from "next/link";
import { Planet } from "@/components/planet";
import { Symbol } from "@/components/symbol";
import { META } from "@/lib/daten";
import { themenStile } from "@/lib/themen-stil";

/** Startseite: kurze Begrüßung und drei Türen – Kind, Teen, Eltern. Bewusst fast ohne Text. */
export default function Start() {
  const [erster] = Object.values(themenStile(META.themen));

  return (
    <main id="inhalt" className="mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-center px-4 py-10 sm:px-8">
      <h1 className="text-center font-display text-4xl font-bold sm:text-5xl">Hallo, Heilbronn!</h1>
      <p className="mt-3 text-center text-lg text-tinte-2">Wer schaut gerade?</p>

      <ul className="mt-10 grid gap-5 md:grid-cols-3">
        <li>
          <Link
            href="/kind/"
            className="versatz group relative flex h-full min-h-56 flex-col justify-end overflow-hidden rounded-[28px] border-2 border-tinte bg-flaeche p-6 transition-transform hover:-translate-y-1 hover:-rotate-1"
            style={{ ["--versatz-farbe" as string]: erster?.farbe ?? "#ff5a36" }}
          >
            {erster ? (
              <Planet kennung="tuer-kind" farbe={erster.farbe} art="krater" className="absolute -right-8 -top-8 w-40 transition-transform duration-500 group-hover:rotate-12" />
            ) : null}
            <Symbol name="robot" className="!size-12" />
            <span className="mt-3 font-display text-2xl font-bold">Kind</span>
            <span className="mt-1 text-base text-tinte-2">6–11 Jahre</span>
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
              {[[10, 90], [60, 40], [110, 60], [150, 15], [190, 45]].map(([x, y]) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill="currentColor" />
              ))}
            </svg>
            <Symbol name="code" className="!size-12" />
            <span className="mt-3 font-display text-2xl font-bold">Teen</span>
            <span className="mt-1 font-mono text-sm text-[#b9b2cc]">12–17 Jahre</span>
          </Link>
        </li>
        <li>
          <Link
            href="/eltern/"
            className="versatz group relative flex h-full min-h-56 flex-col justify-end overflow-hidden rounded-[28px] border-2 border-tinte bg-papier-2 p-6 transition-transform hover:-translate-y-1"
            style={{ ["--versatz-farbe" as string]: "#2f4bff" }}
          >
            <span aria-hidden className="raster absolute -right-6 -top-6 size-36 rounded-full text-blau opacity-70" />
            <Symbol name="compass" className="!size-12" />
            <span className="mt-3 font-display text-2xl font-bold">Eltern</span>
            <span className="mt-1 text-base text-tinte-2">Alle Angebote in Heilbronn</span>
          </Link>
        </li>
      </ul>
    </main>
  );
}
