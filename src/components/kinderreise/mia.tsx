"use client";

/**
 * Mia – die Helferin der Kinderreise. Feste Sätze (kein Chat, keine KI),
 * jeder Satz kann vorgelesen werden. Antworten sind große Bild-Knöpfe (children).
 */
import type { ReactNode } from "react";
import { Symbol } from "@/components/symbol";

export function vorlesen(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const satz = new SpeechSynthesisUtterance(text);
  satz.lang = "de-DE";
  satz.rate = 0.9;
  window.speechSynthesis.speak(satz);
}

/** Gezeichnete Mia: Dutt, Brille im Haar, blaue Weste, Rucksack, zeigt mit der Hand */
export function MiaFigur({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 220" className={`kr-mia-figur ${className}`} aria-hidden="true">
      {/* Rucksack hinter dem Körper */}
      <rect x={28} y={98} width={84} height={78} rx={18} fill="#C99A5B" />
      {/* Körper: Shirt + Weste */}
      <path d="M38 118 Q70 96 102 118 L108 220 H32 Z" fill="#FFF7E8" />
      <path d="M38 118 Q50 108 60 106 L58 220 H32 Z M102 118 Q90 108 80 106 L82 220 H108 Z" fill="#3D7BE8" />
      <path d="M44 118 L50 220 M96 118 L90 220" stroke="#8a5a36" strokeWidth={6} />
      {/* Zeigender Arm */}
      <path d="M100 132 Q124 150 132 168" stroke="#FFF7E8" strokeWidth={16} strokeLinecap="round" fill="none" />
      <circle cx={133} cy={170} r={9} fill="#f5c9a0" />
      {/* Hals + Kopf */}
      <rect x={62} y={88} width={16} height={18} rx={6} fill="#f5c9a0" />
      <circle cx={70} cy={66} r={34} fill="#f5c9a0" />
      {/* Haare + Dutt */}
      <path d="M36 66 Q34 28 70 26 Q106 28 104 66 Q100 44 86 40 Q70 52 44 50 Q38 56 36 66 Z" fill="#6b3e26" />
      <circle cx={70} cy={20} r={14} fill="#6b3e26" />
      <path d="M36 62 Q30 90 40 104" stroke="#6b3e26" strokeWidth={8} strokeLinecap="round" fill="none" />
      {/* Brille im Haar */}
      <g fill="#A8DCF5" stroke="#1F2937" strokeWidth={2.5}>
        <rect x={46} y={34} width={18} height={11} rx={5} />
        <rect x={76} y={34} width={18} height={11} rx={5} />
      </g>
      {/* Gesicht */}
      <circle cx={58} cy={70} r={4.5} fill="#1F2937" />
      <circle cx={82} cy={70} r={4.5} fill="#1F2937" />
      <circle cx={59.5} cy={68.5} r={1.5} fill="#fff" />
      <circle cx={83.5} cy={68.5} r={1.5} fill="#fff" />
      <path d="M58 82 Q70 92 82 82" stroke="#1F2937" strokeWidth={3} fill="#fff" strokeLinecap="round" />
      <circle cx={48} cy={80} r={5} fill="#E07A4F" opacity={0.4} />
      <circle cx={92} cy={80} r={5} fill="#E07A4F" opacity={0.4} />
    </svg>
  );
}

export function Mia({ text, children, className = "" }: { text: string; children?: ReactNode; className?: string }) {
  return (
    <section className={`kr-mia ${className}`} aria-live="polite">
      <MiaFigur />
      <div className="kr-blase">
        <span className="kr-blase-name">Mia</span>
        <p className="kr-blase-text">
          {text}
          <button type="button" className="kr-vorlesen" aria-label="Vorlesen" onClick={() => vorlesen(text)}><Symbol name="volume" /></button>
        </p>
        {children && <div className="kr-antworten">{children}</div>}
      </div>
    </section>
  );
}
