"use client";

/**
 * Eltern-Seite: „Das möchte Ihr Kind besuchen“ – die Karten, die das Kind in Mini-Heilbronn
 * nach rechts gewischt hat (nur in dieser Browsersitzung, auf diesem Gerät).
 */
import type { Angebot } from "@/lib/angebot";
import { useSammlung } from "./sammlung";

const datum = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin", weekday: "short", day: "numeric", month: "long" });
const uhrzeit = (iso: string) => new Date(iso).toLocaleTimeString("de-DE", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit" });

export function KindWuensche({ angebote, quellenNamen }: { angebote: Angebot[]; quellenNamen: Record<string, string> }) {
  const merk = useSammlung("kind");
  const liste = angebote.filter((a) => merk.ids.includes(a.id));
  if (liste.length === 0) return null;

  return (
    <section aria-labelledby="kind-wuensche" className="mx-auto max-w-6xl px-4 pt-10 sm:px-8">
      <div className="rounded-[28px] border-2 border-tinte bg-flaeche p-6" style={{ boxShadow: "5px 5px 0 #f59e0b" }}>
        <h2 id="kind-wuensche" className="font-display text-2xl font-bold">Das möchte Ihr Kind besuchen</h2>
        <p className="mt-1 text-tinte-2">Aus Mini-Heilbronn. Anmeldung bitte direkt bei der Einrichtung.</p>
        <ul className="mt-4 grid gap-3">
          {liste.map((a) => {
            const termin = a.termine[0]!;
            return (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-tinte/20 bg-papier p-4">
                <div>
                  <p className="font-bold">{a.titel}</p>
                  <p className="text-sm text-tinte-2">
                    {quellenNamen[a.quelle] ?? a.quelle} · {datum(termin.start)}, {uhrzeit(termin.start)} Uhr · {a.kosten.text}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a className="knopf" href={a.url} target="_blank" rel="noopener noreferrer">Zur Anmeldung</a>
                  <button type="button" className="knopf" onClick={() => merk.merken(a.id)}>Entfernen</button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
