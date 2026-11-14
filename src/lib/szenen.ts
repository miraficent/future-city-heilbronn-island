import { STATIONEN, type Station } from "./spiel";

/*
 * Die vier Lernorte als begehbare Szenen. Alle Maße in Bildpunkten der gemalten Ansicht (1440 × 810):
 * Man steht auf dem Platz vor dem echten Gebäude und läuft nach links, rechts, vorn und hinten.
 */

export const SZENE_BREITE = 1440;
export const SZENE_HOEHE = 810;

export type Ellipse = { x: number; y: number; rx: number; ry: number };
export type SzenenFigur = { id: string; x: number; y: number };

export type Szene = {
  station: Station;
  bild: string;
  /** Eingang des Gebäudes: Hier geht es zu den Aufgaben. */
  tuer: { x: number; y: number };
  /** Begehbarer Platz (Fußpunkt der Figur). */
  boden: { links: number; rechts: number; hinten: number; vorne: number };
  /** Beete, Wasser und Bäume im Vordergrund – dort kann man nicht hin. */
  hindernisse: Ellipse[];
  start: { x: number; y: number };
  gastgeber: SzenenFigur;
  gast?: SzenenFigur;
  /** Ein Satz über den echten Ort, wenn man das Gebäude antippt. */
  fakt: string;
};

const station = (id: string) => STATIONEN.find((s) => s.id === id)!;
const BODEN = { links: 110, rechts: 1330, hinten: 625, vorne: 785 };

export const SZENEN: Szene[] = [
  {
    station: station("aim"),
    bild: "/medien/spiel/aim-szene.webp",
    tuer: { x: 545, y: 640 },
    boden: BODEN,
    hindernisse: [{ x: 110, y: 730, rx: 210, ry: 100 }],
    start: { x: 760, y: 740 },
    gastgeber: { id: "bit", x: 420, y: 700 },
    gast: { id: "emre", x: 1110, y: 690 },
    fakt: "Die aim sitzt auf dem Bildungscampus. Dort lernen Kinder, Studierende und Erwachsene.",
  },
  {
    station: station("experimenta"),
    bild: "/medien/spiel/experimenta-szene.webp",
    tuer: { x: 725, y: 640 },
    boden: BODEN,
    hindernisse: [{ x: 110, y: 760, rx: 250, ry: 130 }, { x: 1320, y: 810, rx: 320, ry: 170 }],
    start: { x: 560, y: 745 },
    gastgeber: { id: "amara", x: 420, y: 690 },
    gast: { id: "lina", x: 990, y: 690 },
    fakt: "Die experimenta ist ein Science Center auf einer Insel im Neckar. Drinnen darf man selbst experimentieren.",
  },
  {
    station: station("hdf"),
    bild: "/medien/spiel/hdf-szene.webp",
    tuer: { x: 568, y: 640 },
    boden: BODEN,
    hindernisse: [{ x: 80, y: 640, rx: 200, ry: 80 }, { x: 1380, y: 770, rx: 200, ry: 150 }],
    start: { x: 760, y: 745 },
    gastgeber: { id: "mia", x: 400, y: 700 },
    fakt: "Im Haus der Familie lernen Kinder, Eltern und Großeltern zusammen.",
  },
  {
    station: station("ipai"),
    bild: "/medien/spiel/ipai-szene.webp",
    tuer: { x: 637, y: 640 },
    boden: BODEN,
    hindernisse: [{ x: 90, y: 650, rx: 180, ry: 110 }],
    start: { x: 820, y: 745 },
    gastgeber: { id: "leo", x: 420, y: 700 },
    fakt: "IPAI SPACES steht im Zukunftspark. Hier geht es um Künstliche Intelligenz.",
  },
];

export const szeneVon = (id: string) => SZENEN.find((s) => s.station.id === id) ?? SZENEN[0]!;

/** Figurgröße nach Tiefe: vorne groß, hinten kleiner – so wirkt der Platz räumlich. */
export function figurHoehe(y: number, boden = BODEN) {
  const t = Math.max(0, Math.min(1, (y - boden.hinten) / (boden.vorne - boden.hinten)));
  return 238 + t * 82;
}

function inEllipse(p: { x: number; y: number }, e: Ellipse) {
  return ((p.x - e.x) / e.rx) ** 2 + ((p.y - e.y) / e.ry) ** 2 < 1;
}

/** Darf die Figur hier stehen? Platzgrenzen, Hindernisse und andere Figuren. */
export function frei(szene: Szene, p: { x: number; y: number }, figuren: SzenenFigur[] = []) {
  const b = szene.boden;
  if (p.x < b.links || p.x > b.rechts || p.y < b.hinten || p.y > b.vorne) return false;
  if (szene.hindernisse.some((e) => inEllipse(p, e))) return false;
  return !figuren.some((f) => Math.abs(p.x - f.x) < 62 && Math.abs(p.y - f.y) < 26);
}

/** Ein Schritt: erst direkt, dann seitlich gleiten – man bleibt nicht an Kanten hängen. */
export function schritt(szene: Szene, von: { x: number; y: number }, dx: number, dy: number, figuren: SzenenFigur[]) {
  for (const k of [{ x: von.x + dx, y: von.y + dy }, { x: von.x + dx, y: von.y }, { x: von.x, y: von.y + dy }]) {
    if ((k.x !== von.x || k.y !== von.y) && frei(szene, k, figuren)) return k;
  }
  return von;
}

export const SPRECH_ABSTAND = 190;
export const TUER_ABSTAND = 150;
