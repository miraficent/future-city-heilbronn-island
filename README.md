# COSMOS-Entdecker

Ein funktionsfähiger Web-Prototyp für die aim-Challenge „Learning Guide“. Kinder erkunden eine **spielbare 2D-Lerninsel** und finden von dort zu echten Angeboten zu **KI, Coding und Gaming** von aim, experimenta, Haus der Familie und IPAI in Heilbronn. Die gesamte Oberfläche ist ohne Emojis gestaltet.

## Website öffnen

**Fertige lokale Webansicht: http://localhost:4173/**

**Direkt ins 2D-Spiel: http://localhost:4173/kind/**

Auf diesem Computer **`Website-starten.cmd` doppelt anklicken**. Das startet den lokalen Webserver und öffnet danach die Website im Browser. Das Fenster während der Vorführung offen lassen. `COSMOS-Entdecker.url` öffnet eine bereits laufende Vorschau. Diese Adresse funktioniert nur auf diesem Computer; sie ist kein öffentlicher Hosting-Link.

Der fertige statische Stand liegt in `out/`. Er benötigt zum Anzeigen Node.js, aber keine API-Schlüssel, Datenbank oder laufenden Internetverbindungen zu den Veranstaltern. Externe Originalseiten benötigen natürlich Internet.

Nach Änderungen neu bauen und starten:

```powershell
npm.cmd run export
npm.cmd run preview
```

Unter Linux/macOS die Befehle als `npm run export` und `npm run preview` ausführen. Voraussetzungen für Entwicklung und Neubau: Node.js 22.12+ bzw. 24, `npm ci`.

Entwicklung mit automatischem Neuladen: `npm.cmd run dev`, anschließend http://localhost:3000 öffnen. Produktions-Build mit Next-Server: `npm.cmd run build`, danach `npm.cmd start`.

## Was funktioniert?

- **Kinder und Teens:** zusammenhängende Pixelstadt mit 2400 × 1700 Welteinheiten, vier Kapiteln und zwölf Aufgaben je Altersstufe (6–8, 9–11, 12–17), Kamerazoom, Gesamtkarte, Straßenübergängen, Baum-/Bank-Kollisionen und Finale am Ideenbaum; eigene Pixel-Spielfigur, Pfeiltasten/WASD, Touch-Wegsuche um Gebäude mit automatischem Betreten, Pause und vier direkt zugängliche Lernhäuser. Roboter-Code, Stromkreis, Levelbau und Mustererkennung sind interaktive Aufgaben mit hilfreichen Rückmeldungen. Danach führen altersgerechte Empfehlungen zu echten Kursen. Der Rucksack und erledigte Aufgaben bleiben nur in der Sitzung. Pico hilft lokal mit vorbereiteten Antworten. Wünsche und ein erklärbarer Elternbericht verbinden ausprobierte Themen mit echten Kursen. Offizielle Einrichtungen und bestätigte Socials: /einrichtungen/. Keine Uhr, keine Leben, keine Rangliste. Häuser und Eingänge stehen auf zwei gemeinsamen Reihen. Die lesbare Schrift wurde geändert; Einstieg und Aufgaben sind deutlich kürzer. Kurse werden bei Bedarf aufgeklappt.
- **Teens:** dunkle Oberfläche, Suche und Filter, Merkzettel, Zeitreise und Sternbild mit echten Angeboten. Das Sternbild ist eine Entdeckungsidee, keine fachlich bestätigte Kursfolge.
- **Eltern/Fachkräfte:** Volltextsuche, Thema, Alter, Zeitraum, Einrichtung, Veranstaltungsart, Zielgruppe, kostenlose Angebote und gemeldete freie Plätze.
- **Details:** Termine, Ort, Preis, Verfügbarkeit, Link zum Original, lokaler ICS-Download, QR-Code und Web-Share mit Kopieralternative.
- **Vorlesen:** nur mit einer lokal verfügbaren deutschen Browser-/Systemstimme; sonst eine verständliche Meldung, ohne externen Sprachdienst.
- **Datenschutz:** keine Konten, keine Analyseübertragung, kein externer KI-Chat, keine extern geladenen Angebotsbilder. Schriften und QR-Code-Erzeugung sind lokal. Löschen der App-Speicherdaten ist in der Oberfläche möglich.

Der gespeicherte Datenbestand enthält derzeit 78 Angebote: 61 öffentlich sichtbar und 17 wegen unsicherer Themenzuordnung zurückgehalten. Nicht jede Quelle hat Angebote für jede Altersgruppe. Die Oberfläche erfindet bei fehlenden Treffern keine Kurse.

## Datenpflege ohne Codeänderung

1. `konfiguration/quellen.csv` in einer Tabellenkalkulation als UTF-8-CSV öffnen. Eine neue Einrichtung erhält eine Zeile mit eigener ID, Namen, Website, unterstütztem Adapter, Startadressen, Farbe und Standardadresse. Mehrere Startadressen mit `|` trennen.
2. `konfiguration/themen.csv` enthält Themenname, SVG-Symbolkennung, Farbe, Kindername und durch `|` getrennte Schlagwörter. Eine neue Themenzeile erzeugt einen zusätzlichen Themenfilter. Die vier Spielhäuser sind kuratierte Stationen; eine weitere begehbare Station benötigt eine bewusste Platzierung.
3. In `konfiguration/korrekturen.csv` gezielt ein Angebot korrigieren: `angebot_id,aktion,wert`. Aktionen: `ausblenden`, `thema`, `alter`, `zielgruppe`. Syntaxbeispiele stehen in [docs/pflege.md](docs/pflege.md).
4. `npm.cmd run pipeline` liest die Quellen neu ein, validiert und schreibt `daten/` und `public/abo/`. Bei Quellfehlern bleiben die letzten gültigen Angebote mit künftigen Terminen erhalten. Der Prozess meldet trotzdem einen Fehler, damit Probleme auffallen.
5. Den gespeicherten Lauf auf `/projekt/` prüfen und anschließend die Website mit `npm.cmd run export` neu bauen. Ein Import allein aktualisiert eine veröffentlichte statische Website nicht.

