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
              I&rsquo;ve been trying to piece together a journal of this experience for years.
              Every time I sit down to write, I&rsquo;m hit with the exhausting weight of those
              memories. But this story refuses to be ignored.
            </p>
            <p>
              It is not the most difficult, and not the most important. But it is important.
              It was extraordinary and unique &mdash; worth hearing, worth learning from.
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
                  When I look around the hospital today, I see many new faces. Their presence
                  tells a story about the people they replaced &mdash; a story of burnout and mass
                  exodus from hospital medicine. The pandemic didn&rsquo;t just take lives; it took
                  careers, aspirations, and in many cases, the passion that drew people to
                  healthcare in the first place.
                </p>
                <p>
                  These colleagues weathered the storm, carried the weight of impossible
                  decisions, and then, in the aftermath, they left. Burnt out and
                  underappreciated &mdash; who could blame them? To my colleagues whose scars
                  look similar to mine, we&rsquo;ve pushed forward. But I wonder: have you really
                  processed and accepted what happened? Or are you simply not talking about
                  it, like me?
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
                  At the time, who had the bandwidth to appreciate or even understand all that
                  everyone was doing? And when things were past the peak, everyone was ready to
                  move on. These stories will not manifest on their own. They must be created.
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
                  I don&rsquo;t know that I will ever be completely at peace with my COVID-19
                  experience, but I know how we can move toward it: the same way we get over
                  anything tragic. Remembrance. Recognition. And reflection.
                </p>
                <p>
                  We were tested in a way that none of our predecessors were. No colleague,
                  mentor, distinguished veteran, or hallowed hospital legend went through what
                  we went through. I need to mourn the tragic human suffering. I need to
                  celebrate the tremendous efforts we put forth. From the enormous work to find
                  treatments and vaccines to the small-scale heroic sacrifices &mdash; staying an
                  extra shift, comforting a patient, a loved one, or a coworker &mdash; I want to
                  embrace these stories and take pride in our field.
                </p>
                <p>
                  And I will never find peace until we find lessons that make us better prepared
                  for next time. Clinical humility. Public health communication. The resilience
                  borne from collective support. We must not repeat the same mistakes.
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
                  A resolution has been introduced to Congress to designate the first Monday
                  in March as COVID-19 Memorial Day &mdash; an opportunity for remembrance of those
                  we lost, recognition of healthcare workers&rsquo; efforts, and reflection on
                  lessons learned for future preparedness. Regardless of the resolution&rsquo;s
                  fate, there is nothing stopping hospitals, organizations, or individuals
                  from observing it.
                </p>
                <p>
                  What I would call on others to do is simply speak up. Share your story.
                  Just as we managed the pandemic through collective effort, we can rally
                  support for this. March 2025 was the fifth anniversary of the initial
                  COVID-19 wave in the US. It&rsquo;s overdue.
                </p>
              </div>
            </div>
          </div>

          {/* Closing line */}
          <div className="mt-16 text-center">
            <div className="w-8 h-px bg-red-300 mx-auto mb-8" />
            <p className="font-serif text-xl sm:text-2xl text-stone-800 italic leading-relaxed">
              &ldquo;Let&rsquo;s shine the spotlight on ourselves,
              and let&rsquo;s begin to heal.&rdquo;
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 text-center border-t border-stone-200">
          <p className="font-serif text-lg text-stone-400 italic">
            &ldquo;We&rsquo;re just a covid hospital, every unit is an ICU, no one knows how
            to treat it.&rdquo;
          </p>
          <p className="font-serif text-base text-stone-400 italic mt-6">
            &ldquo;Let&rsquo;s shine the spotlight on ourselves,
            and let&rsquo;s begin to heal.&rdquo;
          </p>
          <p className="text-xs text-stone-300 mt-6">
            {chaptersData.meta.title} &middot; {chaptersData.meta.author}
          </p>
        </footer>
      </main>
    </div>
  );
}
