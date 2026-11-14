/**
 * Demo-Modus: ~25 Beispiel-Events mit Datum RELATIV zu heute (heute+1, +3, +7 …), klar als isDummy markiert,
 * damit die Karte in jeder Vorführung „Heute!“ und volle Häuser zeigt.
 * Dazu zwei echte experimenta-Shows (VAST, Sonnensystem) mit ihren echten Terminen aus dem Import.
 *
 * Direkt aufrufbar: `npm run events:seed` schreibt nur Demo-Daten (ohne Internet).
 */
import { writeFileSync } from "node:fs";
import type { LiveEvent } from "../../src/types";
import { slug, type RawEvent } from "./lib";

type Vorlage = Omit<LiveEvent, "id" | "start" | "end" | "lastUpdated" | "isDummy" | "needsReview" | "image" | "registrationUrl" | "sourceUrl"> & {
  tag: number;
  uhr: string;
  dauerMin: number;
};

const WEBSEITE: Record<string, string> = {
  aim: "https://www.aim-akademie.org/",
  experimenta: "https://www.experimenta.science/",
  hdf: "https://hdf-hn.de/",
  ipai: "https://ipai-foundation.ai/",
};

const VORLAGEN: Vorlage[] = [
  { tag: 0, uhr: "15:00", dauerMin: 90, institutionId: "aim", title: "Robo-Werkstatt (Beispiel)", title_kids: "Roboter bauen", categories: ["coding"], ageMin: 8, ageMax: 11, type: "workshop", location: "Bildungscampus", cost: "kostenlos", story_kids: "Du baust einen kleinen Roboter. Dann bringst du ihm Tricks bei.", description_parents: "Beispiel-Eintrag für die Demo." },
  { tag: 0, uhr: "18:30", dauerMin: 60, institutionId: "experimenta", title: "Sternenabend im Science Dome (Beispiel)", title_kids: "Sterne gucken am Abend", categories: ["astronomy"], ageMin: 8, ageMax: null, type: "show", location: "experimenta", cost: "6 € / 4 €", story_kids: "Der Himmel über dir leuchtet. Du siehst Planeten und Sterne.", description_parents: "Beispiel-Eintrag für die Demo." },
  { tag: 1, uhr: "10:00", dauerMin: 120, institutionId: "hdf", title: "Trickfilm-Werkstatt für Familien (Beispiel)", title_kids: "Trickfilm mit der Familie", categories: ["art", "family"], ageMin: 6, ageMax: 10, type: "workshop", location: "Haus der Familie", cost: "kostenlos", story_kids: "Ihr macht zusammen einen kleinen Film. Deine Figuren lernen laufen.", description_parents: "Beispiel-Eintrag für die Demo." },
  { tag: 1, uhr: "14:00", dauerMin: 90, institutionId: "aim", title: "Scratch-Spiele programmieren (Beispiel)", title_kids: "Dein erstes Spiel", categories: ["coding"], ageMin: 8, ageMax: 12, type: "workshop", location: "Bildungscampus", cost: "kostenlos", story_kids: "Du programmierst ein Spiel mit Scratch. Deine Katze springt über Hindernisse.", description_parents: "Beispiel-Eintrag für die Demo." },
  { tag: 2, uhr: "16:00", dauerMin: 60, institutionId: "experimenta", title: "Blitz und Donner im Labor (Beispiel)", title_kids: "Blitze im Labor", categories: ["physics"], ageMin: 8, ageMax: null, type: "show", location: "experimenta", cost: "im Eintritt", story_kids: "Es knistert und blitzt. Du siehst, wie Strom funktioniert.", description_parents: "Beispiel-Eintrag für die Demo." },
  { tag: 2, uhr: "15:30", dauerMin: 90, institutionId: "ipai", title: "KI-Detektive (Beispiel)", title_kids: "Echt oder KI?", categories: ["it"], ageMin: 10, ageMax: 14, type: "workshop", location: "IPAI Spaces", cost: "kostenlos", story_kids: "Manche Bilder macht ein Computer. Du findest heraus, welche.", description_parents: "Beispiel-Eintrag für die Demo." },
  { tag: 3, uhr: "10:30", dauerMin: 90, institutionId: "hdf", title: "Natur-Detektive im Park (Beispiel)", title_kids: "Natur-Detektive", categories: ["biology", "family"], ageMin: 5, ageMax: 8, type: "event", location: "Haus der Familie", cost: "3 €", story_kids: "Du suchst Käfer und Blätter. Mit der Lupe siehst du alles groß.", description_parents: "Beispiel-Eintrag für die Demo." },
  { tag: 3, uhr: "16:00", dauerMin: 90, institutionId: "aim", title: "Mathe-Rätsel-Club (Beispiel)", title_kids: "Knobeln mit Zahlen", categories: ["math"], ageMin: 9, ageMax: 12, type: "course", location: "Bildungscampus", cost: "kostenlos", story_kids: "Du löst knifflige Rätsel. Zusammen findet ihr jede Lösung.", description_parents: "Beispiel-Eintrag für die Demo." },
  { tag: 4, uhr: "11:00", dauerMin: 45, institutionId: "experimenta", title: "Reise zum Mars (Beispiel)", title_kids: "Flug zum Mars", categories: ["astronomy"], ageMin: 8, ageMax: null, type: "show", location: "experimenta", cost: "6 € / 4 €", story_kids: "Du fliegst zum roten Planeten. Dort ist es sehr kalt.", description_parents: "Beispiel-Eintrag für die Demo." },
  { tag: 5, uhr: "14:00", dauerMin: 120, institutionId: "ipai", title: "Chatbot selber bauen (Beispiel)", title_kids: "Baue deinen Chatbot", categories: ["it", "coding"], ageMin: 11, ageMax: 14, type: "workshop", location: "IPAI Spaces", cost: "kostenlos", story_kids: "Du baust einen kleinen Chatbot. Er antwortet auf deine Fragen.", description_parents: "Beispiel-Eintrag für die Demo." },
  { tag: 6, uhr: "10:00", dauerMin: 180, institutionId: "experimenta", title: "Familien-Forschertag (Beispiel)", title_kids: "Forschertag für alle", categories: ["family", "physics"], ageMin: 4, ageMax: 10, type: "event", location: "experimenta", cost: "im Eintritt", story_kids: "Ihr forscht als Familie. An jedem Tisch wartet ein Experiment.", description_parents: "Beispiel-Eintrag für die Demo." },
  { tag: 7, uhr: "15:00", dauerMin: 90, institutionId: "aim", title: "Game-Design für Einsteiger (Beispiel)", title_kids: "Spiele selbst erfinden", categories: ["coding", "art"], ageMin: 10, ageMax: 14, type: "workshop", location: "Bildungscampus", cost: "kostenlos", story_kids: "Du erfindest ein eigenes Spiel. Du malst Figuren und baust Level.", description_parents: "Beispiel-Eintrag für die Demo." },
  { tag: 8, uhr: "16:30", dauerMin: 60, institutionId: "hdf", title: "Vorlese-Stunde mit Tablet (Beispiel)", title_kids: "Geschichten am Tablet", categories: ["art", "family"], ageMin: 4, ageMax: 7, type: "event", location: "Haus der Familie", cost: "kostenlos", story_kids: "Ihr lest eine Geschichte. Die Bilder bewegen sich dabei.", description_parents: "Beispiel-Eintrag für die Demo." },
  { tag: 9, uhr: "17:30", dauerMin: 60, institutionId: "experimenta", title: "Planeten-Quiz-Show (Beispiel)", title_kids: "Planeten-Quiz", categories: ["astronomy", "math"], ageMin: 8, ageMax: null, type: "show", location: "experimenta", cost: "im Eintritt", story_kids: "Wie groß ist Jupiter? Du rätst mit und lernst viel.", description_parents: "Beispiel-Eintrag für die Demo." },
  { tag: 10, uhr: "14:00", dauerMin: 120, institutionId: "aim", title: "Calliope-Lichtershow (Beispiel)", title_kids: "Lichter programmieren", categories: ["coding", "physics"], ageMin: 8, ageMax: 11, type: "workshop", location: "Bildungscampus", cost: "kostenlos", story_kids: "Du programmierst bunte Lichter. Sie blinken im Takt.", description_parents: "Beispiel-Eintrag für die Demo." },
  { tag: 11, uhr: "10:00", dauerMin: 90, institutionId: "hdf", title: "Kleine Forscher: Wasser (Beispiel)", title_kids: "Wasser-Experimente", categories: ["physics", "biology"], ageMin: 4, ageMax: 6, type: "workshop", location: "Haus der Familie", cost: "4 €", story_kids: "Was schwimmt, was sinkt? Du probierst es aus.", description_parents: "Beispiel-Eintrag für die Demo." },
  { tag: 12, uhr: "15:00", dauerMin: 90, institutionId: "ipai", title: "Wie lernt ein Computer? (Beispiel)", title_kids: "So lernt ein Computer", categories: ["it"], ageMin: 9, ageMax: 13, type: "workshop", location: "IPAI Spaces", cost: "kostenlos", story_kids: "Du zeigst dem Computer Bilder. Danach erkennt er sie allein.", description_parents: "Beispiel-Eintrag für die Demo." },
  { tag: 14, uhr: "11:00", dauerMin: 50, institutionId: "experimenta", title: "Dinosaurier-Zeitreise (Beispiel)", title_kids: "Reise zu den Dinos", categories: ["biology"], ageMin: 6, ageMax: null, type: "show", location: "experimenta", cost: "6 € / 4 €", story_kids: "Du reist weit zurück in der Zeit. Riesige Dinos laufen vorbei.", description_parents: "Beispiel-Eintrag für die Demo." },
  { tag: 15, uhr: "14:00", dauerMin: 120, institutionId: "aim", title: "Ferienkurs Robotik (Beispiel)", title_kids: "Roboter-Ferien", categories: ["coding"], ageMin: 9, ageMax: 13, type: "course", location: "Bildungscampus", cost: "kostenlos", story_kids: "In den Ferien baust du jeden Tag weiter. Am Ende fährt dein Roboter.", description_parents: "Beispiel-Eintrag für die Demo." },
  { tag: 17, uhr: "16:00", dauerMin: 60, institutionId: "hdf", title: "Familien-Spieleabend digital (Beispiel)", title_kids: "Spieleabend", categories: ["family", "coding"], ageMin: 6, ageMax: 12, type: "event", location: "Haus der Familie", cost: "kostenlos", story_kids: "Ihr spielt zusammen. Danach erfindet ihr eigene Spielregeln.", description_parents: "Beispiel-Eintrag für die Demo." },
  { tag: 19, uhr: "15:00", dauerMin: 90, institutionId: "experimenta", title: "Magnete im Mitmachlabor (Beispiel)", title_kids: "Magnet-Tricks", categories: ["physics"], ageMin: 7, ageMax: 10, type: "workshop", location: "experimenta", cost: "im Eintritt", story_kids: "Magnete ziehen und schieben. Du baust einen schwebenden Stift.", description_parents: "Beispiel-Eintrag für die Demo." },
  { tag: 21, uhr: "10:00", dauerMin: 120, institutionId: "ipai", title: "KI malt mit dir (Beispiel)", title_kids: "Malen mit KI", categories: ["it", "art"], ageMin: 8, ageMax: 12, type: "workshop", location: "IPAI Spaces", cost: "kostenlos", story_kids: "Du malst ein Bild. Die KI macht etwas Neues daraus.", description_parents: "Beispiel-Eintrag für die Demo." },
  { tag: 24, uhr: "16:00", dauerMin: 60, institutionId: "aim", title: "Zahlen-Zauberei (Beispiel)", title_kids: "Zaubern mit Zahlen", categories: ["math"], ageMin: 7, ageMax: 10, type: "event", location: "Bildungscampus", cost: "kostenlos", story_kids: "Du lernst einen Zahlentrick. Deine Familie wird staunen.", description_parents: "Beispiel-Eintrag für die Demo." },
  { tag: 26, uhr: "19:00", dauerMin: 60, institutionId: "experimenta", title: "Mondnacht im Science Dome (Beispiel)", title_kids: "Ausflug zum Mond", categories: ["astronomy", "family"], ageMin: 6, ageMax: null, type: "show", location: "experimenta", cost: "6 € / 4 €", story_kids: "Heute Abend besuchst du den Mond. Du siehst seine Krater ganz nah.", description_parents: "Beispiel-Eintrag für die Demo." },
  { tag: 28, uhr: "10:30", dauerMin: 90, institutionId: "hdf", title: "Bauen mit Bausteinen (Beispiel)", title_kids: "Bauen und Staunen", categories: ["coding", "family"], ageMin: 4, ageMax: 7, type: "workshop", location: "Haus der Familie", cost: "3 €", story_kids: "Du baust mit bunten Steinen. Dein Bauwerk kann sich bewegen.", description_parents: "Beispiel-Eintrag für die Demo." },
];

