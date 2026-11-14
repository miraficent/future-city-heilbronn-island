"use client";

/**
 * Karten-Dashboard für Kinder (DESIGN.md § Pages 2): Stadtansicht von Heilbronn, volle Breite.
 * Jedes Gebäude ist ein Link zu seiner Einrichtungsseite – die Figur läuft hin, dann geht es weiter.
 */
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell, Button, Owl, OwlGuide } from "@/components/ui";
import { BildKarte } from "@/components/kinderreise/bild-karte";
import type { KartenOrt, Pt } from "@/lib/kinderkarte";
import { BILD_START, bildOrte } from "@/lib/bildkarte";
import { istHeute, kartenFuerOrt, passtZumAlter, type KinderKarte } from "@/lib/kinderkarten";
import { useKinderAlter, useKinderFigur, useMinute } from "@/lib/kinder-zustand";
import { FIGUR_ARTEN, KinderFigurBild, figurLabel, type FigurArt } from "@/components/kinderreise/kinder-figuren";

const KINDER_ALTER = [6, 7, 8, 9, 10, 11, 12, 13, 14];
const LAUFZEIT_MS = 1200;

export function KartenSeite({ orte: kartenOrte, karten, geladen = true }: { orte: KartenOrt[]; karten: KinderKarte[]; geladen?: boolean }) {
  const router = useRouter();
  const orte = useMemo(() => bildOrte(kartenOrte), [kartenOrte]);
  const rahmen = useRef<HTMLDivElement>(null);
  // Karte ist größer als der Bildschirm – mittig starten
  useEffect(() => {
    const el = rahmen.current;
    if (!el) return;
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
  }, []);
  const [alter, setAlter] = useKinderAlter();
  const [figurArt, setFigurArt] = useKinderFigur<FigurArt>();
  const minute = useMinute();
  const [figur, setFigur] = useState<Pt>(BILD_START);
  const [gewaehlt, setGewaehlt] = useState<string | null>(null);
  const [euleOffen, setEuleOffen] = useState(true);

  // Kommende Karten für dieses Alter (ohne Uhrzeit/Alter beim ersten Rendern: alle)
  const passend = useMemo(
    () => karten.filter((k) => passtZumAlter(k, alter) && (minute === null || new Date(k.start).getTime() >= minute - 3 * 3_600_000)),
    [karten, alter, minute],
  );
  const zahlen = useMemo(() => Object.fromEntries(orte.map((o) => [o.id, kartenFuerOrt(passend, o.id).length])), [orte, passend]);
  const heute = useMemo(
    () => (minute === null ? new Set<string>() : new Set(passend.filter((k) => istHeute(k, new Date(minute))).map((k) => k.institutionId))),
    [passend, minute],
  );

  function laufeZu(id: string) {
    if (gewaehlt) return;
    const ort = orte.find((o) => o.id === id)!;
    setGewaehlt(id);
    setFigur([ort.x - 70, ort.y + 30]);
    const sanft = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => router.push(`/checkpoint/${id}/`), sanft ? LAUFZEIT_MS : 0);
  }

  const wochentag = minute === null ? null : new Date(minute).toLocaleDateString("de-DE", { weekday: "long", timeZone: "Europe/Berlin" });

  return (
    <AppShell modus="kinder" voll>
      <div className="kinder-karte" ref={rahmen}>
        <BildKarte
          orte={orte}
          zahlen={zahlen}
          heute={heute}
          aktiv={null}
          figur={figur}
          figurArt={figurArt ?? "lila"}
          geladen={geladen}
          gewaehlt={gewaehlt}
          onWaehle={laufeZu}
          onNeuerOrt={() => router.push("/mitmachen/")}
        />
        {!gewaehlt && !euleOffen && (
          <button type="button" className="kinder-karte__eule" aria-label="Eule öffnen" onClick={() => setEuleOffen(true)}>
            <Owl />
          </button>
        )}
        {!gewaehlt && euleOffen && (
          <div className="kinder-karte__guide">
            {alter === null ? (
              <OwlGuide text="Hallo! Ich bin die Eule. Wie alt bist du?" onSchliessen={() => setEuleOffen(false)}>
                {KINDER_ALTER.map((n) => (
                  <button key={n} type="button" className="kinder-alter" onClick={() => setAlter(n)}>{n}</button>
                ))}
              </OwlGuide>
            ) : figurArt === null ? (
              <OwlGuide text="Super! Wer bist du? Such dir eine Figur aus." onSchliessen={() => setEuleOffen(false)}>
                {FIGUR_ARTEN.map((art) => (
                  <button key={art} type="button" className="kinder-figurwahl" aria-label={figurLabel(art)} onClick={() => setFigurArt(art)}>
                    <KinderFigurBild art={art} />
                  </button>
                ))}
              </OwlGuide>
            ) : (
              <OwlGuide text={`Hey! Heute ist ${wochentag ?? "ein schöner Tag"}. Wohin willst du?`} onSchliessen={() => setEuleOffen(false)}>
                <Button variante="ghost" groesse="kids" icon="cake" onClick={() => setAlter(null)}>Alter ändern</Button>
                <Button variante="ghost" groesse="kids" icon="users" onClick={() => setFigurArt(null)}>Figur ändern</Button>
              </OwlGuide>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
