import React from 'react'
import { Eye, Printer } from 'lucide-react'
import { Kalem, Belge } from '../../types'
import { IlgiliBelgeCubugu } from '../IlgiliBelgeCubugu'

interface MalzemeTabProps {
  kalemler: Kalem[]
  toplamBedel: number
  belgeler: Belge[]
  onPreview: (belge: Belge) => void
  onDosyalariEkle: (files: FileList | null, targetId: number) => void
  onNavigateCiktiMerkezi: () => void
  onSelectTab: (tab: string) => void
}

export const MalzemeTab: React.FC<MalzemeTabProps> = ({
  kalemler,
  toplamBedel,
  belgeler,
  onPreview,
  onDosyalariEkle,
  onNavigateCiktiMerkezi,
  onSelectTab
}) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-955 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            Malzeme Kalemleri ({kalemler.length} Kalem)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Doğrudan temin kapsamında talep edilen malzeme ve hizmet listesi
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              const b = belgeler.find((x) => x.ad === 'Yaklaşık Maliyet Cetveli')
              if (b) onPreview(b)
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl px-3.5 py-2 cursor-pointer transition-colors"
          >
            <Eye size={14} className="text-blue-500" /> Önizle
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl px-3.5 py-2 cursor-pointer transition-colors"
          >
            <Printer size={14} /> Yazdır
          </button>
        </div>
      </div>

      <IlgiliBelgeCubugu
        belgeAdi="Yaklaşık Maliyet Cetveli"
        belgeler={belgeler}
        onPreview={onPreview}
        onDosyalariEkle={onDosyalariEkle}
        onNavigateCiktiMerkezi={onNavigateCiktiMerkezi}
        onSelectTab={onSelectTab}
      />

      <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-900 uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Malzeme Adı</th>
                <th className="px-6 py-3.5">Taşınır Kodu</th>
                <th className="px-6 py-3.5 text-center">Miktar</th>
                <th className="px-6 py-3.5 text-center">Birim Fiyat</th>
                <th className="px-6 py-3.5 text-right">Toplam Bedel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {kalemler.map((kalem, index) => (
                <tr
                  key={kalem.id}
                  className={index % 2 === 0 ? 'bg-white dark:bg-slate-955' : 'bg-slate-50/50 dark:bg-slate-900/30'}
                >
                  <td className="px-6 py-4 text-xs text-slate-900 dark:text-slate-100 font-bold">
                    {kalem.malzemeAdi}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-3 py-1 rounded-lg font-mono text-[11px] font-bold">
                      {kalem.tasinirKodu}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-medium">
                    {kalem.miktar} {kalem.birim}
                  </td>
                  <td className="px-6 py-4 text-center font-medium">
                    {kalem.birimFiyat.toLocaleString('tr-TR')} ₺
                  </td>
                  <td className="px-6 py-4 font-black text-right text-slate-900 dark:text-slate-100">
                    {kalem.toplamBedel.toLocaleString('tr-TR')} ₺
                  </td>
                </tr>
              ))}
              <tr className="bg-blue-50/60 dark:bg-blue-950/30 border-t-2 border-slate-200 dark:border-slate-800 font-bold">
                <td colSpan={4} className="px-6 py-4 text-right text-slate-800 dark:text-slate-200 font-extrabold uppercase">
                  TOPLAM BEDEL:
                </td>
                <td className="px-6 py-4 text-right text-blue-600 dark:text-blue-400 text-base font-black">
                  {toplamBedel.toLocaleString('tr-TR')} ₺
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
