export default function Venue({ venue }) {
  return (
    <div className="section-light">
      <section className="section" id="venue" aria-labelledby="venue-h">
        <div className="container">
          <span className="eyebrow">Venue</span>
          <h2 id="venue-h">{venue.name}</h2>
          <p className="lead">{venue.address}</p>
          <div className="card-grid">
            <div className="card"><h3>Getting there</h3><p>{venue.transport}</p></div>
            <div className="card"><h3>Accessibility</h3><p>{venue.accessibility}</p></div>
          </div>
        </div>
      </section>
    </div>
  );
}
