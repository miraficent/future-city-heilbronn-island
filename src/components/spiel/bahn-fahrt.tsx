"use client";

import { motion } from "motion/react";
import { szeneVon } from "@/lib/szenen";
import { Symbol } from "../symbol";
import { Avatar } from "./avatar";

/*
 * Fahrt mit der Stadtbahn: Die Bahn steht in der Mitte, Heilbronn zieht vorbei – Weinberge mit Wartbergturm,
 * Kilianskirche und Rathaus, der Neckar, Masten mit Oberleitung und die Gleise. Die Ebenen bewegen sich
 * verschieden schnell (Parallaxe); am Ende rollt die Bahn an der Haltestelle des Ziels aus.
 */

const DAUER = 4.8;
const WEG = { fern: 380, mitte: 1500, nah: 4200, gleis: 5200 };
const FAHRT = { duration: DAUER, ease: [0.45, 0, 0.3, 1] as const };

function Haeuserzeile({ x }: { x: number }) {
  const haeuser = [
    { b: 120, h: 150, f: "#e9c9a3", d: "#b2523b" }, { b: 90, h: 120, f: "#f1e0b6", d: "#8f4a3a" }, { b: 140, h: 175, f: "#d7b38c", d: "#7b4a3a" },
    { b: 100, h: 135, f: "#efd2c4", d: "#9c5a44" }, { b: 130, h: 160, f: "#e3d6bd", d: "#6e5a4a" }, { b: 110, h: 140, f: "#f3dca6", d: "#a35a40" },
  ];
  let px = x;
  return (
    <g>
      {haeuser.map((hs, i) => {
        const hx = px;
        px += hs.b + 18;
        return (
          <g key={i}>
            <rect x={hx} y={640 - hs.h} width={hs.b} height={hs.h} fill={hs.f} />
            <path d={`M${hx - 8} ${640 - hs.h}L${hx + hs.b / 2} ${590 - hs.h}L${hx + hs.b + 8} ${640 - hs.h}Z`} fill={hs.d} />
            {Array.from({ length: Math.floor(hs.h / 45) }, (_, r) =>
              Array.from({ length: Math.floor(hs.b / 38) }, (_, c) => <rect key={`${r}-${c}`} x={hx + 14 + c * 36} y={640 - hs.h + 18 + r * 42} width="18" height="24" rx="3" fill="#9fc9d6" />),
            )}
          </g>
        );
      })}
    </g>
  );
}

function Kilianskirche({ x }: { x: number }) {
  const stufen = [70, 60, 50, 40, 30, 18];
  let y = 640;
  return (
    <g>
      <path d={`M${x - 120} 640V540L${x - 70} 490H${x + 40}L${x + 90} 540V640Z`} fill="#c9a07c" />
      <path d={`M${x - 128} 540L${x - 70} 482H${x + 40}L${x + 98} 540Z`} fill="#55626e" />
      {stufen.map((b, i) => {
        const h = i === 0 ? 120 : 48 - i * 3;
        y -= h;
        return <rect key={i} x={x - b / 2} y={y} width={b} height={h} fill={i % 2 ? "#d6ad87" : "#c99d78"} />;
      })}
      <circle cx={x} cy={y - 14} r="6" fill="#d9a441" />
    </g>
  );
}

function Rathaus({ x }: { x: number }) {
  return (
    <g>
      <rect x={x - 130} y="510" width="260" height="130" fill="#f0d9a2" />
      <path d={`M${x - 140} 510L${x} 440L${x + 140} 510Z`} fill="#9c5a44" />
      <rect x={x - 40} y="420" width="80" height="90" fill="#f0d9a2" />
      <path d={`M${x - 48} 420L${x} 384L${x + 48} 420Z`} fill="#9c5a44" />
      <circle cx={x} cy="456" r="22" fill="#fffaf0" stroke="#3d4b5a" strokeWidth="4" />
      <path d={`M${x} 456v-14m0 14 10 6`} stroke="#3d4b5a" strokeWidth="3" />
      <circle cx={x} cy="492" r="12" fill="#2f5b9a" stroke="#d9a441" strokeWidth="3" />
      {[-100, -60, 60, 100].map((d) => <rect key={d} x={x + d - 12} y="540" width="24" height="34" rx="4" fill="#cfe5ea" />)}
      {[-90, -45, 0, 45, 90].map((d) => <path key={d} d={`M${x + d - 16} 640v-30q16-20 32 0v30Z`} fill="#7c5a48" />)}
    </g>
  );
}

