import { STANDARD_AVATAR, type AvatarKonfiguration } from "./avatar";
import type { Punkt } from "./spiel";
import type { Stadt } from "./stadt";

/**
 * Bewohner der Spielwelt. Sie stehen neben den Wegen, sprechen kurze Sätze und stellen eine kleine Frage.
 * Alle Personen sind ausgedacht. Fakten zu Heilbronn sind bewusst einfach und überprüfbar gehalten.
 */
export type Antwort = { text: string; richtig: boolean; rueckmeldung: string };
export type Gespraech = { klein: string[]; gross: string[]; frage: { text: string; antworten: Antwort[] } };
export type Bewohner = { id: string; name: string; aussehen: AvatarKonfiguration | "roboter"; ort: Punkt; blickNach: "links" | "rechts"; gespraech: Gespraech };

/** Ab dieser Entfernung kann man jemanden ansprechen. */
export const SPRECH_RADIUS = 95;

const a = (teile: Partial<AvatarKonfiguration>): AvatarKonfiguration => ({ ...STANDARD_AVATAR, ...teile });

/** Aussehen aus demselben Baukasten wie die eigene Figur – bunt gemischt, ohne Rollenklischees. */
const AUSSEHEN: Record<string, { name: string; aussehen: AvatarKonfiguration | "roboter" }> = {
  emre: { name: "Emre", aussehen: a({ gesicht: 1, haut: 2, haar: 0, frisur: 0, oberteil: 3, oberfarbe: 3, unterteil: 3, unterfarbe: 4, schuhe: 0, schuhfarbe: 1 }) },
  lina: { name: "Lina", aussehen: a({ gesicht: 2, augen: 1, haut: 1, haar: 5, frisur: 5, oberteil: 2, oberfarbe: 2, unterteil: 0, unterfarbe: 4, schuhe: 0, schuhfarbe: 3 }) },
  amara: { name: "Amara", aussehen: a({ gesicht: 0, augen: 2, haut: 4, haar: 0, frisur: 4, oberteil: 0, oberfarbe: 1, unterteil: 2, unterfarbe: 5, schuhe: 2, schuhfarbe: 0 }) },
  bit: { name: "Bit", aussehen: "roboter" },
  leo: { name: "Leo", aussehen: a({ gesicht: 2, haut: 0, haar: 3, frisur: 1, oberteil: 1, oberfarbe: 4, unterteil: 4, unterfarbe: 5, schuhe: 0, schuhfarbe: 2, zubehoer: 1 }) },
  mia: { name: "Mia", aussehen: a({ gesicht: 0, augen: 1, haut: 0, haar: 4, frisur: 3, oberteil: 2, oberfarbe: 6, unterteil: 1, unterfarbe: 4, schuhe: 1, schuhfarbe: 5, zubehoer: 2 }) },
};

