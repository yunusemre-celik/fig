import React, { useState, useRef, useEffect } from "react";
import { X, Crop, Check } from "lucide-react";
import { FileInfo } from "../../types";

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileInfo | null;
  onConfirmCrop: (cropData: { x: number; y: number; width: number; height: number }) => void;
}

type AspectPreset = "free" | "1:1" | "16:9" | "4:3" | "9:16";

export const CropModal: React.FC<CropModalProps> = ({
  isOpen,
  onClose,
  file,
  onConfirmCrop,
}) => {
  const [aspect, setAspect] = useState<AspectPreset>("free");
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, width: 80, height: 80 }); // Percentages
  const [imageSize, setImageSize] = useState({ width: 800, height: 600 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set default crop box on file open
  useEffect(() => {
    if (isOpen) {
      setCropBox({ x: 15, y: 15, width: 70, height: 70 });
    }
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  // Local image preview URL
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
      setCropBox({ x: 20, y: 20, width: 60, height: 60 });
    } else if (newAspect === "16:9") {
      setCropBox({ x: 10, y: 25, width: 80, height: 45 });
    } else if (newAspect === "4:3") {
      setCropBox({ x: 15, y: 20, width: 70, height: 52 });
    } else if (newAspect === "9:16") {
      setCropBox({ x: 30, y: 10, width: 40, height: 71 });
    }
  };

  const handleSave = () => {
    // Convert percentages to real pixel coordinates
    const realX = Math.round((cropBox.x / 100) * imageSize.width);
    const realY = Math.round((cropBox.y / 100) * imageSize.height);
    const realWidth = Math.round((cropBox.width / 100) * imageSize.width);
    const realHeight = Math.round((cropBox.height / 100) * imageSize.height);

    onConfirmCrop({
      x: Math.max(0, realX),
      y: Math.max(0, realY),
      width: Math.min(imageSize.width, realWidth),
      height: Math.min(imageSize.height, realHeight),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-[760px] max-w-[92vw] h-[580px] max-h-[90vh] bg-[#0A0C10]/95 backdrop-blur-2xl border border-white/[0.12] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-white">
              <Crop size={16} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-neutral-100">Görseli Kırp</h3>
              <p className="text-[11px] text-zinc-400">{file.name} ({imageSize.width} × {imageSize.height} px)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Aspect Ratio Toolbar */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-white/[0.02] border-b border-white/[0.06] text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 font-medium mr-2">Oran:</span>
            {(["free", "1:1", "16:9", "4:3", "9:16"] as AspectPreset[]).map((preset) => (
              <button
                key={preset}
                onClick={() => handleAspectChange(preset)}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  aspect === preset
                    ? "bg-white text-black shadow-sm font-semibold"
                    : "text-zinc-300 hover:bg-white/[0.08]"
                }`}
              >
                {preset === "free" ? "Serbest" : preset}
              </button>
            ))}
          </div>
          <div className="text-zinc-400 text-[11px] font-mono">
            {Math.round((cropBox.width / 100) * imageSize.width)} × {Math.round((cropBox.height / 100) * imageSize.height)} px
          </div>
        </div>

        {/* Image Preview & Crop Canvas */}
        <div ref={containerRef} className="flex-1 relative flex items-center justify-center p-6 bg-black/40 overflow-hidden select-none">
          <div className="relative max-h-full max-w-full inline-block shadow-xl rounded-lg overflow-hidden border border-white/[0.08]">
            <img
              ref={imageRef}
              src={fileUrl}
              alt={file.name}
              onLoad={handleImageLoad}
              className="max-h-[380px] max-w-full object-contain pointer-events-none"
            />

            {/* Crop Overlay Mask */}
            <div
              className="absolute border-2 border-white bg-white/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] pointer-events-none transition-all duration-75"
              style={{
                left: `${cropBox.x}%`,
                top: `${cropBox.y}%`,
                width: `${cropBox.width}%`,
                height: `${cropBox.height}%`,
              }}
            >
              {/* Corner Handles */}
              <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-black/50 rounded-sm" />
              <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-black/50 rounded-sm" />
              <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-black/50 rounded-sm" />
              <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-black/50 rounded-sm" />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.08] bg-white/[0.02]">
          <span className="text-[11px] text-zinc-400">
            Kırpılan görsel aynı klasöre <span className="text-white font-mono">_cropped</span> sonekiyle kaydedilir.
          </span>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-zinc-200 text-black shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Check size={14} />
              Kırp & Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
