import Phaser from "phaser";
import { Player } from "../entities/Player";
import { EventBus, EV, DEFAULT_UPGRADES } from "../EventBus";
import type { StartPayload, Upgrades } from "../EventBus";

const SCROLL_SPEED = 60; // background scroll speed px/s

export class GameScene extends Phaser.Scene {
  // Player
  player!: Player;

  // Input
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  wasd!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  fireKey!: Phaser.Input.Keyboard.Key;
  bombKey!: Phaser.Input.Keyboard.Key;

  // Bullet pools
  playerBullets!: Phaser.Physics.Arcade.Group;
  enemyBullets!: Phaser.Physics.Arcade.Group;

  // Background layers
  bgFar!: Phaser.GameObjects.TileSprite;
  bgNear!: Phaser.GameObjects.TileSprite;
  bgNebula!: Phaser.GameObjects.TileSprite;

  // HUD
  scoreTxt!: Phaser.GameObjects.Text;
  livesTxt!: Phaser.GameObjects.Text;
  starsTxt!: Phaser.GameObjects.Text;
  waveTxt!: Phaser.GameObjects.Text;
  stageTxt!: Phaser.GameObjects.Text;
  bombsTxt!: Phaser.GameObjects.Text;

  // Game state
  playerName = "GHOST";
  currentStage = 1;
  currentWave = 0;
  score = 0;
  starsCollected = 0;
  upgrades: Upgrades = { ...DEFAULT_UPGRADES };
  active = false; // false until START_GAME received

  // Explosion particle emitter
  explosionEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super({ key: "GameScene" });
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────────
  create() {
    const { width: W, height: H } = this.scale;

    this.createBackground(W, H);
    this.createBulletPools();
    this.createPlayer(W, H);
    this.createHUD();
    this.createExplosionEmitter();
    this.setupInput();
    this.setupSounds();
    this.setupEventBus();

    // Resize handler
    this.scale.on("resize", this.onResize, this);

    // Tell React the scene is ready
    EventBus.emit(EV.SCENE_READY, this);
  }

  update(time: number, delta: number) {
    if (!this.active) return;

    const W = this.scale.width;
    const H = this.scale.height;

    this.scrollBackground(delta);
    this.handlePlayerInput(time);
    this.player.update();
    this.cleanBullets(W, H);
    this.updateHUD();
  }

  // ── Background ──────────────────────────────────────────────────────────────
  private createBackground(W: number, H: number) {
    // Layer 1 — distant stars (slowest)
    this.bgFar = this.add
      .tileSprite(0, 0, W, H, "bg_stars_far")
      .setOrigin(0, 0)
      .setDepth(0)
      .setAlpha(0.7);

    // Layer 2 — nebula clouds (medium)
    this.bgNebula = this.add
      .tileSprite(0, 0, W, H, "bg_nebula")
      .setOrigin(0, 0)
      .setDepth(1)
      .setAlpha(0.35);

    // Layer 3 — near stars (fastest)
    this.bgNear = this.add
      .tileSprite(0, 0, W, H, "bg_stars_near")
      .setOrigin(0, 0)
      .setDepth(2)
      .setAlpha(0.9);

    // Subtle grid lines drawn on a graphics object
    const grid = this.add.graphics().setDepth(3).setAlpha(0.07);
    const sz = 64;
    grid.lineStyle(1, 0xf2f0e9, 1);
    for (let x = 0; x < W; x += sz) {
      grid.lineBetween(x, 0, x, H);
    }
    for (let y = 0; y < H; y += sz) {
      grid.lineBetween(0, y, W, y);
    }
  }

  private scrollBackground(delta: number) {
    const dt = delta / 1000;
    this.bgFar.tilePositionY -= SCROLL_SPEED * 0.3 * dt;
    this.bgNebula.tilePositionY -= SCROLL_SPEED * 0.55 * dt;
    this.bgNear.tilePositionY -= SCROLL_SPEED * dt;
  }

