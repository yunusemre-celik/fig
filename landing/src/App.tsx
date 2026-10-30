import React, { useState, useEffect, useRef } from 'react';
import { Navigation } from './components/Navigation';
import { ScrollDots } from './components/ScrollDots';
import { SectionHome } from './components/sections/SectionHome';
import { SectionTwo } from './components/sections/SectionTwo';
import { SectionThree } from './components/sections/SectionThree';
import { SectionFour } from './components/sections/SectionFour';
import { SectionFive } from './components/sections/SectionFive';
import { SectionSix } from './components/sections/SectionSix';

export const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSections = 6;

  // Scroll to a specific section by index
  const scrollToSection = (index: number) => {
    const sectionElement = document.getElementById(`section-${index}`);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(index);
    }
  };

  // Keyboard navigation (Arrow keys, PageUp, PageDown)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        setActiveSection((prev) => {
          const next = Math.min(prev + 1, totalSections - 1);
          scrollToSection(next);
          return next;
        });
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        setActiveSection((prev) => {
          const prevSec = Math.max(prev - 1, 0);
          scrollToSection(prevSec);
          return prevSec;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update active section on scroll using IntersectionObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            const index = parseInt(id.replace('section-', ''), 10);
            if (!isNaN(index)) {
              setActiveSection(index);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.55,
      }
    );

    for (let i = 0; i < totalSections; i++) {
      const el = document.getElementById(`section-${i}`);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-neutral-900 font-sans">
      {/* Top Floating Navigation Bar */}
      <Navigation onHomeClick={() => scrollToSection(0)} />

      {/* Side Dots Pagination */}
      <ScrollDots
        totalSections={totalSections}
        activeSection={activeSection}
        onSelectSection={scrollToSection}
      />

      {/* Full-Page Snap-Scroll Container */}
      <main
        ref={containerRef}
        className="w-full h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
      >
        <SectionHome />
        <SectionTwo />
        <SectionThree />
        <SectionFour />
        <SectionFive />
        <SectionSix />
      </main>
    </div>
  );
};

export default App;
