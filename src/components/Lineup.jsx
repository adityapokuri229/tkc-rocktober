export default function Lineup({ lineup }) {
  return (
    <section className="section" id="lineup" aria-labelledby="lineup-h">
      <div className="container">
        <span className="eyebrow">Lineup</span>
        <h2 id="lineup-h">Student bands</h2>
        <p className="lead">Lineup is placeholder — the team can update names, times and photos live from /admin.</p>
        <div className="card-grid">
          {lineup.map((b, i) => (
            <article className="card" key={i}>
              <span className="badge">{b.time || "TBA"}</span>
              <h3>{b.name}</h3>
              <p>{b.blurb}</p>
              {b.image ? <img src={b.image} alt={`${b.name}`} loading="lazy" style={{ borderRadius: 12, marginTop: 10 }} /> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
