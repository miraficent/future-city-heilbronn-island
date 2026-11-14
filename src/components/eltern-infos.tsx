import Link from "next/link";
import type { CSSProperties } from "react";
import { kurzname } from "@/components/einrichtung-badge";
import { Symbol } from "@/components/symbol";
import { Card } from "@/components/ui";
import { META, oeffentlicheAngebote } from "@/lib/daten";

/**
 * „Gut zu wissen“ für Eltern: Anmeldung, Alter, Wünsche, Datenschutz, woher die Daten kommen,
 * häufige Fragen und die offiziellen Seiten der Einrichtungen. Kurze Sätze, Sie-Form.
 */

/** Die Angebotsseiten, die die aim-Challenge als Quellen nennt. */
const QUELLEN_LINKS: Record<string, Array<{ text: string; url: string }>> = {
  aim: [
    { text: "Lernen in Ferien & Freizeit", url: "https://www.aim-akademie.org/kurse?kathaupt=18&suchesetzen=false&kfs_sonderrubrik=1264" },
    { text: "Digitale Bildung", url: "https://www.aim-akademie.org/kurse?kathaupt=18&suchesetzen=false&kfs_sonderrubrik=1277" },
    { text: "Juniorakademie", url: "https://www.aim-akademie.org/kurse/suche?clearallkatfilter=true&suchesetzen=true&kfs_stichwort_schlagwort=juniorakademie&kfs_sonderrubrik=-1&kfs_ort_select=-1&kfs_kennz=&kfs_veranartselect=-1&kfs_aussenst_select=-1&kfs_kursbereich=-1&kfs_beginn_dat1=&kfs_beginn_dat2=" },
    { text: "Coding", url: "https://www.aim-akademie.org/kurse?kathaupt=18&suchesetzen=false&kfs_kursbereich=1278&kfs_sonderrubrik=1277" },
  ],
  experimenta: [{ text: "Lernen", url: "https://www.experimenta.science/lernen/" }],
  hdf: [
    { text: "Kinder & Jugendliche", url: "https://hdf-hn.de/kinder-jugendliche/" },
    { text: "Digitale Familienwerkstatt", url: "https://hdf-hn.de/angebote/digitale-familienwerkstatt/" },
  ],
  ipai: [{ text: "Veranstaltungen", url: "https://ipai-foundation.ai/#events" }],
};

const WISSEN = [
  {
    symbol: "ticket",
    titel: "Anmeldung beim Anbieter",
    text: "Wir nehmen keine Anmeldungen an. Über „Zur Anmeldung“ kommen Sie direkt auf die Seite der Einrichtung. Dort gelten deren Preise und Bedingungen.",
  },
  {
    symbol: "cake",
    titel: "So lesen wir das Alter",
    text: "Wir übernehmen die Angabe des Anbieters, zum Beispiel „8–11 Jahre“ oder „ab 10“. Fehlt sie, steht dort „Alter unklar“. Kinder sehen in ihrem Bereich nur Angebote mit bekanntem Alter.",
  },
  {
    symbol: "heart",
    titel: "Die Wünsche Ihres Kindes",
    text: "Im Kinderbereich tippt Ihr Kind auf „Da will ich hin!“. Der Wunsch erscheint oben auf dieser Seite. Ihr Kind kann sich nirgends selbst anmelden.",
  },
] as const;

const FRAGEN = [
  {
    frage: "Kostet Heilbronn Island etwas?",
    antwort: "Nein. Die Seite ist kostenlos und ohne Werbung. Was ein Kurs kostet, steht auf jeder Karte. Viele Angebote sind kostenlos.",
  },
  {
    frage: "Wie lange bleiben die Wünsche und die Merkliste gespeichert?",
    antwort: "Nur in diesem Browserfenster. Schließen Sie es, ist alles weg. Ihre Merkliste können Sie auf Wunsch auf diesem Gerät behalten. Nichts davon wird an uns gesendet.",
  },
  {
    frage: "Warum fehlt ein Kurs, den ich kenne?",
    antwort: "Wir zeigen nur Angebote, die die Einrichtungen auf ihren Websites veröffentlichen, und nur mit einem kommenden Termin. Unsichere Einträge prüft unser Team, bevor sie erscheinen.",
  },
  {
    frage: "Was heißt „Plätze frei“ oder „Ausgebucht“?",
    antwort: "Das melden manche Einrichtungen auf ihrer Website. Steht nichts dabei, wissen wir es nicht. Den aktuellen Stand sehen Sie immer beim Anbieter.",
  },
];

