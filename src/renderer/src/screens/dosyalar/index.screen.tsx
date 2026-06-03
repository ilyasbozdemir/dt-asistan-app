import React, { useState, useEffect } from 'react'
import { useDosyalarHooks } from './dosyalar.hooks'
import { useTabStore } from '../../store/tabStore'
import { useRouterState, useNavigate } from '@tanstack/react-router'
import {
  Search,
  Plus,
  FileText,
  ChevronRight,
  Trash2,
  Edit,
  Calendar,
  Grid,
  List,
  ExternalLink
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { useWorkspaceStore } from '../../store/workspaceStore'

export default function DosyalarScreen(): React.ReactNode {
  const { dosyalar, isLoadingDosyalar, deleteDosya } = useDosyalarHooks()
  const { activeDosyaId, setActiveDosyaId } = useWorkspaceStore()
  const { updateTabLabel } = useTabStore()
  const routerState = useRouterState()
  const navigate = useNavigate()

  const searchParams = new URLSearchParams(window.location.search)
  const isWindowMode = searchParams.get('mode') === 'window'
  const urlId = searchParams.get('id')

  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')

  const fileId = urlId ? parseInt(urlId, 10) : activeDosyaId
  const selectedDosya = dosyalar.find((d) => d.id === fileId)

  // Dynamically update the tab label with the active file's topic
  useEffect(() => {
    if (isWindowMode) return
    const currentHref = routerState.location.href
    if (selectedDosya) {
      updateTabLabel(currentHref, `DT: ${selectedDosya.konu}`)
    } else {
      updateTabLabel(currentHref, 'Doğrudan Temin')
    }
  }, [selectedDosya, routerState.location.href, updateTabLabel, isWindowMode])

  const handleOpenInNewWindow = () => {
    if (!selectedDosya) return
    window.electron?.ipcRenderer.send('window:open-secondary', {
      path: '/dosyalar',
      search: `?id=${selectedDosya.id}&mode=window`,
      title: `DT: ${selectedDosya.konu}`
    })
  }

  const handleDelete = async (id: number): Promise<void> => {
    if (confirm('Bu dosyayı silmek istediğinize emin misiniz?')) {
      await deleteDosya(id)
      if (activeDosyaId === id) setActiveDosyaId(null)
    }
  }

  const filteredDosyalar = dosyalar.filter(
    (d) =>
      (d.konu || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.temin_no || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 p-4 md:p-6 overflow-hidden">
      {/* ÜST BAR */}
      <div className="flex-none flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-850 dark:text-white flex items-center gap-2">
            <FileText className="text-blue-600" size={24} />
            Doğrudan Temin İhale Dosyaları
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            İhale süreçlerinizi başlatın, tekliflerinizi ve yaklaşık maliyetlerinizi takip edin.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* ARAMA */}
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Dosya ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-60 pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* VIEW SWITCHER */}
          <div className="flex bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('card')}
              className={cn(
                'p-1.5 rounded-lg transition-colors cursor-pointer',
                viewMode === 'card'
                  ? 'bg-slate-100 dark:bg-slate-800 text-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              )}
              title="Kart Görünümü"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'p-1.5 rounded-lg transition-colors cursor-pointer',
                viewMode === 'table'
                  ? 'bg-slate-100 dark:bg-slate-800 text-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              )}
              title="Tablo Görünümü"
            >
              <List size={16} />
            </button>
          </div>

          {/* YENİ EKLE BUTONU */}
          <button
            onClick={() => navigate({ to: '/dosyalar/yeni' })}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus size={16} />
            Yeni Temin Dosyası Ekle
          </button>
        </div>
      </div>

      {/* İÇERİK - İKİ SÜTUN YAPI */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 mt-6 overflow-hidden">
        {/* SOL TARAF: LİSTE VEYA KARTLAR */}
        <div className="w-full lg:w-3/5 xl:w-2/3 flex flex-col h-full overflow-hidden">
          {isLoadingDosyalar ? (
            <div className="flex-1 flex items-center justify-center text-sm text-slate-500 italic">Dosyalar yükleniyor...</div>
          ) : filteredDosyalar.length === 0 ? (
            <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Temin Dosyası Bulunamadı</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Arama kriterlerinize uyan veya kayıtlı herhangi bir doğrudan temin dosyası bulunmamaktadır.
              </p>
              <button
                onClick={() => navigate({ to: '/dosyalar/yeni' })}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Yeni Temin Dosyası Ekle
              </button>
            </div>
          ) : viewMode === 'card' ? (
            /* KART GÖRÜNÜMÜ */
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
              {filteredDosyalar.map((dosya) => (
                <div
                  key={dosya.id}
                  onClick={() => setActiveDosyaId(dosya.id)}
                  className={cn(
                    'p-5 bg-white dark:bg-slate-900 border rounded-2xl cursor-pointer hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden',
                    activeDosyaId === dosya.id
                      ? 'border-blue-600 dark:border-blue-800 ring-1 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  )}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {dosya.temin_no || 'NO BELİRSİZ'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {dosya.tur === 'mal' ? 'Mal' : dosya.tur === 'hizmet' ? 'Hizmet' : dosya.tur === 'yapim_isi' ? 'Yapım' : 'Danışmanlık'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                      {dosya.konu} {dosya.tekrar_no && dosya.tekrar_no > 1 ? `(${dosya.tekrar_no})` : ''}
                    </h3>

                    {/* Zengin Bilgi Kartı Orta Bölüm */}
                    <div className="mt-2.5 space-y-2">
                      {dosya.birim_adi && (
                        <div className="text-[10px] font-semibold text-blue-650 dark:text-blue-400 truncate bg-blue-50/50 dark:bg-blue-955/25 px-2 py-1 rounded-lg border border-blue-100/35 dark:border-blue-900/20 w-fit">
                          🏢 {dosya.birim_adi}
                        </div>
                      )}

                      {dosya.isin_aciklamasi && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed bg-slate-50/30 dark:bg-slate-900/30 p-1.5 rounded-lg border border-slate-100/50 dark:border-slate-850/40">
                          {dosya.isin_aciklamasi}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {dosya.ihale_sekli && (
                          <span className="px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-650 dark:text-purple-400 text-[9px] font-bold border border-purple-100/20">
                            Madde: {dosya.ihale_sekli}
                          </span>
                        )}
                        {dosya.butce_kodu && (
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-mono font-medium border border-slate-200/20" title={dosya.butce_kodu}>
                            ABS: {dosya.butce_kodu.split('-').pop()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      ₺ {dosya.yaklasik_maliyet ? dosya.yaklasik_maliyet.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '0.00'}
                    </span>
                    <span className="text-slate-400 text-[10px] flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(dosya.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>

                  {activeDosyaId === dosya.id && (
                    <div className="absolute top-0 right-0 w-2 h-2 bg-blue-600 rounded-bl-lg" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* TABLO GÖRÜNÜMÜ */
            <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 z-10">
                    <tr>
                      <th className="p-3.5 pl-5">Dosya No</th>
                      <th className="p-3.5">İhale Konusu (İşin Adı)</th>
                      <th className="p-3.5">Tür</th>
                      <th className="p-3.5 text-right">Yaklaşık Maliyet</th>
                      <th className="p-3.5 text-center">Tarih</th>
                      <th className="p-3.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredDosyalar.map((dosya) => (
                      <tr
                        key={dosya.id}
                        onClick={() => setActiveDosyaId(dosya.id)}
                        className={cn(
                          'hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors',
                          activeDosyaId === dosya.id && 'bg-blue-50/30 dark:bg-blue-900/10'
                        )}
                      >
                        <td className="p-3.5 pl-5 font-mono font-bold text-slate-500">
                          {dosya.temin_no || '-'}
                        </td>
                        <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200 max-w-xs truncate" title={dosya.konu}>
                          {dosya.konu} {dosya.tekrar_no && dosya.tekrar_no > 1 ? `(${dosya.tekrar_no})` : ''}
                        </td>
                        <td className="p-3.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                            {dosya.tur}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          ₺ {dosya.yaklasik_maliyet ? dosya.yaklasik_maliyet.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '0.00'}
                        </td>
                        <td className="p-3.5 text-center text-slate-450">
                          {new Date(dosya.created_at).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="p-3.5 text-right pr-5">
                          <ChevronRight size={16} className="text-slate-400" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* SAĞ TARAF: DETAY PANELİ (ÖNİZLEME) */}
        <div className="w-full lg:w-2/5 xl:w-1/3 flex flex-col h-full">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between h-full shadow-sm overflow-y-auto custom-scrollbar">
            {!selectedDosya ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-800/80">
                  <FileText size={28} className="text-slate-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-350">Dosya Seçilmedi</h3>
                <p className="text-[11px] text-slate-500 max-w-xs mt-1.5">
                  İşlem yapmak, detaylarını incelemek veya düzenlemek istediğiniz ihale dosyasını soldaki listeden seçin.
                </p>
              </div>
            ) : (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-0.5">
                        AKTİF İHALE DOSYASI
                      </span>
                      <h2 className="text-base font-bold text-slate-850 dark:text-white leading-tight line-clamp-2" title={selectedDosya.konu}>
                        {selectedDosya.konu} {selectedDosya.tekrar_no && selectedDosya.tekrar_no > 1 ? `(${selectedDosya.tekrar_no})` : ''}
                      </h2>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4 text-xs">
                    {/* BÜTÇE KODU */}
                    <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-850">
                      <span className="text-slate-550 dark:text-slate-450 font-medium">Bütçe Kodu:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {selectedDosya.butce_kodu || '-'}
                      </span>
                    </div>

                    {/* LİMİT / MADDE */}
                    <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-850">
                      <span className="text-slate-550 dark:text-slate-450 font-medium">DT Maddesi (Şekli):</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {selectedDosya.ihale_sekli || '-'}
                      </span>
                    </div>

                    {/* SÖZLEŞME TURU */}
                    <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-850">
                      <span className="text-slate-550 dark:text-slate-450 font-medium">Sözleşme Türü:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {selectedDosya.teklif_sozlesme_turu || '-'}
                      </span>
                    </div>

                    {/* YAKLAŞIK MALİYET */}
                    <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-850">
                      <span className="text-slate-550 dark:text-slate-455 font-medium">Yaklaşık Maliyet:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-450 font-mono">
                        ₺ {selectedDosya.yaklasik_maliyet ? selectedDosya.yaklasik_maliyet.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '0.00'}
                      </span>
                    </div>

                    {/* TALEP NO / TARİH */}
                    <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-850">
                      <span className="text-slate-550 dark:text-slate-450 font-medium">Talep Sayı / Tarih:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {selectedDosya.talep_sayisi || '-'} {selectedDosya.talep_tarihi ? `(${new Date(selectedDosya.talep_tarihi).toLocaleDateString('tr-TR')})` : ''}
                      </span>
                    </div>
                  </div>

                  {selectedDosya.isin_aciklamasi && (
                    <div className="mt-5 p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-2xl">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">İŞİN TANIMI / KAPSAMI</span>
                      <p className="text-[11px] text-slate-655 dark:text-slate-350 leading-relaxed line-clamp-3">
                        {selectedDosya.isin_aciklamasi}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => navigate({ to: `/dosyalar/yeni?id=${selectedDosya.id}` })}
                      className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit size={14} />
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(selectedDosya.id)}
                      className="px-4 py-2.5 border border-red-200 dark:border-red-950/20 hover:bg-red-50 dark:hover:bg-red-955/10 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 size={14} />
                      Sil
                    </button>
                  </div>

                  {!isWindowMode && (
                    <button
                      onClick={handleOpenInNewWindow}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-750 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink size={14} />
                      Yeni Pencerede Aç
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
