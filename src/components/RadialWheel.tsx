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
  FileText
} from "lucide-react";

interface RadialWheelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionId: string, category: WheelMode) => void;
  selectedFileNames: string[];
}

export const RadialWheel: React.FC<RadialWheelProps> = ({
  isOpen,
  onClose,
  onSelectAction,
  selectedFileNames,
}) => {
  const [activeMode, setActiveMode] = useState<WheelMode>("convert");
  const [hoveredItem, setHoveredItem] = useState<WheelItem | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Wheel Items configuration
  const wheelData: Record<WheelMode, WheelItem[]> = {
    convert: [
      { id: "png", label: "PNG", description: "Kayıpsız şeffaf görsel", icon: "image", color: "#3B82F6", category: "convert" },
      { id: "jpg", label: "JPG", description: "Optimize web fotoğrafı", icon: "image", color: "#F59E0B", category: "convert" },
      { id: "webp", label: "WebP", description: "Hızlı & modern web formatı", icon: "image", color: "#10B981", category: "convert" },
      { id: "bmp", label: "BMP", description: "Ham Windows bitmap", icon: "image", color: "#8B5CF6", category: "convert" },
      { id: "pdf", label: "PDF", description: "Görsellerden PDF belgesi yap", icon: "pdf", color: "#EF4444", category: "convert" },
    ],
    tools: [
      { id: "crop", label: "Kırp & Düzenle", description: "Serbest veya oranlı görsel kırpma", icon: "crop", color: "#F59E0B", category: "tools" },
      { id: "compress", label: "Sıkıştır", description: "Kalite & boyut optimizasyonu", icon: "compress", color: "#10B981", category: "tools" },
      { id: "qr", label: "QR Kod", description: "QR oku veya yeni QR oluştur", icon: "qr", color: "#3B82F6", category: "tools" },
      { id: "info", label: "Dosya Bilgisi", description: "Boyut, çözünürlük ve meta veriler", icon: "info", color: "#6366F1", category: "tools" },
    ],
    actions: [
      { id: "copy_path", label: "Yolu Kopyala", description: "Dosya yolunu panoya kopyala", icon: "copy", color: "#10B981", category: "actions" },
      { id: "reveal", label: "Explorer'da Göster", description: "Dosyayı klasöründe vurgula", icon: "folder", color: "#F59E0B", category: "actions" },
      { id: "terminal", label: "Terminalde Aç", description: "Klasör konumunda PowerShell aç", icon: "terminal", color: "#3B82F6", category: "actions" },
    ],
  };

  const currentItems = wheelData[activeMode];

  // Default to first item hovered
  useEffect(() => {
    if (isOpen && currentItems.length > 0) {
      setHoveredItem(currentItems[0]);
      setSelectedIndex(0);
    }
  }, [isOpen, activeMode]);

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
      } else if (e.key === "1") {
        setActiveMode("convert");
      } else if (e.key === "2") {
        setActiveMode("tools");
      } else if (e.key === "3") {
        setActiveMode("actions");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, currentItems, hoveredItem, onClose, onSelectAction]);

  if (!isOpen) return null;

  // Pie slice calculations
  const radius = 175;
  const innerRadius = 78;
  const total = currentItems.length;
  const angleStep = (2 * Math.PI) / total;

  const renderIcon = (iconName: string, size = 18) => {
    switch (iconName) {
      case "image":
        return <FileImage size={size} />;
      case "pdf":
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      {/* Background click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 flex flex-col items-center">
        {/* Mode Selector Pill */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#1A202C]/90 border border-white/[0.1] shadow-2xl backdrop-blur-xl mb-6">
          <button
            onClick={() => setActiveMode("convert")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeMode === "convert"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/30 scale-105"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Dönüştür (1)
          </button>
          <button
            onClick={() => setActiveMode("tools")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeMode === "tools"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/30 scale-105"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Araçlar (2)
          </button>
          <button
            onClick={() => setActiveMode("actions")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeMode === "actions"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/30 scale-105"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            İşlemler (3)
          </button>
        </div>

        {/* Selected file info badge */}
        {selectedFileNames.length > 0 && (
          <div className="mb-4 text-xs font-medium text-neutral-300 bg-white/[0.06] border border-white/[0.08] px-3.5 py-1 rounded-full flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{selectedFileNames.length === 1 ? selectedFileNames[0] : `${selectedFileNames.length} dosya seçili`}</span>
          </div>
        )}

        {/* The Radial Pie SVG */}
        <div className="relative w-[360px] h-[360px] flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
            <defs>
              <linearGradient id="sliceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E293B" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#0F172A" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="hoverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
            </defs>

            {currentItems.map((item, index) => {
              const startAngle = index * angleStep;
              const endAngle = (index + 1) * angleStep;
              const isHovered = hoveredItem?.id === item.id;

              // Outer arc coordinates
              const x1 = 180 + radius * Math.cos(startAngle);
              const y1 = 180 + radius * Math.sin(startAngle);
              const x2 = 180 + radius * Math.cos(endAngle);
              const y2 = 180 + radius * Math.sin(endAngle);

              // Inner arc coordinates
              const x3 = 180 + innerRadius * Math.cos(endAngle);
              const y3 = 180 + innerRadius * Math.sin(endAngle);
              const x4 = 180 + innerRadius * Math.cos(startAngle);
              const y4 = 180 + innerRadius * Math.sin(startAngle);

              const largeArcFlag = angleStep > Math.PI ? 1 : 0;

              const pathData = [
                `M ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `L ${x3} ${y3}`,
                `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                "Z",
              ].join(" ");

              // Midpoint angle for label and icon placement
              const midAngle = startAngle + angleStep / 2;
              const textRadius = (radius + innerRadius) / 2;
              const iconX = 180 + textRadius * Math.cos(midAngle);
              const iconY = 180 + textRadius * Math.sin(midAngle);

              return (
                <g
                  key={item.id}
                  className="cursor-pointer transition-transform duration-150"
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
                    stroke="rgba(255, 255, 255, 0.12)"
                    strokeWidth="1.5"
                    className="transition-colors duration-150 hover:brightness-110"
                  />
                  {/* Icon & Label within the slice */}
                  <g
                    transform={`translate(${iconX}, ${iconY}) rotate(90)`}
                    className="pointer-events-none select-none"
                  >
                    <g transform="translate(-10, -18)" className={isHovered ? "text-black" : "text-amber-400"}>
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
          <div className="absolute w-[140px] h-[140px] rounded-full bg-[#111622] border border-white/[0.12] shadow-2xl flex flex-col items-center justify-center p-3 text-center pointer-events-none backdrop-blur-xl">
            {hoveredItem ? (
              <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-150">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center mb-1 text-white shadow-sm"
                  style={{ backgroundColor: hoveredItem.color }}
                >
                  {renderIcon(hoveredItem.icon, 16)}
                </div>
                <span className="font-bold text-xs text-white leading-tight">{hoveredItem.label}</span>
                <span className="text-[10px] text-neutral-400 leading-tight mt-0.5 line-clamp-2 px-1">
                  {hoveredItem.description}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-neutral-400">
                <span className="text-[11px] font-semibold">Bir işlem seçin</span>
                <span className="text-[9px] text-neutral-500 mt-0.5">Çarkta gezinin</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer shortcuts hint */}
        <div className="mt-6 flex items-center gap-4 text-[11px] text-neutral-400">
          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 rounded bg-white/[0.08] border border-white/[0.1] text-neutral-300 font-mono text-[10px]">
              Tab / Ok Tuşları
            </kbd>
            Gezin
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 rounded bg-white/[0.08] border border-white/[0.1] text-neutral-300 font-mono text-[10px]">
              Enter
            </kbd>
            Çalıştır
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 rounded bg-white/[0.08] border border-white/[0.1] text-neutral-300 font-mono text-[10px]">
              Esc
            </kbd>
            Kapat
          </span>
        </div>
      </div>
    </div>
  );
};
