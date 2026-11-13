type Props = { anzahl?: number; className?: string; samen?: number };

/** Deterministische Pseudo-Zufallszahlen, damit Server und Browser dieselben Sterne zeichnen. */
function zufall(samen: number) {
  let s = samen;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function Sternenhimmel({ anzahl = 40, className = "", samen = 7 }: Props) {
  const r = zufall(samen);
  const sterne = Array.from({ length: anzahl }, (_, i) => ({
    x: r() * 100,
    y: r() * 100,
    g: r() < 0.15 ? 7 : r() < 0.5 ? 4 : 2.5,
    verzoegerung: (r() * 3).toFixed(2),
    i,
  }));
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {sterne.map((s) =>
        s.g > 5 ? (
          <svg
            key={s.i}
            viewBox="0 0 20 20"
            className="funkeln absolute"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.g * 2, height: s.g * 2, animationDelay: `${s.verzoegerung}s` }}
          >
            <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8Z" fill="currentColor" />
          </svg>
        ) : (
          <span
            key={s.i}
            className="absolute rounded-full bg-current opacity-50"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.g, height: s.g }}
          />
        ),
      )}
    </div>
  );
}
