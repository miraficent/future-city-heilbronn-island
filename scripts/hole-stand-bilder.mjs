// Holt für jede Veranstaltung im gespeicherten Mobilizon-Stand das Titelbild von der Seite der Einrichtung
// (og:image bzw. <img> in der Beschreibung), verkleinert es und legt es lokal ab.
// Aufruf (im Projektordner): node scripts/hole-stand-bilder.mjs .
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

const P = process.argv[2];
const require = createRequire(`${P}/package.json`);
const sharp = require("sharp");
const events = JSON.parse(readFileSync(`${P}/src/data/mobilizon-stand.json`, "utf8"));
const ZIEL = `${P}/public/events`;
mkdirSync(ZIEL, { recursive: true });
const ERLAUBT = /^https:\/\/(www\.)?(experimenta\.science|hdf-hn\.de|aim-akademie\.org|ipai-foundation\.ai)\//;
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const UA = { "User-Agent": "Mozilla/5.0 (Hackathon-Prototyp Heilbronn; einmaliger Abruf von Veranstaltungsbildern)" };

async function holeText(url) {
  const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.text();
}
const entschluessle = (s) => s.replace(/&amp;/g, "&").replace(/&#038;/g, "&").replace(/&quot;/g, '"');

const seiteZuBild = new Map(); // Seite (ohne ?termin) → Bild-URL
const zuordnung = {}; // uuid → Bild-URL (Quelle)
for (const e of events) {
  const html = e.description || "";
  let bild = html.match(/<img src="(https:\/\/[^"]+)"/)?.[1];
  if (!bild) {
    const links = [...html.matchAll(/href="(https:\/\/[^"]+)"/g)].map((m) => entschluessle(m[1])).filter((l) => ERLAUBT.test(l));
    const seite = links[0]?.split("?")[0];
    if (seite) {
      if (!seiteZuBild.has(seite)) {
        try {
          const t = await holeText(seite);
          const og = t.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1]
            ?? t.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1];
          seiteZuBild.set(seite, og ? entschluessle(og) : null);
          console.log(og ? "Bild" : "kein Bild", seite);
        } catch (f) {
          seiteZuBild.set(seite, null);
          console.log("Fehler", seite, String(f));
        }
        await pause(1000);
      }
      bild = seiteZuBild.get(seite) ?? undefined;
    }
  }
  if (bild && ERLAUBT.test(bild)) zuordnung[e.uuid] = { bild, titel: e.title, ort: e.attributedTo?.preferredUsername };
}

// Ein Bild, das bei mehreren verschiedenen Veranstaltungen derselben Einrichtung vorkommt, ist nur das Standardbild → weglassen
const nutzung = new Map();
for (const { bild, titel, ort } of Object.values(zuordnung)) {
  const k = `${ort}|${bild}`;
  nutzung.set(k, (nutzung.get(k) ?? new Set()).add(titel.split(" – ")[0].trim().toLowerCase()));
}

const ergebnis = {};
const geladen = new Map();
for (const [uuid, { bild, ort }] of Object.entries(zuordnung)) {
  if ((nutzung.get(`${ort}|${bild}`)?.size ?? 0) > 1) continue;
  if (!geladen.has(bild)) {
    const name = `${createHash("sha1").update(bild).digest("hex").slice(0, 16)}.jpg`;
    if (!existsSync(`${ZIEL}/${name}`)) {
      try {
        const r = await fetch(bild, { headers: UA, signal: AbortSignal.timeout(20000) });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const daten = Buffer.from(await r.arrayBuffer());
        await sharp(daten).resize({ width: 800, height: 450, fit: "cover" }).jpeg({ quality: 78, mozjpeg: true }).toFile(`${ZIEL}/${name}`);
        console.log("gespeichert", name, bild);
      } catch (f) {
        console.log("Bild-Fehler", bild, String(f));
        geladen.set(bild, null);
        continue;
      }
      await pause(800);
    }
    geladen.set(bild, `/events/${name}`);
  }
  if (geladen.get(bild)) ergebnis[uuid] = geladen.get(bild);
}
writeFileSync(`${P}/src/data/mobilizon-stand-bilder.json`, JSON.stringify(ergebnis, null, 1));
console.log("Veranstaltungen mit eigenem Bild:", Object.keys(ergebnis).length, "von", events.length, "| Dateien:", new Set(Object.values(ergebnis)).size);
