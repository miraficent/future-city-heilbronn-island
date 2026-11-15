# Eule & Owl – Kindertexte aus Mobilizon-Kommentaren, Kinderbereich DE | EN – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The owl shows and reads aloud a kids title and sentence per live event from the Mobilizon comments of the accounts `eule` (DE) and `owl` (EN), and the whole kids area switches between German and English.

**Architecture:** `src/lib/mobilizon.ts` loads each event's comments and turns the newest local `eule`/`owl` comment into `LiveEvent.kinder = { de?, en? }`. Kids cards carry both languages; one pure function `kartenText(karte, sprache)` picks title and sentence with a fallback that never mixes languages. Fixed kids texts move into a DE/EN text file like the parents area, using the existing device language setting.

**Tech Stack:** Next.js (App Router, static export), TypeScript, Vitest, Mobilizon GraphQL, Web Speech API.

**Spec:** `docs/superpowers/specs/2026-11-15-eule-owl-kommentare-design.md`

## Global Constraints

- Branch: work on `feature/eule-owl`, created from `feature/live-events`. Never commit `src/app/ui.css` changes you did not make (someone else had uncommitted edits there on 15.11.).
- Accounts exactly `eule` (Deutsch) and `owl` (Englisch); only comments whose `actor.domain` is `null` or `""` (our own instance) count.
- Comment format: line 1 kids title (max. 5 words), line 2 one sentence (cap 160 characters). One line only = sentence.
- Newest comment per account wins (`updatedAt`, else `insertedAt`); comments with `deletedAt` set do not count.
- Language type `Sprache = "de" | "en"`; speech `de-DE` / `en-GB` (`LOCALE`).
- Kids UI rules from CLAUDE.md still apply: font ≥ 20px, every kids text has read-aloud, touch targets ≥ 56px, no emojis, no free text input, `prefers-reduced-motion`, 375px width.
- Kids data only via `kinderKarten()` – never a new kids filter. Never edit `daten/` or `src/data/` to fix display.
- Only DESIGN.md tokens in CSS; no inline hex.
- `npm test` and `npm run build` must pass before every commit that ends a task. (In this shell, load Node first: `fnm env --use-on-cd | Out-String | Invoke-Expression` in PowerShell.)

## Review Focus

1. **A course card (`daten/angebote.json`, German teaser) in English mode** – must show the built English sentence, never the German teaser. Test in Task 3.
2. **A comment that is only markup or whitespace** (`<p><br></p>`) – counts as missing, fallback is used, no empty bubble. Test in Task 2.
3. **`eule` from another server** (`domain: "andere.example"`) next to our own `eule` – only ours is used, even if the foreign one is newer. Test in Task 2.
4. **Switching DE → EN while the bottom sheet is open and "Eule spricht von selbst" is on** – the bubble text changes and is read once in the English voice, not twice and not in the German voice. Check in Task 4 (browser).
5. **A deleted newer comment and an older live one from the same account** – the older live one is used. Test in Task 2.

---

### Task 1: Shared `Sprache` type and English kids sentences

**Files:**
- Modify: `src/types.ts` (add `Sprache`, `KinderText`, `KinderTexte`)
- Modify: `src/lib/eltern-suche.ts:33` (import `Sprache` from `@/types` and re-export it; keep `LOCALE` there)
- Modify: `src/lib/kinder-text.ts` (`THEMA_SATZ`, `ART_SATZ`, `kinderGeschichte`, `kinderWann`, `kinderTageszeit`)
- Modify: `src/components/kinder/checkpoint-seite.tsx:83-90` (call sites keep German by passing `"de"` for now)
- Test: `tests/lib/kinder-text.test.ts` (create if missing, else extend)

**Interfaces:**
- Produces (in `src/types.ts`):
  - `export type Sprache = "de" | "en";`
  - `export type KinderText = { titel?: string; satz: string };`
  - `export type KinderTexte = Partial<Record<Sprache, KinderText>>;`
