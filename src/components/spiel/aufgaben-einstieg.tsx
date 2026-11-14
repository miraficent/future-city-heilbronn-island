"use client";
import type { Stufe } from "@/lib/abenteuer";
import { einfuehrung } from "@/lib/lernwelt";
import type { MissionArt } from "@/lib/spiel";
import { Avatar } from "./avatar";
import { ErklaerFilm } from "./erklaerfilm";
import { Sprachknopf } from "./sprachknopf";

/** Vor jeder Aufgabe: kurzer Satz, was zu tun ist, dann ein kleiner Erklärfilm. Erst danach geht es los. */
export function AufgabenEinstieg({ art, stufe, phase, starten, stumm }: { art: MissionArt; stufe: Stufe; phase: number; starten: () => void; stumm: boolean }) {
  const m = einfuehrung(art, stufe, phase);
  return (
    <section className="aufgaben-einstieg" aria-labelledby="einstieg-titel">
      <div className="einstieg-guide">
        <Avatar />
        <div>
          <p className="welt-augenbraue">ERST ANSCHAUEN, DANN AUSPROBIEREN</p>
          <h2 id="einstieg-titel">{m.titel}</h2>
          <p>{m.text}</p>
          <Sprachknopf id={m.audioId} text={`${m.titel}. ${m.text} ${m.schritte.map((s, i) => `${i + 1}: ${s}.`).join(" ")}`} />
        </div>
      </div>
      <ErklaerFilm einfuehrung={m} stumm={stumm} />
      <button className="welt-knopf aufgabe-starten" onClick={starten}>Jetzt probiere ich es!</button>
    </section>
  );
}
