import { useState, useEffect } from "react";
import { subscribeToCounter, defaultState } from "../lib/firebase.js";

export default function Home() {
  const [counterData, setCounterData] = useState(defaultState);

  useEffect(() => {
    const unsubscribe = subscribeToCounter((data) => {
      if (data) setCounterData(data);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const raised = Number(counterData.raised || 0);
  const goal = Number(counterData.goal || 150000);
  const pct = goal ? Math.min(100, ((raised / goal) * 100)).toFixed(1) : 0;
  const raisedFmt = raised.toLocaleString("en-IN");
  const settings = counterData.settings || {};
  const barHeight = settings.barHeight || 28;
  const hideAmounts = settings.hideAmounts;
  const percentageMode = settings.percentageMode;
  const title = settings.title || "MUSIC FOR A CHANGE";

  // Split title if it has spaces so last word has secondary accent
  const words = title.trim().split(" ");
  const lastWord = words.length > 1 ? words.pop() : "";
  const firstWords = words.join(" ");

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        <h1 className="font-headline-lg text-headline-lg uppercase tracking-tight text-on-surface mb-6 text-center sm:text-left">
          {firstWords ? `${firstWords} ` : ""}<span className="text-secondary">{lastWord || title}</span>
        </h1>

        {/* EXACT ORIGINAL SQUARE THERMOMETER BAR */}
        <div className="bg-surface-container p-space-md shadow-[4px_4px_0px_#100e09] border border-outline-variant/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs mb-space-xs">
            <div className="flex items-center gap-space-xs">
              <span className="font-label-md text-label-md uppercase text-on-surface">CROWDFUND PROGRESS</span>
              <span className="bg-secondary-container text-on-secondary font-label-sm text-label-sm px-space-xs py-0.5 font-bold">
                {pct}% REACHED
              </span>
            </div>
            {!hideAmounts && (
              <div className="font-label-md text-label-md text-secondary tracking-wider font-bold">
                {percentageMode ? `${pct}%` : `₹${raisedFmt} RAISED`}
              </div>
            )}
          </div>

          {/* Meter Bar: Strict sharp rectangle/square bar */}
          <div
            className="w-full bg-surface-container-lowest p-1 shadow-inner"
            style={{ height: `${barHeight}px` }}
          >
            <div
              className="h-full bg-gradient-to-r from-secondary to-tertiary transition-all duration-700 ease-out"
              style={{ width: `${pct}%` }}
            ></div>
          </div>

          {/* Target Goal & Remaining Display (Controlled by showTarget toggle) */}
          {settings.showTarget !== false && !hideAmounts && (
            <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-outline-variant/20 font-label-sm text-xs uppercase tracking-wider text-outline">
              <span className="flex items-center gap-1.5 font-bold text-on-surface-variant">
                <span className="w-1.5 h-1.5 bg-secondary inline-block"></span>
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
