import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchLiveState, getLocalState } from "../lib/liveCounter.js";

export default function Home() {
  const [activeNav, setActiveNav] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState([0]); // First FAQ open by default
  const [copied, setCopied] = useState(false);
  const [counterData, setCounterData] = useState(() => getLocalState());

  useEffect(() => {
    // Initial fetch from backend Netlify Function
    fetchLiveState().then((data) => {
      if (data) setCounterData(data);
    });

    // Poll every 3 seconds for instant concert screen updates
    const interval = setInterval(() => {
      fetchLiveState().then((data) => {
        if (data) setCounterData(data);
      });
    }, 3000);

    // BroadcastChannel for instant local cross-tab sync
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

  const handleCopyUpi = () => {
    navigator.clipboard.writeText("goonj.trust@hdfcbank");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const toggleFaq = (index) => {
    setOpenFaq((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const navItems = [
    { label: "Home", href: "#top", id: "home" },
    { label: "Cause", href: "#cause", id: "cause" },
    { label: "Lineup", href: "#lineup", id: "lineup" },
    { label: "Schedule", href: "#schedule", id: "schedule" },
    { label: "Tickets", href: "#ticket-tiers", id: "tickets" },
    { label: "Venue", href: "#venue", id: "venue" },
    { label: "FAQ", href: "#faq", id: "faq" },
  ];

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased selection:bg-secondary-container selection:text-on-secondary-container min-h-screen">
      {/* ─── HEADER ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary-container/95 backdrop-blur-md shadow-[0_4px_16px_rgba(16,14,9,0.55)]">
        <div className="h-20 max-w-7xl mx-auto px-margin flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <a href="#top" className="bg-surface-container-lowest px-space-sm py-space-xs shadow-sm flex items-center">
              <span className="font-label-md text-label-md uppercase tracking-wider text-secondary font-bold">GOONJ</span>
              <span className="font-label-sm text-label-sm text-tertiary px-space-xs font-bold">×</span>
              <span className="font-label-md text-label-md uppercase tracking-wider text-primary font-bold">TKC</span>
            </a>
          </div>

          <nav className="hidden xl:flex items-center gap-space-sm">
            {navItems.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => setActiveNav(item.id)}
                  className={`font-label-md uppercase px-space-sm py-space-xs transition-colors ${
                    isActive
                      ? "bg-surface-container-highest text-on-surface"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center">
            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden text-on-surface p-1"
              aria-label="Toggle Navigation"
            >
              <span className="material-symbols-outlined text-title-lg">menu</span>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-surface-container-highest border-t border-outline-variant px-margin py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={() => {
                  setActiveNav(item.id);
                  setMobileMenuOpen(false);
                }}
                className="font-label-md uppercase py-2 text-on-surface hover:text-secondary"
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="w-full pt-20 bg-surface min-h-screen" id="top">
        <div className="flex flex-col w-full relative selection:bg-secondary selection:text-on-secondary overflow-hidden">
          {/* VINTAGE RISO DOTS & AMBIENT GRAPHIC NOISE ACCENT */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[radial-gradient(#c6c0ff_1px,transparent_1px)] [background-size:12px_12px] z-0"></div>

          {/* ─── SECTION 1: HERO ─── */}
          <section className="relative w-full px-margin-mobile md:px-margin py-space-lg md:py-space-xl">
            <div className="max-w-7xl mx-auto">
              {/* MAIN HERO GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
                {/* LEFT HERO EDITORIAL */}
                <div className="lg:col-span-7 flex flex-col gap-space-md z-10">
                  {/* PRESENTERS ROW */}
                  <div className="flex items-center gap-2">
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">
                      GOONJ × THE KNOWLEDGE CORPS
                    </span>
                    <span className="text-outline text-xs">•</span>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-tertiary font-bold">
                      PRESENTS
                    </span>
                  </div>

                  {/* HERO TITLE */}
                  <div>
                    <h1 className="font-headline-xl text-headline-xl uppercase tracking-tight text-on-surface leading-none">
                      FUNDRAISER<br />
                      <span className="text-secondary">CONCERT</span>
                    </h1>
                    <p className="font-title-md text-title-md text-tertiary uppercase font-bold tracking-wider mt-3">
                      ★ Featuring Student Bands Live ★
                    </p>
                  </div>

                  {/* VALUE PROPOSITION */}
                  <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
                    A student-run benefit concert raising funds to support education for underprivileged children across Bangalore. 100% of proceeds go directly to school supplies, books, and learning centers.
                  </p>

                  {/* DATE & VENUE PILL */}
                  <div className="inline-flex flex-wrap items-center gap-x-5 gap-y-2 bg-surface-container-high px-space-md py-space-sm w-fit border border-outline-variant/30">
                    <div className="flex items-center gap-2 text-secondary font-label-md text-label-md uppercase font-bold">
                      <span className="material-symbols-outlined text-[20px]">location_on</span>
                      THE RAFT, KORAMANGALA
                    </div>
                    <span className="hidden sm:inline text-outline">•</span>
                    <div className="flex items-center gap-2 text-primary font-label-md text-label-md uppercase font-bold">
                      <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                      FRI, 23 OCT 2026 // 5:30 PM
                    </div>
                  </div>

                  {/* LIVE CONCERT SCREEN DONATION COUNTER HUD */}
                  <div className="mt-2 bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-high border-2 border-secondary/40 p-4 sm:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] relative overflow-hidden rounded-sm">
                    <div className="absolute top-0 right-0 bg-secondary text-on-secondary px-3 py-0.5 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      CONCERT LIVE COUNTER
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                      <div>
                        <div className="font-label-sm text-label-sm text-tertiary uppercase tracking-widest font-bold mb-1 flex items-center gap-2">
                          <span>CURRENT COLLECTIONS</span>
                          <span className="text-outline">•</span>
                          <span className="text-on-surface-variant font-mono">LIVE SYNCED</span>
                        </div>
                        <div className="text-4xl sm:text-5xl lg:text-6xl font-black font-headline-xl text-secondary tracking-tight">
                          ₹{Number(counterData.raised || 0).toLocaleString("en-IN")}
                        </div>
                      </div>

                      <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-outline-variant/30 pt-3 sm:pt-0 sm:pl-5">
                        <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-bold mb-1">
                          TARGET GOAL
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold font-title-lg text-primary">
                          ₹{Number(counterData.goal || 150000).toLocaleString("en-IN")}
                        </div>
                        <div className="text-xs text-outline uppercase font-semibold mt-0.5">
                          (₹{(counterData.goal / 100000).toFixed(1)} Lakh Target)
                        </div>
                      </div>
                    </div>

                    {/* PROGRESS BAR */}
                    <div className="mt-4">
                      <div className="w-full h-4 bg-surface-lowest rounded-full overflow-hidden p-0.5 border border-outline-variant/40">
                        <div
                          className="h-full bg-gradient-to-r from-secondary via-primary to-tertiary rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(199,191,255,0.6)]"
                          style={{
                            width: `${Math.min(100, Math.max(0, ((counterData.raised || 0) / (counterData.goal || 150000)) * 100))}%`
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-2 text-xs font-mono uppercase tracking-wider">
                        <span className="text-secondary font-bold">
                          {(((counterData.raised || 0) / (counterData.goal || 150000)) * 100).toFixed(1)}% ACHIEVED
                        </span>
                        <span className="text-outline">
                          ₹{Math.max(0, (counterData.goal || 150000) - (counterData.raised || 0)).toLocaleString("en-IN")} TO TARGET
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CTA ACTIONS */}
                  <div className="flex flex-wrap items-center gap-space-md pt-2">
                    <a
                      className="inline-flex items-center justify-center gap-space-xs bg-secondary text-on-secondary font-title-md text-title-md uppercase px-space-lg py-3 hover:bg-secondary-fixed transition-colors font-bold shadow-md"
                      href="#ticket-tiers"
                    >
                      <span className="material-symbols-outlined text-title-md">confirmation_number</span>
                      GET TICKETS (₹349+)
                    </a>
                    <a
                      className="inline-flex items-center justify-center gap-space-xs bg-tertiary text-on-tertiary font-title-md text-title-md uppercase px-space-lg py-3 hover:bg-tertiary-fixed transition-colors font-bold shadow-md"
                      href="#direct-upi"
                    >
                      <span className="material-symbols-outlined text-title-md">volunteer_activism</span>
                      DONATE VIA UPI
                    </a>
                    <Link
                      to="/admin"
                      className="inline-flex items-center justify-center gap-space-xs bg-surface-container-high border border-outline-variant text-on-surface hover:text-secondary font-label-md text-label-md uppercase px-space-md py-3 transition-colors font-bold"
                    >
                      <span className="material-symbols-outlined text-[18px]">tune</span>
                      LIVE ADMIN
                    </Link>
                  </div>
                </div>

                {/* RIGHT POSTER: CLEAN, CRISP ARTWORK DISPLAY */}
                <div className="lg:col-span-5 flex justify-center">
                  <div className="w-full max-w-md bg-surface-container p-2.5 shadow-2xl rounded-sm">
                    <img
                      alt="Goonj x The Knowledge Corps Fundraiser Concert Poster"
                      className="w-full h-auto object-cover rounded-sm shadow-inner"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLV6iNDYth3pphUSnPdQpOJsXTRW9yFfID0CU25D1Sw2CqDt0y3RzhSFy6zJcCqmbSO5m9Z0VfH521Z3W4yvkdesmxK3IdSuLbRCZnft4acc25F7UnuDf9O-TXZtZY97aklv6E0zPJcXWmXLHp68tTBdD9OnYqN-ebpsKiSyYthBMG0Bbk7Qi6kRzsaQzSpkARmE0i7m4H4Tv7LGQBjxSOB7EDK66e4RA7vI8MEalKVeWjBVEuAER_pg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ─── SECTION 2: CAUSE — MUSIC FOR EDUCATION ─── */}
          <section className="relative w-full px-margin-mobile md:px-margin py-space-xl bg-surface-container-low" id="cause">
            <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
              {/* SECTION HEADER WITH RISOGRAPH CALLOUT */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
                <div>
                  <div className="inline-flex items-center gap-space-xs bg-primary-container px-space-sm py-space-xs mb-space-xs -rotate-1 shadow-[2px_2px_0px_#5dd9d0]">
                    <span className="font-label-sm text-label-sm uppercase text-primary tracking-widest font-bold">
                      MISSION &amp; TRANSPARENCY LEDGER
                    </span>
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">
                    MUSIC FOR <span className="text-tertiary">EDUCATION</span>
                  </h2>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                  Bengaluru student indie bands unionizing their sound systems to fund primary schooling, reading desks, and creative arts equipment for young learners in vulnerable wards.
                </p>
              </div>

              {/* LIVE PROGRESS THERMOMETER */}
              <div className="bg-surface-container p-space-md shadow-[4px_4px_0px_#100e09]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs mb-space-xs">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-md text-label-md uppercase text-on-surface">CROWDFUND PROGRESS</span>
                    <span className="bg-secondary-container text-on-secondary font-label-sm text-label-sm px-space-xs py-0.5 font-bold">
                      {(((counterData.raised || 0) / (counterData.goal || 150000)) * 100).toFixed(1)}% TARGET REACHED
                    </span>
                  </div>
                  <div className="font-label-md text-label-md text-secondary tracking-wider">
                    <span className="text-on-surface font-bold">₹{Number(counterData.raised || 0).toLocaleString("en-IN")} RAISED</span> OF ₹{Number(counterData.goal || 150000).toLocaleString("en-IN")} GOAL
                  </div>
                </div>
                {/* Meter Bar */}
                <div className="w-full h-6 bg-surface-container-lowest p-1 shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-secondary via-primary to-tertiary transition-all duration-1000"
                    style={{ width: `${Math.min(100, Math.max(0, ((counterData.raised || 0) / (counterData.goal || 150000)) * 100))}%` }}
                  ></div>
                </div>
                <div className="flex flex-wrap items-center justify-between pt-space-xs text-outline font-label-sm text-label-sm uppercase">
                  <span>₹0 KICKOFF</span>
                  <span>MILESTONE 1: 50 KITS (₹50K)</span>
                  <span>CURRENT: ₹{Number(counterData.raised || 0).toLocaleString("en-IN")}</span>
                  <span>TARGET: ₹{Number(counterData.goal || 150000).toLocaleString("en-IN")} (1.5 LAKH)</span>
                </div>
              </div>

              {/* 3 IMPACT STUB CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                {/* CARD 1 */}
                <div className="bg-surface-container-highest p-space-md shadow-[4px_4px_0px_#7e0022] flex flex-col justify-between group hover:-translate-y-1 transition-transform">
                  <div className="flex flex-col gap-space-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm uppercase bg-tertiary text-on-tertiary px-space-xs py-0.5 font-bold">
                        IMPACT PILLAR 01
                      </span>
                      <span className="material-symbols-outlined text-secondary">backpack</span>
                    </div>
                    <h3 className="font-title-lg text-title-lg text-on-surface uppercase font-black leading-snug">
                      100% School Kits &amp; Textbooks
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Direct provisioning of uniform cloth, geometry instruments, notebooks, and Kannada/English bilingual readers for 150 municipal school children in Ejipura and Vivek Nagar.
                    </p>
                  </div>
                  <div className="mt-space-md pt-space-sm bg-surface-container-low px-space-sm py-space-xs flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-outline uppercase">COST PER LEARNER</span>
                    <span className="font-label-md text-label-md text-secondary font-bold">₹750 / SEMESTER</span>
                  </div>
                </div>

                {/* CARD 2 */}
                <div className="bg-surface-container-highest p-space-md shadow-[4px_4px_0px_#382f84] flex flex-col justify-between group hover:-translate-y-1 transition-transform">
                  <div className="flex flex-col gap-space-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm uppercase bg-secondary text-on-secondary px-space-xs py-0.5 font-bold">
                        IMPACT PILLAR 02
                      </span>
                      <span className="material-symbols-outlined text-tertiary">science</span>
                    </div>
                    <h3 className="font-title-lg text-title-lg text-on-surface uppercase font-black leading-snug">
                      After-School STEM &amp; Arts Mentorship
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Undergraduate volunteers from St. Joseph's and Christ University conduct weekend hands-on robotics workshops, public speaking circles, and screen-printing art sessions.
                    </p>
                  </div>
                  <div className="mt-space-md pt-space-sm bg-surface-container-low px-space-sm py-space-xs flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-outline uppercase">HOURS PLEDGED</span>
                    <span className="font-label-md text-label-md text-primary font-bold">120+ VOLUNTEER HRS</span>
                  </div>
                </div>

                {/* CARD 3 */}
                <div className="bg-surface-container-highest p-space-md shadow-[4px_4px_0px_#003734] flex flex-col justify-between group hover:-translate-y-1 transition-transform">
                  <div className="flex flex-col gap-space-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm uppercase bg-primary text-on-primary px-space-xs py-0.5 font-bold">
                        IMPACT PILLAR 03
                      </span>
                      <span className="material-symbols-outlined text-secondary">terminal</span>
                    </div>
                    <h3 className="font-title-lg text-title-lg text-on-surface uppercase font-black leading-snug">
                      Safe Learning Hubs &amp; Digital Access
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Refurbishing 2 community library rooms with solar-backed low-power Raspberry Pi computing stations, Wikipedia offline mirrors, and noise-canceling study pods.
                    </p>
                  </div>
                  <div className="mt-space-md pt-space-sm bg-surface-container-low px-space-sm py-space-xs flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-outline uppercase">COMMUNITY NODES</span>
                    <span className="font-label-md text-label-md text-secondary-fixed font-bold">2 HUBS ACTIVATED</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ─── SECTION 3: LINEUP — FEATURED STUDENT BANDS ─── */}
          <section className="relative w-full px-margin-mobile md:px-margin py-space-xl" id="lineup">
            <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
              {/* LINEUP HEADER */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
                <div>
                  <div className="inline-flex items-center gap-space-xs bg-tertiary-container px-space-sm py-space-xs text-on-tertiary-container font-label-sm text-label-sm uppercase tracking-widest font-bold -rotate-1 mb-space-xs shadow-[2px_2px_0px_#100e09]">
                    COLLEGIATE SOUND WAVE
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">
                    FEATURED <span className="text-secondary">STUDENT BANDS</span>
                  </h2>
                </div>
                <div className="flex items-center gap-space-sm font-label-md text-label-md text-on-surface-variant uppercase">
                  <span>AMPLIFIED LIVE</span>
                  <span>•</span>
                  <span>NO TRACK BACKINGS</span>
                  <span>•</span>
                  <span>100% ORIGINAL &amp; COVERS</span>
                </div>
              </div>

              {/* 3 BAND GIG POSTER CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
                {/* BAND 1 */}
                <div className="bg-surface-container p-space-md shadow-[6px_6px_0px_#382f84] flex flex-col justify-between group">
                  <div className="flex flex-col gap-space-sm">
                    {/* Band Image Frame */}
                    <div className="relative w-full h-56 bg-surface-container-lowest overflow-hidden shadow-inner">
                      <img
                        className="w-full h-full object-cover filter contrast-125 saturate-150 group-hover:scale-105 transition-transform duration-300"
                        alt="The Koramangala Collective student rock band on stage"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaaeW9XTmNsqGFLJkE6eg2By3pqVBIn6V_M8brNBpESKSBvEhhhsId-E_D9St40NvHe4MTjcqqr8F-ErCYvOdlHkO6LbvkGS0gzD9xd6aLCW91ydNwx8CA9DiLXBmTumSOJUz8nvR-V_MmA7mFilaWRPUFq04A_VbF0ZdHNNaBN3au-7Ha4z6jp4-bq4C9bgMUccvBGEYnYrBtg3PMWq8mJP9wewmUj0yJYTa6ODRa"
                      />
                      <div className="absolute top-2 left-2 bg-secondary text-on-secondary px-space-xs py-0.5 font-label-sm text-label-sm font-bold uppercase rotate-2">
                        06:45 PM
                      </div>
                      <div className="absolute bottom-2 right-2 bg-surface-container-lowest/90 text-on-surface px-space-xs py-0.5 font-label-sm text-label-sm uppercase">
                        MAIN STAGE
                      </div>
                    </div>
                    {/* Band Meta */}
                    <div className="flex items-center gap-space-xs pt-space-xs">
                      <span className="bg-primary-container text-on-primary-container font-label-sm text-label-sm uppercase px-space-xs py-0.5">
                        POST-PUNK / INDIE
                      </span>
                      <span className="font-label-sm text-label-sm text-outline">ST. JOSEPH'S &amp; CHRIST</span>
                    </div>
                    <h3 className="font-title-lg text-title-lg text-on-surface uppercase font-black">
                      The Koramangala Collective
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      A high-octane 5-piece college outfit known for abrasive distortion riffs, gritty Bangalore commuter anthems, and roaring crowd call-and-responses.
                    </p>
                  </div>
                  {/* Song Feature */}
                  <div className="mt-space-md pt-space-sm bg-surface-container-high px-space-sm py-space-xs flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-outline uppercase font-mono">POPULAR TRACK</span>
                    <span className="font-label-sm text-label-sm text-secondary font-bold">"RING ROAD STATIC"</span>
                  </div>
                </div>

                {/* BAND 2 */}
                <div className="bg-surface-container p-space-md shadow-[6px_6px_0px_#7e0022] flex flex-col justify-between group">
                  <div className="flex flex-col gap-space-sm">
                    {/* Band Image Frame */}
                    <div className="relative w-full h-56 bg-surface-container-lowest overflow-hidden shadow-inner">
                      <img
                        className="w-full h-full object-cover filter contrast-125 saturate-150 group-hover:scale-105 transition-transform duration-300"
                        alt="Paper Aeroplanes acoustic indie folk band"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLNxuKQeLV3cqMzq-KngvUgwq4phkCX8z1BupHkcwaZa3_CX7YlAL6tDocERLUWZyk8kEOAYxsLCRaxTCL5o8iFQbeiuH0ZhynH6YbbkM6JoBQJc4RBAv8QGxno-iuGFz5ROafep0Mc4lPIJreSUens9PSnQdhcSZajUG04VOqUPPE9wnLmAh1C9Amv_Ogrpi791QDuGzxdoywMCTAyO8HVTS2_mynrGRHEnuYaRSQ"
                      />
                      <div className="absolute top-2 left-2 bg-tertiary text-on-tertiary px-space-xs py-0.5 font-label-sm text-label-sm font-bold uppercase -rotate-2">
                        07:50 PM
                      </div>
                      <div className="absolute bottom-2 right-2 bg-surface-container-lowest/90 text-on-surface px-space-xs py-0.5 font-label-sm text-label-sm uppercase">
                        ACOUSTIC LAWN
                      </div>
                    </div>
                    {/* Band Meta */}
                    <div className="flex items-center gap-space-xs pt-space-xs">
                      <span className="bg-tertiary-container text-on-tertiary-container font-label-sm text-label-sm uppercase px-space-xs py-0.5">
                        FOLK / AMBIENT
                      </span>
                      <span className="font-label-sm text-label-sm text-outline">BMS COLLEGE OF ENGG</span>
                    </div>
                    <h3 className="font-title-lg text-title-lg text-on-surface uppercase font-black">
                      Paper Aeroplanes
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Intricate fingerpicked acoustic progressions woven with classical violin and three-part vocal harmonies celebrating Bangalore monsoon afternoons.
                    </p>
                  </div>
                  {/* Song Feature */}
                  <div className="mt-space-md pt-space-sm bg-surface-container-high px-space-sm py-space-xs flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-outline font-mono uppercase">POPULAR TRACK</span>
                    <span className="font-label-sm text-label-sm text-tertiary font-bold">"PETRICHOR AT CUBBON"</span>
                  </div>
                </div>

                {/* BAND 3 */}
                <div className="bg-surface-container p-space-md shadow-[6px_6px_0px_#003734] flex flex-col justify-between group">
                  <div className="flex flex-col gap-space-sm">
                    {/* Band Image Frame */}
                    <div className="relative w-full h-56 bg-surface-container-lowest overflow-hidden shadow-inner">
                      <img
                        className="w-full h-full object-cover filter contrast-125 saturate-150 group-hover:scale-105 transition-transform duration-300"
                        alt="Kadhal & Chaos fusion carnatic rock band"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCle3e39WRCUfuJbwQd2PUes65O4ZYu7XOZPse2YUZ86V180IIJfkK5L7Dp0_AgUn1qXEU5eLj5wLlwXRBoOEJCWHDaOEAcpRKQTnT5G2-5LXXN4DFc8XXIDAxqxmxqrFhBnQxSqF-f6H0pptbG408SFbeBzAW04RTiyMCmjLoNTiKErSy7qL1cgHymuH5CHHpD58k5hkJosII0b0L8xnYcPnl6x_GDmEwM8myNJ0o"
                      />
                      <div className="absolute top-2 left-2 bg-secondary text-on-secondary px-space-xs py-0.5 font-label-sm text-label-sm font-bold uppercase rotate-1">
                        09:00 PM (HEADLINE)
                      </div>
                      <div className="absolute bottom-2 right-2 bg-surface-container-lowest/90 text-on-surface px-space-xs py-0.5 font-label-sm text-label-sm uppercase">
                        AMPHITHEATER
                      </div>
                    </div>
                    {/* Band Meta */}
                    <div className="flex items-center gap-space-xs pt-space-xs">
                      <span className="bg-secondary-container text-on-secondary font-label-sm text-label-sm uppercase px-space-xs py-0.5">
                        CARNATIC PROG ROCK
                      </span>
                      <span className="font-label-sm text-label-sm text-outline">PES UNIVERSITY</span>
                    </div>
                    <h3 className="font-title-lg text-title-lg text-on-surface uppercase font-black">
                      Kadhal &amp; Chaos
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      An unstoppable fusion powerhouse intertwining traditional rhythmic konnakol and thunderous mridangam with heavy dropped-D electric guitar solos.
                    </p>
                  </div>
                  {/* Song Feature */}
                  <div className="mt-space-md pt-space-sm bg-surface-container-high px-space-sm py-space-xs flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-outline font-mono uppercase">POPULAR TRACK</span>
                    <span className="font-label-sm text-label-sm text-secondary font-bold">"TANDAV DISCO"</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ─── SECTION 4: SCHEDULE — CADENCE & RUN ORDER ─── */}
          <section className="relative w-full px-margin-mobile md:px-margin py-space-xl bg-surface-container-lowest" id="schedule">
            <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
                <div>
                  <span className="bg-surface-container-high text-secondary px-space-sm py-space-xs font-label-sm text-label-sm uppercase tracking-widest font-bold inline-block mb-space-xs">
                    CLOCKWORK SCHEDULE // 23 OCT
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">
                    EVENING CADENCE &amp; <span className="text-primary">RUN ORDER</span>
                  </h2>
                </div>
                <p className="font-body-sm text-body-sm text-outline max-w-sm">
                  Please arrive early to collect your screen-printed canvas wristband, tour the student zine gallery, and grab artisanal chai.
                </p>
              </div>

              {/* POSTER TIMELINE BLOCKS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
                {/* SLOT 1 */}
                <div className="bg-surface-container p-space-md shadow-[4px_4px_0px_#221f19] flex flex-col justify-between">
                  <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-title-md text-title-md text-secondary font-black">05:30 PM</span>
                      <span className="material-symbols-outlined text-outline">meeting_room</span>
                    </div>
                    <h4 className="font-title-md text-title-md text-on-surface uppercase font-bold">Doors Open &amp; Zine Fair</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Gates open at The Raft. Student photography exhibition, DIY concert screen-printing stall, and acoustic warmups.
                    </p>
                  </div>
                  <div className="mt-space-md pt-space-xs bg-surface-container-high px-space-xs text-center font-label-sm text-label-sm text-outline uppercase">
                    REGISTRATION DESK ACTIVE
                  </div>
                </div>

                {/* SLOT 2 */}
                <div className="bg-surface-container p-space-md shadow-[4px_4px_0px_#221f19] flex flex-col justify-between">
                  <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-title-md text-title-md text-tertiary font-black">06:30 PM</span>
                      <span className="material-symbols-outlined text-outline">mic</span>
                    </div>
                    <h4 className="font-title-md text-title-md text-on-surface uppercase font-bold">Acoustic Harmonies &amp; Opening</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Welcome dispatch from Goonj &amp; The Knowledge Corps changemaker crew followed by Paper Aeroplanes' unplugged sunset suite.
                    </p>
                  </div>
                  <div className="mt-space-md pt-space-xs bg-surface-container-high px-space-xs text-center font-label-sm text-label-sm text-outline uppercase">
                    KEYNOTE + FOLK SET
                  </div>
                </div>

                {/* SLOT 3 */}
                <div className="bg-surface-container p-space-md shadow-[4px_4px_0px_#221f19] flex flex-col justify-between">
                  <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-title-md text-title-md text-primary font-black">07:45 PM</span>
                      <span className="material-symbols-outlined text-outline">diversity_3</span>
                    </div>
                    <h4 className="font-title-md text-title-md text-on-surface uppercase font-bold">Children's Choir Showcase</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Special guest performance by 25 students from Vivek Nagar Learning Center alongside live donations milestone matching.
                    </p>
                  </div>
                  <div className="mt-space-md pt-space-xs bg-surface-container-high px-space-xs text-center font-label-sm text-label-sm text-outline uppercase">
                    FUNDRAISER SPOTLIGHT
                  </div>
                </div>

                {/* SLOT 4 */}
                <div className="bg-surface-container p-space-md shadow-[4px_4px_0px_#382f84] flex flex-col justify-between">
                  <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-title-md text-title-md text-secondary font-black">09:00 PM</span>
                      <span className="material-symbols-outlined text-secondary">electric_bolt</span>
                    </div>
                    <h4 className="font-title-md text-title-md text-on-surface uppercase font-bold">Headline Jam: Kadhal &amp; Chaos</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Full wattage fusion rock finale featuring all student performers sharing guitars, rhythm, and final midnight anthem.
                    </p>
                  </div>
                  <div className="mt-space-md pt-space-xs bg-primary-container px-space-xs text-center font-label-sm text-label-sm text-primary font-bold uppercase">
                    ELECTRIC FINALE
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ─── SECTION 5: TICKETS & UPI DIRECT DONATION ─── */}
          <section className="relative w-full px-margin-mobile md:px-margin py-space-xl" id="ticket-tiers">
            <div className="max-w-7xl mx-auto flex flex-col gap-space-xl">
              {/* HEADER */}
              <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-space-xs">
                <div className="bg-tertiary text-on-tertiary px-space-sm py-1 font-label-sm text-label-sm uppercase font-bold shadow-sm">
                  ★ TICKETS OUT NOW // 23RD OCT ★
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">
                  ROCKTOBER <span className="text-secondary">TICKETS</span>
                </h2>
                <p className="font-title-md text-title-md text-secondary font-bold uppercase tracking-wider">
                  "Choose your contribution. Every tier offers equal access."
                </p>
                <p className="font-body-md text-body-md text-on-surface-variant pt-space-xs">
                  Friday Standing Tickets at The Raft, Bangalore. Every tier gives you 100% equal access to the gig — choose whichever contribution amount you wish to pledge for student education.
                </p>
              </div>

              {/* 3 TICKET CARDS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg items-stretch">
                {/* TIER 1: ₹349 */}
                <div className="relative bg-surface-container p-space-lg shadow-[5px_5px_0px_#100e09] flex flex-col justify-between">
                  <div className="flex flex-col gap-space-md">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm uppercase bg-surface-container-high px-space-xs py-0.5 text-on-surface-variant font-bold">
                        TIER 01
                      </span>
                      <span className="font-label-sm text-label-sm text-secondary uppercase font-bold">ACCESSIBLE TIER</span>
                    </div>
                    <div>
                      <h3 className="font-title-lg text-title-lg text-on-surface uppercase font-black">Standing Pass</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant pt-space-xs">
                        Accessible entry tier ensuring everyone can attend and celebrate live student music.
                      </p>
                    </div>
                    <div className="bg-surface-container-lowest p-space-md flex items-baseline gap-space-xs shadow-inner">
                      <span className="font-headline-lg text-headline-lg text-on-surface font-extrabold leading-none">₹349</span>
                      <span className="font-label-sm text-label-sm text-outline uppercase font-mono">/ STANDING TICKET</span>
                    </div>
                    <ul className="flex flex-col gap-space-xs text-body-sm text-on-surface-variant font-mono">
                      <li className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-secondary text-body-md">check_circle</span>
                        Full Friday concert access at The Raft
                      </li>
                      <li className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-secondary text-body-md">check_circle</span>
                        Equal standing &amp; stage floor admission
                      </li>
                      <li className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-secondary text-body-md">check_circle</span>
                        Directly funds student notebooks &amp; stationery
                      </li>
                      <li className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-secondary text-body-md">check_circle</span>
                        Physical riso wristband at check-in
                      </li>
                    </ul>
                  </div>
                  <div className="mt-space-lg">
                    <a
                      href="#direct-upi"
                      className="w-full block text-center bg-surface-container-highest hover:bg-secondary hover:text-on-secondary text-on-surface font-title-md text-title-md uppercase py-space-sm shadow-[3px_3px_0px_#382f84] transition-all font-bold"
                    >
                      CLAIM ₹349 TICKET
                    </a>
                  </div>
                </div>

                {/* TIER 2: ₹449 (FEATURED) */}
                <div className="relative bg-surface-container-high p-space-lg shadow-[8px_8px_0px_#7e0022] flex flex-col justify-between -translate-y-2">
                  {/* POPULAR BADGE */}
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-tertiary text-on-tertiary px-space-md py-0.5 font-label-md text-label-md uppercase font-black -rotate-1 shadow-[2px_2px_0px_#100e09] whitespace-nowrap">
                    ★ RECOMMENDED CONTRIBUTION ★
                  </div>
                  <div className="flex flex-col gap-space-md pt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm uppercase bg-tertiary-container px-space-xs py-0.5 text-on-tertiary-container font-bold">
                        TIER 02
                      </span>
                      <span className="font-label-sm text-label-sm text-tertiary uppercase font-bold">
                        COVERS 1 LEARNING KIT
                      </span>
                    </div>
                    <div>
                      <h3 className="font-title-lg text-title-lg text-on-surface uppercase font-black">Supporter Pass</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant pt-space-xs">
                        Equal access ticket with added contribution directly financing student textbooks.
                      </p>
                    </div>
                    <div className="bg-surface-container-lowest p-space-md flex items-baseline gap-space-xs shadow-inner">
                      <span className="font-headline-lg text-headline-lg text-tertiary font-extrabold leading-none">₹449</span>
                      <span className="font-label-sm text-label-sm text-outline uppercase font-mono">/ STANDING TICKET</span>
                    </div>
                    <ul className="flex flex-col gap-space-xs text-body-sm text-on-surface font-mono">
                      <li className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-tertiary text-body-md">check_circle</span>
                        Full Friday concert access at The Raft
                      </li>
                      <li className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-tertiary text-body-md">check_circle</span>
                        Equal standing &amp; stage floor admission
                      </li>
                      <li className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-tertiary text-body-md">check_circle</span>
                        Sponsors 1 complete pupil learning &amp; book bundle
                      </li>
                      <li className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-tertiary text-body-md">check_circle</span>
                        Physical riso wristband at check-in
                      </li>
                    </ul>
                  </div>
                  <div className="mt-space-lg">
                    <a
                      href="#direct-upi"
                      className="w-full block text-center bg-tertiary text-on-tertiary hover:bg-secondary hover:text-on-secondary font-title-md text-title-md uppercase py-space-sm shadow-[4px_4px_0px_#100e09] transition-all font-black"
                    >
                      CLAIM ₹449 TICKET
                    </a>
                  </div>
                </div>

                {/* TIER 3: ₹549 */}
                <div className="relative bg-surface-container p-space-lg shadow-[5px_5px_0px_#003734] flex flex-col justify-between">
                  <div className="flex flex-col gap-space-md">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm uppercase bg-surface-container-high px-space-xs py-0.5 text-on-surface-variant font-bold">
                        TIER 03
                      </span>
                      <span className="font-label-sm text-label-sm text-primary uppercase font-bold">MAXIMUM IMPACT</span>
                    </div>
                    <div>
                      <h3 className="font-title-lg text-title-lg text-on-surface uppercase font-black">Champion Pass</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant pt-space-xs">
                        For passionate allies maximizing direct impact for student classrooms and mentors.
                      </p>
                    </div>
                    <div className="bg-surface-container-lowest p-space-md flex items-baseline gap-space-xs shadow-inner">
                      <span className="font-headline-lg text-headline-lg text-primary font-extrabold leading-none">₹549</span>
                      <span className="font-label-sm text-label-sm text-outline uppercase font-mono">/ STANDING TICKET</span>
                    </div>
                    <ul className="flex flex-col gap-space-xs text-body-sm text-on-surface-variant font-mono">
                      <li className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-primary text-body-md">check_circle</span>
                        Full Friday concert access at The Raft
                      </li>
                      <li className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-primary text-body-md">check_circle</span>
                        Equal standing &amp; stage floor admission
                      </li>
                      <li className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-primary text-body-md">check_circle</span>
                        Funds STEM supplies, science kits &amp; tutor stipends
                      </li>
                      <li className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-primary text-body-md">check_circle</span>
                        Physical riso wristband at check-in
                      </li>
                    </ul>
                  </div>
                  <div className="mt-space-lg">
                    <a
                      href="#direct-upi"
                      className="w-full block text-center bg-primary text-on-primary hover:bg-secondary hover:text-on-secondary font-title-md text-title-md uppercase py-space-sm shadow-[3px_3px_0px_#160264] transition-all font-bold"
                    >
                      CLAIM ₹549 TICKET
                    </a>
                  </div>
                </div>
              </div>

              {/* DIRECT UPI REMOTE DONATION CARD */}
              <div className="bg-surface-container-low p-space-lg shadow-[6px_6px_0px_#382f84] relative" id="direct-upi">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-space-lg items-center">
                  <div className="md:col-span-8 flex flex-col gap-space-sm">
                    <div className="inline-flex items-center gap-space-xs bg-secondary text-on-secondary px-space-xs py-0.5 font-label-sm text-label-sm uppercase font-bold w-fit -rotate-1">
                      REMOTE SOLIDARITY // ALL INDIA ACCESS
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface uppercase tracking-tight">
                      Can't make it to Bangalore? Back the kids directly via UPI.
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
                      Scan through Google Pay, PhonePe, Paytm, or BHIM. Every single contribution triggers an automated donor receipt and transparent ledger dispatch.
                    </p>
                    <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
                      <div className="bg-surface-container-lowest px-space-md py-space-xs flex items-center gap-space-sm shadow-[2px_2px_0px_#5dd9d0]">
                        <span className="font-label-sm text-label-sm text-outline uppercase font-mono">UPI ID:</span>
                        <span className="font-label-md text-label-md text-secondary select-all font-mono font-bold">
                          goonj.trust@hdfcbank
                        </span>
                        <button
                          className="material-symbols-outlined text-on-surface text-body-md hover:text-secondary transition-colors"
                          onClick={handleCopyUpi}
                          title="Copy UPI ID"
                        >
                          {copied ? "check" : "content_copy"}
                        </button>
                      </div>
                      {copied && (
                        <span className="text-secondary font-label-sm text-label-sm uppercase font-bold">
                          ✓ UPI ID Copied!
                        </span>
                      )}
                      <div className="flex items-center gap-space-xs text-outline font-label-sm text-label-sm uppercase font-mono">
                        <span>VERIFIED TRUST</span>
                        <span>•</span>
                        <span>80G APPLICABLE</span>
                      </div>
                    </div>
                  </div>

                  {/* QR MOCK DISPLAY */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center">
                    <div className="bg-surface-container-lowest p-space-md shadow-[4px_4px_0px_#ffb2b6] flex flex-col items-center gap-space-xs">
                      {/* QR Code Mock Vector */}
                      <div className="w-40 h-40 bg-surface-container p-2 flex items-center justify-center">
                        <svg className="w-full h-full text-secondary" viewBox="0 0 100 100">
                          {/* QR Finder Corners */}
                          <rect fill="none" height="28" stroke="currentColor" strokeWidth="6" width="28" x="5" y="5" />
                          <rect fill="currentColor" height="12" width="12" x="13" y="13" />
                          <rect fill="none" height="28" stroke="currentColor" strokeWidth="6" width="28" x="67" y="5" />
                          <rect fill="currentColor" height="12" width="12" x="75" y="13" />
                          <rect fill="none" height="28" stroke="currentColor" strokeWidth="6" width="28" x="5" y="67" />
                          <rect fill="currentColor" height="12" width="12" x="13" y="75" />
                          {/* Data Dots Grid */}
                          <rect fill="currentColor" height="6" width="6" x="40" y="8" />
                          <rect fill="currentColor" height="6" width="6" x="50" y="16" />
                          <rect fill="currentColor" height="6" width="6" x="40" y="24" />
                          <rect fill="currentColor" height="6" width="6" x="8" y="40" />
                          <rect fill="currentColor" height="6" width="6" x="18" y="48" />
                          <rect fill="currentColor" height="6" width="6" x="28" y="40" />
                          <rect fill="currentColor" height="8" width="8" x="40" y="40" />
                          <rect fill="currentColor" height="8" width="8" x="52" y="48" />
                          <rect fill="currentColor" height="8" width="8" x="64" y="40" />
                          <rect fill="currentColor" height="6" width="6" x="76" y="48" />
                          <rect fill="currentColor" height="6" width="6" x="88" y="40" />
                          <rect fill="currentColor" height="6" width="6" x="44" y="68" />
                          <rect fill="currentColor" height="6" width="6" x="56" y="76" />
                          <rect fill="currentColor" height="6" width="6" x="68" y="68" />
                          <rect fill="currentColor" height="8" width="8" x="80" y="76" />
                          <rect fill="currentColor" height="6" width="6" x="72" y="88" />
                          <rect fill="currentColor" height="6" width="6" x="48" y="88" />
                        </svg>
                      </div>
                      <span className="font-label-sm text-label-sm uppercase text-outline font-mono">SCAN VIA ANY UPI APP</span>
                      <span className="font-label-md text-label-md text-tertiary font-bold tracking-wider">₹100 TO ₹50,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ─── SECTION 6: VENUE & ACCESSIBILITY ─── */}
          <section className="relative w-full px-margin-mobile md:px-margin py-space-xl bg-surface-container-low" id="venue">
            <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
                <div>
                  <div className="inline-flex items-center gap-space-xs bg-secondary-container px-space-sm py-space-xs text-on-secondary font-label-sm text-label-sm uppercase tracking-widest font-bold -rotate-1 mb-space-xs shadow-[2px_2px_0px_#100e09]">
                    COMMUNITY OPEN-AIR HUB
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">
                    THE RAFT // <span className="text-tertiary">KORAMANGALA</span>
                  </h2>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
                  4th Block, Koramangala, Bangalore. Nestled right off 80 Feet Road with shaded tree canopies, acoustic baffles, and gender-neutral safe spaces.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-stretch">
                {/* MAP CARD WITH LOCATION PIPELINE */}
                <div className="lg:col-span-7 bg-surface-container p-space-md shadow-[6px_6px_0px_#382f84] flex flex-col justify-between">
                  <div className="relative w-full h-80 rounded overflow-hidden shadow-inner">
                    <div
                      className="w-full h-full bg-cover bg-center"
                      data-location="The Raft, 4th Block Koramangala, Bangalore"
                      style={{
                        backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBZ8WVTIWLAoWyUBlJvqNQL5h5WmOKa3_3eMZW233K-rb7J0uNQNUwH6tUpV5n2J8SOB7LbookCn5YFHXSN4Dbq5EV_yGAp8KtxKmMdttYDzbFft9lBFarT3n7_qbsbHqtInlSIZKtWaAzY2-JgayoaBUWzW4qXkEMYZvgFYkyB4HiheMeyqcI8Hu4MDfVr2RnYPRJXaElt5yVtVXYNgGzGry5RYY8Hf2pdz903nUjZ')`,
                      }}
                    ></div>
                    <div className="absolute bottom-3 left-3 bg-surface-container-lowest/95 p-space-sm shadow-[3px_3px_0px_#5dd9d0]">
                      <span className="font-title-md text-title-md text-on-surface font-bold uppercase block">
                        THE RAFT OPEN LAWNS
                      </span>
                      <span className="font-label-sm text-label-sm text-secondary font-mono">
                        12.9344° N, 77.6271° E // BLR
                      </span>
                    </div>
                  </div>

                  <div className="mt-space-md flex flex-wrap items-center justify-between gap-space-sm">
                    <div className="flex items-center gap-space-xs text-outline font-label-sm text-label-sm uppercase">
                      <span className="material-symbols-outlined text-secondary">directions_bus</span>
                      <span>FEEDER FROM SOUTH END METRO</span>
                    </div>
                    <a
                      className="inline-flex items-center gap-space-xs bg-surface-container-highest px-space-md py-space-xs text-secondary hover:text-on-surface font-label-md text-label-md uppercase font-bold transition-colors"
                      href="https://maps.google.com"
                      target="_blank"
                      rel="noreferrer"
                    >
                      OPEN IN MAPS
                      <span className="material-symbols-outlined text-body-md">open_in_new</span>
                    </a>
                  </div>
                </div>

                {/* ACCESSIBILITY & COMMUNITY COMFORTS */}
                <div className="lg:col-span-5 flex flex-col gap-space-md">
                  <div className="bg-surface-container p-space-md shadow-[4px_4px_0px_#100e09]">
                    <div className="flex items-center gap-space-xs mb-space-xs">
                      <span className="material-symbols-outlined text-secondary">accessible</span>
                      <h4 className="font-title-md text-title-md text-on-surface uppercase font-bold">Step-Free Amphitheater</h4>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Complete step-free ramp access from gate to the main acoustic lawn. Dedicated viewing deck for wheelchair patrons and assistive seating.
                    </p>
                  </div>
                  <div className="bg-surface-container p-space-md shadow-[4px_4px_0px_#100e09]">
                    <div className="flex items-center gap-space-xs mb-space-xs">
                      <span className="material-symbols-outlined text-tertiary">water_drop</span>
                      <h4 className="font-title-md text-title-md text-on-surface uppercase font-bold">Free RO Water &amp; BYO-Bottle</h4>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Zero single-use plastics at the venue. Unlimited chilled RO refill stations. Bring your reusable bottles or grab a Goonj steel canteen on loan.
                    </p>
                  </div>
                  <div className="bg-surface-container p-space-md shadow-[4px_4px_0px_#100e09]">
                    <div className="flex items-center gap-space-xs mb-space-xs">
                      <span className="material-symbols-outlined text-primary">hearing</span>
                      <h4 className="font-title-md text-title-md text-on-surface uppercase font-bold">Quiet Sensory Lounge</h4>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Tucked behind the acoustic lawn for neurodivergent attendees or anyone needing a low-decibel break with earplugs on supply.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ─── SECTION 7: FAQ & COMMUNITY CREW ─── */}
          <section className="relative w-full px-margin-mobile md:px-margin py-space-xl" id="faq">
            <div className="max-w-7xl mx-auto flex flex-col gap-space-xl">
              {/* FAQ ACCORDION */}
              <div className="max-w-3xl mx-auto w-full flex flex-col gap-space-md">
                <div className="text-center flex flex-col items-center gap-space-xs">
                  <div className="bg-surface-container-high px-space-sm py-space-xs text-outline font-label-sm text-label-sm uppercase tracking-widest font-bold">
                    CONCERT ADVISORIES
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">
                    FREQUENTLY ASKED <span className="text-primary">QUESTIONS</span>
                  </h2>
                </div>

                <div className="flex flex-col gap-space-sm">
                  {/* Q1 */}
                  <div className="bg-surface-container p-space-md shadow-[3px_3px_0px_#100e09]">
                    <button
                      type="button"
                      onClick={() => toggleFaq(0)}
                      className="w-full text-left font-title-md text-title-md text-on-surface uppercase font-bold flex items-center justify-between cursor-pointer"
                    >
                      <span>How do the contribution tiers (₹349 / ₹449 / ₹549) work?</span>
                      <span className={`material-symbols-outlined text-secondary transition-transform ${openFaq.includes(0) ? "rotate-180" : ""}`}>
                        arrow_drop_down
                      </span>
                    </button>
                    {openFaq.includes(0) && (
                      <p className="font-body-sm text-body-sm text-on-surface-variant pt-space-xs">
                        All tickets are Friday Standing Passes for Rocktober at The Raft, Bangalore. Every single tier offers 100% equal admission to the concert—you get full stage and lawn floor access regardless of tier! You simply select how much you would like to contribute (₹349, ₹449, or ₹549) to help fund educational supplies and mentorship for underprivileged students.
                      </p>
                    )}
                  </div>

                  {/* Q2 */}
                  <div className="bg-surface-container p-space-md shadow-[3px_3px_0px_#100e09]">
                    <button
                      type="button"
                      onClick={() => toggleFaq(1)}
                      className="w-full text-left font-title-md text-title-md text-on-surface uppercase font-bold flex items-center justify-between cursor-pointer"
                    >
                      <span>Are donations and tickets eligible for Section 80G tax receipts?</span>
                      <span className={`material-symbols-outlined text-tertiary transition-transform ${openFaq.includes(1) ? "rotate-180" : ""}`}>
                        arrow_drop_down
                      </span>
                    </button>
                    {openFaq.includes(1) && (
                      <p className="font-body-sm text-body-sm text-on-surface-variant pt-space-xs">
                        Yes! Goonj operates as a registered non-profit trust in India. All Patron tier passes and direct UPI donations above ₹500 receive an automated 80G certificate dispatched to your registered email address within 72 hours.
                      </p>
                    )}
                  </div>

                  {/* Q3 */}
                  <div className="bg-surface-container p-space-md shadow-[3px_3px_0px_#100e09]">
                    <button
                      type="button"
                      onClick={() => toggleFaq(2)}
                      className="w-full text-left font-title-md text-title-md text-on-surface uppercase font-bold flex items-center justify-between cursor-pointer"
                    >
                      <span>What kind of food and beverages will be available?</span>
                      <span className={`material-symbols-outlined text-primary transition-transform ${openFaq.includes(2) ? "rotate-180" : ""}`}>
                        arrow_drop_down
                      </span>
                    </button>
                    {openFaq.includes(2) && (
                      <p className="font-body-sm text-body-sm text-on-surface-variant pt-space-xs">
                        We host locally owned indie student bakeries, filter coffee stands, samosa stations, and herbal tea kiosks. No alcohol is permitted or served on venue grounds to ensure an all-ages, student-inclusive community atmosphere.
                      </p>
                    )}
                  </div>

                  {/* Q4 */}
                  <div className="bg-surface-container p-space-md shadow-[3px_3px_0px_#100e09]">
                    <button
                      type="button"
                      onClick={() => toggleFaq(3)}
                      className="w-full text-left font-title-md text-title-md text-on-surface uppercase font-bold flex items-center justify-between cursor-pointer"
                    >
                      <span>Can I bring analog film, polaroid, or DSLR cameras?</span>
                      <span className={`material-symbols-outlined text-secondary transition-transform ${openFaq.includes(3) ? "rotate-180" : ""}`}>
                        arrow_drop_down
                      </span>
                    </button>
                    {openFaq.includes(3) && (
                      <p className="font-body-sm text-body-sm text-on-surface-variant pt-space-xs">
                        Absolutely encouraged! 35mm film, handycam video rigs, and student photography projects are welcome. Flash photography is permitted except directly during the Children's Choir showcase. Tag your photos #GoonjxTKC.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* STUDENT COMMUNITY SUPPORTERS / SPONSORS CAROUSEL BOX */}
              <div className="bg-surface-container-high p-space-lg shadow-[6px_6px_0px_#7e0022]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-md">
                  <div>
                    <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-widest font-bold">
                      POWERED BY STUDENT ALLIANCES
                    </span>
                    <h3 className="font-title-lg text-title-lg text-on-surface uppercase font-black">
                      COMMUNITY BACKERS &amp; SPONSORS
                    </h3>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-sm text-label-sm text-outline uppercase">WANT TO SPONSOR AUDIO GEAR?</span>
                    <a
                      className="bg-tertiary text-on-tertiary font-label-sm text-label-sm uppercase px-space-xs py-0.5 font-bold hover:bg-secondary transition-colors"
                      href="mailto:concert@tkcorps.org"
                    >
                      BECOME A SUPPORTER
                    </a>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md">
                  <div className="bg-surface-container-lowest p-space-md flex flex-col items-center justify-center text-center shadow-inner">
                    <span className="font-title-md text-title-md text-on-surface uppercase font-black">THE RAFT</span>
                    <span className="font-label-sm text-label-sm text-outline">COMMUNITY VENUE</span>
                  </div>
                  <div className="bg-surface-container-lowest p-space-md flex flex-col items-center justify-center text-center shadow-inner">
                    <span className="font-title-md text-title-md text-secondary uppercase font-black">RISO PRESS BLR</span>
                    <span className="font-label-sm text-label-sm text-outline">PRINT PARTNER</span>
                  </div>
                  <div className="bg-surface-container-lowest p-space-md flex flex-col items-center justify-center text-center shadow-inner">
                    <span className="font-title-md text-title-md text-tertiary uppercase font-black">CHURCH ST SOUNDS</span>
                    <span className="font-label-sm text-label-sm text-outline">ACOUSTIC BACKLINE</span>
                  </div>
                  <div className="bg-surface-container-lowest p-space-md flex flex-col items-center justify-center text-center shadow-inner">
                    <span className="font-title-md text-title-md text-primary uppercase font-black">YOUR NAME HERE</span>
                    <span className="font-label-sm text-label-sm text-secondary font-bold">JOIN AS SPONSOR</span>
                  </div>
                </div>
              </div>

              {/* DIRECT STUDENT HELPLINE BAR */}
              <div className="bg-surface-container-lowest p-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm shadow-[3px_3px_0px_#5dd9d0]">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary">contact_support</span>
                  <span className="font-label-sm text-label-sm uppercase text-outline">STUDENT COMMITTEE HOTLINE:</span>
                  <span className="font-label-md text-label-md text-on-surface font-mono font-bold">
                    +91 80 4920 1823 // 10 AM - 7 PM
                  </span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <a
                    className="bg-secondary text-on-secondary font-label-sm text-label-sm uppercase px-space-sm py-1 font-bold hover:bg-tertiary transition-colors"
                    href="#ticket-tiers"
                  >
                    ★ RESERVE WRISTBAND NOW
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="w-full bg-surface-container-lowest text-on-surface-variant mt-space-xl border-t border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-margin py-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-space-sm">
            <span className="font-title-md text-title-md text-primary uppercase font-bold">GOONJ × TKC</span>
            <span className="hidden sm:inline text-outline">•</span>
            <span className="font-label-sm text-label-sm uppercase bg-surface-container-high px-space-sm py-1 text-secondary">
              100% Proceeds to Education
            </span>
          </div>
          <span className="font-label-sm text-label-sm text-outline uppercase">
            © 2026 Goonj x The Knowledge Corps. Bangalore Indie &amp; Student Changemakers.
          </span>
        </div>
      </footer>
    </div>
  );
}
