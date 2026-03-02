import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
  ResponsiveContainer,
} from "recharts";

// ─── Date parsing & formatting helpers ────────────────────────────────────────

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTHS_MAP = {
  january: 0, february: 1, march: 2, april: 3,
  may: 4, june: 5, july: 6, august: 7,
  september: 8, october: 9, november: 10, december: 11,
};

/** Parse any node date string into a timestamp (mirrors Chapter.jsx logic) */
function parseNodeDate(dateStr) {
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

function formatDateShort(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function formatDateFull(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatNumber(n) {
  if (n == null || isNaN(n)) return "—";
  return n.toLocaleString();
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-stone-200 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-stone-700 mb-1">{formatDateFull(row.d)}</p>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-stone-400 shrink-0" />
        <span className="text-stone-500">Global:</span>
        <span className="font-mono font-medium text-stone-700">{formatNumber(row.g)}</span>
        <span className="text-stone-400">/day</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
        <span className="text-stone-500">US:</span>
        <span className="font-mono font-medium text-stone-700">{formatNumber(row.u)}</span>
        <span className="text-stone-400">/day</span>
      </div>
    </div>
  );
}

// ─── Custom cursor dot rendered on the US line ────────────────────────────────

function CursorDot({ cx, cy }) {
  if (cx == null || cy == null) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill="#dc2626" opacity={0.15} />
      <circle cx={cx} cy={cy} r={4} fill="#dc2626" opacity={0.9} />
    </g>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CaseChart({ data, currentDate, startDate, endDate, isVisible }) {
  // Filter data to this chapter's date range
  const chapterData = useMemo(() => {
    if (!data?.length) return [];
    return data.filter((row) => row.d >= startDate && row.d <= endDate);
  }, [data, startDate, endDate]);

  // Find the data point closest to the current scroll date
  const currentPoint = useMemo(() => {
    if (!currentDate || !chapterData.length) return null;

    // Use parseNodeDate to handle "Early January 2020" style dates
    const targetTs = parseNodeDate(currentDate);
    if (!targetTs) return chapterData[0];

    let closest = chapterData[0];
    let closestDist = Infinity;

    for (const row of chapterData) {
      const rowTs = new Date(row.d + "T00:00:00").getTime();
      const dist = Math.abs(rowTs - targetTs);
      if (dist < closestDist) {
        closestDist = dist;
        closest = row;
      }
    }
    return closest;
  }, [currentDate, chapterData]);

  // X-axis tick formatter — show month abbreviations
  const tickFormatter = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    const day = d.getDate();
    // Show month name on the 1st or 15th, otherwise just day
    if (day === 1 || day === 15) {
      return `${SHORT_MONTHS[d.getMonth()]} ${day}`;
    }
    return "";
  };

  // Determine which ticks to show (evenly spaced ~5 ticks)
  const ticks = useMemo(() => {
    if (!chapterData.length) return [];
    const step = Math.max(1, Math.floor(chapterData.length / 5));
    const result = [];
    for (let i = 0; i < chapterData.length; i += step) {
      result.push(chapterData[i].d);
    }
    // Always include the last date
    const last = chapterData[chapterData.length - 1].d;
    if (!result.includes(last)) result.push(last);
    return result;
  }, [chapterData]);

  if (!chapterData.length) return null;

  return (
    <div
      className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-stone-200/60"
      style={{
        animation: isVisible ? "fade-in-up 0.5s ease-out 0.5s both" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-2 pb-1">
        {/* Chart header */}
        <p className="text-[9px] uppercase tracking-widest text-stone-400 font-semibold mb-1 text-center">
          Daily New Cases <span className="text-stone-300 font-normal">(7-day avg)</span>
        </p>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart
            data={chapterData}
            margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
          >
            {/* Global cases — background layer */}
            <Area
              type="monotone"
              dataKey="g"
              stroke="#a8a29e"
              strokeWidth={1.5}
              fill="#d6d3d1"
              fillOpacity={0.2}
              isAnimationActive={false}
              dot={false}
              activeDot={false}
            />

            {/* US cases — foreground layer */}
            <Area
              type="monotone"
              dataKey="u"
              stroke="#dc2626"
              strokeWidth={2}
              fill="#fca5a5"
              fillOpacity={0.25}
              isAnimationActive={false}
              dot={false}
              activeDot={false}
            />

            <XAxis
              dataKey="d"
              ticks={ticks}
              tickFormatter={(d) => formatDateShort(d)}
              tick={{ fontSize: 10, fill: "#a8a29e" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />

            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: "#d6d3d1", strokeDasharray: "3 3" }}
            />

            {/* Scroll-synced cursor line */}
            {currentPoint && (
              <ReferenceLine
                x={currentPoint.d}
                stroke="#dc2626"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                opacity={0.7}
              />
            )}

            {/* Cursor dot on US line */}
            {currentPoint && (
              <ReferenceDot
                x={currentPoint.d}
                y={currentPoint.u}
                r={0}
                shape={<CursorDot />}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>

        {/* Annotation bar */}
        <div className="flex items-center justify-center gap-4 pb-2 text-[10px] font-mono text-stone-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-[2px] bg-stone-400 rounded-full shrink-0" />
            <span>Global</span>
            {currentPoint && (
              <span className="text-stone-500 font-medium">
                {formatNumber(currentPoint.g)}/day
              </span>
            )}
          </div>

          <span className="text-stone-300">·</span>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-[2px] bg-red-500 rounded-full shrink-0" />
            <span>US</span>
            {currentPoint && (
              <span className="text-stone-500 font-medium">
                {formatNumber(currentPoint.u)}/day
              </span>
            )}
          </div>

          {currentPoint && (
            <>
              <span className="text-stone-300">·</span>
              <span className="text-stone-500">{formatDateFull(currentPoint.d)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
