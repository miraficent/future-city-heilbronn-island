"use client";

import { useEffect, useState } from "react";
import { ALTERSGRUPPEN, lueckenRadar, topFehlt, type Zelle } from "@/lib/insights";
import { leererStand, type SignalStand } from "@/lib/signal-regeln.mjs";
import { ladeSignale } from "@/lib/signale-client";
import { Symbol } from "./symbol";

const THEMA_SYMBOL: Record<string, string> = { ki: "robot", coding: "code", gaming: "controller" };

/**
 * Angebot × Nachfrage je Thema und Altersgruppe. Die Angebotszahlen kommen aus den echten Kursdaten,
 * die Wünsche werden beim Öffnen frisch geladen (anonyme Zähler).
 */
export function EinblickeLive({ matrix, themen }: { matrix: Zelle[]; themen: Array<{ id: string; name: string }> }) {
  const [stand, setStand] = useState<SignalStand>(leererStand());
  const [quelle, setQuelle] = useState<"server" | "sitzung" | "laedt">("laedt");

  useEffect(() => {
    let aktiv = true;
    ladeSignale().then((r) => {
      if (!aktiv) return;
      setStand(r.stand);
      setQuelle(r.quelle);
    });
    return () => {
      aktiv = false;
    };
  }, []);

  const radar = lueckenRadar(matrix, stand);
  const maxAngebote = Math.max(1, ...radar.map((z) => z.angebote));
  const wuenscheGesamt = radar.reduce((s, z) => s + z.wuensche, 0);
  const luecken = radar.filter((z) => z.angebote === 0).length;
  const fehlt = topFehlt(stand);
  const maxFehlt = Math.max(1, ...fehlt.map((f) => f.anzahl));
  const themaName = (id: string) => themen.find((t) => t.id === id)?.name.split("&")[0]?.trim() ?? id;
  const gruppeName = (id: string) => ALTERSGRUPPEN.find((g) => g.id === id)?.name ?? id;
  // Wo am meisten gewünscht und am wenigsten angeboten wird – ohne Wünsche zählen die leeren Felder.
  const chancen = [...radar]
    .filter((z) => z.wuensche > 0 || z.angebote === 0)
    .sort((a, b) => b.wuensche / (b.angebote + 1) - a.wuensche / (a.angebote + 1) || a.angebote - b.angebote)
    .slice(0, 4);

  return (
    <>
      <section aria-labelledby="matrix-titel" className="einblick-karte">
        <div className="einblick-kopf">
          <div>
            <h2 id="matrix-titel">Angebot und Wünsche je Alter</h2>
            <p>Zahl = echte Angebote mit Termin. Schraffiert = keine Angebote. <Symbol name="bulb" className="einblick-inline" /> = anonyme Wünsche.</p>
          </div>
          <p className="einblick-kennzahlen">
            <span><strong>{luecken}</strong> {luecken === 1 ? "leeres Feld" : "leere Felder"}</span>
            <span><strong>{wuenscheGesamt}</strong> {wuenscheGesamt === 1 ? "Wunsch" : "Wünsche"}</span>
          </p>
        </div>
        <div className="einblick-tabelle-rahmen">
          <table className="einblick-tabelle">
            <caption className="sr-only">Angebote und Wünsche je Thema und Altersgruppe</caption>
            <thead>
              <tr>
                <th scope="col">Thema</th>
                {ALTERSGRUPPEN.map((g) => <th key={g.id} scope="col">{g.name} J.</th>)}
              </tr>
            </thead>
            <tbody>
              {themen.map((t) => (
                <tr key={t.id}>
                  <th scope="row"><Symbol name={THEMA_SYMBOL[t.id] ?? "star"} /> {themaName(t.id)}</th>
                  {ALTERSGRUPPEN.map((g) => {
                    const z = radar.find((x) => x.thema === t.id && x.gruppe === g.id)!;
                    const anteil = Math.round(12 + (z.angebote / maxAngebote) * 70);
                    const titel = `${themaName(t.id)}, ${g.name} Jahre: ${z.angebote} ${z.angebote === 1 ? "Angebot" : "Angebote"}, ${z.wuensche} ${z.wuensche === 1 ? "Wunsch" : "Wünsche"}`;
                    return (
                      <td key={g.id} title={titel} className={z.angebote === 0 ? "ist-luecke" : ""} style={z.angebote ? { ["--anteil" as string]: `${anteil}%`, color: anteil > 52 ? "#fff" : undefined } : undefined}>
                        <span className="einblick-zahl">{z.angebote}</span>
                        {z.angebote === 0 && <span className="einblick-luecke">Lücke</span>}
                        {z.wuensche > 0 && <span className="einblick-wunsch"><Symbol name="bulb" />{z.wuensche}</span>}
                        <span className="sr-only">{titel}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="einblick-raster">
        <section aria-labelledby="chancen-titel" className="einblick-karte">
          <h2 id="chancen-titel">Hier lohnt sich ein neues Angebot</h2>
          <p className="einblick-hinweis">{wuenscheGesamt ? "Viele Wünsche, wenig Angebot – zuerst oben." : "Noch keine Wünsche: Das sind die leeren Felder aus den Kursdaten."}</p>
          <ol className="einblick-chancen">
            {chancen.map((z) => (
              <li key={`${z.thema}${z.gruppe}`}>
                <Symbol name={THEMA_SYMBOL[z.thema] ?? "star"} />
                <span><strong>{themaName(z.thema)}</strong> für {gruppeName(z.gruppe)}-Jährige</span>
                <small>{z.angebote} {z.angebote === 1 ? "Angebot" : "Angebote"} · {z.wuensche} {z.wuensche === 1 ? "Wunsch" : "Wünsche"}</small>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="fehlt-titel" className="einblick-karte">
          <h2 id="fehlt-titel">Gesucht, aber nicht gefunden</h2>
          {fehlt.length ? (
            <ul className="einblick-balken">
              {fehlt.map((f) => (
                <li key={f.begriff} title={`„${f.begriff}“ wurde ${f.anzahl}-mal als fehlend gemeldet`}>
                  <span className="einblick-balken-name">{f.begriff}</span>
                  <span className="einblick-balken-spur"><span style={{ width: `${(f.anzahl / maxFehlt) * 100}%` }} /></span>
                  <strong>{f.anzahl}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="einblick-hinweis">Noch nichts gemeldet. Wer bei Teens oder Eltern etwas sucht und nichts findet, kann den Begriff mit einem Klick anonym melden.</p>
          )}
        </section>
      </div>

      <p className="einblick-quelle">
        {quelle === "laedt"
          ? "Wünsche werden geladen …"
          : quelle === "server"
            ? "Wünsche: anonyme Tageszähler vom Vorschau-Server (keine IP-Adressen, keine Kennungen)."
            : "Wünsche: In dieser Version ohne Server nur aus dieser Browsersitzung. Im Betrieb zählt ein kleiner Server dieselben anonymen Zähler."}
      </p>
    </>
  );
}
