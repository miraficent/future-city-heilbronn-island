"use client";

/**
 * Prüfliste für das Team: Live-Events aus Mobilizon ohne erkanntes Alter (needsReview – Kinder sehen sie nicht).
 * Abhilfe: in Mobilizon ein Alter in den Text schreiben („ab 8 Jahren“) oder einen Alters-Tag („6-10 Jahre“) setzen.
 * Gleiche Veranstaltungen mit mehreren Terminen stehen nur einmal da.
 * Darunter: die Kindertexte der Konten eule/owl zum Gegenlesen (EulenListe).
 */
import { EulenListe } from "@/components/eulen-liste";
import { LiveHinweis } from "@/components/kinder/live-karten";
import { useMinute } from "@/lib/kinder-zustand";
import { useLiveEvents } from "@/lib/live-events";
import type { LiveEvent } from "@/types";

const datum = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function Pruefliste() {
  const live = useLiveEvents();
  const minute = useMinute();
  const offen = live.events.filter((e) => e.needsReview);
  const einmal = [...new Map(offen.map((e) => [`${e.institutionId}|${e.title}`, e])).values()];
  const anzahl = (e: LiveEvent) => offen.filter((x) => x.institutionId === e.institutionId && x.title === e.title).length;

  return (
    <>
        <h1 className="font-display text-3xl font-bold">Veranstaltungen prüfen</h1>
        <p className="mt-2 max-w-3xl text-tinte-2">
          {live.status === "laedt" ? "Lade Veranstaltungen aus Mobilizon …" : <>
            {einmal.length} Veranstaltungen ({offen.length} Termine) haben kein erkanntes Alter. Kinder sehen sie nicht.
            So geht&apos;s weiter: in Mobilizon ein Alter in den Text schreiben („ab 8 Jahren“) oder einen Alters-Tag („6-10 Jahre“) setzen.
          </>}
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
      {live.status === "ok" && minute !== null && <EulenListe events={live.events} jetzt={new Date(minute)} />}
      <LiveHinweis status={live.status} kind={false} />
    </>
  );
}
