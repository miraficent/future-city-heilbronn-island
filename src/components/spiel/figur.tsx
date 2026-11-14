import type { Figur as FigurDaten } from "@/lib/figuren";

export type Blick = "vorne" | "hinten" | "seite";

const U = 3.2; // ein „Pixel“ der Figur in Weltkoordinaten
const KONTUR = "#24324a";
const AUGE = "#1c1934";
const WANGE = "#f08c8c";
const MUND = "#9b3b3b";

/** [x, y, breite, höhe, farbe] in Figur-Pixeln. Ursprung = Mitte zwischen den Füßen, y nach oben negativ. */
type Block = [number, number, number, number, string];

function farbe(hex: string, faktor: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const k = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.round(faktor >= 1 ? c + (255 - c) * (faktor - 1) : c * faktor),
  );
  return `#${k.map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Zeichnet eine Gruppe mit sauberer Außenkontur: erst eine dunkle, etwas größere Silhouette,
 * dann die Farbflächen ohne Linien dazwischen – typischer, aufgeräumter Pixel-Art-Stil.
 */
function Gruppe({ teile, details = [], className }: { teile: Block[]; details?: Block[]; className?: string }) {
  return (
    <g className={className} shapeRendering="crispEdges">
      {teile.map(([x, y, b, h], i) => (
        <rect key={`k${i}`} x={(x - 0.6) * U} y={(y - 0.6) * U} width={(b + 1.2) * U} height={(h + 1.2) * U} rx={U * 0.5} fill={KONTUR} />
      ))}
      {teile.map(([x, y, b, h, f], i) => (
        <rect key={`f${i}`} x={x * U} y={y * U} width={b * U} height={h * U} fill={f} />
      ))}
      {details.map(([x, y, b, h, f], i) => (
        <rect key={`d${i}`} x={x * U} y={y * U} width={b * U} height={h * U} fill={f} />
      ))}
    </g>
  );
}

/* ---------- Haare & Köpfe ---------- */

function kopfVorne(f: FigurDaten): { teile: Block[]; details: Block[] } {
  const h = f.haar;
  const hell = farbe(h, 1.35);
  const haut = f.haut;
  if (f.frisur === "roboter") {
    return {
      teile: [[-5, -25, 10, 9.5, haut], [-0.4, -28, 0.8, 3, "#5f7178"], [-1.1, -29.6, 2.2, 1.8, h], [-6, -22, 1, 3, "#5f7178"], [5, -22, 1, 3, "#5f7178"]],
      details: [[-4, -23, 8, 4, AUGE], [-3, -22, 1.8, 1.8, f.akzent], [1.2, -22, 1.8, 1.8, f.akzent], [-2, -18.2, 4, 0.8, "#5f7178"], [-4.4, -24.4, 2, 0.8, "#ffffff"]],
    };
  }
  const gesicht: Block[] = [
    [-3.3, -20.6, 1.7, 2.1, AUGE], [1.6, -20.6, 1.7, 2.1, AUGE],
    [-3.2, -20.5, 0.6, 0.6, "#ffffff"], [1.7, -20.5, 0.6, 0.6, "#ffffff"],
    [-4.4, -18, 1.6, 0.9, WANGE], [2.8, -18, 1.6, 0.9, WANGE],
    [-1.1, -16.9, 2.2, 0.7, MUND], [-1.7, -17.4, 0.7, 0.6, MUND], [1, -17.4, 0.7, 0.6, MUND],
  ];
  if (f.maedchen) gesicht.push([-4, -21.2, 0.8, 0.6, AUGE], [3.2, -21.2, 0.8, 0.6, AUGE]);
  const kopf: Block = [-5, -24.8, 10, 10, haut];

  switch (f.frisur) {
    case "pferdeschwanz":
      return {
        teile: [[5.2, -22.5, 2.4, 6.8, h], [5.6, -16, 1.6, 1.8, h], kopf, [-5.8, -26.4, 11.6, 3.6, h], [-5.8, -23, 1.6, 6.2, h], [4.2, -23, 1.6, 6.2, h], [2.2, -28.2, 2.3, 2, f.akzent], [4.9, -28.2, 2.3, 2, f.akzent]],
        details: [...gesicht, [-4.2, -23.2, 3, 1.4, h], [0.6, -23.2, 3.6, 1.4, h], [-3, -26, 3.4, 0.8, hell], [4.3, -27.6, 0.8, 1.2, farbe(f.akzent, 0.75)]],
      };
    case "puffs":
      return {
        teile: [[-8, -30.4, 4.2, 4, h], [3.8, -30.4, 4.2, 4, h], kopf, [-6.2, -27, 12.4, 4.4, h], [-6.6, -23, 2.2, 5.4, h], [4.4, -23, 2.2, 5.4, h]],
        details: [...gesicht, [-4.6, -23.1, 9.2, 1.3, h], [-6.8, -29.6, 1.4, 0.8, hell], [5, -29.6, 1.4, 0.8, hell], [-4.8, -27.4, 1.6, 1.3, f.akzent], [3.2, -27.4, 1.6, 1.3, f.akzent]],
      };
    case "kopftuch":
      return {
        teile: [[-6.4, -26.8, 12.8, 13, h], [-6.6, -14.6, 13.2, 2.4, farbe(h, 0.82)]],
        details: [[-4.1, -22.6, 8.2, 7.6, haut], ...gesicht, [-6, -26.2, 4, 0.8, farbe(h, 1.3)], [3.4, -15.6, 1.2, 1.2, f.akzent]],
      };
    case "locken":
      return {
        teile: [kopf, [-6.2, -27, 12.4, 4, h], [-6.6, -24, 2.4, 5.6, h], [4.2, -24, 2.4, 5.6, h], [-5.2, -28.6, 2.8, 2, h], [-1.6, -29, 3.2, 2.2, h], [2.4, -28.6, 2.8, 2, h], [-7, -19.4, 1.6, 1.8, h], [5.4, -19.4, 1.6, 1.8, h]],
        details: [...gesicht, [-4.4, -23.2, 2.2, 1.6, h], [-1.2, -23.4, 2.4, 1.6, h], [2.2, -23.2, 2.2, 1.6, h], [-4.6, -27.6, 1.4, 0.8, hell], [-0.8, -28.2, 1.4, 0.8, hell], [3, -27.6, 1.4, 0.8, hell]],
      };
    case "seitenscheitel":
      return {
        teile: [kopf, [-5.6, -26.2, 11.2, 3.6, h], [-5.6, -23, 1.6, 3.4, h], [4, -23, 1.6, 3.4, h]],
        details: [...gesicht, [-4, -23.2, 5.6, 1.4, h], [-2.6, -26, 4, 0.8, hell]],
      };
    default:
      return {
        teile: [kopf, [-5.6, -26.2, 11.2, 3.4, h], [-5.6, -23, 1.4, 3, h], [4.2, -23, 1.4, 3, h]],
        details: [...gesicht, [-3.6, -23.2, 2.6, 1.2, h], [0.2, -23.2, 3.2, 1.2, h], [-2, -25.9, 3, 0.8, hell]],
      };
  }
}

function kopfHinten(f: FigurDaten): { teile: Block[]; details: Block[] } {
  const h = f.haar;
  const hell = farbe(h, 1.35);
  if (f.frisur === "roboter") {
    return { teile: [[-5, -25, 10, 9.5, f.haut], [-0.4, -28, 0.8, 3, "#5f7178"], [-1.1, -29.6, 2.2, 1.8, h]], details: [[-3, -23, 6, 4, farbe(f.haut, 0.85)], [-2, -22, 1, 1, f.akzent], [1, -22, 1, 1, f.akzent]] };
  }
  switch (f.frisur) {
    case "pferdeschwanz":
      return { teile: [[-5.8, -26.4, 11.6, 10, h], [-1.4, -17.6, 2.8, 6.6, h], [-2.6, -28.2, 2.3, 2, f.akzent], [0.3, -28.2, 2.3, 2, f.akzent]], details: [[-3, -26, 4, 0.8, hell], [-0.4, -27.6, 0.8, 1.2, farbe(f.akzent, 0.75)]] };
    case "puffs":
      return { teile: [[-8, -30.4, 4.2, 4, h], [3.8, -30.4, 4.2, 4, h], [-6.6, -27, 13.2, 11, h]], details: [[-6.8, -29.6, 1.4, 0.8, hell], [5, -29.6, 1.4, 0.8, hell]] };
    case "kopftuch":
      return { teile: [[-6.4, -26.8, 12.8, 13, h], [-6.8, -14.6, 13.6, 3, farbe(h, 0.82)]], details: [[-5, -26, 4, 0.8, farbe(h, 1.3)]] };
    case "locken":
      return {
        teile: [[-6.4, -27, 12.8, 11, h], [-5.2, -28.6, 2.8, 2, h], [-1.6, -29, 3.2, 2.2, h], [2.4, -28.6, 2.8, 2, h], [-7, -18.6, 2, 2.4, h], [5, -18.6, 2, 2.4, h]],
        details: [[-4.6, -27.6, 1.4, 0.8, hell], [-0.8, -28.2, 1.4, 0.8, hell], [3, -27.6, 1.4, 0.8, hell], [-3, -22, 1.6, 1.2, farbe(h, 0.8)], [1.6, -20, 1.6, 1.2, farbe(h, 0.8)]],
      };
    default:
      return { teile: [[-5.6, -26.2, 11.2, 10, h]], details: [[-3, -25.9, 4, 0.8, hell]] };
  }
}

function kopfSeite(f: FigurDaten): { teile: Block[]; details: Block[] } {
  const h = f.haar;
  const hell = farbe(h, 1.35);
  if (f.frisur === "roboter") {
    return {
      teile: [[-4.4, -25, 9.4, 9.5, f.haut], [-0.4, -28, 0.8, 3, "#5f7178"], [-1.1, -29.6, 2.2, 1.8, h]],
      details: [[1, -23, 4, 4, AUGE], [2.2, -22, 1.8, 1.8, f.akzent], [-3, -21, 1.2, 2, "#5f7178"]],
    };
  }
  const gesicht: Block[] = [[2, -20.6, 1.5, 2.1, AUGE], [2.1, -20.5, 0.6, 0.6, "#ffffff"], [0.8, -18, 1.5, 0.9, WANGE], [2.8, -16.9, 1.4, 0.7, MUND]];
  if (f.maedchen) gesicht.push([3.4, -21.2, 0.8, 0.6, AUGE]);
  const kopf: Block = [-4.4, -24.8, 9.2, 10, f.haut];
  const nase: Block = [4.7, -19.6, 0.9, 1.3, f.haut];
  switch (f.frisur) {
    case "pferdeschwanz":
      return { teile: [[-7.2, -22.6, 2.6, 6.8, h], [-6.8, -16, 1.8, 1.8, h], kopf, nase, [-5, -26.4, 10, 3.6, h], [-5, -23, 3.4, 6, h], [-7.6, -24.4, 2.2, 2, f.akzent]], details: [...gesicht, [1.6, -23.2, 3.2, 1.3, h], [-2, -26, 3.4, 0.8, hell]] };
    case "puffs":
      return { teile: [[-7.6, -30.4, 4.4, 4, h], kopf, nase, [-6, -27, 11, 4.4, h], [-6, -23, 4.2, 6, h]], details: [...gesicht, [1, -23.1, 3.8, 1.3, h], [-3.8, -27.4, 1.6, 1.3, f.akzent]] };
    case "kopftuch":
      return { teile: [[-5.6, -26.8, 11, 12.4, h], nase, [-5.2, -14.6, 9.6, 2.4, farbe(h, 0.82)]], details: [[0.2, -22.6, 4.6, 7.6, f.haut], ...gesicht] };
    case "locken":
      return {
        teile: [kopf, nase, [-5.6, -27, 10.6, 4, h], [-6, -24, 4.2, 6.4, h], [-4.6, -28.6, 2.8, 2, h], [-1, -29, 3, 2.2, h], [2.4, -28.4, 2.4, 1.8, h], [-6.4, -18.2, 2, 2, h]],
        details: [...gesicht, [1.6, -23.2, 3, 1.4, h], [-3.4, -27.8, 1.4, 0.8, hell], [0.2, -28.2, 1.4, 0.8, hell]],
      };
    default:
      return { teile: [kopf, nase, [-5, -26.2, 10, 3.4, h], [-5, -23, 3.6, 4.4, h]], details: [...gesicht, [1.8, -23.2, 3, 1.2, h], [-2, -25.9, 3, 0.8, hell]] };
  }
}

/* ---------- Körper ---------- */

/** Schuhe mit Fuß: Turnschuh, Stiefel (bis übers Schienbein) oder Sandale (Fuß sichtbar, Riemen in Schuhfarbe). */
function schuh(f: FigurDaten, x: number, breite: number, dunkel: number): { teile: Block[]; details: Block[] } {
  const c = farbe(f.schuhe, dunkel);
  if (f.schuhArt === "stiefel") return { teile: [[x, -4.8, breite, 4.8, c]], details: [[x, -0.8, breite, 0.8, farbe(f.schuhe, dunkel * 0.7)]] };
  if (f.schuhArt === "sandalen") return { teile: [[x, -3, breite, 3, farbe(f.haut, dunkel)]], details: [[x, -2.3, breite, 0.8, c], [x, -0.7, breite, 0.7, c]] };
  return { teile: [[x, -3, breite, 3, c]], details: f.schuhArt === "sneaker" ? [[x, -1, breite, 0.6, "#fbf7ee"]] : [] };
}

function koerper(f: FigurDaten, blick: Blick) {
  const ob = f.oberteil;
  const obDunkel = farbe(ob, 0.78);
  const unten = f.unten;
  const untenDunkel = farbe(unten, 0.78);
  const roboter = f.kleidung === "roboter";
  const rock = f.kleidung === "rock" || f.kleidung === "kleid" || f.kleidung === "langrock";
  const lang = f.kleidung === "langrock";
  const shorts = f.unterteilArt === "shorts";
  const beinFarbe = rock && !lang ? f.haut : unten;
  const art = f.oberteilArt;
  // T-Shirt: kurze Ärmel, darunter Unterarm. Pullover und Jacke: lange Ärmel.
  const aermel = (x: number, c: string): Block[] =>
    art === "shirt" ? [[x, -13.8, 2.2, 2.4, c], [x, -11.4, 2.2, 4.3, f.haut]] : [[x, -13.8, 2.2, 4.8, c], [x, -9, 2.2, 1.9, roboter ? "#5f7178" : f.haut]];
  // Shorts: oben Stoff, darunter Knie und Schienbein.
  const bein = (x: number, b: number, d: number): Block[] =>
    shorts ? [[x, -7, b, 2, farbe(unten, d)], [x, -5, b, 2.2, farbe(f.haut, d)]] : [[x, -7, b, 4.2, farbe(beinFarbe, d)]];

  if (blick === "seite") {
    const schuhA = schuh(f, -2, 3, 0.85);
    const schuhB = schuh(f, -0.4, 3.4, 1);
    const rumpf: Block[] = [[-3, -14.2, 6, 7.6, f.kleidung === "kleid" ? unten : ob]];
    const rumpfDetails: Block[] = [[-3, -7.4, 6, 0.8, obDunkel]];
    if (rock) rumpf.push(lang ? [-4, -7.6, 8, 5.6, unten] : [-4, -7.6, 8, 3, unten]);
    if (f.kleidung === "hoodie") rumpfDetails.push([-3, -14.2, 2, 2, farbe(ob, 0.7)]);
    if (art === "jacke") rumpfDetails.push([2, -14.2, 1, 6.8, "#fbf7ee"], [-1, -11, 2, 0.6, obDunkel]);
    if (art === "pullover") rumpfDetails.push([-3, -11.6, 6, 0.8, farbe(ob, 1.25)], [-1, -14.2, 3, 1, obDunkel]);
    return {
      beinA: [...bein(-1.8, 2.2, 0.85), ...schuhA.teile],
      beinADetails: schuhA.details,
      beinB: [...bein(-0.4, 2.2, 1), ...schuhB.teile],
      beinBDetails: schuhB.details,
      rumpf,
      rumpfDetails,
      armA: aermel(-1, obDunkel),
      armB: [] as Block[],
    };
  }

  const schuhA = schuh(f, f.schuhArt === "stiefel" ? -3.3 : -3.6, f.schuhArt === "stiefel" ? 2.7 : 3, 1);
  const schuhB = schuh(f, 0.6, f.schuhArt === "stiefel" ? 2.7 : 3, 1);
  const rumpf: Block[] = [[-4, -14.2, 8, 7.6, f.kleidung === "kleid" ? unten : ob]];
  const rumpfDetails: Block[] = [[-4, -7.4, 8, 0.8, obDunkel]];
  if (rock) {
    rumpf.push(lang ? [-5, -7.6, 10, 5.8, unten] : [-5, -7.6, 10, 3.2, unten]);
    rumpfDetails.push(lang ? [-5, -2.6, 10, 0.8, untenDunkel] : [-5, -5.2, 10, 0.8, untenDunkel]);
  }
  const vorne = blick === "vorne";
  if (art === "jacke") {
    if (vorne) rumpfDetails.push([-1.2, -14.2, 2.4, 6.8, "#fbf7ee"], [-1.6, -14.2, 0.5, 6.8, obDunkel], [1.1, -14.2, 0.5, 6.8, obDunkel], [-3.4, -10, 1.6, 0.6, obDunkel], [1.8, -10, 1.6, 0.6, obDunkel]);
    else rumpfDetails.push([-2.4, -14.2, 4.8, 1.2, obDunkel]);
  } else if (art === "pullover") {
    rumpfDetails.push([-4, -11.6, 8, 0.8, farbe(ob, 1.25)], [-4, -10.2, 8, 0.5, farbe(ob, 1.25)]);
    if (vorne) rumpfDetails.push([-2, -14.2, 4, 1, obDunkel]);
  } else if (art === "shirt") {
    if (vorne) rumpfDetails.push([-1.4, -14.2, 2.8, 1.2, farbe(f.haut, 1)], [-1.4, -13, 2.8, 0.4, obDunkel]);
  } else {
    if (f.kleidung === "kleid") rumpfDetails.push([-1.6, -14.2, 3.2, 1.2, "#fbf7ee"], [-4, -8.2, 8, 0.8, f.akzent]);
    if (f.kleidung === "hoodie" && vorne) rumpfDetails.push([-2.6, -14.2, 5.2, 1.4, farbe(ob, 0.7)], [-1.4, -12.6, 0.6, 2.2, f.akzent], [0.8, -12.6, 0.6, 2.2, f.akzent], [-2.2, -10, 4.4, 1.6, farbe(ob, 0.85)]);
    if (f.kleidung === "hose" && vorne) rumpfDetails.push([-1.4, -14.2, 2.8, 1.2, f.akzent]);
    if (f.kleidung === "rock" && vorne) rumpfDetails.push([-0.8, -12.8, 1.6, 1.6, f.akzent]);
    if (roboter && vorne) rumpfDetails.push([-2.4, -12.6, 4.8, 3.4, "#5f7178"], [-1.6, -11.8, 1.2, 1.2, f.akzent], [0.4, -11.8, 1.2, 1.2, "#e8513a"]);
  }
  return {
    beinA: [...bein(-3, 2.4, 1), ...schuhA.teile],
    beinADetails: schuhA.details,
    beinB: [...bein(0.6, 2.4, 1), ...schuhB.teile],
    beinBDetails: schuhB.details,
    rumpf,
    rumpfDetails,
    armA: aermel(-6.2, ob),
    armB: aermel(4, ob),
  };
}

/** Kappe über den Haaren, Schirm nach vorn. Was über den Kopf hinausragt (Zopfbänder, Puffs), verschwindet darunter. */
function mitKappe(kopf: { teile: Block[]; details: Block[] }, f: FigurDaten, blick: Blick): { teile: Block[]; details: Block[] } {
  if (!f.kappe) return kopf;
  const unterKappe = ([, y, , h]: Block) => y + h > -26.3;
  const c = f.kappe;
  const schirm = farbe(c, 0.72);
  const kappe: Block[] =
    blick === "seite" ? [[-5.2, -28, 10.2, 3.6, c], [3.4, -25.2, 3.8, 1.3, schirm]] : blick === "hinten" ? [[-5.9, -28, 11.8, 3.8, c]] : [[-5.9, -28, 11.8, 3.6, c], [-6.6, -25, 13.2, 1.3, schirm]];
  const glanz: Block[] = blick === "hinten" ? [[-1.6, -25.4, 3.2, 0.8, schirm]] : [[-2.6, -27.4, 2.4, 0.8, farbe(c, 1.3)]];
  return { teile: [...kopf.teile.filter(unterKappe), ...kappe], details: [...kopf.details.filter(unterKappe), ...glanz] };
}

/** Eine Spielfigur im Pixel-Stil. Ursprung = Mitte zwischen den Füßen. */
export function Figur({ figur, blick = "vorne", laeuft = false }: { figur: FigurDaten; blick?: Blick; laeuft?: boolean }) {
  const k = koerper(figur, blick);
  const kopf = mitKappe(blick === "vorne" ? kopfVorne(figur) : blick === "hinten" ? kopfHinten(figur) : kopfSeite(figur), figur, blick);
  const hals: Block[] = figur.kleidung === "roboter" || figur.frisur === "kopftuch" ? [] : [[-1.1, -15.2, 2.2, 1.4, figur.haut]];

  return (
    <g className={`figur ${laeuft ? "figur-laeuft" : ""}`}>
      <ellipse cx="0" cy="1" rx="16" ry="4.5" fill="#254950" opacity="0.2" />
      <g className="figur-koerper">
        <Gruppe teile={k.beinA} details={k.beinADetails} className="figur-bein figur-bein-a" />
        <Gruppe teile={k.beinB} details={k.beinBDetails} className="figur-bein figur-bein-b" />
        {blick !== "seite" && <Gruppe teile={k.armA} className="figur-arm figur-arm-a" />}
        {blick !== "seite" && <Gruppe teile={k.armB} className="figur-arm figur-arm-b" />}
        <Gruppe teile={[...hals, ...k.rumpf]} details={k.rumpfDetails} />
        <Gruppe teile={kopf.teile} details={kopf.details} />
        {blick === "seite" && <Gruppe teile={k.armA} className="figur-arm figur-arm-a" />}
        {figur.brille && blick === "vorne" && (
          <g fill="none" stroke={AUGE} strokeWidth="1.4" shapeRendering="crispEdges">
            <rect x={-4 * U} y={-21.4 * U} width={3.1 * U} height={3.1 * U} rx="1.5" />
            <rect x={0.9 * U} y={-21.4 * U} width={3.1 * U} height={3.1 * U} rx="1.5" />
            <path d={`M${-0.9 * U} ${-20.2 * U}h${1.8 * U}`} />
          </g>
        )}
        {figur.brille && blick === "seite" && <rect x={1.3 * U} y={-21.4 * U} width={3 * U} height={3.1 * U} rx="1.5" fill="none" stroke={AUGE} strokeWidth="1.4" />}
      </g>
    </g>
  );
}

/** Kleines Portrait für Auswahl, Kopfleiste und Karten. */
export function FigurPortrait({ figur, className = "" }: { figur: FigurDaten; className?: string }) {
  return (
    <svg viewBox="-32 -104 64 110" className={className} aria-hidden="true" focusable="false">
      <Figur figur={figur} blick="vorne" />
    </svg>
  );
}
