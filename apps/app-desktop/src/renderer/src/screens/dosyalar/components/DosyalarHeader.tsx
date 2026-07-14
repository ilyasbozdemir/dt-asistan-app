import React from "react";
import { cn } from "../../../utils/cn";
import { FileText, Grid, List, Sparkles, Plus } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function DosyalarHeader({
  viewMode,
  setViewMode,
  onOpenAI,
}: {
  viewMode: "grid" | "list" | "table";
  setViewMode: (mode: "grid" | "list" | "table") => void;
  onOpenAI: () => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="flex-none flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-850 dark:text-white flex items-center gap-2">
          <FileText className="text-blue-600" size={24} />
          Doğrudan Temin Dosyaları
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Dosya süreçlerinizi başlatın, tekliflerinizi ve yaklaşık maliyetlerinizi takip edin.
        </p>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        {/* VIEW SWITCHER */}
        <div className="flex bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-1.5 rounded-lg transition-colors cursor-pointer",
              viewMode === "grid"
                ? "bg-slate-100 dark:bg-slate-800 text-blue-600"
                : "text-slate-400 hover:text-slate-600",
            )}
            title="Izgara (Grid) Görünümü"
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-1.5 rounded-lg transition-colors cursor-pointer",
              viewMode === "list"
                ? "bg-slate-100 dark:bg-slate-800 text-blue-600"
                : "text-slate-400 hover:text-slate-600",
            )}
            title="Liste Görünümü"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={cn(
              "p-1.5 rounded-lg transition-colors cursor-pointer",
              viewMode === "table"
                ? "bg-slate-100 dark:bg-slate-800 text-blue-600"
                : "text-slate-400 hover:text-slate-600",
            )}
            title="Tablo Görünümü"
          >
            <FileText size={16} />
          </button>
        </div>

        {/* GENEL YAPAY ZEKA BUTONU */}
        <button
          onClick={onOpenAI}
          className="px-4 py-2 bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-violet-500/20 flex items-center gap-1.5 cursor-pointer shrink-0"
          title="Mevzuat ve Genel Süreçler Hakkında AI'a Danışın"
        >
          <Sparkles size={16} />
          <span className="hidden md:inline">Yapay Zeka Asistanı</span>
          <span className="md:hidden">AI</span>
        </button>

        {/* YENİ EKLE */}
        <button
          onClick={() => navigate({ to: "/dosyalar/yeni" })}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus size={16} />
          Yeni Dosya
        </button>
      </div>
    </div>
  );
}
