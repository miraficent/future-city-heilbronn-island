/**
 * Isometrische Einrichtungsgebäude für die gemalte Kinder-Karte (DESIGN.md Projektentscheidung 11).
 * Vorbild ist die experimenta-Zeichnung des Teams (Glas, kräftige Kanten, gepflasterter Sockel).
 * Alle Gebäude sind in einem 520 × 400-Raum gezeichnet und werden auf der Karte verkleinert.
 * Verläufe sind hier ausdrücklich erlaubt (Ausnahme nur für diese Gebäude).
 */
import type { ReactNode } from "react";
import { Fachwerkhaus } from "./fachwerkhaus";

/** Steigung der beiden Iso-Achsen (wie in der experimenta-Zeichnung) */
const LS = 0.28;
const RS = 0.358;

type P = [number, number];
const pt = (p: P[]) => p.map(([x, y]) => `${x},${y}`).join(" ");

/**
 * Quader: (x, y) = vordere untere Ecke, a = Länge nach links hinten, b = nach rechts hinten, h = Höhe.
 * Inhalte der Seiten werden in Flächenkoordinaten gezeichnet (u nach rechts, v nach oben negativ).
 */
function Kiste({
  x, y, a, b, h, links, rechts, oben, rand, linksInhalt, rechtsInhalt, obenInhalt,
}: {
  x: number; y: number; a: number; b: number; h: number;
  links: string; rechts: string; oben: string; rand: string;
  linksInhalt?: ReactNode; rechtsInhalt?: ReactNode; obenInhalt?: ReactNode;
}) {
  const L: P = [x - a, y - LS * a];
  const R: P = [x + b, y - RS * b];
  const H: P = [L[0] + b, L[1] - RS * b];
  return (
    <g strokeLinejoin="round">
      <g transform={`matrix(1 ${LS} 0 1 ${L[0]} ${L[1]})`}>
        <rect x={0} y={-h} width={a} height={h} fill={links} stroke={rand} strokeWidth={3} />
        {linksInhalt}
      </g>
      <g transform={`matrix(1 ${-RS} 0 1 ${x} ${y})`}>
        <rect x={0} y={-h} width={b} height={h} fill={rechts} stroke={rand} strokeWidth={3} />
        {rechtsInhalt}
      </g>
      <polygon points={pt([[x, y - h], [L[0], L[1] - h], [H[0], H[1] - h], [R[0], R[1] - h]])} fill={oben} stroke={rand} strokeWidth={3} />
      {/* Oberseite: u entlang der rechten Achse, v entlang der linken Achse */}
      {obenInhalt && <g transform={`matrix(1 ${-RS} -1 ${-LS} ${x} ${y - h})`}>{obenInhalt}</g>}
    </g>
  );
}

/** Fensterraster in Flächenkoordinaten */
function Fenster({ von, bis, reihen, spalten, unten, hoehe, abstand, fill, rahmen }: {
  von: number; bis: number; reihen: number; spalten: number; unten: number; hoehe: number; abstand: number; fill: string; rahmen: string;
}) {
  const breite = (bis - von) / spalten;
  return (
    <g>
      {Array.from({ length: reihen * spalten }, (_, i) => {
        const r = Math.floor(i / spalten), s = i % spalten;
        return (
          <rect key={i} x={von + s * breite + 4} y={-unten - (r + 1) * hoehe - r * abstand} width={breite - 8} height={hoehe}
            rx={2} fill={fill} stroke={rahmen} strokeWidth={2} />
        );
      })}
    </g>
  );
}

/** Gepflasterter Sockel mit Schlagschatten (wie bei der experimenta) */
function Sockel({ x, y, a, b }: { x: number; y: number; a: number; b: number }) {
  const ecke = (dx: number, dy: number, aa: number, bb: number): P[] => [
    [x + dx, y + dy], [x + dx - aa, y + dy - LS * aa], [x + dx - aa + bb, y + dy - LS * aa - RS * bb], [x + dx + bb, y + dy - RS * bb],
  ];
  return (
    <g>
      <polygon points={pt(ecke(-8, 22, a + 34, b + 30))} fill="#526b55" opacity={0.14} />
      <polygon points={pt(ecke(0, 16, a + 30, b + 26))} fill="#d9d2b9" stroke="#8a927e" strokeWidth={2.5} />
      <polygon points={pt(ecke(0, 9, a + 16, b + 14))} fill="#e9e2cb" stroke="#b0aa91" strokeWidth={1.5} />
    </g>
  );
}

