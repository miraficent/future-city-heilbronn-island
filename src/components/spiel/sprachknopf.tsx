"use client";
import { useEffect, useRef, useState } from "react";
import aufnahmen from "@/lib/sprachaufnahmen.json";
import { useVorlesen } from "@/lib/vorlesen";

/**
 * Liest einen Text vor. Gibt es eine fest eingesprochene Datei (sprachaufnahmen.json), wird sie abgespielt,
 * sonst spricht die lokal installierte deutsche Stimme des Geräts – der Text verlässt das Gerät nicht.
 */
export function Sprachknopf({ id, text, stumm = false }: { id: string; text: string; stumm?: boolean }) {
  const [spielt, setSpielt] = useState(false);
  const [fehler, setFehler] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const vorlesen = useVorlesen();
  const { stopp: sprachStopp } = vorlesen;
  const datei = (aufnahmen as Record<string, string>)[id];
  const aktiv = spielt || vorlesen.liest;
  const moeglich = Boolean(datei) || vorlesen.kann;

  useEffect(() => () => { audio.current?.pause(); audio.current = null; }, [id]);
  useEffect(() => {
    if (!stumm) return;
    audio.current?.pause();
    sprachStopp();
  }, [stumm, sprachStopp]);
  useEffect(() => {
    const stopp = () => { audio.current?.pause(); setSpielt(false); sprachStopp(); };
    document.addEventListener("cosmos:audio-stopp", stopp);
    return () => document.removeEventListener("cosmos:audio-stopp", stopp);
  }, [sprachStopp]);

  async function spielen() {
    if (stumm || !moeglich) return;
    if (aktiv) {
      audio.current?.pause();
      setSpielt(false);
      vorlesen.stopp();
      return;
    }
    document.dispatchEvent(new Event("cosmos:audio-stopp"));
    if (!datei) {
      vorlesen.sprich(text);
      return;
    }
    const a = new Audio(datei);
    audio.current = a;
    a.onended = () => setSpielt(false);
    a.onerror = () => { setFehler(true); setSpielt(false); };
    try {
      await a.play();
      setSpielt(true);
    } catch {
      setFehler(true);
    }
  }

  return (
    <>
      <button
        type="button"
        className="welt-knopf hell sprachknopf"
        disabled={!moeglich || stumm}
        onClick={spielen}
        title={!moeglich ? "Auf diesem Gerät ist keine deutsche Stimme installiert. Die Bilder erklären alles auch ohne Ton." : undefined}
        aria-label={aktiv ? "Vorlesen stoppen" : "Erklärung anhören"}
        aria-pressed={aktiv}
      >
        {aktiv ? "Stopp" : "Anhören"}
        <span aria-hidden="true"> ♪</span>
      </button>
      {fehler && <p role="status">Der Ton ist gerade nicht verfügbar. Folge den Bildern.</p>}
    </>
  );
}
