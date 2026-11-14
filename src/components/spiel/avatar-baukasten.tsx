"use client";
import { useState } from "react";
import { AUFDRUCKE, AUGEN, EXTRAS, FARBEN, FRISUREN, GESICHTER, HAAR, HAUT, OBERTEILE, SCHUHE, UNTERTEILE, VORLAGEN, zufallsAvatar, type AvatarKonfiguration } from "@/lib/avatar";
import { Avatar } from "./avatar";

type Kategorie = { id: string; name: string; teil?: keyof AvatarKonfiguration; namen?: readonly string[]; farbe?: { key: keyof AvatarKonfiguration; liste: string[]; name: string }; extra?: { teil: keyof AvatarKonfiguration; namen: readonly string[]; name: string } };

const KATEGORIEN: Kategorie[] = [
  { id: "gesicht", name: "Gesicht", teil: "gesicht", namen: GESICHTER, farbe: { key: "haut", liste: HAUT, name: "Hautfarbe" }, extra: { teil: "sommersprossen", namen: ["Ohne", "Sommersprossen"], name: "Extra" } },
  { id: "augen", name: "Augen", teil: "augen", namen: AUGEN },
  { id: "frisur", name: "Haare", teil: "frisur", namen: FRISUREN, farbe: { key: "haar", liste: HAAR, name: "Haarfarbe" } },
  { id: "oberteil", name: "Oberteil", teil: "oberteil", namen: OBERTEILE, farbe: { key: "oberfarbe", liste: FARBEN, name: "Farbe" }, extra: { teil: "aufdruck", namen: AUFDRUCKE, name: "Muster" } },
  { id: "unterteil", name: "Hose & Rock", teil: "unterteil", namen: UNTERTEILE, farbe: { key: "unterfarbe", liste: FARBEN, name: "Farbe" } },
  { id: "schuhe", name: "Schuhe", teil: "schuhe", namen: SCHUHE, farbe: { key: "schuhfarbe", liste: FARBEN, name: "Farbe" } },
  { id: "zubehoer", name: "Extras", teil: "zubehoer", namen: EXTRAS, farbe: { key: "zubehoerfarbe", liste: FARBEN, name: "Farbe" } },
];

export function AvatarBaukasten({ wert, aendern, fertig, zurueck }: { wert: AvatarKonfiguration; aendern: (a: AvatarKonfiguration) => void; fertig: () => void; zurueck: () => void }) {
  const [kategorie, setKategorie] = useState("frisur");
  const kat = KATEGORIEN.find((k) => k.id === kategorie) ?? KATEGORIEN[0]!;

  function farben(key: keyof AvatarKonfiguration, liste: string[], name: string) {
    return (
      <fieldset className="avatar-farben">
        <legend>{name}</legend>
        {liste.map((c, i) => (
          <button key={c} type="button" aria-label={`${name} ${i + 1}`} aria-pressed={wert[key] === i} style={{ background: c }} onClick={() => aendern({ ...wert, [key]: i })}>
            {wert[key] === i && <span aria-hidden="true">✓</span>}
          </button>
        ))}
      </fieldset>
    );
  }

  function optionen(teil: keyof AvatarKonfiguration, namen: readonly string[], name: string) {
    return (
      <fieldset className="avatar-optionen">
        <legend>{name}</legend>
        {namen.map((n, i) => (
          <button key={n} type="button" aria-pressed={wert[teil] === i} onClick={() => aendern({ ...wert, [teil]: i })}>
            <Avatar mini wert={{ ...wert, [teil]: i }} label="" />
            <span>{n}</span>
          </button>
        ))}
      </fieldset>
    );
  }

  return (
    <section className="avatar-baukasten" aria-labelledby="avatar-titel">
      <header>
        <p className="welt-augenbraue">DEIN ABENTEUER BEGINNT MIT DIR</p>
        <h1 id="avatar-titel">So sieht deine Figur aus.</h1>
        <p>Tippe, kombiniere und probier aus.</p>
      </header>
      <div className="baukasten-layout">
        <div className="avatar-vorschau">
          <Avatar wert={wert} className="winkt" />
          <button type="button" className="welt-knopf hell" onClick={() => aendern(zufallsAvatar())}>Überrasch mich</button>
        </div>
        <div className="baukasten-auswahl">
          <div className="avatar-vorlagen" aria-label="Schnellstart">
            <button type="button" className="welt-chip" onClick={() => aendern({ ...VORLAGEN.maedchen, haut: wert.haut })}>Mädchen</button>
            <button type="button" className="welt-chip" onClick={() => aendern({ ...VORLAGEN.junge, haut: wert.haut })}>Junge</button>
          </div>
          <nav className="avatar-kategorien" aria-label="Figur gestalten">
            {KATEGORIEN.map((k) => (
              <button key={k.id} type="button" aria-pressed={kategorie === k.id} onClick={() => setKategorie(k.id)}>{k.name}</button>
            ))}
          </nav>
          {kat.teil && kat.namen && optionen(kat.teil, kat.namen, `${kat.name} wählen`)}
          {kat.farbe && farben(kat.farbe.key, kat.farbe.liste, kat.farbe.name)}
          {kat.extra && optionen(kat.extra.teil, kat.extra.namen, kat.extra.name)}
          {kategorie === "unterteil" && OBERTEILE[wert.oberteil] === "Kleid" && <p className="avatar-frei">Zum Kleid passen Leggings. Rock und Hose bleiben dann weg.</p>}
          <p className="avatar-frei">Alles darf zusammenpassen. Du kannst deine Figur später ändern.</p>
        </div>
      </div>
      <footer className="welt-aktionen">
        <button type="button" className="welt-knopf hell" onClick={zurueck}>Zurück</button>
        <button type="button" className="welt-knopf" onClick={fertig}>Das bin ich. Weiter!</button>
      </footer>
    </section>
  );
}
