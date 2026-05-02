import Phaser from "phaser";

/**
 * BootScene — generates ALL procedural textures for the full game.
 * No image files. Every sprite is drawn with Phaser's Graphics API
 * and baked into a texture so scenes can use them by key.
 *
 * Runs once, then hands off to GameScene.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  create() {
    this.makePlayerTexture();
    this.makeBulletTextures();
    this.makeEnemyTextures();
    this.makeBossTexture();
    this.makePickupTextures();
    this.makeBgTextures();
    this.makeParticleTexture();
    this.scene.start("GameScene");
  }

  // ── Player ─────────────────────────────────────────────────────────────────
  private makePlayerTexture() {
    const W = 44,
      H = 52;
    const g = this.make.graphics({ x: 0, y: 0 }, false);

    // Main body — cream-coloured fighter
    g.fillStyle(0xf2f0e9, 1);
    g.beginPath();
    g.moveTo(W / 2, 0); // nose
    g.lineTo(W, H * 0.78); // right wing tip
    g.lineTo(W * 0.64, H * 0.62); // right inner notch
    g.lineTo(W * 0.58, H); // right engine
    g.lineTo(W * 0.42, H); // left engine
    g.lineTo(W * 0.36, H * 0.62); // left inner notch
    g.lineTo(0, H * 0.78); // left wing tip
    g.closePath();
    g.fillPath();

    // Cockpit
    g.fillStyle(0x0a0a0a, 1);
    g.fillEllipse(W / 2, H * 0.26, 10, 14);

    // Wing accent stripes
    g.fillStyle(0xe8ff00, 1);
    g.fillRect(W * 0.36, H * 0.55, W * 0.28, 3); // horizontal bar
    g.fillRect(W / 2 - 2, H * 0.08, 4, H * 0.44); // center stripe

    // Engine glow dots
    g.fillStyle(0xe8ff00, 0.8);
    g.fillCircle(W * 0.42, H - 4, 4);
    g.fillCircle(W * 0.58, H - 4, 4);

    g.generateTexture("player", W, H);
    g.destroy();
  }

  // ── Bullets ────────────────────────────────────────────────────────────────
  private makeBulletTextures() {
    // Player bullet — bright yellow laser bolt
    const bp = this.make.graphics({ x: 0, y: 0 }, false);
    bp.fillStyle(0xe8ff00, 1);
    bp.fillRect(0, 0, 4, 18);
    bp.fillStyle(0xffffff, 0.6);
    bp.fillRect(1, 0, 2, 18); // bright core
    bp.generateTexture("bullet_p", 4, 18);
    bp.destroy();

    // Enemy bullet — red oval
    const be = this.make.graphics({ x: 0, y: 0 }, false);
    be.fillStyle(0xff4444, 1);
    be.fillEllipse(4, 8, 8, 16);
    be.generateTexture("bullet_e", 8, 16);
    be.destroy();

    // Spread bullet — angled yellow
    const bs = this.make.graphics({ x: 0, y: 0 }, false);
    bs.fillStyle(0xffcc00, 1);
    bs.fillRect(0, 0, 3, 14);
    bs.generateTexture("bullet_spread", 3, 14);
    bs.destroy();

    // Laser beam segment — wide beam
    const bl = this.make.graphics({ x: 0, y: 0 }, false);
    bl.fillStyle(0x00ffff, 1);
    bl.fillRect(0, 0, 8, 24);
    bl.fillStyle(0xffffff, 0.5);
    bl.fillRect(2, 0, 4, 24);
    bl.generateTexture("bullet_laser", 8, 24);
    bl.destroy();
  }

  // ── Enemies ────────────────────────────────────────────────────────────────
  private makeEnemyTextures() {
    // GRUNT — basic diamond fighter
    const grunt = this.make.graphics({ x: 0, y: 0 }, false);
    grunt.fillStyle(0xf2f0e9, 0.85);
    grunt.beginPath();
    grunt.moveTo(18, 0);
    grunt.lineTo(36, 16);
    grunt.lineTo(36, 28);
    grunt.lineTo(18, 38);
    grunt.lineTo(0, 28);
    grunt.lineTo(0, 16);
    grunt.closePath();
    grunt.fillPath();
    grunt.fillStyle(0xe8ff00, 1);
    grunt.fillRect(14, 10, 8, 4);
    grunt.generateTexture("enemy_grunt", 36, 38);
    grunt.destroy();

    // ZIGZAG — angled swept-wing fighter
    const zigzag = this.make.graphics({ x: 0, y: 0 }, false);
    zigzag.fillStyle(0xddaa44, 0.9);
    zigzag.beginPath();
    zigzag.moveTo(20, 0);
    zigzag.lineTo(40, 20);
    zigzag.lineTo(32, 36);
    zigzag.lineTo(20, 28);
    zigzag.lineTo(8, 36);
    zigzag.lineTo(0, 20);
    zigzag.closePath();
    zigzag.fillPath();
    zigzag.fillStyle(0xff9900, 1);
    zigzag.fillRect(16, 14, 8, 6);
    zigzag.generateTexture("enemy_zigzag", 40, 36);
    zigzag.destroy();

    // TURRET — armoured square base + barrel
    const turret = this.make.graphics({ x: 0, y: 0 }, false);
    turret.fillStyle(0x888888, 1);
    turret.fillRect(4, 8, 32, 28);
    turret.fillStyle(0x555555, 1);
    turret.fillRect(0, 4, 40, 8);
    turret.fillStyle(0xff4444, 1);
    turret.fillRect(17, 0, 6, 16); // barrel
    turret.fillStyle(0xffffff, 0.3);
    turret.fillRect(8, 12, 24, 4);
    turret.generateTexture("enemy_turret", 40, 36);
    turret.destroy();

    // KAMIKAZE — sharp red dart
    const kami = this.make.graphics({ x: 0, y: 0 }, false);
    kami.fillStyle(0xff3333, 0.95);
    kami.beginPath();
    kami.moveTo(14, 0);
    kami.lineTo(28, 40);
    kami.lineTo(14, 30);
    kami.lineTo(0, 40);
    kami.closePath();
    kami.fillPath();
    kami.fillStyle(0xff8800, 1);
    kami.fillTriangle(11, 6, 14, 0, 17, 6);
    kami.generateTexture("enemy_kamikaze", 28, 40);
    kami.destroy();

    // CARRIER — wide armoured ship
    const carrier = this.make.graphics({ x: 0, y: 0 }, false);
    carrier.fillStyle(0x667788, 1);
    carrier.fillRect(0, 12, 80, 36);
    carrier.fillStyle(0x445566, 1);
    carrier.fillRect(16, 0, 48, 16);
    carrier.fillStyle(0x889900, 1);
    carrier.fillRect(8, 20, 16, 12); // left hangar
    carrier.fillRect(56, 20, 16, 12); // right hangar
    carrier.fillStyle(0xe8ff00, 0.6);
    carrier.fillRect(36, 4, 8, 8); // cockpit
    carrier.generateTexture("enemy_carrier", 80, 48);
    carrier.destroy();
  }

  // ── Boss ───────────────────────────────────────────────────────────────────
  private makeBossTexture() {
    const W = 120,
      H = 90;
    const g = this.make.graphics({ x: 0, y: 0 }, false);

    // Main hull
    g.fillStyle(0x334455, 1);
    g.fillRect(20, 20, W - 40, H - 30);

    // Nose section
    g.fillStyle(0x445566, 1);
    g.beginPath();
    g.moveTo(W / 2, 0);
    g.lineTo(W - 20, 28);
    g.lineTo(20, 28);
    g.closePath();
    g.fillPath();

    // Side wings
    g.fillStyle(0x334455, 1);
    g.fillRect(0, 30, 24, H - 40);
    g.fillRect(W - 24, 30, 24, H - 40);

    // Engine banks
    g.fillStyle(0x223344, 1);
    g.fillRect(24, H - 18, 28, 18);
    g.fillRect(W - 52, H - 18, 28, 18);

    // Accent glow
    g.fillStyle(0xe8ff00, 0.9);
    g.fillRect(W / 2 - 20, 8, 40, 4); // front stripe
    g.fillRect(W / 2 - 4, 12, 8, H - 28); // center line
    g.fillRect(4, 34, 16, 4); // left wing stripe
    g.fillRect(W - 20, 34, 16, 4); // right wing stripe

    // Engine glow
    g.fillStyle(0xff6600, 1);
    g.fillEllipse(38, H - 6, 20, 10);
    g.fillEllipse(W - 38, H - 6, 20, 10);

    // Cannon mounts
    g.fillStyle(0xaaaaaa, 1);
    g.fillRect(W / 2 - 16, 0, 8, 14);
    g.fillRect(W / 2 + 8, 0, 8, 14);

    g.generateTexture("boss", W, H);
    g.destroy();
  }

  // ── Pickups ────────────────────────────────────────────────────────────────
  private makePickupTextures() {
    // Collectible star (currency)
    const star = this.make.graphics({ x: 0, y: 0 }, false);
    star.fillStyle(0xe8ff00, 1);
    // 4-point star shape
    const cx = 10,
      cy = 10,
      r1 = 10,
      r2 = 4;
    star.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4 - Math.PI / 2;
      const r = i % 2 === 0 ? r1 : r2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) star.moveTo(x, y);
      else star.lineTo(x, y);
    }
    star.closePath();
    star.fillPath();
    star.generateTexture("pickup_star", 20, 20);
    star.destroy();

    // Power-up helper
    const pu = (key: string, color: number, label: string) => {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0x111111, 0.9);
      g.fillRect(0, 0, 36, 22);
      g.lineStyle(2, color, 1);
      g.strokeRect(0, 0, 36, 22);
      g.generateTexture(key, 36, 22);
      g.destroy();
      // Add text on top via BitmapText or just use RenderTexture
      const rt = this.add.renderTexture(0, 0, 36, 22);
      rt.draw(key, 0, 0);
      const txt = this.add
        .text(18, 11, label, {
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "8px",
          color: `#${color.toString(16).padStart(6, "0")}`,
          align: "center",
        })
        .setOrigin(0.5);
      rt.saveTexture(key);
      rt.draw(txt, 18 - txt.width / 2, 11 - txt.height / 2);
      rt.saveTexture(key);
      txt.destroy();
      rt.destroy();
    };

    pu("pu_gun", 0xe8ff00, "GUN+");
    pu("pu_shield", 0x00cfff, "SHD");
    pu("pu_bomb", 0xff4444, "BOMB");
    pu("pu_speed", 0x44ff88, "SPD");
  }

  // ── Background tiles ────────────────────────────────────────────────────────
  private makeBgTextures() {
    // Stars layer — scattered dots on transparent bg
    const makeStarLayer = (key: string, count: number, w: number, h: number, maxSize: number) => {
      const rt = this.add.renderTexture(0, 0, w, h);
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      for (let i = 0; i < count; i++) {
        const alpha = 0.2 + Math.random() * 0.7;
        const sz = 0.5 + Math.random() * maxSize;
        g.fillStyle(0xf2f0e9, alpha);
        g.fillCircle(Math.random() * w, Math.random() * h, sz);
      }
      rt.draw(g, 0, 0);
      rt.saveTexture(key);
      g.destroy();
      rt.destroy();
    };

    makeStarLayer("bg_stars_far", 90, 512, 512, 1.0);
    makeStarLayer("bg_stars_near", 40, 512, 512, 1.8);

    // Nebula cloud layer — soft purple/blue blobs
    const nebula = this.add.renderTexture(0, 0, 512, 512);
    const ng = this.make.graphics({ x: 0, y: 0 }, false);
    const cols = [0x1a0a3a, 0x0a1a3a, 0x0a2a1a, 0x1a1a0a];
    for (let i = 0; i < 6; i++) {
      ng.fillStyle(cols[i % cols.length], 0.08 + Math.random() * 0.08);
      ng.fillEllipse(
        50 + Math.random() * 412,
        50 + Math.random() * 412,
        80 + Math.random() * 160,
        60 + Math.random() * 120
      );
    }
    nebula.draw(ng, 0, 0);
    nebula.saveTexture("bg_nebula");
    ng.destroy();
    nebula.destroy();
  }

  // ── Utility ────────────────────────────────────────────────────────────────
  private makeParticleTexture() {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 4, 4);
    g.generateTexture("particle", 4, 4);
    g.destroy();
  }
}
