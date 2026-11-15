/**
 * Isometrische Einrichtungsgebäude für die gemalte Kinder-Karte (DESIGN.md Projektentscheidung 11).
 * Stil wie die experimenta-Zeichnung des Teams (kräftige Kanten, gepflasterter Sockel). Die vier echten Orte
 * sind nach ihren echten Gebäuden in Heilbronn gezeichnet (Vorlage: die Fotos in public/medien/fotos/ und die
 * gemalten Ortsszenen) – eigene, vereinfachte Zeichnungen, keine Fotos. COSMOS ist kein echtes Haus (Platz mit Kiosk).
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

/** Klinker: feine waagerechte Fugen */
function Klinker({ breite, hoehe, farbe }: { breite: number; hoehe: number; farbe: string }) {
  return (
    <path d={Array.from({ length: Math.floor(hoehe / 7) }, (_, i) => `M0 ${-(i + 1) * 7} H${breite}`).join(" ")} stroke={farbe} strokeWidth={1} opacity={0.45} />
  );
}

/** Glasband mit senkrechten Sprossen (Erdgeschosse) */
function Glasband({ breite, hoehe, unten = 0, fill, sprossen, abstand = 22 }: { breite: number; hoehe: number; unten?: number; fill: string; sprossen: string; abstand?: number }) {
  return (
    <g>
      <rect x={0} y={-unten - hoehe} width={breite} height={hoehe} fill={fill} />
      <path d={Array.from({ length: Math.floor(breite / abstand) }, (_, i) => `M${(i + 1) * abstand} ${-unten - hoehe} V${-unten}`).join(" ")} stroke={sprossen} strokeWidth={2} opacity={0.8} />
    </g>
  );
}

