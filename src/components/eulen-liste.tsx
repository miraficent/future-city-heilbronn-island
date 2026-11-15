"use client";

/**
 * Gegenlesen der Kindertexte: Titel und Satz der Konten „eule“ (Deutsch) und „owl“ (Englisch) je Veranstaltung.
 * Nur lesen – korrigiert wird der Kommentar in Mobilizon (Link „Original“). Fehlt ein Text, baut die
 * Kinderseite einen Satz aus Thema, Art und Kosten (kartenText in src/lib/kinder-text.ts).
 */
import { Badge } from "@/components/ui";
import { eulenZeilen } from "@/lib/eulen-liste";
import type { KinderText, LiveEvent } from "@/types";

function Text({ text }: { text?: KinderText }) {
  if (!text) return <Badge art="accent">fehlt</Badge>;
  return (
    <>
      {text.titel && <span className="block font-bold">{text.titel}</span>}
      <span>{text.satz}</span>
    </>
  );
}

export function EulenListe({ events, jetzt }: { events: LiveEvent[]; jetzt: Date }) {
  const einmal = eulenZeilen(events, jetzt);
  const ohne = einmal.filter((e) => !e.kinder?.de || !e.kinder?.en).length;

  return (
    <section className="mt-12" aria-labelledby="eulen-liste">
      <h2 id="eulen-liste" className="font-display text-2xl font-bold">Eule & Owl: Kindertexte gegenlesen</h2>
      <p className="mt-2 max-w-3xl text-tinte-2">
        {einmal.length} Zeilen (Termine mit gleichen Texten zusammengefasst), bei {ohne} fehlt mindestens ein Text. Korrigieren: in Mobilizon als
        „eule“ bzw. „owl“ anmelden und den Kommentar bearbeiten. Neu schreiben lassen: Kommentar löschen.
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b-2 border-tinte">
              <th className="py-2 pr-4">Veranstaltung</th>
              <th className="py-2 pr-4">Einrichtung</th>
              <th className="py-2 pr-4">Eule (Deutsch)</th>
              <th className="py-2 pr-4">Owl (Englisch)</th>
              <th className="py-2">Quelle</th>
            </tr>
          </thead>
          <tbody>
            {einmal.map((e) => (
              <tr key={e.id} className="border-b border-tinte/20 align-top">
                <td className="py-2 pr-4 font-bold">{e.title}</td>
                <td className="py-2 pr-4">{e.institutionId}</td>
                <td className="py-2 pr-4" lang="de"><Text text={e.kinder?.de} /></td>
                <td className="py-2 pr-4" lang="en"><Text text={e.kinder?.en} /></td>
                <td className="py-2"><a className="underline" href={e.sourceUrl} target="_blank" rel="noopener noreferrer">Original</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
