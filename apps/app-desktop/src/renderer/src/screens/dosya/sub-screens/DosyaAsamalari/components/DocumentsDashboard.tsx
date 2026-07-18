import React from "react";
import {
  AlertCircle,
  Calendar,
  ClipboardList,
  ExternalLink,
  Eye,
  FileText,
  MoreVertical,
  Printer,
} from "lucide-react";
import { cn } from "../../../../../utils/cn";
import { normalizeForMatch } from "../useDosyaAsamasiSablons";

interface DocumentsDashboardProps {
  stageDocs: any[];
  docViewMode: "grid" | "list" | "table";
  sablons: any[];
  disableDocumentGuidance: boolean;
  activeActionDropdown: string | null;
  setActiveActionDropdown: (val: string | null) => void;
  handleOpenPreviewForSablon: (sablon: any, title: string) => void;
  quickOpenExternal: (sablon: any) => void;
  quickPrint: (sablon: any) => void;
  handleUpdateDocumentDate: (
    docId: number,
    dateStr: string,
    docName: string,
  ) => void;
}

export function DocumentsDashboard({
  stageDocs,
  docViewMode,
  sablons,
  disableDocumentGuidance,
  activeActionDropdown,
  setActiveActionDropdown,
  handleOpenPreviewForSablon,
  quickOpenExternal,
  quickPrint,
  handleUpdateDocumentDate,
}: DocumentsDashboardProps): React.JSX.Element {
  if (stageDocs.length === 0) {
    return (
      <div className="py-10 text-center flex flex-col items-center justify-center gap-3">
        <AlertCircle className="w-9 h-9 text-slate-300 dark:text-slate-600" />
        <div className="text-slate-700 dark:text-slate-355 text-sm font-bold">
          Henüz kaydedilmiş bir tutanak bulunmuyor.
        </div>
        <p className="text-xs text-slate-450 dark:text-slate-500 max-w-md">
          Firmaların teklif ettiği fiyatları girip tutanağı kaydetmek için "Yeni
          Tutanak Ekle / Teklif Girişi" butonuna basarak fiyat tablosunu
          açabilir veya diğer süreç şablonlarını aşağıdan görüntüleyebilirsiniz.
        </p>
      </div>
    );
  }

  if (docViewMode === "table") {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
                <th className="px-5 py-3.5 text-xs font-black text-slate-550 dark:text-slate-400 uppercase tracking-wider">
                  Belge Adı
                </th>
                <th className="px-5 py-3.5 text-xs font-black text-slate-550 dark:text-slate-400 uppercase tracking-wider">
                  Belge Tarihi
                </th>
                <th className="px-5 py-3.5 text-xs font-black text-slate-550 dark:text-slate-400 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-5 py-3.5 text-xs font-black text-slate-550 dark:text-slate-400 uppercase tracking-wider text-right">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {stageDocs.map((doc: any) => {
                const sablon = sablons.find((s: any) => {
                  const normAd = normalizeForMatch(s.ad);
                  const normDocName = normalizeForMatch(doc.belge_adi);
                  return normAd.includes(normDocName) ||
                    normDocName.includes(normAd);
                });

                const isTutanak = doc.belge_adi.toLowerCase().includes(
                  "tutanak",
                );

                return (
                  <tr
                    key={doc.id || doc.belge_adi}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                            isTutanak
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-455"
                              : "bg-violet-500/10 text-violet-600 dark:text-violet-455",
                          )}
                        >
                          {isTutanak
                            ? <FileText className="w-4.5 h-4.5" />
                            : <ClipboardList className="w-4.5 h-4.5" />}
                        </div>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
                          {doc.belge_adi}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="text-xs font-bold text-slate-600 dark:text-slate-400 truncate max-w-xs block"
                        title={sablon?.dosya_adi}
                      >
                        {sablon?.dosya_adi || "Bağlı şablon bulunmuyor"}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-750 w-fit">
                        <Calendar className="w-3.5 h-3.5 text-slate-455" />
                        <input
                          type="date"
                          value={doc.belge_tarihi || ""}
                          onChange={(e) => {
                            handleUpdateDocumentDate(
                              doc.id,
                              e.target.value,
                              doc.belge_adi,
                            );
                          }}
                          className="bg-transparent border-none text-xs p-0 font-bold focus:outline-none cursor-pointer text-slate-700 dark:text-slate-300 w-32"
                        />
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/10">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        Hazır
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            if (sablon) {
                              handleOpenPreviewForSablon(sablon, sablon.ad);
                            }
                          }}
                          className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-455 hover:bg-blue-50 dark:hover:bg-blue-950/30 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer border-0 bg-transparent"
                        >
                          <Eye className="w-4 h-4" />
                          Önizle
                        </button>
                        {sablon && (
                          <>
                            <button
                              onClick={() => quickOpenExternal(sablon)}
                              className="flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 w-8 h-8 rounded-lg transition-all cursor-pointer border-0 bg-transparent"
                              title="PDF Aç"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => quickPrint(sablon)}
                              className="flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 w-8 h-8 rounded-lg transition-all cursor-pointer border-0 bg-transparent"
                              title="Hızlı Yazdır"
                            >
                              <Printer className="w-4 h-4" />
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
      </div>
    );
  }

  if (docViewMode === "list") {
    return (
      <div className="flex flex-col gap-3">
        {stageDocs.map((doc: any) => {
          const sablon = sablons.find((s: any) => {
            const normAd = normalizeForMatch(s.ad);
            const normDocName = normalizeForMatch(doc.belge_adi);
            return normAd.includes(normDocName) || normDocName.includes(normAd);
          });

          const isTutanak = doc.belge_adi.toLowerCase().includes("tutanak");

          return (
            <div
              key={doc.id || doc.belge_adi}
              className={cn(
                "relative group bg-gradient-to-r from-slate-50/40 to-white dark:from-slate-900/40 dark:to-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-4 hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                activeActionDropdown === doc.belge_adi ? "z-30" : "z-10",
              )}
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br shadow-3xs",
                    isTutanak
                      ? "from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5 text-blue-600 dark:text-blue-455 border border-blue-500/20"
                      : "from-violet-500/10 to-fuchsia-500/10 dark:from-violet-500/5 dark:to-fuchsia-500/5 text-violet-600 dark:text-violet-455 border border-violet-500/20",
                  )}
                >
                  {isTutanak
                    ? <FileText className="w-5 h-5" />
                    : <ClipboardList className="w-5 h-5" />}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-150 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight mb-0.5">
                    {doc.belge_adi}
                  </h4>
                  <p
                    className="text-[10px] font-semibold text-slate-500 dark:text-slate-450 truncate"
                    title={sablon?.dosya_adi}
                  >
                    {sablon?.dosya_adi || "Bağlı şablon bulunmuyor"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-500/10 h-7 select-none">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Kaydedildi
                </span>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-550 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/30 h-7">
                  <Calendar className="w-3.5 h-3.5 text-slate-455" />
                  <input
                    type="date"
                    value={doc.belge_tarihi || ""}
                    onChange={(e) => {
                      handleUpdateDocumentDate(
                        doc.id,
                        e.target.value,
                        doc.belge_adi,
                      );
                    }}
                    className="bg-transparent border-none text-[10px] p-0 font-bold focus:outline-none cursor-pointer text-slate-700 dark:text-slate-300 w-32"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (sablon) {
                        handleOpenPreviewForSablon(sablon, sablon.ad);
                      } else {
                        alert(
                          "Şablon bulunamadı. Lütfen Şablon Yönetimi alanını kontrol edin.",
                        );
                      }
                    }}
                    className="flex items-center justify-center gap-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded-lg transition-all cursor-pointer h-7 border-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Önizle
                  </button>

                  {!disableDocumentGuidance && (
                    <div className="relative dropdown-container">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveActionDropdown(
                            activeActionDropdown === doc.belge_adi
                              ? null
                              : doc.belge_adi,
                          );
                        }}
                        className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-355 transition-all cursor-pointer border border-slate-200 dark:border-slate-700/60"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {activeActionDropdown === doc.belge_adi && (
                        <div className="absolute right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 w-52 py-1.5 text-left">
                          <button
                            onClick={() => {
                              setActiveActionDropdown(null);
                              if (sablon) {
                                handleOpenPreviewForSablon(sablon, sablon.ad);
                              }
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-bold cursor-pointer transition-colors"
                          >
                            <Eye className="w-4 h-4 text-blue-500" />
                            Önizle ve Düzenle
                          </button>
                          <button
                            onClick={() => {
                              setActiveActionDropdown(null);
                              if (sablon) {
                                quickOpenExternal(sablon);
                              }
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-bold cursor-pointer transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            Tarayıcıda PDF Aç
                          </button>
                          <button
                            onClick={() => {
                              setActiveActionDropdown(null);
                              if (sablon) quickPrint(sablon);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-bold cursor-pointer border-t border-slate-100 dark:border-slate-800/80 mt-1 pt-1.5 transition-colors"
                          >
                            <Printer className="w-4 h-4 text-slate-500" />
                            Hızlı Yazdır
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  /* DOCUMENTS GRID VIEW (DEFAULT) */
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {stageDocs.map((doc: any) => {
        const sablon = sablons.find((s: any) => {
          const normAd = normalizeForMatch(s.ad);
          const normDocName = normalizeForMatch(doc.belge_adi);
          return normAd.includes(normDocName) ||
            normDocName.includes(normAd);
        });

        const isTutanak = doc.belge_adi.toLowerCase().includes(
          "tutanak",
        );

        return (
          <div
            key={doc.id || doc.belge_adi}
            className={cn(
              "relative group bg-gradient-to-br from-slate-50/40 to-white dark:from-slate-900/40 dark:to-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 hover:shadow-lg hover:shadow-blue-500/[0.02] hover:border-blue-500/40 dark:hover:border-blue-500/30 transition-all duration-300 flex flex-col justify-between",
              activeActionDropdown === doc.belge_adi ? "z-30" : "z-10",
            )}
          >
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div className="absolute -right-12 -top-12 w-28 h-28 rounded-full bg-blue-400/[0.06] dark:bg-blue-400/[0.03] blur-2xl group-hover:bg-blue-400/[0.12] dark:group-hover:bg-blue-400/[0.06] transition-all duration-500" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Hazır / Kaydedildi
                </span>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-550 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/30">
                  <Calendar className="w-3.5 h-3.5 text-slate-455" />
                  <input
                    type="date"
                    value={doc.belge_tarihi || ""}
                    onChange={(e) => {
                      handleUpdateDocumentDate(
                        doc.id,
                        e.target.value,
                        doc.belge_adi,
                      );
                    }}
                    className="bg-transparent border-none text-[10px] p-0 font-bold focus:outline-none cursor-pointer text-slate-700 dark:text-slate-300 w-32"
                  />
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br shadow-3xs",
                    isTutanak
                      ? "from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5 text-blue-600 dark:text-blue-455 border border-blue-500/20"
                      : "from-violet-500/10 to-fuchsia-500/10 dark:from-violet-500/5 dark:to-fuchsia-500/5 text-violet-600 dark:text-violet-455 border border-violet-500/20",
                  )}
                >
                  {isTutanak
                    ? <FileText className="w-6 h-6" />
                    : <ClipboardList className="w-6 h-6" />}
                </div>

                <div className="min-w-0">
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-150 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight mb-1">
                    {doc.belge_adi}
                  </h4>
                  <p
                    className="text-[11px] font-semibold text-slate-500 dark:text-slate-450 truncate"
                    title={sablon?.dosya_adi}
                  >
                    {sablon?.dosya_adi ||
                      "Bağlı şablon bulunmuyor"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-4 z-10 relative">
              <button
                onClick={() => {
                  if (sablon) {
                    handleOpenPreviewForSablon(sablon, sablon.ad);
                  } else {
                    alert(
                      "Şablon bulunamadı. Lütfen Şablon Yönetimi alanını kontrol edin.",
                    );
                  }
                }}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 py-2.5 px-4 rounded-xl transition-all shadow-xs hover:shadow shadow-blue-500/10 cursor-pointer h-10 border-0"
              >
                <Eye className="w-4 h-4" />
                Önizle ve Düzenle
              </button>

              {!disableDocumentGuidance && (
                <div className="relative dropdown-container">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveActionDropdown(
                        activeActionDropdown === doc.belge_adi
                          ? null
                          : doc.belge_adi,
                      );
                    }}
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-655 dark:text-slate-355 transition-all cursor-pointer border border-slate-200 dark:border-slate-700/60"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {activeActionDropdown === doc.belge_adi && (
                    <div className="absolute right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 w-52 py-1.5 text-left">
                      <button
                        onClick={() => {
                          setActiveActionDropdown(null);
                          if (sablon) {
                            handleOpenPreviewForSablon(
                              sablon,
                              sablon.ad,
                            );
                          }
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-700 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-bold cursor-pointer transition-colors"
                      >
                        <Eye className="w-4 h-4 text-blue-500" />
                        Önizle ve Düzenle
                      </button>

                      <button
                        onClick={() => {
                          setActiveActionDropdown(null);
                          if (sablon) {
                            quickOpenExternal(sablon);
                          }
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-700 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-bold cursor-pointer transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-emerald-600 dark:text-emerald-450" />
                        Tarayıcıda PDF Aç
                      </button>

                      <button
                        onClick={() => {
                          setActiveActionDropdown(null);
                          if (sablon) {
                            quickPrint(sablon);
                          }
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-700 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-bold cursor-pointer border-t border-slate-100 dark:border-slate-800/80 mt-1 pt-2 transition-colors"
                      >
                        <Printer className="w-4 h-4 text-slate-500" />
                        Hızlı Yazdır
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
