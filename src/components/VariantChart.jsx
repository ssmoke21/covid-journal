import { useMemo } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { parseNodeDate, findDateIndex, formatDateFull, formatNumber } from "./CaseMap";

// ─── Variant rendering order (bottom → top of stack) ────────────────────────

const VARIANT_KEYS = [
  "wildtype", "alpha", "beta", "gamma", "delta",
  "ba1", "ba2", "ba2121", "ba45", "bq",
];

// ─── Formatters ─────────────────────────────────────────────────────────────

const SHORT_MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

function formatTick(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return `${SHORT_MONTHS[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
}

function abbreviateNumber(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

// ─── Main component ──────────────────────────────────────────────────────────

/**
 * Combined dual-axis chart:
 * - Left Y-axis (0–100%): stacked variant proportions
 * - Right Y-axis (dynamic): weekly new US cases as an overlaid line
 * Progressive reveal, MAB event reference lines, unified annotation bar.
 *
 * @param {Object} props
 * @param {Object} props.data - Variant data with weeks, mab_events, variant_meta
 * @param {Object} props.caseData - Case wave data with weeks array
 * @param {string} props.currentDate - Current timeline node date string
 */
export default function VariantChart({ data, caseData, currentDate }) {
  const dates = useMemo(() => {
    if (!data?.weeks?.length) return [];
    return data.weeks.map((w) => w.date);
  }, [data]);

  // Find the cursor position in the data
  const cursorIndex = useMemo(() => {
    if (!currentDate || !dates.length) return 0;
    const targetTs = parseNodeDate(currentDate);
    if (!targetTs) return 0;
    return findDateIndex(dates, targetTs);
  }, [currentDate, dates]);

  // Merge variant + case data, then progressive reveal with dynamic right Y-axis
  const { chartData, casesYMax } = useMemo(() => {
    if (!data?.weeks?.length) return { chartData: [], casesYMax: 500000 };

    // Build case lookup by date
    const caseMap = {};
    if (caseData?.weeks) {
      for (const w of caseData.weeks) {
        caseMap[w.date] = w.cases;
      }
    }

    // Merge and slice to revealed range
    const revealed = [];
    let maxCases = 0;
    for (let i = 0; i <= cursorIndex && i < data.weeks.length; i++) {
      const cases = caseMap[data.weeks[i].date] || 0;
      revealed.push({ ...data.weeks[i], cases });
      if (cases > maxCases) maxCases = cases;
    }

    // Dynamic right Y-axis with headroom (round to nice number)
    const casesYMax = Math.max(
      500000,
      Math.ceil((maxCases * 1.15) / 500000) * 500000
    );

    return { chartData: revealed, casesYMax };
  }, [data, caseData, cursorIndex]);

  // Current date string for the scroll cursor line
  const cursorDate = dates[cursorIndex] || null;

  // Compute annotation: dominant variant + case count + last MAB event
  const annotation = useMemo(() => {
    if (!chartData.length || !data?.variant_meta) return null;
    const current = chartData[chartData.length - 1];

    // Find dominant variant
    let dominantKey = "wildtype";
    let dominantVal = 0;
    for (const key of VARIANT_KEYS) {
      if ((current[key] || 0) > dominantVal) {
        dominantKey = key;
        dominantVal = current[key];
      }
    }

    // Find most recent MAB event at or before the current date
    const currentTs = new Date(current.date + "T00:00:00").getTime();
    let lastEvent = null;
    if (data.mab_events) {
      for (const evt of data.mab_events) {
        const evtTs = new Date(evt.date + "T00:00:00").getTime();
        if (evtTs <= currentTs) lastEvent = evt;
      }
    }

    return {
      date: current.date,
      dominantKey,
      dominantLabel: data.variant_meta[dominantKey]?.label || dominantKey,
      dominantColor: data.variant_meta[dominantKey]?.color || "#94a3b8",
      dominantPct: Math.round(dominantVal),
      cases: current.cases || 0,
      lastEvent,
    };
  }, [chartData, data]);

  // MAB events that fall within the revealed date range
  const visibleEvents = useMemo(() => {
    if (!data?.mab_events?.length || !chartData.length) return [];
    const lastRevealedTs = new Date(
      chartData[chartData.length - 1].date + "T00:00:00"
    ).getTime();
    return data.mab_events.filter((evt) => {
      const evtTs = new Date(evt.date + "T00:00:00").getTime();
      return evtTs <= lastRevealedTs;
    });
  }, [data, chartData]);

  if (!chartData.length) return null;

  return (
    <div className="relative flex flex-col" style={{ backgroundColor: "#1a1a2e" }}>
      {/* Chart label */}
      <div className="px-3 pt-2 pb-0.5 flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-widest font-mono text-stone-500">
          Variant Proportions &amp; Case Volume (US)
        </span>
        <span className="text-[8px] font-mono text-sky-400/50">
          ── cases
        </span>
      </div>

      {/* Chart area */}
      <div className="px-1" style={{ height: "200px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 4, right: 4, bottom: 0, left: -10 }}
          >
            <defs>
              {VARIANT_KEYS.map((key) => {
                const color = data.variant_meta?.[key]?.color || "#94a3b8";
                return (
                  <linearGradient
                    key={key}
                    id={`grad-${key}`}
                    x1="0" y1="0" x2="0" y2="1"
                  >
                    <stop offset="5%" stopColor={color} stopOpacity={0.7} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.4} />
                  </linearGradient>
                );
              })}
            </defs>

            <XAxis
              dataKey="date"
              tickFormatter={formatTick}
              tick={{ fill: "#64748b", fontSize: 8, fontFamily: "monospace" }}
              axisLine={{ stroke: "#3a3a5a" }}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={60}
            />

            {/* Left Y-axis: variant proportions (0–100%) */}
            <YAxis
              yAxisId="left"
              domain={[0, 100]}
              ticks={[0, 50, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fill: "#64748b", fontSize: 8, fontFamily: "monospace" }}
              axisLine={false}
              tickLine={false}
              width={32}
            />

            {/* Right Y-axis: weekly new cases (dynamic) */}
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, casesYMax]}
              tickFormatter={abbreviateNumber}
              tick={{ fill: "#38bdf8", fontSize: 7, fontFamily: "monospace", fillOpacity: 0.5 }}
              axisLine={false}
              tickLine={false}
              width={36}
            />

            {/* Stacked variant areas — bottom (wildtype) to top (bq) */}
            {VARIANT_KEYS.map((key) => {
              const color = data.variant_meta?.[key]?.color || "#94a3b8";
              return (
                <Area
                  key={key}
                  yAxisId="left"
                  type="monotone"
                  dataKey={key}
                  stackId="1"
                  stroke={color}
                  strokeWidth={0.5}
                  fill={`url(#grad-${key})`}
                  dot={false}
                  isAnimationActive={false}
                />
              );
            })}

            {/* Case volume overlay line */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cases"
              stroke="#38bdf8"
              strokeWidth={1.5}
              strokeOpacity={0.7}
              dot={false}
              isAnimationActive={false}
            />

            {/* MAB event reference lines */}
            {visibleEvents.map((evt, i) => (
              <ReferenceLine
                key={`mab-${i}`}
                yAxisId="left"
                x={evt.date}
                stroke={evt.type === "grant" ? "#22c55e" : "#ef4444"}
                strokeWidth={1}
                strokeDasharray="4 2"
                strokeOpacity={0.6}
              />
            ))}

            {/* Scroll cursor at the leading edge */}
            {cursorDate && (
              <ReferenceLine
                yAxisId="left"
                x={cursorDate}
                stroke="#ffffff"
                strokeWidth={1}
                strokeOpacity={0.4}
                strokeDasharray="3 3"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Annotation bar */}
      <div
        className="flex items-center justify-center gap-3 py-1.5 text-[10px] font-mono flex-wrap"
        style={{ backgroundColor: "#12121f" }}
      >
        {annotation && (
          <>
            <span className="text-stone-500">
              {formatDateFull(annotation.date)}
            </span>
            <span className="text-stone-700">|</span>
            <span className="font-medium" style={{ color: annotation.dominantColor }}>
              {annotation.dominantLabel} {annotation.dominantPct}%
            </span>
            <span className="text-stone-700">|</span>
            <span className="text-sky-400/80 font-medium">
              {formatNumber(annotation.cases)} cases
            </span>
            {annotation.lastEvent && (
              <>
                <span className="text-stone-700">|</span>
                <span
                  className={`font-medium ${
                    annotation.lastEvent.type === "revoke"
                      ? "text-red-400/80"
                      : "text-emerald-400/80"
                  }`}
                >
                  {annotation.lastEvent.label}
                </span>
              </>
            )}
          </>
        )}
        {!annotation && (
          <span className="text-stone-600 text-[9px] uppercase tracking-widest">
            Variant &amp; Case Tracker
          </span>
        )}
      </div>
    </div>
  );
}
