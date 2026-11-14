/**
 * Fachwerkhaus für die Stadtkarte – eigene flache Zeichnung (DESIGN.md Projektentscheidung 10).
 * Ursprung (0, 0) = Mitte unten auf dem Boden. Größe ca. 38 × 54 (mit Seitenwand und Schornstein).
 * Gleiche Form als Einzeldatei: public/grafik/fachwerkhaus.svg
 */
import { F } from "@/lib/kinderkarte";

export function Fachwerkhaus({ dach = F.dach }: { dach?: string }) {
  return (
    <g>
      {/* Seitenwand (dunkler) für die Tiefe */}
      <polygon points="13,0 13,-27 19,-31 19,-4" fill={F.sand} />
      {/* Schornstein */}
      <rect x={6} y={-49} width={5} height={10} fill={F.balken} />
      {/* Dach: Vorderseite + dunklere Seite */}
      <polygon points="0,-48 15,-27 21,-31 6,-52" fill={dach} />
      <polygon points="0,-48 15,-27 21,-31 6,-52" fill={F.text} opacity={0.2} />
      <polygon points="-15,-27 0,-48 15,-27" fill={dach} />
      {/* Wand */}
      <rect x={-13} y={-27} width={26} height={27} fill={F.wand} />
      {/* Fachwerk: Rahmen, Stockwerkbalken, Ständer, Kreuzstreben */}
      <g stroke={F.balken} strokeWidth={1.8} strokeLinecap="square" fill="none">
        <rect x={-13} y={-27} width={26} height={27} />
        <path d="M-13 -13.5 H13 M-4.5 -27 V0 M4.5 -27 V-13.5" />
        <path d="M-13 -27 L-4.5 -13.5 M-4.5 -27 L-13 -13.5 M4.5 -27 L13 -13.5 M13 -27 L4.5 -13.5" />
        <path d="M-8 -27 L0 -40 L8 -27 M0 -40 V-27" />
      </g>
      {/* Fenster (blau) und Tür */}
      <rect x={-2.5} y={-23} width={5} height={6} rx={1} fill={F.fluss} stroke={F.balken} strokeWidth={1} />
      <rect x={-11} y={-10} width={5} height={6} rx={1} fill={F.fluss} stroke={F.balken} strokeWidth={1} />
      <rect x={6} y={-10} width={5} height={6} rx={1} fill={F.fluss} stroke={F.balken} strokeWidth={1} />
      <rect x={-2.5} y={-9} width={5} height={9} rx={2.5} fill={F.balken} />
    </g>
  );
}
