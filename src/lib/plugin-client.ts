import { useEffect, useState } from "react";
import type { Aktivitaet } from "./checkpoint";
import type { SpielPlugin } from "./plugins";
import { STATIONEN, type Station } from "./spiel";

/**
 * Plugins im Browser: Laden von `/api/plugins/` und Zuordnung zu den Lernhäusern.
 * Bewusst ohne zod (siehe `plugins.ts`), damit das Kinder-Bundle schlank bleibt.
 * Der Server prüft Plugins vollständig beim Hochladen und beim Laden.
 */

/** Wie lange die Spielwelt höchstens auf den Plugin-Server wartet, bevor sie die eingebauten Spiele zeigt. */
export const PLUGIN_WARTEZEIT_MS = 3000;

/** Schlanke Formprüfung der Serverantwort; alles Unpassende wird ignoriert. */
export function passendePlugins(daten: unknown): SpielPlugin[] {
  if (!Array.isArray(daten)) return [];
  return daten.filter((p): p is SpielPlugin => {
    const haus = STATIONEN.find((s) => s.id === p?.institution);
    return !!haus && typeof p.version === "string" && Array.isArray(p.aktivitaeten)
      && p.aktivitaeten.length === haus.aktivitaeten.length
      && p.aktivitaeten.every((a: unknown) => typeof a === "object" && a !== null
        && typeof (a as { modul?: unknown }).modul === "string" && typeof (a as { titel?: unknown }).titel === "string");
  });
}

/** Aktive Aktivitäten eines Hauses: aus dem Plugin, sonst die eingebauten. */
export function aktivitaetenFuer(plugins: SpielPlugin[], station: Station): Aktivitaet[] {
  return plugins.find((p) => p.institution === station.id)?.aktivitaeten ?? station.aktivitaeten;
}

/** Titel der Aufgabe zur Fortschritts-ID `<station>-<index>`, passend zum aktiven Plugin. */
export function missionsTitel(plugins: SpielPlugin[], id: string): string | undefined {
  for (const s of STATIONEN) {
    if (!id.startsWith(`${s.id}-`)) continue;
    const n = Number(id.slice(s.id.length + 1));
    return Number.isInteger(n) ? aktivitaetenFuer(plugins, s)[n]?.titel : undefined;
  }
  return undefined;
}

/**
 * Lädt die veröffentlichten Plugins. `geladen` wird auch bei Fehlern, im statischen
 * Export (404) und nach `PLUGIN_WARTEZEIT_MS` wahr; dann gelten die eingebauten Spiele.
 */
export function useSpielPlugins(): { plugins: SpielPlugin[]; geladen: boolean } {
  const [zustand, setZustand] = useState<{ plugins: SpielPlugin[]; geladen: boolean }>({ plugins: [], geladen: false });
  useEffect(() => {
    const controller = new AbortController();
    const frist = window.setTimeout(() => controller.abort(), PLUGIN_WARTEZEIT_MS);
    let aktiv = true;
    fetch("/api/plugins/", { cache: "no-store", signal: controller.signal })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((daten) => passendePlugins(daten), () => [])
      .then((plugins) => { if (aktiv) setZustand({ plugins, geladen: true }); });
    return () => { aktiv = false; window.clearTimeout(frist); controller.abort(); };
  }, []);
  return zustand;
}