- Produces (in `src/lib/kinder-text.ts`):
  - `THEMA_SATZ: Record<Sprache, Record<string, string>>`
  - `ART_SATZ: Record<Sprache, Record<"workshop" | "show" | "course" | "event", string>>`
  - `kinderGeschichte(k: FuerGeschichte, sprache: Sprache): string` – the event's own text (`k.geschichte`) is used **only when `sprache === "de"`**
  - `kinderWann(iso: string, jetzt: Date, sprache: Sprache = "de"): string`
  - `kinderTageszeit(iso: string, sprache: Sprache = "de"): string`

English copy (exact):

| Key | EN |
|---|---|
| THEMA astronomy / physics / biology / math | `stars and space` / `exciting experiments` / `nature and animals` / `numbers and puzzles` |
| THEMA it / coding / gaming / art / family | `computers and AI` / `coding` / `games` / `drawing and crafts` / `fun with your family` |
| ART workshop / show / course / event | `You get to join in.` / `You watch and get amazed.` / `You meet several times and learn step by step.` / `Come along and give it a try.` |
| Topic sentence | `This is all about ${thema}.` |
| Free | `It's free.` |
| Wann | `Today`, `Tomorrow`, `On ${weekday en-GB}`, `Next week`, `In ${n} weeks`, `Later` |
| Tageszeit | `in the morning`, `at midday`, `in the afternoon`, `in the evening` |

- [ ] **Step 0: Create the branch**

Run: `git switch -c feature/eule-owl` (from `feature/live-events`). Expected: `Switched to a new branch 'feature/eule-owl'`.

- [ ] **Step 1: Write the failing tests**

```ts
describe("Englisch", () => {
  const k = { titel: "Roboter bauen", geschichte: "Hier baust du einen Roboter.", art: "workshop" as const, themen: ["coding"], gratis: true };
  it("baut den Satz auf Englisch und ignoriert den deutschen Eigentext", () => {
    expect(kinderGeschichte({ ...k, themen: [THEMA_SATZ.en.coding] }, "en")).toBe("This is all about coding. You get to join in. It's free.");
  });
  it("nutzt auf Deutsch weiter den Eigentext", () => {
    expect(kinderGeschichte(k, "de")).toBe("Hier baust du einen Roboter.");
  });
  it("sagt die Zeit auf Englisch", () => {
    const jetzt = new Date("2026-11-16T09:00:00+01:00"); // Montag
    expect(kinderWann("2026-11-16T15:00:00+01:00", jetzt, "en")).toBe("Today");
    expect(kinderWann("2026-11-17T15:00:00+01:00", jetzt, "en")).toBe("Tomorrow");
    expect(kinderWann("2026-11-21T15:00:00+01:00", jetzt, "en")).toBe("On Saturday");
    expect(kinderWann("2026-11-25T15:00:00+01:00", jetzt, "en")).toBe("Next week");
    expect(kinderTageszeit("2026-11-16T15:00:00+01:00", "en")).toBe("in the afternoon");
  });
});
```

Also update existing German tests for the new `THEMA_SATZ.de` / `ART_SATZ.de` shape.

- [ ] **Step 2: Run, expect FAIL** – `npx vitest run tests/lib/kinder-text.test.ts` → fails (`THEMA_SATZ.en` undefined / wrong arity).
- [ ] **Step 3: Implement** the interfaces above; German strings unchanged.
- [ ] **Step 4: Run, expect PASS** – same command, then `npm test` (all green) and `npx tsc --noEmit` (no errors).
- [ ] **Step 5: Commit** – `feat(kinder): Kindersätze und Zeitangaben auch auf Englisch`

---

### Task 2: Read the Eule/Owl comments from Mobilizon

