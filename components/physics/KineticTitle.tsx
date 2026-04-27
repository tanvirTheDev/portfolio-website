"use client";

/**
 * KineticTitle — exact port of portfolio.html physics stage
 *
 * Letters spawn ABOVE the canvas and fall under gravity.
 * Drawn with glow shadow + accent stroke (no rectangles).
 * MouseConstraint drag (stiffness 0.25), cursor repulsion,
 * click-to-scatter, and a Three.js blueprint background.
 *
 * Always loaded via next/dynamic({ ssr: false }) — safe to
 * use top-level Matter / Three imports here.
 */

import Matter from "matter-js";
import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import styles from "@/styles/physics.module.css";

// ── Constants (match HTML exactly) ─────────────────────────────────────────
const DESKTOP_PX = 1024;

// Colours
const C_FG = "#F2F0E9";
const GLOW_COLOR = "#E8FF00";
const STROKE_COLOR = "rgba(232,255,0,.35)";

interface Props {
  text: string;
}

export default function KineticTitle({ text }: Props) {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth >= DESKTOP_PX;
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const glCanvasRef = useRef<HTMLCanvasElement>(null); // Three.js blueprint bg
  const phyCanvasRef = useRef<HTMLCanvasElement>(null); // Matter.js physics

  // ── Viewport watcher ─────────────────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_PX}px)`);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ── Three.js blueprint background ────────────────────────────────────────
  useEffect(() => {
    if (!isDesktop) return;
    const wrap = containerRef.current;
    const canvas = glCanvasRef.current;
    if (!wrap || !canvas) return;

    const W = wrap.offsetWidth;
    const H = wrap.offsetHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 0, 0);

    // Blueprint grid — XZ plane
    const gridGeo = new THREE.BufferGeometry();
    const lines: number[] = [];
    const N = 24;
    const SIZE = 20;
    for (let i = -N; i <= N; i++) {
      const t = (i / N) * SIZE;
      lines.push(-SIZE, 0, t, SIZE, 0, t);
      lines.push(t, 0, -SIZE, t, 0, SIZE);
    }
    gridGeo.setAttribute("position", new THREE.Float32BufferAttribute(lines, 3));
    const gridMat = new THREE.LineBasicMaterial({
      color: 0xe8ff00,
      transparent: true,
      opacity: 0.5,
    });
    scene.add(new THREE.LineSegments(gridGeo, gridMat));

    // Wireframe rotating box
    const boxGeo = new THREE.BoxGeometry(2.2, 2.2, 2.2);
    const boxEdge = new THREE.EdgesGeometry(boxGeo);
    const boxMat = new THREE.LineBasicMaterial({
      color: 0xe8ff00,
      transparent: true,
      opacity: 0.6,
    });
    const box = new THREE.LineSegments(boxEdge, boxMat);
    box.position.set(3, 0.5, 0);
    scene.add(box);

    let t = 0;
    let rafId = 0;
    let destroyed = false;

    function renderGL() {
      if (destroyed) return;
      t += 0.004;
      box.rotation.x = t * 0.4;
      box.rotation.y = t;
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(renderGL);
    }
    rafId = requestAnimationFrame(renderGL);

    const onResize = () => {
      const nW = wrap.offsetWidth;
      const nH = wrap.offsetHeight;
      renderer.setSize(nW, nH);
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      gridGeo.dispose();
      gridMat.dispose();
      boxGeo.dispose();
      boxEdge.dispose();
      boxMat.dispose();
    };
  }, [isDesktop]);

  // ── Matter.js physics ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isDesktop) return;
    const wrap = containerRef.current;
    const canvas = phyCanvasRef.current;
    if (!wrap || !canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Sizing (match HTML)
    const W = wrap.offsetWidth;
    const H = wrap.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    // Font size exactly like HTML: min(floor(W / 5.5), 110)
    const FS = Math.min(Math.floor(W / 5.5), 110);
    const font = `800 ${FS}px 'JetBrains Mono', monospace`;

    const NAME = text.toUpperCase();

    // Engine
    const engine = Matter.Engine.create({ gravity: { y: 1.3 } });
    const world = engine.world;

    // Measure widths
    ctx.font = font;
    const widths = [...NAME].map((ch) => ctx.measureText(ch).width);
    const totalW = widths.reduce((a, b) => a + b, 0);
    let xOff = (W - totalW) / 2;

    // Boundaries (match HTML)
    const floor = Matter.Bodies.rectangle(W / 2, H + 30, W * 3, 60, {
      isStatic: true,
      label: "wall",
    });
    const wallL = Matter.Bodies.rectangle(-30, H / 2, 60, H * 3, {
      isStatic: true,
      label: "wall",
    });
    const wallR = Matter.Bodies.rectangle(W + 30, H / 2, 60, H * 3, {
      isStatic: true,
      label: "wall",
    });
    Matter.World.add(world, [floor, wallL, wallR]);

    // Letter bodies — spawn ABOVE canvas (match HTML: by = -FS*1.8 - i*28)
    const bodies: Matter.Body[] = [];
    [...NAME].forEach((ch, i) => {
      const cw = widths[i];
      const bx = xOff + cw / 2;
      const by = -FS * 1.8 - i * 28; // above canvas — falls into view
      xOff += cw;

      if (ch === " ") return; // skip space — but x offset already advanced

      const b = Matter.Bodies.rectangle(bx, by, cw * 0.78, FS * 0.82, {
        restitution: 0.25,
        friction: 0.6,
        frictionAir: 0.018,
        label: ch,
        angle: (Math.random() - 0.5) * 0.4,
      });
      bodies.push(b);
      Matter.World.add(world, b);
    });

    // MouseConstraint for drag (stiffness 0.25 — match HTML)
    const mouse = Matter.Mouse.create(canvas);
    const mc = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.25, render: { visible: false } },
    });
    Matter.World.add(world, mc);

    // Remove wheel listener to prevent scroll hijacking
    (mouse.element as HTMLElement).removeEventListener(
      "mousewheel",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mouse as any).mousewheel
    );
    (mouse.element as HTMLElement).removeEventListener(
      "DOMMouseScroll",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mouse as any).mousewheel
    );

    // Cursor repulsion tracking
    let localMX = -9999;
    let localMY = -9999;
    const onMM = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      localMX = e.clientX - r.left;
      localMY = e.clientY - r.top;
    };
    const onML = () => {
      localMX = -9999;
      localMY = -9999;
    };
    canvas.addEventListener("mousemove", onMM);
    canvas.addEventListener("mouseleave", onML);

    // Click-to-scatter (match HTML)
    const onCK = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const ex = e.clientX - r.left;
      const ey = e.clientY - r.top;
      bodies.forEach((b) => {
        const dx = b.position.x - ex;
        const dy = b.position.y - ey;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = 0.008;
        Matter.Body.applyForce(b, b.position, {
          x: (dx / dist) * f,
          y: (dy / dist) * f - 0.002,
        });
      });
    };
    canvas.addEventListener("click", onCK);

    // Runner
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // Draw loop
    let rafId = 0;
    let destroyed = false;

    const draw = () => {
      if (destroyed) return;

      ctx.clearRect(0, 0, W, H);

      // Apply repulsion each frame (match HTML)
      bodies.forEach((b) => {
        const dx = b.position.x - localMX;
        const dy = b.position.y - localMY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130 && dist > 1) {
          const f = ((130 - dist) / 130) * 0.0028;
          Matter.Body.applyForce(b, b.position, {
            x: (dx / dist) * f,
            y: (dy / dist) * f,
          });
        }
      });

      // Draw each letter — glow + text + accent stroke (match HTML)
      ctx.font = font;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      bodies.forEach((b) => {
        ctx.save();
        ctx.translate(b.position.x, b.position.y);
        ctx.rotate(b.angle);

        // Glow shadow
        ctx.shadowColor = GLOW_COLOR;
        ctx.shadowBlur = 12;
        ctx.fillStyle = C_FG;
        ctx.fillText(b.label, 0, 0);

        // Accent stroke
        ctx.shadowBlur = 0;
        ctx.strokeStyle = STROKE_COLOR;
        ctx.lineWidth = 1;
        ctx.strokeText(b.label, 0, 0);

        ctx.restore();
      });

      rafId = requestAnimationFrame(draw);
    };

    // Wait for font before first frame
    document.fonts.ready.then(() => {
      if (!destroyed) rafId = requestAnimationFrame(draw);
    });

    // Resize
    const onResize = () => {
      const nW = wrap.offsetWidth;
      const nH = wrap.offsetHeight;
      canvas.width = nW;
      canvas.height = nH;
      Matter.Body.setPosition(floor, { x: nW / 2, y: nH + 30 });
      Matter.Body.setPosition(wallR, { x: nW + 30, y: nH / 2 });
    };
    window.addEventListener("resize", onResize);

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      canvas.removeEventListener("mousemove", onMM);
      canvas.removeEventListener("mouseleave", onML);
      canvas.removeEventListener("click", onCK);
      window.removeEventListener("resize", onResize);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
      Matter.Composite.clear(world, false);
    };
  }, [isDesktop, text]);

  // ── Mobile fallback ───────────────────────────────────────────────────────
  if (!isDesktop) {
    return (
      <div className={styles.staticTitle}>
        <span className="slabel">001 / INDEX</span>
        <div>{text.toUpperCase()}</div>
      </div>
    );
  }

  // ── Desktop physics stage ─────────────────────────────────────────────────
  return (
    <div ref={containerRef} className={styles.stage}>
      {/* Three.js blueprint grid + rotating box */}
      <canvas ref={glCanvasRef} className={styles.glCanvas} />
      {/* Matter.js physics letters */}
      <canvas ref={phyCanvasRef} className={styles.phyCanvas} />
      <span className={styles.hint}>DRAG / THROW / SCATTER ↑</span>
    </div>
  );
}
