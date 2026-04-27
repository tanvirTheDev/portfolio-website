"use client";

/**
 * KineticTitle — Matter.js physics typography
 *
 * Each character of `text` becomes a rectangular rigid body that falls,
 * bounces, and can be grabbed / thrown by the user.
 *
 * This file is ALWAYS imported via next/dynamic with { ssr: false },
 * so a top-level Matter.js import is safe — it never runs on the server.
 */

import Matter from "matter-js";
import { useEffect, useRef, useState } from "react";
import styles from "@/styles/physics.module.css";

// ── Constants ──────────────────────────────────────────────────────────────
const DESKTOP_PX = 1024;
const PADDING = 10; // horizontal padding inside each letter body
const GAP = 6; // gap between adjacent letter bodies
const GRAVITY_Y = 1.5;
const RESTITUTION = 0.32;
const FRICTION = 0.08;
const FRICTION_AIR = 0.018;

// Colours (matching CSS vars — read as literals so canvas can use them)
const C_FG = "#F2F0E9";
const C_ACCENT = "#E8FF00";
const C_BOX = "rgba(242,240,233,0.10)";
const C_BOX_ACTIVE = "rgba(232,255,0,0.10)";
const C_BORDER = "rgba(242,240,233,0.14)";
const C_BORDER_ACTIVE = "#E8FF00";

// ── Types ──────────────────────────────────────────────────────────────────
interface LetterBody {
  body: Matter.Body;
  ch: string;
  bW: number; // body width  (physics)
  bH: number; // body height (physics)
}

interface Props {
  /** The name / word to render as physics bodies. Rendered uppercase. */
  text: string;
}

