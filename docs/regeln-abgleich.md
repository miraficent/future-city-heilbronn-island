# Abgleich der Anforderungen mit dem 2D-Prototyp

Stand: 13.11.2026. Grundlage sind die lokal vorhandene `aim/aim_Challenge_Learning_Guide_readme.pdf` mit neun Seiten und `aim/aim.pptx`. Beide wurden vollständig ausgelesen. Die PDF bezeichnet ihre Hinweise als Vorschläge; wir unterscheiden trotzdem Kernanforderungen und ausdrücklich als Bonus bezeichnete Funktionen.

Der später vom Nutzer übermittelte bwSync&Share-Link konnte weder über den Webabruf noch über einen lokalen Browser geöffnet werden. Der Browser meldete `ERR_NETWORK_ACCESS_DENIED`. Daher wird nicht behauptet, alle möglicherweise zusätzlich vorhandenen Dateien oder Bildfreigaben dieses Ordners geprüft zu haben.

Die später verlangte Einzelprüfung der erreichbaren Design-, Rechts- und Anbieterlinks ist in [docs/quellen-check.md](quellen-check.md) dokumentiert. Dort sind gelesene Inhalte, reine amtliche Suchauszüge und nicht abrufbare Volltexte getrennt aufgeführt. Die aktive Kinderansicht verwendet acht eigene generierte Pixelgrafiken, kürzere Texte und eine andere Schrift. Gebäude und Eingänge stehen auf gemeinsamen Reihen. Das hebt die älteren Beschreibungen einzelner Darstellungsdetails in diesem Dokument auf, nicht die Kernanforderungen.

| Anforderung | Fundstelle | Konkrete Umsetzung / Stand |
| --- | --- | --- |
| Angebote für Familien an einem Ort | README S. 1–2 | 61 sichtbare, echte Angebote aus dem gespeicherten Importbestand; 17 unsichere Themenzuordnungen zurückgehalten. |
| Kindgerecht und für Erwachsene ansprechend | S. 2–3, Paket A | Kinder: 2D-Lerninsel, große Bedienelemente, kurze Aufgaben. Teens: dunkle Themenansicht. Eltern/Fachkräfte: sachliche Suche und Filter. |
| Kreative Darstellung über eine einfache Liste hinaus | S. 2 und 4 | Steuerbare Figur, Gebäude, vier interaktive Aufgaben, Rucksack und Verbindung zu realen Aktivitäten. |
| Teamidee: 2D-Spiel, keine Emojis | Aktuelle Nutzeranweisung | SVG-Spielwelt mit eigener Bewegungslogik, Kollisionen, Touch-Wegsuche und Übungen. Emoji-Zeichen wurden aus Oberfläche und Themenkonfiguration entfernt; Regressionstest. |
| Fokus aim, experimenta, Haus der Familie und IPAI | S. 2, 8–9 | Vier Adapter und erkennbare Quellen. Die Spielhäuser sind fiktive Stationen, keine realen Gebäudepläne oder bestätigten Kooperationen. |
| Fokus KI, Coding, Gaming | S. 2 | Themenfilter, Empfehlungen und Spielaufgaben passen zu diesen Themen. Die Stromkreisaufgabe führt zum Bereich Coding/Robotik. |
| Automatisierbare Datenpflege | S. 2 und 4, Paket B | Pipeline, Bericht, Fehlerbehandlung, Kalenderexport; täglicher GitHub-Workflow vorbereitet. Remote-Ausführung und nachfolgendes Deployment sind noch nicht aktiviert. |
| Neue Themen und Quellen einfach ergänzen | S. 2 und 4 | UTF-8-CSV für Themen, Quellen und Korrekturen. Bestehendes Quellformat vorausgesetzt. Neue Spielflächen und neue Quellformate brauchen eine bewusste Erweiterung. |
| Übersicht und Suche | S. 2, 4–5, Pakete C/D | Übersicht der Spielhäuser sowie bildbasierte Themenauswahl; Eltern/Teens haben Volltext und Filter nach Thema, Alter, Datum, Format, Zielgruppe, Kosten und Einrichtung. |
| Jüngere Kinder mit wenig Texteingabe | S. 3 | Kein Freitext und kein Benutzerkonto im Spiel. Bebilderte Aufgaben und direkt öffnende Stationsknöpfe. Vorlesen auf Angebotsseiten nur mit lokaler deutscher Stimme. |
| Minderjährige melden sich nicht selbst an | S. 3 und 5 | Keine Buchung, Zahlung oder Registrierung in der App. Weitergabe an Erwachsene per QR-Link; externe Anmeldung ausdrücklich als Erwachsenenbereich. Dies ist keine technische Altersverifikation. |
| Datenschutz von Anfang an | S. 5–6, Paket E | Spielbewegungen, Fehlversuche und Interessen werden nicht übertragen. Erfolge und Kurs-IDs nur sessionStorage; Löschung in der Oberfläche. Dauerhafte Merkzettel nur freiwillig in den älteren Ansichten. |
| Gamification ohne Druck | S. 5 | Keine Zeitlimits, Leben, Ranglisten oder Login-Serien. Jede Station ist sofort zugänglich. Fehler können beliebig oft ohne Verlust korrigiert werden. |
| KI deutlich kennzeichnen, Anbieterbedingungen beachten | S. 5–6 | Kein externer KI-Chat aktiv. Die Musteraufgabe erklärt ihre Vereinfachung und trainiert kein echtes KI-Modell. |
| Zugänglichkeit | S. 3 und 6 | Tastatur, Touch und direkte Stationen ohne Motorikspiel; Fokus und native Dialoge; reduzierte Animation, kurze Beschriftungen, mobile Ansichten. Kein vollständiges WCAG-Audit behauptet. |
| Verifizierbare Entscheidungen und transparenter Code | S. 2 und 7 | Dokumentierte Quellen, getrennte Spielphysik/Ansicht/Aufgaben, Tests, Prüfbericht und Bildnachweise. |
| Interessen und Angebotslücken für Einrichtungen | Hintergrund S. 1, Bonus S. 6 | Eine echte Nutzeranalyse ist nicht aktiviert. Angebots-/Quellenzahlen sind keine Nutzungsstatistik. Das bleibt ein offener Bonus, keine erfundene Live-Funktion. |
| Orientierung / Beratung | Bonus S. 6 | Lokaler Interessen-Kompass für ältere Ansichten, themenbezogene Empfehlungen nach den Spielaufgaben; kein Chat. |
| Teilen und Mobilgeräte | Bonus S. 6 | QR, Web-Share, kopierbarer Link und mobile 2D-Ansicht. Lokale Links funktionieren nur auf diesem Computer. |
| Entfernung, Mehrsprachigkeit, Benachrichtigungen | Bonus S. 6–7 | Nicht umgesetzt. Kein Standortzugriff, keine E-Mail-Erhebung. |
| Bilder aus den bereitgestellten Quellen | Aktuelle Nutzeranweisung | Familie-Illustration und aim-Logo aus der bereitgestellten Präsentation lokal übernommen. Weitere Websitefotos und deren Nutzungserlaubnis sind gesondert zu prüfen. |

