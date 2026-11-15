/**
 * Isometrische Einrichtungsgebäude für die gemalte Kinder-Karte (DESIGN.md Projektentscheidung 11).
 * Stil wie die experimenta-Zeichnung des Teams (kräftige Kanten, gepflasterter Sockel). Die vier echten Orte
 * sind nach ihren echten Gebäuden in Heilbronn gezeichnet (Vorlage: die Fotos in public/medien/fotos/ und die
 * gemalten Ortsszenen sowie die Gebäudebeschreibungen in docs/heilbronn-bildprompts.json) – eigene, vereinfachte
 * Zeichnungen, keine Fotos. COSMOS hat kein eigenes Haus: Dort steht das Heilbronner Rathaus mit der Kunstuhr.
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
        <rect x={0} y={-h} width={a} height={h} fill={links} stroke={rand} strokeWidth={2.2} />
        {linksInhalt}
        <rect x={0} y={-h} width={a} height={h} fill="url(#ig-licht)" pointerEvents="none" />
      </g>
      <g transform={`matrix(1 ${-RS} 0 1 ${x} ${y})`}>
        <rect x={0} y={-h} width={b} height={h} fill={rechts} stroke={rand} strokeWidth={2.2} />
        {rechtsInhalt}
        <rect x={0} y={-h} width={b} height={h} fill="url(#ig-schatten)" pointerEvents="none" />
      </g>
      {oben !== "none" && <polygon points={pt([[x, y - h], [L[0], L[1] - h], [H[0], H[1] - h], [R[0], R[1] - h]])} fill={oben} stroke={rand} strokeWidth={2.2} />}
      {/* Oberseite: u entlang der rechten Achse, v entlang der linken Achse */}
      {obenInhalt && <g transform={`matrix(1 ${-RS} -1 ${-LS} ${x} ${y - h})`}>{obenInhalt}</g>}
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
      <polygon points={pt(ecke(-14, 30, a + 44, b + 40))} fill="#2f4a2f" opacity={0.1} />
      <polygon points={pt(ecke(-8, 22, a + 34, b + 30))} fill="#2f4a2f" opacity={0.12} />
      <polygon points={pt(ecke(0, 16, a + 30, b + 26))} fill="#d9d2b9" stroke="#8a927e" strokeWidth={2.5} />
      <polygon points={pt(ecke(0, 9, a + 16, b + 14))} fill="#e9e2cb" stroke="#b0aa91" strokeWidth={1.5} />
    </g>
  );
}

/** Baum im Stil der gemalten Karte: runde Krone mit Licht von oben links, Stamm, weicher Schatten */
function Baum({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g>
      <ellipse cx={x + r * 0.55} cy={y + r * 1.05} rx={r * 1.1} ry={r * 0.36} fill="#2f4a2f" opacity={0.2} />
      <rect x={x - r * 0.12} y={y + r * 0.2} width={r * 0.24} height={r * 0.85} rx={r * 0.1} fill="#7A4A2A" />
      <circle cx={x - r * 0.48} cy={y + r * 0.22} r={r * 0.62} fill="url(#ig-baum)" stroke="#2f6b2f" strokeWidth={1.5} />
      <circle cx={x + r * 0.5} cy={y + r * 0.18} r={r * 0.6} fill="url(#ig-baum)" stroke="#2f6b2f" strokeWidth={1.5} />
      <circle cx={x} cy={y - r * 0.12} r={r * 0.82} fill="url(#ig-baum)" stroke="#2f6b2f" strokeWidth={1.5} />
      <circle cx={x - r * 0.28} cy={y - r * 0.4} r={r * 0.3} fill="#c4eba6" opacity={0.6} />
    </g>
  );
}

/** Rauten-Fassade der experimenta: zwei gegenläufige Zickzack-Linien ergeben Dreiecke und Rauten */
function Rauten({ breite, hoehe, schritt, farbe }: { breite: number; hoehe: number; schritt: number; farbe: string }) {
  const n = Math.ceil(breite / schritt);
  const zick = (phase: number) =>
    Array.from({ length: n + 1 }, (_, i) => `${Math.min(i * schritt, breite)},${(i + phase) % 2 === 0 ? -hoehe : 0}`).join(" ");
  return (
    <g fill="none" stroke={farbe} strokeWidth={2} strokeLinejoin="round">
      <polyline points={zick(0)} />
      <polyline points={zick(1)} opacity={0.7} />
    </g>
  );
}

