import Phaser from "phaser";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { Boss } from "../entities/Boss";
import { EventBus, EV, DEFAULT_UPGRADES } from "../EventBus";
import type { StartPayload, Upgrades } from "../EventBus";
import { getWave, getWaveCount } from "../StageManager";
import { soundManager } from "../SoundManager";

const SCROLL_SPEED = 60; // px/s for background parallax

const STAGE_NAMES: Record<number, string> = {
  1: "BEGIN",
  2: "ESCALATION",
  3: "THE FINAL PUSH",
};

export class GameScene extends Phaser.Scene {
  // ── Core objects ─────────────────────────────────────────────────────────────
  player!: Player;

  // ── Input ─────────────────────────────────────────────────────────────────────
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  wasd!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  fireKey!: Phaser.Input.Keyboard.Key;
  bombKey!: Phaser.Input.Keyboard.Key;

  // ── Bullet pools ──────────────────────────────────────────────────────────────
  playerBullets!: Phaser.Physics.Arcade.Group;
  enemyBullets!: Phaser.Physics.Arcade.Group;

  // ── Enemy pools ───────────────────────────────────────────────────────────────
  enemies!: Phaser.Physics.Arcade.Group;
  bossGroup!: Phaser.Physics.Arcade.Group;
  pickups!: Phaser.Physics.Arcade.Group;
  powerupGroup!: Phaser.Physics.Arcade.Group;
  boss: Boss | null = null;

  // ── Background layers ─────────────────────────────────────────────────────────
  bgFar!: Phaser.GameObjects.TileSprite;
  bgNebula!: Phaser.GameObjects.TileSprite;
  bgNear!: Phaser.GameObjects.TileSprite;

  // ── HUD ───────────────────────────────────────────────────────────────────────
  scoreTxt!: Phaser.GameObjects.Text;
  livesTxt!: Phaser.GameObjects.Text;
  starsTxt!: Phaser.GameObjects.Text;
  waveTxt!: Phaser.GameObjects.Text;
  stageTxt!: Phaser.GameObjects.Text;
  bombsTxt!: Phaser.GameObjects.Text;
  waveBanner!: Phaser.GameObjects.Text;
  muteBtn!: Phaser.GameObjects.Text;
  comboTxt!: Phaser.GameObjects.Text;
  comboTxtTimer?: Phaser.Time.TimerEvent;

  // ── Particles ─────────────────────────────────────────────────────────────────
  explosionEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  // ── Game state ────────────────────────────────────────────────────────────────
  playerName = "GHOST";
  currentStage = 1;
  currentWave = 0;
  score = 0;
  starsCollected = 0;
  upgrades: Upgrades = { ...DEFAULT_UPGRADES };
  active = false;
  pendingSpawns = 0;
  waveClearFired = false;

  // ── Combo system ─────────────────────────────────────────────────────────────
  comboCount = 0;
  lastKillTime = 0;
  readonly COMBO_WINDOW = 1800; // ms to chain kills

  // ── Mobile touch ─────────────────────────────────────────────────────────────
  touchFiring = false;

  // ── Pause ─────────────────────────────────────────────────────────────────────
  gamePaused = false;
  pauseKey!: Phaser.Input.Keyboard.Key;
  escKey!: Phaser.Input.Keyboard.Key;
  pauseContainer!: Phaser.GameObjects.Container;

  // ── Wave perfect tracking ─────────────────────────────────────────────────────
  waveHitCount = 0; // life-damage hits taken this wave (0 = perfect)

