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
    <div style={{ background: "var(--surface)", color: "var(--on-surface)", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "space-between", fontFamily: "var(--font-body)" }}>
      {/* ─── EXACT THEME NAV BAR ─── */}
      <nav className="site-nav">
        <div className="container nav-inner">
          <Link to="/" className="brand">
            Goonj <span>×</span> TKC
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="eyebrow" style={{ margin: 0, padding: "4px 10px", fontSize: 11 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--teal)", display: "inline-block" }}></span>
              Live Counter
            </span>
            <Link to="/admin" className="btn btn-ghost btn-small" style={{ padding: "6px 14px" }}>
              Admin
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── MAIN FILL-UP BY AMOUNT ─── */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 0" }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div className="section-light" style={{ padding: "clamp(24px, 5vw, 48px)", margin: 0, border: "1px solid rgba(199,191,255,0.12)" }}>
            <span className="eyebrow yellow">Fundraiser Concert • The Raft, Koramangala</span>
            
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 800, margin: "10px 0 16px", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
              Music For <span style={{ color: "var(--teal)", fontStyle: "italic" }}>Education</span>
            </h1>

            <p className="lead" style={{ fontSize: "clamp(14px, 2.5vw, 16px)", margin: "0 0 24px" }}>
              Student-run concert raising funds for underprivileged children across Bangalore. 100% of proceeds go directly to school supplies, books, and learning centers.
            </p>

            {/* In-theme Progress Fill-up Box */}
            <div className="progress-wrap" style={{ margin: 0, padding: "clamp(18px, 4vw, 28px)" }}>
              <div className="progress-header" style={{ flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div className="progress-raised" style={{ fontSize: "clamp(34px, 6vw, 48px)" }}>
                    ₹{raisedFmt} <span style={{ fontSize: 18, color: "var(--on-surface-var)", fontWeight: 600 }}>Raised</span>
                  </div>
                  <div className="progress-goal" style={{ fontSize: "clamp(13px, 2.5vw, 15px)", marginTop: 4 }}>
                    of ₹{goalFmt} Goal (1.5 Lakh Target)
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "var(--yellow)", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(20px, 4vw, 26px)" }}>
                    {pct}%
                  </div>
                  <div style={{ fontSize: 12, color: "var(--on-surface-var)" }}>Target Progress</div>
                </div>
              </div>

              {/* In-theme Fill-up Bar */}
              <div
                className="progress"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                style={{ height: "clamp(18px, 3vw, 24px)", margin: "16px 0 10px" }}
              >
                <div style={{ width: `${pct}%`, transition: "width 0.8s ease-out" }} />
              </div>

              <div className="progress-labels" style={{ fontSize: "clamp(10px, 2vw, 12px)", flexWrap: "wrap", gap: 6 }}>
                <span>₹0 Kickoff</span>
                <span>Milestone: 50 School Kits (₹50K)</span>
                <span>Target: ₹{goalFmt}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─── IN-THEME FOOTER ─── */}
      <footer style={{ borderTop: "1px solid rgba(199,191,255,0.08)", padding: "16px 0", textAlign: "center", fontSize: 12, color: "var(--on-surface-var)" }}>
        <div className="container">
          Friday, 23rd October 2026 • The Raft, Koramangala • Goonj × The Knowledge Corps
        </div>
      </footer>
    </div>
  );
}
