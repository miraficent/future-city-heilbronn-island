"use client";

/**
 * „Was fehlt Ihnen für Ihr Kind?“ – anonyme Anfrage in drei Schritten: Thema, Alter, optional ein Stichwort.
 * Gesendet werden nur Zähler (src/lib/signale-client.ts, Regeln in signal-regeln.mjs): kein Name, kein Konto,
 * Stichwörter werden vorher von möglichen Personendaten befreit. Ohne Server zählt der Browser lokal.
 * Bewegung: Schritte erscheinen nacheinander, nach dem Senden fliegt ein Dankeschön mit Sternen herein.
 */
import { useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Angebot } from "@/lib/angebot";
import type { Meta } from "@/lib/daten";
import type { Gruppe } from "@/lib/signal-regeln.mjs";
import { ladeSignale, sendeSignal } from "@/lib/signale-client";
import { Symbol } from "../symbol";
import { Owl } from "../ui";
import { useElternDaten } from "./daten";
import { useTexte } from "./sprache";

const GRUPPEN: Gruppe[] = ["6-8", "9-11", "12-14", "15-17"];
const gruppenText = (g: Gruppe) => g.replace("-", "–");

export function WunschAnfrage({ angebote, meta: grundMeta }: { angebote: Angebot[]; meta: Meta }) {
  const t = useTexte().anfrage;
  const ruhig = useReducedMotion();
  const { meta } = useElternDaten(angebote, grundMeta);
  const [thema, setThema] = useState("");
  const [gruppe, setGruppe] = useState<Gruppe | "">("");
  const [stichwort, setStichwort] = useState("");
  const [status, setStatus] = useState<"offen" | "sendet" | "danke">("offen");
  const [beliebt, setBeliebt] = useState<Array<{ name: string; anzahl: number }>>([]);
  const bereit = Boolean(gruppe && (thema || stichwort.trim()));
  const themaName = (id: string) => meta.themen.find((x) => x.id === id)?.name ?? id;

  async function senden() {
    if (!bereit || !gruppe) return;
    setStatus("sendet");
    if (thema) await sendeSignal({ art: "wunsch", thema, gruppe });
    if (stichwort.trim()) await sendeSignal({ art: "fehlt", begriff: stichwort, gruppe });
    const { stand } = await ladeSignale();
    setBeliebt(
      Object.entries(stand.wuensche)
        .map(([k, n]) => {
          const [th, g] = k.split("|");
          return { name: `${themaName(th ?? "")} · ${gruppenText((g ?? "") as Gruppe)}`, anzahl: n };
        })
        .sort((x, y) => y.anzahl - x.anzahl)
        .slice(0, 3),
    );
    setStatus("danke");
  }

  function nochmal() {
    setStatus("offen");
    setThema("");
    setGruppe("");
    setStichwort("");
  }

  const schritt = (i: number) => (ruhig ? {} : { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: 0.1 + i * 0.1, duration: 0.35 } });

  return (
    <section aria-labelledby="anfrage-titel" className="el-anfrage">
      <div className="el-anfrage__kopf">
        <motion.div className="el-anfrage__eule" animate={ruhig ? undefined : { rotate: [0, -6, 5, 0] }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3 }}>
          <Owl />
        </motion.div>
        <div>
          <p className="el-anfrage__oben"><Symbol name="check" /> {t.oben}</p>
          <h2 id="anfrage-titel">{t.titel}</h2>
          <p className="el-anfrage__text">{t.text}</p>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {status === "danke" ? (
          <motion.div key="danke" className="el-anfrage__danke" role="status"
            initial={ruhig ? false : { opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
            <div className="el-anfrage__sterne" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.span key={i} style={{ ["--i" as string]: i } as CSSProperties}
                  initial={ruhig ? false : { opacity: 0, y: 0, scale: 0.4 }} animate={{ opacity: [0, 1, 0], y: -60 - i * 8, scale: 1 }} transition={{ duration: 1.4, delay: i * 0.12 }}>
                  <Symbol name="star" />
                </motion.span>
              ))}
            </div>
            <p className="el-anfrage__danke-titel"><Symbol name="heart" /> {t.danke}</p>
            <p>{t.dankeText}</p>
            {beliebt.length > 0 && (
              <>
                <p className="el-anfrage__beliebt-titel">{t.beliebt}</p>
                <ol className="el-anfrage__beliebt">
                  {beliebt.map((b) => <li key={b.name}><span>{b.name}</span><strong>{b.anzahl}×</strong></li>)}
                </ol>
              </>
            )}
            <button type="button" className="el-textknopf" onClick={nochmal}><Symbol name="plus" /> {t.nochmal}</button>
          </motion.div>
        ) : (
          <motion.div key="formular" className="el-anfrage__schritte" exit={ruhig ? undefined : { opacity: 0, y: -12 }}>
            <motion.fieldset {...schritt(0)}>
              <legend><span className="el-anfrage__nr">1</span>{t.thema}</legend>
              <div className="el-chips">
                {meta.themen.map((x) => (
                  <button key={x.id} type="button" className="el-chip" style={{ ["--farbe" as string]: x.farbe } as CSSProperties} aria-pressed={thema === x.id} onClick={() => setThema(thema === x.id ? "" : x.id)}>
                    <span className="el-chip__punkt" aria-hidden="true" />{x.name}
                  </button>
                ))}
              </div>
            </motion.fieldset>
            <motion.fieldset {...schritt(1)}>
              <legend><span className="el-anfrage__nr">2</span>{t.alter}</legend>
              <div className="el-chips">
                {GRUPPEN.map((g) => (
                  <button key={g} type="button" className="el-chip" aria-pressed={gruppe === g} onClick={() => setGruppe(g)}>{t.jahre(gruppenText(g))}</button>
                ))}
              </div>
            </motion.fieldset>
            <motion.div {...schritt(2)}>
              <label className="el-anfrage__feld" htmlFor="anfrage-stichwort">
                <span><span className="el-anfrage__nr">3</span>{t.stichwort}</span>
                <input id="anfrage-stichwort" value={stichwort} maxLength={40} onChange={(e) => setStichwort(e.target.value)} placeholder={t.platzhalter} />
              </label>
              <p className="el-anfrage__hinweis">{t.hinweis}</p>
            </motion.div>
            <motion.button type="button" className="el-anfrage__senden" disabled={!bereit || status === "sendet"} onClick={senden}
              whileHover={ruhig || !bereit ? undefined : { scale: 1.03 }} whileTap={ruhig || !bereit ? undefined : { scale: 0.97 }}>
              <Symbol name="arrow" /> {status === "sendet" ? t.sendet : t.senden}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
