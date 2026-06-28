import React, { useState } from 'react'
import { useWorkspaceStore } from '../../../store/workspaceStore'
import { FileText, Package, Printer } from 'lucide-react'
import { SubScreen } from '../SubScreens.screen'
import { useCiktiMerkeziData } from '../CiktiMerkezi.hooks'
import { useQuery } from '@tanstack/react-query'

import { useMalzemeListesi } from './components/MalzemeListesi/useMalzemeListesi'
import { MalzemeEkleModal } from './components/MalzemeListesi/MalzemeEkleModal'
import { MalzemeTablosu } from './components/MalzemeListesi/MalzemeTablosu'
import { DocumentPreviewModal } from '../components/DocumentPreviewModal'

export function MalzemeListesi(): React.JSX.Element {
  const { activeDosyaId } = useWorkspaceStore()
  const {
    sablons,
    loading: ciktiLoading,
    masterHtml,
    dosyaContext,
    placeholders,
    activeDosya
  } = useCiktiMerkeziData(activeDosyaId)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewData, setPreviewData] = useState<{
    title: string
    templateHtml: string
    processPath: string
    templateTestVerisi?: string
  } | null>(null)

  // Fetch Alım Türü configs from DB
  const { data: dbAlimTurleri = [] } = useQuery<any[]>({
    queryKey: ['alim_turleri_list'],
    queryFn: async () => {
      const res = await (window as any).electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_AlimTuru WHERE aktif_mi = 1'
      )
      if (!res.success) return []
      return res.data.map((d: any) => {
        let parsedBelgeler = []
        try {
          parsedBelgeler =
            typeof d.belgeler === 'string' ? JSON.parse(d.belgeler) : d.belgeler || []
        } catch (e) {
          console.error(e)
        }
        return {
          id: d.id.toString(),
          ad: d.ad,
          ikon: d.ikon,
          belgeler: parsedBelgeler,
          sablonId: d.sablon_id || ''
        }
      })
    }
  })

  const activeAlimTuru = activeDosya
    ? dbAlimTurleri.find((t) => {
        const fileTur = activeDosya.tur?.toLowerCase()
        const dbTur = t.ad?.toLowerCase() || ''
        if (fileTur === 'mal' && dbTur.includes('mal')) return true
        if (fileTur === 'hizmet' && dbTur.includes('hizmet')) return true
        if (fileTur === 'yapim_isi' && (dbTur.includes('yapım') || dbTur.includes('yapim')))
          return true
        if (
          fileTur === 'danismanlik' &&
          (dbTur.includes('danışmanlık') || dbTur.includes('danismanlik'))
        )
          return true
        return dbTur === fileTur
      })
    : null

  const documentPathMapping: Record<string, string[]> = {
    '/dosya/komisyon/fiyat-arastirma': ['Piyasa Fiyat Araştırması Tutanağı'],
    '/dosya/komisyon/muayene-kabul': [
      'Muayene Kabul ve Tespit Komisyonu Tutanağı',
      'Hizmet İşleri Kabul Tutanağı',
      'Yapım İşleri Kabul Tutanağı'
    ],
    '/dosya/komisyon/fiyat-muayene': [
      'Piyasa Fiyat Araştırması Tutanağı',
      'Muayene Kabul ve Tespit Komisyonu Tutanağı'
    ],
    '/dosya/komisyon/onay-eki': ['Onay Belgesi'],
    '/dosya/luzum/belge': ['Onay Belgesi'],
    '/dosya/luzum/onay-eki': ['Onay Belgesi'],
    '/dosya/luzum/teslim-tesellum': [
      'Muayene Kabul ve Tespit Komisyonu Tutanağı',
      'Hizmet İşleri Kabul Tutanağı',
      'Yapım İşleri Kabul Tutanağı'
    ],
    '/dosya/firmalar-maliyet/istekliler': ['Piyasa Fiyat Araştırması Tutanağı'],
    '/dosya/firmalar-maliyet/yaklasik': [
      'Yaklaşık Maliyet Hesap Cetveli',
      'Piyasa Fiyat Araştırması Tutanağı'
    ],
    '/dosya/firmalar-maliyet/tutanak': ['Piyasa Fiyat Araştırması Tutanağı'],
    '/dosya/onay/dt-onay': ['Onay Belgesi'],
    '/dosya/onay/ihale-onay': ['Onay Belgesi'],
    '/dosya/onay/butce-sorgu': ['Onay Belgesi'],
    '/dosya/harcama/talimat': ['Onay Belgesi', 'Fatura / e-Arşiv Fatura'],
    '/dosya/harcama/pusula': ['Fatura / e-Arşiv Fatura']
  }

  const isDocVisible = (path: string) => {
    if (!activeAlimTuru) return true
    const reqDocs = documentPathMapping[path]
    if (!reqDocs) return true
    return reqDocs.some((docName) =>
      activeAlimTuru.belgeler.some((b: any) => {
        const documentName = typeof b === 'string' ? b : b?.ad || ''
        return (
          documentName.toLowerCase().includes(docName.toLowerCase()) ||
          docName.toLowerCase().includes(documentName.toLowerCase())
        )
      })
    )
  }

  const state = useMalzemeListesi(activeDosyaId)

  const handleOpenPreview = async (processPath: string, title: string) => {
    try {
      const settingsRes = await (window as any).electron.ipcRenderer.invoke('db:get-settings')
      const sablonIdStr = settingsRes ? settingsRes[`MAPPING_${processPath}_SABLON_ID`] : null

      if (!sablonIdStr) {
        alert(`Lütfen Şablon & Kategori Yönetimi bölümünden '${title}' için bir şablon bağlayınız.`)
        return
      }

      const selectedSablon = sablons.find((s) => s.id.toString() === sablonIdStr)
      if (!selectedSablon) {
        alert(
          'Bağlı şablon bulunamadı veya silinmiş. Lütfen Şablon & Kategori Yönetimi bölümünden kontrol ediniz.'
        )
        return
      }

      if (!masterHtml) {
        alert('Master şablon yüklenemedi, veriler bekleniyor.')
        return
      }

      setPreviewData({
        title,
        templateHtml: selectedSablon.icerik,
        processPath,
        templateTestVerisi: selectedSablon.test_verisi || ''
      })
      setPreviewModalOpen(true)
    } catch (error: any) {
      alert('Önizleme yüklenirken bir hata oluştu: ' + error.message)
    }
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
      <div className="flex flex-col items-end mb-4 print:hidden">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
          DOSYAYA EKLENEN İHTİYAÇ MALZEMELERİ
        </span>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {isDocVisible('/dosya/malzemeler/son-alim') && (
            <button
              onClick={() => handleOpenPreview('/dosya/malzemeler/son-alim', 'Son Alım Fiyat Cetveli')}
              disabled={ciktiLoading}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              Son Alım Fiyat Cetveli
            </button>
          )}
          {isDocVisible('/dosya/luzum/talep-formu') && (
            <button
              onClick={() => handleOpenPreview('/dosya/luzum/talep-formu', 'İhtiyaç Talep Formu')}
              disabled={ciktiLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              İhtiyaç Talep Formu
            </button>
          )}
          {isDocVisible('/dosya/luzum/belge') && (
            <button
              onClick={() => handleOpenPreview('/dosya/luzum/belge', 'Lüzum Müzekkeresi Belgesi')}
              disabled={ciktiLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              Lüzum Müzekkeresi Belgesi
            </button>
          )}
          {isDocVisible('/dosya/luzum/onay-eki') && (
            <button
              onClick={() => handleOpenPreview('/dosya/luzum/onay-eki', 'Onay Eki')}
              disabled={ciktiLoading}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              Onay Eki
            </button>
          )}
          {isDocVisible('/dosya/onay/butce-sorgu') && (
            <button
              onClick={() => handleOpenPreview('/dosya/onay/butce-sorgu', 'Bütçe Sorgusu')}
              disabled={ciktiLoading}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              Bütçe Sorgusu
            </button>
          )}
          {isDocVisible('/dosya/malzemeler/liste') && (
            <button
              onClick={() => handleOpenPreview('/dosya/malzemeler/liste', 'İhtiyaç Listesi')}
              disabled={ciktiLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              İhtiyaç Listesi
            </button>
          )}
        </div>
      </div>

      <MalzemeEkleModal state={state} />
      <MalzemeTablosu state={state} />
    </SubScreen>
  )
}
