"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import karte from "@/lib/heilbronn-karte.json";
import { Symbol } from "./symbol";
import { PixelBild } from "./spiel/pixel-grafik";
import type { HausGrafik } from "@/lib/spiel";

export type OrtInfo = {
  id: string;
  name: string;
  titel: string;
  text: string;
  adresse: string;
  website: string;
  anmeldung: string;
  kontakt: string;
  grafik: HausGrafik;
  hausImSpiel: string;
  farbe: string;
  lat: number;
  lon: number;
  datenweg: string;
  anzahl: number;
  themen: Array<{ id: string; name: string; anzahl: number }>;
  alter: string;
  kostenlos: number;
  naechste: Array<{ titel: string; slug: string; wann: string; alter: string }>;
  datenOk: boolean;
  stand: string;
};

type Sicht = { x: number; y: number; b: number; h: number };
const VOLL: Sicht = { x: 0, y: 0, b: karte.breite, h: karte.hoehe };
const START: Sicht = { x: 950, y: 560, b: 1600, h: 1960 };
const GEH_TEMPO_M_PRO_MIN = 75;
const UMWEG = 1.3;

function gehminuten(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.max(1, Math.round((Math.hypot(a.x - b.x, a.y - b.y) * UMWEG) / GEH_TEMPO_M_PRO_MIN));
}

const THEMA_SYMBOL: Record<string, string> = { ki: "robot", coding: "code", gaming: "controller" };

