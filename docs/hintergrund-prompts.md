# Hintergründe der Themenwelten – Bild-Prompts

Jede Einrichtung bekommt ein eigenes Hintergrundbild für ihre Themenwelt (`/checkpoint/<id>/`).
Bild speichern als **`public/welten/<id>.jpg`** (`aim`, `experimenta`, `hdf`, `ipai`, `cosmos`) – die Seite nutzt es automatisch,
sonst erscheint das Leuchtgitter. Format **16:9, mindestens 2560 × 1440**, JPEG unter 600 KB.

## Gemeinsamer Stil (an jeden Prompt anhängen)

```
Warm hand-painted children's book illustration, soft gouache and watercolor texture, gentle lighting,
same style as a cozy illustrated city map. One-point perspective looking straight into the scene,
wide 16:9. The CENTER and the LOWER CENTER of the image are calm, open and uncluttered (cards and a
child figure will be placed there later). Slightly muted colors so colorful UI cards on top stay readable.
No people, no text, no letters, no numbers, no logos, no signs with writing, no brand names.
```

**Negativ-Prompt (falls das Tool das kennt):** `text, letters, logo, watermark, people, faces, children, photo, 3d render, neon cyberpunk, clutter in center`

## aim – Bildungscampus (Lila)

```
A bright, friendly coding and robotics learning lab inside a modern campus building. Large windows with
soft daylight and trees outside. Along the left and right walls: low wooden tables with small friendly
robots, colorful building bricks, a 3D printer, laptops and screens showing only abstract colored blocks
(no readable code). Purple and lavender accents, light wooden floor leading into the room.
```

## experimenta – Science Center (Blau/Türkis)

```
The inside of a large science center with a dramatic angular glass roof, evening blue light. On the sides:
hands-on experiment stations, a glowing plasma ball, a small tesla coil with gentle sparks, a big telescope,
hanging planets and a softly glowing planetarium dome in the distance. Deep blue and teal tones,
reflections on a polished floor leading into the hall.
```

## Haus der Familie (Koralle/Pfirsich)

```
A cozy, warm family center room. Soft wooden floor and rug leading into the room, low crafting tables
with paper, crayons, scissors and a few tablets, shelves full of picture books, plants, cushions and a
small reading corner. Large window to a green garden. Warm coral, peach and cream colors, afternoon sunlight.
```

## IPAI – Innovationspark KI (Dunkelgrün/Türkis)

```
A calm, futuristic but friendly innovation park lobby. Tall glass walls, indoor trees and green plants,
soft flowing lines of light in the air like gentle data streams, a small round friendly robot standing
at the side, floating abstract shapes. Teal, mint and deep green tones, clean floor leading into the space.
```

## COSMOS – Platz in der Stadt (Orange/Bernstein)

```
A lively old-town square in a small German city at golden evening, half-timbered houses on both sides,
a small wooden kiosk with a striped awning, a notice board with colorful blank paper notes, colorful
bunting and warm string lights above the square, cobblestones leading into the scene. Amber, orange and
warm golden tones.
```

## Danach

1. Bild ansehen: keine Schrift, keine Personen, Mitte ruhig?
2. Als `public/welten/<id>.jpg` speichern (z. B. mit `sips -s format jpeg -s formatOptions 82 --resampleWidth 2560 bild.png --out public/welten/aim.jpg`).
3. `/checkpoint/<id>/` öffnen und prüfen, ob die Kacheln lesbar sind.
4. Herkunft des Bildes (Tool, Datum) im Protokoll vermerken – Rechte prüfen, bevor es veröffentlicht wird.