/** Feine waagerechte Fugen (Klinker, Holzlamellen) */
function Fugen({ breite, hoehe, abstand, farbe, deckkraft = 0.45 }: { breite: number; hoehe: number; abstand: number; farbe: string; deckkraft?: number }) {
  return (
    <path d={Array.from({ length: Math.floor(hoehe / abstand) }, (_, i) => `M0 ${-(i + 1) * abstand} H${breite}`).join(" ")} stroke={farbe} strokeWidth={1} opacity={deckkraft} />
  );
}

/** Glasband mit senkrechten Sprossen; `innen` färbt jedes zweite Feld (z. B. rote Räume der experimenta) */
function Glasband({ breite, hoehe, unten = 0, fill, sprossen, abstand = 22, innen }: { breite: number; hoehe: number; unten?: number; fill: string; sprossen: string; abstand?: number; innen?: string }) {
  const felder = Math.floor(breite / abstand);
  return (
    <g>
      <rect x={0} y={-unten - hoehe} width={breite} height={hoehe} fill={fill} />
      {innen && Array.from({ length: felder }, (_, i) => i % 3 !== 1 && (
        <rect key={i} x={i * abstand + 3} y={-unten - hoehe * 0.72} width={abstand - 6} height={hoehe * 0.5} fill={innen} opacity={0.55} />
      ))}
      <path d={Array.from({ length: felder }, (_, i) => `M${(i + 1) * abstand} ${-unten - hoehe} V${-unten}`).join(" ")} stroke={sprossen} strokeWidth={2} opacity={0.8} />
      {/* schräge Spiegelung wie auf echtem Glas */}
      <path d={Array.from({ length: Math.ceil(felder / 3) }, (_, i) => `M${i * 3 * abstand + 4} ${-unten - 2} L${i * 3 * abstand + abstand * 0.75} ${-unten - hoehe + 2}`).join(" ")} stroke="#ffffff" strokeWidth={3} opacity={0.28} strokeLinecap="round" />
    </g>
  );
}

/** Pflanzenwand (IPAI Spaces): grüne Fläche mit Blätter-Tupfen; feste Positionen, damit nichts flackert */
function Pflanzenwand({ von, bis, oben, unten }: { von: number; bis: number; oben: number; unten: number }) {
  const breite = bis - von, hoehe = unten - oben;
  const tupfen = Array.from({ length: Math.floor((breite * hoehe) / 150) }, (_, i) => {
    const x = von + ((i * 37) % breite);
    const y = oben + ((i * 53) % hoehe);
    return <circle key={i} cx={x} cy={y} r={4 + (i % 3)} fill={["#7BC86C", "#4E9A4A", "#9ad67e", "#3d7f3a"][i % 4]} />;
  });
  return (
    <g>
      <rect x={von} y={oben} width={breite} height={hoehe} rx={4} fill="#4E9A4A" />
      {tupfen}
    </g>
  );
}

/** Fahrrad (klein, für Vorplätze) */
function Fahrrad({ x, y, farbe }: { x: number; y: number; farbe: string }) {
  return (
    <g fill="none" stroke={farbe} strokeWidth={2} strokeLinecap="round">
      <circle cx={x} cy={y} r={5} />
      <circle cx={x + 15} cy={y + 4} r={5} />
      <path d={`M${x} ${y} L${x + 6} ${y - 6} L${x + 15} ${y + 4} M${x + 6} ${y - 6} L${x + 12} ${y - 4} M${x + 4} ${y - 9} L${x + 8} ${y - 8}`} />
    </g>
  );
}

// ---------- experimenta – nach dem echten Gebäude (Sauerbruch Hutton, 2019): gestapelte, versetzte Geschosse,
// weiße Fassade mit diagonalen Streben, rote Räume hinter dunklem Glas, Science Dome ----------

