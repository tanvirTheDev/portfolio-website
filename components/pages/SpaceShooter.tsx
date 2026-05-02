/* eslint-disable react-hooks/immutability */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ─── Palette ─────────────────────────────────────────────────────────────── */
const BG = "#0a0a0a";
const FG = "#f2f0e9";
const ACCENT = "#e8ff00";
const DANGER = "#ff4d4d";
const SHIELD_COL = "#00cfff";

/* ─── Config ──────────────────────────────────────────────────────────────── */
const PLAYER_W = 28;
const PLAYER_H = 22;
const PLAYER_SPEED = 5;
const BULLET_W = 3;
const BULLET_H = 14;
const P_BULLET_SPD = 10;
const E_BULLET_SPD = 3.2;
const SHOOT_CD = 200;
const E_SHOT_BASE = 1300;
const COLS = 8;
const ROWS = 4;
const E_W = 52;
const E_H = 28;
const E_GAP_X = 12;
const E_GAP_Y = 16;
const INVINCE_MS = 2000;
const STAR_COUNT = 120;
const HS_KEY = "shooter_hs_v1";

const SYMBOLS = ["{}", "</>", "[]", "=>", "&&", "//", "??", "**", "~~", "!!"];
const BOSS_SYMBOLS = ["</BOSS>", "{BOSS}", "[BOSS]"];

/* ─── Types ───────────────────────────────────────────────────────────────── */
type Phase = "idle" | "playing" | "gameover";
type PowerUpKind = "spread" | "shield" | "rapid";

type Enemy = {
  x: number;
  y: number;
  sym: string;
  hp: number;
  maxHp: number;
  alive: boolean;
  isBoss: boolean;
  points: number;
};
type Bullet = {
  x: number;
  y: number;
  vy: number;
  vx: number;
  friendly: boolean;
  active: boolean;
};
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
};
type PowerUp = {
  x: number;
  y: number;
  vy: number;
  kind: PowerUpKind;
  active: boolean;
};
type Star = { x: number; y: number; spd: number; size: number; alpha: number };

type GS = {
  px: number;
  py: number;
  lives: number;
  invince: number;
  score: number;
  wave: number;
  combo: number;
  comboTimer: number;
  shield: boolean;
  shieldTimer: number;
  rapidFire: boolean;
  rapidTimer: number;
  spread: boolean;
  spreadTimer: number;
  enemies: Enemy[];
  edir: 1 | -1;
  espeed: number;
  bullets: Bullet[];
  particles: Particle[];
  powerUps: PowerUp[];
  stars: Star[];
  lastPlayerShot: number;
  lastEnemyShot: number;
  eShotInterval: number;
  shake: number;
};

/* ─── Init helpers ────────────────────────────────────────────────────────── */
function makeStars(cw: number, ch: number): Star[] {
  return Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * cw,
    y: Math.random() * ch,
    spd: 0.4 + Math.random() * 1.4,
    size: Math.random() < 0.15 ? 2 : 1,
    alpha: 0.2 + Math.random() * 0.6,
  }));
}

function isBossWave(wave: number) {
  return wave % 5 === 0;
}

function makeEnemies(wave: number, cw: number): Enemy[] {
  if (isBossWave(wave)) {
    const bossHp = 8 + wave * 2;
    return [
      {
        x: cw / 2 - 60,
        y: 50,
        sym: BOSS_SYMBOLS[Math.floor(Math.random() * BOSS_SYMBOLS.length)],
        hp: bossHp,
        maxHp: bossHp,
        alive: true,
        isBoss: true,
        points: 500 * (wave / 5),
      },
    ];
  }
  const totalW = COLS * E_W + (COLS - 1) * E_GAP_X;
  const startX = (cw - totalW) / 2;
  const enemies: Enemy[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const hp = r === 0 ? 2 : 1;
      enemies.push({
        x: startX + c * (E_W + E_GAP_X),
        y: 56 + r * (E_H + E_GAP_Y),
        sym: SYMBOLS[(r * COLS + c) % SYMBOLS.length],
        hp,
        maxHp: hp,
        alive: true,
        isBoss: false,
        points: (ROWS - r) * 10,
      });
    }
  }
  return enemies;
}

