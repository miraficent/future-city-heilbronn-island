"use client";

import { useEffect, useRef, useState } from "react";
import karte from "@/lib/heilbronn-karte.json";
import { Symbol } from "./symbol";

/*
 * 3D-Ansicht derselben lokalen OpenStreetMap-Daten wie die 2D-Karte. three.js wird erst geladen,
 * wenn diese Ansicht gezeigt wird. Eine Einheit entspricht zehn Metern; Norden liegt hinten.
 */

export type Ort3D = { id: string; name: string; farbe: string; x: number; y: number };
type Steuerung = { fokus: (id: string) => void; drehen: (grad: number) => void; zoomen: (faktor: number) => void; ganz: () => void };

const M = 10; // Meter pro Einheit
const BODEN = 6; // Dicke der Stadtplatte
type XY = [number, number];

/** Zerlegt einen Pfad aus M/L/Z-Befehlen in Linienzüge. */
function linienzuege(d: string): XY[][] {
  const zuege: XY[][] = [];
  for (const teil of d.split("M").slice(1)) {
    const zahlen = teil.replace(/Z/g, "").split(/[L\s]+/).filter(Boolean).map(Number);
    const punkte: XY[] = [];
    for (let i = 0; i + 1 < zahlen.length; i += 2) punkte.push([zahlen[i]! / M, zahlen[i + 1]! / M]);
    if (punkte.length > 1) zuege.push(punkte);
  }
  return zuege;
}

