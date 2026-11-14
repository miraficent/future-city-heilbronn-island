"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { FIGUREN, type Figur } from "@/lib/figuren";
import { Symbol } from "../symbol";
import { FigurPortrait } from "./figur";

const ALTER = [6, 7, 8, 9, 10, 11];

/** Startbildschirm: Figur wählen, Alter antippen, los. Kein Name, kein Konto. */
export function StartAuswahl({ figurId, alter, waehleFigur, waehleAlter, los }: {
  figurId: string;
  alter: number;
  waehleFigur: (id: string) => void;
  waehleAlter: (alter: number) => void;
  los: () => void;
}) {
  return (
    <motion.div className="start-auswahl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }}>
      <motion.div className="start-karte" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 220, damping: 24 }}>
        <h2 className="start-titel">
          <Symbol name="user" />
          Wer spielt?
        </h2>
        <div className="figuren-wahl" role="radiogroup" aria-label="Spielfigur wählen">
          {FIGUREN.map((f: Figur, i) => (
            <motion.button
              key={f.id}
              role="radio"
              aria-checked={figurId === f.id}
              className="figur-knopf"
              onClick={() => waehleFigur(f.id)}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.08 + i * 0.05 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.94 }}
            >
              <FigurPortrait figur={f} className="figur-bild" />
              <span>{f.name}</span>
            </motion.button>
          ))}
        </div>

        <h2 className="start-titel">
          <Symbol name="cake" />
          Wie alt bist du?
        </h2>
        <div className="alter-wahl" role="radiogroup" aria-label="Alter wählen">
          {[{ name: "Entdecken", alter: ALTER.slice(0, 3) }, { name: "Tüfteln", alter: ALTER.slice(3) }].map((gruppe) => (
            <div key={gruppe.name} className={`alter-gruppe ${gruppe.alter.includes(alter) ? "ist-aktiv" : ""}`}>
              <div className="alter-knoepfe">
                {gruppe.alter.map((a) => (
                  <motion.button key={a} role="radio" aria-checked={alter === a} className="alter-knopf" onClick={() => waehleAlter(a)} whileTap={{ scale: 0.9 }}>
                    {a}
                  </motion.button>
                ))}
              </div>
              <span className="alter-gruppe-name">{gruppe.name}</span>
            </div>
          ))}
        </div>
        <p className="alter-stufe">{alter <= 8 ? "Leichte Aufgaben mit Bildern" : "Kniffligere Aufgaben"} · passende Kurse für {alter} Jahre</p>

        <motion.button className="spiel-knopf spiel-knopf-dunkel los-knopf" onClick={los} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
          <Symbol name="play" />
          Los geht&apos;s!
        </motion.button>
        <p className="start-fuss">
          12 Jahre oder älter? <Link href="/teen/">Zum Teen-Bereich</Link>
        </p>
      </motion.div>
    </motion.div>
  );
}
