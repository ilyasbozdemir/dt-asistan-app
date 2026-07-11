import React from 'react'
import { Download } from 'lucide-react'

const MOCK_AYLIK_OZET = [
  { ay: 'Ocak', harcama: 15600, islem: 4 },
  { ay: 'Şubat', harcama: 18080, islem: 3 },
  { ay: 'Mart', harcama: 28400, islem: 3 },
  { ay: 'Nisan', harcama: 0, islem: 0 },
  { ay: 'Mayıs', harcama: 0, islem: 0 },
  { ay: 'Haziran', harcama: 0, islem: 0 },
  { ay: 'Temmuz', harcama: 0, islem: 0 },
  { ay: 'Ağustos', harcama: 0, islem: 0 },
  { ay: 'Eylül', harcama: 0, islem: 0 },
  { ay: 'Ekim', harcama: 0, islem: 0 },
  { ay: 'Kasım', harcama: 0, islem: 0 },
  { ay: 'Aralık', harcama: 0, islem: 0 }
]

const fmt = (n: number) =>
  n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺'

interface AylikOzetViewProps {
  yil: string
}

export const AylikOzetView: React.FC<AylikOzetViewProps> = ({ yil }) => {
  const maxHarcama = Math.max(...MOCK_AYLIK_OZET.map((r) => r.harcama), 1)
  const toplam = MOCK_AYLIK_OZET.reduce((s, r) => s + r.harcama, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold text-slate-805 dark:text-slate-100">Aylık Özet Raporu</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{yil} Yılı • Aylık harcama dağılımı</div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs text-white transition-colors">
          <Download className="w-3.5 h-3.5" /> Dışa Aktar
        </button>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div className="text-xs text-slate-505 dark:text-slate-400 mb-1">Yıllık Toplam</div>
          <div className="text-xl font-bold text-slate-800 dark:text-slate-100 font-mono">{fmt(toplam)}</div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div className="text-xs text-slate-505 dark:text-slate-400 mb-1">Aylık Ortalama</div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 font-mono">{fmt(toplam / 12)}</div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div className="text-xs text-slate-505 dark:text-slate-400 mb-1">Toplam İşlem</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {MOCK_AYLIK_OZET.reduce((s, r) => s + r.islem, 0)} adet
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
          Aylık Harcama (₺)
        </div>
        <div className="flex items-end gap-2 h-36">
          {MOCK_AYLIK_OZET.map((row) => {
            const pct = (row.harcama / maxHarcama) * 100
            return (
              <div key={row.ay} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  {row.harcama > 0 ? (row.harcama / 1000).toFixed(0) + 'k' : ''}
                </div>
                <div
                  className={`w-full rounded-t-md transition-all ${
                    row.harcama > 0
                      ? 'bg-gradient-to-t from-blue-600 to-blue-400 dark:from-blue-700 dark:to-blue-500'
                      : 'bg-slate-100 dark:bg-slate-700'
                  }`}
                  style={{ height: `${Math.max(pct, 2)}%` }}
                />
                <div className="text-[9px] text-slate-400 dark:text-slate-505">{row.ay.slice(0, 3)}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
              <th className="px-4 py-3 text-left">Ay</th>
              <th className="px-4 py-3 text-right">Harcama (₺)</th>
              <th className="px-4 py-3 text-right">İşlem Adedi</th>
              <th className="px-4 py-3 text-right">Ort. İşlem Tutarı</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_AYLIK_OZET.map((row, i) => (
              <tr
                key={row.ay}
                className={`border-t border-slate-100 dark:border-slate-700/50 ${
                  i % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-slate-800/30'
                }`}
              >
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">{row.ay}</td>
                <td className="px-4 py-3 text-right font-mono text-slate-800 dark:text-slate-200">
                  {row.harcama > 0 ? fmt(row.harcama) : <span className="text-slate-305 dark:text-slate-600">—</span>}
                </td>
                <td className="px-4 py-3 text-right text-slate-655 dark:text-slate-400">{row.islem > 0 ? row.islem : '—'}</td>
                <td className="px-4 py-3 text-right font-mono text-slate-655 dark:text-slate-400">
                  {row.islem > 0 ? fmt(row.harcama / row.islem) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/60">
              <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">TOPLAM</td>
              <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {fmt(toplam)}
              </td>
              <td className="px-4 py-3 text-right font-bold text-slate-700 dark:text-slate-300">
                {MOCK_AYLIK_OZET.reduce((s, r) => s + r.islem, 0)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
