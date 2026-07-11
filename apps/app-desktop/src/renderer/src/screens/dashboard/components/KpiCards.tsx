import React from 'react'
import { FileText, TrendingUp, Clock, CheckCircle2, Landmark } from 'lucide-react'
import { cn } from '../../../utils/cn'

interface KpiCardsProps {
  activeDosyaId: number | string | null
  isLoading: boolean
  stats: any
  formatCurrency: (value: number) => string
  isActiveSummaryLoading: boolean
  activeSummary: any
  activeSpentPercent: number
  activeDossierLimit: number
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  activeDosyaId,
  isLoading,
  stats,
  formatCurrency,
  isActiveSummaryLoading,
  activeSummary,
  activeSpentPercent,
  activeDossierLimit
}) => {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4',
        activeDosyaId ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-4'
      )}
    >
      {!activeDosyaId && (
        <>
          {/* Card 1: Total Dossiers (Genel) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-36 group hover:border-blue-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-450 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2.5 py-0.5 rounded-full border border-blue-500/10">
                Genel Metrik
              </span>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                Toplam Temin Dosyası (Genel)
              </div>
              <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 flex items-baseline gap-1">
                {isLoading ? '-' : stats.ihaleDosyaSayisi}{' '}
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Dosya</span>
              </div>
            </div>
          </div>

          {/* Card 2: Total Estimated Volume (Genel) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-36 group hover:border-emerald-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-450 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-0.5 rounded-full border border-emerald-500/10">
                Genel Toplam
              </span>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                Toplam Yaklaşık Maliyet (Genel)
              </div>
              <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                {isLoading ? '-' : formatCurrency(stats.toplamYaklasikMaliyet)}
              </div>
            </div>
          </div>

          {/* Card 3: Active Files (Genel) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-36 group hover:border-cyan-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-450 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/30 px-2.5 py-0.5 rounded-full border border-cyan-500/10">
                Süreçte
              </span>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                Aktif Temin Süreçleri
              </div>
              <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 flex items-baseline gap-1">
                {isLoading ? '-' : stats.aktifDosyaSayisi}{' '}
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Dosya</span>
              </div>
            </div>
          </div>

          {/* Card 4: Completed Files (Genel) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-36 group hover:border-purple-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-450 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 px-2.5 py-0.5 rounded-full border border-purple-500/10">
                Sonuçlanan
              </span>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                Tamamlanan İhaleler
              </div>
              <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 flex items-baseline gap-1">
                {isLoading ? '-' : stats.tamamlananDosyaSayisi}{' '}
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Dosya</span>
              </div>
            </div>
          </div>
        </>
      )}

      {activeDosyaId && (
        <>
          {/* Card 3: Active Dossier Cost (Aktif) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-36 group hover:border-indigo-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-450 flex items-center justify-center shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-0.5 rounded-full border border-indigo-500/10">
                Aktif Dosya
              </span>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                Aktif Dosya Maliyeti
              </div>
              <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 truncate">
                {isActiveSummaryLoading
                  ? 'Yükleniyor...'
                  : activeSummary
                    ? formatCurrency(activeSummary.yaklasikMaliyet)
                    : 'Dosya Seçilmedi'}
              </div>
            </div>
          </div>

          {/* Card 4: Active Dossier KİK Limit Consumption (Aktif) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-36 group hover:border-amber-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-450 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-0.5 rounded-full border border-amber-500/10">
                Yasal Limit Etkisi
              </span>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                Aktif Dosya Limit Tüketim Oranı
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-2xl font-extrabold text-slate-850 dark:text-slate-100">
                  {activeSummary ? `%${activeSpentPercent.toFixed(1)}` : '-%'}
                </span>
                <span className="text-[9px] font-semibold text-slate-400">
                  Limit: {formatCurrency(activeDossierLimit)}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
                <div
                  className="bg-indigo-650 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${activeSummary ? activeSpentPercent : 0}%`
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
