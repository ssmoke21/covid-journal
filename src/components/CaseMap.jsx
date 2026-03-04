import { useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "@vnedyalk0v/react19-simple-maps";
import topology from "world-atlas/countries-110m.json";

// ─── Shared date parsing helpers (exported for reuse) ────────────────────────

const MONTHS_MAP = {
  january: 0, february: 1, march: 2, april: 3,
  may: 4, june: 5, july: 6, august: 7,
  september: 8, october: 9, november: 10, december: 11,
};

const SHORT_MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

export function parseNodeDate(dateStr) {
  if (!dateStr) return 0;
  const iso = new Date(dateStr + "T00:00:00");
  if (!isNaN(iso)) return iso.getTime();
  const lower = dateStr.toLowerCase();
  if (lower.includes("summer")) { const y = dateStr.match(/\d{4}/)?.[0]; return y ? new Date(+y, 6, 1).getTime() : 0; }
  if (lower.includes("spring")) { const y = dateStr.match(/\d{4}/)?.[0]; return y ? new Date(+y, 3, 1).getTime() : 0; }
  if (lower.includes("winter")) { const y = dateStr.match(/\d{4}/)?.[0]; return y ? new Date(+y, 0, 1).getTime() : 0; }
  if (lower.includes("fall") || lower.includes("autumn")) { const y = dateStr.match(/\d{4}/)?.[0]; return y ? new Date(+y, 9, 1).getTime() : 0; }
  for (const [name, idx] of Object.entries(MONTHS_MAP)) {
    if (lower.includes(name)) {
      const y = dateStr.match(/\d{4}/)?.[0];
      if (!y) continue;
      let day = 15;
      if (lower.includes("early")) day = 5;
      else if (lower.includes("late")) day = 25;
      return new Date(+y, idx, day).getTime();
    }
  }
  return 0;
}

export function formatDateFull(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatNumber(n) {
  if (n == null || isNaN(n)) return "—";
  return n.toLocaleString();
}

/** Binary-search a sorted dates array for the closest match to targetTs */
export function findDateIndex(dates, targetTs) {
  if (!dates?.length || !targetTs) return 0;
  let lo = 0;
  let hi = dates.length - 1;

  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const midTs = new Date(dates[mid] + "T00:00:00").getTime();
    if (midTs < targetTs) lo = mid + 1;
    else hi = mid;
  }

  if (lo > 0) {
    const loTs = new Date(dates[lo] + "T00:00:00").getTime();
    const prevTs = new Date(dates[lo - 1] + "T00:00:00").getTime();
    if (Math.abs(prevTs - targetTs) < Math.abs(loTs - targetTs)) {
      return lo - 1;
    }
  }
  return lo;
}

// ─── Bubble sizing constants ─────────────────────────────────────────────────

const MAX_RADIUS = 35;
const MIN_RADIUS = 1.5; // minimum so a 1-case dot is still faintly visible

// ─── Main component ──────────────────────────────────────────────────────────

/**
 * @param {Object} props
 * @param {Object} props.data - Map data with dates, global, countries arrays
 * @param {string} props.currentDate - Current timeline node date string
 * @param {boolean} [props.isVisible] - Controls fade-in animation
 * @param {boolean} [props.embedded] - If true, renders map-only (no sticky wrapper/annotation)
 */
export default function CaseMap({ data, currentDate, isVisible, embedded = false }) {
  // All-time max across the entire dataset — computed once, used as absolute scale reference
  // so early bubbles (2 cases) are proportionally tiny vs the peak (1.78M)
  const allTimeMax = useMemo(() => {
    if (!data?.countries?.length) return 1;
    let max = 0;
    for (const c of data.countries) {
      for (const v of c.cases) {
        if (v > max) max = v;
      }
    }
    return max || 1;
  }, [data]);

  // Find the date index closest to the current scroll position
  const dateIndex = useMemo(() => {
    if (!currentDate || !data?.dates?.length) return 0;
    const targetTs = parseNodeDate(currentDate);
    return findDateIndex(data.dates, targetTs);
  }, [currentDate, data]);

  // Compute bubbles for the current date, scaled against all-time max
  const bubbles = useMemo(() => {
    if (!data?.countries?.length) return [];

    const active = data.countries
      .map((c) => ({ ...c, value: c.cases[dateIndex] || 0 }))
      .filter((c) => c.value > 0);

    if (!active.length) return [];

    // Scale is fixed to all-time max — bubbles grow absolutely, not relatively
    const scale = MAX_RADIUS / Math.sqrt(allTimeMax);

    return active
      .map((c) => ({
        id: c.id,
        name: c.name,
        coordinates: [c.lng, c.lat],
        radius: Math.max(MIN_RADIUS, Math.sqrt(c.value) * scale),
        cases: c.value,
      }))
      .sort((a, b) => a.cases - b.cases);
  }, [data, dateIndex, allTimeMax]);

  // Global total for annotation
  const globalTotal = data?.global?.[dateIndex] || 0;
  const currentIsoDate = data?.dates?.[dateIndex] || "";

  if (!data?.dates?.length) return null;

  // ── Map SVG content (shared between embedded and standalone) ──
  const mapContent = (
    <div className="relative" style={{ backgroundColor: "#1a1a2e" }}>
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 140, center: [10, 20] }}
        width={800}
        height={380}
        style={{
          width: "100%",
          height: "auto",
          maxHeight: "170px",
          display: "block",
        }}
      >
        <Geographies geography={topology}>
          {({ geographies }) =>
            geographies.map((geo, i) => (
              <Geography
                key={geo.rsmKey || geo.id || i}
                geography={geo}
                fill="#2a2a4a"
                stroke="#3a3a5a"
                strokeWidth={0.4}
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {bubbles.map((b) => (
          <Marker key={b.id} coordinates={b.coordinates}>
            <circle
              r={b.radius}
              fill="rgba(220, 38, 38, 0.6)"
              stroke="rgba(239, 68, 68, 0.85)"
              strokeWidth={0.5}
            />
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );

  // ── Embedded mode: just the map, no wrapper ──
  if (embedded) return mapContent;

  // ── Standalone mode: sticky wrapper + annotation bar ──
  return (
    <div
      className="sticky top-0 z-20 overflow-hidden"
      style={{
        animation: isVisible ? "fade-in-up 0.5s ease-out 0.5s both" : "none",
      }}
    >
      {mapContent}

      {/* Annotation bar */}
      <div
        className="flex items-center justify-center gap-3 py-1.5 text-[10px] font-mono"
        style={{ backgroundColor: "#12121f" }}
      >
        {currentIsoDate && (
          <span className="text-stone-500">{formatDateFull(currentIsoDate)}</span>
        )}
        {currentIsoDate && globalTotal > 0 && (
          <>
            <span className="text-stone-700">|</span>
            <span className="text-red-400/80 font-medium">
              {formatNumber(globalTotal)} total cases worldwide
            </span>
          </>
        )}
        {!currentIsoDate && (
          <span className="text-stone-600 text-[9px] uppercase tracking-widest">
            Global Case Tracker
          </span>
        )}
      </div>
      {/* Gradient divider — matches chapter separator style */}
      <div className="h-px bg-gradient-to-r from-transparent via-stone-600/40 to-transparent" />
    </div>
  );
}
