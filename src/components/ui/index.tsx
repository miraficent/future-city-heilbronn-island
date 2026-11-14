"use client";

/**
 * UI-Bausteine aus DESIGN.md § 5. Jede Seite nutzt nur diese Bausteine.
 * Farben nur über CSS-Variablen/Klassen (src/app/ui.css) – keine festen Farbwerte hier.
 * Eine Einrichtungsfarbe kommt aus den Daten und wird als --farbe übergeben.
 */
import Link from "next/link";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { Symbol } from "@/components/symbol";
import { vorlesen } from "@/lib/sprechen";

type Groesse = "kids" | "parents";
type Variante = "primary" | "accent" | "wish" | "ghost";

const farbVar = (farbe?: string): CSSProperties | undefined => (farbe ? ({ ["--farbe" as string]: farbe } as CSSProperties) : undefined);

// ---------- Button ----------

type ButtonProps = {
  children: ReactNode;
  variante?: Variante;
  groesse?: Groesse;
  icon?: string;
  href?: string;
  onClick?: () => void;
  ariaPressed?: boolean;
  ariaLabel?: string;
  className?: string;
  /** "submit" für Formulare */
  typ?: "button" | "submit";
};

export function Button({ children, variante = "primary", groesse = "parents", icon, href, onClick, ariaPressed, ariaLabel, className = "", typ = "button" }: ButtonProps) {
  const klasse = `ui-btn ui-btn--${variante} ui-btn--${groesse} ${className}`;
  const inhalt = (
    <>
      {icon && <Symbol name={icon} />}
      <span>{children}</span>
    </>
  );
  if (href) {
    const extern = href.startsWith("http");
    return (
      <Link href={href} className={klasse} aria-label={ariaLabel} {...(extern ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {inhalt}
      </Link>
    );
  }
  return (
    <button type={typ} className={klasse} onClick={onClick} aria-pressed={ariaPressed} aria-label={ariaLabel}>
      {inhalt}
    </button>
  );
}

// ---------- Card, Badge, Pill ----------

export function Card({ children, className = "", farbe }: { children: ReactNode; className?: string; farbe?: string }) {
  return <div className={`ui-card ${className}`} style={farbVar(farbe)}>{children}</div>;
}

export function Badge({ children, art = "soft", icon }: { children: ReactNode; art?: "soft" | "accent" | "free" | "demo" | "success"; icon?: string }) {
  return <span className={`ui-badge ui-badge--${art}`}>{icon && <Symbol name={icon} />}{children}</span>;
}

export function Pill({ children, farbe }: { children: ReactNode; farbe?: string }) {
  return <span className="ui-pill" style={farbVar(farbe)}>{children}</span>;
}

// ---------- Navigation ----------

export function BackButton({ href, children = "Zurück" }: { href: string; children?: ReactNode }) {
  return (
    <Link href={href} className="ui-back">
      <Symbol name="back" />
      <span>{children}</span>
    </Link>
  );
}

export function ModeSwitch({ aktiv }: { aktiv: "kinder" | "eltern" }) {
  return (
    <nav className="ui-mode" aria-label="Bereich wählen">
      <Link href="/kinder/" className="ui-mode__item" aria-current={aktiv === "kinder" ? "page" : undefined}>Kinder</Link>
      <Link href="/eltern/" className="ui-mode__item" aria-current={aktiv === "eltern" ? "page" : undefined}>Eltern</Link>
    </nav>
  );
}

/** Top-Leiste (night): Eulen-Logo + „Heilbronn Island“ + Bereichsumschalter */
export function AppShell({ children, modus, rechts, voll = false }: { children: ReactNode; modus: "kinder" | "eltern"; rechts?: ReactNode; voll?: boolean }) {
  return (
    <div className={`ui-shell ui-shell--${modus}${voll ? " ui-shell--voll" : ""}`}>
      <header className="ui-topbar">
        <Link href="/" className="ui-logo" aria-label="Heilbronn Island – Startseite">
          <Owl className="ui-logo__owl" />
          <span>Heilbronn Island</span>
        </Link>
        <div className="ui-topbar__rechts">
          {rechts}
          <ModeSwitch aktiv={modus} />
        </div>
      </header>
      <div className="ui-inhalt">{children}</div>
    </div>
  );
}

// ---------- Eule ----------

/** Unsere Eule – eigene flache Zeichnung (DESIGN.md: keine kopierten Figuren) */
export function Owl({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 130" className={`owl ${className}`} aria-hidden="true">
      <path className="owl-dunkel" d="M28 30 L38 6 L52 26 Z M92 30 L82 6 L68 26 Z" />
      <ellipse className="owl-koerper" cx={60} cy={70} rx={46} ry={52} />
      <ellipse className="owl-bauch" cx={60} cy={86} rx={28} ry={30} />
      <path className="owl-dunkel" d="M16 70 Q8 96 30 112 L34 78 Z M104 70 Q112 96 90 112 L86 78 Z" />
      <circle className="owl-auge" cx={42} cy={52} r={17} />
      <circle className="owl-auge" cx={78} cy={52} r={17} />
      <circle className="owl-pupille" cx={45} cy={54} r={8} />
      <circle className="owl-pupille" cx={75} cy={54} r={8} />
      <circle className="owl-glanz" cx={48} cy={50} r={2.5} />
      <circle className="owl-glanz" cx={78} cy={50} r={2.5} />
      <path className="owl-schnabel" d="M54 66 L66 66 L60 78 Z" />
      <path className="owl-schnabel" d="M44 120 h10 v6 h-10 Z M66 120 h10 v6 h-10 Z" />
    </svg>
  );
}

/** Eule mit Sprechblase und Vorlese-Knopf. Antworten (Knöpfe) als children. */
export function OwlGuide({ text, children, className = "" }: { text: string; children?: ReactNode; className?: string }) {
  return (
    <section className={`ui-guide ${className}`} aria-live="polite">
      <Owl className="ui-guide__owl" />
      <div className="ui-guide__blase">
        <p className="ui-guide__text">
          {text}
          <button type="button" className="ui-vorlesen" aria-label="Vorlesen" onClick={() => vorlesen(text)}>
            <Symbol name="volume" />
          </button>
        </p>
        {children && <div className="ui-guide__antworten">{children}</div>}
      </div>
    </section>
  );
}

// ---------- BottomSheet, EmptyState, Banner ----------

export function BottomSheet({ offen, onSchliessen, titel, children }: { offen: boolean; onSchliessen: () => void; titel: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!offen) return;
    const taste = (e: KeyboardEvent) => e.key === "Escape" && onSchliessen();
    window.addEventListener("keydown", taste);
    ref.current?.querySelector<HTMLElement>("button, a")?.focus();
    return () => window.removeEventListener("keydown", taste);
  }, [offen, onSchliessen]);
  if (!offen) return null;
  return (
    <div className="ui-sheet" role="dialog" aria-modal="true" aria-label={titel} onClick={(e) => e.target === e.currentTarget && onSchliessen()}>
      <div className="ui-sheet__panel" ref={ref}>
        <button type="button" className="ui-sheet__zu" aria-label="Schließen" onClick={onSchliessen}><Symbol name="close" /></button>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <div className="ui-empty">
      <Symbol name="compass" />
      <p>{text}</p>
      {children}
    </div>
  );
}