  // ── Bullets ─────────────────────────────────────────────────────────────────
  private createBulletPools() {
    const makePool = (texture: string) =>
      this.physics.add.group({
        defaultKey: texture,
        maxSize: 40,
        createCallback: (b) => {
          const sprite = b as Phaser.Physics.Arcade.Sprite;
          (sprite.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
        },
      });

    this.playerBullets = makePool("bullet_p");
    this.enemyBullets = makePool("bullet_e");
  }

  private cleanBullets(W: number, H: number) {
    // Recycle bullets that leave the screen
    const recycle = (group: Phaser.Physics.Arcade.Group) => {
      group.getChildren().forEach((b) => {
        const s = b as Phaser.Physics.Arcade.Sprite;
        if (!s.active) return;
        if (s.y < -40 || s.y > H + 40 || s.x < -40 || s.x > W + 40) {
          s.setActive(false).setVisible(false);
          (s.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
        }
      });
    };
    recycle(this.playerBullets);
    recycle(this.enemyBullets);
  }

  // ── Player ──────────────────────────────────────────────────────────────────
  private createPlayer(W: number, H: number) {
    this.player = new Player(this, W / 2, H - 80);
    this.player.applyUpgrades(this.upgrades);
    this.player.setVisible(false); // hidden until game starts
  }

  // ── HUD ─────────────────────────────────────────────────────────────────────
  private createHUD() {
    const style = (
      size: number,
      color = "#f2f0e9",
      _alpha = 0.7
    ): Phaser.Types.GameObjects.Text.TextStyle => ({
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: `${size}px`,
      color,
      stroke: "#000000",
      strokeThickness: 3,
    });

    const W = this.scale.width;

    this.stageTxt = this.add
      .text(16, 36, "STAGE 1", style(9, "#e8ff00"))
      .setDepth(20)
      .setScrollFactor(0)
      .setAlpha(0.6);
    this.waveTxt = this.add
      .text(16, 50, "WAVE 00", style(9))
      .setDepth(20)
      .setScrollFactor(0)
      .setAlpha(0.55);
    this.scoreTxt = this.add
      .text(W / 2, 36, "0000000", style(16, "#e8ff00"))
      .setDepth(20)
      .setScrollFactor(0)
      .setOrigin(0.5, 0);
    this.livesTxt = this.add
      .text(W - 16, 36, "▶▶▶", style(12, "#f2f0e9"))
      .setDepth(20)
      .setScrollFactor(0)
      .setOrigin(1, 0);
    this.starsTxt = this.add
      .text(W - 16, 54, "★ 000", style(9, "#e8ff00"))
      .setDepth(20)
      .setScrollFactor(0)
      .setOrigin(1, 0)
      .setAlpha(0.7);
    this.bombsTxt = this.add
      .text(16, 64, "", style(9, "#ff4444"))
      .setDepth(20)
      .setScrollFactor(0)
      .setAlpha(0.8);

    // Top border
    this.add
      .graphics()
      .setDepth(19)
      .setScrollFactor(0)
      .lineStyle(1, 0x222222, 1)
      .lineBetween(0, 30, W, 30);
  }

  // ── Particles ───────────────────────────────────────────────────────────────
  private createExplosionEmitter() {
    this.explosionEmitter = this.add
      .particles(0, 0, "particle", {
        lifespan: 500,
        speed: { min: 80, max: 220 },
        scale: { start: 1.2, end: 0 },
        alpha: { start: 1, end: 0 },
        tint: [0xe8ff00, 0xff8800, 0xff4444, 0xffffff],
        blendMode: "ADD",
        frequency: -1, // manual emit
      })
      .setDepth(15);
  }

  explode(x: number, y: number, count = 18, tint?: number) {
    if (tint) this.explosionEmitter.setParticleTint(tint);
    this.explosionEmitter.emitParticleAt(x, y, count);
    this.cameras.main.shake(120, 0.006);
  }

  // ── Input ───────────────────────────────────────────────────────────────────
  private setupInput() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.fireKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.bombKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.X);

    // Touch / mobile drag to move
    this.input.on("pointermove", (ptr: Phaser.Input.Pointer) => {
      if (!this.active || !ptr.isDown) return;
      this.player.setX(Phaser.Math.Clamp(ptr.x, 24, this.scale.width - 24));
    });
    this.input.on("pointerdown", () => {
      if (this.active) this.player.fire(this.playerBullets, this.time.now);
    });
  }

  private handlePlayerInput(time: number) {
    const { left, right, up, down } = this.cursors;
    const { left: a, right: d, up: w, down: s } = this.wasd;

    let dx = 0,
      dy = 0;
    if (left.isDown || a.isDown) dx = -1;
    if (right.isDown || d.isDown) dx = 1;
    if (up.isDown || w.isDown) dy = -1;
    if (down.isDown || s.isDown) dy = 1;

    // Normalise diagonal
    if (dx !== 0 && dy !== 0) {
      dx *= 0.707;
      dy *= 0.707;
    }

    this.player.move(dx, dy);

    if (this.fireKey.isDown) this.player.fire(this.playerBullets, time);

    if (Phaser.Input.Keyboard.JustDown(this.bombKey)) this.player.dropBomb(this);
  }

  // ── Sounds (stub — assets generated or skipped if missing) ──────────────────
  private setupSounds() {
    // Sounds are generated via Web Audio in EventBus listeners if desired.
    // We guard with try/catch in case a key doesn't exist yet.
    if (!this.cache.audio.exists("sfx_shoot")) {
      // Create silent placeholder — replaced with real audio later
      this.sound.add("sfx_shoot", { volume: 0 });
    }
  }

