"use client";

/**
 * Schnupper-Spiel „Robo-Coding“: Pfeile antippen = Programm, „Los“ = der Roboter läuft.
 * Danach bewertet das Kind mit drei Gesichtern – so lernt die App, ob Coding Spaß macht.
 */
import { useState } from "react";
import { Symbol } from "@/components/symbol";
import { vorlesen } from "./mia";

const GROESSE = 4;
const START = { x: 0, y: 3 };
const ZIEL = { x: 3, y: 0 };
/** Das Pfeil-Symbol zeigt nach rechts und wird gedreht */
const PFEILE = [
  { id: "hoch", text: "Hoch", grad: -90, dx: 0, dy: -1 },
  { id: "runter", text: "Runter", grad: 90, dx: 0, dy: 1 },
  { id: "links", text: "Links", grad: 180, dx: -1, dy: 0 },
  { id: "rechts", text: "Rechts", grad: 0, dx: 1, dy: 0 },
] as const;
type Pfeil = (typeof PFEILE)[number];
const MAX_SCHRITTE = 8;

export type Bewertung = "super" | "gut" | "naja";

function PfeilSymbol({ grad }: { grad: number }) {
  return <Symbol name="arrow" style={{ transform: `rotate(${grad}deg)` }} />;
}

/** Gezeichnete Gesichter für die Bewertung */
function Gesicht({ art }: { art: Bewertung }) {
  const mund = art === "super" ? "M-9 4 Q0 14 9 4 Z" : art === "gut" ? "M-8 5 Q0 11 8 5" : "M-8 7 H8";
  return (
    <svg viewBox="-20 -20 40 40" className="kr-gesicht" aria-hidden="true">
      <circle r={18} fill="#F5B82E" />
      {art === "super" ? (
        <g fill="#E07A4F">
          <path d="M-9 -9 c-2 -3 -6 -1 -4 2 l4 4 l4 -4 c2 -3 -2 -5 -4 -2 Z" />
          <path d="M9 -9 c-2 -3 -6 -1 -4 2 l4 4 l4 -4 c2 -3 -2 -5 -4 -2 Z" />
        </g>
      ) : (
        <g fill="#1F2937">
          <circle cx={-6} cy={-4} r={2.5} />
          <circle cx={6} cy={-4} r={2.5} />
        </g>
      )}
      <path d={mund} stroke="#1F2937" strokeWidth={2.5} fill={art === "super" ? "#fff" : "none"} strokeLinecap="round" />
    </svg>
  );
}

export function RoboSpiel({ onFertig, onAbbrechen }: { onFertig: (b: Bewertung) => void; onAbbrechen: () => void }) {
  const [programm, setProgramm] = useState<Pfeil[]>([]);
  const [robo, setRobo] = useState(START);
  const [laeuft, setLaeuft] = useState(false);
  const [geschafft, setGeschafft] = useState(false);
  const [hinweis, setHinweis] = useState("Bring den Roboter zum Stern! Tippe Pfeile an, dann auf Los.");

  async function starten() {
    if (laeuft || programm.length === 0) return;
    setLaeuft(true);
    let pos = { ...START };
    setRobo(pos);
    let wand = false;
    for (const p of programm) {
      await new Promise((r) => setTimeout(r, 450));
      const neu = { x: pos.x + p.dx, y: pos.y + p.dy };
      if (neu.x < 0 || neu.y < 0 || neu.x >= GROESSE || neu.y >= GROESSE) {
        wand = true;
        break;
      }
      pos = neu;
      setRobo(pos);
    }
    if (pos.x === ZIEL.x && pos.y === ZIEL.y) {
      setGeschafft(true);
      setHinweis("Super, du hast programmiert! Wie hat dir das gefallen?");
      vorlesen("Super, du hast programmiert! Wie hat dir das gefallen?");
    } else {
      setHinweis(wand ? "Ups, da ist die Wand! Versuch es nochmal." : "Fast! Der Roboter ist noch nicht beim Stern.");
      await new Promise((r) => setTimeout(r, 700));
      setRobo(START);
    }
    setLaeuft(false);
  }

  return (
    <div className="kr-dialog" role="dialog" aria-modal="true" aria-label="Robo-Coding">
      <div className="kr-dialog-karte">
        <button type="button" className="kr-rund kr-schliessen" aria-label="Schließen" onClick={onAbbrechen}><Symbol name="close" /></button>
        <h2><Symbol name="robot" /> Robo-Coding</h2>
        <p className="kr-gross">
          {hinweis}
          <button type="button" className="kr-vorlesen" aria-label="Vorlesen" onClick={() => vorlesen(hinweis)}><Symbol name="volume" /></button>
        </p>

        <div className="kr-gitter" style={{ gridTemplateColumns: `repeat(${GROESSE}, 1fr)` }} aria-label="Spielfeld">
          {Array.from({ length: GROESSE * GROESSE }, (_, i) => {
            const x = i % GROESSE;
            const y = Math.floor(i / GROESSE);
            const istRobo = robo.x === x && robo.y === y;
            const istZiel = ZIEL.x === x && ZIEL.y === y;
            return (
              <div key={i} className={`kr-feld${istZiel ? " ist-ziel" : ""}`}>
                {istRobo ? <Symbol name="robot" className="kr-robo" /> : istZiel ? <Symbol name="star" /> : null}
              </div>
            );
          })}
        </div>

        {!geschafft ? (
          <>
            <div className="kr-programm" aria-label="Dein Programm">
              {programm.length === 0 ? <span className="kr-leise">Dein Programm ist leer</span> : programm.map((p, i) => <PfeilSymbol key={i} grad={p.grad} />)}
            </div>
            <div className="kr-reihe">
              {PFEILE.map((p) => (
                <button key={p.id} type="button" className="kr-knopf-bild" aria-label={p.text} disabled={laeuft || programm.length >= MAX_SCHRITTE} onClick={() => setProgramm([...programm, p])}>
                  <PfeilSymbol grad={p.grad} />
                </button>
              ))}
            </div>
            <div className="kr-reihe">
              <button type="button" className="kr-knopf kr-weiss" disabled={laeuft} onClick={() => { setProgramm([]); setRobo(START); }}>
                <Symbol name="refresh" /> Löschen
              </button>
              <button type="button" className="kr-knopf kr-gelb" disabled={laeuft || programm.length === 0} onClick={starten}>
                <Symbol name="play" /> Los!
              </button>
            </div>
          </>
        ) : (
          <div className="kr-reihe">
            {(["super", "gut", "naja"] as const).map((b) => (
              <button key={b} type="button" className="kr-knopf-bild" aria-label={b === "super" ? "Super" : b === "gut" ? "Gut" : "Naja"} onClick={() => onFertig(b)}>
                <Gesicht art={b} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
