# Heilbronn Island

Ein Prototyp für die **aim-Challenge „Learning Guide“** (Future City Hackathon 2026, Hochschule Heilbronn):
Alle Angebote zu **KI, Coding und Gaming** für Kinder und Jugendliche in Heilbronn an **einem** Ort –
von **aim, experimenta, Haus der Familie und IPAI**.

> **Neu im Team?** Lies zuerst diese Datei, dann [DESIGN.md](DESIGN.md) (das einheitliche Design),
> [docs/regeln.md](docs/regeln.md) (wie wir arbeiten) und [docs/protokoll.md](docs/protokoll.md) (Entscheidungen, offene Fragen).

---

## 1. Worum geht es? (die Challenge in 5 Sätzen)

1. In Heilbronn gibt es viele Kurse für Kinder, aber jede Einrichtung hat ihre eigene Webseite.
2. Eltern finden das Passende schwer, kleine Kinder können gar nicht selbst suchen.
3. Gesucht ist **ein Ort** für alle Angebote mit **einem eigenen Einstieg für Kinder, Jugendliche und Eltern**.
4. Es soll **mehr als eine Liste** sein, eine **Suche mit Filtern** haben und sich **fast von selbst aktuell halten**.
5. **Datenschutz:** Kinder brauchen kein Konto und melden sich nie selbst an – sie zeigen es ihren Eltern.

Die vollständige Gegenüberstellung mit dem Challenge-PDF: [docs/regeln-abgleich.md](docs/regeln-abgleich.md).

## 2. Wer macht was?

| Bereich | Wer | Was das heißt |
|---|---|---|
| **Daten** | **Cedric** | Liefert die Angebotsdaten (Import von den Webseiten, Pflege, Prüfung). Die Oberfläche verändert die Daten nie. |
| **Darstellung** | **das restliche Team** | Zeigt die vorhandenen Daten so gut wie möglich: Karte, Einrichtungsseiten, Eltern-Bereich. |

Die Schnittstelle zwischen beiden ist die **Datendatei** (siehe Abschnitt 6). Solange ihr Format gleich bleibt,
können beide Seiten unabhängig arbeiten.

## 3. Was die App enthält (Stand: 14.11.2026)

| Seite | Was | Für wen |
|---|---|---|
| `/` **Start** | Nachthimmel, die Eule fliegt herein, schwebende Themenbilder, zwei Karten: **„Kind“** und **„Eltern“** | alle |
| `/kinder/` **Karte** | Stadtansicht von Heilbronn (Neckar, Altstadt, Kilianskirche, Hauptbahnhof). Jedes Gebäude ist ein **Link** zu seiner Einrichtung, mit Anzahl kommender Angebote und „Heute!“-Stern. Die Eule fragt einmal nach dem Alter. | Kinder, Teens |
| `/checkpoint/[id]/` **Einrichtung** | Banner mit Gebäude, Eule, runde Kategorie-Knöpfe, Karten zum Wischen, Vorlesen, **„Da will ich hin!“**. COSMOS zeigt alle Angebote. | Kinder, Teens |
| `/eltern/` **Eltern** | „Das möchte Ihr Kind besuchen“, Suche mit allen Filtern, Infos, offizielle Links | Eltern, Fachkräfte |
| `/mitmachen/` | Neue Einrichtungen: Voraussetzungen und Formular (ohne Server) | Einrichtungen |
| `/styleguide/` | Alle Farben, Schriften und Bausteine | Team |
| `/pruefen/` | Unsichere Einträge – Kinder sehen sie nicht | Team |

**Nicht mehr enthalten:** alle Spiele (Laufwelt, Robo-Coding, Orakel, Karten wischen, Lernhaus-Aufgaben, Rakete).
**Noch offen:** der Teen-Bereich `/teen/`.

**Design:** Es gilt [DESIGN.md](DESIGN.md) – eine Quelle für Farben, Schriften (Baloo 2, Nunito), Formen, Symbole
(Lucide) und Bausteine (`src/components/ui/`). Wer etwas Neues braucht, trägt es zuerst dort ein.

## 4. Die offene Hauptfrage

> **Wie stellen wir die schon vorhandenen Daten besser dar?**

