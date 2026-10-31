import React, { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Sparkles, FolderOpen, FileText, ArrowRight, RefreshCw, ExternalLink } from "lucide-react";
import { FileInfo } from "../types";
import { convertDocument, convertPdf, revealInExplorer, openFile } from "../services/api";
import confetti from "canvas-confetti";
import { playSuccessChime } from "../utils/sound";

interface DocumentsViewProps {
  onSuccess: (info: FileInfo) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const targetType = "pdf";
  const [pdfTarget, setPdfTarget] = useState<"png" | "jpg" | "docx" | "txt">("png");
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<FileInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPdf = selectedFile?.name.toLowerCase().endsWith(".pdf") || false;

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
      let res: FileInfo;
      if (isPdf) {
        res = await convertPdf(filePath, pdfTarget);
      } else {
        res = await convertDocument(filePath, targetType);
      }
      setResult(res);
      playSuccessChime();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
      onSuccess(res);
    } catch (err) {
      setError(
        String(err).includes("0x800401F3")
          ? "Microsoft Office uygulaması başlatılamadı. Bilgisayarınızda Word/Excel/PowerPoint yüklü olduğundan emin olun."
          : `Dönüştürme hatası: ${err}. Dosya başka bir programda açıksa kapatıp tekrar deneyin.`
      );
    } finally {
      setIsConverting(false);
    }
  };

  const getDocTypeInfo = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    if (ext === "pdf") {
      return { title: "PDF Belgesi", badge: "PDF", color: "from-rose-500/20 to-rose-600/10", border: "border-rose-500/30", text: "text-rose-400" };
    }
    if (["docx", "doc", "rtf"].includes(ext)) {
      return { title: "Word Belgesi", badge: "DOCX", color: "from-blue-500/20 to-blue-600/10", border: "border-blue-500/30", text: "text-blue-400" };
    }
    if (["pptx", "ppt"].includes(ext)) {
      return { title: "PowerPoint Sunumu", badge: "PPTX", color: "from-orange-500/20 to-orange-600/10", border: "border-orange-500/30", text: "text-orange-400" };
    }
    if (["xlsx", "xls", "csv"].includes(ext)) {
      return { title: "Excel Tablosu", badge: "XLSX", color: "from-emerald-500/20 to-emerald-600/10", border: "border-emerald-500/30", text: "text-emerald-400" };
    }
    return { title: "Metin Belgesi", badge: "TXT", color: "from-purple-500/20 to-purple-600/10", border: "border-purple-500/30", text: "text-purple-400" };
  };

  const docInfo = selectedFile ? getDocTypeInfo(selectedFile.name) : null;

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-3xl w-full mx-auto space-y-6 text-neutral-100 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-zinc-300 text-xs font-semibold mb-2 shadow-sm backdrop-blur-md">
          <Sparkles size={13} />
          <span>Yerel Belge & PDF Motoru</span>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          PDF, Word, Excel ve PowerPoint <span className="text-white underline decoration-white/30">Dönüştürücü</span>
        </h2>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          Windows'un yerleşik donanım hızlandırmalı motoru ile PDF'leri PNG/JPG görsellere çevirin; ofis belgelerinizi kayıpsız PDF yapın.
        </p>
      </div>

      {/* Document Types Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <div className="glass-card p-3 rounded-2xl text-left border-rose-500/20 bg-rose-500/[0.04]">
          <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-1.5 font-black text-[11px] shadow-sm">
            PDF
          </div>
          <span className="font-bold text-xs text-white block">PDF → PNG / JPG</span>
          <span className="text-[9px] text-neutral-400">Yüksek Netlikte Görsel</span>
        </div>

        <div className="glass-card p-3 rounded-2xl text-left">
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-1.5 font-black text-[11px] shadow-sm">
            W
          </div>
          <span className="font-bold text-xs text-white block">Word → PDF</span>
          <span className="text-[9px] text-neutral-400">DOCX, DOC, RTF</span>
        </div>

        <div className="glass-card p-3 rounded-2xl text-left">
          <div className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-1.5 font-black text-[11px] shadow-sm">
            P
          </div>
          <span className="font-bold text-xs text-white block">PowerPoint → PDF</span>
          <span className="text-[9px] text-neutral-400">PPTX, PPT</span>
        </div>

        <div className="glass-card p-3 rounded-2xl text-left">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-1.5 font-black text-[11px] shadow-sm">
            X
          </div>
          <span className="font-bold text-xs text-white block">Excel → PDF</span>
          <span className="text-[9px] text-neutral-400">XLSX, XLS, CSV</span>
        </div>

        <div className="glass-card p-3 rounded-2xl text-left">
          <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-1.5 font-black text-[11px] shadow-sm">
            T
          </div>
          <span className="font-bold text-xs text-white block">Metin → PDF</span>
          <span className="text-[9px] text-neutral-400">TXT, Markdown</span>
        </div>
      </div>

      {/* Upload & Convert Box */}
      <div className="p-6 rounded-3xl glass-panel space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx,.doc,.rtf,.pptx,.ppt,.xlsx,.xls,.csv,.txt,.md,.pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Drop Box or Selected Document Card */}
        {selectedFile && docInfo ? (
          <div className="p-5 rounded-2xl glass-card border border-white/[0.12] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${docInfo.color} border ${docInfo.border} flex flex-col items-center justify-center shrink-0 ${docInfo.text} shadow-lg`}
              >
                <FileText size={20} />
                <span className="text-[8px] font-black tracking-tighter mt-0.5">{docInfo.badge}</span>
              </div>
              <div className="min-w-0">
                <span className="font-bold text-sm text-white block truncate">{selectedFile.name}</span>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-400">
                  <span>{docInfo.title}</span>
                  <span className="text-white/20">•</span>
                  <span className="font-mono text-neutral-300">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="glass-btn px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white shrink-0"
            >
              Değiştir
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-8 border-2 border-dashed border-white/10 hover:border-white/30 rounded-2xl bg-white/[0.025] hover:bg-white/[0.05] transition-all flex flex-col items-center justify-center cursor-pointer text-center group backdrop-blur-xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/15 flex items-center justify-center text-white mb-3 group-hover:scale-105 group-hover:border-white/30 transition-transform shadow-lg">
              <UploadCloud size={24} />
            </div>
            <p className="text-xs font-bold text-white">
              Dönüştürmek istediğiniz PDF veya Ofis belgesini seçin
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">
              .pdf, .docx, .pptx, .xlsx, .txt dosyaları %100 yerel olarak dönüştürülür
            </p>
          </div>
        )}

        {/* Action Button & Format Selector */}
        {selectedFile && (
          <div className="space-y-3 pt-2">
            {isPdf ? (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <span className="text-xs font-semibold text-neutral-300">PDF Hedef Formatı:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPdfTarget("png")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      pdfTarget === "png"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "bg-white/[0.05] text-neutral-400 hover:text-white"
                    }`}
                  >
                    PNG Görsel
                  </button>
                  <button
                    onClick={() => setPdfTarget("jpg")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      pdfTarget === "jpg"
                        ? "bg-amber-600 text-white shadow-md shadow-amber-500/20"
                        : "bg-white/[0.05] text-neutral-400 hover:text-white"
                    }`}
                  >
                    JPG Fotoğraf
                  </button>
                  <button
                    onClick={() => setPdfTarget("docx")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      pdfTarget === "docx"
                        ? "bg-blue-700 text-white shadow-md shadow-blue-500/20"
                        : "bg-white/[0.05] text-neutral-400 hover:text-white"
                    }`}
                  >
                    Word (DOCX)
                  </button>
                  <button
                    onClick={() => setPdfTarget("txt")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      pdfTarget === "txt"
                        ? "bg-zinc-600 text-white shadow-md shadow-zinc-500/20"
                        : "bg-white/[0.05] text-neutral-400 hover:text-white"
                    }`}
                  >
                    Metin (TXT)
                  </button>
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-neutral-300">
                <span>Hedef:</span>
                <span className="px-2.5 py-1 rounded-lg font-bold bg-rose-500/20 border border-rose-500/30 text-rose-300 uppercase font-mono text-[11px]">
                  {isPdf ? `${pdfTarget.toUpperCase()} Formatı` : "PDF Belgesi (.pdf)"}
                </span>
              </div>

              <button
                onClick={handleConvert}
                disabled={isConverting}
                className="glass-btn-accent flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xl disabled:opacity-50"
              >
                {isConverting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Dönüştürülüyor...</span>
                  </>
                ) : (
                  <>
                    <span>Dönüştür</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Result Notification Card */}
        {result && (
          <div className="p-4 rounded-2xl glass-panel border-emerald-500/30 bg-[#0E1C16]/80 text-xs text-emerald-200 flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 size={18} />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-white block truncate">Dönüştürme Başarılı!</span>
                <span className="text-[10px] text-emerald-400/80 truncate block">{result.name} ({result.formatted_size})</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => openFile(result.path)}
                className="glass-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-neutral-200 hover:text-white text-xs font-semibold"
              >
                <ExternalLink size={12} />
                <span>Aç</span>
              </button>
              <button
                onClick={() => revealInExplorer(result.path)}
                className="glass-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-neutral-200 hover:text-amber-300 text-xs font-semibold"
              >
                <FolderOpen size={12} />
                <span>Klasörde Göster</span>
              </button>
            </div>
          </div>
        )}

        {/* Error Card */}
        {error && (
          <div className="p-4 rounded-2xl glass-panel border-rose-500/30 bg-[#251114]/80 text-xs text-rose-200 flex items-start gap-3 animate-in fade-in duration-200">
            <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-white block mb-0.5">Dönüştürme Hatası</span>
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
