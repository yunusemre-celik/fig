import React, { useState, useEffect } from "react";
import { WheelItem, WheelMode, WheelProfileId } from "../types";
import { playSuccessChime, playWheelTick } from "../utils/sound";
import { useTranslation } from "../i18n/useTranslation";
import {
  FileImage,
  Crop,
  Minimize2,
  QrCode,
  FolderOpen,
  Terminal,
  Copy,
  Info,
  FileText,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Presentation,
  FileSpreadsheet,
  Music,
  Film,
  EyeOff,
} from "lucide-react";

interface RadialWheelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionId: string, category: WheelMode) => void;
  selectedFileNames: string[];
  customItems?: WheelItem[];
  isStandalone?: boolean;
  profileName?: string;
  onCycleProfile?: (direction?: 1 | -1) => void;
  onSelectProfile?: (profileId: WheelProfileId) => void;
  onFileDrop?: (file: File) => void;
}

export const RadialWheel: React.FC<RadialWheelProps> = ({
  isOpen,
  onClose,
  onSelectAction,
  selectedFileNames,
  customItems,
  isStandalone = false,
  profileName,
  onCycleProfile,
  onSelectProfile,
  onFileDrop,
}) => {
  const { t } = useTranslation();
  const [hoveredItem, setHoveredItem] = useState<WheelItem | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Dynamic localized slice mapping helper
  const getSliceText = (item: WheelItem): { label: string; desc: string } => {
    const map: Record<string, { label: string; desc: string }> = {
      webp: { label: t("sliceWebp"), desc: t("sliceWebpDesc") },
      png: { label: t("slicePng"), desc: t("slicePngDesc") },
      jpg: { label: t("sliceJpg"), desc: t("sliceJpgDesc") },
      ico: { label: t("sliceIco"), desc: t("sliceIcoDesc") },
      bmp: { label: t("sliceBmp"), desc: t("sliceBmpDesc") },
      gif: { label: t("sliceGif"), desc: t("sliceGifDesc") },
      tiff: { label: t("sliceTiff"), desc: t("sliceTiffDesc") },
      crop: { label: t("cropTab"), desc: t("sliceCropDesc") },
      censor: { label: t("censorTab"), desc: t("sliceCensorDesc") },
      compress: { label: t("sliceCompress"), desc: t("sliceCompressDesc") },
      qr: { label: t("sliceQr"), desc: t("sliceQrDesc") },
      info: { label: t("sliceInfo"), desc: t("sliceInfoDesc") },
      docx_pdf: { label: t("sliceDocxPdf"), desc: t("sliceDocxPdfDesc") },
      pptx_pdf: { label: t("slicePptxPdf"), desc: t("slicePptxPdfDesc") },
      xlsx_pdf: { label: t("sliceXlsxPdf"), desc: t("sliceXlsxPdfDesc") },
      img_pdf: { label: t("sliceImgPdf"), desc: t("sliceImgPdfDesc") },
      all_pdf: { label: t("sliceAllPdf"), desc: t("sliceDocxPdfDesc") },
      extract_audio: { label: t("sliceExtractAudio"), desc: t("sliceExtractAudioDesc") },
      video_gif: { label: t("sliceVideoGif"), desc: t("sliceVideoGifDesc") },
      video_mp4: { label: t("sliceVideoMp4"), desc: t("sliceVideoMp4") },
      video_webm: { label: t("sliceVideoWebm"), desc: t("sliceVideoWebm") },
      audio_wav: { label: t("sliceAudioWav"), desc: t("sliceAudioWav") },
      audio_flac: { label: t("sliceAudioFlac"), desc: t("sliceAudioFlac") },
      pdf_excel: { label: t("slicePdfExcel"), desc: t("slicePdfExcel") },
      pdf_docx: { label: t("slicePdfDocx"), desc: t("slicePdfDocx") },
      copy_path: { label: t("sliceCopyPath"), desc: t("sliceCopyPath") },
      reveal: { label: t("sliceReveal"), desc: t("sliceReveal") },
      terminal: { label: t("sliceTerminal"), desc: t("sliceTerminal") },
    };
    return map[item.id] || { label: item.label, desc: item.description };
  };

  // Wheel Items configuration fallback
  const defaultItems: WheelItem[] = [
    { id: "qr", label: t("sliceQr"), description: t("sliceQrDesc"), icon: "qr", color: "#0A84FF", category: "tools" },
    { id: "docx_pdf", label: t("sliceDocxPdf"), description: t("sliceDocxPdfDesc"), icon: "doc", color: "#0A84FF", category: "documents" },
    { id: "pptx_pdf", label: t("slicePptxPdf"), description: t("slicePptxPdfDesc"), icon: "ppt", color: "#0A84FF", category: "documents" },
    { id: "xlsx_pdf", label: t("sliceXlsxPdf"), description: t("sliceXlsxPdfDesc"), icon: "xls", color: "#0A84FF", category: "documents" },
    { id: "img_pdf", label: t("sliceImgPdf"), description: t("sliceImgPdfDesc"), icon: "pdf", color: "#0A84FF", category: "convert" },
    { id: "compress", label: t("sliceCompress"), description: t("sliceCompressDesc"), icon: "compress", color: "#0A84FF", category: "tools" },
  ];

  const currentItems: WheelItem[] =
    customItems && customItems.length > 0 ? customItems : defaultItems;

  // Default to first item hovered on mount or items change
  useEffect(() => {
    if (isOpen && currentItems.length > 0) {
      setHoveredItem(currentItems[0]);
      setSelectedIndex(0);
    }
  }, [isOpen, customItems]);

  // Keyboard navigation & Profile switching
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Tab") {
        e.preventDefault();
        playWheelTick();
        onCycleProfile?.(e.shiftKey ? -1 : 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        playWheelTick();
        const nextIndex = (selectedIndex + 1) % currentItems.length;
        setSelectedIndex(nextIndex);
        setHoveredItem(currentItems[nextIndex]);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        playWheelTick();
        const prevIndex = (selectedIndex - 1 + currentItems.length) % currentItems.length;
        setSelectedIndex(prevIndex);
        setHoveredItem(currentItems[prevIndex]);
      } else if (e.key === "Enter" || e.key === " ") {
        if (hoveredItem) {
          playSuccessChime();
          onSelectAction(hoveredItem.id, hoveredItem.category);
        }
      } else if (e.key === "1") {
        playWheelTick();
        onSelectProfile?.("office");
      } else if (e.key === "2") {
        playWheelTick();
        onSelectProfile?.("design");
      } else if (e.key === "3") {
        playWheelTick();
        onSelectProfile?.("media");
      } else if (e.key === "4") {
        playWheelTick();
        onSelectProfile?.("dev");
      } else if (e.key === "5") {
        playWheelTick();
        onSelectProfile?.("custom");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, currentItems, hoveredItem, onClose, onSelectAction, onCycleProfile, onSelectProfile]);

  if (!isOpen) return null;

  // Pie slice geometry
  const radius = 190;
  const innerRadius = 70;
  const total = Math.max(currentItems.length, 1);
  const angleStep = (2 * Math.PI) / total;

  const renderIcon = (iconName: string, size = 20) => {
    switch (iconName) {
      case "image":
        return <FileImage size={size} />;
      case "music":
        return <Music size={size} />;
      case "film":
        return <Film size={size} />;
      case "pdf":
      case "doc":
      case "txt":
        return <FileText size={size} />;
      case "ppt":
        return <Presentation size={size} />;
      case "xls":
        return <FileSpreadsheet size={size} />;
      case "crop":
        return <Crop size={size} />;
      case "censor":
        return <EyeOff size={size} />;
      case "compress":
        return <Minimize2 size={size} />;
      case "qr":
        return <QrCode size={size} />;
      case "copy":
        return <Copy size={size} />;
      case "folder":
        return <FolderOpen size={size} />;
      case "terminal":
        return <Terminal size={size} />;
      case "info":
        return <Info size={size} />;
      default:
        return <FileImage size={size} />;
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileDrop?.(e.dataTransfer.files[0]);
    }
  };

  const svgWheel = (
    <div
      className="relative w-[420px] h-[420px] flex items-center justify-center select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onWheel={(e) => {
        e.preventDefault();
        playWheelTick();
        if (e.deltaY > 0) {
          const next = (selectedIndex + 1) % currentItems.length;
          setSelectedIndex(next);
          setHoveredItem(currentItems[next]);
        } else {
          const prev = (selectedIndex - 1 + currentItems.length) % currentItems.length;
          setSelectedIndex(prev);
          setHoveredItem(currentItems[prev]);
        }
      }}
    >
      <svg
        className="w-full h-full transform -rotate-90 filter drop-shadow-[0_16px_36px_rgba(0,0,0,0.45)]"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <defs>
          {/* Inactive slice frosted macOS glass background */}
          <linearGradient id="inactiveSliceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E1E22" stopOpacity="0.88" />
            <stop offset="100%" stopColor="#141416" stopOpacity="0.92" />
          </linearGradient>

          {/* Active hovered slice Apple Accent Blue gradient */}
          <linearGradient id="activeHoverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0A84FF" stopOpacity="0.96" />
            <stop offset="100%" stopColor="#0071E3" stopOpacity="0.98" />
          </linearGradient>

          {/* Apple Accent glow drop shadow */}
          <filter id="activeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#0A84FF" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Outer boundary circle */}
        <circle
          cx="210"
          cy="210"
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.14)"
          strokeWidth="1.2"
          className="pointer-events-none"
        />

        {/* Inner boundary circle */}
        <circle
          cx="210"
          cy="210"
          r={innerRadius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.16)"
          strokeWidth="1.2"
          className="pointer-events-none"
        />

        {/* Wheel Slices */}
        {currentItems.map((item, index) => {
          const startAngle = index * angleStep;
          const endAngle = (index + 1) * angleStep;
          const isHovered = hoveredItem?.id === item.id;
          const localized = getSliceText(item);

          // Coordinates around center (210, 210)
          const x1 = 210 + radius * Math.cos(startAngle);
          const y1 = 210 + radius * Math.sin(startAngle);
          const x2 = 210 + radius * Math.cos(endAngle);
          const y2 = 210 + radius * Math.sin(endAngle);

          const x3 = 210 + innerRadius * Math.cos(endAngle);
          const y3 = 210 + innerRadius * Math.sin(endAngle);
          const x4 = 210 + innerRadius * Math.cos(startAngle);
          const y4 = 210 + innerRadius * Math.sin(startAngle);

          const largeArcFlag = angleStep > Math.PI ? 1 : 0;

          const pathData = [
            `M ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `L ${x3} ${y3}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
            "Z",
          ].join(" ");

          const midAngle = startAngle + angleStep / 2;
          const textRadius = (radius + innerRadius) / 2;
          const iconX = 210 + textRadius * Math.cos(midAngle);
          const iconY = 210 + textRadius * Math.sin(midAngle);

          return (
            <g
              key={`${item.id}-${index}`}
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => {
                if (selectedIndex !== index) {
                  playWheelTick();
                }
                setHoveredItem(item);
                setSelectedIndex(index);
              }}
              onClick={(e) => {
                e.stopPropagation();
                playSuccessChime();
                onSelectAction(item.id, item.category);
              }}
            >
              <path
                d={pathData}
                fill={isHovered ? "url(#activeHoverGrad)" : "url(#inactiveSliceGrad)"}
                stroke={isHovered ? "#64D2FF" : "rgba(255, 255, 255, 0.12)"}
                strokeWidth={isHovered ? "2" : "1"}
                filter={isHovered ? "url(#activeGlow)" : undefined}
                className="transition-all duration-150"
              />
              <g
                transform={`translate(${iconX}, ${iconY}) rotate(90)`}
                className="pointer-events-none select-none"
              >
                <g
                  transform="translate(-10, -18)"
                  className={
                    isHovered
                      ? "text-white"
                      : "text-neutral-300"
                  }
                >
                  {renderIcon(item.icon, 20)}
                </g>
                <text
                  x="0"
                  y="15"
                  textAnchor="middle"
                  className={`text-[11px] font-semibold tracking-tight select-none pointer-events-none ${
                    isHovered ? "fill-white font-bold" : "fill-neutral-300"
                  }`}
                >
                  {localized.label}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Central Split Hub: Apple Minimalist Neutral Glass with Left (<) and Right (>) navigation buttons */}
      <div
        className={`absolute w-[136px] h-[136px] rounded-full overflow-hidden flex items-stretch shadow-2xl border border-white/20 bg-[#16161A]/85 backdrop-blur-2xl z-20 pointer-events-auto transition-all duration-200 ${
          isDragOver
            ? "border-[var(--apple-accent)] scale-105 bg-[var(--apple-accent)]/20"
            : ""
        }`}
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => {
          e.stopPropagation();
          playWheelTick();
          if (e.deltaY > 0) onCycleProfile?.(1);
          else onCycleProfile?.(-1);
        }}
      >
        {/* Left Half: Previous Profile / Category */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            playWheelTick();
            onCycleProfile?.(-1);
          }}
          className="flex-1 h-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer group pr-0.5"
          title="Previous (Shift+Tab)"
        >
          <ChevronLeft size={28} strokeWidth={2.2} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Subtle vertical divider down the middle */}
        <div className="w-[1px] h-full bg-white/15 shrink-0" />

        {/* Right Half: Next Profile / Category */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            playWheelTick();
            onCycleProfile?.(1);
          }}
          className="flex-1 h-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer group pl-0.5"
          title="Next (Tab)"
        >
          <ChevronRight size={28} strokeWidth={2.2} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Floating Info Capsule below the wheel */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 pointer-events-none z-30 flex flex-col items-center gap-1">
        {hoveredItem ? (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1C1C1E]/90 border border-white/15 backdrop-blur-2xl shadow-xl text-white whitespace-nowrap animate-in fade-in zoom-in-95 duration-100">
            <span className="font-bold text-[12px] text-[#64D2FF]">{getSliceText(hoveredItem).label}</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="text-[11px] text-neutral-300 max-w-[240px] truncate">{getSliceText(hoveredItem).desc}</span>
          </div>
        ) : profileName ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1C1C1E]/80 border border-white/15 backdrop-blur-xl shadow-lg text-[11px] font-semibold text-neutral-200 whitespace-nowrap">
            <Sparkles size={11} className="text-[var(--apple-accent)]" />
            <span>{profileName}</span>
            {selectedFileNames.length > 0 && (
              <span className="text-[10px] text-neutral-400">({selectedFileNames.length})</span>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );

  // Standalone floating window vs In-app modal
  if (isStandalone) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        {svgWheel}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      {svgWheel}
    </div>
  );
};
