import { bewohnerFuer } from "./bewohner";
import { abstand, inRechteck, type Punkt, type Rechteck, type Station } from "./spiel";

/*
 * Die Stadt der Spielwelt. Sie wird aus der Liste der Lernhäuser erzeugt:
 * vier Häuser ergeben eine kompakte Stadt, mehr Häuser verlängern sie automatisch.
 *
 * Begehbar ist nur das Wegenetz (Gehwege, Hauswege, Platz, Zebrastreifen).
 * Wiese, Bäume, Teich, Häuser und die Fahrbahn sind tabu. Tastatur, Steuerkreuz
 * und Antippen nutzen dasselbe Netz – deshalb bleibt die Figur immer auf dem Weg.
 */

export type WegArt = "gehweg" | "hausweg" | "zebra" | "platz";
export type Knoten = Punkt & { id: string };
export type Kante = { von: string; nach: string; breite: number; art: WegArt };
export type Haus = { station: Station; mitteX: number; dachY: number; bodenY: number; tuer: Punkt; flaeche: Rechteck; reihe: "oben" | "unten" };
/** Heilbronner Wahrzeichen am Rand der Spielwelt. Antippen erzählt etwas über den echten Ort. */
export type Wahrzeichen = { id: "kilianskirche" | "rathaus" | "wartberg"; x: number; y: number; breite: number; hoehe: number; fakt: string };
export type Deko = { id: string; art: "baum" | "busch" | "blume" | "laterne" | "bank"; x: number; y: number; variante: number };

export type Stadt = {
  breite: number;
  hoehe: number;
  strasse: { oben: number; unten: number; spurNachWesten: number; spurNachOsten: number; tunnelBreite: number; wende: Punkt & { r: number } };
  gehwegNord: number;
  gehwegSued: number;
  vorplatzY: number;
  haeuser: Haus[];
  platz: Punkt & { r: number };
  teich: Punkt & { rx: number; ry: number };
  zebras: Rechteck[];
  knoten: Knoten[];
  kanten: Kante[];
  start: Punkt;
  deko: Deko[];
  autoBahn: Punkt[];
  wahrzeichen: Wahrzeichen[];
  /** Oberkante des Neckars am unteren Rand. */
  neckarY: number;
};

const SPALTE = 470;
const X0 = 300;
const HAUS_BREITE = 400;
const HAUS_HOEHE = 240;
const WEG_BREITE = 56;
const GEHWEG_BREITE = 60;
const ZEBRA_BREITE = 76;
export const TEMPO_FIGUR = 230;
export const TEMPO_AUTO = 140;
/** Radius der Kreisbahn im Wendehammer – groß genug, dass Autos um die Mittelinsel fahren. */
export const KEHRE_RADIUS = 66;
export const INSEL_RADIUS = 30;

const Y = {
  dachOben: 225,
  tuerOben: 470,
  gehwegNord: 565,
  strasseOben: 605,
  spurWest: 638,
  spurOst: 692,
  strasseUnten: 725,
  gehwegSued: 765,
  dachUnten: 840,
  tuerUnten: 1080,
  vorplatz: 1135,
  hoehe: 1270,
};

/** Spalten der oberen Reihe: Häuser links und rechts, der Raketenplatz in der Mitte. */
function spalten(anzahl: number) {
  const oben = Math.ceil(anzahl / 2);
  const unten = anzahl - oben;
  const plaetze = Math.max(oben, unten) + 1;
  const mitte = Math.floor(plaetze / 2);
  const x = (i: number) => X0 + i * SPALTE;
  return { plaetze, mitte, x, oben, unten };
}

