import Link from "next/link";
import { HeilbronnKarte, type OrtInfo } from "@/components/heilbronn-karte";
import { Seitenrahmen } from "@/components/seitenrahmen";
import { BERICHT, META, oeffentlicheAngebote } from "@/lib/daten";
import { EINRICHTUNGEN } from "@/lib/einrichtungen";
import { formatTag } from "@/lib/format";
import { slugAusId } from "@/lib/routen";
import type { HausGrafik } from "@/lib/spiel";
import { STATIONEN } from "@/lib/spiel";

export const metadata = { title: "Heilbronn-Karte – alle Lernorte" };

/** Wie die Pipeline die Daten der jeweiligen Website liest (siehe konfiguration/quellen.csv). */
const DATENWEG: Record<string, string> = {
  aim: "Kurslisten der Website und Kalender-Export je Kurs",
  experimenta: "Veranstaltungskalender der Website",
  hdf: "öffentliche Schnittstelle der Kursverwaltung",
  ipai: "Veranstaltungsseiten der Website",
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

  // Jede Einrichtung aus konfiguration/quellen.csv erscheint automatisch – mit Koordinaten aus ihrer Adresse.
  const orte: OrtInfo[] = META.quellen.flatMap((q) => {
    if (q.lat === undefined || q.lon === undefined) return [];
    const e = EINRICHTUNGEN.find((x) => x.id === q.id);
    const eigene = angebote.filter((a) => a.quelle === q.id);
    const bericht = BERICHT.quellen.find((b) => b.quelle === q.id);
    const naechste = eigene
      .map((a) => ({ a, t: a.termine.find((t) => new Date(t.ende ?? t.start) >= jetzt) }))
      .filter((x) => x.t)
      .sort((x, y) => x.t!.start.localeCompare(y.t!.start))
      .slice(0, 3);
    const grafik: HausGrafik = e?.grafik ?? (eigene.some((a) => a.themen.includes("ki")) ? "ki-atelier" : "code-labor");
    const telefon = e && "telefon" in e ? String(e.telefon) : undefined;
    return [
      {
        id: q.id,
        name: (e?.name ?? q.name).split(/&| – /)[0]!.trim(),
        titel: e?.titel ?? q.name,
        text: e?.text ?? "",
        adresse: q.adresse ?? "",
        website: q.website,
        anmeldung: e?.angebot ?? q.website,
        kontakt: e?.kontakt,
        telefon,
        grafik,
        hausImSpiel: STATIONEN.find((s) => s.id === q.id)?.kurz,
        farbe: q.farbe,
        lat: q.lat,
        lon: q.lon,
        datenweg: DATENWEG[q.id] ?? "öffentliche Angebotsseiten",
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
      },
    ];
  });

  return (
    <Seitenrahmen aktiv="karte">
      <main id="inhalt" className="hn-seite mx-auto max-w-7xl px-4 pt-8 sm:px-8">
        <p className="spiel-kennung">Heilbronn · {orte.length} Lernorte · eine Karte</p>
        <h1 className="hn-ueberschrift">Hier wird in echt gelernt.</h1>
        <HeilbronnKarte orte={orte} />
        <p className="hn-fuss">
          Echte Adressen und Kontakte (Impressum der Einrichtungen, geprüft am 14.11.2026). Die Häuser im <Link href="/kind/">Spiel</Link> sind
          ausgedachte Lernspiele. Anmeldung immer direkt bei der Einrichtung. Externe Links öffnen fremde Seiten; vorher wird nichts von dort geladen.
        </p>
      </main>
    </Seitenrahmen>
  );
}