Die Daten sind da (78 Angebote, davon 61 öffentlich sichtbar, plus Veranstaltungen aus dem Event-Import).
Jetzt geht es nur noch um die Darstellung.
Ideen und Fragen zum Besprechen stehen in [docs/protokoll.md](docs/protokoll.md#offene-frage-wie-stellen-wir-die-daten-besser-dar).

## 5. Starten

Voraussetzung: Node.js 22.12+ (oder 24).

```bash
npm ci                 # einmalig: Pakete installieren
npm run dev            # Entwicklung mit automatischem Neuladen → http://localhost:3000
npm test               # alle automatischen Tests
npm run build          # Produktions-Build (vor jedem Push!)
```

Statische Vorführversion (ohne Server): `npm run export`, dann `npm run preview` → http://localhost:4173.
Unter Windows `npm.cmd` statt `npm` verwenden oder `Website-starten.cmd` doppelt anklicken.

## 6. Daten – woher sie kommen (Bereich von Cedric)

Die Veranstaltungen kommen live aus **Mobilizon**: Der Browser lädt sie einmal pro Sitzung über die GraphQL-API
(`NEXT_PUBLIC_MOBILIZON_URL`, Standard `http://localhost:4000`). Gepflegt wird direkt in Mobilizon, ohne Neubau.

| | Live-Veranstaltungen | Angebote (Kurse) |
|---|---|---|
| Woher | Mobilizon (eine Gruppe je Einrichtung) | `daten/angebote.json` – zurzeit leer |
| Erzeugt von | Mobilizon selbst, im Browser geladen (`src/lib/mobilizon.ts`) | `pipeline/` – `npm run pipeline` |
| Korrekturen | in Mobilizon; ohne erkanntes Alter Prüfliste `/pruefen/` | `konfiguration/korrekturen.csv` |
| Anleitung | [docs/pflege.md](docs/pflege.md) (Abschnitt Mobilizon) | [docs/pflege.md](docs/pflege.md) |

```text
Webseiten der Einrichtungen → Import → Themen- und Altersregeln (+ optional KI für Kindertexte)
  → Prüfung durch Menschen → JSON-Datei → Darstellung (Karte, Einrichtungsseiten, Eltern-Bereich)
```

Wichtig für die Darstellung:

- **Kinder sehen nur Angebote mit bekanntem Alter** und nur, was nicht „zur Prüfung“ markiert ist.
- Eine **neue Einrichtung** in der Quellentabelle erscheint automatisch mit einem einfachen Haus auf der Karte
  (eigenes Gebäude/Position: `src/lib/kinderkarte.ts`).
- Unterstützte Quellformate: `kufer-html`, `kufer-wp-api`, `experimenta-kalender`, `wp-sitemap-events` (Angebote)
  sowie iCal, experimenta-Seiten und Kufer-Listen (Veranstaltungen). Ein neues Webseiten-Format braucht einmalig Code.

## 7. Wo liegt was?

```text
src/app/                Seiten (Next.js): page.tsx = Start, kinder/, checkpoint/, eltern/, mitmachen/, styleguide/ …
src/components/ui/      Design-Bausteine (Button, Card, OwlGuide, EventCard …)
src/components/kinder/  Kinderseiten (Karte, Einrichtung)
src/components/kinderreise/  Stadtkarte (insel-karte.tsx) und Gebäude
src/lib/                Logik ohne Darstellung (Filter, Alter, Events) – hier stehen die Tests dazu
src/data/               categories.json (Kategorien der Live-Veranstaltungen)
daten/                  angebote.json, bericht.json (nur von der Pipeline geschrieben!)
konfiguration/          Tabellen zum Pflegen ohne Code
pipeline/, scripts/     Datenimport
tests/                  automatische Tests (Vitest)
docs/                   Regeln, Protokoll, Entscheidungen, Anleitungen
```

## 8. Datenschutz und Freigabe

- Kein Konto, keine Cookies, keine Analyse, kein KI-Chat. Kinder-Daten (Wünsche, Alter) bleiben nur in der Browsersitzung.
- Eine KI (falls aktiviert) bekommt **nur öffentliche Veranstaltungstexte**, nie Daten von Nutzenden.
- Bilder von fremden Webseiten werden nicht nachgeladen (sonst sähen fremde Server die IP-Adresse der Familie).
- Diese Fassung ist für die **lokale Vorführung**. Vor einer Veröffentlichung fehlen u. a. Betreiberangaben,
  Hosting-Datenverarbeitung und Vereinbarungen mit den Einrichtungen zur Datenübernahme.
  Einzelheiten: [docs/entscheidungen.md](docs/entscheidungen.md), [docs/quellen-check.md](docs/quellen-check.md).

## 9. Weitere Dokumente

| Dokument | Inhalt |
|---|---|
| [DESIGN.md](DESIGN.md) | **Das einheitliche Design** (Tokens, Schriften, Karte, Seiten, Bausteine) |
| [docs/regeln.md](docs/regeln.md) | **Verbindliche Team-Regeln** (Design, Kinder-UI, Daten, Code, Datenschutz) |
| [docs/protokoll.md](docs/protokoll.md) | **Protokoll**: Entscheidungen, Zuständigkeiten, offene Fragen, nächste Schritte |
| [docs/entscheidungen.md](docs/entscheidungen.md) | Ältere Architektur- und Designentscheidungen |
| [docs/regeln-abgleich.md](docs/regeln-abgleich.md) | Challenge-Anforderungen ↔ Umsetzung |
| [docs/pflege.md](docs/pflege.md) | Daten pflegen ohne Programmieren |
| [docs/demo-ablauf.md](docs/demo-ablauf.md) | Vorführablauf (wird nach der Entscheidung vom 14.11. angepasst) |

Frühere Stände (Laufwelt, Pixel-Spielwelt, Lernreise) sind in `docs/spielwelt-v2.md` und `docs/heilbronn-lernreise.md`
beschrieben. Sie sind seit dem 14.11.2026 entfernt.