  // ── Event Bus ───────────────────────────────────────────────────────────────
  private setupEventBus() {
    EventBus.on(EV.START_GAME, (payload: StartPayload) => {
      this.playerName = payload.playerName;
      this.upgrades = { ...payload.upgrades };
      this.score = 0;
      this.starsCollected = 0;
      this.currentStage = 1;
      this.currentWave = 0;
      this.active = true;

      this.player.applyUpgrades(this.upgrades);
      this.player.lives = 3;
      this.player.score = 0;
      this.player.stars = 0;
      this.player.setPosition(this.scale.width / 2, this.scale.height - 80);
      this.player.setVisible(true).setActive(true).setAlpha(1);

      // Spawn wave 1 (enemies added in Step 3)
      this.startWave(1);
    });

    EventBus.on(EV.RESUME_STAGE, (payload: { upgrades: Upgrades }) => {
      this.upgrades = { ...payload.upgrades };
      this.player.applyUpgrades(payload.upgrades);
      this.active = true;
      this.startWave(this.currentWave + 1);
    });
  }

  // ── Wave / Stage management (stubs, filled in Step 3) ───────────────────────
  startWave(wave: number) {
    this.currentWave = wave;
    this.updateHUD();
    // Enemy spawning logic added in Step 3
  }

  /** Call when all enemies in a wave are defeated */
  onWaveCleared() {
    const wavesPerStage: Record<number, number> = { 1: 4, 2: 6, 3: 8 };
    const maxWaves = wavesPerStage[this.currentStage] ?? 4;

    if (this.currentWave < maxWaves) {
      this.time.delayedCall(1200, () => this.startWave(this.currentWave + 1));
    } else {
      this.onStageComplete();
    }
  }

  private onStageComplete() {
    this.active = false;
    EventBus.emit(EV.STAGE_COMPLETE, {
      stage: this.currentStage,
      stars: this.starsCollected,
      totalScore: this.score,
    });
  }

  /** Call from enemy collision handlers */
  onEnemyKilled(x: number, y: number, points: number, starDrop: number) {
    this.score += points;
    this.starsCollected += starDrop;
    this.explode(x, y, 18);
    this.broadcastScore();
  }

  /** Call when player is hit */
  onPlayerHit() {
    const result = this.player.hit();
    if (result === "dead") {
      this.triggerGameOver();
    } else if (result === "life") {
      this.explode(this.player.x, this.player.y, 12, 0xff4444);
    }
    this.broadcastScore();
  }

  triggerGameOver() {
    this.active = false;
    this.player.setVisible(false);
    this.time.delayedCall(800, () => {
      EventBus.emit(EV.GAME_OVER, {
        score: this.score,
        stage: this.currentStage,
      });
    });
  }

  private broadcastScore() {
    EventBus.emit(EV.SCORE_UPDATE, {
      score: this.score,
      lives: this.player.lives,
      stars: this.starsCollected,
      wave: this.currentWave,
    });
  }

  // ── HUD update ───────────────────────────────────────────────────────────────
  private updateHUD() {
    if (!this.scoreTxt) return;
    this.scoreTxt.setText(String(this.score).padStart(7, "0"));
    this.waveTxt.setText(`WAVE ${String(this.currentWave).padStart(2, "0")}`);
    this.stageTxt.setText(`STAGE ${this.currentStage}`);
    this.livesTxt.setText(
      "▶".repeat(Math.max(0, this.player?.lives ?? 3)) +
        "◻".repeat(Math.max(0, 3 - (this.player?.lives ?? 3)))
    );
    this.starsTxt.setText(`★ ${String(this.starsCollected).padStart(3, "0")}`);
    const bombs = this.player?.bombs ?? 0;
    this.bombsTxt.setText(bombs > 0 ? `✕ BOMB ×${bombs}` : "");
  }

  // ── Resize ───────────────────────────────────────────────────────────────────
  private onResize(gameSize: Phaser.Structs.Size) {
    const W = gameSize.width;
    const H = gameSize.height;

    this.bgFar.setSize(W, H);
    this.bgNebula.setSize(W, H);
    this.bgNear.setSize(W, H);

    if (this.player) {
      this.player.setY(Math.min(this.player.y, H - 60));
    }

    // Reposition HUD right-aligned elements
    this.scoreTxt?.setX(W / 2);
    this.livesTxt?.setX(W - 16);
    this.starsTxt?.setX(W - 16);
  }

  // ── Cleanup ──────────────────────────────────────────────────────────────────
  shutdown() {
    EventBus.off(EV.START_GAME);
    EventBus.off(EV.RESUME_STAGE);
    this.scale.off("resize", this.onResize, this);
  }
}
