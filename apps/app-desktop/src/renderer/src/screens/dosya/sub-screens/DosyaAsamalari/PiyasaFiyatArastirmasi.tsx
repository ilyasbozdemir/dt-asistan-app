import React, { useState } from "react";
import { PackageSearch } from "lucide-react";
import { SubScreen } from "../../SubScreens.screen";
import { DocumentPreviewModal } from "../../components/DocumentPreviewModal";
import { normalizeForMatch } from "./useDosyaAsamasiSablons";
import { FirmaSecmeModali } from "./components/FirmaSecmeModali";
import { PiyasaFiyatArastirmasiDashboard } from "./components/PiyasaFiyatArastirmasiDashboard";
import { PiyasaFiyatArastirmasiForm } from "./components/PiyasaFiyatArastirmasiForm";
import { usePiyasaFiyatArastirmasiLogic } from "./hooks/usePiyasaFiyatArastirmasi";
import { useSettingsStore } from "../../../../store/settingsStore";

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
    setIsEditingFirms,
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
    belgeleriKaydet,
    setBelgeleriKaydet,
    handleUpdateDocumentDate,
  } = logic;

  const [activeFormTab, setActiveFormTab] = useState<"firms" | "matrix">(() => {
    return invitedFirms.length > 0 ? "matrix" : "firms";
  });
  const [activeActionDropdown, setActiveActionDropdown] = useState<
    string | null
  >(null);
  const [isFormFullscreen, setIsFormFullscreen] = useState<boolean>(false);
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
      {!isFormOpen && (
        <PiyasaFiyatArastirmasiDashboard
          setIsFormOpen={setIsFormOpen}
          setActiveFormTab={setActiveFormTab}
          dashboardViewMode={dashboardViewMode}
          setDashboardViewMode={setDashboardViewMode}
          docViewMode={docViewMode}
          changeDocViewMode={changeDocViewMode}
          activeActionDropdown={activeActionDropdown}
          setActiveActionDropdown={setActiveActionDropdown}
          stageDocs={stageDocs}
          stageSablons={stageSablons}
          disableDocumentGuidance={disableDocumentGuidance}
          invitedFirms={invitedFirms}
          items={items}
          bids={bids}
          sablons={sablons}
          activeStarredDocs={activeStarredDocs}
          ciktiLoading={ciktiLoading}
          handleOpenPreviewForSablon={handleOpenPreviewForSablon}
          quickPrint={quickPrint}
          quickExport={quickExport}
          quickOpenExternal={quickOpenExternal}
          isSablonDisabled={isSablonDisabled}
          handleUpdateDocumentDate={handleUpdateDocumentDate}
        />
      )}

      {isFormOpen && (
        <PiyasaFiyatArastirmasiForm
          setIsFormOpen={setIsFormOpen}
          activeFormTab={activeFormTab}
          setActiveFormTab={setActiveFormTab}
          hesaplamaEsasi={hesaplamaEsasi}
          invitedFirms={invitedFirms}
          items={items}
          bids={bids}
          getEstimatedCostTotal={getEstimatedCostTotal}
          handleSaveToDosya={handleSaveToDosya}
          maliyetCetveliTarihi={maliyetCetveliTarihi}
          setMaliyetCetveliTarihi={setMaliyetCetveliTarihi}
          tutanakTarihi={tutanakTarihi}
          setTutanakTarihi={setTutanakTarihi}
          syncTutanak={syncTutanak}
          setSyncTutanak={setSyncTutanak}
          setLowestFirmAsWinner={setLowestFirmAsWinner}
          setSetLowestFirmAsWinner={setSetLowestFirmAsWinner}
          manualWinnerFirmaId={manualWinnerFirmaId}
          setManualWinnerFirmaId={setManualWinnerFirmaId}
          belgeleriKaydet={belgeleriKaydet}
          setBelgeleriKaydet={setBelgeleriKaydet}
          isEditingFirms={isEditingFirms}
          setIsEditingFirms={setIsEditingFirms}
          setIsFirmModalOpen={setIsFirmModalOpen}
          lowestTotalFirmaId={lowestTotalFirmaId}
          handleRemoveFirm={handleRemoveFirm}
          getLowestBidInfo={getLowestBidInfo}
          getAverageBid={getAverageBid}
          handlePriceChange={handlePriceChange}
          isFormFullscreen={isFormFullscreen}
        />
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
