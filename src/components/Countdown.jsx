import { useEffect, useState } from "react";
import { EVENT_DATE_ISO } from "../data/event.js";

function diff(target) {
  const t = new Date(target).getTime() - Date.now();
  const s = Math.max(0, Math.floor(t / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

export default function Countdown() {
  const [t, setT] = useState(() => diff(EVENT_DATE_ISO));
  useEffect(() => {
    const id = setInterval(() => setT(diff(EVENT_DATE_ISO)), 1000);
    return () => clearInterval(id);
  }, []);
  const cells = [
    [t.d, "Days"],
    [t.h, "Hrs"],
    [t.m, "Min"],
    [t.s, "Sec"],
  ];
  return (
    <div className="countdown" role="timer" aria-label="Countdown to concert">
      {cells.map(([v, l]) => (
        <div key={l}><strong>{String(v).padStart(2, "0")}</strong><small>{l}</small></div>
      ))}
    </div>
  );
}
