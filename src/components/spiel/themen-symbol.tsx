/** Symbol für ein Lernhaus bzw. Thema – zum Einbetten in SVG (Ursprung = Mitte). */
export function ThemenSymbol({ thema, groesse = 24, farbe = "#1c1934" }: { thema: string; groesse?: number; farbe?: string }) {
  const s = groesse / 24;
  const pfad: Record<string, string> = {
    coding: "m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18",
    code: "m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18",
    strom: "M9 18h6m-5 3h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3Z",
    gaming: "M7 7h10c3 0 4 4 4 9 0 3-2 3-4 1l-2-2H9l-2 2c-2 2-4 2-4-1 0-5 1-9 4-9Zm1 2v5m-2.5-2.5h5M15 10h.01M18 13h.01",
    level: "M7 7h10c3 0 4 4 4 9 0 3-2 3-4 1l-2-2H9l-2 2c-2 2-4 2-4-1 0-5 1-9 4-9Zm1 2v5m-2.5-2.5h5M15 10h.01M18 13h.01",
    ki: "M12 3v3M9 3h6M5 10H3v7h2m14-7h2v7h-2M7 20h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2ZM9 11h.01M15 11h.01M9 16h6",
    muster: "M12 3v3M9 3h6M5 10H3v7h2m14-7h2v7h-2M7 20h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2ZM9 11h.01M15 11h.01M9 16h6",
  };
  return (
    <path
      d={pfad[thema] ?? pfad.code}
      transform={`translate(${-12 * s} ${-12 * s}) scale(${s})`}
      fill="none"
      stroke={farbe}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
    />
  );
}
