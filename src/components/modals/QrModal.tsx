import React, { useState } from "react";
import { QrCode, X, Copy, Check } from "lucide-react";
import { FileInfo } from "../../types";

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFile: FileInfo | null;
  onScanQr: (inputPath: string) => Promise<string>;
  onGenerateQr: (txt: string) => Promise<string>;
}

export const QrModal: React.FC<QrModalProps> = ({
  isOpen,
  onClose,
  selectedFile,
  onScanQr,
  onGenerateQr,
}) => {
  const [activeTab, setActiveTab] = useState<"read" | "create">("read");
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [qrText, setQrText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPath, setGeneratedPath] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleScan = async () => {
    if (!selectedFile) return;
    setIsScanning(true);
    setScannedResult(null);
    try {
      const res = await onScanQr(selectedFile.path);
      setScannedResult(res);
    } catch {
      setScannedResult("QR kod okunamadı veya görselde QR bulunamadı.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleGenerate = async () => {
    if (!qrText.trim()) return;
    setIsGenerating(true);
    setGeneratedPath(null);
    try {
      const targetPath = await onGenerateQr(qrText);
      setGeneratedPath(targetPath);
    } catch (err) {
      alert(`QR oluşturulamadı: ${err}`);
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
      <div className="relative w-[500px] max-w-[92vw] bg-[#0A0C10]/95 backdrop-blur-2xl border border-white/[0.12] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-white">
              <QrCode size={16} />
            </div>
            <h3 className="font-semibold text-sm text-neutral-100">QR Kod Araçları</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.08] bg-white/[0.02] text-xs px-5 pt-2">
          <button
            onClick={() => setActiveTab("read")}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "read"
                ? "border-white text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            QR Kod Oku
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "create"
                ? "border-white text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Yeni QR Oluştur
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {activeTab === "read" ? (
            <div className="space-y-4">
              {selectedFile ? (
                <>
                  <div className="text-xs text-zinc-300">
                    Seçili görsel: <span className="font-semibold text-white">{selectedFile.name}</span>
                  </div>
                  <button
                    onClick={handleScan}
                    disabled={isScanning}
                    className="w-full py-2.5 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-semibold text-xs transition-all shadow-md cursor-pointer"
                  >
                    {isScanning ? "Taranıyor..." : "Görseldeki QR Kodu Tara"}
                  </button>
                  {scannedResult && (
                    <div className="mt-4 p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                      <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider block mb-1">
                        Sonuç:
                      </span>
                      <p className="text-xs text-neutral-100 font-mono break-all">{scannedResult}</p>
                      <button
                        onClick={() => handleCopy(scannedResult)}
                        className="mt-3 flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white font-medium cursor-pointer"
                      >
                        {copied ? <Check size={13} /> : <Copy size={13} />}
                        {copied ? "Kopyalandı!" : "Metni Kopyala"}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6 text-xs text-zinc-400">
                  Lütfen önce ana ekrandan bir QR kod görseli seçin.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-200 block mb-1.5">Metin veya Bağlantı (URL)</label>
                <textarea
                  value={qrText}
                  onChange={(e) => setQrText(e.target.value)}
                  placeholder="https://example.com veya Wi-Fi / metin bilgisi girin..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-neutral-100 placeholder:text-zinc-500 focus:outline-none focus:border-white/30 resize-none font-mono"
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !qrText.trim()}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-semibold text-xs transition-all shadow-md cursor-pointer"
              >
                {isGenerating ? "Oluşturuluyor..." : "QR Kod PNG Dosyası Oluştur"}
              </button>
              {generatedPath && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
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
