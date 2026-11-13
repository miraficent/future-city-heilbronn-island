# COSMOS-Entdecker – Bauplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein lauffähiger, live erreichbarer Prototyp, der KI-, Coding- und Gaming-Angebote von aim, experimenta, HdF und IPAI automatisch importiert und für Kinder, Teens und Eltern unterschiedlich darstellt.

**Architecture:** Eine TypeScript-Pipeline (`pipeline/`) liest die Konfigurations-CSVs, holt die Daten über vier Adapter, normalisiert und klassifiziert sie regelbasiert und schreibt `daten/angebote.json`, `daten/bericht.json` und `public/abo/*.ics`. Eine Next.js-App erzeugt daraus statische Seiten. Nur `/api/berater` (Claude) und `/api/signal` (Supabase) laufen auf dem Server.

**Tech Stack:** Next.js (App Router, TS strict), React, Tailwind CSS, motion (Framer Motion), zod, cheerio, csv-parse, vitest, tsx, qrcode, leaflet, @anthropic-ai/sdk, @supabase/supabase-js. Hosting auf Vercel, nächtlicher Job über GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-13-cosmos-entdecker-design.md`

**Hinweis zur Plantiefe:** Wegen der Deadline (Sonntag früh) legt der Plan Schnittstellen, Testfälle, Dateien und Befehle fest. Der Code entsteht direkt in den Dateien. HTML-Selektoren der Adapter werden beim Umsetzen gegen gespeicherte Fixtures ermittelt und dort durch Tests abgesichert.

---

## Dateistruktur

```
konfiguration/quellen.csv            Quellen (eine Zeile pro Einrichtung)
konfiguration/themen.csv             Themen + Schlagwörter
konfiguration/korrekturen.csv        manuelle Korrekturen
pipeline/run.ts                      Einstieg: npm run pipeline
pipeline/konfiguration.ts            CSV (Datei oder URL) → Quelle[], Thema[], Korrektur[]
pipeline/http.ts                     höflicher Fetch: User-Agent, Timeout, Retry, Pause
pipeline/adapters/index.ts           Registry adapter-name → Adapter
pipeline/adapters/kufer-wp-api.ts    HdF (JSON)
pipeline/adapters/kufer-html.ts      aim (Listen + Detailseiten)
pipeline/adapters/experimenta-kalender.ts
pipeline/adapters/wp-sitemap-events.ts  IPAI
pipeline/verarbeitung/text.ts        HTML→Text, Teaser kürzen
pipeline/verarbeitung/alter.ts       Altersangaben erkennen
pipeline/verarbeitung/themen.ts      Themen-Klassifizierung + Sicherheit
pipeline/verarbeitung/normalisieren.ts  RohAngebot → Angebot
pipeline/verarbeitung/zusammenfuehren.ts  Merge mit Vorlauf, letzte gute Daten
pipeline/verarbeitung/korrekturen.ts
pipeline/ausgabe/abos.ts             Kalender-Abos schreiben
pipeline/geo.ts                      Nominatim + Cache
src/lib/angebot.ts                   Typen + zod-Schema (geteilt)
src/lib/ics.ts                       ICS-Erzeugung (geteilt)
src/lib/pii.ts                       PII-Filter (geteilt)
src/lib/daten.ts                     Laden von angebote.json (Server)
src/lib/filter.ts                    Such-/Filterlogik (Client)
src/lib/speicher.ts                  session/localStorage mit try/catch
src/lib/signal.ts                    Client: anonymes Signal senden
src/app/...                          Routen laut Spec §4
src/components/...                   UI-Bausteine
tests/...                            vitest, Fixtures unter tests/fixtures/
daten/angebote.json, bericht.json, geo-cache.json
```

## Geteilte Typen (verbindlich für alle Tasks)

```ts
// src/lib/angebot.ts
export type Termin = { start: string; ende?: string };          // ISO mit Offset
export type Status = 'frei' | 'wenige' | 'ausgebucht' | 'unbekannt';
export type Art = 'kurs' | 'workshop' | 'veranstaltung' | 'ferienprogramm' | 'vortrag';
export type Zielgruppe = 'kinder' | 'teens' | 'eltern' | 'familien' | 'fachkraefte' | 'erwachsene';
export type Ort = { name: string; adresse?: string; lat?: number; lon?: number; online: boolean };
export type Angebot = { id; quelle; titel; teaser; url; bild?; themen: string[]; art: Art;
  zielgruppen: Zielgruppe[]; alterMin?; alterMax?; termine: Termin[]; ort: Ort;
  kosten: { euro: number | null; text: string }; status: Status; sicherheit: number;
  ausloeser: string[]; erstmalsGesehen: string };               // ausloeser = Schlagwörter, die Themen ausgelöst haben

