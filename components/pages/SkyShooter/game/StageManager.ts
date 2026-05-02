import { ETYPE, type EnemyType } from "./entities/Enemy";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface SpawnSpec {
  type: EnemyType;
  count: number;
  cols: number; // columns in formation grid
  formY: number; // patrol Y as fraction of screen height (0–1)
  hpMult?: number; // HP multiplier (default 1)
}

export type WaveData = { kind: "enemies"; specs: SpawnSpec[]; interval: number } | { kind: "boss" };

// ── Wave definitions ──────────────────────────────────────────────────────────
//   key = stage number (1–3)
//   Each array entry = one wave; last entry of each stage is the boss.
const WAVES: Record<number, WaveData[]> = {
  // ── Stage 1 ──────────────────────────────────────────────────────────────────
  1: [
    {
      kind: "enemies",
      interval: 190,
      specs: [{ type: ETYPE.GRUNT, count: 8, cols: 4, formY: 0.15 }],
    },
    {
      kind: "enemies",
      interval: 170,
      specs: [
        { type: ETYPE.GRUNT, count: 6, cols: 3, formY: 0.14 },
        { type: ETYPE.ZIGZAG, count: 4, cols: 4, formY: 0.23 },
      ],
    },
    {
      kind: "enemies",
      interval: 150,
      specs: [
        { type: ETYPE.GRUNT, count: 4, cols: 4, formY: 0.13 },
        { type: ETYPE.ZIGZAG, count: 4, cols: 4, formY: 0.22 },
        { type: ETYPE.KAMIKAZE, count: 3, cols: 3, formY: 0.1 },
      ],
    },
    { kind: "boss" },
  ],

  // ── Stage 2 ──────────────────────────────────────────────────────────────────
  2: [
    {
      kind: "enemies",
      interval: 165,
      specs: [{ type: ETYPE.GRUNT, count: 10, cols: 5, formY: 0.14 }],
    },
    {
      kind: "enemies",
      interval: 155,
      specs: [
        { type: ETYPE.GRUNT, count: 6, cols: 3, formY: 0.13 },
        { type: ETYPE.ZIGZAG, count: 6, cols: 3, formY: 0.23 },
      ],
    },
    {
      kind: "enemies",
      interval: 145,
      specs: [
        { type: ETYPE.ZIGZAG, count: 6, cols: 3, formY: 0.15 },
        { type: ETYPE.TURRET, count: 4, cols: 4, formY: 0.12 },
      ],
    },
    {
      kind: "enemies",
      interval: 135,
      specs: [
        { type: ETYPE.GRUNT, count: 6, cols: 3, formY: 0.14, hpMult: 1.5 },
        { type: ETYPE.KAMIKAZE, count: 6, cols: 3, formY: 0.09 },
      ],
    },
    {
      kind: "enemies",
      interval: 200,
      specs: [
        { type: ETYPE.CARRIER, count: 1, cols: 1, formY: 0.13 },
        { type: ETYPE.ZIGZAG, count: 6, cols: 3, formY: 0.24, hpMult: 1.5 },
      ],
    },
    { kind: "boss" },
  ],

  // ── Stage 3 ──────────────────────────────────────────────────────────────────
  3: [
    {
      kind: "enemies",
      interval: 145,
      specs: [{ type: ETYPE.GRUNT, count: 12, cols: 6, formY: 0.14, hpMult: 1.5 }],
    },
    {
      kind: "enemies",
      interval: 135,
      specs: [
        { type: ETYPE.ZIGZAG, count: 8, cols: 4, formY: 0.15, hpMult: 1.5 },
        { type: ETYPE.TURRET, count: 4, cols: 4, formY: 0.11, hpMult: 1.5 },
      ],
    },
    {
      kind: "enemies",
      interval: 125,
      specs: [
        { type: ETYPE.KAMIKAZE, count: 8, cols: 4, formY: 0.09, hpMult: 2 },
        { type: ETYPE.GRUNT, count: 6, cols: 3, formY: 0.17, hpMult: 1.5 },
      ],
    },
    {
      kind: "enemies",
      interval: 220,
      specs: [{ type: ETYPE.CARRIER, count: 2, cols: 2, formY: 0.12, hpMult: 1.5 }],
    },
    {
      kind: "enemies",
      interval: 125,
      specs: [
        { type: ETYPE.GRUNT, count: 10, cols: 5, formY: 0.14, hpMult: 2 },
        { type: ETYPE.ZIGZAG, count: 6, cols: 3, formY: 0.23, hpMult: 2 },
      ],
    },
    {
      kind: "enemies",
      interval: 115,
      specs: [
        { type: ETYPE.TURRET, count: 4, cols: 4, formY: 0.11, hpMult: 2 },
        { type: ETYPE.KAMIKAZE, count: 8, cols: 4, formY: 0.09, hpMult: 2 },
      ],
    },
    {
      kind: "enemies",
      interval: 155,
      specs: [
        { type: ETYPE.CARRIER, count: 1, cols: 1, formY: 0.11, hpMult: 2 },
        { type: ETYPE.ZIGZAG, count: 6, cols: 3, formY: 0.22, hpMult: 2 },
        { type: ETYPE.TURRET, count: 4, cols: 4, formY: 0.13, hpMult: 2 },
      ],
    },
    { kind: "boss" },
  ],
};

// ── Public helpers ────────────────────────────────────────────────────────────
export function getWave(stage: number, wave: number): WaveData | null {
  return WAVES[stage]?.[wave - 1] ?? null;
}

export function getWaveCount(stage: number): number {
  return WAVES[stage]?.length ?? 0;
}
