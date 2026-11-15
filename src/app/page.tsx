import Link from "next/link";
import type { CSSProperties } from "react";
import { Owl } from "@/components/ui";
import { KinderFigurBild } from "@/components/kinderreise/kinder-figuren";

/**
 * Startseite (DESIGN.md § Pages 1): Nachthimmel, die Eule fliegt herein und setzt sich auf den Titel,
 * Themenbilder (public/grafik/themen/) ploppen nacheinander auf und schweben leicht.
 * Zwei große Wahlkarten – „Kind“ (Kinder/Teens) und „Eltern“.
 * Nur CSS-Animationen; bei „Bewegung reduzieren“ steht alles still.
 */

/** Sterne: fester Zufall (gleich bei jedem Laden), gut verteilt */
const STERNE = (() => {
  let s = 11;
  const r = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  return Array.from({ length: 60 }, () => ({ x: r() * 100, y: r() * 100, g: r() < 0.2 ? 4 : 2, v: r() * 4 }));
})();

/** Themenbilder: Datei, Position (in % der Fläche), Größe in px; mobil = Position auf dem Handy (sonst dort ausgeblendet) */
const BILDER: { datei: string; x: number; y: number; g: number; mobil?: [number, number] }[] = [
  { datei: "rakete", x: 11, y: 14, g: 130, mobil: [11, 8] },
  { datei: "mikroskop", x: 80, y: 16, g: 110 },
  { datei: "ki-roboter", x: 19, y: 44, g: 120, mobil: [12, 96] },
  { datei: "biologie-dna", x: 89, y: 42, g: 120, mobil: [88, 96] },
  { datei: "computer", x: 8, y: 72, g: 115 },
  { datei: "code", x: 80, y: 74, g: 115, mobil: [50, 97] },
  { datei: "buch", x: 24, y: 88, g: 100 },
  { datei: "kunst", x: 93, y: 88, g: 100 },
];

export default function Start() {
  return (
    <main id="inhalt" className="start">
      <section className="start__hero">
        <div className="start__himmel" aria-hidden="true">
          {STERNE.map((s, i) => (
            <span key={i} className="start__stern"
              style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.g, height: s.g, animationDelay: `${-s.v}s` } as CSSProperties} />
          ))}
          <span className="start__planet" />
        </div>

        <div className="start__bilder" aria-hidden="true">
          {BILDER.map((b, i) => (
            <span key={b.datei} className={`start__bild${b.mobil ? "" : " start__bild--gross"}`}
              style={{ "--x": `${b.x}%`, "--y": `${b.y}%`, "--mx": `${b.mobil?.[0] ?? b.x}%`, "--my": `${b.mobil?.[1] ?? b.y}%`, "--g": `${b.g}px`, "--verz": `${0.5 + i * 0.15}s`, "--dauer": `${4 + (i % 3)}s` } as CSSProperties}>
              {/* eslint-disable-next-line @next/next/no-img-element -- eigene SVG-Grafik, statischer Export */}
              <img src={`/grafik/themen/${b.datei}.svg`} alt="" width={200} height={200} />
            </span>
          ))}
        </div>

        <div className="start__titel-rahmen">
          <Owl className="start__eule" />
          <h1 className="start__titel">Heilbronn Island</h1>
        </div>
        <p className="start__unter"><strong>Finde heraus, was in Heilbronn für dich los ist!</strong></p>
        <div className="start__karten">
          <Link href="/kinder/" className="start__karte start__karte--kind">
            <span className="start__karte-kinder" aria-hidden="true">
              <KinderFigurBild art="orange" />
            </span>
            <span className="start__karte-titel">Kind</span>
          </Link>
          <Link href="/eltern/" className="start__karte">
            <span className="start__karte-kinder" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element -- eigene SVG-Grafik, statischer Export */}
              <img src="/grafik/eltern-neutral.svg" alt="" width={240} height={320} />
            </span>
            <span className="start__karte-titel">Eltern</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
