import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Music,
  Video,
  FileCode,
  Folder,
  Info,
  Minimize2,
  Terminal,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface ScreenshotItem {
  src: string;
  title: string;
  sub: string;
}

const screenshots: ScreenshotItem[] = [
  {
    src: './screenshots/01_Ana_Sayfa_Workspace.png',
    title: 'Ana Sayfa Workspace',
    sub: 'Hızlı dönüştürücü ve yerel çalışma alanı',
  },
  {
    src: './screenshots/02_Fig_Menusu_Acik.png',
    title: 'Fig Hızlı Menüsü',
    sub: 'Tüm araçlara ve kısayollara tek noktadan erişim',
  },
  {
    src: './screenshots/03_Fig_Menusu_CloseUp.png',
    title: 'Menü Detayı',
    sub: 'Çalışma alanları ve sistem kontrolleri',
  },
  {
    src: './screenshots/04_Cark_Tetikleyici_Hover.png',
    title: 'İşlem Çarkı Tetikleyici',
    sub: 'Ctrl + Space ile fare ucunda anında işlem',
  },
  {
    src: './screenshots/05_Cark_Ofis_Profili.png',
    title: 'İşlem Çarkı • Ofis Profili',
    sub: 'PDF, Word, Excel, PPT ve görselleri tek tıkla dönüştürün',
  },
  {
    src: './screenshots/05b_Cark_Ofis_CloseUp.png',
    title: 'Ofis Çarkı Yakın Plan',
    sub: 'Radyal menü butonları ve ikonik tasarım',
  },
  {
    src: './screenshots/06_Cark_Dilim_Hover_WebP.png',
    title: 'Çark Dilimi • WebP Dönüştür',
    sub: 'Ultra hızlı ve kayıpsız görsel optimizasyonu',
  },
  {
    src: './screenshots/07_Cark_Dilim_Hover_PDF.png',
    title: 'Çark Dilimi • PDF Eylemleri',
    sub: 'Belgeleri tek tıkla PDF yapın',
  },
  {
    src: './screenshots/07b_Cark_Dilim_Hover_CloseUp.png',
    title: 'Dilim Seçimi Yakın Plan',
    sub: 'Seçim animasyonu ve aktif dilim vurgusu',
  },
  {
    src: './screenshots/08_Cark_Tasarim_Profili.png',
    title: 'Tasarım & Fotoğraf Profili',
    sub: 'Görsel dönüştürme, kırpma ve sansürleme araçları',
  },
  {
    src: './screenshots/09_Cark_Gelistirici_Profili.png',
    title: 'Geliştirici & Kod Profili',
    sub: 'Dosya yolu, terminal, QR kod ve format araçları',
  },
  {
    src: './screenshots/10_Cark_Ozel_Profil.png',
    title: 'Kişisel Özel Profil',
    sub: 'En sık kullandığınız araçları dilediğiniz gibi dizin',
  },
  {
    src: './screenshots/11_Cark_Studyosu_Yonetimi.png',
    title: 'Çark Stüdyosu Yönetimi',
    sub: 'Dilimleri özelleştirin, sürükleyin ve profil oluşturun',
  },
  {
    src: './screenshots/12_Belgeler_ve_PDF_Araclari.png',
    title: 'Belgeler & PDF Araçları',
    sub: 'Toplu dönüştürme ve belge yönetimi',
  },
  {
    src: './screenshots/13_Ayarlar_Paneli.png',
    title: 'Gelişmiş Ayarlar',
    sub: 'Kısayol tuşları, tema ve yerel çalışma yapılandırması',
  },
  {
    src: './screenshots/14_Bento_Hizli_Eylemler_CloseUp.png',
    title: 'Bento Hızlı Eylemler',
    sub: 'Tek tıkla sıkıştır, dönüştür ve paylaş',
  },
  {
    src: './screenshots/15_Image_Studio_Kirpma_Modali.png',
    title: 'Image Studio Kırpma & Düzenleme',
    sub: 'Görselleri hassas şekilde kırpın ve boyutlandırın',
  },
  {
    src: './screenshots/16_QR_Kod_Modali.png',
    title: 'QR Kod Stüdyosu',
    sub: 'Hızlı QR kod oluşturun ve okuyun',
  },
  {
    src: './screenshots/17_Floating_Wheel_Standalone.png',
    title: 'Bağımsız Yüzen Çark',
    sub: 'İmlecinizin ucunda beliren hafif işlem çarkı',
  },
];

