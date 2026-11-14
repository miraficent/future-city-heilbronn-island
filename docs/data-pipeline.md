# Veranstaltungen: Wie kommen sie in die App?

Diese Anleitung ist für alle im Team – auch ohne Programmierkenntnisse.

## Kurz erklärt

Jeden Morgen um 6 Uhr (Winterzeit) holt ein Programm die Veranstaltungen von den Webseiten der Einrichtungen,
ordnet sie Themen und Altersgruppen zu und schreibt kurze Texte für Kinder. Das Ergebnis steht in
`src/data/events.json`. Die App liest nur diese Datei.

```
Webseiten der Einrichtungen  →  abrufen  →  einordnen (KI oder Stichwörter)  →  events.json  →  App
```

## Eine neue Quelle hinzufügen (eine Zeile)

Datei `scripts/events/sources.json` öffnen und eine Zeile ergänzen, zum Beispiel für einen Kalender (iCal):

```json
{ "institutionId": "stadtbibliothek", "type": "ical", "url": "https://beispiel.de/kalender.ics", "name": "Stadtbibliothek" },
```

- `institutionId`: kurzer Name der Einrichtung (klein, ohne Leerzeichen). `"auto"` = aus dem Ort erkennen.
- `type`: `"ical"` für Kalender-Dateien (das Beste – fragen Sie die Einrichtung danach!) oder `"html"`
  für Webseiten. Für `"html"` braucht es einen passenden `parser` (`"experimenta"` oder `"kufer"`);
  eine Webseite mit anderem Aufbau braucht einmalig etwas Programmierarbeit.
- `name`: wird im Protokoll angezeigt.

Danach in GitHub unter **Actions → Update events → Run workflow** starten oder bis morgen warten.

## „Zur Prüfung“ (needsReview) – was bedeutet das?

Eine Veranstaltung wird zur Prüfung markiert, wenn die Einordnung unsicher ist:

- die KI war sich nicht sicher genug (unter 70 %), oder ihre Antwort war unvollständig,
- es gab keine KI (kein Schlüssel hinterlegt) – dann wird nur über Stichwörter zugeordnet,
- der Kindertext ist zu lang.

**Kinder sehen diese Veranstaltungen nicht.** Eltern sehen weiterhin alles.
Die Liste steht in der App unter **/pruefen/**. Dort sieht man Titel, Einrichtung, erkanntes Alter und den Link zur Originalseite.

## Was die KI bekommt – und was nicht

- Sie bekommt **nur den öffentlichen Text** der Veranstaltung (Titel, Ort, Preis, Beschreibung von der Webseite).
- Sie bekommt **keine Daten von Nutzerinnen und Nutzern** – keine Kinder, keine Suchen, keine Wünsche.
- Sie soll **nichts erfinden**: kein Alter, wenn im Text keines steht. Fehlt etwas, wird zur Prüfung markiert.
- Jede Veranstaltung wird **nur einmal** an die KI geschickt. Neue Termine derselben Veranstaltung
  nutzen das gespeicherte Ergebnis (`scripts/events/cache.json`).

## Den KI-Schlüssel hinterlegen

In GitHub: **Settings → Secrets and variables → Actions → New repository secret**, Name `ANTHROPIC_API_KEY`.
Lokal: Datei `.env` anlegen (Vorlage: `.env.example`). Die Datei `.env` wird nie hochgeladen.
Ohne Schlüssel läuft alles weiter – nur eben mit Stichwörtern und Prüf-Markierung.

## Befehle (für Entwicklerinnen und Entwickler)

| Befehl | Was passiert |
|---|---|
| `npm run events:update` | alle Quellen abrufen, einordnen, `events.json` schreiben |
| `npm run events:demo` | wie oben, plus ~25 Beispiel-Events relativ zu heute (für Vorführungen) |
| `npm run events:seed` | nur Beispiel-Events, ohne Internet |

Fällt eine Quelle aus, bleiben ihre letzten Veranstaltungen erhalten. Vergangene Termine fallen automatisch weg.

## Bilder

Die Pipeline speichert die Bildadresse der Quelle (`image`), die App lädt diese Bilder aber **nicht** nach:
Jedes Nachladen von fremden Servern würde dort die IP-Adresse der Familie hinterlassen. Stattdessen zeigt die App
ein Bild aus Kategorie-Farbe und Symbol. Für eigene Bilder: Rechte klären, Bild nach `public/` legen.

## Respektvoller Abruf

Das Programm meldet sich mit eigenem Namen (`HeilbronnIslandBot`), stellt höchstens eine Anfrage pro Sekunde
und hält sich an die `robots.txt` jeder Webseite.
