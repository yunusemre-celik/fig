// High performance Web Audio API sound generator for tactile feedback
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

let lastTickTime = 0;

/**
 * Tactile mechanical wheel rotation tick sound (Apple Watch Digital Crown / precision dial haptic)
 */
export function playWheelTick() {
  const nowMs = performance.now();
  if (nowMs - lastTickTime < 40) return; // Debounce so rapid movement doesn't sound muddy
  lastTickTime = nowMs;

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(2200, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.015);

    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.015);
  } catch {
    // Ignore audio failures
  }
}

export function playHoverTick() {
  playWheelTick();
}

/**
 * Warm pleasant chime when an action completes
 */
export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const playTone = (freq: number, delay: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.08, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + duration);
    };

    playTone(523.25, 0, 0.25); // C5
    playTone(659.25, 0.08, 0.25); // E5
    playTone(783.99, 0.16, 0.4); // G5
  } catch {
    // Ignore audio failures
  }
}
