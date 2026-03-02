import { Fragment, useState } from "react";
import NodeCard from "./NodeCard";
import NodeOverlay from "./NodeOverlay";

const MOOD_GRADIENTS = {
  "Normalcy / Low-Alert": "from-blue-50 to-transparent",
  "High-Alert / Acceleration": "from-amber-50 to-transparent",
  "Chaos / Urgency": "from-red-50 to-transparent",
  "Isolation / Grief": "from-indigo-50 to-transparent",
  "Hope / Attrition": "from-emerald-50 to-transparent",
  "Hope / Joy": "from-yellow-50 to-transparent",
  "Conflict / Vindication": "from-pink-50 to-transparent",
};

const MOOD_ICONS = {
  "Normalcy / Low-Alert": "🌤",
  "High-Alert / Acceleration": "⚡",
  "Chaos / Urgency": "🔥",
  "Isolation / Grief": "🌑",
  "Hope / Attrition": "🛡️",
  "Hope / Joy": "💉",
  "Conflict / Vindication": "⚖️",
};

// ─── Date helpers ────────────────────────────────────────────────────────────

function parseNodeDate(dateStr) {
  if (!dateStr) return 0;
  const iso = new Date(dateStr + "T00:00:00");
  if (!isNaN(iso)) return iso.getTime();

  const lower = dateStr.toLowerCase();
  const MONTHS = {
    january: 0, february: 1, march: 2, april: 3,
    may: 4, june: 5, july: 6, august: 7,
    september: 8, october: 9, november: 10, december: 11,
  };

  if (lower.includes("summer")) { const y = dateStr.match(/\d{4}/)?.[0]; return y ? new Date(+y, 6, 1).getTime() : 0; }
  if (lower.includes("spring")) { const y = dateStr.match(/\d{4}/)?.[0]; return y ? new Date(+y, 3, 1).getTime() : 0; }
  if (lower.includes("winter")) { const y = dateStr.match(/\d{4}/)?.[0]; return y ? new Date(+y, 0, 1).getTime() : 0; }
  if (lower.includes("fall") || lower.includes("autumn")) { const y = dateStr.match(/\d{4}/)?.[0]; return y ? new Date(+y, 9, 1).getTime() : 0; }

  for (const [name, idx] of Object.entries(MONTHS)) {
    if (lower.includes(name)) {
      const y = dateStr.match(/\d{4}/)?.[0];
      if (!y) continue;
      let day = 15;
      if (lower.includes("early")) day = 5;
      else if (lower.includes("late")) day = 25;
      return new Date(+y, idx, day).getTime();
    }
  }

  const yearOnly = dateStr.match(/^(\d{4})$/);
  if (yearOnly) return new Date(+yearOnly[1], 6, 1).getTime();
  return 0;
}

// Formats a raw date string into a compact 2-line spine label
function formatSpineDate(dateStr) {
  if (!dateStr) return "";
  const lower = dateStr.toLowerCase();

  const SHORT_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  // "Circa …" or "~"
  const isCirca = lower.includes("circa") || lower.startsWith("~");
  const isEarly = lower.includes("early");
  const isLate  = lower.includes("late");
  const isMid   = lower.includes("mid");

  // ISO date YYYY-MM-DD
  const iso = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const d = new Date(dateStr + "T00:00:00");
    const mon = SHORT_MONTHS[d.getMonth()];
    const day = d.getDate();
    const yr  = String(d.getFullYear()).slice(2);
    return `${mon} ${day}\n'${yr}`;
  }

  const yearMatch = dateStr.match(/\d{4}/);
  const yr = yearMatch ? `'${String(yearMatch[0]).slice(2)}` : "";

  for (const [name, idx] of Object.entries({
    january:0,february:1,march:2,april:3,may:4,june:5,
    july:6,august:7,september:8,october:9,november:10,december:11,
  })) {
    if (lower.includes(name)) {
      const mon = SHORT_MONTHS[idx];
      const prefix = isCirca ? "~" : isEarly ? "Early" : isLate ? "Late" : isMid ? "Mid" : "";
      return prefix ? `${prefix}\n${mon} ${yr}` : `${mon}\n${yr}`;
    }
  }

  if (lower.includes("summer")) return `Summer\n${yr}`;
  if (lower.includes("spring")) return `Spring\n${yr}`;
  if (lower.includes("winter")) return `Winter\n${yr}`;
  if (lower.includes("fall") || lower.includes("autumn")) return `Fall\n${yr}`;

  return dateStr;
}

