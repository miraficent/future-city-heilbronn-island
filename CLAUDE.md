# CLAUDE.md – Heilbronn Island

@AGENTS.md
@DESIGN.md

Prototype for the aim challenge "Learning Guide" (Future City Hackathon 2026): all offers on **AI, coding and
gaming** for children and teens in Heilbronn from **aim, experimenta, Haus der Familie, IPAI** in one place.
UI language is **German**. Code comments in German or English, short and clear (the jury reads the code).

**`DESIGN.md` is the single source of truth for every UI change** (imported above). Its section
"Projektentscheidungen" overrides the rest of that file. Never add colours, fonts, shadows or component styles that
are not in DESIGN.md – add them there first, then to `src/app/globals.css`.

Read before larger changes: `README.md` (overview), `docs/regeln.md` (team rules), `docs/protokoll.md`
(decisions, open questions). If you decide or change something that affects others, add it to `docs/protokoll.md`.

## Current scope (decisions of 2026-11-14)

- **Start page** `/`: night sky, owl flies in and lands on the title, floating theme pictures, two cards "Kind" → `/kinder/` and "Eltern" → `/eltern/`.
- **Kids map** `/kinder/`: city view of Heilbronn (no sea, no islands). Buildings link to `/checkpoint/[id]/`;
  "Neuer Ort?" links to `/mitmachen/`. Owl asks the child's age once (sessionStorage).
- **Institution page** `/checkpoint/[id]/`: banner, owl, category bubbles, card gallery, bottom sheet with
  read-aloud and "Da will ich hin!". `cosmos` shows only events that belong to no other institution.
- **Parents** `/eltern/`: child's wishes, search with filters, all long texts. Teen area `/teen/` still exists (open).
- **No games.** All mini-games and the walking world were removed – do not add them back.
- **Roles:** Cedric owns the **data**. Everyone else works on the **presentation**. Never change data files to fix a
  display problem – report it instead. Main open question: how to present the existing data better.

## Commands

```bash
npm run dev            # http://localhost:3000
npm test               # Vitest – must pass before every push
npm run build          # must pass before every push
npm run lint
npm run pipeline       # offers import → daten/angebote.json (Cedric; currently emptied, the app shows no courses)
```

## Structure

- `src/app/` pages (Next.js App Router) · `src/components/ui/` design-system components (Button, Card, Badge, Pill,
  BackButton, ModeSwitch, AppShell, Owl/OwlGuide, BottomSheet, EmptyState, Banner, CategoryBubble, EventCard)
- `src/components/kinder/` kids pages · `src/components/kinderreise/` city map (`insel-karte.tsx`) and buildings
- `src/lib/kinderkarte.ts` map layout, places, institution colours, map palette `F` (design tokens only)
- `src/lib/kinderkarten.ts` turns offers + live events into one kid card format (uses the safety filters)
- `src/lib/` logic without UI, tested in `tests/lib/`
- Data (generated, **never edit by hand or from components**): `daten/angebote.json` (from `pipeline/`, config in
  `konfiguration/*.csv`). Live events are not stored: the browser loads them from Mobilizon
  (`src/lib/mobilizon.ts`, `src/lib/live-events.ts`, `NEXT_PUBLIC_MOBILIZON_URL`, default `http://localhost:4000`)
- Types: `src/lib/angebot.ts` (offers), `src/types.ts` (live events, categories)

## Rules (short version of docs/regeln.md)

**Design** – only DESIGN.md tokens and `src/components/ui/`; no inline hex values in components (institution colours
come from data). Depth = "chunky bottom", no gradients/blur. Fonts Baloo 2 + Nunito (local). Icons: Lucide via
`Symbol`. **No emojis** anywhere in `src/`, `daten/`, `konfiguration/themen.csv` (`tests/lib/emoji.test.ts`).

**Kids UI** – font ≥ 20px, short words, symbols first, every kids text has a read-aloud button (`src/lib/sprechen.ts`,
`de-DE`). Touch targets ≥ 56px on the map, category bubbles ≥ 72px. No free text input, no ranking/streaks.
Children never register – only "Da will ich hin!". Respect `prefers-reduced-motion`; keyboard + screen reader;
check 375px width (the map pans on phones).

**Data shown to kids** – always via `kinderKarten()` (uses `fuerModus()` and `isForKids()`); never write a separate
kids filter. Only known age, kids target group, no `needsReview`. Never invent values. Dummy data is labelled
"Beispiel". Filter big data on the server before passing it to client components.

**Privacy** – no accounts, cookies, tracking, analytics or AI chat for kids. Kids state only in `sessionStorage`.
No third-party images, fonts or scripts. An AI may only receive public event texts. Never commit keys.

**Code and git** – one branch per task; never work directly on `main`. Logic in `src/lib/` with a test.
Configuration over special cases (no page per institution). Do not push, merge into shared branches or delete
other people's code without asking the user.
