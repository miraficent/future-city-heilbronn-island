"use client";

/**
 * Kinderkarte und Einrichtungsseiten zeigen nur Live-Events aus Mobilizon (im Browser geladen) –
 * keine Kurse, keine Platzhalter. Solange geladen wird, bleibt der Raum leer.
 * Sicherheit bleibt bei eventKarten() → isForKids(): nur Events mit erkanntem Alter bis 14.
 */
import { useMemo } from "react";
import { CheckpointSeite } from "./checkpoint-seite";
import { KartenSeite } from "./karten-seite";
import { useKinderTexte } from "./texte";
import type { KartenOrt } from "@/lib/kinderkarte";
import { eventKarten, kartenFuerOrt, type KinderKarte } from "@/lib/kinderkarten";
import { useLiveEvents, type LiveEventsZustand } from "@/lib/live-events";
import type { Category } from "@/types";

function useKarten(ortId?: string): [KinderKarte[], LiveEventsZustand["status"]] {
  const live = useLiveEvents();
  const karten = useMemo(() => {
    const ausEvents = eventKarten(live.events, new Date());
    return ortId ? kartenFuerOrt(ausEvents, ortId) : ausEvents;
  }, [live.events, ortId]);
  return [karten, live.status];
}

/** Kurzer Hinweis, wenn Mobilizon nicht erreichbar ist – es gibt bewusst keine Ersatzdaten */
export function LiveHinweis({ status, kind = true }: { status: LiveEventsZustand["status"]; kind?: boolean }) {
  const t = useKinderTexte();
  if (status !== "fehler") return null;
  return (
    <p role="status" className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-2xl border-2 border-tinte bg-papier px-4 py-3 text-center font-bold shadow-lg">
      {kind ? t.live.fehlerKind : t.live.fehlerEltern}
    </p>
  );
}

export function KartenSeiteLive({ orte }: { orte: KartenOrt[] }) {
  const [karten, status] = useKarten();
  return (
    <>
      <KartenSeite orte={orte} karten={karten} geladen={status === "ok"} />
      <LiveHinweis status={status} />
    </>
  );
}

export function CheckpointSeiteLive({ ort, kategorien, bild = null }: { ort: KartenOrt; kategorien: Category[]; bild?: string | null }) {
  const [karten, status] = useKarten(ort.id);
  return (
    <>
      <CheckpointSeite ort={ort} karten={karten} kategorien={kategorien} laedt={status === "laedt"} bild={bild} />
      <LiveHinweis status={status} />
    </>
  );
}
