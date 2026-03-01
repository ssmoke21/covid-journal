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

      {embed.type === "link" && (
        <div className="border-t border-stone-100 px-6 py-5">
          <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-3 font-semibold">Primary Source</p>
          <a
            href={embed.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-stone-50 border border-stone-200 hover:bg-stone-100 hover:border-stone-300 transition-all duration-200 group"
          >
            <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900">{embed.label}</span>
            <svg className="w-4 h-4 text-stone-400 group-hover:text-stone-600 shrink-0 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
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
  const modalWidth = hasIframe ? "max-w-3xl" : isPaired ? "max-w-lg" : "max-w-md";

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

            {/* Clinical (Objective) section */}
            <div className="px-6 pb-5">
              <p className="text-[9px] uppercase tracking-widest font-bold mb-1.5" style={{ color: "var(--color-clinical)" }}>
                Objective
              </p>
              <h3 className="text-base font-bold mb-1.5" style={{ color: "var(--color-clinical)" }}>
                {clinical?.label}
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">{clinical?.content}</p>
            </div>

            {/* Amber divider */}
            <div className="flex items-center gap-3 px-6 py-2">
              <div className="flex-1 border-t border-dashed border-amber-300" />
              <span className="text-amber-400 text-xs font-bold shrink-0">↔</span>
              <div className="flex-1 border-t border-dashed border-amber-300" />
            </div>

            {/* Personal (Subjective) section */}
            <div className="px-6 pt-2 pb-5">
              <p className="text-[9px] uppercase tracking-widest font-bold mb-1.5" style={{ color: "var(--color-personal)" }}>
                Subjective
              </p>
              <h3 className="text-base font-bold mb-1.5" style={{ color: "var(--color-personal)" }}>
                {personal?.label}
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">{personal?.content}</p>
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

            <p className="px-6 pb-5 text-sm text-stone-600 leading-relaxed">{node.content}</p>

            <EmbedSection embedNode={node.embed ? node : null} />
          </>
        )}
      </div>
    </div>
  );
}
