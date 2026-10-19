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
  const percentage = Math.min(100, Math.max(0, (raised / goal) * 100));
  const remaining = Math.max(0, goal - raised);

  return (
    <div className="bg-[#141027] text-[#e6deff] min-h-screen flex flex-col justify-between relative overflow-x-hidden selection:bg-[#f6b060] selection:text-[#0c0919] font-sans">
      {/* Ambient Stage Lighting Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 md:w-96 h-80 md:h-96 rounded-full bg-[#86ecd5] opacity-[0.08] blur-3xl"></div>
        <div className="absolute top-1/3 -right-36 w-72 md:w-80 h-72 md:h-80 rounded-full bg-[#f6b060] opacity-[0.08] blur-3xl"></div>
        <div className="absolute bottom-10 left-1/4 w-64 md:w-72 h-64 md:h-72 rounded-full bg-[#c4b5fd] opacity-[0.06] blur-3xl"></div>
      </div>

      {/* Top Mobile-Optimized Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 sm:px-6 py-3 bg-[#0f0b22]/85 backdrop-blur-xl border-b border-[#514438]/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#201c34] flex items-center justify-center text-[#ffd2a4] border border-[#514438]/40 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">graphic_eq</span>
          </div>
          <div>
            <span className="font-bold tracking-tight text-base sm:text-lg text-[#e6deff] font-['Syne']">
              Goonj × TKC
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Live Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#86ecd5]/10 border border-[#86ecd5]/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#86ecd5] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#86ecd5]"></span>
            </span>
            <span className="text-[11px] font-mono font-bold text-[#86ecd5] tracking-wider">LIVE</span>
          </div>

          <Link
            to="/admin"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#201c34] hover:bg-[#f6b060] hover:text-[#0c0919] text-[#ffd2a4] border border-[#514438]/40 transition-all text-xs font-mono font-bold uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-[15px]">tune</span>
            <span>Admin</span>
          </Link>
        </div>
      </header>

      {/* Main Counter Display Viewport */}
      <main className="w-full max-w-lg mx-auto px-4 sm:px-6 pt-20 pb-8 flex-1 flex flex-col justify-center gap-4 my-auto">
        {/* Venue Telemetry Strip */}
        <div className="rounded-xl bg-[#1c1830]/80 backdrop-blur-md p-3 border border-[#c4b5fd]/15 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex items-end gap-1 h-4 w-5 py-0.5">
              <div className="w-1 bg-[#86ecd5] rounded-full animate-pulse h-3"></div>
              <div className="w-1 bg-[#f6b060] rounded-full animate-bounce h-4"></div>
              <div className="w-1 bg-[#86ecd5] rounded-full animate-pulse h-2"></div>
            </div>
            <div>
              <div className="text-[11px] font-mono font-bold text-[#86ecd5] flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">location_on</span>
                <span>THE RAFT, KORAMANGALA</span>
              </div>
              <div className="text-xs text-[#d6c3b3]/80">Benefit Concert • Stage Screen</div>
            </div>
          </div>
          <div className="text-right font-mono">
            <div className="text-xs font-bold text-[#ffd2a4]">FRI, 23 OCT</div>
            <div className="text-[10px] text-[#d6c3b3]/70">5:30 PM IST</div>
          </div>
        </div>

        {/* Hero Live Donation Card */}
        <div className="relative overflow-hidden rounded-2xl bg-[#201c34]/85 backdrop-blur-xl border border-[#c4b5fd]/20 p-5 sm:p-6 shadow-[0_16px_36px_-8px_rgba(12,9,25,0.8),0_0_24px_-2px_rgba(246,176,96,0.15)]">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#ded4ff] font-semibold">
                Total Collections
              </span>
              <div className="mt-1">
                <h1 className="text-4xl sm:text-5xl font-black font-['Syne'] text-[#f6b060] tracking-tight">
                  ₹{raised.toLocaleString("en-IN")}
                </h1>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-lg bg-[#2b273f] border border-[#514438]/40 text-xs font-mono font-bold text-[#86ecd5]">
                {percentage.toFixed(1)}%
              </span>
              <div className="text-xs text-[#d6c3b3] mt-1 font-mono">
                Target: ₹{goal.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* Electric Conduit Fill-Up Progress Bar */}
          <div className="mt-5">
            <div className="w-full h-4 bg-[#0f0b22] rounded-full p-0.5 border border-[#514438]/50 overflow-hidden relative shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#ded4ff] via-[#86ecd5] to-[#f6b060] transition-all duration-700 ease-out relative"
                style={{
                  width: `${percentage}%`,
                  filter: "drop-shadow(0 0 8px #f6b060)"
                }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-white rounded-full shadow-[0_0_10px_#f6b060]"></div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-2 text-xs font-mono">
              <span className="text-[#86ecd5] font-semibold">
                ₹{remaining.toLocaleString("en-IN")} to goal
              </span>
              <span className="text-[#d6c3b3]">
                ₹{(goal / 100000).toFixed(1)} Lakh Target
              </span>
            </div>
          </div>

          {/* Milestone & Impact Strip */}
          <div className="mt-5 pt-3.5 border-t border-[#c4b5fd]/15 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5 text-[#e6deff]">
              <span className="h-2 w-2 rounded-full bg-[#86ecd5]"></span>
              <span>100% Funds Child Primary Education</span>
            </div>
            <div className="flex items-center gap-1 text-[#ffd2a4] bg-[#f6b060]/10 px-2 py-0.5 rounded border border-[#f6b060]/30 font-semibold">
              <span className="material-symbols-outlined text-[13px]">military_tech</span>
              <span>Milestone: 50 Kits</span>
            </div>
          </div>
        </div>

        {/* UPI Scan Notice */}
        <div className="rounded-xl bg-[#1c1830]/70 border border-[#514438]/30 p-3.5 text-center flex items-center justify-between text-xs font-mono text-[#d6c3b3]">
          <span>Scan UPI QR at venue entrance to add directly</span>
          <span className="text-[#86ecd5] font-bold">goonj.trust@hdfcbank</span>
        </div>
      </main>

      {/* Minimal Mobile Footer */}
      <footer className="w-full border-t border-[#514438]/30 py-3 px-4 text-center text-xs font-mono text-[#d6c3b3]/80 bg-[#0f0b22]/70 backdrop-blur-md">
        The Raft, Koramangala • Goonj × The Knowledge Corps
      </footer>
    </div>
  );
}
