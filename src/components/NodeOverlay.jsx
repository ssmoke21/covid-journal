import { useEffect, useRef } from "react";

function EmbedSection({ embedNode }) {
  const tweetRef = useRef(null);

  useEffect(() => {
    if (!embedNode?.embed || embedNode.embed.type !== "tweet") return;
    const tweetId = embedNode.embed.url.match(/status\/(\d+)/)?.[1];
    if (!tweetId || !tweetRef.current) return;

    const render = () => {
      if (!tweetRef.current) return;
      tweetRef.current.innerHTML = "";
      window.twttr.widgets.createTweet(tweetId, tweetRef.current, {
        theme: "light",
        align: "center",
        conversation: "none",
      });
    };

    if (window.twttr?.widgets) {
      render();
    } else if (document.querySelector('script[src*="platform.twitter.com/widgets.js"]')) {
      window.addEventListener("load", render, { once: true });
    } else {
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.charset = "utf-8";
      script.onload = render;
      document.head.appendChild(script);
    }
  }, [embedNode]);

  if (!embedNode?.embed) return null;
  const { embed } = embedNode;

  return (
    <>
      {embed.type === "tweet" && (
        <div className="border-t border-stone-100 px-6 py-5">
          <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-3 font-semibold">Primary Source</p>
          <div ref={tweetRef} className="flex justify-center min-h-[120px] items-center">
            <span className="text-sm text-stone-300">Loading post…</span>
          </div>
        </div>
      )}

      {embed.type === "iframe" && (
        <div className="border-t border-stone-100">
          <div className="flex items-center justify-between px-6 py-3">
            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">Primary Source</p>
            <a
              href={embed.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-stone-400 hover:text-stone-600 transition-colors flex items-center gap-1"
            >
              {embed.label}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
          <iframe
            src={embed.url}
            title={embedNode.label}
            className="w-full border-0"
            style={{ height: "520px" }}
            loading="lazy"
          />
        </div>
      )}

      {embed.type === "image" && (
        <div className="border-t border-stone-100">
          <img
            src={`${import.meta.env.BASE_URL}${embed.url}`}
            alt={embed.caption || embedNode.label}
            className="w-full object-cover"
            style={{ maxHeight: "420px" }}
          />
          {embed.caption && (
            <p className="px-6 py-2 text-[10px] text-stone-400 font-mono uppercase tracking-widest text-center">
              {embed.caption}
            </p>
          )}
          {embedNode.secondary_embed && (
            <div className="px-6 pb-4">
              <a
                href={embedNode.secondary_embed.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-stone-50 border border-stone-200 hover:bg-stone-100 hover:border-stone-300 transition-all duration-200 group"
              >
                <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900">{embedNode.secondary_embed.label}</span>
                <svg className="w-4 h-4 text-stone-400 group-hover:text-stone-600 shrink-0 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}
        </div>
      )}

      {embed.type === "gallery" && (
        <div className="border-t border-stone-100 p-3">
          <div className="grid grid-cols-2 gap-2">
            {embed.photos.map((photo, i) => (
              <img
                key={i}
                src={`${import.meta.env.BASE_URL}${photo.url}`}
                alt={photo.caption || ""}
                className="w-full object-cover rounded-lg"
                style={{ height: "160px" }}
              />
            ))}
          </div>
        </div>
      )}

      {embed.type === "link" && (
        <div className="border-t border-stone-100 px-6 py-5">
          <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-3 font-semibold">
            {embedNode.secondary_embed ? "Sources" : "Primary Source"}
          </p>
          <div className="flex flex-col gap-2">
            {[embed, ...(embedNode.secondary_embed ? [embedNode.secondary_embed] : [])].map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-stone-50 border border-stone-200 hover:bg-stone-100 hover:border-stone-300 transition-all duration-200 group"
              >
                <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900">{src.label}</span>
                <svg className="w-4 h-4 text-stone-400 group-hover:text-stone-600 shrink-0 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function NodeOverlay({ node, onClose }) {
  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!node) return null;

  const isPaired = !!node.pairedNode;
  const clinical = isPaired ? (node.type === "clinical" ? node : node.pairedNode) : null;
  const personal = isPaired ? (node.type === "personal" ? node : node.pairedNode) : null;
  const embedNode = isPaired
    ? (clinical?.embed ? clinical : personal?.embed ? personal : null)
    : (node.embed ? node : null);

  const hasIframe = embedNode?.embed?.type === "iframe";
  const hasImage = embedNode?.embed?.type === "image" || embedNode?.embed?.type === "gallery";
  const hasSections = !isPaired && !!node.sections?.length;
  const modalWidth = hasIframe ? "max-w-3xl" : isPaired ? "max-w-2xl" : (hasSections || hasImage) ? "max-w-2xl" : "max-w-md";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`bg-white rounded-2xl shadow-2xl w-full overflow-hidden ${modalWidth}`}>

        {/* ── Paired (linked) overlay ── */}
        {isPaired ? (
          <>
            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-6 pb-4">
              <span className="inline-block text-[10px] font-mono text-stone-400 uppercase tracking-wide">
                {clinical?.date ?? personal?.date}
              </span>
              <button
                onClick={onClose}
                className="text-stone-300 hover:text-stone-600 transition-colors ml-4 shrink-0"
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Two-column body */}
            <div className="flex" style={{ maxHeight: "60vh" }}>

              {/* Clinical column (left) */}
              <div className="flex-1 overflow-y-auto px-6 pb-5">
                <p className="text-[9px] uppercase tracking-widest font-bold mb-1.5" style={{ color: "var(--color-clinical)" }}>
                  Clinical
                </p>
                <h3 className="text-base font-bold mb-1.5" style={{ color: "var(--color-clinical)" }}>
                  {clinical?.label}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">{clinical?.content}</p>
              </div>

              {/* Vertical amber dashed divider with ↔ centered */}
              <div className="relative w-5 shrink-0">
                <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 border-l border-dashed border-amber-300" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-amber-400 text-xs font-bold leading-none py-0.5">↔</div>
              </div>

              {/* Personal column (right) */}
              <div className="flex-1 overflow-y-auto px-6 pb-5">
                <p className="text-[9px] uppercase tracking-widest font-bold mb-1.5" style={{ color: "var(--color-personal)" }}>
                  Personal
                </p>
                <h3 className="text-base font-bold mb-1.5" style={{ color: "var(--color-personal)" }}>
                  {personal?.label}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">{personal?.content}</p>
              </div>

            </div>

            {/* Embed if any */}
            <EmbedSection embedNode={embedNode} />
          </>
        ) : (
          <>
            {/* ── Standard single-node overlay ── */}
            <div className="flex items-start justify-between px-6 pt-6 pb-3">
              <div>
                <span className="inline-block text-[10px] font-mono text-stone-400 mb-1 uppercase tracking-wide">
                  {node.date}
                </span>
                <h3 className="text-lg font-bold text-stone-900">{node.label}</h3>
              </div>
              <button
                onClick={onClose}
                className="text-stone-300 hover:text-stone-600 transition-colors ml-4 mt-1 shrink-0"
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {hasSections ? (
              <div className="px-6 pb-5 overflow-y-auto space-y-5" style={{ maxHeight: "65vh" }}>
                {node.sections.map((section, i) => (
                  <div key={i}>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-1">
                      {section.title}
                    </p>
                    <p className="text-sm text-stone-600 leading-relaxed">{section.text}</p>
                    {section.image && (
                      <img
                        src={`${import.meta.env.BASE_URL}${section.image}`}
                        alt={section.title}
                        className="w-full object-cover rounded-lg mt-3"
                        style={{ maxHeight: "220px" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-6 pb-5 text-sm text-stone-600 leading-relaxed">{node.content}</p>
            )}

            <EmbedSection embedNode={node.embed ? node : null} />
          </>
        )}
      </div>
    </div>
  );
}
