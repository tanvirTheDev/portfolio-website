"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type Phaser from "phaser";
import {
  EventBus,
  EV,
  DEFAULT_UPGRADES,
  type Upgrades,
  type ScorePayload,
  type GameOverPayload,
  type StagePayload,
  type GameWinPayload,
} from "./game/EventBus";
import type { ScoreEntry } from "@/types/sanity";

const CONTAINER_ID = "sky-shooter-canvas";

type Phase = "name_input" | "playing" | "stage_complete" | "game_over" | "victory";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt7 = (n: number) => String(Math.floor(n)).padStart(7, "0");

// ── Component ─────────────────────────────────────────────────────────────────
export default function SkyShooter() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const mountedRef = useRef(true);
  const stageNumRef = useRef(1); // kept in sync so handleUpgradeDone always sees current value

  const [phase, setPhase] = useState<Phase>("name_input");
  const [playerName, setPlayerName] = useState("");
  const [nameError, setNameError] = useState("");
  const [stageNum, setStageNum] = useState(1);
  // Keep ref in sync so callbacks can read current value without stale closure
  useEffect(() => {
    stageNumRef.current = stageNum;
  }, [stageNum]);
  const [upgrades, setUpgrades] = useState<Upgrades>({ ...DEFAULT_UPGRADES });
  const [pendingStars, setPendingStars] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [finalStage, setFinalStage] = useState(1);
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [bestScore, setBestScore] = useState<number>(() => {
    const stored = parseInt(localStorage.getItem("sky_best") ?? "0", 10);
    return isNaN(stored) ? 0 : stored;
  });
  const [isNewBest, setIsNewBest] = useState(false);

  // ── Boot Phaser once ────────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    let game: Phaser.Game;

    Promise.all([import("phaser"), import("./game/config")]).then(
      ([{ default: Phaser }, { makeConfig }]) => {
        if (!mountedRef.current || gameRef.current) return;
        game = new Phaser.Game(makeConfig(CONTAINER_ID));
        gameRef.current = game;
      }
    );

    return () => {
      mountedRef.current = false;
      gameRef.current?.destroy(true);
      gameRef.current = null;
      EventBus.removeAllListeners();
    };
  }, []);

  // ── Save score + fetch leaderboard ──────────────────────────────────────────
  const saveAndFetchLeaderboard = useCallback(
    async (sc: number, stage: number) => {
      setSaving(true);
      setLbLoading(true);
      try {
        await fetch("/api/scores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerName: playerName.trim().toUpperCase() || "GHOST",
            score: sc,
            stageReached: stage,
          }),
        });
      } catch {
        /* network error — score not saved */
      }
      setSaving(false);

      try {
        const res = await fetch("/api/scores");
        const data = (await res.json()) as { scores: ScoreEntry[] };
        const board = data.scores ?? [];
        setLeaderboard(board);
        const rank = board.findIndex((e) => e.score <= sc);
        setMyRank(rank === -1 ? board.length + 1 : rank + 1);
      } catch {
        /* network error — leaderboard empty */
      }
      setLbLoading(false);
    },
    [playerName]
  );

  // ── EventBus listeners ──────────────────────────────────────────────────────
  useEffect(() => {
    const onScore = (p: ScorePayload) => {
      // Live stats tracked by Phaser HUD — no React re-render needed
      void p;
    };

    const onStageComplete = (p: StagePayload) => {
      setFinalScore(p.totalScore);
      setStageNum(p.stage);
      setPendingStars(p.stars);
      setUpgrades((prev) => ({ ...prev, stars: prev.stars + p.stars }));
      setPhase("stage_complete");
    };

    const checkAndSaveBest = (score: number) => {
      const prev = parseInt(localStorage.getItem("sky_best") ?? "0", 10) || 0;
      if (score > prev) {
        localStorage.setItem("sky_best", String(score));
        setBestScore(score);
        setIsNewBest(true);
      } else {
        setIsNewBest(false);
      }
    };

    const onGameOver = async (p: GameOverPayload) => {
      setFinalScore(p.score);
      setFinalStage(p.stage);
      checkAndSaveBest(p.score);
      setPhase("game_over");
      await saveAndFetchLeaderboard(p.score, p.stage);
    };

    const onGameWin = async (p: GameWinPayload) => {
      setFinalScore(p.score);
      setFinalStage(3);
      checkAndSaveBest(p.score);
      setPhase("victory");
      await saveAndFetchLeaderboard(p.score, 3);
    };

    EventBus.on(EV.SCORE_UPDATE, onScore);
    EventBus.on(EV.STAGE_COMPLETE, onStageComplete);
    EventBus.on(EV.GAME_OVER, onGameOver);
    EventBus.on(EV.GAME_WIN, onGameWin);

    return () => {
      EventBus.off(EV.SCORE_UPDATE, onScore);
      EventBus.off(EV.STAGE_COMPLETE, onStageComplete);
      EventBus.off(EV.GAME_OVER, onGameOver);
      EventBus.off(EV.GAME_WIN, onGameWin);
    };
  }, [saveAndFetchLeaderboard]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleStart = useCallback(() => {
    const name = playerName.trim().toUpperCase();
    if (!name || name.length < 1) {
      setNameError("Enter a callsign.");
      return;
    }
    if (name.length > 12) {
      setNameError("Max 12 characters.");
      return;
    }
    setNameError("");
    setStageNum(1);
    setUpgrades({ ...DEFAULT_UPGRADES });
    setPhase("playing");
    EventBus.emit(EV.START_GAME, { playerName: name, upgrades: DEFAULT_UPGRADES });
  }, [playerName]);

  const handleUpgradeDone = useCallback((newUpgrades: Upgrades) => {
    const nextStage = stageNumRef.current + 1;
    setStageNum(nextStage);
    setUpgrades(newUpgrades);
    setPhase("playing");
    EventBus.emit(EV.RESUME_STAGE, { upgrades: newUpgrades, stage: nextStage });
  }, []);

  const handlePlayAgain = useCallback(() => {
    setPhase("name_input");
    setStageNum(1);
    setUpgrades({ ...DEFAULT_UPGRADES });
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="sky-wrap">
      {/* Phaser canvas mount point — always in DOM */}
      <div id={CONTAINER_ID} className="sky-canvas" />

      {/* ── Name input ── */}
      {phase === "name_input" && (
        <div className="sky-overlay">
          <div className="sky-screen">
            <p className="sky-title">SKY SHOOTER</p>
            <p className="sky-sub">— CLEAR THE SKIES —</p>
            <div className="sky-sep" />
            <label className="sky-label" htmlFor="callsign">
              ENTER YOUR CALLSIGN
            </label>
            <input
              id="callsign"
              className="sky-input"
              maxLength={12}
              autoFocus
              placeholder="GHOST"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
            />
            {nameError && <p className="sky-error">{nameError}</p>}
            <div className="sky-sep" />
            <p className="sky-hint">
              ARROWS / WASD — MOVE &nbsp;·&nbsp; SPACE — FIRE &nbsp;·&nbsp; X — BOMB
            </p>
            <p className="sky-hint sky-hint--dim">3 STAGES · UPGRADES BETWEEN STAGES</p>
            {bestScore > 0 && (
              <p className="sky-hint sky-hint--best">
                PERSONAL BEST &nbsp;·&nbsp; {fmt7(bestScore)}
              </p>
            )}
            <div className="sky-sep" />
            <button className="sky-btn sky-btn--accent" onClick={handleStart}>
              [ START MISSION ]
            </button>
          </div>
        </div>
      )}

      {/* ── Victory ── */}
      {phase === "victory" && (
        <div className="sky-overlay">
          <div className="sky-screen sky-screen--wide">
            <p className="sky-title sky-title--victory">MISSION COMPLETE</p>
            <p className="sky-sub">— ALL 3 STAGES CLEARED —</p>
            <div className="sky-sep" />
            <p className="sky-score-big">{fmt7(finalScore)}</p>
            {isNewBest && <p className="sky-new-best">★ NEW PERSONAL BEST ★</p>}
            <p className="sky-sub">FINAL SCORE</p>
            {myRank !== null && myRank <= 10 && (
              <p className="sky-rank">🏆 RANK #{myRank} ON LEADERBOARD</p>
            )}
            <div className="sky-sep" />
            <div className="sky-lb">
              <div className="sky-lb-hdr">
                <span>#</span>
                <span>CALLSIGN</span>
                <span>SCORE</span>
                <span>STG</span>
              </div>
              {lbLoading || saving ? (
                <p className="sky-lb-loading">SYNCING...</p>
              ) : leaderboard.length === 0 ? (
                <p className="sky-lb-loading">NO SCORES YET</p>
              ) : (
                leaderboard.map((entry, i) => {
                  const isMe =
                    entry.playerName === playerName.trim().toUpperCase() &&
                    entry.score === finalScore;
                  return (
                    <div
                      key={entry._id}
                      className={["sky-lb-row", isMe ? "sky-lb-row--me" : ""]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      <span>{entry.playerName}</span>
                      <span>{fmt7(entry.score)}</span>
                      <span>{entry.stageReached}</span>
                    </div>
                  );
                })
              )}
            </div>
            <div className="sky-sep" />
            <div className="sky-actions">
              <button className="sky-btn" onClick={handlePlayAgain}>
                [ PLAY AGAIN ]
              </button>
              <a href="/contact" className="sky-btn sky-btn--accent">
                [ HIRE ME → ]
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Stage complete / upgrade screen ── */}
      {phase === "stage_complete" && (
        <UpgradeScreen
          stage={stageNum}
          upgrades={upgrades}
          pendingStars={pendingStars}
          score={finalScore}
          onDone={handleUpgradeDone}
        />
      )}

      {/* ── Game over ── */}
      {phase === "game_over" && (
        <div className="sky-overlay">
          <div className="sky-screen sky-screen--wide">
            <p className="sky-title sky-title--danger">MISSION FAILED</p>
            <div className="sky-sep" />
            <p className="sky-score-big">{fmt7(finalScore)}</p>
            {isNewBest && <p className="sky-new-best">★ NEW PERSONAL BEST ★</p>}
            <p className="sky-sub">FINAL SCORE &nbsp;·&nbsp; STAGE {finalStage}</p>
            {myRank !== null && myRank <= 10 && (
              <p className="sky-rank">🏆 RANK #{myRank} ON LEADERBOARD</p>
            )}
            <div className="sky-sep" />

            {/* Leaderboard */}
            <div className="sky-lb">
              <div className="sky-lb-hdr">
                <span>#</span>
                <span>CALLSIGN</span>
                <span>SCORE</span>
                <span>STG</span>
              </div>
              {lbLoading || saving ? (
                <p className="sky-lb-loading">SYNCING...</p>
              ) : leaderboard.length === 0 ? (
                <p className="sky-lb-loading">NO SCORES YET</p>
              ) : (
                leaderboard.map((entry, i) => {
                  const isMe =
                    entry.playerName === playerName.trim().toUpperCase() &&
                    entry.score === finalScore;
                  return (
                    <div
                      key={entry._id}
                      className={["sky-lb-row", isMe ? "sky-lb-row--me" : ""]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      <span>{entry.playerName}</span>
                      <span>{fmt7(entry.score)}</span>
                      <span>{entry.stageReached}</span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="sky-sep" />
            <div className="sky-actions">
              <button className="sky-btn" onClick={handlePlayAgain}>
                [ PLAY AGAIN ]
              </button>
              <a href="/contact" className="sky-btn sky-btn--accent">
                [ HIRE ME → ]
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Upgrade Screen ─────────────────────────────────────────────────────────────
interface UpgradeProps {
  stage: number;
  upgrades: Upgrades;
  pendingStars: number;
  score: number;
  onDone: (u: Upgrades) => void;
}

const UPGRADE_DEFS = [
  {
    key: "gunLevel",
    label: "MAIN GUN",
    max: 3,
    color: "#e8ff00",
    desc: ["Single shot", "Double barrel", "3-way spread", "Laser beam"],
  },
  {
    key: "shieldLevel",
    label: "SHIELD",
    max: 3,
    color: "#00cfff",
    desc: ["No shield", "1 HP shield", "2 HP shield", "3 HP shield"],
  },
  {
    key: "speedLevel",
    label: "SPEED",
    max: 3,
    color: "#44ff88",
    desc: ["Normal", "Faster", "Maximum"],
  },
  {
    key: "bombLevel",
    label: "BOMBS",
    max: 2,
    color: "#ff4444",
    desc: ["No bombs", "1 bomb", "2 bombs"],
  },
] as const;

const UPGRADE_COSTS: Record<string, number[]> = {
  gunLevel: [0, 20, 35, 60],
  shieldLevel: [0, 15, 30, 50],
  speedLevel: [0, 20, 40],
  bombLevel: [0, 25, 45],
};

function UpgradeScreen({ stage, upgrades, pendingStars, score, onDone }: UpgradeProps) {
  const [u, setU] = useState<Upgrades>({ ...upgrades });

  const spentStars =
    UPGRADE_COSTS.gunLevel.slice(upgrades.gunLevel, u.gunLevel).reduce((a, b) => a + b, 0) +
    UPGRADE_COSTS.shieldLevel
      .slice(upgrades.shieldLevel, u.shieldLevel)
      .reduce((a, b) => a + b, 0) +
    UPGRADE_COSTS.speedLevel.slice(upgrades.speedLevel, u.speedLevel).reduce((a, b) => a + b, 0) +
    UPGRADE_COSTS.bombLevel.slice(upgrades.bombLevel, u.bombLevel).reduce((a, b) => a + b, 0);

  const remaining = upgrades.stars + pendingStars - spentStars;

  const upgrade = (key: keyof Upgrades) => {
    const def = UPGRADE_DEFS.find((d) => d.key === key);
    if (!def) return;
    const cur = u[key] as number;
    if (cur >= def.max) return;
    const cost = UPGRADE_COSTS[key][cur];
    if (remaining < cost) return;
    setU((prev) => ({ ...prev, [key]: cur + 1 }));
  };

  const handleDone = () => {
    onDone({ ...u, stars: remaining });
  };

  return (
    <div className="sky-overlay">
      <div className="sky-screen sky-screen--wide">
        <p className="sky-title">STAGE {stage} CLEARED</p>
        <p className="sky-sub">
          SCORE SO FAR: <span style={{ color: "#e8ff00" }}>{fmt7(score)}</span>
        </p>
        <div className="sky-sep" />
        <div className="sky-stars-avail">
          ★ <span style={{ color: "#e8ff00" }}>{remaining}</span> STARS AVAILABLE
        </div>
        <div className="sky-upgrades">
          {UPGRADE_DEFS.map((def) => {
            const cur = u[def.key] as number;
            const canUp = cur < def.max;
            const cost = canUp ? UPGRADE_COSTS[def.key][cur] : 0;
            const affordable = remaining >= cost;
            return (
              <div key={def.key} className="sky-upg">
                <div className="sky-upg-info">
                  <span className="sky-upg-label" style={{ color: def.color }}>
                    {def.label}
                  </span>
                  <span className="sky-upg-desc">{def.desc[cur]}</span>
                  <div className="sky-upg-pips">
                    {Array.from({ length: def.max }, (_, i) => (
                      <span
                        key={i}
                        className={["sky-pip", i < cur ? "sky-pip--on" : ""]
                          .filter(Boolean)
                          .join(" ")}
                        style={i < cur ? { background: def.color } : {}}
                      />
                    ))}
                  </div>
                </div>
                <button
                  className={["sky-upg-btn", !canUp || !affordable ? "sky-upg-btn--disabled" : ""]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => upgrade(def.key)}
                  disabled={!canUp || !affordable}
                >
                  {!canUp ? "MAX" : `★ ${cost}`}
                </button>
              </div>
            );
          })}
        </div>
        <div className="sky-sep" />
        <button className="sky-btn sky-btn--accent" onClick={handleDone}>
          [ LAUNCH STAGE {stage + 1} → ]
        </button>
      </div>
    </div>
  );
}