function Experimenta() {
  const rand = "#24323c";
  const weissL = "url(#ex-weissL)", weissR = "url(#ex-weissR)";
  const rot = "#d94b4b";
  return (
    <g>
      <defs>
        <linearGradient id="ex-weissL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#e3e8ec" /></linearGradient>
        <linearGradient id="ex-weissR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e6ebef" /><stop offset="1" stopColor="#c7d0d7" /></linearGradient>
        <linearGradient id="ex-glas" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4a6274" /><stop offset=".5" stopColor="#1f2f3c" /><stop offset="1" stopColor="#111a22" /></linearGradient>
        <linearGradient id="ex-blau" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8fc4ee" /><stop offset=".5" stopColor="#3b6fe0" /><stop offset="1" stopColor="#1d3f8a" /></linearGradient>
        <radialGradient id="ex-kuppel" cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#ffffff" /><stop offset=".6" stopColor="#c9d2da" /><stop offset="1" stopColor="#8d99a4" /></radialGradient>
      </defs>
      <Sockel x={270} y={345} a={180} b={170} />
      {/* Erdgeschoss: dunkles Glas mit warmem Licht */}
      <Kiste x={270} y={345} a={170} b={160} h={40} links="url(#ex-glas)" rechts="url(#ex-glas)" oben="#3a4a56" rand={rand}
        linksInhalt={<Glasband breite={170} hoehe={40} fill="url(#ex-glas)" sprossen="#6f8798" innen="#f5c542" />}
        rechtsInhalt={<Glasband breite={160} hoehe={40} fill="url(#ex-glas)" sprossen="#6f8798" innen="#f5c542" />} />
      {/* 1. Block: weiße Fassade mit Streben */}
      <Kiste x={262} y={305} a={176} b={168} h={56} links={weissL} rechts={weissR} oben="#f2f5f7" rand={rand}
        linksInhalt={<Rauten breite={176} hoehe={56} schritt={22} farbe="#aab5be" />}
        rechtsInhalt={<Rauten breite={168} hoehe={56} schritt={22} farbe="#9aa6b0" />} />
      {/* dunkles Glasband mit roten Räumen, leicht verdreht */}
      <Kiste x={276} y={249} a={168} b={158} h={30} links="url(#ex-glas)" rechts="url(#ex-glas)" oben="#3a4a56" rand={rand}
        linksInhalt={<Glasband breite={168} hoehe={30} fill="url(#ex-glas)" sprossen="#6f8798" abstand={24} innen={rot} />}
        rechtsInhalt={<Glasband breite={158} hoehe={30} fill="url(#ex-glas)" sprossen="#6f8798" abstand={24} innen={rot} />} />
      {/* 2. Block: weiß, zur anderen Seite versetzt */}
      <Kiste x={266} y={219} a={178} b={164} h={50} links={weissL} rechts={weissR} oben="#f2f5f7" rand={rand}
        linksInhalt={<Rauten breite={178} hoehe={50} schritt={22} farbe="#aab5be" />}
        rechtsInhalt={<Rauten breite={164} hoehe={50} schritt={22} farbe="#9aa6b0" />} />
      {/* oberster Block: blaues Glas an der Ecke, dunkles Glas mit roten Räumen */}
      <Kiste x={300} y={169} a={124} b={112} h={42} links="url(#ex-glas)" rechts="url(#ex-blau)" oben="#d7e1e8" rand={rand}
        linksInhalt={<Glasband breite={124} hoehe={42} fill="url(#ex-glas)" sprossen="#6f8798" abstand={26} innen={rot} />}
        rechtsInhalt={<path d="M28 -42 V0 M56 -42 V0 M84 -42 V0 M0 -21 H112" stroke="#cfe6fb" strokeWidth={2} opacity={0.8} />} />
      <path d="M300 169 300 127" stroke="#ffffff" strokeWidth={3} opacity={0.7} />
      {/* Science Dome: flacher Pavillon mit silberner Kuppel */}
      <path d="M346 330 L346 320 Q390 312 434 320 L434 330 Q390 340 346 330 Z" fill="#2f3f4b" stroke={rand} strokeWidth={2.5} />
      <path d="M352 321 Q352 288 390 286 Q428 288 428 321 Z" fill="url(#ex-kuppel)" stroke={rand} strokeWidth={3} strokeLinejoin="round" />
      <path d="M362 304 Q390 298 418 304" fill="none" stroke="#ffffff" strokeWidth={2} opacity={0.8} />
      {/* orange Kugeln und ein Stück Neckar */}
      <path d="M40 352 Q90 366 150 362 L132 382 Q80 384 36 368 Z" fill="#5BB8C4" opacity={0.85} />
      <g stroke={rand} strokeWidth={2}>
        <circle cx={150} cy={338} r={7} fill="#F59E0B" />
        <circle cx={170} cy={345} r={7} fill="#F59E0B" />
      </g>
    </g>
  );
}

// ---------- aim – Bildungscampus 7 nach dem offiziellen Foto: vierstöckig, hell-beiger Klinker,
// breite Bänder dunkel gerahmter Fenster, höheres gläsernes Treppenhaus, Flachdach ----------

