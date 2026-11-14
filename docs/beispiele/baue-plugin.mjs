// Baut das hochladbare Beispiel-Plugin aus dem lesbaren HTML.
// Aufruf: node docs/beispiele/baue-plugin.mjs
import { readFileSync, writeFileSync } from "node:fs";

const hier = (datei) => new URL(datei, import.meta.url);
const haus = JSON.parse(readFileSync(hier("../../konfiguration/checkpoints/aim.json"), "utf8"));
// Zeilenenden vereinheitlichen, damit Windows- und Linux-Checkouts dasselbe Plugin ergeben.
const html = readFileSync(hier("schleifen-lauf.html"), "utf8").replace(/\r\n/g, "\n");

const plugin = {
  schemaVersion: 1,
  institution: "aim",
  name: "Roboter-Express mit Schleifen-Lauf",
  version: "1.1.0",
  // Gleiche Anzahl wie im eingebauten Haus: Aufgabe 1 und 2 bleiben, Aufgabe 3 ist das eigene Spiel.
  aktivitaeten: [
    haus.aktivitaeten[0],
    haus.aktivitaeten[1],
    { titel: "Der Schleifen-Lauf", modul: "plugin", html },
  ],
};

writeFileSync(hier("aim-plugin.json"), JSON.stringify(plugin, null, 2) + "\n");
console.log("docs/beispiele/aim-plugin.json geschrieben");
