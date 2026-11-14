"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Symbol } from "./symbol";

/*
 * 3D-Einstieg der Startseite: eine schwebende Heilbronn-Insel. In vier Schritten sieht man, was im Hintergrund
 * passiert – von den Websites der Einrichtungen über die nächtliche Pipeline bis zu Kindern, Teens und Eltern.
 * three.js wird erst im Browser geladen. Ohne WebGL bleibt die Schritt-Erklärung als Text stehen.
 */

export type Start3DDaten = {
  gesamt: number;
  quellen: Array<{ id: string; name: string; farbe: string; anzahl: number }>;
  themen: Array<{ id: string; name: string; farbe: string; anzahl: number }>;
};

const SCHRITTE = [
  { titel: "Vier Lernorte", text: "aim, experimenta, Haus der Familie und IPAI veröffentlichen ihre Kurse auf ihren eigenen Websites – jede anders aufgebaut." },
  { titel: "Jede Nacht abholen", text: "Die COSMOS-Pipeline liest nachts die öffentlichen Kursseiten: Kurslisten, Kalender, eine Schnittstelle und eine Sitemap. Fällt eine Quelle aus, bleiben die letzten guten Daten." },
  { titel: "Einheitlich ordnen", text: "Jedes Angebot bekommt dieselben Felder: Thema (KI, Coding, Gaming), Alter, Termin, Preis und Ort. Unsichere Zuordnungen bleiben aus der öffentlichen Übersicht heraus." },
  { titel: "Für alle passend", text: "Daraus entstehen drei Wege: das Heilbronn-Abenteuer für Kinder, der Teen-Bereich und die Suche für Eltern. Anonyme Wünsche fließen zurück und zeigen, was fehlt." },
] as const;

const GEBAEUDE: Record<string, { x: number; z: number; form: "aim" | "experimenta" | "hdf" | "ipai" }> = {
  ipai: { x: -8.5, z: -4.5, form: "ipai" },
  aim: { x: -6, z: -0.8, form: "aim" },
  experimenta: { x: -7.4, z: 3.4, form: "experimenta" },
  hdf: { x: -3.6, z: 4.6, form: "hdf" },
};
const WEGE = [
  { id: "kind", name: "Kinder · Abenteuer", farbe: "#f08a4b", x: 9, z: -4 },
  { id: "teen", name: "Teens", farbe: "#8b6fd6", x: 10, z: 0.6 },
  { id: "eltern", name: "Eltern · Suche", farbe: "#2e9c9a", x: 9, z: 5 },
];

