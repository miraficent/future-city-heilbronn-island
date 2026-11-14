# Auftrag: Hintergrundbilder für die Themenwelten (eins pro Einrichtung)

> Dieses Dokument ist für jemanden geschrieben, der das Projekt **nicht kennt** (z. B. eine neue KI-Sitzung
> oder ein Teammitglied mit Bildgenerator). Alles Nötige steht hier.

## 1. Worum geht es?

Wir bauen im Hackathon „Future City Heilbronn“ eine Webseite für Kinder (6–14 Jahre). Sie zeigt Kurse und
Veranstaltungen zu **KI, Coding, Gaming und Wissenschaft** von mehreren Einrichtungen in Heilbronn.

Kinder laufen mit einer Figur über eine gemalte Stadtkarte. Tippen sie auf ein Gebäude, öffnet sich die
**Themenwelt** dieser Einrichtung: ein Raum, in dem die Angebote als bunte, leicht wackelnde Kacheln
kreuz und quer schweben. Unten in der Mitte steht die Kinderfigur von hinten und schaut hinein.

**Gesucht: für jede Einrichtung ein Hintergrundbild für diese Themenwelt.**
Das Kind soll sofort spüren: „Ich bin jetzt bei *dieser* Einrichtung.“ Darum soll jedes Bild **aussehen wie die
Welt der jeweiligen Webseite**: deren Farben, deren Stimmung, deren typische Motive und Räume.

So sieht es fertig aus (Aufbau, von hinten nach vorn):
```text
┌──────────────────────────────────────────────┐
│ [Zur Karte] [Name]            [Themen-Knöpfe] │  ← oben: Leiste
│      ▭        ▭          ▭        ▭           │  ← Kacheln (Angebote), bunt, schräg
│   ▭        ▭       ▭           ▭              │
│                (Figur von hinten)             │  ← unten Mitte: Kinderfigur
└──────────────────────────────────────────────┘
          Hintergrundbild füllt alles, leicht weichgezeichnet
```

## 2. So gehst du vor (für jede Einrichtung)

1. **Webseite der Einrichtung ansehen** (Links unten). Notiere dir:
   - **Hauptfarben** (Logo, Buttons, Flächen) – 2 bis 4 Farben, möglichst als Hex-Wert
   - **Stimmung**: verspielt? technisch? warm? edel? hell oder dunkel?
   - **typische Motive**: Was zeigen die Fotos? (Räume, Geräte, Natur, Werkbänke …)
   - **das Gebäude / die Räume**, falls gezeigt (Architektur, Fenster, Materialien)
2. **Prompt zusammenbauen**: Grundidee (Abschnitt 4) + deine Notizen + gemeinsamer Stil (Abschnitt 3).
3. **Bild erzeugen**, ansehen, Regeln prüfen (Abschnitt 5), ggf. neu erzeugen.
4. **Abgeben** als `public/welten/<id>.jpg` (Abschnitt 6).

**Wichtig – nur Inspiration, nichts kopieren:**
Übernimm **Farben, Stimmung und Motiv-Ideen**, aber **keine Logos, keine Schriftzüge, keine Fotos und
keine Maskottchen/Figuren** der Einrichtungen. Wir dürfen deren Marken und Figuren nicht verwenden.
Das Bild soll *nach* der Einrichtung aussehen, nicht *von* ihr kopiert sein.

## 3. Gemeinsamer Stil (an jeden Prompt anhängen)

```text
Warm hand-painted children's book illustration, soft gouache and watercolor texture, gentle lighting,
friendly and inviting for children aged 6 to 14. Interior or scene seen in one-point perspective,
looking straight into the space, wide 16:9 format. The CENTER and the LOWER CENTER of the image are calm,
open and uncluttered (colorful cards and a child figure will be placed there later). Interesting details
only along the left and right edges and in the far background. Slightly muted colors so that colorful
UI cards on top stay readable.
No people, no children, no faces, no text, no letters, no numbers, no logos, no signs with writing,
no brand names, no mascots.
```

**Negativ-Prompt** (falls das Tool einen hat):
```text
text, letters, words, logo, watermark, signature, people, children, faces, mascot, photo, photorealistic,
3d render, neon cyberpunk, clutter in the center, busy center
```

## 4. Die Einrichtungen

Die **Grundidee** ist ein Startpunkt. Ersetze die Stellen in `[eckigen Klammern]` mit dem, was du auf der
Webseite gesehen hast.

### aim – Akademie für Innovative Bildung und Management · Datei `aim.jpg`
- Webseite: https://www.aim-akademie.org/ (Kurse für Kinder: unter „Kurse“)
- Worum es geht: Kurse für Kinder und Jugendliche (Junior-Akademie): Programmieren, Robotik, Technik, Forschen
- Ort: Bildungscampus Heilbronn (modernes Campusgelände)
- Farbe bei uns bisher: Koralle/Rot `#E8513A` – **auf der Webseite prüfen**

```text
A bright, friendly learning workshop for kids inside a modern education campus building.
Colors inspired by [aim website colors, e.g. coral red and white]. Large windows with daylight and campus
trees outside. Along the left and right walls: low tables with small friendly robots, building bricks,
a 3D printer, laptops whose screens show only abstract colored blocks, [motifs seen on the website].
Light wooden floor leading into the room.
```

