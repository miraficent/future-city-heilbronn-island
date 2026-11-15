"use client";

/**
 * „Die Einrichtungen“ im Eltern-Bereich: echtes Bild je Ort, Adresse und offizielle Seiten.
 * Fotos: Wikimedia Commons (CC BY-SA 4.0) aus src/lib/fotos.ts – Urheber und Lizenz stehen am Bild.
 * Haus der Familie: noch kein frei lizenziertes Foto, darum die gekennzeichnete Zeichnung nach dem echten Gebäude.
 * Alle Bilder liegen lokal unter public/medien/ – nichts wird von fremden Servern geladen.
 * Bewegung: Karten gleiten beim Scrollen herein und heben sich beim Darüberfahren (aus bei prefers-reduced-motion).
 */
import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { META } from "@/lib/daten";
import { FOTOS } from "@/lib/fotos";
import { kurzname } from "../einrichtung-badge";
import { Symbol } from "../symbol";
import { useTexte } from "./sprache";

/** Die Angebotsseiten, die die aim-Challenge als Quellen nennt. */
const QUELLEN_LINKS: Record<string, Array<{ text: string; url: string }>> = {
  aim: [
    { text: "Lernen in Ferien & Freizeit", url: "https://www.aim-akademie.org/kurse?kathaupt=18&suchesetzen=false&kfs_sonderrubrik=1264" },
    { text: "Digitale Bildung", url: "https://www.aim-akademie.org/kurse?kathaupt=18&suchesetzen=false&kfs_sonderrubrik=1277" },
    { text: "Juniorakademie", url: "https://www.aim-akademie.org/kurse/suche?clearallkatfilter=true&suchesetzen=true&kfs_stichwort_schlagwort=juniorakademie&kfs_sonderrubrik=-1&kfs_ort_select=-1&kfs_kennz=&kfs_veranartselect=-1&kfs_aussenst_select=-1&kfs_kursbereich=-1&kfs_beginn_dat1=&kfs_beginn_dat2=" },
    { text: "Coding", url: "https://www.aim-akademie.org/kurse?kathaupt=18&suchesetzen=false&kfs_kursbereich=1278&kfs_sonderrubrik=1277" },
  ],
  experimenta: [{ text: "Lernen", url: "https://www.experimenta.science/lernen/" }],
  hdf: [
    { text: "Kinder & Jugendliche", url: "https://hdf-hn.de/kinder-jugendliche/" },
    { text: "Digitale Familienwerkstatt", url: "https://hdf-hn.de/angebote/digitale-familienwerkstatt/" },
  ],
  ipai: [{ text: "Veranstaltungen", url: "https://ipai-foundation.ai/#events" }],
};

/** Zeichnung für Orte ohne frei lizenziertes Foto */
const ZEICHNUNGEN: Record<string, { datei: string; alt: string }> = {
  hdf: { datei: "/medien/orte/hdf-zeichnung.jpg", alt: "Zeichnung: Haus der Familie mit Holzfassade, großen Fenstern und Blumen davor" },
};

export function Einrichtungen() {
  const t = useTexte().infos;
  const ruhig = useReducedMotion();

  return (
    <section aria-labelledby="orte-titel" className="el-infoteil">
      <h2 id="orte-titel" className="el-titel">{t.orteTitel}</h2>
      <p className="el-infoteil__unter">{t.orteUnter}</p>
      <div className="el-orte">
        {META.quellen.map((q, i) => {
          const foto = FOTOS[q.id];
          const zeichnung = ZEICHNUNGEN[q.id];
          const bild = foto ? { datei: foto.datei, alt: foto.alt } : zeichnung;
          return (
            <motion.article
              key={q.id}
              className="el-ort"
              style={{ ["--farbe" as string]: q.farbe } as CSSProperties}
              initial={ruhig ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: "easeOut" }}
              whileHover={ruhig ? undefined : { y: -8 }}
            >
              {bild && (
                <figure className="el-ort__bild">
                  {/* Lokale Datei, kein fremder Server – next/image wäre im statischen Export ohne Optimierung. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bild.datei} alt={bild.alt} loading="lazy" decoding="async" />
                  <figcaption>
                    {foto ? (
                      <>
                        {t.foto(foto.autor)} ·{" "}
                        <a href={foto.lizenzUrl} target="_blank" rel="noopener noreferrer">{foto.lizenz}</a> ·{" "}
                        <a href={foto.quelle} target="_blank" rel="noopener noreferrer">Wikimedia Commons</a>
                      </>
                    ) : (
                      t.zeichnung
                    )}
                  </figcaption>
                </figure>
              )}
              <div className="el-ort__text">
                <h3>{kurzname(q, q.id)}</h3>
                <p lang="de">{q.name}</p>
                {q.adresse && <p className="el-ort__adresse"><Symbol name="pin" />{q.adresse}</p>}
                <ul>
                  {(QUELLEN_LINKS[q.id] ?? [{ text: t.website, url: q.website }]).map((l) => (
                    <li key={l.url}>
                      <a href={l.url} target="_blank" rel="noopener noreferrer"><Symbol name="external" />{t.links[l.text] ?? l.text}<Symbol name="arrow" /></a>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
