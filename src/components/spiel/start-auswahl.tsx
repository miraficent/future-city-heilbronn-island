"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { AvatarKonfiguration } from "@/lib/avatar";
import { Symbol } from "../symbol";
import { AvatarBaukasten } from "./avatar-baukasten";

const ALTER = [6, 7, 8, 9, 10, 11];

export type StartSchritt = "alter" | "figur";

/** Start in zwei Schritten: erst das Alter (bestimmt Aufgaben und Kurse), dann die eigene Figur. Kein Name, kein Konto. */
export function StartAuswahl({ schritt, setSchritt, avatar, setAvatar, alter, waehleAlter, los }: {
  schritt: StartSchritt;
  setSchritt: (s: StartSchritt) => void;
  avatar: AvatarKonfiguration;
  setAvatar: (a: AvatarKonfiguration) => void;
  alter: number;
  waehleAlter: (alter: number) => void;
  los: () => void;
}) {
  return (
    <motion.div className="start-auswahl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }}>
      {schritt === "alter" ? (
        <motion.div key="alter" className="start-karte" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 220, damping: 24 }}>
          <p className="start-schritt">Schritt 1 von 2</p>
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
          <p className="start-gemeinsam"><Symbol name="user" /> Am besten spielst du zusammen mit deinen Eltern. Du brauchst keinen Namen und kein Konto.</p>
          <motion.button className="spiel-knopf spiel-knopf-dunkel los-knopf" onClick={() => setSchritt("figur")} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
            <Symbol name="arrow" />
            Weiter zu meiner Figur
          </motion.button>
          <p className="start-fuss">
            12 Jahre oder älter? <Link href="/teen/">Zum Teen-Bereich</Link>
          </p>
        </motion.div>
      ) : (
        <motion.div key="figur" className="start-karte start-karte-breit" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 220, damping: 24 }}>
          <p className="start-schritt">Schritt 2 von 2</p>
          <AvatarBaukasten wert={avatar} aendern={setAvatar} fertig={los} zurueck={() => setSchritt("alter")} />
        </motion.div>
      )}
    </motion.div>
  );
}