**Files:**
- Modify: `src/lib/mobilizon.ts` (type `MobilizonKommentar`, `comments` in `MobilizonEvent` and `ABFRAGE`, `EULEN_KONTEN`, `kommentarZeilen`, `eulenTexte`, `zuLiveEvent` sets `kinder`)
- Modify: `src/types.ts` (`LiveEvent.kinder: KinderTexte`)
- Modify fixtures: `tests/lib/events.test.ts:11`, `tests/lib/eltern-suche.test.ts:63`, `tests/lib/kinderkarten.test.ts:22` (add `kinder: {}`)
- Test: `tests/lib/mobilizon.test.ts`

**Interfaces:**
- Consumes: `KinderText`, `KinderTexte`, `Sprache` (Task 1).
- Produces (in `src/lib/mobilizon.ts`):
  - `export type MobilizonKommentar = { text: string | null; insertedAt: string | null; updatedAt: string | null; deletedAt: string | null; actor: { preferredUsername: string; domain: string | null } | null };`
  - `MobilizonEvent.comments?: MobilizonKommentar[] | null`
  - `export const EULEN_KONTEN: Record<Sprache, string> = { de: "eule", en: "owl" };`
  - `export function kommentarZeilen(html: string): string[]` – splits at `<br>`, `</p>`, `</div>`, `\n`; each part through the existing `nurText`; drops empty parts.
  - `export function eulenTexte(kommentare: MobilizonKommentar[] | null | undefined): KinderTexte`
  - `LiveEvent.kinder: KinderTexte` (in `src/types.ts`, doc comment: "Kindertitel und -satz der Konten eule/owl (Mobilizon-Kommentare)")
- GraphQL fields (checked against the instance on 15.11.): `comments { text insertedAt updatedAt deletedAt actor { preferredUsername domain } }`.

`eulenTexte` rules: per language, keep comments with `actor.preferredUsername === EULEN_KONTEN[sprache]`, `!actor.domain`, `!deletedAt`, and at least one non-empty line; take the newest by `updatedAt ?? insertedAt`. One line → `{ satz }`; two or more → `{ titel: zeilen[0], satz: zeilen[1] }`. Title capped to 5 words (`… ` appended when cut), sentence to 160 characters (cut at the last space before 160, then ` …`). A language with no usable comment is absent from the result.

- [ ] **Step 1: Write the failing tests**

```ts
const k = (name: string, text: string, extra: Partial<MobilizonKommentar> = {}): MobilizonKommentar =>
  ({ text, insertedAt: "2026-11-15T10:00:00Z", updatedAt: null, deletedAt: null, actor: { preferredUsername: name, domain: null }, ...extra });

describe("eulenTexte", () => {
  it("liest Titel und Satz beider Konten", () => {
    expect(eulenTexte([k("eule", "<p>Roboter bauen</p><p>Hier baust du einen Roboter!</p>"), k("owl", "Build a robot<br>Here you build your own robot!")]))
      .toEqual({ de: { titel: "Roboter bauen", satz: "Hier baust du einen Roboter!" }, en: { titel: "Build a robot", satz: "Here you build your own robot!" } });
  });
  it("eine Zeile ist der Satz", () => expect(eulenTexte([k("eule", "Hier baust du einen Roboter!")])).toEqual({ de: { satz: "Hier baust du einen Roboter!" } }));
  it("ignoriert fremde Server, auch wenn neuer", () => {
    expect(eulenTexte([k("eule", "echt"), k("eule", "fremd", { insertedAt: "2026-11-16T10:00:00Z", actor: { preferredUsername: "eule", domain: "andere.example" } })]).de?.satz).toBe("echt");
  });
  it("ignoriert andere Konten", () => expect(eulenTexte([k("besucher", "Hallo")])).toEqual({}));
  it("neuester gewinnt, gelöschte zählen nicht", () => {
    expect(eulenTexte([k("eule", "alt"), k("eule", "neu", { updatedAt: "2026-11-15T12:00:00Z" })]).de?.satz).toBe("neu");
    expect(eulenTexte([k("eule", "alt"), k("eule", "", { insertedAt: "2026-11-16T10:00:00Z", deletedAt: "2026-11-16T11:00:00Z" })]).de?.satz).toBe("alt");
  });
  it("leeres Markup zählt als fehlend", () => expect(eulenTexte([k("eule", "<p><br></p>")])).toEqual({}));
  it("kappt lange Texte", () => {
    const t = eulenTexte([k("eule", `Eins zwei drei vier fünf sechs sieben\n${"wort ".repeat(60)}`)]).de!;
    expect(t.titel).toBe("Eins zwei drei vier fünf …");
    expect(t.satz.length).toBeLessThanOrEqual(162);
    expect(t.satz.endsWith(" …")).toBe(true);
  });
  it("ohne Kommentare leer", () => expect(eulenTexte(null)).toEqual({}));
});
```

