/**
 * Kinder-Insel: Farben, Layout der gezeichneten Heilbronn-Karte (viewBox 0 0 1200 800)
 * und Position der Einrichtungen. Geografisch an Heilbronn angelehnt, künstlerisch vereinfacht.
 *
 * Neue Einrichtung in konfiguration/quellen.csv → erscheint automatisch mit einem
 * einfachen Haus auf dem nächsten freien Platz. Für ein eigenes Haus/Position: ORTE ergänzen.
 */
/** Was die Karte von einer Einrichtung braucht (passt zu Quelle und QuelleMeta) */
export type KartenQuelle = { id: string; name: string; farbe: string };

/**
 * Farben der Karte – ausschließlich Tokens aus DESIGN.md § Colors (gleiche Werte wie in globals.css).
 * SVG braucht feste Werte, darum stehen sie hier noch einmal.
 */
export const F = {
  gras: "#7BC86C", // land
  grasDunkel: "#4E9A4A", // land-dark
  fluss: "#5BB8C4", // sea
  welle: "#8FD3DB", // sea-shallow
  sand: "#E8C88A", // sand
  klippe: "#C49A5A", // cliff
  dach: "#E07A4F", // Dächer der Altstadt (DESIGN.md § Map)
  wand: "#F6F3EC", // paper – helle Hauswände
  weg: "#FFFFFF", // Wege: weiß gestrichelt
  baum: "#4E9A4A", // land-dark
  baumHell: "#7BC86C", // land
  lila: "#6C4CE0", // primary
  tuerkis: "#2BB3A3", // IPAI
  orange: "#F59E0B", // accent
  text: "#1F2937", // ink
  glas: "#3B4CCA", // experimenta
  glasHell: "#5B6BD6", // experimenta Facetten
  nacht: "#1E2A5A", // night
} as const;

export type Pt = [number, number];
export type Kurve = [Pt, Pt, Pt, Pt];
export type PinSymbol = "teleskop" | "chip" | "code" | "herz" | "stern" | "kalender";
export type Gebaeudeart = "experimenta" | "ipai" | "haus" | "platz";

export type KartenOrt = {
  id: string;
  name: string;
  farbe: string;
  symbol: PinSymbol;
  gebaeude: Gebaeudeart;
  x: number;
  y: number;
};

/**
 * Bekannte Orte (id wie in quellen.csv). Farben aus DESIGN.md § Institution colors.
 * Positionen folgen der echten Stadt: experimenta links am Neckar beim Hauptbahnhof,
 * Bildungscampus (aim) nördlich, Zukunftspark (IPAI) im Süden.
 */
const ORTE: Record<string, Omit<KartenOrt, "id">> = {
  aim: { name: "aim", farbe: "#6C4CE0", symbol: "code", gebaeude: "haus", x: 480, y: 215 },
  experimenta: { name: "experimenta", farbe: "#3B4CCA", symbol: "teleskop", gebaeude: "experimenta", x: 185, y: 572 },
  hdf: { name: "Haus der Familie", farbe: "#F28C6B", symbol: "herz", gebaeude: "haus", x: 1000, y: 470 },
  ipai: { name: "IPAI", farbe: "#2BB3A3", symbol: "chip", gebaeude: "ipai", x: 620, y: 610 },
};

/** COSMOS: der Platz für „alle Veranstaltungen“ – gehört zu keiner Quelle, steht immer auf der Karte */
const COSMOS: KartenOrt = { id: "cosmos", name: "COSMOS", farbe: "#F59E0B", symbol: "kalender", gebaeude: "platz", x: 850, y: 610 };

/** Freie Fläche „Neuer Ort?“ → Mitmach-Seite */
export const NEUER_ORT: Pt = [1060, 690];

/** Plätze für Einrichtungen, die neu in quellen.csv stehen */
const FREIE_PLAETZE: Pt[] = [[905, 330], [330, 130], [560, 470]];

