/**
 * Gezeichnete Gebäude der Kinder-Insel. Ursprung (0,0) = Mitte unten auf dem Boden.
 * experimenta und IPAI haben eigene Gebäude, alle anderen Einrichtungen das einfache Haus.
 */
import { F, type Gebaeudeart, type PinSymbol } from "@/lib/kinderkarte";

export const GEBAEUDE_HOEHE: Record<Gebaeudeart, number> = { experimenta: 138, ipai: 92, haus: 100 };

/** Einfache Linien-Symbole (~24px), Mittelpunkt (0,0) */
export function PinZeichen({ name, farbe = "#fff" }: { name: PinSymbol; farbe?: string }) {
  return (
    <g stroke={farbe} fill="none" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
      {name === "teleskop" && (
        <>
          <rect x={-10} y={-9} width={19} height={8} rx={2.5} transform="rotate(-28)" />
          <path d="M0 2 L-6 11 M0 2 L6 11 M0 2 V11" />
        </>
      )}
      {name === "chip" && (
        <>
          <rect x={-7.5} y={-7.5} width={15} height={15} rx={2.5} />
          <rect x={-2.5} y={-2.5} width={5} height={5} rx={1} fill={farbe} />
          <path d="M-3 -7.5v-4 M3 -7.5v-4 M-3 7.5v4 M3 7.5v4 M-7.5 -3h-4 M-7.5 3h-4 M7.5 -3h4 M7.5 3h4" />
        </>
      )}
      {name === "code" && <path d="M-5 -7 L-11 0 L-5 7 M5 -7 L11 0 L5 7 M2 -9 L-2 9" />}
      {name === "herz" && (
        <path stroke="none" fill={farbe} d="M0 9 C-13 0 -11 -9 -5.5 -9 C-2.5 -9 0 -6.5 0 -4.5 C0 -6.5 2.5 -9 5.5 -9 C11 -9 13 0 0 9 Z" />
      )}
      {name === "stern" && (
        <polygon stroke="none" fill={farbe} points="0,-10 2.9,-3.6 9.5,-3.1 4.5,1.4 6,8.1 0,4.6 -6,8.1 -4.5,1.4 -9.5,-3.1 -2.9,-3.6" />
      )}
    </g>
  );
}

function ExperimentaHaus() {
  return (
    <g>
      <ellipse cx={6} cy={2} rx={78} ry={12} fill={F.grasDunkel} />
      <polygon points="44,0 44,-100 70,-86 70,-12" fill={F.glas} />
      <polygon points="-62,0 -62,-82 -26,-112 -12,0" fill={F.glasHell} />
      <polygon points="-12,0 -26,-112 16,-104 10,0" fill={F.glas} />
      <polygon points="10,0 16,-104 44,-100 44,0" fill={F.glasHell} />
      <path d="M-50 -10 V-80 M-36 -6 V-92 M24 -8 V-98 M34 -8 V-99" stroke={F.welle} strokeWidth={1.5} opacity={0.6} />
      <g fill="none" stroke={F.wand} strokeWidth={3.5} strokeLinecap="round">
        <path d="M-62 -18 C-30 -30 10 -22 44 -40 L70 -30" />
        <path d="M-62 -52 C-30 -64 10 -56 44 -72 L70 -60" />
        <path d="M-48 -92 C-24 -100 10 -92 44 -100" />
      </g>
      <rect x={-8} y={-112} width={40} height={8} rx={2} fill={F.wand} />
      <path d="M-4 -112 A 16 16 0 0 1 28 -112 Z" fill={F.wand} />
      <rect x={14} y={-136} width={18} height={6} rx={3} fill={F.text} transform="rotate(-30 14 -133)" />
    </g>
  );
}

function IpaiHaus() {
  return (
    <g>
      <ellipse cx={8} cy={2} rx={74} ry={11} fill={F.grasDunkel} />
      <path d="M46 0 V-62 Q46 -78 60 -72 L66 -68 V-12 Z" fill={F.fluss} />
      <rect x={-60} y={-80} width={106} height={80} rx={20} fill={F.wand} />
      <rect x={-48} y={-68} width={82} height={16} rx={8} fill={F.welle} />
      <rect x={-48} y={-22} width={28} height={14} rx={7} fill={F.welle} />
      <rect x={6} y={-22} width={28} height={14} rx={7} fill={F.welle} />
      <rect x={-60} y={-44} width={106} height={14} fill={F.tuerkis} opacity={0.3} />
      <rect x={-60} y={-40} width={106} height={6} fill={F.tuerkis} />
      <circle cx={-38} cy={-82} r={8} fill={F.baumHell} />
      <circle cx={-24} cy={-84} r={10} fill={F.baum} />
      <circle cx={-10} cy={-82} r={7} fill={F.baumHell} />
      <circle cx={22} cy={-82} r={6} fill={F.baum} />
      <rect x={-14} y={-24} width={20} height={24} rx={10} fill={F.tuerkis} />
      <g transform="translate(20,0)" stroke={F.text} strokeWidth={1.5}>
        <line x1={0} y1={-24} x2={0} y2={-29} />
        <circle cx={0} cy={-30} r={2} fill={F.orange} stroke="none" />
        <rect x={-6} y={-24} width={12} height={9} rx={3} fill={F.wand} />
        <circle cx={-2.5} cy={-19.5} r={1.3} fill={F.tuerkis} stroke="none" />
        <circle cx={2.5} cy={-19.5} r={1.3} fill={F.tuerkis} stroke="none" />
        <rect x={-5} y={-14} width={10} height={10} rx={2} fill={F.wand} />
        <path d="M-2.5 -4 V0 M2.5 -4 V0" />
      </g>
    </g>
  );
}

function EinfachesHaus({ farbe, symbol }: { farbe: string; symbol: PinSymbol }) {
  return (
    <g>
      <ellipse cx={6} cy={2} rx={52} ry={9} fill={F.grasDunkel} />
      <polygon points="36,0 36,-56 54,-66 54,-10" fill={F.sand} />
      <rect x={-36} y={-56} width={72} height={56} fill={F.wand} />
      <polygon points="0,-98 54,-66 36,-56 18,-90" fill={farbe} />
      <polygon points="0,-98 54,-66 36,-56 18,-90" fill={F.text} opacity={0.18} />
      <polygon points="-44,-54 0,-98 44,-54" fill={farbe} />
      <rect x={-28} y={-44} width={16} height={16} rx={3} fill={F.welle} />
      <rect x={12} y={-44} width={16} height={16} rx={3} fill={F.welle} />
      <rect x={-9} y={-26} width={18} height={26} rx={8} fill={farbe} />
      <circle cx={0} cy={-70} r={11} fill={F.wand} />
      <g transform="translate(0,-70) scale(0.62)">
        <PinZeichen name={symbol} farbe={farbe} />
      </g>
    </g>
  );
}

export function Gebaeude({ art, farbe, symbol }: { art: Gebaeudeart; farbe: string; symbol: PinSymbol }) {
  if (art === "experimenta") return <ExperimentaHaus />;
  if (art === "ipai") return <IpaiHaus />;
  return <EinfachesHaus farbe={farbe} symbol={symbol} />;
}
