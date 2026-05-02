import Phaser from "phaser";

// ── Enemy type registry ────────────────────────────────────────────────────────
export const ETYPE = {
  GRUNT: "grunt",
  ZIGZAG: "zigzag",
  TURRET: "turret",
  KAMIKAZE: "kamikaze",
  CARRIER: "carrier",
} as const;

export type EnemyType = (typeof ETYPE)[keyof typeof ETYPE];

interface EnemyCfg {
  texture: string;
  hp: number;
  points: number;
  starDrop: number;
  shootInterval: number; // ms between shots; 0 = never
}

const CFG: Record<EnemyType, EnemyCfg> = {
  grunt: { texture: "enemy_grunt", hp: 2, points: 100, starDrop: 1, shootInterval: 2200 },
  zigzag: { texture: "enemy_zigzag", hp: 2, points: 150, starDrop: 2, shootInterval: 1800 },
  turret: { texture: "enemy_turret", hp: 4, points: 250, starDrop: 3, shootInterval: 800 },
  kamikaze: { texture: "enemy_kamikaze", hp: 1, points: 200, starDrop: 2, shootInterval: 0 },
  carrier: { texture: "enemy_carrier", hp: 10, points: 600, starDrop: 8, shootInterval: 1400 },
};

// ── Enemy ──────────────────────────────────────────────────────────────────────
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  eType: EnemyType;
  hp: number;
  readonly points: number;
  readonly starDrop: number;
  readonly shootInterval: number;
  lastShot = 0;

  /** Formation / patrol state */
  formY = 0; // target Y for the entry phase
  phase: "entry" | "patrol" = "entry";

  /** Speed multiplier — set by GameScene based on current stage */
  speedMult = 1.0;

  /** Per-type movement accumulators */
  sineT = 0; // grunt / zigzag oscillation timer
  diveVx = 0; // kamikaze resolved velocity
  diveVy = 0;
  carrierDir = 1; // carrier: +1 right, −1 left

  constructor(scene: Phaser.Scene, x: number, y: number, type: EnemyType, hpMult = 1) {
    const cfg = CFG[type];
    super(scene, x, y, cfg.texture);

    this.eType = type;
    this.hp = Math.ceil(cfg.hp * hpMult);
    this.points = cfg.points;
    this.starDrop = cfg.starDrop;
    this.shootInterval = cfg.shootInterval;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(6).setFlipY(true);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    // Slightly tighter hitbox
    body.setSize(this.width * 0.7, this.height * 0.7);
    body.setOffset(this.width * 0.15, this.height * 0.15);
  }

  // ── Frame update ─────────────────────────────────────────────────────────────
  tick(
    time: number,
    delta: number,
    playerX: number,
    playerY: number,
    W: number,
    H: number,
    bulletGroup: Phaser.Physics.Arcade.Group
  ) {
    if (!this.active) return;

    const dt = delta / 1000;
    const body = this.body as Phaser.Physics.Arcade.Body;

    switch (this.eType) {
      case ETYPE.GRUNT:
        this.moveGrunt(dt, W, body);
        break;
      case ETYPE.ZIGZAG:
        this.moveZigzag(dt, W, body);
        break;
      case ETYPE.TURRET:
        this.moveTurret(dt, W, body);
        break;
      case ETYPE.KAMIKAZE:
        this.moveKamikaze(dt, playerX, playerY, body);
        break;
      case ETYPE.CARRIER:
        this.moveCarrier(dt, W, body);
        break;
    }

    // Recycle if past bottom
    if (this.y > H + 60) this.setActive(false).setVisible(false);

    // Shooting
    this.tryShoot(time, bulletGroup, playerX, playerY);
  }

  // ── Movement patterns ─────────────────────────────────────────────────────────
  private moveGrunt(dt: number, W: number, body: Phaser.Physics.Arcade.Body) {
    const sm = this.speedMult;
    if (this.phase === "entry") {
      body.setVelocityY(130 * sm);
      if (this.y >= this.formY) {
        this.setY(this.formY);
        body.setVelocity(0, 0);
        this.phase = "patrol";
      }
    } else {
      this.sineT += dt;
      body.setVelocityX(Math.sin(this.sineT * 1.2) * 65 * sm);
      body.setVelocityY(16 * sm);
      this.clampX(W, 30);
    }
  }

  private moveZigzag(dt: number, W: number, body: Phaser.Physics.Arcade.Body) {
    const sm = this.speedMult;
    this.sineT += dt;
    if (this.phase === "entry") {
      body.setVelocityY(120 * sm);
      if (this.y >= this.formY) this.phase = "patrol";
    } else {
      body.setVelocityX(Math.sin(this.sineT * 2.6) * 170 * sm);
      body.setVelocityY(28 * sm);
      this.clampX(W, 24);
    }
  }

  private moveTurret(dt: number, W: number, body: Phaser.Physics.Arcade.Body) {
    const sm = this.speedMult;
    if (this.phase === "entry") {
      body.setVelocityY(90 * sm);
      if (this.y >= this.formY) {
        body.setVelocity(0, 0);
        this.sineT = Math.random() * Math.PI * 2;
        this.phase = "patrol";
      }
    } else {
      this.sineT += dt;
      body.setVelocityX(Math.sin(this.sineT * 0.65) * 42 * sm);
      body.setVelocityY(0);
      this.clampX(W, 30);
    }
  }

  private moveKamikaze(
    dt: number,
    playerX: number,
    playerY: number,
    body: Phaser.Physics.Arcade.Body
  ) {
    const sm = this.speedMult;
    if (this.phase === "entry") {
      body.setVelocityY(70 * sm);
      if (this.y >= this.formY) {
        // Lock dive direction toward player
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const mag = Math.sqrt(dx * dx + dy * dy) || 1;
        const spd = 360 * sm;
        this.diveVx = (dx / mag) * spd;
        this.diveVy = (dy / mag) * spd;
        this.phase = "patrol";
      }
    } else {
      // Slight homing steer
      const dx = playerX - this.x;
      this.diveVx += dx * dt * 0.9;
      // Cap overall speed
      const cap = 420 * sm;
      const spd = Math.hypot(this.diveVx, this.diveVy);
      if (spd > cap) {
        this.diveVx = (this.diveVx / spd) * cap;
        this.diveVy = (this.diveVy / spd) * cap;
      }
      body.setVelocity(this.diveVx, this.diveVy);
    }
  }

  private moveCarrier(dt: number, W: number, body: Phaser.Physics.Arcade.Body) {
    const sm = this.speedMult;
    if (this.phase === "entry") {
      body.setVelocityY(55 * sm);
      if (this.y >= this.formY) {
        body.setVelocityY(0);
        this.phase = "patrol";
      }
    } else {
      body.setVelocityX(this.carrierDir * 40 * sm);
      body.setVelocityY(0);
      if (this.x > W - 60) this.carrierDir = -1;
      if (this.x < 60) this.carrierDir = 1;
    }
  }

  // ── Shooting ──────────────────────────────────────────────────────────────────
  private tryShoot(
    time: number,
    group: Phaser.Physics.Arcade.Group,
    playerX: number,
    playerY: number
  ) {
    if (this.shootInterval === 0) return;
    if (this.phase === "entry") return;
    if (time - this.lastShot < this.shootInterval) return;
    this.lastShot = time;

    if (this.eType === ETYPE.CARRIER) {
      // 3-way fan downward
      for (const [ox, vy, vx] of [
        [0, 210, 0],
        [-22, 185, -75],
        [22, 185, 75],
      ] as [number, number, number][]) {
        this.spawnBullet(group, this.x + ox, this.y + 20, vx, vy);
      }
    } else if (this.eType === ETYPE.TURRET) {
      // Aimed at player
      const dx = playerX - this.x;
      const dy = playerY - this.y;
      const mag = Math.sqrt(dx * dx + dy * dy) || 1;
      const spd = 285;
      this.spawnBullet(group, this.x, this.y + 16, (dx / mag) * spd, (dy / mag) * spd);
    } else {
      // Grunt / zigzag: straight down
      this.spawnBullet(group, this.x, this.y + 16, 0, 225);
    }
  }

  private spawnBullet(
    group: Phaser.Physics.Arcade.Group,
    x: number,
    y: number,
    vx: number,
    vy: number
  ) {
    const b = group.get(x, y, "bullet_e") as Phaser.Physics.Arcade.Sprite | null;
    if (!b) return;
    b.setActive(true).setVisible(true).setDepth(7);
    (b.body as Phaser.Physics.Arcade.Body).setVelocity(vx, vy);
  }

  // ── Damage ────────────────────────────────────────────────────────────────────
  /** Returns true when the enemy dies */
  takeDamage(dmg: number): boolean {
    this.hp -= dmg;
    this.setTint(0xffffff);
    this.scene.time.delayedCall(80, () => {
      if (this.active) this.clearTint();
    });
    return this.hp <= 0;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────
  private clampX(W: number, margin: number) {
    if (this.x < margin) this.setX(margin);
    if (this.x > W - margin) this.setX(W - margin);
  }
}
