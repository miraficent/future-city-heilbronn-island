# COSMOS-Entdecker – Design-Spezifikation

**Stand:** 13.11.2026 · **Abgabe:** Sonntag, 15.11.2026 früh · **Challenge:** aim „Learning Guide“ (siehe `aim/aim_Challenge_Learning_Guide_readme.pdf`)

## 1. Ziel

Ein Prototyp, der die Lern- und Freizeitangebote von **aim, experimenta, Haus der Familie (HdF) und IPAI** zu **KI, Coding und Gaming** an einem Ort bündelt. Er richtet sich an Kinder (6–11), Teens (12–17) und Eltern bzw. Fachkräfte. Er pflegt sich weitgehend selbst, braucht keine Konten und liefert aim anonyme Insights darüber, was Familien suchen.

Erfolgskriterien (aus der README abgeleitet):
- Echte, automatisch importierte Daten aus allen 4 Quellen.
- Neue Einrichtung oder neues Thema = eine Tabellenzeile, ohne Code.
- Kindgerecht und zugleich für Erwachsene ansprechend; Darstellung jenseits von Liste oder Kalender.
- Übersicht plus Suche und Filter nach Thema, Alter, Datum und Art.
- Datenschutz: keine Konten, keine personenbezogenen Daten von Kindern.
- Jede Design-Entscheidung ist in `docs/entscheidungen.md` mit einer Quelle belegt.

## 2. Datenquellen (live geprüft am 13.11.2026)

| Quelle | System | Zugriff | Felder |
|---|---|---|---|
| HdF | WordPress + Plugin `mmmake-kufer` | JSON: `https://hdf-hn.de/wp-json/mmmake-kufer/v2/kurse?limit=100&page=N` (600 Kurse, leere Seite = Ende) | knr, haupttitel, inhalt, beginndat/endedat, termine[], ort, gebnorm, tnanmeldungen/tnmax, keywords, kategorien (Altersgruppen), themen |
| experimenta | WordPress | HTML `https://www.experimenta.science/besuchen/veranstaltungen/`; Karten `.veranstaltungen-card` mit `data-groups` (JSON), `data-date-start/end` (Unix) | Titel (h5), Teaser (p), Link, Bild, Kategorien und Zielgruppen in `data-groups` |
| aim | TYPO3 + KuferWeb | HTML-Listen (4 URLs aus der README) → Detailseiten `/kurse/kurs/<slug>/<knr>`; iCal `/kuferweb/webbasys/ics.php?knr=<knr>` | Titel inkl. Alter „(8–11 Jahre)“, Status (frei/ausgebucht), Termine, Ort, Kosten, Beschreibung |
| IPAI | WordPress, REST gesperrt | `https://ipai-foundation.ai/wp-sitemap-posts-event-1.xml` → Detailseiten mit „Keyfacts“ | Titel, Typ (Workshop …), Datum, Zeit, Ort, Zielgruppe, Teilnahme (kostenfrei) |

Rechtliches und Ethik:
- robots.txt erlaubt alle genutzten Pfade.
- Wir übernehmen nur Fakten und einen gekürzten Teaser (≤ 300 Zeichen) und verlinken immer auf das Original. Die Anmeldung läuft dort.
- Die HdF-API liefert Dozenten-Daten (inkl. E-Mail). Diese Felder werden **nie** übernommen (Whitelist-Mapping).
- Langfristig: Vereinbarung mit den Einrichtungen; ein aktivierter Kufer-RSS- oder JSON-Export würde das Scraping ersetzen.

## 3. Architektur

```
konfiguration/quellen.csv ─┐
konfiguration/themen.csv  ─┼─► pipeline (nächtlich, GitHub Actions)
konfiguration/korrekturen.csv ┘   adapters → normalisieren → klassifizieren → korrekturen → validieren (zod)
                                   │
                                   ├─► daten/angebote.json   (alle Angebote, gemergt mit Vorlauf → erstmalsGesehen)
                                   ├─► daten/bericht.json    (pro Quelle: ok/fehler, neu, unsicher)
                                   └─► public/abo/*.ics      (Kalender-Abos je Thema × Zielgruppe)

Next.js-App (Vercel)
  Seiten statisch aus daten/angebote.json
  /api/berater  → Claude API (PII-Filter, nur Eltern/Teens 16+)
  /api/signal   → Supabase (EU) anonyme Tageszähler
  /redaktion/*  → Insights + Prüf-Seite (Passwort per Umgebungsvariable)
```