function Aim() {
  const rand = "#5a4a32";
  const band = (breite: number, unten: number) => (
    <g key={unten}>
      <rect x={8} y={-unten - 20} width={breite - 16} height={20} fill="url(#aim-fenster)" stroke="#2f3a45" strokeWidth={3} />
      <path d={Array.from({ length: Math.floor((breite - 16) / 20) }, (_, i) => `M${8 + (i + 1) * 20} ${-unten - 20} V${-unten}`).join(" ")} stroke="#2f3a45" strokeWidth={2} />
    </g>
  );
  return (
    <g>
      <defs>
        <linearGradient id="aim-fenster" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a9c4d6" /><stop offset=".55" stopColor="#4d6577" /><stop offset="1" stopColor="#253442" /></linearGradient>
        <linearGradient id="aim-wandL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f6eedd" /><stop offset="1" stopColor="#e6d7ba" /></linearGradient>
        <linearGradient id="aim-wandR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#dccaa6" /><stop offset="1" stopColor="#c7b28a" /></linearGradient>
        <linearGradient id="aim-treppe" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e3f3fa" /><stop offset=".6" stopColor="#9fcbe0" /><stop offset="1" stopColor="#5f93ad" /></linearGradient>
      </defs>
      <Sockel x={280} y={345} a={200} b={150} />
      <Kiste x={280} y={345} a={196} b={140} h={140} links="url(#aim-wandL)" rechts="url(#aim-wandR)" oben="#efe6d4" rand={rand}
        linksInhalt={<>
          <Fugen breite={196} hoehe={140} abstand={6} farbe="#cdb994" />
          <Glasband breite={196} hoehe={32} fill="url(#aim-fenster)" sprossen="#2f3a45" abstand={24} />
          {[44, 80, 116].map((u) => band(196, u - 4))}
        </>}
        rechtsInhalt={<>
          <Fugen breite={140} hoehe={140} abstand={6} farbe="#b8a37c" />
          <Glasband breite={140} hoehe={32} fill="url(#aim-fenster)" sprossen="#2f3a45" abstand={24} />
          {[44, 80, 116].map((u) => band(140, u - 4))}
        </>} />
      {/* gläsernes Treppenhaus, höher als das Dach */}
      <Kiste x={156} y={310} a={30} b={24} h={160} links="url(#aim-treppe)" rechts="url(#aim-treppe)" oben="#e3f3fa" rand={rand}
        linksInhalt={<path d="M0 -36 H30 M0 -72 H30 M0 -108 H30 M0 -144 H30 M15 -160 V0" stroke="#ffffff" strokeWidth={2} opacity={0.8} />}
        rechtsInhalt={<path d="M0 -36 H24 M0 -72 H24 M0 -108 H24 M0 -144 H24" stroke="#ffffff" strokeWidth={2} opacity={0.8} />} />
      {/* Eingang mit lila Vordach (aim-Farbe) */}
      <g transform={`matrix(1 ${-RS} 0 1 280 345)`}>
        <rect x={40} y={-30} width={34} height={30} fill="#253442" />
        <rect x={34} y={-38} width={46} height={8} rx={2} fill="#6C4CE0" stroke={rand} strokeWidth={1.5} />
      </g>
      <path d="M280 345 280 205" stroke="#ffffff" strokeWidth={2.5} opacity={0.6} />
      {/* Campus-Hof: Bäume, Bank, Fahrräder */}
      <g>
        <Baum x={112} y={312} r={22} />
        <Baum x={426} y={292} r={20} />
      </g>
      <Fahrrad x={330} y={352} farbe="#5d6470" />
      <Fahrrad x={354} y={344} farbe="#5d6470" />
    </g>
  );
}

// ---------- Haus der Familie – in der Josef-Schwarz-Schule (Neckarbogen) nach den offiziellen Fotos:
// großes mehrstöckiges Haus mit hellen Holzlamellen, durchgehenden Fensterbändern, umlaufenden Balkonen,
// verglaster Eingang unter Betonstützen, Fahrradständer ----------