export function erzeugeStadt(stationen: Station[]): Stadt {
  const { plaetze, mitte, x } = spalten(stationen.length);
  const letzteSpalte = x(plaetze - 1);
  const wende = { x: letzteSpalte + 330, y: (Y.strasseOben + Y.strasseUnten) / 2, r: 100 };
  const breite = wende.x + 230;

  const knoten = new Map<string, Knoten>();
  const kanten: Kante[] = [];
  const k = (id: string, px: number, py: number) => {
    if (!knoten.has(id)) knoten.set(id, { id, x: px, y: py });
    return id;
  };
  const verbinde = (a: string, b: string, art: WegArt, b2 = WEG_BREITE) => kanten.push({ von: a, nach: b, art, breite: b2 });

  // Häuser verteilen: obere Reihe ohne die Mittelspalte, untere Reihe ebenso (dort liegt der Teich).
  const spaltenOhneMitte = Array.from({ length: plaetze }, (_, i) => i).filter((i) => i !== mitte);
  const anzahlOben = Math.ceil(stationen.length / 2);
  const haeuser: Haus[] = stationen.map((station, i) => {
    const oben = i < anzahlOben;
    const spalte = spaltenOhneMitte[oben ? i : i - anzahlOben] ?? 0;
    const mitteX = x(spalte);
    const dachY = oben ? Y.dachOben : Y.dachUnten;
    const bodenY = dachY + HAUS_HOEHE;
    const tuer = { x: mitteX, y: oben ? Y.tuerOben : Y.tuerUnten };
    return {
      station,
      mitteX,
      dachY,
      bodenY,
      tuer,
      flaeche: { x: mitteX - HAUS_BREITE / 2, y: dachY, breite: HAUS_BREITE, hoehe: HAUS_HOEHE },
      reihe: oben ? "oben" : "unten",
    };
  });

  // Querungen liegen zwischen den Spalten; dort führen auch die Wege zum Vorplatz der unteren Reihe.
  const querX = Array.from({ length: plaetze - 1 }, (_, i) => (x(i) + x(i + 1)) / 2);
  const platz = { x: x(mitte), y: 345, r: 118 };
  const teich = { x: x(mitte), y: 960, rx: 150, ry: 92 };

  // Gehweg Nord: Abzweige zu den oberen Türen, zum Platz und zu den Zebrastreifen.
  const gehwegEnde = wende.x - wende.r - 40;
  const nordX = [90, gehwegEnde, platz.x, ...querX, ...haeuser.filter((h) => h.reihe === "oben").map((h) => h.mitteX)];
  const suedX = [90, gehwegEnde, ...querX];
  const kette = (prefix: string, xs: number[], py: number, art: WegArt, b: number) => {
    const sortiert = [...new Set(xs.map((v) => Math.round(v)))].sort((a, z) => a - z);
    sortiert.forEach((px, i) => {
      k(`${prefix}-${px}`, px, py);
      if (i > 0) verbinde(`${prefix}-${sortiert[i - 1]}`, `${prefix}-${px}`, art, b);
    });
  };
  kette("nord", nordX, Y.gehwegNord, "gehweg", GEHWEG_BREITE);
  kette("sued", suedX, Y.gehwegSued, "gehweg", GEHWEG_BREITE);

  const vorX = [...querX, ...haeuser.filter((h) => h.reihe === "unten").map((h) => h.mitteX)];
  const vorMin = Math.min(...vorX) - 60;
  const vorMax = Math.max(...vorX) + 60;
  kette("vor", [vorMin, vorMax, ...vorX], Y.vorplatz, "gehweg", WEG_BREITE);

  for (const qx of querX) {
    const r = Math.round(qx);
    verbinde(`nord-${r}`, `sued-${r}`, "zebra", ZEBRA_BREITE);
    verbinde(`sued-${r}`, `vor-${r}`, "hausweg");
  }
  for (const h of haeuser) {
    const id = k(`tuer-${h.station.id}`, h.tuer.x, h.tuer.y);
    verbinde(id, `${h.reihe === "oben" ? "nord" : "vor"}-${Math.round(h.mitteX)}`, "hausweg");
  }
  // Der runde Platz ist ein breites Wegstück; sein Ausgang endet über dem Gehweg, damit niemand auf die Straße gerät.
  k("platz", platz.x, platz.y - 45);
  k("platz-ausgang", platz.x, platz.y + 55);
  verbinde("platz", "platz-ausgang", "platz", platz.r * 2 - 30);
  verbinde("platz-ausgang", `nord-${Math.round(platz.x)}`, "hausweg");

  const zebras = querX.map((qx) => ({ x: qx - ZEBRA_BREITE / 2, y: Y.strasseOben, breite: ZEBRA_BREITE, hoehe: Y.strasseUnten - Y.strasseOben }));

  // Autos: aus dem Tunnel nach Osten, in einer weichen S-Kurve hinein in den Wendehammer,
  // im Halbkreis rechts um die Mittelinsel (gegen den Uhrzeigersinn, wie bei Rechtsverkehr)
  // und genauso weich zurück auf die Spur nach Westen in den Tunnel.
  const unten = { x: wende.x, y: wende.y + KEHRE_RADIUS };
  const oben = { x: wende.x, y: wende.y - KEHRE_RADIUS };
  const kurveAb = wende.x - 150;
  const autoBahn: Punkt[] = [{ x: -160, y: Y.spurOst }];
  autoBahn.push(...bezier({ x: kurveAb, y: Y.spurOst }, { x: kurveAb + 75, y: Y.spurOst }, { x: unten.x - 75, y: unten.y }, unten, 18));
  const SCHRITTE = 32;
  for (let i = 1; i < SCHRITTE; i++) {
    const w = Math.PI / 2 - (i / SCHRITTE) * Math.PI;
    autoBahn.push({ x: wende.x + Math.cos(w) * KEHRE_RADIUS, y: wende.y + Math.sin(w) * KEHRE_RADIUS });
  }
  autoBahn.push(...bezier(oben, { x: oben.x - 75, y: oben.y }, { x: kurveAb + 75, y: Y.spurWest }, { x: kurveAb, y: Y.spurWest }, 18));
  autoBahn.push({ x: -160, y: Y.spurWest });

  const stadt: Stadt = {
    breite,
    hoehe: Y.hoehe,
    strasse: { oben: Y.strasseOben, unten: Y.strasseUnten, spurNachWesten: Y.spurWest, spurNachOsten: Y.spurOst, tunnelBreite: 70, wende },
    gehwegNord: Y.gehwegNord,
    gehwegSued: Y.gehwegSued,
    vorplatzY: Y.vorplatz,
    haeuser,
    platz,
    teich,
    zebras,
    knoten: [...knoten.values()],
    kanten,
    // Start direkt vor der Rakete: das Ziel ist sofort zu sehen.
    start: { x: platz.x, y: platz.y + 85 },
    deko: [],
    autoBahn,
    // Hinten am Horizont: Kilianskirche und Rathaus mit Kunstuhr, rechts die Weinberge am Wartberg.
    wahrzeichen: [
      { id: "kilianskirche", x: Math.round((x(0) + platz.x) / 2) - 10, y: 255, breite: 120, hoehe: 250, fakt: "Das ist die Kilianskirche. Ihr hoher Turm ist ein Wahrzeichen von Heilbronn." },
      { id: "rathaus", x: Math.round((platz.x + x(2)) / 2) + 10, y: 255, breite: 200, hoehe: 165, fakt: "Das Rathaus am Marktplatz hat eine Kunstuhr von 1580. Sie zeigt Uhrzeit, Wochentag und Mond." },
      { id: "wartberg", x: x(2) + 400, y: 250, breite: 420, hoehe: 185, fakt: "Rund um Heilbronn wachsen Weinberge. Oben auf dem Wartberg steht ein Aussichtsturm." },
    ],
    neckarY: Y.hoehe - 95,
  };
  stadt.deko = verteileDeko(stadt);
  return stadt;
}

