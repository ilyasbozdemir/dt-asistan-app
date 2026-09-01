import React from "react";
import {
  ArrowLeft,
  Download,
  Eye,
  FileText,
  Maximize2,
  Minimize2,
  MoreVertical,
  Printer,
  RefreshCw,
  Save,
  Sliders,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

interface DocumentPreviewHeaderProps {
  onClose: () => void;
  documentTitle?: string;
  zoomMode: "auto" | "manual";
  manualZoom: number;
  previewScale: number;
  setZoomMode: (mode: "auto" | "manual") => void;
  setManualZoom: React.Dispatch<React.SetStateAction<number>>;
  isFullScreen: boolean;
  setIsFullScreen: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSaving: boolean;
  saveSuccess: boolean;
  handleSaveToDb: () => Promise<void>;
  isPrinting: boolean;
  handlePrint: () => Promise<void>;
  downloadOpen: boolean;
  setDownloadOpen: React.Dispatch<React.SetStateAction<boolean>>;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  handleRefreshFromDb: () => Promise<void>;
  handlePdf: () => Promise<void>;
  handleOpenPdfInNewTab: () => Promise<void>;
}

export function DocumentPreviewHeader({
  onClose,
  documentTitle,
  zoomMode,
  manualZoom,
  previewScale,
  setZoomMode,
  setManualZoom,
  isFullScreen,
  setIsFullScreen,
  sidebarOpen,
  setSidebarOpen,
  isSaving,
  saveSuccess,
  handleSaveToDb,
  isPrinting,
  handlePrint,
  downloadOpen,
  setDownloadOpen,
  dropdownRef,
  handleRefreshFromDb,
  handlePdf,
  handleOpenPdfInNewTab,
}: DocumentPreviewHeaderProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 gap-4 shrink-0 select-none">
      {/* Left: Back Button & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200 dark:border-slate-700 shrink-0"
          title="İşlemler ve İhtiyaç Listesi Ekranına Dön"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>İşlemlere Dön</span>
        </button>

        <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
          <FileText className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2 truncate">
            {documentTitle || "Belge Düzenleyici"}
          </h2>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Zoom Controls */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl p-0.5">
          <button
            onClick={() => {
              setZoomMode("manual");
              setManualZoom((prev) =>
                Math.max(0.4, Number((prev - 0.1).toFixed(1)))
              );
            }}
            className="p-1 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
            title="Uzaklaştır (%10)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setZoomMode("auto");
              setManualZoom(1.0);
            }}
            className="px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer min-w-[55px] text-center"
            title="Otomatik Sığdır (Sıfırla)"
          >
            {zoomMode === "auto"
              ? `% ${Math.round(previewScale * 100)}`
              : `% ${Math.round(manualZoom * 100)}`}
          </button>

          <button
            onClick={() => {
              setZoomMode("manual");
              setManualZoom((prev) =>
                Math.min(2.0, Number((prev + 0.1).toFixed(1)))
              );
            }}
            className="p-1 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
            title="Yakınlaştır (%10)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Toggle Full Screen */}
        <button
          onClick={() => setIsFullScreen((v) => !v)}
          className={`p-1.5 rounded-xl font-bold transition-all flex items-center justify-center text-xs cursor-pointer border ${
            isFullScreen
              ? "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800"
              : "bg-white text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800 hover:bg-slate-50"
          }`}
          title={isFullScreen ? "Tam Ekrandan Çık" : "Tam Ekran Önizleme"}
        >
          {isFullScreen
            ? <Minimize2 className="w-4 h-4" />
            : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Toggle Sidebar */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 text-xs cursor-pointer border ${
            sidebarOpen
              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800"
              : "bg-white text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800 hover:bg-slate-50"
          }`}
          title={sidebarOpen
            ? "Belge Ayarlarını Gizle"
            : "Belge Ayarlarını Göster"}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{sidebarOpen ? "Ayarlar Açık" : "Belge Ayarları"}</span>
        </button>

        {/* Save Button */}
        <button
          onClick={handleSaveToDb}
          disabled={isSaving}
          className={`px-4 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 text-xs cursor-pointer shadow-2xs ${
            saveSuccess
              ? "bg-emerald-600 text-white"
              : "bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600"
          }`}
        >
          <Save className="w-3.5 h-3.5" />
          <span>
            {saveSuccess
              ? "Kaydedildi!"
              : isSaving
              ? "Kaydediliyor..."
              : "Kaydet"}
          </span>
        </button>

        {/* Print Button */}
        <button
          onClick={handlePrint}
          disabled={isPrinting}
          className="px-4.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 text-xs shadow-2xs shadow-blue-600/20 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Yazdır</span>
        </button>

        <button
          onClick={async () => {
            setDownloadOpen(false);
            await handleOpenPdfInNewTab();
          }}
          className="px-4.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 text-xs shadow-2xs shadow-indigo-600/20 cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          <span>Tarayıcıda Aç</span>
        </button>

        {/* Options Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDownloadOpen((v) => !v)}
            disabled={isPrinting}
            title="Diğer Seçenekler"
            className="p-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all flex items-center justify-center disabled:opacity-50 text-xs shadow-2xs cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {downloadOpen && (
            <div className="absolute top-full mt-2 right-0 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
              <button
                onClick={async () => {
                  setDownloadOpen(false);
                  await handleRefreshFromDb();
                }}
                className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2.5 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Güncel Verileri Al</span>
              </button>

              <button
                onClick={async () => {
                  setDownloadOpen(false);
                  await handlePdf();
                }}
                className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2.5 cursor-pointer transition-colors border-t border-slate-100 dark:border-slate-800/50"
              >
                <Download className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>PDF Olarak Kaydet</span>
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