function Mast({ x }: { x: number }) {
  return (
    <g>
      <rect x={x - 6} y="250" width="12" height="520" fill="#59656b" />
      <rect x={x - 6} y="262" width="150" height="8" fill="#59656b" />
      <path d={`M${x + 6} 300L${x + 120} 270`} stroke="#59656b" strokeWidth="5" />
    </g>
  );
}

function Strassenbahn() {
  const teil = (x: number, b: number, vorne: boolean) => (
    <g>
      <path d={vorne ? `M${x} 580H${x + b - 60}Q${x + b} 584 ${x + b} 660V760H${x}Z` : `M${x} 580H${x + b}V760H${x}Z`} fill="#f4c430" stroke="#4a3d17" strokeWidth="4" />
      <rect x={x} y="566" width={b - (vorne ? 40 : 0)} height="18" rx="6" fill="#c9cfd3" stroke="#4a3d17" strokeWidth="3" />
      <rect x={x} y="712" width={b} height="22" fill="#d64a3a" />
      <rect x={x} y="734" width={b} height="26" fill="#3b3f45" />
      {Array.from({ length: Math.floor((b - (vorne ? 70 : 20)) / 74) }, (_, i) => (
        <rect key={i} x={x + 18 + i * 74} y="604" width="58" height="72" rx="10" fill="#bfe2ec" stroke="#4a3d17" strokeWidth="3" />
      ))}
      {vorne && <path d={`M${x + b - 52} 604H${x + b - 18}Q${x + b - 6} 640 ${x + b - 8} 680H${x + b - 52}Z`} fill="#bfe2ec" stroke="#4a3d17" strokeWidth="3" />}
      {vorne && <circle cx={x + b - 14} cy="716" r="9" fill="#fff4b0" stroke="#4a3d17" strokeWidth="2" />}
    </g>
  );
  return (
    <g>
      <ellipse cx="800" cy="796" rx="560" ry="14" fill="#1c1934" opacity="0.25" />
      {/* Stromabnehmer an der Oberleitung */}
      <path d="M760 566L800 512L840 566M786 530h28" stroke="#3b3f45" strokeWidth="6" fill="none" strokeLinejoin="round" />
      <rect x="770" y="506" width="60" height="8" rx="3" fill="#3b3f45" />
      {teil(260, 360, false)}
      <rect x="620" y="590" width="26" height="160" fill="#3b3f45" />
      {teil(646, 340, false)}
      <rect x="986" y="590" width="26" height="160" fill="#3b3f45" />
      {teil(1012, 330, true)}
      {/* Fahrgäste: die eigene Figur sitzt am mittleren Fenster */}
      <Avatar mini x={672} y={602} width={44} height={80} label="Du in der Stadtbahn" />
      {[300, 380, 1040, 1120].map((x, i) => (
        <g key={x} opacity="0.55">
          <circle cx={x + 26} cy="632" r="13" fill={["#5a4a3a", "#2a2a33", "#8a6a4a", "#3a2a22"][i]} />
          <rect x={x + 12} y="646" width="28" height="30" rx="10" fill={["#3c6fd6", "#e8513a", "#3fa66b", "#8b6fd6"][i]} />
        </g>
      ))}
      {[[440, 0], [820, 0], [1170, 0]].map(([x]) => (
        <g key={x}>
          <rect x={x} y="690" width="54" height="66" rx="4" fill="#e1a91f" stroke="#4a3d17" strokeWidth="3" />
          <path d={`M${x! + 27} 692v62`} stroke="#4a3d17" strokeWidth="2" />
        </g>
      ))}
      <rect x="1150" y="586" width="150" height="16" rx="3" fill="#1c1c1c" />
      <text x="1225" y="599" textAnchor="middle" fontSize="12" fontWeight="800" fill="#ffb33a" fontFamily="monospace">S4  HEILBRONN</text>
      {[330, 560, 700, 930, 1080, 1290].map((x) => (
        <g key={x}>
          <circle cx={x} cy="770" r="22" fill="#2b2e33" />
          <circle cx={x} cy="770" r="9" fill="#9aa2a8" />
        </g>
      ))}
    </g>
  );
}

