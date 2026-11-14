import { redirect } from "next/navigation";

/**
 * Die frühere Laufwelt („Spielwelt“, components/spiel/) ist vorerst ausgeblendet –
 * Kinder starten jetzt in Mini-Heilbronn. Der Code der Laufwelt bleibt unverändert erhalten.
 */
export default function Kind() {
  redirect("/kinder/");
}
