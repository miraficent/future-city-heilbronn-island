# Heilbronn-Lernreise – Stand 14.11.2026

Vorschau: http://localhost:4173/kind/. Die bestehende Website bleibt der gemeinsame Lernführer; Kinder erhalten jetzt eine anklickbare Lernreise statt der bisherigen Laufwelt.

## Umgesetzt

- Neuer, hervorgehobener Kindereinstieg auf der Startseite.
- Elternhinweis vor dem Start, ohne Konto oder Identitätsabfrage. Keine pauschale gesetzliche Nutzungssperre unter 16 behauptet.
- Figurenbaukasten: drei Gesichtsformen, sechs Hauttöne, sechs Frisuren und Haarfarben, drei Oberteile, drei Unterteile, drei Schuhe, Kleidung-/Schuhfarben, Brille oder Kappe. Alle Kombinationen unabhängig von der Ausgangsvorlage.
- Vier zusammenpassende gemalte Ortsszenen. experimenta als fotoorientierte Illustration; aim, Haus der Familie und IPAI als Interpretationen recherchierter Architekturmerkmale. Keine maßgetreuen Rekonstruktionen behauptet.
- Geografische Übersicht auf bestehenden lokalen OpenStreetMap-Geometrien: dieselben Standortkoordinaten wie die bestehende Heilbronn-Karte, Norden oben, keine symmetrische Fantasiekarte.
- Vor jeder der 36 Aufgabenvarianten: eigener Einleitungssatz, drei Bildschritte und bewusster Start. Erklärungen bleiben wiederholbar.
- Bestehende Lernlogik und drei Aufgabenstufen erhalten. Drei fertige Aufgaben pro Einrichtung ergeben ein Raketenteil; nach zwölf Aufgaben ist der gemeinsame Abschluss verfügbar.
- Erwachsenenbereich mit Drei-Sekunden-Halten per Zeiger oder Tastatur. Schutz vor versehentlichem Wechsel, keine Altersverifikation.
- Kursdaten, Sammlung und Elternbericht bleiben angeschlossen. Im Kinderablauf keine direkten externen Links. Die Spielstufe liefert zunächst nur ein internes Beispielalter. Erst wenn Erwachsene das konkrete Alter bestätigen, erscheinen altersgenaue Kursempfehlungen; ein Kind mit gewählter Stufe 6–8 wird nicht automatisch als achtjährig behandelt. Diese Trennung ist zusätzlich im Browser geprüft.
- Neue Sitzungsdaten: cosmos.lernreise.v1 mit Avatar-Kennungen, Einstiegsstatus, Starthinweis und Toneinstellung. Vorhandene Aufgaben aus cosmos.abenteuer.v2 bleiben erhalten. Keine Fehlversuche, Bewegungsdaten, Namen oder Fotos.
- Größere Schrift, Vollbild, mobile Bildkarten und native Dialoge mit Fokusführung. Keine laufenden Erklärfiguren.

## Noch offen: Sprachproduktion

Die natürlichen festen deutschen Sprachaufnahmen sind **nicht vorhanden**. Es gibt hier keinen verbundenen Sprachgenerator; Pinokio war nicht erreichbar, kein geeigneter API-Zugang war verfügbar. Runway wurde als mögliche Integration gefunden und zur Einrichtung/Verbindung angeboten, ist aber nicht als verbunden bestätigt.

Der lokale Player lädt ausschließlich ausdrücklich im Manifest eingetragene Dateien. Ohne Datei bleibt „Anhören“ deaktiviert; es gibt keinen Browser-TTS-Fallback. Die Bildanleitungen sind vollständig nutzbar. In docs/heilbronn-sprechtexte.json stehen 43 vorbereitete Texte für Einstieg, vier Orte, alle Aufgabenvarianten, Erfolg und Abschluss. Qualitätsvorgabe: natürliche, freundliche erwachsene deutsche Stimme ohne übertriebene Kindersprache. Keine reale Person klonen.

Nach Produktion: Dateien unter public/medien/stimmen/ ablegen und die jeweiligen IDs in src/lib/sprachaufnahmen.json auf lokale Pfade abbilden. Erst nach vollständigem Anhören, Ausspracheprüfung (Heilbronn, aim, experimenta, IPAI), Lautstärkeabgleich und Browserprüfung aktivieren. Sprechertexte neu erzeugen: TypeScript nach .cache/sprechtexte kompilieren, anschließend node scripts/sprechtexte.mjs.

