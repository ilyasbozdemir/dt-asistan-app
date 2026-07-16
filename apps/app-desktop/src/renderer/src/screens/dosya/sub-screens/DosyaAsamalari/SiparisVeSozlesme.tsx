import React from 'react'
import { FileCheck } from 'lucide-react'
import { SubScreen } from '../../SubScreens.screen'
import { DocumentPreviewModal } from '../../components/DocumentPreviewModal'
import { useDosyaAsamasiSablons, normalizeForMatch } from './useDosyaAsamasiSablons'
import { PrintDropdownButton } from '../../components/PrintDropdownButton'
import { useSettingsStore } from '../../../../store/settingsStore'

export function SiparisVeSozlesme(): React.JSX.Element {
  const {
    activeStarredDocs,
    sablons,
    ciktiLoading,
    masterHtml,
    dosyaContext,
    placeholders,
    contextsByPath,
    personelListesi,
    previewModalOpen,
    setPreviewModalOpen,
    previewData,
    handleOpenPreviewForSablon,
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
    isSablonDisabled
  } = useDosyaAsamasiSablons()

  const { disableDocumentGuidance } = useSettingsStore()

  if (previewData && previewModalOpen) {
    const isStarred = previewData?.title
      ? activeStarredDocs.some(
          (d) => normalizeForMatch(d) === normalizeForMatch(previewData.title || '')
        )
      : false

    return (
      <DocumentPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title={previewData.title}
        templateHtml={previewData.templateHtml}
        masterHtml={masterHtml || ''}
        baseContext={
          previewData.snapshotContext || contextsByPath[previewData.processPath] || dosyaContext
        }
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
    )
  }

  return (
    <SubScreen
      title="Sipariş & Sözleşme"
      icon={FileCheck}
      description="Doğrudan temin onay belgesi, ihale komisyon kararı ve sözleşmeye davet gibi dökümanları hazırlayabilir, doğrudan temin sözleşme süreçlerinizi bu panelden yönetebilirsiniz."
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-600" />
              Sözleşme Süreç Yönetimi
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Doğrudan temin sözleşme ve sipariş işlemlerini bu panelden takip edebilirsiniz.
            </p>
          </div>
          {!disableDocumentGuidance && (
            <div>
              <PrintDropdownButton
                kategori="3-siparis-ve-sozlesme"
                sablons={sablons}
                activeStarredDocs={activeStarredDocs}
                ciktiLoading={ciktiLoading}
                handleOpenPreviewForSablon={handleOpenPreviewForSablon}
                quickPrint={quickPrint}
                quickExport={quickExport}
                quickOpenExternal={quickOpenExternal}
                isSablonDisabled={isSablonDisabled}
                buttonHeightClass="h-10"
              />
            </div>
          )}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 italic">
          Bu süreç henüz tasarım aşamasındadır.
        </p>
      </div>
    </SubScreen>
  )
}