/* ---------- Geometrie ---------- */

/** Punkte auf einer kubischen Bézierkurve (inklusive Anfang und Ende). */
function bezier(a: Punkt, b: Punkt, c: Punkt, d: Punkt, schritte: number): Punkt[] {
  return Array.from({ length: schritte + 1 }, (_, i) => {
    const t = i / schritte;
    const u = 1 - t;
    return {
      x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x,
      y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y,
    };
  });
}

function knotenNach(stadt: Stadt) {
  return new Map(stadt.knoten.map((n) => [n.id, n]));
}

function naechsterPunktAufStrecke(p: Punkt, a: Punkt, b: Punkt): { punkt: Punkt; t: number } {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const laenge2 = dx * dx + dy * dy;
  const t = laenge2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / laenge2));
  return { punkt: { x: a.x + t * dx, y: a.y + t * dy }, t };
}

/** Ist dieser Punkt Teil des Wegenetzes? */
export function istBegehbar(stadt: Stadt, p: Punkt): boolean {
  const n = knotenNach(stadt);
  return stadt.kanten.some((kante) => {
    const a = n.get(kante.von);
    const b = n.get(kante.nach);
    if (!a || !b) return false;
    return abstand(p, naechsterPunktAufStrecke(p, a, b).punkt) <= kante.breite / 2;
  });
}

