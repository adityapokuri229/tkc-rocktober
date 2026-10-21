import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update, get } from "firebase/database";

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
  settings: {
    title: "MUSIC FOR A CHANGE",
    size: "medium",
    theme: "default",
    showTarget: true,
    hideAmounts: false,
    percentageMode: false,
    barHeight: 28,
    customColor: "",
    squareShadow: true
  },
  updatedAt: new Date().toISOString()
};

const COUNTER_REF = "counter";

// Real-time listener using Firebase WebSockets (sub-50ms latency)
export function subscribeToCounter(callback) {
  const counterRef = ref(rtdb, COUNTER_REF);
  
  const unsubscribe = onValue(counterRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      callback({
        ...defaultState,
        ...data,
        settings: {
          ...defaultState.settings,
          ...(data.settings || {})
        }
      });
    } else {
      // Initialize with default state if empty
      set(counterRef, defaultState).then(() => callback(defaultState));
    }
  }, (error) => {
    console.error("Firebase RTDB subscription error:", error);
  });

  return unsubscribe;
}

// Fetch single snapshot
export async function getCounterState() {
  const counterRef = ref(rtdb, COUNTER_REF);
  const snap = await get(counterRef);
  if (snap.exists()) {
    const data = snap.val();
    return {
      ...defaultState,
      ...data,
      settings: {
        ...defaultState.settings,
        ...(data.settings || {})
      }
    };
  }
  return defaultState;
}

// Update counter state in RTDB
export async function updateCounterInFirebase({ action, delta, goal, raised, settings }) {
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

  await update(counterRef, updates);
  return {
    ...current,
    ...updates
  };
}
