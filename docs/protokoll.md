# Protokoll

Neueste Einträge oben. Jeder Eintrag: Datum, Entscheidungen, Zuständigkeiten, offene Fragen, nächste Schritte.

---

## 14.11.2026 (Nachmittag) – Design festgelegt

### Entscheidungen

1. **`DESIGN.md` ist das einheitliche Design** (Quelle: DESIGN_1.md). Es gilt für die ganze App.
   Abweichungen stehen oben in DESIGN.md unter „Projektentscheidungen“.
2. **Startseite:** zwei Karten „Für mich“ (Kinder/Teens) und „Für mein Kind“ (Eltern) auf Nachthimmel.
   Ersetzt die drei Kacheln vom Vormittag.
3. **Karte bleibt eine Stadtansicht von Heilbronn – ohne Meer und ohne Inseln.** Sonst gilt DESIGN.md
   (Farben, Schriften, Eule, Pins, weiße gestrichelte Wege, „Neuer Ort?“).
4. **Spiele sind in diesem Branch entfernt** – auch Robo-Coding, Orakel und Karten-Wischen.
5. **Helferin ist jetzt die Eule** aus DESIGN.md (statt Mia).

### Umgesetzt (Branch `feature/live-events`)

- Tokens, Schriften (Baloo 2, Nunito – lokal) und Lucide-Symbole für die ganze App; Arvins Seiten übernehmen das
  Design über die umgestellten Tokens.
- Bausteine in `src/components/ui/`, Styleguide unter `/styleguide/`.
- Neue Seiten: `/kinder/` (Karte), `/checkpoint/[id]/` (Einrichtung), `/mitmachen/` (neue Orte).
- Einrichtungsseiten zeigen **beide** Datenquellen: geprüfte Kurse (`angebote.json`) und Live-Events (`events.json`).
- Spiel-Code entfernt: `components/spiel/` (bis auf `pixel-grafik.tsx`, wird noch von Angebotskarten genutzt),
  Spiel-Bibliotheken in `src/lib/`, ihre Tests, `/kind/` leitet auf `/kinder/` weiter.

### Offen

- Teen-Bereich: bleibt er, und in welcher Form?
- Datenformat mit Cedric endgültig festlegen (siehe Vormittag).
- Restliche Spiel-Stylesheets (`spiel.css`, `pixel.css`, `abenteuer.css`, `spielwelt.css`) enthalten noch Klassen,
  die Angebotskarten und die Orte-Karte nutzen – beim nächsten Aufräumen in `ui.css` überführen.

---

## 14.11.2026 (Vormittag)

### Ausgangslage

- **Arvin** hat die Hauptanwendung gebaut (Next.js): Datenimport mit 78 Angeboten (61 öffentlich) von aim,
  experimenta, Haus der Familie und IPAI, Eltern-Suche mit Filtern, Teen-Bereich, echte Heilbronn-Karte, Spielwelt.
- **Mira** hat parallel einen Prototyp gebaut (Vue): Alters-Sicherheitsregeln, Kinder-Karte, Einrichtungsseiten,
  Eltern-Seite. Daraus wurde im Branch `zusammen` übernommen:
  - Regel: Kinder und Teens sehen nur Angebote mit bekanntem Alter (Eltern-Vortrag zu Social Media war vorher bei Kindern sichtbar).
  - Startseite nur mit Begrüßung und drei Kacheln; alle langen Texte in den Eltern-Bereich verschoben.
  - Kinder-Karte „Mini-Heilbronn“ (`/kinder/`) mit Gebäuden der Einrichtungen.
- Im Branch `feature/live-events`: Import von Live-Veranstaltungen (COSMOS-iCal, experimenta, aim) mit optionaler
  KI für Kindertexte, Galerie auf den Einrichtungsseiten, Prüfliste `/pruefen/`.
- **Cedric** hat im Branch `cedric` an Spiel-Plugins pro Einrichtung über ein Admin-Portal gearbeitet.

### Entscheidungen

