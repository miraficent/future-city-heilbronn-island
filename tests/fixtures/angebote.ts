/**
 * Beispiel-Kurse für Tests der Filter- und Zuordnungslogik.
 * Stand der früheren daten/angebote.json (Demo-Daten) – die App selbst zeigt keine Kurse mehr,
 * die Logik soll aber weiter mit realistisch aufgebauten Angeboten geprüft werden.
 */
import type { Angebot } from "@/lib/angebot";
import { MIN_SICHERHEIT_OEFFENTLICH } from "@/lib/daten";
import roh from "./angebote.json";

export function beispielAngebote(): Angebot[] {
  return (roh as Angebot[]).filter((a) => a.sicherheit >= MIN_SICHERHEIT_OEFFENTLICH);
}
