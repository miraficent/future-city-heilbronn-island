import Link from "next/link";
import { Owl } from "@/components/ui";
import { Symbol } from "@/components/symbol";
import { META } from "@/lib/daten";
import { kartenOrte } from "@/lib/kinderkarte";

/**
 * Startseite (DESIGN.md § Pages 1): Nachthimmel mit kleinen Sternen, Vorschau der Stadt,
 * Titel und zwei große Wahlkarten – „Für mich“ (Kinder/Teens) und „Für mein Kind“ (Eltern).
 */

/** Sterne an festen Stellen (gleich bei jedem Laden) */
const STERNE = Array.from({ length: 46 }, (_, i) => ({
  x: (i * 137.5) % 100,
  y: (i * 61.8) % 70,
  r: i % 5 === 0 ? 2.2 : 1.2,
}));

/** Kleine Vorschau der Stadt: Grün, Neckar, Häuser, Kilianskirche, Pins der Orte */
function StadtVorschau() {
  return (
    <svg viewBox="0 0 520 220" className="start__vorschau" aria-hidden="true">
      <rect x={10} y={30} width={500} height={170} rx={40} style={{ fill: "var(--land)" }} />
      <rect x={10} y={186} width={500} height={22} rx={11} style={{ fill: "var(--cliff)" }} />
      <path d="M150 30 C130 90 190 120 160 200" style={{ fill: "none", stroke: "var(--sea)", strokeWidth: 22, strokeLinecap: "round" }} />
      <path d="M60 150 C140 140 220 160 300 120 S420 90 470 110" style={{ fill: "none", stroke: "var(--snow)", strokeWidth: 5, strokeDasharray: "14 11", strokeLinecap: "round" }} />
      {[[250, 120], [276, 112], [300, 128], [326, 116], [232, 140], [352, 132], [280, 150]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x},${y})`}>
          <rect x={-9} y={-14} width={18} height={14} style={{ fill: "var(--paper)" }} />
          <polygon points="-11,-14 0,-24 11,-14" style={{ fill: "var(--roof)" }} />
        </g>
      ))}
      <g transform="translate(312,108)">
        <rect x={-8} y={-62} width={16} height={62} style={{ fill: "var(--paper)" }} />
        <polygon points="-11,-62 0,-86 11,-62" style={{ fill: "var(--roof)" }} />
      </g>
      {kartenOrte(META.quellen).map((o) => (
        <path key={o.id} d="M0 0 C-3 -5 -12 -11 -12 -20 A12 12 0 1 1 12 -20 C12 -11 3 -5 0 0 Z"
          transform={`translate(${20 + o.x * 0.4},${30 + o.y * 0.21})`}
          style={{ fill: o.farbe, stroke: "var(--snow)", strokeWidth: 3 }} />
      ))}
    </svg>
  );
}

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
        <StadtVorschau />
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