// ---------- experimenta (Zeichnung des Teams, unverändert übernommen) ----------

function Experimenta() {
  return (
    <g>
      <defs>
        <linearGradient id="ex-glassFront" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a8dce0" /><stop offset=".42" stopColor="#438da7" /><stop offset="1" stopColor="#174d6b" />
        </linearGradient>
        <linearGradient id="ex-glassSide" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d2eff0" /><stop offset=".45" stopColor="#6bb3c1" /><stop offset="1" stopColor="#28627d" />
        </linearGradient>
        <linearGradient id="ex-glassRoof" x1="0" y1="0" x2=".9" y2="1">
          <stop offset="0" stopColor="#e4f5ef" /><stop offset=".55" stopColor="#9ccfd0" /><stop offset="1" stopColor="#4c91a5" />
        </linearGradient>
        <linearGradient id="ex-lowerGlass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4b91a7" /><stop offset="1" stopColor="#173e5d" />
        </linearGradient>
        <clipPath id="ex-frontClip"><path d="M92 170 270 220 270 348 119 292Z" /></clipPath>
        <clipPath id="ex-rightClip"><path d="M270 220 432 162 421 286 270 348Z" /></clipPath>
        <clipPath id="ex-upperFront"><path d="M82 132 270 185 270 224 92 174Z" /></clipPath>
        <clipPath id="ex-upperRight"><path d="M270 185 438 127 432 165 270 224Z" /></clipPath>
      </defs>
      <path d="M42 324 250 389 484 300 280 239Z" fill="#526b55" opacity=".12" />
      <path d="M47 313 250 377 479 291 275 228Z" fill="#d9d2b9" stroke="#8a927e" strokeWidth="2.5" />
      <path d="M67 311 250 368 458 290 276 239Z" fill="#e9e2cb" stroke="#b0aa91" strokeWidth="1.5" />
      <path d="M84 317 250 369 446 295" fill="none" stroke="#c0b99f" strokeWidth="2" />
      <path d="M119 270 270 315 421 259 421 286 270 348 119 292Z" fill="url(#ex-lowerGlass)" stroke="#244c60" strokeWidth="3" />
      <path d="M119 270 270 315 270 348 119 292Z" fill="#286780" opacity=".8" />
      <path d="M270 315 421 259 421 286 270 348Z" fill="#174866" opacity=".78" />
      <path d="M119 270 270 315 421 259" fill="none" stroke="#d2f1e9" strokeWidth="3" />
      <path d="M119 292 270 348 421 286" fill="none" stroke="#9bcbd0" strokeWidth="2" />
      <g stroke="#a9dce0" strokeWidth="2" opacity=".8">
        <path d="M145 278 145 302 M169 285 169 311 M194 293 194 320 M220 300 220 329 M246 307 246 337" />
        <path d="M294 306 294 338 M319 297 319 329 M345 287 345 320 M371 278 371 311 M397 268 397 301" />
      </g>
      <path d="M119 292 270 348 270 315" fill="none" stroke="#102f49" strokeWidth="4" />
      <path d="M92 170 270 220 270 315 119 270Z" fill="url(#ex-glassFront)" stroke="#244e63" strokeWidth="4" />
      <path d="M270 220 432 162 421 259 270 315Z" fill="url(#ex-glassSide)" stroke="#244e63" strokeWidth="4" />
      <path d="M92 170 270 220 432 162" fill="none" stroke="#e1f7f2" strokeWidth="3" />
      <g clipPath="url(#ex-frontClip)" stroke="#bce4e2" strokeWidth="2" opacity=".88">
        <path d="M115 173 139 277 M139 180 164 284 M164 187 188 291 M189 194 213 299 M214 201 238 307 M239 208 264 314" />
        <path d="M90 194 270 246 M90 218 270 270 M90 242 270 294" />
      </g>
      <g clipPath="url(#ex-rightClip)" stroke="#d2efeb" strokeWidth="2" opacity=".9">
        <path d="M292 213 285 309 M320 203 313 298 M348 193 341 287 M376 183 369 276 M404 172 397 266" />
        <path d="M270 244 430 187 M270 269 427 212 M270 293 424 237" />
      </g>
      <path d="M92 170 270 220 432 162 421 198 270 252 105 207Z" fill="#1c5875" opacity=".86" stroke="#244e63" strokeWidth="3" />
      <path d="M105 207 270 252 421 198" fill="none" stroke="#a9dfe0" strokeWidth="3" />
      <path d="M270 220 270 252" stroke="#d8f4ed" strokeWidth="3" />
      <path d="M117 209 270 252 411 202" fill="none" stroke="#173f5b" strokeWidth="2" />
      <path d="M82 132 270 185 438 127 250 76Z" fill="url(#ex-glassRoof)" stroke="#274f63" strokeWidth="4" />
      <path d="M82 132 270 185 270 220 92 170Z" fill="#6aaabd" stroke="#274f63" strokeWidth="3" />
      <path d="M270 185 438 127 432 162 270 220Z" fill="#b6dfe0" stroke="#274f63" strokeWidth="3" />
      <path d="M82 132 250 76 270 185Z" fill="#d8eeea" opacity=".65" stroke="#f2ffff" strokeWidth="2" />
      <path d="M250 76 438 127 270 185Z" fill="#b2d9d9" opacity=".7" stroke="#f2ffff" strokeWidth="2" />
      <path d="M82 132 270 185 438 127" fill="none" stroke="#f4ffff" strokeWidth="4" />
      <path d="M250 76 250 112 270 185" fill="none" stroke="#7baeb9" strokeWidth="2" />
      <path d="M250 76 250 112 438 127" fill="none" stroke="#e8ffff" strokeWidth="2" />
      <path d="M82 132 250 112 438 127" fill="none" stroke="#ffffff" strokeWidth="2" opacity=".75" />
      <path d="M250 112 270 185" stroke="#ffffff" strokeWidth="2" opacity=".8" />
      <path d="M82 132 270 185 438 127 250 76Z" fill="#ffffff" className="ig-glanz" />
      <g clipPath="url(#ex-upperFront)" stroke="#e2f6ef" strokeWidth="2" opacity=".9">
        <path d="M111 140 120 179 M146 150 155 189 M181 160 190 199 M216 170 225 209 M251 180 260 219" />
        <path d="M88 151 270 202 M91 162 270 213" />
      </g>
      <g clipPath="url(#ex-upperRight)" stroke="#6f9eaa" strokeWidth="2" opacity=".8">
        <path d="M300 174 300 210 M333 163 333 198 M366 151 366 186 M399 139 399 174" />
        <path d="M270 199 434 143 M270 211 433 155" />
      </g>
      <path d="M82 132 92 170 119 270" fill="none" stroke="#173f59" strokeWidth="4" />
      <path d="M438 127 432 162 421 259" fill="none" stroke="#173f59" strokeWidth="4" />
      <path d="M270 185 270 220 270 315" fill="none" stroke="#e1f6ef" strokeWidth="3" />
      <path d="M119 270 270 315 421 259" fill="none" stroke="#163f5a" strokeWidth="4" />
      <path d="M190 321 270 348 350 318" fill="none" stroke="#d4f1e8" strokeWidth="3" />
      <path d="M239 337 239 358 M270 348 270 367 M302 336 302 356" stroke="#c4e8e4" strokeWidth="2" />
      <path d="M250 342 270 349 290 342" fill="none" stroke="#173f5a" strokeWidth="2" />
    </g>
  );
}

