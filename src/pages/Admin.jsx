import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchLiveState, updateLiveState, getLocalState } from "../lib/liveCounter.js";

const SIZES = [
  { id: "compact", name: "Compact" },
  { id: "medium", name: "Medium" },
  { id: "large", name: "Large" },
  { id: "huge", name: "Huge" }
];

export default function Admin() {
  const [counter, setCounter] = useState(() => getLocalState());
  const [addAmount, setAddAmount] = useState("");
  const [subtractAmount, setSubtractAmount] = useState("");
  const [targetGoalInput, setTargetGoalInput] = useState("");
  const [currentAmountInput, setCurrentAmountInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLiveState().then((data) => {
      if (data) {
        setCounter(data);
        setTargetGoalInput(data.goal || 150000);
        setCurrentAmountInput(data.raised || 77000);
        setTitleInput(data.settings?.title || "MUSIC FOR A CHANGE");
      }
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

  const handleUpdateSettings = async (patch) => {
    setLoading(true);
    const newSettings = {
      ...(counter.settings || {}),
      ...patch
    };
    const updated = await updateLiveState({
      settings: newSettings,
      note: "Updated live display settings"
    });
    setCounter(updated);
    setLoading(false);
    showFeedback("Setting applied live!");
  };

  const handleAdd = async (e) => {
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
    setCurrentAmountInput(updated.raised);
    setAddAmount("");
    setLoading(false);
    showFeedback(`+₹${val.toLocaleString("en-IN")} added!`);
  };

  const handleSubtract = async (e) => {
    e?.preventDefault();
    const val = Number(subtractAmount);
    if (!val || val <= 0) return;
    setLoading(true);
    const updated = await updateLiveState({
      action: "subtract",
      delta: val,
      note: `Deducted ₹${val.toLocaleString("en-IN")}`
    });
    setCounter(updated);
    setCurrentAmountInput(updated.raised);
    setSubtractAmount("");
    setLoading(false);
    showFeedback(`-₹${val.toLocaleString("en-IN")} subtracted!`);
  };

  const handleSetCurrent = async (e) => {
    e?.preventDefault();
    const val = Number(currentAmountInput);
    if (isNaN(val) || val < 0) return;
    setLoading(true);
    const updated = await updateLiveState({
      action: "set",
      delta: val,
      note: `Set total directly to ₹${val.toLocaleString("en-IN")}`
    });
    setCounter(updated);
    setLoading(false);
    showFeedback(`Current collections total set to ₹${val.toLocaleString("en-IN")}.`);
  };

  const handleSetGoal = async (e) => {
    e?.preventDefault();
    const val = Number(targetGoalInput);
    if (!val || val <= 0) return;
    setLoading(true);
    const updated = await updateLiveState({
      goal: val,
      note: `Goal updated to ₹${val.toLocaleString("en-IN")}`
    });
    setCounter(updated);
    setLoading(false);
    showFeedback(`Target goal updated to ₹${val.toLocaleString("en-IN")}.`);
  };

  const handleSaveTitle = async (e) => {
    e?.preventDefault();
    await handleUpdateSettings({ title: titleInput });
  };

  const raised = Number(counter.raised || 0);
  const goal = Number(counter.goal || 150000);
  const pct = goal ? Math.min(100, Math.max(0, (raised / goal) * 100)) : 0;
  const settings = counter.settings || {};

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between selection:bg-secondary-container selection:text-on-secondary-container p-4 sm:p-8">
      <div className="w-full max-w-3xl mx-auto">
        {/* Navigation & Live Sync Status */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="font-label-md text-xs uppercase tracking-wider text-secondary hover:underline flex items-center gap-1 font-bold"
          >
            ← View Display Page
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="font-label-sm text-xs uppercase tracking-widest text-secondary font-bold">
              LIVE SYNC
            </span>
          </div>
        </div>

        {/* Feedback Alert */}
        {statusMsg && (
          <div className="bg-surface-container border border-secondary p-3 mb-6 shadow-[3px_3px_0px_#100e09] flex items-center gap-2 text-sm font-bold text-on-surface">
            <span className="text-secondary">✦</span>
            <span>{statusMsg}</span>
          </div>
        )}

        {/* ─── 1. SQUARE THERMOMETER TALLY CARD (EXACT DISPLAY THEME) ─── */}
        <div className="bg-surface-container p-space-md shadow-[4px_4px_0px_#100e09] border border-outline-variant/30 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs mb-space-xs">
            <div className="flex items-center gap-space-xs">
              <span className="font-label-md text-label-md uppercase text-on-surface">CROWDFUND PROGRESS</span>
              <span className="bg-secondary-container text-on-secondary font-label-sm text-label-sm px-space-xs py-0.5 font-bold">
                {pct.toFixed(1)}% REACHED
              </span>
            </div>
            <div className="font-label-md text-label-md text-secondary tracking-wider font-bold">
              ₹{raised.toLocaleString("en-IN")} RAISED
            </div>
          </div>

          {/* Square Meter Bar */}
          <div className="w-full h-7 bg-surface-container-lowest p-1 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-secondary to-tertiary transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center mt-2 font-label-sm text-xs text-outline uppercase">
            <span>Target Goal: ₹{goal.toLocaleString("en-IN")} (1.5 Lakh)</span>
            <span>Remaining: ₹{Math.max(0, goal - raised).toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* ─── 2. ADD & SUBTRACT CONTROLS ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Add */}
          <div className="bg-surface-container p-4 shadow-[3px_3px_0px_#100e09] border border-outline-variant/30">
            <div className="font-label-md text-xs uppercase text-secondary font-bold mb-2">
              + Add Amount (₹)
            </div>
            <form onSubmit={handleAdd} className="flex gap-2 mb-3">
              <input
                type="number"
                min="1"
                placeholder="Amount to add..."
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                className="flex-1 bg-surface-container-lowest border border-outline-variant/40 px-3 py-2 text-on-surface font-label-md text-sm outline-none focus:border-secondary"
              />
              <button
                type="submit"
                disabled={loading || !addAmount}
                className="bg-secondary text-on-secondary font-label-md uppercase font-bold px-4 py-2 hover:bg-secondary-fixed transition-colors disabled:opacity-50"
              >
                + Add
              </button>
            </form>
            {/* 1-tap quick buttons */}
            <div className="flex flex-wrap gap-1.5">
              {[349, 449, 549, 1000, 2500, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => updateLiveState({ action: "add", delta: amt }).then((u) => { setCounter(u); showFeedback(`+₹${amt} added!`); })}
                  className="bg-surface-container-highest hover:bg-secondary hover:text-on-secondary text-on-surface font-label-sm text-xs px-2.5 py-1 transition-colors font-bold border border-outline-variant/20"
                >
                  +₹{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Subtract */}
          <div className="bg-surface-container p-4 shadow-[3px_3px_0px_#100e09] border border-outline-variant/30">
            <div className="font-label-md text-xs uppercase text-tertiary font-bold mb-2">
              - Subtract / Deduct (₹)
            </div>
            <form onSubmit={handleSubtract} className="flex gap-2 mb-3">
              <input
                type="number"
                min="1"
                placeholder="Amount to deduct..."
                value={subtractAmount}
                onChange={(e) => setSubtractAmount(e.target.value)}
                className="flex-1 bg-surface-container-lowest border border-outline-variant/40 px-3 py-2 text-on-surface font-label-md text-sm outline-none focus:border-tertiary"
              />
              <button
                type="submit"
                disabled={loading || !subtractAmount}
                className="bg-tertiary text-on-tertiary font-label-md uppercase font-bold px-4 py-2 hover:bg-tertiary-fixed transition-colors disabled:opacity-50"
              >
                - Deduct
              </button>
            </form>
            <div className="flex flex-wrap gap-1.5">
              {[349, 549, 1000, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => updateLiveState({ action: "subtract", delta: amt }).then((u) => { setCounter(u); showFeedback(`-₹${amt} deducted!`); })}
                  disabled={raised < amt}
                  className="bg-surface-container-highest hover:bg-tertiary hover:text-on-tertiary text-tertiary font-label-sm text-xs px-2.5 py-1 transition-colors font-bold border border-tertiary/20 disabled:opacity-30"
                >
                  -₹{amt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── 3. OVERRIDE TOTAL & FINAL TARGET GOAL ─── */}
        <div className="bg-surface-container p-4 shadow-[3px_3px_0px_#100e09] border border-outline-variant/30 mb-6">
          <div className="font-label-md text-xs uppercase text-primary font-bold mb-3">
            Tally &amp; Target Goal Direct Overrides
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <form onSubmit={handleSetCurrent} className="flex flex-col gap-1.5">
              <label className="font-label-sm text-xs text-outline uppercase font-bold">
                Set Current Amount (₹)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  value={currentAmountInput}
                  onChange={(e) => setCurrentAmountInput(e.target.value)}
                  className="flex-1 bg-surface-container-lowest border border-outline-variant/40 px-3 py-2 text-on-surface font-label-md text-sm outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="bg-surface-container-highest hover:bg-primary hover:text-on-primary text-primary font-label-md uppercase text-xs px-3 py-2 font-bold border border-primary/30"
                >
                  Set Total
                </button>
              </div>
            </form>

            <form onSubmit={handleSetGoal} className="flex flex-col gap-1.5">
              <label className="font-label-sm text-xs text-outline uppercase font-bold">
                Final Target Goal (₹)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={targetGoalInput}
                  onChange={(e) => setTargetGoalInput(e.target.value)}
                  className="flex-1 bg-surface-container-lowest border border-outline-variant/40 px-3 py-2 text-on-surface font-label-md text-sm outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="bg-primary text-on-primary font-label-md uppercase text-xs px-3 py-2 font-bold hover:bg-primary-fixed"
                >
                  Set Goal
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ─── 4. DISPLAY PARAMETERS: TITLE, SIZE, BAR THICKNESS, MODES ─── */}
        <div className="bg-surface-container p-4 shadow-[3px_3px_0px_#100e09] border border-outline-variant/30 mb-6">
          <div className="font-label-md text-xs uppercase text-secondary font-bold mb-4">
            Display Parameters &amp; Controls
          </div>

          {/* Title Editor */}
          <form onSubmit={handleSaveTitle} className="mb-4">
            <label className="block font-label-sm text-xs text-outline uppercase font-bold mb-1">
              Heading Title
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="e.g. MUSIC FOR A CHANGE"
                className="flex-1 bg-surface-container-lowest border border-outline-variant/40 px-3 py-2 text-on-surface font-label-md text-sm outline-none focus:border-secondary"
              />
              <button
                type="submit"
                className="bg-surface-container-highest hover:bg-secondary hover:text-on-secondary text-secondary font-label-md uppercase text-xs px-4 py-2 font-bold border border-secondary/30"
              >
                Save
              </button>
            </div>
          </form>

          {/* Size Option Buttons */}
          <div className="mb-4">
            <label className="block font-label-sm text-xs text-outline uppercase font-bold mb-1.5">
              Screen Size Mode
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SIZES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleUpdateSettings({ size: s.id })}
                  className={`py-2 px-3 font-label-md text-xs uppercase font-bold border transition-colors ${
                    (settings.size || "medium") === s.id
                      ? "bg-secondary text-on-secondary border-secondary"
                      : "bg-surface-container-lowest text-on-surface border-outline-variant/40 hover:border-secondary"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Height Slider */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label className="font-label-sm text-xs text-outline uppercase font-bold">
                Square Bar Height (Thickness)
              </label>
              <span className="font-label-sm text-xs text-secondary font-bold">
                {settings.barHeight || 28}px
              </span>
            </div>
            <input
              type="range"
              min="14"
              max="64"
              step="2"
              value={settings.barHeight || 28}
              onChange={(e) => handleUpdateSettings({ barHeight: Number(e.target.value) })}
              className="w-full accent-[#5dd9d0] cursor-pointer"
            />
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-outline-variant/20">
            <label className="flex items-center gap-3 bg-surface-container-lowest p-3 border border-outline-variant/30 cursor-pointer">
              <input
                type="checkbox"
                checked={!!settings.percentageMode}
                onChange={(e) => handleUpdateSettings({ percentageMode: e.target.checked })}
                className="w-4 h-4 accent-[#5dd9d0]"
              />
              <div>
                <div className="font-label-md text-xs uppercase font-bold text-on-surface">Percentage Mode</div>
                <div className="font-body-sm text-[11px] text-on-surface-variant">Display % progress instead of raw currency</div>
              </div>
            </label>

            <label className="flex items-center gap-3 bg-surface-container-lowest p-3 border border-outline-variant/30 cursor-pointer">
              <input
                type="checkbox"
                checked={!!settings.hideAmounts}
                onChange={(e) => handleUpdateSettings({ hideAmounts: e.target.checked })}
                className="w-4 h-4 accent-[#5dd9d0]"
              />
              <div>
                <div className="font-label-md text-xs uppercase font-bold text-on-surface">Hide Amounts</div>
                <div className="font-body-sm text-[11px] text-on-surface-variant">Hide figures completely from audience view</div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <footer className="w-full text-center py-4 text-xs font-label-sm uppercase text-outline">
        Controls synced live to public display screen
      </footer>
    </div>
  );
}
