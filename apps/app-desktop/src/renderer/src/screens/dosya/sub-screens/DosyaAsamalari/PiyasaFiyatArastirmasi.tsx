import React from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  Building2,
  ChevronDown,
  FileText,
  PackageSearch,
  Printer,
} from "lucide-react";
import { SubScreen } from "../../SubScreens.screen";
import { DocumentPreviewModal } from "../../components/DocumentPreviewModal";
import { normalizeForMatch } from "./useDosyaAsamasiSablons";
import { cn } from "../../../../utils/cn";
import { BelgeAksiyonlari } from "../../../../components/ui/BelgeAksiyonlari";
import { DavetEdilenFirmalar } from "./components/DavetEdilenFirmalar";
import { TeklifMatrisi } from "./components/TeklifMatrisi";
import { FirmaSecmeModali } from "./components/FirmaSecmeModali";
import { usePiyasaFiyatArastirmasiLogic } from "./hooks/usePiyasaFiyatArastirmasi";

export function PiyasaFiyatArastirmasi(): React.JSX.Element {
  const logic = usePiyasaFiyatArastirmasiLogic();
  const {
    sablonsContext: {
      ciktiLoading,
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
      isSablonDisabled,
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
    belgeMenuOpen,
    setBelgeMenuOpen,
    dropdownRef,
    selectedPresetId,
    setSelectedPresetId,
    isChangingPreset,
    setIsChangingPreset,
    presets,
    stageSablons,
    filter,
    setManualFilter,
    displaySablons,
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
    teminTarihi,
    setTeminTarihi,
  } = logic;

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
      {/* İSTEKLİ FİRMALARI YÖNETME ALANI */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-855 dark:text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              Sürece Katılan İstekli Firmalar
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Piyasa araştırması kapsamında davet edilen ve teklif formu
              dolduran firmaları belirleyin. (En az 3 firma önerilir)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {stageSablons.length > 0 && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() =>
                    setBelgeMenuOpen((v) =>
                      !v
                    )}
                  disabled={ciktiLoading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed h-10"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-500" />
                  Belgeleri Yazdır
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {belgeMenuOpen && (
                  <div className="absolute right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 w-80 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150 overflow-visible text-left">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1 space-y-2">
                      <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        <span>Bu Aşamanın Belgeleri</span>
                      </div>

                      <div className="flex items-center bg-slate-100 dark:bg-slate-950/40 rounded-lg p-0.5 w-full">
                        <button
                          type="button"
                          onClick={() => setManualFilter("all")}
                          className={cn(
                            "flex-1 py-1 text-[10px] font-extrabold rounded-md transition-colors text-center cursor-pointer",
                            filter === "all"
                              ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-350",
                          )}
                        >
                          Tümü
                        </button>
                        <button
                          type="button"
                          onClick={() => setManualFilter("starred")}
                          className={cn(
                            "flex-1 py-1 text-[10px] font-extrabold rounded-md transition-colors text-center cursor-pointer",
                            filter === "starred"
                              ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-350",
                          )}
                        >
                          Hızlı Erişim / Paket
                        </button>
                      </div>

                      {filter === "starred" && presets.length > 0 && (
                        <div className="relative w-full pt-0.5">
                          {isChangingPreset
                            ? (
                              <select
                                value={selectedPresetId ||
                                  (presets.length > 0 ? presets[0].id : "")}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setSelectedPresetId(val);
                                  localStorage.setItem(
                                    "dta_selected_preset_id",
                                    val,
                                  );
                                  setIsChangingPreset(false);
                                }}
                                onBlur={() => setIsChangingPreset(false)}
                                autoFocus
                                className="w-full bg-slate-55 dark:bg-slate-850 border border-blue-500 dark:border-blue-600 rounded-lg py-1 px-2 text-[10px] font-extrabold text-blue-600 dark:text-blue-400 focus:outline-none cursor-pointer shadow-xs"
                              >
                                {presets.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    📦 {p.name}
                                  </option>
                                ))}
                              </select>
                            )
                            : (
                              <button
                                type="button"
                                onClick={() => setIsChangingPreset(true)}
                                className="w-full flex items-center justify-between bg-blue-50/40 dark:bg-blue-955/10 hover:bg-blue-50 dark:hover:bg-blue-900/25 border border-blue-100 dark:border-blue-900/30 hover:border-blue-200 dark:hover:border-blue-800 text-blue-600 dark:text-blue-400 rounded-lg py-1 px-2.5 text-[10px] font-extrabold transition-all cursor-pointer shadow-2xs"
                              >
                                <span className="truncate">
                                  📦 {presets.find((p) =>
                                    p.id ===
                                      (selectedPresetId ||
                                        (presets.length > 0
                                          ? presets[0].id
                                          : ""))
                                  )?.name || "Paket Seçilmedi"}
                                </span>
                                <ChevronDown className="w-3 h-3 text-blue-400 shrink-0 ml-1" />
                              </button>
                            )}
                        </div>
                      )}
                    </div>

                    {displaySablons.length === 0
                      ? (
                        <div className="px-3 py-4 text-center text-slate-450 dark:text-slate-500 text-xs italic">
                          Listelenecek belge bulunamadı.
                        </div>
                      )
                      : (
                        displaySablons.map((sablon: any) => {
                          let cleanName = sablon.ad;
                          const matchStatus = cleanName.match(
                            /^\[(.*?)\]\s*(.*)$/,
                          );
                          if (matchStatus) cleanName = matchStatus[2].trim();
                          const cleanTitle = cleanName.replace(
                            /\s*\(.*?\)\s*$/,
                            "",
                          ).trim();

                          const isDisabled = ciktiLoading ||
                            (isSablonDisabled && isSablonDisabled(cleanName));
                          const isStarred = activeStarredDocs
                            ? activeStarredDocs.some(
                              (d) =>
                                normalizeForMatch(d) ===
                                  normalizeForMatch(cleanName),
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
                                  handleOpenPreviewForSablon(sablon, sablon.ad);
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
                                    handleOpenPreviewForSablon(
                                      sablon,
                                      sablon.ad,
                                    );
                                    setBelgeMenuOpen(false);
                                  }}
                                  onQuickPrint={() => quickPrint(sablon)}
                                  onExport={(fmt) => quickExport(sablon, fmt)}
                                  onToggleStar={() => toggleStar(cleanName)}
                                  onOpenExternal={() =>
                                    quickOpenExternal(sablon)}
                                  disabled={isDisabled}
                                  docName={cleanName}
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setIsEditingFirms(!isEditingFirms)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-bold transition-all h-10 cursor-pointer shadow-2xs hover:shadow-xs",
                isEditingFirms
                  ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50"
                  : "bg-blue-50/50 hover:bg-blue-100/50 text-blue-750 border-blue-200 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-900/30"
              )}
            >
              {isEditingFirms ? "Düzenlemeyi Kapat" : "Firmaları Düzenle"}
            </button>

            {isEditingFirms && (
              <>
                <button
                  onClick={() => setIsFirmModalOpen(true)}
                  className="flex items-center gap-2 text-xs bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all h-10"
                >
                  <Building2 className="w-4 h-4" />
                  İstekli Firmalardan Seç
                </button>

                <Link
                  to="/firmalar"
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center h-10"
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
            teminTarihi={teminTarihi}
            setTeminTarihi={setTeminTarihi}
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
                Teklif fiyat giriş matrisini görüntülemek için bu dosyaya ait
                ihtiyaç kalemlerinin girilmiş olması gerekir. Lütfen ilgili
                adımda ihtiyaç listesini tanımlayın.
              </p>
            </div>
          </div>
        )
        : null}

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