// ---------- aim – Bildungscampus: heller Bau mit lila Glasbändern und Code-Schild ----------

function Aim() {
  const rand = "#3a2a7a";
  return (
    <g>
      <defs>
        <linearGradient id="aim-glas" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c9bdf6" /><stop offset=".5" stopColor="#7d63e6" /><stop offset="1" stopColor="#4F35B0" />
        </linearGradient>
        <linearGradient id="aim-wandL" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbf9f4" /><stop offset="1" stopColor="#e6e0d2" />
        </linearGradient>
        <linearGradient id="aim-wandR" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e3dccd" /><stop offset="1" stopColor="#cbc2ae" />
        </linearGradient>
      </defs>
      <Sockel x={280} y={340} a={210} b={140} />
      <Kiste x={280} y={340} a={210} b={140} h={125} links="url(#aim-wandL)" rechts="url(#aim-wandR)" oben="#efe9fb" rand={rand}
        linksInhalt={<>
          <Fenster von={8} bis={202} reihen={3} spalten={7} unten={14} hoehe={22} abstand={12} fill="url(#aim-glas)" rahmen={rand} />
          {/* Eingang mit lila Vordach */}
          <rect x={150} y={-34} width={44} height={34} fill="#3b2a85" stroke={rand} strokeWidth={2} />
          <rect x={140} y={-44} width={64} height={10} rx={2} fill="#6C4CE0" stroke={rand} strokeWidth={2} />
        </>}
        rechtsInhalt={<Fenster von={6} bis={134} reihen={3} spalten={4} unten={14} hoehe={22} abstand={12} fill="url(#aim-glas)" rahmen={rand} />}
      />
      {/* Aufbau mit Glasfront */}
      <Kiste x={250} y={206} a={130} b={95} h={58} links="url(#aim-glas)" rechts="#5b42c4" oben="#d9cff8" rand={rand}
        linksInhalt={<path d="M26 -58 V0 M52 -58 V0 M78 -58 V0 M104 -58 V0 M0 -29 H130" stroke="#e9e3ff" strokeWidth={2} opacity={0.8} />}
        rechtsInhalt={<path d="M24 -58 V0 M48 -58 V0 M72 -58 V0" stroke="#b6a6f2" strokeWidth={2} />}
      />
      {/* Code-Schild auf dem Dach (schwebt leicht) */}
      <g className="ig-schweben"><g transform={`matrix(1 ${LS} 0 1 150 128)`}>
        <rect x={6} y={-6} width={6} height={22} fill={rand} />
        <rect x={66} y={-6} width={6} height={22} fill={rand} />
        <rect x={-6} y={-58} width={90} height={54} rx={10} fill="#6C4CE0" stroke={rand} strokeWidth={3} />
        <path d="M22 -44 L10 -31 L22 -18 M56 -44 L68 -31 L56 -18 M46 -48 L32 -14" stroke="#FFFFFF" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g></g>
      <path d="M280 340 280 215" stroke="#ffffff" strokeWidth={3} opacity={0.7} />
    </g>
  );
}

