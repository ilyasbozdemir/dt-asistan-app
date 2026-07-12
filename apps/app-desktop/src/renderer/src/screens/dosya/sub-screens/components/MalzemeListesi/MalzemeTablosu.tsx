import React, { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Edit2,
  FileText,
  Package,
  Plus,
  Printer,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "../../../../../utils/cn";
import { BelgeAksiyonlari } from "../../../../../components/ui/BelgeAksiyonlari";
import { normalizeForMatch } from "../../DosyaAsamalari/useDosyaAsamasiSablons";

export function MalzemeTablosu({
  state,
  stageSablons = [],
  onSablonClick,
  ciktiLoading,
  activeStarredDocs = [],
  onQuickPrint,
  onExport,
  onToggleStar,
  onOpenExternal,
  isSablonDisabled,
}: {
  state: any;
  stageSablons?: any[];
  onSablonClick?: (sablon: any, title: string) => void;
  ciktiLoading?: boolean;
  activeStarredDocs?: string[] | null;
  onQuickPrint?: (sablon: any) => void;
  onExport?: (sablon: any, format: "pdf" | "docx" | "udf") => void;
  onToggleStar?: (sablonAd: string) => void;
  onOpenExternal?: (sablon: any) => void;
  isSablonDisabled?: (cleanName: string) => boolean;
}): React.JSX.Element {
  const {
    items,
    units,
    loading,
    setIsAddModalOpen,
    editingId,
    setEditingId,
    editMiktar,
    setEditMiktar,
    editBirim,
    setEditBirim,
    editKdv,
    setEditKdv,
    handleStartEdit,
    handleSaveEdit,
    handleDeleteItem,
  } = state;

  const [belgeMenuOpen, setBelgeMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setBelgeMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col min-h-[400px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Package className="w-4 h-4 text-blue-600" />
          Dosyadaki İhtiyaç Kalemleri
          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full font-bold">
            {items.length}
          </span>
        </h3>
        <div className="flex items-center gap-2 relative">
          {stageSablons.length > 0 && onSablonClick && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() =>
                  setBelgeMenuOpen((v) =>
                    !v
                  )}
                disabled={ciktiLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="w-3.5 h-3.5 text-blue-500" />
                Belgeleri Yazdır
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {belgeMenuOpen && (
                <div className="absolute right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 w-80 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150 overflow-visible">
                  <div className="px-3 py-1 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1">
                    Bu Aşamanın Belgeleri
                  </div>
                  {stageSablons.map((sablon: any) => {
                    let cleanName = sablon.ad;
                    const matchStatus = cleanName.match(/^\[(.*?)\]\s*(.*)$/);
                    if (matchStatus) cleanName = matchStatus[2].trim();
                    const cleanTitle = cleanName.replace(/\s*\(.*?\)\s*$/, "")
                      .trim();

                    const isDisabled = ciktiLoading ||
                      (isSablonDisabled && isSablonDisabled(cleanName));
                    const isStarred = activeStarredDocs
                      ? activeStarredDocs.some(
                        (d) =>
                          normalizeForMatch(d) === normalizeForMatch(cleanName),
                      )
                      : false;

                    return (
                      <div
                        key={sablon.id || sablon.ad}
                        className="w-full flex items-center justify-between px-3 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors gap-2"
                      >
                        <button
                          disabled={isDisabled}
                          onClick={() => {
                            if (onSablonClick) {
                              onSablonClick(sablon, sablon.ad);
                            }
                            setBelgeMenuOpen(false);
                          }}
                          className="flex-1 text-left text-xs text-slate-700 dark:text-slate-300 font-semibold transition-colors cursor-pointer flex items-center gap-2 truncate disabled:opacity-50 disabled:cursor-not-allowed hover:text-blue-650 dark:hover:text-blue-400"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-450 dark:text-slate-500 shrink-0" />
                          <span className="truncate">{cleanTitle}</span>
                        </button>

                        <div className="shrink-0">
                          <BelgeAksiyonlari
                            isStarred={isStarred}
                            onPreview={() => {
                              if (onSablonClick) {
                                onSablonClick(sablon, sablon.ad);
                              }
                              setBelgeMenuOpen(false);
                            }}
                            onQuickPrint={() =>
                              onQuickPrint && onQuickPrint(sablon)}
                            onExport={(fmt) =>
                              onExport && onExport(sablon, fmt)}
                            onToggleStar={() =>
                              onToggleStar && onToggleStar(cleanName)}
                            onOpenExternal={() =>
                              onOpenExternal && onOpenExternal(sablon)}
                            disabled={isDisabled}
                            docName={cleanName}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            İhtiyaç Kalemi Ekle
          </button>
        </div>
      </div>

      {loading
        ? (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-400 italic">
            Yükleniyor...
          </div>
        )
        : items.length === 0
        ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Package className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-xs">
              Bu dosyada henüz herhangi bir ihtiyaç kalemi eklenmemiş.
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              Sol taraftaki paneli kullanarak ilk ihtiyaç kalemi
              ekleyebilirsiniz.
            </p>
          </div>
        )
        : (
          <div className="overflow-x-auto custom-scrollbar flex-1">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3 pl-4">Kodu</th>
                  <th className="p-3 pl-4">İhtiyaç Kalemi Adı</th>
                  <th className="p-3">Tür</th>
                  <th className="p-3 text-center">Miktar</th>
                  <th className="p-3">Birim</th>
                  <th className="p-3 text-center">KDV (%)</th>
                  <th className="p-3 text-right pr-4">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {items.map((item: any) => {
                  const isEditing = editingId === item.id;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10"
                    >
                      <td className="p-3 pl-4 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                        {item.tasinir_kodu || "-"}
                      </td>

                      <td className="p-3 pl-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {item.kalem_adi}
                        </div>
                        {item.okas_kodu && (
                          <div className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                            OKAS: {item.okas_kodu}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase",
                            item.tipi === "Mal" &&
                              "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
                            item.tipi === "Hizmet" &&
                              "bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400",
                            item.tipi === "Yapım" &&
                              "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
                            item.tipi === "Danışmanlık" &&
                              "bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400",
                          )}
                        >
                          {item.tipi}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {isEditing
                          ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editMiktar}
                              onChange={(e) =>
                                setEditMiktar(parseFloat(e.target.value) || 1)}
                              className="w-16 p-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-955 rounded text-center text-xs font-bold"
                            />
                          )
                          : (
                            <span className="font-black text-slate-750 dark:text-slate-300">
                              {item.miktar}
                            </span>
                          )}
                      </td>
                      <td className="p-3">
                        {isEditing
                          ? (
                            <select
                              value={editBirim}
                              onChange={(e) => setEditBirim(e.target.value)}
                              className="p-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-955 rounded text-xs"
                            >
                              {units.map((u: any, idx: number) => (
                                <option key={idx} value={u.ad}>
                                  {u.ad}
                                </option>
                              ))}
                            </select>
                          )
                          : <span>{item.birim}</span>}
                      </td>
                      <td className="p-3 text-center">
                        {isEditing
                          ? (
                            <select
                              value={editKdv}
                              onChange={(e) =>
                                setEditKdv(parseInt(e.target.value, 10))}
                              className="p-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-955 rounded text-xs"
                            >
                              <option value="0">%0</option>
                              <option value="1">%1</option>
                              <option value="10">%10</option>
                              <option value="20">%20</option>
                            </select>
                          )
                          : <span>%{item.kdv_orani}</span>}
                      </td>
                      <td className="p-3 text-right pr-4">
                        <div className="flex justify-end gap-2">
                          {isEditing
                            ? (
                              <>
                                <button
                                  onClick={() => handleSaveEdit(item.id)}
                                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 border border-emerald-250 dark:border-emerald-900/40 hover:border-emerald-300 dark:hover:border-emerald-800 text-emerald-600 dark:text-emerald-450 rounded-lg transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 flex items-center justify-center"
                                  title="Değişiklikleri Kaydet"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-955/20 dark:hover:bg-red-950/30 border border-red-250 dark:border-red-900/40 hover:border-red-300 dark:hover:border-red-800 text-red-500 dark:text-red-400 rounded-lg transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 flex items-center justify-center"
                                  title="İptal"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )
                            : (
                              <>
                                <button
                                  onClick={() => handleStartEdit(item)}
                                  className="p-1.5 bg-slate-50 hover:bg-blue-50 dark:bg-slate-950 dark:hover:bg-blue-955/30 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-900/50 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-lg transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 flex items-center justify-center"
                                  title="İhtiyaç Kalemi Düzenle"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-1.5 bg-slate-50 hover:bg-red-50 dark:bg-slate-950 dark:hover:bg-red-955/20 border border-slate-200 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-900/50 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 rounded-lg transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 flex items-center justify-center"
                                  title="İhtiyaç Kalemi Sil"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}
