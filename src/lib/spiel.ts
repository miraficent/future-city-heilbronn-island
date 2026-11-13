import type { Angebot } from "./angebot";
import { filtere, LEERER_FILTER } from "./filter";
import { fuerModus } from "./entdecken";

export type Punkt = { x: number; y: number };
export type Rechteck = Punkt & { breite: number; hoehe: number };
export type Richtung = "hoch" | "rechts" | "runter" | "links";
export type MissionArt = "code" | "muster" | "level" | "strom";
export type Station = { id: string; name: string; titel: string; kurz: string; farbe: string; thema: string; aufgabe: MissionArt; grafik: "code-labor" | "forscherhaus" | "spielewerkstatt" | "ki-atelier"; ort: Punkt; eingang: Punkt };

export const WELT = { breite: 2400, hoehe: 1700 };
export const START: Punkt = { x: 800, y: 650 };
export const STATIONEN: Station[] = [
  { id: "aim", name: "aim", titel: "Der Roboter-Express", kurz: "Code-Labor", farbe: "#ed805c", thema: "coding", aufgabe: "code", grafik: "code-labor", ort: { x: 300, y: 480 }, eingang: { x: 400, y: 650 } },
  { id: "experimenta", name: "experimenta", titel: "Licht für die Stadt", kurz: "Forscherhaus", farbe: "#63bdb5", thema: "coding", aufgabe: "strom", grafik: "forscherhaus", ort: { x: 1700, y: 480 }, eingang: { x: 1800, y: 650 } },
  { id: "hdf", name: "Haus der Familie", titel: "Ein Weg für alle", kurz: "Spielewerkstatt", farbe: "#ecc06b", thema: "gaming", aufgabe: "level", grafik: "spielewerkstatt", ort: { x: 300, y: 1200 }, eingang: { x: 400, y: 1370 } },
  { id: "ipai", name: "IPAI", titel: "Die Muster-Detektive", kurz: "KI-Atelier", farbe: "#aaa0db", thema: "ki", aufgabe: "muster", grafik: "ki-atelier", ort: { x: 1700, y: 1200 }, eingang: { x: 1800, y: 1370 } },
];
export const HAUS_FLAECHE: Rechteck = { x: -12, y: -48, breite: 224, hoehe: 190 };
export const STRASSEN: Rechteck[] = [{x:0,y:880,breite:2400,hoehe:140},{x:1120,y:0,breite:140,hoehe:1700}];
export const UEBERGAENGE: Rechteck[] = [{x:350,y:880,breite:100,hoehe:140},{x:1750,y:880,breite:100,hoehe:140},{x:1120,y:600,breite:140,hoehe:100},{x:1120,y:1320,breite:140,hoehe:100}];
export type Requisite = {id:string;art:"baum"|"bank"|"auto";x:number;y:number;breite:number;hoehe:number;flaeche:Rechteck};
const baeume = [[110,160],[320,190],[600,140],[1500,160],[1810,200],[2160,180],[130,450],[700,440],[1020,450],[1420,420],[2130,480],[120,780],[650,780],[980,780],[1460,780],[2130,780],[120,1170],[650,1160],[1010,1180],[1470,1170],[2150,1180],[140,1530],[420,1560],[700,1540],[980,1580],[1460,1570],[1780,1550],[2150,1530]];
export const REQUISITEN: Requisite[] = [
  ...baeume.map(([x,y],i)=>({id:`baum-${i}`,art:"baum" as const,x:x!,y:y!,breite:100+(i%3)*12,hoehe:126+(i%3)*12,flaeche:{x:x!-12,y:y!-18,breite:24,hoehe:22}})),
  ...[[600,565],[1550,565],[770,1450],[1990,1400]].map(([x,y],i)=>({id:`bank-${i}`,art:"bank" as const,x:x!,y:y!,breite:100,hoehe:58,flaeche:{x:x!-50,y:y!-24,breite:100,hoehe:28}})),
  ...[[800,930],[1510,978],[1186,360],[1186,1530]].map(([x,y],i)=>({id:`auto-${i}`,art:"auto" as const,x:x!,y:y!,breite:90,hoehe:46,flaeche:{x:x!-45,y:y!-34,breite:90,hoehe:40}})),
];
export const TEICH: Rechteck = {x:790,y:190,breite:240,hoehe:170};
export const HINDERNISSE: Rechteck[] = [...STATIONEN.map((s) => ({ ...HAUS_FLAECHE, x: s.ort.x + HAUS_FLAECHE.x, y: s.ort.y + HAUS_FLAECHE.y })), TEICH, ...REQUISITEN.map(p=>p.flaeche),{x:775,y:1188,breite:50,hoehe:34}];
export const inRechteck=(p:Punkt,r:Rechteck)=>p.x>=r.x&&p.x<=r.x+r.breite&&p.y>=r.y&&p.y<=r.y+r.hoehe;
export function istBegehbar(p:Punkt,hindernisse=HINDERNISSE) {
  return p.x>=32&&p.x<=WELT.breite-32&&p.y>=55&&p.y<=WELT.hoehe-28
    && !hindernisse.some(h=>p.x>h.x-16&&p.x<h.x+h.breite+16&&p.y>h.y-10&&p.y<h.y+h.hoehe+10)
    && (!STRASSEN.some(r=>inRechteck(p,r))||UEBERGAENGE.some(r=>inRechteck(p,r)));
}