// ─── Row builder ─────────────────────────────────────────────────────────────

function buildChronologicalRows(clinicalNodes, personalNodes) {
  const clinical = clinicalNodes.map((n) => ({ ...n, type: "clinical", ts: parseNodeDate(n.date) }));
  const personal = personalNodes.map((n) => ({ ...n, type: "personal", ts: parseNodeDate(n.date) }));

  clinical.sort((a, b) => a.ts - b.ts);
  personal.sort((a, b) => a.ts - b.ts);

  const rows = [];
  let ci = 0, pi = 0;
  while (ci < clinical.length || pi < personal.length) {
    const c = clinical[ci], p = personal[pi];
    if (!c)            { rows.push({ clinical: null, personal: p }); pi++; }
    else if (!p)       { rows.push({ clinical: c, personal: null }); ci++; }
    else if (c.ts === p.ts) {
      const linked = !!(c.link_group && p.link_group && c.link_group === p.link_group);
      rows.push({ clinical: c, personal: p, linked });
      ci++; pi++;
    }
    else if (c.ts < p.ts)   { rows.push({ clinical: c, personal: null }); ci++; }
    else                    { rows.push({ clinical: null, personal: p }); pi++; }
  }
  return rows;
}

// ─── Chapter shell ────────────────────────────────────────────────────────────

export default function Chapter({ chapter, isVisible }) {
  const isSplit = chapter.layout === "split";
  const gradient = MOOD_GRADIENTS[chapter.mood] || "from-stone-50 to-transparent";
  const icon = MOOD_ICONS[chapter.mood] || "📖";
  const [overlayNode, setOverlayNode] = useState(null);

  return (
    <section id={`chapter-${chapter.chapter_number}`} className="relative scroll-mt-8">
      <div className={`absolute inset-0 bg-gradient-to-b ${gradient} pointer-events-none -z-10 rounded-3xl`} />

      <header className="pt-16 pb-10 px-4 md:px-8 text-center max-w-3xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-stone-200 text-xs font-mono text-stone-500 mb-4"
          style={{ animation: isVisible ? "fade-in-up 0.5s ease-out both" : "none" }}
        >
          <span className="text-base">{icon}</span>
          <span>Chapter {chapter.chapter_number}</span>
          <span className="text-stone-300">|</span>
          <span>{chapter.date_range}</span>
        </div>

        <h2
          className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-stone-900 mb-2"
          style={{ animation: isVisible ? "fade-in-up 0.5s ease-out 0.1s both" : "none" }}
        >
          {chapter.title}
        </h2>

        <p
          className="font-serif text-lg md:text-xl text-stone-500 italic mb-6"
          style={{ animation: isVisible ? "fade-in-up 0.5s ease-out 0.2s both" : "none" }}
        >
          {chapter.subtitle}
        </p>

        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/60 border border-stone-200"
          style={{ animation: isVisible ? "fade-in-up 0.5s ease-out 0.3s both" : "none" }}
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Mood</span>
          <span className="text-xs text-stone-600 font-medium">{chapter.mood}</span>
        </div>

        <p
          className="mt-4 text-sm text-stone-500 max-w-xl mx-auto leading-relaxed"
          style={{ animation: isVisible ? "fade-in-up 0.5s ease-out 0.4s both" : "none" }}
        >
          {chapter.mood_description}
        </p>
      </header>

      <div className="px-4 md:px-8 pb-16">
        {isSplit
          ? <SplitLayout chapter={chapter} isVisible={isVisible} onOpenOverlay={setOverlayNode} />
          : <FullLayout chapter={chapter} isVisible={isVisible} onOpenOverlay={setOverlayNode} />
        }
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent" />

      {overlayNode && (
        <NodeOverlay node={overlayNode} onClose={() => setOverlayNode(null)} />
      )}
    </section>
  );
}

// ─── Split layout with center date spine ─────────────────────────────────────

