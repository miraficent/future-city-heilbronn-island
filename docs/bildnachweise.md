# Bildherkunft und Nutzungsstand

Stand: 13.11.2026. Der Nutzer hat die Nutzung des bereitgestellten Challenge-Materials für den Prototyp verlangt. Es wurde kein komplettes fremdes Webangebot kopiert. Die lokale Demo lädt keine Bilder von Anbieter-Websites nach.

## Aktive Pixelwelt

Die acht folgenden PNG-Dateien wurden mit dem eingebauten `image_gen`-Werkzeug eigens für dieses Projekt erzeugt, visuell geprüft und unverändert in den Workspace kopiert. Es wurden keine echten Kinderbilder oder Fotos von Einrichtungen als Eingabe verwendet. Die Figuren und Gebäude sind erfunden. Jeder Prompt verlangt einen einheitlichen Farbsatz, transparente Hintergründe, verständliche Silhouetten und keine Logos oder Schrift. Die [vollständigen Prompts](pixel-prompts.json) sind gespeichert.

| Datei unter `public/medien/pixel/` | Verwendung |
| --- | --- |
| `code-labor.png` | Code-Haus, Direktzugang, thematische Kursillustration |
| `forscherhaus.png` | Forscherhaus und Direktzugang |
| `spielewerkstatt.png` | Spielewerkstatt, Direktzugang, thematische Kursillustration |
| `ki-atelier.png` | KI-Atelier, Direktzugang, thematische Kursillustration |
| `baum.png` | Bäume in der Spielwelt |
| `bank.png` | Sitzbank in der Spielwelt |
| `kind-v2.png` | Überarbeitete Spielfigur, Spielerportrait, Level-Aufgabe; Original `kind.png` bleibt erhalten |
| `roboter.png` | Roboter-Aufgabe und Rückmeldungen |

Die Pixeldateien werden ausschließlich von der Website selbst geladen. Während der Nutzung wird kein Bild generiert. Für gleichmäßige Objektgrößen stellt die SVG-Ansicht den sichtbaren Bildausschnitt dar; die Originaldateien wurden nicht nachbearbeitet. Ausschnitte stehen in `src/lib/pixel-grafiken.json`. Straßen, Wasser, Markierungen und wissenschaftliche Schemata bleiben Codegrafik, damit Geometrie und Lerninhalte korrekt steuerbar sind.

## Frühere beziehungsweise ergänzende Materialien

Die Familie-Illustration der vorherigen Kinderansicht wurde durch die eigenen Pixelgrafiken ersetzt. Ihre vorhandene Originaldatei bleibt als früheres Material erhalten und wird in der aktiven Spielansicht nicht geladen. Das aim-Logo bleibt ein Quellenhinweis auf der Projektseite. Die folgende Tabelle dokumentiert diese Herkunft, keine allgemeine Veröffentlichungslizenz.

| Lokale Datei | Herkunft | Verwendung | Nutzungsstand |
| --- | --- | --- | --- |
| `public/medien/challenge/gemeinsam-lernen.png` | Vom Nutzer bereitgestellte `aim/aim.pptx`, eingebettete Datei `ppt/media/image1.png` | Frühere Kinderansicht, jetzt abgelöst | Urheber/Fotograf im Bild nicht genannt; keine darüber hinausgehende Veröffentlichungslizenz dokumentiert. |
| `public/medien/challenge/aim-logo.png` | Dieselbe Präsentation, `ppt/media/image7.png` | Projektseite als Quellenbezug der Challenge | Unverändert, keine Partnerschaft behauptet. Öffentliche Verwendung vor Freigabe klären. |
| Straßen, Steuerung, Puzzle-Schemata und Bedien-Symbole | Im Projekt erstellte SVG-/CSS-Grafik | Spiel und gesamte Oberfläche | Eigene Codegrafik; keine Emojis. |
| Lokale Schriftdateien | Google-Fonts-Projekte, zuvor lokal verfügbarer Fontbestand | Gesamte Anwendung | SIL Open Font License 1.1; Urheberhinweise und Lizenz unter `public/fonts/OFL.txt`. |

Die bereitgestellte Präsentation und das Challenge-PDF werden nicht vollständig im statischen Webexport ausgeliefert. Der Herkunftshinweis ist kein Ersatz für eine erforderliche Nutzungsfreigabe.

## Geprüfte Bedingungen für weitere Websitebilder

- [experimenta Presse-Downloads](https://www.experimenta.science/experimenta/presse/downloads/): Die dort beschriebene Nutzung bezieht sich auf Berichterstattung über experimenta und verlangt den jeweiligen Bildnachweis. Daraus folgt keine pauschale Freigabe zur Nutzung aller Fotos als Spielflächen oder Dekoration.
- [HdF Impressum](https://hdf-hn.de/impressum/): Der Betreiber verweist auf Urheberrechte und Zustimmung bei Verwertungen außerhalb gesetzlicher Grenzen. Mehrere Bilder sind Stockfotos mit gesonderten Urhebernachweisen. Eine Namensnennung allein ersetzt die passende Lizenz nicht.
- Für zusätzliche aim-/IPAI-Websitebilder ist in dieser Sitzung keine allgemeine Übernahmefreigabe nachgewiesen worden. Die Datenschutzseite eines Anbieters ist keine Bildlizenz.

Vor öffentlicher Veröffentlichung für jedes zusätzliche Bild Quelle, Urheber, erlaubten Zweck, Bearbeitungsrecht, notwendige Nennung und gegebenenfalls Einwilligungen abgebildeter Personen festhalten. Besonders Bilder realer Kinder nicht allein wegen ihrer öffentlichen Sichtbarkeit weiterverwenden. Der Freigabeordner selbst war aus dieser Umgebung nicht abrufbar; mögliche weitere Bildfreigaben darin stehen zur Prüfung aus.

Die neue Figur wurde mit dem integrierten Bildgenerator als transparente Originalgrafik erstellt und in `public/medien/pixel/kind-v2.png` gespeichert. Der Prompt steht in `docs/pixel-prompts-v2.json`. Gesicht und Farbflächen wurden vereinfacht; keine echte Person diente als Vorlage.