// ── Component ──────────────────────────────────────────────────────────────
export default function KineticTitle({ text }: Props) {
  // Initialise synchronously on client so there's no null/flash on first render
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth >= DESKTOP_PX;
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── Viewport watcher ────────────────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_PX}px)`);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ── Physics engine ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isDesktop) return;
    if (!containerRef.current || !canvasRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── Sizing ─────────────────────────────────────────────────────────────
    const W = container.offsetWidth;
    const H = container.offsetHeight;
    canvas.width = W;
    canvas.height = H;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;

    // Font size: 10vw clamped to [52, 120]
    const fontSize = Math.max(52, Math.min(120, W * 0.1));
    const fontStr = `800 ${fontSize}px "JetBrains Mono", monospace`;
    const chars = text.toUpperCase().split("");

    // ── Measure each character ─────────────────────────────────────────────
    ctx.font = fontStr;
    const bH = fontSize * 1.28; // body height — covers cap-height + descent

    const charMetrics = chars.map((ch) => ({
      ch,
      cw: Math.ceil(ctx.measureText(ch).width), // character advance width
    }));

    const totalW =
      charMetrics.reduce((acc, { cw }) => acc + cw + PADDING * 2, 0) +
      Math.max(0, chars.length - 1) * GAP;

    // ── Engine + World ─────────────────────────────────────────────────────
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: GRAVITY_Y },
    });
    const world = engine.world;

    // ── Letter bodies ──────────────────────────────────────────────────────
    let cx = (W - totalW) / 2;
    const letterBodies: LetterBody[] = charMetrics.map(({ ch, cw }) => {
      const bW = cw + PADDING * 2;
      const startX = cx + bW / 2;
      // Scatter Y slightly for a natural "drop" feel
      const startY = H * 0.12 + Math.random() * H * 0.1;
      cx += bW + GAP;

      const body = Matter.Bodies.rectangle(startX, startY, bW, bH, {
        label: ch,
        restitution: RESTITUTION,
        friction: FRICTION,
        frictionAir: FRICTION_AIR,
      });

      return { body, ch, bW, bH };
    });

    Matter.Composite.add(
      world,
      letterBodies.map((l) => l.body)
    );

    // ── Static boundaries ──────────────────────────────────────────────────
    const wallOpts: Matter.IBodyDefinition = {
      isStatic: true,
      friction: 0.5,
      restitution: 0.3,
      label: "wall",
    };
    Matter.Composite.add(world, [
      Matter.Bodies.rectangle(W / 2, H + 30, W + 200, 60, wallOpts), // floor
      Matter.Bodies.rectangle(-30, H / 2, 60, H * 3, wallOpts), // left wall
      Matter.Bodies.rectangle(W + 30, H / 2, 60, H * 3, wallOpts), // right wall
      Matter.Bodies.rectangle(W / 2, -30, W + 200, 60, wallOpts), // ceiling
    ]);

    // ── Manual drag (avoids Matter.Mouse wheel-event hijacking) ────────────
    let activeConstraint: Matter.Constraint | null = null;
    let activeBody: Matter.Body | null = null;
    let prevMX = 0;
    let prevMY = 0;
    let velMX = 0;
    let velMY = 0;

    const toCanvas = (clientX: number, clientY: number) => {
      const r = canvas.getBoundingClientRect();
      return { x: clientX - r.left, y: clientY - r.top };
    };

    const grab = (clientX: number, clientY: number) => {
      const { x, y } = toCanvas(clientX, clientY);
      const hit = Matter.Query.point(
        letterBodies.map((l) => l.body),
        { x, y }
      );
      if (!hit.length) return;

      const target = hit[0];
      const offset = {
        x: x - target.position.x,
        y: y - target.position.y,
      };
      activeConstraint = Matter.Constraint.create({
        bodyA: target,
        pointA: offset,
        pointB: { x, y },
        stiffness: 0.22,
        length: 0,
      });
      Matter.Composite.add(world, activeConstraint);
      activeBody = target;
      prevMX = x;
      prevMY = y;
      velMX = 0;
      velMY = 0;
    };

    const move = (clientX: number, clientY: number) => {
      const { x, y } = toCanvas(clientX, clientY);
      velMX = x - prevMX;
      velMY = y - prevMY;
      prevMX = x;
      prevMY = y;
      if (activeConstraint) {
        (activeConstraint as Matter.Constraint & { pointB: Matter.Vector }).pointB = { x, y };
      }
    };

    const release = () => {
      if (activeBody) {
        Matter.Body.setVelocity(activeBody, {
          x: velMX * 0.55,
          y: velMY * 0.55,
        });
      }
      if (activeConstraint) {
        Matter.Composite.remove(world, activeConstraint);
        activeConstraint = null;
      }
      activeBody = null;
    };

    // Mouse
    const onMD = (e: MouseEvent) => grab(e.clientX, e.clientY);
    const onMM = (e: MouseEvent) => move(e.clientX, e.clientY);
    const onMU = () => release();

    // Touch
    const onTS = (e: TouchEvent) => {
      e.preventDefault();
      grab(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTM = (e: TouchEvent) => {
      e.preventDefault();
      move(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTE = () => release();

    canvas.addEventListener("mousedown", onMD);
    window.addEventListener("mousemove", onMM);
    window.addEventListener("mouseup", onMU);
    canvas.addEventListener("touchstart", onTS, { passive: false });
    canvas.addEventListener("touchmove", onTM, { passive: false });
    canvas.addEventListener("touchend", onTE);

    // ── Render loop ────────────────────────────────────────────────────────
    let rafId = 0;
    let lastTime = performance.now();
    let destroyed = false;

    const drawFrame = (now: number) => {
      if (destroyed) return;

      const delta = Math.min(now - lastTime, 32); // cap at ~30 fps min
      lastTime = now;
      Matter.Engine.update(engine, delta);

      ctx.clearRect(0, 0, W, H);

      ctx.font = fontStr;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (const { body, ch, bW, bH } of letterBodies) {
        const { x, y } = body.position;
        const angle = body.angle;
        const dragging = body === activeBody;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Box fill + border
        ctx.fillStyle = dragging ? C_BOX_ACTIVE : C_BOX;
        ctx.strokeStyle = dragging ? C_BORDER_ACTIVE : C_BORDER;
        ctx.lineWidth = 1;
        ctx.fillRect(-bW / 2, -bH / 2, bW, bH);
        ctx.strokeRect(-bW / 2, -bH / 2, bW, bH);

        // Letter — offset up slightly so cap-height visually centres in box
        ctx.fillStyle = dragging ? C_ACCENT : C_FG;
        ctx.fillText(ch, 0, -bH * 0.04);

        ctx.restore();
      }

      rafId = requestAnimationFrame(drawFrame);
    };

    // Wait for fonts to load before starting (avoids wrong letter widths)
    document.fonts.ready.then(() => {
      if (!destroyed) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(drawFrame);
      }
    });

    // ── Cleanup ────────────────────────────────────────────────────────────
    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);

      canvas.removeEventListener("mousedown", onMD);
      window.removeEventListener("mousemove", onMM);
      window.removeEventListener("mouseup", onMU);
      canvas.removeEventListener("touchstart", onTS);
      canvas.removeEventListener("touchmove", onTM);
      canvas.removeEventListener("touchend", onTE);

      Matter.Engine.clear(engine);
      Matter.Composite.clear(world, false);
    };
  }, [isDesktop, text]);

  // ── Mobile / static fallback ───────────────────────────────────────────
  if (!isDesktop) {
    return (
      <div className={styles.staticTitle}>
        <div>
          <span className="slabel">001 / INDEX</span>
          <div>{text.toUpperCase()}</div>
        </div>
      </div>
    );
  }

  // ── Desktop physics stage ──────────────────────────────────────────────
  return (
    <div ref={containerRef} className={styles.stage} style={{ height: "52vh" }}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <span className={styles.hint}>DRAG / THROW / SCATTER ↑</span>
    </div>
  );
}
