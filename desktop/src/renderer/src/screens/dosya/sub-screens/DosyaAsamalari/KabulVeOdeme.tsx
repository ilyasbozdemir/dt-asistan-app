import React from 'react'
import { CreditCard } from 'lucide-react'
import { SubScreen } from '../../SubScreens.screen'
import { DocumentPreviewModal } from '../../components/DocumentPreviewModal'
import { useDosyaAsamasiSablons, normalizeForMatch } from './useDosyaAsamasiSablons'
import { SurecBelgeleriPanel } from './SablonPanelleri'

export function KabulVeOdeme(): React.JSX.Element {
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
      ? activeStarredDocs.some((d) => normalizeForMatch(d) === normalizeForMatch(previewData.title || ''))
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
    (s) =>
      s.kategori === '4-kabul-ve-odeme-islemleri' || s.kategori === '4. Kabul & Ödeme İşlemleri'
  )

  return (
    <SubScreen
      title="Kabul & Ödeme İşlemleri"
      icon={CreditCard}
      description="Muayene kabul tutanağı, hakediş raporu, taşınır işlem fişi (TİF) ve ödeme emri belgesi gibi evrakları düzenleyebilir, kabul ve ödeme süreçlerinizi tamamlayabilirsiniz."
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

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Bu süreç henüz tasarım aşamasındadır.
        </p>
      </div>
    </SubScreen>
  )
}