1. **Einheitliches Design.** Wir brauchen *ein* Design für die ganze App. Bis zur Wahl: keine neuen Stile (siehe [regeln.md](regeln.md#1-einheitliches-design)).
2. **Eltern-Bereich bleibt** – mit Suche, Filtern und allen Hintergrundtexten.
3. **Karten-Dashboard bleibt** – die Gebäude sind Links zu den Einrichtungsseiten.
4. **Spielstart-Seite („Let's play“) fällt weg.** Kinder kommen direkt zur Karte.
5. **Alle Spiele fallen weg** (Laufwelt, Robo-Coding, Orakel/Karten wischen, Lernhaus-Aufgaben, Rakete).
6. **Arbeitsteilung:** **Cedric liefert die Daten.** Das restliche Team kümmert sich um die **Darstellung**.

### Zuständigkeiten

| Wer | Aufgabe |
|---|---|
| Cedric | Daten: Import, Pflege, Prüfung; entscheidet, welcher Datenweg bleibt (`pipeline/` + `angebote.json` oder `scripts/events/` + `events.json` oder beide zusammen) |
| Team Darstellung | Einheitliches Design, Karten-Dashboard, Einrichtungsseiten, Eltern-Bereich |
| alle | Regeln einhalten, Entscheidungen hier eintragen |

### Offene Frage: Wie stellen wir die Daten besser dar?

Die Daten sind vorhanden. Gesucht ist die beste Darstellung – **für Kinder ohne Lesen**, **für Eltern schnell**.
Ideen zum Besprechen (noch nichts entschieden):

**Karten-Dashboard (Kinder)**
- Jedes Gebäude zeigt auf einen Blick: Anzahl Angebote, „Heute!“, passende Themen als Symbole.
- Leiste „Diese Woche“ unter der Karte: sieben Tage, unter jedem Tag kleine Symbole der Angebote.
- Altersauswahl einmal am Anfang (große Zahlen), danach zeigt die Karte nur Passendes.

**Einrichtungsseite**
- Kategorien als große runde Symbole, darunter Karten zum Wischen (Bild, kurzer Titel, Tag, Alter, gratis).
- Jede Karte vorlesbar, ein großer Knopf „Da will ich hin!“.
- Wenn nichts da ist: freundlich auf ein anderes Haus verweisen.

**Eltern-Bereich**
- Oben: „Das möchte Ihr Kind besuchen“ mit Anmeldelink.
- Liste oder Kalenderansicht umschaltbar; Filter bleiben.
- Kennzeichnung der Datenqualität: „Alter unklar“, „Beispiel“, „ausgebucht“.

**Fragen an das Team**
- Welches der zwei Designs wird die Grundlage (oder ein neues gemeinsames)?
- Was zeigen wir Kindern zuerst: Orte (Karte) oder Themen (Kategorien)?
- Bleibt der Teen-Bereich, und wenn ja, wie sieht er im einheitlichen Design aus?
- In welchem Format liefert Cedric die Daten endgültig, damit die Darstellung sich darauf verlassen kann?

### Nächste Schritte

- [ ] Design-Grundlage wählen und in einer Datei als Tokens festlegen.
- [ ] Spielstart-Seite und Spiele aus der Navigation nehmen, danach den Code entfernen.
- [ ] Mit Cedric das Datenformat festlegen (eine Datei, feste Felder).
- [ ] Darstellungs-Ideen oben auswählen und als Skizze abstimmen.
- [ ] `docs/demo-ablauf.md` an den neuen Ablauf anpassen.
- [ ] Branches zusammenführen (`zusammen`, `feature/live-events`, `cedric`) und auf GitHub pushen – erst nach Absprache.

## 15.11.2026 – Themen-Filter der Live-Events

Problem: In der experimenta-Themenwelt zeigten „Physik“ und „Sterne“ fast alle Angebote. Ursache war die
Stichwort-Erkennung (`src/lib/mobilizon.ts`): „experiment“ steckt in „experimenta“, „licht“ im Science-Dome-Hinweis
(„Lichteffekte“), „science dome“ ist nur der Ort.

Entscheidungen:
- Themen werden nur aus dem Inhalt erkannt: ohne „Ort: …“, Hinweis-Sätze, Links und Einrichtungsnamen (`themenText()`).
- Stichwörter zählen nur am Wortanfang („Sternenhimmel“ ja, „meistern“ nein). Wortenden in Zusammensetzungen
  („Weihnachtsstern“) zählen nicht – fehlt ein Thema, ein eigenes Stichwort in `src/data/categories.json` ergänzen.
- „science dome“ ist kein Stichwort für „Sterne & Weltall“ mehr (Ort, kein Thema).

## 15.11.2026 – Eule & Owl: Kindertexte als Mobilizon-Kommentare

Entscheidungen (Details: `docs/superpowers/specs/2026-11-15-eule-owl-kommentare-design.md`):
- Der Mobilizon-Importer schreibt pro Event einmal einen Kommentar der Konten `eule` (Deutsch) und `owl` (Englisch):
  Zeile 1 Kindertitel, Zeile 2 ein Satz, was das Kind erwartet. Korrektur von Hand in Mobilizon.
- Der Importer überschreibt nie einen vorhandenen Kommentar. Neuer Satz → Kommentar löschen.
- Das Frontend nimmt nur Kommentare lokaler Konten; fehlt einer, gilt der bisherige gebaute Satz.
- Der ganze Kinderbereich wird zweisprachig (DE | EN), gleiche Spracheinstellung wie im Eltern-Bereich.
- Umgesetzt (Branch `feature/eule-owl`): `/pruefen/` zeigt die Eule-/Owl-Texte zum Gegenlesen. Die Karten tragen beide
  Sprachen, `kartenText(karte, sprache)` wählt Titel und Satz – `kinderKarten()` bekommt keinen Sprach-Parameter.
  Englische Themen-Namen stehen in `src/components/kinder/texte.ts` (Kategorien in `src/data/` bleiben deutsch).
- **Wichtig vor dem Einsatz:** Die Konten `eule` und `owl` müssen auf unserer Mobilizon-Instanz angelegt sein, bevor
  Kinder die Seite nutzen. Solange ein Name frei ist, kann sich jeder mit einem Konto auf der Instanz diesen Namen
  als Identität anlegen, und sein Kommentar würde Kindern vorgelesen. Registrierung auf der Instanz schließen oder
  moderieren.
