import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchLiveState, updateLiveState, getLocalState } from "../lib/liveCounter.js";

export default function Admin() {
  const [counter, setCounter] = useState(() => getLocalState());
  const [addAmount, setAddAmount] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLiveState().then((data) => {
      if (data) setCounter(data);
    });

    const interval = setInterval(() => {
      fetchLiveState().then((data) => {
        if (data) setCounter(data);
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const showFeedback = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 3000);
  };

  const handleAddCustom = async (e) => {
    e?.preventDefault();
    const val = Number(addAmount);
    if (!val || val <= 0) return;
    setLoading(true);
    const updated = await updateLiveState({
      action: "add",
      delta: val,
      note: `Added ₹${val.toLocaleString("en-IN")}`
    });
    setCounter(updated);
    setAddAmount("");
    setLoading(false);
    showFeedback(`+₹${val.toLocaleString("en-IN")} logged! Screen updated.`);
  };

  const handleAddPreset = async (amt, label) => {
    setLoading(true);
    const updated = await updateLiveState({
      action: "add",
      delta: amt,
      note: `${label || "Quick Tap"} +₹${amt.toLocaleString("en-IN")}`
    });
    setCounter(updated);
    setLoading(false);
    showFeedback(`+₹${amt.toLocaleString("en-IN")} logged!`);
  };

  const handleSubtract = async (amt) => {
    setLoading(true);
    const updated = await updateLiveState({
      action: "subtract",
      delta: amt,
      note: `Correction -₹${amt.toLocaleString("en-IN")}`
    });
    setCounter(updated);
    setLoading(false);
    showFeedback(`-₹${amt.toLocaleString("en-IN")} corrected.`);
  };

  const raised = Number(counter.raised || 0);
  const goal = Number(counter.goal || 150000);
  const percentage = Math.min(100, Math.max(0, (raised / goal) * 100));
  const remaining = Math.max(0, goal - raised);

  const presets = [
    { amt: 349, tier: "Fan Pass", desc: "Wristband Tier" },
    { amt: 449, tier: "Supporter", desc: "Acoustic Pass" },
    { amt: 549, tier: "Patron", desc: "Education Kit" },
    { amt: 1000, tier: "Hero Donor", desc: "Special Stage Shoutout" },
  ];

  return (
    <div className="bg-[#141027] text-[#e6deff] min-h-screen flex flex-col justify-between relative overflow-x-hidden selection:bg-[#f6b060] selection:text-[#0c0919] font-sans pb-8">
      {/* Ambient Stage Lighting */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#86ecd5] opacity-[0.06] blur-3xl"></div>
        <div className="absolute top-1/3 -right-36 w-80 h-80 rounded-full bg-[#f6b060] opacity-[0.06] blur-3xl"></div>
      </div>

      {/* Mobile Top Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 sm:px-6 py-3 bg-[#0f0b22]/90 backdrop-blur-xl border-b border-[#514438]/30">
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#86ecd5] hover:underline uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>View Counter</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#86ecd5]/10 border border-[#86ecd5]/30">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#86ecd5] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#86ecd5]"></span>
          </span>
          <span className="text-[11px] font-mono font-bold text-[#86ecd5] tracking-wider">SYNC ON</span>
        </div>
      </header>

      {/* Main Admin Controller View */}
      <main className="w-full max-w-lg mx-auto px-4 sm:px-6 pt-20 flex-1 flex flex-col gap-4">
        {/* Toast / Status Alert */}
        {statusMsg && (
          <div className="rounded-xl bg-[#86ecd5]/15 border border-[#86ecd5]/40 text-[#e6deff] px-4 py-2.5 text-xs font-mono font-semibold flex items-center gap-2 animate-fade-in shadow-md">
            <span className="material-symbols-outlined text-[16px] text-[#86ecd5]">check_circle</span>
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Live Amount Tally Card */}
        <div className="relative overflow-hidden rounded-2xl bg-[#201c34]/85 backdrop-blur-xl border border-[#c4b5fd]/20 p-5 shadow-[0_16px_36px_-8px_rgba(12,9,25,0.8),0_0_24px_-2px_rgba(246,176,96,0.12)] text-center">
          <div className="text-[11px] font-mono uppercase tracking-widest text-[#ded4ff] font-semibold mb-1">
            CONCERT AMOUNT TALLY
          </div>

          <div className="text-4xl sm:text-5xl font-black font-['Syne'] text-[#f6b060] tracking-tight">
            ₹{raised.toLocaleString("en-IN")}
          </div>

          <div className="text-xs text-[#d6c3b3] mt-1.5 font-mono">
            Target: ₹{goal.toLocaleString("en-IN")} (1.5 Lakh) • <strong className="text-[#86ecd5]">{percentage.toFixed(1)}% Reached</strong>
          </div>

          {/* Electric Conduit Fill Bar */}
          <div className="w-full h-3 bg-[#0f0b22] rounded-full p-0.5 border border-[#514438]/50 overflow-hidden relative mt-4 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#ded4ff] via-[#86ecd5] to-[#f6b060] transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <div className="text-[11px] font-mono text-[#d6c3b3]/80 mt-1.5 flex justify-between">
            <span>₹0 Kickoff</span>
            <span>₹{remaining.toLocaleString("en-IN")} to goal</span>
          </div>
        </div>

        {/* Tactile Quick Add Increment Pad (Stitch Design) */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold text-[#ded4ff] tracking-wider uppercase flex items-center gap-1.5">
              <span>⚡ ON-STAGE QUICK TAP</span>
            </h2>
            <span className="text-[10px] font-mono text-[#d6c3b3]">1-Tap Add</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {presets.map((p) => (
              <button
                key={p.amt}
                onClick={() => handleAddPreset(p.amt, p.tier)}
                disabled={loading}
                className="group relative flex flex-col items-start p-3.5 rounded-xl bg-[#201c34]/80 hover:bg-[#2b273f] active:scale-[0.98] transition-all duration-100 border border-[#c4b5fd]/15 hover:border-[#86ecd5]/50 text-left overflow-hidden shadow-sm disabled:opacity-50"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xl font-bold font-['Syne'] text-[#ffd2a4] tracking-tight">
                    +₹{p.amt.toLocaleString("en-IN")}
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-[#d6c3b3] group-hover:text-[#86ecd5] transition-colors">
                    touch_app
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-[#86ecd5] mt-1">{p.tier}</span>
                <span className="text-[10px] text-[#d6c3b3]/70 mt-0.5">{p.desc}</span>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#86ecd5]/0 group-hover:bg-[#86ecd5]/60 transition-all"></div>
              </button>
            ))}
          </div>
        </section>

        {/* Custom Donation Input Console */}
        <section className="rounded-xl bg-[#201c34]/70 border border-[#c4b5fd]/15 p-4 space-y-3 shadow-sm">
          <label className="text-xs font-mono text-[#e6deff] font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#ded4ff]">edit_note</span>
              <span>CUSTOM DONATION AMOUNT</span>
            </span>
            <span className="text-[10px] text-[#d6c3b3]">INR (₹)</span>
          </label>

          <form onSubmit={handleAddCustom} className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#f6b060] font-bold font-mono text-lg pointer-events-none">
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="Enter amount..."
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                className="w-full bg-[#0f0b22]/90 border border-[#514438]/50 focus:border-[#86ecd5] focus:ring-1 focus:ring-[#86ecd5] rounded-xl py-2.5 pl-8 pr-3 text-[#f6b060] font-mono text-base placeholder:text-[#d6c3b3]/40 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !addAmount}
              className="px-4 py-2.5 rounded-xl bg-[#f6b060] text-[#482900] font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-1 shadow-[0_4px_14px_rgba(246,176,96,0.35)] active:scale-95 transition-all duration-100 hover:brightness-105 disabled:opacity-50"
            >
              <span>Add</span>
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </form>

          {/* Quick Undo / Minor Mistake Correction */}
          <div className="pt-2 flex items-center justify-between text-xs font-mono border-t border-[#c4b5fd]/10">
            <span className="text-[#d6c3b3]/70">Mistake correction:</span>
            <div className="flex gap-2">
              {[349, 1000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleSubtract(amt)}
                  disabled={loading || raised < amt}
                  className="px-2.5 py-1 rounded-full border border-[#ffb4ab]/30 text-[#ffb4ab] hover:bg-[#ffb4ab]/10 text-[11px] transition-colors"
                >
                  -₹{amt}
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="text-center text-xs font-mono text-[#d6c3b3]/70 pt-4">
        Live sync active across all connected venue screens
      </footer>
    </div>
  );
}
