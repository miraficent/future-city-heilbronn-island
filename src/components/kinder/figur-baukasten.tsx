"use client";

/**
 * Figuren-Baukasten für Kinder: Haut, Frisur, Haarfarbe, Augen, Gesicht, Pulli, Hose, Schuhe, Tasche.
 * Große Farbknöpfe (≥ 56 px), Symbole zuerst, kurze Wörter, Vorlesen. Nur feste Farblisten.
 * Gespeichert wird erst bei „Fertig!“ – und nur in der Browsersitzung (src/lib/eigene-figur-zustand.ts).
 */
import "@/app/figur.css";
import { useState, type CSSProperties, type ReactNode } from "react";
import { Backpack, Ban, Check, Dices, Eye, Footprints, Hand, Palette, PersonStanding, Scissors, Shirt, Smile, type LucideIcon } from "lucide-react";
import { KinderFigurBild } from "@/components/kinderreise/kinder-figuren";
import { Symbol } from "@/components/symbol";
import { BottomSheet, Button, useSprache } from "@/components/ui";
import { AUGENFARBEN, beschreibe, FRISUREN, HAARFARBEN, HAUT, KLEIDERFARBEN, MUENDER, zufallsAussehen, type Aussehen } from "@/lib/eigene-figur";
import { useEigeneFigur } from "@/lib/eigene-figur-zustand";
import { vorlesen } from "@/lib/sprechen";

const ANLEITUNG = "Bau dir deine Figur! Tippe auf die Farben. Dann auf Fertig.";

function Reihe({ symbol: Icon, titel, children }: { symbol: LucideIcon; titel: string; children: ReactNode }) {
  return (
    <fieldset className="fb-reihe">
      <legend><Icon className="symbol" strokeWidth={2} aria-hidden="true" />{titel}</legend>
      <div className="fb-reihe__wahl">{children}</div>
    </fieldset>
  );
}

function Farbe({ farbe, name, gewaehlt, onClick }: { farbe: string; name: string; gewaehlt: boolean; onClick: () => void }) {
  return (
    <button type="button" className="fb-farbe" style={{ ["--farbe" as string]: farbe } as CSSProperties} aria-pressed={gewaehlt} aria-label={name} onClick={onClick}>
      {gewaehlt && <Check className="symbol" strokeWidth={3} aria-hidden="true" />}
    </button>
  );
}

export function FigurBaukasten({ onSchliessen, onFertig }: { onSchliessen: () => void; onFertig: () => void }) {
  const [gespeichert, speichern] = useEigeneFigur();
  const sprache = useSprache();
  const [entwurf, setEntwurf] = useState<Aussehen>(gespeichert);
  const setze = (teil: Partial<Aussehen>) => setEntwurf((vorher) => ({ ...vorher, ...teil }));
  const kleider = (titel: string, feld: "pulli" | "hose" | "schuh") =>
    KLEIDERFARBEN.map((k) => <Farbe key={k.wert} farbe={k.wert} name={`${titel}: ${k.name}`} gewaehlt={entwurf[feld] === k.wert} onClick={() => setze({ [feld]: k.wert })} />);

  function fertig() {
    speichern(entwurf);
    onFertig();
  }

  return (
    <BottomSheet offen onSchliessen={onSchliessen} titel="Deine Figur bauen">
      <div className="fb">
        <div className="fb__vorschau">
          <KinderFigurBild art="eigen" entwurf={entwurf} className="fb__figur" />
          <p className="nur-screenreader" aria-live="polite">{beschreibe(entwurf)}</p>
        </div>

        <div className="fb__auswahl">
          <div className="fb__kopf">
            <h2>Bau dir deine Figur!</h2>
            <button type="button" className="ui-vorlesen" aria-label="Vorlesen" onClick={() => vorlesen(ANLEITUNG, sprache)}><Symbol name="volume" /></button>
          </div>

          <Reihe symbol={Hand} titel="Haut">
            {HAUT.map((h, i) => <Farbe key={h.name} farbe={h.farben[0]} name={`Haut: ${h.name}`} gewaehlt={entwurf.haut === i} onClick={() => setze({ haut: i })} />)}
          </Reihe>

          <Reihe symbol={Scissors} titel="Frisur">
            {FRISUREN.map((f) => (
              <button key={f.wert} type="button" className="fb-bild" aria-pressed={entwurf.frisur === f.wert} aria-label={`Frisur: ${f.name}`} onClick={() => setze({ frisur: f.wert })}>
                <KinderFigurBild art="eigen" entwurf={{ ...entwurf, frisur: f.wert }} ausschnitt="22 14 116 132" />
              </button>
            ))}
          </Reihe>

          <Reihe symbol={Palette} titel="Haare">
            {HAARFARBEN.map((h) => <Farbe key={h.wert} farbe={h.wert} name={`Haare: ${h.name}`} gewaehlt={entwurf.haar === h.wert} onClick={() => setze({ haar: h.wert })} />)}
          </Reihe>

          <Reihe symbol={Eye} titel="Augen">
            {AUGENFARBEN.map((a) => <Farbe key={a.wert} farbe={a.wert} name={`Augen: ${a.name}`} gewaehlt={entwurf.augen === a.wert} onClick={() => setze({ augen: a.wert })} />)}
          </Reihe>

          <Reihe symbol={Smile} titel="Gesicht">
            {MUENDER.map((m) => (
              <button key={m.wert} type="button" className="fb-bild" aria-pressed={entwurf.mund === m.wert} aria-label={`Gesicht: ${m.name}`} onClick={() => setze({ mund: m.wert })}>
                <KinderFigurBild art="eigen" entwurf={{ ...entwurf, mund: m.wert }} ausschnitt="46 56 68 54" />
              </button>
            ))}
          </Reihe>

          <Reihe symbol={Shirt} titel="Pulli">{kleider("Pulli", "pulli")}</Reihe>
          <Reihe symbol={PersonStanding} titel="Hose">{kleider("Hose", "hose")}</Reihe>
          <Reihe symbol={Footprints} titel="Schuhe">{kleider("Schuhe", "schuh")}</Reihe>

          <Reihe symbol={Backpack} titel="Tasche">
            <button type="button" className="fb-farbe fb-farbe--keine" aria-pressed={entwurf.tasche === null} aria-label="Keine Tasche" onClick={() => setze({ tasche: null })}>
              <Ban className="symbol" strokeWidth={2.5} aria-hidden="true" />
            </button>
            {KLEIDERFARBEN.map((k) => <Farbe key={k.wert} farbe={k.wert} name={`Tasche: ${k.name}`} gewaehlt={entwurf.tasche === k.wert} onClick={() => setze({ tasche: k.wert })} />)}
          </Reihe>
        </div>

        <div className="fb__fuss">
          <Button variante="ghost" groesse="kids" onClick={() => setEntwurf(zufallsAussehen())} ariaLabel="Zufällige Figur">
            <span className="inline-flex items-center gap-2"><Dices className="symbol" strokeWidth={2} aria-hidden="true" /> Zufall</span>
          </Button>
          <Button variante="primary" groesse="kids" icon="check" onClick={fertig}>Fertig!</Button>
        </div>
      </div>
    </BottomSheet>
  );
}
