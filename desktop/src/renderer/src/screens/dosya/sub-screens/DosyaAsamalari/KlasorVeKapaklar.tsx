import React from 'react'
import { FolderTree } from 'lucide-react'
import { SubScreen } from '../../SubScreens.screen'
import { DocumentPreviewModal } from '../../components/DocumentPreviewModal'
import { useDosyaAsamasiSablons } from './useDosyaAsamasiSablons'
import { SurecBelgeleriPanel } from './SablonPanelleri'

export function KlasorVeKapaklar(): React.JSX.Element {
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
    (s) => s.kategori === '5-klasor-ve-kapaklar' || s.kategori === '5. Klasör & Kapaklar'
  )

  return (
    <SubScreen
      title="Klasör & Kapaklar"
      icon={FolderTree}
      description="Klasör sırtlıkları ve kapak hazırlama süreçlerini yönetin."
    >
      <SurecBelgeleriPanel
        stageSablons={stageSablons}
        activeStarredDocs={activeStarredDocs}
        ciktiLoading={ciktiLoading}
        onSablonClick={handleOpenPreviewForSablon}
        isSablonDisabled={isSablonDisabled}
      />
    </SubScreen>
  )
}
