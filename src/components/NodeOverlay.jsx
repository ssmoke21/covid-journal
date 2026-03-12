import { useEffect, useRef, useState } from "react";

// ── PhotoCarousel ─────────────────────────────────────────────────────────────
function PhotoCarousel({ embed }) {
  const [idx, setIdx] = useState(0);
  if (!embed) return null;

  const photos =
    embed.type === "gallery"
      ? embed.photos
      : [{ url: embed.url, caption: embed.caption }];
  const photo = photos[idx];
  const count = photos.length;

  return (
    <div>
      <div className="relative overflow-hidden rounded-lg bg-stone-100" style={{ height: "300px" }}>
        <img
          src={`${import.meta.env.BASE_URL}${photo.url}`}
          alt={photo.caption || ""}
          className="w-full h-full object-contain"
        />
        {count > 1 && (
          <>
            <button
              onClick={() => setIdx((idx - 1 + count) % count)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/65 text-white rounded-full w-7 h-7 flex items-center justify-center text-xl leading-none transition-colors"
              aria-label="Previous photo"
            >‹</button>
            <button
              onClick={() => setIdx((idx + 1) % count)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/65 text-white rounded-full w-7 h-7 flex items-center justify-center text-xl leading-none transition-colors"
              aria-label="Next photo"
            >›</button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === idx ? "bg-white" : "bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Photo ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {photo.caption && (
        <p className="text-center text-[10px] font-mono uppercase tracking-widest text-stone-400 mt-1.5 px-1">
          {photo.caption}
        </p>
      )}
    </div>
  );
}

// ── Reusable external link button ─────────────────────────────────────────────
function LinkButton({ src }) {
  return (
    <a
      href={src.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-stone-50 border border-stone-200 hover:bg-stone-100 hover:border-stone-300 transition-all duration-200 group"
    >
      <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900">
        {src.label}
      </span>
      <svg
        className="w-4 h-4 text-stone-400 group-hover:text-stone-600 shrink-0 ml-3"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}

// ── EmbedSection — used by single-node overlays ───────────────────────────────
function EmbedSection({ embedNode }) {
  const tweetRef = useRef(null);

  useEffect(() => {
    if (!embedNode?.embed || embedNode.embed.type !== "tweet") return;
    const tweetId = embedNode.embed.url.match(/status\/(\d+)/)?.[1];
    if (!tweetId || !tweetRef.current) return;

    // Fresh container per effect; deferred render avoids StrictMode double-render
    const tweetContainer = document.createElement("div");
    tweetRef.current.innerHTML = "";
    tweetRef.current.appendChild(tweetContainer);
    let timerId, pollId;

    const render = () => {
      if (!tweetContainer.isConnected) return;
      window.twttr.widgets.createTweet(tweetId, tweetContainer, {
        theme: "light",
        align: "center",
        conversation: "none",
      });
    };

    if (window.twttr?.widgets) {
      timerId = setTimeout(render, 0);
    } else {
      // Ensure the widget script is loading
      if (!document.querySelector('script[src*="platform.twitter.com/widgets.js"]')) {
        const script = document.createElement("script");
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        script.charset = "utf-8";
        document.head.appendChild(script);
      }
      // Poll until the API is ready
      pollId = setInterval(() => {
        if (window.twttr?.widgets) {
          clearInterval(pollId);
          render();
        }
      }, 100);
    }

    return () => {
      if (timerId) clearTimeout(timerId);
      if (pollId) clearInterval(pollId);
      tweetContainer.remove();
    };
  }, [embedNode]);

  if (!embedNode?.embed) return null;
  const { embed } = embedNode;

  return (
    <>
      {embed.type === "tweet" && (
        <div className="border-t border-stone-100 px-6 py-5">
          <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-3 font-semibold">
            Primary Source
          </p>
          <div ref={tweetRef} className="flex justify-center min-h-[120px] items-center">
            <span className="text-sm text-stone-300">Loading post…</span>
          </div>
        </div>
      )}

      {embed.type === "iframe" && (
        <div className="border-t border-stone-100">
          <div className="flex items-center justify-between px-6 py-3">
            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">
              Primary Source
            </p>
            <a
              href={embed.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-stone-400 hover:text-stone-600 transition-colors flex items-center gap-1"
            >
              {embed.label}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
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

      {(embed.type === "image" || embed.type === "gallery") && (
        <div className="border-t border-stone-100 px-4 py-4">
          <PhotoCarousel embed={embed} />
          {embedNode.secondary_embed && (
            <div className="mt-3">
              <LinkButton src={embedNode.secondary_embed} />
            </div>
          )}
        </div>
      )}

      {embed.type === "link" && (
        <div className="border-t border-stone-100 px-6 py-5">
          <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-3 font-semibold">
            {embedNode.secondary_embed ? "Sources" : "Primary Source"}
          </p>
          <div className="flex flex-col gap-2">
            {[embed, ...(embedNode.secondary_embed ? [embedNode.secondary_embed] : [])].map(
              (src, i) => <LinkButton key={i} src={src} />
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const isPhotoEmbed = (embed) =>
  embed?.type === "image" || embed?.type === "gallery";

// ── NodeOverlay ───────────────────────────────────────────────────────────────
export default function NodeOverlay({ node, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!node) return null;

  const isPaired = !!node.pairedNode;
  const clinical = isPaired ? (node.type === "clinical" ? node : node.pairedNode) : null;
  const personal = isPaired ? (node.type === "personal" ? node : node.pairedNode) : null;

  const hasIframe =
    clinical?.embed?.type === "iframe" ||
    personal?.embed?.type === "iframe" ||
    (!isPaired && node.embed?.type === "iframe");
  const hasSections = !isPaired && !!node.sections?.length;
  const hasPairedPhoto = isPaired && (isPhotoEmbed(clinical?.embed) || isPhotoEmbed(personal?.embed));
  const hasPairedEmbed = isPaired && !hasPairedPhoto && (clinical?.embed || personal?.embed);
  const modalWidth =
    hasIframe ? "max-w-4xl"
    : (isPaired && (hasPairedPhoto || hasPairedEmbed)) ? "max-w-4xl"
    : isPaired ? "max-w-2xl"
    : (hasSections || isPhotoEmbed(node.embed)) ? "max-w-3xl"
    : "max-w-md";

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

            {/* Body: embed-left + stacked-text-right when photos/embeds present; side-by-side otherwise */}
            <div className="flex overflow-hidden" style={{ maxHeight: (hasPairedPhoto || hasPairedEmbed) ? "82vh" : "60vh" }}>

              {/* ── Embed column (left) — rendered when non-photo embeds exist ── */}
              {hasPairedEmbed && (
                <div className="w-1/2 flex-shrink-0 overflow-y-auto overflow-x-hidden border-r border-stone-100 bg-stone-50/60">
                  {clinical?.embed && (
                    <div className={personal?.embed ? "border-b border-stone-100" : ""}>
                      <EmbedSection embedNode={clinical} />
                    </div>
                  )}
                  {personal?.embed && (
                    <EmbedSection embedNode={personal} />
                  )}
                </div>
              )}

              {/* ── Photo column (left) — only rendered when at least one photo exists ── */}
              {hasPairedPhoto && (
                <div className="w-1/2 flex-shrink-0 overflow-y-auto border-r border-stone-100 bg-stone-50/60">
                  {isPhotoEmbed(clinical?.embed) && (
                    <div className={`p-3 ${isPhotoEmbed(personal?.embed) ? "border-b border-stone-100" : ""}`}>
                      <p className="text-[9px] uppercase tracking-widest font-bold mb-2"
                        style={{ color: "var(--color-clinical)" }}>
                        Clinical
                      </p>
                      <PhotoCarousel embed={clinical.embed} />
                      {clinical.secondary_embed && (
                        <div className="mt-2"><LinkButton src={clinical.secondary_embed} /></div>
                      )}
                    </div>
                  )}
                  {isPhotoEmbed(personal?.embed) && (
                    <div className="p-3">
                      <p className="text-[9px] uppercase tracking-widest font-bold mb-2"
                        style={{ color: "var(--color-personal)" }}>
                        Personal
                      </p>
                      <PhotoCarousel embed={personal.embed} />
                      {personal.secondary_embed && (
                        <div className="mt-2"><LinkButton src={personal.secondary_embed} /></div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── Text area: stacked (with photos/embeds) or side-by-side (without) ── */}
              {(hasPairedPhoto || hasPairedEmbed) ? (
                /* Stacked clinical on top, personal on bottom */
                <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                  <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
                    <p className="text-[9px] uppercase tracking-widest font-bold mb-1.5"
                      style={{ color: "var(--color-clinical)" }}>
                      Clinical
                    </p>
                    <h3 className="text-base font-bold mb-1.5" style={{ color: "var(--color-clinical)" }}>
                      {clinical?.label}
                    </h3>
                    <p className="text-sm text-stone-600 leading-relaxed">{clinical?.content}</p>
                    {clinical?.sections?.map((section, i) => (
                      <div key={i} className="mt-3 pt-3 border-t border-stone-100">
                        {(section.heading || section.title) && (
                          <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-1">{section.heading || section.title}</p>
                        )}
                        {section.text && <p className="text-sm text-stone-600 leading-relaxed">{section.text}</p>}
                      </div>
                    ))}
                  </div>

                  {/* Horizontal amber dashed divider */}
                  <div className="relative h-5 shrink-0 mx-5">
                    <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 border-t border-dashed border-amber-300" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-amber-400 text-xs font-bold leading-none px-1">↕</div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
                    <p className="text-[9px] uppercase tracking-widest font-bold mb-1.5"
                      style={{ color: "var(--color-personal)" }}>
                      Personal
                    </p>
                    <h3 className="text-base font-bold mb-1.5" style={{ color: "var(--color-personal)" }}>
                      {personal?.label}
                    </h3>
                    <p className="text-sm text-stone-600 leading-relaxed">{personal?.content}</p>
                    {personal?.sections?.map((section, i) => (
                      <div key={i} className="mt-3 pt-3 border-t border-stone-100">
                        {(section.heading || section.title) && (
                          <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-1">{section.heading || section.title}</p>
                        )}
                        {section.text && <p className="text-sm text-stone-600 leading-relaxed">{section.text}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Original side-by-side columns when no photos */
                <>
                  <div className="flex-1 overflow-y-auto px-5 pb-5">
                    <p className="text-[9px] uppercase tracking-widest font-bold mb-1.5"
                      style={{ color: "var(--color-clinical)" }}>
                      Clinical
                    </p>
                    <h3 className="text-base font-bold mb-1.5" style={{ color: "var(--color-clinical)" }}>
                      {clinical?.label}
                    </h3>
                    <p className="text-sm text-stone-600 leading-relaxed">{clinical?.content}</p>
                  </div>

                  {/* Vertical amber dashed divider */}
                  <div className="relative w-5 shrink-0">
                    <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 border-l border-dashed border-amber-300" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-amber-400 text-xs font-bold leading-none py-0.5">↔</div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 pb-5">
                    <p className="text-[9px] uppercase tracking-widest font-bold mb-1.5"
                      style={{ color: "var(--color-personal)" }}>
                      Personal
                    </p>
                    <h3 className="text-base font-bold mb-1.5" style={{ color: "var(--color-personal)" }}>
                      {personal?.label}
                    </h3>
                    <p className="text-sm text-stone-600 leading-relaxed">{personal?.content}</p>
                  </div>
                </>
              )}

            </div>

            {/* Non-photo embeds at the bottom — only if not already shown in left column */}
            {!hasPairedEmbed && clinical?.embed && !isPhotoEmbed(clinical.embed) && (
              <EmbedSection embedNode={clinical} />
            )}
            {!hasPairedEmbed && personal?.embed && !isPhotoEmbed(personal.embed) && (
              <EmbedSection embedNode={personal} />
            )}
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
              <div className="pb-5 overflow-y-auto" style={{ maxHeight: "75vh" }}>
                {node.sections.map((section, i) => (
                  section.image ? (
                    /* Photo-left, text-right for sections with images */
                    <div key={i} className="flex border-t border-stone-100 first:border-t-0">
                      <div className="w-1/2 flex-shrink-0 p-4 border-r border-stone-100 bg-stone-50/60">
                        <div className="rounded-lg overflow-hidden bg-stone-100" style={{ height: "220px" }}>
                          <img
                            src={`${import.meta.env.BASE_URL}${section.image}`}
                            alt={section.heading || section.title || ""}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                      <div className="flex-1 p-4 min-w-0">
                        {(section.heading || section.title) && (
                          <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-1.5">
                            {section.heading || section.title}
                          </p>
                        )}
                        {section.text && (
                          <p className="text-sm text-stone-600 leading-relaxed">{section.text}</p>
                        )}
                        {section.links?.length > 0 && (
                          <div className="mt-3 flex flex-col gap-1.5">
                            {section.links.map((link, j) => (
                              <a key={j} href={link.url} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 underline underline-offset-2">
                                {link.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Text-only sections: full width */
                    <div key={i} className="px-6 py-4 border-t border-stone-100 first:border-t-0">
                      {(section.heading || section.title) && (
                        <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-1">
                          {section.heading || section.title}
                        </p>
                      )}
                      {section.text && (
                        <p className="text-sm text-stone-600 leading-relaxed">{section.text}</p>
                      )}
                      {section.links?.length > 0 && (
                        <div className="mt-3 flex flex-col gap-1.5">
                          {section.links.map((link, j) => (
                            <a key={j} href={link.url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 underline underline-offset-2">
                              {link.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )
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
