import { z } from "zod";
import type { Quelle, RohAngebot, Status } from "../../src/lib/angebot";
import type { Http } from "../http";
import { htmlZuText } from "../verarbeitung/text";
import { berlinZuIso } from "../verarbeitung/zeit";

const SEITENGROESSE = 100;
const MAX_SEITEN = 20;
const FAST_VOLL = 0.8;

/**
 * Whitelist der Felder, die wir aus der Kufer-API übernehmen. Alles andere – insbesondere
 * `dozenten` mit Namen und E-Mail-Adressen – wird beim Parsen verworfen.
 */
const KursSchema = z.object({
  knr: z.string(),
  haupttitel: z.string(),
  hauptuntertitel: z.string().nullish(),
  inhalt: z.string().nullish(),
  web_info: z.string().nullish(),
  internetaktiv: z.string().nullish(),
  online_kurstyp: z.string().nullish(),
  ort: z.string().nullish(),
  ortname: z.string().nullish(),
  gebnorm: z.string().nullish(),
  tnanmeldungen: z.string().nullish(),
  tnmax: z.string().nullish(),
  kurstyp: z.string().nullish(),
  termine: z
    .array(z.object({ tag: z.string(), zeitvon: z.string().nullish(), zeitbis: z.string().nullish(), termin_status: z.string().nullish() }))
    .nullish(),
  keywords: z.array(z.string()).nullish(),
  kategorien: z.record(z.string(), z.string()).nullish(),
  themen: z.record(z.string(), z.string()).nullish(),
});
type Kurs = z.infer<typeof KursSchema>;

/** Nachbau der slugify-Funktion der HdF-Website, damit unsere Links auf die echte Detailseite zeigen. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function status(kurs: Kurs): Status {
  const angemeldet = Number(kurs.tnanmeldungen);
  const max = Number(kurs.tnmax);
  if (!Number.isFinite(angemeldet) || !Number.isFinite(max) || max <= 0) return "unbekannt";
  if (angemeldet >= max) return "ausgebucht";
  if (angemeldet / max >= FAST_VOLL) return "wenige";
  return "frei";
}

function zuRoh(kurs: Kurs, basisUrl: string): RohAngebot {
  const termine = (kurs.termine ?? [])
    .filter((t) => !/ausfall/i.test(t.termin_status ?? ""))
    .map((t) => ({
      start: berlinZuIso(t.tag, t.zeitvon ?? "00:00"),
      ...(t.zeitbis ? { ende: berlinZuIso(t.tag, t.zeitbis) } : {}),
    }));
  const beschreibung = [kurs.hauptuntertitel, htmlZuText(kurs.web_info || kurs.inhalt || "")].filter(Boolean).join("\n");
  const betrag = kurs.gebnorm ? Number(kurs.gebnorm) : null;
  const online = /online/i.test(kurs.online_kurstyp ?? "") || /online/i.test(kurs.haupttitel);

  return {
    externeId: kurs.knr,
    titel: kurs.haupttitel.trim(),
    beschreibung,
    url: new URL(`/kurs/${slugify(kurs.haupttitel)}-${kurs.knr}/`, basisUrl).toString(),
    termine,
    ort: { name: kurs.ortname || "Haus der Familie", ...(kurs.ort ? { adresse: kurs.ort } : {}), online },
    kostenEuro: betrag !== null && Number.isFinite(betrag) ? betrag : null,
    status: status(kurs),
    quellTags: [
      ...Object.values(kurs.kategorien ?? {}),
      ...Object.values(kurs.themen ?? {}),
      ...(kurs.keywords ?? []),
      ...(kurs.kurstyp ? [kurs.kurstyp] : []),
    ],
    artHinweis: Object.values(kurs.themen ?? {}).some((t) => /ferien/i.test(t)) ? "Ferienprogramm" : "kurs",
  };
}

export function parseKuferWpApi(daten: unknown[], basisUrl: string): RohAngebot[] {
  const ergebnis: RohAngebot[] = [];
  for (const eintrag of daten) {
    const kurs = KursSchema.safeParse(eintrag);
    if (!kurs.success) continue;
    if (kurs.data.internetaktiv && kurs.data.internetaktiv !== "W") continue;
    ergebnis.push(zuRoh(kurs.data, basisUrl));
  }
  return ergebnis;
}

export async function ladeKuferWpApi(quelle: Quelle, http: Http): Promise<RohAngebot[]> {
  const endpunkt = quelle.startUrls[0];
  if (!endpunkt) throw new Error(`${quelle.id}: keine start_url für die Kufer-API`);
  const alle: unknown[] = [];
  for (let seite = 1; seite <= MAX_SEITEN; seite++) {
    const url = `${endpunkt}${endpunkt.includes("?") ? "&" : "?"}limit=${SEITENGROESSE}&page=${seite}`;
    const daten = await http.json<unknown>(url);
    if (!Array.isArray(daten) || daten.length === 0) break;
    alle.push(...daten);
  }
  return parseKuferWpApi(alle, quelle.website);
}
