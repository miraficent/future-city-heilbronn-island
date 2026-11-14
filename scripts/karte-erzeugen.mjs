// Erzeugt src/lib/heilbronn-karte.json – die komplette Stadt Heilbronn aus OpenStreetMap-Daten
// (© OpenStreetMap-Mitwirkende, ODbL). Aufruf:
//   node scripts/karte-erzeugen.mjs                → lädt die Daten über die Overpass-API
//   node scripts/karte-erzeugen.mjs antwort.json   → nutzt eine gespeicherte Overpass-Antwort
// Die Website lädt danach nur die fertige Datei. Besucher:innen senden keine Daten an OpenStreetMap.
import { readFile, writeFile } from "node:fs/promises";

const ABFRAGE = `[out:json][timeout:120];
area["boundary"="administrative"]["name"="Heilbronn"]["admin_level"="6"]->.hn;
(
  relation["boundary"="administrative"]["name"="Heilbronn"]["admin_level"="6"];
  relation(area.hn)["boundary"="administrative"]["admin_level"~"^(9|10)$"];
  way(area.hn)["waterway"~"^(river|canal)$"];
  way(area.hn)["natural"="water"];
  way(area.hn)["landuse"="forest"];
  way(area.hn)["natural"="wood"];
  way(area.hn)["leisure"="park"];
  way(area.hn)["highway"~"^(motorway|trunk|primary|secondary)$"];
  way(area.hn)["railway"="rail"][!"service"];
);
out geom;
(
  nwr(area.hn)["amenity"~"^(library|music_school|youth_centre|arts_centre|theatre|townhall)$"];
  nwr(area.hn)["tourism"="museum"];
  nwr(area.hn)["name"~"Volkshochschule|Jugendhaus|Stadtbibliothek",i];
  nwr(area.hn)["railway"="station"]["name"~"Heilbronn Hbf|Heilbronn Hauptbahnhof"];
);
out center tags;`;

/** Lernorte mit Angeboten im COSMOS-Entdecker (Koordinaten aus Nominatim, geprüft am 14.11.2026). */
const ORTE = {
  aim: { lat: 49.1480204, lon: 9.2149954 },
  experimenta: { lat: 49.1445072, lon: 9.2149132 },
  hdf: { lat: 49.1453958, lon: 9.2089472 },
  ipai: { lat: 49.1555884, lon: 9.2076931 },
  hauptbahnhof: { lat: 49.1431403, lon: 9.2076637 },
  marktplatz: { lat: 49.1421625, lon: 9.2190354 },
};

/**
 * Weitere Orte zum Lernen und Entdecken (Namen exakt wie in OpenStreetMap).
 * Sie haben noch keine Angebotsdaten – zeigen aber, wie die Karte mitwächst.
 */
const WEITERE = [
  { name: "Stadtbibliothek", art: "bibliothek", lat: 49.146, lon: 9.2214 },
  { name: "Bib Bildungscampus", art: "bibliothek" },
  { name: "Volkshochschule Heilbronn", art: "schule" },
  { name: "Städtische Musikschule", art: "schule" },
  { name: "Robert-Mayer-Sternwarte", art: "museum" },
  { name: "Haus der Stadtgeschichte / Otto Rettenmaier Haus", art: "museum", anzeige: "Haus der Stadtgeschichte" },
  { name: "Kunsthalle Vogelmann", art: "museum" },
  { name: "uih! - Urban Innovation Hub", art: "museum", anzeige: "Urban Innovation Hub" },
  { name: "Literaturhaus Heilbronn", art: "museum" },
  { name: "Theater Heilbronn", art: "theater" },
  { name: "Theaterschiff Heilbronn", art: "theater" },
  { name: "Theater in der Streichholzschachtel", art: "theater" },
  { name: "Rathaus Heilbronn", art: "rathaus", anzeige: "Rathaus" },
];

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

async function ladeDaten() {
  const datei = process.argv[2];
  if (datei) return JSON.parse(await readFile(datei, "utf8"));
  for (let versuch = 1; versuch <= 3; versuch++) {
    const antwort = await fetch("https://lz4.overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "User-Agent": "COSMOS-Entdecker/0.1 (Hackathon-Prototyp Heilbronn)" },
      body: new URLSearchParams({ data: ABFRAGE }),
    });
    if (antwort.ok) return antwort.json();
    await pause(5000 * versuch);
  }
  throw new Error("Overpass-API nicht erreichbar");
}

const daten = await ladeDaten();
const elemente = daten.elements ?? [];

/* ---------- Projektion: 1 Einheit = 1 Meter ---------- */