export function Start3D({ daten }: { daten: Start3DDaten }) {
  const box = useRef<HTMLDivElement>(null);
  const [schritt, setSchritt] = useState(0);
  const [auto, setAuto] = useState(true);
  const [kein3d, setKein3d] = useState(false);
  const schrittRef = useRef(0);

  useEffect(() => {
    schrittRef.current = schritt;
  }, [schritt]);

  useEffect(() => {
    if (!auto) return;
    const uhr = window.setInterval(() => setSchritt((s) => (s + 1) % SCHRITTE.length), 6500);
    return () => window.clearInterval(uhr);
  }, [auto]);

  useEffect(() => {
    let abgebrochen = false;
    let aufraeumen = () => {};
    const el = box.current;
    if (!el) return;
    (async () => {
      const THREE = await import("three");
      const { CSS2DRenderer, CSS2DObject } = await import("three/examples/jsm/renderers/CSS2DRenderer.js");
      if (abgebrochen) return;
      const ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.domElement.className = "s3d-canvas";
      renderer.domElement.setAttribute("aria-hidden", "true");
      el.prepend(renderer.domElement);
      const schilder = new CSS2DRenderer();
      schilder.domElement.className = "s3d-schilder";
      el.append(schilder.domElement);

      const szene = new THREE.Scene();
      const kamera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
      szene.add(new THREE.HemisphereLight("#fff6e0", "#7c9a8a", 1.5));
      const sonne = new THREE.DirectionalLight("#fff2d8", 2.2);
      sonne.position.set(-10, 18, 10);
      sonne.castShadow = true;
      sonne.shadow.mapSize.set(1024, 1024);
      Object.assign(sonne.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16 });
      szene.add(sonne);

      const mat = (farbe: string, extra: Partial<{ roughness: number; metalness: number; emissive: string; transparent: boolean; opacity: number }> = {}) =>
        new THREE.MeshStandardMaterial({ color: farbe, roughness: extra.roughness ?? 0.75, metalness: extra.metalness ?? 0, emissive: extra.emissive ?? "#000000", transparent: extra.transparent ?? false, opacity: extra.opacity ?? 1 });
      const schatten = (m: InstanceType<typeof THREE.Mesh>) => { m.castShadow = true; m.receiveShadow = true; return m; };

      // Insel mit Neckar
      const insel = schatten(new THREE.Mesh(new THREE.CylinderGeometry(14.5, 12.5, 1.6, 64), [mat("#b89a6c"), mat("#cfe3a8"), mat("#9a7d55")]));
      insel.position.y = -0.8;
      szene.add(insel);
      const neckarKurve = new THREE.CatmullRomCurve3([new THREE.Vector3(-2.5, 0.02, -14), new THREE.Vector3(-4.6, 0.02, -6), new THREE.Vector3(-1.6, 0.02, 0), new THREE.Vector3(-4.8, 0.02, 7), new THREE.Vector3(-2.8, 0.02, 14)]);
      const neckar = new THREE.Mesh(new THREE.TubeGeometry(neckarKurve, 80, 0.9, 8, false), mat("#7fc3d6", { roughness: 0.25, metalness: 0.1 }));
      neckar.scale.y = 0.08;
      szene.add(neckar);
      const schild = (titel: string, unter: string, klasse: string, p: InstanceType<typeof THREE.Vector3>) => {
        const d = document.createElement("div");
        d.className = klasse;
        const t = document.createElement("strong");
        t.textContent = titel;
        d.append(t);
        if (unter) {
          const u = document.createElement("span");
          u.textContent = unter;
          d.append(u);
        }
        const o = new CSS2DObject(d);
        o.position.copy(p);
        szene.add(o);
        return d;
      };
      schild("Neckar", "", "s3d-schild s3d-wasser", new THREE.Vector3(-3.4, 0.3, 9));

      // Die vier Lernorte – stark vereinfachte Bauformen
      const gebaeude: Record<string, InstanceType<typeof THREE.Group>> = {};
      for (const q of daten.quellen) {
        const g = GEBAEUDE[q.id];
        if (!g) continue;
        const grp = new THREE.Group();
        grp.position.set(g.x, 0, g.z);
        if (g.form === "experimenta") {
          [0, 1, 2].forEach((i) => {
            const k = schatten(new THREE.Mesh(new THREE.BoxGeometry(2.4 - i * 0.1, 0.9, 2), mat(i === 1 ? "#f1a35c" : "#e6eef2", { roughness: 0.3, metalness: 0.2 })));
            k.position.y = 0.45 + i * 0.92;
            k.rotation.y = i * 0.35;
            grp.add(k);
          });
        } else if (g.form === "aim") {
          const k = schatten(new THREE.Mesh(new THREE.BoxGeometry(3, 2, 1.6), mat("#e4c79f")));
          k.position.y = 1;
          const glas = schatten(new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.4, 1.7), mat("#9fd0e0", { roughness: 0.15, metalness: 0.3 })));
          glas.position.set(-0.9, 1.2, 0.05);
          grp.add(k, glas);
        } else if (g.form === "hdf") {
          const k = schatten(new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.5, 1.8), mat("#c9925a")));
          k.position.y = 0.75;
          const band = schatten(new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.18, 1.9), mat("#f4ecdc")));
          band.position.y = 0.8;
          grp.add(k, band);
        } else {
          const k = schatten(new THREE.Mesh(new THREE.BoxGeometry(2, 2.2, 2), mat("#7d858c")));
          k.position.y = 1.1;
          const gruen = schatten(new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.2, 2.05), mat("#6fae4f")));
          gruen.position.set(-0.85, 1.1, 0);
          grp.add(k, gruen);
        }
        szene.add(grp);
        gebaeude[q.id] = grp;
        schild(q.name, `${q.anzahl} Angebote`, "s3d-schild", new THREE.Vector3(g.x, 3.4, g.z));
      }

      // Pipeline in der Mitte
      const pipeline = new THREE.Group();
      pipeline.position.set(0.6, 0, 0);
      const sockel = schatten(new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.8, 0.6, 32), mat("#2b3f8f")));
      sockel.position.y = 0.3;
      const kern = schatten(new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 1), mat("#5b8ee0", { emissive: "#1d3a9a", roughness: 0.35 })));
      kern.position.y = 1.9;
      const ringe = [0, 1].map((i) => {
        const r = new THREE.Mesh(new THREE.TorusGeometry(1.7 + i * 0.35, 0.07, 12, 64), mat("#f4c430", { emissive: "#6a5200" }));
        r.position.y = 1.9;
        r.rotation.x = Math.PI / 2 + i * 0.5;
        pipeline.add(r);
        return r;
      });
      pipeline.add(sockel, kern);
      szene.add(pipeline);
      schild("COSMOS-Pipeline", "jede Nacht", "s3d-schild s3d-blau", new THREE.Vector3(0.6, 4, 0));

      // Themen-Planeten
      const planeten: Record<string, InstanceType<typeof THREE.Mesh>> = {};
      daten.themen.forEach((t, i) => {
        const p = schatten(new THREE.Mesh(new THREE.SphereGeometry(0.75 + Math.min(0.5, t.anzahl / 80), 32, 24), mat(t.farbe, { roughness: 0.5 })));
        p.position.set(4.6, 1.6 + (i % 2) * 0.5, -3.2 + i * 3.2);
        szene.add(p);
        planeten[t.id] = p;
        schild(t.name, String(t.anzahl), "s3d-schild", p.position.clone().add(new THREE.Vector3(0, 1.5, 0)));
      });

      // Drei Wege für die Nutzergruppen + Einblicke
      const ziele = WEGE.map((w) => {
        const sockelW = schatten(new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.05, 0.5, 32), mat(w.farbe)));
        sockelW.position.set(w.x, 0.25, w.z);
        szene.add(sockelW);
        schild(w.name, "", "s3d-schild", new THREE.Vector3(w.x, 1.4, w.z));
        return sockelW.position.clone().setY(0.7);
      });
      const einblicke = new THREE.Vector3(2.5, 0.6, 7.5);
      const lampe = schatten(new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 16), mat("#ffe08a", { emissive: "#8a6a00" })));
      lampe.position.copy(einblicke).setY(0.9);
      szene.add(lampe);
      schild("Einblicke", "anonyme Wünsche", "s3d-schild", new THREE.Vector3(2.5, 2, 7.5));

      // Datenströme als kleine Karten entlang von Kurven
      const bogen = (a: InstanceType<typeof THREE.Vector3>, b: InstanceType<typeof THREE.Vector3>, hoehe: number) =>
        new THREE.QuadraticBezierCurve3(a, a.clone().lerp(b, 0.5).setY(Math.max(a.y, b.y) + hoehe), b);
      const pipePunkt = new THREE.Vector3(0.6, 1.9, 0);
      const stroeme: Array<{ kurve: InstanceType<typeof THREE.QuadraticBezierCurve3>; schritt: number; farbe: string }> = [];
      for (const q of daten.quellen) {
        const g = gebaeude[q.id];
        if (g) stroeme.push({ kurve: bogen(g.position.clone().setY(2.2), pipePunkt, 2.5), schritt: 1, farbe: q.farbe });
      }
      for (const t of daten.themen) {
        const p = planeten[t.id];
        if (p) stroeme.push({ kurve: bogen(pipePunkt, p.position.clone(), 1.5), schritt: 2, farbe: t.farbe });
      }
      for (const t of daten.themen) for (const z of ziele) {
        const p = planeten[t.id];
        if (p) stroeme.push({ kurve: bogen(p.position.clone(), z, 1.2), schritt: 3, farbe: t.farbe });
      }
      for (const z of ziele) stroeme.push({ kurve: bogen(z, einblicke, 1.6), schritt: 3, farbe: "#ffe08a" });

      const karten = stroeme.flatMap((s, i) =>
        Array.from({ length: s.schritt === 3 ? 2 : 4 }, (_, n) => {
          const k = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.3), mat(s.farbe, { emissive: s.farbe, roughness: 0.4 }));
          (k.material as InstanceType<typeof THREE.MeshStandardMaterial>).emissiveIntensity = 0.35;
          szene.add(k);
          return { k, s, versatz: n / (s.schritt === 3 ? 2 : 4) + i * 0.07 };
        }),
      );

      const blicke = [
        { ziel: new THREE.Vector3(-5.5, 1, 0.5), pos: new THREE.Vector3(0, 11, 19) },
        { ziel: new THREE.Vector3(-2.5, 1.5, 0), pos: new THREE.Vector3(2, 10, 17) },
        { ziel: new THREE.Vector3(2.5, 1.5, 0), pos: new THREE.Vector3(5, 9, 16) },
        { ziel: new THREE.Vector3(1.5, 1, 0.5), pos: new THREE.Vector3(0, 15, 23) },
      ];
      const kamZiel = blicke[0]!.ziel.clone();
      const kamPos = blicke[0]!.pos.clone();
      kamera.position.copy(kamPos);

      const groesse = () => {
        const b = el.clientWidth;
        const h = el.clientHeight;
        if (!b || !h) return;
        renderer.setSize(b, h, false);
        schilder.setSize(b, h);
        kamera.aspect = b / h;
        kamera.fov = b < 640 ? 52 : 38;
        kamera.updateProjectionMatrix();
      };
      const beobachter = new ResizeObserver(groesse);
      beobachter.observe(el);
      groesse();

      let rahmenId = 0;
      let sichtbar = true;
      const sicht = new IntersectionObserver(([e]) => { sichtbar = Boolean(e?.isIntersecting); });
      sicht.observe(el);
      const start = performance.now();
      const tick = (jetzt: number) => {
        rahmenId = requestAnimationFrame(tick);
        if (!sichtbar) return;
        const t = (jetzt - start) / 1000;
        const s = schrittRef.current;
        const b = blicke[s] ?? blicke[0]!;
        const dreh = ruhig ? 0 : Math.sin(t * 0.15) * 1.6;
        kamPos.lerp(b.pos.clone().add(new THREE.Vector3(dreh, 0, 0)), ruhig ? 1 : 0.03);
        kamZiel.lerp(b.ziel, ruhig ? 1 : 0.04);
        kamera.position.copy(kamPos);
        kamera.lookAt(kamZiel);
        if (!ruhig) {
          kern.rotation.y = t * (s >= 1 ? 1.2 : 0.3);
          ringe.forEach((r, i) => (r.rotation.z = t * (i ? -0.8 : 0.6)));
          insel.position.y = -0.8 + Math.sin(t * 0.8) * 0.05;
          for (const [id, g] of Object.entries(gebaeude)) g.position.y = s === 0 ? Math.abs(Math.sin(t * 2 + id.length)) * 0.25 : 0;
          lampe.scale.setScalar(s === 3 ? 1 + Math.sin(t * 4) * 0.12 : 1);
        }
        for (const { k, s: strom, versatz } of karten) {
          const aktiv = strom.schritt === s || (s === 3 && strom.schritt >= 2 && strom.schritt <= 3);
          k.visible = aktiv;
          if (!aktiv) continue;
          const u = ruhig ? versatz % 1 : (t * 0.35 + versatz) % 1;
          k.position.copy(strom.kurve.getPointAt(u));
          k.rotation.y = t + versatz * 6;
        }
        renderer.render(szene, kamera);
        schilder.render(szene, kamera);
      };
      rahmenId = requestAnimationFrame(tick);

      aufraeumen = () => {
        cancelAnimationFrame(rahmenId);
        beobachter.disconnect();
        sicht.disconnect();
        szene.traverse((o) => {
          const m = o as InstanceType<typeof THREE.Mesh>;
          m.geometry?.dispose?.();
          const material = m.material as InstanceType<typeof THREE.Material> | InstanceType<typeof THREE.Material>[] | undefined;
          if (Array.isArray(material)) material.forEach((x) => x.dispose());
          else material?.dispose?.();
        });
        renderer.dispose();
        renderer.domElement.remove();
        schilder.domElement.remove();
      };
    })().catch(() => setKein3d(true));
    return () => {
      abgebrochen = true;
      aufraeumen();
    };
  }, [daten]);

  const aktuell = SCHRITTE[schritt]!;
  return (
    <section className="s3d" aria-labelledby="s3d-titel">
      <div className="s3d-text">
        <p className="s3d-kennung">COSMOS-Entdecker · Heilbronn</p>
        <h1 id="s3d-titel">Alle Lern­angebote zu KI, Coding und Gaming. An einem Ort.</h1>
        <p className="s3d-unterzeile">{daten.gesamt} echte Kurse von vier Heilbronner Lernorten – für Kinder als Abenteuer, für Teens zum Entdecken, für Eltern zum Finden.</p>
        <div className="s3d-knoepfe">
          <Link href="/kind/" className="s3d-knopf s3d-kind"><Symbol name="rocket" /> Kinder: Abenteuer starten</Link>
          <Link href="/teen/" className="s3d-knopf"><Symbol name="star" /> Teens</Link>
          <Link href="/eltern/" className="s3d-knopf"><Symbol name="search" /> Eltern: Kurs finden</Link>
        </div>
      </div>
      <div className="s3d-buehne">
        <div ref={box} className={`s3d-flaeche ${kein3d ? "ist-ohne" : ""}`} aria-hidden="true" />
        <div className="s3d-erklaerung">
          <p className="s3d-schritt-nr">So funktioniert es · Schritt {schritt + 1} von {SCHRITTE.length}</p>
          <h2 aria-live="polite">{aktuell.titel}</h2>
          <p>{aktuell.text}</p>
          <div className="s3d-punkte" role="group" aria-label="Schritte">
            {SCHRITTE.map((s, i) => (
              <button key={s.titel} type="button" aria-pressed={i === schritt} aria-label={`Schritt ${i + 1}: ${s.titel}`} onClick={() => { setAuto(false); setSchritt(i); }}>
                {i + 1}
              </button>
            ))}
            <button type="button" className="s3d-auto" aria-pressed={auto} onClick={() => setAuto(!auto)}>
              <Symbol name={auto ? "pause" : "play"} /> {auto ? "Anhalten" : "Abspielen"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
