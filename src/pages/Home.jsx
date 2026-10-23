import { useState, useEffect } from "react";
import { subscribeToCounter, subscribeToMedia, defaultState } from "../lib/firebase.js";

const SIZE_CLASSES = {
  compact: {
    container: "max-w-xl",
    title: "text-2xl sm:text-3xl mb-4 sm:mb-5",
    cardPadding: "px-4 pb-4 pt-2 sm:px-5 sm:pb-5 sm:pt-2.5",
    label: "text-xs sm:text-sm",
    pctBadge: "text-xs sm:text-sm px-2 py-0.5",
    tally: "text-sm sm:text-base",
    barMinHeight: 24,
    targetText: "text-[11px] sm:text-xs"
  },
  medium: {
    container: "max-w-3xl",
    title: "text-3xl sm:text-4xl md:text-5xl mb-6 sm:mb-7",
    cardPadding: "px-6 pb-6 pt-2.5 sm:px-8 sm:pb-8 sm:pt-3",
    label: "text-sm sm:text-base",
    pctBadge: "text-sm sm:text-base px-3 py-1",
    tally: "text-base sm:text-lg",
    barMinHeight: 36,
    targetText: "text-xs sm:text-sm"
  },
  large: {
    container: "max-w-5xl",
    title: "text-4xl sm:text-6xl md:text-7xl mb-8 sm:mb-9",
    cardPadding: "px-8 pb-8 pt-3 sm:px-12 sm:pb-12 sm:pt-4",
    label: "text-base sm:text-xl",
    pctBadge: "text-base sm:text-xl px-4 py-1.5",
    tally: "text-xl sm:text-2xl",
    barMinHeight: 48,
    targetText: "text-sm sm:text-base"
  },
  huge: {
    container: "max-w-7xl",
    title: "text-5xl sm:text-7xl md:text-8xl mb-10 sm:mb-12",
    cardPadding: "px-10 pb-10 pt-4 sm:px-16 sm:pb-16 sm:pt-5",
    label: "text-lg sm:text-2xl",
    pctBadge: "text-lg sm:text-2xl px-5 py-2",
    tally: "text-2xl sm:text-4xl",
    barMinHeight: 64,
    targetText: "text-base sm:text-xl"
  }
};

