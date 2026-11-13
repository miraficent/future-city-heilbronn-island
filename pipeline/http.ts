export type Http = {
  text(url: string): Promise<string>;
  json<T = unknown>(url: string): Promise<T>;
};

const USER_AGENT = "COSMOS-Entdecker/0.1 (Prototyp aim Learning Guide; liest nur oeffentliche Angebotsseiten)";
const TIMEOUT_MS = 30_000;
const VERSUCHE = 3;

const warte = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Höflicher HTTP-Client: eigener User-Agent, Timeout, Wiederholungen mit Backoff
 * und eine Mindestpause zwischen zwei Anfragen an denselben Host.
 */
export function erstelleHttp(pauseMs = 400): Http {
  const letzteAnfrage = new Map<string, number>();

  async function hole(url: string): Promise<Response> {
    const host = new URL(url).host;
    const seitLetzter = Date.now() - (letzteAnfrage.get(host) ?? 0);
    if (seitLetzter < pauseMs) await warte(pauseMs - seitLetzter);

    let letzterFehler: unknown;
    for (let versuch = 1; versuch <= VERSUCHE; versuch++) {
      letzteAnfrage.set(host, Date.now());
      try {
        const res = await fetch(url, {
          headers: { "User-Agent": USER_AGENT, "Accept-Language": "de-DE,de;q=0.9" },
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        if (res.ok) return res;
        letzterFehler = new Error(`HTTP ${res.status} für ${url}`);
        if (res.status < 500 && res.status !== 429) break;
      } catch (e) {
        letzterFehler = e;
      }
      await warte(1000 * versuch);
    }
    throw letzterFehler instanceof Error ? letzterFehler : new Error(String(letzterFehler));
  }

  return {
    text: async (url) => (await hole(url)).text(),
    json: async <T>(url: string) => (await (await hole(url)).json()) as T,
  };
}