// pipeline-intern
export type RohAngebot = { externeId: string; titel: string; beschreibung: string; url: string;
  bild?: string; termine: Termin[]; ort?: Partial<Ort> & { name: string };
  kostenEuro?: number | null; kostenText?: string; status?: Status;
  quellTags: string[]; artHinweis?: string };
export type Quelle = { id; name; website; adapter: string; startUrls: string[]; farbe: string; adresse: string };
export type Thema = { id: string; name: string; emoji: string; schlagwoerter: string[] };
export type Adapter = (quelle: Quelle, http: Http) => Promise<RohAngebot[]>;
```

---

## Phase 1 – Pflicht

### Task 1: Projekt aufsetzen
**Files:** `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `src/app/*`
- [ ] `npx create-next-app@latest` (TS, Tailwind, App Router, src-dir, ESLint, kein Turbopack-Zwang) in einem temporären Ordner erzeugen und ins Repo übernehmen
- [ ] Abhängigkeiten: `zod cheerio csv-parse motion qrcode` / dev: `vitest tsx @types/qrcode`
- [ ] Skripte: `pipeline` = `tsx pipeline/run.ts`, `test` = `vitest run`
- [ ] `tsconfig`: `strict: true`, `noUncheckedIndexedAccess: true`
- [ ] Prüfen: `npm run build` grün, `npm test` läuft (0 Tests ok)
- [ ] Commit `chore: Next.js-Projekt aufsetzen`

### Task 2: Typen, Text-Helfer, Konfiguration
**Files:** `src/lib/angebot.ts`, `pipeline/verarbeitung/text.ts`, `pipeline/konfiguration.ts`, `konfiguration/*.csv`, Tests `tests/pipeline/text.test.ts`, `tests/pipeline/konfiguration.test.ts`
- [ ] Tests: `htmlZuText('<p>A&amp;B</p><br>C')` → `'A&B\nC'`; `teaser(langerText, 300)` endet an Wortgrenze mit `…` und ist ≤ 300 Zeichen; CSV mit `|`-Listen → `startUrls` als Array; leere Zeilen werden ignoriert; fehlender `adapter` → Fehler mit Zeilennummer
- [ ] Umsetzen; zod-Schema `AngebotSchema` in `angebot.ts`
- [ ] CSVs mit den 4 Quellen (URLs aus Spec §2) und 3 Themen befüllen
- [ ] Tests grün → Commit

### Task 3: Alter und Themen klassifizieren
**Files:** `pipeline/verarbeitung/alter.ts`, `pipeline/verarbeitung/themen.ts`, Tests dazu
- [ ] Tests Alter: `'Scratch (8–11 Jahre)'` → {8,11}; `'Python lernen mit KI ab 16 Jahren'` → {16,undefined}; `'(12-16 Jahre)'` → {12,16}; `'Klasse 5 - 10'` → {10,15}; Tag `'ab-6-jahren'` → {6}; `'Schulkinder & Jugendliche (ab 6 Jahren)'` → {6}; `'Kindergartenkind (3-6 Jahre)'` → {3,6}; kein Treffer → {}
- [ ] Tests Themen: `'KI'` trifft „Python lernen mit KI“, aber nicht „Kinder“/„Skizze“; `'Programmier'` trifft „Programmieren“, aber nicht „Eltern-Kind-Programm“; Treffer im Titel ⇒ Sicherheit ≥ 0.8; nur im Teaser ⇒ < 0.6; Rückgabe enthält `ausloeser`
- [ ] Regel: Schlagwort ganz in Großbuchstaben und ≤ 3 Zeichen ⇒ ganzes Wort, Groß/klein beachten; sonst Wortanfang, Groß/klein egal
- [ ] Commit

