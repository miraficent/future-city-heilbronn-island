import { LOCALE } from "./eltern-suche";
import { besteStimme, KLANG, type Sprecher } from "./stimme";
import type { Sprache } from "@/types";

/**
 * Kindertexte vorlesen – Web Speech API mit der besten lokal installierten Stimme der gewählten Sprache
 * (Deutsch: Auswahl in src/lib/stimme.ts). Gibt es keine lokale Stimme, bleibt es still:
 * Der Text wird nie an einen Online-Sprachdienst geschickt.
 */
export function vorlesen(text: string, sprache: Sprache = "de", sprecher: Sprecher = "eule"): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const sprechen = () => {
    const stimmen = window.speechSynthesis.getVoices();
    const stimme = sprache === "de"
      ? besteStimme(stimmen, sprecher)
      : stimmen.find((v) => v.localService && v.lang.toLowerCase().startsWith(sprache));
    if (!stimme) return;
    window.speechSynthesis.cancel();
    const satz = new SpeechSynthesisUtterance(text);
    satz.voice = stimme;
    satz.lang = LOCALE[sprache];
    satz.rate = KLANG[sprecher].rate;
    satz.pitch = KLANG[sprecher].pitch;
    window.speechSynthesis.speak(satz);
  };
  // Chrome lädt die Stimmenliste erst nach dem ersten Abruf – dann kurz darauf warten.
  if (window.speechSynthesis.getVoices().length > 0) {
    sprechen();
    return;
  }
  const einmal = () => {
    window.speechSynthesis.removeEventListener("voiceschanged", einmal);
    sprechen();
  };
  window.speechSynthesis.addEventListener("voiceschanged", einmal);
  setTimeout(einmal, 800);
}

/*
 * „Die Eule spricht von selbst“: einmal den Lautsprecher antippen, danach liest die Eule jeden neuen Satz
 * automatisch vor (Browser erlauben Sprache erst nach einer Berührung). Nur in der Browsersitzung gespeichert.
 */
const AUTO = "kinder.vorlesen";
const AUTO_EREIGNIS = "cosmos:kinder-vorlesen";

export function autoVorlesen(): boolean {
  try {
    return typeof window !== "undefined" && window.sessionStorage.getItem(AUTO) === "1";
  } catch {
    return false;
  }
}

export function setzeAutoVorlesen(an: boolean): void {
  try {
    if (an) window.sessionStorage.setItem(AUTO, "1");
    else window.sessionStorage.removeItem(AUTO);
  } catch {
    // ohne Speicher gilt es nur bis zum Neuladen nicht – kein Problem
  }
  window.dispatchEvent(new Event(AUTO_EREIGNIS));
}

export function abonniereAutoVorlesen(melden: () => void): () => void {
  window.addEventListener(AUTO_EREIGNIS, melden);
  return () => window.removeEventListener(AUTO_EREIGNIS, melden);
}
