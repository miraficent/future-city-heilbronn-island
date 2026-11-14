"use client";

/**
 * Eltern-Seite: „Das möchte Ihr Kind besuchen“ – was das Kind in Mini-Heilbronn gewählt hat
 * (Wisch-Karten aus den Angeboten und „Da will ich hin!“ bei Live-Events).
 * Nur in dieser Browsersitzung, auf diesem Gerät. Die Live-Events kommen bei jedem Aufruf frisch aus Mobilizon.
 */
import type { Angebot } from "@/lib/angebot";
import { isForKids } from "@/lib/events";
import { useLiveEvents } from "@/lib/live-events";
import { useSammlung } from "./sammlung";
import { Button, Card } from "./ui";

const datum = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin", weekday: "short", day: "numeric", month: "long" });
const uhrzeit = (iso: string) => new Date(iso).toLocaleTimeString("de-DE", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit" });

type Eintrag = { id: string; titel: string; ort: string; start: string; kosten: string; url: string; beispiel: boolean };

export function KindWuensche({ angebote, quellenNamen }: { angebote: Angebot[]; quellenNamen: Record<string, string> }) {
  const merk = useSammlung("kind");
  const liveEvents = useLiveEvents().events.filter(isForKids);
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
    <section aria-labelledby="kind-wuensche" className="mx-auto max-w-[1100px] px-4 pt-8 sm:px-8">
      <Card>
        <h2 id="kind-wuensche" className="font-display text-2xl font-bold">Das möchte Ihr Kind besuchen</h2>
        <p className="mt-1 text-tinte-2">Aus Heilbronn Island. Anmeldung bitte direkt bei der Einrichtung.</p>
        <ul className="mt-4 grid gap-3">
          {liste.map((w) => (
            <li key={w.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-tinte bg-papier p-4">
              <div>
                <p className="font-bold">{w.titel}{w.beispiel && <span className="font-normal text-tinte-2"> (Beispiel-Eintrag)</span>}</p>
                <p className="text-sm text-tinte-2">{w.ort} · {datum(w.start)}, {uhrzeit(w.start)} Uhr · {w.kosten}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variante="primary" icon="external" href={w.url}>Zur Anmeldung</Button>
                <Button variante="ghost" onClick={() => merk.merken(w.id)}>Entfernen</Button>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
