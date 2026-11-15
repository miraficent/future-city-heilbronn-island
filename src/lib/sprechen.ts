/** Kindertexte vorlesen – Web Speech API, lokale deutsche Stimme, nichts wird übertragen. */
export function vorlesen(text: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const satz = new SpeechSynthesisUtterance(text);
  satz.lang = "de-DE";
  satz.rate = 0.9;
  window.speechSynthesis.speak(satz);
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
