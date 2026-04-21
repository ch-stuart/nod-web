import { makeWhite, makeGrey, makePink, makeBrown } from './noise-gen.js';
 
// Audio graph:
// src[0..3] → gains[0..3] ─┐
//                            ├→ hp → lp → master → destination
//                           ─┘
// Noise order: 0=white 1=grey 2=pink 3=brown (top→bottom on Y axis)

export class GridEngine {
  private ctx: AudioContext;
  private gains: GainNode[];
  private hp: BiquadFilterNode;
  private lp: BiquadFilterNode;
  private master: GainNode;

  private sources: AudioBufferSourceNode[] = [];
  private cachedBuffers: AudioBuffer[] = [];

  private targetGains = [1, 0, 0, 0];
  private currentGains = [1, 0, 0, 0];
  private targetHP = 20;
  private currentHP = 20;
  private targetLP = 22050;
  private currentLP = 22050;

  private rafId = 0;
  private startupFrame = 0;
  private readonly STARTUP_FRAMES = 3;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;

    this.gains = Array.from({ length: 4 }, () => this.ctx.createGain());

    this.hp = this.ctx.createBiquadFilter();
    this.hp.type = 'highpass';
    this.hp.frequency.value = 20;
    this.hp.Q.value = 0.707;

    this.lp = this.ctx.createBiquadFilter();
    this.lp.type = 'lowpass';
    this.lp.frequency.value = 22050;
    this.lp.Q.value = 0.707;

    this.master = this.ctx.createGain();
    this.master.gain.value = 0;

    for (const g of this.gains) g.connect(this.hp);
    this.hp.connect(this.lp);
    this.lp.connect(this.master);
    this.master.connect(this.ctx.destination);
  }

  // Must be called from a user-gesture handler so ctx.resume() is permitted
  async start(x: number, y: number) {
    await this.ctx.resume();

    if (this.cachedBuffers.length === 0) {
      this.cachedBuffers = [
        makeWhite(this.ctx, 5),
        makeGrey(this.ctx, 5),
        makePink(this.ctx, 5),
        makeBrown(this.ctx, 5),
      ];
    }

    this.sources = this.cachedBuffers.map((buf, i) => {
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      src.connect(this.gains[i]);
      src.start();
      return src;
    });

    // Snap parameters to current position, then fade master in from silence
    this.setPosition(x, y);
    for (let i = 0; i < 4; i++) {
      this.currentGains[i] = this.targetGains[i];
      this.gains[i].gain.value = this.currentGains[i];
    }
    this.currentHP = this.targetHP;
    this.currentLP = this.targetLP;
    this.hp.frequency.value = this.currentHP;
    this.lp.frequency.value = this.currentLP;

    this.master.gain.value = 0;
    this.startupFrame = 0;
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop() {
    cancelAnimationFrame(this.rafId);
    for (const src of this.sources) {
      try { src.stop(); } catch { /* already stopped */ }
    }
    this.sources = [];
    this.ctx.suspend();
  }

  setPosition(x: number, y: number) {
    const yBiased = Math.pow(y, 0.65);
    const centers = [0, 1 / 3, 2 / 3, 1];
    for (let i = 0; i < 4; i++) {
      this.targetGains[i] = Math.max(0, 1 - Math.abs(yBiased - centers[i]) * 3);
    }
    this.targetHP = x < 0.2 ? this.logInterp(150, 20, x / 0.2) : 20;
    this.targetLP = x > 0.2 ? this.logInterp(22050, 350, (x - 0.2) / 0.8) : 22050;
  }

  private tick = () => {
    this.rafId = requestAnimationFrame(this.tick);

    if (this.startupFrame < this.STARTUP_FRAMES) {
      this.master.gain.value = ++this.startupFrame / this.STARTUP_FRAMES;
    }

    const alpha = 0.08;
    for (let i = 0; i < 4; i++) {
      this.currentGains[i] += (this.targetGains[i] - this.currentGains[i]) * alpha;
      this.gains[i].gain.value = this.currentGains[i];
    }
    this.currentHP += (this.targetHP - this.currentHP) * alpha;
    this.currentLP += (this.targetLP - this.currentLP) * alpha;
    this.hp.frequency.value = this.currentHP;
    this.lp.frequency.value = this.currentLP;
  };

  private logInterp(a: number, b: number, t: number): number {
    return Math.exp(Math.log(a) * (1 - t) + Math.log(b) * t);
  }
}