### Task 4: Normalisieren, Korrekturen, Zusammenführen
**Files:** `pipeline/verarbeitung/normalisieren.ts`, `korrekturen.ts`, `zusammenfuehren.ts`, Tests
- [ ] Tests: RohAngebot ohne Thema ⇒ `null`; Alter 8–11 ⇒ Zielgruppe `kinder`; 12–17 ⇒ `teens`; quellTag `eltern` ⇒ `eltern`; `kostenEuro 0` ⇒ Text „kostenlos“; vergangene Termine werden entfernt und ein Angebot ohne zukünftigen Termin entfällt; Korrektur `ausblenden` entfernt; Korrektur `thema=gaming` setzt Thema und Sicherheit 1; Merge: `erstmalsGesehen` bleibt aus dem Vorlauf erhalten; neue Angebote bekommen das heutige Datum; bei Fehler einer Quelle werden die alten Angebote dieser Quelle übernommen
- [ ] Commit

### Task 5: HTTP + Adapter HdF (`kufer-wp-api`)
**Files:** `pipeline/http.ts`, `pipeline/adapters/kufer-wp-api.ts`, Fixture `tests/fixtures/hdf-kurse.json` (3 echte Kurse, Dozenten-Felder entfernt), Test
- [ ] Test `parseKuferWpApi(json, quelle)`: Titel, Termine aus `termine[]` (Europe/Berlin → ISO mit Offset), `kostenEuro` aus `gebnorm`, Status aus `tnanmeldungen/tnmax` (≥ 100 % ⇒ ausgebucht, ≥ 80 % ⇒ wenige), `quellTags` = Kategorien + Themen + Keywords; **kein** Feld enthält eine E-Mail (Regex-Prüfung über das ganze Ergebnis)
- [ ] Detail-URL-Muster der HdF-Seite aus dem JS-Bundle ermitteln
- [ ] Laden: Seiten `limit=100&page=N`, bis eine leere Liste kommt (max. 20)
- [ ] Commit

### Task 6: Adapter experimenta
**Files:** `pipeline/adapters/experimenta-kalender.ts`, Fixture (gekürzte echte Seite mit 5 Karten), Test
- [ ] Test: Karten mit gleicher Event-ID werden zu einem RohAngebot mit mehreren Terminen zusammengefasst; `data-groups` werden zu `quellTags`; Unix-Zeit wird zu ISO; Link ohne `?termin=`; Bild-URL; Ausbuchungs-Hinweis „ausgebucht“ im Text ⇒ Status `ausgebucht`
- [ ] Commit

### Task 7: Adapter aim (`kufer-html`)
**Files:** `pipeline/adapters/kufer-html.ts`, Fixtures (Liste + Detailseite), Test
- [ ] Test Liste: liefert pro Kurs knr, Titel, Detail-URL, Status; Duplikate über mehrere Listen werden entfernt
- [ ] Test Detail: Beschreibung, alle Termine (Tabelle, auch „Seite 1 von 2“ → zusätzlich ICS nutzen), Kosten „keine“ ⇒ 0, Ort
- [ ] ICS-Parser (`VEVENT` → `DTSTART/DTEND`) als Quelle für alle Termine
- [ ] Höflich: 400 ms Pause zwischen Anfragen
- [ ] Commit

### Task 8: Adapter IPAI (`wp-sitemap-events`)
**Files:** `pipeline/adapters/wp-sitemap-events.ts`, Fixture (eine Eventseite), Test
- [ ] Test: Titel, Typ aus der Zeile unter dem Titel (`Workshop` ⇒ artHinweis), Datum „23. November 2026“ + „15:00 – 17:00“ ⇒ ISO, Ort, „kostenfrei“ ⇒ 0, Zielgruppe ⇒ quellTag
- [ ] Laden: Sitemap → alle URLs → Detailseiten (Pause 400 ms)
- [ ] Commit

