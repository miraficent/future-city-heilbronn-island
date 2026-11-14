// Erzeugt src/lib/heilbronn-karte.json aus OpenStreetMap-Daten (© OpenStreetMap-Mitwirkende, ODbL).
// Einmalig ausführen: node scripts/karte-erzeugen.mjs   (oder mit Pfad zu einer gespeicherten Overpass-Antwort)
// Die Website lädt danach nur die fertige Datei – Besucher:innen senden keine Daten an OpenStreetMap.
import { readFile, writeFile } from "node:fs/promises";

const BBOX = { sued: 49.133, west: 9.19, nord: 49.163, ost: 9.236 };
const ABFRAGE = `[out:json][timeout:40];(way["waterway"~"^(river|canal)$"](${BBOX.sued},${BBOX.west},${BBOX.nord},${BBOX.ost});way["natural"="water"](${BBOX.sued},${BBOX.west},${BBOX.nord},${BBOX.ost});way["highway"~"^(motorway|trunk|primary|secondary)$"](${BBOX.sued},${BBOX.west},${BBOX.nord},${BBOX.ost});way["railway"="rail"][!"service"](${BBOX.sued},${BBOX.west},${BBOX.nord},${BBOX.ost});way["leisure"="park"](${BBOX.sued},${BBOX.west},${BBOX.nord},${BBOX.ost}););out geom;`;

// Die Orte selbst stammen aus Nominatim (geprüft am 14.11.2026).
const ORTE = {
  aim: { lat: 49.1480204, lon: 9.2149954 },
  experimenta: { lat: 49.1445072, lon: 9.2149132 },
  hdf: { lat: 49.1453958, lon: 9.2089472 },
  ipai: { lat: 49.1555884, lon: 9.2076931 },
  hauptbahnhof: { lat: 49.1431403, lon: 9.2076637 },
  marktplatz: { lat: 49.1421625, lon: 9.2190354 },
};

const lat0 = (BBOX.sued + BBOX.nord) / 2;
const M_PRO_GRAD = 111_320;
const proj = ({ lat, lon }) => ({
  x: Math.round((lon - BBOX.west) * M_PRO_GRAD * Math.cos((lat0 * Math.PI) / 180)),
  y: Math.round((BBOX.nord - lat) * M_PRO_GRAD),
});
const breite = proj({ lat: BBOX.nord, lon: BBOX.ost }).x;
const hoehe = proj({ lat: BBOX.sued, lon: BBOX.west }).y;

function vereinfache(punkte, toleranz) {
  if (punkte.length < 3) return punkte;
  const [a, b] = [punkte[0], punkte.at(-1)];
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

const pfad = (punkte, zu = false) => `M${punkte.map((p) => `${p.x} ${p.y}`).join("L")}${zu ? "Z" : ""}`;

const quelle = process.argv[2];
const daten = quelle
  ? JSON.parse(await readFile(quelle, "utf8"))
  : await (
      await fetch("https://lz4.overpass-api.de/api/interpreter", {
        method: "POST",
        headers: { "User-Agent": "COSMOS-Entdecker/0.1 (Hackathon-Prototyp Heilbronn)" },
        body: new URLSearchParams({ data: ABFRAGE }),
      })
    ).json();

const karte = { quelle: "© OpenStreetMap-Mitwirkende, ODbL 1.0", stand: new Date().toISOString().slice(0, 10), breite, hoehe, fluss: [], kanal: [], seen: [], parks: [], hauptstrassen: [], strassen: [], bahn: [], orte: {} };

for (const e of daten.elements ?? []) {
  if (e.type !== "way" || !e.geometry) continue;
  const t = e.tags ?? {};
  const punkte = e.geometry.map(proj);
  const geschlossen = e.nodes?.[0] === e.nodes?.at(-1);
  if (t.waterway === "river") karte.fluss.push(pfad(vereinfache(punkte, 8)));
  else if (t.waterway === "canal") karte.kanal.push(pfad(vereinfache(punkte, 8)));
  else if (t.natural === "water" && geschlossen) karte.seen.push(pfad(vereinfache(punkte, 4), true));
  else if (t.leisure === "park" && geschlossen) karte.parks.push(pfad(vereinfache(punkte, 6), true));
  else if (["motorway", "trunk", "primary"].includes(t.highway)) karte.hauptstrassen.push(pfad(vereinfache(punkte, 6)));
  else if (t.highway === "secondary") karte.strassen.push(pfad(vereinfache(punkte, 6)));
  else if (t.railway === "rail") karte.bahn.push(pfad(vereinfache(punkte, 8)));
}
for (const [id, ort] of Object.entries(ORTE)) karte.orte[id] = proj(ort);

await writeFile("src/lib/heilbronn-karte.json", `${JSON.stringify(karte)}\n`);
console.log(`Karte ${breite}×${hoehe} m: ${karte.fluss.length} Flussstücke, ${karte.seen.length} Seen, ${karte.hauptstrassen.length + karte.strassen.length} Straßen, ${karte.bahn.length} Gleise, ${karte.parks.length} Parks`);