const stadt = elemente.find((e) => e.type === "relation" && e.tags?.admin_level === "6");
if (!stadt) throw new Error("Stadtgrenze fehlt in den Daten");
const alle = stadt.members.flatMap((m) => m.geometry ?? []);
const RAND = 0.004;
const BBOX = {
  sued: Math.min(...alle.map((p) => p.lat)) - RAND,
  nord: Math.max(...alle.map((p) => p.lat)) + RAND,
  west: Math.min(...alle.map((p) => p.lon)) - RAND * 1.5,
  ost: Math.max(...alle.map((p) => p.lon)) + RAND * 1.5,
};
const lat0 = (BBOX.sued + BBOX.nord) / 2;
const M = 111_320;
const proj = ({ lat, lon }) => ({ x: Math.round((lon - BBOX.west) * M * Math.cos((lat0 * Math.PI) / 180)), y: Math.round((BBOX.nord - lat) * M) });
const breite = proj({ lat: BBOX.nord, lon: BBOX.ost }).x;
const hoehe = proj({ lat: BBOX.sued, lon: BBOX.west }).y;

/* ---------- Geometrie-Helfer ---------- */

function vereinfache(punkte, toleranz) {
  if (punkte.length < 3) return punkte;
  const a = punkte[0];
  const b = punkte.at(-1);
  let max = 0;
  let index = 0;
  for (let i = 1; i < punkte.length - 1; i++) {
    const p = punkte[i];
    const d = Math.abs((b.y - a.y) * p.x - (b.x - a.x) * p.y + b.x * a.y - b.y * a.x) / (Math.hypot(b.x - a.x, b.y - a.y) || 1);
    if (d > max) {
      max = d;
      index = i;
    }
  }
  if (max <= toleranz) return [a, b];
  return [...vereinfache(punkte.slice(0, index + 1), toleranz).slice(0, -1), ...vereinfache(punkte.slice(index), toleranz)];
}

/** Geschlossene Ringe: am weitesten entfernten Punkt teilen, sonst fällt der Ring zusammen (Start = Ende). */
function vereinfacheRing(punkte, toleranz) {
  if (punkte.length < 4) return punkte;
  const start = punkte[0];
  let weitester = 1;
  for (let i = 1; i < punkte.length; i++) {
    if (Math.hypot(punkte[i].x - start.x, punkte[i].y - start.y) > Math.hypot(punkte[weitester].x - start.x, punkte[weitester].y - start.y)) weitester = i;
  }
  return [...vereinfache(punkte.slice(0, weitester + 1), toleranz).slice(0, -1), ...vereinfache(punkte.slice(weitester), toleranz)];
}

const pfad = (punkte, zu = false) => `M${punkte.map((p) => `${p.x} ${p.y}`).join("L")}${zu ? "Z" : ""}`;

function flaeche(punkte) {
  let s = 0;
  for (let i = 0; i < punkte.length; i++) {
    const a = punkte[i];
    const b = punkte[(i + 1) % punkte.length];
    s += a.x * b.y - b.x * a.y;
  }
  return Math.abs(s / 2);
}

/** Setzt die Teilstücke einer OSM-Relation zu geschlossenen Ringen zusammen. */
function ringe(mitglieder) {
  const stuecke = mitglieder.filter((m) => m.role !== "inner" && m.geometry?.length).map((m) => m.geometry.map((p) => [p.lat, p.lon]));
  const gleich = (a, b) => a[0] === b[0] && a[1] === b[1];
  const fertig = [];
  while (stuecke.length) {
    let ring = stuecke.shift();
    let gewachsen = true;
    while (!gleich(ring[0], ring.at(-1)) && gewachsen) {
      gewachsen = false;
      for (let i = 0; i < stuecke.length; i++) {
        const s = stuecke[i];
        if (gleich(ring.at(-1), s[0])) ring = [...ring, ...s.slice(1)];
        else if (gleich(ring.at(-1), s.at(-1))) ring = [...ring, ...[...s].reverse().slice(1)];
        else if (gleich(ring[0], s.at(-1))) ring = [...s, ...ring.slice(1)];
        else if (gleich(ring[0], s[0])) ring = [...[...s].reverse(), ...ring.slice(1)];
        else continue;
        stuecke.splice(i, 1);
        gewachsen = true;
        break;
      }
    }
    fertig.push(ring.map(([lat, lon]) => proj({ lat, lon })));
  }
  return fertig;
}

function schwerpunkt(punkte) {
  const xs = punkte.map((p) => p.x);
  const ys = punkte.map((p) => p.y);
  return { x: Math.round((Math.min(...xs) + Math.max(...xs)) / 2), y: Math.round((Math.min(...ys) + Math.max(...ys)) / 2) };
}

/* ---------- Umwandeln ---------- */