### Task 9: Pipeline-Lauf + Bericht + Abos + Geo
**Files:** `pipeline/run.ts`, `pipeline/adapters/index.ts`, `pipeline/geo.ts`, `pipeline/ausgabe/abos.ts`, `src/lib/ics.ts`, Tests für `ics.ts`
- [ ] Test ICS: gültiges `VCALENDAR` mit CRLF, Escaping von `,;\n`, Zeilen ≤ 75 Oktette gefaltet, `UID` stabil
- [ ] `run.ts`: Konfiguration laden → Adapter je Quelle in `try/catch` → normalisieren → Korrekturen → Merge mit dem alten `angebote.json` → zod-Validierung → schreiben; `bericht.json` mit {quelle, ok, anzahlRoh, anzahlAufgenommen, neu, unsicher[], fehler?, dauerMs}
- [ ] Abos: je Thema × {kinder, teens, eltern} plus `alle.ics`
- [ ] Geo: eindeutige Adressen → Nominatim (1 req/s) → `geo-cache.json`
- [ ] `npm run pipeline` live ausführen; Ergebnis prüfen (alle 4 Quellen ok, Anzahl plausibel, Stichproben gegen die Website)
- [ ] Commit inkl. `daten/*.json`

### Task 10: Gestaltungs-Fundament
**Files:** `src/app/layout.tsx`, `src/app/globals.css`, `src/components/ui/*`
- [ ] Skill `frontend-design` laden; visuelle Richtung „COSMOS“ festlegen (Tokens für Farben, Schrift, Abstände, drei Modus-Themes `kind | teen | eltern`)
- [ ] Schriften über `next/font` lokal ausliefern (keine Anfrage an Google zur Laufzeit)
- [ ] Basis-Bausteine: Knopf, Chip, Angebotskarte, Icon+Label, Modus-Hülle
- [ ] Commit

### Task 11: Startseite „Wer schaut gerade?“ + Daten laden + Filterlogik
**Files:** `src/app/page.tsx`, `src/lib/daten.ts`, `src/lib/filter.ts`, `src/lib/speicher.ts`, Test `tests/lib/filter.test.ts`
- [ ] Tests Filter: Volltext ohne Umlaut-Probleme („kunstliche“ findet „künstliche“); Alter 9 findet 8–11, nicht 12–16; Zeitraum; nur kostenlos; mehrere Themen = ODER; Sortierung nach nächstem Termin
- [ ] Drei Türen mit Animation; Wahl in `sessionStorage`
- [ ] Commit

### Task 12: Eltern-Modus + Detailseite
**Files:** `src/app/eltern/page.tsx`, `src/app/angebot/[id]/page.tsx`, `src/app/angebot/[id]/ics/route.ts`, Komponenten
- [ ] Suche + Filterleiste, Ergebnis als Wochen-Zeitleiste und als Liste
- [ ] Detail: statisch erzeugt (`generateStaticParams`), Open-Graph-Metadaten, ICS-Download, „Zur Anmeldung bei …“, Teilen
- [ ] Merkliste (localStorage) und „Neu seit letztem Besuch“
- [ ] Ferien-Radar: nächste BW-Schulferien (feste Liste 2026/27 in `src/lib/ferien.ts`) mit den passenden Angeboten
- [ ] Kalender-Abos: Abschnitt mit `webcal://`-Links auf `public/abo/*.ics`
- [ ] Commit

### Task 13: Kinder-Modus + „Zeig’s Mama/Papa“
**Files:** `src/app/kind/page.tsx`, `src/components/kind/*`
- [ ] Planeten-Karte (je Thema ein Planet, Sterne = Angebote mit passendem Alter, Altersauswahl über Bilder 6–7 / 8–9 / 10–11)
- [ ] Große Karten, 🔊 Vorlesen (SpeechSynthesis, `lang=de-DE`), alle Icons mit Text
- [ ] „Zeig’s Mama/Papa“: Sheet mit QR-Code (lokal erzeugt), Web-Share-API, WhatsApp-Link mit Text
- [ ] Commit

### Task 14: Teen-Modus + Datenschutzseite
**Files:** `src/app/teen/page.tsx`, `src/app/datenschutz/page.tsx`
- [ ] Dunkles Feed-Layout mit Filter-Chips; Merkliste
- [ ] Datenschutz zweistufig (kindgerecht / ausführlich)
- [ ] Commit

## Phase 2 – Soll

