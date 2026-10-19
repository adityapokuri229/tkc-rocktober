import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchLiveState, updateLiveState, getLocalState } from "../lib/liveCounter.js";

const THEMES = [
  { id: "default", name: "TKC Original (Purple / Yellow / Teal)", color: "#5dd9d0" },
  { id: "amber-gold", name: "Amber & Stage Gold", color: "#f6b060" },
  { id: "neon-cyan", name: "Electric Neon Cyan", color: "#00e5ff" },
  { id: "retro-orange", name: "Retro Festival Orange", color: "#ff7043" },
  { id: "monochrome", name: "Minimalist Monochrome", color: "#e5e5e5" }
];

const SIZES = [
  { id: "compact", name: "Compact (Small screens / Side monitor)" },
  { id: "medium", name: "Medium (Standard display)" },
  { id: "large", name: "Large (Big Screen / Projector)" },
  { id: "huge", name: "Huge (Gigantic Stage LED Billboard)" }
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
    showFeedback("Live settings applied instantly!");
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
    showFeedback(`+₹${val.toLocaleString("en-IN")} added to counter!`);
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
    showFeedback(`-₹${val.toLocaleString("en-IN")} subtracted from counter!`);
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
    showFeedback(`Target goal updated to ₹${val.toLocaleString("en-IN")} (₹${(val / 100000).toFixed(2)} Lakh).`);
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
    <div className="admin-wrap" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "var(--surface-lowest)" }}>
      <div className="container" style={{ maxWidth: 780, padding: "24px 16px" }}>
        {/* Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <Link to="/" style={{ color: "var(--teal)", textDecoration: "none", fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>
            ← View Live Counter Display
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--teal)", fontFamily: "monospace" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--teal)", display: "inline-block" }}></span>
            <span>LIVE CLOUD SYNC ACTIVE</span>
          </div>
        </div>

        {/* Feedback Alert */}
        {statusMsg && (
          <div className="admin-card" style={{ background: "rgba(134,236,213,0.15)", borderColor: "var(--teal)", color: "var(--on-surface)", padding: "12px 18px", fontWeight: 600, fontSize: 14, marginBottom: 16 }}>
            ✦ {statusMsg}
          </div>
        )}

        {/* ─── 1. LIVE AMOUNT TALLY & PROGRESS ─── */}
        <div className="admin-card" style={{ textAlign: "center", padding: "28px 20px", marginBottom: 20 }}>
          <span className="eyebrow yellow" style={{ margin: "0 auto 10px" }}>Active Live Tally</span>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px, 7vw, 60px)", fontWeight: 800, color: "var(--yellow)", lineHeight: 1 }}>
            ₹{raised.toLocaleString("en-IN")}
          </div>
          <div style={{ color: "var(--on-surface-var)", fontSize: 14, marginTop: 8 }}>
            Current Target: ₹{goal.toLocaleString("en-IN")} • <strong style={{ color: "var(--teal)" }}>{pct.toFixed(1)}% Reached</strong>
          </div>

          <div className="progress" style={{ height: 16, margin: "18px auto 0", maxWidth: 500 }}>
            <div style={{ width: `${pct}%`, transition: "width 0.4s ease-out" }}></div>
          </div>
        </div>

        {/* ─── 2. ADD & SUBTRACT CONTROLS ─── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginBottom: 20 }}>
          {/* Add */}
          <div className="admin-card">
            <h3 style={{ margin: "0 0 10px", fontSize: 14, textTransform: "uppercase", color: "var(--teal)" }}>+ Add Donation Amount</h3>
            <form onSubmit={handleAdd} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input
                type="number"
                min="1"
                placeholder="Amount to add (₹)..."
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                style={{ flex: 1, padding: "10px 14px", borderRadius: "var(--r)", border: "1.5px solid rgba(199,191,255,0.2)", background: "var(--surface-high)", color: "var(--on-surface)", fontSize: 15 }}
              />
              <button type="submit" disabled={loading || !addAmount} className="btn btn-yellow" style={{ padding: "10px 18px", fontSize: 13 }}>
                + Add
              </button>
            </form>

            {/* Quick 1-click tap buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[349, 449, 549, 1000, 2500, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => updateLiveState({ action: "add", delta: amt }).then((u) => { setCounter(u); showFeedback(`+₹${amt} added!`); })}
                  className="btn btn-ghost"
                  style={{ padding: "6px 10px", fontSize: 11, borderColor: "rgba(199,191,255,0.25)", color: "var(--on-surface)" }}
                >
                  +₹{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Subtract */}
          <div className="admin-card">
            <h3 style={{ margin: "0 0 10px", fontSize: 14, textTransform: "uppercase", color: "var(--error)" }}>- Subtract / Deduct Amount</h3>
            <form onSubmit={handleSubtract} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input
                type="number"
                min="1"
                placeholder="Amount to subtract (₹)..."
                value={subtractAmount}
                onChange={(e) => setSubtractAmount(e.target.value)}
                style={{ flex: 1, padding: "10px 14px", borderRadius: "var(--r)", border: "1.5px solid rgba(199,191,255,0.2)", background: "var(--surface-high)", color: "var(--on-surface)", fontSize: 15 }}
              />
              <button
                type="submit"
                disabled={loading || !subtractAmount}
                className="btn"
                style={{ padding: "10px 18px", fontSize: 13, background: "var(--error-container)", color: "var(--error)", border: "1px solid var(--error)" }}
              >
                - Subtract
              </button>
            </form>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[349, 549, 1000, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => updateLiveState({ action: "subtract", delta: amt }).then((u) => { setCounter(u); showFeedback(`-₹${amt} subtracted!`); })}
                  disabled={raised < amt}
                  style={{ padding: "6px 10px", fontSize: 11, background: "transparent", border: "1px solid rgba(255,180,171,0.3)", color: "var(--error)", borderRadius: "var(--r-full)", cursor: "pointer" }}
                >
                  -₹{amt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── 3. CURRENT TOTAL & FINAL TARGET GOAL ─── */}
        <div className="admin-card" style={{ marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 14, textTransform: "uppercase", color: "var(--yellow)" }}>Exact Current & Final Target Values</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            {/* Current Amount Set */}
            <form onSubmit={handleSetCurrent} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--on-surface-var)" }}>
                Override Current Collections (₹)
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="number"
                  min="0"
                  value={currentAmountInput}
                  onChange={(e) => setCurrentAmountInput(e.target.value)}
                  style={{ flex: 1, padding: "8px 12px", borderRadius: "var(--r)", border: "1px solid rgba(199,191,255,0.2)", background: "var(--surface-high)", color: "var(--on-surface)", fontSize: 14 }}
                />
                <button type="submit" className="btn btn-ghost btn-small" style={{ fontSize: 12 }}>
                  Set Total
                </button>
              </div>
            </form>

            {/* Final Target Goal Set */}
            <form onSubmit={handleSetGoal} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--on-surface-var)" }}>
                Final Target Goal (₹)
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="number"
                  min="1"
                  value={targetGoalInput}
                  onChange={(e) => setTargetGoalInput(e.target.value)}
                  style={{ flex: 1, padding: "8px 12px", borderRadius: "var(--r)", border: "1px solid rgba(199,191,255,0.2)", background: "var(--surface-high)", color: "var(--on-surface)", fontSize: 14 }}
                />
                <button type="submit" className="btn btn-yellow btn-small" style={{ fontSize: 12 }}>
                  Set Goal
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ─── 4. DISPLAY PARAMETERS: SIZE, COLOR THEME & MODES ─── */}
        <div className="admin-card" style={{ marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, textTransform: "uppercase", color: "var(--secondary)" }}>Live Display Parameters</h3>
          
          {/* Header Title Editor */}
          <form onSubmit={handleSaveTitle} style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--on-surface-var)", marginBottom: 6 }}>
              Display Title
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="e.g. MUSIC FOR A CHANGE"
                style={{ flex: 1, padding: "10px 14px", borderRadius: "var(--r)", border: "1.5px solid rgba(199,191,255,0.2)", background: "var(--surface-high)", color: "var(--on-surface)", fontSize: 15 }}
              />
              <button type="submit" className="btn btn-ghost btn-small">
                Save Title
              </button>
            </div>
          </form>

          {/* Size Parameter */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--on-surface-var)", marginBottom: 8 }}>
              Display Screen Size
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
              {SIZES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleUpdateSettings({ size: s.id })}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "var(--r)",
                    border: (settings.size || "medium") === s.id ? "2px solid var(--yellow)" : "1px solid rgba(199,191,255,0.15)",
                    background: (settings.size || "medium") === s.id ? "var(--surface-bright)" : "var(--surface-high)",
                    color: (settings.size || "medium") === s.id ? "var(--yellow)" : "var(--on-surface)",
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: "pointer",
                    textAlign: "center"
                  }}
                >
                  {s.id.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Color Theme Parameter */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--on-surface-var)", marginBottom: 8 }}>
              Color Theme
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleUpdateSettings({ theme: t.id })}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    borderRadius: "var(--r)",
                    border: (settings.theme || "default") === t.id ? `2px solid ${t.color}` : "1px solid rgba(199,191,255,0.15)",
                    background: (settings.theme || "default") === t.id ? "var(--surface-bright)" : "var(--surface-high)",
                    color: "var(--on-surface)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: t.color, flexShrink: 0 }}></span>
                  <span style={{ textTransform: "capitalize" }}>{t.id.replace("-", " ")}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Square Bar Height (Thickness) Slider */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--on-surface-var)" }}>
                Square Bar Height (Thickness)
              </label>
              <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--yellow)" }}>
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
              style={{ width: "100%", accentColor: "var(--yellow)", cursor: "pointer" }}
            />
          </div>

          {/* Mode Toggles: Hide Amounts & Percentage Mode */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, paddingTop: 8, borderTop: "1px solid rgba(199,191,255,0.1)" }}>
            {/* Toggle Percentage Mode */}
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: "var(--surface-high)", padding: "10px 14px", borderRadius: "var(--r)" }}>
              <input
                type="checkbox"
                checked={!!settings.percentageMode}
                onChange={(e) => handleUpdateSettings({ percentageMode: e.target.checked })}
                style={{ width: 18, height: 18, accentColor: "var(--teal)" }}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Percentage Mode</div>
                <div style={{ fontSize: 11, color: "var(--on-surface-var)" }}>Show % progress instead of raw currency</div>
              </div>
            </label>

            {/* Toggle Hide Amounts */}
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: "var(--surface-high)", padding: "10px 14px", borderRadius: "var(--r)" }}>
              <input
                type="checkbox"
                checked={!!settings.hideAmounts}
                onChange={(e) => handleUpdateSettings({ hideAmounts: e.target.checked })}
                style={{ width: 18, height: 18, accentColor: "var(--teal)" }}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Hide Amounts</div>
                <div style={{ fontSize: 11, color: "var(--on-surface-var)" }}>Hide all numerical figures from view</div>
              </div>
            </label>
          </div>
        </div>

        {/* ─── 5. AUDIT / ACTIVITY HISTORY ─── */}
        <div className="admin-card">
          <h3 style={{ margin: "0 0 10px", fontSize: 14, textTransform: "uppercase", color: "var(--on-surface-var)" }}>Transaction Log</h3>
          <div style={{ maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, fontSize: 12, fontFamily: "monospace" }}>
            {counter.history && counter.history.length > 0 ? (
              counter.history.map((h, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", background: "var(--surface-high)", padding: "6px 10px", borderRadius: 4 }}>
                  <span>{h.action?.toUpperCase()}: {h.action === "subtract" ? "-" : "+"}₹{Number(h.delta || 0).toLocaleString("en-IN")} {h.note ? `(${h.note})` : ""}</span>
                  <span style={{ color: "var(--on-surface-var)" }}>Total: ₹{Number(h.resultingTotal || 0).toLocaleString("en-IN")}</span>
                </div>
              ))
            ) : (
              <div style={{ color: "var(--on-surface-var)" }}>No entries logged yet.</div>
            )}
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "14px", fontSize: 12, color: "var(--on-surface-var)", borderTop: "1px solid rgba(199,191,255,0.08)" }}>
        All parameters sync automatically in real time across connected screens.
      </div>
    </div>
  );
}
