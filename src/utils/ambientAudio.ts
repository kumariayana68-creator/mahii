// Ambient music and lo-fi audio generator using Web Audio API
// High reliability, zero external network dependencies, works offline

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentTrack = 0;
  private volume = 0.5;
  private timer: any = null;
  private nodes: any[] = [];

  public tracks = [
    { id: 0, title: 'Late Night Romance', vibe: 'Warm Lo-Fi Chords', icon: '🎧' },
    { id: 1, title: 'Rainy Day Date', vibe: 'Gentle Rain & Calm Pads', icon: '🌧️' },
    { id: 2, title: 'Cozy Cafe Moments', vibe: 'Warm Ambient Harmony', icon: '☕' },
  ];

  private initCtx() {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getIsPlaying() {
    return this.isPlaying;
  }

  public getCurrentTrack() {
    return this.currentTrack;
  }

  public playTrack(trackIdx: number) {
    this.stop();
    this.currentTrack = (trackIdx + this.tracks.length) % this.tracks.length;
    this.isPlaying = true;
    this.startAudioLoop();
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.playTrack(this.currentTrack);
    }
    return this.isPlaying;
  }

  public nextTrack() {
    this.playTrack(this.currentTrack + 1);
  }

  public prevTrack() {
    this.playTrack(this.currentTrack - 1);
  }

  public stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.nodes.forEach((n) => {
      try {
        n.stop?.();
        n.disconnect?.();
      } catch {}
    });
    this.nodes = [];
  }

  private startAudioLoop() {
    const ctx = this.initCtx();
    if (!ctx) return;

    // Track 0: Lo-Fi Rhodes chords progression (Cmaj7 -> Am7 -> Dm7 -> G7)
    // Track 1: Ambient Rain white noise + soft pad
    // Track 2: Cozy warm octave drone + sweet fifths

    if (this.currentTrack === 1) {
      this.startRainAndPad(ctx);
    } else if (this.currentTrack === 2) {
      this.startCozyChords(ctx, [261.63, 329.63, 392.0, 493.88]); // Cmaj7 warm
    } else {
      this.startLofiChordsLoop(ctx);
    }
  }

  private startRainAndPad(ctx: AudioContext) {
    try {
      // Soft gentle pink/brown noise rain
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.95 * b1 + white * 0.05;
        b2 = 0.85 * b2 + white * 0.1;
        output[i] = (b0 + b1 + b2) * 0.08;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = 'lowpass';
      rainFilter.frequency.value = 800;

      const gain = ctx.createGain();
      gain.gain.value = this.volume * 0.3;

      whiteNoise.connect(rainFilter);
      rainFilter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      this.nodes.push(whiteNoise, gain);

      // Add gentle soothing drone
      const droneOsc = ctx.createOscillator();
      droneOsc.type = 'sine';
      droneOsc.frequency.value = 220; // A3
      const droneGain = ctx.createGain();
      droneGain.gain.value = this.volume * 0.08;

      droneOsc.connect(droneGain);
      droneGain.connect(ctx.destination);
      droneOsc.start();
      this.nodes.push(droneOsc, droneGain);
    } catch {}
  }

  private startCozyChords(ctx: AudioContext, frequencies: number[]) {
    try {
      frequencies.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;

        gain.gain.value = (this.volume * 0.12) / frequencies.length;
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        this.nodes.push(osc, gain);
      });
    } catch {}
  }

  private startLofiChordsLoop(ctx: AudioContext) {
    const chordList = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0],  // Am7
      [293.66, 349.23, 440.0, 523.25], // Dm7
      [196.0, 246.94, 293.66, 349.23], // G7
    ];
    let step = 0;

    const playChordStep = () => {
      if (!this.isPlaying) return;
      const chords = chordList[step % chordList.length];
      step++;

      const now = ctx.currentTime;
      chords.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime((this.volume * 0.15) / chords.length, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 4);
      });
    };

    playChordStep();
    this.timer = setInterval(playChordStep, 3800);
  }
}

export const ambientAudio = new AmbientAudioEngine();
