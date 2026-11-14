# Prüfbericht zum lokalen Prototyp

Stand: 13.11.2026. Geprüft unter Windows mit Node.js 24.14.0, Next.js 16.4.6 und Google Chrome 157. Die fertige Webansicht wird lokal unter http://localhost:4173 bereitgestellt.

## Erfolgreich geprüft

| Prüfung | Ergebnis |
| --- | --- |
| `npm.cmd test` | 16 Testdateien, 122 Tests erfolgreich. Zusätzlich zur Datenpipeline: Spielbewegung, Kollisionen, Touch-Wege, Roboterprogramm, gültige Spielstände, echte Kursempfehlungen und Emoji-Freiheit. |
| TypeScript | Keine Typfehler; zusätzlich in den Produktions-Build integriert. |
| `npm.cmd run build` | Next-Produktions-Build erfolgreich; 72 generierte Seiten einschließlich Infrastruktur-Routen. |
| `npm.cmd run export` | Statischer Export erfolgreich, einschließlich HTML, Browsercode, lokalen Schriften und Kalendern. |
| `ROH_CACHE=1 npm.cmd run pipeline` | Verarbeitung aller vier gespeicherten Quellen erfolgreich: 78 Angebote, 61 sichtbar, 17 zurückgehalten, 10 Themen-/Zielgruppen-Kalender. In PowerShell wurde die Variable vor dem Befehl über `$env:ROH_CACHE` gesetzt und danach entfernt. |
| HTTP-Status der fertigen Vorschau | Alle 69 fachlichen Seiten einschließlich sämtlicher 61 Angebotsdetailseiten antworten mit 200. Unbekannter Angebotslink antwortet mit 404. |
| Browser | Zentrale Abläufe sowohl auf dem Entwicklungsserver als auch auf der fertigen statischen Vorschau erfolgreich. Keine ungefangenen Browserausnahmen. Auch das neue Pixel-Layout und die aufklappbaren Kurskarten wurden durchgespielt. |
| Drittanfragen | Bei den geprüften Abläufen keine von der Website ausgelösten HTTP-Anfragen an Drittanbieter; keine Anwendungscookies. Bewusst geöffnete Originalseiten/Teilen-Zielprogramme sind davon ausgenommen. |
| Handyansicht | Spiel und Aufgabendialog bei 320, 390 und 768 Pixeln ohne horizontalen Überlauf. Alle Hauptseiten weiterhin mobil geprüft. Zusätzlich Desktopprüfung bei 1440 × 1100. |
| Änderungsprüfung | `git -c core.whitespace=cr-at-eol diff --check` erfolgreich; ICS-Dateien verwenden die erforderlichen CRLF-Zeilenenden. |

## Im Browser durchgespielte Abläufe

- Startseite öffnen und die Einstiege aufrufen.
- Kinderbereich ohne Freitext: Figur mit Pfeiltasten bewegen, Pause einschalten, Gebäude antippen und den Touch-Weg und das automatische Betreten des Hauses abwarten.
- Code-Aufgabe öffnen; in der Stufe 6–8 dreimal rechts und zweimal hoch programmieren, den Roboter tatsächlich zur Fahne laufen lassen und den gespeicherten Aufgabenerfolg prüfen.
- Stromkreis mit falschem und richtigem Material ausprobieren; Spiellevel mit falsch und passend platzierter Sprunghilfe testen; Muster mit falscher und richtiger Auswahl lösen. Hilfreiche Rückmeldungen und alle vier Erfolge prüfen.
- Fokus im Dialog und Schließen per Escape prüfen. Alle Stationen auch direkt ohne Bewegungssteuerung öffnen.
- Einen echten Kurs merken, Rucksack öffnen, zur echten Angebotsseite navigieren und zur Spielwelt zurückkehren. Sitzungs-Spielstand und Rucksack bleiben erhalten; keine dauerhaften Kinderdaten.
- Im Elternbereich nach „Scratch“ suchen, eine Suche ohne Treffer auslösen und alle Angebote wiederherstellen.
- Dauerhaftes Speichern des Eltern-Merkzettels ausdrücklich aktivieren und wieder widerrufen; lokale Speicherwerte entsprechend vorhanden/entfernt.
- Zeitreise im Elternbereich und Sternbild im Teenbereich öffnen.
- Eine Angebotsseite im Kindermodus öffnen, QR-Code lokal erzeugen und den enthaltenen Angebotslink prüfen.
- ICS-Download auslösen und den erzeugten Inhalt auf Kalendereintrag prüfen; weitergehendes ICS-Escaping und Zeilenfaltung sind automatisiert getestet.
- Auf der Datenschutzseite alle COSMOS-Schlüssel in localStorage und sessionStorage löschen.
- Alle Hauptansichten und die ausgelieferten Quelldaten auf Emoji-Zeichen prüfen; Marken- und Copyright-Kennzeichnungen bleiben erhalten. Eigenständige SVG-Symbole ersetzen Emojis.
- Acht eigene Pixelgrafiken werden lokal ausgeliefert. Die sieben Hauptmotive werden beim Einstieg geladen, der Roboter zusätzlich in der Aufgabe. Gebäude und Eingänge stehen exakt in zwei Reihen. Der Einstieg bleibt kurz; kein Netzaufruf für Bildgenerierung während der Nutzung.

