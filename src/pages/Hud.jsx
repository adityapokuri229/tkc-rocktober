import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { subscribeToCounter, subscribeToMedia, updateHud, defaultState } from "../lib/firebase.js";
import AudioVisualizerCanvas from "../components/AudioVisualizerCanvas.jsx";

const DEFAULT_HUD_LAYOUT = {
  counter: { x: 50, y: 72 },
  customText: { x: 50, y: 28 },
  media: { x: 50, y: 50 },
  bigPct: { x: 12, y: 15 }
};

const SIZE_CLASSES = {
  compact: {
    container: "max-w-xl",
    title: "text-2xl sm:text-3xl mb-4 sm:mb-5",
    cardPadding: "px-4 pb-4 pt-2 sm:px-5 sm:pb-5 sm:pt-2.5",
    label: "text-xs sm:text-sm",
    pctBadge: "text-xs sm:text-sm px-2 py-0.5",
    tally: "text-sm sm:text-base",
    barMinHeight: 24,
    targetText: "text-[11px] sm:text-xs"
  },
  medium: {
    container: "max-w-3xl",
    title: "text-3xl sm:text-4xl md:text-5xl mb-6 sm:mb-7",
    cardPadding: "px-6 pb-6 pt-2.5 sm:px-8 sm:pb-8 sm:pt-3",
    label: "text-sm sm:text-base",
    pctBadge: "text-sm sm:text-base px-3 py-1",
    tally: "text-base sm:text-lg",
    barMinHeight: 36,
    targetText: "text-xs sm:text-sm"
  },
  large: {
    container: "max-w-5xl",
    title: "text-4xl sm:text-6xl md:text-7xl mb-8 sm:mb-9",
    cardPadding: "px-8 pb-8 pt-3 sm:px-12 sm:pb-12 sm:pt-4",
    label: "text-base sm:text-xl",
    pctBadge: "text-base sm:text-xl px-4 py-1.5",
    tally: "text-xl sm:text-2xl",
    barMinHeight: 48,
    targetText: "text-sm sm:text-base"
  },
  huge: {
    container: "max-w-7xl",
    title: "text-5xl sm:text-7xl md:text-8xl mb-10 sm:mb-12",
    cardPadding: "px-10 pb-10 pt-4 sm:px-16 sm:pb-16 sm:pt-5",
    label: "text-lg sm:text-2xl",
    pctBadge: "text-lg sm:text-2xl px-5 py-2",
    tally: "text-2xl sm:text-4xl",
    barMinHeight: 64,
    targetText: "text-base sm:text-xl"
  }
};

const CUSTOM_TEXT_SIZES = {
  compact: {
    container: "max-w-2xl",
    cardPadding: "p-6 sm:p-8",
    heading: "text-2xl sm:text-3xl md:text-4xl mb-4",
    subheading: "text-sm sm:lg mb-4",
    body: "text-sm sm:text-base pt-4"
  },
  medium: {
    container: "max-w-4xl",
    cardPadding: "p-8 sm:p-14",
    heading: "text-3xl sm:text-5xl md:text-6xl mb-6",
    subheading: "text-lg sm:text-2xl mb-6",
    body: "text-base sm:text-xl pt-6"
  },
  large: {
    container: "max-w-6xl",
    cardPadding: "p-10 sm:p-20",
    heading: "text-5xl sm:text-7xl md:text-8xl mb-8",
    subheading: "text-2xl sm:text-3xl md:text-4xl mb-8",
    body: "text-xl sm:text-2xl pt-8"
  },
  huge: {
    container: "max-w-7xl",
    cardPadding: "p-12 sm:p-24",
    heading: "text-6xl sm:text-8xl md:text-9xl mb-10",
    subheading: "text-3xl sm:text-4xl md:text-5xl mb-10",
    body: "text-2xl sm:text-3xl pt-10"
  }
};

