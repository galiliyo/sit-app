// Web Audio API bell synthesizer — two distinct singing bowl tones

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

export const BELL_OPTIONS = ['Singing Bowl', 'Tingsha', 'None'] as const;
export type BellName = (typeof BELL_OPTIONS)[number];

/**
 * Singing Bowl — warm, deep, resonant tone (~220 Hz fundamental)
 */
function playSingingBowl(ctx: AudioContext) {
  const now = ctx.currentTime;

  // Fundamental
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(220, now);

  // 2nd harmonic
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(440, now);

  // 3rd harmonic – slight detuning for shimmer
  const osc3 = ctx.createOscillator();
  osc3.type = 'sine';
  osc3.frequency.setValueAtTime(665, now);

  const gain1 = ctx.createGain();
  const gain2 = ctx.createGain();
  const gain3 = ctx.createGain();

  gain1.gain.setValueAtTime(0.35, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 4);

  gain2.gain.setValueAtTime(0.15, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 3);

  gain3.gain.setValueAtTime(0.08, now);
  gain3.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

  osc1.connect(gain1).connect(ctx.destination);
  osc2.connect(gain2).connect(ctx.destination);
  osc3.connect(gain3).connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc3.start(now);
  osc1.stop(now + 4.5);
  osc2.stop(now + 3.5);
  osc3.stop(now + 3);
}

/**
 * Tingsha — bright, high-pitched cymbal tone (~1200 Hz)
 */
function playTingsha(ctx: AudioContext) {
  const now = ctx.currentTime;

  // Main strike
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(1200, now);
  osc1.frequency.exponentialRampToValueAtTime(1180, now + 2);

  // Metallic overtone
  const osc2 = ctx.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(2400, now);

  // Shimmer
  const osc3 = ctx.createOscillator();
  osc3.type = 'sine';
  osc3.frequency.setValueAtTime(3610, now);

  const gain1 = ctx.createGain();
  const gain2 = ctx.createGain();
  const gain3 = ctx.createGain();

  gain1.gain.setValueAtTime(0.25, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 3);

  gain2.gain.setValueAtTime(0.1, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 2);

  gain3.gain.setValueAtTime(0.04, now);
  gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

  osc1.connect(gain1).connect(ctx.destination);
  osc2.connect(gain2).connect(ctx.destination);
  osc3.connect(gain3).connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc3.start(now);
  osc1.stop(now + 3.5);
  osc2.stop(now + 2.5);
  osc3.stop(now + 2);
}

export function playBell(name: string) {
  if (name === 'None') return;
  const ctx = getContext();
  if (name === 'Tingsha') {
    playTingsha(ctx);
  } else {
    // Default to Singing Bowl (also handles legacy names like 'Kangsê')
    playSingingBowl(ctx);
  }
}
