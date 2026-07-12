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

interface YillikOzetViewProps {
  yil: string
}

export const YillikOzetView: React.FC<YillikOzetViewProps> = ({ yil }) => {
  const toplam = MOCK_AYLIK_OZET.reduce((s, r) => s + r.harcama, 0)
  const islemSayisi = MOCK_AYLIK_OZET.reduce((s, r) => s + r.islem, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Yıllık Özet Raporu
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{yil} Yılı Geneli</div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs text-white transition-colors">
          <Download className="w-3.5 h-3.5" /> Dışa Aktar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: 'Toplam Harcama',
            value: fmt(toplam),
            color: 'text-emerald-600 dark:text-emerald-400'
          },
          {
            label: 'İşlem Sayısı',
            value: `${islemSayisi} adet`,
            color: 'text-blue-600 dark:text-blue-400'
          },
          {
            label: 'Ortalama İşlem Tutarı',
            value: fmt(islemSayisi > 0 ? toplam / islemSayisi : 0),
            color: 'text-purple-600 dark:text-purple-400'
          },
          {
            label: 'En Yüksek Aylık Harcama',
            value: fmt(Math.max(...MOCK_AYLIK_OZET.map((r) => r.harcama))),
            color: 'text-orange-600 dark:text-orange-400'
          }
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5"
          >
            <div className="text-xs text-slate-505 dark:text-slate-400 mb-2">{item.label}</div>
            <div className={`text-2xl font-bold font-mono ${item.color}`}>{item.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          En Çok İşlem Yapılan Firmalar
        </div>
        {['Temizlik A.Ş.', 'Ofis Dünyası Ltd. Şti.', 'Kırtasiye Plus'].map((firma, i) => (
          <div
            key={firma}
            className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0"
          >
            <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
              {i + 1}
            </span>
            <span className="text-sm text-slate-705 dark:text-slate-300 flex-1">{firma}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{3 - i} işlem</span>
          </div>
        ))}
      </div>
    </div>
  )
}
