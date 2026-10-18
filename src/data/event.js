export const DEFAULT_CONTENT = {
  hero: {
    collab: "GOONJ.. a voice, an effort  ×  THE KNOWLEDGE CORPS",
    title: "FUNDRAISER CONCERT",
    tag: "Featuring Student Bands!",
    dateLabel: "23rd October, 2026",
    timeLabel: "TIME_TBD — to be announced",
    venueLabel: "The Raft, Koramangala",
    tagline:
      "A student-run concert that will use the money raised to help support education for the underprivileged.",
    ticketCta: "Get Tickets",
    donateCta: "Donate",
  },
  cause: {
    heading: "Music for education",
    body: "Goonj and The Knowledge Corps are putting together a student-run fundraiser. Every ticket and donation helps support education for underprivileged children.",
    bullets: [
      "100% of profits directed to education support",
      "Student performers, student organizers",
      "Community night at The Raft, Koramangala",
    ],
    goal: 200000,
    raised: 45000,
  },
  lineup: [
    { name: "Student Band 1 — TBA", time: "TBA", blurb: "To be announced. Admin can edit this live from /admin.", image: "" },
    { name: "Student Band 2 — TBA", time: "TBA", blurb: "To be announced. Admin can edit this live from /admin.", image: "" },
    { name: "Student Band 3 — TBA", time: "TBA", blurb: "To be announced. Admin can edit this live from /admin.", image: "" },
  ],
  schedule: [
    { time: "TBA", title: "Doors open", desc: "Entry + community stalls at The Raft." },
    { time: "TBA", title: "Opening act", desc: "Student band set 1." },
    { time: "TBA", title: "Headline + fundraiser moment", desc: "Why your donation matters." },
    { time: "TBA", title: "Closing + thank you", desc: "Wrap-up and donation totals." },
  ],
  tickets: [
    { tier: "Standing Pass", price: "₹349", perks: "Fri, Standing Ticket — Equal access admission", url: "#ticket-tiers", soldout: false },
    { tier: "Supporter Pass", price: "₹449", perks: "Fri, Standing Ticket — Covers 1 student learning kit", url: "#ticket-tiers", soldout: false },
    { tier: "Champion Pass", price: "₹549", perks: "Fri, Standing Ticket — Maximum education impact", url: "#ticket-tiers", soldout: false },
  ],
  donate: {
    headline: "Can't attend? Donate directly.",
    body: "Add your Stripe / Razorpay / UPI link in /admin and it goes live instantly.",
    link: "#donate",
    upi: "UPI_TBD",
  },
  venue: {
    name: "The Raft, Koramangala",
    address: "Koramangala, Bengaluru — exact address TBA",
    transport: "Metro / bus / auto to Koramangala. Parking info TBA.",
    accessibility: "Step-free access info TBA. Contact us for assistance.",
    mapEmbed: "",
  },
  faq: [
    { q: "When and where?", a: "23rd October, 2026 at The Raft, Koramangala. Time TBA." },
    { q: "Where does the money go?", a: "To support education for underprivileged children, via Goonj and The Knowledge Corps." },
    { q: "Who is performing?", a: "Student bands — lineup to be announced here and editable live by the team." },
    { q: "Refunds?", a: "Policy TBA — contact the organizers." },
  ],
  sponsors: ["Your logo here — TBA"],
  contact: {
    email: "hello@example.org",
    instagram: "@TBA",
    phone: "TBA",
  },
};

export const EVENT_DATE_ISO = "2026-10-23T18:00:00+05:30";
export const STORAGE_KEY = "raft-fundraiser-content-v1";
