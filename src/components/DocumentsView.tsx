import React, { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Sparkles, FolderOpen } from "lucide-react";
import { FileInfo } from "../types";
import { convertDocument, revealInExplorer } from "../services/api";
import confetti from "canvas-confetti";
import { playSuccessChime } from "../utils/sound";

interface DocumentsViewProps {
  onSuccess: (info: FileInfo) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const targetType = "pdf";
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<FileInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) return;
    setIsConverting(true);
    setError(null);
    setResult(null);

    const filePath = (selectedFile as unknown as { path?: string }).path || selectedFile.name;

    try {
      const res = await convertDocument(filePath, targetType);
      setResult(res);
      playSuccessChime();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      onSuccess(res);
    } catch (err) {
      setError(String(err));
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto space-y-6 text-neutral-100">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
          <Sparkles size={13} />
          <span>Belge & Ofis Dönüştürücü</span>
        </div>
        <h2 className="text-xl font-bold text-white">Word, PowerPoint ve Excel'i PDF'e Çevirin</h2>
        <p className="text-xs text-neutral-400 mt-1">
          Windows'un yerel Microsoft Office otomasyonu ile orijinal yazı tipleri ve mizanpaj korunarak kusursuz PDF oluşturulur.
        </p>
      </div>

      {/* Document Types Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#141A24] border border-white/[0.08] text-left">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-2 font-bold text-xs">
            W
          </div>
          <span className="font-semibold text-xs text-white block">Word → PDF</span>
          <span className="text-[10px] text-neutral-400">DOCX, DOC, RTF</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#141A24] border border-white/[0.08] text-left">
          <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-2 font-bold text-xs">
            P
          </div>
          <span className="font-semibold text-xs text-white block">PowerPoint → PDF</span>
          <span className="text-[10px] text-neutral-400">PPTX, PPT</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#141A24] border border-white/[0.08] text-left">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2 font-bold text-xs">
            X
          </div>
          <span className="font-semibold text-xs text-white block">Excel → PDF</span>
          <span className="text-[10px] text-neutral-400">XLSX, XLS, CSV</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#141A24] border border-white/[0.08] text-left">
          <div className="w-7 h-7 rounded-lg bg-neutral-500/10 border border-neutral-500/20 flex items-center justify-center text-neutral-300 mb-2 font-bold text-xs">
            T
          </div>
          <span className="font-semibold text-xs text-white block">Metin → PDF</span>
          <span className="text-[10px] text-neutral-400">TXT, Markdown</span>
        </div>
      </div>

      {/* Upload & Convert Box */}
      <div className="p-6 rounded-2xl bg-[#121722]/80 border border-white/[0.08] space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx,.doc,.rtf,.pptx,.ppt,.xlsx,.xls,.csv,.txt,.md"
          className="hidden"
          onChange={handleFileChange}
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-8 border-2 border-dashed border-white/[0.1] hover:border-blue-400/40 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col items-center justify-center cursor-pointer text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
            <UploadCloud size={24} />
          </div>
          {selectedFile ? (
            <div>
              <p className="text-xs font-semibold text-white">{selectedFile.name}</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                {(selectedFile.size / 1024).toFixed(1)} KB • Değiştirmek için tıklayın
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold text-neutral-200">
                Dönüştürmek istediğiniz Word, PowerPoint veya Excel belgesini seçin
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">
                .docx, .pptx, .xlsx, .txt, .md dosyaları desteklenir
              </p>
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-neutral-300">
              <span>Hedef Format:</span>
              <span className="px-2.5 py-1 rounded-lg font-bold bg-blue-500/15 border border-blue-500/30 text-blue-300 uppercase">
                {targetType}
              </span>
            </div>

            <button
              onClick={handleConvert}
              disabled={isConverting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
            >
              {isConverting ? "PDF'e Dönüştürülüyor..." : "PDF'e Dönüştür"}
            </button>
          </div>
        )}

        {/* Result Message */}
        {result && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <span className="font-bold block truncate">Başarıyla Dönüştürüldü: {result.name}</span>
                <span className="text-[10px] text-emerald-400/80 truncate block">{result.path}</span>
              </div>
            </div>
            <button
              onClick={() => revealInExplorer(result.path)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-semibold text-xs shrink-0 transition-colors"
            >
              <FolderOpen size={13} />
              <span>Klasörde Aç</span>
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/20 text-xs text-rose-200 flex items-center gap-2.5">
            <AlertCircle size={18} className="text-rose-400 shrink-0" />
            <span>Hata: {error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
