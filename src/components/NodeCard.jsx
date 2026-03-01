export default function NodeCard({ node, type, index, onOpenOverlay }) {
  const isClinical = type === "clinical";
  const hasEmbed = !!node.embed;

  return (
    <div
      className={`rounded-lg p-5 border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
        isClinical
          ? `bg-[var(--color-clinical-muted)] border-[var(--color-clinical-border)]`
          : `bg-[var(--color-personal-muted)] border-[var(--color-personal-border)]`
      } ${hasEmbed ? `node-clickable ${isClinical ? "is-clinical" : "is-personal"}` : ""}`}
      style={{
        animation: `fade-in-up 0.5s ease-out ${index * 0.08}s both`,
      }}
      onClick={hasEmbed && onOpenOverlay ? () => onOpenOverlay(node) : undefined}
    >
      {/* Date badge */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium tracking-wide shrink-0 ${
            isClinical
              ? "bg-[var(--color-clinical)]/10 text-[var(--color-clinical)]"
              : "bg-[var(--color-personal)]/10 text-[var(--color-personal)]"
          }`}
        >
          {node.date}
        </span>
        {hasEmbed && (
          <span className={`text-[10px] font-semibold shrink-0 ${isClinical ? "text-[var(--color-clinical)]" : "text-[var(--color-personal)]"}`}>
            View source ↗
          </span>
        )}
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
      <p className="text-sm leading-relaxed text-stone-700">{node.content}</p>
    </div>
  );
}