function HausDerFamilie() {
  const rand = "#6b4423";
  const holzL = "url(#hdf-holzL)", holzR = "url(#hdf-holzR)";
  const geschoss = 34;
  const fensterband = (breite: number, unten: number) => (
    <g key={unten}>
      <rect x={6} y={-unten - 22} width={breite - 12} height={22} fill="url(#hdf-glas)" stroke="#4a4f57" strokeWidth={2} />
      <path d={Array.from({ length: Math.floor((breite - 12) / 24) }, (_, i) => `M${6 + (i + 1) * 24} ${-unten - 22} V${-unten}`).join(" ")} stroke="#4a4f57" strokeWidth={1.5} opacity={0.8} />
      {/* Geländer */}
      <path d={`M2 ${-unten - 9} H${breite - 2}`} stroke="#4a4f57" strokeWidth={2} />
      <path d={Array.from({ length: Math.floor((breite - 4) / 5) }, (_, i) => `M${2 + i * 5} ${-unten - 9} V${-unten}`).join(" ")} stroke="#4a4f57" strokeWidth={0.8} opacity={0.75} />
    </g>
  );
  const lamellen = (breite: number, hoehe: number) => <Fugen breite={breite} hoehe={hoehe} abstand={4} farbe="#b07e45" deckkraft={0.4} />;
  /** Balkonplatte rund ums Haus: Kiste um e größer, Vorderecke nach vorn verschoben; oben nur bei der untersten sichtbar */
  const balkon = (y: number, mitOberseite: boolean, e = 7) => (
    <Kiste x={280} y={y + (LS + RS) * e} a={198 + 2 * e} b={128 + 2 * e} h={5} links="#e7e2d6" rechts="#cfc8b8" oben={mitOberseite ? "#efebe2" : "none"} rand="#8a8476" />
  );
  return (
    <g>
      <defs>
        <linearGradient id="hdf-holzL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f2d9b0" /><stop offset="1" stopColor="#dcb47e" /></linearGradient>
        <linearGradient id="hdf-holzR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d9b07a" /><stop offset="1" stopColor="#bd8d55" /></linearGradient>
        <linearGradient id="hdf-glas" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e3f4f6" /><stop offset=".6" stopColor="#8FD3DB" /><stop offset="1" stopColor="#4AA3AF" /></linearGradient>
      </defs>
      <Sockel x={280} y={336} a={204} b={134} />
      {/* verglastes Erdgeschoss mit Betonstützen */}
      <Kiste x={280} y={336} a={186} b={118} h={40} links="url(#hdf-glas)" rechts="url(#hdf-glas)" oben="#d9cbb3" rand={rand}
        linksInhalt={<>
          <Glasband breite={186} hoehe={40} fill="url(#hdf-glas)" sprossen="#4a4f57" abstand={20} innen="#f5c542" />
          {[26, 86, 146].map((u) => <rect key={u} x={u} y={-40} width={10} height={40} fill="#e7e2d6" stroke="#8a8476" strokeWidth={1.5} />)}
          <rect x={52} y={-34} width={28} height={34} fill="#3f6b72" stroke={rand} strokeWidth={2} />
        </>}
        rechtsInhalt={<>
          <Glasband breite={118} hoehe={40} fill="url(#hdf-glas)" sprossen="#4a4f57" abstand={20} innen="#f5c542" />
          {[36, 96].map((u) => <rect key={u} x={u} y={-40} width={10} height={40} fill="#e7e2d6" stroke="#8a8476" strokeWidth={1.5} />)}
        </>} />
      {balkon(296, true)}
      {/* drei Obergeschosse mit hellen Holzlamellen */}
      <Kiste x={280} y={296} a={198} b={128} h={geschoss * 3} links={holzL} rechts={holzR} oben="#e8dcc6" rand={rand}
        linksInhalt={<>{lamellen(198, geschoss * 3)}{[6, 6 + geschoss, 6 + 2 * geschoss].map((u) => fensterband(198, u))}</>}
        rechtsInhalt={<>{lamellen(128, geschoss * 3)}{[6, 6 + geschoss, 6 + 2 * geschoss].map((u) => fensterband(128, u))}</>} />
      {balkon(296 - geschoss, false)}
      {balkon(296 - 2 * geschoss, false)}
      <path d="M280 296 280 194" stroke="#fff4dd" strokeWidth={3} opacity={0.6} />
      {/* Grün, Blumen und Fahrradständer */}
      <g>
        <Baum x={414} y={288} r={27} />
        <Baum x={436} y={276} r={20} />
        <Baum x={108} y={312} r={19} />
      </g>
      {[[140, 344, "#FF6B6B"], [152, 348, "#F59E0B"], [164, 351, "#6C4CE0"], [176, 353, "#FF6B6B"]].map(([bx, by, c]) => <circle key={bx as number} cx={bx as number} cy={by as number} r={4} fill={c as string} />)}
      <path d="M318 354 h30 M322 354 v-8 M330 354 v-8 M338 354 v-8 M346 354 v-8" stroke="#8d99a4" strokeWidth={2} strokeLinecap="round" />
      <Fahrrad x={320} y={350} farbe="#3b6fe0" />
      <Fahrrad x={338} y={346} farbe="#d94b4b" />
    </g>
  );
}

