"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import karte from "@/lib/heilbronn-karte.json";
import type { HausGrafik } from "@/lib/spiel";
import { OrtsBild } from "./ortsbild";
import { Symbol } from "./symbol";
import { PixelBild } from "./spiel/pixel-grafik";

export type OrtInfo = {
  id: string;
  name: string;
  titel: string;
  text: string;
  adresse: string;
  website: string;
  anmeldung: string;
  kontakt?: string;
  telefon?: string;
  grafik: HausGrafik;
  hausImSpiel?: string;
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
type Weitere = (typeof karte.weitere)[number];

const P = karte.projektion;
const COS = Math.cos((P.lat0 * Math.PI) / 180);
const projiziere = (lat: number, lon: number) => ({ x: (lon - P.west) * P.meterProGrad * COS, y: (P.nord - lat) * P.meterProGrad });

const GANZE_STADT: Sicht = { x: 0, y: 0, b: karte.breite, h: karte.hoehe };
/** Ab dieser Sichtbreite (Meter) werden die Lernorte zu einer Blase zusammengefasst. */
const BLASE_AB = 7000;
const WEITERE_BIS = 9000;
const GEH_TEMPO_M_PRO_MIN = 75;
const UMWEG = 1.3;

const ART_SYMBOL: Record<string, string> = { bibliothek: "book", schule: "music", museum: "museum", theater: "masks", rathaus: "building" };
const ART_NAME: Record<string, string> = { bibliothek: "Bibliothek", schule: "Schule", museum: "Museum", theater: "Theater", rathaus: "Rathaus" };
const THEMA_SYMBOL: Record<string, string> = { ki: "robot", coding: "code", gaming: "controller" };

function gehminuten(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.max(1, Math.round((Math.hypot(a.x - b.x, a.y - b.y) * UMWEG) / GEH_TEMPO_M_PRO_MIN));
}

/** Die komplette Stadt Heilbronn (OpenStreetMap-Daten, lokal gespeichert) mit den Lernorten als Spiel-Pins. */
export function HeilbronnKarte({ orte }: { orte: OrtInfo[] }) {
  const punkte = useMemo(() => orte.map((o) => ({ ...o, ...projiziere(o.lat, o.lon) })), [orte]);
  const kern = useMemo<Sicht>(() => {
    const xs = punkte.map((p) => p.x);
    const ys = punkte.map((p) => p.y);
    const mx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const my = (Math.min(...ys) + Math.max(...ys)) / 2;
    const b = Math.max(2600, (Math.max(...xs) - Math.min(...xs)) * 2.4);
    return { x: mx - b / 2, y: my - b * 0.55, b, h: b * 1.1 };
  }, [punkte]);

  const [sicht, setSicht] = useState<Sicht>(GANZE_STADT);
  const [auswahl, setAuswahl] = useState<string>("");
  const [weiteresAuswahl, setWeiteresAuswahl] = useState<Weitere | null>(null);
  const [zeigeWeitere, setZeigeWeitere] = useState(true);
  const [tour, setTour] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const ziehen = useRef<{ x: number; y: number; sicht: Sicht; bewegt: boolean } | null>(null);
  const animation = useRef(0);
  const ort = punkte.find((o) => o.id === auswahl);
  const bahnhof = karte.orte.hauptbahnhof;
  const s = sicht.b / 2000; // Größe von Pins und Beschriftungen bleibt auf dem Bildschirm ähnlich
  const alsBlase = sicht.b > BLASE_AB;
  const mitte = { x: punkte.reduce((a, p) => a + p.x, 0) / punkte.length, y: punkte.reduce((a, p) => a + p.y, 0) / punkte.length };

  const fliegeZu = useCallback((ziel: Sicht) => {
    cancelAnimationFrame(animation.current);
    const reduziert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let start: Sicht | null = null;
    const beginn = performance.now();
    const dauer = reduziert ? 1 : 900;
    const schritt = (jetzt: number) => {
      setSicht((aktuell) => {
        start ??= aktuell;
        const t = Math.min(1, (jetzt - beginn) / dauer);
        const e = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
        return { x: start.x + (ziel.x - start.x) * e, y: start.y + (ziel.y - start.y) * e, b: start.b + (ziel.b - start.b) * e, h: start.h + (ziel.h - start.h) * e };
      });
      if (performance.now() - beginn < dauer) animation.current = requestAnimationFrame(schritt);
    };
    animation.current = requestAnimationFrame(schritt);
  }, []);

  const waehle = useCallback(
    (id: string) => {
      const p = punkte.find((o) => o.id === id);
      if (!p) return;
      setAuswahl(id);
      setWeiteresAuswahl(null);
      fliegeZu({ x: p.x - 650, y: p.y - 800, b: 1300, h: 1500 });
    },
    [punkte, fliegeZu],
  );

  // Entdecker-Tour: fliegt nacheinander alle Lernorte an.
  useEffect(() => {
    if (!tour) return;
    let i = Math.max(-1, punkte.findIndex((o) => o.id === auswahl));
    const weiter = () => {
      i = (i + 1) % punkte.length;
      waehle(punkte[i]!.id);
    };
    if (!auswahl) weiter();
    const uhr = window.setInterval(weiter, 4000);
    return () => window.clearInterval(uhr);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- die Tour soll nur bei Start/Stopp neu beginnen
  }, [tour]);

  function zoom(faktor: number) {
    setTour(false);
    const m = { x: sicht.x + sicht.b / 2, y: sicht.y + sicht.h / 2 };
    const b = Math.min(GANZE_STADT.b * 1.15, Math.max(600, sicht.b * faktor));
    const h = (b * sicht.h) / sicht.b;
    fliegeZu({ x: m.x - b / 2, y: m.y - h / 2, b, h });
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
          aria-label="Karte von ganz Heilbronn mit Stadtteilen, Neckar und den Lernorten"
          onPointerDown={(e) => {
            if ((e.target as Element).closest("[data-pin]")) return;
            setTour(false);
            cancelAnimationFrame(animation.current);
            e.currentTarget.setPointerCapture(e.pointerId);
            ziehen.current = { x: e.clientX, y: e.clientY, sicht, bewegt: false };
          }}
          onPointerMove={(e) => {
            const z = ziehen.current;
            if (!z) return;
            const f = weltProPixel();
            if (Math.hypot(e.clientX - z.x, e.clientY - z.y) > 4) z.bewegt = true;
            setSicht({ ...z.sicht, x: z.sicht.x - (e.clientX - z.x) * f, y: z.sicht.y - (e.clientY - z.y) * f });
          }}
          onPointerUp={() => (ziehen.current = null)}
          onPointerCancel={() => (ziehen.current = null)}
          onWheel={(e) => zoom(e.deltaY > 0 ? 1.15 : 0.87)}
        >
          <rect x={-5000} y={-5000} width={karte.breite + 10000} height={karte.hoehe + 10000} fill="#e3dbc6" />
          <path d={karte.grenze} fill="#f4eedf" stroke="#8a7f68" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          {karte.wald.map((d, i) => <path key={`w${i}`} d={d} fill="#bcd5a4" />)}
          {karte.parks.map((d, i) => <path key={`p${i}`} d={d} fill="#cfe3b6" />)}
          {karte.stadtteile.map((t) => <path key={`t${t.name}`} d={t.d} fill="none" stroke="#a89c82" strokeWidth="1.6" strokeDasharray="6 5" vectorEffect="non-scaling-stroke" />)}
          {karte.fluss.map((d, i) => <path key={`f${i}`} d={d} fill="none" stroke="#7eb9c2" strokeWidth="90" strokeLinecap="round" strokeLinejoin="round" />)}
          {karte.kanal.map((d, i) => <path key={`k${i}`} d={d} fill="none" stroke="#7eb9c2" strokeWidth="45" strokeLinecap="round" strokeLinejoin="round" />)}
          {karte.seen.map((d, i) => <path key={`s${i}`} d={d} fill="#7eb9c2" />)}
          {karte.bahn.map((d, i) => <path key={`b${i}`} d={d} fill="none" stroke="#8d877c" strokeWidth="1.6" strokeDasharray="6 4" vectorEffect="non-scaling-stroke" />)}
          {karte.strassen.map((d, i) => <path key={`n${i}`} d={d} fill="none" stroke="#fffaf0" strokeWidth="2.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />)}
          {karte.hauptstrassen.map((d, i) => <path key={`h${i}`} d={d} fill="none" stroke="#f6d48a" strokeWidth="3.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />)}
          {karte.autobahn.map((d, i) => <path key={`a${i}`} d={d} fill="none" stroke="#f0a05e" strokeWidth="5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />)}

          {karte.flussName && sicht.b < 12000 && (
            <text x={karte.flussName.x} y={karte.flussName.y} transform={`rotate(${karte.flussName.winkel} ${karte.flussName.x} ${karte.flussName.y})`} className="hn-wasser-text" fontSize={20 * s * 3.2} letterSpacing={6 * s}>
              {karte.flussName.text}
            </text>
          )}

          {sicht.b > 4500 &&
            karte.stadtteile.map((t) => (
              <text key={`l${t.name}`} x={t.mitte.x} y={t.mitte.y} textAnchor="middle" className="hn-stadtteil" fontSize={15 * s * 3.2}>
                {t.name}
              </text>
            ))}

          {(["hauptbahnhof", "marktplatz"] as const).map((id) => {
            const p = karte.orte[id];
            return (
              <g key={id} transform={`translate(${p.x} ${p.y}) scale(${s})`} className="hn-wahrzeichen">
                <circle r="30" fill="#fffaf0" stroke="#4a4560" strokeWidth="5" />
                <g transform="translate(-14 -14) scale(1.15)" fill="none" stroke="#4a4560" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  {id === "hauptbahnhof" ? <path d="M5 3h14v14H5zM5 11h14M8 21l2-4m6 4-2-4M9 7h6" /> : <path d="m3 11 9-8 9 8M5 9v12h14V9M10 21v-6h4v6" />}
                </g>
                {sicht.b < 9000 && <text y="62" textAnchor="middle">{id === "hauptbahnhof" ? "Hauptbahnhof" : "Marktplatz"}</text>}
              </g>
            );
          })}

          {zeigeWeitere && sicht.b < WEITERE_BIS &&
            karte.weitere.map((w) => (
              <g
                key={w.name}
                data-pin
                role="button"
                tabIndex={0}
                aria-label={`${w.name} (${ART_NAME[w.art] ?? "Ort"})`}
                className={`hn-weiteres ${weiteresAuswahl?.name === w.name ? "ist-gewaehlt" : ""}`}
                transform={`translate(${w.x} ${w.y}) scale(${s * 1.1})`}
                onClick={() => { setTour(false); setWeiteresAuswahl(w); setAuswahl(""); }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setWeiteresAuswahl(w); setAuswahl(""); } }}
              >
                <circle r="26" fill="#fffaf0" stroke="#6c4bd8" strokeWidth="5" />
                <g transform="translate(-13 -13) scale(1.08)" fill="none" stroke="#6c4bd8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={WEITERE_PFADE[w.art] ?? WEITERE_PFADE.museum} />
                </g>
              </g>
            ))}

          {ort && (
            <path d={`M${bahnhof.x} ${bahnhof.y}L${ort.x} ${ort.y}`} className="hn-weg" stroke="#2f4bff" strokeWidth="5" strokeDasharray="2 12" strokeLinecap="round" fill="none" vectorEffect="non-scaling-stroke" />
          )}

          {alsBlase ? (
            <g
              data-pin
              role="button"
              tabIndex={0}
              aria-label={`${punkte.length} Lernorte in der Innenstadt – hineinzoomen`}
              className="hn-pin"
              transform={`translate(${mitte.x} ${mitte.y}) scale(${s * 1.1})`}
              onClick={() => { setTour(false); fliegeZu(kern); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fliegeZu(kern); } }}
            >
              <circle r="92" fill="#2f4bff" opacity="0.2" />
              <circle r="66" fill="#2f4bff" stroke="#fffaf0" strokeWidth="10" />
              <text y="22" textAnchor="middle" fontSize="64" fontWeight="800" fill="#fffaf0">{punkte.length}</text>
              <g transform="translate(0 120)">
                <rect x="-170" y="-40" width="340" height="62" rx="20" fill="#fffaf0" stroke="#254950" strokeWidth="6" />
                <text y="2" textAnchor="middle" className="hn-pin-name">Lernorte · antippen</text>
              </g>
            </g>
          ) : (
            // Die Pins stehen fest an ihrer echten Adresse: kein Hüpfen, kein Pulsieren. Die Auswahl zeigt ein ruhiger Ring.
            punkte.map((o) => {
              const gewaehlt = o.id === auswahl;
              return (
                <g key={o.id} transform={`translate(${o.x} ${o.y}) scale(${s})`}>
                  <g
                    data-pin
                    role="button"
                    tabIndex={0}
                    aria-label={`${o.name} auswählen`}
                    aria-pressed={gewaehlt}
                    className={`hn-pin ${gewaehlt ? "ist-gewaehlt" : ""}`}
                    onClick={() => { setTour(false); waehle(o.id); }}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setTour(false); waehle(o.id); } }}
                  >
                    <ellipse cx="0" cy="0" rx="46" ry="16" fill="#1c1934" opacity="0.25" />
                    {gewaehlt && <circle cy="-168" r="128" fill="none" stroke={o.farbe} strokeWidth="18" opacity="0.55" />}
                    <path d="M0 0C-60-70-95-110-95-165a95 95 0 1 1 190 0C95-110 60-70 0 0Z" fill={o.farbe} stroke="#254950" strokeWidth="10" />
                    <circle cy="-168" r="72" fill="#fffaf0" stroke="#254950" strokeWidth="6" />
                    <foreignObject x="-60" y="-225" width="120" height="110" style={{ pointerEvents: "none" }}>
                      <PixelBild motiv={o.grafik} />
                    </foreignObject>
                    <g transform="translate(0 70)">
                      <rect x={-o.name.length * 17 - 24} y="-46" width={o.name.length * 34 + 48} height="64" rx="18" fill="#fffaf0" stroke="#254950" strokeWidth="6" />
                      <text y="0" textAnchor="middle" className="hn-pin-name">{o.name}</text>
                    </g>
                  </g>
                </g>
              );
            })
          )}
        </svg>

        <div className="hn-steuerung">
          <button className="rund-knopf" onClick={() => zoom(0.7)} aria-label="Näher heran"><Symbol name="plus" /></button>
          <button className="rund-knopf" onClick={() => zoom(1.4)} aria-label="Weiter weg"><Symbol name="minus" /></button>
          <button className="rund-knopf" onClick={() => { setTour(false); fliegeZu(GANZE_STADT); }} aria-label="Ganz Heilbronn zeigen"><Symbol name="map" /></button>
          <button className="rund-knopf" onClick={() => setTour(!tour)} aria-pressed={tour} aria-label={tour ? "Tour anhalten" : "Entdecker-Tour starten"}><Symbol name={tour ? "pause" : "play"} /></button>
          <button className="rund-knopf" onClick={() => setZeigeWeitere(!zeigeWeitere)} aria-pressed={zeigeWeitere} aria-label={zeigeWeitere ? "Weitere Orte ausblenden" : "Weitere Orte zeigen"}><Symbol name="book" /></button>
        </div>
        <div className="hn-legende" aria-hidden="true">
          <span><i className="hn-l-pin" /> Lernort mit Kursen</span>
          <span><i className="hn-l-weiteres" /> weitere Orte</span>
          <span><i className="hn-l-autobahn" /> Autobahn</span>
        </div>
        <p className="hn-quelle">Kartendaten {karte.quelle}</p>
      </div>

      <AnimatePresence mode="wait">
        {ort ? (
          <motion.aside key={ort.id} className="hn-info" style={{ ["--ort-farbe" as string]: ort.farbe }} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ type: "spring", stiffness: 260, damping: 26 }} aria-live="polite">
            <OrtsBild id={ort.id} name={ort.name} farbe={ort.farbe} className="hn-info-foto" />
            <div className="hn-info-kopf">
              <PixelBild motiv={ort.grafik} className="hn-info-bild" />
              <div>
                <p className="spiel-kennung">{ort.name}</p>
                <h2>{ort.titel}</h2>
              </div>
            </div>

            <ul className="hn-fakten">
              <li><Symbol name="pin" /><span>{ort.adresse}</span></li>
              <li><Symbol name="train" /><span>{gehminuten(bahnhof, ort)} Min. zu Fuß vom Hauptbahnhof</span></li>
              <li><Symbol name="ticket" /><span><strong>{ort.anzahl}</strong> Angebote · {ort.alter}{ort.kostenlos > 0 ? ` · ${ort.kostenlos} kostenlos` : ""}</span></li>
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
                  {ort.naechste.map((n, i) => (
                    <motion.li key={n.slug} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.08 }}>
                      <Link href={`/angebot/${n.slug}/`}>
                        <span className="hn-wann">{n.wann}</span>
                        <span className="hn-titel">{n.titel}</span>
                        <span className="hn-alter"><Symbol name="cake" />{n.alter}</span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            <ol className="hn-schritte" aria-label="So klappt die Anmeldung">
              <li><span><Symbol name="search" /></span>Kurs finden</li>
              <li><span><Symbol name="user" /></span>Erwachsene melden an</li>
              <li><span><Symbol name="star" /></span>Hingehen!</li>
            </ol>

            <div className="hn-knoepfe">
              <a className="spiel-knopf spiel-knopf-dunkel" href={ort.anmeldung} target="_blank" rel="noopener noreferrer"><Symbol name="external" /> Anmelden</a>
              {ort.telefon && <a className="spiel-knopf" href={`tel:${ort.telefon.replace(/[^\d+]/g, "")}`}><Symbol name="phone" /> {ort.telefon}</a>}
              {ort.kontakt && <a className="spiel-knopf" href={`mailto:${ort.kontakt}`}><Symbol name="mail" /> E-Mail</a>}
              <a className="spiel-knopf" href={`https://www.openstreetmap.org/directions?to=${ort.lat}%2C${ort.lon}`} target="_blank" rel="noopener noreferrer"><Symbol name="map" /> Route</a>
            </div>

            {ort.hausImSpiel && <p className="hn-spiel"><Symbol name="controller" /> Im Spiel: <Link href="/kind/">{ort.hausImSpiel}</Link></p>}
            <details className="hn-daten">
              <summary>Woher kommen die Daten?</summary>
              <p>
                Jede Nacht automatisch von <a href={ort.website} target="_blank" rel="noopener noreferrer">{ort.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}</a> ({ort.datenweg}). Letzter Abruf: {ort.stand}
                {ort.datenOk ? "." : " – fehlgeschlagen, es werden die letzten guten Daten gezeigt."} Verbindlich ist die Originalseite. {ort.text}
              </p>
            </details>
          </motion.aside>
        ) : weiteresAuswahl ? (
          <motion.aside key={weiteresAuswahl.name} className="hn-info hn-info-weiteres" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} aria-live="polite">
            <div className="hn-info-kopf">
              <span className="hn-weiteres-symbol"><Symbol name={ART_SYMBOL[weiteresAuswahl.art] ?? "museum"} /></span>
              <div>
                <p className="spiel-kennung">{ART_NAME[weiteresAuswahl.art] ?? "Ort"}</p>
                <h2>{weiteresAuswahl.name}</h2>
              </div>
            </div>
            <p className="hn-info-text">Noch ohne Kurse im COSMOS-Entdecker. Mit einer Zeile in der Quellen-Tabelle kommt so ein Ort dazu.</p>
            <div className="hn-knoepfe">
              <a className="spiel-knopf" href={`https://www.openstreetmap.org/?mlat=${weiteresAuswahl.lat}&mlon=${weiteresAuswahl.lon}#map=17/${weiteresAuswahl.lat}/${weiteresAuswahl.lon}`} target="_blank" rel="noopener noreferrer"><Symbol name="map" /> In OpenStreetMap</a>
            </div>
          </motion.aside>
        ) : (
          <motion.aside key="start" className="hn-info hn-info-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2><Symbol name="map" /> Ganz Heilbronn</h2>
            <p className="hn-info-text">Tippe auf die blaue Blase oder einen Lernort unten.</p>
            <ul className="hn-start-liste">
              <li><i className="hn-l-pin" /> {punkte.length} Lernorte mit Kursen</li>
              <li><i className="hn-l-weiteres" /> {karte.weitere.length} weitere Orte zum Entdecken</li>
              <li><Symbol name="play" /> Entdecker-Tour startet alle nacheinander</li>
            </ul>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="hn-ortliste" role="tablist" aria-label="Lernorte">
        {punkte.map((o) => (
          <motion.button key={o.id} role="tab" aria-selected={o.id === auswahl} onClick={() => { setTour(false); waehle(o.id); }} style={{ ["--ort-farbe" as string]: o.farbe }} whileHover={{ y: -4 }} whileTap={{ scale: 0.96 }}>
            <OrtsBild id={o.id} name={o.name} farbe={o.farbe} className="hn-ort-foto" />
            <span>{o.name}</span>
            <small>{o.anzahl} Angebote</small>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

const WEITERE_PFADE: Record<string, string> = {
  bibliothek: "M4 19V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h14M8 7h8",
  schule: "M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  museum: "M3 21h18M5 21V10m4 11V10m6 11V10m4 11V10M2 10l10-7 10 7H2Z",
  theater: "M3 4h10v6a5 5 0 0 1-10 0V4Zm3 4h.01M10 8h.01M6 12q2 2 4 0M13 9h8v6a5 5 0 0 1-8 2",
  rathaus: "M4 21V5l8-3 8 3v16M9 21v-5h6v5M8 8h2m4 0h2M8 12h2m4 0h2",
};
