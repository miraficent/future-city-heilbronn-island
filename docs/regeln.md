# Team-Regeln

Diese Regeln gelten für alle, die am Projekt arbeiten. Sie halten die App einheitlich, kindgerecht und
datenschutzfreundlich. Wer eine Regel ändern will: im Team besprechen und im [Protokoll](protokoll.md) festhalten.

---

## 1. Einheitliches Design

**Es gilt [DESIGN.md](../DESIGN.md)** – für Karte, Kinderseiten, Eltern-Bereich, alle Seiten.
Oben in DESIGN.md stehen die „Projektentscheidungen“; sie gehen dem Rest der Datei vor.

- **Nur Tokens aus DESIGN.md** (in `src/app/globals.css`, Kartenfarben in `src/lib/kinderkarte.ts`).
  Keine festen Farbwerte in Komponenten – Einrichtungsfarben kommen aus den Daten.
- **Nur Bausteine aus `src/components/ui/`** (Button, Card, Badge, Pill, BackButton, OwlGuide, EventCard …).
  Fehlt etwas: zuerst in DESIGN.md beschreiben, dann als Baustein bauen.
- **Schriften:** Baloo 2 (Überschriften), Nunito (Text) – lokal in `public/fonts/`.
- **Symbole:** Lucide über `src/components/symbol.tsx`. **Keine Emojis** (Test: `tests/lib/emoji.test.ts`).
- **Tiefe = „chunky bottom“**, keine Verläufe, kein Blur.
- Nachsehen, wie alles aussieht: **`/styleguide/`**.

## 2. Was es gibt – und was nicht mehr

Stand 14.11.2026 (Details im Protokoll):

- ✅ **Startseite** mit zwei Karten „Für mich“ / „Für mein Kind“.
- ✅ **Eltern-Bereich** – hier steht alles mit viel Text: Suche, Filter, Infos, offizielle Links.
- ✅ **Karte** (Stadtansicht Heilbronn) – Gebäude sind Links zu den Einrichtungsseiten.
- ✅ **Einrichtungsseiten** (`/checkpoint/…`) mit den Angeboten.
- ❌ **Spiele** – entfernt, nicht wieder einbauen.
- ⏳ **Teen-Bereich** – offen.

## 3. Kinder-Oberfläche

Grundlage: Challenge-PDF Paket A, NN/g, ICO Children's Code (siehe [regeln-abgleich.md](regeln-abgleich.md)).

- **Schrift mindestens 20 px**, kurze Wörter, kurze Sätze. Kinder lesen erst ab etwa 8 Jahren sicher.
- **Jeder Text für Kinder hat einen Vorlese-Knopf** (Web Speech API, `de-DE`, lokal) – über `OwlGuide`.
- **Tippflächen mindestens 48 px**, auf der Karte mindestens 56 px, Kategorie-Knöpfe mindestens 72 px.
- **Bilder und Symbole zuerst, Text danach.** Kein Freitext-Eingabefeld für Kinder.
- **Kinder melden sich nie selbst an.** Nur „Da will ich hin!“ → die Eltern sehen es und melden an.
- **Kein Druck:** keine Ranglisten, keine Login-Serien, keine Zeitlimits.
- **Bewegung respektieren:** Jede Animation hat eine Variante für `prefers-reduced-motion`.
- **Tastatur und Screenreader:** alles erreichbar, sinnvolle `aria-label`, sichtbarer Fokus.
- **Handy zuerst testen** (390 px Breite) – Karte und Knöpfe müssen dort passen.

## 4. Daten

- **Cedric ist für die Daten zuständig.** Die Darstellung liest sie nur.
- **Datendateien nie von Hand oder aus Komponenten ändern:** `daten/angebote.json`. Veranstaltungen werden in Mobilizon gepflegt.
  Korrekturen über `konfiguration/korrekturen.csv` bzw. die Prüfliste.
- **Kinder sehen nur:** Angebote mit bekanntem Alter, passender Zielgruppe (Kinder/Teens) und ohne Prüf-Markierung.
  Dafür **immer** `kinderKarten()` (`src/lib/kinderkarten.ts`) benutzen – es nutzt `fuerModus` und `isForKids`. Nie eigene Filter für Kinder schreiben.
- **Nichts erfinden:** Fehlt eine Angabe (Alter, Preis), zeigen wir „unbekannt“ – nie einen geschätzten Wert als sicher.
- **Beispiel-Daten** (`isDummy`) sind immer sichtbar als „Beispiel“ gekennzeichnet.
- **Neue Einrichtung** = eine Zeile in der Quellentabelle. Die Karte zeigt sie automatisch an.

## 5. Datenschutz

- Kein Konto, keine Cookies, kein Tracking, keine Analyse, kein KI-Chat für Kinder.
- Kinder-Daten (Alter, Wünsche) nur in `sessionStorage` – weg, wenn der Browser zu ist.
- Keine Bilder, Schriften oder Skripte von fremden Servern nachladen. Schriften liegen in `public/fonts/`.
- Eine KI bekommt nur **öffentliche Veranstaltungstexte**, nie Eingaben oder Daten von Nutzenden.
- **Nie Schlüssel oder Passwörter committen.** Sie gehören in `.env.local` (lokal) oder in GitHub Secrets.

## 6. Code und Zusammenarbeit

- **Ein Branch pro Aufgabe** (`feature/…`, `fix/…`). Nicht direkt auf `main` arbeiten.
- **Vor jedem Push:** `npm test` und `npm run build` müssen grün sein.
- **Logik in `src/lib/`** (ohne Darstellung, mit Test in `tests/lib/`), **Darstellung in `src/components/`**.
- Konfiguration statt Sonderfälle: **keine eigene Seite pro Einrichtung** – eine Seite liest ihre Einrichtung aus den Daten.
- Kommentare kurz und verständlich; die Jury liest den Code.
- Commit-Nachrichten: was und warum, z. B. `feat(karte): Heute-Hinweis am Pin`.
- Wer etwas entscheidet oder ändert, das andere betrifft: **ins Protokoll schreiben.**
