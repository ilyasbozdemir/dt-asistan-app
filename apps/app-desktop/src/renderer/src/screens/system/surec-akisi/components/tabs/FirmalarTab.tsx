import React from 'react'
import { Eye, PlusCircle, Building2 } from 'lucide-react'
import { FirmaItem, Belge } from '../../types'
import { getFirmaStatusBadge, getFirmaStatusLabel } from '../../utils/helpers'
import { IlgiliBelgeCubugu } from '../IlgiliBelgeCubugu'

interface FirmalarTabProps {
  firmalar: FirmaItem[]
  belgeler: Belge[]
  onPreview: (belge: Belge) => void
  onDosyalariEkle: (files: FileList | null, targetId: number) => void
  onNavigateFirmalar: () => void
  onNavigateCiktiMerkezi: () => void
  onSelectTab: (tab: string) => void
}

export const FirmalarTab: React.FC<FirmalarTabProps> = ({
  firmalar,
  belgeler,
  onPreview,
  onDosyalariEkle,
  onNavigateFirmalar,
  onNavigateCiktiMerkezi,
  onSelectTab
}) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-955 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            İstekli Firmaları Yönet ({firmalar.length} Firma)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Bu dosya için davet edilen ve teklif veren firmalar
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              const b = belgeler.find((x) => x.ad === 'Piyasa Araştırması Tutanağı')
              if (b) onPreview(b)
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl px-3.5 py-2 cursor-pointer transition-colors"
          >
            <Eye size={14} className="text-blue-500" /> Tutanağı Önizle
          </button>
          <button
            onClick={onNavigateFirmalar}
            className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2 cursor-pointer transition-colors"
          >
            <PlusCircle size={16} /> Firma Yönetimi
          </button>
        </div>
      </div>

      <IlgiliBelgeCubugu
        belgeAdi="Piyasa Araştırması Tutanağı"
        belgeler={belgeler}
        onPreview={onPreview}
        onDosyalariEkle={onDosyalariEkle}
        onNavigateCiktiMerkezi={onNavigateCiktiMerkezi}
        onSelectTab={onSelectTab}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {firmalar.map((firma) => (
          <div
            key={firma.id}
            className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-shadow space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-950/50 rounded-2xl p-3 text-blue-600 dark:text-blue-400">
                <Building2 size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                  {firma.unvan}
                </h3>
                <span
                  className={`inline-block text-[10px] px-2.5 py-0.5 rounded-lg border font-bold mt-1.5 ${getFirmaStatusBadge(
                    firma.durumu
                  )}`}
                >
                  {getFirmaStatusLabel(firma.durumu)}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-100 dark:border-slate-850 pt-4 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span className="text-slate-400">Telefon</span>
                <span className="font-semibold">{firma.telefon}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span className="text-slate-400">E-Posta</span>
                <span className="font-semibold truncate max-w-[150px]">{firma.email}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span className="text-slate-400">Davet Tarihi</span>
                <span className="font-semibold">{firma.davetTarihi}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span className="text-slate-400">Teklif Tarihi</span>
                <span className="font-semibold">{firma.teklifTarihi || '—'}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-850">
                <span className="text-slate-500 font-bold">Teklif Bedeli</span>
                <span className="text-slate-900 dark:text-slate-100 font-black">
                  {firma.teklifBedeli ? `${firma.teklifBedeli.toLocaleString('tr-TR')} ₺` : '—'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
