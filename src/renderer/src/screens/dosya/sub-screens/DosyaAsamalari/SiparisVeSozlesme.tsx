import React from 'react'
import { FileCheck } from 'lucide-react'
import { SubScreen } from '../../SubScreens.screen'
import { DocumentPreviewModal } from '../../components/DocumentPreviewModal'
import { useDosyaAsamasiSablons } from './useDosyaAsamasiSablons'
import { SurecBelgeleriPanel } from './SablonPanelleri'

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
    refreshSnapshot,
    saveSnapshot,
    isSablonDisabled
  } = useDosyaAsamasiSablons()

  if (previewData && previewModalOpen) {
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
        isInline={true}
        templateTestVerisi={previewData.templateTestVerisi}
        dosyaAdi={previewData.dosyaAdi}
        onRefreshSnapshot={refreshSnapshot}
        onSaveSnapshot={saveSnapshot}
      />
    )
  }

  const stageSablons = sablons.filter(
    (s) => s.kategori === '3-siparis-ve-sozlesme' || s.kategori === '3. Sipariş & Sözleşme'
  )

  return (
    <SubScreen
      title="Sipariş & Sözleşme"
      icon={FileCheck}
      description="Sipariş ve sözleşme süreçlerini yönetin."
    >
      <SurecBelgeleriPanel
        stageSablons={stageSablons}
        activeStarredDocs={activeStarredDocs}
        ciktiLoading={ciktiLoading}


        onSablonClick={handleOpenPreviewForSablon}
        isSablonDisabled={isSablonDisabled}
      />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Bu süreç henüz tasarım aşamasındadır.
        </p>
      </div>
    </SubScreen>
  )
}
