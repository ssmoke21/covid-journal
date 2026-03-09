function EmbedIcon({ type }) {
  if (type === "tweet") {
    // X (Twitter) logo
    return (
      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (type === "iframe") {
    // Newspaper / article icon
    return (
      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
        <path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z" />
      </svg>
    );
  }
  // Link / external icon
  return (
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function embedFooterLabel(embed) {
  if (embed.type === "tweet") return "View on X";
  return embed.label || "View source";
}

export default function NodeCard({ node, type, index, onOpenOverlay, linked }) {
  const isClinical = type === "clinical";
  const hasEmbed = !!node.embed;
  const hasPreview = !!node.preview;
  const isClickable = hasEmbed || hasPreview || !!linked;

  return (
    <div
      className={`rounded-lg border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
        isClinical
          ? `bg-[var(--color-clinical-muted)] border-[var(--color-clinical-border)]`
          : `bg-[var(--color-personal-muted)] border-[var(--color-personal-border)]`
      } ${isClickable ? `node-clickable ${isClinical ? "is-clinical" : "is-personal"}` : ""}`}
      style={{
        animation: `fade-in-up 0.5s ease-out ${index * 0.08}s both`,
      }}
      onClick={isClickable && onOpenOverlay ? () => onOpenOverlay(node) : undefined}
    >
      {/* Card body */}
      <div className="p-5">
        {/* Date badge */}
        <div className="mb-2">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium tracking-wide ${
              isClinical
                ? "bg-[var(--color-clinical)]/10 text-[var(--color-clinical)]"
                : "bg-[var(--color-personal)]/10 text-[var(--color-personal)]"
            }`}
          >
            {node.date}
          </span>
        </div>

        {/* Label */}
        <h4
          className={`text-sm font-semibold mb-1.5 ${
            isClinical
              ? "text-[var(--color-clinical)]"
              : "text-[var(--color-personal)]"
          }`}
        >
          {node.label}
        </h4>

        {/* Content */}
        <p className="text-sm leading-relaxed text-stone-700">{node.preview ?? node.content}</p>
      </div>

      {/* Linked footer strip (linked nodes with no embed or preview) */}
      {linked && !hasEmbed && !hasPreview && (
        <div
          className={`flex items-center gap-2 px-5 py-2.5 border-t text-xs font-medium ${
            isClinical
              ? "bg-[var(--color-clinical)]/8 border-[var(--color-clinical-border)] text-[var(--color-clinical)]"
              : "bg-[var(--color-personal)]/8 border-[var(--color-personal-border)] text-[var(--color-personal)]"
          }`}
        >
          <span>↔ View linked story</span>
          <svg className="w-3 h-3 shrink-0 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17 17 7M7 7h10v10" />
          </svg>
        </div>
      )}

      {/* Read-more footer strip (preview-only nodes) */}
      {hasPreview && !hasEmbed && (
        <div
          className={`flex items-center gap-2 px-5 py-2.5 border-t text-xs font-medium ${
            isClinical
              ? "bg-[var(--color-clinical)]/8 border-[var(--color-clinical-border)] text-[var(--color-clinical)]"
              : "bg-[var(--color-personal)]/8 border-[var(--color-personal-border)] text-[var(--color-personal)]"
          }`}
        >
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
          <span>Read more</span>
          <svg className="w-3 h-3 shrink-0 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17 17 7M7 7h10v10" />
          </svg>
        </div>
      )}

      {/* Embed footer strip */}
      {hasEmbed && (
        <div
          className={`flex items-center gap-2 px-5 py-2.5 border-t text-xs font-medium ${
            isClinical
              ? "bg-[var(--color-clinical)]/8 border-[var(--color-clinical-border)] text-[var(--color-clinical)]"
              : "bg-[var(--color-personal)]/8 border-[var(--color-personal-border)] text-[var(--color-personal)]"
          }`}
        >
          <EmbedIcon type={node.embed.type} />
          <span className="truncate">
            {node.secondary_embed ? "2 sources" : embedFooterLabel(node.embed)}
          </span>
          <svg className="w-3 h-3 shrink-0 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17 17 7M7 7h10v10" />
          </svg>
        </div>
      )}
    </div>
  );
}