  constructor() {
    super({ key: "GameScene" });
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────────
  create() {
    const { width: W, height: H } = this.scale;

    this.createBackground(W, H);
    this.createPools();
    this.createPlayer(W, H);
    this.createHUD(W, H);
    this.createExplosionEmitter();
    this.setupInput();
    this.setupColliders();
    this.createPauseOverlay();
    this.setupEventBus();
    this.scale.on("resize", this.onResize, this);

    EventBus.emit(EV.SCENE_READY, this);
  }

  update(time: number, delta: number) {
    // Pause toggle checked while active or already paused
    if (this.active || this.gamePaused) {
      if (
        Phaser.Input.Keyboard.JustDown(this.pauseKey) ||
        Phaser.Input.Keyboard.JustDown(this.escKey)
      ) {
        this.togglePause();
        return;
      }
    }

    if (!this.active || this.gamePaused) return;

    const { width: W, height: H } = this.scale;

    this.scrollBackground(delta);
    this.handleInput(time);
    this.player.update();
    this.updateEnemies(time, delta, W, H);
    this.cleanBullets(W, H);
    this.cleanPickups(H);
    this.updateHUD();
    this.checkWaveCleared();
  }

  // ── Background ────────────────────────────────────────────────────────────────
  private createBackground(W: number, H: number) {
    this.bgFar = this.add
      .tileSprite(0, 0, W, H, "bg_stars_far")
      .setOrigin(0)
      .setDepth(0)
      .setAlpha(0.7);
    this.bgNebula = this.add
      .tileSprite(0, 0, W, H, "bg_nebula")
      .setOrigin(0)
      .setDepth(1)
      .setAlpha(0.35);
    this.bgNear = this.add
      .tileSprite(0, 0, W, H, "bg_stars_near")
      .setOrigin(0)
      .setDepth(2)
      .setAlpha(0.9);

    const grid = this.add.graphics().setDepth(3).setAlpha(0.06);
    const sz = 64;
    grid.lineStyle(1, 0xf2f0e9, 1);
    for (let x = 0; x < W; x += sz) grid.lineBetween(x, 0, x, H);
    for (let y = 0; y < H; y += sz) grid.lineBetween(0, y, W, y);
  }

  private scrollBackground(delta: number) {
    const dt = delta / 1000;
    this.bgFar.tilePositionY -= SCROLL_SPEED * 0.3 * dt;
    this.bgNebula.tilePositionY -= SCROLL_SPEED * 0.55 * dt;
    this.bgNear.tilePositionY -= SCROLL_SPEED * 1.0 * dt;
  }

  // ── Pools ──────────────────────────────────────────────────────────────────────
  private createPools() {
    const makeBulletPool = (key: string) =>
      this.physics.add.group({
        defaultKey: key,
        maxSize: 60,
        createCallback: (b) => {
          const spr = b as Phaser.Physics.Arcade.Sprite;
          if (spr.body) {
            (spr.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
          }
        },
      });

    this.playerBullets = makeBulletPool("bullet_p");
    this.enemyBullets = makeBulletPool("bullet_e");
    this.enemies = this.physics.add.group();
    this.bossGroup = this.physics.add.group();
    this.pickups = this.physics.add.group({ maxSize: 50 });
    this.powerupGroup = this.physics.add.group({ maxSize: 12 });
  }

  // ── Player ────────────────────────────────────────────────────────────────────
  private createPlayer(W: number, H: number) {
    this.player = new Player(this, W / 2, H - 80);
    this.player.applyUpgrades(this.upgrades);
    this.player.setVisible(false);
  }

  // ── HUD ───────────────────────────────────────────────────────────────────────
  private createHUD(W: number, H: number) {
    const mono = (size: number, color = "#f2f0e9"): Phaser.Types.GameObjects.Text.TextStyle => ({
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: `${size}px`,
      color,
      stroke: "#000000",
      strokeThickness: 3,
    });

    this.stageTxt = this.add
      .text(16, 36, "STAGE 1", mono(9, "#e8ff00"))
      .setDepth(20)
      .setScrollFactor(0)
      .setAlpha(0.65);
    this.waveTxt = this.add
      .text(16, 50, "WAVE 00", mono(9))
      .setDepth(20)
      .setScrollFactor(0)
      .setAlpha(0.55);
    this.bombsTxt = this.add
      .text(16, 64, "", mono(9, "#ff4444"))
      .setDepth(20)
      .setScrollFactor(0)
      .setAlpha(0.85);
    this.scoreTxt = this.add
      .text(W / 2, 36, "0000000", mono(16, "#e8ff00"))
      .setDepth(20)
      .setScrollFactor(0)
      .setOrigin(0.5, 0);
    this.livesTxt = this.add
      .text(W - 16, 36, "▶▶▶", mono(12, "#f2f0e9"))
      .setDepth(20)
      .setScrollFactor(0)
      .setOrigin(1, 0);
    this.starsTxt = this.add
      .text(W - 16, 54, "★ 000", mono(9, "#e8ff00"))
      .setDepth(20)
      .setScrollFactor(0)
      .setOrigin(1, 0)
      .setAlpha(0.75);
    this.add
      .graphics()
      .setDepth(19)
      .setScrollFactor(0)
      .lineStyle(1, 0x1e1e1e, 1)
      .lineBetween(0, 30, W, 30);

    // Wave banner (center flash)
    this.waveBanner = this.add
      .text(W / 2, H / 2 - 40, "", mono(18, "#e8ff00"))
      .setDepth(30)
      .setScrollFactor(0)
      .setOrigin(0.5)
      .setAlpha(0)
      .setVisible(false);

    // Mute toggle
    this.muteBtn = this.add
      .text(W - 16, 16, "♪", mono(11, "#f2f0e9"))
      .setDepth(20)
      .setScrollFactor(0)
      .setOrigin(1, 0)
      .setAlpha(0.55)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => this.muteBtn.setAlpha(1))
      .on("pointerout", () => this.muteBtn.setAlpha(0.55))
      .on("pointerdown", () => {
        soundManager.toggleMute();
        this.muteBtn
          .setText(soundManager.muted ? "✕" : "♪")
          .setColor(soundManager.muted ? "#ff4444" : "#f2f0e9");
      });

    // Combo streak display — bottom-centre, revealed when combo fires
    this.comboTxt = this.add
      .text(W / 2, H - 28, "", mono(13, "#ff8800"))
      .setDepth(22)
      .setScrollFactor(0)
      .setOrigin(0.5)
      .setAlpha(0)
      .setVisible(false);
  }

  // ── Particles ─────────────────────────────────────────────────────────────────
  private createExplosionEmitter() {
    this.explosionEmitter = this.add
      .particles(0, 0, "particle", {
        lifespan: 520,
        speed: { min: 70, max: 230 },
        scale: { start: 1.3, end: 0 },
        alpha: { start: 1, end: 0 },
        tint: [0xe8ff00, 0xff8800, 0xff4444, 0xffffff],
        blendMode: "ADD",
        frequency: -1,
      })
      .setDepth(15);
  }

  explode(x: number, y: number, count = 18, tint?: number) {
    if (tint !== undefined) this.explosionEmitter.setParticleTint(tint);
    else this.explosionEmitter.setParticleTint(0xe8ff00);
    this.explosionEmitter.emitParticleAt(x, y, count);
    this.cameras.main.shake(110, 0.005);
  }

  // ── Input ──────────────────────────────────────────────────────────────────────
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
    this.pauseKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // Touch: drag to follow finger (X + Y), auto-fire while held
    this.input.on("pointermove", (ptr: Phaser.Input.Pointer) => {
      if (!this.active || !ptr.isDown) return;
      const W = this.scale.width;
      const H = this.scale.height;
      this.player.setX(Phaser.Math.Clamp(ptr.x, 24, W - 24));
      this.player.setY(Phaser.Math.Clamp(ptr.y, 50, H - 40));
    });
    this.input.on("pointerdown", () => {
      if (this.active) this.touchFiring = true;
    });
    this.input.on("pointerup", () => {
      this.touchFiring = false;
    });
  }