// ---------- IPAI – IPAI SPACES (Im Zukunftspark) nach den Fotos: vierstöckig, L-förmig, dunkelgraue Rahmen,
// raumhohes Glas, Pflanzenwände an den Ecken, Pflanzkübel auf dem Dach, verglaster Eingang ----------

function Ipai() {
  const rand = "#2a3036";
  const glas = "url(#ipai-glas)";
  /** Fassade: helle Wand, dunkle Rahmen um große Glasflächen (3 Obergeschosse) */
  const raster = (von: number, bis: number, spalten: number) => {
    const breite = (bis - von) / spalten;
    return Array.from({ length: 3 * spalten }, (_, i) => {
      const r = Math.floor(i / spalten), s = i % spalten;
      return <rect key={i} x={von + s * breite + 3} y={-44 - (r + 1) * 30 - r * 6} width={breite - 6} height={30} fill={glas} stroke="#3a4048" strokeWidth={4} />;
    });
  };
  return (
    <g>
      <defs>
        <linearGradient id="ipai-glas" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#b6cfdc" /><stop offset=".5" stopColor="#4d6676" /><stop offset="1" stopColor="#22303a" /></linearGradient>
        <linearGradient id="ipai-wandL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f1f2f3" /><stop offset="1" stopColor="#d9dcdf" /></linearGradient>
        <linearGradient id="ipai-wandR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d4d8dc" /><stop offset="1" stopColor="#b8bec4" /></linearGradient>
      </defs>
      <Sockel x={270} y={346} a={200} b={160} />
      {/* hinterer Flügel (L-Form) */}
      <Kiste x={380} y={307} a={56} b={86} h={150} links="url(#ipai-wandL)" rechts="url(#ipai-wandR)" oben="#e3e6e9" rand={rand}
        rechtsInhalt={<>
          <rect x={0} y={-34} width={86} height={34} fill="#2d3238" />
          {raster(4, 62, 2)}
          <Pflanzenwand von={62} bis={86} oben={-148} unten={-36} />
        </>} />
      {/* Hauptbau */}
      <Kiste x={270} y={346} a={180} b={110} h={150} links="url(#ipai-wandL)" rechts="url(#ipai-wandR)" oben="#e3e6e9" rand={rand}
        linksInhalt={<>
          <rect x={0} y={-34} width={180} height={34} fill="#2d3238" />
          <rect x={64} y={-30} width={66} height={30} fill={glas} stroke="#5b6670" strokeWidth={1.5} />
          <rect x={82} y={-46} width={84} height={10} fill="#2d3238" />
          {raster(44, 136, 2)}
          <Pflanzenwand von={2} bis={44} oben={-148} unten={-36} />
          <Pflanzenwand von={138} bis={178} oben={-148} unten={-36} />
          {raster(6, 42, 1)}
          {raster(140, 176, 1)}
        </>}
        rechtsInhalt={<>
          <rect x={0} y={-34} width={110} height={34} fill="#2d3238" />
          {raster(4, 108, 3)}
        </>} />
      {/* zurückgesetztes dunkles Dachgeschoss und Pflanzkübel auf dem Dach */}
      <Kiste x={266} y={178} a={120} b={70} h={20} links="#4a5058" rechts="#3a3f46" oben="#5b626b" rand={rand}
        linksInhalt={<Glasband breite={120} hoehe={20} fill="#4a5058" sprossen="#6b7680" abstand={18} />} />
      <g stroke="#2f6b2f" strokeWidth={1.5}>
        {[[118, 140], [150, 150], [392, 132], [410, 140]].map(([px, py]) => <circle key={px} cx={px} cy={py} r={7} fill="#7BC86C" />)}
      </g>
      <path d="M270 346 270 196" stroke="#ffffff" strokeWidth={2.5} opacity={0.6} />
      {/* Vorplatz: Bäume, Gräser, Fahrräder */}
      <g>
        <Baum x={434} y={294} r={22} />
        <Baum x={108} y={316} r={16} />
      </g>
      <path d="M140 342 l4 -14 M146 344 l2 -16 M152 345 l-1 -14 M372 334 l3 -13 M378 332 l1 -15" stroke="#9ad67e" strokeWidth={3} strokeLinecap="round" />
      <Fahrrad x={300} y={354} farbe="#2BB3A3" />
    </g>
  );
}