export const SectionThree: React.FC = () => {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handlePrev = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1));
  }, []);

  // Keyboard navigation for carousel (Left / Right arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  return (
    <section
      id="section-2"
      className="relative w-full h-screen min-h-[680px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-white via-[#f0f6fc] to-[#e4eff8] snap-start snap-always px-4 md:px-12"
    >
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Typography */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: false, amount: 0.3 }}
          className="lg:col-span-4 space-y-5"
        >
          <div className="space-y-1">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-neutral-900 leading-[1.08]">
              {t.sectionThree.titlePart1}
            </h2>
            <div>
              <span className="highlight-mark font-editorial text-4xl sm:text-5xl md:text-6xl text-neutral-950 px-3.5 py-0.5">
                {t.sectionThree.titleHighlight}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 pt-1">
              {t.sectionThree.titlePart2}
            </h2>
          </div>

          <p className="text-base sm:text-lg text-neutral-700 leading-relaxed max-w-sm font-sans">
            {t.sectionThree.description}
          </p>
        </motion.div>

        {/* Center: Frameless Screenshots Carousel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: false, amount: 0.3 }}
          className="lg:col-span-6 relative flex items-center justify-center"
        >
          {/* Left Arrow Button */}
          <button
            onClick={handlePrev}
            className="absolute -left-3 md:-left-6 z-30 w-10 h-10 md:w-11 md:h-11 rounded-full bg-purple-600 hover:bg-purple-700 active:scale-90 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer"
            aria-label="Previous screenshot"
            type="button"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Frameless Screenshot Display */}
          <div className="w-full max-w-lg md:max-w-xl flex flex-col items-center">
            {/* Visual stage with fixed height to prevent layout shifts */}
            <div className="relative w-full h-[320px] sm:h-[360px] md:h-[400px] flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="w-full h-full flex items-center justify-center cursor-pointer select-none"
                  onClick={handleNext}
                  title="Sonraki görsel için tıklayın"
                >
                  <img
                    src={screenshots[currentSlide].src}
                    alt={screenshots[currentSlide].title}
                    className="max-h-full max-w-full object-contain rounded-xl drop-shadow-2xl transition-all"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Slide Caption & Counter Bar */}
            <div className="w-full mt-3 flex items-center justify-between px-2 text-xs">
              <div className="flex items-center gap-2 truncate pr-2">
                <span className="font-semibold text-neutral-900 truncate">
                  {screenshots[currentSlide].title}
                </span>
                <span className="text-[11px] text-neutral-400 hidden sm:inline">•</span>
                <span className="text-[11px] text-neutral-600 hidden sm:inline truncate">
                  {screenshots[currentSlide].sub}
                </span>
              </div>
              <div className="flex-shrink-0 flex items-center gap-1 font-mono text-[11px] font-semibold text-purple-700 bg-purple-100/80 px-2.5 py-0.5 rounded-full border border-purple-200">
                <span>{currentSlide + 1}</span>
                <span className="text-purple-400">/</span>
                <span>{screenshots.length}</span>
              </div>
            </div>
          </div>

          {/* Right Arrow Button + Retro Pixel Cursor */}
          <div className="absolute -right-3 md:-right-6 z-30">
            <button
              onClick={handleNext}
              className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-purple-600 hover:bg-purple-700 active:scale-90 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer"
              aria-label="Next screenshot"
              type="button"
            >
              <ChevronRight className="w-6 h-6 stroke-[2.5]" />
            </button>
            <div className="absolute left-6 top-6 pointer-events-none animate-pulse">
              <svg className="w-6 h-6 drop-shadow fill-white stroke-black stroke-[1.5]" viewBox="0 0 24 24">
                <path d="M4 3l15 9-7 1.5 4.5 7.5-2.5 1.5-4.5-7.5L4 18V3z" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Right Format Badges Grid */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: false, amount: 0.3 }}
          className="lg:col-span-2 grid grid-cols-4 lg:grid-cols-2 gap-3"
        >
          {/* MP4 */}
          <div className="bg-white p-3 rounded-2xl shadow-md border border-neutral-200/80 flex flex-col items-center justify-center aspect-square text-center hover:scale-105 transition-transform">
            <Video className="w-5 h-5 text-blue-600 mb-1" />
            <span className="text-xs font-bold text-neutral-800">MP4</span>
          </div>

          {/* MP3 */}
          <div className="bg-white p-3 rounded-2xl shadow-md border border-neutral-200/80 flex flex-col items-center justify-center aspect-square text-center hover:scale-105 transition-transform">
            <Music className="w-5 h-5 text-amber-600 mb-1" />
            <span className="text-xs font-bold text-neutral-800">MP3</span>
          </div>

          {/* PDF */}
          <div className="bg-white p-3 rounded-2xl shadow-md border border-neutral-200/80 flex flex-col items-center justify-center aspect-square text-center hover:scale-105 transition-transform">
            <FileText className="w-5 h-5 text-red-600 mb-1" />
            <span className="text-xs font-bold text-neutral-800">PDF</span>
          </div>

          {/* DOCX */}
          <div className="bg-white p-3 rounded-2xl shadow-md border border-neutral-200/80 flex flex-col items-center justify-center aspect-square text-center hover:scale-105 transition-transform">
            <FileCode className="w-5 h-5 text-blue-500 mb-1" />
            <span className="text-xs font-bold text-neutral-800">DOCX</span>
          </div>

          {/* Compress */}
          <div className="bg-white p-3 rounded-2xl shadow-md border border-neutral-200/80 flex flex-col items-center justify-center aspect-square text-center hover:scale-105 transition-transform">
            <Minimize2 className="w-5 h-5 text-cyan-600 mb-1" />
            <span className="text-[11px] font-bold text-neutral-700">{t.sectionThree.formats.compress}</span>
          </div>

          {/* CLI */}
          <div className="bg-white p-3 rounded-2xl shadow-md border border-neutral-200/80 flex flex-col items-center justify-center aspect-square text-center hover:scale-105 transition-transform">
            <Terminal className="w-5 h-5 text-neutral-900 mb-1" />
            <span className="text-[11px] font-bold text-neutral-700">{t.sectionThree.formats.system}</span>
          </div>

          {/* Folder */}
          <div className="bg-white p-3 rounded-2xl shadow-md border border-neutral-200/80 flex flex-col items-center justify-center aspect-square text-center hover:scale-105 transition-transform">
            <Folder className="w-5 h-5 text-amber-500 mb-1" />
            <span className="text-[11px] font-bold text-neutral-700">{t.sectionFour.pillBatch}</span>
          </div>

          {/* Info */}
          <div className="bg-white p-3 rounded-2xl shadow-md border border-neutral-200/80 flex flex-col items-center justify-center aspect-square text-center hover:scale-105 transition-transform">
            <Info className="w-5 h-5 text-indigo-600 mb-1" />
            <span className="text-[11px] font-bold text-neutral-700">{t.sectionTwo.tagPrivacy}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
