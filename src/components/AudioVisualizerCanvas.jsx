import { useEffect, useRef, useState } from "react";
import { audioEngine } from "../lib/audioEngine.js";

export default function AudioVisualizerCanvas({ audioFx }) {
  const canvasRef = useRef(null);
  const [hasMicAccess, setHasMicAccess] = useState(audioEngine.isListening);
  const [showPrompt, setShowPrompt] = useState(false);
  const particlesRef = useRef([]);

  useEffect(() => {
    const unsub = audioEngine.subscribe((listening) => {
      setHasMicAccess(listening);
      if (listening) setShowPrompt(false);
    });
    return unsub;
  }, []);

  // When audioFx is enabled, prompt user to enable mic if not already started
  useEffect(() => {
    if (audioFx?.enabled) {
      audioEngine.setSensitivity(audioFx.sensitivity || 1.2);
      if (!audioEngine.isListening) {
        // Try auto-starting if permission already granted
        audioEngine.start(audioFx.sensitivity || 1.2).then((ok) => {
          if (!ok) setShowPrompt(true);
        });
      }
    } else {
      setShowPrompt(false);
    }
  }, [audioFx?.enabled, audioFx?.sensitivity]);

  useEffect(() => {
    if (!audioFx?.enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize/maintain particle pool for beats
    const particles = particlesRef.current;

    const render = () => {
      animId = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const metrics = audioEngine.getMetrics();
      const mode = audioFx.mode || "full";

      // ─── BEAT PARTICLE EMISSION ───
      if (metrics.beatDetected && (mode === "particles" || mode === "full")) {
        const burstCount = 18;
        const originX = width / 2;
        const originY = height / 2;
        for (let i = 0; i < burstCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 3 + Math.random() * 8;
          particles.push({
            x: originX,
            y: originY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 3 + Math.random() * 6,
            life: 1.0,
            decay: 0.015 + Math.random() * 0.02,
            color: Math.random() > 0.4 ? "#5dd9d0" : "#ffb2b6"
          });
        }
      }

      // ─── 1. BASS PULSE & AMBIENT AURA ───
      if ((mode === "pulse" || mode === "full") && metrics.bass > 0.05) {
        const radius = Math.min(width, height) * (0.35 + metrics.bass * 0.4);
        const grad = ctx.createRadialGradient(
          width / 2,
          height / 2,
          radius * 0.1,
          width / 2,
          height / 2,
          radius
        );
        grad.addColorStop(0, `rgba(93, 217, 208, ${Math.min(0.28, metrics.bass * 0.22)})`);
        grad.addColorStop(0.5, `rgba(199, 191, 255, ${Math.min(0.18, metrics.mid * 0.15)})`);
        grad.addColorStop(1, "rgba(21, 19, 14, 0)");

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // ─── 2. SPECTRUM EQUALIZER BARS ───
      if ((mode === "spectrum" || mode === "full") && metrics.dataArray) {
        const binCount = 48;
        const barWidth = width / binCount;
        const data = metrics.dataArray;

        for (let i = 0; i < binCount; i++) {
          const val = (data[i] || 0) / 255;
          const barHeight = val * height * 0.35 * (audioFx.sensitivity || 1.2);

          // Mirror bars across top or bottom
          const x = i * barWidth;
          const y = height - barHeight;

          // Cyber gradient
          const barGrad = ctx.createLinearGradient(x, y, x, height);
          barGrad.addColorStop(0, "rgba(93, 217, 208, 0.85)"); // secondary cyan
          barGrad.addColorStop(0.6, "rgba(199, 191, 255, 0.45)"); // primary
          barGrad.addColorStop(1, "rgba(21, 19, 14, 0.1)");

          ctx.fillStyle = barGrad;
          ctx.fillRect(x + 1, y, barWidth - 2, barHeight);

          // Top peak dot
          if (val > 0.2) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(x + 1, y - 3, barWidth - 2, 2);
          }
        }
      }

      // ─── 3. UNDULATING AUDIO WAVEFORM ───
      if ((mode === "wave" || mode === "full") && metrics.timeDomainArray) {
        const timeData = metrics.timeDomainArray;
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(93, 217, 208, 0.75)";
        ctx.shadowColor = "#5dd9d0";
        ctx.shadowBlur = 12;

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
        ctx.shadowBlur = 0; // reset
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
  }, [audioFx?.enabled, audioFx?.mode, audioFx?.sensitivity]);

  if (!audioFx?.enabled) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 w-full h-full"
      />

      {/* Discrete 1-Tap Mic Activation Prompt if permission not yet granted */}
      {showPrompt && !hasMicAccess && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <button
            type="button"
            onClick={async () => {
              const ok = await audioEngine.start(audioFx.sensitivity || 1.2);
              if (ok) setShowPrompt(false);
            }}
            className="flex items-center gap-2.5 bg-surface-container border border-secondary text-secondary font-label-md text-xs uppercase font-extrabold px-4 py-2.5 shadow-[4px_4px_0px_#100e09] hover:bg-secondary hover:text-on-secondary transition-all cursor-pointer"
          >
            <span className="text-base animate-pulse">🎙️</span>
            <span>Enable Live Audio FX</span>
          </button>
        </div>
      )}
    </>
  );
}
