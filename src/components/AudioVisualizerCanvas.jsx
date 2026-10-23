import { useEffect, useRef, useState } from "react";
import { audioEngine } from "../lib/audioEngine.js";

export default function AudioVisualizerCanvas({
  audioFx,
  className = "fixed inset-0 pointer-events-none z-0 w-full h-full"
}) {
  const canvasRef = useRef(null);
  const [hasMicAccess, setHasMicAccess] = useState(audioEngine.isListening || audioEngine.simulate);
  const [showPrompt, setShowPrompt] = useState(false);
  const [vuLevel, setVuLevel] = useState(0);
  const particlesRef = useRef([]);

  // Subscribe to engine state
  useEffect(() => {
    audioEngine.setupGestureUnlock();
    const unsub = audioEngine.subscribe((active) => {
      setHasMicAccess(active);
      if (active) setShowPrompt(false);
    });
    return unsub;
  }, []);

  // Sync sensitivity and simulation mode from Firebase
  useEffect(() => {
    if (!audioFx) return;

    audioEngine.setSensitivity(audioFx.sensitivity || 1.2);
    audioEngine.setSimulate(!!audioFx.simulateBeat);

    if (audioFx.enabled && !audioFx.simulateBeat && !audioEngine.isListening) {
      // Try auto-starting (works automatically if permissions were previously saved)
      audioEngine.start(audioFx.sensitivity || 1.2).then((ok) => {
        if (!ok) {
          setShowPrompt(true);
        }
      });
    } else if (!audioFx.enabled) {
      setShowPrompt(false);
    }
  }, [audioFx?.enabled, audioFx?.sensitivity, audioFx?.simulateBeat]);

  // Main 60 FPS Canvas Rendering Loop with Dynamic Chromatic Shifting Colors
  useEffect(() => {
    if (!audioFx?.enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let frameCount = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = particlesRef.current;

    const render = () => {
      animId = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const metrics = audioEngine.getMetrics();
      const mode = audioFx.mode || "full";
      const now = performance.now();

      // Dynamic concert chromatic shift: continuously cycles hue, accelerated by music energy
      const baseHue = ((now * 0.04) + (metrics.bass * 60)) % 360;

      // Periodically update VU meter for UI badge (every 6 frames ~ 100ms)
      frameCount++;
      if (frameCount % 6 === 0) {
        setVuLevel(metrics.rawVolume || 0);
      }

      // ─── BEAT PARTICLE EMISSION (DYNAMIC CHROMATIC HUES) ───
      if (metrics.beatDetected && (mode === "particles" || mode === "full")) {
        const burstCount = 18;
        const originX = width / 2;
        const originY = height / 2;
        for (let i = 0; i < burstCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 4 + Math.random() * 9;
          const particleHue = (baseHue + Math.random() * 120) % 360;
          particles.push({
            x: originX,
            y: originY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 3 + Math.random() * 7,
            life: 1.0,
            decay: 0.015 + Math.random() * 0.02,
            color: `hsl(${particleHue}, 95%, 70%)`
          });
        }
      }

      // ─── 1. BASS PULSE & AMBIENT AURA (DYNAMIC COLOR BLEND) ───
      if ((mode === "pulse" || mode === "full") && metrics.bass > 0.05) {
        const radius = Math.min(width, height) * (0.35 + metrics.bass * 0.4);
        const pulseHue = (baseHue + 20) % 360;
        const grad = ctx.createRadialGradient(
          width / 2,
          height / 2,
          radius * 0.1,
          width / 2,
          height / 2,
          radius
        );
        grad.addColorStop(0, `hsla(${pulseHue}, 90%, 65%, ${Math.min(0.35, metrics.bass * 0.28)})`);
        grad.addColorStop(0.5, `hsla(${(pulseHue + 70) % 360}, 85%, 55%, ${Math.min(0.24, metrics.mid * 0.2)})`);
        grad.addColorStop(1, "rgba(21, 19, 14, 0)");

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // ─── 2. SPECTRUM EQUALIZER BARS (SPECTRUM RAINBOW GRADIENT) ───
      if ((mode === "spectrum" || mode === "full") && metrics.dataArray) {
        const binCount = 48;
        const barWidth = width / binCount;
        const data = metrics.dataArray;

        for (let i = 0; i < binCount; i++) {
          const val = (data[i] || 0) / 255;
          const barHeight = val * height * 0.38 * (audioFx.sensitivity || 1.2);

          const x = i * barWidth;
          const y = height - barHeight;

          const barHue = (baseHue + i * 4.5) % 360;
          const barGrad = ctx.createLinearGradient(x, y, x, height);
          barGrad.addColorStop(0, `hsla(${barHue}, 95%, 65%, 0.95)`);
          barGrad.addColorStop(0.6, `hsla(${(barHue + 40) % 360}, 90%, 55%, 0.55)`);
          barGrad.addColorStop(1, `hsla(${(barHue + 80) % 360}, 80%, 35%, 0.05)`);

          ctx.fillStyle = barGrad;
          ctx.fillRect(x + 1, y, barWidth - 2, barHeight);

          if (val > 0.18) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(x + 1, y - 3, barWidth - 2, 2);
          }
        }
      }

      // ─── 3. UNDULATING AUDIO WAVEFORM (CONTINUOUSLY CHANGING CHROMATIC WAVE) ───
      if ((mode === "wave" || mode === "full") && metrics.timeDomainArray) {
        const timeData = metrics.timeDomainArray;

        // Dynamic multi-stop gradient that morphs across the width of the screen
        const waveGrad = ctx.createLinearGradient(0, 0, width, 0);
        waveGrad.addColorStop(0, `hsla(${baseHue}, 95%, 65%, 0.9)`);
        waveGrad.addColorStop(0.25, `hsla(${(baseHue + 60) % 360}, 95%, 70%, 0.95)`);
        waveGrad.addColorStop(0.5, `hsla(${(baseHue + 120) % 360}, 95%, 75%, 1.0)`);
        waveGrad.addColorStop(0.75, `hsla(${(baseHue + 180) % 360}, 95%, 70%, 0.95)`);
        waveGrad.addColorStop(1, `hsla(${(baseHue + 240) % 360}, 95%, 65%, 0.9)`);

        ctx.beginPath();
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = waveGrad;
        ctx.shadowColor = `hsl(${baseHue}, 95%, 65%)`;
        ctx.shadowBlur = 16;

        const sliceWidth = width / timeData.length;
        let x = 0;

        for (let i = 0; i < timeData.length; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);

          x += sliceWidth;
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // ─── 4. RENDER & UPDATE PARTICLES ───
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [audioFx?.enabled, audioFx?.mode, audioFx?.sensitivity, audioFx?.simulateBeat]);

  if (!audioFx?.enabled) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className={className}
      />

      {/* Discrete Screen Click-to-Start Banner (if browser blocked automatic mic capture) */}
      {showPrompt && !hasMicAccess && (
        <div
          onClick={async () => {
            const ok = await audioEngine.start(audioFx.sensitivity || 1.2);
            if (ok) setShowPrompt(false);
          }}
          className="fixed inset-x-0 bottom-4 sm:bottom-8 z-50 flex justify-center px-4 cursor-pointer animate-bounce"
        >
          <div className="bg-surface-container-highest border-2 border-secondary text-secondary px-6 py-3 shadow-[6px_6px_0px_#100e09] flex items-center gap-3">
            <span className="text-xl animate-pulse">🎙️</span>
            <div>
              <p className="font-label-md text-xs sm:text-sm uppercase font-extrabold tracking-wider">
                AUDIO FX READY — CLICK ANYWHERE TO ACTIVATE MIC
              </p>
              <p className="text-[11px] text-on-surface-variant normal-case">
                Browser audio requires 1 user click to capture live stage sound.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Live Input Signal Badge in Bottom Right */}
      {hasMicAccess && (
        <div className="fixed bottom-4 right-4 z-40 bg-surface-container/85 border border-outline-variant/40 px-3 py-1.5 shadow-[3px_3px_0px_#100e09] pointer-events-none flex items-center gap-2.5 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span className="font-label-sm text-[10px] uppercase font-bold tracking-widest text-outline">
            {audioFx.simulateBeat ? "DEMO BEAT" : "LIVE MIC"}
          </span>
          <div className="w-12 h-2 bg-surface-container-lowest border border-outline-variant/30 overflow-hidden">
            <div
              className="h-full bg-secondary transition-all duration-75"
              style={{ width: `${Math.min(100, vuLevel)}%` }}
            ></div>
          </div>
        </div>
      )}
    </>
  );
}
