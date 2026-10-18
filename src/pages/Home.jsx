import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchLiveState, getLocalState } from "../lib/liveCounter.js";

export default function Home() {
  const [counterData, setCounterData] = useState(() => getLocalState());
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Immediate fetch on mount
    fetchLiveState().then((data) => {
      if (data) setCounterData(data);
    });

    // Fast polling every 2 seconds for TV display sync
    const interval = setInterval(() => {
      fetchLiveState().then((data) => {
        if (data) setCounterData(data);
      });
    }, 2000);

    // BroadcastChannel for instant local cross-tab sync with admin
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const raised = Number(counterData.raised || 0);
  const goal = Number(counterData.goal || 150000);
  const percentage = Math.min(100, Math.max(0, (raised / goal) * 100));
  const remaining = Math.max(0, goal - raised);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#100b24] text-white flex flex-col justify-between p-6 sm:p-10 lg:p-14 select-none">
      {/* AMBIENT BACKGROUND GLOWS & RISO TEXTURE */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#c6c0ff_1.5px,transparent_1.5px)] [background-size:24px_24px] z-0"></div>
      <div className="absolute top-[-15%] left-[20%] w-[650px] h-[650px] bg-secondary/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[15%] w-[650px] h-[650px] bg-primary-container/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-tertiary/10 rounded-full blur-[130px] pointer-events-none"></div>

      {/* TOP TV HEADER */}
      <header className="relative z-10 flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <div className="bg-[#1c1638] border border-secondary/30 px-4 py-2 rounded-sm shadow-md flex items-center gap-2.5">
            <span className="font-extrabold tracking-wider text-secondary uppercase text-sm sm:text-base">
              GOONJ
            </span>
            <span className="text-tertiary font-bold text-sm">×</span>
            <span className="font-extrabold tracking-wider text-primary uppercase text-sm sm:text-base">
              TKC
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-[#251e47]/70 border border-white/10 px-3.5 py-1.5 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-300">
              CONCERT LIVE SCREEN
            </span>
          </div>
        </div>

        {/* TV CONTROLS & ADMIN LINK */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleFullscreen}
            title="Toggle TV Fullscreen"
            className="p-2.5 bg-[#201940] hover:bg-[#2e245c] border border-white/10 text-on-surface hover:text-secondary rounded-sm transition-colors text-xs font-mono uppercase tracking-wider flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isFullscreen ? "fullscreen_exit" : "fullscreen"}
            </span>
            <span className="hidden md:inline">{isFullscreen ? "Exit TV Mode" : "TV Fullscreen"}</span>
          </button>
          
          <Link
            to="/admin"
            title="Open Admin Console"
            className="p-2.5 bg-[#201940] hover:bg-secondary hover:text-[#141027] border border-white/10 text-on-surface rounded-sm transition-colors text-xs font-mono uppercase tracking-wider flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span className="hidden md:inline">Admin</span>
          </Link>
        </div>
      </header>

      {/* MAIN CENTER COUNTER FOR BIG SCREEN TV DISPLAY */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center my-auto px-4 max-w-6xl mx-auto w-full">
        {/* SUBTITLE CALLOUT */}
        <div className="inline-flex items-center gap-2 bg-primary-container/20 border border-primary/40 px-4 py-1.5 rounded-full mb-4 sm:mb-6">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-primary">
            ★ MUSIC FOR EDUCATION FUNDRAISER ★
          </span>
        </div>

        {/* LABEL */}
        <h2 className="text-xs sm:text-sm md:text-base font-bold font-mono uppercase tracking-[0.3em] text-[#a99fd6] mb-1 sm:mb-2">
          TOTAL DONATIONS COLLECTED
        </h2>

        {/* HUGE LIVE HERO AMOUNT */}
        <div className="relative my-2 sm:my-4">
          <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] font-black tracking-tight leading-none text-[#dcd2ff] drop-shadow-[0_10px_35px_rgba(199,191,255,0.3)]">
            ₹{raised.toLocaleString("en-IN")}
          </h1>
        </div>

        {/* PROGRESS THERMOMETER / BAR */}
        <div className="w-full max-w-4xl mt-6 sm:mt-8">
          <div className="relative w-full h-7 sm:h-9 bg-[#171133] rounded-full p-1.5 border border-secondary/30 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-secondary via-primary to-tertiary transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(199,191,255,0.7)]"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          {/* PROGRESS STATS ROW */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 font-mono uppercase">
            <div className="text-left">
              <span className="text-xs text-outline block">PROGRESS ACHIEVED</span>
              <span className="text-lg sm:text-2xl font-bold text-secondary">
                {percentage.toFixed(1)}%
              </span>
            </div>

            <div className="text-center">
              <span className="text-xs text-outline block">TARGET GOAL</span>
              <span className="text-lg sm:text-2xl font-bold text-primary">
                ₹{goal.toLocaleString("en-IN")}{" "}
                <span className="text-xs sm:text-sm text-outline font-normal">
                  (₹{(goal / 100000).toFixed(1)} Lakh)
                </span>
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs text-outline block">REMAINING TO GOAL</span>
              <span className="text-lg sm:text-2xl font-bold text-tertiary">
                ₹{remaining.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER EVENT MARQUEE */}
      <footer className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-between border-t border-white/10 pt-4 text-xs font-mono text-[#a59bc9] gap-3">
        <div className="flex items-center gap-2">
          <span className="text-secondary font-bold">THE RAFT, KORAMANGALA</span>
          <span>•</span>
          <span className="text-primary font-bold">FRI, 23 OCT 2026</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-[#241c49] px-3 py-1 rounded-sm border border-white/10 text-[#d8cffc]">
            Scan UPI QR at entrance to donate
          </span>
          <span className="text-emerald-400 font-bold hidden sm:inline">● 100% Goes To Child Education</span>
        </div>
      </footer>
    </div>
  );
}
