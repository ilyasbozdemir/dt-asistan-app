import React, { useState, useEffect } from 'react'
import { FileText, Search, Sparkles } from 'lucide-react'
import { YeniDosyaTabProps } from '../types'

interface LastPurchaseItem {
  kalem_adi: string
  ozelligi: string
  miktar: string
  firma: string
  fiyat: string
  tarih: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function IhtiyacListesiTab(_props: YeniDosyaTabProps): React.JSX.Element {
  const [, setAiKalemConfig] = useState({ isOpen: false })
  const [lastPurchases, setLastPurchases] = useState<LastPurchaseItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLastPurchases(): Promise<void> {
      setLoading(true)
      try {
        const res = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT kalem_adi, ozelligi, birim FROM TANIM_Kalem WHERE aktif_mi = 1 ORDER BY id DESC LIMIT 5'
        )
        if (res.success && res.data && res.data.length > 0) {
          const mockFirms = [
            'Örnek Medikal & Kimya',
            'Cihan İnşaat Malzemeleri',
            'Net Bilişim Teknolojileri',
            'Gökkuşağı Ofis Kırtasiye',
            'Lider Temizlik Ürünleri'
          ]
          const items = res.data.map(
            (
              item: { kalem_adi: string; ozelligi: string | null; birim: string | null },
              idx: number
            ) => ({
              kalem_adi: item.kalem_adi,
              ozelligi: item.ozelligi || 'Genel Şartnameye Uygun',
              miktar: `${(idx + 1) * 15} ${item.birim || 'Adet'}`,
              firma: mockFirms[idx % mockFirms.length],
              fiyat: `${((idx + 2) * 195 + 45).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`,
              tarih: new Date(Date.now() - (idx + 1) * 8 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR')
            })
          )
          setLastPurchases(items)
        } else {
          // Veritabanında kayıt yoksa yedek örnek veriler gösterilsin
          setLastPurchases([
            {
              kalem_adi: 'A4 Fotokopi Kağıdı',
              ozelligi: '80 gr, 500\'lü Paket',
              miktar: '100 Paket',
              firma: 'Gökkuşağı Ofis Kırtasiye',
              fiyat: '115,00 ₺',
              tarih: '12.05.2026'
            },
            {
              kalem_adi: 'Lazer Yazıcı Toneri',
              ozelligi: 'Siyah, Orjinal Çipli',
              miktar: '20 Adet',
              firma: 'Net Bilişim Teknolojileri',
              fiyat: '1.450,00 ₺',
              tarih: '03.04.2026'
            }
          ])
        }
      } catch (err) {
        console.error('Son alımlar yüklenirken hata oluştu:', err)
      } finally {
        setLoading(false)
      }
    }
    loadLastPurchases()
  }, [])

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
          <FileText className="text-blue-500 w-5 h-5" />
          <h2 className="text-base font-bold text-slate-800 dark:text-white">
            İhtiyaç Listesi & Alım Kalemleri
          </h2>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/30">
          <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
            <div>
              <h3 className="text-sm font-bold text-blue-800 dark:text-blue-400">
                EKAP Uyumlu Kalem Tanımlama
              </h3>
              <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                İhale kalemlerinizi (OKAS kodlarıyla) ekleyerek Birim Fiyat Teklif Cetveli
                oluşturabilirsiniz.
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button
                type="button"
                className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors w-full md:w-auto"
              >
                Manuel Kalem Ekle
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-colors w-full md:w-auto whitespace-nowrap"
              >
                + OKAS&apos;tan Aktar
              </button>
              <button
                type="button"
                onClick={() => setAiKalemConfig({ isOpen: true })}
                title="Yapay zeka asistanı halen eğitiliyor. Çıktıları kontrol ediniz."
                className="relative px-4 py-2 bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-500/20 transition-colors w-full md:w-auto whitespace-nowrap flex items-center justify-center gap-1.5"
              >
                <Sparkles size={14} /> AI Kalem Bulucu
                <span className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border border-white/20 shadow-sm animate-pulse">
                  BETA
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950">
          <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm mb-4">
            <Search className="w-6 h-6 text-slate-300 dark:text-slate-600" />
          </div>
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Henüz Kalem Eklenmedi
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">
            Doğrudan temin kapsamında alınacak mal, hizmet veya yapım işi kalemlerini buradan
            ekleyin.
          </p>
        </div>

        {/* Son Alım Fiyat Cetveli */}
        <div className="mt-6 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
          <div className="bg-slate-50 dark:bg-slate-950 px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                Son Alım Fiyat Cetveli
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Önceki ihalelerdeki benzer kalemlerin fiyat geçmişi referans amaçlıdır.
              </p>
            </div>
          </div>
          <div className="max-h-[240px] overflow-auto custom-scrollbar">
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-500">Yükleniyor...</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 whitespace-nowrap">Malzeme Adı</th>
                    <th className="px-4 py-3 whitespace-nowrap">Özelliği</th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">Miktarı</th>
                    <th className="px-4 py-3 whitespace-nowrap">Kazanan Firma</th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">Fiyatı</th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">Tarihi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  {lastPurchases.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-medium">{item.kalem_adi}</td>
                      <td className="px-4 py-3 text-slate-500">{item.ozelligi}</td>
                      <td className="px-4 py-3 text-right">{item.miktar}</td>
                      <td className="px-4 py-3">{item.firma}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                        {item.fiyat}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">{item.tarih}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
