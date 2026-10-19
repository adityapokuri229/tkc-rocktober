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
    showFeedback(`+₹${val.toLocaleString("en-IN")} added to tally!`);
  };

  const handleAddPreset = async (amt) => {
    setLoading(true);
    const updated = await updateLiveState({
      action: "add",
      delta: amt,
      note: `Quick add ₹${amt.toLocaleString("en-IN")}`
    });
    setCounter(updated);
    setLoading(false);
    showFeedback(`+₹${amt.toLocaleString("en-IN")} added!`);
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
    showFeedback(`-₹${amt.toLocaleString("en-IN")} deducted.`);
  };

  const raised = Number(counter.raised || 0);
  const goal = Number(counter.goal || 150000);
  const pct = goal ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

  return (
    <div className="admin-wrap" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div className="container" style={{ maxWidth: 640 }}>
        {/* Navigation / Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <Link to="/" style={{ color: "var(--teal)", textDecoration: "none", fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>
            ← View Counter Display
          </Link>
          <span style={{ fontSize: 12, color: "var(--teal)", fontFamily: "monospace", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--teal)", display: "inline-block" }}></span>
            LIVE SYNC ACTIVE
          </span>
        </div>

        {statusMsg && (
          <div className="admin-card" style={{ background: "rgba(134,236,213,0.15)", borderColor: "var(--teal)", color: "var(--on-surface)", padding: "12px 18px", fontWeight: 600, fontSize: 14 }}>
            ✦ {statusMsg}
          </div>
        )}

        {/* Amount Tally Card */}
        <div className="admin-card" style={{ textAlign: "center", padding: "clamp(20px, 4vw, 32px)" }}>
          <span className="eyebrow yellow" style={{ margin: "0 auto 12px" }}>Amount Tally</span>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 8vw, 56px)", fontWeight: 800, color: "var(--yellow)", lineHeight: 1 }}>
            ₹{raised.toLocaleString("en-IN")}
          </div>
          <div style={{ color: "var(--on-surface-var)", fontSize: "clamp(12px, 2.5vw, 14px)", marginTop: 8 }}>
            Target: ₹{goal.toLocaleString("en-IN")} (1.5 Lakh) • <strong style={{ color: "var(--teal)" }}>{pct}% Complete</strong>
          </div>

          {/* Simple In-Theme Progress Bar */}
          <div className="progress" style={{ height: 14, margin: "20px auto 0", maxWidth: 440 }}>
            <div style={{ width: `${pct}%`, transition: "width 0.4s ease-out" }}></div>
          </div>
        </div>

        {/* Quick Add Buttons */}
        <div className="admin-card" style={{ padding: "clamp(16px, 3vw, 24px)" }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--on-surface-var)", marginBottom: 12 }}>
            Quick Add Buttons
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))", gap: 8 }}>
            {[349, 449, 549, 1000, 2000, 5000].map((amt) => (
              <button
                key={amt}
                onClick={() => handleAddPreset(amt)}
                disabled={loading}
                className="btn btn-ghost"
                style={{ padding: "10px 8px", fontSize: 13, borderColor: "rgba(199,191,255,0.25)", color: "var(--on-surface)" }}
              >
                +₹{amt.toLocaleString("en-IN")}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Add Input */}
        <div className="admin-card" style={{ padding: "clamp(16px, 3vw, 24px)" }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--on-surface-var)", marginBottom: 8 }}>
            Add Custom Amount
          </label>
          <form onSubmit={handleAddCustom} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="Enter ₹ amount..."
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              style={{
                flex: "1 1 180px",
                padding: "12px 16px",
                borderRadius: "var(--r-lg)",
                border: "1.5px solid rgba(199,191,255,0.2)",
                background: "var(--surface-high)",
                color: "var(--on-surface)",
                fontSize: 16,
                fontFamily: "inherit",
                outline: "none"
              }}
            />
            <button
              type="submit"
              disabled={loading || !addAmount}
              className="btn btn-yellow"
              style={{ padding: "12px 24px", whiteSpace: "nowrap", flex: "0 0 auto" }}
            >
              Add ₹
            </button>
          </form>

          {/* Quick Mistake Correction */}
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "var(--on-surface-var)", textTransform: "uppercase", fontWeight: 700 }}>Mistake correction:</span>
            {[349, 1000].map((amt) => (
              <button
                key={amt}
                onClick={() => handleSubtract(amt)}
                disabled={loading || raised < amt}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,180,171,0.3)",
                  color: "var(--error)",
                  borderRadius: "var(--r-full)",
                  padding: "4px 10px",
                  fontSize: 11,
                  cursor: "pointer",
                  fontFamily: "inherit"
                }}
              >
                -₹{amt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "16px", fontSize: 12, color: "var(--on-surface-var)", borderTop: "1px solid rgba(199,191,255,0.08)" }}>
        Admin controls update the display site in real time
      </div>
    </div>
  );
}
