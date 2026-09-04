import React, { useState, useEffect, useCallback } from 'react'
import {
  X,
  Code,
  Table as TableIcon,
  Copy,
  Check,
  Building2,
  Users,
  FileSpreadsheet,
  FileCode,
  ExternalLink,
  Layers,
  Edit,
  FileText,
  Calendar,
  DollarSign,
  Briefcase,
  ShieldCheck,
  Tag,
  Info
} from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { useGlobalDocumentPreviewStore } from '../../../store/globalDocumentPreviewStore'
import { useTabStore } from '../../../store/tabStore'
import { useNavigate } from '@tanstack/react-router'

interface DosyaDataInspectorModalProps {
  isOpen: boolean
  onClose: () => void
  dosya: any
}

type TabType = 'kunye' | 'kalemler' | 'firmalar' | 'komisyon' | 'sablonveri' | 'rawjson'

export const DosyaDataInspectorModal: React.FC<DosyaDataInspectorModalProps> = ({
  isOpen,
  onClose,
  dosya
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('kunye')
  const [copied, setCopied] = useState(false)
  const [fullDosya, setFullDosya] = useState<any>(dosya)
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
  const [loading, setLoading] = useState(false)

  const { openDocument } = useGlobalDocumentPreviewStore()
  const { addTab } = useTabStore()
  const navigate = useNavigate()

  const loadSubData = useCallback(async (dosyaId: number) => {
    setLoading(true)
    try {
      const [dRes, kRes, fRes, tRes, komRes, sRes] = await Promise.all([
        window.electron.ipcRenderer.invoke(
          'db:query',
          `SELECT d.*, 
                  b.birim_adi, 
                  p_irt.ad_soyad as irtibat_ad,
                  p_onay.ad_soyad as onaylayan_ad,
                  p_sunan.ad_soyad as sunan_ad,
                  p_haz.ad_soyad as hazirlayan_ad,
                  p_talep.ad_soyad as talep_eden_ad
           FROM DATA_TeminDosyasi d
           LEFT JOIN TANIM_Birim b ON d.birim_id = b.id
           LEFT JOIN TANIM_Personel p_irt ON d.irtibat_yetkilisi_id = p_irt.id
           LEFT JOIN TANIM_Personel p_onay ON d.onaylayan_yetkili_id = p_onay.id
           LEFT JOIN TANIM_Personel p_sunan ON d.sunan_gorevli_id = p_sunan.id
           LEFT JOIN TANIM_Personel p_haz ON d.piyasa_arastirma_gorevlisi_id = p_haz.id
           LEFT JOIN TANIM_Personel p_talep ON d.talep_eden_personel_id = p_talep.id
           WHERE d.id = ?`,
          [dosyaId]
        ),
        window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM DATA_TeminKalem WHERE temin_dosya_id = ? OR temin_id = ? ORDER BY id ASC',
          [dosyaId, dosyaId]
        ),
        window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT tf.*, f.unvan, f.vergi_no, f.telefon, f.yetkili FROM DATA_TeminFirma tf LEFT JOIN TANIM_Firma f ON tf.firma_id = f.id WHERE tf.temin_dosya_id = ? OR tf.temin_id = ?',
          [dosyaId, dosyaId]
        ),
        window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM DATA_TeminKalemTeklif WHERE temin_dosya_id = ? OR temin_id = ?',
          [dosyaId, dosyaId]
        ),
        window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT tk.*, p.ad_soyad, p.unvan as personel_unvan, kg.ad as gorev_adi FROM DATA_TeminKomisyon tk LEFT JOIN TANIM_Personel p ON tk.personel_id = p.id LEFT JOIN TANIM_KomisyonGorevi kg ON tk.gorev_kod = kg.kod WHERE tk.temin_dosya_id = ? OR tk.temin_id = ? ORDER BY tk.id ASC',
          [dosyaId, dosyaId]
        ),
        window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM DATA_DosyaSablonVeri WHERE temin_dosya_id = ? OR temin_id = ?',
          [dosyaId, dosyaId]
        )
      ])

      if (dRes?.success && dRes.data.length > 0) {
        setFullDosya(dRes.data[0])
      } else {
        setFullDosya(dosya)
      }

      setSubData({
        kalemler: kRes?.success ? kRes.data : [],
        firmalar: fRes?.success ? fRes.data : [],
        teklifler: tRes?.success ? tRes.data : [],
        komisyon: komRes?.success ? komRes.data : [],
        sablonVeri: sRes?.success ? sRes.data : []
      })
    } catch (err) {
      console.error('Dosya detayları yüklenirken hata:', err)
      setFullDosya(dosya)
    } finally {
      setLoading(false)
    }
  }, [dosya])

  useEffect(() => {
    if (isOpen && dosya?.id && window.electron) {
      loadSubData(dosya.id)
    }
  }, [isOpen, dosya?.id, loadSubData])

  if (!isOpen || !dosya) return null

  const d = fullDosya || dosya

  const fullPayload = {
    dosya: d,
    ...subData
  }

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(fullPayload, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatMoney = (val: any): string => {
    const num = Number(val)
    if (isNaN(num) || num === 0) return '0,00'
    return num.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const formatDate = (val: string | null | undefined): string => {
    if (!val) return 'Belirtilmedi'
    try {
      const date = new Date(val)
      if (isNaN(date.getTime())) return val
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return val
    }
  }

  const turLabelMap: Record<string, string> = {
    mal: 'Mal Alımı',
    hizmet: 'Hizmet Alımı',
    yapim_isi: 'Yapım İşi',
    danismanlik: 'Danışmanlık Hizmeti',
    hakedis: 'Hakediş Dosyası'
  }

  const turBadgeColorMap: Record<string, string> = {
    mal: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800',
    hizmet: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-800',
    yapim_isi: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800',
    danismanlik: 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/40 dark:text-pink-300 dark:border-pink-800',
    hakedis: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800'
  }

  const statusLabelMap: Record<string, string> = {
    devam_ediyor: 'Devam Ediyor',
    tamamlandi: 'Tamamlandı',
    iptal: 'İptal Edildi'
  }

  const statusColorMap: Record<string, string> = {
    devam_ediyor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300',
    tamamlandi: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300',
    iptal: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300'
  }

  const toplamYaklasikMaliyet = subData.kalemler.reduce(
    (acc, cur) => acc + Number(cur.yaklasik_maliyet_toplam || 0),
    0
  ) || Number(d.yaklasik_maliyet || 0)

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[88vh] rounded-3xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base text-slate-850 dark:text-slate-100">
                  {d.konu || 'Doğrudan Temin Dosya Bilgileri'}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-lg font-mono font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {d.temin_no ? `DT-${d.butce_yili || '2026'}/${d.temin_no}` : `Dosya No: #${d.id}`}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${turBadgeColorMap[d.tur] || 'bg-slate-100 text-slate-600'}`}>
                  {turLabelMap[d.tur] || d.tur || 'Temin'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${statusColorMap[d.status] || 'bg-slate-100 text-slate-600'}`}>
                  {statusLabelMap[d.status] || d.status || 'Devam Ediyor'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>Kurum / Birim: <strong>{d.birim_adi || 'Birim Belirtilmemiş'}</strong></span>
                <span>•</span>
                <span>Bütçe Yılı: <strong>{d.butce_yili || '2026'}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Üstte Düzenle Butonu */}
            <button
              onClick={() => {
                onClose()
                addTab(`/dosyalar/yeni?id=${d.id}`)
                navigate({ to: `/dosyalar/yeni?id=${d.id}` })
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-all text-xs font-bold cursor-pointer shadow-sm hover:shadow active:scale-95"
              title="Dosya Formunu Düzenle"
            >
              <Edit className="w-3.5 h-3.5" />
              Dosyayı Düzenle
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab('kunye')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'kunye'
                  ? 'bg-blue-600 text-white font-bold shadow-xs shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Dosya Özeti & Künye
            </button>

            <button
              onClick={() => setActiveTab('kalemler')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'kalemler'
                  ? 'bg-blue-600 text-white font-bold shadow-xs shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              İhtiyaç Listesi
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${activeTab === 'kalemler' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                {subData.kalemler.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('firmalar')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'firmalar'
                  ? 'bg-blue-600 text-white font-bold shadow-xs shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Firmalar & Teklifler
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${activeTab === 'firmalar' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                {subData.firmalar.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('komisyon')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'komisyon'
                  ? 'bg-blue-600 text-white font-bold shadow-xs shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Komisyon & Görevliler
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${activeTab === 'komisyon' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                {subData.komisyon.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('rawjson')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'rawjson'
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Geliştirici Ham Veri"
            >
              <Code className="w-3.5 h-3.5" />
              Geliştirici (JSON)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyJson}
              className="gap-1.5 text-xs font-semibold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Kopyalandı' : 'Tüm Veriyi Kopyala'}
            </Button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-6 bg-slate-50/40 dark:bg-slate-950/40">
          {/* TAB 1: KÜNYE & ÖZET (HUMAN-READABLE) */}
          {activeTab === 'kunye' && (
            <div className="space-y-6">
              {/* 4 Ana Metrik Kartı */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                    İhale / Alım Türü
                  </span>
                  <div className="text-sm font-extrabold text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-blue-500" />
                    <span>{turLabelMap[d.tur] || d.tur || 'Mal Alımı'}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Madde: <strong>{d.ihale_sekli || '4734 Sayılı KİK 22/d*'}</strong>
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                    Yaklaşık Maliyet (KDV Hariç)
                  </span>
                  <div className="text-sm font-extrabold font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span>₺{formatMoney(toplamYaklasikMaliyet)}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    KDV Oranı: <strong>%{d.kdv || '20'}</strong>
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                    Dosya Açılış Tarihi
                  </span>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <span>{formatDate(d.acilis_tarihi || d.created_at)}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Son Teklif: <strong>{formatDate(d.son_teklif_tarihi)}</strong>
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                    Sözleşme & Karar
                  </span>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-500" />
                    <span>{d.sozlesme_yapilacak_mi ? 'Sözleşme Yapılacak' : 'Sözleşme Yapılmayacak'}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Karar: <strong>{formatDate(d.temin_tarihi)}</strong>
                  </span>
                </div>
              </div>

              {/* 1. Bölüm: İdari Birim & Görevli Personeller */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3.5">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    1. İdari Birim & Görevli Personeller
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Talep Eden / Harcama Birimi</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{d.birim_adi || d.harcama_birimi || 'Belirtilmemiş'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">İhtiyaç Yeri / Teslim Adresi</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{d.ihtiyac_yeri || 'Belirtilmemiş'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">İrtibat Yetkilisi (Telefon/İletişim)</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{d.irtibat_ad || 'Belirtilmemiş'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Harcama Yetkilisi (Onaylayan)</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{d.onaylayan_ad || 'Belirtilmemiş'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Gerçekleştirme Görevlisi (Sunan)</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{d.sunan_ad || 'Belirtilmemiş'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Piyasa Fiyat Araştırma Görevlisi</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{d.hazirlayan_ad || 'Belirtilmemiş'}</span>
                  </div>
                </div>
              </div>

              {/* 2. Bölüm: İhale & Süreç Koşulları */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3.5">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <Briefcase className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    2. İhale & Süreç Parametreleri
                  </h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">İhale Şekli (KİK Maddesi)</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{d.ihale_sekli || '22/d* Doğrudan Temin'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Teklif / Sözleşme Türü</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{d.teklif_sozlesme_turu || 'Birim Fiyat'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Kısmi Teklif Durumu</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{d.kismi_teklif_verilecek_mi ? 'Kısmi Teklif Verilebilir' : 'Kısmi Teklif Verilemez'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Fiyat Farkı Esası</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{d.fiyat_farki_dayanagi || 'Fiyat Farkı Ödenmeyecektir'}</span>
                  </div>
                </div>
              </div>

              {/* 3. Bölüm: Bütçe & Muhasebe Tertipleri */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3.5">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    3. Bütçe & Muhasebe Tertip Kodları
                  </h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Harcama Birimi</span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate">{d.harcama_birimi || '-'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Muhasebe Birimi</span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate">{d.muhasebe_birimi || '-'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Bütçe Kodu</span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{d.butce_kodu || '-'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Fonksiyonel Kod</span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{d.fonksiyonel_kod || '-'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Finansman Kodu</span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{d.finansman_kodu || '-'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Ekonomik Kod</span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{d.ekonomik_kod || '-'}</span>
                  </div>
                </div>
              </div>

              {/* 4. Bölüm: Açıklama ve Süreç Notları */}
              {d.notlar && (
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      4. Dosya Açıklaması & Notlar
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {d.notlar}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: KALEMLER & İHTİYAÇ LİSTESİ */}
          {activeTab === 'kalemler' && (
            <div className="space-y-4">
              {subData.kalemler.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                  Bu dosyaya henüz malzeme veya ihtiyaç kalemi eklenmemiş.
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-extrabold text-[10.5px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                        <th className="py-3 px-4 w-12 text-center">Sıra</th>
                        <th className="py-3 px-4">Malzeme / Hizmet Adı</th>
                        <th className="py-3 px-4 text-right">Miktar</th>
                        <th className="py-3 px-4 text-center">Birim</th>
                        <th className="py-3 px-4 text-center">KDV</th>
                        <th className="py-3 px-4 text-right">Yaklaşık Birim Fiyat</th>
                        <th className="py-3 px-4 text-right">Toplam Tutar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {subData.kalemler.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-colors">
                          <td className="py-2.5 px-4 font-bold text-slate-400 text-center">{item.sira_no || idx + 1}</td>
                          <td className="py-2.5 px-4">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">{item.kalem_adi}</span>
                            {item.aciklama && (
                              <span className="text-[11px] text-slate-400 block mt-0.5">{item.aciklama}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-700 dark:text-slate-300">{item.miktar}</td>
                          <td className="py-2.5 px-4 text-center text-slate-500">{item.olcu_birimi || item.birim || 'Adet'}</td>
                          <td className="py-2.5 px-4 text-center font-bold text-slate-600 dark:text-slate-400">%{item.kdv_orani || 20}</td>
                          <td className="py-2.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                            {formatMoney(item.yaklasik_maliyet_birim)} ₺
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                            {formatMoney(item.yaklasik_maliyet_toplam)} ₺
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 dark:bg-slate-950 font-bold border-t border-slate-200 dark:border-slate-800 text-xs">
                        <td colSpan={6} className="py-3 px-4 text-right uppercase text-slate-500">Toplam Yaklaşık Maliyet:</td>
                        <td className="py-3 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400 text-sm font-extrabold">
                          ₺{formatMoney(toplamYaklasikMaliyet)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FİRMALAR & TEKLİFLER */}
          {activeTab === 'firmalar' && (
            <div className="space-y-4">
              {subData.firmalar.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                  Bu dosyaya teklif isteyen firma atanmamış.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subData.firmalar.map((f, idx) => (
                    <div
                      key={f.id || idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        f.kazandi_mi
                          ? 'border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-100">
                          {f.unvan || 'Firma'}
                        </h4>
                        {f.kazandi_mi ? (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold shadow-xs">
                            🏆 Kazanan Firma
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                            İstekli Firma
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-[11px] text-slate-500 space-y-1">
                        <div>Yetkili Kişi: <strong className="text-slate-700 dark:text-slate-300">{f.yetkili || 'Belirtilmemiş'}</strong></div>
                        <div>Vergi No / TC: <strong className="text-slate-700 dark:text-slate-300">{f.vergi_no || '-'}</strong> | Tel: <strong className="text-slate-700 dark:text-slate-300">{f.telefon || '-'}</strong></div>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-bold">Teklif Tutarı:</span>
                        <span className="font-mono font-black text-slate-850 dark:text-slate-100 text-sm">
                          ₺{formatMoney(f.toplam_teklif_tutari)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: KOMİSYON & GÖREVLİLER */}
          {activeTab === 'komisyon' && (
            <div className="space-y-4">
              {subData.komisyon.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                  Komisyon üyesi veya piyasa araştırma görevlisi atanmamış.
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-extrabold text-[10.5px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                        <th className="py-3 px-4 w-12 text-center">Sıra</th>
                        <th className="py-3 px-4">Adı Soyadı</th>
                        <th className="py-3 px-4">Kurum Ünvanı</th>
                        <th className="py-3 px-4">Komisyon / Süreç Görevi</th>
                        <th className="py-3 px-4 text-center">Durumu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {subData.komisyon.map((k, idx) => (
                        <tr key={k.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-4 font-bold text-slate-400 text-center">{k.sira || idx + 1}</td>
                          <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200">{k.ad_soyad}</td>
                          <td className="py-2.5 px-4 text-slate-500">{k.personel_unvan || '-'}</td>
                          <td className="py-2.5 px-4 font-bold text-blue-600 dark:text-blue-400">{k.gorev_adi || k.gorev_kod || '-'}</td>
                          <td className="py-2.5 px-4 text-center">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {k.asl_yedek || 'ASIL'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: RAW JSON (DEVELOPER ONLY) */}
          {activeTab === 'rawjson' && (
            <div className="relative">
              <pre className="p-4 bg-slate-950 text-slate-100 rounded-2xl font-mono text-xs overflow-auto max-h-[60vh] border border-slate-800 leading-relaxed select-all">
                {JSON.stringify(fullPayload, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose()
                addTab('/takip')
                navigate({ to: '/takip' })
              }}
              className="text-xs gap-1.5 font-bold"
            >
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              Süreç Takip Paneline Git
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose()
                openDocument({
                  documentId: 'arastirma-mektubu',
                  dosyaId: d.id,
                  documentTitle: 'Piyasa Fiyat Araştırma Mektubu'
                })
              }}
              className="text-xs gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Araştırma Mektubunda Aç
            </Button>
          </div>
          <Button onClick={onClose} size="sm" className="px-5 font-bold">
            Kapat
          </Button>
        </div>
      </div>
    </div>
  )
}