Plus: `zuLiveEvent` with `comments: [k("owl", "Hi")]` → `kinder: { en: { satz: "Hi" } }`, and without `comments` → `kinder: {}`.

- [ ] **Step 2: Run, expect FAIL** – `npx vitest run tests/lib/mobilizon.test.ts` → `eulenTexte is not exported`.
- [ ] **Step 3: Implement** as specified; add the `comments { … }` block to `ABFRAGE`; set `kinder: eulenTexte(e.comments)` in `zuLiveEvent`; update the module doc comment (Kindertexte kommen aus Kommentaren der Konten eule/owl).
- [ ] **Step 4: Run, expect PASS** – `npm test`, `npx tsc --noEmit`. Then live check: `curl -s -X POST http://localhost:4000/api -H "Content-Type: application/json" -d '{"query":"{ events(page:1,limit:2){ elements { comments { text actor { preferredUsername domain } } } } }"}'` returns `data` (no `errors`).
- [ ] **Step 5: Commit** – `feat(events): Kindertitel und -satz aus den Kommentaren von eule und owl`

---

### Task 3: Cards carry both languages; one function picks the text

**Files:**
- Modify: `src/lib/kinderkarten.ts` (`KinderKarte.texte`, `ausAngebot`, `ausEvent`)
- Modify: `src/lib/kinder-text.ts` (add `kartenText`)
- Test: `tests/lib/kinderkarten.test.ts`, `tests/lib/kinder-text.test.ts`

**Interfaces:**
- Consumes: `KinderTexte`, `Sprache` (Task 1); `LiveEvent.kinder` (Task 2); `kinderGeschichte`, `THEMA_SATZ`, `kinderTitel`.
- Produces:
  - `KinderKarte.texte: KinderTexte` – `ausEvent` → `e.kinder`; `ausAngebot` → `{}`.
  - `export function kartenText(k: KinderKarte, sprache: Sprache): { titel: string; satz: string }` in `src/lib/kinder-text.ts`:
    - `titel = k.texte[sprache]?.titel ?? kinderTitel(k.titel)`
    - `satz = k.texte[sprache]?.satz ?? kinderGeschichte({ titel: k.titel, geschichte: k.geschichte, art: k.art, themen: k.kategorien.map((id) => THEMA_SATZ[sprache][id]).filter(Boolean), gratis: k.gratis }, sprache)`
  - `kinderKarten()` signature unchanged (deviation from spec, on purpose: switching language needs no reload of the cards).

- [ ] **Step 1: Write the failing tests** – three rows of the spec's fallback table plus Review Focus 1:

