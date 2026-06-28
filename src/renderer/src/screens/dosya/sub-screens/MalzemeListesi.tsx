import React, { useState } from 'react'
import { useWorkspaceStore } from '../../../store/workspaceStore'
import { FileText, Package } from 'lucide-react'
import { SubScreen } from '../SubScreens.screen'
import { useCiktiMerkeziData } from '../CiktiMerkezi.hooks'

import { useMalzemeListesi } from './components/MalzemeListesi/useMalzemeListesi'
import { MalzemeEkleModal } from './components/MalzemeListesi/MalzemeEkleModal'
import { MalzemeTablosu } from './components/MalzemeListesi/MalzemeTablosu'
import { DocumentPreviewModal } from '../components/DocumentPreviewModal'

const normalizeForMatch = (str: string): string => {
  return str
    .toLocaleLowerCase('tr-TR')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/i̇/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '')
}

const BUTTON_COLORS = [
  'bg-violet-600 hover:bg-violet-700',
  'bg-emerald-600 hover:bg-emerald-700',
  'bg-indigo-600 hover:bg-indigo-700',
  'bg-sky-600 hover:bg-sky-700',
  'bg-slate-600 hover:bg-slate-700',
  'bg-blue-600 hover:bg-blue-700',
  'bg-pink-600 hover:bg-pink-700',
  'bg-teal-600 hover:bg-teal-700'
]

export function MalzemeListesi(): React.JSX.Element {
  const { activeDosyaId, activeStarredDocs } = useWorkspaceStore()
  const {
    sablons,
    loading: ciktiLoading,
    masterHtml,
    dosyaContext,
    placeholders
  } = useCiktiMerkeziData(activeDosyaId)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewData, setPreviewData] = useState<{
    title: string
    templateHtml: string
    processPath: string
    templateTestVerisi?: string
  } | null>(null)

  const state = useMalzemeListesi(activeDosyaId)

  const handleOpenPreviewForSablon = (sablon: any, title: string): void => {
    if (!masterHtml) {
      alert('Master şablon yüklenemedi, veriler bekleniyor.')
      return
    }
    setPreviewData({
      title,
      templateHtml: sablon.icerik,
      processPath: sablon.route_path || '',
      templateTestVerisi: sablon.test_verisi || ''
    })
    setPreviewModalOpen(true)
  }



  const executePrint = async (html: string) => {
    await (window as any).electron.ipcRenderer.invoke('print-html', html, { silent: false })
  }

  const executeExportPdf = async (html: string) => {
    await (window as any).electron.ipcRenderer.invoke(
      'export-pdf',
      html,
      null,
      previewData?.title || 'Belge'
    )
  }

  if (previewData && previewModalOpen) {
    return (
      <DocumentPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title={previewData.title}
        templateHtml={previewData.templateHtml}
        masterHtml={masterHtml || ''}
        baseContext={dosyaContext}
        placeholders={placeholders}
        onPrint={executePrint}
        onExportPdf={executeExportPdf}
        isInline={true}
        templateTestVerisi={previewData.templateTestVerisi}
      />
    )
  }

  return (
    <SubScreen
      title="İhtiyaç Listesi"
      icon={Package}
      description="Dosya kapsamındaki malzeme, hizmet veya yapım işi ihtiyaçlarını listeleyin ve yönetin."
    >
      {activeStarredDocs && activeStarredDocs.length > 0 && (
        <div className="flex flex-col items-end mb-6 print:hidden animate-in fade-in duration-300">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
            Kısayol Belgeleri (Hızlı Erişim)
          </span>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {activeStarredDocs.map((docName, idx) => {
              const sablon = sablons.find(
                (s) => normalizeForMatch(s.ad) === normalizeForMatch(docName)
              )
              if (!sablon) return null

              return (
                <button
                  key={docName}
                  onClick={() => handleOpenPreviewForSablon(sablon, docName)}
                  disabled={ciktiLoading}
                  className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50 ${
                    BUTTON_COLORS[idx % BUTTON_COLORS.length]
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  {docName}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <MalzemeEkleModal state={state} />
      <MalzemeTablosu state={state} />
    </SubScreen>
  )
}
