import { useState, useEffect } from "react";
import { fetchLiveState, getLocalState } from "../lib/liveCounter.js";

const THEME_STYLES = {
  default: {
    bg: "var(--surface)",
    cardBg: "var(--surface-container)",
    barBg: "var(--surface-container-lowest)",
    barGradient: "linear-gradient(to right, var(--secondary), var(--tertiary))",
    textColor: "var(--on-surface)",
    accentColor: "var(--secondary)",
    badgeBg: "var(--secondary-container)",
    badgeText: "var(--on-secondary)",
  },
  "amber-gold": {
    bg: "#120e06",
    cardBg: "#1f1809",
    barBg: "#0d0a04",
    barGradient: "linear-gradient(to right, #f6b060, #ffd2a4)",
    textColor: "#fff4e5",
    accentColor: "#f6b060",
    badgeBg: "#704200",
    badgeText: "#ffd2a4",
  },
  "neon-cyan": {
    bg: "#061314",
    cardBg: "#0a2224",
    barBg: "#030a0b",
    barGradient: "linear-gradient(to right, #00e5ff, #00ffa2)",
    textColor: "#e0f7fa",
    accentColor: "#00e5ff",
    badgeBg: "#006064",
    badgeText: "#84ffff",
  },
  "retro-orange": {
    bg: "#150d0a",
    cardBg: "#241611",
    barBg: "#0c0705",
    barGradient: "linear-gradient(to right, #ff5722, #ff9800)",
    textColor: "#fbe9e7",
    accentColor: "#ff7043",
    badgeBg: "#bf360c",
    badgeText: "#ffccbc",
  },
  monochrome: {
    bg: "#0a0a0a",
    cardBg: "#171717",
    barBg: "#000000",
    barGradient: "linear-gradient(to right, #737373, #e5e5e5)",
    textColor: "#fafafa",
    accentColor: "#f5f5f5",
    badgeBg: "#404040",
    badgeText: "#ffffff",
  }
};

const SIZE_STYLES = {
  compact: {
    maxW: "max-w-md",
    titleSize: "text-2xl sm:text-3xl",
    labelSize: "text-xs",
    amountSize: "text-lg",
    cardPadding: "p-4",
    defaultBarH: 20
  },
  medium: {
    maxW: "max-w-2xl",
    titleSize: "text-3xl sm:text-4xl lg:text-5xl",
    labelSize: "text-sm",
    amountSize: "text-xl",
    cardPadding: "p-6 sm:p-8",
    defaultBarH: 28
  },
  large: {
    maxW: "max-w-4xl",
    titleSize: "text-4xl sm:text-6xl lg:text-7xl",
    labelSize: "text-base",
    amountSize: "text-2xl sm:text-3xl",
    cardPadding: "p-8 sm:p-12",
    defaultBarH: 40
  },
  huge: {
    maxW: "max-w-6xl",
    titleSize: "text-5xl sm:text-7xl lg:text-8xl",
    labelSize: "text-lg",
    amountSize: "text-3xl sm:text-4xl",
    cardPadding: "p-10 sm:p-16",
    defaultBarH: 52
  }
};

export default function Home() {
  const [counterData, setCounterData] = useState(() => getLocalState());

  useEffect(() => {
    fetchLiveState().then((data) => {
      if (data) setCounterData(data);
    });

    const interval = setInterval(() => {
      fetchLiveState().then((data) => {
        if (data) setCounterData(data);
      });
    }, 2000);

    let bc;
    try {
      if (typeof BroadcastChannel !== "undefined") {
        bc = new BroadcastChannel("donation_counter_channel");
        bc.onmessage = (event) => {
          if (event.data) setCounterData(event.data);
        };
      }
    } catch {}

    const handleCustomUpdate = (e) => {
      if (e.detail) setCounterData(e.detail);
    };
    window.addEventListener("donation_counter_updated", handleCustomUpdate);

    return () => {
      clearInterval(interval);
      if (bc) bc.close();
      window.removeEventListener("donation_counter_updated", handleCustomUpdate);
    };
  }, []);

  const raised = Number(counterData.raised || 0);
  const goal = Number(counterData.goal || 150000);
  const pct = goal ? Math.min(100, Math.max(0, (raised / goal) * 100)) : 0;
  const pctFmt = pct.toFixed(1);
  const raisedFmt = raised.toLocaleString("en-IN");
  const goalFmt = goal.toLocaleString("en-IN");

  const settings = counterData.settings || {};
  const currentTheme = THEME_STYLES[settings.theme] || THEME_STYLES.default;
  const currentSize = SIZE_STYLES[settings.size] || SIZE_STYLES.medium;
  const barHeight = Number(settings.barHeight) || currentSize.defaultBarH;
  const title = settings.title || "MUSIC FOR A CHANGE";

  return (
    <div
      style={{ backgroundColor: currentTheme.bg, color: currentTheme.textColor }}
      className="font-body-md min-h-screen flex items-center justify-center p-4 sm:p-8 transition-colors duration-500 selection:bg-secondary-container selection:text-on-secondary-container"
    >
      <div className={`w-full ${currentSize.maxW} transition-all duration-300`}>
        {/* Title */}
        {title && (
          <h1
            className={`font-headline-lg ${currentSize.titleSize} uppercase tracking-tight mb-6 text-center sm:text-left font-black transition-all`}
          >
            {title.includes(" ") ? (
              <>
                {title.substring(0, title.lastIndexOf(" "))}{" "}
                <span style={{ color: currentTheme.accentColor }}>
                  {title.substring(title.lastIndexOf(" ") + 1)}
                </span>
              </>
            ) : (
              <span style={{ color: currentTheme.accentColor }}>{title}</span>
            )}
          </h1>
        )}

        {/* Square Thermometer Bar Box */}
        <div
          style={{
            backgroundColor: currentTheme.cardBg,
            boxShadow: settings.squareShadow !== false ? "4px 4px 0px #100e09" : "none"
          }}
          className={`${currentSize.cardPadding} border border-outline-variant/30 transition-all`}
        >
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className={`font-label-md ${currentSize.labelSize} uppercase tracking-wider font-bold`}>
                CROWDFUND PROGRESS
              </span>
              <span
                style={{ backgroundColor: currentTheme.badgeBg, color: currentTheme.badgeText }}
                className="font-label-sm text-xs px-2 py-0.5 font-bold uppercase tracking-wider"
              >
                {pctFmt}% REACHED
              </span>
            </div>

            {/* Amount / Percentage Display Mode */}
            {!settings.hideAmounts && (
              <div
                style={{ color: currentTheme.accentColor }}
                className={`font-label-md ${currentSize.amountSize} tracking-wider font-bold text-right`}
              >
                {settings.percentageMode ? (
                  <span>{pctFmt}% COMPLETE</span>
                ) : (
                  <span>₹{raisedFmt} RAISED</span>
                )}
              </div>
            )}
          </div>

          {/* Strict Sharp Square Bar */}
          <div
            style={{ backgroundColor: currentTheme.barBg, height: `${barHeight}px` }}
            className="w-full p-1 shadow-inner relative overflow-hidden"
          >
            <div
              className="h-full transition-all duration-700 ease-out"
              style={{
                width: `${pct}%`,
                background: settings.customColor || currentTheme.barGradient
              }}
            ></div>
          </div>

          {/* Optional Footer Target Details if not in percentage-only mode */}
          {settings.percentageMode && (
            <div className="flex justify-between items-center mt-2 text-xs font-mono opacity-60 uppercase">
              <span>0% Kickoff</span>
              <span>100% Target</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
