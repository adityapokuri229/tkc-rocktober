// Live counter client sync utility (combines Netlify Function API + BroadcastChannel + LocalStorage)
const STORAGE_KEY = "tkc_donation_counter_v2";

const defaultState = {
  goal: 150000,
  raised: 77000,
  settings: {
    title: "MUSIC FOR A CHANGE",
    size: "medium", // compact, medium, large, huge
    theme: "default", // default, amber-gold, neon-cyan, retro-orange, monochrome
    hideAmounts: false,
    percentageMode: false,
    barHeight: 28,
    customColor: "",
    squareShadow: true
  },
  updatedAt: new Date().toISOString(),
  history: [
    { action: "init", delta: 77000, resultingTotal: 77000, timestamp: new Date().toISOString(), note: "Kickoff" }
  ]
};

export function getLocalState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      settings: {
        ...defaultState.settings,
        ...(parsed.settings || {})
      }
    };
  } catch {
    return defaultState;
  }
}

export function saveLocalState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export async function fetchLiveState() {
  try {
    const res = await fetch(`/api/counter?_t=${Date.now()}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache"
      }
    });
    if (res.ok) {
      const data = await res.json();
      saveLocalState(data);
      return data;
    }
  } catch (e) {
    // offline or local-only fallback
  }
  return getLocalState();
}

export async function updateLiveState({ action, delta, goal, raised, settings, note }) {
  let updated;
  try {
    const res = await fetch("/api/counter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, delta, goal, raised, settings, note })
    });
    if (res.ok) {
      updated = await res.json();
    }
  } catch (e) {
    console.warn("API update failed, updating locally", e);
  }

  if (!updated) {
    const cur = getLocalState();
    let newRaised = cur.raised;
    if (typeof raised === "number") newRaised = raised;
    if (action === "add") newRaised += Number(delta) || 0;
    if (action === "subtract") newRaised = Math.max(0, newRaised - (Number(delta) || 0));
    if (action === "set") newRaised = Number(delta) || 0;

    updated = {
      ...cur,
      goal: typeof goal === "number" ? goal : cur.goal,
      raised: newRaised,
      settings: settings ? { ...cur.settings, ...settings } : cur.settings,
      updatedAt: new Date().toISOString(),
      history: [
        {
          action: action || "edit",
          delta: Number(delta) || 0,
          resultingTotal: newRaised,
          timestamp: new Date().toISOString(),
          note: note || ""
        },
        ...(cur.history || [])
      ].slice(0, 50)
    };
  }

  saveLocalState(updated);

  // Dispatch BroadcastChannel and Window event so tabs update in real time
  try {
    if (typeof BroadcastChannel !== "undefined") {
      const bc = new BroadcastChannel("donation_counter_channel");
      bc.postMessage(updated);
      bc.close();
    }
  } catch {}

  window.dispatchEvent(new CustomEvent("donation_counter_updated", { detail: updated }));
  return updated;
}