## Verbleibend vor öffentlicher Veröffentlichung

Betreiberangaben, konkrete Hosting-Datenverarbeitung, Rechtsgrundlagen/Empfänger/Fristen, gegebenenfalls Auftragsverarbeitung und Transfers, Daten-/Bildrechte und eventuell zusätzliche Regeln aus dem nicht erreichbaren Freigabeordner. Die Datenschutzerklärungen der vier Quellen werden nicht als Datenschutzerklärung dieser App übernommen.

## Nachvollziehbare Gestaltungsgrundlagen

- [NN/g: Children's UX](https://www.nngroup.com/articles/childrens-websites-usability-issues/): Forschung zu unterschiedlichen Altersgruppen und zur Verständlichkeit von Bedienung. Daraus leiten wir die getrennten Einstiege, einfache Rückmeldungen und direkte Stationszugänge ab; das ist eine Gestaltungsentscheidung, kein Nachweis eines bereits erfolgten Tests mit Kindern.
- [ICO Children's Code](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/): datensparsame Voreinstellungen und Interessen des Kindes als Gestaltungsreferenz, keine deutsche Rechtsgrundlage.
- [DSGVO](https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679), [§ 25 TDDDG](https://www.gesetze-im-internet.de/ttdsg/__25.html), [§ 5 DDG](https://www.gesetze-im-internet.de/ddg/__5.html) und [§ 31 UrhG](https://www.gesetze-im-internet.de/urhg/__31.html): Orientierung für Datenminimierung, Gerätespeicher, Betreiberangaben und begrenzte Nutzungsrechte. Die Art.-8-Altersgrenze wird auf ihren tatsächlichen Anwendungsbereich bezogen, nicht pauschal als Nutzungssperre behandelt.

Die weiteren im Challenge-PDF genannten Forschungs-/Designlinks sind Hinweise, keine zusätzlichen automatisch erfüllten Zertifizierungen. Nicht erreichbare Seiten und nicht ausgewertete Volltexte werden nicht als abschließend geprüft ausgegeben.

## Aktuelle Erweiterung

Zusammenhängende Story mit zwölf Aufgaben in drei Altersstufen, größere Karte, lokaler Spielbegleiter, freiwilliger Wunschzettel, nachvollziehbarer Elternbericht und offizielle Lernorte/Socials sind umgesetzt. Die Stufen 6–8, 9–11 und 12–17 sind keine vorgegebenen Challenge-Grenzen. Keine Interessenübertragung, keine Leistungsdiagnose, keine fingierte anonyme Gesamtauswertung. Quellen, genaue Funktionsgrenzen und Browsernachweise: [spielwelt-v2.md](spielwelt-v2.md). Zusätzliche Inhalte des nicht erreichbaren KIT-Ordners bleiben ungeprüft.
