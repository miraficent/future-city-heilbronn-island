/** Kindertexte vorlesen – Web Speech API, lokale deutsche Stimme, nichts wird übertragen. */
export function vorlesen(text: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const satz = new SpeechSynthesisUtterance(text);
  satz.lang = "de-DE";
  satz.rate = 0.9;
  window.speechSynthesis.speak(satz);
}