export type Projektion = { kante: number; punkt: Punkt; t: number; distanz: number };

/** Nächster Punkt auf dem Wegenetz – damit wird ein Tipp auf die Wiese zum Ziel am Wegrand. */
export function aufsWegenetz(stadt: Stadt, p: Punkt): Projektion {
  const n = knotenNach(stadt);
  let beste: Projektion = { kante: 0, punkt: stadt.start, t: 0, distanz: Infinity };
  stadt.kanten.forEach((kante, i) => {
    const a = n.get(kante.von);
    const b = n.get(kante.nach);
    if (!a || !b) return;
    const { punkt, t } = naechsterPunktAufStrecke(p, a, b);
    const distanz = abstand(p, punkt);
    if (distanz < beste.distanz) beste = { kante: i, punkt, t, distanz };
  });
  return beste;
}

/** Bewegung mit Tastatur oder Steuerkreuz. Gleitet an Wegrändern entlang statt hängen zu bleiben. */
export function bewege(stadt: Stadt, pos: Punkt, richtung: Punkt, sekunden: number): Punkt {
  const laenge = Math.hypot(richtung.x, richtung.y);
  if (!laenge || !Number.isFinite(sekunden) || sekunden <= 0) return pos;
  const schritt = TEMPO_FIGUR * Math.min(sekunden, 0.05);
  const dx = (richtung.x / laenge) * schritt;
  const dy = (richtung.y / laenge) * schritt;
  const kandidaten = [
    { x: pos.x + dx, y: pos.y + dy },
    { x: pos.x + dx, y: pos.y },
    { x: pos.x, y: pos.y + dy },
  ];
  for (const k of kandidaten) if ((k.x !== pos.x || k.y !== pos.y) && istBegehbar(stadt, k)) return k;

  // Ecken-Hilfe: läuft man knapp an einer Abzweigung vorbei, zieht der Weg die Figur sanft zur Mitte.
  const ziel = { x: pos.x + dx * 6, y: pos.y + dy * 6 };
  const proj = aufsWegenetz(stadt, ziel);
  if (proj.distanz < WEG_BREITE) {
    const zurMitte = { x: proj.punkt.x - pos.x, y: proj.punkt.y - pos.y };
    const l = Math.hypot(zurMitte.x, zurMitte.y);
    if (l > 0.5) {
      const p = { x: pos.x + (zurMitte.x / l) * schritt, y: pos.y + (zurMitte.y / l) * schritt };
      if (istBegehbar(stadt, p)) return p;
    }
  }
  return pos;
}

