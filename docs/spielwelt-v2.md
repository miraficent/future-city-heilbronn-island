# Die Stadt der Ideen

Die bestehende gemeinsame Lernführer-Website wurde erweitert, keine Einrichtungshomepage ersetzt. Einstieg: http://localhost:4173/kind/. Teens starten über http://localhost:4173/teen/ mit Stufe „Weiterdenken“. Ein bereits gespeicherter höherer Alterswert bleibt erhalten.

## Umfang

- Zusammenhängende Karte mit 2400 × 1700 Welteinheiten: mehr als fünfmal die bisherige Kartenfläche.
- Vier Kapitel mit je drei interaktiven Aufgaben. Alle Kapitel sind direkt zugänglich; es gibt keine Wartezeiten, Leben, Ranglisten oder Spielserien.
- Rahmenhandlung: Lieferwege wiederherstellen, Licht einschalten, einen Parcours bauen und Pico beim Prüfen helfen. Jedes abgeschlossene Kapitel gibt dem Ideenbaum ein Licht. Danach führt ein begehbarer Weg zum Abschluss am Baum.
- Tastatur/WASD, Touch-Ziele, Wegsuche, Kamera, Vergrößern/Verkleinern, Gesamtkarte, Übersichtskarte, Pause und Vollbild. Falls das Browser-Vollbild nicht verfügbar ist, funktioniert eine bildschirmfüllende Ansicht mit „Verkleinern“ und Escape.
- Häuser auf zwei gemeinsamen Reihen. Gemeinsame Geometrie für Anzeige und Kollision: Häuser, Baumstämme, Bänke, Teich und abgestellte Autos. Straßen sind ausschließlich an vier Zebrastreifen begehbar. Figuren und Requisiten werden nach ihrer Fußposition gezeichnet.

## Altersdifferenzierung

Diese Altersstufen sind eine bewusste Gestaltung des Prototyps. Die bereitgestellte Challenge nennt Kinder und Jugendliche, jedoch keine verbindlichen Mindest-/Höchstalter dieser Spielstufen. Das echte Kursalter wird separat anhand des konkreten Angebots geprüft. Für unter sechs Jahre ist keine eigene Spielstufe erstellt; Erwachsene und Fachkräfte behalten den Kurskatalog ohne diese Altersbegrenzung.

| Stufe | Roboter | Experiment | Spielebau | KI |
| --- | --- | --- | --- | --- |
| 6–8: Entdecken | 4 × 3 Raster, kurze Wege, Pakete | Leiter finden, ein Schalter, Licht für Solarzelle | eine Brücke, Sprunghilfe, Kombination | Form, Farbe, bei Unsicherheit fragen |
| 9–11: Tüfteln | 5 × 4, längere Wege und Zwischenstopps | Isolator, zwei Schalter in Reihe, Schatten | zwei Brücken, längerer Parcours | falsches Beispiel, Vielfalt, Unsicherheit |
| 12–17: Weiterdenken | 6 × 5, zwei Zwischenstopps, Folge verdoppeln | Isolator, drei unabhängige Lampen, Energiespeicher | drei Brücken, längerer kombinierter Parcours | vielfältige Beispiele, Personendaten, Originalquellen |

Die Testfigur im Spielebau läuft den gebauten Weg tatsächlich ab und bleibt vor der ersten offenen Lücke bzw. fehlenden Sprunghilfe stehen. Die Schaltpläne sind vereinfachte Batterie-Darstellungen. Die KI-Aufgaben verwenden kein trainiertes Modell.

## Spielbegleiter und Familie

Pico bietet vier auswählbare Fragen mit vorbereiteten lokalen Antworten zu Mission, Bedienung, Interessen und Fortschritt. Er ist ausdrücklich als lokaler Spielbegleiter gekennzeichnet und täuscht keinen externen KI-Chat vor.

