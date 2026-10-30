import React from 'react';
import { Share, MoreHorizontal } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface AppleNoteCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const AppleNoteCard: React.FC<AppleNoteCardProps> = ({
  title,
  children,
  className = '',
}) => {
  const { t } = useLanguage();

  return (
    <div
      className={`bg-[#FCFBF7] border border-[#E8E4DA] rounded-2xl p-6 shadow-xl text-neutral-800 transition-transform duration-300 hover:shadow-2xl ${className}`}
    >
      {/* iOS Note Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0EBE1]">
        <div className="flex items-center gap-1 text-[#E09414] font-medium text-sm cursor-pointer hover:opacity-80 transition-opacity">
          <span className="text-base font-semibold leading-none">&lt;</span>
          <span>{title}</span>
        </div>
        <div className="flex items-center gap-3 text-[#E09414]">
          <button className="hover:opacity-75 transition-opacity" title={t.appleNote.share} type="button">
            <Share className="w-4 h-4 stroke-[2.2]" />
          </button>
          <button className="hover:opacity-75 transition-opacity" title={t.appleNote.more} type="button">
            <MoreHorizontal className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* Note Body */}
      <div className="text-sm md:text-base leading-relaxed text-neutral-800 font-sans">
        {children}
      </div>
    </div>
  );
};
