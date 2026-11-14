# Angebote und Themen pflegen

Die Tabellen sind UTF-8-CSV-Dateien mit Komma als Spaltentrenner. Zellen mit einem Komma müssen in Anführungszeichen stehen. Tabellenkalkulationen übernehmen das beim passenden Exportformat. Vorhandene IDs nicht umbenennen, damit Merkzettel und Links gültig bleiben.

## Ein Thema ergänzen

In `konfiguration/themen.csv` eine neue Zeile ergänzen. Beispiel:

```csv
id,name,kindername,symbol,farbe,schlagwoerter
forschen,Forschen,Forscher-Planet,leaf,#5DBB63,Experiment|Forschen|Naturwissenschaft
```

Die bestehende Kopfzeile behalten und die Beispielzeile darunter ergänzen, nicht die ganze Datei ersetzen. `symbol` ist eine SVG-Kennung wie `robot`, `code`, `controller`, `tools`, `leaf` oder `compass`, kein Emoji. Die Themen erscheinen automatisch in Suche und Kursauswahl. Interessen-Bildkarten und die vier Spielaufgaben sind kuratiert; neue Aufgaben und begehbare Häuser werden bei Bedarf bewusst ergänzt. Eine neue Quellenzeile bindet Daten ein, erzeugt aber kein zusätzliches Spielgebäude.

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

## Live-Veranstaltungen (Mobilizon)

Die Kinderseiten zeigen nur Veranstaltungen aus Mobilizon. Sie erscheinen ohne Neubau beim nächsten Besuch (spätestens nach 10 Minuten).

- **Einrichtung:** Veranstaltung in der Gruppe der Einrichtung anlegen (Gruppenname `aim`, `experimenta`, `hdf`, `ipai`).
- **Für Kinder sichtbar:** Alter in den Text schreiben („ab 8 Jahren“, „8 bis 12 Jahre“, „Kl. 3-4“) oder einen Alters-Tag setzen („6-10 Jahre“). Ohne Alter steht die Veranstaltung nur unter `/pruefen/`.
- **Standardbild:** Das Bild der Einrichtung als Avatar oder Banner der Gruppe hochladen (unverändert, nicht zugeschnitten). Veranstaltungen, die dieses Bild als Titelbild haben, erscheinen als Farbkachel. Ein eigenes Titelbild wird als Foto gezeigt.
- **Kurse:** Die App zeigt keine Kurse mehr, `daten/angebote.json` ist leer (die früheren Demo-Kurse liegen nur noch als Testdaten in `tests/fixtures/`). `npm run pipeline` würde die Datei wieder füllen.

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
