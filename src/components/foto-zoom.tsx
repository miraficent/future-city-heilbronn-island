"use client";

import { useEffect, useRef, useState } from "react";
import type { Foto } from "@/lib/fotos";
import { Symbol } from "./symbol";

const STUFEN = [1, 1.75, 2.5] as const;

/** Bildnachweis. Im Kinderbereich ohne Links nach draußen – nur als Text. */
function Nachweis({ foto, links }: { foto: Foto; links: boolean }) {
  if (!links) return <>Foto: {foto.autor}, {foto.lizenz}, Wikimedia Commons</>;
  return (
    <>
      Foto: {foto.autor}, <a href={foto.lizenzUrl} target="_blank" rel="noopener noreferrer">{foto.lizenz}</a>, <a href={foto.quelle} target="_blank" rel="noopener noreferrer">Wikimedia Commons</a>
    </>
  );
}

/** Echtes Foto mit Bildnachweis. Antippen öffnet die große Ansicht; dort lässt es sich weiter vergrößern und verschieben. */
export function FotoZoom({ foto, className = "", links = true }: { foto: Foto; className?: string; links?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const flaeche = useRef<HTMLDivElement>(null);
  const [offen, setOffen] = useState(false);
  const [stufe, setStufe] = useState(0);
  const zoom = STUFEN[stufe] ?? 1;

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (offen && !d.open) d.showModal();
    if (!offen && d.open) d.close();
  }, [offen]);

  function zoomen(neu: number, mitte?: { x: number; y: number }) {
    const s = Math.max(0, Math.min(STUFEN.length - 1, neu));
    const el = flaeche.current;
    const alt = STUFEN[stufe] ?? 1;
    const faktor = (STUFEN[s] ?? 1) / alt;
    setStufe(s);
    if (!el) return;
    // Der angetippte Punkt (oder die Mitte) bleibt beim Vergrößern an seiner Stelle.
    const px = mitte?.x ?? el.clientWidth / 2;
    const py = mitte?.y ?? el.clientHeight / 2;
    const zielX = (el.scrollLeft + px) * faktor - px;
    const zielY = (el.scrollTop + py) * faktor - py;
    requestAnimationFrame(() => el.scrollTo({ left: zielX, top: zielY }));
  }

  return (
    <figure className={`foto-zoom ${className}`}>
      <button type="button" className="foto-knopf" onClick={() => { setStufe(0); setOffen(true); }} aria-label={`Foto vergrößern: ${foto.alt.replace(/^Foto: /, "")}`}>
        <img src={foto.datei} width={foto.breite} height={foto.hoehe} alt={foto.alt} loading="lazy" decoding="async" />
        <span className="foto-lupe" aria-hidden="true"><Symbol name="expand" /></span>
      </button>
      <figcaption className="foto-nachweis"><Nachweis foto={foto} links={links} /></figcaption>

      <dialog
        ref={dialog}
        className="foto-dialog"
        onClose={() => setOffen(false)}
        onClick={(e) => e.target === e.currentTarget && setOffen(false)}
        // Escape schließt nur das Foto, nicht das Fenster dahinter.
        onKeyDown={(e) => { if (e.key === "Escape") e.stopPropagation(); }}
        aria-label={foto.alt}
      >
        {offen && (
          <div className="foto-dialog-innen">
            <div className="foto-dialog-leiste">
              <button type="button" className="rund-knopf" onClick={() => zoomen(stufe - 1)} disabled={stufe === 0} aria-label="Verkleinern"><Symbol name="minus" /></button>
              <span aria-live="polite">{Math.round(zoom * 100)} %</span>
              <button type="button" className="rund-knopf" onClick={() => zoomen(stufe + 1)} disabled={stufe === STUFEN.length - 1} aria-label="Vergrößern"><Symbol name="plus" /></button>
              <button type="button" className="rund-knopf foto-schliessen" onClick={() => setOffen(false)} aria-label="Foto schließen" autoFocus><Symbol name="close" /></button>
            </div>
            <div
              ref={flaeche}
              className={`foto-flaeche ${zoom > 1 ? "ist-gross" : ""}`}
              tabIndex={0}
              aria-label="Foto. Mit Plus und Minus vergrößern, mit den Pfeiltasten verschieben."
              onKeyDown={(e) => {
                if (e.key === "+" || e.key === "=") { e.preventDefault(); zoomen(stufe + 1); }
                if (e.key === "-") { e.preventDefault(); zoomen(stufe - 1); }
              }}
            >
              <img
                src={foto.datei}
                width={foto.breite}
                height={foto.hoehe}
                alt=""
                style={{ width: `${zoom * 100}%` }}
                onDoubleClick={(e) => {
                  const r = flaeche.current?.getBoundingClientRect();
                  zoomen(stufe === STUFEN.length - 1 ? 0 : stufe + 1, r ? { x: e.clientX - r.left, y: e.clientY - r.top } : undefined);
                }}
                draggable={false}
              />
            </div>
            <p className="foto-dialog-text">
              {foto.zeigt}{" "}
              <span><Nachweis foto={foto} links={links} /></span>
            </p>
          </div>
        )}
      </dialog>
    </figure>
  );
}
