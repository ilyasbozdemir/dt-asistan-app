import React, { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  ClipboardList,
  Edit3,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  Maximize2,
  Minimize2,
  MoreVertical,
  PackageSearch,
  Plus,
  Printer,
  Settings,
  TrendingUp,
} from "lucide-react";
import { SubScreen } from "../../SubScreens.screen";
import { DocumentPreviewModal } from "../../components/DocumentPreviewModal";
import { normalizeForMatch } from "./useDosyaAsamasiSablons";
import { cn } from "../../../../utils/cn";
import { DavetEdilenFirmalar } from "./components/DavetEdilenFirmalar";
import { TeklifMatrisi } from "./components/TeklifMatrisi";
import { FirmaSecmeModali } from "./components/FirmaSecmeModali";
import { usePiyasaFiyatArastirmasiLogic } from "./hooks/usePiyasaFiyatArastirmasi";
import { useSettingsStore } from "../../../../store/settingsStore";
import { PrintDropdownButton } from "../../components/PrintDropdownButton";
import { SurecBelgeleriPanel } from "./SablonPanelleri";

export function PiyasaFiyatArastirmasi(): React.JSX.Element {
  const logic = usePiyasaFiyatArastirmasiLogic();
  const {
    sablonsContext: {
      masterHtml,
      dosyaContext,
      placeholders,
      personelListesi,
      previewModalOpen,
      setPreviewModalOpen,
      previewData,
      executePrint,
      executeExportPdf,
      executeExportDocx,
      executeExportUdf,
      quickPrint,
      quickExport,
      quickOpenExternal,
      toggleStar,
      refreshSnapshot,
      saveSnapshot,
      activeStarredDocs,
      contextsByPath,
      handleOpenPreviewForSablon,
      sablons,
      ciktiLoading,
      isSablonDisabled,
    },
    invitedFirms,
    allPoolFirms,
    isFormOpen,
    setIsFormOpen,
    items,
    bids,
    hesaplamaEsasi,
    isFirmModalOpen,
    setIsFirmModalOpen,
    selectedFirmIds,
    setSelectedFirmIds,
    modalSearchQuery,
    setModalSearchQuery,
    handleBulkAddFirms,
    handleRemoveFirm,
    handlePriceChange,
    getLowestBidInfo,
    getAverageBid,
    getEstimatedCostTotal,
    handleSaveToDosya,
    lowestTotalFirmaId,
    isEditingFirms,
    setMaliyetCetveliTarihi,
    tutanakTarihi,
    setTutanakTarihi,
    savedDocuments,
    stageSablons,
    syncTutanak,
    setSyncTutanak,
    setLowestFirmAsWinner,
    setSetLowestFirmAsWinner,
    manualWinnerFirmaId,
    setManualWinnerFirmaId,
  } = logic;

  const [activeActionDropdown, setActiveActionDropdown] = useState<
    string | null
  >(null);
  const [isFormFullscreen, setIsFormFullscreen] = useState<boolean>(false);
  const [activeFormTab, setActiveFormTab] = useState<"firms" | "matrix">(() => {
    return invitedFirms.length > 0 ? "matrix" : "firms";
  });
  const [dashboardViewMode, setDashboardViewMode] = useState<
    "documents" | "prices"
  >("documents");

  const stageDocs = savedDocuments;
  const { disableDocumentGuidance } = useSettingsStore();

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".dropdown-container")) {
        setActiveActionDropdown(null);
      }
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  if (previewData && previewModalOpen) {
    const isStarred = previewData?.title
      ? activeStarredDocs.some(
        (d) =>
          normalizeForMatch(d) === normalizeForMatch(previewData.title || ""),
      )
      : false;

    return (
      <DocumentPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title={previewData.title}
        templateHtml={previewData.templateHtml}
        masterHtml={masterHtml || ""}
        baseContext={previewData.snapshotContext ||
          contextsByPath[previewData.processPath] || dosyaContext}
        placeholders={placeholders}
        personelListesi={personelListesi}
        onPrint={executePrint}
        onExportPdf={executeExportPdf}
        onExportDocx={executeExportDocx}
        onExportUdf={executeExportUdf}
        isStarred={isStarred}
        onToggleStar={() => previewData?.title && toggleStar(previewData.title)}
        isInline={true}
        templateTestVerisi={previewData.templateTestVerisi}
        dosyaAdi={previewData.dosyaAdi}
        onRefreshSnapshot={refreshSnapshot}
        onSaveSnapshot={saveSnapshot}
      />
    );
  }

  return (
    <SubScreen
      title="Teklifler & Piyasa Fiyat Araştırması"
      icon={PackageSearch}
      description="Tedarikçi teklif mektupları hazırlayabilir, toplanan teklifleri fiyat araştırma tablosuna girerek en uygun teklifleri ve yaklaşık maliyeti belirleyebilirsiniz."
    >
      {/* 1. TUTANAK VE BELGE LİSTESİ DASHBOARD (FORM AÇIK DEĞİLKEN) */}
      {!isFormOpen && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-855 dark:text-slate-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Oluşturulan Tutanak & Belgeler
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Fiyat araştırması sonucunda oluşturulan evraklar. Değişiklik
                yapmak için fiyat tablosu formunu açabilir veya süreç
                şablonlarını aşağıdan görüntüleyebilirsiniz.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Segmented View Mode Switcher */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-955 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setDashboardViewMode("documents")}
                  className={cn(
                    "flex items-center gap-1.5 py-1.5 px-3 text-[11px] font-black rounded-lg transition-all cursor-pointer border-0",
                    dashboardViewMode === "documents"
                      ? "bg-white dark:bg-slate-900 text-slate-855 dark:text-slate-100 shadow-3xs"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-400 bg-transparent",
                  )}
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  Belgeler
                </button>
                <button
                  type="button"
                  onClick={() => setDashboardViewMode("prices")}
                  className={cn(
                    "flex items-center gap-1.5 py-1.5 px-3 text-[11px] font-black rounded-lg transition-all cursor-pointer border-0",
                    dashboardViewMode === "prices"
                      ? "bg-white dark:bg-slate-900 text-slate-855 dark:text-slate-100 shadow-3xs"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-400 bg-transparent",
                  )}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Fiyat & Teklif Özeti
                </button>
              </div>

              <button
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all h-10 cursor-pointer text-center whitespace-nowrap border-0"
              >
                <Plus className="w-4 h-4" />
                Yeni Tutanak Ekle / Teklif Girişi
              </button>

              {!disableDocumentGuidance && stageSablons.length > 0 && (
                <PrintDropdownButton
                  kategori="2-piyasa-fiyat-arastirmasi"
                  sablons={sablons}
                  overrideSablons={stageSablons}
                  activeStarredDocs={activeStarredDocs || []}
                  ciktiLoading={false}
                  handleOpenPreviewForSablon={handleOpenPreviewForSablon}
                  quickPrint={quickPrint}
                  quickExport={quickExport}
                  quickOpenExternal={quickOpenExternal}
                  isSablonDisabled={isSablonDisabled}
                  buttonHeightClass="h-10"
                />
              )}
            </div>
          </div>

          {dashboardViewMode === "prices"
            ? (
              /* DYNAMIC PRICES & BIDS SUMMARY TAB */
              (() => {
                if (invitedFirms.length === 0) {
                  return (
                    <div className="py-10 text-center flex flex-col items-center justify-center gap-3">
                      <AlertCircle className="w-9 h-9 text-slate-350 dark:text-slate-655" />
                      <div className="text-slate-700 dark:text-slate-300 text-sm font-bold">
                        Teklif bilgisi bulunamadı.
                      </div>
                      <p className="text-xs text-slate-450 dark:text-slate-500 max-w-md">
                        Fiyat tekliflerini görmek için lütfen "Yeni Tutanak Ekle
                        / Teklif Girişi" butonuna tıklayarak firmaları davet
                        edin ve teklifleri girin.
                      </p>
                    </div>
                  );
                }

                // Calculate totals
                const firmTotals = invitedFirms.map((firm: any) => {
                  let total = 0;
                  items.forEach((item: any) => {
                    const key = `${item.id}_${firm.id}`;
                    const bidVal = bids[key];
                    if (bidVal && bidVal > 0) {
                      total += bidVal * (item.miktar || 0);
                    }
                  });
                  return { firm, total };
                });

                const nonZeroTotals = firmTotals.filter((t) => t.total > 0);
                const lowestTotal = nonZeroTotals.length > 0
                  ? Math.min(...nonZeroTotals.map((t) => t.total))
                  : 0;

                return (
                  <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                    {/* Firm totals summary card grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {firmTotals.map(({ firm, total }) => {
                        const isWinner = total > 0 && total === lowestTotal;
                        return (
                          <div
                            key={firm.id}
                            className={cn(
                              "p-5 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden",
                              isWinner
                                ? "bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-300 dark:border-emerald-800 shadow-sm"
                                : "bg-slate-50/50 dark:bg-slate-900/10 border-slate-200/60 dark:border-slate-800/80",
                            )}
                          >
                            {isWinner && (
                              <div className="absolute -right-6 -top-6 w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center rotate-45">
                                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-450 mt-8" />
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Building2
                                  className={cn(
                                    "w-4 h-4 shrink-0",
                                    isWinner
                                      ? "text-emerald-500"
                                      : "text-slate-400",
                                  )}
                                />
                                <span
                                  className="font-extrabold text-xs text-slate-800 dark:text-slate-250 truncate block max-w-[180px]"
                                  title={firm.unvan}
                                >
                                  {firm.unvan}
                                </span>
                              </div>

                              {isWinner && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-black bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md mb-3 border border-emerald-500/15">
                                  En Düşük Teklif
                                </span>
                              )}
                            </div>

                            <div className="mt-4">
                              <span className="text-[10px] text-slate-400 block font-bold">
                                Toplam Teklif
                              </span>
                              <span
                                className={cn(
                                  "text-base font-extrabold font-mono",
                                  total > 0
                                    ? isWinner
                                      ? "text-emerald-650 dark:text-emerald-400"
                                      : "text-slate-800 dark:text-slate-200"
                                    : "text-slate-400 italic text-xs font-semibold",
                                )}
                              >
                                {total > 0
                                  ? `${
                                    total.toLocaleString("tr-TR", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })
                                  } TL`
                                  : "Fiyat girilmedi"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Needs comparison breakdown */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-blue-500" />
                        Kalem Bazlı Fiyat Karşılaştırması
                      </h4>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-450 font-extrabold">
                              <th className="py-2.5 px-3">İhtiyaç Kalemi</th>
                              <th className="py-2.5 px-3 text-center">
                                Miktar
                              </th>
                              {invitedFirms.map((firm: any) => (
                                <th
                                  key={firm.id}
                                  className="py-2.5 px-3 text-right max-w-[150px] truncate"
                                  title={firm.unvan}
                                >
                                  {firm.unvan}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item: any) => {
                              // Find lowest bid for this item
                              const itemBids = invitedFirms.map((f: any) => {
                                const key = `${item.id}_${f.id}`;
                                return {
                                  firmId: f.id,
                                  price: bids[key] || 0,
                                };
                              }).filter((b) => b.price > 0);

                              const minItemPrice = itemBids.length > 0
                                ? Math.min(...itemBids.map((b) => b.price))
                                : 0;

                              return (
                                <tr
                                  key={item.id}
                                  className="border-b border-slate-50 dark:border-slate-900/60 hover:bg-slate-50/30 dark:hover:bg-slate-950/20 transition-colors"
                                >
                                  <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-250">
                                    {item.kalem_adi}
                                  </td>
                                  <td className="py-3 px-3 text-center text-slate-500 font-semibold">
                                    {item.miktar} {item.birim}
                                  </td>
                                  {invitedFirms.map((firm: any) => {
                                    const key = `${item.id}_${firm.id}`;
                                    const bidVal = bids[key] || 0;
                                    const isItemWinner = bidVal > 0 &&
                                      bidVal === minItemPrice;

                                    return (
                                      <td
                                        key={firm.id}
                                        className="py-3 px-3 text-right font-mono font-bold"
                                      >
                                        {bidVal > 0
                                          ? (
                                            <span
                                              className={isItemWinner
                                                ? "text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-lg border border-emerald-500/10"
                                                : "text-slate-700 dark:text-slate-300"}
                                            >
                                              {bidVal.toLocaleString("tr-TR", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                              })} TL
                                            </span>
                                          )
                                          : (
                                            <span className="text-slate-350 italic text-[11px] font-semibold">
                                              -
                                            </span>
                                          )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()
            )
            : (
              /* DOCUMENTS GRID VIEW */
              stageDocs.length === 0
                ? (
                  <div className="py-10 text-center flex flex-col items-center justify-center gap-3">
                    <AlertCircle className="w-9 h-9 text-slate-300 dark:text-slate-600" />
                    <div className="text-slate-700 dark:text-slate-355 text-sm font-bold">
                      Henüz kaydedilmiş bir tutanak bulunmuyor.
                    </div>
                    <p className="text-xs text-slate-450 dark:text-slate-500 max-w-md">
                      Firmaların teklif ettiği fiyatları girip tutanağı
                      kaydetmek için "Yeni Tutanak Ekle / Teklif Girişi"
                      butonuna basarak fiyat tablosunu açabilir veya diğer süreç
                      şablonlarını aşağıdan görüntüleyebilirsiniz.
                    </p>
                  </div>
                )
                : (
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
                          className="relative overflow-hidden group bg-gradient-to-br from-slate-50/40 to-white dark:from-slate-900/40 dark:to-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 hover:shadow-lg hover:shadow-blue-500/[0.02] hover:border-blue-500/40 dark:hover:border-blue-500/30 transition-all duration-300 flex flex-col justify-between"
                        >
                          {/* Interactive light glow on hover */}
                          <div className="absolute -right-12 -top-12 w-28 h-28 rounded-full bg-blue-400/[0.06] dark:bg-blue-400/[0.03] blur-2xl group-hover:bg-blue-400/[0.12] dark:group-hover:bg-blue-400/[0.06] transition-all duration-500 pointer-events-none" />

                          <div>
                            {/* Upper row: Badges */}
                            <div className="flex items-center justify-between mb-4">
                              <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Hazır / Kaydedildi
                              </span>

                              {doc.belge_tarihi && (
                                <span className="flex items-center gap-1 text-[10px] text-slate-550 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/10 dark:border-slate-700/30">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  {doc.belge_tarihi}
                                </span>
                              )}
                            </div>

                            {/* Title and Icon Area */}
                            <div className="flex items-start gap-4">
                              <div
                                className={cn(
                                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br shadow-3xs",
                                  isTutanak
                                    ? "from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5 text-blue-600 dark:text-blue-450 border border-blue-500/20"
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

                          {/* Footer Action buttons */}
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

                            {/* Dropdown Menu */}
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
                                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-350 transition-all cursor-pointer border border-slate-200 dark:border-slate-700/60"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>

                                {activeActionDropdown === doc.belge_adi && (
                                  <div className="absolute right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 w-52 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150 text-left">
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
                                      <ExternalLink className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
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
                )
            )}

          {/* Süreç Şablonları Paneli — 2. adıma ait belgeler */}
          <SurecBelgeleriPanel
            stageSablons={stageSablons}
            activeStarredDocs={activeStarredDocs}
            ciktiLoading={ciktiLoading}
            onSablonClick={handleOpenPreviewForSablon}
            onQuickPrint={quickPrint}
            onExport={quickExport}
            onOpenExternal={quickOpenExternal}
            isSablonDisabled={isSablonDisabled}
          />
        </div>
      )}

      {/* 2. FORM ALANI VE BİRİM FİYAT MATRİSİ (FORM AÇIKKEN) */}
      {isFormOpen && (
        <div
          className={cn(
            isFormFullscreen
              ? "fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 overflow-y-auto flex flex-col animate-in fade-in duration-300"
              : "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col gap-6 animate-in fade-in duration-300 mt-4 overflow-hidden",
          )}
        >
          {/* Form Header */}
          <div
            className={cn(
              "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 md:px-8 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4",
              isFormFullscreen ? "sticky top-0 z-50" : "",
            )}
          >
            <div className="flex items-center gap-4 shrink-0">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-3xs border border-slate-200 dark:border-slate-700"
                title="Geri Dön / Kapat"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="text-left">
                <h3 className="text-base font-black text-slate-850 dark:text-slate-100 flex items-center gap-2 leading-none">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse">
                  </span>
                  Piyasa Fiyat Araştırma Formu
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Yöntem: {hesaplamaEsasi}
                </p>
              </div>
            </div>

            {/* Tab Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800 max-w-sm w-full mx-auto lg:mx-0">
              <button
                type="button"
                onClick={() => setActiveFormTab("firms")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-1.5 px-3 text-[11px] font-black rounded-lg transition-all cursor-pointer border-0",
                  activeFormTab === "firms"
                    ? "bg-white dark:bg-slate-900 text-slate-855 dark:text-slate-100 shadow-3xs"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-400 bg-transparent",
                )}
              >
                <Building2 className="w-3.5 h-3.5" />
                İstekli Firmalar ({invitedFirms.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab("matrix")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-1.5 px-3 text-[11px] font-black rounded-lg transition-all cursor-pointer border-0",
                  activeFormTab === "matrix"
                    ? "bg-white dark:bg-slate-900 text-slate-855 dark:text-slate-100 shadow-3xs"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-400 bg-transparent",
                )}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Tutanak / Teklif Girişi
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 justify-end">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-355 bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800 h-10">
                <span className="text-slate-400">Tutanak / Teklif Tarihi:</span>
                <input
                  type="date"
                  value={tutanakTarihi}
                  onChange={(e) => {
                    setTutanakTarihi(e.target.value);
                    setMaliyetCetveliTarihi(e.target.value);
                  }}
                  className="bg-transparent border-none text-xs font-extrabold focus:outline-none cursor-pointer text-slate-800 dark:text-slate-200"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800 h-10 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={syncTutanak}
                  onChange={(e) => setSyncTutanak(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span>Tutanakla Senkronize Et</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800 h-10 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={setLowestFirmAsWinner}
                  onChange={(e) => setSetLowestFirmAsWinner(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span>En Düşük Teklifi Kazanan Yap</span>
              </label>

              {/* Elle kazanan firma seçimi — checkbox kapalıyken görünür */}
              {!setLowestFirmAsWinner && invitedFirms.length > 0 && (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-amber-50 dark:bg-amber-950/20 px-3 py-1.5 rounded-xl border border-amber-300/60 dark:border-amber-700/50 h-10">
                  <span className="text-amber-600 dark:text-amber-400 shrink-0">
                    Kazanan:
                  </span>
                  <select
                    value={manualWinnerFirmaId ?? ""}
                    onChange={(e) =>
                      setManualWinnerFirmaId(
                        e.target.value ? Number(e.target.value) : null,
                      )}
                    className="bg-transparent border-none text-xs font-extrabold focus:outline-none cursor-pointer text-slate-800 dark:text-slate-200 max-w-[180px] truncate"
                  >
                    <option value="">-- Firma Seç --</option>
                    {invitedFirms.map((f) => (
                      <option key={f.id} value={f.firma_id}>
                        {f.unvan}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Fullscreen Expand Button */}

              {getEstimatedCostTotal() > 0 && (
                <button
                  type="button"
                  onClick={handleSaveToDosya}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer h-10 border-0"
                >
                  <Check className="w-4 h-4" />
                  Tutanak & Maliyeti Kaydet
                </button>
              )}
            </div>
          </div>

          {/* Form Content Area */}
          <div
            className={cn(
              "p-6 flex flex-col gap-6 w-full flex-1",
              isFormFullscreen ? "md:p-8" : "",
            )}
          >
            {activeFormTab === "firms"
              ? (
                /* İSTEKLİ FİRMALARI YÖNETME ALANI */
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-6 animate-in fade-in duration-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-855 dark:text-slate-100 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600">
                        </span>
                        Sürece Katılan İstekli Firmalar
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Piyasa araştırması kapsamında davet edilen ve teklif
                        formu dolduran firmaları belirleyin.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {isEditingFirms && (
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-955 p-1 rounded-2xl border border-slate-100 dark:border-slate-800/80 animate-in fade-in slide-in-from-left-2 duration-300">
                          <button
                            type="button"
                            onClick={() => setIsFirmModalOpen(true)}
                            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 font-semibold px-4.5 py-2 rounded-xl transition-all h-8 cursor-pointer shadow-xs border-0"
                          >
                            <Building2 className="w-3.5 h-3.5 text-blue-400" />
                            Seç
                          </button>

                          <Link
                            to="/firmalar"
                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4.5 py-2 rounded-xl transition-all flex items-center justify-center h-8 cursor-pointer shadow-xs border-0"
                          >
                            <Settings className="w-3.5 h-3.5 text-white/90" />
                            Listeyi Yönet
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* DAVET EDİLEN FİRMALARIN KART GÖRÜNÜMÜ */}
                  <DavetEdilenFirmalar
                    invitedFirms={invitedFirms}
                    lowestTotalFirmaId={lowestTotalFirmaId}
                    isEditing={isEditingFirms}
                    onRemoveFirm={handleRemoveFirm}
                  />
                </div>
              )
              : (
                /* TEKLİF VE BİRİM FİYAT GİRİŞ MATRİSİ */
                <div className="animate-in fade-in duration-200">
                  {invitedFirms.length > 0 && items.length > 0
                    ? (
                      <TeklifMatrisi
                        invitedFirms={invitedFirms}
                        items={items}
                        bids={bids}
                        getEstimatedCostTotal={getEstimatedCostTotal}
                        getLowestBidInfo={getLowestBidInfo}
                        getAverageBid={getAverageBid}
                        handlePriceChange={handlePriceChange}
                      />
                    )
                    : invitedFirms.length > 0 && items.length === 0
                    ? (
                      <div className="bg-amber-50 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 text-left flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-sm text-amber-800 dark:text-amber-400">
                            İhtiyaç Kalemi Bulunamadı
                          </h4>
                          <p className="text-xs text-amber-600 dark:text-amber-500/90 mt-1">
                            Teklif fiyat giriş tablosunu görüntülemek için bu
                            dosyaya ait ihtiyaç kalemlerinin girilmiş olması
                            gerekir. Lütfen ilgili adımda ihtiyaç listesini
                            tanımlayın.
                          </p>
                        </div>
                      </div>
                    )
                    : (
                      <div className="bg-amber-50 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 text-left flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-sm text-amber-800 dark:text-amber-400">
                            Davet Edilen İstekli Firma Yok
                          </h4>
                          <p className="text-xs text-amber-600 dark:text-amber-550 mt-1">
                            Fiyat girişi yapabilmek için lütfen önce{" "}
                            <strong>İstekli Firmalar</strong>{" "}
                            sekmesinden en az 1 firma seçin veya ekleyin.
                          </p>
                        </div>
                      </div>
                    )}
                </div>
              )}
          </div>
        </div>
      )}

      {/* İSTEKLİ FİRMALARDAN SEÇ MODALI */}
      <FirmaSecmeModali
        isOpen={isFirmModalOpen}
        onClose={() => setIsFirmModalOpen(false)}
        allPoolFirms={allPoolFirms}
        invitedFirms={invitedFirms}
        selectedFirmIds={selectedFirmIds}
        setSelectedFirmIds={setSelectedFirmIds}
        modalSearchQuery={modalSearchQuery}
        setModalSearchQuery={setModalSearchQuery}
        onAddFirms={handleBulkAddFirms}
      />
    </SubScreen>
  );
}
