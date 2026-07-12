import React from 'react'
import { Printer, Download } from 'lucide-react'

const MOCK_KAYIT_FORMU_ROWS = [
  {
    id: 1,
    tarih: '03.01.2024',
    firma: 'Ofis Dünyası Ltd. Şti.',
    kalem: 'Roller Kalem (Siyah) x50',
    tutar: 1250.0,
    durum: 'Tamamlandı'
  },
  {
    id: 2,
    tarih: '11.01.2024',
    firma: 'Temizlik A.Ş.',
    kalem: 'Genel Temizlik Hizmeti (Ocak)',
    tutar: 8400.0,
    durum: 'Tamamlandı'
  },
  {
    id: 3,
    tarih: '15.01.2024',
    firma: 'Bilişim Sistemleri Ltd.',
    kalem: 'Yazıcı Toner Kartuşu x5',
    tutar: 3750.0,
    durum: 'Tamamlandı'
  },
  {
    id: 4,
    tarih: '22.01.2024',
    firma: 'Kırtasiye Plus',
    kalem: 'A4 Kâğıt (80gr) 10 Koli',
    tutar: 2200.0,
    durum: 'Tamamlandı'
  },
  {
    id: 5,
    tarih: '05.02.2024',
    firma: 'Teknik Servis A.Ş.',
    kalem: 'Klima Bakım Hizmeti',
    tutar: 5600.0,
    durum: 'Tamamlandı'
  },
  {
    id: 6,
    tarih: '14.02.2024',
    firma: 'Ofis Dünyası Ltd. Şti.',
    kalem: 'Zımba Teli x10 Kutu',
    tutar: 480.0,
    durum: 'Tamamlandı'
  },
  {
    id: 7,
    tarih: '20.02.2024',
    firma: 'Güvenlik Sistemleri A.Ş.',
    kalem: 'Güvenlik Kamera Bakımı',
    tutar: 12000.0,
    durum: 'Tamamlandı'
  },
  {
    id: 8,
    tarih: '01.03.2024',
    firma: 'Temizlik A.Ş.',
    kalem: 'Genel Temizlik Hizmeti (Mart)',
    tutar: 8400.0,
    durum: 'Devam Ediyor'
  },
  {
    id: 9,
    tarih: '07.03.2024',
    firma: 'Dijital Çözümler Ltd.',
    kalem: 'Yazılım Lisans Yenileme',
    tutar: 18500.0,
    durum: 'Devam Ediyor'
  },
  {
    id: 10,
    tarih: '12.03.2024',
    firma: 'Kırtasiye Plus',
    kalem: 'Dosya Klasörü x100',
    tutar: 1500.0,
    durum: 'Devam Ediyor'
  }
]

const AYLAR = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık'
]

const fmt = (n: number) =>
  n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺'

interface KayitFormuViewProps {
  ay: string
  yil: string
}

export const KayitFormuView: React.FC<KayitFormuViewProps> = ({ ay, yil }) => {
  const ayNo = (AYLAR.indexOf(ay) + 1).toString().padStart(2, '0')
  const filtered = MOCK_KAYIT_FORMU_ROWS.filter((r) => r.tarih.includes(`${ayNo}.${yil.slice(2)}`))
  const toplam = filtered.reduce((s, r) => s + r.tutar, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold text-slate-805 dark:text-slate-100">
            Doğrudan Temin Kayıt Formu
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {ay} {yil} • {filtered.length} kayıt
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <Printer className="w-3.5 h-3.5" /> Yazdır
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs text-white transition-colors">
            <Download className="w-3.5 h-3.5" /> Dışa Aktar
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-600 text-sm">
          Bu dönem için kayıt bulunamadı.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Tarih</th>
                <th className="px-4 py-3 text-left">Firma</th>
                <th className="px-4 py-3 text-left">Kalem / Açıklama</th>
                <th className="px-4 py-3 text-right">Tutar</th>
                <th className="px-4 py-3 text-center">Durum</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr
                  key={row.id}
                  className={`border-t border-slate-100 dark:border-slate-700/50 ${
                    i % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-slate-800/30'
                  } hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors`}
                >
                  <td className="px-4 py-3 text-slate-400 dark:text-slate-600 font-mono">
                    {row.id}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">
                    {row.tarih}
                  </td>
                  <td className="px-4 py-3 text-slate-800 dark:text-slate-200 font-medium">
                    {row.firma}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{row.kalem}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-805 dark:text-slate-200 font-mono">
                    {fmt(row.tutar)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        row.durum === 'Tamamlandı'
                          ? 'bg-emerald-100 text-emerald-705 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-705 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}
                    >
                      {row.durum}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/60">
                <td
                  colSpan={4}
                  className="px-4 py-3 text-right font-bold text-slate-700 dark:text-slate-300 text-sm"
                >
                  TOPLAM
                </td>
                <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {fmt(toplam)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}
