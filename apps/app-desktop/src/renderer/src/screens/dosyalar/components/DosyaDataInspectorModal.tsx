import React, { useState, useEffect } from 'react'
import {
  X,
  Code,
  Table as TableIcon,
  Copy,
  Check,
  Building2,
  Users,
  Coins,
  FileSpreadsheet,
  FileCode,
  Search,
  ExternalLink,
  Layers
} from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { useGlobalDocumentPreviewStore } from '../../../store/globalDocumentPreviewStore'

interface DosyaDataInspectorModalProps {
  isOpen: boolean
  onClose: () => void
  dosya: any
}

type TabType = 'keyvalue' | 'kalemler' | 'firmalar' | 'komisyon' | 'sablonveri' | 'rawjson'

export const DosyaDataInspectorModal: React.FC<DosyaDataInspectorModalProps> = ({
  isOpen,
  onClose,
  dosya
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('keyvalue')
  const [searchTerm, setSearchTerm] = useState('')
  const [copied, setCopied] = useState(false)
  const [subData, setSubData] = useState<{
    kalemler: any[]
    firmalar: any[]
    teklifler: any[]
    komisyon: any[]
    sablonVeri: any[]
  }>({
    kalemler: [],
    firmalar: [],
    teklifler: [],
    komisyon: [],
    sablonVeri: []
  })
  const [loadingSub, setLoadingSub] = useState(false)

  const { openDocument } = useGlobalDocumentPreviewStore()

  useEffect(() => {
    if (isOpen && dosya?.id && window.electron) {
      loadSubData(dosya.id)
    }
  }, [isOpen, dosya?.id])

  const loadSubData = async (dosyaId: number) => {
    setLoadingSub(true)
    try {
      const [kRes, fRes, tRes, komRes, sRes] = await Promise.all([
        window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM DATA_TeminKalem WHERE temin_id = ? ORDER BY sira_no ASC',
          [dosyaId]
        ),
        window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT tf.*, f.unvan, f.vergi_no, f.telefon FROM DATA_TeminFirma tf LEFT JOIN TANIM_Firma f ON tf.firma_id = f.id WHERE tf.temin_id = ?',
          [dosyaId]
        ),
        window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM DATA_TeminKalemTeklif WHERE temin_id = ?',
          [dosyaId]
        ),
        window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT tk.*, p.ad_soyad, p.unvan as personel_unvan, kg.ad as gorev_adi FROM DATA_TeminKomisyon tk LEFT JOIN TANIM_Personel p ON tk.personel_id = p.id LEFT JOIN TANIM_KomisyonGorevi kg ON tk.gorev_kod = kg.kod WHERE tk.temin_id = ? ORDER BY tk.sira ASC',
          [dosyaId]
        ),
        window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM DATA_DosyaSablonVeri WHERE temin_id = ?',
          [dosyaId]
        )
      ])

      setSubData({
        kalemler: kRes?.success ? kRes.data : [],
        firmalar: fRes?.success ? fRes.data : [],
        teklifler: tRes?.success ? tRes.data : [],
        komisyon: komRes?.success ? komRes.data : [],
        sablonVeri: sRes?.success ? sRes.data : []
      })
    } catch (err) {
      console.error('SubData yüklenirken hata:', err)
    } finally {
      setLoadingSub(false)
    }
  }

  if (!isOpen || !dosya) return null

  const fullPayload = {
    dosya,
    ...subData
  }

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(fullPayload, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Filter key-value rows
  const dosyaEntries = Object.entries(dosya).filter(([key, val]) => {
    if (!searchTerm) return true
    const q = searchTerm.toLowerCase()
    return key.toLowerCase().includes(q) || String(val).toLowerCase().includes(q)
  })

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[88vh] rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-850 dark:text-slate-100">
                  {dosya.konu || 'Dosya Veri Görüntüleyici'}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  {dosya.temin_no ? `DT-${dosya.butce_yili || '2026'}/${dosya.temin_no}` : `ID: #${dosya.id}`}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Doğrudan temin dosyasının tüm ham verileri, idari ayarları ve ilişkili kayıtları
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyJson}
              className="gap-1.5 text-xs font-semibold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Kopyalandı' : 'JSON Kopyala'}
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation & Search */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 gap-4">
          <div className="flex items-center gap-1 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab('keyvalue')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'keyvalue'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              Temel Parametreler ({dosyaEntries.length})
            </button>

            <button
              onClick={() => setActiveTab('kalemler')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'kalemler'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              İhtiyaç Listesi ({subData.kalemler.length})
            </button>

            <button
              onClick={() => setActiveTab('firmalar')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'firmalar'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Firmalar & Teklifler ({subData.firmalar.length})
            </button>

            <button
              onClick={() => setActiveTab('komisyon')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'komisyon'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Komisyon ({subData.komisyon.length})
            </button>

            <button
              onClick={() => setActiveTab('rawjson')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'rawjson'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              Ham JSON
            </button>
          </div>

          {activeTab === 'keyvalue' && (
            <div className="relative w-64 shrink-0">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Alan adı veya değer ara..."
                className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-6">
          {/* TAB 1: Key-Value Table */}
          {activeTab === 'keyvalue' && (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-4 w-1/3">Veritabanı Alanı (Key)</th>
                    <th className="py-2.5 px-4 w-2/3">Değer (Value)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {dosyaEntries.map(([k, v]) => (
                    <tr
                      key={k}
                      className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors font-mono"
                    >
                      <td className="py-2 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {k}
                      </td>
                      <td className="py-2 px-4 text-slate-900 dark:text-slate-100 break-all select-all font-sans">
                        {v === null || v === undefined ? (
                          <span className="text-slate-400 font-mono italic">NULL</span>
                        ) : typeof v === 'object' ? (
                          <pre className="text-[11px] font-mono bg-slate-100 dark:bg-slate-950 p-2 rounded max-h-28 overflow-auto">
                            {JSON.stringify(v, null, 2)}
                          </pre>
                        ) : typeof v === 'boolean' ? (
                          <span className={v ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                            {v ? 'true' : 'false'}
                          </span>
                        ) : (
                          String(v)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: Kalemler */}
          {activeTab === 'kalemler' && (
            <div className="space-y-3">
              {subData.kalemler.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Bu dosyaya henüz malzeme / ihtiyaç kalemi eklenmemiş.
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px] uppercase">
                        <th className="p-2.5">Sıra</th>
                        <th className="p-2.5">Kalem Adı</th>
                        <th className="p-2.5">Miktar</th>
                        <th className="p-2.5">Birim</th>
                        <th className="p-2.5">KDV</th>
                        <th className="p-2.5">Yaklaşık Birim</th>
                        <th className="p-2.5">Yaklaşık Toplam</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {subData.kalemler.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-2.5 font-bold text-slate-400">{item.sira_no || idx + 1}</td>
                          <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">{item.kalem_adi}</td>
                          <td className="p-2.5">{item.miktar}</td>
                          <td className="p-2.5">{item.olcu_birimi}</td>
                          <td className="p-2.5">%{item.kdv_orani || 20}</td>
                          <td className="p-2.5 font-mono">{Number(item.yaklasik_maliyet_birim || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                          <td className="p-2.5 font-mono font-bold text-blue-600">{Number(item.yaklasik_maliyet_toplam || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Firmalar */}
          {activeTab === 'firmalar' && (
            <div className="space-y-3">
              {subData.firmalar.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Bu dosyaya teklif isteyen firma atanmamış.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subData.firmalar.map((f, idx) => (
                    <div
                      key={f.id || idx}
                      className={`p-4 rounded-xl border ${
                        f.kazandi_mi
                          ? 'border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-xs text-slate-850 dark:text-slate-100">
                          {f.unvan || 'Firma'}
                        </h4>
                        {f.kazandi_mi && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold">
                            Kazanan
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Vergi No: {f.vergi_no || '-'} | Tel: {f.telefon || '-'}
                      </p>
                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Toplam Teklif:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                          {Number(f.toplam_teklif_tutari || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Komisyon */}
          {activeTab === 'komisyon' && (
            <div className="space-y-3">
              {subData.komisyon.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Komisyon üyesi veya piyasa araştırma görevlisi atanmamış.
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px] uppercase">
                        <th className="p-2.5">Sıra</th>
                        <th className="p-2.5">Ad Soyad</th>
                        <th className="p-2.5">Unvan</th>
                        <th className="p-2.5">Komisyon Görevi</th>
                        <th className="p-2.5">Asıl / Yedek</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {subData.komisyon.map((k, idx) => (
                        <tr key={k.id || idx}>
                          <td className="p-2.5 font-bold text-slate-400">{k.sira || idx + 1}</td>
                          <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">{k.ad_soyad}</td>
                          <td className="p-2.5 text-slate-500">{k.personel_unvan || '-'}</td>
                          <td className="p-2.5 font-bold text-blue-600">{k.gorev_adi || k.gorev_kod || '-'}</td>
                          <td className="p-2.5">{k.asl_yedek || 'ASIL'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Raw JSON */}
          {activeTab === 'rawjson' && (
            <div className="relative">
              <pre className="p-4 bg-slate-950 text-slate-100 rounded-xl font-mono text-xs overflow-auto max-h-[60vh] border border-slate-800 leading-relaxed select-all">
                {JSON.stringify(fullPayload, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose()
                openDocument({
                  documentId: 'arastirma-mektubu',
                  dosyaId: dosya.id,
                  documentTitle: 'Piyasa Fiyat Araştırma Mektubu'
                })
              }}
              className="text-xs gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Araştırma Mektubunda Aç
            </Button>
          </div>
          <Button onClick={onClose} size="sm">
            Kapat
          </Button>
        </div>
      </div>
    </div>
  )
}