// ---------- COSMOS – kein eigenes Haus (Dachmarke für Veranstaltungen in ganz Heilbronn). Gezeichnet ist darum
// ein echtes Wahrzeichen der Stadt: das Rathaus am Marktplatz mit der astronomischen Kunstuhr, davor Termin-Tafel und Wimpel ----------

function Cosmos() {
  const rand = "#6b4a1a";
  const x = 300, y = 330, a = 200, b = 90, h = 80, rh = 52;
  const L: P = [x - a, y - LS * a], R: P = [x + b, y - RS * b];
  const C0: P = [x, y - h], C1: P = [L[0], L[1] - h], C3: P = [R[0], R[1] - h], C2: P = [L[0] + b, L[1] - RS * b - h];
  const M0: P = [(C0[0] + C3[0]) / 2, (C0[1] + C3[1]) / 2 - rh];
  const M1: P = [(C1[0] + C2[0]) / 2, (C1[1] + C2[1]) / 2 - rh];
  const links = (inhalt: ReactNode) => <g transform={`matrix(1 ${LS} 0 1 ${L[0]} ${L[1]})`}>{inhalt}</g>;
  return (
    <g>
      <defs>
        <linearGradient id="cos-stein" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f3dcae" /><stop offset="1" stopColor="#E8C88A" /></linearGradient>
        <linearGradient id="cos-dach" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f0a07c" /><stop offset=".55" stopColor="#E07A4F" /><stop offset="1" stopColor="#b9573a" /></linearGradient>
      </defs>
      <Sockel x={x} y={y + 14} a={a + 20} b={b + 60} />
      {/* Dach hinten (Giebelseite rechts) */}
      <polygon points={pt([M0, M1, C2, C3])} fill="#b9573a" stroke={rand} strokeWidth={3} strokeLinejoin="round" />
      <Kiste x={x} y={y} a={a} b={b} h={h} links="url(#cos-stein)" rechts="#d9b06c" oben="#d9b06c" rand={rand}
        linksInhalt={<>
          {/* Laubengang mit Bögen im Erdgeschoss */}
          {Array.from({ length: 6 }, (_, i) => (
            <path key={i} d={`M${14 + i * 30} 0 V-22 A11 11 0 0 1 ${36 + i * 30} -22 V0 Z`} fill="#6b4a1a" opacity={0.85} />
          ))}
          <path d="M0 -38 H200" stroke="#C49A5A" strokeWidth={3} />
          {/* hohe Fenster im Obergeschoss */}
          {Array.from({ length: 7 }, (_, i) => (
            <rect key={i} x={12 + i * 27} y={-72} width={14} height={26} rx={2} fill="#8FD3DB" stroke="#ffffff" strokeWidth={2.5} />
          ))}
        </>}
        rechtsInhalt={<>
          {Array.from({ length: 3 }, (_, i) => (
            <path key={i} d={`M${12 + i * 28} 0 V-22 A10 10 0 0 1 ${32 + i * 28} -22 V0 Z`} fill="#6b4a1a" opacity={0.85} />
          ))}
          {Array.from({ length: 3 }, (_, i) => <rect key={i} x={12 + i * 28} y={-72} width={14} height={26} rx={2} fill="#8FD3DB" stroke="#ffffff" strokeWidth={2.5} />)}
        </>} />
      {/* Giebel rechts */}
      <polygon points={pt([C0, C3, M0])} fill="#d9b06c" stroke={rand} strokeWidth={3} strokeLinejoin="round" />
      {/* Dach vorn mit Gauben */}
      <polygon points={pt([C0, C1, M1, M0])} fill="url(#cos-dach)" stroke={rand} strokeWidth={3} strokeLinejoin="round" />
      {[0.22, 0.78].map((t) => {
        const p: P = [C0[0] + (C1[0] - C0[0]) * t, C0[1] + (C1[1] - C0[1]) * t - 22];
        return <polygon key={t} points={pt([[p[0] - 9, p[1] + 10], [p[0], p[1] - 4], [p[0] + 9, p[1] + 12], [p[0] + 9, p[1] + 20], [p[0] - 9, p[1] + 16]])} fill="#f3dcae" stroke={rand} strokeWidth={2} />;
      })}
      {/* Mittelgiebel mit der astronomischen Kunstuhr */}
      {links(<>
        <path d="M70 -80 V-118 L82 -118 L82 -132 L94 -132 L94 -146 L106 -146 L106 -132 L118 -132 L118 -118 L130 -118 V-80 Z" fill="url(#cos-stein)" stroke={rand} strokeWidth={3} strokeLinejoin="round" />
        <circle cx={100} cy={-104} r={18} fill="#F59E0B" stroke={rand} strokeWidth={2.5} />
        <circle cx={100} cy={-104} r={13} fill="#1E2A5A" />
        <circle cx={100} cy={-104} r={7} fill="none" stroke="#F59E0B" strokeWidth={1.5} />
        <path d="M100 -104 L100 -115 M100 -104 L108 -100" stroke="#F59E0B" strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={92} cy={-110} r={2.5} fill="#F59E0B" />
        <circle cx={109} cy={-110} r={2} fill="#ffffff" />
        <path d="M98 -146 V-158" stroke={rand} strokeWidth={2.5} />
        <circle cx={98} cy={-160} r={3.5} fill="#F59E0B" stroke={rand} strokeWidth={1.5} />
      </>)}
      {/* Freitreppe vor dem Mittelbau */}
      {links(<>
        <path d="M84 0 h32 l6 10 h-44 Z" fill="#e7e2d6" stroke="#8a8476" strokeWidth={1.5} />
        <path d="M80 10 h40 l6 9 h-52 Z" fill="#d9d2b9" stroke="#8a8476" strokeWidth={1.5} />
      </>)}
      {/* Termin-Tafel und Wimpel: hier ist alles, was in Heilbronn los ist */}
      <g transform={`matrix(1 ${-RS} 0 1 396 352)`}>
        <rect x={6} y={-6} width={5} height={34} fill={rand} />
        <rect x={52} y={-6} width={5} height={34} fill={rand} />
        <rect x={0} y={-46} width={64} height={44} rx={6} fill="#7A4A2A" stroke={rand} strokeWidth={2.5} />
        <rect x={6} y={-40} width={24} height={24} rx={3} fill="#FFFFFF" />
        <rect x={6} y={-40} width={24} height={7} rx={2} fill="#FF6B6B" />
        <rect x={34} y={-40} width={24} height={14} rx={2} fill="#8FD3DB" />
        <rect x={34} y={-22} width={24} height={14} rx={2} fill="#F6F3EC" />
      </g>
      <g className="ig-wehen">
        <path d="M150 300 Q250 340 360 300" fill="none" stroke={rand} strokeWidth={2} />
        {[[176, 314, "#6C4CE0"], [210, 324, "#2BB3A3"], [246, 328, "#FF6B6B"], [282, 325, "#F59E0B"], [318, 316, "#5BB8C4"]].map(([wx, wy, c]) => (
          <polygon key={wx as number} points={`${wx},${wy} ${(wx as number) + 16},${(wy as number) - 2} ${(wx as number) + 7},${(wy as number) + 16}`} fill={c as string} stroke={rand} strokeWidth={1.5} />
        ))}
      </g>
      {/* Marktplatz: Bäume */}
      <g>
        <Baum x={92} y={302} r={20} />
        <Baum x={450} y={294} r={22} />
      </g>
    </g>
  );
}

