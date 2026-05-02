/**
 * EventBus — decoupled bridge between Phaser scenes and the React shell.
 *
 * Phaser scenes emit events here; React subscribes to them.
 * React can also emit events that scenes listen to (e.g. "start-game").
 *
 * Using Phaser's own EventEmitter keeps bundle size zero (already shipped
 * with Phaser) and gives us .once(), .off(), typed args, etc.
 */
import Phaser from "phaser";

export const EventBus = new Phaser.Events.EventEmitter();

// ── Event name constants ────────────────────────────────────────────────────
export const EV = {
  // Phaser → React
  SCENE_READY: "scene-ready",
  SCORE_UPDATE: "score-update", // { score, lives, stars, wave }
  STAGE_COMPLETE: "stage-complete", // { stage, stars, totalScore }
  GAME_OVER: "game-over", // { score, stage, newHighScore }
  GAME_WIN: "game-win", // { score, stars }

  // React → Phaser
  START_GAME: "start-game", // { playerName, upgrades }
  RESUME_STAGE: "resume-stage", // { upgrades }
} as const;

export type ScorePayload = { score: number; lives: number; stars: number; wave: number };
export type StagePayload = { stage: number; stars: number; totalScore: number };
export type GameOverPayload = { score: number; stage: number };
export type StartPayload = { playerName: string; upgrades: Upgrades };

export type Upgrades = {
  gunLevel: 0 | 1 | 2 | 3; // 0=single, 1=double, 2=spread, 3=laser
  shieldLevel: 0 | 1 | 2 | 3; // 0=none … 3=3hp
  speedLevel: 1 | 2 | 3; // 1=normal … 3=fastest
  bombLevel: 0 | 1 | 2; // 0=none … 2=2 bombs
  stars: number; // unspent
};

export const DEFAULT_UPGRADES: Upgrades = {
  gunLevel: 0,
  shieldLevel: 0,
  speedLevel: 1,
  bombLevel: 0,
  stars: 0,
};
