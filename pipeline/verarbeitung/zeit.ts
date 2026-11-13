const ZEITZONE = "Europe/Berlin";

const MONATE: Record<string, number> = {
  jan: 1, feb: 2, mär: 3, mar: 3, apr: 4, mai: 5, jun: 6, jul: 7, aug: 8, sep: 9, okt: 10, nov: 11, dez: 12,
};

const zweistellig = (n: number) => String(n).padStart(2, "0");

function offsetBerlin(utcMillis: number): string {
  const teil = new Intl.DateTimeFormat("en-US", { timeZone: ZEITZONE, timeZoneName: "longOffset" })
    .formatToParts(new Date(utcMillis))
    .find((p) => p.type === "timeZoneName")?.value;
  const offset = teil?.replace("GMT", "") ?? "";
  return offset === "" ? "+00:00" : offset;
}

/** Wandelt eine lokale Berliner Uhrzeit in ISO 8601 mit passendem Offset (MEZ/MESZ) um. */
export function berlinZuIso(datum: string, zeit: string): string {
  const [stunde = "00", minute = "00", sekunde = "00"] = zeit.split(":");
  const [j, m, t] = datum.split("-").map(Number);
  const ungefaehr = Date.UTC(j ?? 1970, (m ?? 1) - 1, t ?? 1, Number(stunde), Number(minute));
  return `${datum}T${zweistellig(Number(stunde))}:${zweistellig(Number(minute))}:${zweistellig(Number(sekunde))}${offsetBerlin(ungefaehr)}`;
}

export function unixZuIso(sekunden: number): string {
  const d = new Date(sekunden * 1000);
  const teile = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: ZEITZONE, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    })
      .formatToParts(d)
      .map((p) => [p.type, p.value]),
  );
  return berlinZuIso(`${teile.year}-${teile.month}-${teile.day}`, `${teile.hour}:${teile.minute}`);
}

/**
 * Manche WordPress-Plugins speichern die lokale Wanduhrzeit als „UTC“-Zeitstempel
 * (10:00 Uhr Berlin → 10:00 UTC). Diese Funktion liest ihn entsprechend.
 */
export function wandzeitUnixZuIso(sekunden: number): string {
  const iso = new Date(sekunden * 1000).toISOString();
  return berlinZuIso(iso.slice(0, 10), iso.slice(11, 16));
}

/** Erkennt „23.02.2027“, „23. November 2026“ oder „1. Dez. 2026“ und liefert YYYY-MM-DD. */
export function parseDeutschesDatum(text: string): string | null {
  const numerisch = /(\d{1,2})\.(\d{1,2})\.(\d{4})/.exec(text);
  if (numerisch) return `${numerisch[3]}-${zweistellig(Number(numerisch[2]))}-${zweistellig(Number(numerisch[1]))}`;

  const ausgeschrieben = /(\d{1,2})\.?\s+([A-Za-zÄÖÜäöü]+)\.?\s+(\d{4})/.exec(text);
  if (ausgeschrieben) {
    const monat = MONATE[(ausgeschrieben[2] ?? "").slice(0, 3).toLowerCase()];
    if (monat) return `${ausgeschrieben[3]}-${zweistellig(monat)}-${zweistellig(Number(ausgeschrieben[1]))}`;
  }
  return null;
}
