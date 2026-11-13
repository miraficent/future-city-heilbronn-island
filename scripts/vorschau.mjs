import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), "../out");
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
