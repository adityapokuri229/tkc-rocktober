import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchLiveState, updateLiveState, getLocalState } from "../lib/liveCounter.js";
import { useContent } from "../lib/content.jsx";

export default function Admin() {
  const { content, save, reset } = useContent();
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("raft-admin") === "1");
  const [pw, setPw] = useState("");

  // Live counter state
  const [counter, setCounter] = useState(() => getLocalState());
  const [addAmount, setAddAmount] = useState("");
  const [subAmount, setSubAmount] = useState("");
  const [customGoal, setCustomGoal] = useState("");
  const [setDirectAmount, setSetDirectAmount] = useState("");
  const [actionNote, setActionNote] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLiveState().then((data) => {
      if (data) {
        setCounter(data);
        setCustomGoal(data.goal || 150000);
      }
    });

    const interval = setInterval(() => {
      fetchLiveState().then((data) => {
        if (data) setCounter(data);
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const showFeedback = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 3500);
  };

  const handleAdd = async (e) => {
    e?.preventDefault();
    const val = Number(addAmount);
    if (!val || val <= 0) return;
    setLoading(true);
    const updated = await updateLiveState({
      action: "add",
      delta: val,
      note: actionNote || `Added ₹${val.toLocaleString("en-IN")}`
    });
    setCounter(updated);
    setAddAmount("");
    setActionNote("");
    setLoading(false);
    showFeedback(`Successfully added +₹${val.toLocaleString("en-IN")}! Front-end updated instantly.`);
  };

  const handleSubtract = async (e) => {
    e?.preventDefault();
    const val = Number(subAmount);
    if (!val || val <= 0) return;
    setLoading(true);
    const updated = await updateLiveState({
      action: "subtract",
      delta: val,
      note: actionNote || `Deducted ₹${val.toLocaleString("en-IN")}`
    });
    setCounter(updated);
    setSubAmount("");
    setActionNote("");
    setLoading(false);
    showFeedback(`Successfully subtracted -₹${val.toLocaleString("en-IN")}! Front-end updated.`);
  };

  const handleSetDirect = async (e) => {
    e?.preventDefault();
    const val = Number(setDirectAmount);
    if (isNaN(val) || val < 0) return;
    setLoading(true);
    const updated = await updateLiveState({
      action: "set",
      delta: val,
      note: actionNote || `Set total directly to ₹${val.toLocaleString("en-IN")}`
    });
    setCounter(updated);
    setSetDirectAmount("");
    setActionNote("");
    setLoading(false);
    showFeedback(`Updated total raised to ₹${val.toLocaleString("en-IN")}.`);
  };

  const handleUpdateGoal = async (e) => {
    e?.preventDefault();
    const val = Number(customGoal);
    if (!val || val <= 0) return;
    setLoading(true);
    const updated = await updateLiveState({
      goal: val,
      note: `Target updated to ₹${val.toLocaleString("en-IN")}`
    });
    setCounter(updated);
    setLoading(false);
    showFeedback(`Target goal updated to ₹${val.toLocaleString("en-IN")} (₹${(val / 100000).toFixed(2)} Lakh).`);
  };

  const handlePreset = async (amt) => {
    setLoading(true);
    const updated = await updateLiveState({
      action: "add",
      delta: amt,
      note: `Quick button +₹${amt.toLocaleString("en-IN")}`
    });
    setCounter(updated);
    setLoading(false);
    showFeedback(`Added quick donation +₹${amt.toLocaleString("en-IN")}!`);
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-surface-lowest text-on-surface flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-surface-container border border-outline-variant/30 p-8 shadow-2xl rounded-sm">
          <Link to="/" className="text-sm font-label-md uppercase tracking-wider text-secondary hover:underline flex items-center gap-1 mb-6">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to concert counter
          </Link>
          <div className="inline-flex items-center gap-2 bg-primary-container px-2 py-0.5 mb-2 -rotate-1">
            <span className="font-label-sm uppercase text-primary font-bold">Admin Portal</span>
          </div>
          <h1 className="font-headline-lg uppercase tracking-tight text-3xl font-black mb-2">Concert Admin</h1>
          <p className="text-on-surface-variant text-sm mb-6">
            Enter the admin password to control the live concert donation counter. (Default: <code className="bg-surface-high px-1 py-0.5 text-secondary">raft2026</code>)
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (pw === "raft2026" || pw === "admin") {
                sessionStorage.setItem("raft-admin", "1");
                setAuthed(true);
              } else {
                alert("Incorrect password. Default is: raft2026");
              }
            }}
            className="flex flex-col gap-4"
          >
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-on-surface-variant mb-2">
                Password
              </label>
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-4 py-3 bg-surface-high border border-outline-variant text-on-surface rounded-sm focus:border-secondary outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-secondary text-on-secondary font-bold uppercase tracking-wider py-3 hover:bg-secondary-fixed transition-colors font-title-md shadow-md"
            >
              Unlock Console
            </button>
          </form>
        </div>
      </div>
    );
  }

  const progressPercent = Math.min(100, Math.max(0, ((counter.raised || 0) / (counter.goal || 150000)) * 100));

  return (
    <div className="min-h-screen bg-surface-lowest text-on-surface p-4 sm:p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* TOP BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container border border-outline-variant/40 text-on-surface hover:text-secondary font-label-md uppercase text-xs font-bold transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              View Live Counter Site
            </Link>
            <span className="text-outline text-xs">•</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono text-xs uppercase text-emerald-400 font-bold tracking-wider">LIVE BACKEND SYNC ACTIVE</span>
            </div>
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem("raft-admin");
              setAuthed(false);
            }}
            className="text-xs uppercase text-outline hover:text-error transition-colors"
          >
            Lock / Logout
          </button>
        </div>

        {/* FEEDBACK BANNER */}
        {statusMsg && (
          <div className="bg-secondary/20 border-2 border-secondary text-on-surface px-4 py-3 font-semibold flex items-center gap-3 animate-fade-in rounded-sm">
            <span className="material-symbols-outlined text-secondary">check_circle</span>
            <span>{statusMsg}</span>
          </div>
        )}

        {/* CURRENT STATS OVERVIEW CARD */}
        <div className="bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-high border border-outline-variant/40 p-6 rounded-sm shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div>
              <div className="text-xs font-label-sm uppercase tracking-widest text-tertiary font-bold mb-1">
                CURRENT TOTAL RAISED
              </div>
              <div className="text-4xl sm:text-5xl font-black font-headline-xl text-secondary">
                ₹{Number(counter.raised || 0).toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-outline font-mono mt-1">
                Updated: {new Date(counter.updatedAt || Date.now()).toLocaleTimeString()}
              </div>
            </div>

            <div>
              <div className="text-xs font-label-sm uppercase tracking-widest text-on-surface-variant font-bold mb-1">
                TARGET GOAL AMOUNT
              </div>
              <div className="text-3xl sm:text-4xl font-bold font-title-lg text-primary">
                ₹{Number(counter.goal || 150000).toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-outline uppercase font-semibold mt-1">
                ₹{(Number(counter.goal || 150000) / 100000).toFixed(2)} Lakh Target
              </div>
            </div>

            <div>
              <div className="text-xs font-label-sm uppercase tracking-widest text-on-surface-variant font-bold mb-1">
                PROGRESS STATUS
              </div>
              <div className="text-3xl font-black font-headline-xl text-emerald-400">
                {progressPercent.toFixed(1)}%
              </div>
              <div className="text-xs text-outline mt-1 font-mono">
                Remaining: ₹{Math.max(0, (counter.goal || 150000) - (counter.raised || 0)).toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="w-full h-3 bg-surface-lowest rounded-full overflow-hidden mt-6 border border-outline-variant/30">
            <div
              className="h-full bg-gradient-to-r from-secondary via-primary to-tertiary transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* QUICK PRESET BUTTONS */}
        <div className="bg-surface-container border border-outline-variant/30 p-5 rounded-sm">
          <div className="text-xs font-label-sm uppercase tracking-wider font-bold text-on-surface-variant mb-3">
            Quick Add Concert Donations (1-Click)
          </div>
          <div className="flex flex-wrap gap-2.5">
            {[349, 449, 549, 1000, 2500, 5000, 10000].map((amt) => (
              <button
                key={amt}
                onClick={() => handlePreset(amt)}
                disabled={loading}
                className="bg-surface-high hover:bg-secondary hover:text-on-secondary text-on-surface font-mono font-bold text-sm px-4 py-2 border border-outline-variant/50 transition-colors rounded-sm flex items-center gap-1"
              >
                +₹{amt.toLocaleString("en-IN")}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN CONTROLS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ADD DONATION */}
          <div className="bg-surface-container border border-secondary/30 p-6 rounded-sm shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-secondary">add_circle</span>
              <h2 className="font-title-lg uppercase font-bold text-lg text-secondary">Add Donation</h2>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">
              Type the received amount to immediately add to the live concert counter.
            </p>
            <form onSubmit={handleAdd} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-outline mb-1">
                  Amount to Add (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-secondary font-bold font-mono">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 5000"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-surface-high border border-outline-variant text-on-surface font-mono text-lg rounded-sm focus:border-secondary outline-none font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-outline mb-1">
                  Donor / Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI Donor / Stage Announcement"
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-high border border-outline-variant text-on-surface text-sm rounded-sm focus:border-secondary outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !addAmount}
                className="w-full bg-secondary text-on-secondary font-bold uppercase tracking-wider py-3 hover:bg-secondary-fixed transition-colors font-title-md mt-2 disabled:opacity-50"
              >
                + Add To Live Counter
              </button>
            </form>
          </div>

          {/* SUBTRACT / ADJUST DONATION */}
          <div className="bg-surface-container border border-error/30 p-6 rounded-sm shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-error">remove_circle</span>
              <h2 className="font-title-lg uppercase font-bold text-lg text-error">Subtract / Correction</h2>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">
              Deduct an amount in case of entry error or cancelled pledge.
            </p>
            <form onSubmit={handleSubtract} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-outline mb-1">
                  Amount to Deduct (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-error font-bold font-mono">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 1000"
                    value={subAmount}
                    onChange={(e) => setSubAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-surface-high border border-outline-variant text-on-surface font-mono text-lg rounded-sm focus:border-error outline-none font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-outline mb-1">
                  Reason / Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Accidental double entry"
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-high border border-outline-variant text-on-surface text-sm rounded-sm focus:border-error outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !subAmount}
                className="w-full bg-error text-on-primary font-bold uppercase tracking-wider py-3 hover:opacity-90 transition-opacity font-title-md mt-2 disabled:opacity-50"
              >
                - Subtract From Counter
              </button>
            </form>
          </div>
        </div>

        {/* SET EXACT TOTAL & GOAL CONTROLS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* OVERWRITE EXACT TOTAL */}
          <div className="bg-surface-container border border-outline-variant/30 p-6 rounded-sm">
            <h3 className="font-title-md uppercase font-bold text-sm text-on-surface mb-2">
              Direct Total Override
            </h3>
            <p className="text-xs text-on-surface-variant mb-3">
              Explicitly set the collections total to an exact number (e.g. 77000).
            </p>
            <form onSubmit={handleSetDirect} className="flex gap-2">
              <input
                type="number"
                placeholder="Exact total (₹)"
                value={setDirectAmount}
                onChange={(e) => setSetDirectAmount(e.target.value)}
                className="flex-1 px-3 py-2 bg-surface-high border border-outline-variant text-on-surface font-mono text-sm rounded-sm focus:border-primary outline-none"
              />
              <button
                type="submit"
                disabled={loading || !setDirectAmount}
                className="px-4 py-2 bg-surface-high hover:bg-primary hover:text-on-primary text-primary border border-primary/40 font-bold uppercase text-xs tracking-wider transition-colors"
              >
                Set Total
              </button>
            </form>
          </div>

          {/* UPDATE TARGET GOAL */}
          <div className="bg-surface-container border border-outline-variant/30 p-6 rounded-sm">
            <h3 className="font-title-md uppercase font-bold text-sm text-on-surface mb-2">
              Concert Target Goal (1.5 Lakh)
            </h3>
            <p className="text-xs text-on-surface-variant mb-3">
              Change the overall goal (Default: 1,50,000 / 1.5 Lakh).
            </p>
            <form onSubmit={handleUpdateGoal} className="flex gap-2">
              <input
                type="number"
                placeholder="Goal in ₹ (e.g. 150000)"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                className="flex-1 px-3 py-2 bg-surface-high border border-outline-variant text-on-surface font-mono text-sm rounded-sm focus:border-primary outline-none"
              />
              <button
                type="submit"
                disabled={loading || !customGoal}
                className="px-4 py-2 bg-primary text-on-primary font-bold uppercase text-xs tracking-wider transition-opacity hover:opacity-90"
              >
                Update Goal
              </button>
            </form>
          </div>
        </div>

        {/* ACTIVITY LOG / HISTORY */}
        <div className="bg-surface-container border border-outline-variant/30 p-6 rounded-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-title-md uppercase font-bold text-sm tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-tertiary">history</span>
              Live Activity Audit Log
            </h3>
            <span className="text-xs text-outline font-mono">Real-time journal</span>
          </div>

          <div className="max-h-60 overflow-y-auto flex flex-col gap-2 pr-2 font-mono text-xs">
            {counter.history && counter.history.length > 0 ? (
              counter.history.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-surface-high/60 px-3 py-2 rounded-sm border border-outline-variant/20"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded text-[10px] uppercase ${
                        item.action === "add"
                          ? "bg-secondary/20 text-secondary"
                          : item.action === "subtract"
                          ? "bg-error/20 text-error"
                          : "bg-tertiary/20 text-tertiary"
                      }`}
                    >
                      {item.action || "UPDATE"}
                    </span>
                    <span className="text-on-surface font-bold">
                      {item.action === "subtract" ? "-" : "+"}₹{Number(item.delta || 0).toLocaleString("en-IN")}
                    </span>
                    {item.note && <span className="text-outline truncate max-w-xs">({item.note})</span>}
                  </div>
                  <div className="flex items-center gap-3 text-outline">
                    <span>Result: ₹{Number(item.resultingTotal || 0).toLocaleString("en-IN")}</span>
                    <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-outline py-4 text-center">No transactions recorded yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