```ts
// karte = any valid KinderKarte fixture (e.g. ausEvent(liveEvent) from kinderkarten.test.ts)
const basis: KinderKarte = { ...karte, titel: "Roboter-Werkstatt für Profis (8–12 Jahre): Wir bauen", geschichte: "Ein langer deutscher Kurstext.", art: "workshop", kategorien: ["coding"], gratis: false };
it("nimmt Titel und Satz aus dem Kommentar", () =>
  expect(kartenText({ ...basis, texte: { en: { titel: "Build a robot", satz: "Here you build a robot!" } } }, "en")).toEqual({ titel: "Build a robot", satz: "Here you build a robot!" }));
it("ohne Titelzeile: kinderTitel vom Original", () =>
  expect(kartenText({ ...basis, texte: { de: { satz: "Hier baust du was." } } }, "de")).toEqual({ titel: "Roboter-Werkstatt für Profis", satz: "Hier baust du was." }));
it("ohne Kommentar auf Englisch: gebauter englischer Satz, nie der deutsche Text", () =>
  expect(kartenText({ ...basis, texte: {} }, "en").satz).toBe("This is all about coding. You get to join in."));
```

And in `kinderkarten.test.ts`: `ausEvent` passes `kinder` through as `texte`; `ausAngebot(...).texte` is `{}`.

- [ ] **Step 2: Run, expect FAIL** – `npx vitest run tests/lib/kinder-text.test.ts tests/lib/kinderkarten.test.ts`.
- [ ] **Step 3: Implement**; replace the `euleSagt(kinderTitel(...), kinderGeschichte(...))` construction in `checkpoint-seite.tsx` with `kartenText(k, "de")` (still German; Task 4 wires the language).
- [ ] **Step 4: Run, expect PASS** – `npm test`, `npx tsc --noEmit`.
- [ ] **Step 5: Commit** – `feat(kinder): Karten tragen Eule- und Owl-Text, kartenText wählt mit Rückfall`

---

### Task 4: Language switch in the kids area, owl speaks the chosen language

**Files:**
- Create: `src/components/ui/sprache.tsx` (move `useSprache` and `SprachUmschalter` here from `src/components/eltern/sprache.tsx`; the old file re-exports them, keeps `useTexte` and the date helpers)
- Modify: `src/lib/sprechen.ts` (`vorlesen(text: string, sprache: Sprache = "de")`, `satz.lang = LOCALE[sprache]`)
- Modify: `src/components/ui/index.tsx` (`AppShell` shows `<SprachUmschalter />` when `modus === "kinder"` and no `rechts` is given; `OwlGuide` reads `useSprache()` and passes it to `vorlesen`; its aria labels and `ModeSwitch` labels in both languages)
- Modify: `src/components/kinder/checkpoint-seite.tsx`, `src/components/kinder/figur-baukasten.tsx` (pass `useSprache()` to `vorlesen`, `kartenText`, `kinderWann`, `kinderTageszeit`)
- Modify: `src/app/ui.css` (only the new rule: `.ui-shell--kinder .el-sprache .ui-mode__item { min-height: 56px; min-width: 56px; }`) – stage only your hunk (`git add -p src/app/ui.css`)

**Interfaces:**
- Consumes: `kartenText` (Task 3), `kinderWann`/`kinderTageszeit` with `sprache` (Task 1), `LOCALE` from `src/lib/eltern-suche.ts`.
- Produces: `useSprache(): Sprache` and `SprachUmschalter()` exported from `src/components/ui/sprache.tsx` (and re-exported from `src/components/ui/index.tsx`). `vorlesen(text, sprache)`.

UI strings in `ui/index.tsx` (EN): ModeSwitch `Kids` / `Parents`, `aria-label` `Choose area`; OwlGuide `Close owl`, `The owl is talking – read again`, `Read aloud – then the owl talks by itself`.

- [ ] **Step 1: Implement** the move and wiring. The auto-read `useEffect` in `OwlGuide` depends on `[auto, text, sprache]`, so a language switch reads the new text once (Review Focus 4).
- [ ] **Step 2: Verify** – `npm test`, `npm run build` pass. Start the preview (`preview_start`), open `/checkpoint/experimenta/`, switch to EN, open a card with auto-read on: the bubble shows the English sentence and `speechSynthesis` gets one utterance with `lang === "en-GB"` (check with `javascript_tool` by wrapping `speechSynthesis.speak` to log `lang`). The switch is ≥ 56px tall at 375px width (`resize_window` mobile, measure with `getBoundingClientRect`).
- [ ] **Step 3: Commit** – `feat(kinder): Sprachumschalter im Kinderbereich, Eule liest in der gewählten Sprache`

