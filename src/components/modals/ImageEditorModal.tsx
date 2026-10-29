import React, { useState, useRef, useEffect } from "react";
import { X, Crop, EyeOff, Check, Info } from "lucide-react";
import { FileInfo } from "../../types";
import { saveAppSettings, getAppSettings, BlurRegion } from "../../services/api";

export type ImageEditorMode = "crop" | "censor";

interface ImageEditorModalProps {
  isOpen: boolean;
  initialMode?: ImageEditorMode;
  file: FileInfo | null;
  onClose: () => void;
  onConfirmCrop: (cropData: { x: number; y: number; width: number; height: number; overwrite: boolean }) => void;
  onConfirmCensor: (censorData: { blurSigma: number; regions: BlurRegion[] | null; overwrite: boolean }) => void;
}

type AspectPreset = "free" | "1:1" | "16:9" | "4:3" | "9:16";

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  isOpen,
  initialMode = "crop",
  file,
  onClose,
  onConfirmCrop,
  onConfirmCensor,
}) => {
  const [mode, setMode] = useState<ImageEditorMode>(initialMode);
  const [aspect, setAspect] = useState<AspectPreset>("free");

  // Selection box in percentages (0 - 100)
  const [box, setBox] = useState({ x: 20, y: 20, width: 60, height: 60 });
  const [isFullImageCensor, setIsFullImageCensor] = useState(false);
  const [blurSigma, setBlurSigma] = useState<number>(16);

  // Save mode: "separate" vs "overwrite"
  const [saveMode, setSaveMode] = useState<"separate" | "overwrite">(() => {
    const saved = localStorage.getItem("fig_save_separate");
    return saved === "false" ? "overwrite" : "separate";
  });
  const [alwaysRemember, setAlwaysRemember] = useState(false);

  const [imageSize, setImageSize] = useState({ width: 800, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const imageRef = useRef<HTMLImageElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Sync settings when opened
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setBox({ x: 20, y: 20, width: 60, height: 60 });
      setIsFullImageCensor(false);
      setAlwaysRemember(false);

      getAppSettings()
        .then((s) => {
          setSaveMode(s.save_as_separate ? "separate" : "overwrite");
        })
        .catch(() => {});
    }
  }, [isOpen, initialMode, file]);

  if (!isOpen || !file) return null;

  // Local asset preview
  const fileUrl = file.path.startsWith("http")
    ? file.path
    : `https://asset.localhost/${file.path.replace(/\\/g, "/")}`;

  const handleImageLoad = () => {
    if (imageRef.current) {
      setImageSize({
        width: imageRef.current.naturalWidth || 800,
        height: imageRef.current.naturalHeight || 600,
      });
    }
  };

  const handleAspectChange = (newAspect: AspectPreset) => {
    setAspect(newAspect);
    if (newAspect === "1:1") {
      setBox({ x: 25, y: 20, width: 50, height: 50 });
    } else if (newAspect === "16:9") {
      setBox({ x: 10, y: 25, width: 80, height: 45 });
    } else if (newAspect === "4:3") {
      setBox({ x: 15, y: 20, width: 70, height: 52 });
    } else if (newAspect === "9:16") {
      setBox({ x: 30, y: 10, width: 40, height: 71 });
    }
  };

  // Mouse drag handling to select custom region on the image
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    if (clickX >= 0 && clickX <= 100 && clickY >= 0 && clickY <= 100) {
      setIsDragging(true);
      setDragStart({ x: clickX, y: clickY });
      setBox({ x: clickX, y: clickY, width: 0, height: 0 });
      setIsFullImageCensor(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const currX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const currY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    const left = Math.min(dragStart.x, currX);
    const top = Math.min(dragStart.y, currY);
    const width = Math.abs(currX - dragStart.x);
    const height = Math.abs(currY - dragStart.y);

    setBox({ x: left, y: top, width, height });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
    // Ensure minimum box size
    setBox((prev) => ({
      x: prev.x,
      y: prev.y,
      width: Math.max(prev.width, 5),
      height: Math.max(prev.height, 5),
    }));
  };

  // Convert percentages to real image pixel coordinates
  const getPixelCoordinates = () => {
    const realX = Math.round((box.x / 100) * imageSize.width);
    const realY = Math.round((box.y / 100) * imageSize.height);
    const realWidth = Math.round((box.width / 100) * imageSize.width);
    const realHeight = Math.round((box.height / 100) * imageSize.height);

    return {
      x: Math.max(0, realX),
      y: Math.max(0, realY),
      width: Math.min(imageSize.width - realX, realWidth),
      height: Math.min(imageSize.height - realY, realHeight),
    };
  };

  const handleSave = async () => {
    const isOverwrite = saveMode === "overwrite";

    // If user checked "Hep bu şekilde kaydet", persist this choice to app settings & storage
    if (alwaysRemember) {
      localStorage.setItem("fig_save_separate", isOverwrite ? "false" : "true");
      try {
        const cur = await getAppSettings();
        await saveAppSettings({
          ...cur,
          save_as_separate: !isOverwrite,
        });
      } catch {}
    }

    if (mode === "crop") {
      const coords = getPixelCoordinates();
      onConfirmCrop({
        x: coords.x,
        y: coords.y,
        width: Math.max(coords.width, 10),
        height: Math.max(coords.height, 10),
        overwrite: isOverwrite,
      });
    } else {
      // Censor mode
      let regions: BlurRegion[] | null = null;
      if (!isFullImageCensor) {
        const coords = getPixelCoordinates();
        regions = [
          {
            x: coords.x,
            y: coords.y,
            width: Math.max(coords.width, 10),
            height: Math.max(coords.height, 10),
          },
        ];
      }

      onConfirmCensor({
        blurSigma,
        regions,
        overwrite: isOverwrite,
      });
    }

    onClose();
  };

  const coords = getPixelCoordinates();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-[820px] max-w-[94vw] h-[640px] max-h-[92vh] bg-[#121824] border border-white/15 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header & Mode Switcher */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/[0.08] bg-[#0E131E]">
          <div className="flex items-center gap-3">
            {/* Mode Tabs */}
            <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setMode("crop")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === "crop"
                    ? "bg-amber-500 text-neutral-950 shadow-md scale-100"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Crop size={14} />
                <span>Kırp</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("censor")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === "censor"
                    ? "bg-indigo-500 text-white shadow-md scale-100"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <EyeOff size={14} />
                <span>Sansürle / Blur</span>
              </button>
            </div>

            <div className="border-l border-white/10 pl-3">
              <h3 className="font-semibold text-xs text-neutral-200 truncate max-w-[260px]">{file.name}</h3>
              <p className="text-[10px] text-neutral-400 font-mono">
                {imageSize.width} × {imageSize.height} px
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Kapat (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Secondary Mode Toolbar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-[#0B0F17] border-b border-white/[0.06] text-xs">
          {mode === "crop" ? (
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-400 font-medium mr-1 text-[11px]">En/Boy Oranı:</span>
              {(["free", "1:1", "16:9", "4:3", "9:16"] as AspectPreset[]).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAspectChange(preset)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    aspect === preset
                      ? "bg-amber-400 text-neutral-950 shadow-sm"
                      : "text-neutral-300 hover:bg-white/[0.08]"
                  }`}
                >
                  {preset === "free" ? "Serbest" : preset}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 font-medium text-[11px]">Bulanıklık:</span>
              {[
                { label: "Hafif", val: 8 },
                { label: "Standart", val: 16 },
                { label: "Güçlü", val: 30 },
              ].map((lvl) => (
                <button
                  key={lvl.val}
                  type="button"
                  onClick={() => setBlurSigma(lvl.val)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    blurSigma === lvl.val
                      ? "bg-indigo-500 text-white shadow-sm"
                      : "text-neutral-300 hover:bg-white/[0.08]"
                  }`}
                >
                  {lvl.label}
                </button>
              ))}

              <div className="border-l border-white/10 pl-2 ml-1">
                <button
                  type="button"
                  onClick={() => setIsFullImageCensor(!isFullImageCensor)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    isFullImageCensor
                      ? "bg-rose-500 text-white shadow-sm"
                      : "text-neutral-300 hover:bg-white/[0.08]"
                  }`}
                >
                  {isFullImageCensor ? "✓ Tüm Görsel Seçili" : "Tüm Görseli Sansürle"}
                </button>
              </div>
            </div>
          )}

          <div className="text-neutral-400 text-[11px] font-mono">
            {isFullImageCensor ? (
              <span className="text-rose-400 font-semibold">Tüm Alan: {imageSize.width} × {imageSize.height} px</span>
            ) : (
              <span>Seçilen Bölge: {coords.width} × {coords.height} px</span>
            )}
          </div>
        </div>

        {/* Interactive Image Preview & Canvas */}
        <div
          ref={canvasContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="flex-1 relative flex items-center justify-center p-4 bg-[#070A0F] overflow-hidden select-none cursor-crosshair"
        >
          <div className="relative max-h-full max-w-full inline-block shadow-2xl rounded-lg overflow-hidden border border-white/[0.1]">
            <img
              ref={imageRef}
              src={fileUrl}
              alt={file.name}
              onLoad={handleImageLoad}
              className="max-h-[340px] max-w-full object-contain pointer-events-none"
              draggable={false}
            />

            {/* Selection Box Overlay */}
            {!isFullImageCensor ? (
              <div
                className={`absolute pointer-events-none transition-all duration-75 ${
                  mode === "crop"
                    ? "border-2 border-amber-400 bg-amber-400/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)]"
                    : "border-2 border-indigo-400 bg-indigo-500/20 backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                }`}
                style={{
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.width}%`,
                  height: `${box.height}%`,
                }}
              >
                {/* Mode Tag on the box */}
                <span
                  className={`absolute -top-6 left-0 px-2 py-0.5 rounded text-[9.5px] font-black text-black uppercase tracking-wider ${
                    mode === "crop" ? "bg-amber-400" : "bg-indigo-400 text-white"
                  }`}
                >
                  {mode === "crop" ? "Kırpma Alanı" : "Sansür Bölgesi"}
                </span>

                {/* Corner Handles */}
                <div className={`absolute -top-1.5 -left-1.5 w-3 h-3 border border-black rounded-sm ${mode === "crop" ? "bg-amber-400" : "bg-indigo-400"}`} />
                <div className={`absolute -top-1.5 -right-1.5 w-3 h-3 border border-black rounded-sm ${mode === "crop" ? "bg-amber-400" : "bg-indigo-400"}`} />
                <div className={`absolute -bottom-1.5 -left-1.5 w-3 h-3 border border-black rounded-sm ${mode === "crop" ? "bg-amber-400" : "bg-indigo-400"}`} />
                <div className={`absolute -bottom-1.5 -right-1.5 w-3 h-3 border border-black rounded-sm ${mode === "crop" ? "bg-amber-400" : "bg-indigo-400"}`} />
              </div>
            ) : (
              /* Full Image Blur Highlight */
              <div className="absolute inset-0 border-2 border-rose-500 bg-rose-500/15 backdrop-blur-md flex items-center justify-center pointer-events-none">
                <span className="px-3 py-1 rounded-full bg-rose-600/90 text-white text-xs font-bold shadow-lg">
                  Tüm Görsel Sansürlenecek
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Save Destination & Preference Bar (User Requirement) */}
        <div className="px-6 py-3 bg-[#0F141F] border-t border-white/[0.08] flex flex-col gap-2">
          {/* Radio Options: Separate vs Overwrite */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-bold text-neutral-300">Kayıt Şekli:</span>

              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-neutral-200">
                <input
                  type="radio"
                  name="saveMode"
                  checked={saveMode === "separate"}
                  onChange={() => setSaveMode("separate")}
                  className="accent-amber-400 cursor-pointer"
                />
                <span className={saveMode === "separate" ? "text-amber-300 font-semibold" : "text-neutral-400"}>
                  Ayrı dosya olarak kaydet <span className="text-[10px] text-neutral-400 font-mono">({mode === "crop" ? "_cropped" : "_censored"})</span>
                </span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-neutral-200">
                <input
                  type="radio"
                  name="saveMode"
                  checked={saveMode === "overwrite"}
                  onChange={() => setSaveMode("overwrite")}
                  className="accent-amber-400 cursor-pointer"
                />
                <span className={saveMode === "overwrite" ? "text-rose-400 font-semibold" : "text-neutral-400"}>
                  Orijinal dosyanın üzerine yaz
                </span>
              </label>
            </div>

            {/* Helper Hint */}
            <span className="text-[10.5px] text-neutral-400 italic">
              {saveMode === "separate" ? "Orijinal dosya korunur, yeni kopya üretilir." : "⚠️ Orijinal dosya doğrudan değiştirilecektir."}
            </span>
          </div>

          {/* Remember Choice Toggle & Informational Text */}
          <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={alwaysRemember}
                onChange={(e) => setAlwaysRemember(e.target.checked)}
                className="w-4 h-4 rounded accent-amber-400 cursor-pointer"
              />
              <span className="text-xs font-medium text-amber-300 group-hover:text-amber-200 transition-colors">
                Hep bu şekilde kaydet
              </span>
            </label>

            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
              <Info size={13} className="text-amber-400/80 shrink-0" />
              <span>Bu tercihi dilediğiniz zaman <strong>Ayarlar</strong> bölümünden değiştirebilirsiniz.</span>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/[0.08] bg-[#141A24]">
          <span className="text-[11px] text-neutral-400">
            Fareyle görsel üzerinde sürükleyerek istediğiniz bölgeyi seçebilirsiniz.
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              İptal
            </button>

            <button
              type="button"
              onClick={handleSave}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-neutral-950 shadow-lg transition-all hover:scale-[1.02] active:scale-95 cursor-pointer ${
                mode === "crop"
                  ? "bg-amber-400 hover:bg-amber-300 shadow-amber-500/20"
                  : "bg-indigo-400 hover:bg-indigo-300 text-white shadow-indigo-500/20"
              }`}
            >
              <Check size={15} strokeWidth={2.5} />
              <span>{mode === "crop" ? "Kırp ve Kaydet" : "Sansürle ve Kaydet"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