const GESPRAECHE: Record<string, Gespraech> = {
  emre: {
    klein: ["Hallo! Ich bin Emre.", "Siehst du die Rakete? Ihr fehlen noch Teile.", "In jedem Lernhaus wartet ein Teil auf dich."],
    gross: ["Hi, ich bin Emre. Ich baue mit an der COSMOS-Rakete.", "Vier Teile fehlen noch. Jedes Lernhaus hat eins.", "Löse in einem Haus eine Aufgabe – dann gehört das Teil dir."],
    frage: {
      text: "Wo findest du die Raketenteile?",
      antworten: [
        { text: "In den Lernhäusern", richtig: true, rueckmeldung: "Genau! Ab ins nächste Haus." },
        { text: "Im Teich", richtig: false, rueckmeldung: "Da schwimmen nur die Enten. Schau in die Lernhäuser!" },
      ],
    },
  },
  lina: {
    klein: ["Hallo, ich bin Lina.", "Achtung, hier ist eine Straße!", "Geh nur über den Zebrastreifen. Dann halten die Autos an."],
    gross: ["Hallo, ich bin Lina. Ich warte hier auf den Bus.", "Über die Straße gehen wir nur am Zebrastreifen.", "Wenn du darauf stehst, halten die Autos an. Trotzdem: erst schauen, dann gehen."],
    frage: {
      text: "Wo gehst du über die Straße?",
      antworten: [
        { text: "Am Zebrastreifen", richtig: true, rueckmeldung: "Richtig! Da halten die Autos für dich." },
        { text: "Irgendwo dazwischen", richtig: false, rueckmeldung: "Lieber nicht. Am Zebrastreifen ist es sicherer." },
      ],
    },
  },
  amara: {
    klein: ["Hallo, ich bin Amara.", "Ich mag Wasser. In Heilbronn fließt der Neckar.", "Am Neckar steht die experimenta. Da kann man forschen."],
    gross: ["Hi, ich bin Amara. Ich zähle die Enten im Teich.", "Durch Heilbronn fließt ein Fluss: der Neckar.", "Am Neckar steht die experimenta. Dort kannst du forschen und Neues ausprobieren."],
    frage: {
      text: "Wie heißt der Fluss in Heilbronn?",
      antworten: [
        { text: "Neckar", richtig: true, rueckmeldung: "Stimmt! Der Neckar fließt mitten durch die Stadt." },
        { text: "Nordsee", richtig: false, rueckmeldung: "Die Nordsee ist ein Meer und weit weg. Der Fluss heißt Neckar." },
      ],
    },
  },
  bit: {
    klein: ["Piep! Ich bin Bit, ein Roboter.", "Ich mache genau, was im Programm steht.", "Fehlt ein Befehl, komme ich nicht ans Ziel."],
    gross: ["Piep! Ich bin Bit, ein Lieferroboter.", "Ich denke nicht selbst. Ich mache genau, was im Programm steht.", "Im Code-Labor kannst du mir einen Weg programmieren. Schritt für Schritt."],
    frage: {
      text: "Was braucht ein Roboter, um ans Ziel zu kommen?",
      antworten: [
        { text: "Klare Befehle", richtig: true, rueckmeldung: "Piep piep! Genau, klare Befehle in der richtigen Reihenfolge." },
        { text: "Viel Glück", richtig: false, rueckmeldung: "Glück hilft mir nicht. Ich brauche klare Befehle." },
      ],
    },
  },
  leo: {
    klein: ["Hallo! Ich bin Leo.", "Weißt du, was KI ist?", "KI lernt aus vielen Bildern. Aber sie kann sich irren."],
    gross: ["Hallo, ich bin Leo. Ich finde KI spannend.", "Eine KI lernt aus sehr vielen Beispielen. So erkennt sie Muster.", "Sie kann sich aber irren. Darum schauen wir immer genau nach."],
    frage: {
      text: "Kann eine KI sich irren?",
      antworten: [
        { text: "Ja, manchmal", richtig: true, rueckmeldung: "Richtig. Deshalb prüfen wir, was sie sagt." },
        { text: "Nein, nie", richtig: false, rueckmeldung: "Doch, das passiert. Darum immer genau hinschauen." },
      ],
    },
  },
  mia: {
    klein: ["Hallo, ich bin Mia.", "Ich baue gern Spiele.", "Ein gutes Level ist knifflig, aber man kann es schaffen."],
    gross: ["Hi, ich bin Mia. Ich baue eigene Spiele.", "In der Spielewerkstatt baust du Wege mit Brücken und Sprüngen.", "Ein gutes Level ist knifflig, aber für alle schaffbar."],
    frage: {
      text: "Was macht ein gutes Level aus?",
      antworten: [
        { text: "Man kann es schaffen", richtig: true, rueckmeldung: "Genau! Knifflig ist gut, unmöglich nicht." },
        { text: "Niemand schafft es", richtig: false, rueckmeldung: "Dann macht es keinen Spaß. Es soll schaffbar sein." },
      ],
    },
  },
};