const karte = {
  quelle: "© OpenStreetMap-Mitwirkende, ODbL 1.0",
  projektion: { west: BBOX.west, nord: BBOX.nord, lat0, meterProGrad: M },
  flussName: null,
  stand: new Date().toISOString().slice(0, 10),
  breite,
  hoehe,
  grenze: "",
  stadtteile: [],
  wald: [],
  parks: [],
  seen: [],
  fluss: [],
  kanal: [],
  autobahn: [],
  hauptstrassen: [],
  strassen: [],
  bahn: [],
  orte: {},
  weitere: [],
};

karte.grenze = ringe(stadt.members).map((r) => pfad(vereinfacheRing(r, 12), true)).join("");

for (const e of elemente) {
  const t = e.tags ?? {};
  if (e.type === "relation" && ["9", "10"].includes(t.admin_level) && t.name) {
    const r = ringe(e.members);
    const groesster = r.sort((a, b) => flaeche(b) - flaeche(a))[0];
    if (groesster) karte.stadtteile.push({ name: t.name, d: r.map((x) => pfad(vereinfacheRing(x, 15), true)).join(""), mitte: schwerpunkt(groesster) });
    continue;
  }
  if (e.type !== "way" || !e.geometry) continue;
  const punkte = e.geometry.map(proj);
  const geschlossen = e.nodes?.[0] === e.nodes?.at(-1);
  if (t.waterway === "river") karte.fluss.push(pfad(vereinfache(punkte, 8)));
  else if (t.waterway === "canal") karte.kanal.push(pfad(vereinfache(punkte, 8)));
  else if (t.natural === "water" && geschlossen && flaeche(punkte) > 1500) karte.seen.push(pfad(vereinfacheRing(punkte, 5), true));
  else if ((t.landuse === "forest" || t.natural === "wood") && geschlossen && flaeche(punkte) > 8000) karte.wald.push(pfad(vereinfacheRing(punkte, 14), true));
  else if (t.leisure === "park" && geschlossen && flaeche(punkte) > 3000) karte.parks.push(pfad(vereinfacheRing(punkte, 8), true));
  else if (t.highway === "motorway" || t.highway === "trunk") karte.autobahn.push(pfad(vereinfache(punkte, 12)));
  else if (t.highway === "primary") karte.hauptstrassen.push(pfad(vereinfache(punkte, 10)));
  else if (t.highway === "secondary") karte.strassen.push(pfad(vereinfache(punkte, 12)));
  else if (t.railway === "rail") karte.bahn.push(pfad(vereinfache(punkte, 12)));
}

for (const [id, ort] of Object.entries(ORTE)) karte.orte[id] = proj(ort);

// Beschriftung des Neckars: in der Innenstadt, wo die Lernorte liegen
const bezug = proj({ lat: 49.152, lon: 9.205 });
let neckar = null;
let bestI = 0;
let bestD = Infinity;
for (const e of elemente.filter((x) => x.type === "way" && x.tags?.waterway === "river" && x.geometry)) {
  e.geometry.map(proj).forEach((p, i) => {
    const d = Math.hypot(p.x - bezug.x, p.y - bezug.y);
    if (d < bestD) {
      bestD = d;
      neckar = e;
      bestI = i;
    }
  });
}
if (neckar) {
  const pk = neckar.geometry.map(proj);
  const i = bestI;
  const a = pk[Math.max(0, i - 3)];
  const b = pk[Math.min(pk.length - 1, i + 3)];
  let winkel = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
  if (winkel > 90) winkel -= 180;
  if (winkel < -90) winkel += 180;
  karte.flussName = { text: neckar.tags.name ?? "Neckar", x: pk[i].x, y: pk[i].y, winkel: Math.round(winkel) };
}

const poiNachName = new Map();
for (const e of elemente) {
  const name = e.tags?.name;
  const c = e.center ?? (e.type === "node" ? { lat: e.lat, lon: e.lon } : null);
  if (name && c && !poiNachName.has(name)) poiNachName.set(name, c);
}
for (const w of WEITERE) {
  const c = w.lat ? { lat: w.lat, lon: w.lon } : poiNachName.get(w.name);
  if (!c) {
    console.warn(`Nicht gefunden: ${w.name}`);
    continue;
  }
  karte.weitere.push({ name: w.anzeige ?? w.name, art: w.art, ...proj(c), lat: c.lat, lon: c.lon });
}

await writeFile("src/lib/heilbronn-karte.json", `${JSON.stringify(karte)}\n`);
const kb = Math.round(JSON.stringify(karte).length / 1024);
console.log(`Heilbronn ${breite}×${hoehe} m · ${karte.stadtteile.length} Stadtteile · ${karte.wald.length} Waldflächen · ${karte.seen.length} Gewässer · ${karte.autobahn.length + karte.hauptstrassen.length + karte.strassen.length} Straßen · ${karte.weitere.length} weitere Orte · ${kb} KB`);