export function kartenOrte(quellen: KartenQuelle[]): KartenOrt[] {
  let frei = 0;
  const orte = quellen.map((q) => {
    const bekannt = ORTE[q.id];
    if (bekannt) return { id: q.id, ...bekannt };
    const [x, y] = FREIE_PLAETZE[frei++ % FREIE_PLAETZE.length]!;
    return { id: q.id, name: q.name.split(/\s[–-]\s/)[0] ?? q.name, farbe: q.farbe, symbol: "stern" as const, gebaeude: "haus" as const, x, y };
  });
  return [...orte, COSMOS];
}

/** Wo die Figur am Anfang steht: vor dem Hauptbahnhof */
export const START: Pt = [285, 322];

// ---------- Kartenlayout ----------

export const INSEL =
  "M150 150 C230 60 480 55 650 62 C860 55 1080 80 1112 220 C1140 350 1125 520 1065 610 " +
  "C990 705 780 700 600 700 C410 705 210 700 125 610 C60 535 70 250 150 150 Z";

/** Neckar: S-Kurve von oben links nach unten links */
export const NECKAR: Kurve[] = [
  [[340, 30], [300, 160], [420, 250], [380, 360]],
  [[380, 360], [340, 470], [250, 520], [280, 640]],
  [[280, 640], [290, 690], [300, 730], [300, 790]],
];

export function punktAufKurve([p0, p1, p2, p3]: Kurve, t: number) {
  const u = 1 - t;
  const at = (i: 0 | 1) => u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i];
  const d = (i: 0 | 1) => 3 * u * u * (p1[i] - p0[i]) + 6 * u * t * (p2[i] - p1[i]) + 3 * t * t * (p3[i] - p2[i]);
  return { x: at(0), y: at(1), winkel: (Math.atan2(d(1), d(0)) * 180) / Math.PI };
}

export const BRUECKEN = ([[0, 0.5], [1, 0], [1, 0.55]] as const).map(([s, t]) => punktAufKurve(NECKAR[s]!, t));

export const WEGE: Kurve[] = [
  [[210, 300], [160, 380], [150, 480], [185, 575]],
  [[360, 204], [300, 210], [230, 240], [210, 300]],
  [[210, 300], [260, 330], [320, 360], [380, 360]],
  [[380, 360], [480, 360], [560, 410], [735, 410]],
  [[480, 222], [440, 222], [400, 204], [360, 204]],
  [[480, 222], [560, 260], [660, 330], [735, 410]],
  [[735, 410], [840, 410], [900, 480], [1000, 480]],
  [[735, 410], [720, 480], [640, 520], [620, 612]],
  [[620, 612], [700, 650], [780, 640], [850, 602]],
  [[185, 575], [220, 560], [260, 520], [297, 509]],
  [[297, 509], [400, 500], [520, 560], [620, 612]],
  [[542, 340], [560, 370], [600, 400], [640, 405]],
];

export const BAEUME: [number, number, number][] = [
  [150, 200, 16], [186, 172, 12], [128, 262, 13], [560, 150, 15], [620, 118, 12], [700, 140, 16],
  [770, 168, 12], [440, 310, 14], [690, 250, 13], [820, 250, 15], [500, 600, 14], [455, 640, 12],
  [345, 640, 13], [950, 650, 15], [1010, 610, 12], [1065, 560, 14], [1090, 430, 12], [900, 520, 11],
];

export const ALTSTADT_HAEUSER: Pt[] = [
  [680, 350], [705, 340], [810, 345], [835, 362], [665, 385], [852, 396], [670, 428], [848, 432],
  [690, 458], [720, 466], [760, 466], [800, 458], [826, 450], [650, 412], [785, 340],
];
export const KILIANSKIRCHE: Pt = [752, 376];
export const HAUPTBAHNHOF: Pt = [210, 296];
export const TEICH = { x: 470, y: 470, rx: 36, ry: 18 };
export const PARKS = [
  { x: 495, y: 300, w: 94, h: 56 },
  { x: 1010, y: 280, w: 76, h: 44 },
];
export const WEINBERG = "M850 262 C880 170 960 118 1012 128 C1062 138 1096 200 1102 262 Z";
export const AUSSICHTSTURM: Pt = [1007, 132];
