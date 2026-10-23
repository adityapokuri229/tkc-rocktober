import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update, get, push, remove } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDWEb5nvzeziaTjMP6rQU8GTyZGDeSMxqw",
  authDomain: "donation-tracker-ce3dc.firebaseapp.com",
  databaseURL: "https://donation-tracker-ce3dc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "donation-tracker-ce3dc",
  storageBucket: "donation-tracker-ce3dc.firebasestorage.app",
  messagingSenderId: "46609637998",
  appId: "1:46609637998:web:b45c165107041581343c7f",
  measurementId: "G-3N2Z9LKKZE"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const rtdb = getDatabase(app);

export const defaultState = {
  goal: 150000,
  raised: 77000,
  activePane: "counter", // 'counter' | 'media' | 'custom'
  selectedMediaId: null,
  customText: {
    heading: "WELCOME TO THE CONCERT",
    subheading: "Support education for the underprivileged",
    body: "Scan the QR code on your table to donate.",
    size: "medium", // 'compact' | 'medium' | 'large' | 'huge'
    style: "highlight", // 'highlight' | 'minimal' | 'banner'
    transparentBg: false
  },
  audioFx: {
    enabled: true,
    mode: "full", // 'full' | 'spectrum' | 'pulse' | 'wave' | 'particles' | 'matrix' | 'tunnel'
    sensitivity: 1.2,
    reactiveCard: true,
    simulateBeat: false,
    colorPalette: "chromatic", // 'chromatic' | 'cyberpunk' | 'sunset' | 'emerald' | 'monochrome'
    wavePosition: "center", // 'center' | 'bottom' | 'hidden'
    intensity: "high", // 'low' | 'medium' | 'high'
    hiHatConfetti: true,
    easterEgg: null // null | 'confetti' | 'rockhand' | 'moshpit'
  },
  settings: {
    title: "MUSIC FOR A CHANGE",
    size: "medium",
    theme: "default",
    showTarget: true,
    bigPercentage: false,
    hideAmounts: false,
    percentageMode: false,
    barHeight: 28,
    customColor: "",
    squareShadow: true
  },
  hud: {
    showText: true,
    layout: {
      counter: { x: 50, y: 70 },
      customText: { x: 50, y: 30 },
      media: { x: 50, y: 50 },
      bigPct: { x: 12, y: 15 }
    }
  },
  updatedAt: new Date().toISOString()
};

const COUNTER_REF = "counter";
const MEDIA_REF = "mediaItems";

// Real-time listener for screen state
export function subscribeToCounter(callback) {
  const counterRef = ref(rtdb, COUNTER_REF);
  
  const unsubscribe = onValue(counterRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      callback({
        ...defaultState,
        ...data,
        customText: {
          ...defaultState.customText,
          ...(data.customText || {})
        },
        audioFx: {
          ...defaultState.audioFx,
          ...(data.audioFx || {})
        },
        settings: {
          ...defaultState.settings,
          ...(data.settings || {})
        }
      });
    } else {
      set(counterRef, defaultState).then(() => callback(defaultState));
    }
  }, (error) => {
    console.error("Firebase RTDB subscription error:", error);
  });

  return unsubscribe;
}

// Real-time listener for media library
export function subscribeToMedia(callback) {
  const mediaRef = ref(rtdb, MEDIA_REF);
  return onValue(mediaRef, (snapshot) => {
    if (snapshot.exists()) {
      const val = snapshot.val();
      const list = Object.entries(val).map(([id, item]) => ({
        id,
        ...item
      }));
      callback(list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    } else {
      callback([]);
    }
  });
}

// Add media item to RTDB library
export async function addMediaItem({ name, type, dataUrl, url }) {
  const mediaRef = ref(rtdb, MEDIA_REF);
  const newItemRef = push(mediaRef);
  const item = {
    name: name || "Uploaded media",
    type: type || "image",
    url: dataUrl || url || "",
    createdAt: Date.now()
  };
  await set(newItemRef, item);
  return { id: newItemRef.key, ...item };
}

// Remove media item
export async function deleteMediaItem(id) {
  const itemRef = ref(rtdb, `${MEDIA_REF}/${id}`);
  await remove(itemRef);
}

// Switch active display pane
export async function setActivePane(pane, selectedMediaId = null) {
  const counterRef = ref(rtdb, COUNTER_REF);
  const updates = {
    activePane: pane,
    updatedAt: new Date().toISOString()
  };
  if (selectedMediaId !== undefined) {
    updates.selectedMediaId = selectedMediaId;
  }
  await update(counterRef, updates);
}

// Update custom text pane
export async function updateCustomText(customText) {
  const counterRef = ref(rtdb, COUNTER_REF);
  const snap = await get(counterRef);
  const current = snap.exists() ? snap.val() : defaultState;
  const updates = {
    customText: {
      ...(current.customText || defaultState.customText),
      ...customText
    },
    updatedAt: new Date().toISOString()
  };
  await update(counterRef, updates);
}

// Update audio FX settings
export async function updateAudioFx(audioFx) {
  const counterRef = ref(rtdb, COUNTER_REF);
  const snap = await get(counterRef);
  const current = snap.exists() ? snap.val() : defaultState;
  const updates = {
    audioFx: {
      ...(current.audioFx || defaultState.audioFx),
      ...audioFx
    },
    updatedAt: new Date().toISOString()
  };
  await update(counterRef, updates);
  return { ...current, ...updates };
}

// Trigger temporary Easter Egg effect (auto-resets after duration)
export async function triggerEasterEgg(eggName) {
  await updateAudioFx({ easterEgg: eggName });
  setTimeout(() => {
    updateAudioFx({ easterEgg: null }).catch(() => {});
  }, 6000);
}

// Update HUD configuration in RTDB
export async function updateHud(hudUpdates) {
  const counterRef = ref(rtdb, COUNTER_REF);
  const snap = await get(counterRef);
  const current = snap.exists() ? snap.val() : defaultState;
  const newHud = { ...(current.hud || defaultState.hud), ...hudUpdates };
  await update(counterRef, { hud: newHud, updatedAt: new Date().toISOString() });
  return newHud;
}

// Update counter state in RTDB
export async function updateCounterInFirebase({ action, delta, goal, raised, settings, activePane, selectedMediaId, customText, audioFx }) {
  const counterRef = ref(rtdb, COUNTER_REF);
  const snap = await get(counterRef);
  const current = snap.exists() ? snap.val() : defaultState;

  let newRaised = current.raised || 0;
  if (typeof raised === "number") newRaised = raised;
  if (action === "add") newRaised += Number(delta) || 0;
  if (action === "subtract") newRaised = Math.max(0, newRaised - (Number(delta) || 0));
  if (action === "set") newRaised = Math.max(0, Number(delta) || 0);

  const updates = {
    raised: newRaised,
    goal: typeof goal === "number" ? Math.max(1, goal) : (current.goal || 150000),
    settings: settings ? { ...(current.settings || defaultState.settings), ...settings } : (current.settings || defaultState.settings),
    updatedAt: new Date().toISOString()
  };

  if (activePane) updates.activePane = activePane;
  if (selectedMediaId !== undefined) updates.selectedMediaId = selectedMediaId;
  if (customText) updates.customText = { ...(current.customText || defaultState.customText), ...customText };
  if (audioFx) updates.audioFx = { ...(current.audioFx || defaultState.audioFx), ...audioFx };

  await update(counterRef, updates);
  return {
    ...current,
    ...updates
  };
}