export function Karte3D({ orte, auswahl, waehle, fehler }: { orte: Ort3D[]; auswahl: string; waehle: (id: string) => void; fehler: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const steuerung = useRef<Steuerung | null>(null);
  const waehleRef = useRef(waehle);
  const fehlerRef = useRef(fehler);
  const auswahlRef = useRef(auswahl);
  const [geladen, setGeladen] = useState(false);

  useEffect(() => {
    waehleRef.current = waehle;
    fehlerRef.current = fehler;
  }, [waehle, fehler]);

  useEffect(() => {
    let abgebrochen = false;
    let aufraeumen = () => {};
    const el = box.current;
    if (!el) return;

    (async () => {
      const THREE = await import("three");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
      const { CSS2DRenderer, CSS2DObject } = await import("three/examples/jsm/renderers/CSS2DRenderer.js");
      if (abgebrochen) return;

      const reduziert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor("#cfe0e6");
      renderer.domElement.className = "k3d-canvas";
      renderer.domElement.setAttribute("aria-hidden", "true");
      el.prepend(renderer.domElement);

      const beschriftung = new CSS2DRenderer();
      beschriftung.domElement.className = "k3d-beschriftung";
      el.append(beschriftung.domElement);

      const szene = new THREE.Scene();
      szene.fog = new THREE.Fog("#cfe0e6", 1600, 3400);
      const kamera = new THREE.PerspectiveCamera(42, 1, 5, 6000);

      szene.add(new THREE.HemisphereLight("#fff8e6", "#8fa58a", 1.6));
      const sonne = new THREE.DirectionalLight("#fff1d6", 1.6);
      sonne.position.set(-600, 900, 400);
      szene.add(sonne);

      const flaeche = (d: string, hoehe: number, dicke: number, farbe: string, seite?: string) => {
        const formen = linienzuege(d).map((zug) => new THREE.Shape(zug.map(([x, y]) => new THREE.Vector2(x, -y))));
        const geo = new THREE.ExtrudeGeometry(formen, { depth: dicke, bevelEnabled: false });
        geo.rotateX(-Math.PI / 2);
        const mat = seite
          ? [new THREE.MeshLambertMaterial({ color: farbe }), new THREE.MeshLambertMaterial({ color: seite })]
          : new THREE.MeshLambertMaterial({ color: farbe });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = hoehe;
        szene.add(mesh);
        return mesh;
      };

      /** Breite Bänder für Fluss und Straßen – mehrere Linien in einer Geometrie. */
      const baender = (pfade: string[], breite: number, hoehe: number, farbe: string) => {
        const pos: number[] = [];
        for (const d of pfade)
          for (const zug of linienzuege(d))
            for (let i = 0; i + 1 < zug.length; i++) {
              const [ax, ay] = zug[i]!;
              const [bx, by] = zug[i + 1]!;
              const l = Math.hypot(bx - ax, by - ay) || 1;
              const nx = (-(by - ay) / l) * (breite / 2);
              const ny = ((bx - ax) / l) * (breite / 2);
              const ecken = [[ax + nx, ay + ny], [ax - nx, ay - ny], [bx + nx, by + ny], [bx - nx, by - ny]] as const;
              const [p1, p2, p3, p4] = ecken.map(([x, y]) => [x, hoehe, y]);
              pos.push(...p1!, ...p2!, ...p3!, ...p3!, ...p2!, ...p4!);
            }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        geo.computeVertexNormals();
        const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: farbe, side: THREE.DoubleSide }));
        szene.add(mesh);
        return mesh;
      };

      flaeche(karte.grenze, 0, BODEN, "#f4eedf", "#b8ab8c");
      karte.wald.forEach((d) => flaeche(d, BODEN, 7, "#9cc387", "#7aa36a"));
      karte.parks.forEach((d) => flaeche(d, BODEN + 0.05, 0.6, "#c4dfab"));
      karte.seen.forEach((d) => flaeche(d, BODEN + 0.1, 0.3, "#7eb9c2"));
      baender(karte.fluss, 9, BODEN + 0.25, "#6fb0bb");
      baender(karte.kanal, 4.5, BODEN + 0.25, "#6fb0bb");
      baender(karte.strassen, 0.8, BODEN + 0.35, "#fffaf0");
      baender(karte.hauptstrassen, 1.4, BODEN + 0.4, "#f2cf7e");
      baender(karte.bahn, 0.7, BODEN + 0.38, "#8d877c");
      baender(karte.autobahn, 2.6, BODEN + 0.45, "#ef9a55");

      // Stadtteilgrenzen als feine Linien
      const grenzPunkte: number[] = [];
      for (const t of karte.stadtteile)
        for (const zug of linienzuege(t.d))
          for (let i = 0; i + 1 < zug.length; i++) grenzPunkte.push(zug[i]![0], BODEN + 0.5, zug[i]![1], zug[i + 1]![0], BODEN + 0.5, zug[i + 1]![1]);
      const grenzGeo = new THREE.BufferGeometry();
      grenzGeo.setAttribute("position", new THREE.Float32BufferAttribute(grenzPunkte, 3));
      szene.add(new THREE.LineSegments(grenzGeo, new THREE.LineBasicMaterial({ color: "#a89c82" })));

      const etikett = (text: string, klasse: string, x: number, y: number, z: number) => {
        const span = document.createElement("span");
        span.className = klasse;
        span.textContent = text;
        const o = new CSS2DObject(span);
        o.position.set(x, y, z);
        szene.add(o);
        return o;
      };
      karte.stadtteile.forEach((t) => etikett(t.name, "k3d-stadtteil", t.mitte.x / M, BODEN + 2, t.mitte.y / M));
      etikett("Neckar", "k3d-wasser", karte.flussName.x / M, BODEN + 2, karte.flussName.y / M);
      for (const id of ["hauptbahnhof", "marktplatz"] as const) {
        const p = karte.orte[id];
        const saeule = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 14, 16), new THREE.MeshLambertMaterial({ color: "#4a4560" }));
        saeule.position.set(p.x / M, BODEN + 7, p.y / M);
        szene.add(saeule);
        etikett(id === "hauptbahnhof" ? "Hauptbahnhof" : "Marktplatz", "k3d-wahrzeichen", p.x / M, BODEN + 17, p.y / M);
      }

      // Die Lernorte: Stecknadeln an der echten Adresse, mit Schatten am Boden und Namensschild als Knopf.
      const nadeln = new Map<string, InstanceType<typeof THREE.Group>>();
      const ringe = new Map<string, InstanceType<typeof THREE.Mesh>>();
      const treffbar: InstanceType<typeof THREE.Mesh>[] = [];
      for (const o of orte) {
        const g = new THREE.Group();
        g.position.set(o.x / M, BODEN, o.y / M);
        const farbe = new THREE.MeshLambertMaterial({ color: o.farbe });
        const schatten = new THREE.Mesh(new THREE.CircleGeometry(7, 32), new THREE.MeshBasicMaterial({ color: "#1c1934", transparent: true, opacity: 0.22 }));
        schatten.rotation.x = -Math.PI / 2;
        schatten.position.y = 0.6;
        const stiel = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 0.4, 34, 12), new THREE.MeshLambertMaterial({ color: "#254950" }));
        stiel.position.y = 17;
        const kopf = new THREE.Mesh(new THREE.SphereGeometry(9, 32, 24), farbe);
        kopf.position.y = 40;
        const spitze = new THREE.Mesh(new THREE.ConeGeometry(6.4, 12, 24), farbe);
        spitze.position.y = 31;
        spitze.rotation.x = Math.PI;
        const ring = new THREE.Mesh(new THREE.TorusGeometry(13, 1.4, 12, 48), new THREE.MeshBasicMaterial({ color: o.farbe }));
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 1;
        ring.visible = false;
        for (const t of [kopf, spitze, stiel]) {
          t.userData.ort = o.id;
          treffbar.push(t);
        }
        g.add(schatten, stiel, spitze, kopf, ring);
        szene.add(g);
        nadeln.set(o.id, g);
        ringe.set(o.id, ring);

        const knopf = document.createElement("button");
        knopf.type = "button";
        knopf.className = "k3d-ort";
        knopf.style.setProperty("--ort-farbe", o.farbe);
        knopf.textContent = o.name;
        knopf.setAttribute("aria-label", `${o.name} auswählen`);
        knopf.addEventListener("click", () => waehleRef.current(o.id));
        const schild = new CSS2DObject(knopf);
        schild.position.set(0, 56, 0);
        g.add(schild);
      }

      const steuer = new OrbitControls(kamera, renderer.domElement);
      steuer.enableDamping = !reduziert;
      steuer.dampingFactor = 0.08;
      steuer.minDistance = 60;
      steuer.maxDistance = 2600;
      steuer.maxPolarAngle = 1.32;
      steuer.screenSpacePanning = false;
      steuer.listenToKeyEvents(el);
      steuer.keyPanSpeed = 22;

      const mitte = new THREE.Vector3(
        orte.reduce((a, o) => a + o.x, 0) / orte.length / M,
        BODEN,
        orte.reduce((a, o) => a + o.y, 0) / orte.length / M,
      );
      kamera.position.set(mitte.x - 110, 215, mitte.z + 245);
      steuer.target.copy(mitte);
      steuer.update();

      let flug: { von: InstanceType<typeof THREE.Vector3>; nach: InstanceType<typeof THREE.Vector3>; zielVon: InstanceType<typeof THREE.Vector3>; zielNach: InstanceType<typeof THREE.Vector3>; start: number; dauer: number } | null = null;
      const fliege = (ziel: InstanceType<typeof THREE.Vector3>, abstand: number) => {
        const richtung = kamera.position.clone().sub(steuer.target).normalize();
        if (richtung.y < 0.35) richtung.setY(0.55).normalize();
        flug = { von: kamera.position.clone(), nach: ziel.clone().add(richtung.multiplyScalar(abstand)), zielVon: steuer.target.clone(), zielNach: ziel.clone(), start: performance.now(), dauer: reduziert ? 1 : 1100 };
      };

      // Weit weg werden die vier Lernorte zu einem Schild zusammengefasst – sonst überlappen die Namen.
      const sammel = document.createElement("button");
      sammel.type = "button";
      sammel.className = "k3d-sammel";
      sammel.textContent = `${orte.length} Lernorte · näher heran`;
      sammel.addEventListener("click", () => fliege(mitte.clone(), 380));
      const sammelSchild = new CSS2DObject(sammel);
      sammelSchild.position.set(mitte.x, BODEN + 70, mitte.z);
      szene.add(sammelSchild);

      steuerung.current = {
        fokus: (id) => {
          const n = nadeln.get(id);
          if (n) fliege(n.position.clone().setY(BODEN + 18), 230);
        },
        drehen: (grad) => {
          const w = (grad * Math.PI) / 180;
          const v = kamera.position.clone().sub(steuer.target);
          v.applyAxisAngle(new THREE.Vector3(0, 1, 0), w);
          flug = { von: kamera.position.clone(), nach: steuer.target.clone().add(v), zielVon: steuer.target.clone(), zielNach: steuer.target.clone(), start: performance.now(), dauer: reduziert ? 1 : 500 };
        },
        zoomen: (faktor) => {
          const v = kamera.position.clone().sub(steuer.target);
          const l = Math.min(steuer.maxDistance, Math.max(steuer.minDistance, v.length() * faktor));
          flug = { von: kamera.position.clone(), nach: steuer.target.clone().add(v.setLength(l)), zielVon: steuer.target.clone(), zielNach: steuer.target.clone(), start: performance.now(), dauer: reduziert ? 1 : 400 };
        },
        ganz: () => fliege(new THREE.Vector3(karte.breite / M / 2, 0, karte.hoehe / M / 2), 1900),
      };

      const groesse = () => {
        const b = el.clientWidth;
        const h = el.clientHeight;
        if (!b || !h) return;
        renderer.setSize(b, h, false);
        beschriftung.setSize(b, h);
        kamera.aspect = b / h;
        kamera.updateProjectionMatrix();
      };
      const beobachter = new ResizeObserver(groesse);
      beobachter.observe(el);
      groesse();

      // Antippen einer Nadel wählt den Ort – aber nicht, wenn gerade gedreht wurde.
      const strahl = new THREE.Raycaster();
      let druck: { x: number; y: number } | null = null;
      const runter = (e: PointerEvent) => { druck = { x: e.clientX, y: e.clientY }; flug = null; };
      const hoch = (e: PointerEvent) => {
        if (!druck || Math.hypot(e.clientX - druck.x, e.clientY - druck.y) > 6) return;
        const r = renderer.domElement.getBoundingClientRect();
        strahl.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), kamera);
        const id = strahl.intersectObjects(treffbar, false)[0]?.object.userData.ort as string | undefined;
        if (id) waehleRef.current(id);
      };
      renderer.domElement.addEventListener("pointerdown", runter);
      renderer.domElement.addEventListener("pointerup", hoch);

      let rahmen = 0;
      const tick = (jetzt: number) => {
        rahmen = requestAnimationFrame(tick);
        if (flug) {
          const t = Math.min(1, (jetzt - flug.start) / flug.dauer);
          const e = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
          kamera.position.lerpVectors(flug.von, flug.nach, e);
          steuer.target.lerpVectors(flug.zielVon, flug.zielNach, e);
          if (t >= 1) flug = null;
        }
        const gewaehlt = auswahlRef.current;
        for (const [id, ring] of ringe) {
          ring.visible = id === gewaehlt;
          if (ring.visible && !reduziert) ring.rotation.z = jetzt / 900;
        }
        for (const [id, n] of nadeln) n.scale.setScalar(id === gewaehlt ? 1.25 : 1);
        steuer.update();
        const entfernung = kamera.position.distanceTo(steuer.target);
        el.classList.toggle("k3d-fern", entfernung > 900);
        el.classList.toggle("k3d-nah", entfernung < 420);
        renderer.render(szene, kamera);
        beschriftung.render(szene, kamera);
      };
      rahmen = requestAnimationFrame(tick);
      setGeladen(true);

      aufraeumen = () => {
        cancelAnimationFrame(rahmen);
        beobachter.disconnect();
        renderer.domElement.removeEventListener("pointerdown", runter);
        renderer.domElement.removeEventListener("pointerup", hoch);
        steuer.dispose();
        szene.traverse((o) => {
          const m = o as InstanceType<typeof THREE.Mesh>;
          m.geometry?.dispose?.();
          const mat = m.material as InstanceType<typeof THREE.Material> | InstanceType<typeof THREE.Material>[] | undefined;
          if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
          else mat?.dispose?.();
        });
        renderer.dispose();
        renderer.domElement.remove();
        beschriftung.domElement.remove();
        steuerung.current = null;
      };
    })().catch(() => fehlerRef.current());

    return () => {
      abgebrochen = true;
      aufraeumen();
    };
    // Die Szene wird einmal aufgebaut; Auswahl und Rückrufe laufen über Refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    auswahlRef.current = auswahl;
    if (auswahl) steuerung.current?.fokus(auswahl);
  }, [auswahl, geladen]);

  return (
    <div className="k3d">
      <div ref={box} className="k3d-flaeche" tabIndex={0} aria-label="3D-Karte von Heilbronn. Ziehen zum Drehen, Mausrad oder zwei Finger zum Zoomen, Pfeiltasten zum Verschieben.">
        {!geladen && <p className="k3d-laden">3D-Karte wird aufgebaut …</p>}
      </div>
      <div className="hn-steuerung k3d-steuerung">
        <button className="rund-knopf" onClick={() => steuerung.current?.zoomen(0.7)} aria-label="Näher heran"><Symbol name="plus" /></button>
        <button className="rund-knopf" onClick={() => steuerung.current?.zoomen(1.4)} aria-label="Weiter weg"><Symbol name="minus" /></button>
        <button className="rund-knopf" onClick={() => steuerung.current?.drehen(-45)} aria-label="Nach links drehen"><Symbol name="refresh" style={{ transform: "scaleX(-1)" }} /></button>
        <button className="rund-knopf" onClick={() => steuerung.current?.drehen(45)} aria-label="Nach rechts drehen"><Symbol name="refresh" /></button>
        <button className="rund-knopf" onClick={() => steuerung.current?.ganz()} aria-label="Ganz Heilbronn zeigen"><Symbol name="map" /></button>
      </div>
    </div>
  );
}

/** Prüft, ob dieses Gerät WebGL kann – sonst bleibt es bei der 2D-Karte. */
export function kann3D(): boolean {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}
