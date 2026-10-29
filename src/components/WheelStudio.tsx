import React from "react";
import { WheelItem, WheelProfile, WheelProfileId } from "../types";
import {
  Palette,
  Briefcase,
  Code2,
  Sliders,
  Check,
  Plus,
  Trash2,
  FileText,
  FileImage,
  Crop,
  Minimize2,
  QrCode,
  Copy,
  FolderOpen,
  Terminal,
  Info,
  Sparkles,
} from "lucide-react";

interface WheelStudioProps {
  currentProfile: WheelProfileId;
  onSelectProfile: (id: WheelProfileId) => void;
  customItems: WheelItem[];
  onUpdateCustomItems: (items: WheelItem[]) => void;
}

// Available pool of all actions in Fig
export const ALL_AVAILABLE_ACTIONS: WheelItem[] = [
  // Images
  { id: "webp", label: "WebP", description: "Hızlı & modern web formatı", icon: "image", color: "#10B981", category: "convert" },
  { id: "png", label: "PNG", description: "Kayıpsız şeffaf görsel", icon: "image", color: "#3B82F6", category: "convert" },
  { id: "jpg", label: "JPG", description: "Optimize web fotoğrafı", icon: "image", color: "#F59E0B", category: "convert" },
  { id: "bmp", label: "BMP", description: "Ham Windows bitmap", icon: "image", color: "#8B5CF6", category: "convert" },
  { id: "img_pdf", label: "Görselden PDF", description: "Seçili görselleri PDF yap", icon: "pdf", color: "#EF4444", category: "convert" },

  // Documents
  { id: "docx_pdf", label: "Word → PDF", description: "DOCX/DOC dosyalarını PDF yap", icon: "doc", color: "#2563EB", category: "documents" },
  { id: "pptx_pdf", label: "PPT → PDF", description: "PowerPoint sunumunu PDF yap", icon: "ppt", color: "#EA580C", category: "documents" },
  { id: "xlsx_pdf", label: "Excel → PDF", description: "Elektronik tabloyu PDF yap", icon: "xls", color: "#059669", category: "documents" },
  { id: "txt_pdf", label: "Metin → PDF", description: "TXT/MD dosyasını PDF yap", icon: "txt", color: "#4B5563", category: "documents" },

  // Tools
  { id: "crop", label: "Kırp & Düzenle", description: "Serbest veya oranlı kırpma", icon: "crop", color: "#F59E0B", category: "tools" },
  { id: "compress", label: "Sıkıştır", description: "Kalite & boyut optimizasyonu", icon: "compress", color: "#10B981", category: "tools" },
  { id: "qr", label: "QR Kod", description: "QR oku veya oluştur", icon: "qr", color: "#3B82F6", category: "tools" },
  { id: "info", label: "Dosya Bilgisi", description: "Boyut, çözünürlük ve meta veriler", icon: "info", color: "#6366F1", category: "tools" },

  // Actions
  { id: "copy_path", label: "Yolu Kopyala", description: "Dosya yolunu panoya kopyala", icon: "copy", color: "#10B981", category: "actions" },
  { id: "reveal", label: "Explorer'da Aç", description: "Dosyayı klasöründe vurgula", icon: "folder", color: "#F59E0B", category: "actions" },
  { id: "terminal", label: "Terminalde Aç", description: "Klasör konumunda PowerShell aç", icon: "terminal", color: "#3B82F6", category: "actions" },
];

export const PRESET_PROFILES: Record<WheelProfileId, WheelProfile> = {
  design: {
    id: "design",
    name: "Tasarım & Fotoğraf",
    description: "WebP, PNG, Kırpma, Sıkıştırma ve görsel araçları.",
    icon: "palette",
    items: [
      ALL_AVAILABLE_ACTIONS.find((a) => a.id === "webp")!,
      ALL_AVAILABLE_ACTIONS.find((a) => a.id === "png")!,
      ALL_AVAILABLE_ACTIONS.find((a) => a.id === "jpg")!,
      ALL_AVAILABLE_ACTIONS.find((a) => a.id === "crop")!,
      ALL_AVAILABLE_ACTIONS.find((a) => a.id === "compress")!,
      ALL_AVAILABLE_ACTIONS.find((a) => a.id === "img_pdf")!,
    ],
  },
  office: {
    id: "office",
    name: "Ofis & Belgeler",
    description: "Word, PowerPoint, Excel dönüştürme ve PDF araçları.",
    icon: "briefcase",
    items: [
      ALL_AVAILABLE_ACTIONS.find((a) => a.id === "qr")!,
      ALL_AVAILABLE_ACTIONS.find((a) => a.id === "docx_pdf")!,
      ALL_AVAILABLE_ACTIONS.find((a) => a.id === "pptx_pdf")!,
      ALL_AVAILABLE_ACTIONS.find((a) => a.id === "xlsx_pdf")!,
      ALL_AVAILABLE_ACTIONS.find((a) => a.id === "img_pdf")!,
      ALL_AVAILABLE_ACTIONS.find((a) => a.id === "compress")!,
    ],
  },
  dev: {
    id: "dev",
    name: "Geliştirici & Kod",
    description: "WebP, QR, Terminal, Yolu Kopyala ve Explorer.",
    icon: "code",
    items: [
      ALL_AVAILABLE_ACTIONS.find((a) => a.id === "webp")!,
      ALL_AVAILABLE_ACTIONS.find((a) => a.id === "qr")!,
      ALL_AVAILABLE_ACTIONS.find((a) => a.id === "terminal")!,
      ALL_AVAILABLE_ACTIONS.find((a) => a.id === "copy_path")!,
      ALL_AVAILABLE_ACTIONS.find((a) => a.id === "reveal")!,
      ALL_AVAILABLE_ACTIONS.find((a) => a.id === "info")!,
    ],
  },
  custom: {
    id: "custom",
    name: "Özel Profil",
    description: "Tamamen sizin belirlediğiniz eylemlerden oluşan çark.",
    icon: "sliders",
    items: [],
  },
};

