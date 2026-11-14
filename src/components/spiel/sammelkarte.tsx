"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Angebot } from "@/lib/angebot";
import type { Meta } from "@/lib/daten";
import { formatTag, naechsterTermin, relativ } from "@/lib/format";
import { slugAusId } from "@/lib/routen";
import { Symbol } from "../symbol";
import { PixelBild } from "./pixel-grafik";

function altersChip(a: Angebot): string {
  if (a.alterMin !== undefined && a.alterMax !== undefined) return `${a.alterMin}–${a.alterMax}`;
  if (a.alterMin !== undefined) return `ab ${a.alterMin}`;
  return "alle";
}

function hausBild(a: Angebot) {
  return a.themen.includes("gaming") ? "spielewerkstatt" : a.themen.includes("ki") ? "ki-atelier" : "code-labor";
}

/**
 * Ein echter Kurs als Sammelkarte: Bild, Titel und vier Symbole statt Fließtext
 * (Alter, Tag, Ort, Preis). Für Erwachsene steht unten der Veranstalter.
 */
export function Sammelkarte({ angebot: a, meta, gesammelt, sammeln, jetzt, index = 0 }: {
  angebot: Angebot;
  meta: Meta;
  gesammelt: boolean;
  sammeln: (id: string) => void;
  jetzt: string;
  index?: number;
}) {
  const termin = naechsterTermin(a, new Date(jetzt));
  const quelle = meta.quellen.find((q) => q.id === a.quelle);
  const kostenlos = a.kosten.euro === 0;
  return (
    <motion.article
      className="sammelkarte"
      initial={{ opacity: 0, y: 18, rotate: index % 2 ? 1.5 : -1.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 260, damping: 22 }}
      style={{ ["--karten-farbe" as string]: quelle?.farbe ?? "#2f4bff" }}
    >
      <div className="sammelkarte-bild">
        <PixelBild motiv={hausBild(a)} />
        <span className="sammelkarte-alter" title="Alter">
          <Symbol name="cake" />
          {altersChip(a)}
        </span>
      </div>
      <h3>{a.titel}</h3>
      <ul className="sammelkarte-fakten">
        <li title="Wann">
          <Symbol name="calendar" />
          {termin ? `${formatTag(termin.start)} · ${relativ(termin.start, new Date(jetzt))}` : "Termin fragen"}
        </li>
        <li title="Wo">
          <Symbol name="pin" />
          {a.ort.online ? "Online" : a.ort.name}
        </li>
        <li title="Preis" className={kostenlos ? "ist-kostenlos" : ""}>
          <Symbol name="euro" />
          {kostenlos ? "kostenlos" : a.kosten.text}
        </li>
        {a.status === "ausgebucht" && (
          <li className="ist-voll">
            <Symbol name="info" />
            schon voll
          </li>
        )}
      </ul>
      <p className="sammelkarte-anbieter">{quelle?.name.split(/[–-]/)[0]?.trim() ?? a.quelle}</p>
      <div className="sammelkarte-knoepfe">
        <button className="spiel-knopf sammel-knopf" aria-pressed={gesammelt} onClick={() => sammeln(a.id)} aria-label={gesammelt ? `${a.titel} aus dem Rucksack nehmen` : `${a.titel} in den Rucksack`}>
          <Symbol name={gesammelt ? "check" : "backpack"} />
          {gesammelt ? "Im Rucksack" : "Einpacken"}
        </button>
        <Link className="spiel-knopf" href={`/angebot/${slugAusId(a.id)}/?modus=kind`} aria-label={`${a.titel} ansehen`}>
          <Symbol name="arrow" />
        </Link>
      </div>
    </motion.article>
  );
}
