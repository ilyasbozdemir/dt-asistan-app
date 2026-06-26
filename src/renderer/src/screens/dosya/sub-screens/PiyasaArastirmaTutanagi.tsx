import React, { useEffect, useState } from 'react'
import { useWorkspaceStore } from '../../../store/workspaceStore'
import { Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  AlertCircle,
  FileText,
  Users,
  Package,
  Layers,
  Compass,
  FileCheck,
  CreditCard,
  FileSpreadsheet,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Building2,
  Printer,
  TrendingUp,
  UserPlus,
  Copy,
  Upload,
  Eye
} from 'lucide-react'
import { cn } from '../../../utils/cn'
import { Modal } from '../../../components/ui/Modal'

import { SubScreen } from '../SubScreens.screen'

export function PiyasaArastirmaTutanagi(): React.JSX.Element {
  const { activeDosyaId } = useWorkspaceStore()
  const [items, setItems] = useState<any[]>([])
  const [firms, setFirms] = useState<any[]>([])
  const [bids, setBids] = useState<Record<string, number>>({})
  const [komisyon, setKomisyon] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeDosyaId) return
    setLoading(true)

    const fetchAll = async () => {
      try {
        const resItems = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM DATA_TeminKalem WHERE temin_dosya_id = ? ORDER BY id ASC',
          [activeDosyaId]
        )
        const resFirms = await window.electron.ipcRenderer.invoke(
          'db:query',
          `SELECT df.id as temin_firma_id, f.unvan, f.id as firma_id FROM DATA_TeminFirma df JOIN TANIM_Firma f ON df.firma_id = f.id WHERE df.temin_dosya_id = ?`,
          [activeDosyaId]
        )
        const resBids = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM DATA_TeminKalemTeklif WHERE temin_dosya_id = ?',
          [activeDosyaId]
        )
        const resKoms = await window.electron.ipcRenderer.invoke(
          'db:query',
          "SELECT tk.*, p.ad_soyad, p.unvan FROM DATA_TeminKomisyon tk JOIN TANIM_Personel p ON tk.personel_id = p.id WHERE tk.temin_dosya_id = ? AND tk.komisyon_turu = 'Fiyat Araştırma'",
          [activeDosyaId]
        )

        if (resItems.success) setItems(resItems.data)
        if (resFirms.success) setFirms(resFirms.data)
        if (resKoms.success) setKomisyon(resKoms.data)

        if (resBids.success) {
          const bidsMap: Record<string, number> = {}
          resBids.data.forEach((b: any) => {
            bidsMap[`${b.temin_kalem_id}_${b.temin_firma_id}`] = b.birim_fiyat
          })
          setBids(bidsMap)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [activeDosyaId])

  const getItemAvgPrice = (itemId: number): number => {
    const prices = firms.map((f) => bids[`${itemId}_${f.temin_firma_id}`] || 0).filter((p) => p > 0)
    if (prices.length === 0) return 0
    const sum = prices.reduce((a, b) => a + b, 0)
    return sum / prices.length
  }

  return (
    <SubScreen
      title="Piyasa Fiyat Araştırma Tutanağı"
      icon={FileSpreadsheet}
      description="Resmi mevzuata uygun formatta hazırlanmış imzaya hazır Piyasa Fiyat Araştırma Tutanağı."
    >
      <div className="flex justify-end mb-4">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Printer className="w-4 h-4" />
          Tutanak Yazdır
        </button>
      </div>

      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-md max-w-5xl mx-auto font-sans text-slate-850 dark:text-slate-200 print:shadow-none print:border-none print:p-0">
        <div className="text-center font-bold uppercase space-y-1 pb-6 border-b-2 border-slate-350 dark:border-slate-850">
          <h2 className="text-sm">PİYASA FİYAT ARAŞTIRMA TUTANAĞI</h2>
          <p className="text-[10px] text-slate-400 normal-case font-normal mt-1">
            4734 Sayılı KİK Madde 22/d Kapsamında Yapılan Alımlara İlişkindir
          </p>
        </div>

        <div className="py-6 space-y-4 text-xs">
          <p className="leading-relaxed">
            İdaremizin ihtiyacı olan ve doğrudan temin usulüyle satın alınacak olan işbu listedeki
            kalemlere ait piyasada yapılan araştırmalar neticesinde firmaların teklif ettikleri
            birim fiyatlar ve ortalamaları aşağıdaki gibi tespit edilmiştir.
          </p>

          <table className="w-full border-collapse border border-slate-300 dark:border-slate-800 text-[10px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900">
                <th className="border border-slate-300 dark:border-slate-800 p-2 text-center w-8">
                  S.N
                </th>
                <th className="border border-slate-300 dark:border-slate-800 p-2">Malzeme Adı</th>
                <th className="border border-slate-300 dark:border-slate-800 p-2 text-center w-12">
                  Miktar
                </th>
                <th className="border border-slate-300 dark:border-slate-800 p-2 text-center w-12">
                  Birim
                </th>
                {firms.map((f) => (
                  <th
                    key={f.temin_firma_id}
                    className="border border-slate-300 dark:border-slate-800 p-2 text-center max-w-[90px] truncate"
                    title={f.unvan}
                  >
                    {f.unvan}
                  </th>
                ))}
                <th className="border border-slate-300 dark:border-slate-800 p-2 text-center w-20">
                  Ortalama (₺)
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5 + firms.length}
                    className="border border-slate-300 dark:border-slate-800 p-4 text-center italic text-slate-400"
                  >
                    Yükleniyor...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={5 + firms.length}
                    className="border border-slate-300 dark:border-slate-800 p-4 text-center italic text-slate-400"
                  >
                    Kayıtlı kalem veya istekli bulunamadı.
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => {
                  const avg = getItemAvgPrice(item.id)
                  return (
                    <tr key={item.id}>
                      <td className="border border-slate-300 dark:border-slate-800 p-2 text-center font-bold">
                        {idx + 1}
                      </td>
                      <td className="border border-slate-300 dark:border-slate-800 p-2 font-bold">
                        {item.kalem_adi}
                      </td>
                      <td className="border border-slate-300 dark:border-slate-800 p-2 text-center font-mono">
                        {item.miktar}
                      </td>
                      <td className="border border-slate-300 dark:border-slate-800 p-2 text-center">
                        {item.birim}
                      </td>
                      {firms.map((f) => {
                        const price = bids[`${item.id}_${f.temin_firma_id}`] || 0
                        return (
                          <td
                            key={f.temin_firma_id}
                            className="border border-slate-300 dark:border-slate-800 p-2 text-center font-mono"
                          >
                            {price > 0
                              ? price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })
                              : '-'}
                          </td>
                        )
                      })}
                      <td className="border border-slate-300 dark:border-slate-800 p-2 text-center font-mono font-bold bg-slate-50 dark:bg-slate-900">
                        {avg > 0 ? avg.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>

          {/* SIGNATURE SECTION */}
          <div className="pt-16">
            <h4 className="text-center font-bold mb-8 uppercase text-[10px]">
              FİYAT ARAŞTIRMA KOMİSYON ÜYELERİ İMZALARI
            </h4>
            <div className="flex flex-wrap justify-center gap-12">
              {komisyon.length === 0 ? (
                <div className="text-slate-450 italic text-[10px]">
                  Fiyat Araştırma Komisyonu atanmamış. İmzalar için lütfen önce Fiyat Araştırma
                  Komisyonu ekranından personel görevlendirin.
                </div>
              ) : (
                komisyon.map((m) => (
                  <div key={m.id} className="text-center min-w-[150px] space-y-1">
                    <span className="block font-black">{m.ad_soyad}</span>
                    <span className="block text-[10px] text-slate-500 uppercase">
                      {m.unvan || 'Personel'}
                    </span>
                    <span className="block text-[10px] text-blue-600 font-bold">
                      Komisyon {m.gorevi}
                    </span>
                    <span className="block text-[9px] text-slate-400 pt-6">(İmza)</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </SubScreen>
  )
}

// 6. FİYAT ARAŞTIRMA KOMİSYONU ATAMA SCREEN
