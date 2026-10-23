// Real-Time Audio Engine using Web Audio API for Concert Visual FX
class AudioReactiveEngine {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.stream = null;
    this.dataArray = null;
    this.timeDomainArray = null;
    this.isListening = false;
    this.sensitivity = 1.2;
    this.bass = 0;
    this.mid = 0;
    this.treble = 0;
    this.volume = 0;
    this.peak = 0;
    this.beatDetected = false;
    this.lastBeatTime = 0;
    this.listeners = new Set();
  }

  async start(sensitivity = 1.2) {
    if (this.isListening && this.audioContext) return true;
    this.sensitivity = sensitivity;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        console.warn("Web Audio API not supported on this browser.");
        return false;
      }

      this.audioContext = new AudioCtx();
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        },
        video: false
      });

      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      this.source.connect(this.analyser);

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
    this.sensitivity = Math.max(0.2, Math.min(4.0, Number(val) || 1.2));
  }

  // Analyzes frequency bins and computes audio features at 60 FPS
  getMetrics() {
    if (!this.isListening || !this.analyser || !this.dataArray) {
      return {
        isListening: false,
        bass: 0,
        mid: 0,
        treble: 0,
        volume: 0,
        beatDetected: false,
        dataArray: null,
        timeDomainArray: null
      };
    }

    this.analyser.getByteFrequencyData(this.dataArray);
    this.analyser.getByteTimeDomainData(this.timeDomainArray);

    const len = this.dataArray.length;
    // Frequency bins:
    // Bass: ~20Hz - 250Hz (bins 0-8)
    // Mid: ~250Hz - 2500Hz (bins 9-35)
    // Treble: ~2500Hz - 16kHz (bins 36-len)

    let bassSum = 0;
    const bassBins = Math.min(8, len);
    for (let i = 0; i < bassBins; i++) {
      bassSum += this.dataArray[i];
    }
    const rawBass = (bassSum / bassBins / 255) * this.sensitivity;

    let midSum = 0;
    const midBins = Math.min(35, len);
    for (let i = bassBins; i < midBins; i++) {
      midSum += this.dataArray[i];
    }
    const rawMid = (midSum / (midBins - bassBins) / 255) * this.sensitivity;

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
    const rms = Math.sqrt(sumSquares / this.timeDomainArray.length) * this.sensitivity;

    // Smooth interpolations
    this.bass = this.bass * 0.7 + rawBass * 0.3;
    this.mid = this.mid * 0.7 + rawMid * 0.3;
    this.treble = this.treble * 0.7 + rawTreble * 0.3;
    this.volume = this.volume * 0.6 + rms * 0.4;

    // Beat Detection (transient kick)
    const now = performance.now();
    let isBeat = false;
    if (this.bass > 0.45 && this.bass > this.peak * 1.15 && now - this.lastBeatTime > 220) {
      isBeat = true;
      this.lastBeatTime = now;
      this.peak = this.bass;
    } else {
      this.peak = Math.max(0.1, this.peak * 0.94);
    }

    return {
      isListening: true,
      bass: Math.min(1.5, this.bass),
      mid: Math.min(1.5, this.mid),
      treble: Math.min(1.5, this.treble),
      volume: Math.min(1.5, this.volume),
      beatDetected: isBeat,
      dataArray: this.dataArray,
      timeDomainArray: this.timeDomainArray
    };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach((l) => l(this.isListening));
  }
}

export const audioEngine = new AudioReactiveEngine();
