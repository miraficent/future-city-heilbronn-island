# COSMOS-Entdecker

Ein funktionsfähiger Web-Prototyp für die aim-Challenge „Learning Guide“. Kinder spielen in einer **Spielwelt** (Figur wählen, durch eine kleine Stadt laufen, in vier Lernhäusern Aufgaben lösen und die COSMOS-Rakete bauen) und finden von dort zu echten Angeboten zu **KI, Coding und Gaming** von aim, experimenta, Haus der Familie und IPAI in Heilbronn. Die gesamte Oberfläche ist ohne Emojis gestaltet.

## Website öffnen

**Neu: Spielplugins für alle Besucher:** `/admin/` bietet Upload, Vorschau,
Veröffentlichung und Wiederherstellung pro Einrichtung. Dafür `COSMOS_ADMIN_PASSWORD`
in `.env.local` setzen und **`npm.cmd run dev`** oder **`npm.cmd run build` +
`npm.cmd start`** verwenden (http://localhost:3000/admin/).
Ein beschreibbares, dauerhaftes `COSMOS_PLUGIN_DIR` ist für Hosting erforderlich.
Format und Betrieb: [docs/spielplugins.md](docs/spielplugins.md).
Die statische Demo in `out/` (siehe unten) funktioniert weiterhin, zeigt aber immer
die eingebauten Spiele; Upload und Veröffentlichung gibt es nur mit Node.js-Server.

**Fertige lokale Webansicht: http://localhost:4173/**

**Direkt in die Spielwelt: http://localhost:4173/kind/** · **Heilbronn-Karte: http://localhost:4173/einrichtungen/**

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

- **Spielwelt (6–11 Jahre):** sechs Spielfiguren zur Wahl (verschiedene Hautfarben, Frisuren, Kopftuch, Brille, ein Roboter) und Altersauswahl 6–11 (6–8 „Entdecken“, 9–11 „Tüfteln“). Die Stadt entsteht automatisch aus der Liste der Lernhäuser (mehr Häuser → längere Stadt). Die Figur läuft **nur auf Wegen**: Wiese, Bäume, Teich, Häuser und Fahrbahn sind gesperrt, die Straße wird nur am Zebrastreifen überquert. Steuerung per Antippen (Wegsuche über das Wegenetz), Steuerkreuz oder Pfeiltasten/WASD. Die Straße beginnt im Tunnel und endet im Wendehammer; Autos halten vor dem Zebrastreifen, solange die Figur darauf steht. Jedes Lernhaus (Code-Labor/aim, Forscherhaus/experimenta, Spielewerkstatt/Haus der Familie, KI-Atelier/IPAI) hat drei Aufgaben je Altersstufe (Roboter programmieren, Stromkreis, Level bauen, Muster erkennen) und gibt ein Raketenteil; mit allen vier Teilen startet die Rakete und es gibt einen Entdecker-Pass. Bedienknöpfe nur mit Symbolen, beschriftete Mini-Karte mit großer Kartenansicht und Zoom, Pause, Vollbild, Vorlesen mit lokaler Stimme.
- **Echte Kurse im Spiel:** In jedem Haus erscheinen passende echte Kurse als Sammelkarten mit Alter, Datum, Ort und Preis – gefiltert nach Thema und gewähltem Alter. „Einpacken“ legt sie in den Rucksack; „Zeig's Mama oder Papa“ erzeugt lokal einen QR-Code bzw. Teilen-Link auf `/sammlung/` (nur Kurs-Kennungen). Kinder melden sich nie selbst an.
- **Teens (12–17):** eigener, dunkler Bereich ohne Kinderspiel: Themen, Suche und Filter, Sammlung, Zeitreise und Sternbild mit echten Angeboten.
- **Eltern/Fachkräfte:** Volltextsuche, Thema, Alter, Zeitraum, Einrichtung, Veranstaltungsart, Zielgruppe, kostenlose Angebote und gemeldete freie Plätze; Elternbericht aus der Spielsitzung.
- **Heilbronn-Karte (`/einrichtungen/`):** echte Karte aus OpenStreetMap-Daten (Neckar, Seen, Straßen, Bahn, Parks; einmalig vorab vereinfacht, lokal ausgeliefert) mit den vier Lernorten an ihren echten Adressen. Pins mit Ziehen/Zoomen und Entdecker-Tour; je Ort: Beschreibung, Adresse, Gehzeit vom Hauptbahnhof, Anzahl und Themen der aktuellen Angebote, nächste Termine mit Alter, Anmeldeweg in drei Schritten, Links zu Anmeldung/Route/Kontakt und woher die Daten kommen.
- **Details:** Termine, Ort, Preis, Verfügbarkeit, Link zum Original, lokaler ICS-Download, QR-Code und Web-Share mit Kopieralternative.
- **Datenschutz:** keine Konten, keine Analyseübertragung, kein externer KI-Chat, keine nachgeladenen Karten oder Angebotsbilder. Schriften, Kartendaten und QR-Code-Erzeugung sind lokal. Spielstand und Rucksack nur in der Browsersitzung; „Neu anfangen“ und ein Löschknopf auf der Datenschutzseite entfernen alles.

Der gespeicherte Datenbestand enthält derzeit 78 Angebote: 61 öffentlich sichtbar und 17 wegen unsicherer Themenzuordnung zurückgehalten. Nicht jede Quelle hat Angebote für jede Altersgruppe. Die Oberfläche erfindet bei fehlenden Treffern keine Kurse.

## Datenpflege ohne Codeänderung

1. `konfiguration/quellen.csv` in einer Tabellenkalkulation als UTF-8-CSV öffnen. Eine neue Einrichtung erhält eine Zeile mit eigener ID, Namen, Website, unterstütztem Adapter, Startadressen, Farbe und Standardadresse. Mehrere Startadressen mit `|` trennen.
2. `konfiguration/themen.csv` enthält Themenname, SVG-Symbolkennung, Farbe, Kindername und durch `|` getrennte Schlagwörter. Eine neue Themenzeile erzeugt einen zusätzlichen Themenfilter. Die Spielhäuser sind je Einrichtung in `konfiguration/checkpoints/<id>.json` beschrieben: Texte, Farbe, Gebäude und welche Lernmodule in welcher Reihenfolge erscheinen (siehe [docs/pflege.md](docs/pflege.md)).
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

Browser: Spielwelt, lokale Suche, Filter, Interessen-Kompass, Sammlung/Rucksack, Heilbronn-Karte
```

Der Interessen-Kompass der Erwachsenenansichten ist regelbasiert, kein generativer KI-Chat. Auch die Musteraufgabe ist ein einfaches Lernspiel und trainiert kein echtes KI-Modell. Die Übungen und die Karte sind selbst erstellte Spielinhalte, keine bestätigten Kurse oder Gebäudepläne der Einrichtungen. Es werden keine Interessen, Bewegungen oder Suchtexte an einen Server gesendet. Eine Auswertung realer Nutzungsinteressen, eine geschützte Redaktion und ein externer KI-Berater sind in dieser Fassung nicht implementiert.

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run export
```

Aktuell: **125 automatisierte Tests erfolgreich** (darunter: Figur verlässt nie das Wegenetz, Straße nur am Zebrastreifen, jede Haustür per Antippen erreichbar, Route mit echten Laufschritten ablaufbar, Autos halten am besetzten Zebrastreifen, größere Stadt bei mehr Häusern), Produktions-Build und statischer Export erfolgreich. Browserprüfung (Chrome, 1280 px und 390 px): Figurenwahl, Antippen eines Hauses, Weg über den Zebrastreifen, Tastatur am Fahrbahnrand, Aufgabe mit Belohnung, Raketenstart und Finale, Rucksack mit QR-Code, große Karte, Heilbronn-Karte, alle internen Links. Einzelheiten und Grenzen: [docs/pruefbericht.md](docs/pruefbericht.md).

## Datenschutz und Freigabestatus

Diese Fassung dient der **lokalen Vorführung**. Vor öffentlicher Veröffentlichung sind Betreibername, ladungsfähige Anschrift, Kontakt, Hostinganbieter und dessen Datenverarbeitung einschließlich Auftragsverarbeitung/Transfers und Löschfristen verbindlich zu ergänzen. Dazu kommen die Nutzungsrechte bzw. Vereinbarungen zur Datenübernahme und die Prüfung der verbleibenden rechtlichen Anforderungen.

Die Datenschutzseite erklärt auch technische Verbindungsdaten und behauptet keine vollständige Anonymität eines späteren Hostings. Die Art.-8-Altersgrenze wird nicht pauschal auf jede Nutzung angewendet. Sitzungsspeicher kann bei wiederhergestellten Browsersitzungen fortbestehen. Dauerhafte Sammlungen für Teens/Eltern sind nur nach bewusster Aktivierung vorgesehen. Kinder haben keine dauerhafte Speicheroption.

Die ursprüngliche Spezifikation bleibt als Plan erhalten; sie beschreibt teilweise noch nicht gebaute Zusatzfunktionen. Maßgeblich für den aktuellen Stand sind diese README und [docs/entscheidungen.md](docs/entscheidungen.md). Challenge-PDF und Vortragsunterlagen unter `aim/` sind per `.gitignore` vom Repository ausgeschlossen.

Die Challenge-README mit neun Seiten und die aim-Präsentation wurden lokal vollständig gelesen. Der KIT-Freigabeordner wurde abgerufen; er enthält genau diese beiden Dateien. Der [Regelabgleich](docs/regeln-abgleich.md) unterscheidet umgesetzte Anforderungen, Bonusfunktionen und offene Prüfpunkte. Die Spielwelt verwendet eigens generierte, lokal ausgelieferte Pixelgrafiken für Häuser, Baum, Bank und Roboter; die sechs Spielfiguren, Autos, Straßen und die Rakete sind Codegrafik. [Herkunft](docs/bildnachweise.md) und [vollständige Prompts](docs/pixel-prompts.json) sind dokumentiert. Die einzeln geprüften Links und Abrufgrenzen stehen im [Quellencheck](docs/quellen-check.md).

## Vorbereitung für die spätere Präsentation

Ein kurzer, überprüfbarer Vorführablauf liegt in [docs/demo-ablauf.md](docs/demo-ablauf.md). Präsentationsfolien sind entsprechend dem Wunsch für einen späteren Schritt zurückgestellt.

Aktuelle Erweiterung und Altersentscheidungen: [docs/spielwelt-v2.md](docs/spielwelt-v2.md). Die Challenge nennt keine festen Altersgrenzen der Spielstufen; diese sind unsere Gestaltung. Neue Spielfigur und integrierter Erzeugungsprompt: [docs/pixel-prompts-v2.json](docs/pixel-prompts-v2.json).
