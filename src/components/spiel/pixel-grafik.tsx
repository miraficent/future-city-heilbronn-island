import grafiken from "@/lib/pixel-grafiken.json";

export type PixelMotiv = keyof typeof grafiken;

/** Transparente Originaldatei, nur der sichtbare Ausschnitt wird skaliert. */
export function PixelGrafik({ motiv, x = 0, y = 0, breite, hoehe, className }: { motiv: PixelMotiv; x?: number; y?: number; breite: number; hoehe: number; className?: string }) {
  const g = grafiken[motiv];
  const [links = 0, oben = 0, rechts = g.breite, unten = g.hoehe] = g.ausschnitt;
  return <svg x={x} y={y} width={breite} height={hoehe} viewBox={`${links} ${oben} ${rechts-links} ${unten-oben}`} preserveAspectRatio="none" className={className} aria-hidden="true" focusable="false" style={{ imageRendering:"pixelated", overflow:"hidden" }}><image href={g.datei} width={g.breite} height={g.hoehe}/></svg>;
}

export function PixelBild({ motiv, alt = "", className = "" }: { motiv: PixelMotiv; alt?: string; className?: string }) {
  const g = grafiken[motiv];
  const [links = 0, oben = 0, rechts = g.breite, unten = g.hoehe] = g.ausschnitt;
  return <svg className={`pixel-bild ${className}`} viewBox={`${links} ${oben} ${rechts-links} ${unten-oben}`} role={alt?"img":undefined} aria-hidden={alt?undefined:true} aria-label={alt||undefined}><image href={g.datei} width={g.breite} height={g.hoehe}/></svg>;
}
