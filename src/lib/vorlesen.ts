"use client";

import { useCallback, useEffect, useState } from "react";

/** Freundliche, gut verständliche lokale Stimmen zuerst (Windows: Katja/Hedda, macOS: Anna). */
const BEVORZUGT = [/katja/i, /hedda/i, /anna/i, /petra/i, /helena/i, /marlene/i];

export function besteStimme(stimmen: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const lokal = stimmen.filter((v) => v.localService && v.lang.toLowerCase().startsWith("de"));
  for (const muster of BEVORZUGT) {
    const treffer = lokal.find((v) => muster.test(v.name));
    if (treffer) return treffer;
  }
  return lokal.find((v) => v.lang.toLowerCase() === "de-de") ?? lokal[0];
}

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

  const sprich = useCallback(
    (text: string) => {
      if (!("speechSynthesis" in window)) return;
      const stimme = besteStimme(window.speechSynthesis.getVoices());
      if (!stimme) return;
      window.speechSynthesis.cancel();
      const satz = new SpeechSynthesisUtterance(text);
      satz.voice = stimme;
      satz.lang = "de-DE";
      satz.rate = 1;
      satz.pitch = 1.1;
      satz.onend = () => setLiest(false);
      satz.onerror = () => setLiest(false);
      setLiest(true);
      window.speechSynthesis.speak(satz);
    },
    [],
  );

  return { kann, liest, sprich, stopp };
}