// ---------- Haus der Familie – warmes Haus mit Satteldach, Herz und Garten ----------

function HausDerFamilie() {
  const rand = "#7a3a24";
  const x = 280, y = 336, a = 190, b = 120, h = 100, rh = 66;
  const L: P = [x - a, y - LS * a], R: P = [x + b, y - RS * b];
  const C0: P = [x, y - h], C1: P = [L[0], L[1] - h], C3: P = [R[0], R[1] - h], C2: P = [L[0] + b, L[1] - RS * b - h];
  const M0: P = [(C0[0] + C3[0]) / 2, (C0[1] + C3[1]) / 2 - rh];
  const M1: P = [(C1[0] + C2[0]) / 2, (C1[1] + C2[1]) / 2 - rh];
  return (
    <g>
      <defs>
        <linearGradient id="hdf-dach" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7ad92" /><stop offset=".55" stopColor="#F28C6B" /><stop offset="1" stopColor="#c8603f" />
        </linearGradient>
        <linearGradient id="hdf-glas" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d6f1f4" /><stop offset="1" stopColor="#5BB8C4" />
        </linearGradient>
      </defs>
      <Sockel x={x} y={y} a={a} b={b} />
      <polygon points={pt([M0, M1, C2, C3])} fill="#b9573a" stroke={rand} strokeWidth={3} strokeLinejoin="round" />
      <Kiste x={x} y={y} a={a} b={b} h={h} links="#fbf3e6" rechts="#ead9c0" oben="#ead9c0" rand={rand}
        linksInhalt={<>
          <Fenster von={10} bis={180} reihen={2} spalten={5} unten={14} hoehe={28} abstand={14} fill="url(#hdf-glas)" rahmen={rand} />
          {/* Tür mit Vordach */}
          <rect x={80} y={-44} width={34} height={44} rx={4} fill="#c8603f" stroke={rand} strokeWidth={2} />
          <rect x={70} y={-54} width={54} height={10} rx={3} fill="#F28C6B" stroke={rand} strokeWidth={2} />
        </>}
        rechtsInhalt={<>
          <Fenster von={6} bis={114} reihen={2} spalten={3} unten={14} hoehe={28} abstand={14} fill="url(#hdf-glas)" rahmen={rand} />
        </>}
      />
      {/* Giebel rechts mit Herz */}
      <polygon points={pt([C0, C3, M0])} fill="#ead9c0" stroke={rand} strokeWidth={3} strokeLinejoin="round" />
      <g transform={`translate(${M0[0]},${M0[1] + 38})`}>
        <path className="ig-puls" d="M0 10 C-14 0 -16 -10 -9 -14 C-5 -16 -1 -14 0 -10 C1 -14 5 -16 9 -14 C16 -10 14 0 0 10 Z" fill="#FF6B6B" stroke={rand} strokeWidth={2.5} />
      </g>
      {/* Dach vorn + Schornstein */}
      <polygon points={pt([C0, C1, M1, M0])} fill="url(#hdf-dach)" stroke={rand} strokeWidth={3} strokeLinejoin="round" />
      <g stroke="#fbd2c2" strokeWidth={2} opacity={0.6}>
        {[0.25, 0.5, 0.75].map((t) => {
          const p: P = [C0[0] + (C1[0] - C0[0]) * t, C0[1] + (C1[1] - C0[1]) * t];
          const q: P = [M0[0] + (M1[0] - M0[0]) * t, M0[1] + (M1[1] - M0[1]) * t];
          return <line key={t} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} />;
        })}
      </g>
      <Kiste x={170} y={210} a={18} b={16} h={30} links="#a8553a" rechts="#8a4430" oben="#6e3524" rand={rand} />
      <g fill="#ffffff" stroke="#d9d2c4" strokeWidth={2}>
        <circle className="ig-rauch" cx={167} cy={168} r={9} />
        <circle className="ig-rauch ig-rauch--2" cx={167} cy={168} r={9} />
      </g>
      {/* Garten: Bäume und Zaun */}
      <g stroke="#2f6b2f" strokeWidth={2}>
        <circle cx={410} cy={300} r={20} fill="#4E9A4A" />
        <circle cx={430} cy={288} r={15} fill="#7BC86C" />
      </g>
      <path d="M318 346 L420 309" stroke="#ffffff" strokeWidth={4} strokeDasharray="4 8" strokeLinecap="round" />
    </g>
  );
}