/** Kürzester Weg über das Wegenetz (Dijkstra). Liefert Zwischenpunkte bis zum Ziel. */
export function planeRoute(stadt: Stadt, von: Punkt, nach: Punkt): Punkt[] {
  const n = knotenNach(stadt);
  const start = aufsWegenetz(stadt, von);
  const ziel = aufsWegenetz(stadt, nach);
  const sk = stadt.kanten[start.kante];
  const zk = stadt.kanten[ziel.kante];
  if (!sk || !zk) return [];
  if (start.kante === ziel.kante) return [ziel.punkt];

  const nachbarn = new Map<string, Array<{ id: string; kosten: number }>>();
  const add = (a: string, b: string, kosten: number) => {
    nachbarn.set(a, [...(nachbarn.get(a) ?? []), { id: b, kosten }]);
    nachbarn.set(b, [...(nachbarn.get(b) ?? []), { id: a, kosten }]);
  };
  for (const kante of stadt.kanten) {
    const a = n.get(kante.von);
    const b = n.get(kante.nach);
    if (a && b) add(kante.von, kante.nach, abstand(a, b));
  }
  const pos = new Map<string, Punkt>([...n].map(([id, p]) => [id, p]));
  pos.set("@start", start.punkt);
  pos.set("@ziel", ziel.punkt);
  for (const [virtuell, proj, kante] of [["@start", start, sk], ["@ziel", ziel, zk]] as const) {
    for (const ende of [kante.von, kante.nach]) {
      const p = n.get(ende);
      if (p) add(virtuell, ende, abstand(proj.punkt, p));
    }
  }

  const dist = new Map<string, number>([["@start", 0]]);
  const vor = new Map<string, string>();
  const offen = new Set<string>(["@start"]);
  while (offen.size) {
    let aktuell = "";
    let min = Infinity;
    for (const id of offen) {
      const d = dist.get(id) ?? Infinity;
      if (d < min) {
        min = d;
        aktuell = id;
      }
    }
    offen.delete(aktuell);
    if (aktuell === "@ziel") break;
    for (const { id, kosten } of nachbarn.get(aktuell) ?? []) {
      const neu = min + kosten;
      if (neu < (dist.get(id) ?? Infinity)) {
        dist.set(id, neu);
        vor.set(id, aktuell);
        offen.add(id);
      }
    }
  }
  if (!vor.has("@ziel")) return [];
  const weg: Punkt[] = [];
  for (let id: string | undefined = "@ziel"; id && id !== "@start"; id = vor.get(id)) {
    const p = pos.get(id);
    if (p) weg.unshift(p);
  }
  return weg;
}

/** Haus samt Schild über dem Dach – beides lässt sich antippen. */
export function hausAn(stadt: Stadt, p: Punkt): Haus | undefined {
  const SCHILD = 90;
  return stadt.haeuser.find((h) => inRechteck(p, { ...h.flaeche, y: h.flaeche.y - SCHILD, hoehe: h.flaeche.hoehe + SCHILD }));
}

export function wahrzeichenAn(stadt: Stadt, p: Punkt): Wahrzeichen | undefined {
  return stadt.wahrzeichen.find((w) => Math.abs(p.x - w.x) < w.breite / 2 && p.y > w.y - w.hoehe && p.y < w.y);
}

export function nahesHaus(stadt: Stadt, p: Punkt, radius = 46): Haus | undefined {
  return stadt.haeuser.find((h) => abstand(p, h.tuer) <= radius);
}

export function amPlatz(stadt: Stadt, p: Punkt): boolean {
  return abstand(p, stadt.platz) <= stadt.platz.r * 0.75;
}

export function zebraBei(stadt: Stadt, p: Punkt): number {
  return stadt.zebras.findIndex((z) => p.x >= z.x - 6 && p.x <= z.x + z.breite + 6 && p.y >= z.y - 26 && p.y <= z.y + z.hoehe + 26);
}

