import React from 'react'
import { Download } from 'lucide-react'

const MOCK_BUTCE = {
  yillikLimit: 250000,
  kullanilanButce: 62080,
  kalanButce: 187920,
  gerceklesmePct: 24.8,
  genel: { limit: 150000, kullanilan: 40000 },
  ozel: { limit: 60000, kullanilan: 18000 },
  dis: { limit: 40000, kullanilan: 4080 }
}

const fmt = (n: number) =>
  n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺'

interface ButceViewProps {
  yil: string
}

export const ButceView: React.FC<ButceViewProps> = ({ yil }) => {
  const { yillikLimit, kullanilanButce, kalanButce, gerceklesmePct, genel, ozel, dis } = MOCK_BUTCE

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold text-slate-808 dark:text-slate-100">
            Bütçe Durum Raporu
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {yil} Yılı Bütçe Kullanımı
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs text-white transition-colors">
          <Download className="w-3.5 h-3.5" /> Dışa Aktar
        </button>
      </div>

      {/* Genel Durum */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 space-y-3">
        <div className="flex justify-between items-end">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Toplam Bütçe Kullanımı</div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-mono">
              {fmt(kullanilanButce)}
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-505">
              / {fmt(yillikLimit)} yıllık limit
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              %{gerceklesmePct}
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-505">gerçekleşme oranı</div>
          </div>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700"
            style={{ width: `${gerceklesmePct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-505 dark:text-slate-400">
          <span>
            Kullanılan: <strong className="text-red-500">{fmt(kullanilanButce)}</strong>
          </span>
          <span>
            Kalan: <strong className="text-emerald-500">{fmt(kalanButce)}</strong>
          </span>
        </div>
      </div>

      {/* Bütçe Tipleri */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Genel Bütçe', ...genel, color: 'from-blue-500 to-blue-600' },
          { label: 'Özel Bütçe', ...ozel, color: 'from-purple-500 to-purple-600' },
          { label: 'Dış Bütçe', ...dis, color: 'from-orange-500 to-orange-600' }
        ].map((b) => {
          const pct = Math.round((b.kullanilan / b.limit) * 100)
          return (
            <div
              key={b.label}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3"
            >
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {b.label}
              </div>
              <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-100">
                {fmt(b.kullanilan)}
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${b.color} rounded-full`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-505">
                <span>%{pct} kullanıldı</span>
                <span>Limit: {fmt(b.limit)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