// ---------- IPAI – Glasturm auf flachem Sockelbau, Chip auf dem Dach ----------

function Ipai() {
  const rand = "#14544c";
  return (
    <g>
      <defs>
        <linearGradient id="ipai-glasL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b9efe7" /><stop offset=".45" stopColor="#2BB3A3" /><stop offset="1" stopColor="#11695f" />
        </linearGradient>
        <linearGradient id="ipai-glasR" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#dcf7f2" /><stop offset=".5" stopColor="#6fd0c3" /><stop offset="1" stopColor="#1f8a7d" />
        </linearGradient>
      </defs>
      <Sockel x={270} y={346} a={200} b={150} />
      <Kiste x={270} y={346} a={200} b={150} h={60} links="url(#ipai-glasL)" rechts="url(#ipai-glasR)" oben="#d7f2ec" rand={rand}
        linksInhalt={<path d="M25 -60 V0 M50 -60 V0 M75 -60 V0 M100 -60 V0 M125 -60 V0 M150 -60 V0 M175 -60 V0 M0 -30 H200" stroke="#e3fbf6" strokeWidth={2} opacity={0.8} />}
        rechtsInhalt={<path d="M25 -60 V0 M50 -60 V0 M75 -60 V0 M100 -60 V0 M125 -60 V0 M0 -30 H150" stroke="#e3fbf6" strokeWidth={2} opacity={0.8} />}
      />
      {/* Turm */}
      <Kiste x={300} y={265} a={100} b={80} h={170} links="url(#ipai-glasL)" rechts="url(#ipai-glasR)" oben="#e4f8f4" rand={rand}
        linksInhalt={<path d="M25 -170 V0 M50 -170 V0 M75 -170 V0 M0 -34 H100 M0 -68 H100 M0 -102 H100 M0 -136 H100" stroke="#e3fbf6" strokeWidth={2} opacity={0.85} />}
        rechtsInhalt={<path d="M26 -170 V0 M53 -170 V0 M0 -34 H80 M0 -68 H80 M0 -102 H80 M0 -136 H80" stroke="#0f4f47" strokeWidth={2} opacity={0.5} />}
        obenInhalt={
          <g transform="translate(24,26)">
            <rect x={-4} y={-4} width={40} height={40} rx={6} fill="#14544c" />
            <rect x={0} y={0} width={32} height={32} rx={5} fill="#2BB3A3" stroke="#ffffff" strokeWidth={2} />
            <rect x={9} y={9} width={14} height={14} rx={2} fill="#ffffff" />
          </g>
        }
      />
      {/* Antenne */}
      <path d="M295 92 V54" stroke={rand} strokeWidth={4} strokeLinecap="round" />
      <circle cx={295} cy={50} r={6} fill="#F59E0B" stroke={rand} strokeWidth={2} />
      <circle className="ig-blinken" cx={295} cy={50} r={11} fill="#F59E0B" opacity={0.5} />
      <g fill="none" stroke="#2BB3A3" strokeWidth={4} strokeLinecap="round">
        <path className="ig-welle" d="M281 36 Q295 22 309 36" />
        <path className="ig-welle ig-welle--2" d="M273 28 Q295 6 317 28" />
      </g>
      <path d="M300 95 300 265" stroke="#ffffff" strokeWidth={3} opacity={0.7} />
    </g>
  );
}

