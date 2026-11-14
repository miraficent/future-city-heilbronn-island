"use client";

import { useCallback, useEffect, useState } from "react";

/** Freundliche, gut verständliche lokale Stimmen zuerst (Windows: Katja/Hedda/Stefan, macOS: Anna/Markus). */
const BEVORZUGT = [/katja/i, /hedda/i, /anna/i, /petra/i, /helena/i, /marlene/i];
const MAENNLICH = [/stefan/i, /markus/i, /yannick/i, /conrad/i, /klaus/i, /viktor/i];
const WEIBLICH = [/katja/i, /anna/i, /petra/i, /helena/i, /marlene/i, /hedda/i];

/** Wer spricht? Danach richten sich Stimme, Tonhöhe und Tempo. */
export type Sprecher = "erzaehler" | "maedchen" | "junge" | "roboter";

function lokaleStimmen(stimmen: SpeechSynthesisVoice[]) {
  return stimmen.filter((v) => v.localService && v.lang.toLowerCase().startsWith("de"));
}

export function besteStimme(stimmen: SpeechSynthesisVoice[], sprecher: Sprecher = "erzaehler"): SpeechSynthesisVoice | undefined {
  const lokal = lokaleStimmen(stimmen);
  const liste = sprecher === "junge" || sprecher === "roboter" ? [...MAENNLICH, ...BEVORZUGT] : sprecher === "maedchen" ? WEIBLICH : [/hedda/i, ...BEVORZUGT];
  for (const muster of liste) {
    const treffer = lokal.find((v) => muster.test(v.name));
    if (treffer) return treffer;
  }
  return lokal.find((v) => v.lang.toLowerCase() === "de-de") ?? lokal[0];
}

const KLANG: Record<Sprecher, { pitch: number; rate: number }> = {
  erzaehler: { pitch: 1.05, rate: 0.95 },
  maedchen: { pitch: 1.3, rate: 1 },
  junge: { pitch: 1.25, rate: 1 },
  roboter: { pitch: 1.7, rate: 0.92 },
};

/**
 * Vorlesen mit der Sprachausgabe des Geräts. Es wird nur eine lokal installierte
 * deutsche Stimme genutzt – kein Text verlässt das Gerät.
 */
export function useVorlesen() {
  const [kann, setKann] = useState(false);
  const [liest, setLiest] = useState(false);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const pruefen = () => setKann(window.speechSynthesis.getVoices().some((v) => v.localService && v.lang.startsWith("de")));
    pruefen();
    window.speechSynthesis.addEventListener("voiceschanged", pruefen);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", pruefen);
      window.speechSynthesis.cancel();
    };
  }, []);

  const stopp = useCallback(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setLiest(false);
  }, []);

  const sprich = useCallback((text: string, sprecher: Sprecher = "erzaehler") => {
    if (!("speechSynthesis" in window)) return;
    const stimme = besteStimme(window.speechSynthesis.getVoices(), sprecher);
    if (!stimme) return;
    window.speechSynthesis.cancel();
    const satz = new SpeechSynthesisUtterance(text);
    satz.voice = stimme;
    satz.lang = "de-DE";
    satz.rate = KLANG[sprecher].rate;
    satz.pitch = KLANG[sprecher].pitch;
    satz.onend = () => setLiest(false);
    satz.onerror = () => setLiest(false);
    setLiest(true);
    window.speechSynthesis.speak(satz);
  }, []);

  return { kann, liest, sprich, stopp };
}