## Referenzen und Darstellungstreue

| Ort | Quelle | Verwendete Architekturmerkmale |
| --- | --- | --- |
| aim | [Städtischer Eintrag mit Gebäudefoto](https://www.heilbronn.de/kultur-freizeit/kultur-fuer-kinder-und-jugendliche/aim-akademie-fuer-innovative-bildung-und-management.html), [Bildungscampus](https://bildungscampus.hn/institutionen) | Heller Klinker, horizontale Fensterbänder, flache Dachform, gläserner Eingangsbereich. Vollständiger Fotovergleich aller Fassadendetails steht aus. |
| experimenta | Bereitgestelltes Foto 2-q==.jpg; [offizielle Architektur](https://www.experimenta.science/experimenta/architektur/) | Versetzte Baukörper, Dreiecksstruktur, Glasflächen, niedriger Pavillon und Hagenbucher-Kontrast. Umgebung und Wasserperspektive künstlerisch vereinfacht. |
| Haus der Familie | [Standorte](https://hdf-hn.de/ueber-uns/standorte/), [Bildergalerie](https://hdf-hn.de/bildergalerie/) | Heutiger Standort in der Josef-Schwarz-Schule, Holzfassade, Glasbänder, Balkone, geschützter Eingang. Keine frühere Adresse als heutiger Standort. |
| IPAI SPACES | [SIIN-Projektbeschreibung](https://siin.de/projekte/ipai-spaces/), [Besucherzentrum](https://ipai-foundation.ai/besucherzentrum/) | Bestehendes L-förmiges Gebäude mit Glasraster und begrünter Fassade. Kein zukünftiger kreisförmiger Campus. |

Die vier Bilddateien liegen in public/medien/heilbronn/{aim,experimenta,hdf,ipai}.png. Erzeugung: integriertes image_gen, Prompts und Referenzzuordnung in docs/heilbronn-bildprompts.json. Keine heruntergeladenen Originalfotos werden in der Website ausgeliefert.

Die Kartenkoordinaten werden unverändert aus dem bestehenden lokalen Kartenbestand verwendet. Kartengrundlage: © OpenStreetMap-Mitwirkende, ODbL 1.0. Der amtliche Stadtplan ist eine zusätzliche Vergleichsquelle, keine übernommene Kartenkachel. Die Übersicht zeigt einen Ausschnitt um die vier Lernorte, nicht jedes Gebäude Heilbronns.

## Validierung und Grenzen

138 automatisierte Tests in 19 Dateien: bisherige Daten-/Lernlogik plus Avatar-Validierung, zulässige Kombinationen, Migration alter Figuren, vier unveränderte Kartenpositionen und 36 konkrete Aufgabeneinführungen. Produktions-Export erfolgreich.

Browserprüfung erfolgreich: Einstieg, Gestalten und Beibehalten der Figur nach Neuladen, alle 36 Aufgabenvarianten mit Einführung, Erfolg und Finale sowie der Erwachsenenübergang und mobile Ansichten bei 320, 390 und 768 Pixeln. Kurzes Halten öffnet den Erwachsenenbereich nicht; vollständiges Halten per Tastatur öffnet ihn. Rücksetzen und globales Löschen sind geprüft. Zusätzlich 720 CSS-Pixel bei doppelter Pixeldichte, 71 Fachseiten mit HTTP 200, unbekanntes Angebot mit 404. Keine Browserausnahmen oder Drittanbieteranfragen in den geprüften Lernreise-Abläufen. Audio ist ausdrücklich nicht abgenommen. Ein echter begleiteter Nutzertest mit Kindern, Screenreader-Praxistest und vollständiges WCAG-Audit stehen aus.

Öffentliche Veröffentlichung bleibt von Betreiber-/Hostingangaben und Rechteprüfung abhängig. Zusätzliche Inhalte des nicht erreichbaren KIT-Ordners bleiben ungeprüft. Es wird keine vollständige rechtliche Freigabe oder exakte Gebäuderekonstruktion behauptet.
