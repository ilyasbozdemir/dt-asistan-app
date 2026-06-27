import React, { useState, useMemo, useCallback } from 'react'
import { SubScreen } from './SubScreens.screen'
import { Printer, Download, FileText, CheckSquare, Square, Layers, Loader2, Star, AlertCircle, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react'
import { useWorkspaceStore } from '../../store/workspaceStore'
import Mustache from 'mustache'
import { Sablon } from '../sablonlar/sablonlar.hooks'
import { useCiktiMerkeziData } from './CiktiMerkezi.hooks'
import { useDocumentLogger } from '../../hooks/useDocumentLogger'

export function CiktiMerkeziScreen(): React.JSX.Element {
  const { activeDosyaId, activeStarredDocs, setActiveStarredDocs } = useWorkspaceStore()
  const { sablons, loading, masterHtml, dosyaContext, activeDosya } = useCiktiMerkeziData(activeDosyaId)
  const { logDocument } = useDocumentLogger()
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [processing, setProcessing] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // localStarredDocs artık global store'dan geliyor; DB'deki starred_docs ile sync
  React.useEffect(() => {
    if (activeDosya?.starred_docs) {
      try {
        const docs = JSON.parse(activeDosya.starred_docs)
        setActiveStarredDocs(docs)
      } catch (_e) {
        setActiveStarredDocs([])
      }
    } else {
      setActiveStarredDocs([])
    }
  }, [activeDosya?.starred_docs, setActiveStarredDocs])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      if (activeDosyaId) {
        const res = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT starred_docs FROM DATA_TeminDosyasi WHERE id = ?',
          [activeDosyaId]
        )
        if (res.success && res.data.length > 0) {
          try {
            const docs = JSON.parse(res.data[0].starred_docs || '[]')
            setActiveStarredDocs(docs)
          } catch (_e) { /* noop */ }
        }
      }
    } finally {
      setRefreshing(false)
    }
  }, [activeDosyaId, setActiveStarredDocs])

  const toggleCategory = (kategori: string) => {
    const newSet = new Set(expandedCategories)
    if (newSet.has(kategori)) {
      newSet.delete(kategori)
    } else {
      newSet.add(kategori)
    }
    setExpandedCategories(newSet)
  }

  const toggleAllCategories = () => {
    const allCats = Object.keys(groupedSablons)
    const allExpanded = allCats.every(cat => expandedCategories.has(cat))
    if (allExpanded) {
      setExpandedCategories(new Set())
    } else {
      setExpandedCategories(new Set(allCats))
    }
  }

  const toggleStar = async (sablonAd: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!activeDosyaId) return
    let newDocs = [...activeStarredDocs]
    if (newDocs.includes(sablonAd)) {
      newDocs = newDocs.filter(d => d !== sablonAd)
    } else {
      newDocs.push(sablonAd)
    }
    setActiveStarredDocs(newDocs)  // Instantly update global store
    await window.electron.ipcRenderer.invoke(
      'db:execute',
      'UPDATE DATA_TeminDosyasi SET starred_docs = ? WHERE id = ?',
      JSON.stringify(newDocs),
      activeDosyaId
    )
  }

  const groupedSablons = useMemo(() => {
    const groups: Record<string, Sablon[]> = {}
    sablons.forEach(s => {
      const cat = s.kategori || 'Diğer'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(s)
    })
    return groups
  }, [sablons])

  const toggleGroup = (cat: string) => {
    const groupIds = groupedSablons[cat].map((s) => s.id)
    const validIds = groupIds.filter((id) => !getMissingRequirement(sablons.find((s) => s.id === id)!))
    const allSelected = validIds.every((id) => selectedIds.has(id))
    const newSet = new Set(selectedIds)
    
    if (allSelected) {
      validIds.forEach((id) => newSet.delete(id))
    } else {
      validIds.forEach((id) => newSet.add(id))
    }
    setSelectedIds(newSet)
  }

  const getMissingRequirement = (sablon: Sablon): string | null => {
    if (!sablon) return null
    if (sablon.icerik.includes('{{#kalemler}}') && (!dosyaContext.kalemler || dosyaContext.kalemler.length === 0)) {
      return 'İhtiyaç listesinde (malzeme kalemi) tanımlanmamış.'
    }
    if (sablon.icerik.includes('{{#firmalar}}') && (!dosyaContext.firmalar || dosyaContext.firmalar.length === 0)) {
      return 'Dosyaya yüklenici/davetli firma eklenmemiş.'
    }
    if (sablon.icerik.includes('{{#komisyon_uyeleri}}') && (!dosyaContext.komisyon_uyeleri || dosyaContext.komisyon_uyeleri.length === 0)) {
      return 'İlgili komisyon üyeleri belirlenmemiş.'
    }
    return null
  }

  const toggleSelect = (id: number) => {
    const sablon = sablons.find(s => s.id === id)
    if (sablon && getMissingRequirement(sablon)) return // Block selection if missing requirement

    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const renderHtml = (sablon: Sablon) => {
    try {
      if (!masterHtml) return sablon.icerik
      
      let templateContext = { ...dosyaContext }
      if (sablon.test_verisi) {
        try {
          const parsedTest = JSON.parse(sablon.test_verisi)
          templateContext = { ...parsedTest, ...templateContext }
        } catch (e) {
          console.error('Şablon test verisi ayrıştırılamadı:', e)
        }
      }
      
      const renderedContent = Mustache.render(sablon.icerik, templateContext)
      templateContext.icerik = renderedContent
      return Mustache.render(masterHtml, templateContext)
    } catch (error) {
      console.error('Template render hatası:', error)
      return sablon.icerik
    }
  }

  const handleAction = async (action: 'pdf' | 'udf' | 'docx' | 'print') => {
    if (selectedIds.size === 0) {
      alert('Lütfen en az bir belge seçin.')
      return
    }

    setProcessing(true)
    try {
      const selectedSablons = sablons.filter(s => selectedIds.has(s.id))

      for (const sablon of selectedSablons) {
        const html = renderHtml(sablon)
        const safeName = sablon.ad.replace(/[^a-z0-9]/gi, '_').toLowerCase()

        if (action === 'pdf') {
          await window.electron.ipcRenderer.invoke('export-pdf', html, null, `${safeName}_${activeDosyaId}`)
          await logDocument(sablon.ad, `${safeName}_${activeDosyaId}.pdf`)
        } else if (action === 'udf') {
          await window.electron.ipcRenderer.invoke('export-udf', html, `${safeName}_${activeDosyaId}`)
          await logDocument(sablon.ad, `${safeName}_${activeDosyaId}.udf`)
        } else if (action === 'docx') {
          await window.electron.ipcRenderer.invoke('export-docx', html, `${safeName}_${activeDosyaId}`)
          await logDocument(sablon.ad, `${safeName}_${activeDosyaId}.docx`)
        } else if (action === 'print') {
          await window.electron.ipcRenderer.invoke('print-html', html, { silent: true }) // Silent true for batch printing
          await logDocument(sablon.ad, 'Yazdırıldı')
        }
      }

      if (action === 'print') {
        alert('Belgeler başarıyla yazdırma kuyruğuna gönderildi.')
      } else {
        alert('Belgeler başarıyla oluşturuldu ve kaydedildi.')
      }
    } catch (error: any) {
      alert(`İşlem sırasında hata oluştu: ${error.message}`)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <SubScreen
      title="Çıktı & Yazdırma Merkezi"
      icon={Printer}
      description="Dosya gereksinimlerine uygun resmi evrakların tek merkezden toplu üretimi ve yazdırılması."
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col md:flex-row min-h-[500px] mt-4 overflow-hidden">
        
        {/* SOL: BELGE LİSTESİ */}
        <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-500" />
              Dosya Belgeleri
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-slate-600 dark:text-slate-400 font-semibold">
                {selectedIds.size} Seçili
              </span>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-all"
                title="Hızlı Erişim listesini yenile"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={toggleAllCategories}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-all text-xs font-bold flex items-center gap-1"
                title="Tüm Grupları Aç / Kapat"
              >
                {Object.keys(groupedSablons).every(cat => expandedCategories.has(cat)) ? 'Hepsini Kapat' : 'Hepsini Aç'}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
              
              {/* HIZLI ERİŞİM BÖLÜMÜ */}
              {activeStarredDocs.length > 0 && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/10 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl p-4 shadow-sm mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <h3 className="text-sm font-bold text-amber-900 dark:text-amber-500">Hızlı Erişim Belgeleri</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {activeStarredDocs.map((doc, idx) => {
                      const sablon = sablons.find(s => s.ad === doc)
                      const missingMsg = sablon ? getMissingRequirement(sablon) : null
                      const isPrintable = !!sablon
                      
                      return (
                        <div 
                          key={idx}
                          onClick={() => {
                            if (isPrintable) toggleSelect(sablon.id)
                          }}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                            !isPrintable
                              ? 'bg-slate-50 border-slate-200 cursor-default dark:bg-slate-900/50 dark:border-slate-800'
                              : missingMsg 
                                ? 'bg-white/40 border-amber-200/50 opacity-70 cursor-not-allowed dark:bg-slate-900/50 dark:border-amber-900/30'
                                : selectedIds.has(sablon.id)
                                  ? 'bg-amber-100/50 border-amber-300 text-amber-900 cursor-pointer dark:bg-amber-900/30 dark:border-amber-700/50 dark:text-amber-300'
                                  : 'bg-white/80 border-amber-200/60 text-slate-700 cursor-pointer hover:border-amber-400 dark:bg-slate-900/80 dark:border-amber-800/40 dark:text-slate-300'
                          }`}
                        >
                          <div className="shrink-0">
                            {!isPrintable ? (
                              <FileText className="w-4 h-4 text-slate-400" />
                            ) : missingMsg ? (
                              <span title={missingMsg ?? undefined}>
                                <AlertCircle className="w-4 h-4 text-rose-500" />
                              </span>
                            ) : selectedIds.has(sablon.id) ? (
                              <CheckSquare className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0" title={missingMsg || doc}>
                            <p className={`text-[11px] font-bold truncate ${missingMsg ? 'text-slate-500 line-through' : ''}`}>
                              {doc}
                              {!isPrintable && <span className="text-[9px] font-normal text-slate-400 ml-2">(Sadece Ekran)</span>}
                            </p>
                          </div>
                          <button
                            onClick={(e) => toggleStar(doc, e)}
                            className="shrink-0 p-1 text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-lg transition-colors"
                            title="Hızlı Erişimden Çıkar"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {Object.entries(groupedSablons).map(([kategori, items]) => {
                const isExpanded = expandedCategories.has(kategori)
                return (
                  <div key={kategori} className="space-y-2">
                    <div 
                      className="flex items-center justify-between px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors"
                      onClick={() => toggleCategory(kategori)}
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleGroup(kategori)
                          }}
                          className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          {items.filter((i) => !getMissingRequirement(i)).every(i => selectedIds.has(i.id)) ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{kategori}</h4>
                      </div>
                      <div>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                    {items.map((sablon) => {
                      const missingMsg = getMissingRequirement(sablon)
                      const isStarred = activeStarredDocs.includes(sablon.ad)
                      
                      return (
                      <div 
                        key={sablon.id}
                        onClick={() => toggleSelect(sablon.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          missingMsg 
                            ? 'bg-slate-50 border-slate-200 opacity-70 cursor-not-allowed dark:bg-slate-900 dark:border-slate-800'
                            : selectedIds.has(sablon.id)
                              ? 'bg-blue-50/50 border-blue-200 text-blue-800 cursor-pointer dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-300'
                              : 'bg-white border-slate-200 text-slate-700 cursor-pointer hover:border-blue-300 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="shrink-0">
                          {missingMsg ? (
                            <span title={missingMsg ?? undefined}>
                              <AlertCircle className="w-4 h-4 text-rose-500" />
                            </span>
                          ) : selectedIds.has(sablon.id) ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0" title={missingMsg || sablon.ad}>
                          <p className={`text-xs font-bold truncate ${missingMsg ? 'text-slate-500 line-through' : ''}`}>{sablon.ad}</p>
                          <p className="text-[10px] text-slate-500 truncate" title={sablon.dosya_adi}>{sablon.dosya_adi}</p>
                        </div>
                        <button
                          onClick={(e) => toggleStar(sablon.ad, e)}
                          className={`shrink-0 p-1.5 rounded-lg transition-colors ${
                            isStarred 
                              ? 'text-amber-500 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40' 
                              : 'text-slate-300 hover:text-amber-500 hover:bg-slate-100 dark:text-slate-600 dark:hover:bg-slate-800'
                          }`}
                          title={isStarred ? "Hızlı Erişimden Çıkar" : "Hızlı Erişime Ekle"}
                        >
                          <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-500' : ''}`} />
                        </button>
                      </div>
                    )})}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* SAĞ: İŞLEM MENÜSÜ */}
        <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-900/50 p-6 flex flex-col gap-4">
          <div className="mb-2">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Toplu İşlemler</h3>
            <p className="text-[11px] text-slate-500">Seçtiğiniz {selectedIds.size} belge için uygulamak istediğiniz işlemi seçin.</p>
          </div>

          <button
            onClick={() => handleAction('print')}
            disabled={processing || selectedIds.size === 0}
            className="w-full flex items-center gap-3 p-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-slate-900/10 cursor-pointer"
          >
            <Printer className="w-5 h-5 text-slate-300" />
            <div className="text-left flex-1">
              <div className="text-sm font-bold">Sırayla Yazdır</div>
              <div className="text-[10px] text-slate-400">Varsayılan yazıcıya gönderilir</div>
            </div>
          </button>

          <div className="h-px bg-slate-200 dark:bg-slate-800 my-2"></div>

          <button
            onClick={() => handleAction('pdf')}
            disabled={processing || selectedIds.size === 0}
            className="w-full flex items-center gap-3 p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-900 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div className="text-left flex-1">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">PDF Olarak İndir</div>
              <div className="text-[9px] text-slate-500">Orijinal sayfa yapısıyla</div>
            </div>
          </button>

          <button
            onClick={() => handleAction('docx')}
            disabled={processing || selectedIds.size === 0}
            className="w-full flex items-center gap-3 p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-900 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="text-left flex-1">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">ODF / DOCX İndir</div>
              <div className="text-[9px] text-slate-500">Düzenlenebilir ofis belgesi</div>
            </div>
          </button>

          <button
            onClick={() => handleAction('udf')}
            disabled={processing || selectedIds.size === 0}
            className="w-full flex items-center gap-3 p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-900 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div className="text-left flex-1">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">UDF İndir</div>
              <div className="text-[9px] text-slate-500">UYAP formatında (Salt metin)</div>
            </div>
          </button>

        </div>
      </div>
    </SubScreen>
  )
}
