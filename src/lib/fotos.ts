/**
 * Echte Fotos der Lernorte. Alle Dateien liegen lokal unter public/medien/fotos – es wird nichts von
 * fremden Servern nachgeladen. Quelle jeweils Wikimedia Commons; die Lizenz verlangt Namensnennung.
 * Für das Haus der Familie gibt es noch kein frei lizenziertes Foto – dort bleibt die gekennzeichnete Illustration.
 */
export type Foto = {
  datei: string;
  breite: number;
  hoehe: number;
  alt: string;
  /** Was genau zu sehen ist – ehrlich, wenn das Foto nicht nur das eine Gebäude zeigt. */
  zeigt: string;
  autor: string;
  lizenz: string;
  lizenzUrl: string;
  quelle: string;
};

const CC_BY_SA_4 = { lizenz: "CC BY-SA 4.0", lizenzUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.de" };

export const FOTOS: Record<string, Foto> = {
  aim: {
    datei: "/medien/fotos/aim-bildungscampus.jpg",
    breite: 1280,
    hoehe: 854,
    alt: "Foto: Platz auf dem Bildungscampus Heilbronn mit Klinkerbauten und Glasfassade",
    zeigt: "Bildungscampus Heilbronn – hier hat die aim ihren Sitz (Bildungscampus 7). Das Foto zeigt den Campus, nicht nur das aim-Gebäude.",
    autor: "Kiliansmännle",
    ...CC_BY_SA_4,
    quelle: "https://commons.wikimedia.org/wiki/File:Bildungscampus_Heilbronn_(1).jpg",
  },
  experimenta: {
    datei: "/medien/fotos/experimenta.jpg",
    breite: 1280,
    hoehe: 854,
    alt: "Foto: Die experimenta in Heilbronn mit Altbau und gläsernem Neubau, gespiegelt im Wasser",
    zeigt: "experimenta auf der Kraneninsel: links der Altbau (Hagenbucher), rechts der Neubau.",
    autor: "Sciencemarker",
    ...CC_BY_SA_4,
    quelle: "https://commons.wikimedia.org/wiki/File:Experimenta_-_science_center.jpg",
  },
  ipai: {
    datei: "/medien/fotos/ipai-spaces.jpg",
    breite: 960,
    hoehe: 1277,
    alt: "Foto: Das Gebäude IPAI SPACES im Zukunftspark Heilbronn mit begrünter Fassade",
    zeigt: "IPAI SPACES im Zukunftspark Heilbronn.",
    autor: "Bif Jefferson",
    ...CC_BY_SA_4,
    quelle: "https://commons.wikimedia.org/wiki/File:IPAI_SPACES_-_Im_Zukunftspark_-_Heilbronn.jpg",
  },
};

export const fotoFuer = (id: string): Foto | undefined => FOTOS[id];
