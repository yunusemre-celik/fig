import React, { useState, useEffect } from "react";
import { WheelItem, WheelMode } from "../types";
import { playHoverTick, playSuccessChime } from "../utils/sound";
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
} from "lucide-react";

interface RadialWheelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionId: string, category: WheelMode) => void;
  selectedFileNames: string[];
  customItems?: WheelItem[];
  isStandalone?: boolean;
  profileName?: string;
  onCycleProfile?: () => void;
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
  onFileDrop,
}) => {
  const [hoveredItem, setHoveredItem] = useState<WheelItem | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Wheel Items configuration fallback
  const defaultItems: WheelItem[] = [
    { id: "webp", label: "WebP", description: "Hızlı & modern web formatı", icon: "image", color: "#10B981", category: "convert" },
    { id: "png", label: "PNG", description: "Kayıpsız şeffaf görsel", icon: "image", color: "#3B82F6", category: "convert" },
    { id: "docx_pdf", label: "Word → PDF", description: "Word belgesini PDF yap", icon: "doc", color: "#2563EB", category: "documents" },
    { id: "crop", label: "Kırp", description: "Oranlı görsel kırpma", icon: "crop", color: "#F59E0B", category: "tools" },
    { id: "compress", label: "Sıkıştır", description: "Boyut optimizasyonu", icon: "compress", color: "#10B981", category: "tools" },
    { id: "qr", label: "QR Kod", description: "QR oku veya oluştur", icon: "qr", color: "#3B82F6", category: "tools" },
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

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" || e.key === "Tab") {
        e.preventDefault();
        const nextIndex = (selectedIndex + 1) % currentItems.length;
        setSelectedIndex(nextIndex);
        setHoveredItem(currentItems[nextIndex]);
        playHoverTick();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prevIndex = (selectedIndex - 1 + currentItems.length) % currentItems.length;
        setSelectedIndex(prevIndex);
        setHoveredItem(currentItems[prevIndex]);
        playHoverTick();
      } else if (e.key === "Enter") {
        if (hoveredItem) {
          playSuccessChime();
          onSelectAction(hoveredItem.id, hoveredItem.category);
          onClose();
        }
      } else if (["1", "2", "3", "4"].includes(e.key)) {
        onCycleProfile?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, currentItems, hoveredItem, onClose, onSelectAction, onCycleProfile]);

  if (!isOpen) return null;

  // Pie slice calculations
  const radius = 185;
  const innerRadius = 76;
  const total = Math.max(currentItems.length, 1);
  const angleStep = (2 * Math.PI) / total;

  const renderIcon = (iconName: string, size = 18) => {
    switch (iconName) {
      case "image":
        return <FileImage size={size} />;
      case "pdf":
      case "doc":
      case "ppt":
      case "xls":
      case "txt":
        return <FileText size={size} />;
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
      className="relative w-[400px] h-[400px] flex items-center justify-center select-none"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_16px_50px_rgba(0,0,0,0.85)]">
        <defs>
          <linearGradient id="sliceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E2838" stopOpacity="0.94" />
            <stop offset="100%" stopColor="#0D1522" stopOpacity="0.96" />
          </linearGradient>
          <linearGradient id="hoverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(245, 158, 11, 0.25)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {currentItems.map((item, index) => {
          const startAngle = index * angleStep;
          const endAngle = (index + 1) * angleStep;
          const isHovered = hoveredItem?.id === item.id;

          // Coordinates
          const x1 = 200 + radius * Math.cos(startAngle);
          const y1 = 200 + radius * Math.sin(startAngle);
          const x2 = 200 + radius * Math.cos(endAngle);
          const y2 = 200 + radius * Math.sin(endAngle);

          const x3 = 200 + innerRadius * Math.cos(endAngle);
          const y3 = 200 + innerRadius * Math.sin(endAngle);
          const x4 = 200 + innerRadius * Math.cos(startAngle);
          const y4 = 200 + innerRadius * Math.sin(startAngle);

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
          const iconX = 200 + textRadius * Math.cos(midAngle);
          const iconY = 200 + textRadius * Math.sin(midAngle);

          return (
            <g
              key={`${item.id}-${index}`}
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => {
                setHoveredItem(item);
                setSelectedIndex(index);
                playHoverTick();
              }}
              onClick={() => {
                playSuccessChime();
                onSelectAction(item.id, item.category);
                onClose();
              }}
            >
              <path
                d={pathData}
                fill={isHovered ? "url(#hoverGrad)" : "url(#sliceGrad)"}
                stroke={isHovered ? "rgba(254, 243, 199, 0.85)" : "rgba(255, 255, 255, 0.14)"}
                strokeWidth={isHovered ? "2.5" : "1.2"}
                className="transition-all duration-150"
              />
              <g
                transform={`translate(${iconX}, ${iconY}) rotate(90)`}
                className="pointer-events-none select-none"
              >
                <g
                  transform="translate(-10, -18)"
                  className={isHovered ? "text-black" : "text-amber-400"}
                >
                  {renderIcon(item.icon, 20)}
                </g>
                <text
                  x="0"
                  y="14"
                  textAnchor="middle"
                  className={`text-[11px] font-bold tracking-wider ${
                    isHovered ? "fill-black" : "fill-neutral-200"
                  }`}
                >
                  {item.label}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Central Information Hub */}
      <div
        className={`absolute w-[142px] h-[142px] rounded-full glass-panel flex flex-col items-center justify-center p-3 text-center pointer-events-none shadow-2xl transition-all duration-200 ${
          isDragOver
            ? "border-amber-400 scale-105 bg-amber-950/60"
            : "border-white/[0.16] bg-[#0E1522]/95"
        }`}
      >
        {/* Profile Pill Header */}
        {profileName && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCycleProfile?.();
            }}
            className="pointer-events-auto px-2 py-0.5 rounded-full text-[9px] font-bold text-amber-300 bg-amber-400/15 border border-amber-400/30 mb-1 flex items-center gap-1 hover:bg-amber-400/25 transition-colors cursor-pointer"
            title="Profili Değiştir (Tıkla veya 1-4 tuşları)"
          >
            <Sparkles size={9} />
            <span className="truncate max-w-[85px]">{profileName}</span>
          </button>
        )}

        {/* Selected File Badge if any */}
        {selectedFileNames.length > 0 ? (
          <div className="flex flex-col items-center my-0.5 max-w-[120px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mb-0.5" />
            <span className="text-[10px] font-semibold text-white truncate max-w-[110px]">
              {selectedFileNames[0]}
            </span>
          </div>
        ) : null}

        {/* Current Hovered Slice Details */}
        {hoveredItem ? (
          <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-100">
            <span className="font-extrabold text-xs text-white leading-tight">
              {hoveredItem.label}
            </span>
            <span className="text-[9px] text-neutral-300 leading-tight mt-0.5 line-clamp-2 px-1">
              {hoveredItem.description}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center text-neutral-400">
            <span className="text-[10px] font-semibold text-neutral-300">
              {isDragOver ? "Dosyayı Bırakın!" : "İşlem Seçin"}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  // Standalone floating window mode: Absolutely ZERO rectangular background or boxes!
  if (isStandalone) {
    return (
      <div className="w-[460px] h-[460px] flex items-center justify-center relative bg-transparent overflow-hidden select-none">
        {/* Transparent click to dismiss outside the circle */}
        <div
          className="absolute inset-0 cursor-default bg-transparent"
          onClick={onClose}
          onContextMenu={(e) => {
            e.preventDefault();
            onClose();
          }}
        />
        {svgWheel}
      </div>
    );
  }

  // In-app modal wheel mode:
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 flex flex-col items-center">
        {svgWheel}
        <div className="mt-2 text-[11px] text-neutral-400 font-medium">
          Kapatmak için <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-neutral-300 font-mono text-[10px]">Esc</kbd>
        </div>
      </div>
    </div>
  );
};
