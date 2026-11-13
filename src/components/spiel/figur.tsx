import type { Figur as FigurDaten, Frisur } from "@/lib/figuren";

export type Blick = "vorne" | "hinten" | "seite";
const U = 4; // ein „Pixel“ der Figur in Weltkoordinaten
const LINIE = "#254950";
const AUGE = "#1c1934";

type Block = [x: number, y: number, b: number, h: number, farbe: string];

function Bloecke({ teile, kontur = true }: { teile: Block[]; kontur?: boolean }) {
  return (
    <>
      {teile.map(([x, y, b, h, farbe], i) => (
        <rect
          key={i}
          x={x * U}
          y={y * U}
          width={b * U}
          height={h * U}
          fill={farbe}
          stroke={kontur ? LINIE : "none"}
          strokeWidth={kontur ? 1.4 : 0}
          shapeRendering="crispEdges"
        />
      ))}
    </>
  );
}

function abdunkeln(hex: string, faktor = 0.78): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const k = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => Math.round(c * faktor));
  return `#${k.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

function haarVorne(frisur: Frisur, h: string, band: string): Block[] {
  switch (frisur) {
    case "kurz":
      return [[-4, -20, 8, 2.5, h], [-4, -18, 1, 2, h], [3, -18, 1, 2, h], [-2, -18, 3, 1, h]];
    case "locken":
      return [[-5, -21, 10, 3.5, h], [-5.5, -18, 2, 4.5, h], [3.5, -18, 2, 4.5, h], [-4, -22, 2, 1.2, h], [-1, -22.6, 2, 1.4, h], [2, -22, 2, 1.2, h]];
    case "zoepfe":
      return [[-4, -20, 8, 2.5, h], [-4, -18, 1, 1.5, h], [3, -18, 1, 1.5, h], [-6.2, -17, 2, 4.5, h], [4.2, -17, 2, 4.5, h], [-6.2, -17.6, 2, 0.9, band], [4.2, -17.6, 2, 0.9, band]];
    case "lang":
      return [[-4, -20, 8, 2.5, h], [-4.6, -18, 1.6, 8, h], [3, -18, 1.6, 8, h]];
    case "kopftuch":
      return [[-4.6, -20.6, 9.2, 3, h], [-4.6, -18, 1.8, 6.5, h], [2.8, -18, 1.8, 6.5, h], [-3, -12.2, 6, 1.4, h]];
    default:
      return [];
  }
}

function haarHinten(frisur: Frisur, h: string, band: string): Block[] {
  switch (frisur) {
    case "kurz":
      return [[-4, -20, 8, 6, h]];
    case "locken":
      return [[-5.2, -22, 10.4, 8.5, h]];
    case "zoepfe":
      return [[-4, -20, 8, 6, h], [-6.2, -17, 2, 4.5, h], [4.2, -17, 2, 4.5, h], [-6.2, -17.6, 2, 0.9, band], [4.2, -17.6, 2, 0.9, band]];
    case "lang":
      return [[-4.6, -20, 9.2, 11, h]];
    case "kopftuch":
      return [[-4.6, -20.6, 9.2, 10.5, h]];
    default:
      return [];
  }
}

function haarSeite(frisur: Frisur, h: string, band: string): Block[] {
  switch (frisur) {
    case "kurz":
      return [[-3.6, -20, 7, 2.5, h], [-3.6, -18, 2.6, 4, h]];
    case "locken":
      return [[-4.6, -21.6, 8.6, 4, h], [-4.6, -18, 3.6, 5.5, h]];
    case "zoepfe":
      return [[-3.6, -20, 7, 2.5, h], [-3.6, -18, 2, 3, h], [-5.6, -17, 2, 4.5, h], [-5.6, -17.6, 2, 0.9, band]];
    case "lang":
      return [[-3.6, -20, 7, 2.5, h], [-3.6, -18, 2.6, 9, h]];
    case "kopftuch":
      return [[-4, -20.6, 8, 3, h], [-4, -18, 3, 7, h], [-1, -12.2, 4, 1.4, h]];
    default:
      return [];
  }
}

/** Eine Spielfigur im Pixel-Stil. Ursprung = Mitte zwischen den Füßen. */
export function Figur({ figur, blick = "vorne", laeuft = false }: { figur: FigurDaten; blick?: Blick; laeuft?: boolean }) {
  const roboter = figur.frisur === "roboter";
  const hose = figur.hose;
  const hinten = abdunkeln(figur.oberteil);

  const beine: Block[][] =
    blick === "seite"
      ? [
          [[-1.6, -6, 2, 4, abdunkeln(hose)], [-1.6, -2, 2.8, 2, abdunkeln(figur.schuhe)]],
          [[-0.4, -6, 2, 4, hose], [-0.4, -2, 3, 2, figur.schuhe]],
        ]
      : [
          [[-3, -6, 2, 4, hose], [-3.4, -2, 2.6, 2, figur.schuhe]],
          [[1, -6, 2, 4, hose], [0.8, -2, 2.6, 2, figur.schuhe]],
        ];

  const rumpf: Block[] =
    blick === "seite"
      ? [[-3, -11.6, 6, 6, figur.oberteil], [-3, -7.2, 6, 1.2, hinten]]
      : [[-4, -11.6, 8, 6, figur.oberteil], [-1, -11.6, 2, 1.2, figur.akzent], [-4, -7.2, 8, 1.2, hinten]];

  const arme: Block[][] =
    blick === "seite"
      ? [[[-0.6, -11, 2, 4.6, hinten], [-0.6, -6.6, 2, 1.6, figur.haut]]]
      : [
          [[-5.6, -11, 1.6, 4.6, figur.oberteil], [-5.6, -6.6, 1.6, 1.6, figur.haut]],
          [[4, -11, 1.6, 4.6, figur.oberteil], [4, -6.6, 1.6, 1.6, figur.haut]],
        ];

  let kopf: Block[];
  let gesicht: Block[] = [];
  if (roboter) {
    kopf = [[-4, -19.4, 8, 7.4, figur.haut], [-0.5, -21.4, 1, 2, "#5f7178"], [-1, -22.6, 2, 1.4, figur.haar]];
    if (blick === "vorne") gesicht = [[-3, -17, 6, 2.4, AUGE], [-2, -16.4, 1.2, 1.2, "#7fe3ff"], [0.8, -16.4, 1.2, 1.2, "#7fe3ff"], [-1.6, -13.8, 3.2, 0.8, "#5f7178"]];
    if (blick === "seite") gesicht = [[1, -17, 3, 2.4, AUGE], [2, -16.4, 1.2, 1.2, "#7fe3ff"]];
    if (blick === "hinten") gesicht = [[-2.5, -17.5, 5, 3.5, "#9fb2b8"]];
  } else if (blick === "seite") {
    kopf = [[-3, -18.6, 6.6, 6.6, figur.haut], [3.4, -15.2, 0.9, 1.1, figur.haut]];
    gesicht = [[1.6, -15.8, 1, 1.5, AUGE], [2.2, -13.8, 1.2, 0.5, "#7a3b2e"], [0.8, -14.2, 1, 0.8, "#e88a7a"]];
  } else {
    kopf = [[-1, -12.6, 2, 1.2, figur.haut], [-3.5, -18.6, 7, 6.6, figur.haut]];
    if (blick === "vorne") {
      gesicht = [[-2.2, -15.8, 1, 1.5, AUGE], [1.2, -15.8, 1, 1.5, AUGE], [-3, -14, 1, 0.9, "#e88a7a"], [2, -14, 1, 0.9, "#e88a7a"], [-1, -13.4, 2, 0.6, "#7a3b2e"]];
    }
  }

  const haar = roboter ? [] : blick === "vorne" ? haarVorne(figur.frisur, figur.haar, figur.akzent) : blick === "hinten" ? haarHinten(figur.frisur, figur.haar, figur.akzent) : haarSeite(figur.frisur, figur.haar, figur.akzent);

  return (
    <g className={`figur ${laeuft ? "figur-laeuft" : ""}`}>
      <ellipse cx="0" cy="1" rx="15" ry="4.5" fill="#254950" opacity="0.22" />
      <g className="figur-koerper">
        <g className="figur-bein figur-bein-a"><Bloecke teile={beine[0]!} /></g>
        <g className="figur-bein figur-bein-b"><Bloecke teile={beine[1]!} /></g>
        <Bloecke teile={rumpf} />
        {arme.map((arm, i) => (
          <g key={i} className={`figur-arm figur-arm-${i ? "b" : "a"}`}><Bloecke teile={arm} /></g>
        ))}
        <Bloecke teile={kopf} />
        <Bloecke teile={gesicht} kontur={false} />
        <Bloecke teile={haar} />
        {figur.brille && blick === "vorne" && (
          <g fill="none" stroke={AUGE} strokeWidth="1.3">
            <rect x={-2.9 * U} y={-16.4 * U} width={2.4 * U} height={2.6 * U} />
            <rect x={0.5 * U} y={-16.4 * U} width={2.4 * U} height={2.6 * U} />
            <path d={`M${-0.5 * U} ${-15.2 * U}h${1 * U}`} />
          </g>
        )}
        {figur.brille && blick === "seite" && <rect x={0.8 * U} y={-16.4 * U} width={2.4 * U} height={2.6 * U} fill="none" stroke={AUGE} strokeWidth="1.3" />}
      </g>
    </g>
  );
}

/** Kleines Portrait für Auswahl, Kopfleiste und Karten. */
export function FigurPortrait({ figur, className = "" }: { figur: FigurDaten; className?: string }) {
  return (
    <svg viewBox="-34 -100 68 106" className={className} aria-hidden="true" focusable="false">
      <g transform="scale(1.1)">
        <Figur figur={figur} blick="vorne" />
      </g>
    </svg>
  );
}
