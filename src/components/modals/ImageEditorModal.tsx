import React, { useState, useRef, useEffect } from "react";
import { X, Crop, EyeOff, Check, Info } from "lucide-react";
import { FileInfo } from "../../types";
import { saveAppSettings, getAppSettings, readImageDataUrl, BlurRegion } from "../../services/api";
import { useTranslation } from "../../i18n/useTranslation";

export type ImageEditorMode = "crop" | "censor";

interface ImageEditorModalProps {
  isOpen: boolean;
  initialMode?: ImageEditorMode;
  file: FileInfo | null;
  onClose: () => void;
  onConfirmCrop: (cropData: { x: number; y: number; width: number; height: number; overwrite: boolean }) => Promise<void> | void;
  onConfirmCensor: (censorData: { blurSigma: number; regions: BlurRegion[] | null; overwrite: boolean }) => Promise<void> | void;
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
  const { t } = useTranslation();
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
  const [isSaving, setIsSaving] = useState(false);
  const [dataUrl, setDataUrl] = useState<string>("");
  const [isLoadingImage, setIsLoadingImage] = useState(true);

  const [imageSize, setImageSize] = useState({ width: 800, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const imageRef = useRef<HTMLImageElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Sync settings and load image Base64 data URL
  useEffect(() => {
    let active = true;
    if (isOpen && file) {
      setMode(initialMode);
      setBox({ x: 20, y: 20, width: 60, height: 60 });
      setIsFullImageCensor(false);
      setAlwaysRemember(false);
      setIsLoadingImage(true);

      readImageDataUrl(file.path)
        .then((url) => {
          if (active && url) {
            setDataUrl(url);
          }
          if (active) setIsLoadingImage(false);
        })
        .catch(() => {
          if (active) setIsLoadingImage(false);
        });

      getAppSettings()
        .then((s) => {
          setSaveMode(s.save_as_separate ? "separate" : "overwrite");
        })
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, [isOpen, initialMode, file]);

  if (!isOpen || !file) return null;

  // Local asset preview URL fallback
  const fileUrl =
    dataUrl ||
    (file.path.startsWith("http")
      ? file.path
      : `http://asset.localhost/${file.path.replace(/\\/g, "/")}`);

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
    if (isSaving) return;
    setIsSaving(true);
    try {
      const isOverwrite = saveMode === "overwrite";

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
        await onConfirmCrop({
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

        await onConfirmCensor({
          blurSigma,
          regions,
          overwrite: isOverwrite,
        });
      }

      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const coords = getPixelCoordinates();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-[820px] max-w-[94vw] h-[640px] max-h-[92vh] bg-[var(--apple-bg-panel)] border border-[var(--apple-border)] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[var(--apple-text-primary)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header & Mode Switcher */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[var(--apple-border)] apple-header">
          <div className="flex items-center gap-3">
            {/* Apple-style Mode Switcher */}
            <div className="apple-segmented">
              <button
                type="button"
                onClick={() => setMode("crop")}
                className={`apple-segmented-item ${mode === "crop" ? "active" : ""}`}
              >
                <Crop size={13} />
                <span>{t("cropTab")}</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("censor")}
                className={`apple-segmented-item ${mode === "censor" ? "active" : ""}`}
              >
                <EyeOff size={13} />
                <span>{t("censorTab")}</span>
              </button>
            </div>

            <div className="border-l border-[var(--apple-border)] pl-3">
              <h3 className="font-semibold text-xs text-[var(--apple-text-primary)] truncate max-w-[260px]">{file.name}</h3>
              <p className="text-[10px] text-[var(--apple-text-tertiary)] font-mono">
                {imageSize.width} × {imageSize.height} px
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-bg-control)] transition-colors cursor-pointer"
            title="Esc"
          >
            <X size={16} />
          </button>
        </div>

        {/* Secondary Mode Toolbar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-[var(--apple-bg-secondary)] border-b border-[var(--apple-border)] text-xs">
          {mode === "crop" ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--apple-text-secondary)] font-medium mr-1 text-[11px]">{t("aspectRatio")}</span>
              {(["free", "1:1", "16:9", "4:3", "9:16"] as AspectPreset[]).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAspectChange(preset)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    aspect === preset
                      ? "bg-[var(--apple-accent)] text-white shadow-sm"
                      : "text-[var(--apple-text-secondary)] hover:bg-[var(--apple-bg-control)] hover:text-[var(--apple-text-primary)]"
                  }`}
                >
                  {preset === "free" ? t("freeAspect") : preset}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[var(--apple-text-secondary)] font-medium text-[11px]">{t("blurIntensity")}</span>
              {[
                { label: t("blurLight"), val: 8 },
                { label: t("blurNormal"), val: 16 },
                { label: t("blurHeavy"), val: 30 },
              ].map((lvl) => (
                <button
                  key={lvl.val}
                  type="button"
                  onClick={() => setBlurSigma(lvl.val)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    blurSigma === lvl.val
                      ? "bg-[var(--apple-accent)] text-white shadow-sm"
                      : "text-[var(--apple-text-secondary)] hover:bg-[var(--apple-bg-control)] hover:text-[var(--apple-text-primary)]"
                  }`}
                >
                  {lvl.label}
                </button>
              ))}

              <div className="border-l border-[var(--apple-border)] pl-2 ml-1">
                <button
                  type="button"
                  onClick={() => setIsFullImageCensor(!isFullImageCensor)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    isFullImageCensor
                      ? "bg-rose-500 text-white shadow-sm"
                      : "text-[var(--apple-text-secondary)] hover:bg-[var(--apple-bg-control)] hover:text-[var(--apple-text-primary)]"
                  }`}
                >
                  {isFullImageCensor ? t("allImageSelected") : t("allImageCensor")}
                </button>
              </div>
            </div>
          )}

          <div className="text-[var(--apple-text-tertiary)] text-[11px] font-mono">
            {isFullImageCensor ? (
              <span className="text-rose-400 font-semibold">{t("allImageSelected")}</span>
            ) : (
              <span>{t("selectionArea")} {coords.width} × {coords.height} px</span>
            )}
          </div>
        </div>

        {/* Interactive Image Preview & Canvas */}
        <div
          ref={canvasContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="flex-1 relative flex items-center justify-center p-4 bg-black/40 overflow-hidden select-none cursor-crosshair min-h-[300px]"
        >
          {isLoadingImage ? (
            <div className="flex flex-col items-center justify-center gap-2.5 text-[var(--apple-text-secondary)] text-xs py-16">
              <div className="w-7 h-7 rounded-full border-2 border-[var(--apple-accent)] border-t-transparent animate-spin" />
              <span>{t("imageLoading")}</span>
            </div>
          ) : (
            <div className="relative max-h-full max-w-full inline-block shadow-2xl rounded-lg overflow-hidden border border-[var(--apple-border)]">
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
                      ? "border-2 border-[var(--apple-accent)] bg-[var(--apple-accent-light)] shadow-[0_0_0_9999px_rgba(0,0,0,0.60)]"
                      : "border-2 border-indigo-400 bg-indigo-500/20 backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.4)]"
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
                    className={`absolute -top-6 left-0 px-2 py-0.5 rounded text-[9.5px] font-bold text-white uppercase tracking-wider ${
                      mode === "crop" ? "bg-[var(--apple-accent)]" : "bg-indigo-500"
                    }`}
                  >
                    {mode === "crop" ? t("cropBoxTag") : t("censorBoxTag")}
                  </span>

                  {/* Corner Handles */}
                  <div className={`absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full border border-black ${mode === "crop" ? "bg-[var(--apple-accent)]" : "bg-indigo-400"}`} />
                  <div className={`absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full border border-black ${mode === "crop" ? "bg-[var(--apple-accent)]" : "bg-indigo-400"}`} />
                  <div className={`absolute -bottom-1.5 -left-1.5 w-3 h-3 rounded-full border border-black ${mode === "crop" ? "bg-[var(--apple-accent)]" : "bg-indigo-400"}`} />
                  <div className={`absolute -bottom-1.5 -right-1.5 w-3 h-3 rounded-full border border-black ${mode === "crop" ? "bg-[var(--apple-accent)]" : "bg-indigo-400"}`} />
                </div>
              ) : (
                /* Full Image Blur Highlight */
                <div className="absolute inset-0 border-2 border-rose-500 bg-rose-500/15 backdrop-blur-md flex items-center justify-center pointer-events-none">
                  <span className="px-3 py-1 rounded-full bg-rose-600/90 text-white text-xs font-bold shadow-lg">
                    {t("allImageSelected")}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Save Destination & Preference Bar */}
        <div className="px-6 py-3 bg-[var(--apple-bg-secondary)] border-t border-[var(--apple-border)] flex flex-col gap-2">
          {/* Radio Options: Separate vs Overwrite */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-bold text-[var(--apple-text-secondary)]">{t("saveModeTitle")}</span>

              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[var(--apple-text-primary)]">
                <input
                  type="radio"
                  name="saveMode"
                  checked={saveMode === "separate"}
                  onChange={() => setSaveMode("separate")}
                  className="accent-[var(--apple-accent)] cursor-pointer"
                />
                <span className={saveMode === "separate" ? "text-[var(--apple-accent)] font-semibold" : "text-[var(--apple-text-secondary)]"}>
                  {t("saveSeparate")} <span className="text-[10px] text-[var(--apple-text-tertiary)] font-mono">({mode === "crop" ? "_cropped" : "_censored"})</span>
                </span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[var(--apple-text-primary)]">
                <input
                  type="radio"
                  name="saveMode"
                  checked={saveMode === "overwrite"}
                  onChange={() => setSaveMode("overwrite")}
                  className="accent-[var(--apple-accent)] cursor-pointer"
                />
                <span className={saveMode === "overwrite" ? "text-rose-400 font-semibold" : "text-[var(--apple-text-secondary)]"}>
                  {t("saveOverwrite")}
                </span>
              </label>
            </div>

            {/* Helper Hint */}
            <span className="text-[10.5px] text-[var(--apple-text-tertiary)] italic">
              {saveMode === "separate" ? t("saveSeparateHint") : t("saveOverwriteHint")}
            </span>
          </div>

          {/* Remember Choice Toggle & Informational Text */}
          <div className="flex items-center justify-between pt-1 border-t border-[var(--apple-border)]">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={alwaysRemember}
                onChange={(e) => setAlwaysRemember(e.target.checked)}
                className="w-4 h-4 rounded accent-[var(--apple-accent)] cursor-pointer"
              />
              <span className="text-xs font-medium text-[var(--apple-text-primary)] group-hover:text-[var(--apple-accent)] transition-colors">
                {t("alwaysRemember")}
              </span>
            </label>

            <div className="flex items-center gap-1.5 text-[11px] text-[var(--apple-text-tertiary)]">
              <Info size={13} className="text-[var(--apple-accent)] shrink-0" />
              <span>{t("alwaysRememberNote")}</span>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[var(--apple-border)] apple-header">
          <span className="text-[11px] text-[var(--apple-text-tertiary)]">
            {t("dragToSelectHint")}
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="apple-button px-4 py-2 text-xs font-medium cursor-pointer"
            >
              {t("cancel")}
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className={`apple-button-accent flex items-center gap-2 px-5 py-2 text-xs font-semibold shadow-md transition-all cursor-pointer ${
                isSaving ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              <Check size={14} strokeWidth={2.5} />
              <span>
                {isSaving
                  ? t("processing")
                  : mode === "crop"
                  ? t("cropAndSave")
                  : t("censorAndSave")}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
