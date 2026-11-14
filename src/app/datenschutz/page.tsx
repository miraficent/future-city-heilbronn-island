import "../eltern.css";
import Link from "next/link";
import { Seitenrahmen } from "@/components/seitenrahmen";
import { Symbol } from "@/components/symbol";
import { Card } from "@/components/ui";

export const metadata = { title: "Datenschutz", description: "Kein Konto, keine Cookies, kein Tracking – kurz erklärt." };

/** Datenschutz in kurzen Sätzen für Eltern. Ausführliche Rechtstexte stehen in den verlinkten Quellen. */
const ABSCHNITTE = [
  {
    symbol: "share",
    titel: "Teilen",
    text: "Der QR-Code entsteht direkt in Ihrem Browser. Ein geteilter Link enthält nur die Nummern der Angebote – keinen Namen, kein Alter. Ein Messenger bekommt den Link erst, wenn Sie ihn selbst teilen.",
  },
  {
    symbol: "calendar",
    titel: "Kalender",
    text: "Kalenderdateien erzeugt Ihr Browser selbst. Es wird nichts an uns gesendet. Beim Import gelten die Bedingungen Ihrer Kalender-App.",
  },
  {
    symbol: "volume",
    titel: "Vorlesen",
    text: "Vorgelesen wird nur mit einer deutschen Stimme, die auf Ihrem Gerät installiert ist. Der Text geht an keinen Sprachdienst. Mikrofon und Kamera nutzen wir nie.",
  },
  {
    symbol: "users",
    titel: "Minderjährige",
    text: "Kinder brauchen kein Konto und melden sich nie selbst an. Sie zeigen ihre Wünsche den Eltern. Die Anmeldung erledigen Erwachsene direkt beim Anbieter – dort gelten dessen Datenschutz und Bedingungen.",
  },
];

const QUELLEN = [
  { text: "DSGVO, insbesondere Art. 5, 6, 8, 12–22 und 25", url: "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679" },
  { text: "§ 25 TDDDG – Speichern auf Ihrem Gerät", url: "https://www.gesetze-im-internet.de/ttdsg/__25.html" },
  { text: "LfDI Baden-Württemberg (Aufsichtsbehörde)", url: "https://www.baden-wuerttemberg.datenschutz.de/" },
];

export default function Datenschutz() {
  return (
    <Seitenrahmen>
      <main id="inhalt" className="el-seite">
        <header className="el-kopf">
          <p className="el-oben"><Symbol name="check" /> Datenschutz</p>
          <h1>Ihre Daten bleiben bei Ihnen</h1>
          <p className="el-kopf__text">Kein Konto, keine Cookies, kein Tracking, keine Werbung. Hier steht kurz, was trotzdem passiert.</p>
        </header>

        <section aria-labelledby="kurz-titel" className="el-infoteil !mt-10">
          <h2 id="kurz-titel" className="el-titel">Datenschutz in Kürze</h2>
          <ul className="el-schritte mt-5 !list-none">
            <li>Suche, Filter, Wünsche und Merkliste laufen in Ihrem Browser. Wir sehen davon nichts.</li>
            <li>Wünsche und Merkliste bleiben nur, solange das Browserfenster offen ist. Die Merkliste können Sie auf Wunsch auf dem Gerät behalten.</li>
            <li>Die Termine lädt Ihr Browser aus unserem Veranstaltungskalender. Dabei wird nur die Liste abgerufen – ohne Kennung, ohne Cookie.</li>
            <li>Schriften, Bilder und Karten kommen von dieser Website selbst, nicht von fremden Servern.</li>
            <li>„Was fehlt?“ zählt nur Thema, Altersgruppe und Tag – nur wenn Sie es selbst abschicken.</li>
          </ul>
        </section>

        <section aria-labelledby="themen-titel" className="el-infoteil !mt-12">
          <h2 id="themen-titel" className="el-titel">Teilen, Kalender, Vorlesen</h2>
          <div className="el-wissen">
            {ABSCHNITTE.map((a) => (
              <Card key={a.titel}>
                <span className="el-symbolkreis"><Symbol name={a.symbol} /></span>
                <h3>{a.titel}</h3>
                <p>{a.text}</p>
              </Card>
            ))}
          </div>
        </section>

        <section aria-labelledby="rechte-titel" className="el-infoteil !mt-12">
          <h2 id="rechte-titel" className="el-titel">Ihre Rechte</h2>
          <p className="mt-3 max-w-[65ch] text-ink-soft">
            Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch.
            Sie können sich bei einer Datenschutz-Aufsichtsbehörde beschweren, in Baden-Württemberg beim LfDI.
            Wer die Seite betreibt, steht im <Link href="/impressum/" className="font-bold text-ink underline underline-offset-4">Impressum</Link>.
          </p>
        </section>

        <section aria-labelledby="quellen-titel" className="el-infoteil !mt-12">
          <h2 id="quellen-titel" className="el-titel">Rechtsgrundlagen zum Nachlesen</h2>
          <ul className="mt-4 grid gap-2">
            {QUELLEN.map((q) => (
              <li key={q.url}>
                <a href={q.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 font-bold underline underline-offset-4">
                  <Symbol name="external" className="!size-4" />{q.text}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </Seitenrahmen>
  );
}
