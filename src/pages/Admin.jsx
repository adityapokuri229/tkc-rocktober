import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  subscribeToCounter,
  subscribeToMedia,
  updateCounterInFirebase,
  setActivePane,
  addMediaItem,
  deleteMediaItem,
  updateCustomText,
  defaultState
} from "../lib/firebase.js";

const SIZES = [
  { id: "compact", name: "Compact" },
  { id: "medium", name: "Medium" },
  { id: "large", name: "Large" },
  { id: "huge", name: "Huge" }
];

export default function Admin() {
  // ─── 4-DIGIT PASSWORD STATE (Session-only: persists until refresh) ───
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  // Counter & Display Data
  const [counter, setCounter] = useState(defaultState);
  const [mediaItems, setMediaItems] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [mediaUrlInput, setMediaUrlInput] = useState("");
  const [mediaTypeInput, setMediaTypeInput] = useState("image");

  // Inputs for Counter
  const [addAmount, setAddAmount] = useState("");
  const [subtractAmount, setSubtractAmount] = useState("");
  const [targetGoalInput, setTargetGoalInput] = useState("");
  const [currentAmountInput, setCurrentAmountInput] = useState("");
  const [titleInput, setTitleInput] = useState("");

  // Inputs for Custom Text Pane
  const [headingInput, setHeadingInput] = useState("");
  const [subheadingInput, setSubheadingInput] = useState("");
  const [bodyInput, setBodyInput] = useState("");

  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const unsubCounter = subscribeToCounter((data) => {
      if (data) {
        setCounter(data);
        setTargetGoalInput((prev) => (prev === "" ? data.goal : prev));
        setCurrentAmountInput((prev) => (prev === "" ? data.raised : prev));
        setTitleInput((prev) => (prev === "" ? (data.settings?.title || "MUSIC FOR A CHANGE") : prev));
        if (data.customText) {
          setHeadingInput((prev) => (prev === "" ? (data.customText.heading || "") : prev));
          setSubheadingInput((prev) => (prev === "" ? (data.customText.subheading || "") : prev));
          setBodyInput((prev) => (prev === "" ? (data.customText.body || "") : prev));
        }
      }
    });

    const unsubMedia = subscribeToMedia((items) => {
      setMediaItems(items || []);
    });

    return () => {
      unsubCounter();
      unsubMedia();
    };
  }, []);

  const handleKeypadPress = (val) => {
    setPinError("");
    if (val === "clear") {
      setPin("");
      return;
    }
    if (val === "backspace") {
      setPin((prev) => prev.slice(0, -1));
      return;
    }
    if (pin.length >= 4) return;
    const nextPin = pin + val;
    setPin(nextPin);
    if (nextPin.length === 4) {
      if (nextPin === "1947") {
        setTimeout(() => {
          setIsAuthenticated(true);
          setPin("");
          setPinError("");
        }, 150);
      } else {
        setTimeout(() => {
          setPinError("Incorrect PIN. Please try again.");
          setPin("");
        }, 200);
      }
    }
  };

  const showFeedback = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 3000);
  };

  // ─── PANE SWITCHING ───
  const handleSelectPane = async (pane, mediaId = null) => {
    setLoading(true);
    await setActivePane(pane, mediaId);
    setLoading(false);
    showFeedback(`Switched screen to ${pane.toUpperCase()} pane!`);
  };

  // ─── MEDIA UPLOAD (DRAG & DROP / FILE INPUT) ───
  const processFile = (file) => {
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isImage && !isVideo) {
      showFeedback("Please upload an image or video file.");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const dataUrl = e.target.result;
        const newItem = await addMediaItem({
          name: file.name,
          type: isVideo ? "video" : "image",
          dataUrl
        });
        setUploading(false);
        showFeedback(`Uploaded "${file.name}" to media library!`);
        if (counter.activePane === "media") {
          await setActivePane("media", newItem.id);
        }
      } catch (err) {
        setUploading(false);
        showFeedback("Failed to process file.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer?.files?.[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleAddMediaUrl = async (e) => {
    e?.preventDefault();
    if (!mediaUrlInput.trim()) return;
    setLoading(true);
    const newItem = await addMediaItem({
      name: mediaUrlInput.split("/").pop() || "Web Media",
      type: mediaTypeInput,
      url: mediaUrlInput.trim()
    });
    setMediaUrlInput("");
    setLoading(false);
    showFeedback("Added media link to library!");
    if (counter.activePane === "media") {
      await setActivePane("media", newItem.id);
    }
  };

  const handleDeleteMedia = async (id, e) => {
    e?.stopPropagation();
    await deleteMediaItem(id);
    showFeedback("Removed item from library.");
  };

  // ─── CUSTOM TEXT SUBMIT ───
  const handleSaveCustomText = async (e) => {
    e?.preventDefault();
    setLoading(true);
    await updateCustomText({
      heading: headingInput,
      subheading: subheadingInput,
      body: bodyInput
    });
    setLoading(false);
    showFeedback("Custom text updated live!");
  };

  // ─── COUNTER CONTROLS ───
  const handleUpdateSettings = async (patch) => {
    setLoading(true);
    const newSettings = {
      ...(counter.settings || {}),
      ...patch
    };
    const updated = await updateCounterInFirebase({
      settings: newSettings
    });
    setCounter(updated);
    setLoading(false);
    showFeedback("Setting applied live!");
  };

  const handleAdd = async (e) => {
    e?.preventDefault();
    const val = Number(addAmount);
    if (!val || val <= 0) return;
    setLoading(true);
    const updated = await updateCounterInFirebase({
      action: "add",
      delta: val
    });
    setCounter(updated);
    setCurrentAmountInput(updated.raised);
    setAddAmount("");
    setLoading(false);
    showFeedback(`+₹${val.toLocaleString("en-IN")} added!`);
  };

  const handleSubtract = async (e) => {
    e?.preventDefault();
    const val = Number(subtractAmount);
    if (!val || val <= 0) return;
    setLoading(true);
    const updated = await updateCounterInFirebase({
      action: "subtract",
      delta: val
    });
    setCounter(updated);
    setCurrentAmountInput(updated.raised);
    setSubtractAmount("");
    setLoading(false);
    showFeedback(`-₹${val.toLocaleString("en-IN")} subtracted!`);
  };

  const handleSetCurrent = async (e) => {
    e?.preventDefault();
    const val = Number(currentAmountInput);
    if (isNaN(val) || val < 0) return;
    setLoading(true);
    const updated = await updateCounterInFirebase({
      action: "set",
      delta: val
    });
    setCounter(updated);
    setLoading(false);
    showFeedback(`Current collections total set to ₹${val.toLocaleString("en-IN")}.`);
  };

  const handleSetGoal = async (e) => {
    e?.preventDefault();
    const val = Number(targetGoalInput);
    if (!val || val <= 0) return;
    setLoading(true);
    const updated = await updateCounterInFirebase({
      goal: val
    });
    setCounter(updated);
    setLoading(false);
    showFeedback(`Target goal updated to ₹${val.toLocaleString("en-IN")}.`);
  };

  const handleSaveTitle = async (e) => {
    e?.preventDefault();
    await handleUpdateSettings({ title: titleInput });
  };

  // ─── 1. PASSWORD GATE WITH NUMERIC KEYPAD ───
  if (!isAuthenticated) {
    return (
      <div className="bg-surface font-body-md text-on-surface min-h-screen flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-xs bg-surface-container p-5 sm:p-8 shadow-[6px_6px_0px_#100e09] border border-outline-variant/30 text-center">
          <div className="w-12 h-12 bg-surface-container-highest border border-secondary text-secondary font-headline-lg flex items-center justify-center mx-auto mb-3 font-bold text-xl">
            🔒
          </div>
          <h2 className="font-headline-md text-lg uppercase tracking-tight text-on-surface mb-1 font-bold">
            ADMIN ACCESS
          </h2>
          <p className="font-label-sm text-[11px] text-outline uppercase mb-4">
            Enter 4-digit PIN on keypad
          </p>

          {/* PIN Indicators */}
          <div className="flex justify-center gap-3 mb-4">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-4 h-4 border transition-all ${
                  pin.length > idx
                    ? "bg-secondary border-secondary scale-110 shadow-[2px_2px_0px_#100e09]"
                    : "bg-surface-container-lowest border-outline-variant/50"
                }`}
              />
            ))}
          </div>

          {pinError && (
            <div className="font-label-sm text-xs text-[#ffb4ab] font-bold mb-3">
              {pinError}
            </div>
          )}

          {/* Interactive Numeric Keypad (48px touch targets for mobile) */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "backspace"].map((k) => {
              if (k === "clear") {
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleKeypadPress("clear")}
                    className="min-h-[48px] bg-surface-container-lowest hover:bg-surface-container-highest border border-outline-variant/30 text-outline hover:text-on-surface font-label-md text-xs uppercase font-bold py-3 transition-colors active:scale-95 touch-manipulation"
                  >
                    CLR
                  </button>
                );
              }
              if (k === "backspace") {
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleKeypadPress("backspace")}
                    className="min-h-[48px] bg-surface-container-lowest hover:bg-surface-container-highest border border-outline-variant/30 text-outline hover:text-on-surface font-label-md text-base font-bold py-3 transition-colors active:scale-95 touch-manipulation"
                  >
                    ⌫
                  </button>
                );
              }
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleKeypadPress(k)}
                  className="min-h-[48px] bg-surface-container-lowest hover:bg-secondary hover:text-on-secondary border border-outline-variant/40 text-on-surface font-headline-md text-xl font-bold py-3 transition-colors active:scale-95 shadow-[2px_2px_0px_#100e09] touch-manipulation"
                >
                  {k}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-outline-variant/20">
            <Link
              to="/"
              className="font-label-sm text-xs uppercase text-outline hover:text-secondary hover:underline inline-block py-2"
            >
              ← Back to Live Display Screen
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── 2. AUTHENTICATED ADMIN CONSOLE (MOBILE-OPTIMIZED) ───
  const activePane = counter.activePane || "counter";
  const raised = Number(counter.raised || 0);
  const goal = Number(counter.goal || 150000);
  const pct = goal ? Math.min(100, Math.max(0, (raised / goal) * 100)) : 0;
  const settings = counter.settings || {};

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between selection:bg-secondary-container selection:text-on-secondary-container p-3 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        {/* Navigation & Status */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/20">
          <Link
            to="/"
            target="_blank"
            className="font-label-md text-xs uppercase tracking-wider text-secondary hover:underline flex items-center gap-1 font-bold py-1"
          >
            ↗ Open Display (TV)
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="font-label-sm text-[11px] sm:text-xs uppercase tracking-widest text-secondary font-bold">
                LIVE
              </span>
            </div>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="bg-surface-container-highest text-outline hover:text-on-surface px-2.5 py-1 text-xs font-label-sm uppercase font-bold border border-outline-variant/30 min-h-[34px] touch-manipulation"
              title="Lock Console"
            >
              Lock 🔒
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {statusMsg && (
          <div className="bg-surface-container border border-secondary p-3 mb-4 shadow-[3px_3px_0px_#100e09] flex items-center gap-2 text-xs sm:text-sm font-bold text-on-surface animate-fade-in">
            <span className="text-secondary">✦</span>
            <span>{statusMsg}</span>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            PANE SELECTOR TABS (What Displays on TV Screen)
           ═══════════════════════════════════════════════════════════════ */}
        <div className="bg-surface-container p-3 sm:p-4 shadow-[4px_4px_0px_#100e09] border border-outline-variant/30 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
            <div className="font-label-md text-xs uppercase text-secondary font-bold tracking-wider">
              ✦ ACTIVE TV SCREEN PANE
            </div>
            <span className="font-label-sm text-[10px] sm:text-xs text-outline uppercase">
              Tap any pane to switch screen instantly
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* 1. Donation Counter */}
            <button
              type="button"
              onClick={() => handleSelectPane("counter")}
              className={`p-3 sm:p-4 text-left border transition-all touch-manipulation ${
                activePane === "counter"
                  ? "bg-secondary text-on-secondary border-secondary shadow-[3px_3px_0px_#100e09]"
                  : "bg-surface-container-lowest text-on-surface border-outline-variant/40 hover:border-secondary"
              }`}
            >
              <div className="font-label-md text-xs uppercase font-extrabold flex items-center justify-between mb-1">
                <span>1. COUNTER PANE</span>
                {activePane === "counter" && <span className="bg-black/30 px-1 py-0.5 rounded text-[10px]">● ON TV</span>}
              </div>
              <p className={`font-body-sm text-[11px] sm:text-xs ${activePane === "counter" ? "text-on-secondary/80" : "text-outline"}`}>
                Live collections tally &amp; square progress bar.
              </p>
            </button>

            {/* 2. Media Pane (Image/Video) */}
            <button
              type="button"
              onClick={() => handleSelectPane("media", counter.selectedMediaId || mediaItems[0]?.id)}
              className={`p-3 sm:p-4 text-left border transition-all touch-manipulation ${
                activePane === "media"
                  ? "bg-secondary text-on-secondary border-secondary shadow-[3px_3px_0px_#100e09]"
                  : "bg-surface-container-lowest text-on-surface border-outline-variant/40 hover:border-secondary"
              }`}
            >
              <div className="font-label-md text-xs uppercase font-extrabold flex items-center justify-between mb-1">
                <span>2. MEDIA PANE</span>
                {activePane === "media" && <span className="bg-black/30 px-1 py-0.5 rounded text-[10px]">● ON TV</span>}
              </div>
              <p className={`font-body-sm text-[11px] sm:text-xs ${activePane === "media" ? "text-on-secondary/80" : "text-outline"}`}>
                Full-size posters, QR codes, band photos, or videos.
              </p>
            </button>

            {/* 3. Custom Text Pane */}
            <button
              type="button"
              onClick={() => handleSelectPane("custom")}
              className={`p-3 sm:p-4 text-left border transition-all touch-manipulation ${
                activePane === "custom"
                  ? "bg-secondary text-on-secondary border-secondary shadow-[3px_3px_0px_#100e09]"
                  : "bg-surface-container-lowest text-on-surface border-outline-variant/40 hover:border-secondary"
              }`}
            >
              <div className="font-label-md text-xs uppercase font-extrabold flex items-center justify-between mb-1">
                <span>3. CUSTOM TEXT</span>
                {activePane === "custom" && <span className="bg-black/30 px-1 py-0.5 rounded text-[10px]">● ON TV</span>}
              </div>
              <p className={`font-body-sm text-[11px] sm:text-xs ${activePane === "custom" ? "text-on-secondary/80" : "text-outline"}`}>
                Custom announcements, slides, or shoutouts.
              </p>
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION A: DONATION COUNTER CONTROLS
           ═══════════════════════════════════════════════════════════════ */}
        <div className="bg-surface-container p-4 sm:p-6 shadow-[4px_4px_0px_#100e09] border border-outline-variant/30 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-headline-md text-base sm:text-lg uppercase tracking-tight text-on-surface font-bold">
              Donation Counter Controls
            </h3>
            {activePane === "counter" && (
              <span className="bg-secondary text-on-secondary font-label-sm text-[10px] sm:text-xs px-2 py-0.5 font-bold uppercase">
                Active on TV
              </span>
            )}
          </div>

          {/* Square Thermometer Tally Card Preview */}
          <div className="bg-surface-container-lowest p-3 sm:p-4 shadow-[3px_3px_0px_#100e09] border border-outline-variant/30 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-label-md text-xs uppercase text-on-surface font-bold">CROWDFUND PROGRESS</span>
                <span className="bg-secondary-container text-on-secondary font-label-sm text-xs px-2 py-0.5 font-bold">
                  {pct.toFixed(1)}% REACHED
                </span>
              </div>
              <div className="font-label-md text-xs sm:text-sm text-secondary tracking-wider font-bold">
                ₹{raised.toLocaleString("en-IN")} RAISED
              </div>
            </div>

            {/* Meter Bar */}
            <div className="w-full h-5 sm:h-6 bg-surface-container p-1 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-secondary to-tertiary transition-all duration-500 ease-out"
                style={{ width: `${pct}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center mt-2 font-label-sm text-[10px] sm:text-xs text-outline uppercase">
              <span>Target: ₹{goal.toLocaleString("en-IN")}</span>
              <span>Remaining: ₹{Math.max(0, goal - raised).toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Add / Subtract Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {/* Add Amount */}
            <div className="bg-surface-container-lowest p-3.5 border border-outline-variant/30">
              <div className="font-label-md text-xs uppercase text-secondary font-bold mb-2">
                + Add Amount (₹)
              </div>
              <form onSubmit={handleAdd} className="flex gap-2 mb-2.5">
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  placeholder="Amount to add..."
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className="flex-1 bg-surface border border-outline-variant/40 px-3 py-2.5 text-on-surface font-label-md text-base outline-none focus:border-secondary min-h-[44px]"
                />
                <button
                  type="submit"
                  disabled={loading || !addAmount}
                  className="bg-secondary text-on-secondary font-label-md uppercase font-bold px-4 py-2.5 hover:bg-secondary-fixed transition-colors disabled:opacity-50 min-h-[44px] touch-manipulation"
                >
                  + Add
                </button>
              </form>
              <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1.5">
                {[349, 449, 549, 1000, 2500, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => updateCounterInFirebase({ action: "add", delta: amt }).then((u) => { setCounter(u); showFeedback(`+₹${amt} added!`); })}
                    className="min-h-[40px] bg-surface-container-highest hover:bg-secondary hover:text-on-secondary text-on-surface font-label-sm text-xs px-2.5 py-1.5 transition-colors font-bold border border-outline-variant/20 touch-manipulation active:scale-95 text-center"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Subtract Amount */}
            <div className="bg-surface-container-lowest p-3.5 border border-outline-variant/30">
              <div className="font-label-md text-xs uppercase text-tertiary font-bold mb-2">
                - Subtract / Deduct (₹)
              </div>
              <form onSubmit={handleSubtract} className="flex gap-2 mb-2.5">
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  placeholder="Amount to deduct..."
                  value={subtractAmount}
                  onChange={(e) => setSubtractAmount(e.target.value)}
                  className="flex-1 bg-surface border border-outline-variant/40 px-3 py-2.5 text-on-surface font-label-md text-base outline-none focus:border-tertiary min-h-[44px]"
                />
                <button
                  type="submit"
                  disabled={loading || !subtractAmount}
                  className="bg-tertiary text-on-tertiary font-label-md uppercase font-bold px-4 py-2.5 hover:bg-tertiary-fixed transition-colors disabled:opacity-50 min-h-[44px] touch-manipulation"
                >
                  - Deduct
                </button>
              </form>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5">
                {[349, 549, 1000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => updateCounterInFirebase({ action: "subtract", delta: amt }).then((u) => { setCounter(u); showFeedback(`-₹${amt} deducted!`); })}
                    disabled={raised < amt}
                    className="min-h-[40px] bg-surface-container-highest hover:bg-tertiary hover:text-on-tertiary text-tertiary font-label-sm text-xs px-2.5 py-1.5 transition-colors font-bold border border-tertiary/20 disabled:opacity-30 touch-manipulation active:scale-95 text-center"
                  >
                    -₹{amt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Direct Overrides */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <form onSubmit={handleSetCurrent} className="flex flex-col gap-1.5 bg-surface-container-lowest p-3 border border-outline-variant/30">
              <label className="font-label-sm text-xs text-outline uppercase font-bold">
                Set Current Total (₹)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={currentAmountInput}
                  onChange={(e) => setCurrentAmountInput(e.target.value)}
                  className="flex-1 bg-surface border border-outline-variant/40 px-3 py-2 text-on-surface font-label-md text-base outline-none focus:border-primary min-h-[42px]"
                />
                <button
                  type="submit"
                  className="bg-surface-container-highest hover:bg-primary hover:text-on-primary text-primary font-label-md uppercase text-xs px-3 py-2 font-bold border border-primary/30 min-h-[42px] touch-manipulation"
                >
                  Set Total
                </button>
              </div>
            </form>

            <form onSubmit={handleSetGoal} className="flex flex-col gap-1.5 bg-surface-container-lowest p-3 border border-outline-variant/30">
              <label className="font-label-sm text-xs text-outline uppercase font-bold">
                Final Target Goal (₹)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  value={targetGoalInput}
                  onChange={(e) => setTargetGoalInput(e.target.value)}
                  className="flex-1 bg-surface border border-outline-variant/40 px-3 py-2 text-on-surface font-label-md text-base outline-none focus:border-primary min-h-[42px]"
                />
                <button
                  type="submit"
                  className="bg-primary text-on-primary font-label-md uppercase text-xs px-3 py-2 font-bold hover:bg-primary-fixed min-h-[42px] touch-manipulation"
                >
                  Set Goal
                </button>
              </div>
            </form>
          </div>

          {/* ─── SIZE OPTIONS FOR DONATION PANE (TOUCH OPTIMIZED) ─── */}
          <div className="mb-4 bg-surface-container-lowest p-3.5 border border-outline-variant/30">
            <div className="flex items-center justify-between mb-2">
              <label className="block font-label-sm text-xs text-outline uppercase font-bold">
                Screen Size (TV / Projector Scaling)
              </label>
              <span className="font-label-sm text-xs text-secondary font-bold uppercase">
                Active: {settings.size || "medium"}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SIZES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleUpdateSettings({ size: s.id })}
                  className={`min-h-[44px] py-2 px-3 font-label-md text-xs uppercase font-bold border transition-colors touch-manipulation active:scale-95 ${
                    (settings.size || "medium") === s.id
                      ? "bg-secondary text-on-secondary border-secondary shadow-[2px_2px_0px_#100e09]"
                      : "bg-surface text-on-surface border-outline-variant/40 hover:border-secondary"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Heading & Toggles */}
          <div className="border-t border-outline-variant/20 pt-4">
            <form onSubmit={handleSaveTitle} className="mb-3">
              <label className="block font-label-sm text-xs text-outline uppercase font-bold mb-1">
                Heading Title
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="e.g. MUSIC FOR A CHANGE"
                  className="flex-1 bg-surface-container-lowest border border-outline-variant/40 px-3 py-2 text-on-surface font-label-md text-sm outline-none focus:border-secondary min-h-[42px]"
                />
                <button
                  type="submit"
                  className="bg-surface-container-highest hover:bg-secondary hover:text-on-secondary text-secondary font-label-md uppercase text-xs px-4 py-2 font-bold border border-secondary/30 min-h-[42px] touch-manipulation"
                >
                  Save
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label className="flex items-center gap-3 bg-surface-container-lowest p-3 border border-outline-variant/30 cursor-pointer min-h-[48px] touch-manipulation">
                <input
                  type="checkbox"
                  checked={settings.showTarget !== false}
                  onChange={(e) => handleUpdateSettings({ showTarget: e.target.checked })}
                  className="w-5 h-5 accent-[#5dd9d0]"
                />
                <div>
                  <div className="font-label-md text-xs uppercase font-bold text-on-surface">Show Target</div>
                  <div className="font-body-sm text-[11px] text-on-surface-variant">Display target &amp; remaining</div>
                </div>
              </label>

              <label className="flex items-center gap-3 bg-surface-container-lowest p-3 border border-outline-variant/30 cursor-pointer min-h-[48px] touch-manipulation">
                <input
                  type="checkbox"
                  checked={!!settings.percentageMode}
                  onChange={(e) => handleUpdateSettings({ percentageMode: e.target.checked })}
                  className="w-5 h-5 accent-[#5dd9d0]"
                />
                <div>
                  <div className="font-label-md text-xs uppercase font-bold text-on-surface">Percentage Mode</div>
                  <div className="font-body-sm text-[11px] text-on-surface-variant">Display % instead of currency</div>
                </div>
              </label>

              <label className="flex items-center gap-3 bg-surface-container-lowest p-3 border border-outline-variant/30 cursor-pointer min-h-[48px] touch-manipulation">
                <input
                  type="checkbox"
                  checked={!!settings.hideAmounts}
                  onChange={(e) => handleUpdateSettings({ hideAmounts: e.target.checked })}
                  className="w-5 h-5 accent-[#5dd9d0]"
                />
                <div>
                  <div className="font-label-md text-xs uppercase font-bold text-on-surface">Hide Amounts</div>
                  <div className="font-body-sm text-[11px] text-on-surface-variant">Hide figures from screen</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION B: MEDIA PANE CONTROLS & UPLOAD (MOBILE FILE SELECTOR)
           ═══════════════════════════════════════════════════════════════ */}
        <div className="bg-surface-container p-4 sm:p-6 shadow-[4px_4px_0px_#100e09] border border-outline-variant/30 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-headline-md text-base sm:text-lg uppercase tracking-tight text-on-surface font-bold">
              Media Pane: Images &amp; Videos (Full Size on TV)
            </h3>
            {activePane === "media" && (
              <span className="bg-secondary text-on-secondary font-label-sm text-[10px] sm:text-xs px-2 py-0.5 font-bold uppercase">
                Active on TV
              </span>
            )}
          </div>

          {/* Tap-to-Upload / Drag Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-outline-variant/60 hover:border-secondary p-6 sm:p-8 text-center cursor-pointer bg-surface-container-lowest transition-colors mb-4 touch-manipulation active:bg-surface-container-highest"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,video/*"
              onChange={(e) => {
                if (e.target.files?.[0]) processFile(e.target.files[0]);
              }}
              className="hidden"
            />
            <div className="text-3xl mb-1 text-secondary">📷</div>
            <div className="font-label-md text-xs sm:text-sm uppercase text-on-surface font-bold mb-1">
              {uploading ? "Processing file..." : "Tap or Drag to Upload Media"}
            </div>
            <p className="font-body-sm text-[11px] sm:text-xs text-outline">
              Photos, Posters, QR codes, or short MP4 videos from your phone
            </p>
          </div>

          {/* URL Add Form */}
          <form onSubmit={handleAddMediaUrl} className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="url"
              placeholder="Or paste public Image/Video URL..."
              value={mediaUrlInput}
              onChange={(e) => setMediaUrlInput(e.target.value)}
              className="flex-1 bg-surface-container-lowest border border-outline-variant/40 px-3 py-2 text-on-surface font-label-md text-xs outline-none focus:border-secondary min-h-[42px]"
            />
            <div className="flex gap-2">
              <select
                value={mediaTypeInput}
                onChange={(e) => setMediaTypeInput(e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant/40 px-3 py-2 text-on-surface font-label-md text-xs outline-none min-h-[42px]"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
              <button
                type="submit"
                disabled={!mediaUrlInput.trim()}
                className="flex-1 sm:flex-none bg-surface-container-highest hover:bg-secondary hover:text-on-secondary text-secondary font-label-md text-xs uppercase font-bold px-4 py-2 border border-secondary/30 disabled:opacity-40 min-h-[42px] touch-manipulation"
              >
                + Add
              </button>
            </div>
          </form>

          {/* Media Items Gallery */}
          <div className="border-t border-outline-variant/20 pt-3">
            <div className="font-label-sm text-xs text-outline uppercase font-bold mb-2.5">
              Media Library ({mediaItems.length} items) — Tap item to show on TV:
            </div>

            {mediaItems.length === 0 ? (
              <div className="p-4 bg-surface-container-lowest text-center text-xs text-outline font-label-sm uppercase">
                No items in library yet. Tap above to add photos or videos.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {mediaItems.map((item) => {
                  const isSelected = activePane === "media" && counter.selectedMediaId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectPane("media", item.id)}
                      className={`relative group cursor-pointer border p-2 bg-surface-container-lowest transition-all touch-manipulation ${
                        isSelected
                          ? "border-secondary ring-2 ring-secondary shadow-[3px_3px_0px_#100e09]"
                          : "border-outline-variant/40 hover:border-secondary"
                      }`}
                    >
                      <div className="w-full h-24 bg-surface flex items-center justify-center overflow-hidden mb-1.5">
                        {item.type === "video" ? (
                          <div className="text-center text-xs font-label-sm text-secondary">
                            ▶ VIDEO
                          </div>
                        ) : (
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-label-sm">
                        <span className="truncate max-w-[90px] text-on-surface font-bold">
                          {item.name}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteMedia(item.id, e)}
                          className="text-[#ffb4ab] p-1 font-bold"
                          title="Delete"
                        >
                          ✕
                        </button>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1 left-1 bg-secondary text-on-secondary font-label-sm text-[9px] px-1 font-bold">
                          ON TV
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION C: CUSTOM TEXT PANE CONTROLS
           ═══════════════════════════════════════════════════════════════ */}
        <div className="bg-surface-container p-4 sm:p-6 shadow-[4px_4px_0px_#100e09] border border-outline-variant/30 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-headline-md text-base sm:text-lg uppercase tracking-tight text-on-surface font-bold">
              Custom Text Pane Controls
            </h3>
            {activePane === "custom" && (
              <span className="bg-secondary text-on-secondary font-label-sm text-[10px] sm:text-xs px-2 py-0.5 font-bold uppercase">
                Active on TV
              </span>
            )}
          </div>

          <form onSubmit={handleSaveCustomText} className="flex flex-col gap-3">
            <div>
              <label className="block font-label-sm text-xs text-outline uppercase font-bold mb-1">
                Main Heading
              </label>
              <input
                type="text"
                placeholder="e.g. WELCOME TO THE CONCERT"
                value={headingInput}
                onChange={(e) => setHeadingInput(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/40 px-3 py-2 text-on-surface font-label-md text-sm outline-none focus:border-secondary min-h-[42px]"
              />
            </div>

            <div>
              <label className="block font-label-sm text-xs text-outline uppercase font-bold mb-1">
                Subheading / Tagline
              </label>
              <input
                type="text"
                placeholder="e.g. Next Band: The Groovy Syndicate • 8:30 PM"
                value={subheadingInput}
                onChange={(e) => setSubheadingInput(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/40 px-3 py-2 text-on-surface font-label-md text-sm outline-none focus:border-secondary min-h-[42px]"
              />
            </div>

            <div>
              <label className="block font-label-sm text-xs text-outline uppercase font-bold mb-1">
                Body / Notice / QR Description
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Scan the QR code on your tables to donate. All proceeds go to underprivileged children's education."
                value={bodyInput}
                onChange={(e) => setBodyInput(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/40 px-3 py-2 text-on-surface font-body-md text-sm outline-none focus:border-secondary"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-end mt-2">
              <button
                type="button"
                onClick={() => handleSelectPane("custom")}
                className="w-full sm:w-auto bg-surface-container-highest hover:bg-secondary hover:text-on-secondary text-secondary font-label-md uppercase text-xs px-4 py-2.5 font-bold border border-secondary/30 min-h-[42px] touch-manipulation"
              >
                Switch TV to Custom Text
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-secondary text-on-secondary font-label-md uppercase text-xs px-5 py-2.5 font-bold hover:bg-secondary-fixed transition-colors min-h-[42px] touch-manipulation"
              >
                Save &amp; Update Live
              </button>
            </div>
          </form>
        </div>
      </div>

      <footer className="w-full text-center py-4 text-[11px] font-label-sm uppercase text-outline">
        Controls synced live to public display screen via Firebase RTDB
      </footer>
    </div>
  );
}
