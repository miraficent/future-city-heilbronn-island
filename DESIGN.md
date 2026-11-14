# Heilbronn Island – Design Brief (single source of truth)

Read this file together with CLAUDE.md before changing any UI.

> **Projektentscheidungen (14.11.2026) – gelten vor dem Rest dieser Datei**
>
> 1. **Karte = Stadtansicht von Heilbronn, kein Meer, keine Inseln.** Die echte Stadt (Neckar, Altstadt mit
>    Kilianskirche, Hauptbahnhof, Weinberg) ist sehr wichtig. Übernommen aus § 3: weiße gestrichelte Wege,
>    Pins, Gebäude, Abzeichen, „Heute!“-Stern, laufende Figur. Positionen folgen der echten Geografie
>    (experimenta links am Neckar beim Hauptbahnhof). Die Nebel-Insel heißt „Neuer Ort?“ (Bauplatz) → `/mitmachen/`.
> 2. **Keine Spiele.** Alle Mini-Spiele sind entfernt; § 4 Punkt 5 und die Spiele-Hinweise in § 7 entfallen.
> 3. **Startseite:** zwei Karten „Kind“ (→ `/kinder/`) und „Eltern“ (→ `/eltern/`).
> 4. **Schriften lokal** in `public/fonts/` statt von Google Fonts (Datenschutz: nichts von fremden Servern).
> 5. **Icons:** Lucide über `src/components/symbol.tsx`. **Keine Emojis**, auch nicht Fluent Emoji
>    (Teamregel, geprüft von `tests/lib/emoji.test.ts`). Kategorie-Symbole ebenfalls Lucide.
> 6. **Keine fremden Bilder** auf Event-Karten: statt Foto eine Fläche in Kategoriefarbe mit Symbol.
> 7. **Kein Eltern-Login** (keine Konten, siehe Datenschutz).
> 8. **Wo es im Code liegt:** Tokens in `src/app/globals.css` (+ Kartenfarben `F` in `src/lib/kinderkarte.ts`),
>    Bausteine in `src/components/ui/`, Stile in `src/app/ui.css`, Orte und Einrichtungsfarben in
>    `src/lib/kinderkarte.ts` (dieses Projekt hat keine `institutions.json`). Routen: `/kinder/`,
>    `/checkpoint/[id]/`, `/mitmachen/`, `/styleguide/`.
> 9. **Zusätzliche Tokens:** `card-border` #E7E2D6 (Kartenrand, stand schon in § Depth) und `roof` #E07A4F
>    (Dächer, stand schon in § 3).
> 10. **Stadthäuser = Fachwerkhäuser** (eigene flache Zeichnung, `src/components/kinderreise/fachwerkhaus.tsx`,
>    Einzeldatei `public/grafik/fachwerkhaus.svg`). Neuer Token `timber` #7A4A2A für die Balken.
>    Weniger Häuser als zuvor, damit die Karte ruhig bleibt.
> 11. **Kinder-Karte ist eine gemalte Illustration** (`/kinder/`): Hintergrund `public/karte/heilbronn-karte.jpg` (1536 × 1024, ohne Gebäude). Darauf liegen Fachwerkhäuser (`fachwerkhaus.tsx`) auf den früheren Schattenflächen und isometrische Einrichtungsgebäude im Stil der experimenta-Zeichnung (`institut-gebaeude.tsx`). **Nur in diesen Gebäuden und in den drei Kinderfiguren (`kinder-figuren.tsx`, Figurenwahl über die Eule) sind Verläufe erlaubt.** 
>    Positionen: `src/lib/bildkarte.ts`. Die gezeichnete Stadtkarte (`insel-karte.tsx`) bleibt als Rückfall.
> 12. **Einrichtungsseite = Themenwelt** (`/checkpoint/[id]/`): leuchtender Raum mit Fluchtgitter in den Farben der Einrichtung,
>    Angebote als Kacheln kreuz und quer im Raum (leichtes Wackeln), unten die gewählte Kinderfigur von hinten.
>    Kachel antippen → Eule liest vor → „Da will ich hin!“. Verläufe nur für den Lichtschein und die Kachel-Struktur.
Goal: ONE consistent look for the whole website: map, kids pages, parent dashboard, games.
Do not invent new colors, fonts or component styles. If something is missing, add it here first.

---

