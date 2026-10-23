// Real-Time Audio Engine using Web Audio API for Concert Visual FX
class AudioReactiveEngine {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.stream = null;
    this.gainNode = null;
    this.dataArray = null;
    this.timeDomainArray = null;
    this.isListening = false;
    this.sensitivity = 1.2;
    this.simulate = false;
    this.simPhase = 0;

    this.bass = 0;
    this.mid = 0;
    this.treble = 0;
    this.volume = 0;
    this.rawVolume = 0;
    this.peak = 0;
    this.treblePeak = 0;
    this.beatDetected = false;
    this.hiHatDetected = false;
    this.lastBeatTime = 0;
    this.lastHiHatTime = 0;
    this.listeners = new Set();
    this.unlockListenerAttached = false;
  }

  // Ensure AudioContext is unlocked via user gesture
  setupGestureUnlock() {
    if (this.unlockListenerAttached || typeof window === "undefined") return;
    this.unlockListenerAttached = true;

    const unlock = async () => {
      if (this.audioContext && this.audioContext.state === "suspended") {
        try {
          await this.audioContext.resume();
        } catch (e) {
          console.warn("AudioContext resume error:", e);
        }
      }
    };

    window.addEventListener("click", unlock, { passive: true });
    window.addEventListener("touchstart", unlock, { passive: true });
    window.addEventListener("keydown", unlock, { passive: true });
  }

  setSimulate(enabled) {
    this.simulate = !!enabled;
    this.notifyListeners();
  }

  async start(sensitivity = 1.2) {
    this.sensitivity = sensitivity;
    this.setupGestureUnlock();

    if (this.isListening && this.audioContext && this.audioContext.state === "running") {
      return true;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        console.warn("Web Audio API not supported on this browser.");
        return false;
      }

      if (!this.audioContext || this.audioContext.state === "closed") {
        this.audioContext = new AudioCtx();
      }

      if (this.audioContext.state === "suspended") {
        try {
          await this.audioContext.resume();
        } catch {
          // Will resume on next user gesture
        }
      }

      // 1. Try studio constraints first, fallback to standard audio
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          },
          video: false
        });
      } catch (err) {
        console.warn("Strict audio constraints failed, trying default audio: true", err);
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false
        });
      }

      this.stream = stream;
      this.source = this.audioContext.createMediaStreamSource(this.stream);

      // Hardware gain amplification according to sensitivity
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = Math.max(0.5, this.sensitivity * 1.5);

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.75;

      this.source.connect(this.gainNode);
      this.gainNode.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      this.timeDomainArray = new Uint8Array(bufferLength);
      this.isListening = true;
      this.notifyListeners();
      return true;
    } catch (err) {
      console.warn("Microphone access declined or unavailable:", err);
      this.isListening = false;
      this.notifyListeners();
      return false;
    }
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.isListening = false;
    this.notifyListeners();
  }

  setSensitivity(val) {
    this.sensitivity = Math.max(0.2, Math.min(5.0, Number(val) || 1.2));
    if (this.gainNode && this.audioContext) {
      this.gainNode.gain.setTargetAtTime(
        Math.max(0.5, this.sensitivity * 1.5),
        this.audioContext.currentTime,
        0.05
      );
    }
  }

  // Analyzes frequency bins and computes audio features at 60 FPS
  getMetrics() {
    // ─── SYNTHETIC SIMULATION MODE (IF MIC IS INACTIVE OR DEMO TOGGLED) ───
    if (this.simulate) {
      const now = performance.now();
      this.simPhase += 0.05;
      
      // 128 BPM simulation (beat every 468ms, 8th-note hi-hat every 234ms)
      const beatCycle = (now % 468.75) / 468.75;
      const isBeat = beatCycle < 0.15;
      const hiHatCycle = (now % 234.375) / 234.375;
      const isHiHat = hiHatCycle < 0.12;
      
      const kickEnv = Math.max(0, 1 - beatCycle * 2.5);
      const bassVal = kickEnv * 0.95 + Math.sin(this.simPhase * 2) * 0.1 + 0.1;
      const midVal = (Math.sin(this.simPhase * 1.3) + 1) * 0.35 + (isBeat ? 0.3 : 0);
      const trebleVal = (Math.cos(this.simPhase * 2.7) + 1) * 0.3 + (isBeat ? 0.4 : 0);
      const vol = Math.min(1.0, bassVal * 0.6 + midVal * 0.3);

      const fakeDataArray = new Uint8Array(128);
      const fakeTimeArray = new Uint8Array(128);

      for (let i = 0; i < 128; i++) {
        const falloff = Math.max(0, 1 - (i / 128) * 0.8);
        const freqNoise = Math.sin(this.simPhase * 3 + i * 0.2) * 20;
        fakeDataArray[i] = Math.min(255, Math.max(0, (bassVal * 200 * falloff) + freqNoise));
        fakeTimeArray[i] = 128 + Math.sin(this.simPhase * 4 + i * 0.3) * (vol * 90);
      }

      return {
        isListening: true,
        bass: Math.min(1.5, bassVal * this.sensitivity),
        mid: Math.min(1.5, midVal * this.sensitivity),
        treble: Math.min(1.5, trebleVal * this.sensitivity),
        volume: Math.min(1.5, vol * this.sensitivity),
        rawVolume: Math.min(100, Math.round(vol * 100)),
        beatDetected: isBeat,
        hiHatDetected: isHiHat,
        dataArray: fakeDataArray,
        timeDomainArray: fakeTimeArray
      };
    }

    if (!this.isListening || !this.analyser || !this.dataArray) {
      return {
        isListening: false,
        bass: 0,
        mid: 0,
        treble: 0,
        volume: 0,
        rawVolume: 0,
        beatDetected: false,
        hiHatDetected: false,
        dataArray: null,
        timeDomainArray: null
      };
    }

    // Auto-resume if suspended
    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume().catch(() => {});
    }

    this.analyser.getByteFrequencyData(this.dataArray);
    this.analyser.getByteTimeDomainData(this.timeDomainArray);

    const len = this.dataArray.length;

    // Bass: ~20Hz - 250Hz (bins 0-8)
    let bassSum = 0;
    const bassBins = Math.min(8, len);
    for (let i = 0; i < bassBins; i++) {
      bassSum += this.dataArray[i];
    }
    const rawBass = (bassSum / bassBins / 255) * this.sensitivity;

    // Mid: ~250Hz - 2500Hz (bins 9-35)
    let midSum = 0;
    const midBins = Math.min(35, len);
    for (let i = bassBins; i < midBins; i++) {
      midSum += this.dataArray[i];
    }
    const rawMid = (midSum / (midBins - bassBins) / 255) * this.sensitivity;

    // Treble: ~2500Hz - 16kHz (bins 36-len)
    let trebleSum = 0;
    for (let i = midBins; i < len; i++) {
      trebleSum += this.dataArray[i];
    }
    const rawTreble = (trebleSum / (len - midBins) / 255) * this.sensitivity;

    // Overall RMS Volume
    let sumSquares = 0;
    for (let i = 0; i < this.timeDomainArray.length; i++) {
      const norm = (this.timeDomainArray[i] - 128) / 128;
      sumSquares += norm * norm;
    }
    const rms = Math.sqrt(sumSquares / this.timeDomainArray.length);
    const scaledRms = rms * this.sensitivity;

    // Smooth interpolations
    this.bass = this.bass * 0.65 + rawBass * 0.35;
    this.mid = this.mid * 0.7 + rawMid * 0.3;
    this.treble = this.treble * 0.7 + rawTreble * 0.3;
    this.volume = this.volume * 0.6 + scaledRms * 0.4;
    this.rawVolume = Math.min(100, Math.round(rms * 100 * 2.5));

    // Beat Detection (transient kick)
    const now = performance.now();
    let isBeat = false;
    if (this.bass > 0.35 && this.bass > this.peak * 1.12 && now - this.lastBeatTime > 200) {
      isBeat = true;
      this.lastBeatTime = now;
      this.peak = this.bass;
    } else {
      this.peak = Math.max(0.08, this.peak * 0.93);
    }

    // Hi-Hat / High-frequency cymbal transient detection (5kHz - 16kHz)
    let hiHatSum = 0;
    const hiHatStart = Math.min(len - 1, Math.floor(len * 0.45));
    for (let i = hiHatStart; i < len; i++) {
      hiHatSum += this.dataArray[i];
    }
    const rawHiHat = (hiHatSum / (len - hiHatStart) / 255) * this.sensitivity;

    let isHiHat = false;
    if (rawHiHat > 0.18 && rawHiHat > this.treblePeak * 1.12 && now - this.lastHiHatTime > 105) {
      isHiHat = true;
      this.lastHiHatTime = now;
      this.treblePeak = rawHiHat;
    } else {
      this.treblePeak = Math.max(0.06, this.treblePeak * 0.93);
    }

    return {
      isListening: true,
      bass: Math.min(1.8, this.bass),
      mid: Math.min(1.8, this.mid),
      treble: Math.min(1.8, this.treble),
      volume: Math.min(1.8, this.volume),
      rawVolume: this.rawVolume,
      beatDetected: isBeat,
      hiHatDetected: isHiHat,
      dataArray: this.dataArray,
      timeDomainArray: this.timeDomainArray
    };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach((l) => l(this.isListening || this.simulate));
  }
}

export const audioEngine = new AudioReactiveEngine();