/** Stellt die Bewohner neben die Wege – nie auf die Straße, nie in ein Haus. */
export function bewohnerFuer(stadt: Stadt): Bewohner[] {
  const oben = stadt.haeuser.filter((h) => h.reihe === "oben").sort((a, b) => a.mitteX - b.mitteX);
  const unten = stadt.haeuser.filter((h) => h.reihe === "unten").sort((a, b) => a.mitteX - b.mitteX);
  const zebra = stadt.zebras[0];
  const plaetze: Array<{ id: string; ort: Punkt; blickNach: "links" | "rechts" }> = [
    { id: "emre", ort: { x: stadt.platz.x - 70, y: stadt.gehwegNord - 52 }, blickNach: "rechts" },
    { id: "bit", ort: { x: (oben[0]?.mitteX ?? 300) + 74, y: stadt.gehwegNord - 52 }, blickNach: "links" },
    { id: "leo", ort: { x: (oben.at(-1)?.mitteX ?? 1500) - 74, y: stadt.gehwegNord - 52 }, blickNach: "rechts" },
    { id: "lina", ort: { x: (zebra ? zebra.x + zebra.breite : 400) + 60, y: stadt.gehwegSued + 52 }, blickNach: "links" },
    { id: "amara", ort: { x: stadt.teich.x + stadt.teich.rx * 0.55, y: stadt.vorplatzY - 50 }, blickNach: "links" },
    { id: "mia", ort: { x: (unten.at(-1)?.mitteX ?? 1500) + 80, y: stadt.vorplatzY - 50 }, blickNach: "links" },
  ];
  return plaetze.map(({ id, ort, blickNach }) => ({ id, name: AUSSEHEN[id]!.name, aussehen: AUSSEHEN[id]!.aussehen, ort, blickNach, gespraech: GESPRAECHE[id]! }));
}

/** Wer an welchem Lernort begrüßt – dieselben Bewohner wie in der Stadt. */
export const GASTGEBER: Record<string, string> = { aim: "bit", experimenta: "amara", hdf: "mia", ipai: "leo" };

export function aussehenVon(id: string): { name: string; aussehen: AvatarKonfiguration | "roboter" } {
  return AUSSEHEN[id] ?? { name: "Pico", aussehen: "roboter" };
}

/** Kurze Geschichte beim Betreten eines Ortes: Wo bin ich, was passiert hier, was ist meine Aufgabe? */
export const ORT_GESCHICHTE: Record<string, { klein: string[]; gross: string[] }> = {
  aim: {
    klein: ["Willkommen bei der aim!", "Die aim ist auf dem Bildungscampus in Heilbronn. Hier lernen Kinder und Große.", "Mein Lieferroboter weiß nicht weiter. Programmierst du ihm einen Weg?"],
    gross: ["Willkommen bei der aim auf dem Bildungscampus!", "Hier gibt es Kurse für Kinder, Jugendliche und Erwachsene – auch zum Programmieren.", "Unsere Lieferroboter brauchen eine Route. Schreibst du ihnen ein Programm?"],
  },
  experimenta: {
    klein: ["Willkommen in der experimenta!", "Sie steht am Neckar. Hier darf man forschen und staunen.", "Heute bringen wir Licht in die Stadt. Hilfst du mir?"],
    gross: ["Willkommen in der experimenta!", "Das Science Center steht auf einer Insel im Neckar. Drinnen kannst du selbst experimentieren.", "Abends bleibt die Stadt dunkel. Finden wir heraus, wie Strom zum Licht kommt?"],
  },
  hdf: {
    klein: ["Willkommen im Haus der Familie!", "Hier lernen Kinder und Eltern zusammen.", "Wir bauen ein Spiel-Level. Baust du mit?"],
    gross: ["Willkommen im Haus der Familie!", "Hier lernen Kinder, Eltern und Großeltern gemeinsam – auch am Computer.", "Der Weg zum Fest hat Lücken. Baust du ein Level, das man schaffen kann?"],
  },
  ipai: {
    klein: ["Willkommen bei IPAI SPACES!", "Hier geht es um KI. Das heißt Künstliche Intelligenz.", "Pico verwechselt Bilder. Zeigst du ihm, wie man genau hinschaut?"],
    gross: ["Willkommen bei IPAI SPACES im Zukunftspark!", "Hier arbeiten Menschen an Künstlicher Intelligenz – kurz KI.", "Pico soll Muster erkennen, aber er irrt sich manchmal. Hilfst du ihm, genau zu prüfen?"],
  },
};