// ---------- COSMOS – Platz mit Kiosk, Sonnendach, Termin-Tafel und Wimpeln ----------

function Cosmos() {
  const rand = "#7a4c06";
  return (
    <g>
      <defs>
        <linearGradient id="cos-dach" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fcd38a" /><stop offset=".5" stopColor="#F59E0B" /><stop offset="1" stopColor="#C27C06" />
        </linearGradient>
      </defs>
      <Sockel x={265} y={350} a={210} b={160} />
      {/* Termin-Tafel hinten links */}
      <g transform={`matrix(1 ${LS} 0 1 110 214)`}>
        <rect x={10} y={-10} width={7} height={70} fill={rand} />
        <rect x={98} y={-10} width={7} height={70} fill={rand} />
        <rect x={0} y={-78} width={115} height={78} rx={8} fill="#7A4A2A" stroke={rand} strokeWidth={3} />
        <rect x={10} y={-68} width={40} height={40} rx={4} fill="#FFFFFF" stroke={rand} strokeWidth={2} />
        <rect x={10} y={-68} width={40} height={12} rx={3} fill="#FF6B6B" />
        <path d="M20 -42 H40 M20 -34 H34" stroke={rand} strokeWidth={3} strokeLinecap="round" />
        <rect x={58} y={-66} width={46} height={24} rx={3} fill="#F6F3EC" transform="rotate(-4 81 -54)" />
        <rect x={58} y={-36} width={46} height={24} rx={3} fill="#8FD3DB" transform="rotate(3 81 -24)" />
      </g>
      {/* Kiosk */}
      <Kiste x={300} y={300} a={90} b={70} h={70} links="#fff4dd" rechts="#f3dfb6" oben="#f3dfb6" rand={rand}
        linksInhalt={<>
          <rect x={10} y={-56} width={70} height={30} rx={3} fill="#8FD3DB" stroke={rand} strokeWidth={2} />
          <rect x={6} y={-26} width={78} height={8} fill="#F59E0B" stroke={rand} strokeWidth={2} />
        </>}
        rechtsInhalt={<rect x={22} y={-48} width={26} height={48} rx={3} fill="#C27C06" stroke={rand} strokeWidth={2} />}
      />
      {/* Sonnendach (Pyramide) */}
      <polygon points="300,224 212,199 300,140" fill="url(#cos-dach)" stroke={rand} strokeWidth={3} strokeLinejoin="round" />
      <polygon points="300,224 377,196 300,140" fill="#C27C06" stroke={rand} strokeWidth={3} strokeLinejoin="round" />
      <circle cx={300} cy={136} r={7} fill="#6C4CE0" stroke={rand} strokeWidth={2} />
      <circle className="ig-blinken" cx={300} cy={136} r={12} fill="#6C4CE0" opacity={0.4} />
      {/* Wimpelkette (weht leicht) */}
      <g className="ig-wehen">
      <path d="M118 182 Q200 230 296 150" fill="none" stroke={rand} strokeWidth={2} />
      {[[140, 194, "#6C4CE0"], [168, 205, "#2BB3A3"], [198, 210, "#FF6B6B"], [228, 205, "#F59E0B"], [256, 190, "#5BB8C4"]].map(([wx, wy, c]) => (
        <polygon key={wx as number} points={`${wx},${wy} ${(wx as number) + 16},${(wy as number) - 2} ${(wx as number) + 7},${(wy as number) + 16}`} fill={c as string} stroke={rand} strokeWidth={1.5} />
      ))}
      </g>
      {/* Bänke und Bäume */}
      <g stroke={rand} strokeWidth={2}>
        <polygon points={pt([[380, 330], [420, 316], [424, 322], [384, 336]])} fill="#7A4A2A" />
        <circle cx={430} cy={270} r={20} fill="#4E9A4A" />
        <circle cx={120} cy={300} r={18} fill="#7BC86C" />
      </g>
    </g>
  );
}

