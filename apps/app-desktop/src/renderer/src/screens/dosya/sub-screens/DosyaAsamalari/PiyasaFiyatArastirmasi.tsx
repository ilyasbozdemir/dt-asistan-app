import React, { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  Edit3,
  ExternalLink,
  Eye,
  FileCheck2,
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
  } = logic;

  const [activeActionDropdown, setActiveActionDropdown] = useState<
    string | null
  >(null);
  const [isFormFullscreen, setIsFormFullscreen] = useState<boolean>(true);
  const [activeFormTab, setActiveFormTab] = useState<"firms" | "matrix">(() => {
    return invitedFirms.length > 0 ? "matrix" : "firms";
  });

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
      title="Piyasa Fiyat Araştırması"
      icon={PackageSearch}
      description="Tedarikçi teklif mektupları hazırlayabilir, toplanan teklifleri fiyat araştırma matrisine girerek en uygun teklifleri ve yaklaşık maliyeti belirleyebilirsiniz."
    >
      {/* 1. TUTANAK VE BELGE LİSTESİ DASHBOARD (FORM AÇIK DEĞİLKEN) */}
      {!isFormOpen && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Oluşturulan Tutanak & Belgeler
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Fiyat araştırması sonucunda oluşturulan evraklar. Değişiklik
                yapmak için fiyat matrisi formunu açabilir veya süreç
                şablonlarını aşağıdan görüntüleyebilirsiniz.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all h-10 cursor-pointer text-center whitespace-nowrap border-0"
              >
                <Plus className="w-4 h-4" />
                Yeni Tutanak Ekle / Matris Düzenle
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
                  buttonHeightClass="h-10"
                />
              )}
            </div>
          </div>

          {stageDocs.length === 0
            ? (
              <div className="py-10 text-center flex flex-col items-center justify-center gap-3">
                <AlertCircle className="w-9 h-9 text-slate-300 dark:text-slate-600" />
                <div className="text-slate-700 dark:text-slate-355 text-sm font-bold">
                  Henüz kaydedilmiş bir tutanak bulunmuyor.
                </div>
                <p className="text-xs text-slate-450 dark:text-slate-500 max-w-md">
                  Firmaların teklif ettiği fiyatları girip tutanağı kaydetmek
                  için "Yeni Tutanak Ekle / Matris Düzenle" butonuna basarak
                  fiyat matrisini açabilir veya diğer süreç şablonlarını
                  aşağıdan görüntüleyebilirsiniz.
                </p>
              </div>
            )
            : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stageDocs.map((doc: any) => {
                  const sablon = sablons.find((s: any) => {
                    const normAd = normalizeForMatch(s.ad);
                    const normDocName = normalizeForMatch(doc.belge_adi);
                    return normAd.includes(normDocName) ||
                      normDocName.includes(normAd);
                  });

                  return (
                    <div
                      key={doc.id || doc.belge_adi}
                      className="flex flex-col justify-between p-5 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/80 rounded-2xl hover:border-blue-300 dark:hover:border-blue-800 transition-all shadow-3xs"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg">
                            <FileCheck2 className="w-3.5 h-3.5" />
                            Hazır / Kaydedildi
                          </span>

                          {doc.belge_tarihi && (
                            <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                              <Calendar className="w-3.5 h-3.5" />
                              {doc.belge_tarihi}
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm mb-1">
                          {doc.belge_adi}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-455 truncate">
                          {sablon?.dosya_adi || "Şablon dosyası bağlı"}
                        </p>
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/50 pt-4">
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
                          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold bg-blue-50/60 hover:bg-blue-100/60 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 py-2.5 px-4 rounded-xl transition-all cursor-pointer border border-blue-100 dark:border-blue-900/20 h-10"
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
                              className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-355 transition-all cursor-pointer border border-slate-200 dark:border-slate-700/60"
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
                <span className="text-slate-400">Tutanak / Matris Tarihi:</span>
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
              "p-6 flex flex-col gap-6 w-full",
              isFormFullscreen ? "md:p-8 max-w-7xl mx-auto flex-1" : "",
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
                            Teklif fiyat giriş matrisini görüntülemek için bu
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
