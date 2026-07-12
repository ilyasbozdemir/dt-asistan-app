import React, { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  ExternalLink,
  Eye,
  FileCheck2,
  MoreVertical,
  PackageSearch,
  Plus,
  Printer,
} from "lucide-react";
import { SubScreen } from "../../SubScreens.screen";
import { DocumentPreviewModal } from "../../components/DocumentPreviewModal";
import { normalizeForMatch } from "./useDosyaAsamasiSablons";
import { cn } from "../../../../utils/cn";
import { DavetEdilenFirmalar } from "./components/DavetEdilenFirmalar";
import { TeklifMatrisi } from "./components/TeklifMatrisi";
import { FirmaSecmeModali } from "./components/FirmaSecmeModali";
import { usePiyasaFiyatArastirmasiLogic } from "./hooks/usePiyasaFiyatArastirmasi";

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
      quickOpenExternal,
      toggleStar,
      refreshSnapshot,
      saveSnapshot,
      activeStarredDocs,
      contextsByPath,
      handleOpenPreviewForSablon,
    },
    invitedFirms,
    allPoolFirms,
    items,
    bids,
    hesaplamaEsasi,
    isFirmModalOpen,
    setIsFirmModalOpen,
    selectedFirmIds,
    setSelectedFirmIds,
    modalSearchQuery,
    setModalSearchQuery,
    stageSablons,
    handleBulkAddFirms,
    handleRemoveFirm,
    handlePriceChange,
    getLowestBidInfo,
    getAverageBid,
    getEstimatedCostTotal,
    handleSaveToDosya,
    lowestTotalFirmaId,
    isEditingFirms,
    setIsEditingFirms,
    maliyetCetveliTarihi,
    setMaliyetCetveliTarihi,
    tutanakTarihi,
    setTutanakTarihi,
    savedDocuments,
    isFormOpen,
    setIsFormOpen,
  } = logic;

  const [activeActionDropdown, setActiveActionDropdown] = useState<
    string | null
  >(null);

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
      description="Piyasa araştırması yapıp birim fiyat tekliflerinizi toplayabilir, komisyon görevlendirme onay belgesi hazırlayabilir ve tüm süreç dökümanlarınızı bu panel üzerinden oluşturup çıktı alabilirsiniz."
    >
      {/* 1. TUTANAK VE BELGE LİSTESİ DASHBOARD (FORM AÇIK DEĞİLKEN) */}
      {!isFormOpen && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-6 mb-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Oluşturulan Tutanak & Belgeler
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Fiyat araştırması sonucunda oluşturulan evraklar. Değişiklik
                yapmak için yeni tutanak oluşturma formunu açabilirsiniz.
              </p>
            </div>

            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all h-10 cursor-pointer text-center whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Yeni Tutanak / Cetvel Oluştur
            </button>
          </div>

          {savedDocuments.length === 0
            ? (
              <div className="py-10 text-center flex flex-col items-center justify-center gap-3">
                <AlertCircle className="w-9 h-9 text-slate-300 dark:text-slate-600" />
                <div className="text-slate-700 dark:text-slate-355 text-sm font-bold">
                  Henüz kaydedilmiş bir tutanak bulunmuyor.
                </div>
                <p className="text-xs text-slate-450 dark:text-slate-500 max-w-md">
                  Firmaların teklif ettiği fiyatları girip tutanağı kaydetmek
                  için "Yeni Tutanak / Cetvel Oluştur" butonuna basarak fiyat
                  matrisini açabilirsiniz.
                </p>
              </div>
            )
            : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedDocuments.map((doc: any) => {
                  const sablon = stageSablons.find((s: any) => {
                    const lowerAd = s.ad.toLowerCase();
                    const lowerDocName = doc.belge_adi.toLowerCase();
                    return lowerAd.includes(lowerDocName) ||
                      lowerDocName.includes(lowerAd);
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
                        <p className="text-[11px] text-slate-500 dark:text-slate-450 truncate">
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

                        {/* Dropdown Menu matching user request image */}
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
                            className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 transition-all cursor-pointer border border-slate-200 dark:border-slate-700/60"
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
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-bold cursor-pointer transition-colors"
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
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-bold cursor-pointer transition-colors"
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
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-bold cursor-pointer border-t border-slate-100 dark:border-slate-800/80 mt-1 pt-2 transition-colors"
                              >
                                <Printer className="w-4 h-4 text-slate-500" />
                                Hızlı Yazdır
                              </button>
                            </div>
                          )}
                        </div>
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
        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
          <div className="flex justify-start">
            <button
              onClick={() => setIsFormOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-xl transition-all cursor-pointer shadow-3xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Geri / Listeye Dön
            </button>
          </div>

          {/* İSTEKLİ FİRMALARI YÖNETME ALANI */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-855 dark:text-slate-100 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  Sürece Katılan İstekli Firmalar
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Piyasa araştırması kapsamında davet edilen ve teklif formu
                  dolduran firmaları belirleyin. (En az 3 firma önerilir)
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsEditingFirms(!isEditingFirms)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-bold transition-all h-10 cursor-pointer shadow-2xs hover:shadow-xs",
                    isEditingFirms
                      ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50"
                      : "bg-blue-50/50 hover:bg-blue-100/50 text-blue-750 border-blue-200 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-900/30",
                  )}
                >
                  {isEditingFirms ? "Düzenlemeyi Kapat" : "Firmaları Düzenle"}
                </button>

                {isEditingFirms && (
                  <>
                    <button
                      onClick={() => setIsFirmModalOpen(true)}
                      className="flex items-center gap-2 text-xs bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all h-10 cursor-pointer"
                    >
                      <Building2 className="w-4 h-4" />
                      İstekli Firmalardan Seç
                    </button>

                    <Link
                      to="/firmalar"
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center h-10 cursor-pointer"
                    >
                      Tedarikçi Listesini Yönet
                    </Link>
                  </>
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

          {/* TEKLİF VE BİRİM FİYAT GİRİŞ MATRİSİ */}
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
                handleSaveToDosya={handleSaveToDosya}
                hesaplamaEsasi={hesaplamaEsasi}
                maliyetCetveliTarihi={maliyetCetveliTarihi}
                setMaliyetCetveliTarihi={setMaliyetCetveliTarihi}
                tutanakTarihi={tutanakTarihi}
                setTutanakTarihi={setTutanakTarihi}
              />
            )
            : invitedFirms.length > 0 && items.length === 0
            ? (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 text-left flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-amber-800 dark:text-amber-400">
                    İhtiyaç Kalemi Bulunamadı
                  </h4>
                  <p className="text-xs text-amber-600 dark:text-amber-500/90 mt-1">
                    Teklif fiyat giriş matrisini görüntülemek için bu dosyaya
                    ait ihtiyaç kalemlerinin girilmiş olması gerekir. Lütfen
                    ilgili adımda ihtiyaç listesini tanımlayın.
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
                  <p className="text-xs text-amber-600 dark:text-amber-500/90 mt-1">
                    Lütfen yukarıdaki panelden en az 1 firma seçin veya ekleyin.
                  </p>
                </div>
              </div>
            )}
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