const standFormat = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function ElternInfos() {
  const angebote = oeffentlicheAngebote();
  const einrichtungen = META.quellen.map((q) => kurzname(q, q.id));

  return (
    <div>
      <section id="gut-zu-wissen" aria-labelledby="wissen-titel" className="el-infoteil">
        <h2 id="wissen-titel">Gut zu wissen</h2>
        <p className="el-infoteil__unter">Kurz erklärt: Anmeldung, Alter, Wünsche und Datenschutz.</p>
        <div className="el-wissen">
          {WISSEN.map((w) => (
            <Card key={w.titel}>
              <span className={`el-symbolkreis${w.symbol === "heart" ? " el-symbolkreis--wunsch" : ""}`}><Symbol name={w.symbol} /></span>
              <h3>{w.titel}</h3>
              <p>{w.text}</p>
            </Card>
          ))}
          <Card>
            <span className="el-symbolkreis"><Symbol name="check" /></span>
            <h3>Datenschutz</h3>
            <p>Kein Konto, keine Cookies, kein Tracking, kein KI-Chat. Bilder und Schriften laden wir nicht von fremden Servern. <Link href="/datenschutz/">Mehr zum Datenschutz</Link></p>
          </Card>
        </div>
      </section>

      <section aria-labelledby="daten-titel" className="el-infoteil">
        <h2 id="daten-titel" className="el-titel">Woher kommen die Angebote?</h2>
        <ol className="el-datenweg">
          <li><span><strong>Websites der Einrichtungen</strong>{einrichtungen.join(", ")}</span></li>
          <li><span><strong>Jede Nacht automatisch gelesen</strong>Neue Termine kommen von selbst dazu.</span></li>
          <li><span><strong>Nach festen Regeln geordnet</strong>Thema und Alter stehen in einer offenen Tabelle.</span></li>
          <li><span><strong>Hier für Sie</strong>{angebote.length} Angebote, ohne Tracking.</span></li>
        </ol>
        <p className="el-stand">
          <Symbol name="info" />
          <span>Stand der Daten: {standFormat.format(new Date(META.aktualisiert))} Uhr. Angaben können sich ändern – bitte prüfen Sie Termin, Preis und Alter vor der Anmeldung beim Anbieter.</span>
        </p>
      </section>

      <section aria-labelledby="fragen-titel" className="el-infoteil">
        <h2 id="fragen-titel" className="el-titel">Häufige Fragen</h2>
        <div className="el-fragen">
          {FRAGEN.map((f) => (
            <details key={f.frage}>
              <summary>{f.frage}<Symbol name="plus" /></summary>
              <p>{f.antwort}</p>
            </details>
          ))}
          <details>
            <summary>Wie kommt eine neue Einrichtung dazu?<Symbol name="plus" /></summary>
            <p>Eine neue Einrichtung ist eine neue Zeile in unserer Quellentabelle. Danach erscheinen ihre Angebote automatisch. <Link href="/mitmachen/">So machen Sie mit</Link></p>
          </details>
        </div>
      </section>

      <section aria-labelledby="orte-titel" className="el-infoteil">
        <h2 id="orte-titel" className="el-titel">Die Einrichtungen</h2>
        <p className="el-infoteil__unter">Hier finden Sie die offiziellen Seiten. Links öffnen sich in einem neuen Tab.</p>
        <div className="el-orte">
          {META.quellen.map((q) => (
            <article key={q.id} className="el-ort" style={{ ["--farbe" as string]: q.farbe } as CSSProperties}>
              <h3>{kurzname(q, q.id)}</h3>
              <p>{q.name}</p>
              {q.adresse && <p><Symbol name="pin" className="mr-1 inline !size-4 align-[-2px]" />{q.adresse}</p>}
              <p>{angebote.filter((a) => a.quelle === q.id).length} Angebote bei uns</p>
              <ul>
                {(QUELLEN_LINKS[q.id] ?? [{ text: "Website", url: q.website }]).map((l) => (
                  <li key={l.url}><a href={l.url} target="_blank" rel="noopener noreferrer"><Symbol name="external" />{l.text}</a></li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
