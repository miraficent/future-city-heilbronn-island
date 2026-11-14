/**
 * Gezeichnete Hintergrund-Szenen (füllen immer die ganze Fläche):
 *   TitelSzene    – Heilbronn am Neckar, zwei Kinder schauen auf die Stadt
 *   BahnhofSzene  – der Hauptbahnhof als Startpunkt
 */
import { F } from "@/lib/kinderkarte";

function Wolke({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} fill="#fff" className="kr-wolke">
      <ellipse cx={0} cy={0} rx={60} ry={22} />
      <circle cx={-22} cy={-14} r={24} />
      <circle cx={16} cy={-20} r={30} />
    </g>
  );
}

function Baumgruppe({ x, y, s = 1, spiegeln = false }: { x: number; y: number; s?: number; spiegeln?: boolean }) {
  return (
    <g transform={`translate(${x},${y}) scale(${spiegeln ? -s : s},${s})`}>
      <rect x={-10} y={-40} width={20} height={140} fill="#8a5a36" />
      <circle cx={-40} cy={-60} r={70} fill={F.baum} />
      <circle cx={40} cy={-90} r={80} fill={F.baumHell} />
      <circle cx={10} cy={-150} r={70} fill={F.baum} />
    </g>
  );
}

function Skyline({ y }: { y: number }) {
  const haeuser = Array.from({ length: 26 }, (_, i) => i);
  return (
    <g transform={`translate(0,${y})`}>
      <path d="M0 0 Q300 -70 600 -20 T1200 -30 V60 H0 Z" fill="#9fcf7f" />
      {haeuser.map((i) => {
        const x = 300 + i * 34;
        const h = 34 + ((i * 37) % 30);
        return (
          <g key={i} transform={`translate(${x},20)`}>
            <rect x={-14} y={-h} width={28} height={h} fill={F.wand} />
            <polygon points={`-17,${-h} 0,${-h - 18} 17,${-h}`} fill={i % 3 ? F.dach : "#d0624a"} />
            <rect x={-6} y={-h + 10} width={6} height={7} fill={F.welle} />
          </g>
        );
      })}
      {/* Kilianskirche */}
      <g transform="translate(860,20)">
        <rect x={-16} y={-150} width={32} height={150} fill="#e9d9b0" />
        <polygon points="-20,-150 0,-215 20,-150" fill="#8a7a66" />
        <circle cx={0} cy={-120} r={8} fill={F.welle} />
      </g>
    </g>
  );
}

export function TitelSzene() {
  return (
    <svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" className="kr-szene" aria-hidden="true">
      <rect width={1200} height={700} fill="#bfe6ff" />
      <Wolke x={220} y={110} />
      <Wolke x={980} y={80} s={1.2} />
      <Wolke x={640} y={150} s={0.7} />
      <Skyline y={380} />
      {/* Neckar mit Brücke */}
      <path d="M0 440 Q600 400 1200 450 V560 Q600 520 0 560 Z" fill={F.fluss} />
      <path d="M200 480 q10 -6 20 0 t20 0 M700 470 q10 -6 20 0 t20 0 M1000 500 q10 -6 20 0 t20 0" stroke={F.welle} strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M860 450 H1200 V470 H1180 A40 22 0 0 0 1100 470 H1060 A40 22 0 0 0 980 470 H940 A40 22 0 0 0 860 470 Z" fill="#e9d9b0" />
      <rect x={0} y={555} width={1200} height={150} fill={F.gras} />
      <Baumgruppe x={60} y={600} s={1.3} />
      <Baumgruppe x={1150} y={620} s={1.2} spiegeln />
      {/* Zwei Kinder von hinten */}
      <g transform="translate(250,700)">
        <rect x={-55} y={-190} width={110} height={190} rx={40} fill="#2f4b8a" />
        <rect x={-42} y={-175} width={84} height={95} rx={22} fill="#5b8fd6" />
        <circle cx={0} cy={-235} r={52} fill="#8a4a26" />
        <path d="M-50 -250 Q-30 -300 10 -290 Q50 -290 52 -240 Q40 -270 0 -268 Q-30 -268 -50 -250 Z" fill="#6b3e26" />
      </g>
      <g transform="translate(400,700)">
        <rect x={-50} y={-170} width={100} height={170} rx={38} fill="#f2a531" />
        <rect x={-38} y={-158} width={76} height={85} rx={20} fill="#d9433a" />
        <circle cx={0} cy={-210} r={48} fill="#6b3e26" />
        <circle cx={0} cy={-262} r={18} fill="#6b3e26" />
      </g>
    </svg>
  );
}

