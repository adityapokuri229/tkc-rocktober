import Countdown from "./Countdown.jsx";

export default function Hero({ hero }) {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="container hero-grid">
        {/* Left column */}
        <div>
          <p className="hero-collab">
            {hero.collab.split("×")[0].trim()} <span className="hl">×</span> {hero.collab.split("×")[1]?.trim()}
          </p>

          <h1 id="hero-title">
            FUNDRAISER
            <span className="accent">CONCERT</span>
          </h1>

          <div className="hero-tag-row">
            <span className="chip chip-star">★ Featuring Student Bands! ★</span>
            <span className="chip chip-teal">College Circuit Indie Jam</span>
          </div>

          <p className="hero-tagline">{hero.tagline}</p>

          <div className="hero-meta">
            <span className="hero-meta-item"><span className="icon">📍</span>{hero.venueLabel}</span>
            <span className="hero-meta-item"><span className="icon">📅</span>{hero.dateLabel}</span>
            {hero.timeLabel && hero.timeLabel !== "TIME_TBD — to be announced" && (
              <span className="hero-meta-item"><span className="icon">⏰</span>{hero.timeLabel}</span>
            )}
          </div>

          <div className="hero-cta">
            <a className="btn btn-yellow" href="#tickets">{hero.ticketCta} (₹299+)</a>
            <a className="btn btn-ghost" href="#donate">💛 {hero.donateCta} via UPI</a>
          </div>

          <Countdown />
        </div>

        {/* Right column — poster art */}
        <div className="hero-art" aria-hidden="true">
          <div className="poster-top">
            <div className="poster-org">
              <div className="poster-icon">🎸</div>
              <div>
                <div className="poster-org-name">KNOWLEDGE CORPS</div>
                <div className="poster-org-sub">Student Curated · Verified NGO</div>
              </div>
            </div>
            <div className="poster-divider">Official Broadside Flyer</div>
            <div className="poster-headline">
              FUNDRAISER<br />
              <span className="yl">CONCERT</span>
            </div>
            <div className="poster-sub">🎵 Featuring Student Bands!</div>
            <div className="poster-feature">
              A student-run concert that<br />will use the money raised<br />to help support Education<br />for the underprivileged.
            </div>
          </div>
          <div className="poster-bottom">
            <div className="poster-venue">
              📍 <span className="yl">The Raft, Kor</span> on 23rd Oct<br />
              <small style={{ opacity: 0.7 }}>Koramangala · 6th Block</small>
            </div>
            <div className="poster-limit">All Ages Welcome</div>
          </div>
        </div>
      </div>
    </section>
  );
}
