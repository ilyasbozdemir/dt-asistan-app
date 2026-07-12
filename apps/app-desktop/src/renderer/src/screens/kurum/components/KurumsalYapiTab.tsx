import React, { useEffect, useState } from 'react'
import { Layers, Users, Activity, Tag } from 'lucide-react'

interface Birim {
  id: number
  birim_adi: string
  kisa_ad?: string
  detsis_kodu?: string
  harcama_kodu?: string
  harcama_yetkilisi_unvan?: string
}

interface Personel {
  id: number
  ad_soyad: string
  unvan?: string
  sicil_no?: string
  eposta?: string
  telefon?: string
}

export function KurumsalYapiTab(): React.JSX.Element {
  const [birimler, setBirimler] = useState<Birim[]>([])
  const [personel, setPersonel] = useState<Personel[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const birimRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM TANIM_Birim WHERE aktif_mi = 1 ORDER BY birim_adi ASC'
        )
        const personelRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM TANIM_Personel WHERE aktif_mi = 1 ORDER BY ad_soyad ASC'
        )
        if (birimRes.success) setBirimler(birimRes.data || [])
        if (personelRes.success) setPersonel(personelRes.data || [])
      } catch (e) {
        console.error('Failed to load corporate structure data:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-500 text-xs italic">
        Kurumsal yapı verileri yükleniyor...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          🏢 Kurumsal Yapı & Kadro
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Sistemde tanımlı olan müdürlükleri, harcama birimlerini, DETSİS kodlarını ve personelleri
          tek ekrandan inceleyin.
        </p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-955/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              Aktif Birim Sayısı
            </span>
            <span className="text-xl font-extrabold text-slate-850 dark:text-slate-150 font-mono">
              {birimler.length}
            </span>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-955/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              Kayıtlı Personel
            </span>
            <span className="text-xl font-extrabold text-slate-850 dark:text-slate-150 font-mono">
              {personel.length}
            </span>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-955/40 text-amber-600 dark:text-amber-400 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              DETSİS Eşleşmesi
            </span>
            <span className="text-xl font-extrabold text-slate-850 dark:text-slate-150 font-mono">
              {birimler.filter((b) => b.detsis_kodu).length} / {birimler.length}
            </span>
          </div>
        </div>
      </div>

      {/* Birimler ve DETSİS Kodları Tablosu */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Tag className="w-4 h-4 text-blue-500" />
          Harcama Birimleri & Kodları
        </h4>
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950 shadow-inner">
          <table className="w-full border-collapse text-left">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-650 dark:text-slate-400">
              <tr>
                <th className="p-3">Birim Adı</th>
                <th className="p-3 text-center">DETSİS No</th>
                <th className="p-3 text-center">Harcama Kodu</th>
                <th className="p-3">Harcama Yetkilisi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-855 text-xs text-slate-600 dark:text-slate-400">
              {birimler.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                    {b.birim_adi}{' '}
                    {b.kisa_ad && (
                      <span className="text-[10px] text-slate-400 font-normal">({b.kisa_ad})</span>
                    )}
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-blue-650 dark:text-blue-400">
                    {b.detsis_kodu || <span className="text-[10px] text-slate-350 italic">-</span>}
                  </td>
                  <td className="p-3 text-center font-mono text-slate-550 dark:text-slate-500">
                    {b.harcama_kodu || <span className="text-[10px] text-slate-350 italic">-</span>}
                  </td>
                  <td className="p-3 truncate max-w-[200px]" title={b.harcama_yetkilisi_unvan}>
                    {b.harcama_yetkilisi_unvan || (
                      <span className="text-[10px] text-slate-350 italic">Atanmamış</span>
                    )}
                  </td>
                </tr>
              ))}
              {birimler.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400 italic">
                    Kayıtlı birim bulunmuyor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Personel Kadro Listesi */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-emerald-500" />
          Kayıtlı Personel Kadrosu
        </h4>
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950 shadow-inner">
          <table className="w-full border-collapse text-left">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-650 dark:text-slate-400">
              <tr>
                <th className="p-3">Adı Soyadı</th>
                <th className="p-3">Unvanı</th>
                <th className="p-3 text-center">Sicil No</th>
                <th className="p-3">E-Posta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-855 text-xs text-slate-600 dark:text-slate-400">
              {personel.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                    {p.ad_soyad}
                  </td>
                  <td className="p-3 font-medium text-slate-650 dark:text-slate-355">
                    {p.unvan || (
                      <span className="text-[10px] text-slate-350 italic">Belirtilmemiş</span>
                    )}
                  </td>
                  <td className="p-3 text-center font-mono text-slate-550 dark:text-slate-500">
                    {p.sicil_no || <span className="text-[10px] text-slate-350 italic">-</span>}
                  </td>
                  <td className="p-3 truncate max-w-[200px]" title={p.eposta}>
                    {p.eposta || <span className="text-[10px] text-slate-350 italic">-</span>}
                  </td>
                </tr>
              ))}
              {personel.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400 italic">
                    Kayıtlı personel bulunmuyor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
