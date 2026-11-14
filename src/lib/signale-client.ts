import { leererStand, pruefeSignal, pruefeStand, zaehle, type Signal, type SignalStand } from "./signal-regeln.mjs";
import { lies, schreibe } from "./speicher";

/*
 * Anonyme Wünsche im Browser. Ein Signal geht nur nach einem bewussten Klick raus.
 * Gibt es keinen Server (z. B. reine statische Seite), bleibt der Zähler in dieser Browsersitzung.
 */

const SITZUNG = "signale";

function heute() {
  return new Date().toISOString().slice(0, 10);
}

export async function sendeSignal(roh: Signal): Promise<"gesendet" | "lokal" | "ungueltig"> {
  const signal = pruefeSignal(roh);
  if (!signal) return "ungueltig";
  try {
    const antwort = await fetch("/api/signal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(signal), keepalive: true });
    if (antwort.ok) return "gesendet";
  } catch {
    // Kein Server erreichbar – dann zählt der Browser lokal mit.
  }
  schreibe("sitzung", SITZUNG, zaehle(pruefeStand(lies("sitzung", SITZUNG, null)), signal, heute()));
  return "lokal";
}

export async function ladeSignale(): Promise<{ stand: SignalStand; quelle: "server" | "sitzung" }> {
  try {
    const antwort = await fetch("/api/signale", { cache: "no-store" });
    if (antwort.ok) return { stand: pruefeStand(await antwort.json()), quelle: "server" };
  } catch {
    // siehe oben
  }
  return { stand: pruefeStand(lies("sitzung", SITZUNG, leererStand())), quelle: "sitzung" };
}
