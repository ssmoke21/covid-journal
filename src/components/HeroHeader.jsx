export default function HeroHeader({ meta }) {
  return (
    <header className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-100 via-white to-surface" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Pulse circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {[200, 350, 500].map((size, i) => (
            <div
              key={size}
              className="absolute rounded-full border border-red-200/40"
              style={{
                width: size,
                height: size,
                top: -size / 2,
                left: -size / 2,
                animation: `pulse-ring ${3 + i}s ease-out infinite ${i * 0.5}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div
        className="relative"
        style={{ animation: "fade-in-up 0.8s ease-out both" }}
      >
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-red-500 mb-6">
          Dec 2019 — Jun 2021
        </p>

        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-stone-900 mb-4 max-w-4xl leading-tight">
          A Covid-19 Journal
        </h1>

        <p className="font-serif text-xl md:text-2xl text-stone-500 italic mb-8">
          An Infectious Diseases Pharmacist's Pandemic Chronicle
        </p>

        <div className="w-16 h-px bg-red-400 mx-auto mb-8" />

        <p className="text-sm text-stone-400 mb-1">by {meta.author}</p>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ animation: "fade-in-up 1s ease-out 0.5s both" }}
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400">
          Scroll
        </span>
        <div className="w-5 h-8 rounded-full border-2 border-stone-300 flex items-start justify-center pt-1.5">
          <div
            className="w-1 h-2 bg-stone-400 rounded-full"
            style={{
              animation: "fade-in-up 1.5s ease-in-out infinite",
            }}
          />
        </div>
      </div>
    </header>
  );
}