export default function Home() {
  const [counterData, setCounterData] = useState(defaultState);
  const [mediaItems, setMediaItems] = useState([]);

  useEffect(() => {
    const unsubCounter = subscribeToCounter((data) => {
      if (data) setCounterData(data);
    });

    const unsubMedia = subscribeToMedia((items) => {
      setMediaItems(items || []);
    });

    return () => {
      unsubCounter();
      unsubMedia();
    };
  }, []);

  const activePane = counterData.activePane || "counter";
  const selectedMedia = mediaItems.find((m) => m.id === counterData.selectedMediaId) || mediaItems[0];
  const customText = counterData.customText || defaultState.customText;

  // ─── PANE 1: MEDIA DISPLAY (IMAGE / VIDEO - FULL SCREEN / FULL SIZE) ───
  if (activePane === "media") {
    if (!selectedMedia) {
      return (
        <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center p-8">
          <div className="bg-surface-container p-8 shadow-[6px_6px_0px_#100e09] border border-outline-variant/30 text-center max-w-md">
            <span className="text-secondary font-label-md text-sm uppercase font-bold tracking-widest block mb-2">
              MEDIA PANE ACTIVE
            </span>
            <p className="font-body-md text-sm text-outline">
              No media selected in Admin yet. Upload or select an image/video from the Admin panel.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-surface min-h-screen w-screen h-screen flex items-center justify-center p-0 m-0 select-none overflow-hidden fixed inset-0">
        <div className="w-full h-full flex items-center justify-center bg-black">
          {selectedMedia.type === "video" ? (
            <video
              src={selectedMedia.url}
              controls
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-contain"
            />
          ) : (
            <img
              src={selectedMedia.url}
              alt={selectedMedia.name || "Concert Visual"}
              className="w-full h-full object-contain"
            />
          )}
        </div>
      </div>
    );
  }

  // ─── PANE 2: CUSTOM TEXT DISPLAY ───
  if (activePane === "custom") {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-4xl bg-surface-container p-8 sm:p-14 shadow-[8px_8px_0px_#100e09] border border-outline-variant/30 text-center">
          {customText.heading && (
            <h1 className="font-headline-xl text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight text-on-surface mb-6 leading-tight">
              {customText.heading}
            </h1>
          )}

          {customText.subheading && (
            <p className="font-label-lg text-lg sm:text-2xl text-secondary uppercase font-bold tracking-wider mb-6">
              {customText.subheading}
            </p>
          )}

          {customText.body && (
            <div className="max-w-2xl mx-auto font-body-lg text-base sm:text-xl text-on-surface-variant leading-relaxed whitespace-pre-line border-t border-outline-variant/30 pt-6">
              {customText.body}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── PANE 3: DONATION COUNTER (DEFAULT) ───
  const raised = Number(counterData.raised || 0);
  const goal = Number(counterData.goal || 150000);
  const pct = goal ? Math.min(100, ((raised / goal) * 100)).toFixed(1) : 0;
  const raisedFmt = raised.toLocaleString("en-IN");
  const settings = counterData.settings || {};
  const sizeKey = settings.size || "medium";
  const sizeConfig = SIZE_CLASSES[sizeKey] || SIZE_CLASSES.medium;
  const barHeight = Math.max(settings.barHeight || 28, sizeConfig.barMinHeight);
  const hideAmounts = settings.hideAmounts;
  const percentageMode = settings.percentageMode;
  const title = settings.title || "MUSIC FOR A CHANGE";

  const words = title.trim().split(" ");
  const lastWord = words.length > 1 ? words.pop() : "";
  const firstWords = words.join(" ");

  return (
    <div className="relative bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex items-center justify-center p-4 sm:p-8 overflow-hidden select-none">
      {/* ─── FULL-SCREEN BACKGROUND PROGRESS WATERMARK FILL ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center">
        {/* Fill from bottom to top based on percentage */}
        <div
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-secondary/15 via-secondary/10 to-transparent transition-all duration-1000 ease-out"
          style={{ height: `${pct}%` }}
        />

        {/* Ambient glow line at current percentage level */}
        <div
          className="absolute inset-x-0 h-[2px] bg-secondary/40 shadow-[0_0_20px_#5dd9d0] transition-all duration-1000 ease-out"
          style={{ bottom: `${pct}%` }}
        />

        {/* Massive Background Percentage Watermark */}
        <div className="font-headline-xl font-black text-secondary/[0.07] select-none text-[32vw] tracking-tighter leading-none transform translate-y-6">
          {Math.round(pct)}%
        </div>
      </div>

      {/* Main Foreground Donation Card */}
      <div className={`relative z-10 w-full ${sizeConfig.container} transition-all duration-300`}>
        {/* Main Heading Text */}
        <h1 className={`font-headline-lg ${sizeConfig.title} uppercase tracking-tight text-on-surface text-center sm:text-left font-extrabold`}>
          {firstWords ? `${firstWords} ` : ""}<span className="text-secondary">{lastWord || title}</span>
        </h1>

        {/* EXACT ORIGINAL SQUARE THERMOMETER BAR */}
        <div className={`bg-surface-container/95 backdrop-blur-md ${sizeConfig.cardPadding} shadow-[6px_6px_0px_#100e09] border border-outline-variant/30`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-3">
              <span className={`font-label-md ${sizeConfig.label} uppercase tracking-wider text-on-surface font-bold`}>
                CROWDFUND PROGRESS
              </span>
              <span className={`bg-secondary-container text-on-secondary font-label-md ${sizeConfig.pctBadge} font-extrabold tracking-wide`}>
                {pct}% REACHED
              </span>
            </div>
            {!hideAmounts && (
              <div className={`font-label-lg ${sizeConfig.tally} text-secondary tracking-wider font-extrabold`}>
                {percentageMode ? `${pct}%` : `₹${raisedFmt} RAISED`}
              </div>
            )}
          </div>

          {/* Meter Bar: Strict sharp rectangle/square bar */}
          <div
            className="w-full bg-surface-container-lowest p-1.5 shadow-inner"
            style={{ height: `${barHeight}px` }}
          >
            <div
              className="h-full bg-gradient-to-r from-secondary to-tertiary transition-all duration-700 ease-out"
              style={{ width: `${pct}%` }}
            ></div>
          </div>

          {/* Target Goal & Remaining Display (Controlled by showTarget toggle) */}
          {settings.showTarget !== false && !hideAmounts && (
            <div className={`flex justify-between items-center mt-3 pt-2.5 border-t border-outline-variant/20 font-label-md ${sizeConfig.targetText} uppercase tracking-wider text-outline`}>
              <span className="flex items-center gap-2 font-bold text-on-surface-variant">
                <span className="w-2 h-2 bg-secondary inline-block"></span>
                TARGET: ₹{goal.toLocaleString("en-IN")}
              </span>
              <span className="font-bold text-secondary">
                REMAINING: ₹{Math.max(0, goal - raised).toLocaleString("en-IN")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
