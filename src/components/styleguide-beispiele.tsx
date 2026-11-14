"use client";

/** Bausteine für den Styleguide – jede Variante einmal, damit alle sehen, wie sie aussehen. */
import { useState } from "react";
import { Badge, BackButton, Button, Card, CategoryBubble, EmptyState, EventCard, OwlGuide, Pill } from "./ui";

export function StyleguideBeispiele() {
  const [aktiv, setAktiv] = useState(true);
  return (
    <>
      <section>
        <h2 className="font-display text-2xl font-bold">Knöpfe</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variante="primary">Primary</Button>
          <Button variante="accent">Accent</Button>
          <Button variante="wish" icon="heart">Da will ich hin!</Button>
          <Button variante="ghost">Ghost</Button>
          <Button variante="primary" groesse="kids" icon="map">Kinder-Größe</Button>
          <BackButton href="/styleguide/">Zurück</BackButton>
        </div>
      </section>
      <section>
        <h2 className="font-display text-2xl font-bold">Abzeichen und Pillen</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Badge>ab 8</Badge>
          <Badge art="free">gratis</Badge>
          <Badge art="accent" icon="star">Heute!</Badge>
          <Badge art="demo">Beispiel</Badge>
          <Pill farbe="var(--primary)">aim</Pill>
        </div>
      </section>
      <section>
        <h2 className="font-display text-2xl font-bold">Kinder-Bausteine</h2>
        <div className="mt-4 flex flex-wrap items-start gap-6">
          <CategoryBubble icon="planet" label="Sterne & Weltall" anzahl={12} farbe="var(--primary)" aktiv={aktiv} onClick={() => setAktiv(!aktiv)} />
          <EventCard titel="Roboter bauen" icon="code" farbe="var(--primary)" wochentag="Samstag, 14:00" abends={false} alter="ab 8" gratis beispiel={false} gewuenscht onClick={() => {}} />
          <EventCard titel="Sterne gucken" icon="planet" farbe="var(--night)" wochentag="Freitag, 19:00" abends alter="ab 6" gratis={false} beispiel onClick={() => {}} gewuenscht={false} />
        </div>
        <div className="mt-6"><OwlGuide text="Hallo! Ich bin die Eule. Ich lese dir alles vor." /></div>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <Card><h3 className="font-display text-xl font-bold">Karte</h3><p>2px Rand, „chunky“ Unterkante, Radius 24px.</p></Card>
        <Card><EmptyState text="Hier ist gerade nichts – schau mal in einem anderen Haus!" /></Card>
      </section>
    </>
  );
}