export function abstand(a: Punkt, b: Punkt) { return Math.hypot(a.x - b.x, a.y - b.y); }
export function naheStation(pos: Punkt): Station | undefined {
  return STATIONEN.find((s) => abstand(pos, s.eingang) <= 78);
}

export function bewege(pos: Punkt, richtung: Punkt, sekunden: number, hindernisse = HINDERNISSE): Punkt {
  const laenge = Math.hypot(richtung.x, richtung.y);
  if (!laenge || !Number.isFinite(sekunden) || sekunden <= 0) return pos;
  const schritt = 205 * Math.min(sekunden, 0.05);
  const dx = richtung.x / laenge * schritt;
  const dy = richtung.y / laenge * schritt;
  const erlaubt = (p: Punkt) => istBegehbar(p,hindernisse);
  const waagerecht = { x: pos.x + dx, y: pos.y };
  const x = erlaubt(waagerecht) ? waagerecht.x : pos.x;
  const senkrecht = { x, y: pos.y + dy };
  return erlaubt(senkrecht) ? senkrecht : { x, y: pos.y };
}

/** Dasselbe Hindernismodell für Tastatur und Wegsuche. */
const WEGPUNKTE: Punkt[]=[];
for(let y=75;y<WELT.hoehe-28;y+=25)for(let x=50;x<WELT.breite-32;x+=25)if(istBegehbar({x,y}))WEGPUNKTE.push({x,y});
export function planeWeg(start: Punkt, ziel: Punkt): Punkt[] {
  const raster = 25;
  const punkte = WEGPUNKTE;
  const key = (p: Punkt) => `${p.x},${p.y}`;
  const nachKey = new Map(punkte.map((p) => [key(p), p]));
  const naechster = (p: Punkt) => punkte.reduce((a, b) => abstand(a, p) < abstand(b, p) ? a : b);
  const anfang = naechster(start);
  const ende = naechster(ziel);
  const warteschlange = [anfang];
  const vorlauf = new Map<string, Punkt | null>([[key(anfang), null]]);
  for (let i = 0; i < warteschlange.length; i++) {
    const p = warteschlange[i]!;
    if (key(p) === key(ende)) break;
    for (const d of Object.values(BEFEHLE)) {
      const n = nachKey.get(key({ x: p.x + d.x * raster, y: p.y + d.y * raster }));
      // Zwischenpunkte verhindern, dass ein schmales Hindernis übersprungen wird.
      if (n && istBegehbar({x:(p.x+n.x)/2,y:(p.y+n.y)/2}) && !vorlauf.has(key(n))) { vorlauf.set(key(n), p); warteschlange.push(n); }
    }
  }
  if (!vorlauf.has(key(ende))) return [];
  const weg: Punkt[] = [];
  let p: Punkt | null = ende;
  while (p) { weg.unshift(p); p = vorlauf.get(key(p)) ?? null; }
  return weg;
}

const BEFEHLE: Record<Richtung, Punkt> = { hoch: { x: 0, y: -1 }, rechts: { x: 1, y: 0 }, runter: { x: 0, y: 1 }, links: { x: -1, y: 0 } };
export const CODE_START = { x: 0, y: 3 };
export const CODE_ZIEL = { x: 4, y: 0 };
export const CODE_MAUERN = [{ x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 3, y: 0 }];
export function pruefeProgramm(befehle: Richtung[]) {
  let punkt = CODE_START;
  const weg = [punkt];
  for (const befehl of befehle) {
    const d = BEFEHLE[befehl];
    if (!d) return { ok: false, weg, grund: "Unbekannter Befehl." };
    const neu = { x: punkt.x + d.x, y: punkt.y + d.y };
    if (neu.x < 0 || neu.x > 4 || neu.y < 0 || neu.y > 3 || CODE_MAUERN.some((m) => m.x === neu.x && m.y === neu.y)) {
      return { ok: false, weg, grund: "Hier steht eine Mauer. Ändere deinen Weg und probiere es noch einmal." };
    }
    punkt = neu;
    weg.push(punkt);
  }
  return { ok: punkt.x === CODE_ZIEL.x && punkt.y === CODE_ZIEL.y, weg, grund: "Der Weg endet noch vor dem Ziel. Ergänze weitere Befehle." };
}

export function passendeSpielAngebote(angebote: Angebot[], thema: string, alter: number | undefined, jetzt: Date): Angebot[] {
  return filtere(fuerModus(angebote, (alter??8)>=12?"teen":"kind"), { ...LEERER_FILTER, themen: [thema], alter }, jetzt);
}

export function gueltigeErfolge(roh: unknown): string[] {
  return Array.isArray(roh) ? [...new Set(roh.filter((id): id is string => typeof id === "string" && STATIONEN.some((s) => s.id === id)))] : [];
}
