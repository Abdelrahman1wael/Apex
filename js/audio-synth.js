/**
 * Apex Ecosystem Marketing Platform - Web Audio API Procedural Sound Engine
 * Generates futuristic audio synth feedback for hover, clicks, planet focus, and modal launches.
 */

class AudioSynthEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.initOnInteraction();
  }

  initOnInteraction() {
    const initFn = () => {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      document.removeEventListener('click', initFn);
      document.removeEventListener('keydown', initFn);
    };
    document.addEventListener('click', initFn);
    document.addEventListener('keydown', initFn);
  }

  toggleSound() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playTone(freq, type = 'sine', duration = 0.15, vol = 0.1) {
    if (!this.enabled || !this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  playHover() {
    this.playTone(520, 'sine', 0.08, 0.04);
  }

  playClick() {
    this.playTone(880, 'triangle', 0.12, 0.08);
  }

  playPlanetFocus() {
    if (!this.enabled || !this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.3);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  playModalOpen() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'sine', 0.2, 0.06), idx * 60);
      });
    } catch (e) {}
  }
}

window.soundEngine = new AudioSynthEngine();