Neue Einrichtungen funktionieren ohne Code, **wenn ihr Quellformat bereits unterstützt wird**. Ein neues Quellformat benötigt einen Adapter. Unterstützt sind momentan `kufer-wp-api`, `kufer-html`, `experimenta-kalender`, `wp-sitemap-events`. Ein im ursprünglichen Plan erwähnter allgemeiner iCal-Adapter ist noch nicht vorhanden.

`.github/workflows/daten.yml` bereitet einen täglichen Lauf um 03:00 UTC und einen manuellen Start über GitHub Actions vor. Der Workflow ist hier lediglich angelegt; Repository-Einrichtung, Ausführung und automatisches erneutes Deployment sind nicht aktiviert worden. Ein Push mit dem Actions-Token löst nicht automatisch beliebige Folge-Workflows aus; die Hostinganbindung muss ausdrücklich eingerichtet werden.

## Architektur und Prüfung

```text
Konfigurations-CSVs → vier Quelladapter → vereinheitlichen + klassifizieren
  → Korrekturen + Validierung → angebote.json / bericht.json / meta.json
  → Kalenderdateien → Next.js-Seiten → optional statischer Export

Browser: 2D-Spiel, lokale Suche, Filter, Interessen-Kompass und Merkzettel
```

Der Interessen-Kompass der Erwachsenenansichten ist regelbasiert, kein generativer KI-Chat. Auch die Musteraufgabe ist ein einfaches Lernspiel und trainiert kein echtes KI-Modell. Die Übungen und die Karte sind selbst erstellte Spielinhalte, keine bestätigten Kurse oder Gebäudepläne der Einrichtungen. Es werden keine Interessen, Bewegungen oder Suchtexte an einen Server gesendet. Eine Auswertung realer Nutzungsinteressen, eine geschützte Redaktion und ein externer KI-Berater sind in dieser Fassung nicht implementiert.

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run export
```

Aktuell: **122 automatisierte Tests erfolgreich**, Produktions-Build und statischer Export erfolgreich. Browserprüfung umfasst alle zwölf Kapitelaufgaben in jeder der drei Altersstufen, das Finale am Ideenbaum, Bewegung, Kollisionen, Kamera/Vollbild, Rucksack, Elternbericht, lokalen Begleiter, Wünsche/Download und mobile Ansichten bei 320, 390 und 768 px Breite. Einzelheiten und Grenzen: [docs/pruefbericht.md](docs/pruefbericht.md).

## Datenschutz und Freigabestatus

Diese Fassung dient der **lokalen Vorführung**. Vor öffentlicher Veröffentlichung sind Betreibername, ladungsfähige Anschrift, Kontakt, Hostinganbieter und dessen Datenverarbeitung einschließlich Auftragsverarbeitung/Transfers und Löschfristen verbindlich zu ergänzen. Dazu kommen die Nutzungsrechte bzw. Vereinbarungen zur Datenübernahme und die Prüfung der verbleibenden rechtlichen Anforderungen.

Die Datenschutzseite erklärt auch technische Verbindungsdaten und behauptet keine vollständige Anonymität eines späteren Hostings. Die Art.-8-Altersgrenze wird nicht pauschal auf jede Nutzung angewendet. Sitzungsspeicher kann bei wiederhergestellten Browsersitzungen fortbestehen. Dauerhafte Merkzettel für Teens/Eltern sind nur nach bewusster Aktivierung vorgesehen. Kinder haben keine dauerhafte Speicheroption.

Die ursprüngliche Spezifikation bleibt als Plan erhalten; sie beschreibt teilweise noch nicht gebaute Zusatzfunktionen. Maßgeblich für den aktuellen Stand sind diese README und [docs/entscheidungen.md](docs/entscheidungen.md). Challenge-PDF und Vortragsunterlagen unter `aim/` sind per `.gitignore` vom Repository ausgeschlossen.

Die Challenge-README mit neun Seiten und die aim-Präsentation wurden lokal vollständig gelesen. Der später bereitgestellte Freigabelink ist durch die Umgebung nicht erreichbar; zusätzliche Unterlagen darin sind noch nicht bestätigt. Der [Regelabgleich](docs/regeln-abgleich.md) unterscheidet umgesetzte Anforderungen, Bonusfunktionen und offene Prüfpunkte. Die aktive Spielwelt verwendet acht eigens generierte, lokal ausgelieferte Pixelgrafiken für Figur, Häuser, Baum, Bank und Roboter. [Herkunft](docs/bildnachweise.md) und [vollständige Prompts](docs/pixel-prompts.json) sind dokumentiert. Die einzeln geprüften Links und Abrufgrenzen stehen im [Quellencheck](docs/quellen-check.md).

## Vorbereitung für die spätere Präsentation

Ein kurzer, überprüfbarer Vorführablauf liegt in [docs/demo-ablauf.md](docs/demo-ablauf.md). Präsentationsfolien sind entsprechend dem Wunsch für einen späteren Schritt zurückgestellt.

Aktuelle Erweiterung und Altersentscheidungen: [docs/spielwelt-v2.md](docs/spielwelt-v2.md). Die Challenge nennt keine festen Altersgrenzen der Spielstufen; diese sind unsere Gestaltung. Neue Spielfigur und integrierter Erzeugungsprompt: [docs/pixel-prompts-v2.json](docs/pixel-prompts-v2.json).
