import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { parseNodeDate, findDateIndex } from "./CaseMap";

// ─── Short month formatter ──────────────────────────────────────────────────

const SHORT_MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

function formatTick(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}`;
}

// ─── Main component ──────────────────────────────────────────────────────────

/**
 * Area chart showing hospital COVID-19 census (positive + PUI).
 * Rendered in embedded mode inside MapVisualization.
 *
 * @param {Object} props
 * @param {Object} props.data - Hospital data with dates, positive, pui arrays
 * @param {string} props.currentDate - Current timeline node date string
 */
export default function HospitalChart({ data, currentDate }) {
  // Build chart data array
  const chartData = useMemo(() => {
    if (!data?.dates?.length) return [];
    return data.dates.map((d, i) => ({
      date: d,
      positive: data.positive[i] ?? null,
      pui: data.pui[i] ?? null,
    }));
  }, [data]);

  // Find current position for the reference line
  const cursorDate = useMemo(() => {
    if (!currentDate || !data?.dates?.length) return null;
    const targetTs = parseNodeDate(currentDate);
    if (!targetTs) return null;
    const idx = findDateIndex(data.dates, targetTs);
    return data.dates[idx];
  }, [currentDate, data]);

  // Current positive count for annotation
  const currentPositive = useMemo(() => {
    if (!cursorDate || !data?.dates?.length) return null;
    const idx = data.dates.indexOf(cursorDate);
    if (idx < 0) return null;
    return data.positive[idx];
  }, [cursorDate, data]);

  if (!chartData.length) return null;

  return (
    <div className="relative flex flex-col h-full" style={{ backgroundColor: "#1a1a2e" }}>
      {/* Chart label */}
      <div className="px-3 pt-2 pb-0.5">
        <span className="text-[9px] uppercase tracking-widest font-mono text-stone-500">
          Hospital Census
        </span>
      </div>

      {/* Chart area */}
      <div className="flex-1 min-h-0 px-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 4, right: 8, bottom: 0, left: -10 }}
          >
            <defs>
              <linearGradient id="gradPositive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="gradPui" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="date"
              tickFormatter={formatTick}
              tick={{ fill: "#64748b", fontSize: 8, fontFamily: "monospace" }}
              axisLine={{ stroke: "#3a3a5a" }}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 8, fontFamily: "monospace" }}
              axisLine={false}
              tickLine={false}
              width={32}
            />

            {/* PUI area (behind positive) */}
            <Area
              type="monotone"
              dataKey="pui"
              stroke="#f59e0b"
              strokeWidth={1}
              fill="url(#gradPui)"
              dot={false}
              connectNulls
              name="PUI"
            />

            {/* Positive cases area */}
            <Area
              type="monotone"
              dataKey="positive"
              stroke="#dc2626"
              strokeWidth={1.5}
              fill="url(#gradPositive)"
              dot={false}
              connectNulls
              name="COVID+"
            />

            {/* Scroll cursor */}
            {cursorDate && (
              <ReferenceLine
                x={cursorDate}
                stroke="#ffffff"
                strokeWidth={1}
                strokeOpacity={0.4}
                strokeDasharray="3 3"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 px-3 pb-1.5 pt-0.5">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#dc2626" }} />
          <span className="text-[8px] font-mono text-stone-500">
            COVID+ {currentPositive != null ? `(${currentPositive})` : ""}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
          <span className="text-[8px] font-mono text-stone-500">PUI</span>
        </div>
      </div>
    </div>
  );
}