  private handleInput(time: number) {
    const { left, right, up, down } = this.cursors;
    const { left: a, right: d, up: w, down: s } = this.wasd;

    let dx = 0,
      dy = 0;
    if (left.isDown || a.isDown) dx = -1;
    if (right.isDown || d.isDown) dx = 1;
    if (up.isDown || w.isDown) dy = -1;
    if (down.isDown || s.isDown) dy = 1;
    if (dx !== 0 && dy !== 0) {
      dx *= 0.707;
      dy *= 0.707;
    }

    this.player.move(dx, dy);

    if (this.fireKey.isDown || this.touchFiring) this.player.fire(this.playerBullets, time);

    if (Phaser.Input.Keyboard.JustDown(this.bombKey)) {
      if (this.player.dropBomb(this)) this.doBomb();
    }
  }

  // ── Colliders ─────────────────────────────────────────────────────────────────
  private setupColliders() {
    // Player bullets → enemies
    this.physics.add.overlap(this.playerBullets, this.enemies, (b, e) =>
      this.onBulletHitEnemy(b as Phaser.Physics.Arcade.Sprite, e as Enemy)
    );

    // Player bullets → boss
    this.physics.add.overlap(this.playerBullets, this.bossGroup, (b, bo) =>
      this.onBulletHitBoss(b as Phaser.Physics.Arcade.Sprite, bo as Boss)
    );

    // Enemy bullets → player
    this.physics.add.overlap(this.enemyBullets, this.player, (b) =>
      this.onEnemyBulletHitPlayer(b as Phaser.Physics.Arcade.Sprite)
    );

    // Kamikaze body → player
    this.physics.add.overlap(this.enemies, this.player, (_e, _p) => {
      const enemy = _e as Enemy;
      if (!enemy.active) return;
      // Only kamikaze and carrier deal body damage
      if (enemy.eType === "kamikaze" || enemy.eType === "carrier") {
        enemy.setActive(false).setVisible(false);
        this.onPlayerHit();
      }
    });

    // Pickups → player
    this.physics.add.overlap(this.pickups, this.player, (pk) => {
      const p = pk as Phaser.Physics.Arcade.Sprite;
      if (!p.active) return;
      p.setActive(false).setVisible(false);
      soundManager.pickupStar();
      this.starsCollected += 1;
      this.broadcastScore();
    });

    // Power-up capsules → player
    this.physics.add.overlap(this.powerupGroup, this.player, (pu) => {
      const p = pu as Phaser.Physics.Arcade.Sprite;
      if (!p.active) return;
      const key = p.texture.key;
      p.setActive(false).setVisible(false);
      this.collectPowerup(key);
    });
  }

