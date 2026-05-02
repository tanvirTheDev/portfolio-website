import Phaser from "phaser";
import type { Upgrades } from "../EventBus";

const SPEED_MAP: Record<1 | 2 | 3, number> = { 1: 280, 2: 360, 3: 440 };
const FIRE_RATE_MAP: Record<0 | 1 | 2 | 3, number> = { 0: 260, 1: 220, 2: 180, 3: 140 }; // ms between shots

export class Player extends Phaser.Physics.Arcade.Sprite {
  // Upgrade state
  upgrades!: Upgrades;

  // Runtime state
  lives = 3;
  score = 0;
  stars = 0;
  shieldHp = 0;
  bombs = 0;
  lastFired = 0;
  invincible = false;
  invincibleTimer?: Phaser.Time.TimerEvent;

  // Visual
  engineEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  shieldSprite?: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(10);
    this.setOrigin(0.5, 0.5);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setMaxVelocity(500, 500);
    body.setDragX(900);
    body.setDragY(900);

    // Shrink hitbox slightly — more forgiving feel
    body.setSize(this.width * 0.45, this.height * 0.55);
    body.setOffset(this.width * 0.275, this.height * 0.2);

    this.makeEngineTrail();
  }

  applyUpgrades(upgrades: Upgrades) {
    this.upgrades = { ...upgrades };
    this.shieldHp = upgrades.shieldLevel;
    this.bombs = upgrades.bombLevel;
    this.updateShieldVisual();
  }

  // ── Movement ────────────────────────────────────────────────────────────────
  move(dx: number, dy: number) {
    const spd = SPEED_MAP[this.upgrades?.speedLevel ?? 1];
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(dx * spd, dy * spd);

    // Tilt slightly in direction of horizontal movement
    this.setAngle(dx * 8);
  }

  // ── Weapons ─────────────────────────────────────────────────────────────────
  fire(bulletGroup: Phaser.Physics.Arcade.Group, time: number) {
    const gunLvl = this.upgrades?.gunLevel ?? 0;
    const cd = FIRE_RATE_MAP[gunLvl as 0 | 1 | 2 | 3];
    if (time - this.lastFired < cd) return;
    this.lastFired = time;

    const x = this.x;
    const y = this.y - this.height * 0.5;

    switch (gunLvl) {
      case 0: // Single
        this.spawnBullet(bulletGroup, x, y, 0, -700, "bullet_p");
        break;
      case 1: // Double barrel
        this.spawnBullet(bulletGroup, x - 8, y, 0, -700, "bullet_p");
        this.spawnBullet(bulletGroup, x + 8, y, 0, -700, "bullet_p");
        break;
      case 2: // Spread (3-way)
        this.spawnBullet(bulletGroup, x, y, 0, -700, "bullet_p");
        this.spawnBullet(bulletGroup, x - 10, y, -160, -680, "bullet_spread");
        this.spawnBullet(bulletGroup, x + 10, y, 160, -680, "bullet_spread");
        break;
      case 3: // Laser (rapid single with wide beam)
        this.spawnBullet(bulletGroup, x, y, 0, -900, "bullet_laser");
        break;
    }

    this.scene.sound.play("sfx_shoot", { volume: 0.06 });
  }

  private spawnBullet(
    group: Phaser.Physics.Arcade.Group,
    x: number,
    y: number,
    vx: number,
    vy: number,
    texture: string
  ) {
    const b = group.get(x, y, texture) as Phaser.Physics.Arcade.Sprite | null;
    if (!b) return;
    b.setActive(true).setVisible(true).setDepth(9);
    (b.body as Phaser.Physics.Arcade.Body).setVelocity(vx, vy);
    b.setRotation(vx !== 0 ? Math.atan2(vy, vx) + Math.PI / 2 : 0);
  }

  // ── Bomb ────────────────────────────────────────────────────────────────────
  dropBomb(scene: Phaser.Scene): boolean {
    if (this.bombs <= 0) return false;
    this.bombs--;
    // Emit flash — GameScene listens for this
    scene.cameras.main.flash(300, 255, 255, 100);
    scene.cameras.main.shake(200, 0.015);
    return true;
  }

  // ── Damage ──────────────────────────────────────────────────────────────────
  hit(): "shield" | "life" | "dead" {
    if (this.invincible) return "shield"; // absorbed by invincibility

    if (this.shieldHp > 0) {
      this.shieldHp--;
      this.updateShieldVisual();
      this.flashInvincible(600);
      return "shield";
    }

    this.lives--;
    this.flashInvincible(2200);
    if (this.lives <= 0) return "dead";
    return "life";
  }

  private flashInvincible(ms: number) {
    this.invincible = true;
    this.invincibleTimer?.remove();
    // Blink tween
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 0.2, to: 1 },
      duration: 80,
      repeat: Math.floor(ms / 160),
      yoyo: true,
      onComplete: () => {
        this.setAlpha(1);
      },
    });
    this.invincibleTimer = this.scene.time.delayedCall(ms, () => {
      this.invincible = false;
    });
  }

  // ── Shield visual ───────────────────────────────────────────────────────────
  private updateShieldVisual() {
    if (this.shieldHp > 0) {
      if (!this.shieldSprite) {
        this.shieldSprite = this.scene.add
          .circle(this.x, this.y, 36, 0x00cfff, 0.15)
          .setStrokeStyle(2, 0x00cfff, 0.7)
          .setDepth(11);
      }
    } else {
      this.shieldSprite?.destroy();
      this.shieldSprite = undefined;
    }
  }

  // ── Engine particles ────────────────────────────────────────────────────────
  private makeEngineTrail() {
    this.engineEmitter = this.scene.add
      .particles(this.x, this.y, "particle", {
        lifespan: 320,
        speed: { min: 60, max: 120 },
        scale: { start: 0.6, end: 0 },
        alpha: { start: 0.7, end: 0 },
        tint: [0xe8ff00, 0xff8800, 0xffff44],
        angle: { min: 80, max: 100 }, // downward spread
        frequency: 20,
        blendMode: "ADD",
      })
      .setDepth(8);
  }

  // ── Update ──────────────────────────────────────────────────────────────────
  update() {
    // Sync engine trail to ship position
    this.engineEmitter.setPosition(this.x, this.y + this.height * 0.45);

    // Sync shield
    if (this.shieldSprite) {
      this.shieldSprite.setPosition(this.x, this.y);
    }
  }

  // ── Cleanup ─────────────────────────────────────────────────────────────────
  destroy(fromScene?: boolean) {
    this.engineEmitter?.destroy();
    this.shieldSprite?.destroy();
    this.invincibleTimer?.remove();
    super.destroy(fromScene);
  }
}