---

### Task 5: All fixed kids texts in German and English

**Files:**
- Create: `src/components/kinder/texte.ts` – `DE` object and `EN: typeof DE`, same pattern as `src/components/eltern/texte.ts`; export `KINDER_TEXTE: Record<Sprache, typeof DE>` and `useKinderTexte()` (uses `useSprache()`).
- Modify: `src/components/kinder/checkpoint-seite.tsx`, `karten-seite.tsx`, `live-karten.tsx`, `figur-baukasten.tsx`, `src/components/kinderreise/bild-karte.tsx`, `src/components/kinderreise/kinder-figuren.tsx` – every visible or spoken German string (labels, `aria-label`, owl greetings incl. the weekday greeting, "Da will ich hin!", "Alles", empty states, age badge text "Jahre"/"ab") comes from `useKinderTexte()`. Weekday in greetings via `toLocaleDateString(LOCALE[sprache], { weekday: "long" })`.
- Test: `tests/lib/emoji.test.ts` already scans `src/` – no change needed.

**Interfaces:**
- Consumes: `useSprache()` (Task 4), `LOCALE`.
- Produces: `useKinderTexte()`; text keys grouped by component (`karte`, `welt`, `blatt`, `figuren`, `eule`).

English copy: short, du-form equivalent ("you"), max ~10 words per kids card like German; "Da will ich hin!" → `I want to go there!`; "Alles" → `Everything`; "Neuer Ort?" not used on the kids map.

- [ ] **Step 1: Inventory** – `grep -nE "\"[A-ZÄÖÜ][^\"]{2,}\"|>[^<{]*[a-zäöü]{3}[^<{]*<" ` over the six files; every hit is either moved to `texte.ts` or is not user-facing (class names, ids). Expected: no German user-facing string left in those files.
- [ ] **Step 2: Implement** `texte.ts` and replace the strings.
- [ ] **Step 3: Verify** – `npm test`, `npm run build` pass (TypeScript fails if `EN` misses a key). In the preview, at 375px and desktop, walk `/kinder/` → age question → figure choice → `/checkpoint/experimenta/` → card → sheet, once in DE and once in EN: no German text in EN mode except provider titles on cards without an `owl` comment. Screenshot both.
- [ ] **Step 4: Commit** – `feat(kinder): ganzer Kinderbereich auf Deutsch und Englisch`

---

### Task 6: Review list on `/pruefen/`

**Files:**
- Create: `src/components/eulen-liste.tsx` – `EulenListe({ events }: { events: LiveEvent[] })`: table of upcoming events with original title, `kinder.de` (titel + satz) and `kinder.en`; a missing language shows "fehlt" (`Badge`), and the row links to `sourceUrl` for correcting in Mobilizon. Read-only.
- Modify: `src/components/pruefliste.tsx` – render `<EulenListe events={…} />` below the existing list, using the events it already loads.
- Modify: `docs/protokoll.md` – one line: `/pruefen/` zeigt die Eule-/Owl-Texte zum Gegenlesen; `kartenText()` statt Sprach-Parameter an `kinderKarten()`.

**Interfaces:**
- Consumes: `LiveEvent.kinder` (Task 2).

- [ ] **Step 1: Implement** with existing `src/components/ui/` parts only.
- [ ] **Step 2: Verify** – `npm test`, `npm run build`; preview `/pruefen/` shows the list; with no comments on the instance every row shows "fehlt" twice.
- [ ] **Step 3: Commit** – `feat(pruefen): Eule- und Owl-Texte zum Gegenlesen`

---

### Finish

- [ ] `npm test`, `npm run lint`, `npm run build` all pass on `feature/eule-owl`.
- [ ] Do not push or merge – ask the user (CLAUDE.md).
