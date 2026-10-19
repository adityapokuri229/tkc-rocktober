import { useState, useEffect } from "react";
import { fetchLiveState, getLocalState } from "../lib/liveCounter.js";

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
        </div>
      </div>
    </div>
  );
}