export function BahnhofSzene() {
  const fenster = [-230, -150, -70, 10, 90, 170];
  return (
    <svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" className="kr-szene" aria-hidden="true">
      <rect width={1200} height={700} fill="#bfe6ff" />
      <Wolke x={180} y={90} />
      <Wolke x={1020} y={70} s={1.1} />
      {/* Platz */}
      <rect x={0} y={520} width={1200} height={180} fill="#e8dcc4" />
      <path d="M0 600 H1200 M0 660 H1200" stroke="#d6c7a8" strokeWidth={3} />
      {/* Bahnhofsgebäude */}
      <g transform="translate(600,520)">
        <rect x={-420} y={-210} width={840} height={210} fill="#f0d79a" />
        <polygon points="-440,-210 -380,-280 380,-280 440,-210" fill="#5b6b8a" />
        <rect x={-120} y={-300} width={240} height={300} fill="#f3dfa8" />
        <polygon points="-140,-300 0,-390 140,-300" fill="#5b6b8a" />
        <rect x={-6} y={-430} width={12} height={40} fill="#5b6b8a" />
        <circle cx={0} cy={-325} r={34} fill="#fff" stroke={F.text} strokeWidth={5} />
        <path d="M0 -325 V-347 M0 -325 H16" stroke={F.text} strokeWidth={5} strokeLinecap="round" />
        {fenster.map((x) => (
          <g key={x}>
            <rect x={x - 30} y={-170} width={50} height={70} rx={25} fill={F.welle} stroke="#c9b27a" strokeWidth={4} />
            <rect x={x - 30} y={-80} width={50} height={70} rx={8} fill={F.welle} stroke="#c9b27a" strokeWidth={4} />
          </g>
        ))}
        <rect x={-90} y={-130} width={180} height={130} rx={60} fill="#7fb6e0" stroke="#c9b27a" strokeWidth={6} />
        {[-300, 300].map((x) => <rect key={x} x={x - 60} y={-200} width={6} height={200} fill="#e2c47e" />)}
      </g>
      {/* Zug links */}
      <g transform="translate(-20,470)">
        <rect x={0} y={0} width={240} height={90} rx={22} fill="#d9433a" />
        <rect x={20} y={18} width={60} height={34} rx={8} fill={F.welle} />
        <rect x={100} y={18} width={60} height={34} rx={8} fill={F.welle} />
        <rect x={0} y={66} width={240} height={10} fill="#fff" opacity={0.7} />
      </g>
      <Baumgruppe x={70} y={470} s={1.1} />
      <Baumgruppe x={1130} y={500} s={1.2} spiegeln />
      {/* Menschen auf dem Platz */}
      {[[820, 600, "#3D7BE8"], [870, 610, "#F59E0B"], [960, 590, "#2BB3A3"], [1040, 605, "#6C4CE0"]].map(([x, y, c]) => (
        <g key={`${x}`} transform={`translate(${x},${y})`}>
          <rect x={-10} y={-40} width={20} height={40} rx={8} fill={c as string} />
          <circle cx={0} cy={-50} r={10} fill="#e0b48f" />
        </g>
      ))}
    </svg>
  );
}