/** Datum heute + tage, Uhrzeit in Berliner Zeit (Demo, ±1 h Sommerzeit genügt) */
function relativ(heute: Date, tage: number, uhr: string, plusMin = 0): string {
  const [h, m] = uhr.split(":").map(Number);
  const d = new Date(heute);
  d.setDate(d.getDate() + tage);
  d.setHours(h!, m! + plusMin, 0, 0);
  return d.toISOString();
}

export function dummyEvents(heute: Date): LiveEvent[] {
  const stand = heute.toISOString().slice(0, 10);
  return VORLAGEN.map(({ tag, uhr, dauerMin, ...v }) => ({
    ...v,
    id: `demo-${v.institutionId}-${slug(v.title)}`,
    start: relativ(heute, tag, uhr),
    end: relativ(heute, tag, uhr, dauerMin),
    image: null,
    registrationUrl: WEBSEITE[v.institutionId] ?? "https://www.cosmos-hn.de/",
    sourceUrl: WEBSEITE[v.institutionId] ?? "https://www.cosmos-hn.de/",
    lastUpdated: stand,
    needsReview: false,
    isDummy: true,
  }));
}

/** Echte experimenta-Shows für die Demo, mit Kindertext nach der Original-Beschreibung */
const ECHTE_DEMO = [
  { titel: /^VAST/i, title_kids: "Reise durch das Weltall", story_kids: "Du reist durch das Weltall. Vom Sonnensystem bis zum Urknall!" },
  { titel: /sonnensystem|solar system/i, title_kids: "Abenteuer im Sonnensystem", story_kids: "Du fliegst zu allen Planeten. Jeder sieht ganz anders aus." },
];