## 1. Concept
"Heilbronn Island" is a flat, illustrated adventure world.
Each institution lives on its own small island in a calm turquoise sea.
Dashed white paths connect the islands like a treasure-map journey.
The main island is Heilbronn's old town (start). New organisations = new islands.

Mood (inspiration only, never copy artwork or characters):
- Flat isometric game maps: chunky islands with a visible darker side wall, light halo ring of
  shallow water around each island, dashed travel paths, small boats and clouds.
- Flat space/science illustrations: deep navy night sky with tiny stars and planets for
  headers and the Start page; a friendly mascot (our owl guide).
- Kids science websites: bright, friendly, clear cards with one icon each.

Keywords: flat · friendly · calm · chunky shapes · few details · lots of space.

---

## 2. Design tokens

### Colors (use ONLY these, via Tailwind tokens / CSS variables)
| Token | Hex | Use |
|---|---|---|
| night | #1E2A5A | Top bar, Start hero, space backgrounds |
| night-2 | #2A3B7A | Cards on night background, hover |
| sea | #5BB8C4 | Map ocean |
| sea-shallow | #8FD3DB | Halo ring around islands, light accents |
| sea-deep | #4AA3AF | Subtle darker water patches |
| land | #7BC86C | Island top (grass) |
| land-dark | #4E9A4A | Trees, island shading |
| sand | #E8C88A | Beaches, paths on land |
| cliff | #C49A5A | Island side walls (2.5D edge) |
| paper | #F6F3EC | Page background (content pages) |
| white | #FFFFFF | Cards |
| primary | #6C4CE0 | Owl purple: main buttons, links, focus ring |
| primary-dark | #4F35B0 | Button bottom shadow |
| accent | #F59E0B | "Heute!", highlights, stars, badges |
| accent-dark | #C27C06 | Accent button shadow |
| wish | #FF6B6B | "Da will ich hin!" button only |
| wish-dark | #D94B4B | Wish button shadow |
| ink | #1F2937 | Text on light backgrounds |
| ink-soft | #6B7280 | Secondary text |
| snow | #FFFFFF | Text on night/primary backgrounds |
| success | #22C55E | Confirmations |

Institution colors (pins, island flags, page banners):
experimenta #3B4CCA · IPAI #2BB3A3 · aim #6C4CE0 · Haus der Familie #F28C6B · COSMOS #F59E0B.
New institutions get their color from institutions.json.

### Typography
- Headings: "Baloo 2" (600/700). Body: "Nunito" (400/700). Load from Google Fonts.
- Kids mode: body 20px, h1 36px, h2 28px, buttons 20px.
- Parents mode: body 16px, h1 30px, h2 22px, buttons 16px.
- Line length max 60 characters. Kids cards: max ~10 visible words.

### Shape, spacing, depth
- Radius: cards 24px, buttons pill (999px), inputs 16px, pins teardrop.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64.
- Depth = "chunky bottom" instead of soft shadows:
  buttons `box-shadow: 0 4px 0 <dark token>`; pressed: translateY(4px), shadow 0.
  Cards: 2px border #E7E2D6 + `0 4px 0 #E7E2D6`.
- No gradients, no glassmorphism, no blur. Flat fills only.

### Icons
- UI icons: Lucide (stroke 2, rounded).
- Kids category icons: Fluent Emoji (flat) or our own flat SVGs in palette colors.
- One icon per button/card. Never icon-only for important actions without an aria-label.

---

## 3. The map (ChildIsland page)

- SVG, viewBox 0 0 1200 800, responsive (fills width, keeps ratio). Mobile: pan/zoom allowed.
- Ocean: `sea` background with 6–10 large soft polygon patches in `sea-deep`.
- Islands: flat polygons with slightly irregular, angular coastlines.
  Every island = top face (`land` or `sand`) + side wall below it (`cliff`, 14–20px tall)
  + halo ring around it (`sea-shallow`, 10–14px wide).
- Paths: white dashed lines (stroke 8, dash 22/18, round caps) connecting islands.
  The child figure walks along these paths.
- Decoration (max ~25 items, flat): round tree clusters, 2 clouds, 1 small boat,
  tiny sparkles near experimenta. Keep it calm.

