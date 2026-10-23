import { useEffect, useRef, useState } from "react";
import { audioEngine } from "../lib/audioEngine.js";

// Color palettes for concert aesthetics
const PALETTES = {
  chromatic: (baseHue) => ({
    c1: `hsl(${baseHue}, 95%, 65%)`,
    c2: `hsl(${(baseHue + 60) % 360}, 95%, 70%)`,
    c3: `hsl(${(baseHue + 120) % 360}, 95%, 75%)`,
    c4: `hsl(${(baseHue + 180) % 360}, 95%, 70%)`,
    alpha: (h, a) => `hsla(${h % 360}, 90%, 65%, ${a})`,
    accent: `hsl(${baseHue}, 100%, 75%)`
  }),
  cyberpunk: () => ({
    c1: "#5dd9d0",
    c2: "#ff2d75",
    c3: "#c7bfff",
    c4: "#00f2fe",
    alpha: (h, a) => (h % 2 === 0 ? `rgba(93, 217, 208, ${a})` : `rgba(255, 45, 117, ${a})`),
    accent: "#ff2d75"
  }),
  sunset: () => ({
    c1: "#ff9f43",
    c2: "#ee5253",
    c3: "#ff6b6b",
    c4: "#feca57",
    alpha: (h, a) => `rgba(255, 159, 67, ${a})`,
    accent: "#ff9f43"
  }),
  emerald: () => ({
    c1: "#10ac84",
    c2: "#00d2d3",
    c3: "#55efc4",
    c4: "#81ecec",
    alpha: (h, a) => `rgba(0, 210, 211, ${a})`,
    accent: "#00d2d3"
  }),
  monochrome: () => ({
    c1: "#ffffff",
    c2: "#dcdde1",
    c3: "#f5f6fa",
    c4: "#718093",
    alpha: (h, a) => `rgba(255, 255, 255, ${a})`,
    accent: "#ffffff"
  })
};