- **Ein Paket:** Next.js (App Router, TypeScript strict) im Projektwurzelverzeichnis; die Pipeline liegt unter `pipeline/` und läuft mit `tsx`.
- **Fehlerfall Quelle:** Schlägt ein Adapter fehl, bleiben die letzten guten Daten dieser Quelle erhalten. Der Fehler landet in `bericht.json` und ist auf der Prüf-Seite sichtbar. Ein Fehler bricht nie den ganzen Lauf ab.
- **Produktiv-Option:** Die CSVs können als Google-Sheet „im Web veröffentlicht“ werden. Die Pipeline akzeptiert dann eine URL statt eines Pfads (`QUELLEN_CSV_URL`, `THEMEN_CSV_URL`, `KORREKTUREN_CSV_URL`).

### 3.1 Konfiguration (für Nicht-Techniker)

`quellen.csv`: `id,name,website,adapter,start_urls,farbe,adresse`
- `adapter` ∈ `kufer-wp-api | kufer-html | experimenta-kalender | wp-sitemap-events | ical`
- Mehrere `start_urls` werden mit `|` getrennt.

`themen.csv`: `id,name,emoji,schlagwoerter`
- Schlagwörter durch `|` getrennt, Groß-/Kleinschreibung egal.
- Start-Themen: `ki` (KI, künstliche Intelligenz, ChatGPT, Machine Learning, Data …), `coding` (Programmier, Coding, Scratch, Python, Calliope, Mikrocontroller, Roboter, App …), `gaming` (Game, Spiel(e)entwicklung, Unity, Minecraft, Gaming, Esport …).

`korrekturen.csv`: `angebot_id,aktion,wert`
- `aktion` ∈ `ausblenden | thema | alter | zielgruppe`

### 3.2 Datenmodell

```ts
type Angebot = {
  id: string;                    // `${quelle}:${externeId}`
  quelle: string;                // id aus quellen.csv
  titel: string;
  teaser: string;                // ≤ 300 Zeichen, Klartext
  url: string;                   // Originalseite (Anmeldung dort)
  bild?: string;
  themen: string[];              // ids aus themen.csv; leer ⇒ nicht aufgenommen
  art: 'kurs' | 'workshop' | 'veranstaltung' | 'ferienprogramm' | 'vortrag';
  zielgruppen: Array<'kinder' | 'teens' | 'eltern' | 'familien' | 'fachkraefte' | 'erwachsene'>;
  alterMin?: number;
  alterMax?: number;
  termine: Array<{ start: string; ende?: string }>; // ISO 8601, Europe/Berlin
  ort: { name: string; adresse?: string; lat?: number; lon?: number; online: boolean };
  kosten: { euro: number | null; text: string };    // 0 = kostenlos
  status: 'frei' | 'wenige' | 'ausgebucht' | 'unbekannt';
  sicherheit: number;            // 0..1; < 0.6 ⇒ Prüf-Seite
  erstmalsGesehen: string;       // ISO-Datum
};
```

### 3.3 Klassifizieren (regelbasiert, transparent)

- **Themen:** Schlagwort-Treffer in Titel und Teaser (Titel zählt doppelt). Die Sicherheit steigt mit der Zahl der Treffer. Ein Treffer nur im Teaser bedeutet Sicherheit < 0.6, das Angebot geht auf die Prüf-Seite.
- **Alter:** Regex auf Muster wie „(8–11 Jahre)“, „ab 14“, „ab 6 Jahren“, „Klasse 5–10“ (→ Alter + 5) und auf HdF-Kategorien bzw. experimenta-Tags.
- **Zielgruppen:** Alter < 12 ⇒ kinder, 12–17 ⇒ teens. Dazu kommen die Kategorien der Quelle (Eltern, Familien, Erwachsene, Fortbildung ⇒ fachkraefte).
- **Ziel:** Jede Entscheidung ist mit dem Schlagwort, das sie ausgelöst hat, auf der Prüf-Seite nachvollziehbar.