/** Pflanzenwand (IPAI Spaces): grüne Fläche mit Blätter-Tupfen; feste Positionen, damit nichts flackert */
function Pflanzenwand({ von, bis, oben, unten }: { von: number; bis: number; oben: number; unten: number }) {
  const breite = bis - von, hoehe = unten - oben;
  const tupfen = Array.from({ length: Math.floor((breite * hoehe) / 160) }, (_, i) => {
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

// ---------- experimenta – nach dem echten Gebäude: gestapelte, versetzte Blöcke, weiße Rauten-Fassade, dunkle Glasbänder, Science Dome ----------

function Experimenta() {
  const rand = "#24323c";
  const weissL = "url(#ex-weissL)", weissR = "url(#ex-weissR)";
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
      {/* Erdgeschoss: dunkles Glas */}
      <Kiste x={270} y={345} a={170} b={160} h={40} links="url(#ex-glas)" rechts="url(#ex-glas)" oben="#3a4a56" rand={rand}
        linksInhalt={<Glasband breite={170} hoehe={40} fill="url(#ex-glas)" sprossen="#6f8798" />}
        rechtsInhalt={<Glasband breite={160} hoehe={40} fill="url(#ex-glas)" sprossen="#6f8798" />} />
      {/* 1. Block: weiße Rauten */}
      <Kiste x={262} y={305} a={176} b={168} h={56} links={weissL} rechts={weissR} oben="#f2f5f7" rand={rand}
        linksInhalt={<Rauten breite={176} hoehe={56} schritt={22} farbe="#aab5be" />}
        rechtsInhalt={<Rauten breite={168} hoehe={56} schritt={22} farbe="#9aa6b0" />} />
      {/* dunkles Glasband, leicht verdreht */}
      <Kiste x={276} y={249} a={168} b={158} h={30} links="url(#ex-glas)" rechts="url(#ex-glas)" oben="#3a4a56" rand={rand}
        linksInhalt={<Glasband breite={168} hoehe={30} fill="url(#ex-glas)" sprossen="#6f8798" abstand={28} />}
        rechtsInhalt={<Glasband breite={158} hoehe={30} fill="url(#ex-glas)" sprossen="#6f8798" abstand={28} />} />
      {/* 2. Block: weiße Rauten, zur anderen Seite versetzt */}
      <Kiste x={266} y={219} a={178} b={164} h={50} links={weissL} rechts={weissR} oben="#f2f5f7" rand={rand}
        linksInhalt={<Rauten breite={178} hoehe={50} schritt={22} farbe="#aab5be" />}
        rechtsInhalt={<Rauten breite={164} hoehe={50} schritt={22} farbe="#9aa6b0" />} />
      {/* oberster Block: blaues Glas an der Ecke */}
      <Kiste x={300} y={169} a={124} b={112} h={42} links="url(#ex-glas)" rechts="url(#ex-blau)" oben="#d7e1e8" rand={rand}
        linksInhalt={<Glasband breite={124} hoehe={42} fill="url(#ex-glas)" sprossen="#6f8798" abstand={26} />}
        rechtsInhalt={<path d="M28 -42 V0 M56 -42 V0 M84 -42 V0 M0 -21 H112" stroke="#cfe6fb" strokeWidth={2} opacity={0.8} />} />
      <path d="M300 169 300 127" stroke="#ffffff" strokeWidth={3} opacity={0.7} />
      {/* Science Dome: silberne Kuppel vor dem Haus */}
      <path d="M352 326 Q352 290 390 288 Q428 290 428 326 Z" fill="url(#ex-kuppel)" stroke={rand} strokeWidth={3} strokeLinejoin="round" />
      <path d="M352 326 Q390 336 428 326" fill="none" stroke={rand} strokeWidth={3} />
      <path d="M362 306 Q390 300 418 306" fill="none" stroke="#ffffff" strokeWidth={2} opacity={0.8} />
      {/* orange Kugeln am Ufer */}
      <g stroke={rand} strokeWidth={2}>
        <circle cx={150} cy={338} r={7} fill="#F59E0B" />
        <circle cx={170} cy={345} r={7} fill="#F59E0B" />
      </g>
    </g>
  );
}

// ---------- aim – Bildungscampus nach dem echten Ort: dunkelgraue Klinker-Würfel, Fensterraster, Glas-Erdgeschoss ----------

function Aim() {
  const rand = "#2c2e34";
  const fenster = "url(#aim-fenster)";
  return (
    <g>
      <defs>
        <linearGradient id="aim-fenster" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9fb3c4" /><stop offset=".5" stopColor="#3d4f5f" /><stop offset="1" stopColor="#1e2a35" /></linearGradient>
        <linearGradient id="aim-erd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b8d0de" /><stop offset="1" stopColor="#4b6576" /></linearGradient>
      </defs>
      <Sockel x={280} y={345} a={200} b={150} />
      {/* hinterer, niedrigerer Würfel */}
      <Kiste x={360} y={302} a={92} b={92} h={112} links="#8b8d93" rechts="#6f7177" oben="#9a9ca2" rand={rand}
        linksInhalt={<>
          <Klinker breite={92} hoehe={112} farbe="#5d5f65" />
          <Fenster von={4} bis={88} reihen={3} spalten={3} unten={36} hoehe={16} abstand={10} fill={fenster} rahmen="#e6e8ec" />
          <Glasband breite={92} hoehe={30} fill="url(#aim-erd)" sprossen="#e6e8ec" />
        </>}
        rechtsInhalt={<>
          <Klinker breite={92} hoehe={112} farbe="#55575d" />
          <Fenster von={4} bis={88} reihen={3} spalten={3} unten={36} hoehe={16} abstand={10} fill={fenster} rahmen="#d4d6da" />
        </>} />
      {/* vorderer, hoher Würfel */}
      <Kiste x={250} y={345} a={150} b={110} h={150} links="#80828a" rechts="#66686f" oben="#8f9198" rand={rand}
        linksInhalt={<>
          <Klinker breite={150} hoehe={150} farbe="#5d5f65" />
          <Fenster von={6} bis={144} reihen={4} spalten={5} unten={46} hoehe={18} abstand={9} fill={fenster} rahmen="#e6e8ec" />
          <Glasband breite={150} hoehe={38} fill="url(#aim-erd)" sprossen="#e6e8ec" />
          {/* Eingang mit lila Rahmen (aim-Farbe) */}
          <rect x={100} y={-38} width={34} height={38} fill="#2f3b4a" stroke="#6C4CE0" strokeWidth={4} />
        </>}
        rechtsInhalt={<>
          <Klinker breite={110} hoehe={150} farbe="#55575d" />
          <Fenster von={6} bis={104} reihen={4} spalten={3} unten={46} hoehe={18} abstand={9} fill={fenster} rahmen="#d4d6da" />
          <Glasband breite={110} hoehe={38} fill="url(#aim-erd)" sprossen="#d4d6da" />
        </>} />
      <path d="M250 345 250 195" stroke="#ffffff" strokeWidth={2.5} opacity={0.55} />
      {/* Platz davor: Bäume wie auf dem Campus */}
      <g stroke="#2f6b2f" strokeWidth={2}>
        <circle cx={118} cy={318} r={16} fill="#7BC86C" />
        <circle cx={420} cy={300} r={14} fill="#4E9A4A" />
      </g>
    </g>
  );
}

// ---------- Haus der Familie – nach dem echten Haus: Holzfassade, Fensterbänder mit Geländer, Glas-Erdgeschoss mit Stützen ----------

function HausDerFamilie() {
  const rand = "#6b4423";
  const holzL = "url(#hdf-holzL)", holzR = "url(#hdf-holzR)";
  const fensterband = (breite: number, unten: number) => (
    <g>
      <rect x={6} y={-unten - 22} width={breite - 12} height={22} fill="url(#hdf-glas)" stroke={rand} strokeWidth={2} />
      <path d={Array.from({ length: Math.floor((breite - 12) / 26) }, (_, i) => `M${6 + (i + 1) * 26} ${-unten - 22} V${-unten}`).join(" ")} stroke={rand} strokeWidth={1.5} opacity={0.7} />
      {/* Geländer vor dem Fensterband */}
      <path d={`M6 ${-unten - 10} H${breite - 6}`} stroke="#5d6470" strokeWidth={2} />
      <path d={Array.from({ length: Math.floor((breite - 12) / 6) }, (_, i) => `M${6 + i * 6} ${-unten - 10} V${-unten}`).join(" ")} stroke="#5d6470" strokeWidth={0.8} opacity={0.8} />
    </g>
  );
  const holzfugen = (breite: number, hoehe: number) => (
    <path d={Array.from({ length: Math.floor(hoehe / 6) }, (_, i) => `M0 ${-(i + 1) * 6} H${breite}`).join(" ")} stroke="#a8743e" strokeWidth={1} opacity={0.5} />
  );
  return (
    <g>
      <defs>
        <linearGradient id="hdf-holzL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f0cf9e" /><stop offset="1" stopColor="#d9a96c" /></linearGradient>
        <linearGradient id="hdf-holzR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d6a76b" /><stop offset="1" stopColor="#b8864c" /></linearGradient>
        <linearGradient id="hdf-glas" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e3f4f6" /><stop offset=".6" stopColor="#8FD3DB" /><stop offset="1" stopColor="#4AA3AF" /></linearGradient>
      </defs>
      <Sockel x={280} y={336} a={200} b={130} />
      {/* Glas-Erdgeschoss (etwas kleiner, das Holz steht vor) mit hellen Stützen */}
      <Kiste x={280} y={336} a={186} b={118} h={44} links="url(#hdf-glas)" rechts="url(#hdf-glas)" oben="#d9cbb3" rand={rand}
        linksInhalt={<>
          <Glasband breite={186} hoehe={44} fill="url(#hdf-glas)" sprossen="#5d6470" abstand={20} />
          {[30, 92, 154].map((u) => <rect key={u} x={u} y={-44} width={10} height={44} fill="#e7e2d6" stroke={rand} strokeWidth={1.5} />)}
          <rect x={56} y={-36} width={28} height={36} fill="#3f6b72" stroke={rand} strokeWidth={2} />
        </>}
        rechtsInhalt={<>
          <Glasband breite={118} hoehe={44} fill="url(#hdf-glas)" sprossen="#5d6470" abstand={20} />
          {[40, 100].map((u) => <rect key={u} x={u} y={-44} width={10} height={44} fill="#e7e2d6" stroke={rand} strokeWidth={1.5} />)}
        </>} />
      {/* zwei Obergeschosse aus Holz */}
      <Kiste x={280} y={292} a={198} b={128} h={96} links={holzL} rechts={holzR} oben="#e8dcc6" rand={rand}
        linksInhalt={<>{holzfugen(198, 96)}{fensterband(198, 12)}{fensterband(198, 60)}</>}
        rechtsInhalt={<>{holzfugen(128, 96)}{fensterband(128, 12)}{fensterband(128, 60)}</>} />
      <path d="M280 292 280 196" stroke="#fff4dd" strokeWidth={3} opacity={0.7} />
      {/* Bäume und Blumen davor */}
      <g stroke="#2f6b2f" strokeWidth={2}>
        <circle cx={410} cy={296} r={20} fill="#4E9A4A" />
        <circle cx={432} cy={284} r={15} fill="#7BC86C" />
        <circle cx={112} cy={318} r={14} fill="#7BC86C" />
      </g>
      <g>
        {[[150, 344, "#FF6B6B"], [162, 348, "#F59E0B"], [174, 351, "#6C4CE0"]].map(([bx, by, c]) => <circle key={bx as number} cx={bx as number} cy={by as number} r={4} fill={c as string} />)}
      </g>
    </g>
  );
}

// ---------- IPAI – IPAI Spaces nach dem echten Haus: hellgrauer Würfel, Pflanzenwände an den Ecken, dunkles Dachgeschoss ----------

function Ipai() {
  const rand = "#2a3036";
  const fenster = "url(#ipai-fenster)";
  return (
    <g>
      <defs>
        <linearGradient id="ipai-fenster" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a9c3d1" /><stop offset=".5" stopColor="#425b6a" /><stop offset="1" stopColor="#1f2c35" /></linearGradient>
        <linearGradient id="ipai-wandL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f1f2f3" /><stop offset="1" stopColor="#d9dcdf" /></linearGradient>
        <linearGradient id="ipai-wandR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d4d8dc" /><stop offset="1" stopColor="#b8bec4" /></linearGradient>
      </defs>
      <Sockel x={270} y={346} a={190} b={150} />
      <Kiste x={270} y={346} a={180} b={140} h={150} links="url(#ipai-wandL)" rechts="url(#ipai-wandR)" oben="#e3e6e9" rand={rand}
        linksInhalt={<>
          {/* dunkles Eingangsband mit Glastüren */}
          <rect x={0} y={-34} width={180} height={34} fill="#2d3238" />
          <rect x={70} y={-30} width={60} height={30} fill={fenster} stroke="#5b6670" strokeWidth={1.5} />
          <rect x={86} y={-46} width={78} height={10} fill="#2d3238" />
          <Fenster von={44} bis={136} reihen={3} spalten={2} unten={44} hoehe={26} abstand={10} fill={fenster} rahmen="#2d3238" />
          {/* Pflanzenwände an beiden Ecken, mit Fenstern darin */}
          <Pflanzenwand von={2} bis={44} oben={-148} unten={-36} />
          <Pflanzenwand von={138} bis={178} oben={-148} unten={-36} />
          <Fenster von={6} bis={42} reihen={3} spalten={1} unten={46} hoehe={24} abstand={12} fill={fenster} rahmen="#2d3238" />
          <Fenster von={138} bis={176} reihen={3} spalten={1} unten={46} hoehe={24} abstand={12} fill={fenster} rahmen="#2d3238" />
        </>}
        rechtsInhalt={<>
          <rect x={0} y={-34} width={140} height={34} fill="#2d3238" />
          <Fenster von={6} bis={100} reihen={3} spalten={2} unten={44} hoehe={26} abstand={10} fill={fenster} rahmen="#2d3238" />
          <Pflanzenwand von={102} bis={138} oben={-148} unten={-36} />
          <Fenster von={104} bis={136} reihen={3} spalten={1} unten={46} hoehe={24} abstand={12} fill={fenster} rahmen="#2d3238" />
        </>} />
      {/* zurückgesetztes dunkles Dachgeschoss */}
      <Kiste x={266} y={174} a={108} b={76} h={20} links="#4a5058" rechts="#3a3f46" oben="#5b626b" rand={rand}
        linksInhalt={<Glasband breite={108} hoehe={20} fill="#4a5058" sprossen="#6b7680" abstand={18} />} />
      <path d="M270 346 270 196" stroke="#ffffff" strokeWidth={2.5} opacity={0.6} />
      {/* Gräser und Bäume vor dem Haus */}
      <g stroke="#2f6b2f" strokeWidth={2}>
        <circle cx={420} cy={300} r={16} fill="#4E9A4A" />
        <circle cx={112} cy={322} r={12} fill="#7BC86C" />
      </g>
      <path d="M140 342 l4 -14 M146 344 l2 -16 M152 345 l-1 -14 M380 330 l3 -13 M386 328 l1 -15" stroke="#9ad67e" strokeWidth={3} strokeLinecap="round" />
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
  experimenta: { Zeichnung: Experimenta, ox: 265, oy: 300, oben: 52 },
  aim: { Zeichnung: Aim, ox: 255, oy: 296, oben: 112 },
  hdf: { Zeichnung: HausDerFamilie, ox: 245, oy: 290, oben: 95 },
  ipai: { Zeichnung: Ipai, ox: 250, oy: 298, oben: 95 },
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
