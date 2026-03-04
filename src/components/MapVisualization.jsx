import { useMemo } from "react";
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
//   Mobile Ch2-4:    [         USA (full width)            ]

export default function MapVisualization({ currentDate, isVisible, chapterNumber }) {
  const showUsaMap = chapterNumber >= 2;
  const showHospital = chapterNumber >= 3;

  // Compute annotation values from both datasets
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

    return { worldDate, worldTotal, usTotal };
  }, [currentDate, showUsaMap]);

  // Use the world date for display (it covers all chapters)
  const displayDate = annotation.worldDate;

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

  // ── Chapters 2-4: Multi-panel on desktop, USA-only on mobile ──
  return (
    <div
      className="sticky top-0 z-20 overflow-hidden border-b border-stone-700/30"
      style={{
        animation: isVisible ? "fade-in-up 0.5s ease-out 0.5s both" : "none",
      }}
    >
      <div className="flex" style={{ minHeight: "170px" }}>
        {/* World map — hidden on mobile, width depends on panel count */}
        <div className={`hidden lg:block ${mapWidthClass}`}>
          <CaseMap
            data={worldMapData}
            currentDate={currentDate}
            embedded
          />
        </div>

        {/* Divider (desktop only) */}
        <div className="hidden lg:block w-px" style={{ backgroundColor: "#3a3a5a" }} />

        {/* USA map — full width on mobile, shrinks on desktop */}
        <div className={`w-full ${usaWidthClass}`}>
          <UsaCaseMap
            data={usMapData}
            currentDate={currentDate}
          />
        </div>

        {/* Hospital chart — desktop only, Ch3-4 */}
        {showHospital && (
          <>
            <div className="hidden lg:block w-px" style={{ backgroundColor: "#3a3a5a" }} />
            <div className="hidden lg:block lg:w-1/3">
              <HospitalChart
                data={hospitalData}
                currentDate={currentDate}
              />
            </div>
          </>
        )}
      </div>

      {/* Shared annotation bar */}
      <div
        className="flex items-center justify-center gap-3 py-1.5 text-[10px] font-mono"
        style={{ backgroundColor: "#12121f" }}
      >
        {displayDate && (
          <span className="text-stone-500">{formatDateFull(displayDate)}</span>
        )}

        {/* World total — hidden on mobile for Ch2+ */}
        {displayDate && annotation.worldTotal > 0 && (
          <span className="hidden lg:inline-flex items-center gap-3">
            <span className="text-stone-700">|</span>
            <span className="text-red-400/80 font-medium">
              {formatNumber(annotation.worldTotal)} worldwide
            </span>
          </span>
        )}

        {/* US total — always shown for Ch2+ */}
        {displayDate && annotation.usTotal > 0 && (
          <>
            <span className="text-stone-700">|</span>
            <span className="text-red-400/80 font-medium">
              {formatNumber(annotation.usTotal)} US
            </span>
          </>
        )}

        {!displayDate && (
          <span className="text-stone-600 text-[9px] uppercase tracking-widest">
            Global Case Tracker
          </span>
        )}
      </div>
    </div>
  );
}
