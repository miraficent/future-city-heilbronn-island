# Angebote und Themen pflegen

Die Tabellen sind UTF-8-CSV-Dateien mit Komma als Spaltentrenner. Zellen mit einem Komma müssen in Anführungszeichen stehen. Tabellenkalkulationen übernehmen das beim passenden Exportformat. Vorhandene IDs nicht umbenennen, damit Merkzettel und Links gültig bleiben.

## Ein Thema ergänzen

In `konfiguration/themen.csv` eine neue Zeile ergänzen. Beispiel:

```csv
id,name,kindername,symbol,farbe,schlagwoerter
forschen,Forschen,Forscher-Planet,leaf,#5DBB63,Experiment|Forschen|Naturwissenschaft
```

Die bestehende Kopfzeile behalten und die Beispielzeile darunter ergänzen, nicht die ganze Datei ersetzen. `symbol` ist eine SVG-Kennung wie `robot`, `code`, `controller`, `tools`, `leaf` oder `compass`, kein Emoji. Die Themen erscheinen automatisch in Suche und Kursauswahl. Interessen-Bildkarten sind kuratiert. Eine neue Quellenzeile bindet Daten ein, erzeugt aber kein zusätzliches Spielgebäude; dafür gibt es die Lernhaus-Dateien (nächster Abschnitt).

## Ein Lernhaus in der Spielwelt anpassen

Jedes Haus der Spielwelt hat eine eigene Datei `konfiguration/checkpoints/<id>.json`. Darin stehen Name, Kurzname, Farbe, Gebäudegrafik, Hausschild-Symbol, Raketenteil, die Geschichte (`klein` für 6–8, `gross` ab 9 Jahren) und die Liste der Aufgaben. Ohne Codeänderung lassen sich Texte, Farbe sowie Anzahl, Reihenfolge und Art der Aufgaben ändern:

```json
"aktivitaeten": [
  { "titel": "Die Materialprobe", "modul": "material-wahl" },
  { "titel": "Die Lichtschalter", "modul": "stromkreis" },
  { "titel": "Programmier den Roboter", "modul": "roboter-code", "variante": 1 }
]
```

Verfügbare Module (`MODULE` in `src/lib/checkpoint.ts`): `roboter-code` (Varianten 0–2), `muster-wahl` (0–2), `level-bau` (0–2), `material-wahl`, `stromkreis`, `energie-wahl` und `lektion`.

Eine **Demo-Lektion** (`"modul": "lektion"`) hat keinen Code-Inhalt: Folien und Abschlussfrage stehen vollständig in der Datei (Beispiel: `experimenta.json`). Jede Folie hat `titel`, `text` (ab 9 Jahren), optional `kurz` (6–8 Jahre) und entweder ein eingebautes `motiv` oder ein eigenes `bild`. Eigene Bilder liegen unter `public/medien/…` und brauchen `alt`; externe Bild- oder Videolinks sind absichtlich nicht erlaubt. Die optionale `abschlussfrage` hat dasselbe Format wie die Bildauswahl-Aufgaben (`frage`, `optionen`, `antworten`, `tipp`, `wissen`). Ohne Abschlussfrage zählt die Lektion nach der letzten Folie als geschafft. `thema` muss eine ID aus `themen.csv` sein; danach werden die echten Kurse im Haus gefiltert. `interesse` (`coding`, `gaming`, `ki`, `forschen`) bestimmt, worauf die Aufgaben im Elternbericht einzahlen. `grafik` und `symbol` wählen aus den vorhandenen Gebäuden und Symbolen.

Die `id` und die Position einer Aufgabe in der Liste bilden die Fortschrittskennung (`aim-0`, `aim-1`, …). Bei laufenden Sitzungen ordnet ein Umsortieren den bisherigen Fortschritt also neu zu. `npm.cmd test` prüft alle Dateien und meldet z. B. unbekannte Module oder zu hohe Varianten. Ein zusätzliches Haus braucht eine neue Datei und einen Importeintrag in `STATIONEN` (`src/lib/spiel.ts`); die Stadt wächst dann automatisch. Neue Modularten, Gebäudegrafiken oder Symbole benötigen Code.

## Eine Einrichtung ergänzen

In `konfiguration/quellen.csv` eine neue Zeile mit den vorhandenen Spalten anlegen:

`id,name,website,adapter,start_urls,farbe,adresse`

Adapter müssen exakt einem vorhandenen Format entsprechen: `kufer-wp-api`, `kufer-html`, `experimenta-kalender` oder `wp-sitemap-events`. Gleicher CMS-Name allein garantiert keine kompatiblen Felder oder HTML-Struktur. Die neue Quelle zuerst anhand realer Daten prüfen. Nutzungserlaubnis, angemessene Abrufhäufigkeit und technische Regeln der Quelle vorher klären; robots.txt allein ist keine Lizenz.

## Einzelne Angaben korrigieren

Die ID steht in `daten/angebote.json`. Beispielhafte Zeilen für `konfiguration/korrekturen.csv`:

```csv
angebot_id,aktion,wert
aim:262420SC,alter,8-11
aim:262420SC,thema,coding
aim:262420SC,zielgruppe,kinder
```

Weitere Syntax:

- Mindestalter ohne Obergrenze: `alter,10`.
- Mehrere Themen: `thema,coding|gaming`. Dies gilt als manuelle Themenfreigabe und setzt die Zuordnungssicherheit auf 1.
- Zielgruppen: `kinder`, `teens`, `eltern`, `familien`, `fachkraefte`, `erwachsene`, bei Bedarf mit `|` verbinden.
- Ausblenden: `ausblenden,ja`. Bei dieser Aktion wird das Angebot unabhängig vom Wert ausgeschlossen.

Zeilen werden nacheinander angewendet. Eine Alterskorrektur berechnet die Zielgruppen neu. Falls erforderlich, die passende Zielgruppenkorrektur danach eintragen. Erst die Originalseite prüfen, dann eine unsichere Themenzuordnung freigeben. Die Zahl zur Sicherheit ist ein Regelwert, keine statistisch kalibrierte Wahrscheinlichkeit.

## Änderungen übernehmen

```powershell
npm.cmd run pipeline
npm.cmd test
npm.cmd run export
```

Danach `/projekt/` und einige geänderte Angebote in der Vorschau prüfen. Die sichtbare Verfügbarkeit ist eine Momentaufnahme des Datenimports. Bei Netzwerk- oder Quellfehlern ist der Lauf nicht vollständig erfolgreich, auch wenn letzte gültige Daten erhalten bleiben.

Nur für die Entwicklung mit **bereits vorhandenen** Rohdaten unter `.cache/roh/`:

```powershell
$env:ROH_CACHE = '1'
npm.cmd run pipeline
Remove-Item Env:\ROH_CACHE
```

Dieser Modus verarbeitet gespeicherte Daten und ist kein Live-Abruf. Er scheitert für Quellen ohne Rohdatencache. `.cache/` wird nicht ins Repository übernommen. Der Bericht kennzeichnet den Cache-Modus ausdrücklich.

Die drei Tabellen können alternativ als veröffentlichte CSV-URLs über `QUELLEN_CSV_URL`, `THEMEN_CSV_URL` und `KORREKTUREN_CSV_URL` konfiguriert werden. In solchen veröffentlichten Tabellen dürfen keine Geheimnisse oder personenbezogenen Kinderangaben stehen.