Der Elternbericht unter /eltern/#spielbericht liest den lokalen Spielstand. Ausprobierte Themen und ausdrücklich gewählte Wünsche liefern nachvollziehbare Kursvorschläge. Die Wünsche erhalten Vorrang vor nur ausprobierten Aufgaben. Der Bericht ermittelt keine Fähigkeiten oder Begabungen. Stromexperimente werden nicht automatisch in Coding-Interesse umgedeutet. Empfehlungen prüfen Thema, konkretes Alter, Zielgruppe und relevante Termine; Buchbarkeit bleibt beim Veranstalter zu bestätigen.

Ein JSON-Bericht kann bewusst heruntergeladen werden. Er enthält die gewählte Altersstufe, erkundete Aufgaben, freiwillige Themen und Angebotslinks. Er wird nicht automatisch versendet. Wünsche sind ein lokaler Wunschzettel, keine behauptete anonyme Bedarfserhebung für die Einrichtungen.

## Daten

cosmos.abenteuer.v2 in sessionStorage: gewählte ganze Alterszahl, gültige Aufgabenkennungen getrennt nach den drei Stufen und ausgewählte Themenkennungen. Keine Namen, Geburtsdaten, Freitexte, Bewegungswege, Fehlerzählungen, Geschwindigkeiten oder Chatprotokolle. Sitzungswiederherstellung kann diese Daten erhalten. Alle COSMOS-Schlüssel können auf /datenschutz/ gelöscht werden.

Die überarbeitete Spielfigur wurde mit dem integrierten Bildgenerator erzeugt, als public/medien/pixel/kind-v2.png gespeichert und visuell geprüft. Prompt und Herkunft: pixel-prompts-v2.json. Die PNG-Originale werden nicht mit Bildbearbeitungsskripten verändert. Das Manifest legt lediglich den sichtbaren Ausschnitt fest.

## Originalseiten und Socials

Die neue Seite /einrichtungen/ erklärt die vier echten Lernorte und verlinkt Originalangebote sowie bestätigte Kanäle. Keine Einbettungen, keine Drittanbieterbilder und kein automatischer Kontakt zu sozialen Netzwerken.

- aim: Instagram @aim.heilbronn ist in der offiziellen [Bildungsnavi-Broschüre](https://www.aim-akademie.org/fileadmin_akademie/Content/Files/Files/Ueber_uns/aim_Bildungsnavi_2025.pdf) im öffentlich indizierten Inhalt bestätigt. Der direkte Hauptseiten-/PDF-Abruf wurde mit 403 abgewiesen; keine vollständige aktuelle aim-Websiteprüfung behauptet.
- experimenta: Instagram, YouTube und Facebook aus der [offiziellen Social-Media-Seite](https://www.experimenta.science/experimenta/social-media/). Inhaltsangebot aus [Lernen](https://www.experimenta.science/lernen/).
- Haus der Familie: [Startseite](https://hdf-hn.de/) und [Digitale Familienwerkstatt](https://hdf-hn.de/angebote/digitale-familienwerkstatt/) geprüft. Dort kein eindeutig bestätigtes Social-Profil gefunden; kein Handle erfunden.
- IPAI: [Originalseite](https://ip.ai/) und die dort verlinkte Foundation geprüft. [Besucherzentrum](https://ipai-foundation.ai/besucherzentrum/) erklärt den Living Room. Instagram und LinkedIn der Foundation stehen ausdrücklich in deren [Datenschutzerklärung](https://ipai-foundation.ai/datenschutz/). Foundation und IPAI werden sprachlich unterschieden.

Der bereitgestellte KIT-Freigabeordner bleibt aus dieser Umgebung nicht abrufbar. Die Erweiterung kann daher keine vollständige Einhaltung unbekannter zusätzlicher Unterlagen bestätigen. Die neunseitige lokale Challenge-README und die Präsentation sind die geprüfte Grundlage. Betreiberangaben, Hostingprüfung und Freigaben für eine öffentliche Veröffentlichung bleiben offen.