export function BahnFahrt({ von, nach }: { von: string; nach: string }) {
  const start = szeneVon(von).station.name;
  const ziel = szeneVon(nach).station.name;
  return (
    <motion.div className="bahn-fahrt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="bahn-himmel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7fb8e6" />
            <stop offset="0.6" stopColor="#cfe6f3" />
            <stop offset="1" stopColor="#fbe9c8" />
          </linearGradient>
          <pattern id="bahn-schwellen" width="60" height="40" patternUnits="userSpaceOnUse">
            <rect width="60" height="40" fill="#8d8172" />
            <rect x="8" y="6" width="22" height="28" rx="3" fill="#6b5a46" />
          </pattern>
        </defs>
        <rect width="1600" height="900" fill="url(#bahn-himmel)" />
        <motion.g initial={{ x: 0 }} animate={{ x: -WEG.fern }} transition={FAHRT}>
          {[0, 1].map((i) => (
            <g key={i} transform={`translate(${i * 1600} 0)`}>
              <ellipse cx="300" cy="200" rx="120" ry="34" fill="#ffffff" opacity="0.7" />
              <ellipse cx="1150" cy="150" rx="160" ry="40" fill="#ffffff" opacity="0.6" />
              <path d="M0 560Q300 360 620 470T1200 420T1600 520V660H0Z" fill="#9cbf7a" />
              {Array.from({ length: 9 }, (_, r) => <path key={r} d={`M${700 + r * 40} ${470 - r * 4}q120 -10 260 0`} stroke="#6f9a55" strokeWidth="7" strokeDasharray="10 7" fill="none" />)}
              <rect x="980" y="380" width="26" height="52" fill="#c9a07c" />
              <path d="M975 380h36v-10h-36Z" fill="#a8835f" />
            </g>
          ))}
        </motion.g>
        <motion.g initial={{ x: 0 }} animate={{ x: -WEG.mitte }} transition={FAHRT}>
          <Haeuserzeile x={-40} />
          <Kilianskirche x={900} />
          <Haeuserzeile x={1060} />
          <Rathaus x={1950} />
          <Haeuserzeile x={2140} />
          <rect x="-100" y="638" width="3400" height="30" fill="#b6d48a" />
          <path d="M2550 668h500v30h-500Z" fill="#7fc3d6" />
        </motion.g>
        <motion.g initial={{ x: 0 }} animate={{ x: -WEG.nah }} transition={FAHRT}>
          <path d="M-100 300H6200" stroke="#3b3f45" strokeWidth="3" />
          {Array.from({ length: 16 }, (_, i) => <Mast key={i} x={120 + i * 380} />)}
          {Array.from({ length: 14 }, (_, i) => (
            <g key={`b${i}`} transform={`translate(${260 + i * 430} 740)`}>
              <circle r="46" cy="-30" fill="#7cab56" />
              <circle r="34" cx="-36" cy="-12" fill="#6b9a4a" />
              <circle r="30" cx="40" cy="-10" fill="#86b863" />
            </g>
          ))}
          {/* Abfahrt und Ankunft: Haltestellen mit grünem H */}
          {[{ x: 120, name: start }, { x: WEG.nah + 1180, name: ziel }].map((h) => (
            <g key={h.name + h.x} transform={`translate(${h.x} 0)`}>
              <rect x="-260" y="790" width="560" height="40" fill="#cfc8b6" />
              <rect x="-6" y="560" width="12" height="230" fill="#59656b" />
              <circle cy="540" r="34" fill="#f6d34a" stroke="#3d7a3a" strokeWidth="5" />
              <text y="556" textAnchor="middle" fontSize="44" fontWeight="900" fill="#2f7a3a">H</text>
              <rect x="-150" y="600" width="300" height="56" rx="10" fill="#1d5a3a" />
              <text y="638" textAnchor="middle" fontSize="28" fontWeight="800" fill="#fffaf0">{h.name}</text>
            </g>
          ))}
        </motion.g>
        <rect x="0" y="790" width="1600" height="110" fill="#a69a86" />
        <motion.rect x="0" y="808" width="8000" height="40" fill="url(#bahn-schwellen)" initial={{ x: 0 }} animate={{ x: -WEG.gleis }} transition={FAHRT} />
        <rect x="0" y="806" width="1600" height="7" fill="#c7ccd0" />
        <rect x="0" y="838" width="1600" height="7" fill="#c7ccd0" />
        <motion.g animate={{ y: [0, -2, 0, -1.5, 0, -2, 0] }} transition={{ duration: DAUER - 0.6, ease: "linear" }}>
          <Strassenbahn />
        </motion.g>
      </svg>
      <p className="bahn-ansage" role="status">
        <Symbol name="train" /> Nächster Halt: <strong>{ziel}</strong>
      </p>
    </motion.div>
  );
}
