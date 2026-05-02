/* eslint-disable react-hooks/immutability */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ─── Palette ─────────────────────────────────────────────────────────────── */
const BG = "#0a0a0a";
const FG = "#f2f0e9";
const ACCENT = "#e8ff00";
const DANGER = "#ff4d4d";

/* ─── Game constants ──────────────────────────────────────────────────────── */
const PLAYER_W = 26;
const PLAYER_H = 20;
const PLAYER_SPEED = 4.5;
const BULLET_W = 2;
const BULLET_H = 13;
const P_BULLET_SPD = 9;
const E_BULLET_SPD = 3;
const SHOOT_CD = 220;
const E_SHOT_BASE = 1400;
const COLS = 8;
const ROWS = 4;
const E_W = 50;
const E_H = 26;
const E_GAP_X = 14;
const E_GAP_Y = 18;
const INVINCE_MS = 1800;

const SYMBOLS = ["{}", "</>", "[]", "=>", "&&", "//", "??", "**"];

/* ─── Types ───────────────────────────────────────────────────────────────── */
type Phase = "idle" | "playing" | "gameover";

type Enemy = { x: number; y: number; sym: string; hp: number; alive: boolean };
type Bullet = { x: number; y: number; vy: number; friendly: boolean; active: boolean };
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
};

type GS = {
  px: number;
  py: number;
  lives: number;
  invince: number;
  score: number;
  wave: number;
  enemies: Enemy[];
  edir: 1 | -1;
  espeed: number;
  bullets: Bullet[];
  particles: Particle[];
  lastPlayerShot: number;
  lastEnemyShot: number;
  eShotInterval: number;
};

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function makeEnemies(wave: number, cw: number): Enemy[] {
  const totalW = COLS * E_W + (COLS - 1) * E_GAP_X;
  const startX = (cw - totalW) / 2;
  const enemies: Enemy[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      enemies.push({
        x: startX + c * (E_W + E_GAP_X),
        y: 60 + r * (E_H + E_GAP_Y),
        sym: SYMBOLS[(r * COLS + c) % SYMBOLS.length],
        hp: r === 0 ? 2 : 1,
        alive: true,
      });
    }
  }
  return enemies;
}

function initGS(wave: number, cw: number, ch: number, lives = 3, score = 0): GS {
  return {
    px: cw / 2,
    py: ch - 50,
    lives,
    invince: 0,
    score,
    wave,
    enemies: makeEnemies(wave, cw),
    edir: 1,
    espeed: 0.8 + (wave - 1) * 0.22,
    bullets: [],
    particles: [],
    lastPlayerShot: 0,
    lastEnemyShot: 0,
    eShotInterval: Math.max(550, E_SHOT_BASE - (wave - 1) * 150),
  };
}

function burst(gs: GS, x: number, y: number, color: string) {
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI * 2 * i) / 10 + Math.random() * 0.5;
    const spd = 1.5 + Math.random() * 2.5;
    gs.particles.push({
      x,
      y,
      vx: Math.cos(a) * spd,
      vy: Math.sin(a) * spd,
      life: 1,
      color,
      size: 1.5 + Math.random() * 2,
    });
  }
}

function drawShip(ctx: CanvasRenderingContext2D, x: number, y: number, invince: number) {
  const blink = invince > 0 && Math.sin(Date.now() / 80) > 0;
  ctx.save();
  ctx.globalAlpha = blink ? 0.25 : 1;
  ctx.strokeStyle = FG;
  ctx.fillStyle = "rgba(232,255,0,0.1)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y - PLAYER_H / 2);
  ctx.lineTo(x + PLAYER_W / 2, y + PLAYER_H / 2);
  ctx.lineTo(x - PLAYER_W / 2, y + PLAYER_H / 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Engine flicker
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 5, y + PLAYER_H / 2);
  ctx.lineTo(x, y + PLAYER_H / 2 + 4 + Math.sin(Date.now() / 60) * 2);
  ctx.lineTo(x + 5, y + PLAYER_H / 2);
  ctx.stroke();
  ctx.restore();
}

