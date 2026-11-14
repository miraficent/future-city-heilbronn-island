"use client";

/**
 * Soundeffekte für die Spielwelt – vollständig im Browser erzeugt (Web Audio API).
 * Keine Audiodateien, keine externen Dienste, keine Lizenzfragen.
 * Der Ton startet erst nach einer Berührung oder einem Klick (Vorgabe der Browser).
 */
import { lies, schreibe } from "./speicher";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let aus = false;
let geladen = false;

const LAUTSTAERKE = 0.22;

function kontext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!geladen) {
    aus = lies<boolean>("sitzung", "klang.aus", false);
    geladen = true;
  }
  if (aus) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = LAUTSTAERKE;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function ton(frequenz: number, start: number, dauer: number, art: OscillatorType = "triangle", lautstaerke = 1, gleitenZu?: number) {
  const c = kontext();
  if (!c || !master) return;
  const t0 = c.currentTime + start;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = art;
  osc.frequency.setValueAtTime(frequenz, t0);
  if (gleitenZu) osc.frequency.exponentialRampToValueAtTime(gleitenZu, t0 + dauer);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(lautstaerke, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dauer);
  osc.connect(gain).connect(master);
  osc.start(t0);
  osc.stop(t0 + dauer + 0.05);
}

function rauschen(start: number, dauer: number, lautstaerke: number, filterVon: number, filterZu: number) {
  const c = kontext();
  if (!c || !master) return;
  const t0 = c.currentTime + start;
  const puffer = c.createBuffer(1, Math.ceil(c.sampleRate * dauer), c.sampleRate);
  const daten = puffer.getChannelData(0);
  for (let i = 0; i < daten.length; i++) daten[i] = Math.random() * 2 - 1;
  const quelle = c.createBufferSource();
  quelle.buffer = puffer;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(filterVon, t0);
  filter.frequency.exponentialRampToValueAtTime(filterZu, t0 + dauer);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(lautstaerke, t0 + dauer * 0.25);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dauer);
  quelle.connect(filter).connect(gain).connect(master);
  quelle.start(t0);
}

let letzterSchritt = 0;

export const klang = {
  /** Leises Tapsen beim Laufen – höchstens alle 0,3 Sekunden. */
  schritt() {
    const jetzt = performance.now();
    if (jetzt - letzterSchritt < 300) return;
    letzterSchritt = jetzt;
    rauschen(0, 0.06, 0.25, 900, 500);
  },
  klick() {
    ton(660, 0, 0.07, "square", 0.25);
  },
  tuer() {
    ton(523, 0, 0.14, "triangle", 0.7);
    ton(784, 0.1, 0.22, "triangle", 0.7);
  },
  richtig() {
    [523, 659, 784].forEach((f, i) => ton(f, i * 0.09, 0.22, "triangle", 0.8));
  },
  falsch() {
    ton(330, 0, 0.16, "sine", 0.6);
    ton(262, 0.13, 0.24, "sine", 0.6);
  },
  einpacken() {
    ton(880, 0, 0.08, "sine", 0.6, 1320);
  },
  stern() {
    [1319, 1568, 2093].forEach((f, i) => ton(f, i * 0.06, 0.16, "sine", 0.45));
  },
  teil() {
    [523, 659, 784, 1047].forEach((f, i) => ton(f, i * 0.11, 0.26, "square", 0.35));
    [1568, 2093].forEach((f, i) => ton(f, 0.5 + i * 0.07, 0.3, "sine", 0.4));
  },
  countdown() {
    [0, 0.8, 1.6].forEach((t) => ton(587, t, 0.18, "square", 0.35));
    ton(1175, 2.4, 0.35, "square", 0.4);
  },
  start() {
    rauschen(0, 2.6, 0.9, 200, 1800);
    ton(90, 0, 2.6, "sawtooth", 0.25, 420);
  },
  jubel() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => ton(f, i * 0.12, 0.35, "triangle", 0.6));
  },
  /** Klingel der Stadtbahn: zweimal „ding“. */
  bahnKlingel() {
    [0, 0.32].forEach((t) => {
      ton(1568, t, 0.5, "sine", 0.5);
      ton(2093, t, 0.35, "sine", 0.25);
    });
  },
  /** Rollen auf den Schienen mit dem typischen Takt der Schienenstöße. */
  bahnFahrt(sekunden: number) {
    rauschen(0, sekunden, 0.35, 260, 420);
    for (let t = 0.4; t < sekunden - 0.2; t += 0.62) {
      ton(70, t, 0.08, "square", 0.35);
      ton(70, t + 0.14, 0.08, "square", 0.3);
    }
  },
  /** Roboter-Piepsen, wenn Bit spricht. */
  piep() {
    [988, 1319, 1175].forEach((f, i) => ton(f, i * 0.07, 0.07, "square", 0.18));
  },
  /** Kurzes Plopp beim Weiterblättern im Gespräch. */
  blubb() {
    ton(420, 0, 0.09, "sine", 0.5, 760);
  },
};

/** Browser spielen Ton erst nach einer Berührung ab – diese Funktion weckt alles beim ersten Antippen auf. */
export function tonFreischalten() {
  kontext();
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.resume();
}

export function klangIstAus(): boolean {
  if (typeof window === "undefined") return false;
  if (!geladen) {
    aus = lies<boolean>("sitzung", "klang.aus", false);
    geladen = true;
  }
  return aus;
}

export function setzeKlangAus(wert: boolean) {
  aus = wert;
  geladen = true;
  schreibe("sitzung", "klang.aus", wert);
  if (wert && ctx) void ctx.suspend();
}
