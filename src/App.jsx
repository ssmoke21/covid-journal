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
        <section className="max-w-2xl mx-auto px-8 pt-16 pb-12">
          <div className="text-center mb-10">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-stone-400 mb-4">
              Prologue
            </p>
            <div className="w-8 h-px bg-red-300 mx-auto" />
          </div>
          <div className="space-y-4 font-serif text-base text-stone-600 leading-relaxed">
            <p>COVID-19 affected everyone, but not in the same way. For some, it meant losing someone they loved. For others, isolation, economic ruin, or the slow unraveling of ordinary life. For those inside hospitals, it was something else &mdash; a relentless, shifting crisis with no clear end in sight. Some were asked to carry extraordinary burdens. There is value in all of these stories, not just the most harrowing ones. This is one of them.</p>
            <p>I was an infectious diseases pharmacist &mdash; in the hospital every day, but not in direct patient care. I was in the pharmacy, fielding calls from clinicians, tracking down medications, and trying to make sense of protocols that were being written in real time. What follows is an account of those years &mdash; December 2019 through mid-2021. The content is mine; the words were shaped in collaboration with Claude, an AI.</p>
            <p>Healthcare workers were asked to absorb an enormous amount, and many of us moved on before we had any real chance to sit with it. This is my attempt to sit with it &mdash; to name what happened, to acknowledge what it cost, and to figure out what it means that we went through it.</p>
          </div>
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

        {/* Epilogue */}
        <section className="max-w-2xl mx-auto px-8 pt-24 pb-16">
          <div className="text-center mb-16">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-stone-400 mb-4">
              Epilogue
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-3">
              Five Years Later
            </h2>
            <div className="w-8 h-px bg-red-300 mx-auto" />
          </div>

          <div className="space-y-12">
            {/* The Aftermath */}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-red-400 mb-3">
                The Aftermath
              </p>
              <div className="space-y-4 font-serif text-base text-stone-600 leading-relaxed">
                <p>
                  When I look around the hospital, I see many new faces. Their presence
                  tells a story about the people they replaced &mdash; a story of burnout and mass
                  exodus from hospital medicine. The pandemic didn&rsquo;t just take lives; it took
                  careers, aspirations, and in many cases, the passion that drew people to
                  healthcare in the first place.
                </p>
                <p>
                  Colleagues weathered the storm, carried the weight of impossible duties
                  and decisions, and then, in the aftermath, they left. Burnt out and
                  underappreciated &mdash; who could blame them? For everyone who went through
                  this, have you really processed and accepted what happened? Or are you
                  simply not talking about it?
                </p>
              </div>
            </div>

            {/* Untold Stories */}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-red-400 mb-3">
                Untold Stories
              </p>
              <div className="space-y-4 font-serif text-base text-stone-600 leading-relaxed">
                <p>
                  I remember my own experiences pretty well. But there are so many stories of
                  my colleagues that I don&rsquo;t know &mdash; because I haven&rsquo;t heard them. Where are the
                  stories of the individual heroics of nurses and respiratory therapists and
                  infection preventionists and patient care techs and medical residents?
                </p>
                <p>
                  At the time, no one had the bandwidth to appreciate or even understand all that
                  everyone was doing. And when things were past the peak, everyone was ready to
                  move on. But these stories will not manifest on their own. They must be written.
                  For a field that prides itself on reflection, learning, and self-improvement,
                  I find it remarkable how little we have done to recognize and learn from what
                  we went through.
                </p>
              </div>
            </div>

            {/* Remembrance, Recognition, and Reflection */}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-red-400 mb-3">
                Remembrance, Recognition, and Reflection
              </p>
              <div className="space-y-4 font-serif text-base text-stone-600 leading-relaxed">
                <p>
                  I don&rsquo;t know that I&rsquo;ll ever be completely at peace with my COVID-19
                  experience. But there is a path forward: remembrance, recognition, and reflection.
                </p>
                <p>
                  We were tested in a way that none of our predecessors were. No colleague,
                  mentor, or seasoned veteran had ever gone through what we faced. Now that
                  we&rsquo;re on the other side, the mark feels permanent. There is an emptiness.
                  I need to mourn the human suffering. I need to celebrate the tremendous efforts
                  we put forth &mdash; from the massive scale of drug and vaccine development to
                  the quiet sacrifices, like staying an extra shift or comforting a patient&rsquo;s
                  family. I want to embrace these stories and take pride in our field.
                </p>
                <p>
                  And I will never find peace until we find lessons that make us better prepared
                  for next time: Clinical humility. Clearer public health communication. The
                  strength that comes from looking out for one another. We must not repeat the
                  same mistakes.
                </p>
              </div>
            </div>

            {/* A COVID-19 Memorial Day */}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-red-400 mb-3">
                A COVID-19 Memorial Day
              </p>
              <div className="space-y-4 font-serif text-base text-stone-600 leading-relaxed">
                <p>
                  Efforts are underway at both the state and national levels to designate a
                  COVID-19 Memorial Day in March. The goal is to create a formal space for
                  remembrance, recognition of healthcare efforts, and reflection on future
                  preparedness. Whether or not these formal resolutions pass, the need for
                  the day remains.
                </p>
                <p>
                  If this day is to have lasting meaning, it will be built on our collective
                  accounts. This concludes my portion of the record. I hope to see others add
                  theirs, ensuring this period is not defined by silence, but by the weight
                  of our shared experience.
                </p>
              </div>
            </div>
          </div>

        </section>

        {/* Footer */}
        <footer className="py-16 text-center border-t border-stone-200">
          <p className="text-xs text-stone-300">
            {chaptersData.meta.title} &middot; {chaptersData.meta.author}
          </p>
        </footer>
      </main>
    </div>
  );
}
