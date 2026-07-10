import React from 'react'
import { FolderTree } from 'lucide-react'
import { SubScreen } from '../../SubScreens.screen'
import { DocumentPreviewModal } from '../../components/DocumentPreviewModal'
import { useDosyaAsamasiSablons, normalizeForMatch } from './useDosyaAsamasiSablons'
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

  const stageSablons = sablons.filter(
    (s) => s.kategori === '5-klasor-ve-kapaklar' || s.kategori === '5. Klasör & Kapaklar'
  )

  return (
    <SubScreen
      title="Klasör & Kapaklar"
      icon={FolderTree}
      description="İhale kapağı, kapak içi indeks şablonu ve farklı boyutlardaki (3cm, 5cm, 7.5cm) klasör sırtlıklarını hızlıca oluşturup fiziksel arşiv dosyalarınızı hazırlayabilirsiniz."
    >
      <SurecBelgeleriPanel
        stageSablons={stageSablons}
        activeStarredDocs={activeStarredDocs}
        ciktiLoading={ciktiLoading}
        onSablonClick={handleOpenPreviewForSablon}
        onQuickPrint={quickPrint}
        onExport={quickExport}
        onToggleStar={toggleStar}
        onOpenExternal={quickOpenExternal}
        isSablonDisabled={isSablonDisabled}
      />
    </SubScreen>
  )
}
