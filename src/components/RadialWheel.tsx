import React, { useState, useEffect } from "react";
import { WheelItem, WheelMode, WheelProfileId } from "../types";
import { playSuccessChime } from "../utils/sound";
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
        onCycleProfile?.(e.shiftKey ? -1 : 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const nextIndex = (selectedIndex + 1) % currentItems.length;
        setSelectedIndex(nextIndex);
        setHoveredItem(currentItems[nextIndex]);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
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
        onSelectProfile?.("office");
      } else if (e.key === "2") {
        onSelectProfile?.("design");
      } else if (e.key === "3") {
        onSelectProfile?.("media");
      } else if (e.key === "4") {
        onSelectProfile?.("dev");
      } else if (e.key === "5") {
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

      {/* Central Information Hub matching user photo */}
      <div
        className={`absolute w-[140px] h-[140px] rounded-full glass-panel flex flex-col items-center justify-center p-3 text-center shadow-[0_20px_50px_rgba(0,0,0,0.85)] border-[1.5px] border-white/25 bg-[#0E1420]/90 backdrop-blur-3xl z-20 pointer-events-auto transition-all duration-200 ${
          isDragOver
            ? "border-amber-400 scale-105 bg-amber-950/70"
            : ""
        }`}
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => {
          e.stopPropagation();
          if (e.deltaY > 0) onCycleProfile?.(1);
          else onCycleProfile?.(-1);
        }}
      >
        {/* Profile Pill Header */}
        {profileName && (
          <div className="flex items-center justify-center gap-0.5 mb-1 z-30">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCycleProfile?.(-1);
              }}
              className="w-4 h-4 rounded-full flex items-center justify-center text-amber-400/80 hover:text-amber-300 hover:bg-amber-400/20 transition-all cursor-pointer"
              title="Önceki Profil (Shift+Tab)"
            >
              <ChevronLeft size={11} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCycleProfile?.(1);
              }}
              className="px-2 py-0.5 rounded-full text-[9.5px] font-bold text-amber-300 bg-amber-400/15 border border-amber-400/40 hover:bg-amber-400/25 transition-all flex items-center gap-1 cursor-pointer shadow-sm"
              title="Profili Değiştir (Tıkla, Tab, Fare Tekerleği veya 1-4 tuşları)"
            >
              <Sparkles size={9} className="text-amber-400 shrink-0" />
              <span className="truncate max-w-[78px]">{profileName}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCycleProfile?.(1);
              }}
              className="w-4 h-4 rounded-full flex items-center justify-center text-amber-400/80 hover:text-amber-300 hover:bg-amber-400/20 transition-all cursor-pointer"
              title="Sonraki Profil (Tab)"
            >
              <ChevronRight size={11} />
            </button>
          </div>
        )}

        {/* Selected File Badge if any */}
        {selectedFileNames.length > 0 && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[8.5px] font-bold max-w-[115px] truncate mb-0.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
            <span className="truncate">
              {selectedFileNames.length === 1
                ? selectedFileNames[0]
                : `${selectedFileNames.length} Dosya Seçili`}
            </span>
          </div>
        )}

        {/* Current Hovered Slice Details */}
        {hoveredItem ? (
          <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-100">
            <span className="font-black text-[12.5px] text-white leading-tight tracking-tight">
              {hoveredItem.label}
            </span>
            <span className="text-[9px] text-neutral-300/80 leading-tight mt-0.5 line-clamp-2 px-1 max-w-[115px]">
              {hoveredItem.description}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center text-neutral-400">
            <span className="text-[11px] font-bold text-white">İşlem Seçin</span>
            <span className="text-[8.5px] text-neutral-400 mt-0.5">veya dosya bırakın</span>
          </div>
        )}
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