### Task 15: Bilder-Quiz + Wunsch-Board (Kind)
- [ ] 6–8 Bildkarten (Bauen, Geschichten, Spielen, Rätseln, Roboter, Malen, Musik, Forschen) mit Themen-Gewichten; Ergebnis = Top-Thema + 3 Empfehlungen; Sticker aufs Wunsch-Board (sessionStorage); Signal `quiz` je gewähltem Interesse
- [ ] Test: Gewichtung → erwartetes Top-Thema

### Task 16: PII-Filter + KI-Berater
**Files:** `src/lib/pii.ts`, `src/app/api/berater/route.ts`, `src/components/berater/*`, Test `tests/lib/pii.test.ts`
- [ ] Tests PII: E-Mail, Telefon (+49/0…), „Musterstraße 12“, PLZ + Ort, Datum `12.03.2016`, „ich heiße Lena“, „mein Sohn Paul“ ⇒ Platzhalter; „Kurs für 9-Jährige“ bleibt unverändert
- [ ] Skill `claude-api` laden; Route: zod-Eingabe, PII serverseitig erneut, Systemprompt mit kompakter Angebotsliste (id, titel, alter, themen, nächster Termin, kosten), Antwort als Text + empfohlene IDs; kurze Timeouts; ohne Schlüssel 503 mit freundlicher Meldung
- [ ] UI: KI-Kennzeichnung, Hinweis auf ersetzte Daten, Karten zu den empfohlenen IDs; Teen nur nach „16+“-Bestätigung
- [ ] Commit

### Task 17: Anonyme Signale + Insights + Prüf-Seite
**Files:** `src/app/api/signal/route.ts`, `src/lib/signal.ts`, `src/app/redaktion/*`, `src/middleware.ts`, Supabase-Migration
- [ ] Supabase-Projekt (Region eu-central-1), Tabelle + RPC laut Spec §7, RLS an
- [ ] Route: zod (typ ∈ suche|suche_leer|quiz|wunsch|klick), PII-Filter, Kürzung, Upsert-Inkrement; ohne Konfiguration nichts tun
- [ ] Wunschbaum: Kinder wählen Bild-Wünsche, Eltern schreiben Freitext (PII-Filter, ≤ 80 Zeichen); bei Suche ohne Treffer wird „Wünsch dir das!“ angeboten
- [ ] Redaktion: Passwort-Login (Cookie, HttpOnly, signiert), Insights-Diagramme, Prüf-Seite aus `bericht.json` + unsichere Angebote mit Auslösern + Anleitung für `korrekturen.csv`
- [ ] Commit

### Task 18: Deployment + nächtlicher Lauf
- [ ] GitHub-Repo (privat) anlegen und pushen
- [ ] `.github/workflows/daten.yml`: täglich 03:00 UTC `npm ci && npm run pipeline`, Commit bei Änderungen
- [ ] Vercel-Projekt verbinden, Umgebungsvariablen setzen, Live-URL prüfen (Handy-Breite)
- [ ] Commit

## Phase 3 – Kann

### Task 19: Sternbild-Lernpfade (Teen)
- [ ] Je Thema Angebote nach `alterMin` sortieren, zu einem Sternbild verbinden (SVG), Knoten = Angebot, Farbe = Einrichtung

### Task 20: Karte mit Entfernung (Eltern)
- [ ] Leaflet erst nach Klick laden; Punkt frei wählbar (Stadtteil-Liste oder Klick); Entfernung im Browser

### Task 21: Einfache Sprache / Englisch
- [ ] UI-Texte in `src/lib/texte.ts` je Sprache; Umschalter

## Phase 4 – Abgabe

### Task 22: README + Entscheidungs-Log + Pitch
- [ ] README: Was, Live-URL, Start lokal, **Pflege ohne IT** (Quellen-/Themen-/Korrekturen-Tabelle Schritt für Schritt), Architektur, Datenschutz
- [ ] `docs/entscheidungen.md`: jede Entscheidung → Quelle (NN/g Kinder & Teens, ICO Children’s Code, DSGVO Art. 5/8, AI Act Art. 50, WCAG 2.2, Anthropic-Nutzungsbedingungen zu Minderjährigen, robots.txt-Befunde)
- [ ] Pitch-Folien (Problem → Lösung → Live-Demo → Datenpipeline → Datenschutz → Skalierung)
- [ ] Abschluss: `npm test`, `npm run build`, `npm run pipeline` grün; Live-URL getestet
