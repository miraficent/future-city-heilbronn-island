/**
 * Speicher nur im Browser. Kinder: sessionStorage (weg beim Schließen).
 * Eltern/Teens: localStorage (bleibt auf dem Gerät). Nichts davon verlässt das Gerät.
 * Zugriffe können in privaten Fenstern scheitern – dann arbeitet die App ohne Speicher weiter.
 */
type Art = "sitzung" | "geraet";

function speicher(art: Art): Storage | null {
  try {
    return art === "sitzung" ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

export function lies<T>(art: Art, schluessel: string, standard: T): T {
  try {
    const roh = speicher(art)?.getItem(`cosmos.${schluessel}`);
    return roh ? (JSON.parse(roh) as T) : standard;
  } catch {
    return standard;
  }
}

export function schreibe<T>(art: Art, schluessel: string, wert: T): void {
  try {
    speicher(art)?.setItem(`cosmos.${schluessel}`, JSON.stringify(wert));
  } catch {
    // Speicher nicht verfügbar – bewusst ignoriert, die App funktioniert auch ohne.
  }
}

export function loesche(art: Art, schluessel: string): void {
  try {
    speicher(art)?.removeItem(`cosmos.${schluessel}`);
  } catch {
    // siehe oben
  }
}
