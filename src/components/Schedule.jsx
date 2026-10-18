export default function Schedule({ schedule }) {
  return (
    <div className="section-light">
      <section className="section" id="schedule" aria-labelledby="sched-h">
        <div className="container">
          <span className="eyebrow">23rd October 2026</span>
          <h2 id="sched-h">Schedule</h2>
          <div className="timeline">
            {schedule.map((s, i) => (
              <div className="timeline-item" key={i}>
                <time>{s.time}</time>
                <div><strong>{s.title}</strong><div>{s.desc}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
