import Phaser from "phaser";
import { soundManager } from "../SoundManager";

const HP_BY_STAGE = [0, 30, 50, 80] as const;
const PTS_BY_STAGE = [0, 2000, 3500, 5500] as const;

export class Boss extends Phaser.Physics.Arcade.Sprite {
  readonly stageNum: number;
  readonly maxHp: number;
  readonly points: number;
  hp: number;
  phase = 1; // 1 → 2 at 60 % HP, 2 → 3 (stage 3 only) at 30 %
  entry = true;
  private readonly baseTint: number; // per-stage colour

  // Movement
  moveT = 0;

  // Shooting
  lastShot1 = 0;
  lastShot2 = 0;

  // HUD
  private hpBar!: Phaser.GameObjects.Graphics;
  private hpLabel!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, stageNum: 1 | 2 | 3) {
    super(scene, x, y, "boss");
    this.stageNum = stageNum;
    this.maxHp = HP_BY_STAGE[stageNum];
    this.hp = this.maxHp;
    this.points = PTS_BY_STAGE[stageNum];

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Stage-based base tint: neutral → warm orange → angry red
    this.baseTint = stageNum === 3 ? 0xff8888 : stageNum === 2 ? 0xffcc88 : 0xffffff;

    this.setDepth(6)
      .setFlipY(true)
      .setScale(1 + stageNum * 0.18);
    if (stageNum > 1) this.setTint(this.baseTint);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(this.width * 0.75, this.height * 0.65);

    this.makeHUD(scene);
  }

  private makeHUD(scene: Phaser.Scene) {
    this.hpBar = scene.add.graphics().setDepth(25).setScrollFactor(0);
    this.hpLabel = scene.add
      .text(0, 0, "BOSS", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "8px",
        color: "#e8ff00",
        letterSpacing: 4,
      })
      .setDepth(26)
      .setScrollFactor(0);
  }

  // ── Frame update ──────────────────────────────────────────────────────────────
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

    if (this.entry) {
      body.setVelocityY(65);
      if (this.y >= 120) {
        this.entry = false;
        body.setVelocity(0, 0);
      }
    } else {
      this.moveT += dt;
      // Figure-8 — speeds up in phase 2+
      const spd = this.phase >= 2 ? 1.55 : 1.0;
      body.setVelocityX(Math.sin(this.moveT * spd) * W * 0.38);
      body.setVelocityY(Math.sin(this.moveT * spd * 2) * 42);
      // Clamp vertical range
      if (this.y < 70) this.setY(70);
      if (this.y > H * 0.38) this.setY(H * 0.38);

      this.handleFire(time, playerX, playerY, bulletGroup);
    }

    this.drawHUD(W);
  }

  // ── Shooting ──────────────────────────────────────────────────────────────────
  private handleFire(
    time: number,
    playerX: number,
    playerY: number,
    group: Phaser.Physics.Arcade.Group
  ) {
    const cd1 = this.phase >= 2 ? 850 : 1400;
    const cd2 = 2600;

    // Primary: aimed volley
    if (time - this.lastShot1 > cd1) {
      this.lastShot1 = time;
      this.aimBullet(group, this.x, this.y + 32, playerX, playerY, 265);
      if (this.phase >= 2) {
        this.aimBullet(group, this.x - 22, this.y + 22, playerX, playerY, 265);
        this.aimBullet(group, this.x + 22, this.y + 22, playerX, playerY, 265);
      }
    }

    // Secondary: 5-way spread (phase 2+)
    if (this.phase >= 2 && time - this.lastShot2 > cd2) {
      this.lastShot2 = time;
      for (let i = -2; i <= 2; i++) {
        const angle = Math.PI / 2 + i * (Math.PI / 9);
        const b = group.get(this.x, this.y + 44, "bullet_e") as Phaser.Physics.Arcade.Sprite | null;
        if (!b) continue;
        b.setActive(true).setVisible(true).setDepth(7).setScale(1.3);
        (b.body as Phaser.Physics.Arcade.Body).setVelocity(
          Math.cos(angle) * 200,
          Math.sin(angle) * 200
        );
      }
    }
  }

  private aimBullet(
    group: Phaser.Physics.Arcade.Group,
    x: number,
    y: number,
    px: number,
    py: number,
    spd: number
  ) {
    const b = group.get(x, y, "bullet_e") as Phaser.Physics.Arcade.Sprite | null;
    if (!b) return;
    b.setActive(true).setVisible(true).setDepth(7);
    const dx = px - x;
    const dy = py - y;
    const mag = Math.sqrt(dx * dx + dy * dy) || 1;
    (b.body as Phaser.Physics.Arcade.Body).setVelocity((dx / mag) * spd, (dy / mag) * spd);
  }

  // ── Damage ────────────────────────────────────────────────────────────────────
  /** Returns true when boss dies */
  takeDamage(dmg: number): boolean {
    this.hp -= dmg;
    this.setTint(0xff6666);
    this.scene.time.delayedCall(90, () => {
      if (this.active) this.setTint(this.baseTint);
    });

    const pct = this.hp / this.maxHp;

    if (this.phase === 1 && pct <= 0.6) {
      this.phase = 2;
      soundManager.bossPhaseChange();
      this.scene.cameras.main.shake(320, 0.016);
      this.scene.cameras.main.flash(120, 255, 100, 30);
      this.setTint(0xff4400);
      this.scene.time.delayedCall(500, () => {
        if (this.active) this.setTint(this.baseTint);
      });
    }
    if (this.phase === 2 && this.stageNum >= 3 && pct <= 0.3) {
      this.phase = 3;
      soundManager.bossPhaseChange();
      this.scene.cameras.main.shake(420, 0.022);
      this.scene.cameras.main.flash(180, 255, 60, 30);
      this.setTint(0xff0000);
      this.scene.time.delayedCall(600, () => {
        if (this.active) this.setTint(this.baseTint);
      });
    }

    return this.hp <= 0;
  }

  // ── HUD ───────────────────────────────────────────────────────────────────────
  private drawHUD(W: number) {
    const g = this.hpBar;
    g.clear();
    if (this.entry) return;

    const barW = Math.min(W - 48, 300);
    const barH = 7;
    const bx = (W - barW) / 2;
    const by = 10;
    const pct = Math.max(0, this.hp / this.maxHp);
    const col = pct > 0.5 ? 0xe8ff00 : pct > 0.28 ? 0xff8800 : 0xff3333;

    g.fillStyle(0x1a1a1a, 0.9);
    g.fillRect(bx - 1, by - 1, barW + 2, barH + 2);
    g.fillStyle(col, 1);
    g.fillRect(bx, by, Math.round(barW * pct), barH);

    // Phase threshold markers
    g.fillStyle(0xffffff, 0.35);
    g.fillRect(bx + Math.round(barW * 0.6) - 1, by - 2, 2, barH + 4);
    if (this.stageNum >= 3) {
      g.fillRect(bx + Math.round(barW * 0.3) - 1, by - 2, 2, barH + 4);
    }

    this.hpLabel.setPosition(bx, by + barH + 4);
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────────
  destroy(fromScene?: boolean) {
    this.hpBar?.destroy();
    this.hpLabel?.destroy();
    super.destroy(fromScene);
  }
}
