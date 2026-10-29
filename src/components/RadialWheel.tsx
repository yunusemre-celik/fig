import React, { useState, useEffect } from "react";
import { WheelItem, WheelMode, WheelProfileId } from "../types";
import { playSuccessChime, playWheelTick } from "../utils/sound";
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
  const [hoveredItem, setHoveredItem] = useState<WheelItem | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Wheel Items configuration fallback
  const defaultItems: WheelItem[] = [
    { id: "qr", label: "QR Kod", description: "QR oku veya oluştur", icon: "qr", color: "#F59E0B", category: "tools" },
    { id: "docx_pdf", label: "Word → PDF", description: "Word belgesini PDF yap", icon: "doc", color: "#2563EB", category: "documents" },
    { id: "pptx_pdf", label: "PPT → PDF", description: "PowerPoint sunumunu PDF yap", icon: "ppt", color: "#EA580C", category: "documents" },
    { id: "xlsx_pdf", label: "Excel → PDF", description: "Elektronik tabloyu PDF yap", icon: "xls", color: "#059669", category: "documents" },
    { id: "img_pdf", label: "Görselden PDF", description: "Seçili görselleri PDF yap", icon: "pdf", color: "#EF4444", category: "convert" },
    { id: "compress", label: "Sıkıştır", description: "Kalite & boyut optimizasyonu", icon: "compress", color: "#10B981", category: "tools" },
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
          onClose();
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

  // Pie slice geometry matching user photo
  const radius = 190;
  const innerRadius = 72;
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
        className="w-full h-full transform -rotate-90 filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <defs>
          {/* Inactive slice frosted glass background */}
          <linearGradient id="inactiveSliceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#182030" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#0E1522" stopOpacity="0.78" />
          </linearGradient>

          {/* Active hovered slice radiant orange-amber gradient matching photo */}
          <linearGradient id="activeHoverGrad" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#EA580C" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#F59E0B" stopOpacity="0.88" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0.94" />
          </linearGradient>

          {/* Golden glow drop shadow for active slice */}
          <filter id="activeGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#F59E0B" floodOpacity="0.65" />
          </filter>
        </defs>

        {/* Outer boundary circle */}
        <circle
          cx="210"
          cy="210"
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.32)"
          strokeWidth="1.5"
          className="pointer-events-none"
        />

        {/* Inner boundary circle */}
        <circle
          cx="210"
          cy="210"
          r={innerRadius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.30)"
          strokeWidth="1.5"
          className="pointer-events-none"
        />

        {/* Wheel Slices */}
        {currentItems.map((item, index) => {
          const startAngle = index * angleStep;
          const endAngle = (index + 1) * angleStep;
          const isHovered = hoveredItem?.id === item.id;

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
                onClose();
              }}
            >
              <path
                d={pathData}
                fill={isHovered ? "url(#activeHoverGrad)" : "url(#inactiveSliceGrad)"}
                stroke={isHovered ? "#FBBF24" : "rgba(255, 255, 255, 0.24)"}
                strokeWidth={isHovered ? "2.5" : "1.2"}
                filter={isHovered ? "url(#activeGlow)" : undefined}
                className="transition-all duration-150"
              />
              <g
                transform={`translate(${iconX}, ${iconY}) rotate(90)`}
                className="pointer-events-none select-none"
              >
                <g
                  transform="translate(-11, -20)"
                  className={
                    isHovered
                      ? "text-amber-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.4)]"
                      : "text-[#FBBF24] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                  }
                >
                  {renderIcon(item.icon, 22)}
                </g>
                <text
                  x="0"
                  y="15"
                  textAnchor="middle"
                  className="text-[11.5px] font-bold tracking-tight fill-white select-none pointer-events-none"
                  style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.95))" }}
                >
                  {item.label}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Central Split Hub: NO TEXT, divided into Left (<) and Right (>) navigation buttons */}
      <div
        className={`absolute w-[140px] h-[140px] rounded-full overflow-hidden flex items-stretch shadow-[0_20px_50px_rgba(0,0,0,0.85)] border-[1.5px] border-white/25 bg-[#0B101B]/85 backdrop-blur-3xl z-20 pointer-events-auto transition-all duration-200 ${
          isDragOver
            ? "border-amber-400 scale-105 bg-amber-950/70"
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
          className="flex-1 h-full flex items-center justify-center text-amber-400/80 hover:text-amber-300 hover:bg-amber-400/20 active:scale-95 transition-all cursor-pointer group pr-0.5"
          title="Önceki Profil / Kategori (Shift+Tab)"
        >
          <ChevronLeft size={32} strokeWidth={2.4} className="group-hover:-translate-x-0.5 transition-transform drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]" />
        </button>

        {/* Vertical divider line down the middle */}
        <div className="w-[1px] h-full bg-white/20 shrink-0" />

        {/* Right Half: Next Profile / Category */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            playWheelTick();
            onCycleProfile?.(1);
          }}
          className="flex-1 h-full flex items-center justify-center text-amber-400/80 hover:text-amber-300 hover:bg-amber-400/20 active:scale-95 transition-all cursor-pointer group pl-0.5"
          title="Sonraki Profil / Kategori (Tab)"
        >
          <ChevronRight size={32} strokeWidth={2.4} className="group-hover:translate-x-0.5 transition-transform drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]" />
        </button>
      </div>

      {/* Floating Info Pill below the wheel (outside the center) */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 pointer-events-none z-30 flex flex-col items-center gap-1">
        {hoveredItem ? (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0E1422]/90 border border-white/20 backdrop-blur-2xl shadow-2xl text-white whitespace-nowrap animate-in fade-in zoom-in-95 duration-100">
            <span className="font-bold text-[12px] text-amber-300">{hoveredItem.label}</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="text-[11px] text-neutral-300 max-w-[240px] truncate">{hoveredItem.description}</span>
          </div>
        ) : profileName ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0E1422]/80 border border-amber-400/30 backdrop-blur-xl shadow-lg text-[11px] font-semibold text-amber-300 whitespace-nowrap">
            <Sparkles size={11} className="text-amber-400" />
            <span>{profileName}</span>
            {selectedFileNames.length > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-amber-400/40" />
                <span className="text-[10px] text-emerald-300 font-normal truncate max-w-[140px]">
                  {selectedFileNames.length === 1 ? selectedFileNames[0] : `${selectedFileNames.length} dosya`}
                </span>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );

  // Standalone floating window mode: Absolutely ZERO rectangular background or boxes!
  if (isStandalone) {
    return (
      <div
        className="w-[460px] h-[460px] flex items-center justify-center relative bg-transparent overflow-hidden select-none cursor-default"
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      >
        {/* Transparent click-to-dismiss layer outside the wheel */}
        <div
          className="absolute inset-0 cursor-default bg-transparent z-0"
          onClick={onClose}
        />
        <div className="relative z-10">
          {svgWheel}
        </div>
      </div>
    );
  }

  // In-app modal wheel mode:
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 flex flex-col items-center">
        {svgWheel}
        <div className="mt-2 text-[11px] text-neutral-400 font-medium">
          Kapatmak için <kbd>Esc</kbd>
        </div>
      </div>
    </div>
  );
};
