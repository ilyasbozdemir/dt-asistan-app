import React, { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Check,
  Edit3,
  FileCheck2,
  LayoutGrid,
  List,
  PackageSearch,
  Plus,
  Settings,
  Table,
  TrendingUp,
} from "lucide-react";
import { SubScreen } from "../../SubScreens.screen";
import { DocumentPreviewModal } from "../../components/DocumentPreviewModal";
import { normalizeForMatch } from "./useDosyaAsamasiSablons";
import { cn } from "../../../../utils/cn";
import { DavetEdilenFirmalar } from "./components/DavetEdilenFirmalar";
import { TeklifMatrisi } from "./components/TeklifMatrisi";
import { FirmaSecmeModali } from "./components/FirmaSecmeModali";
import { DocumentsDashboard } from "./components/DocumentsDashboard";
import { PricesSummaryDashboard } from "./components/PricesSummaryDashboard";
import { usePiyasaFiyatArastirmasiLogic } from "./hooks/usePiyasaFiyatArastirmasi";
import { useSettingsStore } from "../../../../store/settingsStore";
import { PrintDropdownButton } from "../../components/PrintDropdownButton";

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
    maliyetCetveliTarihi,
    handleUpdateDocumentDate,
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
  const [docViewMode, setDocViewMode] = useState<"grid" | "list" | "table">(
    () => {
      try {
        return (localStorage.getItem("dta_doc_view_mode") as any) || "grid";
      } catch {
        return "grid";
      }
    },
  );

  const changeDocViewMode = (mode: "grid" | "list" | "table") => {
    setDocViewMode(mode);
    try {
      localStorage.setItem("dta_doc_view_mode", mode);
    } catch (e) {
      console.error(e);
    }
  };

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
          {/* Row 1: Title and Primary CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-5">
            <div>
              <h3 className="text-base font-black text-slate-855 dark:text-slate-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse">
                </span>
                Piyasa Fiyat Araştırma Süreci
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Tedarikçi tekliflerini girip karşılaştırabilir, en uygun
                teklifleri ve yaklaşık maliyet cetvelini hazırlayabilirsiniz.
              </p>
            </div>

            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 text-xs bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg transition-all h-10 cursor-pointer border-0 shrink-0 self-start sm:self-center"
            >
              {stageDocs.length > 0
                ? (
                  <>
                    <Edit3 className="w-4.5 h-4.5" />
                    Tutanak & Fiyat Tablosunu Düzenle
                  </>
                )
                : (
                  <>
                    <Plus className="w-4.5 h-4.5" />
                    Yeni Tutanak Ekle / Teklif Girişi
                  </>
                )}
            </button>
          </div>

          {/* Row 2: Sub-navigation Tabs & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/30 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800/80">
            {/* Left side: View Mode switcher tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/40 w-fit shrink-0">
              <button
                type="button"
                onClick={() => setDashboardViewMode("documents")}
                className={cn(
                  "flex items-center gap-1.5 py-1.5 px-3 text-[11px] font-black rounded-lg transition-all cursor-pointer border-0",
                  dashboardViewMode === "documents"
                    ? "bg-white dark:bg-slate-900 text-slate-855 dark:text-slate-100 shadow-3xs"
                    : "text-slate-500 hover:text-slate-755 dark:hover:text-slate-355 bg-transparent",
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
                    : "text-slate-500 hover:text-slate-755 dark:hover:text-slate-355 bg-transparent",
                )}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Fiyat & Teklif Özeti
              </button>
            </div>

            {/* Right side: Active Tab specific layout controls */}
            {dashboardViewMode === "documents" && (
              <div className="flex flex-wrap items-center gap-3 w-fit">
                {stageDocs.length > 0 && (
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/40 shrink-0 h-10">
                    <button
                      type="button"
                      title="Izgara Görünümü"
                      onClick={() => changeDocViewMode("grid")}
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-lg transition-all cursor-pointer border-0 bg-transparent",
                        docViewMode === "grid"
                          ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-3xs"
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-400",
                      )}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Liste Görünümü"
                      onClick={() => changeDocViewMode("list")}
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-lg transition-all cursor-pointer border-0 bg-transparent",
                        docViewMode === "list"
                          ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-3xs"
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-400",
                      )}
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Tablo Görünümü"
                      onClick={() => changeDocViewMode("table")}
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-lg transition-all cursor-pointer border-0 bg-transparent",
                        docViewMode === "table"
                          ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-3xs"
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-400",
                      )}
                    >
                      <Table className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {stageSablons.length > 0 && (
                  <PrintDropdownButton
                    kategori="2-piyasa-fiyat-arastirmasi"
                    sablons={sablons}
                    overrideSablons={stageSablons}
                    activeStarredDocs={activeStarredDocs || []}
                    ciktiLoading={ciktiLoading}
                    handleOpenPreviewForSablon={handleOpenPreviewForSablon}
                    quickPrint={quickPrint}
                    quickExport={quickExport}
                    quickOpenExternal={quickOpenExternal}
                    isSablonDisabled={isSablonDisabled}
                    buttonHeightClass="h-10"
                    label={disableDocumentGuidance
                      ? "İşlemler"
                      : "Belgeleri Yazdır"}
                  />
                )}
              </div>
            )}
          </div>

          {dashboardViewMode === "prices"
            ? (
              <PricesSummaryDashboard
                invitedFirms={invitedFirms}
                items={items}
                bids={bids}
              />
            )
            : (
              <DocumentsDashboard
                stageDocs={stageDocs}
                docViewMode={docViewMode}
                sablons={sablons}
                disableDocumentGuidance={disableDocumentGuidance}
                activeActionDropdown={activeActionDropdown}
                setActiveActionDropdown={setActiveActionDropdown}
                handleOpenPreviewForSablon={handleOpenPreviewForSablon}
                quickOpenExternal={quickOpenExternal}
                quickPrint={quickPrint}
                handleUpdateDocumentDate={handleUpdateDocumentDate}
              />
            )}
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
                <span className="text-slate-400">Yaklaşık Maliyet Tarihi:</span>
                <input
                  type="date"
                  value={maliyetCetveliTarihi}
                  onChange={(e) => {
                    setMaliyetCetveliTarihi(e.target.value);
                    if (syncTutanak) {
                      setTutanakTarihi(e.target.value);
                    }
                  }}
                  className="bg-transparent border-none text-xs font-extrabold focus:outline-none cursor-pointer text-slate-800 dark:text-slate-250 w-28"
                />
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-355 bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800 h-10">
                <span className="text-slate-400">Tutanak Tarihi:</span>
                <input
                  type="date"
                  value={tutanakTarihi}
                  disabled={syncTutanak}
                  onChange={(e) => setTutanakTarihi(e.target.value)}
                  className="bg-transparent border-none text-xs font-extrabold focus:outline-none cursor-pointer text-slate-800 dark:text-slate-250 disabled:opacity-60 w-28"
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
