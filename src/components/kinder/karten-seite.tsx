"use client";

/**
 * Karten-Dashboard für Kinder (DESIGN.md § Pages 2): Stadtansicht von Heilbronn, volle Breite.
 * Jedes Gebäude ist ein Link zu seiner Einrichtungsseite – die Figur läuft hin, dann geht es weiter.
 */
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell, Button, OwlGuide } from "@/components/ui";
import { BildKarte } from "@/components/kinderreise/bild-karte";
import type { KartenOrt, Pt } from "@/lib/kinderkarte";
import { BILD_START, bildOrte } from "@/lib/bildkarte";
import { istHeute, kartenFuerOrt, passtZumAlter, type KinderKarte } from "@/lib/kinderkarten";
import { useKinderAlter, useMinute } from "@/lib/kinder-zustand";

const KINDER_ALTER = [6, 7, 8, 9, 10, 11, 12, 13, 14];
const LAUFZEIT_MS = 1200;

export function KartenSeite({ orte: kartenOrte, karten }: { orte: KartenOrt[]; karten: KinderKarte[] }) {
  const router = useRouter();
  const orte = useMemo(() => bildOrte(kartenOrte), [kartenOrte]);
  const rahmen = useRef<HTMLDivElement>(null);
  // Handy: Karte ist breiter als der Bildschirm – mittig starten
  useEffect(() => {
    const el = rahmen.current;
    if (el) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, []);
  const [alter, setAlter] = useKinderAlter();
  const minute = useMinute();
  const [figur, setFigur] = useState<Pt>(BILD_START);
  const [gewaehlt, setGewaehlt] = useState<string | null>(null);

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
        <div className="kinder-karte__grund" aria-hidden="true" />
        <BildKarte
          orte={orte}
          zahlen={zahlen}
          heute={heute}
          aktiv={null}
          figur={figur}
          gewaehlt={gewaehlt}
          onWaehle={laufeZu}
          onNeuerOrt={() => router.push("/mitmachen/")}
        />
        {!gewaehlt && (
          <div className="kinder-karte__guide">
            {alter === null ? (
              <OwlGuide text="Hallo! Ich bin die Eule. Wie alt bist du?">
                {KINDER_ALTER.map((n) => (
                  <button key={n} type="button" className="kinder-alter" onClick={() => setAlter(n)}>{n}</button>
                ))}
              </OwlGuide>
            ) : (
              <OwlGuide text={`Hey! Heute ist ${wochentag ?? "ein schöner Tag"}. Wohin willst du?`}>
                <Button variante="ghost" groesse="kids" icon="cake" onClick={() => setAlter(null)}>Alter ändern</Button>
              </OwlGuide>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
