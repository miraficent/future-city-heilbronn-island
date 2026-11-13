import type { CSSProperties, ReactNode } from "react";

export function Symbol({ name, className = "", style }: { name: string; className?: string; style?: CSSProperties }) {
  const motive: Record<string, ReactNode> = {
    robot: <><path d="M12 3v3M9 3h6M5 10H3v7h2m14-7h2v7h-2M7 20h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z"/><circle cx="9" cy="11" r="1"/><circle cx="15" cy="11" r="1"/><path d="M9 16h6"/></>,
    controller: <><path d="M7 7h10c3 0 4 4 4 9 0 3-2 3-4 1l-2-2H9l-2 2c-2 2-4 2-4-1 0-5 1-9 4-9Z"/><path d="M8 9v5m-2.5-2.5h5M15 10h.01M18 13h.01"/></>,
    search: <><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></>,
    story: <><path d="M12 6c-3-3-7-3-10-2v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 2Zm0 0v15M5 8h3m-3 4h3m8-4h3m-3 4h3"/></>,
    tools: <><path d="m4 20 8-8m2-3 5-5M3 3l5 1 2 4-3 3-4-2-1-5m12 10 6 6 2-2-6-6"/></>,
    planet: <><circle cx="12" cy="12" r="7"/><ellipse cx="12" cy="12" rx="11" ry="3.5" transform="rotate(-25 12 12)"/></>,
    compass: <><circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5 5-3Z"/></>,
    backpack: <><path d="M8 6V4h8v2M6 20V9a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v11H6Z"/><path d="M9 13h6v4H9Zm-3-3H3v7h3m12-7h3v7h-3"/></>,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>,
    code: <><path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"/></>,
    rocket: <><path d="M8 16C5 7 14 2 22 2c0 8-5 17-14 14Zm0 0-3 3m2-10L2 10v5l5-1m8 3-1 5H9l1-5"/><circle cx="16" cy="8" r="2"/></>,
    volume: <><path d="m11 4-6 5H2v6h3l6 5V4Zm4 4c3 2 3 6 0 8m3-11c5 4 5 10 0 14"/></>,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6"/>,
    check: <path d="m5 12 4 4L20 5"/>,
    close: <path d="m6 6 12 12M6 18 18 6"/>,
    pause: <><path d="M7 5h3v14H7Zm7 0h3v14h-3Z"/></>,
    play: <path d="m7 4 13 8-13 8V4Z"/>,
    leaf: <><path d="M20 3C4 1 0 16 8 20c8 4 14-6 12-17ZM5 20l11-12m-6 6V9m0 5h5"/></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={`symbol ${className}`} style={style} aria-hidden="true" focusable="false">{motive[name] ?? motive.compass}</svg>;
}