  // ── Collision callbacks ───────────────────────────────────────────────────────
  private onBulletHitEnemy(bullet: Phaser.Physics.Arcade.Sprite, enemy: Enemy) {
    if (!bullet.active || !enemy.active) return;
    this.killBullet(bullet);
    soundManager.enemyHit();
    if (enemy.takeDamage(1)) {
      // ── Combo chain ──────────────────────────────────────────────
      const now = this.time.now;
      if (now - this.lastKillTime < this.COMBO_WINDOW) {
        this.comboCount++;
      } else {
        this.comboCount = 1;
      }
      this.lastKillTime = now;

      let pts = enemy.points;
      if (this.comboCount >= 2) {
        pts = Math.floor(pts * this.comboCount);
        soundManager.combo(this.comboCount);
      }
      this.showFloatingScore(enemy.x, enemy.y, pts, this.comboCount);
      this.updateComboHUD();
      // ─────────────────────────────────────────────────────────────

      this.starsCollected += enemy.starDrop;
      this.score += pts;
      this.explode(enemy.x, enemy.y, 20);
      soundManager.enemyDie();
      this.spawnPickup(enemy.x, enemy.y, enemy.starDrop);
      this.tryDropPowerup(enemy.x, enemy.y);
      enemy.setActive(false).setVisible(false);
      this.broadcastScore();
    }
  }

  private onBulletHitBoss(bullet: Phaser.Physics.Arcade.Sprite, bossObj: Boss) {
    if (!bullet.active || !bossObj.active || !this.boss) return;
    this.killBullet(bullet);
    soundManager.enemyHit();
    if (this.boss.takeDamage(1)) {
      this.onBossKilled();
    }
  }

  private onEnemyBulletHitPlayer(bullet: Phaser.Physics.Arcade.Sprite) {
    if (!bullet.active) return;
    this.killBullet(bullet);
    this.onPlayerHit();
  }

  // ── Enemy management ──────────────────────────────────────────────────────────
  private updateEnemies(time: number, delta: number, W: number, H: number) {
    const px = this.player.x;
    const py = this.player.y;

    (this.enemies.getChildren() as Enemy[]).forEach((e) => {
      if (!e.active) return;
      e.tick(time, delta, px, py, W, H, this.enemyBullets);
    });

    if (this.boss?.active) {
      this.boss.tick(time, delta, px, py, W, H, this.enemyBullets);
    }
  }

  // ── Wave spawning ─────────────────────────────────────────────────────────────
  startWave(wave: number) {
    this.currentWave = wave;
    this.waveHitCount = 0;
    this.waveClearFired = false;
    this.updateHUD();

    const waveData = getWave(this.currentStage, wave);
    if (!waveData) {
      // Shouldn't happen; safety fall-through to stage complete
      this.onStageComplete();
      return;
    }

    if (waveData.kind === "boss") {
      soundManager.bossWarning();
      this.showBanner("⚠ BOSS INCOMING ⚠", "#ff4444");
      this.time.delayedCall(1200, () => this.spawnBoss());
    } else {
      const stageName = STAGE_NAMES[this.currentStage] ?? "BEGIN";
      const label = wave === 1 ? `STAGE ${this.currentStage} — ${stageName}` : `WAVE ${wave}`;
      this.showBanner(label, "#e8ff00");
      this.time.delayedCall(700, () => {
        if (!this.active) return;
        this.spawnWave(waveData.specs, waveData.interval);
      });
    }
  }

  private spawnWave(specs: import("../StageManager").SpawnSpec[], interval: number) {
    const W = this.scale.width;
    const H = this.scale.height;
    let delay = 0;

    for (const spec of specs) {
      const hSpacing = Math.min(60, (W * 0.75) / spec.cols);
      const vSpacing = 52;
      const startX = W / 2 - ((spec.cols - 1) / 2) * hSpacing;
      const formY = H * spec.formY;

      for (let i = 0; i < spec.count; i++) {
        const col = i % spec.cols;
        const row = Math.floor(i / spec.cols);
        const ex = startX + col * hSpacing;
        const ef = formY + row * vSpacing;
        const hpM = spec.hpMult ?? 1;

        this.pendingSpawns++;
        this.time.delayedCall(delay, () => {
          if (!this.active) {
            this.pendingSpawns--;
            return;
          }
          const e = new Enemy(this, ex, -60 - row * 30, spec.type, hpM);
          e.formY = ef;
          e.speedMult = 1 + (this.currentStage - 1) * 0.22; // 1.0 / 1.22 / 1.44
          this.enemies.add(e);
          this.pendingSpawns--;
        });
        delay += interval;
      }
    }
  }