export default function Hud() {
  const [counterData, setCounterData] = useState(defaultState);
  const [mediaItems, setMediaItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [positions, setPositions] = useState(DEFAULT_HUD_LAYOUT);

  const dragRef = useRef({
    activeId: null,
    startX: 0,
    startY: 0,
    initialPosX: 0,
    initialPosY: 0
  });

  useEffect(() => {
    const unsubCounter = subscribeToCounter((data) => {
      if (data) {
        setCounterData(data);
        if (data.hud?.layout) {
          setPositions(data.hud.layout);
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

  const activePane = counterData.activePane || "counter";
  const selectedMedia = mediaItems.find((m) => m.id === counterData.selectedMediaId) || mediaItems[0];
  const customText = counterData.customText || defaultState.customText;
  const isHudTextVisible = counterData.hud?.showText !== false;

  // ─── POINTER DRAGGING SYSTEM (TOUCH + MOUSE) ───
  const handlePointerDown = (id, e) => {
    if (isLocked) return;
    e.stopPropagation();
    setSelectedId(id);

    const currentPos = positions[id] || DEFAULT_HUD_LAYOUT[id] || { x: 50, y: 50 };

    dragRef.current = {
      activeId: id,
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: currentPos.x,
      initialPosY: currentPos.y
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handlePointerMove = (e) => {
    const { activeId, startX, startY, initialPosX, initialPosY } = dragRef.current;
    if (!activeId) return;

    const deltaX = ((e.clientX - startX) / window.innerWidth) * 100;
    const deltaY = ((e.clientY - startY) / window.innerHeight) * 100;

    const newX = Math.max(5, Math.min(95, initialPosX + deltaX));
    const newY = Math.max(5, Math.min(95, initialPosY + deltaY));

    setPositions((prev) => ({
      ...prev,
      [activeId]: { x: newX, y: newY }
    }));
  };

  const handlePointerUp = async () => {
    const { activeId } = dragRef.current;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);

    if (activeId) {
      setPositions((latest) => {
        updateHud({ layout: latest }).catch(() => {});
        return latest;
      });
    }

    dragRef.current.activeId = null;
  };

  const resetLayout = async () => {
    setPositions(DEFAULT_HUD_LAYOUT);
    await updateHud({ layout: DEFAULT_HUD_LAYOUT });
  };

  // Donation Counter Calculations
  const raised = Number(counterData.raised || 0);
  const goal = Number(counterData.goal || 150000);
  const pct = goal ? Math.min(100, ((raised / goal) * 100)).toFixed(1) : 0;
  const raisedFmt = raised.toLocaleString("en-IN");
  const settings = counterData.settings || {};
  const sizeKey = settings.size || "medium";
  const sizeConfig = SIZE_CLASSES[sizeKey] || SIZE_CLASSES.medium;
  const barHeight = Math.max(settings.barHeight || 28, sizeConfig.barMinHeight);
  const hideAmounts = settings.hideAmounts;
  const percentageMode = settings.percentageMode;
  const title = settings.title || "MUSIC FOR A CHANGE";

  const words = title.trim().split(" ");
  const lastWord = words.length > 1 ? words.pop() : "";
  const firstWords = words.join(" ");
  const bigPercentage = !!settings.bigPercentage;

  const textConfig = CUSTOM_TEXT_SIZES[customText.size || "medium"] || CUSTOM_TEXT_SIZES.medium;
  const isTransparent = !!customText.transparentBg;

  return (
    <div
      onClick={() => setSelectedId(null)}
      className="relative min-h-screen w-screen h-screen overflow-hidden bg-surface select-none touch-none"
    >
      {/* Universal Audio Reactive Canvas in Background */}
      <AudioVisualizerCanvas
        audioFx={counterData.audioFx}
        className="fixed inset-0 pointer-events-none z-0 w-full h-full"
      />

      {/* ─── HUD CONTROL TOOLBAR (TOP RIGHT) ─── */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed top-3 right-3 z-50 flex items-center gap-2 bg-surface-container/90 border border-outline-variant/40 px-3 py-1.5 shadow-[4px_4px_0px_#100e09] backdrop-blur-md"
      >
        <div className="flex items-center gap-2 pr-2 border-r border-outline-variant/30">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span className="font-label-md text-xs font-extrabold uppercase tracking-wider text-secondary">
            HUD VIEW
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-label-sm font-bold uppercase text-outline">
          <span>TEXT:</span>
          <span className={isHudTextVisible ? "text-secondary font-extrabold" : "text-error"}>
            {isHudTextVisible ? "VISIBLE" : "HIDDEN"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsLocked(!isLocked)}
          className={`px-2.5 py-1 text-[11px] font-label-md font-bold uppercase border transition-colors touch-manipulation ${
            isLocked
              ? "bg-secondary text-on-secondary border-secondary shadow-[2px_2px_0px_#100e09]"
              : "bg-surface text-on-surface border-outline-variant/40 hover:border-secondary"
          }`}
        >
          {isLocked ? "🔒 LOCKED" : "🔓 MOVEABLE"}
        </button>

        <button
          type="button"
          onClick={resetLayout}
          className="px-2 py-1 text-[11px] font-label-md font-bold uppercase bg-surface text-outline hover:text-on-surface border border-outline-variant/40 transition-colors"
          title="Reset HUD widget positions"
        >
          RESET
        </button>

        <Link
          to="/admin"
          className="px-2 py-1 text-[11px] font-label-md font-bold uppercase bg-surface-container-highest text-secondary border border-secondary/30 hover:bg-secondary hover:text-on-secondary transition-colors"
        >
          ADMIN
        </Link>
      </div>

      {/* ─── DRAGGABLE WIDGET 1: CUSTOM TEXT (CONTROLLED BY HUD TEXT TOGGLE) ─── */}
      {isHudTextVisible && (
        <div
          onPointerDown={(e) => handlePointerDown("customText", e)}
          style={{
            left: `${positions.customText?.x ?? 50}%`,
            top: `${positions.customText?.y ?? 28}%`,
            transform: "translate(-50%, -50%)"
          }}
          className={`absolute z-20 cursor-grab active:cursor-grabbing transition-shadow ${
            selectedId === "customText" && !isLocked
              ? "ring-2 ring-secondary ring-offset-2 ring-offset-surface shadow-[0_0_20px_rgba(93,217,208,0.4)]"
              : ""
          }`}
        >
          <div
            className={`w-full ${textConfig.container} ${textConfig.cardPadding} text-center transition-all duration-300 pointer-events-auto ${
              isTransparent
                ? "bg-transparent shadow-none border-0"
                : "bg-surface-container/95 backdrop-blur-md shadow-[8px_8px_0px_#100e09] border border-outline-variant/30"
            }`}
          >
            {selectedId === "customText" && !isLocked && (
              <div className="absolute -top-6 left-0 bg-secondary text-on-secondary text-[10px] font-label-sm font-extrabold px-1.5 py-0.5 uppercase tracking-wider">
                TEXT (DRAG TO MOVE)
              </div>
            )}
            {customText.heading && (
              <h1
                className={`font-headline-xl ${textConfig.heading} uppercase tracking-tight text-on-surface leading-tight font-extrabold ${
                  isTransparent ? "drop-shadow-[4px_4px_0px_#100e09]" : ""
                }`}
              >
                {customText.heading}
              </h1>
            )}

            {customText.subheading && (
              <p
                className={`font-label-lg ${textConfig.subheading} text-secondary uppercase font-bold tracking-wider ${
                  isTransparent ? "drop-shadow-[2px_2px_0px_#100e09]" : ""
                }`}
              >
                {customText.subheading}
              </p>
            )}

            {customText.body && (
              <div
                className={`max-w-3xl mx-auto font-body-lg ${textConfig.body} text-on-surface-variant leading-relaxed whitespace-pre-line ${
                  isTransparent ? "border-t border-outline-variant/20 drop-shadow-[2px_2px_0px_#100e09]" : "border-t border-outline-variant/30"
                }`}
              >
                {customText.body}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── DRAGGABLE WIDGET 2: MEDIA DISPLAY (IMAGE / VIDEO) ─── */}
      {selectedMedia && activePane === "media" && (
        <div
          onPointerDown={(e) => handlePointerDown("media", e)}
          style={{
            left: `${positions.media?.x ?? 50}%`,
            top: `${positions.media?.y ?? 50}%`,
            transform: "translate(-50%, -50%)"
          }}
          className={`absolute z-10 cursor-grab active:cursor-grabbing max-w-[85vw] max-h-[75vh] flex items-center justify-center ${
            selectedId === "media" && !isLocked
              ? "ring-2 ring-secondary ring-offset-2 ring-offset-surface shadow-[0_0_20px_rgba(93,217,208,0.4)]"
              : ""
          }`}
        >
          {selectedId === "media" && !isLocked && (
            <div className="absolute -top-6 left-0 bg-secondary text-on-secondary text-[10px] font-label-sm font-extrabold px-1.5 py-0.5 uppercase tracking-wider">
              MEDIA (DRAG TO MOVE)
            </div>
          )}
          <div className="bg-black/80 p-1 border border-outline-variant/40 shadow-[8px_8px_0px_#100e09] max-w-full max-h-full">
            {selectedMedia.type === "video" ? (
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                loop
                muted
                playsInline
                className="max-w-[70vw] max-h-[60vh] object-contain pointer-events-auto"
              />
            ) : (
              <img
                src={selectedMedia.url}
                alt={selectedMedia.name || "Concert Visual"}
                className="max-w-[70vw] max-h-[60vh] object-contain pointer-events-auto"
              />
            )}
          </div>
        </div>
      )}

      {/* ─── DRAGGABLE WIDGET 3: DONATION COUNTER CARD ─── */}
      <div
        onPointerDown={(e) => handlePointerDown("counter", e)}
        style={{
          left: `${positions.counter?.x ?? 50}%`,
          top: `${positions.counter?.y ?? 72}%`,
          transform: "translate(-50%, -50%)"
        }}
        className={`absolute z-20 cursor-grab active:cursor-grabbing w-full ${sizeConfig.container} px-4 transition-all duration-300 ${
          selectedId === "counter" && !isLocked
            ? "ring-2 ring-secondary ring-offset-2 ring-offset-surface shadow-[0_0_20px_rgba(93,217,208,0.4)]"
            : ""
        }`}
      >
        {selectedId === "counter" && !isLocked && (
          <div className="absolute -top-6 left-4 bg-secondary text-on-secondary text-[10px] font-label-sm font-extrabold px-1.5 py-0.5 uppercase tracking-wider">
            DONATION COUNTER (DRAG TO MOVE)
          </div>
        )}

        {/* Main Heading Text */}
        <h1 className={`font-headline-lg ${sizeConfig.title} uppercase tracking-tight text-on-surface text-center sm:text-left font-extrabold`}>
          {firstWords ? `${firstWords} ` : ""}<span className="text-secondary">{lastWord || title}</span>
        </h1>

        {/* Thermometer Meter Card */}
        <div className={`bg-surface-container ${sizeConfig.cardPadding} shadow-[6px_6px_0px_#100e09] border border-outline-variant/30`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-3">
              <span className={`font-label-md ${sizeConfig.label} uppercase tracking-wider text-on-surface font-bold`}>
                CROWDFUND PROGRESS
              </span>
              <span className={`bg-secondary-container text-on-secondary font-label-md ${sizeConfig.pctBadge} font-extrabold tracking-wide`}>
                {pct}% REACHED
              </span>
            </div>
            {!hideAmounts && (
              <div className={`font-label-lg ${sizeConfig.tally} text-secondary tracking-wider font-extrabold`}>
                {percentageMode ? `${pct}%` : `₹${raisedFmt} RAISED`}
              </div>
            )}
          </div>

          {/* Meter Bar */}
          <div
            className="w-full bg-surface-container-lowest p-1.5 shadow-inner"
            style={{ height: `${barHeight}px` }}
          >
            <div
              className="h-full bg-gradient-to-r from-secondary to-tertiary transition-all duration-700 ease-out"
              style={{ width: `${pct}%` }}
            ></div>
          </div>

          {/* Target Goal & Remaining Display */}
          {settings.showTarget !== false && !hideAmounts && (
            <div className={`flex justify-between items-center mt-3 pt-2.5 border-t border-outline-variant/20 font-label-md ${sizeConfig.targetText} uppercase tracking-wider text-outline`}>
              <span className="flex items-center gap-2 font-bold text-on-surface-variant">
                <span className="w-2 h-2 bg-secondary inline-block"></span>
                TARGET: ₹{goal.toLocaleString("en-IN")}
              </span>
              <span className="font-bold text-secondary">
                REMAINING: ₹{Math.max(0, goal - raised).toLocaleString("en-IN")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ─── DRAGGABLE WIDGET 4: BIG PERCENTAGE TALLY ─── */}
      {bigPercentage && (
        <div
          onPointerDown={(e) => handlePointerDown("bigPct", e)}
          style={{
            left: `${positions.bigPct?.x ?? 12}%`,
            top: `${positions.bigPct?.y ?? 15}%`,
            transform: "translate(-50%, -50%)"
          }}
          className={`absolute z-20 cursor-grab active:cursor-grabbing flex flex-col items-start leading-none pointer-events-auto ${
            selectedId === "bigPct" && !isLocked
              ? "ring-2 ring-secondary ring-offset-2 ring-offset-surface shadow-[0_0_20px_rgba(93,217,208,0.4)]"
              : ""
          }`}
        >
          {selectedId === "bigPct" && !isLocked && (
            <div className="absolute -top-6 left-0 bg-secondary text-on-secondary text-[10px] font-label-sm font-extrabold px-1.5 py-0.5 uppercase tracking-wider">
              BIG % (DRAG TO MOVE)
            </div>
          )}
          <div className="flex items-baseline gap-1">
            <span className="font-headline-xl text-6xl sm:text-8xl md:text-9xl font-black text-secondary tracking-tighter drop-shadow-[5px_5px_0px_#100e09]">
              {pct}%
            </span>
          </div>
          <span className="font-label-sm text-xs sm:text-sm text-outline uppercase tracking-widest font-bold mt-1.5">
            COLLECTION PROGRESS
          </span>
        </div>
      )}
    </div>
  );
}
