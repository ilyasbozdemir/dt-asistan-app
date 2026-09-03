import React, { useState } from 'react'
import {
  Package,
  Building2,
  TrendingUp,
  ChevronRight,
  Users,
  X
} from 'lucide-react'
import { Popover, PopoverTrigger, PopoverContent } from '../../../components/ui/Popover'
import { useNavigate } from '@tanstack/react-router'
import { useWorkspaceStore } from '../../../store/workspaceStore'
import { useQuery } from '@tanstack/react-query'
import { cn } from '../../../utils/cn'

interface DosyaHizliIcerikPopoverProps {
  dosya: any
  trigger?: React.ReactNode
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
}

interface KalemItem {
  id: number
  sira_no?: number
  kalem_adi?: string
  malzeme_adi?: string
  miktar?: number
  birim?: string
  kdv_orani?: number
  yaklasik_maliyet_birim_fiyat?: number
  tasinir_kodu?: string
  okas_kodu?: string
}

interface FirmaItem {
  id: number
  unvan?: string
  toplam_teklif?: number
  kazanan_mi?: number
}

export function DosyaHizliIcerikPopover({
  dosya,
  trigger,
  align = 'end',
  side = 'bottom'
}: DosyaHizliIcerikPopoverProps): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'malzemeler' | 'firmalar'>('malzemeler')

  const { setActiveDosyaId } = useWorkspaceStore()
  const navigate = useNavigate()

  const { data: kalemler = [], isLoading: isLoadingKalemler } = useQuery<KalemItem[]>({
    queryKey: ['popover_kalemler', dosya?.id],
    queryFn: async () => {
      if (!dosya?.id || !window.electron) return []
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM DATA_TeminKalem WHERE temin_dosya_id = ? OR temin_id = ? ORDER BY COALESCE(sira_no, id) ASC',
        [dosya.id, dosya.id]
      )
      return res?.success && Array.isArray(res.data) ? res.data : []
    },
    enabled: open && !!dosya?.id
  })

  const { data: firmalar = [], isLoading: isLoadingFirmalar } = useQuery<FirmaItem[]>({
    queryKey: ['popover_firmalar', dosya?.id],
    queryFn: async () => {
      if (!dosya?.id || !window.electron) return []
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT tf.*, f.unvan 
         FROM DATA_TeminFirma tf 
         LEFT JOIN TANIM_Firma f ON tf.firma_id = f.id 
         WHERE tf.temin_dosya_id = ? OR tf.temin_id = ?`,
        [dosya.id, dosya.id]
      )
      return res?.success && Array.isArray(res.data) ? res.data : []
    },
    enabled: open && !!dosya?.id
  })

  const isLoading = isLoadingKalemler || isLoadingFirmalar

  const handleOpenDosya = (e: React.MouseEvent): void => {
    e.stopPropagation()
    setOpen(false)
    setActiveDosyaId(dosya.id)
    navigate({ to: '/takip' })
  }

  const formatMoney = (val?: number | null): string => {
    if (!val) return '0,00'
    return Number(val).toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="inline-flex"
        >
          {trigger || (
            <button
              type="button"
              className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-all cursor-pointer group"
              title="Malzeme Listesi ve İçerik Önizleme"
            >
              <Package size={14} className="group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent
        align={align}
        side={side}
        sideOffset={6}
        className="w-96 max-w-[95vw] p-0 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl z-[100] overflow-hidden text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bölümü */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[9px] font-mono font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                {dosya.temin_no || `DT-${dosya.id}`}
              </span>
              {dosya.birim_adi && (
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[150px]">
                  {dosya.birim_adi}
                </span>
              )}
            </div>
            <h4
              className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug"
              title={dosya.konu}
            >
              {dosya.konu}
            </h4>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Tab Butonları */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-3 pt-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('malzemeler')}
            className={cn(
              'pb-2 px-2 font-bold flex items-center gap-1.5 transition-all relative cursor-pointer',
              activeTab === 'malzemeler'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            )}
          >
            <Package size={13} />
            <span>Malzeme & Kalemler ({kalemler.length})</span>
            {activeTab === 'malzemeler' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('firmalar')}
            className={cn(
              'pb-2 px-2 font-bold flex items-center gap-1.5 transition-all relative cursor-pointer',
              activeTab === 'firmalar'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            )}
          >
            <Users size={13} />
            <span>Firmalar ({firmalar.length})</span>
            {activeTab === 'firmalar' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
            )}
          </button>
        </div>

        {/* İçerik Alanı */}
        <div className="max-h-[260px] overflow-y-auto custom-scrollbar p-3">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Veriler yükleniyor...</span>
            </div>
          ) : activeTab === 'malzemeler' ? (
            kalemler.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-1.5">
                <Package size={24} className="text-slate-300 dark:text-slate-600" />
                <span className="font-semibold">Bu dosyada henüz malzeme kalemi bulunmuyor.</span>
                <span className="text-[10px] text-slate-400">
                  Dosya içine girerek kalem ekleyebilirsiniz.
                </span>
              </div>
            ) : (
              <div className="space-y-1.5">
                {kalemler.map((kalem, idx) => (
                  <div
                    key={kalem.id || idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 text-xs hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 flex items-center justify-center text-[10px] font-black shrink-0">
                        {kalem.sira_no || idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate text-[11px]">
                          {kalem.kalem_adi || kalem.malzeme_adi || 'İsimsiz Kalem'}
                        </p>
                        {kalem.tasinir_kodu && (
                          <span className="text-[9px] font-mono text-slate-400">
                            TK: {kalem.tasinir_kodu}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-blue-600 dark:text-blue-400 text-xs font-mono">
                        {kalem.miktar || 1} {kalem.birim || 'Adet'}
                      </span>
                      {kalem.kdv_orani !== undefined && (
                        <span className="block text-[9px] text-slate-400">
                          %{kalem.kdv_orani} KDV
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : firmalar.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-1.5">
              <Users size={24} className="text-slate-300 dark:text-slate-600" />
              <span className="font-semibold">Henüz teklif veren firma eklenmemiş.</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              {firmalar.map((firma, idx) => (
                <div
                  key={firma.id || idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <Building2 size={12} className="text-slate-400 shrink-0" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate text-[11px]">
                      {firma.unvan || `Firma #${firma.id}`}
                    </span>
                  </div>
                  {firma.toplam_teklif ? (
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs shrink-0">
                      ₺{formatMoney(firma.toplam_teklif)}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alt Footer */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1">
            <TrendingUp size={12} className="text-emerald-500" />
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
              ₺{formatMoney(dosya.yaklasik_maliyet)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenDosya}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all cursor-pointer text-xs shadow-xs hover:shadow-md"
          >
            <span>Dosyayı Aç</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