  private spawnBoss() {
    if (!this.active) return;
    const W = this.scale.width;
    const stg = Math.min(this.currentStage, 3) as 1 | 2 | 3;
    this.boss = new Boss(this, W / 2, -100, stg);
    this.bossGroup.add(this.boss);
  }

  // ── Bomb ──────────────────────────────────────────────────────────────────────
  private doBomb() {
    // Kill all active regular enemies
    (this.enemies.getChildren() as Enemy[]).forEach((e) => {
      if (!e.active) return;
      this.explode(e.x, e.y, 10);
      this.score += Math.floor(e.points * 0.5);
      e.setActive(false).setVisible(false);
    });

    // Heavy damage to boss
    if (this.boss?.active) {
      if (this.boss.takeDamage(8)) this.onBossKilled();
    }

    // Clear enemy bullets
    (this.enemyBullets.getChildren() as Phaser.Physics.Arcade.Sprite[]).forEach((b) => {
      if (b.active) this.killBullet(b);
    });

    soundManager.bomb();
    this.cameras.main.flash(220, 255, 255, 120);
    this.broadcastScore();
  }

  // ── Player hit ────────────────────────────────────────────────────────────────
  onPlayerHit() {
    if (!this.active) return;
    soundManager.playerHit();
    this.comboCount = 0; // break combo on damage
    const result = this.player.hit();
    if (result === "dead") {
      this.waveHitCount++;
      this.triggerGameOver();
    } else if (result === "life") {
      this.waveHitCount++;
      this.explode(this.player.x, this.player.y, 14, 0xff4444);
    }
    // "shield" result: shielded hit doesn't break the perfect streak
    this.broadcastScore();
  }

  // ── Wave clear ────────────────────────────────────────────────────────────────
  private checkWaveCleared() {
    if (!this.active || this.waveClearFired) return;
    if (this.boss) return; // boss wave; handled in onBossKilled

    const alive = (this.enemies.getChildren() as Enemy[]).filter((e) => e.active).length;
    if (alive === 0 && this.pendingSpawns === 0) {
      this.waveClearFired = true;
      this.time.delayedCall(900, () => {
        if (this.active) this.onWaveCleared();
      });
    }
  }

  private onWaveCleared() {
    if (this.waveHitCount === 0) {
      const bonus = 500 * this.currentWave;
      this.score += bonus;
      this.broadcastScore();
      this.showPerfectWave(bonus);
      // Extra pause so the player sees the banner before next wave begins
      this.time.delayedCall(1400, () => {
        if (this.active) this.advanceWave();
      });
      return;
    }
    this.advanceWave();
  }

  private advanceWave() {
    const maxWaves = getWaveCount(this.currentStage);
    if (this.currentWave < maxWaves) {
      this.startWave(this.currentWave + 1);
    } else {
      this.onStageComplete();
    }
  }

