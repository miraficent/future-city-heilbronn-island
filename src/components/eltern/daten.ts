"use client";

import { useMemo } from "react";
import kategorien from "@/data/categories.json";
import type { Angebot } from "@/lib/angebot";
import type { Meta } from "@/lib/daten";
import { angebotAusEvent, themenFuer } from "@/lib/eltern-suche";
import { useLiveEvents } from "@/lib/live-events";
import type { Category } from "@/types";

/**
 * Alles, was der Eltern-Bereich anzeigt: Kurse (vom Server, ggf. leer) und Live-Events aus Mobilizon
 * (lädt der Browser, siehe src/lib/live-events.ts) in einem Format. Die Themen-Liste enthält
 * nur Themen, die in den Daten vorkommen.
 */
export function useElternDaten(angebote: Angebot[], meta: Meta) {
  const live = useLiveEvents();
  const alle = useMemo(() => [...angebote, ...live.events.map(angebotAusEvent)], [angebote, live.events]);
  const metaMitThemen = useMemo(() => ({ ...meta, themen: themenFuer(meta.themen, kategorien as Category[], alle) }), [meta, alle]);
  return { status: live.status, alle, meta: metaMitThemen, events: live.events };
}
