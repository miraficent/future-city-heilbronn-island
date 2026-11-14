"use client";

import { useCallback, useEffect, useState } from "react";

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
      const stimme = window.speechSynthesis.getVoices().find((v) => v.localService && v.lang.startsWith("de"));
      if (!stimme) return;
      window.speechSynthesis.cancel();
      const satz = new SpeechSynthesisUtterance(text);
      satz.voice = stimme;
      satz.lang = "de-DE";
      satz.rate = 0.92;
      satz.onend = () => setLiest(false);
      satz.onerror = () => setLiest(false);
      setLiest(true);
      window.speechSynthesis.speak(satz);
    },
    [],
  );

  return { kann, liest, sprich, stopp };
}