### experimenta – Das Science Center · Datei `experimenta.jpg`
- Webseite: https://www.experimenta.science/ – Architektur: https://www.experimenta.science/experimenta/architektur/
- Worum es geht: großes Science Center mit Mitmach-Stationen, Laboren, Sternwarte und Science Dome
- **Hinweis:** Für experimenta gibt es schon ein Bild (Glashalle mit Planeten und Kuppel). Neu machen nur,
  wenn es näher an die Webseite/Architektur kommen soll.
- Farbe bei uns bisher: Türkis `#00A0B0` – **auf der Webseite prüfen**

```text
The inside of a large science center, [describe the real architecture from the website, e.g. the shape
of the building, glass facades]. Colors inspired by [experimenta website colors]. Along the sides:
hands-on experiment stations, a glowing plasma ball, a big telescope, hanging planets, [motifs from the
website, e.g. labs, dome]. Polished floor with reflections leading into the hall.
```

### Haus der Familie Heilbronn · Datei `hdf.jpg`
- Webseite: https://hdf-hn.de/ – Kinder/Jugend: https://hdf-hn.de/kinder-jugendliche/ –
  Digitale Familienwerkstatt: https://hdf-hn.de/angebote/digitale-familienwerkstatt/ –
  Bildergalerie: https://hdf-hn.de/bildergalerie/
- Worum es geht: Familienbildungsstätte – Kurse für Eltern und Kinder, kreativ, gemeinsam, auch digital (Tablets, Trickfilm, Scratch)
- Farbe bei uns bisher: Gelb/Gold `#F2A900` – **auf der Webseite prüfen**

```text
A cozy, warm family center room where parents and children learn together. Colors inspired by
[Haus der Familie website colors, e.g. warm yellow]. Soft wooden floor and a rug leading into the room,
low crafting tables with paper, crayons and a few tablets, shelves with picture books, plants, cushions,
[motifs from the website / gallery]. Large window to a green garden, afternoon sunlight.
```

### IPAI – Innovation Park Artificial Intelligence · Datei `ipai.jpg`
- Webseite: https://ipai-foundation.ai/ – Besucherzentrum: https://ipai-foundation.ai/besucherzentrum/
- Worum es geht: Innovationspark für Künstliche Intelligenz in Heilbronn, mit Besucherzentrum und Veranstaltungen
- Farbe bei uns bisher: Lila `#6C4BD8` – **auf der Webseite prüfen**

```text
A calm, friendly, futuristic visitor center about artificial intelligence. Colors inspired by
[IPAI website colors]. Tall glass walls, indoor trees and plants, soft flowing lines of light in the air
like gentle data streams, a small round friendly robot at the side, [architecture and motifs from the
website]. Clean floor leading into the space. Optimistic, not scary, not cyberpunk.
```

### COSMOS – Veranstaltungen in Heilbronn · Datei `cosmos.jpg`
- Webseite: https://www.cosmos-hn.de/veranstaltungen/
- Worum es geht: Sammlung von Veranstaltungen in der ganzen Stadt (bei uns: „Hier ist alles, was in Heilbronn los ist“)
- Farbe bei uns bisher: Orange/Bernstein `#F59E0B` – **auf der Webseite prüfen**

```text
A lively town square in Heilbronn at golden evening, half-timbered houses on both sides, a small kiosk
with a striped awning, a notice board with colorful blank paper notes, bunting and warm string lights
above the square, cobblestones leading into the scene. Colors inspired by [COSMOS website colors].
```

## 5. Prüfliste für jedes Bild

- [ ] Sieht man sofort, welche Einrichtung gemeint ist (Farben, Stimmung, Motive wie auf der Webseite)?
- [ ] **Mitte und unten Mitte ruhig** – dort liegen später Kacheln und die Figur
- [ ] **Keine Schrift**, auch keine krummen Fantasie-Buchstaben auf Schildern oder Bildschirmen
- [ ] **Keine Menschen**, keine Gesichter, keine Maskottchen, keine Logos
- [ ] Gleicher Malstil wie die anderen Bilder (weich, gemalt, kindgerecht)
- [ ] Nicht zu dunkel und nicht zu grell

## 6. Abgabe

- Format **16:9**, mindestens **2560 × 1440** Pixel, als **JPEG**, möglichst unter 600 KB
  (Mac: `sips -s format jpeg -s formatOptions 82 --resampleWidth 2560 bild.png --out aim.jpg`)
- Dateinamen: `aim.jpg`, `experimenta.jpg`, `hdf.jpg`, `ipai.jpg`, `cosmos.jpg`
- Ablage: `public/welten/` im Branch `feature/live-events` – die Seite findet das Bild **automatisch**
  (sonst erscheint ein Leuchtgitter). Prüfen unter `http://localhost:3000/checkpoint/<id>/`.
- Bitte notieren: **mit welchem Tool und wann** das Bild erzeugt wurde (für die Rechte-Prüfung vor einer Veröffentlichung).