export function echteDemoEvents(roh: RawEvent[], heute: Date): LiveEvent[] {
  const stand = heute.toISOString().slice(0, 10);
  return roh
    .filter((e) => e.institutionId === "experimenta")
    .flatMap((e) => {
      const vorlage = ECHTE_DEMO.find((v) => v.titel.test(e.title));
      if (!vorlage) return [];
      return [{
        id: `experimenta-${slug(e.title)}-${e.start.slice(0, 16)}`,
        institutionId: "experimenta",
        title: e.title,
        title_kids: vorlage.title_kids,
        categories: ["astronomy"],
        ageMin: 8,
        ageMax: null,
        type: "show",
        start: e.start,
        end: e.end,
        location: e.location,
        cost: e.cost,
        image: e.image,
        story_kids: vorlage.story_kids,
        description_parents: e.text.slice(0, 300),
        registrationUrl: e.registrationUrl,
        sourceUrl: e.url,
        lastUpdated: stand,
        needsReview: false,
        isDummy: false,
      } satisfies LiveEvent];
    });
}

// Direkt aufgerufen: nur Demo-Daten schreiben (ohne Internet)
if (import.meta.url === `file://${process.argv[1]}`) {
  const ziel = new URL("../../src/data/events.json", import.meta.url);
  const events = dummyEvents(new Date()).sort((a, b) => a.start.localeCompare(b.start));
  writeFileSync(ziel, JSON.stringify(events, null, 2) + "\n");
  console.log(`✓ ${events.length} Demo-Events geschrieben → src/data/events.json`);
}
