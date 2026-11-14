import { STANDARD_AVATAR, type AvatarKonfiguration } from "./avatar";

/**
 * Bewohner der Spielwelt. Sie stehen an den Lernorten, sprechen kurze Sätze und stellen eine kleine Frage.
 * Alle Personen sind ausgedacht. Fakten zu Heilbronn sind bewusst einfach und überprüfbar gehalten.
 */
export type Antwort = { text: string; richtig: boolean; rueckmeldung: string };
export type Gespraech = { klein: string[]; gross: string[]; frage: { text: string; antworten: Antwort[] } };

const a = (teile: Partial<AvatarKonfiguration>): AvatarKonfiguration => ({ ...STANDARD_AVATAR, ...teile });

/** Aussehen aus demselben Baukasten wie die eigene Figur – bunt gemischt, ohne Rollenklischees. */
const AUSSEHEN: Record<string, { name: string; aussehen: AvatarKonfiguration | "roboter" }> = {
  emre: { name: "Emre", aussehen: a({ haut: 4, haar: 0, frisur: 1, oberteil: 2, oberfarbe: 5, unterteil: 0, unterfarbe: 8, schuhe: 0, schuhfarbe: 2 }) },
  lina: { name: "Lina", aussehen: a({ gesicht: 1, augen: 2, sommersprossen: 1, haut: 1, haar: 7, frisur: 5, oberteil: 3, oberfarbe: 4, unterteil: 4, unterfarbe: 15, schuhe: 1, schuhfarbe: 11, zubehoer: 0, zubehoerfarbe: 2 }) },
  amara: { name: "Amara", aussehen: a({ augen: 2, haut: 6, haar: 0, frisur: 7, oberteil: 5, oberfarbe: 2, aufdruck: 2, unterteil: 4, unterfarbe: 9, schuhe: 2, schuhfarbe: 0, zubehoer: 3, zubehoerfarbe: 10 }) },
  bit: { name: "Bit", aussehen: "roboter" },
  leo: { name: "Leo", aussehen: a({ gesicht: 1, haut: 0, haar: 5, frisur: 8, oberteil: 4, oberfarbe: 7, aufdruck: 1, unterteil: 1, unterfarbe: 14, schuhe: 0, schuhfarbe: 4, zubehoer: 1 }) },
  mia: { name: "Mia", aussehen: a({ augen: 1, haut: 2, haar: 3, frisur: 4, oberteil: 0, oberfarbe: 11, aufdruck: 2, unterteil: 3, unterfarbe: 8, schuhe: 0, schuhfarbe: 12, zubehoer: 2, zubehoerfarbe: 6 }) },
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
    klein: ["Hallo, ich bin Lina.", "Ich fahre gleich mit der Stadtbahn.", "An der Haltestelle warte ich hinter der weißen Linie."],
    gross: ["Hallo, ich bin Lina. Ich warte auf die Stadtbahn.", "Die Stadtbahn fährt mitten durch Heilbronn – sogar bis hierher.", "An der Haltestelle warten wir hinter der weißen Linie, bis die Bahn steht."],
    frage: {
      text: "Wo wartest du auf die Stadtbahn?",
      antworten: [
        { text: "Hinter der Linie", richtig: true, rueckmeldung: "Genau! Erst einsteigen, wenn die Bahn steht." },
        { text: "Auf den Schienen", richtig: false, rueckmeldung: "Oh nein, das ist gefährlich! Wir warten hinter der Linie." },
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

export function gespraechVon(id: string): Gespraech | undefined {
  return GESPRAECHE[id];
}
