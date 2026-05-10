// EKG heartbeat SVG path that draws itself in
function EkgLine() {
  // A realistic EKG waveform pattern repeated across the viewport
  const path = "M0,50 L60,50 L70,50 L75,50 L80,45 L85,50 L95,50 L100,50 L105,20 L108,80 L112,10 L116,60 L120,45 L125,50 L180,50 L240,50 L250,50 L255,50 L260,45 L265,50 L275,50 L280,50 L285,20 L288,80 L292,10 L296,60 L300,45 L305,50 L370,50 L430,50 L440,50 L445,50 L450,45 L455,50 L465,50 L470,50 L475,20 L478,80 L482,10 L486,60 L490,45 L495,50 L560,50 L620,50 L630,50 L635,50 L640,45 L645,50 L655,50 L660,50 L665,20 L668,80 L672,10 L676,60 L680,45 L685,50 L750,50 L810,50 L820,50 L825,50 L830,45 L835,50 L845,50 L850,50 L855,20 L858,80 L862,10 L866,60 L870,45 L875,50 L940,50 L1000,50";

  return (
    <div className="absolute bottom-24 left-0 right-0 overflow-hidden opacity-0" style={{ animation: "fade-in-up 1.2s ease-out 0.8s both" }}>
      <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-16">
        {/* Faded glow behind the line */}
        <path
          d={path}
          fill="none"
          stroke="#ef444440"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 2800,
            strokeDashoffset: 2800,
            animation: "ekg-draw 4s ease-out 1.2s forwards",
            filter: "blur(3px)",
          }}
        />
        {/* Main line */}
        <path
          d={path}
          fill="none"
          stroke="#dc2626"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 2800,
            strokeDashoffset: 2800,
            animation: "ekg-draw 4s ease-out 1.2s forwards",
          }}
        />
      </svg>
    </div>
  );
}

export default function HeroHeader({ meta }) {
  return (
    <header className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-100 via-white to-surface" />
        {/* Subtle grid — like medical chart paper */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Larger grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(var(--color-pulse) 1px, transparent 1px), linear-gradient(90deg, var(--color-pulse) 1px, transparent 1px)`,
            backgroundSize: "200px 200px",
          }}
        />
        {/* Pulse circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {[200, 350, 500].map((size, i) => (
            <div
              key={size}
              className="absolute rounded-full border border-red-200/30"
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

      {/* EKG heartbeat line */}
      <EkgLine />

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