## Konkret behobene Fehler

- Abgelaufene Angebote wurden beim unbegrenzten Zeitraum durch `Infinity <= Infinity` weitergelassen. Der Filter verlangt jetzt einen tatsächlich noch relevanten Termin.
- „Nur freie Plätze“ ließ unbekannte Verfügbarkeit zu. Es werden jetzt ausschließlich `frei` und `wenige` akzeptiert.
- Altersbereiche mit „bis“ fehlten. Konkrete Angaben aus der Beschreibung erhalten Vorrang vor breiten Kategorie-Tags. Beispielsweise ist ein HdF-Workshop tatsächlich für 4–7 statt pauschal ab 3 Jahren.
- Nicht vorhandene Seiten hinter den drei Einstiegen und dem Datenschutzlink wurden ergänzt.
- Google-Font-Downloads während des Builds wurden durch mitgelieferte WOFF2-Dateien mit Lizenz ersetzt.
- Der bisherige tsx-Einstieg scheiterte unter den eingeschränkten Windows-Rechten an einem Betriebssystem-Profilzugriff. Der Pipeline-Einstieg kompiliert nun gezielt per TypeScript und startet das Ergebnis mit Node.js.

## Grenzen dieser Prüfung

Ein neuer Live-Import war nicht möglich: Ausgehende Verbindungen aus dem lokalen Ausführungsprozess wurden mit `EACCES` blockiert. Es wurden die bereits vorhandenen echten Rohdaten verarbeitet; der Bericht kennzeichnet dies als Cache-Verarbeitung. Keine aktuelle Erreichbarkeit oder Buchbarkeit sämtlicher Originalangebote wird daraus abgeleitet.

Auch der nachgereichte bwSync&Share-Freigabelink ist nicht abrufbar. Ein zusätzlicher Browserversuch zeigte `ERR_NETWORK_ACCESS_DENIED`. Lokal vollständig geprüft wurden die neunseitige Challenge-README und die aim-Präsentation. Eventuell weitere Regeln oder Bildfreigaben im Cloud-Ordner sind nicht bestätigt.

Vorlesen setzt eine lokale deutsche Stimme voraus; die tatsächliche Audioausgabe konnte in der automatisierten Browserumgebung nicht bestätigt werden. Browser-System-Teilen und die Zwischenablage hängen von Browserrechten und Zielprogrammen ab; der QR-Code und der sichtbare kopierbare Link wurden geprüft. Andere Browser, echte mobile Geräte, Screenreader-Nutzung und ein vollständiges WCAG-Audit stehen noch aus.

Kein öffentlicher Hostingbetrieb, keine externen KI-Aufrufe, keine realen Nutzungsanalysen und keine laufende GitHub-Automation wurden eingerichtet. Betreiberangaben, Hosting-Datenschutzprüfung und Datenübernahmevereinbarungen bleiben Voraussetzungen für eine öffentliche Freigabe.

## Erweiterte Spielwelt, aktueller Prüfstand

Alle 36 Kapitelvarianten wurden im Browser über die tatsächlichen Bedienelemente gelöst: zwölf je Stufe für 8, 10 und 14 Jahre. Geprüft wurden auch Fehlversuche, finale Wegsuche zum Ideenbaum, lokaler Pico-Begleiter, Wünsche, Elternbericht mit Begründungen und JSON-Download. Dabei keine ungefangenen Browserfehler und keine Drittanfragen. Die mobilen Hauptansichten wurden erneut bei 320, 390 und 768 px ohne Überlauf geprüft. Statische Vorschau: /einrichtungen/ neu, 72 Build-Seiten. Details in spielwelt-v2.md. Die älteren Prüfungen zu QR, ICS und Katalog bleiben als zuvor durchgeführte Kontrollen dokumentiert; ein neuer Live-Datenimport wurde nicht vorgenommen.
