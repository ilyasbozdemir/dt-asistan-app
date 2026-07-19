import React from 'react'
import { Link } from '@tanstack/react-router'
import {
  CheckCircle,
  FileText,
  FolderOpen,
  ListTodo,
  PlusCircle,
  ShoppingCart,
  Target
} from 'lucide-react'

interface ProcessStatsProps {
  processStats: {
    asama1: number
    asama2: number
    asama3: number
    asama4: number
    tamamlandi: number
  }
}

export const ProcessStats: React.FC<ProcessStatsProps> = ({ processStats }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Süreç Yönetim Panosu
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Aktif çalışma dosyasındaki mevcut ihale/temin dosyalarının süreç bazlı dağılımı.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/dosyalar/yeni"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Yeni İhale Başlat
          </Link>
          <Link
            to="/dosyalar"
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold py-2 px-4 text-xs rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <ListTodo className="w-4 h-4" />
            Tüm İşleri Gör
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Aşama 1 */}
        <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 flex flex-col justify-between group hover:bg-amber-50 dark:hover:bg-amber-955/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-2xl font-black text-amber-700 dark:text-amber-500">
              {processStats.asama1}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-xs text-amber-900 dark:text-amber-400">
              1. İhtiyaç & Başlangıç
            </h3>
            <p className="text-[10px] text-amber-700/70 dark:text-amber-500/70 mt-1 line-clamp-2">
              Teknik şartname ve yaklaşık maliyet öncesi.
            </p>
          </div>
        </div>
        {/* Aşama 2 */}
        <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-2xl p-4 flex flex-col justify-between group hover:bg-blue-50 dark:hover:bg-blue-955/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-2xl font-black text-blue-700 dark:text-blue-500">
              {processStats.asama2}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-xs text-blue-900 dark:text-blue-400">
              2. Fiyat Araştırması
            </h3>
            <p className="text-[10px] text-blue-700/70 dark:text-blue-500/70 mt-1 line-clamp-2">
              Piyasa tekliflerinin toplanması ve komisyon süreci.
            </p>
          </div>
        </div>
        {/* Aşama 3 */}
        <div className="bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/30 rounded-2xl p-4 flex flex-col justify-between group hover:bg-purple-50 dark:hover:bg-purple-955/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <span className="text-2xl font-black text-purple-700 dark:text-purple-500">
              {processStats.asama3}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-xs text-purple-900 dark:text-purple-400">
              3. Sipariş & Sözleşme
            </h3>
            <p className="text-[10px] text-purple-700/70 dark:text-purple-500/70 mt-1 line-clamp-2">
              Onay belgesi ve firmaya işin tebliğ edilmesi.
            </p>
          </div>
        </div>
        {/* Aşama 4 */}
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl p-4 flex flex-col justify-between group hover:bg-emerald-50 dark:hover:bg-emerald-955/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-500">
              {processStats.asama4}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-xs text-emerald-900 dark:text-emerald-400">
              4. Muayene & Kabul & Ödeme
            </h3>
            <p className="text-[10px] text-emerald-700/70 dark:text-emerald-500/70 mt-1 line-clamp-2">
              Muayene kabul ve ödeme emri belgelerinin kesimi.
            </p>
          </div>
        </div>
        {/* Tamamlandı */}
        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 flex flex-col justify-between group hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
              <FolderOpen className="w-4 h-4" />
            </div>
            <span className="text-2xl font-black text-slate-700 dark:text-slate-400">
              {processStats.tamamlandi}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-700 dark:text-slate-300">
              Arşivlenen İşler
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              Süreci tamamlanıp arşive kaldırılan teminler.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
