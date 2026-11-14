/**
 * Gemeinsame Regeln für anonyme Signale („Was fehlt?“) – genutzt von der Website und vom Vorschau-Server.
 * Ein Signal ist nur ein Thema mit Altersgruppe oder ein bereinigter Suchbegriff. Gespeichert werden
 * Zähler je Tag: keine IP-Adresse, keine Kennung, keine Uhrzeit, keine Verknüpfung zwischen Signalen.
 */

/** @typedef {"6-8" | "9-11" | "12-14" | "15-17" | "erwachsene"} Gruppe */
/** @typedef {{ art: "wunsch"; thema: string; gruppe: Gruppe } | { art: "fehlt"; begriff: string; gruppe?: Gruppe }} Signal */
/** @typedef {{ wuensche: Record<string, number>; fehlt: Record<string, number>; tage: Record<string, number> }} SignalStand */

/** @type {readonly Gruppe[]} */
export const GRUPPEN = ["6-8", "9-11", "12-14", "15-17", "erwachsene"];

const MAX_BEGRIFF = 40;
const THEMA = /^[a-z][a-z-]{1,29}$/;

const PERSONENDATEN = [
  /[\w.+-]+@[\w-]+\.[\w.]+/g, // E-Mail
  /(\+|00)?\d[\d\s/-]{6,}\d/g, // Telefonnummer
  /\b\d{5}\b/g, // Postleitzahl
  /\b\d{1,2}\.\d{1,2}\.\d{2,4}\b/g, // Datum
  /\b(ich hei(ß|ss)e|mein name ist|mein sohn|meine tochter)\s+\S+/gi,
  /\b\S+(stra(ß|ss)e|weg|gasse|platz)\s*\d+\w?/gi, // Straße mit Hausnummer
];

/**
 * Entfernt mögliche Personendaten aus einem Suchbegriff und kürzt ihn.
 * @param {string} text
 * @returns {string | null}
 */
export function bereinigeBegriff(text) {
  let t = String(text).normalize("NFC").toLowerCase().trim();
  for (const muster of PERSONENDATEN) t = t.replace(muster, " ");
  t = t.replace(/[^\p{L}\p{N}\s+#.-]/gu, " ").replace(/\s+/g, " ").trim().slice(0, MAX_BEGRIFF).trim();
  return t.length >= 2 ? t : null;
}

/**
 * Prüft ein empfangenes Signal streng. Alles Unbekannte wird verworfen.
 * @param {unknown} roh
 * @returns {Signal | null}
 */
export function pruefeSignal(roh) {
  if (!roh || typeof roh !== "object") return null;
  const r = /** @type {Record<string, unknown>} */ (roh);
  const gruppe = GRUPPEN.find((g) => g === r.gruppe);
  if (r.art === "wunsch" && typeof r.thema === "string" && THEMA.test(r.thema) && gruppe) return { art: "wunsch", thema: r.thema, gruppe };
  if (r.art === "fehlt" && typeof r.begriff === "string" && r.begriff.length <= 120 && (r.gruppe === undefined || gruppe)) {
    const begriff = bereinigeBegriff(r.begriff);
    return begriff ? { art: "fehlt", begriff, ...(gruppe ? { gruppe } : {}) } : null;
  }
  return null;
}

/** @returns {SignalStand} */
export const leererStand = () => ({ wuensche: {}, fehlt: {}, tage: {} });

/**
 * Zählt ein geprüftes Signal hoch. Gespeichert wird nur der Tag (JJJJ-MM-TT), nie die Uhrzeit.
 * @param {SignalStand} stand
 * @param {Signal} signal
 * @param {string} tag
 * @returns {SignalStand}
 */
export function zaehle(stand, signal, tag) {
  const neu = { wuensche: { ...stand.wuensche }, fehlt: { ...stand.fehlt }, tage: { ...stand.tage } };
  if (signal.art === "wunsch") {
    const k = `${signal.thema}|${signal.gruppe}`;
    neu.wuensche[k] = (neu.wuensche[k] ?? 0) + 1;
  } else {
    const begriff = bereinigeBegriff(signal.begriff);
    if (!begriff) return stand;
    neu.fehlt[begriff] = (neu.fehlt[begriff] ?? 0) + 1;
  }
  neu.tage[tag] = (neu.tage[tag] ?? 0) + 1;
  return neu;
}

/**
 * Liest einen gespeicherten Stand und verwirft alles, was nicht wie Zähler aussieht.
 * @param {unknown} roh
 * @returns {SignalStand}
 */
export function pruefeStand(roh) {
  const stand = leererStand();
  if (!roh || typeof roh !== "object") return stand;
  const r = /** @type {Record<string, unknown>} */ (roh);
  for (const feld of /** @type {const} */ (["wuensche", "fehlt", "tage"])) {
    const quelle = r[feld];
    if (!quelle || typeof quelle !== "object") continue;
    for (const [k, v] of Object.entries(quelle)) if (typeof v === "number" && Number.isInteger(v) && v > 0 && k.length <= 60) stand[feld][k] = v;
  }
  return stand;
}
