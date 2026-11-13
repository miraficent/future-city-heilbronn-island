import type { Thema } from "./angebot";

export type PlanetArt = "krater" | "ring" | "baender";

export type ThemaStil = {
  id: string;
  name: string;
  kindername: string;
  emoji: string;
  farbe: string;
  /** Dunklere Variante für Text auf Papier (Kontrast ≥ 4.5:1). */
  textFarbe: string;
  planet: PlanetArt;
};

const ERSATZFARBEN = ["#2F4BFF", "#FF4FA3", "#5DBB63", "#9A6BFF"];
const PLANETEN: PlanetArt[] = ["krater", "ring", "baender"];
const TINTE = [28, 25, 52];

function mischeMitTinte(hex: string, anteil: number): string {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const gemischt = rgb.map((c, i) => Math.round(c * (1 - anteil) + (TINTE[i] ?? 0) * anteil));
  return `#${gemischt.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

export function themenStile(themen: Thema[]): Record<string, ThemaStil> {
  return Object.fromEntries(
    themen.map((t, i) => {
      const farbe = t.farbe ?? ERSATZFARBEN[i % ERSATZFARBEN.length] ?? "#2F4BFF";
      return [
        t.id,
        {
          id: t.id,
          name: t.name,
          kindername: t.kindername ?? t.name,
          emoji: t.emoji,
          farbe,
          textFarbe: mischeMitTinte(farbe, 0.45),
          planet: PLANETEN[i % PLANETEN.length] ?? "krater",
        },
      ];
    }),
  );
}
