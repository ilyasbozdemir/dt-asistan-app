import React from "react";
import { DocumentPreviewModalV2Props } from "./types";
import { useDocumentPreviewData } from "./hooks/useDocumentPreviewData";
import { DocumentPreviewHeader } from "./components/DocumentPreviewHeader";
import { DocumentPreviewSidebar } from "./components/DocumentPreviewSidebar";
import { DocumentPreviewCanvas } from "./components/DocumentPreviewCanvas";

export function DocumentPreviewModalV2({
  isOpen,
  documentId,
  dosyaId: propDosyaId,
  invitedFirms: propInvitedFirms,
  onClose,
  isModal = false,
}: DocumentPreviewModalV2Props): React.JSX.Element | null {
  const {
    isLoading,
    activeTemplateConf,
    ActiveComponent,
    formData,
    setFormData,
    personelListesi,
    firmaListesi,
    localShowLogoLeft,
    setLocalShowLogoLeft,
    localShowLogoRight,
    setLocalShowLogoRight,
    orientation,
    setOrientation,
    isEditingMode,
    setIsEditingMode,
    previewScale,
    isPrinting,
    isSaving,
    saveSuccess,
    downloadOpen,
    setDownloadOpen,
    sidebarOpen,
    setSidebarOpen,
    zoomMode,
    setZoomMode,
    manualZoom,
    setManualZoom,
    isFullScreen,
    setIsFullScreen,
    previewContainerRef,
    dropdownRef,
    handleSaveToDb,
    handlePrint,
    handlePdf,
    handleOpenPdfInNewTab,
    handleRefreshFromDb,
  } = useDocumentPreviewData({
    isOpen,
    documentId,
    dosyaId: propDosyaId,
    invitedFirms: propInvitedFirms,
  });

  if (!isOpen) return null;

  const mainContent = (
    <div
      className={isFullScreen
        ? "fixed inset-0 z-50 w-screen h-screen max-w-none max-h-none rounded-none border-none shadow-none flex flex-col bg-white dark:bg-slate-900 overflow-hidden animate-in fade-in duration-150"
        : isModal
        ? "bg-white dark:bg-slate-900 w-full max-w-[95vw] h-[95vh] rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden"
        : "bg-white dark:bg-slate-900 w-full h-full min-h-[85vh] rounded-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"}
      onClick={(e) => (isModal || isFullScreen) && e.stopPropagation()}
    >
      {/* Header Bar */}
      <DocumentPreviewHeader
        onClose={onClose}
        documentTitle={activeTemplateConf?.name.replace(/([A-Z])/g, " $1")
          .trim()}
        zoomMode={zoomMode}
        manualZoom={manualZoom}
        previewScale={previewScale}
        setZoomMode={setZoomMode}
        setManualZoom={setManualZoom}
        isFullScreen={isFullScreen}
        setIsFullScreen={setIsFullScreen}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isSaving={isSaving}
        saveSuccess={saveSuccess}
        handleSaveToDb={handleSaveToDb}
        isPrinting={isPrinting}
        handlePrint={handlePrint}
        downloadOpen={downloadOpen}
        setDownloadOpen={setDownloadOpen}
        dropdownRef={dropdownRef}
        handleRefreshFromDb={handleRefreshFromDb}
        handlePdf={handlePdf}
        handleOpenPdfInNewTab={handleOpenPdfInNewTab}
      />

      {/* Main Area: Sidebar + Canvas */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        <DocumentPreviewSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isEditingMode={isEditingMode}
          setIsEditingMode={setIsEditingMode}
          orientation={orientation}
          setOrientation={setOrientation}
          formData={formData}
          setFormData={setFormData}
          localShowLogoLeft={localShowLogoLeft}
          setLocalShowLogoLeft={setLocalShowLogoLeft}
          localShowLogoRight={localShowLogoRight}
          setLocalShowLogoRight={setLocalShowLogoRight}
        />

        <DocumentPreviewCanvas
          isLoading={isLoading}
          previewContainerRef={previewContainerRef}
          previewScale={previewScale}
          orientation={orientation}
          ActiveComponent={ActiveComponent}
          isEditingMode={isEditingMode}
          formData={formData}
          setFormData={setFormData}
          personelListesi={personelListesi}
          firmaListesi={firmaListesi}
          localShowLogoLeft={localShowLogoLeft}
          localShowLogoRight={localShowLogoRight}
        />
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        {mainContent}
      </div>
    );
  }

  return mainContent;
}

export default DocumentPreviewModalV2;
