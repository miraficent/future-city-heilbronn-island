/**
 * Texte für Kinder (6–14): kurze Titel und Zeitangaben, die man ohne Kalender versteht.
 * Nur Darstellung – die Daten selbst (Mobilizon, Cédric) bleiben unverändert.
 */

const MAX_WOERTER = 5;

/**
 * Kurzer Kindertitel aus einem Veranstaltungstitel:
 * Klammern weg, Zusätze wie „for Kids“ weg, bei „Titel: Untertitel“ oder „Titel – Untertitel“ nur der Titel,
 * höchstens fünf Wörter.
 */
export function kinderTitel(titel: string): string {
  let t = titel
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\b(for|für)\s+(kids|kinder)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const teile = t.split(/\s*(?::|\s[–—-]\s)\s*/).filter(Boolean);
  if (teile.length > 1 && teile[0]!.split(" ").length >= 2) t = teile[0]!;
  const woerter = t.split(" ");
  if (woerter.length > MAX_WOERTER) t = `${woerter.slice(0, MAX_WOERTER).join(" ")} …`;
  return t.replace(/[\s,;:–-]+(…)?$/, (_, p) => (p ? " …" : "")) || titel;
}

/** Kalendertag in Berlin als YYYY-MM-DD */
const berlinTag = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });

/** Ganze Tage zwischen zwei Berliner Kalendertagen */
function tageBis(start: Date, jetzt: Date): number {
  const a = Date.parse(`${berlinTag(jetzt)}T00:00:00Z`);
  const b = Date.parse(`${berlinTag(start)}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

/**
 * Wann? – so, wie ein Kind es sagt: „Heute“, „Morgen“, „Am Samstag“, „Nächste Woche“, „In 3 Wochen“.
 */
export function kinderWann(iso: string, jetzt: Date): string {
  const start = new Date(iso);
  const tage = tageBis(start, jetzt);
  if (tage <= 0) return "Heute";
  if (tage === 1) return "Morgen";
  if (tage < 7) return `Am ${start.toLocaleDateString("de-DE", { timeZone: "Europe/Berlin", weekday: "long" })}`;
  if (tage < 14) return "Nächste Woche";
  const wochen = Math.round(tage / 7);
  return wochen <= 6 ? `In ${wochen} Wochen` : "Später";
}

/** Tageszeit für Kinder: „morgens“, „mittags“, „nachmittags“, „abends“ */
export function kinderTageszeit(iso: string): string {
  const h = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", hour: "2-digit", hourCycle: "h23" }).format(new Date(iso)));
  if (h < 11) return "morgens";
  if (h < 14) return "mittags";
  if (h < 17) return "nachmittags";
  return "abends";
}

/** Satz mit Punkt am Ende – aber kein „Go!.“ */
export function alsSatz(text: string): string {
  const t = text.trim();
  return /[.!?…]$/.test(t) ? t : `${t}.`;
}

const vergleich = (s: string) => s.toLowerCase().replace(/[^a-z0-9äöüß]/g, "");

type FuerGeschichte = {
  titel: string;
  geschichte: string;
  art: "workshop" | "show" | "course" | "event" | null;
  themen: string[];
  gratis: boolean;
};

/** Themen so, wie man sie einem Kind sagt („Hier geht es um …“) */
export const THEMA_SATZ: Record<string, string> = {
  astronomy: "Sterne und das Weltall", physics: "spannende Experimente", biology: "Natur und Tiere", math: "Zahlen und Rätsel",
  it: "Computer und KI", coding: "Programmieren", gaming: "Spiele", art: "Malen und Basteln", family: "Spaß mit der Familie",
};

/** Was das Kind dort tut – kurz und anschaulich */
export const ART_SATZ: Record<"workshop" | "show" | "course" | "event", string> = {
  workshop: "Du machst selbst mit.",
  show: "Du schaust zu und staunst.",
  course: "Ihr trefft euch mehrmals und lernt Schritt für Schritt.",
  event: "Komm vorbei und probier es aus.",
};

/**
 * Text, den die Eule vorliest. Gibt es keinen eigenen Kindertext (oder ist er nur der Titel),
 * bildet sie einen Satz aus Thema, Art und Kosten – statt den Titel zweimal zu sagen.
 */
export function kinderGeschichte(k: FuerGeschichte): string {
  const titel = vergleich(k.titel);
  const eigene = k.geschichte.trim();
  if (eigene && vergleich(eigene) !== titel && !vergleich(eigene).startsWith(titel)) return alsSatz(eigene);
  const teile: string[] = [];
  // Nur das Hauptthema – zwei Themen mit „und“ ergeben holprige Sätze („Sterne und das Weltall und …“)
  if (k.themen.length) teile.push(`Hier geht es um ${k.themen[0]}.`);
  teile.push(ART_SATZ[k.art ?? "event"]);
  if (k.gratis) teile.push("Es kostet nichts.");
  return teile.join(" ");
}

/** Vorlesetext der Eule: Titel, dann Geschichte – ohne Wiederholung */
export function euleSagt(titel: string, geschichte: string): string {
  return `${alsSatz(titel)} ${geschichte}`.trim();
}
