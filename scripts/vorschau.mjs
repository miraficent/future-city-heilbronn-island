import { createServer } from "node:http";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { leererStand, pruefeSignal, pruefeStand, zaehle } from "../src/lib/signal-regeln.mjs";

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), "../out");
// Anonyme Wunsch-Zähler („Was fehlt?“): nur Tageszähler, keine IP, keine Kennung, kein Log.
const signalDatei = resolve(dirname(fileURLToPath(import.meta.url)), "../.cache/signale.json");
let signale = leererStand();
try { signale = pruefeStand(JSON.parse(await readFile(signalDatei, "utf8"))); } catch { /* noch keine Signale */ }
const MAX_SIGNALE_PRO_MINUTE = 60;
let minute = { start: Date.now(), anzahl: 0 };
let speichern = Promise.resolve();
function json(res, status, daten) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  res.end(daten === undefined ? undefined : JSON.stringify(daten));
}
async function signalAnnehmen(req, res) {
  if (Date.now() - minute.start > 60_000) minute = { start: Date.now(), anzahl: 0 };
  if (++minute.anzahl > MAX_SIGNALE_PRO_MINUTE) return json(res, 429, { fehler: "Zu viele Meldungen – bitte später erneut." });
  let roh = "";
  for await (const teil of req) {
    roh += teil;
    if (roh.length > 1024) return json(res, 413, { fehler: "Zu groß." });
  }
  let signal = null;
  try { signal = pruefeSignal(JSON.parse(roh)); } catch { /* ungültiges JSON */ }
  if (!signal) return json(res, 400, { fehler: "Ungültiges Signal." });
  signale = zaehle(signale, signal, new Date().toISOString().slice(0, 10));
  const kopie = JSON.stringify(signale);
  speichern = speichern.then(() => mkdir(dirname(signalDatei), { recursive: true })).then(() => writeFile(signalDatei, kopie)).catch(() => {});
  return json(res, 204);
}
const port = Number(process.env.COSMOS_PORT || 4173);
const adresse = `http://localhost:${port}`;
function oeffnen() {
  if (!process.argv.includes("--open")) return;
  const befehl = process.platform === "win32" ? ["cmd.exe", ["/c", "start", "", adresse]] : process.platform === "darwin" ? ["open", [adresse]] : ["xdg-open", [adresse]];
  const child = spawn(befehl[0], befehl[1], { windowsHide: true, stdio: "ignore" });
  child.on("error", () => console.log(`Bitte diese Adresse im Browser öffnen: ${adresse}`));
}
const typen = { ".html": "text/html; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".png": "image/png", ".ico": "image/x-icon", ".woff2": "font/woff2", ".ics": "text/calendar; charset=utf-8", ".svg": "image/svg+xml" };
try { await stat(resolve(wurzel, "index.html")); }
catch { console.error("Die gebaute Website fehlt. Bitte zuerst npm run export ausführen."); process.exit(1); }
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://127.0.0.1:${port}`);
    if (url.pathname === "/api/signal" && req.method === "POST") return await signalAnnehmen(req, res);
    if (url.pathname === "/api/signale" && req.method === "GET") return json(res, 200, signale);
    if (url.pathname.startsWith("/api/")) return json(res, 405, { fehler: "Nicht erlaubt." });
    let pfad = resolve(wurzel, `.${decodeURIComponent(url.pathname)}`);
    if (pfad !== wurzel && !pfad.startsWith(wurzel + sep)) { res.writeHead(403).end(); return; }
    if ((await stat(pfad)).isDirectory()) pfad = resolve(pfad, "index.html");
    const inhalt = await readFile(pfad);
    res.writeHead(200, { "Content-Type": typen[extname(pfad)] || "application/octet-stream", "Cache-Control": "no-cache", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY" });
    res.end(req.method === "HEAD" ? undefined : inhalt);
  } catch {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    try { res.end(await readFile(resolve(wurzel, "404.html"))); } catch { res.end("Seite nicht gefunden"); }
  }
});
server.on("error", async (e) => {
  if (e.code === "EADDRINUSE") {
    try {
      const antwort = await fetch(adresse, { signal: AbortSignal.timeout(2000) });
      if ((await antwort.text()).includes("COSMOS-Entdecker")) { console.log(`Die Website läuft bereits: ${adresse}`); oeffnen(); return; }
    } catch { /* verständlicher Fehler folgt unten */ }
    console.error(`Port ${port} ist belegt. Wähle einen anderen Port über COSMOS_PORT.`);
  } else console.error(e.message);
  process.exitCode = 1;
});
server.listen(port, "127.0.0.1", () => { console.log(`COSMOS-Entdecker: ${adresse}\nZum Beenden Strg+C drücken. Die Vorschau ist nur auf diesem Computer erreichbar.`); oeffnen(); });
