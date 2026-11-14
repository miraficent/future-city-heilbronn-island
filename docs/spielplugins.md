# Spielplugins

Unter `/admin/` kann ein Administrator pro Einrichtung ein Spielplugin herunterladen,
als JSON bearbeiten, hochladen, in allen Altersstufen testen und veröffentlichen.
`/werkstatt/` verlinkt das Portal. Bestehende Checkpoints sind die eingebauten Plugins;
ohne Upload bleibt das bisherige Spiel aktiv. Zurücksetzen stellt es wieder her.

## Betrieb

Der Next.js-Server braucht `COSMOS_ADMIN_PASSWORD` (langes, zufälliges Passwort).
Beispiel für `.env.local` (nicht einchecken):

```
COSMOS_ADMIN_PASSWORD=hier-ein-langes-zufaelliges-passwort-eintragen
COSMOS_PLUGIN_DIR=./daten/plugins
```

Danach den Server neu starten. In Produktion HTTPS verwenden. Das Passwort wird
bei jeder schreibenden Anfrage geprüft und nur im React-Zustand des Adminfensters
gehalten. Es gibt keine Benutzerkonten oder Passwortrücksetzung.
Die API ist ohne konfiguriertes Passwort für Änderungen gesperrt.
Veröffentlichungen werden atomar in `COSMOS_PLUGIN_DIR/<institution>.json` gespeichert.
Dieses Verzeichnis muss beschreibbar sein und auf einem dauerhaften Volume liegen;
bei mehreren Serverinstanzen brauchen alle dasselbe Volume. Backups einrichten.
Besucher erhalten veröffentlichte Plugins beim erneuten Öffnen der Spielwelt.
Bei einem Lesefehler greift das eingebaute Spiel. Der Server protokolliert den Fehler.
Gleichzeitige Veröffentlichungen: die zuletzt gespeicherte Datei gewinnt.

Diese Funktion benötigt Node.js-Hosting (`npm run build`, `npm start`). Der statische
Export (`npm run export`) funktioniert weiterhin, enthält aber keine Plugin-API: Die
Route liegt in `src/app/api/plugins/route.server.ts`, und die Endung `.server.ts` ist
nur außerhalb des Exports aktiv (`pageExtensions` in `next.config.ts`). Im Export zeigt
die Spielwelt die eingebauten Spiele, und `/admin/` meldet, dass kein Plugin-Server
erreichbar ist.

## Format (Version 1)

Ein Plugin enthält `schemaVersion: 1`, `institution` (`aim`, `experimenta`, `hdf`,
`ipai`), `name`, `version` im Format `1.2.3` und `aktivitaeten`.
Die Aktivitätsanzahl muss mit dem bisherigen Checkpoint übereinstimmen, damit
Missionsnummern, Fortschritt und Raketenteile kompatibel bleiben. Die Reihenfolge
entspricht diesen Missionsnummern. Vorhandener Fortschritt bleibt bei Updates erhalten.
Die Gesamtdatei darf maximal 1 MB groß sein.
Die bisherigen Module und Lektionen können unverändert verwendet werden.
Download im Portal liefert eine vollständige Vorlage für jede Einrichtung.

Eigene Spiele sind Aktivitäten mit `modul: "plugin"`, `titel` und `html` (maximal
400.000 Zeichen). HTML, CSS und JavaScript sind in dieser Zeichenfolge enthalten.
Keine externen Dateien: Bilder und Schriften bei Bedarf als Data-URLs einbetten.
Beispiel für eine einzelne Aktivität (in die heruntergeladene Vorlage einsetzen):

```json
{
  "titel": "Finde die richtige Zahl",
  "modul": "plugin",
  "html": "<h2>Was ist 2 + 2?</h2><button onclick=\"parent.postMessage({type:'cosmos:complete'}, '*')\">4</button><button onclick=\"this.textContent='Versuche es noch einmal'\">5</button>"
}
```

Ein vollständiges Beispiel liegt in `docs/beispiele/`: `aim-plugin.json` ist direkt
hochladbar (Einrichtung `aim` wählen). Es behält die ersten zwei Roboter-Aufgaben und
ersetzt die dritte durch das eigene Spiel „Der Schleifen-Lauf“, das sich je Altersstufe
ändert. Der lesbare Quelltext steht in `schleifen-lauf.html`; nach Änderungen
`node docs/beispiele/baue-plugin.mjs` ausführen (ein Test prüft, dass beides passt).

`window.COSMOS_STUFE` ist `start`, `weiter` oder `profi`. Erfolg meldet das Spiel
mit `parent.postMessage({type: 'cosmos:complete'}, '*')`. Die Anwendung akzeptiert
Nachrichten nur vom aktiven Spielframe und belohnt dessen ersten Abschluss.
Das Frame hat nur `allow-scripts`: kein Zugriff auf App-DOM, Cookies oder Speicher,
keine Popups, Downloads oder Navigation des Elternfensters. Eine CSP sperrt externe
Ressourcen, Netzwerkabfragen und Formulare. Plugins dürfen selbst keine Daten erheben.

Grenze: Die CSP kann nicht verhindern, dass das Frame **sich selbst** auf eine andere
Seite umleitet (`location.href = …`). Klicks auf Links werden im Frame abgefangen;
lädt das Frame trotzdem eine zweite Seite, entfernt die Spielwelt es sofort und zeigt
einen Hinweis. Die erste Anfrage an die fremde Adresse ist dann aber schon gesendet.
Plugins mit Weiterleitungen deshalb nicht veröffentlichen.
Nur vertrauenswürdige Spiele veröffentlichen: die Isolation ist keine Prüfung der
pädagogischen Inhalte und verhindert keine rechenintensiven Skripte.
