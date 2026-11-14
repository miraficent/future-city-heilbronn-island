import Link from "next/link";
import { Owl } from "@/components/ui";
import { Symbol } from "@/components/symbol";

/**
 * Startseite (DESIGN.md § Pages 1): Nachthimmel mit kleinen Sternen, Eule,
 * Titel und zwei große Wahlkarten – „Für mich“ (Kinder/Teens) und „Für mein Kind“ (Eltern).
 */

/** Sterne an festen Stellen (gleich bei jedem Laden) */
const STERNE = Array.from({ length: 46 }, (_, i) => ({
  x: (i * 137.5) % 100,
  y: (i * 61.8) % 70,
  r: i % 5 === 0 ? 2.2 : 1.2,
}));

export default function Start() {
  return (
    <main id="inhalt" className="start">
      <section className="start__hero">
        <svg className="start__sterne" viewBox="0 0 100 70" preserveAspectRatio="none" aria-hidden="true">
          {STERNE.map((s, i) => <circle key={i} className="start__stern" cx={s.x} cy={s.y} r={s.r / 10} />)}
          <circle className="start__planet" cx={88} cy={10} r={2.6} />
        </svg>
        <Owl className="ui-guide__owl" />
        <h1 className="start__titel">Heilbronn Island</h1>
        <p className="start__unter">Entdecke, was es in Heilbronn für dich gibt.</p>
        <div className="start__karten">
          <Link href="/kinder/" className="start__karte start__karte--kind">
            <Symbol name="rocket" />
            <span className="start__karte-titel">Für mich</span>
            <span className="start__karte-unter">Kinder und Teens</span>
          </Link>
          <Link href="/eltern/" className="start__karte">
            <Symbol name="users" />
            <span className="start__karte-titel">Für mein Kind</span>
            <span className="start__karte-unter">Eltern</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
