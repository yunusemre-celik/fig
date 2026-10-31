import React, { useState } from "react";
import { LibraryEntry } from "../types";
import { Search, FolderOpen, ExternalLink, Trash2, Clock, FileImage } from "lucide-react";

interface LibraryViewProps {
  entries: LibraryEntry[];
  onReveal: (path: string) => void;
  onOpenFile: (path: string) => void;
  onClear: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  entries,
  onReveal,
  onOpenFile,
  onClear,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const filteredEntries = entries.filter((item) => {
    const matchesSearch =
      item.original_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.output_path.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedFilter === "all") return true;
    return item.action.toLowerCase().includes(selectedFilter.toLowerCase());
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent text-neutral-100 overflow-hidden">
      {/* Top Bar: Search & Filter */}
      <div className="p-4 glass-panel border-x-0 border-t-0 flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Kütüphanede ara (Ctrl+F)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-neutral-100 placeholder:text-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs">
          {[
            { id: "all", label: "Hepsi" },
            { id: "dönüştür", label: "Dönüştürme" },
            { id: "kırp", label: "Kırpma" },
            { id: "sıkıştır", label: "Sıkıştırma" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedFilter === f.id
                  ? "bg-white/[0.12] text-white border border-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Clear Button */}
        {entries.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-rose-500/15 hover:text-rose-400 border border-white/[0.08] text-xs text-zinc-400 transition-colors cursor-pointer"
            title="Geçmişi Temizle"
          >
            <Trash2 size={13} />
            <span>Temizle</span>
          </button>
        )}
      </div>

      {/* Entry List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredEntries.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-zinc-500">
            <Clock size={36} className="mb-2 stroke-1 opacity-40" />
            <p className="text-xs font-medium">Henüz bir işlem geçmişi bulunmuyor</p>
            <p className="text-[11px] text-zinc-600 mt-0.5">Dönüştürülen ve düzenlenen dosyalar burada listelenir</p>
          </div>
        ) : (
          filteredEntries.map((item) => {
            const savings =
              item.size_before > 0 && item.size_after < item.size_before
                ? Math.round(((item.size_before - item.size_after) / item.size_before) * 100)
                : null;

            return (
              <div
                key={item.id}
                className="group p-3 rounded-2xl glass-card flex items-center justify-between gap-4"
              >
                {/* Left: Icon & Names */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300 shrink-0">
                    <FileImage size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-neutral-200 truncate">{item.original_name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-white/10 text-zinc-300 border border-white/15 shrink-0">
                        {item.action}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 truncate font-mono mt-0.5">{item.output_path}</p>
                  </div>
                </div>

                {/* Right: Metrics & Actions */}
                <div className="flex items-center gap-4 shrink-0">
                  {/* Sizes */}
                  <div className="text-right text-[11px]">
                    <span className="text-neutral-300 font-medium block">{formatBytes(item.size_after)}</span>
                    {savings && savings > 0 ? (
                      <span className="text-[10px] text-emerald-400 font-semibold">%{savings} tasarruf</span>
                    ) : (
                      <span className="text-[10px] text-zinc-500">{item.timestamp}</span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onReveal(item.output_path)}
                      className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      title="Dosya Gezgini'nde Göster"
                    >
                      <FolderOpen size={14} />
                    </button>
                    <button
                      onClick={() => onOpenFile(item.output_path)}
                      className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      title="Dosyayı Aç"
                    >
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