/** Echte Karte von Heilbronn (OpenStreetMap-Daten, lokal gespeichert) mit den Lernorten als Spiel-Pins. */
export function HeilbronnKarte({ orte }: { orte: OrtInfo[] }) {
  const [sicht, setSicht] = useState<Sicht>(START);
  const [auswahl, setAuswahl] = useState<string>(orte[0]?.id ?? "");
  const [tour, setTour] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const ziehen = useRef<{ x: number; y: number; sicht: Sicht } | null>(null);
  const animation = useRef(0);
  const ort = orte.find((o) => o.id === auswahl);
  const bahnhof = karte.orte.hauptbahnhof;

  const fliegeZu = useCallback((ziel: Sicht) => {
    cancelAnimationFrame(animation.current);
    const reduziert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let start: Sicht | null = null;
    const beginn = performance.now();
    const dauer = reduziert ? 1 : 700;
    const schritt = (jetzt: number) => {
      setSicht((aktuell) => {
        start ??= aktuell;
        const t = Math.min(1, (jetzt - beginn) / dauer);
        const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
        return { x: start.x + (ziel.x - start.x) * e, y: start.y + (ziel.y - start.y) * e, b: start.b + (ziel.b - start.b) * e, h: start.h + (ziel.h - start.h) * e };
      });
      if (performance.now() - beginn < dauer) animation.current = requestAnimationFrame(schritt);
    };
    animation.current = requestAnimationFrame(schritt);
  }, []);

  const waehle = useCallback(
    (id: string, zoomen = true) => {
      setAuswahl(id);
      const p = karte.orte[id as keyof typeof karte.orte];
      if (p && zoomen) fliegeZu({ x: p.x - 450, y: p.y - 520, b: 900, h: 1040 });
    },
    [fliegeZu],
  );

  // Entdecker-Tour: fliegt nacheinander alle Lernorte an.
  useEffect(() => {
    if (!tour) return;
    let i = Math.max(0, orte.findIndex((o) => o.id === auswahl));
    const weiter = () => {
      i = (i + 1) % orte.length;
      waehle(orte[i]!.id);
    };
    const uhr = window.setInterval(weiter, 3800);
    return () => window.clearInterval(uhr);
  }, [tour, orte, auswahl, waehle]);

  function zoom(faktor: number) {
    setTour(false);
    const mitte = { x: sicht.x + sicht.b / 2, y: sicht.y + sicht.h / 2 };
    const b = Math.min(VOLL.b * 1.1, Math.max(500, sicht.b * faktor));
    const h = (b * sicht.h) / sicht.b;
    fliegeZu({ x: mitte.x - b / 2, y: mitte.y - h / 2, b, h });
  }

  function weltProPixel() {
    const r = svg.current?.getBoundingClientRect();
    return r ? Math.max(sicht.b / r.width, sicht.h / r.height) : 1;
  }

  return (
    <div className="hn-karte">
      <div className="hn-karte-flaeche">
        <svg
          ref={svg}
          className="hn-karte-svg"
          viewBox={`${sicht.x} ${sicht.y} ${sicht.b} ${sicht.h}`}
          role="img"
          aria-label="Karte von Heilbronn mit Neckar, Hauptbahnhof und den vier Lernorten"
          onPointerDown={(e) => {
            if ((e.target as Element).closest("[data-pin]")) return;
            setTour(false);
            cancelAnimationFrame(animation.current);
            e.currentTarget.setPointerCapture(e.pointerId);
            ziehen.current = { x: e.clientX, y: e.clientY, sicht };
          }}
          onPointerMove={(e) => {
            const z = ziehen.current;
            if (!z) return;
            const f = weltProPixel();
            setSicht({ ...z.sicht, x: z.sicht.x - (e.clientX - z.x) * f, y: z.sicht.y - (e.clientY - z.y) * f });
          }}
          onPointerUp={() => (ziehen.current = null)}
          onPointerCancel={() => (ziehen.current = null)}
          onWheel={(e) => zoom(e.deltaY > 0 ? 1.15 : 0.87)}
        >
          <rect x={-2000} y={-2000} width={karte.breite + 4000} height={karte.hoehe + 4000} fill="#efe6d0" />
          {karte.parks.map((d, i) => <path key={`p${i}`} d={d} fill="#cfe0b4" />)}
          {karte.fluss.map((d, i) => <path key={`f${i}`} d={d} fill="none" stroke="#7eb9c2" strokeWidth="85" strokeLinecap="round" strokeLinejoin="round" />)}
          {karte.kanal.map((d, i) => <path key={`k${i}`} d={d} fill="none" stroke="#7eb9c2" strokeWidth="45" strokeLinecap="round" strokeLinejoin="round" />)}
          {karte.seen.map((d, i) => <path key={`s${i}`} d={d} fill="#7eb9c2" />)}
          {karte.bahn.map((d, i) => <path key={`b${i}`} d={d} fill="none" stroke="#9b958a" strokeWidth="5" strokeDasharray="18 10" />)}
          {karte.strassen.map((d, i) => <path key={`n${i}`} d={d} fill="none" stroke="#fffaf0" strokeWidth="12" strokeLinecap="round" />)}
          {karte.hauptstrassen.map((d, i) => <path key={`h${i}`} d={d} fill="none" stroke="#f6d48a" strokeWidth="18" strokeLinecap="round" />)}

          <text x="1560" y="1340" className="hn-wasser-text" transform="rotate(-62 1560 1340)">Neckar</text>

          {(["hauptbahnhof", "marktplatz"] as const).map((id) => {
            const p = karte.orte[id];
            return (
              <g key={id} transform={`translate(${p.x} ${p.y})`} className="hn-wahrzeichen">
                <circle r="34" fill="#fffaf0" stroke="#4a4560" strokeWidth="6" />
                <path d={id === "hauptbahnhof" ? "M-14 12h28M-12-14h24v20h-24zM-6-8h12" : "M-16 14h32M-12 14V-2h24v16M-16-2 0-16 16-2"} fill="none" stroke="#4a4560" strokeWidth="5" />
                <text y="72" textAnchor="middle">{id === "hauptbahnhof" ? "Hauptbahnhof" : "Marktplatz"}</text>
              </g>
            );
          })}

          {ort && (
            <g className="hn-wege" aria-hidden="true">
              <path d={`M${bahnhof.x} ${bahnhof.y}L${karte.orte[ort.id as keyof typeof karte.orte]?.x ?? 0} ${karte.orte[ort.id as keyof typeof karte.orte]?.y ?? 0}`} stroke="#2f4bff" strokeWidth="9" strokeDasharray="4 22" strokeLinecap="round" fill="none" />
            </g>
          )}

          {orte.map((o, i) => {
            const p = karte.orte[o.id as keyof typeof karte.orte];
            if (!p) return null;
            const gewaehlt = o.id === auswahl;
            return (
              <g key={o.id} transform={`translate(${p.x} ${p.y})`}>
                <motion.g
                  data-pin
                  role="button"
                  tabIndex={0}
                  aria-label={`${o.name} auswählen`}
                  aria-pressed={gewaehlt}
                  className="hn-pin"
                  initial={{ y: -260, opacity: 0 }}
                  animate={{ y: 0, opacity: 1, scale: gewaehlt ? 1.18 : 1 }}
                  transition={{ delay: 0.15 + i * 0.12, type: "spring", stiffness: 260, damping: 14 }}
                  whileHover={{ scale: 1.15 }}
                  onClick={() => { setTour(false); waehle(o.id); }}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setTour(false); waehle(o.id); } }}
                >
                  {gewaehlt && <circle r="150" fill={o.farbe} opacity="0.2" className="hn-puls" />}
                  <path d="M0 0C-60-70-95-110-95-165a95 95 0 1 1 190 0C95-110 60-70 0 0Z" fill={o.farbe} stroke="#254950" strokeWidth="10" />
                  <circle cy="-168" r="72" fill="#fffaf0" stroke="#254950" strokeWidth="6" />
                  <foreignObject x="-60" y="-225" width="120" height="110" style={{ pointerEvents: "none" }}>
                    <PixelBild motiv={o.grafik} />
                  </foreignObject>
                  <g transform="translate(0 70)">
                    <rect x={-o.name.length * 17 - 24} y="-46" width={o.name.length * 34 + 48} height="64" rx="18" fill="#fffaf0" stroke="#254950" strokeWidth="6" />
                    <text y="0" textAnchor="middle" className="hn-pin-name">{o.name}</text>
                  </g>
                </motion.g>
              </g>
            );
          })}
        </svg>

        <div className="hn-steuerung">
          <button className="rund-knopf" onClick={() => zoom(0.75)} aria-label="Näher heran"><Symbol name="plus" /></button>
          <button className="rund-knopf" onClick={() => zoom(1.33)} aria-label="Weiter weg"><Symbol name="minus" /></button>
          <button className="rund-knopf" onClick={() => { setTour(false); fliegeZu(START); }} aria-label="Alle Lernorte zeigen"><Symbol name="map" /></button>
          <button className="rund-knopf" onClick={() => setTour(!tour)} aria-pressed={tour} aria-label={tour ? "Tour anhalten" : "Entdecker-Tour starten"}><Symbol name={tour ? "pause" : "play"} /></button>
        </div>
        <p className="hn-quelle">Kartendaten {karte.quelle} · Stand {karte.stand}</p>
      </div>

      <AnimatePresence mode="wait">
        {ort && (
          <motion.aside key={ort.id} className="hn-info" style={{ ["--ort-farbe" as string]: ort.farbe }} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ type: "spring", stiffness: 260, damping: 26 }} aria-live="polite">
            <div className="hn-info-kopf">
              <PixelBild motiv={ort.grafik} className="hn-info-bild" />
              <div>
                <p className="spiel-kennung">{ort.name}</p>
                <h2>{ort.titel}</h2>
              </div>
            </div>
            <p className="hn-info-text">{ort.text}</p>

            <ul className="hn-fakten">
              <li><Symbol name="pin" /><span>{ort.adresse}</span></li>
              <li><Symbol name="clock" /><span>ca. {gehminuten(bahnhof, karte.orte[ort.id as keyof typeof karte.orte] ?? bahnhof)} Min. zu Fuß vom Hauptbahnhof</span></li>
              <li><Symbol name="ticket" /><span><strong>{ort.anzahl}</strong> passende Angebote · {ort.alter}{ort.kostenlos > 0 ? ` · ${ort.kostenlos} kostenlos` : ""}</span></li>
            </ul>

            {ort.themen.length > 0 && (
              <div className="hn-themen">
                {ort.themen.map((t) => (
                  <span key={t.id} className="hn-thema"><Symbol name={THEMA_SYMBOL[t.id] ?? "star"} />{t.name} <strong>{t.anzahl}</strong></span>
                ))}
              </div>
            )}

            {ort.naechste.length > 0 && (
              <div className="hn-naechste">
                <h3><Symbol name="calendar" /> Als Nächstes</h3>
                <ul>
                  {ort.naechste.map((n) => (
                    <li key={n.slug}>
                      <Link href={`/angebot/${n.slug}/`}>
                        <span className="hn-wann">{n.wann}</span>
                        <span className="hn-titel">{n.titel}</span>
                        <span className="hn-alter"><Symbol name="cake" />{n.alter}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <h3 className="hn-schritte-titel"><Symbol name="info" /> So klappt die Anmeldung</h3>
            <ol className="hn-schritte">
              <li><span>1</span>Kurs aussuchen – hier, im Spiel oder bei „Eltern“.</li>
              <li><span>2</span>Ein Erwachsener meldet auf der Website von {ort.name} an.</li>
              <li><span>3</span>Hingehen, ausprobieren, Spaß haben!</li>
            </ol>

            <div className="hn-knoepfe">
              <a className="spiel-knopf spiel-knopf-dunkel" href={ort.anmeldung} target="_blank" rel="noopener noreferrer"><Symbol name="external" /> Zur Anmeldung bei {ort.name}</a>
              <a className="spiel-knopf" href={`https://www.openstreetmap.org/directions?to=${ort.lat}%2C${ort.lon}`} target="_blank" rel="noopener noreferrer"><Symbol name="map" /> Route</a>
              <a className="spiel-knopf" href={`mailto:${ort.kontakt}`}><Symbol name="info" /> Kontakt</a>
            </div>

            <p className="hn-spiel"><Symbol name="controller" /> Im Spiel heißt dieser Ort <Link href="/kind/">„{ort.hausImSpiel}“</Link>.</p>
            <details className="hn-daten">
              <summary>Woher kommen diese Daten?</summary>
              <p>
                Jede Nacht liest COSMOS die öffentlichen Angebote von <a href={ort.website} target="_blank" rel="noopener noreferrer">{ort.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}</a> ({ort.datenweg}).
                Letzter Abruf: {ort.stand} {ort.datenOk ? "– erfolgreich." : "– fehlgeschlagen, es werden die letzten guten Daten gezeigt."} Verbindlich sind immer die Angaben auf der Originalseite.
              </p>
            </details>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="hn-ortliste" role="tablist" aria-label="Lernorte">
        {orte.map((o) => (
          <button key={o.id} role="tab" aria-selected={o.id === auswahl} onClick={() => { setTour(false); waehle(o.id); }} style={{ ["--ort-farbe" as string]: o.farbe }}>
            <PixelBild motiv={o.grafik} />
            <span>{o.name}</span>
            <small>{o.anzahl} Angebote</small>
          </button>
        ))}
      </div>
    </div>
  );
}
