import { useState, useEffect } from "react";
import { subscribeToCounter, subscribeToMedia, defaultState } from "../lib/firebase.js";

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

  // ─── PANE 1: MEDIA DISPLAY (IMAGE / VIDEO) ───
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
      <div className="bg-surface min-h-screen w-full flex items-center justify-center p-2 sm:p-6 select-none overflow-hidden">
        <div className="max-w-6xl w-full h-[90vh] flex flex-col items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center bg-surface-container-lowest p-2 shadow-[8px_8px_0px_#100e09] border border-outline-variant/30">
            {selectedMedia.type === "video" ? (
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                loop
                muted
                playsInline
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <img
                src={selectedMedia.url}
                alt={selectedMedia.name || "Concert Visual"}
                className="max-h-full max-w-full object-contain"
              />
            )}
          </div>
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
  const barHeight = settings.barHeight || 28;
  const hideAmounts = settings.hideAmounts;
  const percentageMode = settings.percentageMode;
  const title = settings.title || "MUSIC FOR A CHANGE";

  const words = title.trim().split(" ");
  const lastWord = words.length > 1 ? words.pop() : "";
  const firstWords = words.join(" ");

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-3xl">
        <h1 className="font-headline-lg text-headline-lg uppercase tracking-tight text-on-surface mb-6 text-center sm:text-left">
          {firstWords ? `${firstWords} ` : ""}<span className="text-secondary">{lastWord || title}</span>
        </h1>

        {/* EXACT ORIGINAL SQUARE THERMOMETER BAR */}
        <div className="bg-surface-container p-6 sm:p-8 shadow-[6px_6px_0px_#100e09] border border-outline-variant/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <span className="font-label-md text-sm sm:text-base uppercase tracking-wider text-on-surface font-bold">
                CROWDFUND PROGRESS
              </span>
              <span className="bg-secondary-container text-on-secondary font-label-md text-sm sm:text-base px-3 py-1 font-extrabold tracking-wide">
                {pct}% REACHED
              </span>
            </div>
            {!hideAmounts && (
              <div className="font-label-lg text-base sm:text-lg text-secondary tracking-wider font-extrabold">
                {percentageMode ? `${pct}%` : `₹${raisedFmt} RAISED`}
              </div>
            )}
          </div>

          {/* Meter Bar: Strict sharp rectangle/square bar */}
          <div
            className="w-full bg-surface-container-lowest p-1.5 shadow-inner"
            style={{ height: `${Math.max(barHeight, 36)}px` }}
          >
            <div
              className="h-full bg-gradient-to-r from-secondary to-tertiary transition-all duration-700 ease-out"
              style={{ width: `${pct}%` }}
            ></div>
          </div>

          {/* Target Goal & Remaining Display (Controlled by showTarget toggle) */}
          {settings.showTarget !== false && !hideAmounts && (
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-outline-variant/20 font-label-md text-xs sm:text-sm uppercase tracking-wider text-outline">
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