export const WheelStudio: React.FC<WheelStudioProps> = ({
  currentProfile,
  onSelectProfile,
  customItems,
  onUpdateCustomItems,
}) => {
  const activeItems =
    currentProfile === "custom"
      ? customItems
      : PRESET_PROFILES[currentProfile].items;

  const handleToggleAction = (action: WheelItem) => {
    const exists = customItems.some((i) => i.id === action.id);
    if (exists) {
      onUpdateCustomItems(customItems.filter((i) => i.id !== action.id));
    } else {
      if (customItems.length >= 8) {
        alert("Bir çarkta en fazla 8 dilim bulunabilir.");
        return;
      }
      onUpdateCustomItems([...customItems, action]);
    }
  };

  const renderIcon = (name: string, size = 16) => {
    switch (name) {
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
      default:
        return <Info size={size} />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto space-y-6 text-neutral-100">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold mb-2">
          <Sparkles size={13} />
          <span>Çark Stüdyosu</span>
        </div>
        <h2 className="text-xl font-bold text-white">İşlem Çarkınızı Özelleştirin</h2>
        <p className="text-xs text-neutral-400 mt-1">
          `Ctrl + Space` ile fare imlecinizin ucunda açılacak dilimleri seçin veya hazır profillerden birini kullanın.
        </p>
      </div>

      {/* Preset Profiles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {(["design", "office", "dev", "custom"] as WheelProfileId[]).map((pid) => {
          const p = PRESET_PROFILES[pid];
          const isSelected = currentProfile === pid;

          return (
            <button
              key={pid}
              onClick={() => onSelectProfile(pid)}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-32 ${
                isSelected
                  ? "bg-amber-500/20 border-amber-500/50 shadow-lg shadow-amber-500/15 scale-[1.02] backdrop-blur-xl"
                  : "glass-card hover:border-white/[0.18]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isSelected
                      ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/30"
                      : "bg-white/[0.08] text-neutral-300"
                  }`}
                >
                  {pid === "design" && <Palette size={16} />}
                  {pid === "office" && <Briefcase size={16} />}
                  {pid === "dev" && <Code2 size={16} />}
                  {pid === "custom" && <Sliders size={16} />}
                </div>
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-black">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
              </div>
              <div>
                <span className="font-bold text-xs text-white block">{p.name}</span>
                <span className="text-[10px] text-neutral-400 line-clamp-2 mt-0.5">{p.description}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Slices Preview */}
      <div className="p-5 rounded-3xl glass-panel">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">Çarktaki Aktif Dilimler</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              {activeItems.length} Dilim
            </span>
          </div>
          {currentProfile === "custom" && (
            <span className="text-[11px] text-neutral-400">
              Aşağıdaki listeden tıkla ve çarkına ekle/çıkar (Maks 8)
            </span>
          )}
        </div>

        {/* Chips of active slices */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {activeItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="flex items-center justify-between p-2.5 rounded-xl glass-card"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0 text-xs shadow-sm"
                  style={{ backgroundColor: item.color }}
                >
                  {renderIcon(item.icon, 13)}
                </div>
                <div className="min-w-0">
                  <span className="font-semibold text-xs text-white block truncate">{item.label}</span>
                  <span className="text-[9px] text-neutral-400 truncate block">{item.description}</span>
                </div>
              </div>

              {currentProfile === "custom" && (
                <button
                  onClick={() => handleToggleAction(item)}
                  className="p-1 rounded text-neutral-500 hover:text-rose-400 hover:bg-white/[0.08] transition-colors"
                  title="Çarktan Çıkar"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Available Actions Pool (Shown for custom profile) */}
      {currentProfile === "custom" && (
        <div className="p-5 rounded-3xl glass-panel">
          <h3 className="text-xs font-bold text-white mb-3">Tüm Kullanılabilir Eylemler Havuzu</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ALL_AVAILABLE_ACTIONS.map((action) => {
              const isAdded = customItems.some((i) => i.id === action.id);

              return (
                <button
                  key={action.id}
                  onClick={() => handleToggleAction(action)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                    isAdded
                      ? "bg-amber-500/15 border-amber-500/35 text-white shadow-sm"
                      : "glass-card text-neutral-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0 text-xs"
                      style={{ backgroundColor: action.color }}
                    >
                      {renderIcon(action.icon, 13)}
                    </div>
                    <span className="font-medium text-xs truncate">{action.label}</span>
                  </div>
                  {isAdded ? (
                    <Check size={14} className="text-amber-400 shrink-0" />
                  ) : (
                    <Plus size={14} className="text-neutral-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
