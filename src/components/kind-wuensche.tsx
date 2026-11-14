"use client";

/**
 * Eltern-Seite: „Das möchte Ihr Kind besuchen“ – was das Kind in Mini-Heilbronn gewählt hat
 * (Wisch-Karten aus den Angeboten und „Da will ich hin!“ bei Live-Events).
 * Nur in dieser Browsersitzung, auf diesem Gerät.
 */
import type { Angebot } from "@/lib/angebot";
import type { LiveEvent } from "@/types";
import { useSammlung } from "./sammlung";

const datum = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin", weekday: "short", day: "numeric", month: "long" });
const uhrzeit = (iso: string) => new Date(iso).toLocaleTimeString("de-DE", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit" });

type Eintrag = { id: string; titel: string; ort: string; start: string; kosten: string; url: string; beispiel: boolean };

export function KindWuensche({ angebote, liveEvents, quellenNamen }: { angebote: Angebot[]; liveEvents: LiveEvent[]; quellenNamen: Record<string, string> }) {
  const merk = useSammlung("kind");
  const liste: Eintrag[] = [
    ...angebote.filter((a) => merk.ids.includes(a.id)).map((a) => ({
      id: a.id, titel: a.titel, ort: quellenNamen[a.quelle] ?? a.quelle, start: a.termine[0]!.start, kosten: a.kosten.text, url: a.url, beispiel: false,
    })),
    ...liveEvents.filter((e) => merk.ids.includes(`ev:${e.id}`)).map((e) => ({
      id: `ev:${e.id}`, titel: e.title, ort: quellenNamen[e.institutionId] ?? e.location, start: e.start, kosten: e.cost ?? "Preis siehe Anbieter", url: e.registrationUrl, beispiel: e.isDummy,
    })),
  ];
  if (liste.length === 0) return null;

  return (
    <section aria-labelledby="kind-wuensche" className="mx-auto max-w-6xl px-4 pt-10 sm:px-8">
      <div className="rounded-[28px] border-2 border-tinte bg-flaeche p-6" style={{ boxShadow: "5px 5px 0 #f59e0b" }}>
        <h2 id="kind-wuensche" className="font-display text-2xl font-bold">Das möchte Ihr Kind besuchen</h2>
        <p className="mt-1 text-tinte-2">Aus Mini-Heilbronn. Anmeldung bitte direkt bei der Einrichtung.</p>
        <ul className="mt-4 grid gap-3">
          {liste.map((w) => (
            <li key={w.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-tinte/20 bg-papier p-4">
              <div>
                <p className="font-bold">{w.titel}{w.beispiel && <span className="font-normal text-tinte-2"> (Beispiel-Eintrag)</span>}</p>
                <p className="text-sm text-tinte-2">{w.ort} · {datum(w.start)}, {uhrzeit(w.start)} Uhr · {w.kosten}</p>
              </div>
              <div className="flex gap-2">
                <a className="knopf" href={w.url} target="_blank" rel="noopener noreferrer">Zur Anmeldung</a>
                <button type="button" className="knopf" onClick={() => merk.merken(w.id)}>Entfernen</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
