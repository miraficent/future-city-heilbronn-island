# Eule & Owl: Kindersatz pro Event, Kinderbereich auf Deutsch und Englisch

Stand: 15.11.2026 · Status: Entwurf zur Freigabe

## Worum es geht

Die Eule soll zu jedem Event **einen kurzen Satz für Kinder** sagen, was sie dort erwartet
(„Hier baust du einen Roboter!“, „Let's have some fun with Lego!“). Heute bildet die Eule den Satz aus Thema, Art
und Kosten (`kinderGeschichte()` in `src/lib/kinder-text.ts`), weil Mobilizon-Events keinen Kindertext haben
(`story_kids: ""` in `src/lib/mobilizon.ts`).

Ein LLM bei jedem Kinderbesuch wäre zu teuer und widerspricht der Regel „keine KI-Chats für Kinder“. Deshalb:
**der Mobilizon-Event-Importer** schreibt den Satz **einmal pro Event** als Kommentar zweier eigener Konten:

- **`eule`** – Deutsch
- **`owl`** – Englisch

Wer sich bei Mobilizon als `eule` bzw. `owl` anmeldet, kann den Kommentar in der normalen Mobilizon-Oberfläche
korrigieren. Das Frontend liest die Kommentare mit dem Event und zeigt/liest den Satz in der gewählten Sprache.

Zusätzlich wird **der ganze Kinderbereich zweisprachig** (DE | EN), nicht nur der Eulensatz.

## Ziele

- Jedes Live-Event hat für Kinder einen kurzen Titel und einen Satz – auf Deutsch und Englisch.
- Texte sind von Menschen korrigierbar, ohne Code und ohne neues Werkzeug.
- Der Kinderbereich (Karte, Themenwelt, Bottom Sheet, Eule, Figurenwahl) ist komplett auf Englisch umschaltbar.
- Vorlesen klingt in der gewählten Sprache (`de-DE` bzw. `en-GB`).

## Nicht-Ziele

- Keine KI im Browser, kein LLM-Aufruf pro Kind.
- Beschreibungen der Anbieter für Eltern werden nicht übersetzt (bleiben im Original, wie im Eltern-Bereich).
- Keine weiteren Sprachen jetzt (der Aufbau soll sie aber nicht verbauen).

## Darf nie passieren (Anti-Ziele)

- Ein Text von einem fremden Konto (z. B. `eule@anderer-server`) oder einem beliebigen Besucher erreicht ein Kind.
- Der Importer überschreibt einen von Hand korrigierten Satz.
- Die Kinderseite ist leer oder halb Deutsch/halb Englisch, weil ein Kommentar fehlt.
- Eine Spracheinstellung oder ein Kommentar wird irgendwohin gesendet (Datenschutz-Regeln gelten unverändert).

## Ansätze, die wir abgewogen haben

| Ansatz | Vorteil | Nachteil |
|---|---|---|
| **A. Kommentare zweier Konten `eule`/`owl` (gewählt)** | Bearbeitbar in Mobilizon, kein neuer Dienst, Filter im Frontend trivial, Sprachen getrennt bearbeitbar | Zwei Logins; je neue Sprache ein Konto; Kommentare sind auf der Mobilizon-Seite öffentlich sichtbar |
| B. Ein Konto `eule`, zwei Kommentare mit Sprachkennung (`[de]`, `[en]`) | Ein Login | Text muss geparst werden; Tippfehler in der Kennung lassen den Satz verschwinden |
| C. Satz in die Event-Beschreibung schreiben | Kein Kommentar nötig | Verändert den Text des Anbieters, Eltern sehen ihn, Importer und Anbieter überschreiben sich gegenseitig |

Entscheidung: **A** (Cedric, 15.11.2026). Bei zwei Sprachen ist das zweite Konto der kleinere Preis.

## Vertrag zwischen Importer und Frontend

Das ist der Teil, auf den sich beide Seiten verlassen müssen.

### Konten

- Benutzernamen genau `eule` (Deutsch) und `owl` (Englisch), **auf unserer eigenen Instanz**.
- Das Frontend akzeptiert nur Kommentare, deren Konto lokal ist (Mobilizon: `actor.domain` ist leer/`null`).
  Gleichnamige Konten anderer Server werden ignoriert.

### Format eines Kommentars

Reiner Text, zwei Zeilen:

```
Roboter bauen mit LEGO
Hier baust du deinen eigenen Roboter und bringst ihn zum Fahren!
```

1. Zeile: **Kindertitel**, höchstens 5 Wörter, ohne Klammern/Untertitel (wie DESIGN.md Nr. 13).
2. Zeile: **Kindersatz**, ein Satz, du-Form, sagt, was das Kind dort tut oder erlebt. Höchstens ca. 15 Wörter.

Regeln für das Lesen im Frontend:
- Mobilizon speichert Kommentare als HTML → zuerst mit `htmlZuText()`-Logik in Text wandeln, Zeilen an `<br>`/`<p>`
  bzw. Zeilenumbruch trennen. Leere Zeilen ignorieren.
- Nur eine Zeile → das ist der **Satz**; der Titel kommt aus dem Rückfall.
- Mehr als zwei Zeilen → nur die ersten zwei zählen.
- Mehrere Kommentare desselben Kontos → der **neueste** (nach `updatedAt`, sonst `insertedAt`) gilt.
- Gelöschte Kommentare zählen nicht.
- Längen werden im Frontend gekappt (Titel 5 Wörter, Satz 160 Zeichen), damit ein Ausreißer das Layout nicht sprengt.

### Regeln für den Importer (Teil der Importer-Session)

- Schreibt einen Kommentar **nur, wenn das Konto noch keinen** an diesem Event hat. Nie bearbeiten, nie überschreiben.
- Neuer Satz gewünscht → Kommentar in Mobilizon löschen, der nächste Lauf schreibt einen neuen.
- Das LLM bekommt nur öffentliche Event-Texte (Titel, Beschreibung, Tags) – Regel aus `docs/regeln.md`.
- Erfindet nichts, was nicht im Text steht (kein „Roboter“, wenn es um KI-Ethik geht). Im Zweifel allgemeiner Satz.
- Keine Emojis (Teamregel).
- Offen für die Importer-Session: wann er läuft (Mobilizon meldet neue Events nicht von selbst → regelmäßig prüfen).

## Frontend

### Daten

- `src/lib/mobilizon.ts`: Abfrage um die Kommentare erweitern
  (`comments { text insertedAt updatedAt deletedAt actor { preferredUsername domain } }` – Feldnamen gegen das
  Schema der Instanz prüfen). Reine Funktion `eulenTexte(kommentare)` → `{ de?: KinderText, en?: KinderText }`
  mit `KinderText = { titel?: string; satz: string }`, getestet in `tests/lib/mobilizon.test.ts`.
- `LiveEvent` (`src/types.ts`) bekommt `kinder: { de?: KinderText; en?: KinderText }`.
  `story_kids`/`title_kids` bleiben vorerst als deutscher Rückfall.
- `kinderKarten()` (`src/lib/kinderkarten.ts`) nimmt die Sprache als Parameter und wählt Titel und Geschichte.
  Sicherheitsfilter (`fuerModus()`, `isForKids()`) bleiben unverändert.

### Rückfall (Kinderseite ist nie leer oder gemischt)

| Was fehlt | Titel | Satz |
|---|---|---|
| nichts | aus dem Kommentar | aus dem Kommentar |
| Titelzeile | `kinderTitel()` vom Original | aus dem Kommentar |
| Kommentar in dieser Sprache | `kinderTitel()` vom Original | `kinderGeschichte()` – **in dieser Sprache** |

Dafür bekommen `THEMA_SATZ`, `ART_SATZ` und „Es kostet nichts.“ eine englische Fassung.
Der Titel des Anbieters bleibt im letzten Fall im Original – das ist der einzige erlaubte Sprachmix.

### Sprache im Kinderbereich

- Eine gemeinsame Spracheinstellung für das Gerät: `useSprache()` aus `src/components/eltern/sprache.tsx` wird nach
  `src/lib/` bzw. `src/components/ui/` verschoben, damit Kinder- und Elternbereich sie teilen.
  (Gerätespeicher wie heute; Datenschutz unverändert: wird nirgendwohin gesendet.)
- Der Umschalter DE | EN erscheint auch im Kinderbereich (Top-Leiste, gleicher Stil, Touch-Ziel ≥ 56px,
  Beschriftung „DE“/„EN“ ohne Fahnen + `aria-label`).
- Alle festen Kindertexte (ca. 90 in `src/components/kinder/`, `kinder-figuren.tsx`, `bild-karte.tsx`,
  `kinder-text.ts`, Eule-Begrüßung, „Da will ich hin!“, „Heute/Morgen/Am Samstag“) kommen in eine Textdatei nach dem
  Muster von `src/components/eltern/texte.ts`.
- `kinderWann()`/`kinderTageszeit()` bekommen die Sprache (`Today`, `Tomorrow`, `On Saturday`, `Next week`).

### Vorlesen

- `vorlesen(text, sprache)` in `src/lib/sprechen.ts`: `de-DE` bzw. `en-GB`.
- Hat das Gerät keine englische Stimme, liest der Browser mit seiner Standardstimme – kein Fehler, kein Hinweis nötig.

### Prüfen

- Die Seite `/pruefen/` zeigt eine Liste der Eule-/Owl-Texte neben dem Originaltitel, damit jemand sie ab und zu
  gegenlesen kann (nur lesen; Korrektur in Mobilizon).

## Tests

- `eulenTexte()`: lokales vs. fremdes Konto, eine/zwei/drei Zeilen, mehrere Kommentare (neuester gewinnt),
  gelöschte, HTML, zu lange Texte.
- `kinderKarten()` mit Sprache: alle drei Zeilen der Rückfall-Tabelle.
- `kinderGeschichte()`/`kinderWann()` auf Englisch.
- Emoji-Test deckt die neue Textdatei ab.

## Dem Bauenden überlassen

- Genaue Ablage der gemeinsamen Spracheinstellung und der Kinder-Textdatei.
- Englische Formulierungen der festen Texte (kurz, kindgerecht, Regeln wie für Deutsch).
- Ob `story_kids`/`title_kids` später ganz durch `kinder.de` ersetzt werden.

## Meine Entscheidungen (bitte prüfen)

- Zwei-Zeilen-Format mit Kindertitel (statt nur Satz).
- Nur lokale Konten zählen; neuester Kommentar gewinnt.
- Eine gemeinsame Spracheinstellung für Eltern und Kinder auf dem Gerät.
- Englisch als `en-GB`.
- Prüfliste auf `/pruefen/` statt Freigabe-Schritt.
