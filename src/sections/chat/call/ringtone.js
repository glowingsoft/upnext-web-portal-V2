// Synthesized ring tones via the Web Audio API — no external audio asset
// (and therefore no licensing concern) needed for a self-contained call feature.
let sharedContext = null;

function getAudioContext() {
  if (!sharedContext) {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    sharedContext = new AudioContextCtor();
  }
  return sharedContext;
}

// Plays a single tone with a short linear attack/release so it doesn't click.
function playTone(ctx, frequency, startTime, duration, peakGain) {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(peakGain, startTime + 0.02);
  gainNode.gain.linearRampToValueAtTime(peakGain, startTime + duration - 0.04);
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

class RingtonePlayer {
  constructor({ tones, burstDuration, cadenceMs, peakGain = 0.16 }) {
    this.tones = tones;
    this.burstDuration = burstDuration;
    this.cadenceMs = cadenceMs;
    this.peakGain = peakGain;
    this.timerId = null;
    this.playing = false;
  }

  start() {
    if (this.playing) return;
    this.playing = true;

    let ctx;
    try {
      ctx = getAudioContext();
      ctx.resume?.().catch(() => {});
    } catch {
      this.playing = false;
      return;
    }

    const playBurst = () => {
      if (!this.playing) return;
      const now = ctx.currentTime;
      const toneDuration = this.burstDuration / this.tones.length;
      this.tones.forEach((frequency, i) => playTone(ctx, frequency, now + i * toneDuration, toneDuration, this.peakGain));
      this.timerId = setTimeout(playBurst, this.cadenceMs);
    };

    playBurst();
  }

  stop() {
    this.playing = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}

// Two-tone chime repeating roughly every 2.2s — the incoming-call ring.
export const incomingRingtone = new RingtonePlayer({ tones: [587.33, 739.99], burstDuration: 0.9, cadenceMs: 2200 });

// Single softer tone repeating roughly every 3s — the outgoing-call ringback.
export const outgoingRingback = new RingtonePlayer({ tones: [440], burstDuration: 1.0, cadenceMs: 3000, peakGain: 0.12 });
