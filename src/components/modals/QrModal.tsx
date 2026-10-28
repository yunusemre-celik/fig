import React, { useState } from "react";
import { X, QrCode, Copy, Check } from "lucide-react";
import { FileInfo } from "../../types";

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFile: FileInfo | null;
  onScanQr: (filePath: string) => Promise<string>;
  onGenerateQr: (text: string) => Promise<string>;
}

export const QrModal: React.FC<QrModalProps> = ({
  isOpen,
  onClose,
  selectedFile,
  onScanQr,
  onGenerateQr,
}) => {
  const [activeTab, setActiveTab] = useState<"read" | "create">(selectedFile ? "read" : "create");
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [qrText, setQrText] = useState("");
  const [generatedPath, setGeneratedPath] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleScan = async () => {
    if (!selectedFile) return;
    setIsScanning(true);
    try {
      const result = await onScanQr(selectedFile.path);
      setScannedResult(result);
    } catch {
      setScannedResult("Bu görselde geçerli bir QR kod tespit edilemedi.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleGenerate = async () => {
    if (!qrText.trim()) return;
    setIsGenerating(true);
    try {
      const path = await onGenerateQr(qrText.trim());
      setGeneratedPath(path);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-[500px] max-w-[92vw] bg-[#141A24] border border-white/[0.1] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <QrCode size={16} />
            </div>
            <h3 className="font-semibold text-sm text-neutral-100">QR Kod Araçları</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.08] bg-[#0F141D] text-xs px-5 pt-2">
          <button
            onClick={() => setActiveTab("read")}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all ${
              activeTab === "read"
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            QR Kod Oku
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all ${
              activeTab === "create"
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Yeni QR Oluştur
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 bg-[#0F141D]">
          {activeTab === "read" ? (
            <div className="space-y-4">
              {selectedFile ? (
                <>
                  <div className="text-xs text-neutral-300">
                    Seçili görsel: <span className="font-semibold text-amber-400">{selectedFile.name}</span>
                  </div>
                  <button
                    onClick={handleScan}
                    disabled={isScanning}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-md"
                  >
                    {isScanning ? "Taranıyor..." : "Görseldeki QR Kodu Tara"}
                  </button>
                  {scannedResult && (
                    <div className="mt-4 p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                      <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider block mb-1">
                        Sonuç:
                      </span>
                      <p className="text-xs text-neutral-100 font-mono break-all">{scannedResult}</p>
                      <button
                        onClick={() => handleCopy(scannedResult)}
                        className="mt-3 flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium"
                      >
                        {copied ? <Check size={13} /> : <Copy size={13} />}
                        {copied ? "Kopyalandı!" : "Metni Kopyala"}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6 text-xs text-neutral-400">
                  Lütfen önce ana ekrandan bir QR kod görseli seçin.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-200 block mb-1.5">Metin veya Bağlantı (URL)</label>
                <textarea
                  value={qrText}
                  onChange={(e) => setQrText(e.target.value)}
                  placeholder="https://example.com veya Wi-Fi / metin bilgisi girin..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-[#141A24] border border-white/[0.1] text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500 resize-none font-mono"
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !qrText.trim()}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold text-xs transition-all shadow-md shadow-amber-500/20"
              >
                {isGenerating ? "Oluşturuluyor..." : "QR Kod PNG Dosyası Oluştur"}
              </button>
              {generatedPath && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                  <Check size={16} className="text-emerald-400 shrink-0" />
                  <span className="truncate">Oluşturuldu: {generatedPath}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