export function Banner({ titel, farbe, bild, children }: { titel: string; farbe: string; bild?: ReactNode; children?: ReactNode }) {
  return (
    <header className="ui-banner" style={farbVar(farbe)}>
      {bild && <div className="ui-banner__bild">{bild}</div>}
      <div>
        <h1 className="ui-banner__titel">{titel}</h1>
        {children}
      </div>
    </header>
  );
}

// ---------- Kinder: Kategorie und Angebotskarte ----------

export function CategoryBubble({ icon, label, anzahl, farbe, aktiv, onClick }: { icon: string; label: string; anzahl: number; farbe: string; aktiv: boolean; onClick: () => void }) {
  return (
    <button type="button" className="ui-cat" style={farbVar(farbe)} aria-pressed={aktiv} onClick={onClick}>
      <span className="ui-cat__rund">
        <Symbol name={icon} />
        <span className="ui-cat__zahl">{anzahl}</span>
      </span>
      <span className="ui-cat__label">{label}</span>
    </button>
  );
}

type EventCardProps = {
  titel: string;
  icon: string;
  farbe: string;
  wochentag: string;
  abends: boolean;
  alter: string;
  gratis: boolean;
  beispiel: boolean;
  gewuenscht: boolean;
  onClick: () => void;
};

export function EventCard({ titel, icon, farbe, wochentag, abends, alter, gratis, beispiel, gewuenscht, onClick }: EventCardProps) {
  return (
    <button type="button" className="ui-eventcard" style={farbVar(farbe)} onClick={onClick} aria-label={`${titel}, ${wochentag}, ${alter}${gratis ? ", gratis" : ""}`}>
      <span className="ui-eventcard__bild" aria-hidden="true">
        <Symbol name={icon} />
        {gewuenscht && <span className="ui-eventcard__wunsch"><Symbol name="heart" /></span>}
      </span>
      <span className="ui-eventcard__titel">{titel}</span>
      <span className="ui-eventcard__zeit">
        <Symbol name={abends ? "moon" : "sun"} className={abends ? "ist-abends" : "ist-tag"} /> {wochentag}
      </span>
      <span className="ui-eventcard__badges">
        <Badge>{alter}</Badge>
        {gratis && <Badge art="free">gratis</Badge>}
        {beispiel && <Badge art="demo">Beispiel</Badge>}
      </span>
    </button>
  );
}
