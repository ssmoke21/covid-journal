import { useState, useEffect, useRef } from "react";
import chaptersData from "./data/chapters.json";
import PulseTimeline from "./components/PulseTimeline";
import HeroHeader from "./components/HeroHeader";
import Chapter from "./components/Chapter";

export default function App() {
  const [activeChapter, setActiveChapter] = useState(1);
  const [visibleChapters, setVisibleChapters] = useState(new Set([1]));
  const observerRef = useRef(null);

  useEffect(() => {
    const sections = document.querySelectorAll("[id^='chapter-']");

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const newVisible = new Set(visibleChapters);
        let topMostVisible = null;
        let topMostY = Infinity;

        entries.forEach((entry) => {
          const num = parseInt(entry.target.id.replace("chapter-", ""));
          if (entry.isIntersecting) {
            newVisible.add(num);
          }
        });

        setVisibleChapters(newVisible);

        // Find the topmost visible chapter
        sections.forEach((section) => {
          const rect = section.getBoundingClientRect();
          const num = parseInt(section.id.replace("chapter-", ""));
          // Consider a chapter "active" when its top is in the upper half of viewport
          if (rect.top < window.innerHeight * 0.5 && rect.bottom > 100) {
            if (rect.top < topMostY || (rect.top >= 0 && rect.top < topMostY)) {
              // Prefer the one whose top is closest to viewport top but still visible
            }
          }
        });

        // Simpler: find which chapter occupies the most viewport space
        let best = null;
        let bestOverlap = 0;
        sections.forEach((section) => {
          const rect = section.getBoundingClientRect();
          const num = parseInt(section.id.replace("chapter-", ""));
          const overlapTop = Math.max(0, rect.top);
          const overlapBottom = Math.min(window.innerHeight, rect.bottom);
          const overlap = Math.max(0, overlapBottom - overlapTop);
          if (overlap > bestOverlap) {
            bestOverlap = overlap;
            best = num;
          }
        });

        if (best !== null) {
          setActiveChapter(best);
        }
      },
      {
        threshold: [0, 0.1, 0.25, 0.5],
        rootMargin: "-10% 0px -10% 0px",
      }
    );

    sections.forEach((section) => observerRef.current.observe(section));

    return () => observerRef.current?.disconnect();
  }, []);

  // Also track scroll for smoother active chapter detection
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("[id^='chapter-']");
      let best = null;
      let bestOverlap = 0;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const num = parseInt(section.id.replace("chapter-", ""));
        const overlapTop = Math.max(0, rect.top);
        const overlapBottom = Math.min(window.innerHeight, rect.bottom);
        const overlap = Math.max(0, overlapBottom - overlapTop);
        if (overlap > bestOverlap) {
          bestOverlap = overlap;
          best = num;
        }
      });

      if (best !== null) {
        setActiveChapter(best);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Pulse Timeline */}
      <PulseTimeline
        chapters={chaptersData.chapters}
        activeChapter={activeChapter}
      />

      {/* Main content area — offset for timeline on desktop */}
      <main className="lg:ml-20">
        <HeroHeader meta={chaptersData.meta} />

        {/* Prologue */}
        <section className="max-w-xl mx-auto px-8 py-16 text-center">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-stone-400 mb-8">
            Prologue
          </p>
          <div className="space-y-5 font-serif text-xl text-stone-500 leading-relaxed italic">
            <p>This is my COVID story.</p>
            <p>
              It is not the most difficult, and not the most important. But it is important.
              It was extraordinary and unique — worth hearing, worth learning from.
            </p>
            <p>Like so many other stories from this time.</p>
          </div>
          <div className="w-8 h-px bg-red-300 mx-auto mt-12" />
        </section>

        <div className="flex flex-col">
          {chaptersData.chapters.map((chapter) => (
            <Chapter
              key={chapter.chapter_number}
              chapter={chapter}
              isVisible={visibleChapters.has(chapter.chapter_number)}
            />
          ))}
        </div>

        {/* Footer */}
        <footer className="py-16 text-center border-t border-stone-200">
          <p className="font-serif text-lg text-stone-400 italic">
            "We're just a covid hospital, every unit is an ICU, no one knows how
            to treat it."
          </p>
          <p className="text-xs text-stone-300 mt-4">
            {chaptersData.meta.title} &middot; {chaptersData.meta.author}
          </p>
        </footer>
      </main>
    </div>
  );
}