function SpineCell({ row, isFirst, isLast }) {
  // Pick whichever node exists to source the date label
  const node = row.clinical || row.personal;
  const hasBoth = !!(row.clinical && row.personal);
  const label = formatSpineDate(node?.date ?? "");
  const lines = label.split("\n");

  // Dot color: both = neutral stone, clinical only = blue, personal only = rose
  const dotColor = hasBoth
    ? "bg-stone-400 ring-stone-300"
    : row.clinical
    ? "bg-[var(--color-clinical)] ring-[var(--color-clinical-border)]"
    : "bg-[var(--color-personal)] ring-[var(--color-personal-border)]";

  return (
    <div className="hidden lg:flex flex-col items-center relative select-none">
      {/* Continuous vertical line — top half */}
      <div
        className={`w-px flex-1 ${isFirst ? "bg-gradient-to-b from-transparent to-stone-300" : "bg-stone-200"}`}
      />

      {/* Dot + date label */}
      <div className="flex flex-col items-center gap-1.5 py-2 z-10">
        {row.linked ? (
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-50 ring-2 ring-amber-300 ring-offset-1 text-amber-500 text-[10px] font-bold leading-none">
            ↔
          </div>
        ) : (
          <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-offset-1 ${dotColor}`} />
        )}
        <div className="flex flex-col items-center gap-0">
          {lines.map((line, i) => (
            <span key={i} className="text-[9px] leading-tight font-mono text-stone-400 text-center whitespace-nowrap">
              {line}
            </span>
          ))}
        </div>
      </div>

      {/* Continuous vertical line — bottom half */}
      <div
        className={`w-px flex-1 ${isLast ? "bg-gradient-to-b from-stone-300 to-transparent" : "bg-stone-200"}`}
      />

    </div>
  );
}

function SplitLayout({ chapter, onOpenOverlay }) {
  const rows = buildChronologicalRows(chapter.clinical_nodes, chapter.personal_nodes);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Column headers — 3 cols on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_80px_1fr] gap-x-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[var(--color-clinical)]" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-clinical)]">
            Clinical Timeline
          </h3>
          <div className="flex-1 h-px bg-[var(--color-clinical-border)]" />
        </div>

        {/* Center header: just a label above the spine */}
        <div className="hidden lg:flex flex-col items-center justify-end pb-1">
          <span className="text-[9px] uppercase tracking-widest font-semibold text-stone-300">Date</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-[var(--color-personal-border)]" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-personal)]">
            Personal Timeline
          </h3>
          <div className="w-3 h-3 rounded-full bg-[var(--color-personal)]" />
        </div>
      </div>

      {/* Chronological 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_80px_1fr] gap-x-4 gap-y-4">
        {rows.map((row, i) => (
          <Fragment key={i}>
            {/* Clinical cell */}
            <div className="flex flex-col justify-center">
              {row.clinical && (
                <NodeCard
                  node={row.clinical}
                  type="clinical"
                  index={i}
                  linked={!!row.linked}
                  onOpenOverlay={(n) => onOpenOverlay(row.linked ? { ...n, pairedNode: row.personal } : n)}
                />
              )}
            </div>

            {/* Center spine */}
            <SpineCell row={row} isFirst={i === 0} isLast={i === rows.length - 1} />

            {/* Personal cell */}
            <div className="flex flex-col justify-center">
              {row.personal && (
                <NodeCard
                  node={row.personal}
                  type="personal"
                  index={i}
                  linked={!!row.linked}
                  onOpenOverlay={(n) => onOpenOverlay(row.linked ? { ...n, pairedNode: row.clinical } : n)}
                />
              )}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── Full layout (chapters 5 & 7) ────────────────────────────────────────────

function FullLayout({ chapter, onOpenOverlay }) {
  const allNodes = [
    ...chapter.clinical_nodes.map((n) => ({ ...n, type: "clinical" })),
    ...chapter.personal_nodes.map((n) => ({ ...n, type: "personal" })),
  ].sort((a, b) => parseNodeDate(a.date) - parseNodeDate(b.date));

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-center gap-6 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[var(--color-clinical)]" />
          <span className="text-xs font-medium text-stone-500">Clinical</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[var(--color-personal)]" />
          <span className="text-xs font-medium text-stone-500">Personal</span>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-stone-300 via-stone-200 to-transparent" />
        <div className="flex flex-col gap-6">
          {allNodes.map((node, i) => (
            <div key={i} className="relative pl-14">
              <div
                className={`absolute left-[18px] top-5 w-3 h-3 rounded-full border-2 bg-white ${
                  node.type === "clinical"
                    ? "border-[var(--color-clinical-accent)]"
                    : "border-[var(--color-personal-accent)]"
                }`}
              />
              <NodeCard node={node} type={node.type} index={i} onOpenOverlay={onOpenOverlay} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
