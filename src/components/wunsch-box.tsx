"use client";

import Link from "next/link";
import { useState } from "react";
import type { Thema } from "@/lib/angebot";
import type { Gruppe } from "@/lib/signal-regeln.mjs";
import { altersgruppeFuer } from "@/lib/insights";
import { ladeSignale, sendeSignal } from "@/lib/signale-client";
import { Symbol } from "./symbol";

const THEMA_SYMBOL: Record<string, string> = { ki: "robot", coding: "code", gaming: "controller" };
const GRUPPEN_TEXT: Record<Gruppe, string> = { "6-8": "6–8", "9-11": "9–11", "12-14": "12–14", "15-17": "15–17", erwachsene: "Erwachsene" };

/**
 * „Was fehlt?“ – Teens und Eltern melden anonym einen Wunsch: Thema + Altersgruppe, optional ein Stichwort.
 * Kein Name, kein Konto. Die Kinder-Spielwelt sendet bewusst nichts.
 */
export function WunschBox({ themen, modus }: { themen: Thema[]; modus: "teen" | "eltern" }) {
  const gruppen: Gruppe[] = modus === "teen" ? ["12-14", "15-17"] : ["6-8", "9-11", "12-14", "15-17"];
  const [thema, setThema] = useState<string>("");
  const [gruppe, setGruppe] = useState<Gruppe | "">("");
  const [stichwort, setStichwort] = useState("");
  const [status, setStatus] = useState<"offen" | "sendet" | "danke">("offen");
  const [andere, setAndere] = useState<Array<{ name: string; anzahl: number }>>([]);
  const du = modus === "teen";

  async function abschicken() {
    if (!gruppe || (!thema && !stichwort.trim())) return;
    setStatus("sendet");
    if (thema) await sendeSignal({ art: "wunsch", thema, gruppe });
    if (stichwort.trim()) await sendeSignal({ art: "fehlt", begriff: stichwort, gruppe });
    const { stand } = await ladeSignale();
    setAndere(
      Object.entries(stand.wuensche)
        .map(([k, n]) => {
          const [t, g] = k.split("|");
          return { name: `${themen.find((x) => x.id === t)?.name.split("&")[0]?.trim() ?? t} · ${GRUPPEN_TEXT[g as Gruppe] ?? g}`, anzahl: n };
        })
        .sort((a, b) => b.anzahl - a.anzahl)
        .slice(0, 3),
    );
    setStatus("danke");
  }

  return (
    <section aria-labelledby="wunsch-titel" className="wunsch-box mt-12 rounded-3xl border-2 border-tinte bg-flaeche p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest">Anonym · ohne Konto · 10 Sekunden</p>
          <h2 id="wunsch-titel" className="mt-2 font-display text-2xl font-bold">{du ? "Was fehlt dir in Heilbronn?" : "Was fehlt Ihnen für Ihr Kind?"}</h2>
          <p className="mt-2 max-w-2xl text-sm text-tinte-2">
            {du ? "Sag uns, welches Thema du dir wünschst." : "Sagen Sie uns, welches Thema Sie sich wünschen."} Die Einrichtungen sehen nur Zähler: Thema, Altersgruppe und Tag –{" "}
            {du ? "nie deinen Namen oder dein Gerät." : "nie Namen oder Geräte."}
          </p>
        </div>
        <Link className="knopf bg-papier-2" href="/einblicke/"><Symbol name="search" /> Was andere vermissen</Link>
      </div>

      {status === "danke" ? (
        <div className="mt-6 rounded-2xl bg-papier-2 p-5" role="status">
          <p className="flex items-center gap-2 font-bold"><Symbol name="check" /> Danke! {du ? "Dein" : "Ihr"} Wunsch ist gezählt.</p>
          {andere.length > 0 && (
            <>
              <p className="mt-3 text-sm">Am häufigsten gewünscht:</p>
              <ol className="mt-2 space-y-1 text-sm">
                {andere.map((a) => (
                  <li key={a.name} className="flex justify-between gap-4 border-b border-linie py-1"><span>{a.name}</span><strong>{a.anzahl}×</strong></li>
                ))}
              </ol>
            </>
          )}
          <button className="mt-4 underline underline-offset-4" onClick={() => { setStatus("offen"); setThema(""); setStichwort(""); }}>Noch einen Wunsch</button>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
          <fieldset>
            <legend className="text-sm font-bold">1. Thema</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {themen.map((t) => (
                <button key={t.id} type="button" className="chip" aria-pressed={thema === t.id} onClick={() => setThema(thema === t.id ? "" : t.id)}>
                  <Symbol name={THEMA_SYMBOL[t.id] ?? "star"} /> {t.name.split("&")[0]?.trim()}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-bold">2. Alter{du ? "" : " des Kindes"}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {gruppen.map((g) => (
                <button key={g} type="button" className="chip" aria-pressed={gruppe === g} onClick={() => setGruppe(g)}>{GRUPPEN_TEXT[g]}</button>
              ))}
            </div>
          </fieldset>
          <label className="feld-label">
            3. Stichwort (freiwillig)
            <input value={stichwort} maxLength={40} onChange={(e) => setStichwort(e.target.value)} placeholder="z. B. Roblox, 3D-Druck, Drohnen" />
            <span className="mt-1 block text-xs font-normal text-tinte-2">Bitte keine Namen, Adressen oder Telefonnummern. Solche Angaben werden automatisch entfernt.</span>
          </label>
          <div className="lg:col-span-3">
            <button className="knopf knopf-primaer" disabled={!gruppe || (!thema && !stichwort.trim()) || status === "sendet"} onClick={abschicken}>
              {status === "sendet" ? "Wird gezählt …" : "Anonym abschicken"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

/** Bei einer Suche ohne Treffer: den Suchbegriff mit einem Klick als „fehlt“ melden. */
export function FehltMelden({ begriff, alter }: { begriff: string; alter?: number }) {
  const [gemeldet, setGemeldet] = useState(false);
  if (gemeldet) return <p className="mt-4 text-sm font-bold" role="status">Danke – gezählt. So sehen die Einrichtungen, was gesucht wird.</p>;
  return (
    <button
      className="knopf mt-4"
      onClick={async () => {
        const gruppe = alter === undefined ? undefined : alter >= 18 ? "erwachsene" : altersgruppeFuer(alter);
        await sendeSignal({ art: "fehlt", begriff, ...(gruppe ? { gruppe } : {}) });
        setGemeldet(true);
      }}
    >
      <Symbol name="bulb" /> „{begriff.trim().slice(0, 40)}“ fehlt mir – anonym melden
    </button>
  );
}
