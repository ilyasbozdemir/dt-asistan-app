import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, FileText, Filter, Star } from "lucide-react";
import {
  BUTTON_COLORS,
  CATEGORY_LABELS,
  normalizeForMatch,
} from "./useDosyaAsamasiSablons";

// -----------------------------------------------------------------------
// SurecBelgeleriPanel
// -----------------------------------------------------------------------

interface SurecBelgeleriPanelProps {
  stageSablons: any[];
  activeStarredDocs?: string[] | null;
  ciktiLoading: boolean;
  ;
  ;
  onSablonClick: (sablon: any, title: string) => void;
  isSablonDisabled?: (cleanName: string) => boolean;
}

export function SurecBelgeleriPanel({
  stageSablons,
  activeStarredDocs,
  ciktiLoading,
  onSablonClick,
  isSablonDisabled,
}: SurecBelgeleriPanelProps): React.JSX.Element | null {
  const [filter, setFilter] = useState<"all" | "starred">("all");

  if (stageSablons.length === 0) return null;

  let displaySablons = stageSablons;
  if (filter === "starred" && activeStarredDocs) {
    displaySablons = stageSablons.filter((sablon) => {
      const cleanName = sablon.ad.match(/^\[(.*?)\]\s*(.*)$/)
        ? sablon.ad.match(/^\[(.*?)\]\s*(.*)$/)![2].trim()
        : sablon.ad;
      return activeStarredDocs.some(
        (d) =>
          normalizeForMatch(d) === normalizeForMatch(sablon.ad) ||
          normalizeForMatch(d) === normalizeForMatch(cleanName),
      );
    });
  }

  return (
    <div className="flex flex-col mb-6 print:hidden animate-in fade-in duration-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between w-full pb-2 mb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div
          onClick={() => setSablonsExpanded(!sablonsExpanded)}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Süreç Belgeleri
          </span>
          {sablonsExpanded
            ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${
                filter === "all"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setFilter("starred")}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors flex items-center gap-1 ${
                filter === "starred"
                  ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              }`}
            >
              <Star
                className={`w-3 h-3 ${
                  filter === "starred" ? "fill-current" : ""
                }`}
              />
              Hızlı Erişim
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
          {filter === "starred" && displaySablons.length === 0
            ? (
              <div className="text-xs text-slate-400 dark:text-slate-500 italic py-1">
                Bu aşama için henüz hızlı erişim belgesi seçilmemiş.
                <Link
                  to="/dosya/cikti-merkezi"
                  className="text-blue-500 hover:underline ml-1"
                >
                  Çıktı Merkezi'nden ekleyebilirsiniz.
                </Link>
              </div>
            )
            : (
              <div className="flex items-center gap-2 flex-wrap">
                {displaySablons.map((sablon, idx) => {
                  let status: string | null = null;
                  let cleanName = sablon.ad;
                  const match = sablon.ad.match(/^\[(.*?)\]\s*(.*)$/);
                  if (match) {
                    status = match[1].trim();
                    cleanName = match[2].trim();
                  }

                  return (
                    <button
                      key={sablon.id || sablon.ad}
                      onClick={() => onSablonClick(sablon, sablon.ad)}
                      disabled={ciktiLoading ||
                        (isSablonDisabled && isSablonDisabled(cleanName))}
                      className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
                        ciktiLoading ||
                          (isSablonDisabled && isSablonDisabled(cleanName))
                          ? "opacity-40 cursor-not-allowed grayscale"
                          : "cursor-pointer"
                      } ${BUTTON_COLORS[idx % BUTTON_COLORS.length]}`}
                    >
                      <FileText className="w-4 h-4 shrink-0" />
                      <span>{cleanName}</span>
                      {status && (
                        <span className="px-1.5 py-0.5 bg-black/25 text-white rounded text-[9px] font-black uppercase tracking-wide shrink-0">
                          {status}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
    </div>
  )
}
    </div>
  );
}