/** Zeichnung, Bodenmitte (ox, oy) und Oberkante (oben) im 520 × 400-Raum */
const GEBAEUDE: Record<string, { Zeichnung: () => ReactNode; ox: number; oy: number; oben: number }> = {
  experimenta: { Zeichnung: Experimenta, ox: 265, oy: 300, oben: 52 },
  aim: { Zeichnung: Aim, ox: 255, oy: 296, oben: 100 },
  hdf: { Zeichnung: HausDerFamilie, ox: 245, oy: 290, oben: 93 },
  ipai: { Zeichnung: Ipai, ox: 250, oy: 296, oben: 99 },
  cosmos: { Zeichnung: Cosmos, ox: 245, oy: 292, oben: 126 },
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
      <defs>
        <linearGradient id="ig-licht" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.22} /><stop offset=".55" stopColor="#ffffff" stopOpacity={0} /><stop offset="1" stopColor="#1f2559" stopOpacity={0.06} />
        </linearGradient>
        <linearGradient id="ig-schatten" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1f2559" stopOpacity={0.04} /><stop offset="1" stopColor="#1f2559" stopOpacity={0.16} />
        </linearGradient>
        <radialGradient id="ig-baum" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#9ad67e" /><stop offset=".55" stopColor="#5fae54" /><stop offset="1" stopColor="#3d7f3a" />
        </radialGradient>
      </defs>
      <g transform={`scale(${massstab}) translate(${-g.ox},${-g.oy})`}>
        <g.Zeichnung />
      </g>
    </g>
  );
}
