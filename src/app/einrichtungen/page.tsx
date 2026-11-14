import Link from "next/link";
import { HeilbronnKarte, type OrtInfo } from "@/components/heilbronn-karte";
import { Seitenrahmen } from "@/components/seitenrahmen";
import { Symbol } from "@/components/symbol";
import { BERICHT, META, oeffentlicheAngebote } from "@/lib/daten";
import { EINRICHTUNGEN } from "@/lib/einrichtungen";
import { formatTag } from "@/lib/format";
import { slugAusId } from "@/lib/routen";
import { STATIONEN } from "@/lib/spiel";

export const metadata = { title: "Heilbronn-Karte – die echten Lernorte" };

/** Adressen und Koordinaten aus OpenStreetMap/Nominatim, geprüft am 14.11.2026. */
const STANDORTE: Record<string, { adresse: string; lat: number; lon: number }> = {
  aim: { adresse: "Bildungscampus 7, 74076 Heilbronn", lat: 49.1480204, lon: 9.2149954 },
  experimenta: { adresse: "Experimenta-Platz, 74072 Heilbronn", lat: 49.1445072, lon: 9.2149132 },
  hdf: { adresse: "Erich-Mendelsohn-Straße 1C, 74076 Heilbronn", lat: 49.1453958, lon: 9.2089472 },
  ipai: { adresse: "Im Zukunftspark 11, 74076 Heilbronn", lat: 49.1555884, lon: 9.2076931 },
};

/** Wie die Pipeline die Daten der jeweiligen Website liest (siehe konfiguration/quellen.csv). */
const DATENWEG: Record<string, string> = {
  aim: "Kurslisten der Website und Kalender-Export je Kurs",
  experimenta: "Veranstaltungskalender der Website",
  hdf: "öffentliche JSON-Schnittstelle der Kursverwaltung",
  ipai: "Veranstaltungsseiten aus der Sitemap",
};

const datumFormat = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

function altersSpanne(liste: { alterMin?: number; alterMax?: number }[]): string {
  const mins = liste.map((a) => a.alterMin).filter((x): x is number => x !== undefined);
  const maxs = liste.map((a) => a.alterMax).filter((x): x is number => x !== undefined);
  if (!mins.length) return "für Familien & Erwachsene";
  const offen = liste.some((a) => a.alterMin !== undefined && a.alterMax === undefined);
  return offen || !maxs.length ? `ab ${Math.min(...mins)} Jahren` : `${Math.min(...mins)}–${Math.max(...maxs)} Jahre`;
}

export default function Lernorte() {
  const jetzt = new Date(META.aktualisiert);
  const angebote = oeffentlicheAngebote();
  const orte: OrtInfo[] = EINRICHTUNGEN.map((e) => {
    const eigene = angebote.filter((a) => a.quelle === e.id);
    const standort = STANDORTE[e.id] ?? STANDORTE.aim!;
    const bericht = BERICHT.quellen.find((q) => q.quelle === e.id);
    const naechste = [...eigene]
      .map((a) => ({ a, t: a.termine.find((t) => new Date(t.ende ?? t.start) >= jetzt) }))
      .filter((x) => x.t)
      .sort((x, y) => x.t!.start.localeCompare(y.t!.start))
      .slice(0, 3);
    return {
      id: e.id,
      name: e.name.split("&")[0]!.trim(),
      titel: e.titel,
      text: e.text,
      adresse: standort.adresse,
      website: e.website,
      anmeldung: e.angebot,
      kontakt: e.kontakt,
      grafik: e.grafik,
      hausImSpiel: STATIONEN.find((s) => s.id === e.id)?.kurz ?? e.name,
      farbe: META.quellen.find((q) => q.id === e.id)?.farbe ?? "#2f4bff",
      lat: standort.lat,
      lon: standort.lon,
      datenweg: DATENWEG[e.id] ?? "Website",
      anzahl: eigene.length,
      themen: META.themen
        .map((t) => ({ id: t.id, name: t.name.split("&")[0]!.trim(), anzahl: eigene.filter((a) => a.themen.includes(t.id)).length }))
        .filter((t) => t.anzahl > 0),
      alter: altersSpanne(eigene),
      kostenlos: eigene.filter((a) => a.kosten.euro === 0).length,
      naechste: naechste.map(({ a, t }) => ({
        titel: a.titel,
        slug: slugAusId(a.id),
        wann: formatTag(t!.start),
        alter: a.alterMin !== undefined ? (a.alterMax !== undefined ? `${a.alterMin}–${a.alterMax}` : `ab ${a.alterMin}`) : "alle",
      })),
      datenOk: bericht?.ok ?? false,
      stand: datumFormat.format(new Date(BERICHT.erstellt)),
    };
  });

  return (
    <Seitenrahmen aktiv="karte">
      <main id="inhalt" className="hn-seite mx-auto max-w-7xl px-4 pt-8 sm:px-8">
        <p className="spiel-kennung">Heilbronn · vier Lernorte · eine Karte</p>
        <h1 className="hn-ueberschrift">Hier wird in echt gelernt.</h1>
        <p className="hn-intro">
          Tippe auf einen Pin. Du siehst, was es dort gibt, welche Kurse als Nächstes starten und wie die Anmeldung klappt. Mit
          <Symbol name="play" className="hn-inline-symbol" /> startest du die Entdecker-Tour.
        </p>
        <HeilbronnKarte orte={orte} />
        <p className="hn-fuss">
          Die Pins zeigen die echten Adressen. Die Häuser im <Link href="/kind/">Spiel</Link> sind ausgedachte Lernspiele, keine offiziellen
          Angebote. Anmeldungen laufen immer direkt bei der Einrichtung. Externe Links öffnen fremde Seiten mit deren eigenen
          Datenschutzbedingungen; vorher wird nichts von dort geladen.
        </p>
      </main>
    </Seitenrahmen>
  );
}