function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy) {
  if (!e.alive) return;
  ctx.save();
  ctx.strokeStyle = e.hp > 1 ? ACCENT : FG;
  ctx.globalAlpha = 0.75;
  ctx.lineWidth = 1;
  ctx.strokeRect(e.x, e.y, E_W, E_H);
  ctx.globalAlpha = 1;
  ctx.fillStyle = e.hp > 1 ? ACCENT : FG;
  ctx.font = `bold 11px "JetBrains Mono", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(e.sym, e.x + E_W / 2, e.y + E_H / 2);
  ctx.restore();
}

function drawGrid(ctx: CanvasRenderingContext2D, cw: number, ch: number) {
  ctx.strokeStyle = "rgba(34,34,34,0.55)";
  ctx.lineWidth = 0.5;
  const sz = 56;
  for (let gx = 0; gx < cw; gx += sz) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, ch);
    ctx.stroke();
  }
  for (let gy = 0; gy < ch; gy += sz) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(cw, gy);
    ctx.stroke();
  }
}

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function SpaceShooter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());
  const gsRef = useRef<GS | null>(null);
  const lastTimeRef = useRef<number>(0);
  const mountedRef = useRef(true);

  const [phase, setPhase] = useState<Phase>("idle");
  const [uiScore, setUiScore] = useState(0);
  const [uiWave, setUiWave] = useState(1);
  const [uiLives, setUiLives] = useState(3);
  const [finalScore, setFinalScore] = useState(0);
  const [finalWave, setFinalWave] = useState(1);

  const syncUI = useCallback((gs: GS) => {
    setUiScore(gs.score);
    setUiWave(gs.wave);
    setUiLives(gs.lives);
  }, []);

  const endGame = useCallback((gs: GS) => {
    setFinalScore(gs.score);
    setFinalWave(gs.wave);
    setPhase("gameover");
    cancelAnimationFrame(rafRef.current);
  }, []);

  const loop = useCallback(
    (now: number) => {
      if (!mountedRef.current) return;
      const canvas = canvasRef.current;
      const gs = gsRef.current;
      if (!canvas || !gs) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const cw = canvas.width;
      const ch = canvas.height;
      const dt = Math.min(now - lastTimeRef.current, 50);
      lastTimeRef.current = now;

      /* ── Player movement ── */
      const goL =
        keysRef.current.has("ArrowLeft") || keysRef.current.has("a") || keysRef.current.has("A");
      const goR =
        keysRef.current.has("ArrowRight") || keysRef.current.has("d") || keysRef.current.has("D");
      if (goL) gs.px = Math.max(PLAYER_W / 2, gs.px - PLAYER_SPEED);
      if (goR) gs.px = Math.min(cw - PLAYER_W / 2, gs.px + PLAYER_SPEED);

      /* ── Player shoot ── */
      const firing = keysRef.current.has(" ");
      if (firing && now - gs.lastPlayerShot > SHOOT_CD) {
        gs.bullets.push({
          x: gs.px,
          y: gs.py - PLAYER_H / 2,
          vy: -P_BULLET_SPD,
          friendly: true,
          active: true,
        });
        gs.lastPlayerShot = now;
      }

      /* ── Invincibility ── */
      if (gs.invince > 0) gs.invince -= dt;

      /* ── Enemy movement ── */
      const alive = gs.enemies.filter((e) => e.alive);

      if (alive.length === 0) {
        // Next wave
        const next = gs.wave + 1;
        gsRef.current = initGS(next, cw, ch, gs.lives, gs.score);
        syncUI(gsRef.current);
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      let minX = Infinity,
        maxX = -Infinity;
      for (const e of alive) {
        if (e.x < minX) minX = e.x;
        if (e.x + E_W > maxX) maxX = e.x + E_W;
      }
      const margin = 16;
      const hitWall =
        (gs.edir === 1 && maxX + gs.espeed >= cw - margin) ||
        (gs.edir === -1 && minX - gs.espeed <= margin);

      if (hitWall) {
        gs.edir = gs.edir === 1 ? -1 : 1;
        for (const e of gs.enemies) if (e.alive) e.y += 14;
      } else {
        for (const e of gs.enemies) if (e.alive) e.x += gs.espeed * gs.edir;
      }

      /* ── Enemies reach player ── */
      for (const e of alive) {
        if (e.y + E_H >= gs.py - PLAYER_H / 2) {
          endGame(gs);
          return;
        }
      }

      /* ── Enemy shoots ── */
      if (now - gs.lastEnemyShot > gs.eShotInterval && alive.length > 0) {
        const shooter = alive[Math.floor(Math.random() * alive.length)];
        gs.bullets.push({
          x: shooter.x + E_W / 2,
          y: shooter.y + E_H,
          vy: E_BULLET_SPD,
          friendly: false,
          active: true,
        });
        gs.lastEnemyShot = now;
      }

      /* ── Move bullets ── */
      for (const b of gs.bullets) {
        if (!b.active) continue;
        b.y += b.vy;
        if (b.y < -20 || b.y > ch + 20) b.active = false;
      }

      /* ── Player bullets hit enemies ── */
      for (const b of gs.bullets) {
        if (!b.active || !b.friendly) continue;
        for (const e of gs.enemies) {
          if (!e.alive) continue;
          if (b.x >= e.x && b.x <= e.x + E_W && b.y >= e.y && b.y <= e.y + E_H) {
            b.active = false;
            e.hp--;
            if (e.hp <= 0) {
              e.alive = false;
              gs.score += 10 * gs.wave;
              burst(gs, e.x + E_W / 2, e.y + E_H / 2, ACCENT);
            } else {
              burst(gs, e.x + E_W / 2, e.y + E_H / 2, FG);
            }
            break;
          }
        }
      }

      /* ── Enemy bullets hit player ── */
      if (gs.invince <= 0) {
        for (const b of gs.bullets) {
          if (!b.active || b.friendly) continue;
          const dx = b.x - gs.px;
          const dy = b.y - gs.py;
          if (Math.abs(dx) < PLAYER_W / 2 && Math.abs(dy) < PLAYER_H / 2) {
            b.active = false;
            gs.lives--;
            gs.invince = INVINCE_MS;
            burst(gs, gs.px, gs.py, DANGER);
            if (gs.lives <= 0) {
              endGame(gs);
              return;
            }
            break;
          }
        }
      }

      /* ── Update particles ── */
      for (const p of gs.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.life -= 0.035;
      }
      gs.particles = gs.particles.filter((p) => p.life > 0);
      gs.bullets = gs.bullets.filter((b) => b.active);

      syncUI(gs);

      /* ── Draw ─────────────────────────────────────────────────────────── */
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, cw, ch);

      drawGrid(ctx, cw, ch);

      for (const e of gs.enemies) drawEnemy(ctx, e);

      for (const b of gs.bullets) {
        ctx.fillStyle = b.friendly ? ACCENT : DANGER;
        ctx.globalAlpha = 0.9;
        ctx.fillRect(b.x - BULLET_W / 2, b.y - BULLET_H / 2, BULLET_W, BULLET_H);
        ctx.globalAlpha = 1;
      }

      for (const p of gs.particles) {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      drawShip(ctx, gs.px, gs.py, gs.invince);

      rafRef.current = requestAnimationFrame(loop);
    },
    [syncUI, endGame]
  );

  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    cancelAnimationFrame(rafRef.current);
    gsRef.current = initGS(1, canvas.width, canvas.height);
    syncUI(gsRef.current);
    setPhase("playing");
    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
  }, [loop, syncUI]);

  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  /* ─── Keyboard ────────────────────────────────────────────────────────── */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (e.key === " ") e.preventDefault();
      if ((e.key === " " || e.key === "Enter") && phase === "idle") startGame();
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [phase, startGame]);

  /* ─── Canvas resize ───────────────────────────────────────────────────── */
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      if (gsRef.current) gsRef.current.py = canvas.height - 50;
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  /* ─── Touch ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onTouch = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;
      const rect = canvas.getBoundingClientRect();
      const tx = touch.clientX - rect.left;
      const gs = gsRef.current;
      if (!gs) return;
      gs.px = Math.max(PLAYER_W / 2, Math.min(canvas.width - PLAYER_W / 2, tx));
      const now = performance.now();
      if (now - gs.lastPlayerShot > SHOOT_CD) {
        gs.bullets.push({
          x: gs.px,
          y: gs.py - PLAYER_H / 2,
          vy: -P_BULLET_SPD,
          friendly: true,
          active: true,
        });
        gs.lastPlayerShot = now;
      }
    };
    const onTouchStart = (e: TouchEvent) => {
      if (phase === "idle") {
        startGame();
        return;
      }
      onTouch(e);
    };
    canvas.addEventListener("touchmove", onTouch, { passive: false });
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    return () => {
      canvas.removeEventListener("touchmove", onTouch);
      canvas.removeEventListener("touchstart", onTouchStart);
    };
  }, [phase, startGame]);

  /* ─── Cleanup ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="shooter-wrap">
      <canvas ref={canvasRef} className="shooter-canvas" />

      {/* HUD */}
      {phase === "playing" && (
        <div className="shooter-hud">
          <span>WAVE {String(uiWave).padStart(2, "0")}</span>
          <span>SCORE {String(uiScore).padStart(6, "0")}</span>
          <span>
            {"▶".repeat(Math.max(0, uiLives))}
            {"◻".repeat(Math.max(0, 3 - uiLives))}
          </span>
        </div>
      )}

      {/* Idle */}
      {phase === "idle" && (
        <div className="shooter-overlay">
          <div className="shooter-screen">
            <p className="so-title">SPACE.SHOOTER</p>
            <p className="so-sub">— DEFEND THE CODEBASE —</p>
            <div className="so-sep" />
            <p className="so-line">ARROWS / WASD &nbsp;→&nbsp; MOVE</p>
            <p className="so-line">SPACE &nbsp;→&nbsp; FIRE</p>
            <p className="so-line so-line--dim">MOBILE: TOUCH TO MOVE + AUTO-FIRE</p>
            <div className="so-sep" />
            <button className="so-btn" onClick={startGame}>
              [ PRESS SPACE OR CLICK TO START ]
            </button>
          </div>
        </div>
      )}

      {/* Game Over */}
      {phase === "gameover" && (
        <div className="shooter-overlay">
          <div className="shooter-screen">
            <p className="so-title so-title--danger">GAME OVER</p>
            <div className="so-sep" />
            <p className="so-line">
              SCORE &nbsp;
              <span className="so-accent">{String(finalScore).padStart(6, "0")}</span>
            </p>
            <p className="so-line">
              WAVE REACHED &nbsp;<span className="so-accent">{finalWave}</span>
            </p>
            <div className="so-sep" />
            <div className="so-actions">
              <button className="so-btn" onClick={restartGame}>
                [ PLAY AGAIN ]
              </button>
              <Link href="/contact" className="so-btn so-btn--accent">
                [ HIRE ME → ]
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
