import React from 'react'
import { Package } from 'lucide-react'
import { SubScreen } from '../../SubScreens.screen'
import { DocumentPreviewModal } from '../../components/DocumentPreviewModal'
import { normalizeForMatch, useDosyaAsamasiSablons } from './useDosyaAsamasiSablons'
import { SurecBelgeleriPanel } from './SablonPanelleri'
import { useMalzemeListesi } from '../components/MalzemeListesi/useMalzemeListesi'
import { MalzemeEkleModal } from '../components/MalzemeListesi/MalzemeEkleModal'
import { MalzemeTablosu } from '../components/MalzemeListesi/MalzemeTablosu'

export function HazirlikVeIhtiyac(): React.JSX.Element {
  const {
    activeDosyaId,
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

  const state = useMalzemeListesi(activeDosyaId)

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
    (s) =>
      s.kategori === '1-ihtiyac-tespiti-ve-baslangic' ||
      s.kategori === '1. İhtiyaç Tespiti & Başlangıç'
  )

  return (
    <SubScreen
      title="Hazırlık ve İhtiyaç"
      icon={Package}
      description="Dosyanıza malzeme, hizmet veya yapım işi ekleyebilir ve yönetebilirsiniz. Son Alım Fiyat Cetveli şablonu sayesinde, malzemelerin son alım fiyatları, kimden/hangi firmadan alındığı gibi geçmiş analiz verileri otomatik olarak listelenir."
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

      <MalzemeEkleModal state={state} />
      <MalzemeTablosu state={state} />
    </SubScreen>
  )
}