function initGS(wave: number, cw: number, ch: number, lives = 3, score = 0): GS {
  return {
    px: cw / 2,
    py: ch - 56,
    lives,
    invince: 0,
    score,
    wave,
    combo: 0,
    comboTimer: 0,
    shield: false,
    shieldTimer: 0,
    rapidFire: false,
    rapidTimer: 0,
    spread: false,
    spreadTimer: 0,
    enemies: makeEnemies(wave, cw),
    edir: 1,
    espeed: isBossWave(wave) ? 0.6 : 0.7 + (wave - 1) * 0.2,
    bullets: [],
    particles: [],
    powerUps: [],
    stars: makeStars(cw, ch),
    lastPlayerShot: 0,
    lastEnemyShot: 0,
    eShotInterval: Math.max(500, E_SHOT_BASE - (wave - 1) * 120),
    shake: 0,
  };
}

/* ─── Burst ───────────────────────────────────────────────────────────────── */
function burst(gs: GS, x: number, y: number, color: string, count = 12) {
  for (let i = 0; i < count; i++) {
    const a = (Math.PI * 2 * i) / count + Math.random() * 0.6;
    const spd = 1.5 + Math.random() * 3;
    gs.particles.push({
      x,
      y,
      vx: Math.cos(a) * spd,
      vy: Math.sin(a) * spd,
      life: 1,
      color,
      size: 1.5 + Math.random() * 2.5,
    });
  }
}

/* ─── Audio ───────────────────────────────────────────────────────────────── */
let audioCtx: AudioContext | null = null;
function getAudio() {
  if (!audioCtx && typeof window !== "undefined") {
    audioCtx = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    )();
  }
  return audioCtx;
}
function beep(freq: number, dur: number, vol = 0.08, type: OscillatorType = "square") {
  try {
    const ctx = getAudio();
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.type = type;
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + dur);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.start();
    o.stop(ctx.currentTime + dur);
  } catch {}
}

/* ─── Draw helpers ────────────────────────────────────────────────────────── */
function drawShip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  invince: number,
  shielded: boolean
) {
  const blink = invince > 0 && Math.sin(Date.now() / 70) > 0;
  ctx.save();
  ctx.globalAlpha = blink ? 0.2 : 1;

  if (shielded) {
    ctx.strokeStyle = SHIELD_COL;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = blink ? 0.1 : 0.55 + Math.sin(Date.now() / 200) * 0.2;
    ctx.beginPath();
    ctx.arc(x, y, PLAYER_W, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = blink ? 0.2 : 1;
  }

  // Body
  ctx.strokeStyle = FG;
  ctx.fillStyle = "rgba(232,255,0,0.12)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y - PLAYER_H / 2);
  ctx.lineTo(x + PLAYER_W / 2, y + PLAYER_H / 2);
  ctx.lineTo(x, y + PLAYER_H / 4);
  ctx.lineTo(x - PLAYER_W / 2, y + PLAYER_H / 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Wing accents
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - PLAYER_W / 2 + 4, y + PLAYER_H / 2 - 4);
  ctx.lineTo(x - PLAYER_W / 4, y);
  ctx.moveTo(x + PLAYER_W / 2 - 4, y + PLAYER_H / 2 - 4);
  ctx.lineTo(x + PLAYER_W / 4, y);
  ctx.stroke();

  // Engine
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 6, y + PLAYER_H / 2);
  ctx.lineTo(x, y + PLAYER_H / 2 + 5 + Math.sin(Date.now() / 55) * 3);
  ctx.lineTo(x + 6, y + PLAYER_H / 2);
  ctx.stroke();

  ctx.restore();
}

