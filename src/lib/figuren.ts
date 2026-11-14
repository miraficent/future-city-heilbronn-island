/** Spielfiguren. Bewusst vielfältig – jedes Kind soll sich wiederfinden können. Keine echten Personen. */
export type Frisur = "kurz" | "seitenscheitel" | "locken" | "pferdeschwanz" | "puffs" | "kopftuch" | "roboter";
export type Kleidung = "hose" | "hoodie" | "kleid" | "rock" | "langrock" | "roboter";

export type Figur = {
  id: string;
  name: string;
  haut: string;
  haar: string;
  frisur: Frisur;
  kleidung: Kleidung;
  oberteil: string;
  unten: string;
  akzent: string;
  schuhe: string;
  maedchen: boolean;
  brille?: boolean;
  /** Aus dem Figurenbaukasten: Schnitt von Oberteil, Unterteil und Schuhen sowie die Farbe einer Kappe. */
  oberteilArt?: "shirt" | "pullover" | "jacke";
  unterteilArt?: "hose" | "shorts" | "rock";
  schuhArt?: "sneaker" | "stiefel" | "sandalen";
  kappe?: string;
};

export const FIGUREN: Figur[] = [
  { id: "mia", name: "Mia", haut: "#f6cfb0", haar: "#c4622d", frisur: "pferdeschwanz", kleidung: "kleid", oberteil: "#ef5a8c", unten: "#ef5a8c", akzent: "#ffd84d", schuhe: "#fbf7ee", maedchen: true },
  { id: "emre", name: "Emre", haut: "#c98d62", haar: "#2b211d", frisur: "kurz", kleidung: "hoodie", oberteil: "#00a3a3", unten: "#3c3a52", akzent: "#f2c94c", schuhe: "#f2a900", maedchen: false },
  { id: "amara", name: "Amara", haut: "#7b4a2c", haar: "#1f1612", frisur: "puffs", kleidung: "rock", oberteil: "#f2c94c", unten: "#8a5cd8", akzent: "#ff7eb6", schuhe: "#e8513a", maedchen: true },
  { id: "leo", name: "Leo", haut: "#f8dcc4", haar: "#e2b84a", frisur: "seitenscheitel", kleidung: "hose", oberteil: "#2f6bff", unten: "#2b2a3a", akzent: "#fbf7ee", schuhe: "#00a3a3", maedchen: false, brille: true },
  { id: "lina", name: "Lina", haut: "#dba57c", haar: "#9a6bd8", frisur: "kopftuch", kleidung: "langrock", oberteil: "#5dbb63", unten: "#2f6bff", akzent: "#ffd84d", schuhe: "#fbf7ee", maedchen: true },
  { id: "bit", name: "Bit", haut: "#c5d2d6", haar: "#e8513a", frisur: "roboter", kleidung: "roboter", oberteil: "#9fb2b8", unten: "#5f7178", akzent: "#7fe3ff", schuhe: "#3b4a50", maedchen: false },
];

export const figurNachId = (id: string | undefined): Figur => FIGUREN.find((f) => f.id === id) ?? FIGUREN[0]!;
