import { useState, useEffect, useRef } from "react";
import { subscribeToLiveDrops } from "../lib/firebase.js";

const DROP_STYLES = {
  cyan: {
    border: "border-[#5dd9d0]",
    text: "text-[#5dd9d0]",
    badgeBg: "bg-[#5dd9d0]/15 text-[#5dd9d0]",
    glow: "shadow-[0_0_25px_rgba(93,217,208,0.35)]"
  },
  magenta: {
    border: "border-[#ff2d75]",
    text: "text-[#ff2d75]",
    badgeBg: "bg-[#ff2d75]/15 text-[#ff2d75]",
    glow: "shadow-[0_0_25px_rgba(255,45,117,0.35)]"
  },
  gold: {
    border: "border-[#ffd2a4]",
    text: "text-[#ffd2a4]",
    badgeBg: "bg-[#ffd2a4]/15 text-[#ffd2a4]",
    glow: "shadow-[0_0_25px_rgba(255,210,164,0.35)]"
  },
  purple: {
    border: "border-[#c7bfff]",
    text: "text-[#c7bfff]",
    badgeBg: "bg-[#c7bfff]/15 text-[#c7bfff]",
    glow: "shadow-[0_0_25px_rgba(199,191,255,0.35)]"
  },
  emerald: {
    border: "border-[#86ecd5]",
    text: "text-[#86ecd5]",
    badgeBg: "bg-[#86ecd5]/15 text-[#86ecd5]",
    glow: "shadow-[0_0_25px_rgba(134,236,213,0.35)]"
  }
};

export default function LiveDropOverlay() {
  const [activeDrops, setActiveDrops] = useState([]);
  const seenIdsRef = useRef(new Set());
  const mountTimeRef = useRef(Date.now());

  useEffect(() => {
    // Inject keyframe animation for drifting & fading down
    const styleEl = document.createElement("style");
    styleEl.innerHTML = `
      @keyframes liveDropDrift {
        0% {
          transform: translate(-50%, -40px) scale(0.85);
          opacity: 0;
        }
        8% {
          transform: translate(-50%, 0px) scale(1.05);
          opacity: 1;
        }
        14% {
          transform: translate(-50%, 15px) scale(1.0);
          opacity: 1;
        }
        60% {
          transform: translate(-50%, 260px) scale(0.98);
          opacity: 0.95;
        }
        85% {
          transform: translate(-50%, 420px) scale(0.95);
          opacity: 0.45;
        }
        100% {
          transform: translate(-50%, 520px) scale(0.9);
          opacity: 0;
        }
      }
      .live-drop-bubble {
        animation: liveDropDrift 8s cubic-bezier(0.2, 0.8, 0.4, 1) forwards;
      }
    `;
    document.head.appendChild(styleEl);

    const unsub = subscribeToLiveDrops((drops) => {
      if (!drops || drops.length === 0) return;

      const now = Date.now();
      const newItems = [];

      drops.forEach((d) => {
        // Only trigger drops created within the last 15 seconds, and avoid re-triggering seen drops
        const isFresh = (now - (d.createdAt || 0)) < 15000;
        const isAfterMount = (d.createdAt || 0) >= mountTimeRef.current - 4000;

        if (isFresh && isAfterMount && !seenIdsRef.current.has(d.id)) {
          seenIdsRef.current.add(d.id);

          // Stagger horizontal position between 20% and 80%
          const randomX = 22 + Math.random() * 56;
          newItems.push({
            ...d,
            screenX: randomX,
            key: `${d.id}-${now}`
          });
        }
      });

      if (newItems.length > 0) {
        setActiveDrops((prev) => [...prev, ...newItems]);

        // Auto remove each drop after 8.2s
        setTimeout(() => {
          setActiveDrops((current) => current.filter((item) => (now + 8200) > Date.now()));
        }, 8200);
      }
    });

    return () => {
      unsub();
      if (document.head.contains(styleEl)) {
        document.head.removeChild(styleEl);
      }
    };
  }, []);

  if (activeDrops.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden select-none">
      {activeDrops.map((drop) => {
        const theme = DROP_STYLES[drop.style] || DROP_STYLES.cyan;

        return (
          <div
            key={drop.key}
            style={{
              left: `${drop.screenX}%`,
              top: "10%"
            }}
            className="absolute live-drop-bubble max-w-sm sm:max-w-xl md:max-w-2xl px-3"
          >
            <div
              className={`bg-surface-container-highest/95 backdrop-blur-md border-2 ${theme.border} p-4 sm:p-5 shadow-[6px_6px_0px_#100e09] ${theme.glow} flex items-center gap-3 sm:gap-4`}
            >
              {/* Animated Emoji Badge */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-surface-container-lowest border border-outline-variant/40 flex items-center justify-center shrink-0 text-2xl sm:text-3xl shadow-inner">
                <span className="animate-bounce">{drop.emoji || "💬"}</span>
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-label-sm text-[10px] sm:text-xs font-black uppercase tracking-widest px-1.5 py-0.5 ${theme.badgeBg}`}>
                    LIVE DROP
                  </span>
                  {drop.author && (
                    <span className="font-label-sm text-[10px] text-outline uppercase truncate max-w-[140px]">
                      FROM: {drop.author}
                    </span>
                  )}
                </div>

                <div className={`font-headline-md text-base sm:text-2xl md:text-3xl uppercase font-black tracking-tight leading-tight ${theme.text} drop-shadow-[2px_2px_0px_#100e09] break-words`}>
                  {drop.text}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
