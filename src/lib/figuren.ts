/** Spielfiguren. Bewusst vielfältig – jedes Kind soll sich wiederfinden können. Keine echten Personen. */
export type Frisur = "kurz" | "locken" | "zoepfe" | "lang" | "kopftuch" | "roboter";

export type Figur = {
  id: string;
  name: string;
  haut: string;
  haar: string;
  frisur: Frisur;
  oberteil: string;
  akzent: string;
  hose: string;
  schuhe: string;
  brille?: boolean;
};

export const FIGUREN: Figur[] = [
  { id: "mia", name: "Mia", haut: "#f1c7a5", haar: "#b8612a", frisur: "zoepfe", oberteil: "#e8513a", akzent: "#fbf7ee", hose: "#2f4b7a", schuhe: "#fbf7ee" },
  { id: "emre", name: "Emre", haut: "#c68b5e", haar: "#2b211d", frisur: "kurz", oberteil: "#00a3a3", akzent: "#f2a900", hose: "#3c3a52", schuhe: "#f2a900" },
  { id: "amara", name: "Amara", haut: "#7b4a2c", haar: "#1f1612", frisur: "locken", oberteil: "#f2a900", akzent: "#e8513a", hose: "#6c4bd8", schuhe: "#e8513a" },
  { id: "leo", name: "Leo", haut: "#f6d7bd", haar: "#e2b84a", frisur: "kurz", oberteil: "#2f4bff", akzent: "#fbf7ee", hose: "#2b2a3a", schuhe: "#00a3a3", brille: true },
  { id: "lina", name: "Lina", haut: "#d9a37a", haar: "#8a5cc7", frisur: "kopftuch", oberteil: "#5dbb63", akzent: "#fbf7ee", hose: "#2f4b7a", schuhe: "#fbf7ee" },
  { id: "bit", name: "Bit", haut: "#b9c7cc", haar: "#e8513a", frisur: "roboter", oberteil: "#8fa3ab", akzent: "#f2a900", hose: "#5f7178", schuhe: "#3b4a50" },
];

export const figurNachId = (id: string | undefined): Figur => FIGUREN.find((f) => f.id === id) ?? FIGUREN[0]!;
