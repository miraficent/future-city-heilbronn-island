/**
 * Typen der Live-Events (src/data/events.json, erzeugt von scripts/events/).
 * events.json wird nie von Hand oder in Komponenten verändert – nur von der Pipeline.
 */

export type CategoryId = "astronomy" | "physics" | "biology" | "math" | "it" | "coding" | "gaming" | "art" | "family";

export type Category = {
  id: CategoryId;
  /** Kindgerechter deutscher Name */
  label_kids: string;
  /** Name eines Symbols aus components/symbol.tsx (keine Emojis – Teamregel) */
  icon: string;
  color: string;
  /** Stichwörter für die Zuordnung ohne KI (Fallback) */
  keywords: string[];
};

export type EventType = "workshop" | "show" | "course" | "event";

export type LiveEvent = {
  id: string;
  institutionId: string;
  title: string;
  /** Kurzer Titel für Kinder (max. ~6 Wörter) */
  title_kids: string;
  categories: CategoryId[];
  ageMin: number | null;
  ageMax: number | null;
  type: EventType;
  /** ISO-Datum mit Zeitzone */
  start: string;
  end: string | null;
  location: string;
  cost: string | null;
  /** Titelbild – nur von der eigenen Mobilizon-Instanz (src/lib/mobilizon.ts), sonst null */
  image: string | null;
  /** Höchstens 2 kurze Sätze für Kinder */
  story_kids: string;
  description_parents: string;
  registrationUrl: string;
  sourceUrl: string;
  lastUpdated: string;
  /** true = ein Mensch soll prüfen; wird im Kindermodus nicht gezeigt */
  needsReview: boolean;
  isDummy: boolean;
};
