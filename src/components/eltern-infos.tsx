"use client";

import Link from "next/link";
import { Symbol } from "@/components/symbol";
import { useTexte } from "./eltern/sprache";

/** Häufige Fragen der Eltern – ganz unten auf der Seite, kurze Antworten in Sie-Form (bzw. Englisch). */
export function ElternInfos() {
  const t = useTexte().infos;
  return (
    <section id="fragen" aria-labelledby="fragen-titel" className="el-infoteil">
      <h2 id="fragen-titel" className="el-titel">{t.fragenTitel}</h2>
      <div className="el-fragen">
        {t.fragen.map((f) => (
          <details key={f.frage}>
            <summary>{f.frage}<Symbol name="plus" /></summary>
            <p>{f.antwort}</p>
          </details>
        ))}
        <details>
          <summary>{t.neuFrage}<Symbol name="plus" /></summary>
          <p>{t.neuAntwort} <Link href="/mitmachen/">{t.neuLink}</Link></p>
        </details>
        <details>
          <summary>{t.datenschutzTitel}<Symbol name="plus" /></summary>
          <p>{t.datenschutzText} <Link href="/datenschutz/">{t.datenschutzLink}</Link></p>
        </details>
      </div>
    </section>
  );
}
