/**
 * SoundManager — procedural Web Audio sounds. No audio files required.
 * All sounds are synthesised from oscillators + noise at runtime.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  muted = false;

  // ── AudioContext (lazy, resumes on first user gesture) ────────────────────
  private getCtx(): AudioContext | null {
    if (this.muted) return null;
    try {
      if (!this.ctx) this.ctx = new AudioContext();
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return this.ctx;
    } catch {
      return null;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  // ── Primitive builders ────────────────────────────────────────────────────
  private osc(
    freq: number,
    type: OscillatorType,
    duration: number,
    vol: number,
    freqEnd?: number,
    startDelay = 0
  ) {
    const ctx = this.getCtx();
    if (!ctx) return;
    const t = ctx.currentTime + startDelay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g);
    g.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (freqEnd !== undefined)
      osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), t + duration);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.start(t);
    osc.stop(t + duration + 0.01);
  }

  private noise(duration: number, vol: number, filterFreq?: [number, number], startDelay = 0) {
    const ctx = this.getCtx();
    if (!ctx) return;
    const t = ctx.currentTime + startDelay;
    const len = Math.ceil(ctx.sampleRate * duration);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    if (filterFreq) {
      const f = ctx.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.setValueAtTime(filterFreq[0], t);
      f.frequency.exponentialRampToValueAtTime(Math.max(filterFreq[1], 1), t + duration);
      src.connect(f);
      f.connect(g);
    } else {
      src.connect(g);
    }

    g.connect(ctx.destination);
    src.start(t);
    src.stop(t + duration + 0.02);
  }

  // ── Game sounds ───────────────────────────────────────────────────────────
  shoot() {
    this.osc(700, "square", 0.065, 0.055, 340);
  }

  shootDouble() {
    this.osc(620, "square", 0.065, 0.045, 310);
    this.osc(680, "square", 0.065, 0.045, 340, 0.01);
  }

  shootSpread() {
    this.osc(550, "square", 0.07, 0.04, 275);
    this.osc(700, "square", 0.07, 0.04, 350, 0.005);
    this.osc(450, "square", 0.07, 0.04, 225, 0.01);
  }

  shootLaser() {
    this.osc(1400, "sawtooth", 0.09, 0.055, 700);
  }

  enemyHit() {
    this.noise(0.06, 0.09, [300, 120]);
  }

  enemyDie() {
    this.noise(0.18, 0.14, [500, 80]);
    this.osc(180, "sawtooth", 0.18, 0.06, 60);
  }

  bigExplosion() {
    this.noise(0.45, 0.28, [700, 55]);
    this.osc(55, "sine", 0.45, 0.14, 28);
  }

  playerHit() {
    this.noise(0.28, 0.22, [220, 55]);
    this.osc(90, "sine", 0.35, 0.1, 45);
  }

  pickupStar() {
    this.osc(880, "sine", 0.13, 0.07, 1320);
  }

  pickupPowerup() {
    // Distinct double-rising tone — clearly better than a star
    this.osc(660, "sine", 0.09, 0.07, 990);
    this.osc(880, "sine", 0.09, 0.05, 1320, 0.05);
  }

  bomb() {
    this.noise(0.55, 0.32, [900, 45]);
    this.osc(48, "sine", 0.55, 0.18, 24);
  }

  bossWarning() {
    this.osc(110, "sawtooth", 0.18, 0.13, 150);
    this.osc(110, "sawtooth", 0.18, 0.13, 150, 0.25);
    this.osc(110, "sawtooth", 0.18, 0.13, 180, 0.5);
  }

  bossPhaseChange() {
    this.noise(0.4, 0.25, [800, 50]);
    this.osc(38, "sawtooth", 0.8, 0.18, 76);
  }

  combo(multiplier: number) {
    const f = 330 * Math.pow(1.2, multiplier - 2);
    this.osc(f, "sine", 0.12, 0.08, f * 1.5);
  }

  stageComplete() {
    const notes = [440, 554, 659, 880];
    notes.forEach((f, i) => this.osc(f, "sine", 0.26, 0.1, f * 1.05, i * 0.12));
  }

  gameOver() {
    const notes = [440, 330, 220, 165];
    notes.forEach((f, i) => this.osc(f, "square", 0.28, 0.08, f * 0.9, i * 0.16));
  }

  victory() {
    const notes = [440, 550, 660, 880, 1100];
    notes.forEach((f, i) => this.osc(f, "sine", 0.3, 0.09, f * 1.04, i * 0.11));
  }
}

// Module singleton — import this directly in Phaser entities / scenes
export const soundManager = new SoundManager();