function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy) {
  if (!e.alive) return;
  ctx.save();
  const w = e.isBoss ? 120 : E_W;
  const h = e.isBoss ? 56 : E_H;

  // HP bar for bosses
  if (e.isBoss && e.maxHp > 0) {
    const barW = w;
    const pct = e.hp / e.maxHp;
    ctx.fillStyle = "#333";
    ctx.fillRect(e.x, e.y - 10, barW, 5);
    ctx.fillStyle = pct > 0.5 ? ACCENT : DANGER;
    ctx.fillRect(e.x, e.y - 10, barW * pct, 5);
  }

  // Border — flickers on low HP
  const flicker = e.hp === 1 && Math.sin(Date.now() / 120) > 0;
  ctx.strokeStyle = e.isBoss ? ACCENT : e.hp > 1 ? FG : flicker ? DANGER : FG;
  ctx.globalAlpha = e.isBoss ? 0.9 : 0.7;
  ctx.lineWidth = e.isBoss ? 2 : 1;
  ctx.strokeRect(e.x, e.y, w, h);

  // Glow on boss
  if (e.isBoss) {
    ctx.shadowColor = ACCENT;
    ctx.shadowBlur = 12;
  }

  ctx.globalAlpha = 1;
  ctx.fillStyle = e.isBoss ? ACCENT : e.hp > 1 ? ACCENT : FG;
  ctx.font = `bold ${e.isBoss ? 15 : 11}px "JetBrains Mono", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowBlur = 0;
  ctx.fillText(e.sym, e.x + w / 2, e.y + h / 2);
  ctx.restore();
}

function drawPowerUp(ctx: CanvasRenderingContext2D, p: PowerUp) {
  if (!p.active) return;
  const colors: Record<PowerUpKind, string> = {
    spread: "#ff9f0a",
    shield: SHIELD_COL,
    rapid: ACCENT,
  };
  const labels: Record<PowerUpKind, string> = {
    spread: "SPR",
    shield: "SHD",
    rapid: "RFR",
  };
  ctx.save();
  ctx.strokeStyle = colors[p.kind];
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.9;
  ctx.strokeRect(p.x - 18, p.y - 10, 36, 20);
  ctx.fillStyle = colors[p.kind];
  ctx.font = `bold 9px "JetBrains Mono", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(labels[p.kind], p.x, p.y);
  ctx.restore();
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
  const [uiCombo, setUiCombo] = useState(0);
  const [uiShield, setUiShield] = useState(false);
  const [uiRapid, setUiRapid] = useState(false);
  const [uiSpread, setUiSpread] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalWave, setFinalWave] = useState(1);
  const [highScore, setHighScore] = useState(() => {
    if (typeof window === "undefined") return 0;
    try {
      return parseInt(localStorage.getItem(HS_KEY) ?? "0", 10);
    } catch {
      return 0;
    }
  });

  const syncUI = useCallback((gs: GS) => {
    setUiScore(gs.score);
    setUiWave(gs.wave);
    setUiLives(gs.lives);
    setUiCombo(gs.combo);
    setUiShield(gs.shield);
    setUiRapid(gs.rapidFire);
    setUiSpread(gs.spread);
  }, []);

  const endGame = useCallback((gs: GS) => {
    setFinalScore(gs.score);
    setFinalWave(gs.wave);
    setPhase("gameover");
    cancelAnimationFrame(rafRef.current);
    try {
      const prev = parseInt(localStorage.getItem(HS_KEY) ?? "0", 10);
      if (gs.score > prev) {
        localStorage.setItem(HS_KEY, String(gs.score));
        setHighScore(gs.score);
      }
    } catch {}
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
      const cd = gs.rapidFire ? SHOOT_CD / 2.5 : SHOOT_CD;
      if (keysRef.current.has(" ") && now - gs.lastPlayerShot > cd) {
        if (gs.spread) {
          for (const vx of [-2.5, 0, 2.5]) {
            gs.bullets.push({
              x: gs.px,
              y: gs.py - PLAYER_H / 2,
              vy: -P_BULLET_SPD,
              vx,
              friendly: true,
              active: true,
            });
          }
        } else {
          gs.bullets.push({
            x: gs.px,
            y: gs.py - PLAYER_H / 2,
            vy: -P_BULLET_SPD,
            vx: 0,
            friendly: true,
            active: true,
          });
        }
        gs.lastPlayerShot = now;
        beep(880, 0.04, 0.04, "square");
      }

      /* ── Timers ── */
      if (gs.invince > 0) gs.invince -= dt;
      if (gs.comboTimer > 0) {
        gs.comboTimer -= dt;
        if (gs.comboTimer <= 0) gs.combo = 0;
      }
      if (gs.shieldTimer > 0) {
        gs.shieldTimer -= dt;
        if (gs.shieldTimer <= 0) gs.shield = false;
      }
      if (gs.rapidTimer > 0) {
        gs.rapidTimer -= dt;
        if (gs.rapidTimer <= 0) gs.rapidFire = false;
      }
      if (gs.spreadTimer > 0) {
        gs.spreadTimer -= dt;
        if (gs.spreadTimer <= 0) gs.spread = false;
      }
      if (gs.shake > 0) gs.shake -= dt * 0.08;

      /* ── Stars (parallax) ── */
      for (const s of gs.stars) {
        s.y += s.spd;
        if (s.y > ch) {
          s.y = 0;
          s.x = Math.random() * cw;
        }
      }

      /* ── Enemy movement ── */
      const alive = gs.enemies.filter((e) => e.alive);

      if (alive.length === 0) {
        gsRef.current = initGS(gs.wave + 1, cw, ch, gs.lives, gs.score);
        syncUI(gsRef.current);
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      if (isBossWave(gs.wave)) {
        // Boss bounces left/right faster
        const boss = alive[0];
        boss.x += gs.espeed * 1.8 * gs.edir;
        const bw = 120;
        if (boss.x <= 0) {
          boss.x = 0;
          gs.edir = 1;
        }
        if (boss.x + bw >= cw) {
          boss.x = cw - bw;
          gs.edir = -1;
        }
      } else {
        let minX = Infinity,
          maxX = -Infinity;
        for (const e of alive) {
          if (e.x < minX) minX = e.x;
          if (e.x + E_W > maxX) maxX = e.x + E_W;
        }
        const hitWall =
          (gs.edir === 1 && maxX + gs.espeed >= cw - 14) ||
          (gs.edir === -1 && minX - gs.espeed <= 14);
        if (hitWall) {
          gs.edir = gs.edir === 1 ? -1 : 1;
          for (const e of gs.enemies) if (e.alive) e.y += 15;
        } else {
          for (const e of gs.enemies) if (e.alive) e.x += gs.espeed * gs.edir;
        }
      }

      /* ── Enemies reached bottom ── */
      for (const e of alive) {
        const h = e.isBoss ? 56 : E_H;
        if (e.y + h >= gs.py - PLAYER_H / 2) {
          endGame(gs);
          return;
        }
      }

      /* ── Enemy shoots ── */
      if (now - gs.lastEnemyShot > gs.eShotInterval && alive.length > 0) {
        const shooter = alive[Math.floor(Math.random() * alive.length)];
        const bw = shooter.isBoss ? 120 : E_W;
        const bh = shooter.isBoss ? 56 : E_H;
        if (isBossWave(gs.wave)) {
          // Boss fires 3-shot spread
          for (const vx of [-1.5, 0, 1.5]) {
            gs.bullets.push({
              x: shooter.x + bw / 2,
              y: shooter.y + bh,
              vy: E_BULLET_SPD,
              vx,
              friendly: false,
              active: true,
            });
          }
        } else {
          gs.bullets.push({
            x: shooter.x + bw / 2,
            y: shooter.y + bh,
            vy: E_BULLET_SPD,
            vx: 0,
            friendly: false,
            active: true,
          });
        }
        gs.lastEnemyShot = now;
        beep(120, 0.08, 0.03, "sawtooth");
      }

      /* ── Move bullets ── */
      for (const b of gs.bullets) {
        if (!b.active) continue;
        b.x += b.vx;
        b.y += b.vy;
        if (b.y < -20 || b.y > ch + 20 || b.x < -20 || b.x > cw + 20) b.active = false;
      }

      /* ── Power-ups ── */
      for (const p of gs.powerUps) {
        if (!p.active) continue;
        p.y += p.vy;
        if (p.y > ch) {
          p.active = false;
          continue;
        }
        const dx = p.x - gs.px,
          dy = p.y - gs.py;
        if (Math.abs(dx) < 24 && Math.abs(dy) < 18) {
          p.active = false;
          if (p.kind === "shield") {
            gs.shield = true;
            gs.shieldTimer = 8000;
          }
          if (p.kind === "rapid") {
            gs.rapidFire = true;
            gs.rapidTimer = 6000;
          }
          if (p.kind === "spread") {
            gs.spread = true;
            gs.spreadTimer = 8000;
          }
          beep(660, 0.12, 0.06, "sine");
        }
      }
      gs.powerUps = gs.powerUps.filter((p) => p.active);

      /* ── Player bullets hit enemies ── */
      for (const b of gs.bullets) {
        if (!b.active || !b.friendly) continue;
        for (const e of gs.enemies) {
          if (!e.alive) continue;
          const ew = e.isBoss ? 120 : E_W;
          const eh = e.isBoss ? 56 : E_H;
          if (b.x >= e.x && b.x <= e.x + ew && b.y >= e.y && b.y <= e.y + eh) {
            b.active = false;
            e.hp--;
            if (e.hp <= 0) {
              e.alive = false;
              gs.combo++;
              gs.comboTimer = 1800;
              const bonus = gs.combo > 1 ? gs.combo : 1;
              gs.score += e.points * bonus;
              const cnt = e.isBoss ? 24 : 12;
              burst(gs, e.x + ew / 2, e.y + eh / 2, e.isBoss ? DANGER : ACCENT, cnt);
              if (e.isBoss) {
                beep(80, 0.4, 0.08, "sawtooth");
                gs.shake = 12;
              } else {
                beep(440, 0.06, 0.05);
              }
              // Drop power-up (~25% chance, 50% for boss)
              const roll = Math.random();
              const dropChance = e.isBoss ? 0.5 : 0.22;
              if (roll < dropChance) {
                const kinds: PowerUpKind[] = ["spread", "shield", "rapid"];
                gs.powerUps.push({
                  x: e.x + ew / 2,
                  y: e.y + eh / 2,
                  vy: 1.8,
                  kind: kinds[Math.floor(Math.random() * kinds.length)],
                  active: true,
                });
              }
            } else {
              burst(gs, e.x + ew / 2, e.y + eh / 2, FG, 6);
              beep(220, 0.04, 0.04);
            }
            break;
          }
        }
      }

      /* ── Enemy bullets hit player ── */
      if (gs.invince <= 0) {
        for (const b of gs.bullets) {
          if (!b.active || b.friendly) continue;
          const dx = b.x - gs.px,
            dy = b.y - gs.py;
          if (Math.abs(dx) < PLAYER_W / 2 && Math.abs(dy) < PLAYER_H / 2) {
            b.active = false;
            if (gs.shield) {
              gs.shield = false;
              gs.shieldTimer = 0;
              burst(gs, gs.px, gs.py, SHIELD_COL, 10);
              beep(330, 0.1, 0.05, "sine");
            } else {
              gs.lives--;
              gs.invince = INVINCE_MS;
              gs.combo = 0;
              gs.comboTimer = 0;
              gs.shake = 8;
              burst(gs, gs.px, gs.py, DANGER, 14);
              beep(100, 0.2, 0.06, "sawtooth");
              if (gs.lives <= 0) {
                endGame(gs);
                return;
              }
            }
            break;
          }
        }
      }

      /* ── Update particles ── */
      for (const p of gs.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.life -= 0.03;
      }
      gs.particles = gs.particles.filter((p) => p.life > 0);
      gs.bullets = gs.bullets.filter((b) => b.active);

      syncUI(gs);

      /* ── DRAW ──────────────────────────────────────────────────────────── */
      // Screen shake
      const sx = gs.shake > 0 ? (Math.random() - 0.5) * gs.shake : 0;
      const sy = gs.shake > 0 ? (Math.random() - 0.5) * gs.shake : 0;
      ctx.save();
      ctx.translate(sx, sy);

      ctx.fillStyle = BG;
      ctx.fillRect(-10, -10, cw + 20, ch + 20);

      // Stars
      for (const s of gs.stars) {
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = FG;
        ctx.fillRect(s.x, s.y, s.size, s.size);
      }
      ctx.globalAlpha = 1;

      // Grid (subtle)
      ctx.strokeStyle = "rgba(34,34,34,0.4)";
      ctx.lineWidth = 0.5;
      const gsz = 56;
      for (let gx = 0; gx < cw; gx += gsz) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, ch);
        ctx.stroke();
      }
      for (let gy = 0; gy < ch; gy += gsz) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(cw, gy);
        ctx.stroke();
      }

      // Power-ups
      for (const p of gs.powerUps) drawPowerUp(ctx, p);

      // Enemies
      for (const e of gs.enemies) drawEnemy(ctx, e);

      // Bullets
      for (const b of gs.bullets) {
        ctx.fillStyle = b.friendly ? ACCENT : DANGER;
        ctx.globalAlpha = 0.95;
        if (b.friendly) {
          // Glow on player bullets
          ctx.shadowColor = ACCENT;
          ctx.shadowBlur = 6;
        }
        ctx.fillRect(b.x - BULLET_W / 2, b.y - BULLET_H / 2, BULLET_W, BULLET_H);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      // Particles
      for (const p of gs.particles) {
        ctx.globalAlpha = Math.max(0, p.life * 0.9);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Player
      drawShip(ctx, gs.px, gs.py, gs.invince, gs.shield);

      ctx.restore();

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
    // Resume audio context on first user gesture
    getAudio()
      ?.resume()
      .catch(() => {});
  }, [loop, syncUI]);

  /* ─── Keyboard ── */
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

  /* ─── Canvas resize ── */
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      if (gsRef.current) gsRef.current.py = canvas.height - 56;
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  /* ─── Touch ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;
      const rect = canvas.getBoundingClientRect();
      const tx = touch.clientX - rect.left;
      const gs = gsRef.current;
      if (!gs) return;
      gs.px = Math.max(PLAYER_W / 2, Math.min(canvas.width - PLAYER_W / 2, tx));
      const now = performance.now();
      const cd = gs.rapidFire ? SHOOT_CD / 2.5 : SHOOT_CD;
      if (now - gs.lastPlayerShot > cd) {
        gs.bullets.push({
          x: gs.px,
          y: gs.py - PLAYER_H / 2,
          vy: -P_BULLET_SPD,
          vx: 0,
          friendly: true,
          active: true,
        });
        gs.lastPlayerShot = now;
      }
    };
    const onStart = (e: TouchEvent) => {
      if (phase === "idle") {
        startGame();
        return;
      }
      onMove(e);
    };
    canvas.addEventListener("touchmove", onMove, { passive: false });
    canvas.addEventListener("touchstart", onStart, { passive: false });
    return () => {
      canvas.removeEventListener("touchmove", onMove);
      canvas.removeEventListener("touchstart", onStart);
    };
  }, [phase, startGame]);

  /* ─── Cleanup ── */
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const fmtScore = (n: number) => String(n).padStart(7, "0");

  return (
    <div ref={containerRef} className="shooter-wrap">
      <canvas ref={canvasRef} className="shooter-canvas" />

      {/* HUD */}
      {phase === "playing" && (
        <div className="shooter-hud">
          <div className="shud-left">
            <span className="shud-label">WAVE</span>
            <span className="shud-val">{String(uiWave).padStart(2, "0")}</span>
            {isBossWave(uiWave) && <span className="shud-boss">⚠ BOSS</span>}
          </div>
          <div className="shud-center">
            <span className="shud-score">{fmtScore(uiScore)}</span>
            {uiCombo > 1 && <span className="shud-combo">×{uiCombo} COMBO</span>}
          </div>
          <div className="shud-right">
            <span className="shud-lives">
              {"▶".repeat(Math.max(0, uiLives))}
              {"◻".repeat(Math.max(0, 3 - uiLives))}
            </span>
            <div className="shud-powerups">
              {uiShield && <span className="shud-pu shud-pu--shield">SHD</span>}
              {uiRapid && <span className="shud-pu shud-pu--rapid">RFR</span>}
              {uiSpread && <span className="shud-pu shud-pu--spread">SPR</span>}
            </div>
          </div>
        </div>
      )}

      {/* Idle screen */}
      {phase === "idle" && (
        <div className="shooter-overlay">
          <div className="shooter-screen">
            <p className="so-title">SPACE.SHOOTER</p>
            <p className="so-sub">— DEFEND THE CODEBASE —</p>
            {highScore > 0 && (
              <p className="so-hs">
                BEST &nbsp;<span className="so-accent">{fmtScore(highScore)}</span>
              </p>
            )}
            <div className="so-sep" />
            <p className="so-line">ARROWS / WASD &nbsp;→&nbsp; MOVE</p>
            <p className="so-line">SPACE &nbsp;→&nbsp; FIRE</p>
            <p className="so-line so-line--dim">COLLECT POWER-UPS: SPR · SHD · RFR</p>
            <p className="so-line so-line--dim">BOSS EVERY 5 WAVES</p>
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
            <p className="so-score-big">{fmtScore(finalScore)}</p>
            <p className="so-sub">FINAL SCORE</p>
            {finalScore >= highScore && finalScore > 0 && (
              <p className="so-hs so-hs--new">✦ NEW HIGH SCORE ✦</p>
            )}
            {finalScore < highScore && (
              <p className="so-hs">
                BEST &nbsp;<span className="so-accent">{fmtScore(highScore)}</span>
              </p>
            )}
            <p className="so-line" style={{ marginTop: 8 }}>
              WAVE REACHED &nbsp;<span className="so-accent">{finalWave}</span>
            </p>
            <div className="so-sep" />
            <div className="so-actions">
              <button className="so-btn" onClick={startGame}>
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
