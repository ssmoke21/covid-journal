import { useMemo, useState, useRef, useCallback } from "react";
import CaseMap, { parseNodeDate, findDateIndex, formatDateFull, formatNumber } from "./CaseMap";
import UsaCaseMap from "./UsaCaseMap";
import HospitalChart from "./HospitalChart";
import worldMapData from "../data/map-data.json";
import usMapData from "../data/us-map-data.json";
import hospitalData from "../data/hospital-data.json";

// ─── MapVisualization wrapper ────────────────────────────────────────────────
//
// Manages layout for up to 3 panels and the shared annotation bar.
//
// Layout:
//   Desktop Ch1:     [         World (full width)          ]
//   Desktop Ch2:     [   World (1/2)   |    USA (1/2)     ]
//   Desktop Ch3-4:   [ World (1/3) | USA (1/3) | Hospital ]
//   Mobile Ch1:      [         World (full width)          ]
//   Mobile Ch2-4:    [ World ] ← swipe → [ USA ] ← swipe → [ Hospital ]

export default function MapVisualization({ currentDate, isVisible, chapterNumber }) {
  const showUsaMap = chapterNumber >= 2;
  const showHospital = chapterNumber >= 3;

  // Mobile carousel state
  const [activePanel, setActivePanel] = useState(0);
  const carouselRef = useRef(null);

  const handleCarouselScroll = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActivePanel(index);
  }, []);

  // Compute annotation values from all datasets
  const annotation = useMemo(() => {
    const targetTs = parseNodeDate(currentDate);

    const worldIdx = findDateIndex(worldMapData.dates, targetTs);
    const worldDate = worldMapData.dates?.[worldIdx] || "";
    const worldTotal = worldMapData.global?.[worldIdx] || 0;

    let usTotal = 0;
    if (showUsaMap && usMapData.dates?.length) {
      const usIdx = findDateIndex(usMapData.dates, targetTs);
      usTotal = usMapData.usTotal?.[usIdx] || 0;
    }

    let hospitalPositive = null;
    let hospitalPui = null;
    if (showHospital && hospitalData.dates?.length) {
      let hIdx = findDateIndex(hospitalData.dates, targetTs);
      // Only show hospital data up to the current scroll position (no future reveal)
      const hDateTs = new Date(hospitalData.dates[hIdx] + "T00:00:00").getTime();
      if (hDateTs > targetTs) hIdx--;  // step back if nearest date is in the future
      if (hIdx >= 0) {
        hospitalPositive = hospitalData.positive[hIdx];
        hospitalPui = hospitalData.pui[hIdx];
      }
    }

    return { worldDate, worldTotal, usTotal, hospitalPositive, hospitalPui };
  }, [currentDate, showUsaMap, showHospital]);

  // Use the world date for display (it covers all chapters)
  const displayDate = annotation.worldDate;

  // Panel count for mobile carousel
  const panelCount = showHospital ? 3 : 2;

  if (!worldMapData.dates?.length) return null;

  // ── Chapter 1: World map only (standalone, not embedded) ──
  if (!showUsaMap) {
    return (
      <CaseMap
        data={worldMapData}
        currentDate={currentDate}
        isVisible={isVisible}
        embedded={false}
      />
    );
  }

  // Determine desktop width classes based on panel count
  // Ch2: two panels (world 1/2 + USA 1/2)
  // Ch3-4: three panels (world 1/3 + USA 1/3 + hospital 1/3)
  const mapWidthClass = showHospital ? "lg:w-1/3" : "lg:w-1/2";
  const usaWidthClass = showHospital ? "lg:w-1/3" : "lg:flex-1";

  // ── Mobile annotation content based on active panel ──
  const mobileAnnotation = (() => {
    if (activePanel === 0) {
      // World panel
      return (
        <>
          {displayDate && (
            <span className="text-stone-500">{formatDateFull(displayDate)}</span>
          )}
          {displayDate && annotation.worldTotal > 0 && (
            <>
              <span className="text-stone-700">|</span>
              <span className="text-red-400/80 font-medium">
                {formatNumber(annotation.worldTotal)} worldwide
              </span>
            </>
          )}
        </>
      );
    }
    if (activePanel === 1) {
      // USA panel
      return (
        <>
          {displayDate && (
            <span className="text-stone-500">{formatDateFull(displayDate)}</span>
          )}
          {displayDate && annotation.usTotal > 0 && (
            <>
              <span className="text-stone-700">|</span>
              <span className="text-red-400/80 font-medium">
                {formatNumber(annotation.usTotal)} US
              </span>
            </>
          )}
        </>
      );
    }
    // Hospital panel (activePanel === 2)
    return (
      <>
        {displayDate && (
          <span className="text-stone-500">{formatDateFull(displayDate)}</span>
        )}
        {annotation.hospitalPositive != null && (
          <>
            <span className="text-stone-700">|</span>
            <span className="text-red-400/80 font-medium">
              {formatNumber(annotation.hospitalPositive)} COVID+
            </span>
          </>
        )}
        {annotation.hospitalPui != null && (
          <>
            <span className="text-stone-700">·</span>
            <span className="text-amber-400/80 font-medium">
              {formatNumber(annotation.hospitalPui)} PUI
            </span>
          </>
        )}
      </>
    );
  })();

  // ── Chapters 2-4: Multi-panel ──
  return (
    <div
      className="sticky top-0 z-20 overflow-hidden border-b border-stone-700/30"
      style={{
        animation: isVisible ? "fade-in-up 0.5s ease-out 0.5s both" : "none",
      }}
    >
      {/* ── Mobile: horizontal scroll-snap carousel ── */}
      <div className="lg:hidden">
        <div
          ref={carouselRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{
            minHeight: "170px",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          onScroll={handleCarouselScroll}
        >
          {/* Panel 1: World map */}
          <div className="w-full flex-shrink-0 snap-center">
            <CaseMap data={worldMapData} currentDate={currentDate} embedded />
          </div>
          {/* Panel 2: USA map */}
          <div className="w-full flex-shrink-0 snap-center">
            <UsaCaseMap data={usMapData} currentDate={currentDate} />
          </div>
          {/* Panel 3: Hospital (Ch3-4 only) */}
          {showHospital && (
            <div className="w-full flex-shrink-0 snap-center">
              <HospitalChart data={hospitalData} currentDate={currentDate} />
            </div>
          )}
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 py-1" style={{ backgroundColor: "#1a1a2e" }}>
          {Array.from({ length: panelCount }, (_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === activePanel ? "bg-stone-400" : "bg-stone-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Desktop: side-by-side panels ── */}
      <div className="hidden lg:flex" style={{ minHeight: "170px" }}>
        {/* World map */}
        <div className={mapWidthClass}>
          <CaseMap
            data={worldMapData}
            currentDate={currentDate}
            embedded
          />
        </div>

        {/* Divider */}
        <div className="w-px" style={{ backgroundColor: "#3a3a5a" }} />

        {/* USA map */}
        <div className={usaWidthClass}>
          <UsaCaseMap
            data={usMapData}
            currentDate={currentDate}
          />
        </div>

        {/* Hospital chart — Ch3-4 */}
        {showHospital && (
          <>
            <div className="w-px" style={{ backgroundColor: "#3a3a5a" }} />
            <div className="lg:w-1/3">
              <HospitalChart
                data={hospitalData}
                currentDate={currentDate}
              />
            </div>
          </>
        )}
      </div>

      {/* ── Annotation bar ── */}
      <div
        className="py-1.5 text-[10px] font-mono"
        style={{ backgroundColor: "#12121f" }}
      >
        {/* Mobile: panel-aware annotation */}
        <div className="flex items-center justify-center gap-3 lg:hidden">
          {mobileAnnotation}
        </div>

        {/* Desktop: grid matching panel widths */}
        <div className={`hidden lg:grid ${showHospital ? "grid-cols-3" : "grid-cols-2"}`}>
          {/* Under world map */}
          <div className="text-center">
            {displayDate && (
              <span className="text-stone-500">{formatDateFull(displayDate)}</span>
            )}
            {displayDate && annotation.worldTotal > 0 && (
              <>
                <span className="text-stone-700 mx-2">|</span>
                <span className="text-red-400/80 font-medium">
                  {formatNumber(annotation.worldTotal)} worldwide
                </span>
              </>
            )}
          </div>

          {/* Under USA map */}
          <div className="text-center">
            {displayDate && annotation.usTotal > 0 && (
              <span className="text-red-400/80 font-medium">
                {formatNumber(annotation.usTotal)} US
              </span>
            )}
          </div>

          {/* Under hospital chart (Ch3-4 only) */}
          {showHospital && (
            <div className="text-center">
              {annotation.hospitalPositive != null && (
                <span className="text-red-400/80 font-medium">
                  {formatNumber(annotation.hospitalPositive)} COVID+
                </span>
              )}
              {annotation.hospitalPui != null && (
                <>
                  <span className="text-stone-700 mx-1">·</span>
                  <span className="text-amber-400/80 font-medium">
                    {formatNumber(annotation.hospitalPui)} PUI
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
