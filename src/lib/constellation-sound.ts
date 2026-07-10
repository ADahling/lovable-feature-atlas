// ============================================================================
// constellation-sound.ts
// ---------------------------------------------------------------------------
// Lazy-instantiated WebAudio for the /constellation view. The AudioContext
// is only created after the user opts into sound via the legend toggle so
// visitors who never enable it pay zero cost. Preference is remembered in
// localStorage under LS_KEY. All sounds are procedural (no external assets)
// and mixed conservatively — total ambient bed sits around -32 dBFS.
// ---------------------------------------------------------------------------

// v2 key — invalidates any prior "on" pref persisted before the default-off fix.
export const SOUND_LS_KEY = "atlas-constellation-sound-v2";

export type SoundEngine = {
  ctx: AudioContext;
  master: GainNode;
  ambient: () => void; // start ambient loop (idempotent)
  stopAmbient: () => void;
  tick: () => void; // crystalline hover tick
  chime: () => void; // birth chime
  dispose: () => Promise<void>;
};

export async function createSoundEngine(): Promise<SoundEngine> {
  const AudioCtor: typeof AudioContext =
    (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext) as typeof AudioContext;
  const ctx = new AudioCtor();
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      /* ignore */
    }
  }

  const master = ctx.createGain();
  master.gain.value = 0.7; // conservative overall
  master.connect(ctx.destination);

  // --- Ambient bed: two detuned low sines + slowly-modulated filtered noise
  let ambientNodes: AudioNode[] | null = null;
  function ambient() {
    if (ambientNodes) return;
    const bed = ctx.createGain();
    bed.gain.value = 0.055;
    bed.connect(master);

    const drone1 = ctx.createOscillator();
    drone1.type = "sine";
    drone1.frequency.value = 55; // A1
    const drone2 = ctx.createOscillator();
    drone2.type = "sine";
    drone2.frequency.value = 82.4; // E2
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.6;
    drone1.connect(droneGain);
    drone2.connect(droneGain);
    droneGain.connect(bed);

    // Noise buffer → bandpass → tremolo
    const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * 0.4;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 480;
    bp.Q.value = 1.4;
    const nGain = ctx.createGain();
    nGain.gain.value = 0.14;
    noise.connect(bp);
    bp.connect(nGain);
    nGain.connect(bed);

    // Slow LFO on the bandpass to give the bed motion.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 220;
    lfo.connect(lfoGain);
    lfoGain.connect(bp.frequency);

    drone1.start();
    drone2.start();
    noise.start();
    lfo.start();

    ambientNodes = [drone1, drone2, noise, lfo, bed];
  }

  function stopAmbient() {
    if (!ambientNodes) return;
    for (const n of ambientNodes) {
      try {
        (n as OscillatorNode).stop?.();
      } catch {
        /* ignore */
      }
      try {
        n.disconnect();
      } catch {
        /* ignore */
      }
    }
    ambientNodes = null;
  }

  // --- Crystalline tick: fast decay sine at ~2.2 kHz with a highpass sheen.
  let lastTick = 0;
  function tick() {
    const now = ctx.currentTime;
    if (now - lastTick < 0.04) return; // throttle
    lastTick = now;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(2200 + Math.random() * 400, now);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.08, now + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1200;
    o.connect(hp);
    hp.connect(g);
    g.connect(master);
    o.start(now);
    o.stop(now + 0.2);
  }

  // --- Birth chime: two partials, bell-like, gentle.
  function chime() {
    const now = ctx.currentTime;
    const freqs = [523.25, 783.99]; // C5, G5
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.11 * (1 - i * 0.35), now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
      o.connect(g);
      g.connect(master);
      o.start(now);
      o.stop(now + 1.65);
    });
  }

  async function dispose() {
    stopAmbient();
    try {
      master.disconnect();
    } catch {
      /* ignore */
    }
    try {
      await ctx.close();
    } catch {
      /* ignore */
    }
  }

  return { ctx, master, ambient, stopAmbient, tick, chime, dispose };
}

export function readSoundPref(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SOUND_LS_KEY) === "on";
  } catch {
    return false;
  }
}

export function writeSoundPref(on: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SOUND_LS_KEY, on ? "on" : "off");
  } catch {
    /* ignore */
  }
}
