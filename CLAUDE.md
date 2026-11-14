# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md — this project uses Next.js 16.4 / React 19.3, whose APIs differ from older versions. Check `node_modules/next/dist/docs/` before writing Next.js code.

## Project

COSMOS-Entdecker is a prototype for the aim challenge "Learning Guide" (Heilbronn). Children play a 2D town game and find real courses on AI, coding and gaming from aim, experimenta, Haus der Familie and IPAI. There are separate entry points for children (`/kind/`), teens (`/teen/`) and parents/professionals (`/eltern/`). The code, identifiers, comments, UI text and docs are all in **German**, so keep new code consistent with that.

## Commands

On Windows PowerShell use `npm.cmd` instead of `npm`.

- `npm run dev`: dev server at http://localhost:3000
- `npm test`: Vitest (`tests/**/*.test.ts`, node environment, `@` → `src`)
- Single test: `npx vitest run tests/lib/stadt.test.ts` or `npx vitest run -t "<test name>"`
- `npm run lint`: ESLint (flat config, `eslint-config-next`)
- `npm run build`: normal Next production build
- `npm run export`: static export to `out/` (sets `COSMOS_STATIC_EXPORT=1`, which switches `output: "export"` in `next.config.ts`)
- `npm run preview`: serves `out/` at http://localhost:4173 (`Website-starten.cmd` does the same and opens a browser)
- `npm run pipeline`: re-scrapes all sources and rewrites `daten/` and `public/abo/`. `ROH_CACHE=1` reuses the raw data in `.cache/roh/` instead of fetching it again. The script compiles `pipeline/run.ts` with `tsc` into `.cache/pipeline-runtime` rather than using `tsx`, because `tsx` has trouble with Windows profile access.

## Architecture

**Data flow (build-time, no backend):**
`konfiguration/*.csv` → `pipeline/adapters/*` (one per source format, registered in `pipeline/adapters/index.ts` and selected by the `adapter` column in `quellen.csv`) → `pipeline/verarbeitung/*` (normalize, age/date parsing, topic classification, `korrekturen.csv` overrides, merge) → zod validation (`AngebotSchema` in `src/lib/angebot.ts`) → `daten/angebote.json`, `bericht.json`, `meta.json` plus ICS feeds in `public/abo/`.

- If a source fails, the last valid future offers are kept, but the pipeline still exits non-zero.
- Offers with a topic `sicherheit < 0.6` are held back from public views. `MIN_SICHERHEIT_OEFFENTLICH` is defined in both `pipeline/run.ts` and `src/lib/daten.ts`, so keep the two in sync.
- The app imports the JSON directly (`src/lib/daten.ts`). Changing the data therefore needs a rebuild/export, not a server restart.
- `.github/workflows/daten.yml` (daily pipeline run) is set up but not activated.

**Frontend (`src/`):**
- `app/`: App Router pages. They are server components that pass the data to client components. Styles are plain CSS files per area (`spielwelt.css`, `pixel.css`, `karte.css`, …) plus Tailwind 4 via the Turbopack loader.
- `lib/`: pure logic, unit-tested in `tests/lib/`. Key game modules:
  - `stadt.ts`: town generation from the station list, walkable path network, collision, route planning, cars, zebra crossing
  - `spiel.ts`: `STATIONEN` (loaded from `konfiguration/checkpoints/<id>.json`, one file per institution) and matching real offers to stations by topic and age
  - `checkpoint.ts`: zod schema for those files plus the `MODULE` list of reusable learning modules. It is validated only in `tests/lib/checkpoint.test.ts`, not at runtime, so zod stays out of the client bundle. A new module needs an entry in `MODULE` and a view in `MODUL_ANSICHT` (`components/spiel/lernaufgabe.tsx`). Progress IDs are `<station id>-<activity index>`. `/werkstatt/` (`components/werkstatt.tsx`, logic in `lib/werkstatt.ts`) is a local-only editor with live preview for these files; it is the only client code that loads zod. The `lektion` module is the exception to "content lives in code": its slides and final question are defined in the JSON itself.
  - `abenteuer.ts`: the tasks
  - `figuren.ts`: the player characters
- `components/spiel/spielwelt.tsx`: the child game. It runs a `requestAnimationFrame` loop that combines React state with refs (`pos`, `route`, `startetRef`, `gesperrteTuer`, …) for values the loop reads every frame. It is paused whenever a popup (`fenster`) is open. Each station gives one rocket part, and once all parts are collected the rocket launches and the finale opens.
- `lib/speicher.ts`: browser storage only, keys prefixed `cosmos.`. Children use `sessionStorage`; teens and parents use `localStorage` only after opting in.

## Project constraints (enforced or deliberate)

- **No emoji** anywhere in `src/`, `daten/`, `konfiguration/checkpoints/` or `konfiguration/themen.csv`. `tests/lib/emoji.test.ts` fails on them. Use the SVG `Symbol` component instead.
- **Privacy by design:** no accounts, analytics, external AI chat, or externally loaded fonts, map tiles or images. QR codes, the map (pre-simplified OSM data in `src/lib/heilbronn-karte.json`) and text-to-speech (local voices only) all run locally.
- Never invent offers, free places or availability. Missing data stays missing.
- Children never sign up themselves. Registration links are marked as being for adults.
- No addictive mechanics: no leaderboards, random rewards or loss threats.
- Decisions and their rationale are in `docs/entscheidungen.md` and `docs/spielwelt-v2.md`. Data maintenance without code changes is described in `docs/pflege.md`.
