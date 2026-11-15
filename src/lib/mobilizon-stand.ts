/**
 * Letzter gespeicherter Stand von Mobilizon (echte Veranstaltungen, Antwort der API vom 14.11.2026),
 * für den Fall, dass der Mobilizon-Server nicht erreichbar ist (z. B. bei der Vorführung).
 * Geht durch dieselbe Umwandlung wie die Live-Daten (zuLiveEvent: Alter, Themen, Kinder-Filter).
 * Aktiv nur mit NEXT_PUBLIC_EVENTS_STAND=notfall|immer (src/lib/live-events.ts).
 * Neuer Stand: Mobilizon-Antwort als src/data/mobilizon-stand.json speichern (Liste der events.elements).
 */
import roh from "@/data/mobilizon-stand.json";
import type { Category, LiveEvent } from "@/types";
import { MOBILIZON_URL, zuLiveEvent, type MobilizonEvent } from "./mobilizon";

export function standEvents(kategorien: Category[], jetzt: Date, basis = MOBILIZON_URL): LiveEvent[] {
  return (roh as Partial<MobilizonEvent>[])
    .map((e) => ({
      onlineAddress: null,
      externalParticipationUrl: null,
      organizerActor: null,
      physicalAddress: null,
      attributedTo: null,
      tags: [],
      picture: null,
      description: null,
      endsOn: null,
      ...e,
    }) as MobilizonEvent)
    .filter((e) => e.status !== "CANCELLED")
    .map((e) => zuLiveEvent(e, kategorien, basis))
    .filter((e) => new Date(e.end ?? e.start).getTime() >= jetzt.getTime())
    .sort((a, b) => a.start.localeCompare(b.start));
}
