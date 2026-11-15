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
import { AUGENFARBEN, beschreibe, farbName, FRISUREN, HAARFARBEN, HAUT, KLEIDERFARBEN, MUENDER, zufallsAussehen, type Aussehen } from "@/lib/eigene-figur";
import { useEigeneFigur } from "@/lib/eigene-figur-zustand";
import { vorlesen } from "@/lib/sprechen";
import { useKinderTexte } from "./texte";

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
  const t = useKinderTexte().figur;
  const n = (name: string) => farbName(name, sprache);
  const [entwurf, setEntwurf] = useState<Aussehen>(gespeichert);
  const setze = (teil: Partial<Aussehen>) => setEntwurf((vorher) => ({ ...vorher, ...teil }));
  const kleider = (titel: string, feld: "pulli" | "hose" | "schuh") =>
    KLEIDERFARBEN.map((k) => <Farbe key={k.wert} farbe={k.wert} name={`${titel}: ${n(k.name)}`} gewaehlt={entwurf[feld] === k.wert} onClick={() => setze({ [feld]: k.wert })} />);

  function fertig() {
    speichern(entwurf);
    onFertig();
  }

  return (
    <BottomSheet offen onSchliessen={onSchliessen} titel={t.titel}>
      <div className="fb">
        <div className="fb__vorschau">
          <KinderFigurBild art="eigen" entwurf={entwurf} className="fb__figur" />
          <p className="nur-screenreader" aria-live="polite">{beschreibe(entwurf, sprache)}</p>
        </div>

        <div className="fb__auswahl">
          <div className="fb__kopf">
            <h2>{t.ueberschrift}</h2>
            <button type="button" className="ui-vorlesen" aria-label={t.vorlesen} onClick={() => vorlesen(t.anleitung, sprache)}><Symbol name="volume" /></button>
          </div>

          <Reihe symbol={Hand} titel={t.haut}>
            {HAUT.map((h, i) => <Farbe key={h.name} farbe={h.farben[0]} name={`${t.haut}: ${n(h.name)}`} gewaehlt={entwurf.haut === i} onClick={() => setze({ haut: i })} />)}
          </Reihe>

          <Reihe symbol={Scissors} titel={t.frisur}>
            {FRISUREN.map((f) => (
              <button key={f.wert} type="button" className="fb-bild" aria-pressed={entwurf.frisur === f.wert} aria-label={`${t.frisur}: ${n(f.name)}`} onClick={() => setze({ frisur: f.wert })}>
                <KinderFigurBild art="eigen" entwurf={{ ...entwurf, frisur: f.wert }} ausschnitt="22 14 116 132" />
              </button>
            ))}
          </Reihe>

          <Reihe symbol={Palette} titel={t.haare}>
            {HAARFARBEN.map((h) => <Farbe key={h.wert} farbe={h.wert} name={`${t.haare}: ${n(h.name)}`} gewaehlt={entwurf.haar === h.wert} onClick={() => setze({ haar: h.wert })} />)}
          </Reihe>

          <Reihe symbol={Eye} titel={t.augen}>
            {AUGENFARBEN.map((a) => <Farbe key={a.wert} farbe={a.wert} name={`${t.augen}: ${n(a.name)}`} gewaehlt={entwurf.augen === a.wert} onClick={() => setze({ augen: a.wert })} />)}
          </Reihe>

          <Reihe symbol={Smile} titel={t.gesicht}>
            {MUENDER.map((m) => (
              <button key={m.wert} type="button" className="fb-bild" aria-pressed={entwurf.mund === m.wert} aria-label={`${t.gesicht}: ${n(m.name)}`} onClick={() => setze({ mund: m.wert })}>
                <KinderFigurBild art="eigen" entwurf={{ ...entwurf, mund: m.wert }} ausschnitt="46 56 68 54" />
              </button>
            ))}
          </Reihe>

          <Reihe symbol={Shirt} titel={t.pulli}>{kleider(t.pulli, "pulli")}</Reihe>
          <Reihe symbol={PersonStanding} titel={t.hose}>{kleider(t.hose, "hose")}</Reihe>
          <Reihe symbol={Footprints} titel={t.schuhe}>{kleider(t.schuhe, "schuh")}</Reihe>

          <Reihe symbol={Backpack} titel={t.tasche}>
            <button type="button" className="fb-farbe fb-farbe--keine" aria-pressed={entwurf.tasche === null} aria-label={t.keineTasche} onClick={() => setze({ tasche: null })}>
              <Ban className="symbol" strokeWidth={2.5} aria-hidden="true" />
            </button>
            {KLEIDERFARBEN.map((k) => <Farbe key={k.wert} farbe={k.wert} name={`${t.tasche}: ${n(k.name)}`} gewaehlt={entwurf.tasche === k.wert} onClick={() => setze({ tasche: k.wert })} />)}
          </Reihe>
        </div>

        <div className="fb__fuss">
          <Button variante="ghost" groesse="kids" onClick={() => setEntwurf(zufallsAussehen())} ariaLabel={t.zufaelligeFigur}>
            <span className="inline-flex items-center gap-2"><Dices className="symbol" strokeWidth={2} aria-hidden="true" /> {t.zufall}</span>
          </Button>
          <Button variante="primary" groesse="kids" icon="check" onClick={fertig}>{t.fertig}</Button>
        </div>
      </div>
    </BottomSheet>
  );
}
