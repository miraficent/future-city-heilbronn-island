/**
 * Selbst gestaltete Spielfigur. Gespeichert werden nur Auswahl-Nummern (z. B. „Frisur 3, Farbe 7“) –
 * kein Foto, kein Name, nichts, was ein Kind erkennbar macht.
 */

export const HAUT = ["#fde5d2", "#f7d2b4", "#ecb895", "#d99f78", "#c08259", "#9a6444", "#744a31", "#4f3123"];
export const HAAR = ["#221c1e", "#3d2b22", "#6b4429", "#94602f", "#c48a4c", "#e7c27a", "#f3e1b0", "#b4472d", "#8b8b98", "#e07ab0", "#5b8ee0"];
export const FARBEN = [
  "#e8513a", "#f08a4b", "#f4c430", "#9ccf5c", "#3fa66b", "#2e9c9a", "#5bb8e8", "#3c6fd6",
  "#2b3f8f", "#8b6fd6", "#c45ec2", "#f28cb8", "#fff8ec", "#d8d2c4", "#5a5f6b", "#2a2a33",
];

export const FRISUREN = ["Kurz", "Stachelig", "Locken", "Lang", "Pferdeschwanz", "Zwei Zöpfe", "Dutt", "Puffs", "Bob"] as const;
export const OBERTEILE = ["T-Shirt", "Langarm", "Hoodie", "Zipper-Jacke", "Pullover", "Kleid"] as const;
export const UNTERTEILE = ["Jeans", "Jogginghose", "Shorts", "Rock", "Leggings"] as const;
export const SCHUHE = ["Sneaker", "Stiefel", "Sandalen"] as const;
export const EXTRAS = ["Ohne", "Brille", "Kappe", "Schleife"] as const;
export const AUFDRUCKE = ["Uni", "Streifen", "Stern"] as const;
export const AUGEN = ["Rund", "Lachend", "Wimpern"] as const;
export const GESICHTER = ["Rund", "Oval"] as const;

export type AvatarKonfiguration = {
  gesicht: number;
  augen: number;
  sommersprossen: number;
  haut: number;
  haar: number;
  frisur: number;
  oberteil: number;
  oberfarbe: number;
  aufdruck: number;
  unterteil: number;
  unterfarbe: number;
  schuhe: number;
  schuhfarbe: number;
  zubehoer: number;
  zubehoerfarbe: number;
};

export const AVATAR_GRENZEN: Record<keyof AvatarKonfiguration, number> = {
  gesicht: GESICHTER.length,
  augen: AUGEN.length,
  sommersprossen: 2,
  haut: HAUT.length,
  haar: HAAR.length,
  frisur: FRISUREN.length,
  oberteil: OBERTEILE.length,
  oberfarbe: FARBEN.length,
  aufdruck: AUFDRUCKE.length,
  unterteil: UNTERTEILE.length,
  unterfarbe: FARBEN.length,
  schuhe: SCHUHE.length,
  schuhfarbe: FARBEN.length,
  zubehoer: EXTRAS.length,
  zubehoerfarbe: FARBEN.length,
};

export const STANDARD_AVATAR: AvatarKonfiguration = {
  gesicht: 0, augen: 0, sommersprossen: 0, haut: 2, haar: 2, frisur: 0,
  oberteil: 2, oberfarbe: 5, aufdruck: 0, unterteil: 0, unterfarbe: 7,
  schuhe: 0, schuhfarbe: 12, zubehoer: 0, zubehoerfarbe: 0,
};

/** Zwei schnelle Startpunkte. Danach ist alles frei kombinierbar. */
export const VORLAGEN: Record<"maedchen" | "junge", AvatarKonfiguration> = {
  maedchen: { ...STANDARD_AVATAR, augen: 2, haar: 3, frisur: 3, oberteil: 0, oberfarbe: 11, aufdruck: 2, unterteil: 3, unterfarbe: 9, schuhe: 0, schuhfarbe: 12, zubehoer: 3, zubehoerfarbe: 0 },
  junge: { ...STANDARD_AVATAR, augen: 0, haar: 1, frisur: 1, oberteil: 2, oberfarbe: 7, aufdruck: 0, unterteil: 0, unterfarbe: 8, schuhe: 0, schuhfarbe: 0, zubehoer: 0 },
};

export function pruefeAvatar(roh: unknown): AvatarKonfiguration {
  const neu = { ...STANDARD_AVATAR };
  if (!roh || typeof roh !== "object") return neu;
  for (const key of Object.keys(neu) as (keyof AvatarKonfiguration)[]) {
    const v = (roh as Record<string, unknown>)[key];
    if (typeof v === "number" && Number.isInteger(v) && v >= 0 && v < AVATAR_GRENZEN[key]) neu[key] = v;
  }
  return neu;
}

export function zufallsAvatar(): AvatarKonfiguration {
  const a = { ...STANDARD_AVATAR };
  for (const k of Object.keys(a) as (keyof AvatarKonfiguration)[]) a[k] = Math.floor(Math.random() * AVATAR_GRENZEN[k]);
  return a;
}

/** Figuren aus der früheren Auswahl werden nur als Vorlage gelesen, nie als Personendaten. */
export function alterAvatar(id: unknown): AvatarKonfiguration {
  if (id === "mia" || id === "amara" || id === "lina") return { ...VORLAGEN.maedchen };
  if (id === "leo" || id === "emre") return { ...VORLAGEN.junge };
  return { ...STANDARD_AVATAR };
}

/** Beim Kleid ist kein Rock und keine Hose nötig – nur Leggings dürfen darunter. */
export const zeigtUnterteil = (a: AvatarKonfiguration) => OBERTEILE[a.oberteil] !== "Kleid" || UNTERTEILE[a.unterteil] === "Leggings";
