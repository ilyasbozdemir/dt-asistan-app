import React, { useRef, useState, useEffect } from 'react'
import { ChevronDown, FileCheck, FileText, Printer } from 'lucide-react'
import { SubScreen } from '../../SubScreens.screen'
import { DocumentPreviewModal } from '../../components/DocumentPreviewModal'
import { useDosyaAsamasiSablons, normalizeForMatch } from './useDosyaAsamasiSablons'
import { cn } from '../../../../utils/cn'
import { BelgeAksiyonlari } from '../../../../components/ui/BelgeAksiyonlari'

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

  const [belgeMenuOpen, setBelgeMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [selectedPresetId, setSelectedPresetId] = useState<string>(() => {
    try {
      return localStorage.getItem('dta_selected_preset_id') || ''
    } catch {
      return ''
    }
  })
  const [isChangingPreset, setIsChangingPreset] = useState(false)
  const [presets, setPresets] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('dta_document_presets')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    const handlePresetsChange = () => {
      try {
        const saved = localStorage.getItem('dta_document_presets')
        setPresets(saved ? JSON.parse(saved) : [])
      } catch (e) {
        console.error(e)
      }
    }
    window.addEventListener('dta_presets_changed', handlePresetsChange)
    return () => window.removeEventListener('dta_presets_changed', handlePresetsChange)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setBelgeMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const stageSablons = React.useMemo(() => {
    return sablons.filter(
      (s) => s.kategori === '3-siparis-ve-sozlesme' || s.kategori === '3. Sipariş & Sözleşme'
    )
  }, [sablons])

  function getCleanName(ad: string): string {
    let clean = ad
    const matchStatus = clean.match(/^\[(.*?)\]\s*(.*)$/)
    if (matchStatus) clean = matchStatus[2].trim()
    return clean
  }

  const starredDocsForFilter = React.useMemo(() => {
    const activePresetId = selectedPresetId || (presets.length > 0 ? presets[0].id : '')
    if (activePresetId) {
      const preset = presets.find((p) => p.id === activePresetId)
      return preset ? preset.docs : []
    }
    return activeStarredDocs || []
  }, [selectedPresetId, presets, activeStarredDocs])

  const hasStarred = React.useMemo(() => {
    return stageSablons.some((sablon) => {
      const cleanName = getCleanName(sablon.ad)
      return starredDocsForFilter.some((d) =>
        normalizeForMatch(d) === normalizeForMatch(cleanName)
      )
    })
  }, [stageSablons, starredDocsForFilter])

  const [manualFilter, setManualFilter] = useState<'all' | 'starred' | null>(null)

  const filter = manualFilter !== null ? manualFilter : (hasStarred ? 'starred' : 'all')

  const displaySablons = React.useMemo(() => {
    if (filter === 'starred') {
      return stageSablons.filter((sablon) => {
        const cleanName = getCleanName(sablon.ad)
        return starredDocsForFilter.some(
          (d) => normalizeForMatch(d) === normalizeForMatch(cleanName)
        )
      })
    }
    return stageSablons
  }, [filter, starredDocsForFilter, stageSablons])

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
          <div>
            {stageSablons.length > 0 && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setBelgeMenuOpen((v) => !v)}
                  disabled={ciktiLoading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-55 hover:bg-slate-100 text-slate-705 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed h-10"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-500" />
                  Belgeleri Yazdır
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {belgeMenuOpen && (
                  <div className="absolute right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 w-80 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150 overflow-visible text-left">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1 space-y-2">
                      <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        <span>Bu Aşamanın Belgeleri</span>
                      </div>

                      <div className="flex items-center bg-slate-100 dark:bg-slate-950/40 rounded-lg p-0.5 w-full">
                        <button
                          type="button"
                          onClick={() => setManualFilter('all')}
                          className={cn(
                            'flex-1 py-1 text-[10px] font-extrabold rounded-md transition-colors text-center cursor-pointer',
                            filter === 'all'
                              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-355'
                          )}
                        >
                          Tümü
                        </button>
                        <button
                          type="button"
                          onClick={() => setManualFilter('starred')}
                          className={cn(
                            'flex-1 py-1 text-[10px] font-extrabold rounded-md transition-colors text-center cursor-pointer',
                            filter === 'starred'
                              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-355'
                          )}
                        >
                          Hızlı Erişim / Paket
                        </button>
                      </div>

                      {filter === 'starred' && presets.length > 0 && (
                        <div className="relative w-full pt-0.5">
                          {isChangingPreset ? (
                            <select
                              value={selectedPresetId || (presets.length > 0 ? presets[0].id : '')}
                              onChange={(e) => {
                                const val = e.target.value
                                setSelectedPresetId(val)
                                localStorage.setItem('dta_selected_preset_id', val)
                                setIsChangingPreset(false)
                              }}
                              onBlur={() => setIsChangingPreset(false)}
                              autoFocus
                              className="w-full bg-slate-55 dark:bg-slate-850 border border-blue-500 dark:border-blue-600 rounded-lg py-1 px-2 text-[10px] font-extrabold text-blue-600 dark:text-blue-400 focus:outline-none cursor-pointer shadow-xs"
                            >
                              {presets.map((p) => (
                                <option key={p.id} value={p.id}>
                                  📦 {p.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setIsChangingPreset(true)}
                              className="w-full flex items-center justify-between bg-blue-50/40 dark:bg-blue-955/10 hover:bg-blue-50 dark:hover:bg-blue-900/25 border border-blue-100 dark:border-blue-900/30 hover:border-blue-200 dark:hover:border-blue-800 text-blue-600 dark:text-blue-400 rounded-lg py-1 px-2.5 text-[10px] font-extrabold transition-all cursor-pointer shadow-2xs"
                            >
                              <span className="truncate">📦 {presets.find((p) => p.id === (selectedPresetId || (presets.length > 0 ? presets[0].id : '')))?.name || 'Paket Seçilmedi'}</span>
                              <ChevronDown className="w-3 h-3 text-blue-400 shrink-0 ml-1" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {displaySablons.length === 0 ? (
                      <div className="px-3 py-4 text-center text-slate-450 dark:text-slate-500 text-xs italic">
                        Listelenecek belge bulunamadı.
                      </div>
                    ) : (
                      displaySablons.map((sablon: any) => {
                        let cleanName = sablon.ad
                        const matchStatus = cleanName.match(/^\[(.*?)\]\s*(.*)$/)
                        if (matchStatus) cleanName = matchStatus[2].trim()
                        const cleanTitle = cleanName.replace(/\s*\(.*?\)\s*$/, '').trim()

                        const isDisabled = ciktiLoading || (isSablonDisabled && isSablonDisabled(cleanName))

                        return (
                          <div
                            key={sablon.id || sablon.ad}
                            className="w-full flex items-center justify-between px-3 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors gap-2"
                          >
                            <button
                              disabled={isDisabled}
                              onClick={() => {
                                handleOpenPreviewForSablon(sablon, sablon.ad)
                                setBelgeMenuOpen(false)
                              }}
                              className="flex-1 text-left text-xs text-slate-700 dark:text-slate-300 font-semibold transition-colors cursor-pointer flex items-center gap-2 truncate disabled:opacity-50 disabled:cursor-not-allowed hover:text-blue-650 dark:hover:text-blue-400"
                            >
                              <FileText className="w-3.5 h-3.5 text-slate-450 dark:text-slate-500 shrink-0" />
                              <span className="truncate">{cleanTitle}</span>
                            </button>

                            <div className="shrink-0">
                              <BelgeAksiyonlari
                                onPreview={() => {
                                  handleOpenPreviewForSablon(sablon, sablon.ad)
                                  setBelgeMenuOpen(false)
                                }}
                                onQuickPrint={() => quickPrint(sablon)}
                                onExport={(fmt) => quickExport(sablon, fmt)}
                                onOpenExternal={() => quickOpenExternal(sablon)}
                                disabled={isDisabled}
                                docName={cleanName}
                              />
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 italic">
          Bu süreç henüz tasarım aşamasındadır.
        </p>
      </div>
    </SubScreen>
  )
}
