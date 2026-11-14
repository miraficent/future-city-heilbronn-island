"use client";

import Link from "next/link";
import { Symbol } from "../symbol";
import { Card } from "../ui";
import { useTexte } from "./sprache";

/** Links zu den Rechtsgrundlagen, Reihenfolge wie in texte.ts (datenschutz.quellen). */
const QUELLEN_URLS = [
  "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679",
  "https://www.gesetze-im-internet.de/ttdsg/__25.html",
  "https://www.baden-wuerttemberg.datenschutz.de/",
];

/** Datenschutz in kurzen Sätzen für Eltern (Deutsch/Englisch). Ausführliche Rechtstexte stehen in den verlinkten Quellen. */
export function DatenschutzInhalt() {
  const t = useTexte().datenschutz;
  return (
    <main id="inhalt" className="el-seite">
      <header className="el-kopf">
        <p className="el-oben"><Symbol name="check" /> {t.oben}</p>
        <h1>{t.titel}</h1>
        <p className="el-kopf__text">{t.text}</p>
      </header>

      <section aria-labelledby="kurz-titel" className="el-infoteil !mt-10">
        <h2 id="kurz-titel" className="el-titel">{t.kurzTitel}</h2>
        <ul className="el-schritte mt-5">
          {t.kurz.map((s) => <li key={s}>{s}</li>)}
        </ul>
      </section>

      <section aria-labelledby="themen-titel" className="el-infoteil !mt-12">
        <h2 id="themen-titel" className="el-titel">{t.themenTitel}</h2>
        <div className="el-wissen">
          {t.abschnitte.map((a) => (
            <Card key={a.titel}>
              <span className="el-symbolkreis"><Symbol name={a.symbol} /></span>
              <h3>{a.titel}</h3>
              <p>{a.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="rechte-titel" className="el-infoteil !mt-12">
        <h2 id="rechte-titel" className="el-titel">{t.rechteTitel}</h2>
        <p className="mt-3 max-w-[65ch] text-ink-soft">
          {t.rechte} <Link href="/impressum/" className="font-bold text-ink underline underline-offset-4">{t.impressum}</Link>.
        </p>
      </section>

      <section aria-labelledby="quellen-titel" className="el-infoteil !mt-12">
        <h2 id="quellen-titel" className="el-titel">{t.quellenTitel}</h2>
        <ul className="mt-4 grid gap-2">
          {t.quellen.map((text, i) => (
            <li key={QUELLEN_URLS[i]}>
              <a href={QUELLEN_URLS[i]} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 font-bold underline underline-offset-4">
                <Symbol name="external" className="!size-4" />{text}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
