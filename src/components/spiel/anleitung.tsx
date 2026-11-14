"use client";

import { motion } from "motion/react";
import { useVorlesen } from "@/lib/vorlesen";
import { Symbol } from "../symbol";
import { PixelBild } from "./pixel-grafik";

const SCHRITTE = [
  { bild: <Symbol name="story" className="anleitung-symbol" />, text: "Lauf herum und sprich mit den Leuten" },
  { bild: <PixelBild motiv="code-labor" />, text: "Geh durch den Eingang und löse Aufgaben" },
  { bild: <Symbol name="train" className="anleitung-symbol" />, text: "Fahr mit der Stadtbahn zum nächsten Ort" },
  { bild: <Symbol name="rocket" className="anleitung-symbol" />, text: "Vier Raketenteile – dann startet die Rakete!" },
];

const VORLESETEXT =
  "So geht's: Lauf herum und sprich mit den Leuten. Geh durch den Eingang und löse Aufgaben. Fahr mit der Stadtbahn zum nächsten Ort. Mit vier Raketenteilen startet die Rakete!";

/** Kurze Bild-Anleitung: vier Schritte, wenig Text. */
export function Anleitung({ weiter }: { weiter: () => void }) {
  const vorlesen = useVorlesen();
  return (
    <motion.div className="start-auswahl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="start-karte anleitung" initial={{ y: 30, scale: 0.95 }} animate={{ y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 240, damping: 22 }}>
        <h2 className="start-titel">
          <Symbol name="rocket" />
          So geht&apos;s
          {vorlesen.kann && (
            <button className="rund-knopf rund-klein" onClick={() => vorlesen.sprich(VORLESETEXT)} aria-label="Vorlesen">
              <Symbol name="volume" />
            </button>
          )}
        </h2>
        <ol className="anleitung-schritte">
          {SCHRITTE.map((s, i) => (
            <motion.li key={s.text} initial={{ opacity: 0, y: 20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.25 + i * 0.35, type: "spring", stiffness: 260, damping: 18 }}>
              <span className="anleitung-nummer">{i + 1}</span>
              <span className="anleitung-bild">{s.bild}</span>
              <span className="anleitung-text">{s.text}</span>
            </motion.li>
          ))}
        </ol>
        <motion.p className="anleitung-danach" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>
          <Symbol name="ticket" /> Danach: echte Kurse in Heilbronn entdecken
        </motion.p>
        <motion.button className="spiel-knopf spiel-knopf-dunkel los-knopf" onClick={weiter} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 }} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}>
          <Symbol name="play" />
          Los!
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
