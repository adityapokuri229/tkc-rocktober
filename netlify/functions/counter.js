// Netlify serverless function acting as in-memory / state store for live sync across devices
let memoryStore = {
  goal: 150000,
  raised: 77000,
  settings: {
    title: "MUSIC FOR A CHANGE",
    size: "medium", // compact, medium, large, huge
    theme: "default", // default (purple/yellow/teal), amber-gold, neon-cyan, retro-orange, monochrome
    hideAmounts: false,
    percentageMode: false,
    barHeight: 28,
    customColor: "",
    squareShadow: true
  },
  updatedAt: new Date().toISOString(),
  history: [
    { action: 'init', delta: 77000, resultingTotal: 77000, timestamp: new Date().toISOString(), note: 'Concert kickoff' }
  ]
};

export default async (req, context) => {
  const origin = req.headers.get("origin") || "*";
  const headers = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
    "Pragma": "no-cache"
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (req.method === "GET") {
    return new Response(JSON.stringify(memoryStore), { status: 200, headers });
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      if (typeof body.raised === "number") {
        memoryStore.raised = Math.max(0, body.raised);
      }
      if (typeof body.goal === "number") {
        memoryStore.goal = Math.max(1, body.goal);
      }
      if (body.settings && typeof body.settings === "object") {
        memoryStore.settings = {
          ...memoryStore.settings,
          ...body.settings
        };
      }
      if (body.action) {
        const delta = Number(body.delta) || 0;
        if (body.action === 'add') {
          memoryStore.raised += delta;
        } else if (body.action === 'subtract') {
          memoryStore.raised = Math.max(0, memoryStore.raised - delta);
        } else if (body.action === 'set') {
          memoryStore.raised = Math.max(0, delta);
        }
        memoryStore.history.unshift({
          action: body.action,
          delta,
          resultingTotal: memoryStore.raised,
          timestamp: new Date().toISOString(),
          note: body.note || ''
        });
        if (memoryStore.history.length > 50) memoryStore.history.pop();
      }
      memoryStore.updatedAt = new Date().toISOString();
      return new Response(JSON.stringify(memoryStore), { status: 200, headers });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 400, headers });
    }
  }

  return new Response("Method Not Allowed", { status: 405, headers });
};

export const config = {
  path: "/api/counter"
};
