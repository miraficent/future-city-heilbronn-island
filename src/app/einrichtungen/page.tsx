import Link from "next/link";
import { HeilbronnKarte } from "@/components/heilbronn-karte";
import { Seitenrahmen } from "@/components/seitenrahmen";
import { lernorte } from "@/lib/lernorte";

export const metadata = { title: "Heilbronn-Karte – alle Lernorte" };

export default function Lernorte() {
  const orte = lernorte();
  return (
    <Seitenrahmen aktiv="karte">
      <main id="inhalt" className="hn-seite mx-auto max-w-7xl px-4 pt-8 sm:px-8">
        <p className="spiel-kennung">Heilbronn · {orte.length} Lernorte · eine Karte</p>
        <h1 className="hn-ueberschrift">Hier wird in echt gelernt.</h1>
        <HeilbronnKarte orte={orte} />
        <p className="hn-fuss">
          Echte Adressen und Kontakte (Impressum der Einrichtungen, geprüft am 14.11.2026). Die Bilder der Orte sind eigene Illustrationen, keine Fotos. Die Häuser im{" "}
          <Link href="/kinder/">Spiel</Link> sind ausgedachte Lernspiele. Anmeldung immer direkt bei der Einrichtung. Externe Links öffnen fremde Seiten; vorher wird nichts von dort geladen.
        </p>
      </main>
    </Seitenrahmen>
  );
}
