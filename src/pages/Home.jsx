import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  const pct = goal ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  const raisedFmt = raised.toLocaleString("en-IN");
  const goalFmt = goal.toLocaleString("en-IN");

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between selection:bg-secondary-container selection:text-on-secondary-container">
      {/* ─── CLEAN HEADER ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary-container/95 backdrop-blur-md shadow-[0_4px_16px_rgba(16,14,9,0.55)]">
        <div className="h-16 max-w-7xl mx-auto px-margin flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <div className="bg-surface-container-lowest px-space-sm py-space-xs shadow-sm flex items-center">
              <span className="font-label-md text-label-md uppercase tracking-wider text-secondary font-bold">GOONJ</span>
              <span className="font-label-sm text-label-sm text-tertiary px-space-xs font-bold">×</span>
              <span className="font-label-md text-label-md uppercase tracking-wider text-primary font-bold">TKC</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono font-bold tracking-widest text-on-surface-variant flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Counter
            </span>
            <Link
              to="/admin"
              className="text-xs uppercase font-mono font-bold px-3 py-1.5 bg-surface-container-highest hover:bg-secondary hover:text-on-secondary text-on-surface transition-colors rounded-sm"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* ─── MAIN FILL-UP DISPLAY ─── */}
      <main className="w-full flex-1 flex flex-col justify-center items-center px-4 sm:px-8 pt-24 pb-12 max-w-4xl mx-auto my-auto">
        <div className="w-full">
          {/* Tag */}
          <div className="inline-flex items-center gap-space-xs bg-primary-container px-space-sm py-space-xs mb-4 -rotate-1 shadow-[2px_2px_0px_#5dd9d0]">
            <span className="font-label-sm text-label-sm uppercase text-primary tracking-widest font-bold">
              CONCERT DONATION TALLY
            </span>
          </div>

          <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight mb-2">
            MUSIC FOR <span className="text-tertiary">EDUCATION</span>
          </h1>

          <p className="lead" style={{ marginBottom: 24 }}>
            Fundraiser concert at The Raft, Koramangala. 100% of collections go directly to primary school supplies and educational learning centers for underprivileged children.
          </p>

          {/* ─── IN-THEME CLEAN FILL-UP BAR ─── */}
          <div className="progress-wrap" style={{ marginTop: 0 }}>
            <div className="progress-header">
              <div>
                <div className="progress-raised" style={{ fontSize: "clamp(32px, 5vw, 48px)", lineHeight: 1.1 }}>
                  ₹{raisedFmt} <span style={{ fontSize: "18px", color: "var(--on-surface-var)", fontWeight: 500 }}>Raised</span>
                </div>
                <div className="progress-goal" style={{ fontSize: "15px", marginTop: "4px" }}>
                  of ₹{goalFmt} Goal (₹{(goal / 100000).toFixed(1)} Lakh Target)
                </div>
              </div>
              <div style={{ textAlign: "right", fontSize: 13, color: "var(--on-surface-var)" }}>
                <div style={{ color: "var(--teal)", fontWeight: 700, fontSize: "16px" }}>
                  {pct}% REACHED
                </div>
                <div>Live Verified Total</div>
              </div>
            </div>

            {/* Fill-up Meter */}
            <div
              className="progress"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              style={{ height: "24px", margin: "18px 0 12px" }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  transition: "width 0.8s ease-out"
                }}
              />
            </div>

            <div className="progress-labels" style={{ fontSize: "12px", marginTop: "8px" }}>
              <span>₹0 KICKOFF</span>
              <span>MILESTONE 1: ₹50,000 (50 SCHOOL KITS)</span>
              <span>TARGET: ₹{goalFmt}</span>
            </div>
          </div>
        </div>
      </main>

      {/* ─── MINIMAL CLEAN FOOTER ─── */}
      <footer className="w-full border-t border-outline-variant/30 py-4 px-6 text-center text-xs font-mono text-on-surface-variant">
        The Raft, Koramangala • Friday, 23 Oct 2026 • Goonj × The Knowledge Corps
      </footer>
    </div>
  );
}