  private showPerfectWave(bonus: number) {
    const W = this.scale.width;
    const H = this.scale.height;
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: "16px",
      color: "#44ff88",
      stroke: "#000000",
      strokeThickness: 3,
    };
    const txt = this.add
      .text(W / 2, H / 2 + 14, `PERFECT WAVE  +${bonus}`, style)
      .setDepth(35)
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.tweens.add({
      targets: txt,
      y: H / 2 - 40,
      alpha: { from: 1, to: 0 },
      duration: 1300,
      ease: "Power1",
      onComplete: () => txt.destroy(),
    });
  }

  private onBossKilled() {
    const bossScore = [0, 2000, 3500, 5500][this.currentStage] ?? 2000;
    this.score += bossScore;
    this.explode(this.boss!.x, this.boss!.y, 45, 0xff4444);
    soundManager.bigExplosion();
    this.cameras.main.shake(700, 0.022);
    this.cameras.main.flash(180, 255, 200, 60);
    this.boss!.destroy();
    this.boss = null;
    this.bossGroup.clear(false, false);
    this.broadcastScore();
    this.time.delayedCall(1600, () => {
      if (this.active) this.onStageComplete();
    });
  }

  private onStageComplete() {
    this.active = false;
    if (this.currentStage >= 3) {
      soundManager.victory();
      EventBus.emit(EV.GAME_WIN, { score: this.score });
    } else {
      soundManager.stageComplete();
      EventBus.emit(EV.STAGE_COMPLETE, {
        stage: this.currentStage,
        stars: this.starsCollected,
        totalScore: this.score,
      });
    }
  }

  triggerGameOver() {
    this.active = false;
    soundManager.gameOver();
    this.player.setVisible(false);
    this.time.delayedCall(800, () => {
      EventBus.emit(EV.GAME_OVER, {
        score: this.score,
        stage: this.currentStage,
      });
    });
  }

  // ── Pickups ───────────────────────────────────────────────────────────────────
  private spawnPickup(x: number, y: number, count: number) {
    for (let i = 0; i < count; i++) {
      const px = this.pickups.get(
        x + Phaser.Math.Between(-12, 12),
        y,
        "pickup_star"
      ) as Phaser.Physics.Arcade.Sprite | null;
      if (!px) continue;
      px.setActive(true).setVisible(true).setDepth(5);
      (px.body as Phaser.Physics.Arcade.Body).setVelocity(
        Phaser.Math.Between(-45, 45),
        Phaser.Math.Between(50, 90)
      );
    }
  }

  // ── Bullet recycling ─────────────────────────────────────────────────────────
  private killBullet(b: Phaser.Physics.Arcade.Sprite) {
    b.setActive(false).setVisible(false);
    (b.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
  }

  private cleanBullets(W: number, H: number) {
    const recycle = (g: Phaser.Physics.Arcade.Group) =>
      (g.getChildren() as Phaser.Physics.Arcade.Sprite[]).forEach((b) => {
        if (!b.active) return;
        if (b.y < -50 || b.y > H + 50 || b.x < -50 || b.x > W + 50) this.killBullet(b);
      });
    recycle(this.playerBullets);
    recycle(this.enemyBullets);
  }

  private cleanPickups(H: number) {
    const offscreen = (p: Phaser.Physics.Arcade.Sprite) => {
      if (p.active && p.y > H + 40) p.setActive(false).setVisible(false);
    };
    (this.pickups.getChildren() as Phaser.Physics.Arcade.Sprite[]).forEach(offscreen);
    (this.powerupGroup.getChildren() as Phaser.Physics.Arcade.Sprite[]).forEach(offscreen);
  }

  // ── EventBus ──────────────────────────────────────────────────────────────────
  private setupEventBus() {
    EventBus.on(EV.START_GAME, (payload: StartPayload) => {
      this.playerName = payload.playerName;
      this.upgrades = { ...payload.upgrades };
      this.score = 0;
      this.starsCollected = 0;
      this.currentStage = 1;
      this.currentWave = 0;
      this.comboCount = 0;
      this.lastKillTime = 0;
      this.waveHitCount = 0;
      this.gamePaused = false;
      this.comboTxtTimer?.remove();
      this.comboTxt.setVisible(false).setAlpha(0);
      this.active = true;

      this.clearAllEnemies();
      this.player.applyUpgrades(this.upgrades);
      this.player.lives = 3;
      this.player.score = 0;
      this.player.stars = 0;
      this.player.setPosition(this.scale.width / 2, this.scale.height - 80);
      this.player.setVisible(true).setActive(true).setAlpha(1);

      this.startWave(1);
    });

    EventBus.on(EV.RESUME_STAGE, (payload: { upgrades: Upgrades; stage: number }) => {
      this.upgrades = { ...payload.upgrades };
      this.currentStage = payload.stage;
      this.currentWave = 0;
      this.starsCollected = 0;
      this.comboCount = 0;
      this.lastKillTime = 0;
      this.waveHitCount = 0;
      this.gamePaused = false;
      this.comboTxtTimer?.remove();
      this.comboTxt.setVisible(false).setAlpha(0);
      this.active = true;

      this.clearAllEnemies();
      this.player.applyUpgrades(payload.upgrades);
      this.player.setVisible(true).setActive(true).setAlpha(1);

      this.startWave(1);
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────
  private clearAllEnemies() {
    (this.enemies.getChildren() as Enemy[]).forEach((e) => {
      if (e.active) e.setActive(false).setVisible(false);
    });
    if (this.boss) {
      this.boss.destroy();
      this.boss = null;
    }
    this.bossGroup.clear(false, false);
    (this.enemyBullets.getChildren() as Phaser.Physics.Arcade.Sprite[]).forEach((b) => {
      if (b.active) this.killBullet(b);
    });
    // Clear in-flight power-up capsules
    (this.powerupGroup.getChildren() as Phaser.Physics.Arcade.Sprite[]).forEach((p) => {
      if (p.active) p.setActive(false).setVisible(false);
    });
    this.pendingSpawns = 0;
    this.waveClearFired = false;
  }

  private showBanner(text: string, color = "#e8ff00") {
    this.waveBanner.setText(text).setColor(color).setVisible(true).setAlpha(0);

    this.tweens.add({
      targets: this.waveBanner,
      alpha: { from: 0, to: 1 },
      duration: 320,
      yoyo: true,
      hold: 900,
      onComplete: () => {
        this.waveBanner.setVisible(false);
      },
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

  // ── HUD update ────────────────────────────────────────────────────────────────
  private updateHUD() {
    this.scoreTxt.setText(String(this.score).padStart(7, "0"));
    this.waveTxt.setText(`WAVE ${String(this.currentWave).padStart(2, "0")}`);
    this.stageTxt.setText(`STAGE ${this.currentStage}`);
    const l = this.player?.lives ?? 0;
    this.livesTxt.setText("▶".repeat(Math.max(0, l)) + "◻".repeat(Math.max(0, 3 - l)));
    this.starsTxt.setText(`★ ${String(this.starsCollected).padStart(3, "0")}`);
    const b = this.player?.bombs ?? 0;
    this.bombsTxt.setText(b > 0 ? `✕ BOMB ×${b}` : "");
  }

  // ── Resize ────────────────────────────────────────────────────────────────────
  private onResize(gs: Phaser.Structs.Size) {
    const W = gs.width;
    const H = gs.height;
    this.bgFar.setSize(W, H);
    this.bgNebula.setSize(W, H);
    this.bgNear.setSize(W, H);
    if (this.player) this.player.setY(Math.min(this.player.y, H - 60));
    this.scoreTxt?.setX(W / 2);
    this.livesTxt?.setX(W - 16);
    this.starsTxt?.setX(W - 16);
    this.muteBtn?.setX(W - 16);
    this.waveBanner?.setPosition(W / 2, H / 2 - 40);
    this.comboTxt?.setPosition(W / 2, H - 28);
    this.pauseContainer?.setPosition(W / 2, H / 2);
  }

  // ── Power-up drops ────────────────────────────────────────────────────────────
  private tryDropPowerup(x: number, y: number) {
    if (Math.random() > 0.12) return; // 12 % drop chance

    // Weighted selection
    const weights: [string, number][] = [
      ["pu_gun", 30],
      ["pu_shield", 30],
      ["pu_speed", 25],
      ["pu_bomb", 15],
    ];
    let roll = Math.random() * 100;
    let chosen = "pu_gun";
    for (const [key, w] of weights) {
      roll -= w;
      if (roll <= 0) {
        chosen = key;
        break;
      }
    }

    const pu = this.powerupGroup.get(x, y, chosen) as Phaser.Physics.Arcade.Sprite | null;
    if (!pu) return;
    pu.setActive(true).setVisible(true).setDepth(5).setTexture(chosen);
    (pu.body as Phaser.Physics.Arcade.Body).setVelocity(
      Phaser.Math.Between(-40, 40),
      Phaser.Math.Between(45, 80)
    );
  }

  private collectPowerup(type: string) {
    soundManager.pickupPowerup();
    this.cameras.main.flash(90, 255, 255, 80);
    const u = this.player.upgrades;

    switch (type) {
      case "pu_gun":
        if (u.gunLevel < 3) {
          u.gunLevel = (u.gunLevel + 1) as 0 | 1 | 2 | 3;
          this.showPowerupFlash("GUN UP!", "#e8ff00");
        } else {
          this.score += 300;
          this.showPowerupFlash("+300", "#888");
        }
        break;
      case "pu_shield":
        this.player.giveShield();
        this.showPowerupFlash("SHIELD UP!", "#00cfff");
        break;
      case "pu_speed":
        if ((u.speedLevel as number) < 3) {
          u.speedLevel = ((u.speedLevel as number) + 1) as 1 | 2 | 3;
          this.showPowerupFlash("SPEED UP!", "#44ff88");
        } else {
          this.score += 300;
          this.showPowerupFlash("+300", "#888");
        }
        break;
      case "pu_bomb":
        this.player.giveBomb();
        this.showPowerupFlash("BOMB!", "#ff4444");
        break;
    }
    this.broadcastScore();
  }

  private showPowerupFlash(text: string, color: string) {
    const px = this.player.x;
    const py = this.player.y - 44;
    const txt = this.add
      .text(px, py, text, {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "13px",
        color,
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setDepth(28)
      .setOrigin(0.5);

    this.tweens.add({
      targets: txt,
      y: py - 48,
      alpha: { from: 1, to: 0 },
      duration: 1100,
      ease: "Power1",
      onComplete: () => txt.destroy(),
    });
  }

  // ── Combo HUD update ──────────────────────────────────────────────────────────
  private updateComboHUD() {
    if (this.comboCount < 2) return;

    const color =
      this.comboCount >= 5
        ? "#ff4444"
        : this.comboCount >= 4
          ? "#ff8800"
          : this.comboCount >= 3
            ? "#ffcc00"
            : "#ff9900";
    this.comboTxt
      .setText(`× ${this.comboCount}  COMBO`)
      .setColor(color)
      .setVisible(true)
      .setAlpha(1);

    // Auto-fade after window expires
    this.comboTxtTimer?.remove();
    this.comboTxtTimer = this.time.delayedCall(this.COMBO_WINDOW, () => {
      this.tweens.add({
        targets: this.comboTxt,
        alpha: 0,
        duration: 380,
        onComplete: () => this.comboTxt.setVisible(false),
      });
    });
  }

  // ── Floating score label ──────────────────────────────────────────────────────
  private showFloatingScore(x: number, y: number, pts: number, combo = 0) {
    const label = combo >= 2 ? `×${combo}  +${pts}` : `+${pts}`;
    const color =
      combo >= 4 ? "#ff4444" : combo >= 3 ? "#ff8800" : combo >= 2 ? "#e8ff00" : "#f2f0e9";
    const size = combo >= 2 ? 14 : 11;
    const txt = this.add
      .text(x, y, label, {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: `${size}px`,
        color,
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setDepth(25)
      .setOrigin(0.5);

    this.tweens.add({
      targets: txt,
      y: y - 52,
      alpha: { from: 1, to: 0 },
      duration: 920,
      ease: "Power1",
      onComplete: () => txt.destroy(),
    });
  }

  // ── Pause overlay ─────────────────────────────────────────────────────────────
  private createPauseOverlay() {
    const { width: W, height: H } = this.scale;
    const mono = (size: number, color = "#f2f0e9"): Phaser.Types.GameObjects.Text.TextStyle => ({
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: `${size}px`,
      color,
      stroke: "#000000",
      strokeThickness: 3,
    });

    // Oversized background so it covers screen after resize
    const bg = this.add.rectangle(0, 0, W + 400, H + 400, 0x000000, 0.82);

    const title = this.add.text(0, -90, "PAUSED", mono(26, "#e8ff00")).setOrigin(0.5);

    const hint = this.add.text(0, -50, "P / ESC — TOGGLE", mono(8, "#555555")).setOrigin(0.5);

    const resumeBtn = this.add
      .text(0, 4, "[ RESUME ]", mono(12, "#f2f0e9"))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => resumeBtn.setColor("#e8ff00"))
      .on("pointerout", () => resumeBtn.setColor("#f2f0e9"))
      .on("pointerdown", () => this.togglePause());

    const quitBtn = this.add
      .text(0, 54, "[ QUIT TO MENU ]", mono(12, "#f2f0e9"))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => quitBtn.setColor("#ff4444"))
      .on("pointerout", () => quitBtn.setColor("#f2f0e9"))
      .on("pointerdown", () => this.quitToMenu());

    this.pauseContainer = this.add
      .container(W / 2, H / 2, [bg, title, hint, resumeBtn, quitBtn])
      .setDepth(60)
      .setScrollFactor(0)
      .setVisible(false);
  }

  private togglePause() {
    if (!this.active && !this.gamePaused) return;
    this.gamePaused = !this.gamePaused;
    if (this.gamePaused) {
      this.physics.pause();
      this.tweens.pauseAll();
      this.time.paused = true;
      this.pauseContainer.setVisible(true);
    } else {
      this.physics.resume();
      this.tweens.resumeAll();
      this.time.paused = false;
      this.pauseContainer.setVisible(false);
    }
  }

  private quitToMenu() {
    this.gamePaused = false;
    this.active = false;
    this.physics.resume();
    this.tweens.resumeAll();
    this.time.paused = false;
    this.pauseContainer.setVisible(false);
    this.comboTxtTimer?.remove();
    this.comboTxt.setVisible(false).setAlpha(0);
    this.player.setVisible(false).setAlpha(1);
    this.clearAllEnemies();
    EventBus.emit(EV.QUIT_TO_MENU);
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────────
  shutdown() {
    EventBus.off(EV.START_GAME);
    EventBus.off(EV.RESUME_STAGE);
    this.scale.off("resize", this.onResize, this);
  }
}
