export default function Footer({ source }) {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <strong>GOONJ × THE KNOWLEDGE CORPS</strong>
          <div>Fundraiser Concert — The Raft, Koramangala — 23 Oct 2026</div>
          <div>Supporting education for the underprivileged.</div>
        </div>
        <div>
          <div>Content source: {source === "supabase" ? "Supabase live" : "local (add Supabase env to go live)"}</div>
          <div><a href="#top">Back to top ↑</a></div>
        </div>
      </div>
    </footer>
  );
}
