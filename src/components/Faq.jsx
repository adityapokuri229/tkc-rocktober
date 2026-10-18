export default function Faq({ faq, sponsors, contact }) {
  return (
    <section className="section" id="faq" aria-labelledby="faq-h">
      <div className="container">
        <span className="eyebrow">Good to know</span>
        <h2 id="faq-h">FAQ</h2>
        <div className="faq" style={{ marginTop: 18 }}>
          {faq.map((f, i) => (
            <details key={i} open={i === 0}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
        <div className="card-grid">
          <div className="card dark">
            <h3>Sponsors</h3>
            <ul>{sponsors.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
          <div className="card dark" id="contact">
            <h3>Contact</h3>
            <p>Email: {contact.email}<br />Instagram: {contact.instagram}<br />Phone: {contact.phone}</p>
            <form onSubmit={(e) => { e.preventDefault(); alert("Thanks! We'll be in touch. (Connect this to your email service later.)"); }}>
              <label className="field"><span style={{ fontSize: 12, fontWeight: 800 }}>Get updates</span>
                <input type="email" required placeholder="you@example.com" aria-label="Email for updates" />
              </label>
              <button className="btn btn-yellow btn-small" type="submit">Notify me</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
