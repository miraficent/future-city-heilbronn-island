"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { AvatarKonfiguration } from "@/lib/avatar";
import { aussehenVon, GASTGEBER, ORT_GESCHICHTE } from "@/lib/bewohner";
import type { Station } from "@/lib/spiel";
import { useVorlesen } from "@/lib/vorlesen";
import { Symbol } from "../symbol";
import { Avatar } from "./avatar";
import { Roboter } from "./pixel-grafik";

/**
 * Betreten eines Lernorts: gemalte Szene des echten Gebäudes, Gastgeber und eigene Figur davor.
 * Die Geschichte läuft Satz für Satz per Antippen weiter und wird bei Ton an vorgelesen.
 */
export function OrtSzene({ station, avatar, klein, stumm, fertig }: { station: Station; avatar: AvatarKonfiguration; klein: boolean; stumm: boolean; fertig: () => void }) {
  const gast = aussehenVon(GASTGEBER[station.id] ?? "");
  const zeilen = ORT_GESCHICHTE[station.id]?.[klein ? "klein" : "gross"] ?? [];
  const [zeile, setZeile] = useState(0);
  const { kann, sprich, stopp } = useVorlesen();
  const text = zeilen[zeile] ?? "";
  const letzte = zeile >= zeilen.length - 1;

  function weiter() {
    if (!letzte) return setZeile(zeile + 1);
    stopp();
    fertig();
  }

  useEffect(() => {
    if (text && !stumm && kann) sprich(text);
  }, [text, stumm, kann, sprich]);
  useEffect(() => () => stopp(), [stopp]);

  return (
    <section className="ort-szene" aria-labelledby="szene-sprecher">
      <div className="szene-buehne">
        <img className="szene-bild" src={`/medien/spiel/${station.id}-szene.webp`} width={1440} height={810} alt={`Gemalte Ansicht: ${station.name} in Heilbronn`} />
        <svg className="szene-figuren" viewBox="0 0 400 225" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
          <ellipse cx="92" cy="218" rx="34" ry="7" fill="#1c1934" opacity="0.22" />
          <ellipse cx="310" cy="218" rx="30" ry="6" fill="#1c1934" opacity="0.22" />
          <motion.g initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 160, damping: 18 }}>
            <g className="szene-sprechend">
              {gast.aussehen === "roboter" ? <Roboter x={52} y={122} breite={82} hoehe={96} /> : <Avatar wert={gast.aussehen} mini x={56} y={96} width={73} height={122} label={gast.name} />}
            </g>
          </motion.g>
          <motion.g initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 160, damping: 18, delay: 0.15 }}>
            <Avatar wert={avatar} mini x={278} y={104} width={66} height={112} label="Du" />
          </motion.g>
        </svg>
        <AnimatePresence mode="wait">
          <motion.div key={zeile} className="szene-blase" initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            <h3 id="szene-sprecher">{gast.name}</h3>
            <p aria-live="polite">{text}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="szene-knoepfe">
        <span className="szene-punkte" aria-label={`Satz ${zeile + 1} von ${zeilen.length}`}>
          {zeilen.map((_, i) => <i key={i} className={i <= zeile ? "ist-an" : ""} />)}
        </span>
        {kann && (
          <button type="button" className="rund-knopf" onClick={() => sprich(text)} aria-label="Nochmal vorlesen">
            <Symbol name="volume" />
          </button>
        )}
        <button type="button" className="spiel-knopf szene-ueberspringen" onClick={() => { stopp(); fertig(); }}>
          Überspringen
        </button>
        <button type="button" className="spiel-knopf spiel-knopf-dunkel szene-weiter" autoFocus onClick={weiter}>
          <Symbol name={letzte ? "play" : "arrow"} />
          {letzte ? "Los geht’s!" : "Weiter"}
        </button>
      </div>
    </section>
  );
}