/* ---------- Autos ---------- */

export type Auto = { id: number; s: number; farbe: string; wartet: boolean; art?: "auto" | "bus" };

function bahnLaenge(bahn: Punkt[]) {
  let summe = 0;
  for (let i = 1; i < bahn.length; i++) summe += abstand(bahn[i - 1]!, bahn[i]!);
  return summe;
}

function punktAufBahn(bahn: Punkt[], s: number): Punkt {
  let rest = Math.max(0, s);
  for (let i = 1; i < bahn.length; i++) {
    const a = bahn[i - 1]!;
    const b = bahn[i]!;
    const l = abstand(a, b);
    if (rest <= l) {
      const t = l ? rest / l : 0;
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    rest -= l;
  }
  return bahn.at(-1) ?? bahn[0]!;
}

/** Fahrtrichtung aus einem Blick nach vorn und zurück – so lenkt das Auto weich statt eckig. */
const LENK_BLICK = 16;

export function aufBahn(bahn: Punkt[], s: number): { punkt: Punkt; winkel: number } {
  const laenge = bahnLaenge(bahn);
  const punkt = punktAufBahn(bahn, s);
  const vor = punktAufBahn(bahn, Math.min(laenge, s + LENK_BLICK));
  const zurueck = punktAufBahn(bahn, Math.max(0, s - LENK_BLICK));
  return { punkt, winkel: Math.atan2(vor.y - zurueck.y, vor.x - zurueck.x) };
}

export function neueAutos(stadt: Stadt): Auto[] {
  const laenge = bahnLaenge(stadt.autoBahn);
  const fahrzeuge: Array<Pick<Auto, "farbe" | "art">> = [
    { farbe: "#e8513a", art: "auto" },
    { farbe: "#f2c94c", art: "bus" },
    { farbe: "#2f7fb8", art: "auto" },
    { farbe: "#5dbb63", art: "auto" },
  ];
  return fahrzeuge.map((f, i) => ({ id: i, s: (laenge / fahrzeuge.length) * i, wartet: false, ...f }));
}

const HALTEABSTAND = 120;
const AUTO_ABSTAND = 150;

/**
 * Autos fahren im Kreis durch Tunnel und Wendehammer. Steht die Figur auf einem
 * Zebrastreifen, halten alle Autos davor an – wie im echten Straßenverkehr.
 */
export function bewegeAutos(stadt: Stadt, autos: Auto[], sekunden: number, spieler: Punkt): Auto[] {
  const laenge = bahnLaenge(stadt.autoBahn);
  const besetzt = stadt.zebras.filter((_, i) => zebraBei(stadt, spieler) === i);
  const dt = Math.min(Math.max(sekunden, 0), 0.05);
  return autos.map((auto) => {
    const { punkt, winkel } = aufBahn(stadt.autoBahn, auto.s);
    const vorne = { x: punkt.x + Math.cos(winkel) * HALTEABSTAND, y: punkt.y + Math.sin(winkel) * HALTEABSTAND };
    const haltZebra = besetzt.some((z) => {
      const vorZebra = vorne.x >= z.x - 10 && vorne.x <= z.x + z.breite + 10;
      const nochDavor = Math.cos(winkel) > 0 ? punkt.x < z.x : punkt.x > z.x + z.breite;
      return vorZebra && nochDavor && Math.abs(Math.sin(winkel)) < 0.5;
    });
    const vordermann = autos.some((anderes) => {
      if (anderes.id === auto.id) return false;
      const d = (anderes.s - auto.s + laenge) % laenge;
      return d > 0 && d < AUTO_ABSTAND;
    });
    const wartet = haltZebra || vordermann;
    return { ...auto, wartet, s: wartet ? auto.s : (auto.s + TEMPO_AUTO * dt) % laenge };
  });
}

/* ---------- Dekoration: nur auf der Wiese, nie auf Wegen, Straße oder Häusern ---------- */

function frei(stadt: Stadt, p: Punkt, rand: number): boolean {
  if (p.x < 30 || p.y < 40 || p.x > stadt.breite - 30 || p.y > stadt.neckarY - 20) return false;
  if (stadt.wahrzeichen.some((w) => Math.abs(p.x - w.x) < w.breite / 2 + rand && p.y > w.y - w.hoehe - rand && p.y < w.y + rand)) return false;
  if (p.y > stadt.strasse.oben - rand && p.y < stadt.strasse.unten + rand && p.x < stadt.strasse.wende.x + stadt.strasse.wende.r + rand) return false;
  if (abstand(p, stadt.strasse.wende) < stadt.strasse.wende.r + rand + 20) return false;
  if (stadt.haeuser.some((h) => p.x > h.flaeche.x - rand && p.x < h.flaeche.x + h.flaeche.breite + rand && p.y > h.flaeche.y - rand && p.y < h.bodenY + rand)) return false;
  if (abstand(p, stadt.platz) < stadt.platz.r + rand + 10) return false;
  if (((p.x - stadt.teich.x) / (stadt.teich.rx + rand)) ** 2 + ((p.y - stadt.teich.y) / (stadt.teich.ry + rand)) ** 2 < 1) return false;
  const proj = aufsWegenetz(stadt, p);
  const kante = stadt.kanten[proj.kante];
  return proj.distanz > (kante?.breite ?? WEG_BREITE) / 2 + rand;
}

function verteileDeko(stadt: Stadt): Deko[] {
  const bewohnerOrte = bewohnerFuer(stadt).map((b) => b.ort);
  const beiBewohner = (p: Punkt, r: number) => bewohnerOrte.some((b) => abstand(b, p) < r);
  let samen = 11;
  const zufall = () => {
    samen = (samen * 16807) % 2147483647;
    return (samen - 1) / 2147483646;
  };
  const deko: Deko[] = [];
  const plaziere = (art: Deko["art"], anzahl: number, rand: number, versuche = 400) => {
    for (let i = 0, gesetzt = 0; i < versuche && gesetzt < anzahl; i++) {
      const p = { x: zufall() * stadt.breite, y: zufall() * stadt.hoehe };
      if (!frei(stadt, p, rand) || beiBewohner(p, art === "baum" ? 110 : 60)) continue;
      // Bäume brauchen Platz für ihre Krone: untereinander viel Abstand, zu Büschen und Blumen etwas weniger.
      const mindest = (d: Deko) => (art === "baum" && d.art === "baum" ? 190 : art === "baum" || d.art === "baum" ? 85 : 55);
      if (deko.some((d) => abstand(d, p) < mindest(d))) continue;
      deko.push({ id: `${art}-${gesetzt}`, art, x: Math.round(p.x), y: Math.round(p.y), variante: Math.floor(zufall() * 3) });
      gesetzt++;
    }
  };
  plaziere("baum", Math.round(stadt.breite / 160), 44, 900);
  plaziere("busch", Math.round(stadt.breite / 120), 22);
  plaziere("blume", Math.round(stadt.breite / 60), 10);
  // Laternen stehen am Rand der Gehwege, Bänke am Platz.
  for (let px = 200; px < stadt.strasse.wende.x - 180; px += 360) {
    if (!beiBewohner({ x: px, y: stadt.gehwegNord - 40 }, 50)) deko.push({ id: `laterne-n-${px}`, art: "laterne", x: px, y: stadt.gehwegNord - 40, variante: 0 });
  }
  deko.push({ id: "bank-platz-l", art: "bank", x: stadt.platz.x - stadt.platz.r - 30, y: stadt.platz.y + 30, variante: 0 });
  deko.push({ id: "bank-platz-r", art: "bank", x: stadt.platz.x + stadt.platz.r + 30, y: stadt.platz.y + 30, variante: 1 });
  return deko;
}