### 3.4 Geodaten

Die Adressen der Orte werden einmalig über Nominatim/OSM geokodiert (1 Anfrage pro Sekunde, eigener User-Agent) und in `daten/geo-cache.json` zwischengespeichert. Die Entfernung zum Nutzer berechnet ausschließlich der Browser (Haversine).

## 4. Oberfläche

**Leitidee:** COSMOS HN wird zum Weltall. Themen sind Planeten (🤖 KI, 💻 Coding, 🎮 Gaming), Angebote sind Sterne. Dieselbe Bildsprache erscheint in drei Härtegraden.

| Route | Inhalt |
|---|---|
| `/` | „Wer schaut gerade?“ – drei große Türen: Kind 🚀 / Teen ⚡ / Eltern & Fachkräfte 🧭. Die Wahl wird nur in `sessionStorage` gespeichert. |
| `/kind` | Planeten-Karte (ein Planet pro Thema, Sterne = Angebote ab passendem Alter); große Karten mit Bild, Icons (Alter, wann, wo, „kostenlos“); 🔊 Vorlesen (Web Speech API); **Bilder-Quiz** „Was macht dir Spaß?“ (6–8 Bildkarten → Themen-Gewichtung → Empfehlungen); **Wunsch-Board** (Sticker sammeln, nur Sitzung); **„Zeig’s Mama/Papa“** (Share-Link, QR-Code, WhatsApp-Text). Kein Freitext. |
| `/teen` | Dunkles, reduziertes Design; Feed mit Filtern; **Sternbild-Lernpfade** (Angebote eines Themas nach Alter und Niveau verbunden, über Einrichtungen hinweg); ab 16: KI-Berater. |
| `/eltern` | Suche (Volltext) + Filter (Thema, Alter, Zeitraum, Art, kostenlos, Einrichtung); Ansichten **Wochen-Zeitleiste**, **Karte** (Leaflet/OSM, Entfernung zu frei gewähltem Punkt, nur lokal), Liste; KI-Berater; Kalender-Abos. |
| `/angebot/[id]` | Detailseite (statisch, SEO, Open-Graph-Vorschau für Messenger); `.ics`-Download; „Zur Anmeldung bei <Einrichtung>“. |
| `/datenschutz` | Zweistufig: kindgerecht („Wir merken uns nichts über dich …“) und ausführlich. |
| `/redaktion` | Passwortgeschützt: **Insights** und **Prüf-Seite** (Quellenstatus, neue und unsichere Angebote mit Auslöser-Schlagwort, Anleitung „so trägst du eine Korrektur ein“). |

**Wiederkommen ohne Konto:**
- „Neu seit deinem letzten Besuch“ (Datum des letzten Besuchs in `localStorage`, nur bei Eltern und Teens).
- Merkliste in `localStorage` bei Eltern und Teens bzw. `sessionStorage` bei Kindern.
- Kalender-Abo (`webcal://…/abo/coding-kinder.ics`).
- Ferien-Radar.
- **Keine** Login-Streaks, keine Ranglisten.

**Barrierefreiheit:** WCAG 2.2 AA (Kontrast, Fokus, Tastatur, `prefers-reduced-motion`), Klickflächen ≥ 44 px (Kinder ≥ 56 px), gut lesbare serifenlose Schrift, kurze Sätze, Icons immer mit Text.

## 5. Datenschutz (Privacy by Design)

- Keine Konten, keine Cookies, kein Tracking von Drittanbietern; Schriften und Kartenkacheln werden so eingebunden, dass ohne Interaktion keine Daten an Dritte gehen (Karte erst nach Klick laden).
- Kinder-Modus: Daten liegen nur in `sessionStorage` und sind beim Schließen weg. Kein Freitext, keine Standortabfrage.
- Standort: nur auf Wunsch, nur im Browser, wird nie gesendet.
- Anonyme Signale (`/api/signal`): `{tag, typ, wert, altersgruppe}` werden nur hochgezählt. Ohne IP, ohne ID, ohne Uhrzeit. Suchbegriffe laufen vorher durch den PII-Filter, Länge ≤ 40.
- DSGVO Art. 8 (Deutschland: 16 Jahre): Da keine personenbezogenen Daten von Kindern verarbeitet werden, ist keine Einwilligung nötig. Kinder können sich nicht selbst anmelden; die Anmeldung läuft über die Eltern auf der Originalseite.

