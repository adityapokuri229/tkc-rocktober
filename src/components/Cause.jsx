export default function Cause({ cause }) {
  const pct = cause.goal ? Math.min(100, Math.round((cause.raised / cause.goal) * 100)) : 0;
  const raisedFmt = Number(cause.raised).toLocaleString("en-IN");
  const goalFmt = Number(cause.goal).toLocaleString("en-IN");
  return (
    <section className="section" id="cause" aria-labelledby="cause-h">
      <div className="container">
        <span className="eyebrow yellow">Mission &amp; Transparency Ladder</span>
        <div className="mission-grid">
          {/* Left */}
          <div>
            <h2 id="cause-h">
              MUSIC FOR <span style={{ color: "var(--teal)", fontStyle: "italic" }}>EDUCATION</span>
            </h2>
            <p className="lead">{cause.body}</p>

            {/* Progress bar */}
            <div className="progress-wrap">
              <div className="progress-header">
                <div>
                  <div className="progress-raised">+₹{raisedFmt} Raised</div>
                  <div className="progress-goal">of +₹{goalFmt} Goal</div>
                </div>
                <div style={{ textAlign: "right", fontSize: 12, color: "var(--on-surface-var)" }}>
                  <div style={{ color: "var(--teal)", fontWeight: 700 }}>TARGET: ₹{goalFmt}</div>
                  <div>Crowdfund Progress</div>
                </div>
              </div>
              <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                <div style={{ width: `${pct}%` }} />
              </div>
              <div className="progress-labels">
                <span>Milestone 1: 50 School Kits (₹900)</span>
                <span>Milestone 2: Lab Setup (₹2.5L)</span>
              </div>
            </div>

            {/* Bullets */}
            {cause.bullets && (
              <ul style={{ marginTop: 16, paddingLeft: 0, listStyle: "none", display: "grid", gap: 8 }}>
                {cause.bullets.map((b, i) => (
                  <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, color: "var(--on-surface-var)" }}>
                    <span style={{ color: "var(--yellow)", marginTop: 2, flexShrink: 0 }}>✦</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right — Impact pillars */}
          <div>
            <div className="impact-pillars">
              <div className="impact-pillar">
                <span className="pillar-icon">📚</span>
                <div className="pillar-badge pillar-badge-a">Impact Pillar 01</div>
                <div className="pillar-title">100% School Kits &amp; Textbooks</div>
                <div className="pillar-body">
                  Direct provisioning of uniform shirts, geometry instruments, notebooks, and Kannada/English bilingual readers for 150 municipal school children in Ejipura and Vivek Nagar.
                </div>
                <div className="pillar-stat">
                  <span className="sv">+₹750</span> / SEMESTER
                </div>
              </div>

              <div className="impact-pillar">
                <span className="pillar-icon">🎭</span>
                <div className="pillar-badge pillar-badge-b">Impact Pillar 02</div>
                <div className="pillar-title">After-School STEM &amp; Arts Mentorship</div>
                <div className="pillar-body">
                  Undergraduate volunteers from St. Joseph's and Christ University conduct weekend hands-on robotics workshops, public speaking circles, and screen-printing art sessions.
                </div>
                <div className="pillar-stat">
                  <span className="sv">120+ Volunteers</span> Registered
                </div>
              </div>

              <div className="impact-pillar">
                <span className="pillar-icon">💻</span>
                <div className="pillar-badge pillar-badge-c">Impact Pillar 03</div>
                <div className="pillar-title">Safe Learning Hubs &amp; Digital Access</div>
                <div className="pillar-body">
                  Refurbishing 3 community library rooms with solar-backed low-power Raspberry Pi computing stations, Wikipedia offline mirrors, and noise-cancelling study pods.
                </div>
                <div className="pillar-stat">
                  <span className="sv">8 Hubs</span> Activated
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