Islands and buildings (positions from institutions.json: mapX, mapY):
1. Start island (center-left, biggest): Heilbronn old town: 8–12 tiny houses with orange
   roofs (#E07A4F), Kilianskirche (one tall tower), Hauptbahnhof with clock. Flag "Start".
   A blue river (Neckar) line crosses the island with one small bridge.
2. experimenta island (top-left): angular dark-blue glass building (#3B4CCA with lighter
   facets #5B6BD6), spiral line around it, small white observatory dome with telescope,
   2–3 sparkles/stars above.
3. IPAI island (bottom-center): rounded white futuristic building with teal light stripe,
   rooftop garden, tiny friendly robot.
4. aim island (top-right): simple campus building (generic building component) with
   </> sign, in aim color.
5. Haus der Familie island (right): cozy house with pitched roof in its color, garden,
   heart sign.
6. COSMOS island (bottom-right): small plaza with a kiosk/notice board and calendar icon
   = "all events" place.
7. "Neue Insel?" fog island (edge, dashed outline, "+" icon) → links to Join page.

Pins: teardrop pin above each building in the institution color, white icon inside,
name label as white pill with 2px colored border (Baloo 2, 16px).
Badge on pin: number of upcoming events (accent circle). "Heute!" = small accent star
that gently pulses (disabled with prefers-reduced-motion).
Hover/focus: pin bounces 4px. Click/tap: child figure walks the dashed path, then
navigates to /checkpoint/:id. Touch targets ≥ 56px.

Generic building component (for every new organisation): square block with pitched roof,
front face lighter, side face darker, door + 2 windows, roof in institution color.

---

## 4. App layout (all pages)

- AppShell:
  - Top bar (night): owl logo + "Heilbronn Island", mode switch "Kinder | Eltern"
    (pill toggle), on the right "Eltern-Login" (parents) or nothing (kids).
  - Big back button (pill, white, left arrow + "Zurück") always top-left on inner pages.
  - Content area on `paper`. Max width 1100px for parent pages; kids pages full width.
- Owl guide: appears bottom-left (kids), speech bubble white with 2px border,
  read-aloud button (speaker icon) inside the bubble.

Pages:
1. Start: night hero with tiny stars, small map preview (island cluster), title,
   two huge choice cards: "Kind" (kids/teens) and "Eltern" (parents).
2. Map (kids): full-screen map, owl greeting "Hey! Heute ist <Wochentag>. Wohin willst du?"
3. Institution page (kids): banner in institution color with the building illustration;
   owl bubble; category bubbles (72px round, icon + label + count badge, only categories
   with upcoming events); mood row (optional); swipeable event card gallery.
4. Event card (kids): image top (16:10, radius 24), title_kids (Baloo 2), weekday + sun/moon
   icon, age badge "ab 8", "gratis" badge if free. Tap → bottom sheet with owl story and
   big "Da will ich hin!" (wish color).
5. Mini-games: same AppShell, game area in a white card, big controls, friendly feedback
   ("Probier's nochmal!"), after the game: emoji rating 😍 🙂 😐 → interest compass →
   matching events.
6. Parents dashboard: calmer: list of child wishes (cards with date, time, place, price,
   "Zur Anmeldung" link), filters on the left (topic, age, institution, date), small map.
7. Parents search: same filters + result list; event detail with OpenStreetMap mini map.
8. Join page ("Willst du unsere Insel erweitern?"): night hero, illustration of a new
   island appearing, requirements list, simple form (no backend).
9. /styleguide: shows all tokens and components.

---

## 5. Components (app/src/components/ui/)
Button (variants: primary, accent, wish, ghost; sizes kids/parents) · Card · EventCard
(kids/parents) · CategoryBubble · Badge · Pill · PageHeader/Banner · BackButton ·
ModeSwitch · OwlGuide (bubble + read-aloud) · BottomSheet · FilterBar · EmptyState ·
MapPin · GenericBuilding · Island.
Every page uses only these. No inline styles, no hardcoded hex values in components.

---

## 6. Motion and accessibility
- Motion: short (150–300ms), ease-out; bounce on pins, card slide-in, figure walk.
  All motion off with prefers-reduced-motion.
- Contrast ≥ 4.5:1 for text. Focus ring: 3px primary outline, offset 2px.
- Keyboard: map pins focusable in reading order; Esc closes sheets.
- Alt texts for illustrations; read-aloud for kid texts (Web Speech API, de-DE).
- Mobile first (375px), then tablet and desktop.

---

## 7. Don'ts
- No copied artwork, logos or characters from other websites or games.
- No new colors, fonts or shadows outside this file.
- No long text blocks in kids mode; no leaderboards, no streaks.
- Don't break existing routes, data loading, wish logic or games while restyling.
