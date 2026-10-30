import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface ScrollDotsProps {
  totalSections: number;
  activeSection: number;
  onSelectSection: (index: number) => void;
}

export const ScrollDots: React.FC<ScrollDotsProps> = ({
  totalSections,
  activeSection,
  onSelectSection,
}) => {
  const { t } = useLanguage();

  const getSectionTitle = (index: number) => {
    switch (index) {
      case 0:
        return t.dots.section0;
      case 1:
        return t.dots.section1;
      case 2:
        return t.dots.section2;
      case 3:
        return t.dots.section3;
      case 4:
        return t.dots.section4;
      case 5:
        return t.dots.section5;
      default:
        return `0${index + 1}`;
    }
  };

  return (
    <aside className="fixed right-4 md:right-7 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3 pointer-events-auto">
      {Array.from({ length: totalSections }).map((_, index) => {
        const isActive = activeSection === index;
        return (
          <button
            key={index}
            onClick={() => onSelectSection(index)}
            aria-label={getSectionTitle(index)}
            className="group relative flex items-center justify-center p-1 focus:outline-none"
            type="button"
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                isActive
                  ? 'w-3.5 h-3.5 bg-neutral-900 ring-2 ring-neutral-900/30'
                  : 'w-2 h-2 bg-neutral-400 group-hover:bg-neutral-700 group-hover:scale-125'
              }`}
            />
            {/* Tooltip on hover */}
            <span className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none text-[11px] font-semibold bg-neutral-900 text-white px-2 py-0.5 rounded shadow whitespace-nowrap">
              0{index + 1} • {getSectionTitle(index)}
            </span>
          </button>
        );
      })}
    </aside>
  );
};