## 6. KI-Berater

- Sichtbar nur in `/eltern` und `/teen` (dort nach Bestätigung „Ich bin 16 oder älter“). Im Kinder-Modus gibt es ihn nicht.
- Der Berater ist klar als KI gekennzeichnet (EU AI Act Art. 50): Avatar „KI“ und Hinweis „Ich bin eine KI, kein Mensch“.
- **PII-Filter vor dem Senden**, im Client und noch einmal auf dem Server: E-Mail, Telefon, Straße + Hausnummer, PLZ, Geburtsdatum und Namen nach Mustern wie „ich heiße …“ / „mein Sohn …“ werden durch Platzhalter ersetzt. Der Nutzer sieht, was ersetzt wurde.
- Server-Route mit Claude API; der Schlüssel liegt nur in `ANTHROPIC_API_KEY` auf dem Server. Der Systemprompt enthält die gefilterte Angebotsliste; die Antworten dürfen nur auf Angebote aus der Liste verweisen (mit ID → Karte). Rückfragen sind erlaubt, Antworten bleiben kurz und altersgerecht.
- Der Verlauf liegt nur im Browser (Sitzung); serverseitig wird nichts gespeichert.
- Ratenbegrenzung pro Instanz; bei Fehler oder fehlendem Schlüssel erscheint ein freundlicher Hinweis und der Verweis auf die Suche.

## 7. Insights für Einrichtungen (`/redaktion`)

- Top-Suchbegriffe; **Suchen ohne Treffer** (Lücken im Angebot); Quiz-Interessen nach Altersgruppe; Wunschbaum (Kinder wählen Bild-Wünsche, Eltern Freitext mit PII-Filter); Klicks pro Angebot und Einrichtung; Gerätezahlen gibt es nicht.
- Datenqualität: letzter Lauf pro Quelle, Fehler, neue und unsichere Angebote.
- Speicher: Supabase, Region Frankfurt. Tabelle `signale(tag date, typ text, wert text, altersgruppe text, anzahl int, PK(tag,typ,wert,altersgruppe))` und RPC `signal_zaehlen`. RLS aktiv ohne öffentliche Policies; Zugriff nur serverseitig mit Service-Key.
- Ohne Supabase-Konfiguration fällt das System auf Demo-Daten zurück, und das ist sichtbar markiert.

## 8. Tests

- Vitest. Adapter-Tests mit gespeicherten HTML/JSON-Fixtures (nicht live).
- Tests für Klassifizierer (Themen, Alter), PII-Filter und ICS-Erzeugung.
- `npm run pipeline` gegen die Live-Quellen als Smoke-Test; `npm run build` muss grün sein.

## 9. Umfang und Reihenfolge

1. **Pflicht:** Pipeline mit 4 Adaptern, Konfiguration und Daten · Startseite und 3 Modi · Suche und Filter · Detailseite mit ICS · Zeig’s Mama/Papa · Datenschutzseite.
2. **Soll:** Bilder-Quiz und Wunsch-Board · KI-Berater · Signale und Insights · Kalender-Abos · Prüf-Seite · Vercel-Deployment · GitHub-Action.
3. **Kann:** Sternbild-Lernpfade · Karte mit Entfernung · Umschalter für einfache Sprache und Englisch.
4. **Abgabe:** README (Start, Pflege, Architektur), `docs/entscheidungen.md`, Pitch-Folien.

## 10. Bewusst nicht enthalten

Benutzerkonten, Anmeldung oder Buchung in der App, E-Mail-Benachrichtigungen (ersetzt durch Kalender-Abos), Push-Nachrichten, Freitext für Kinder.
