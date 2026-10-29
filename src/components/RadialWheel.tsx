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
  Sliders,
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
  const [activeMode, setActiveMode] = useState<WheelMode | "profile">(
    customItems && customItems.length > 0 ? "profile" : "convert"
  );
  const [hoveredItem, setHoveredItem] = useState<WheelItem | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Wheel Items configuration
  const wheelData: Record<WheelMode, WheelItem[]> = {
    convert: [
      { id: "png", label: "PNG", description: "Kayıpsız şeffaf görsel", icon: "image", color: "#3B82F6", category: "convert" },
      { id: "jpg", label: "JPG", description: "Optimize web fotoğrafı", icon: "image", color: "#F59E0B", category: "convert" },
      { id: "webp", label: "WebP", description: "Hızlı & modern web formatı", icon: "image", color: "#10B981", category: "convert" },
      { id: "bmp", label: "BMP", description: "Ham Windows bitmap", icon: "image", color: "#8B5CF6", category: "convert" },
      { id: "pdf", label: "PDF", description: "Görsellerden PDF belgesi yap", icon: "pdf", color: "#EF4444", category: "convert" },
    ],
    documents: [
      { id: "docx_pdf", label: "Word → PDF", description: "DOCX/DOC dosyalarını PDF yap", icon: "doc", color: "#2563EB", category: "documents" },
      { id: "pptx_pdf", label: "PPT → PDF", description: "PowerPoint sunumunu PDF yap", icon: "ppt", color: "#EA580C", category: "documents" },
      { id: "xlsx_pdf", label: "Excel → PDF", description: "Elektronik tabloyu PDF yap", icon: "xls", color: "#059669", category: "documents" },
      { id: "txt_pdf", label: "Metin → PDF", description: "TXT/MD dosyasını PDF yap", icon: "txt", color: "#4B5563", category: "documents" },
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

  const currentItems: WheelItem[] =
    activeMode === "profile" && customItems && customItems.length > 0
      ? customItems
      : wheelData[activeMode as WheelMode] || wheelData.convert;

  // Default to first item hovered on open or mode switch
  useEffect(() => {
    if (isOpen && currentItems.length > 0) {
      setHoveredItem(currentItems[0]);
      setSelectedIndex(0);
    }
  }, [isOpen, activeMode, customItems]);

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
        if (customItems && customItems.length > 0) {
          setActiveMode("profile");
        } else {
          setActiveMode("convert");
        }
      } else if (e.key === "2") {
        setActiveMode("documents");
      } else if (e.key === "3") {
        setActiveMode("tools");
      } else if (e.key === "4") {
        setActiveMode("actions");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, currentItems, hoveredItem, onClose, onSelectAction, customItems]);

  if (!isOpen) return null;

  // Pie slice calculations
  const radius = 175;
  const innerRadius = 78;
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

  const content = (
    <div
      className={`relative z-10 flex flex-col items-center select-none ${
        isStandalone ? "w-[460px] h-[460px] justify-center" : ""
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Mode Selector Pill */}
      <div className="flex items-center gap-1 p-1 rounded-full bg-[#1A202C]/90 border border-white/[0.1] shadow-2xl backdrop-blur-xl mb-4">
        {customItems && customItems.length > 0 && (
          <button
            onClick={() => setActiveMode("profile")}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1 ${
              activeMode === "profile"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/30 scale-105"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Sparkles size={11} />
            <span>{profileName || "Profilim"}</span>
          </button>
        )}
        <button
          onClick={() => setActiveMode("convert")}
          className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
            activeMode === "convert"
              ? "bg-amber-500 text-black shadow-md shadow-amber-500/30 scale-105"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Görsel
        </button>
        <button
          onClick={() => setActiveMode("documents")}
          className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
            activeMode === "documents"
              ? "bg-amber-500 text-black shadow-md shadow-amber-500/30 scale-105"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Belge
        </button>
        <button
          onClick={() => setActiveMode("tools")}
          className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
            activeMode === "tools"
              ? "bg-amber-500 text-black shadow-md shadow-amber-500/30 scale-105"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Araçlar
        </button>
        {onCycleProfile && (
          <button
            onClick={onCycleProfile}
            title="Profili Değiştir"
            className="p-1 rounded-full text-neutral-400 hover:text-amber-400 hover:bg-white/[0.08] transition-colors"
          >
            <Sliders size={12} />
          </button>
        )}
      </div>

      {/* Selected file or Drag hint info badge */}
      {selectedFileNames.length > 0 ? (
        <div className="mb-3 text-[11px] font-medium text-neutral-300 bg-white/[0.08] border border-white/[0.1] px-3 py-0.5 rounded-full flex items-center gap-2 max-w-[320px] truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="truncate">
            {selectedFileNames.length === 1
              ? selectedFileNames[0]
              : `${selectedFileNames.length} dosya hazır`}
          </span>
        </div>
      ) : isDragOver ? (
        <div className="mb-3 text-[11px] font-semibold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-3 py-0.5 rounded-full flex items-center gap-1.5 animate-bounce">
          <Sparkles size={12} />
          <span>Dosyayı buraya bırakın!</span>
        </div>
      ) : null}

      {/* The Radial Pie SVG */}
      <div className="relative w-[360px] h-[360px] flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_12px_40px_rgba(0,0,0,0.7)]">
          <defs>
            <linearGradient id="sliceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0F172A" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="hoverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
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
                key={`${item.id}-${index}`}
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
                  stroke={isHovered ? "rgba(245, 158, 11, 0.8)" : "rgba(255, 255, 255, 0.12)"}
                  strokeWidth={isHovered ? "2.5" : "1.5"}
                  className="transition-all duration-150"
                />
                {/* Icon & Label within the slice */}
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
          className={`absolute w-[140px] h-[140px] rounded-full bg-[#111622]/95 border shadow-2xl flex flex-col items-center justify-center p-3 text-center pointer-events-none backdrop-blur-xl transition-all duration-150 ${
            isDragOver
              ? "border-amber-400 scale-105 bg-amber-950/40"
              : "border-white/[0.12]"
          }`}
        >
          {hoveredItem ? (
            <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-150">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center mb-1 text-white shadow-sm"
                style={{ backgroundColor: hoveredItem.color }}
              >
                {renderIcon(hoveredItem.icon, 16)}
              </div>
              <span className="font-bold text-xs text-white leading-tight">
                {hoveredItem.label}
              </span>
              <span className="text-[10px] text-neutral-400 leading-tight mt-0.5 line-clamp-2 px-1">
                {hoveredItem.description}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-neutral-400">
              <span className="text-[11px] font-semibold text-neutral-300">
                {isDragOver ? "Bırakın!" : "İşlem Seçin"}
              </span>
              <span className="text-[9px] text-neutral-500 mt-0.5">
                {isDragOver ? "Dosya hazır" : "Çarkta gezinin"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer shortcuts hint */}
      <div className="mt-4 flex items-center gap-3 text-[10px] text-neutral-400">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] border border-white/[0.1] text-neutral-300 font-mono text-[9px]">
            Tab
          </kbd>
          Gezin
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] border border-white/[0.1] text-neutral-300 font-mono text-[9px]">
            Enter
          </kbd>
          Çalıştır
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] border border-white/[0.1] text-neutral-300 font-mono text-[9px]">
            Esc
          </kbd>
          Kapat
        </span>
      </div>
    </div>
  );

  if (isStandalone) {
    return (
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
        {/* Transparent click to dismiss outside the circle */}
        <div
          className="absolute inset-0 cursor-default"
          onClick={onClose}
          onContextMenu={(e) => {
            e.preventDefault();
            onClose();
          }}
        />
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      {/* Background click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />
      {content}
    </div>
  );
};