/** Zeichnung, Bodenmitte (ox, oy) und Oberkante (oben) im 520 × 400-Raum */
const GEBAEUDE: Record<string, { Zeichnung: () => ReactNode; ox: number; oy: number; oben: number }> = {
  experimenta: { Zeichnung: Experimenta, ox: 265, oy: 320, oben: 76 },
  aim: { Zeichnung: Aim, ox: 245, oy: 280, oben: 66 },
  hdf: { Zeichnung: HausDerFamilie, ox: 245, oy: 284, oben: 150 },
  ipai: { Zeichnung: Ipai, ox: 245, oy: 290, oben: 44 },
  cosmos: { Zeichnung: Cosmos, ox: 240, oy: 290, oben: 130 },
};

export const GEBAEUDE_MASSSTAB = 0.36;

/** Höhe über dem Boden (Kartenpixel) – dort sitzt der Pin */
export function institutHoehe(id: string) {
  const g = GEBAEUDE[id];
  return g ? (g.oy - g.oben) * GEBAEUDE_MASSSTAB : 86;
}

/** Gebäude einer Einrichtung, Ursprung = Bodenmitte. Unbekannte Einrichtungen: großes Fachwerkhaus in ihrer Farbe. */
export function InstitutGebaeude({ id, farbe, massstab = GEBAEUDE_MASSSTAB, verzoegerung = 0 }: { id: string; farbe: string; massstab?: number; verzoegerung?: number }) {
  const g = GEBAEUDE[id];
  if (!g) {
    return (
      <g>
        <ellipse cx={4} cy={2} rx={34} ry={9} fill="#2f4a2f" opacity={0.18} />
        <g transform="scale(1.6)"><Fachwerkhaus dach={farbe} /></g>
      </g>
    );
  }
  return (
    <g className="ig-wippen" style={{ animationDelay: `${-verzoegerung}s` }}>
      <g transform={`scale(${massstab}) translate(${-g.ox},${-g.oy})`}>
        <g.Zeichnung />
      </g>
    </g>
  );
}
