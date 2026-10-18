import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", f);
    return () => window.removeEventListener("scroll", f);
  }, []);
  const links = [
    ["Cause", "#cause"],
    ["Lineup", "#lineup"],
    ["Schedule", "#schedule"],
    ["Tickets", "#tickets"],
    ["Venue", "#venue"],
    ["FAQ", "#faq"],
  ];
  return (
    <>
      <div className="announce-bar">🎤 Live Benefit Gig · Bengaluru · October 23, 2026 — 100% for Student Education</div>
      <header className="site-nav" style={scrolled ? { boxShadow: "0 8px 32px rgba(0,0,0,0.5)" } : undefined}>
        <a className="skip-link" href="#main">Skip to content</a>
        <div className="container nav-inner">
          <a className="brand" href="#top">GOONJ <span>×</span> TKC</a>
          <nav className={`nav-links ${open ? "open" : ""}`} aria-label="Primary">
            {links.map(([label, href]) => (
              <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>
            ))}
            <a href="#tickets" className="btn btn-yellow btn-small" onClick={() => setOpen(false)}>🎟 Get Tickets</a>
            <Link to="/admin" className="btn btn-outline btn-small" onClick={() => setOpen(false)}>Admin</Link>
          </nav>
          <button className="menu-btn" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle menu">
            {open ? "✕" : "☰"}
          </button>
        </div>
      </header>
    </>
  );
}