export default function AudioVisualizerCanvas({
  audioFx,
  className = "fixed inset-0 pointer-events-none z-0 w-full h-full"
}) {
  const canvasRef = useRef(null);
  const [hasMicAccess, setHasMicAccess] = useState(audioEngine.isListening || audioEngine.simulate);
  const [showPrompt, setShowPrompt] = useState(false);
  const [vuLevel, setVuLevel] = useState(0);

  // Animation pools
  const particlesRef = useRef([]);
  const matrixDropsRef = useRef([]);
  const confettiRef = useRef([]);
  const tunnelRingsRef = useRef([]);
  const rockHandScaleRef = useRef(1);

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
      audioEngine.start(audioFx.sensitivity || 1.2).then((ok) => {
        if (!ok) setShowPrompt(true);
      });
    } else if (!audioFx.enabled) {
      setShowPrompt(false);
    }
  }, [audioFx?.enabled, audioFx?.sensitivity, audioFx?.simulateBeat]);

  // Handle Easter Egg triggers from Firebase
  useEffect(() => {
    if (!audioFx?.easterEgg) return;

    if (audioFx.easterEgg === "confetti") {
      const colors = ["#ffd2a4", "#5dd9d0", "#ff2d75", "#c7bfff", "#86ecd5", "#ffb4ab"];
      const newConfetti = [];
      for (let i = 0; i < 120; i++) {
        newConfetti.push({
          x: Math.random() * window.innerWidth,
          y: -20 - Math.random() * 200,
          vx: (Math.random() - 0.5) * 6,
          vy: 3 + Math.random() * 6,
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 12,
          size: 8 + Math.random() * 12,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 1.0,
          decay: 0.003 + Math.random() * 0.003
        });
      }
      confettiRef.current = newConfetti;
    }
  }, [audioFx?.easterEgg]);

  // Main 60 FPS Canvas Rendering Loop
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
    const confetti = confettiRef.current;
    let matrixDrops = matrixDropsRef.current;
    const tunnelRings = tunnelRingsRef.current;

    // Initialize Matrix Drops
    const colCount = Math.floor(window.innerWidth / 24);
    if (matrixDrops.length !== colCount) {
      matrixDrops = Array.from({ length: colCount }, () => Math.random() * -100);
      matrixDropsRef.current = matrixDrops;
    }

    const render = () => {
      animId = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const metrics = audioEngine.getMetrics();
      const mode = audioFx.mode || "full";
      const paletteKey = audioFx.colorPalette || "chromatic";
      const getPalette = PALETTES[paletteKey] || PALETTES.chromatic;
      const now = performance.now();

      // Base hue slowly cycles over time and speeds up with audio energy
      const baseHue = ((now * 0.04) + (metrics.bass * 60)) % 360;
      const colors = getPalette(baseHue);

      // Periodically update VU meter for UI badge
      frameCount++;
      if (frameCount % 6 === 0) {
        setVuLevel(metrics.rawVolume || 0);
      }

      // ─── 1. BASS SUPERNOVA & RADIAL AURA ───
      if ((mode === "pulse" || mode === "full") && metrics.bass > 0.05) {
        const radius = Math.min(width, height) * (0.32 + metrics.bass * 0.38);
        const grad = ctx.createRadialGradient(
          width / 2,
          height / 2,
          radius * 0.05,
          width / 2,
          height / 2,
          radius
        );
        grad.addColorStop(0, colors.alpha(baseHue, Math.min(0.35, metrics.bass * 0.28)));
        grad.addColorStop(0.5, colors.alpha(baseHue + 60, Math.min(0.2, metrics.mid * 0.18)));
        grad.addColorStop(1, "rgba(21, 19, 14, 0)");

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Shockwave ring on heavy kicks
        if (metrics.beatDetected) {
          ctx.save();
          ctx.strokeStyle = colors.accent;
          ctx.lineWidth = 4;
          ctx.shadowColor = colors.accent;
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(width / 2, height / 2, radius * 0.75, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

      // ─── 2. SPECTRUM EQUALIZER BARS (WITH PEAK CAPS) ───
      if ((mode === "spectrum" || mode === "full") && metrics.dataArray) {
        const binCount = 42;
        const barWidth = width / binCount;
        const data = metrics.dataArray;

        for (let i = 0; i < binCount; i++) {
          const val = (data[i] || 0) / 255;
          const barHeight = val * height * 0.35 * (audioFx.sensitivity || 1.2);
          const x = i * barWidth;
          const y = height - barHeight;

          const barHue = (baseHue + i * 5) % 360;
          const barGrad = ctx.createLinearGradient(x, y, x, height);
          barGrad.addColorStop(0, colors.alpha(barHue, 0.95));
          barGrad.addColorStop(0.5, colors.alpha(barHue + 40, 0.55));
          barGrad.addColorStop(1, colors.alpha(barHue + 80, 0.05));

          ctx.fillStyle = barGrad;
          ctx.fillRect(x + 1.5, y, barWidth - 3, barHeight);

          // Crisp White Floating Peak Cap
          if (val > 0.15) {
            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = colors.accent;
            ctx.shadowBlur = 6;
            ctx.fillRect(x + 1.5, y - 3, barWidth - 3, 2.5);
            ctx.shadowBlur = 0;
          }
        }
      }

      // ─── 3. SILKY SMOOTH LIQUID LASER WAVEFORM (FIXED & POLISHED) ───
      const showWave = (mode === "wave" || mode === "full") && audioFx.wavePosition !== "hidden";
      if (showWave && metrics.timeDomainArray) {
        const timeData = metrics.timeDomainArray;
        const len = timeData.length;

        // Position: center (50%), bottom (85%), or top (15%)
        const pos = audioFx.wavePosition || "center";
        const centerY = pos === "bottom" ? height * 0.85 : pos === "top" ? height * 0.15 : height * 0.5;

        // Controlled amplitude to prevent blow-outs
        const maxAmp = height * (pos === "bottom" ? 0.08 : 0.12) * Math.min(2.0, audioFx.sensitivity || 1.2);

        // Multi-stop flowing chromatic gradient
        const waveGrad = ctx.createLinearGradient(0, 0, width, 0);
        waveGrad.addColorStop(0, colors.c1);
        waveGrad.addColorStop(0.33, colors.c2);
        waveGrad.addColorStop(0.66, colors.c3);
        waveGrad.addColorStop(1, colors.c4);

        // Downsample to 48 smoothed points for silky spline interpolation
        const sampleCount = 48;
        const step = Math.floor(len / sampleCount);
        const points = [];

        for (let i = 0; i < sampleCount; i++) {
          const idx = Math.min(len - 1, i * step);
          // Apply 3-tap moving average filter
          const prev = timeData[Math.max(0, idx - 1)] || 128;
          const curr = timeData[idx] || 128;
          const next = timeData[Math.min(len - 1, idx + 1)] || 128;
          const smoothByte = (prev + curr * 2 + next) / 4;
          const deviation = (smoothByte - 128) / 128.0;

          points.push({
            x: (i / (sampleCount - 1)) * width,
            y: centerY + deviation * maxAmp
          });
        }

        // Draw primary glowing laser spline curve
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = waveGrad;
        ctx.shadowColor = colors.accent;
        ctx.shadowBlur = 14;

        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        ctx.stroke();

        // Draw subtle mirrored neon shadow ribbon
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = colors.alpha(baseHue + 90, 0.4);
        ctx.shadowBlur = 6;
        ctx.moveTo(points[0].x, centerY * 2 - points[0].y);
        for (let i = 1; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = centerY * 2 - (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, centerY * 2 - points[i].y, xc, yc);
        }
        ctx.lineTo(points[points.length - 1].x, centerY * 2 - points[points.length - 1].y);
        ctx.stroke();
        ctx.restore();
      }

      // ─── 4. BEAT PARTICLE EMISSION & UPDATE ───
      if (metrics.beatDetected && (mode === "particles" || mode === "full")) {
        const burstCount = 18;
        for (let i = 0; i < burstCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 4 + Math.random() * 8;
          particles.push({
            x: width / 2,
            y: height / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 3 + Math.random() * 7,
            life: 1.0,
            decay: 0.015 + Math.random() * 0.02,
            color: colors.alpha(baseHue + Math.random() * 90, 0.95)
          });
        }
      }

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

      // ─── 5. CYBER MATRIX RAIN MODE ───
      if (mode === "matrix") {
        ctx.save();
        ctx.fillStyle = colors.alpha(120, 0.85);
        ctx.font = "14px 'Space Mono', monospace";
        for (let i = 0; i < matrixDrops.length; i++) {
          const char = String.fromCharCode(0x30a0 + Math.floor(Math.random() * 96));
          const x = i * 24;
          const y = matrixDrops[i];
          ctx.fillText(char, x, y);

          const speed = (2 + metrics.bass * 8) * (audioFx.sensitivity || 1.2);
          matrixDrops[i] += speed;
          if (matrixDrops[i] > height) matrixDrops[i] = Math.random() * -50;
        }
        ctx.restore();
      }

      // ─── 6. HYPERSPACE WARP TUNNEL MODE ───
      if (mode === "tunnel") {
        if (tunnelRings.length < 12) {
          tunnelRings.push({ r: 20, maxR: Math.max(width, height) * 0.7 });
        }
        ctx.save();
        ctx.lineWidth = 2.5;
        for (let i = tunnelRings.length - 1; i >= 0; i--) {
          const ring = tunnelRings[i];
          ring.r += (3 + metrics.bass * 12) * (audioFx.sensitivity || 1.2);
          const alpha = Math.max(0, 1 - ring.r / ring.maxR);
          ctx.strokeStyle = colors.alpha(baseHue + i * 25, alpha);
          ctx.beginPath();
          ctx.arc(width / 2, height / 2, ring.r, 0, Math.PI * 2);
          ctx.stroke();

          if (ring.r >= ring.maxR) {
            tunnelRings.splice(i, 1);
          }
        }
        ctx.restore();
      }

      // ─── 7. EASTER EGG: CONFETTI EXPLOSION ───
      if (confetti.length > 0) {
        ctx.save();
        for (let i = confetti.length - 1; i >= 0; i--) {
          const c = confetti[i];
          c.x += c.vx;
          c.y += c.vy;
          c.rotation += c.rotSpeed;
          c.life -= c.decay;

          if (c.life <= 0 || c.y > height + 50) {
            confetti.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.translate(c.x, c.y);
          ctx.rotate((c.rotation * Math.PI) / 180);
          ctx.fillStyle = c.color;
          ctx.globalAlpha = Math.min(1.0, c.life * 1.5);
          ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
          ctx.restore();
        }
        ctx.restore();
      }

      // ─── 8. EASTER EGG: ROCK ON HEADBANGING HAND 🤘 ───
      if (audioFx.easterEgg === "rockhand") {
        ctx.save();
        const targetScale = metrics.beatDetected ? 1.4 : 1.0 + metrics.bass * 0.25;
        rockHandScaleRef.current = rockHandScaleRef.current * 0.7 + targetScale * 0.3;
        const scale = rockHandScaleRef.current;

        ctx.translate(width / 2, height / 2);
        ctx.scale(scale, scale);
        ctx.rotate(Math.sin(now * 0.01) * 0.15);

        ctx.font = `${Math.min(width, height) * 0.32}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = colors.accent;
        ctx.shadowBlur = 30;
        ctx.fillText("🤘", 0, 0);
        ctx.restore();
      }

      // ─── 9. EASTER EGG: MOSHPIT STROBE GLITCH ───
      if (audioFx.easterEgg === "moshpit") {
        if (Math.random() > 0.4) {
          ctx.fillStyle = colors.alpha(Math.random() * 360, 0.35);
          ctx.fillRect(0, 0, width, height);
        }
        // Scanlines
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        for (let y = 0; y < height; y += 8) {
          ctx.fillRect(0, y, width, 4);
        }
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [audioFx?.enabled, audioFx?.mode, audioFx?.sensitivity, audioFx?.simulateBeat, audioFx?.colorPalette, audioFx?.wavePosition, audioFx?.easterEgg]);

  if (!audioFx?.enabled) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className={className}
      />

      {/* Discrete Screen Click-to-Start Banner */}
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
