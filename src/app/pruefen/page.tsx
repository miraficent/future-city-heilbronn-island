import { Seitenrahmen } from "@/components/seitenrahmen";
import liveEvents from "@/data/events.json";
import type { LiveEvent } from "@/types";

export const metadata = { title: "Veranstaltungen prüfen" };

const datum = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/**
 * Prüfliste für das Team: Veranstaltungen mit needsReview (Kinder sehen sie nicht).
 * Gleiche Veranstaltungen mit mehreren Terminen stehen nur einmal da.
 */
export default function Pruefen() {
  const offen = (liveEvents as LiveEvent[]).filter((e) => e.needsReview);
  const einmal = [...new Map(offen.map((e) => [`${e.institutionId}|${e.title}`, e])).values()];
  const anzahl = (e: LiveEvent) => offen.filter((x) => x.institutionId === e.institutionId && x.title === e.title).length;

  return (
    <Seitenrahmen modus="eltern">
      <main id="inhalt" className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
        <h1 className="font-display text-3xl font-bold">Veranstaltungen prüfen</h1>
        <p className="mt-2 max-w-3xl text-tinte-2">
          {einmal.length} Veranstaltungen ({offen.length} Termine) sind unsicher eingeordnet. Kinder sehen sie nicht.
          So geht&apos;s weiter: siehe <code>docs/data-pipeline.md</code>.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b-2 border-tinte">
                <th className="py-2 pr-4">Veranstaltung</th>
                <th className="py-2 pr-4">Einrichtung</th>
                <th className="py-2 pr-4">Nächster Termin</th>
                <th className="py-2 pr-4">Alter erkannt</th>
                <th className="py-2 pr-4">Kategorien</th>
                <th className="py-2">Quelle</th>
              </tr>
            </thead>
            <tbody>
              {einmal.map((e) => (
                <tr key={e.id} className="border-b border-tinte/20 align-top">
                  <td className="py-2 pr-4 font-bold">{e.title}{anzahl(e) > 1 && <span className="font-normal text-tinte-2"> · {anzahl(e)} Termine</span>}</td>
                  <td className="py-2 pr-4">{e.institutionId}</td>
                  <td className="py-2 pr-4">{datum.format(new Date(e.start))}</td>
                  <td className="py-2 pr-4">{e.ageMin === null ? "unbekannt" : e.ageMax === null ? `ab ${e.ageMin}` : `${e.ageMin}–${e.ageMax}`}</td>
                  <td className="py-2 pr-4">{e.categories.join(", ") || "–"}</td>
                  <td className="py-2"><a className="underline" href={e.sourceUrl} target="_blank" rel="noopener noreferrer">Original</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </Seitenrahmen>
  );
}
