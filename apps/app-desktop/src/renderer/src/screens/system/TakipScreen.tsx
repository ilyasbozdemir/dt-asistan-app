/* eslint-disable */
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Building,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  FileCheck,
  HelpCircle,
  Layers,
  Calculator,
  FileSpreadsheet,
  Coins,
  Printer,
  FileText
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { useDosyalarHooks } from '../dosyalar/dosyalar.hooks'
import { Button } from '../../components/ui/Button'
import { useEffect, useState } from 'react'

export function TakipScreen(): React.JSX.Element {
  const { activeDosyaId, setActiveDosyaId } = useWorkspaceStore()
  const { dosyalar } = useDosyalarHooks()

  // 1. Fetch active dossier details
  const activeDosya = dosyalar.find((d) => d.id === activeDosyaId)
  const [notificationSent, setNotificationSent] = useState(false)

  // Fetch Documents generated for this dossier
  const { data: dbBelgeler = [], refetch: refetchBelgeler } = useQuery<any[]>({
    queryKey: ['takip_belgeler', activeDosyaId],
    queryFn: async () => {
      if (!activeDosyaId) return []
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT * FROM DATA_TeminBelge WHERE temin_dosya_id = ${activeDosyaId}`
      )
      if (!res.success) return []
      return res.data
    },
    enabled: !!activeDosyaId
  })

  // 2. Fetch stages from DB
  const { data: dbAsamalar = [] } = useQuery<any[]>({
    queryKey: ['takip_asamalar'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Asama WHERE aktif_mi = 1 ORDER BY asama_sira ASC'
      )
      if (!res.success) return []
      return res.data
    }
  })

  // 3. Fetch ALL documents across all dossiers (for general metrics)
  const { data: allBelgeler = [] } = useQuery<any[]>({
    queryKey: ['takip_tum_belgeler'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id, belge_adi, is_signed, temin_dosya_id FROM DATA_TeminBelge'
      )
      if (!res.success) return []
      return res.data
    },
    enabled: !activeDosyaId
  })

  // Fetch Kalemler (Materials/Items) for this dossier
  const { data: kalemler = [] } = useQuery<any[]>({
    queryKey: ['takip_kalemler', activeDosyaId],
    queryFn: async () => {
      if (!activeDosyaId) return []
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT * FROM DATA_TeminKalem WHERE temin_dosya_id = ${activeDosyaId} ORDER BY id ASC`
      )
      if (!res.success) return []
      return res.data
    },
    enabled: !!activeDosyaId
  })

  // Fetch Firmalar (Bidders/Proposals) for this dossier
  const { data: firmalar = [] } = useQuery<any[]>({
    queryKey: ['takip_firmalar', activeDosyaId],
    queryFn: async () => {
      if (!activeDosyaId) return []
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT df.*, f.unvan 
         FROM DATA_TeminFirma df 
         JOIN TANIM_Firma f ON df.firma_id = f.id 
         WHERE df.temin_dosya_id = ${activeDosyaId}`
      )
      if (!res.success) return []
      return res.data
    },
    enabled: !!activeDosyaId
  })

  // Fallback stages if db is empty
  const stages =
    dbAsamalar.length > 0
      ? dbAsamalar
      : [
          {
            asama_sira: 1,
            asama_adi: 'İhtiyaç Tespiti & Başlangıç',
            aciklama: 'İhtiyacın belirlendiği ve sürecin başlatıldığı ilk adım.'
          },
          {
            asama_sira: 2,
            asama_adi: 'Piyasa Fiyat Araştırması',
            aciklama: 'Tekliflerin toplandığı ve yaklaşık maliyetin belirlendiği aşama.'
          },
          {
            asama_sira: 3,
            asama_adi: 'Sipariş & Sözleşme',
            aciklama: 'Sözleşme/sipariş onayı ve kazanan firma atama aşaması.'
          },
          {
            asama_sira: 4,
            asama_adi: 'Kabul & Ödeme İşlemleri',
            aciklama: 'Mal/hizmet teslimatı, muayene kabulü ve fatura ödeme adımı.'
          }
        ]

  const currentAsamaSira = activeDosya?.durum_asama_id || 1

  // Format Currency Helper
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(value)
  }

  // Handle toggle signed state (imzalandı ↔ imzalanmadı)
  const handleToggleSign = async (belgeId: number, currentState: number) => {
    try {
      const newState = currentState ? 0 : 1
      const res = await window.electron.ipcRenderer.invoke(
        'db:execute',
        `UPDATE DATA_TeminBelge SET is_signed = ${newState} WHERE id = ${belgeId}`
      )
      if (res.success) {
        refetchBelgeler()
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Smart Desktop Notifications
  useEffect(() => {
    if (activeDosya && !notificationSent) {
      let missingCount = dbBelgeler.filter((b) => !b.is_signed).length

      // Calculate deadline warning
      let deadlineMsg = ''
      if (activeDosya.son_teklif_verme_tarihi) {
        const diffMs = new Date(activeDosya.son_teklif_verme_tarihi).getTime() - Date.now()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        if (diffDays <= 2 && diffDays >= 0) {
          deadlineMsg = `Son teklif verme tarihine ${diffDays} gün kaldı! `
        } else if (diffDays < 0) {
          deadlineMsg = `Son teklif verme süresi doldu! `
        }
      }

      if (deadlineMsg || missingCount > 0) {
        const notification = new window.Notification('DT Asistan - Akıllı Hatırlatıcı', {
          body: `${deadlineMsg}${
            missingCount > 0 ? `İmzası eksik ${missingCount} evrakınız bulunuyor.` : ''
          }`,
          icon: '/icon.png'
        })
        notification.onclick = () => {
          window.focus()
        }
        setNotificationSent(true)
      }
    }
  }, [activeDosya, dbBelgeler, notificationSent])

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-855 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-blue-600" />
            Süreç Takip & Durum Paneli
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Doğrudan temin dosyalarınızın yasal işlem adımlarını ve belge tamamlama durumlarını
            buradan izleyebilirsiniz.
          </p>
        </div>
      </div>

      {activeDosya ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: STEPPER & STAGE TIMELINE */}
          <div className="lg:col-span-8 space-y-6">
            {/* ACTIVE FILE SUMMARY & ACTIONS PANEL */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
              {/* Dossier Basic Info */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-450 uppercase tracking-widest bg-blue-100/40 dark:bg-blue-955/40 px-2.5 py-1 rounded-full border border-blue-500/15">
                    {activeDosya.temin_no || 'Dosya No Belirtilmedi'}
                  </span>
                  <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
                    {activeDosya.konu}
                  </h2>
                  <p className="text-xs text-slate-550 dark:text-slate-400 capitalize">
                    Tür:{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-350">
                      {activeDosya.tur} Alımı
                    </span>{' '}
                    | Birim:{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-350">
                      {activeDosya.birim_adi || 'Birim Belirtilmedi'}
                    </span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Yaklaşık Maliyet
                  </span>
                  <span className="text-xl font-mono font-extrabold text-slate-850 dark:text-slate-100">
                    {formatCurrency(activeDosya.yaklasik_maliyet || 0)}
                  </span>
                </div>
              </div>

              {/* Process Navigation Grid (Drill down options) */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-3 select-none">
                  Süreç Adımları Hızlı Erişim Paneli
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {/* İhtiyaç ve Hazırlık */}
                  <Link
                    to="/dosya/hazirlik-ve-ihtiyac"
                    className="group p-4 bg-slate-50/50 hover:bg-blue-50/40 dark:bg-slate-900/50 dark:hover:bg-blue-950/10 border border-slate-200/60 hover:border-blue-200 dark:border-slate-800 dark:hover:border-blue-900/40 rounded-2xl transition-all flex flex-col justify-between min-h-[96px] cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-450 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        İhtiyaç & Hazırlık
                      </span>
                      <span className="text-[9.5px] text-slate-500 dark:text-slate-400 block leading-tight mt-0.5">
                        Malzeme Girişi & Başlangıç Onayı
                      </span>
                    </div>
                  </Link>

                  {/* Yaklaşık Maliyet */}
                  <Link
                    to="/dosya/firmalar-maliyet/yaklasik"
                    className="group p-4 bg-slate-50/50 hover:bg-indigo-50/40 dark:bg-slate-900/50 dark:hover:bg-indigo-950/10 border border-slate-200/60 hover:border-indigo-200 dark:border-slate-800 dark:hover:border-indigo-900/40 rounded-2xl transition-all flex flex-col justify-between min-h-[96px] cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-405 flex items-center justify-center">
                        <Calculator className="w-4 h-4" />
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Yaklaşık Maliyet Cetveli
                      </span>
                      <span className="text-[9.5px] text-slate-500 dark:text-slate-400 block leading-tight mt-0.5">
                        Fiyat Girişleri & Maliyet Tespiti
                      </span>
                    </div>
                  </Link>

                  {/* Piyasa Fiyat Araştırması */}
                  <Link
                    to="/dosya/piyasa-fiyat-arastirmasi"
                    className="group p-4 bg-slate-50/50 hover:bg-emerald-50/40 dark:bg-slate-900/50 dark:hover:bg-emerald-950/10 border border-slate-200/60 hover:border-emerald-200 dark:border-slate-800 dark:hover:border-emerald-900/40 rounded-2xl transition-all flex flex-col justify-between min-h-[96px] cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 flex items-center justify-center">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Teklifler & Araştırma
                      </span>
                      <span className="text-[9.5px] text-slate-500 dark:text-slate-400 block leading-tight mt-0.5">
                        Firma Teklifleri & Karar Tutanağı
                      </span>
                    </div>
                  </Link>

                  {/* Sipariş ve Sözleşme */}
                  <Link
                    to="/dosya/siparis-ve-sozlesme"
                    className="group p-4 bg-slate-50/50 hover:bg-amber-50/40 dark:bg-slate-900/50 dark:hover:bg-amber-950/10 border border-slate-200/60 hover:border-amber-200 dark:border-slate-800 dark:hover:border-amber-900/40 rounded-2xl transition-all flex flex-col justify-between min-h-[96px] cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-450 flex items-center justify-center">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Onay Belgesi & Sözleşme
                      </span>
                      <span className="text-[9.5px] text-slate-500 dark:text-slate-400 block leading-tight mt-0.5">
                        Sipariş Mektubu & Sözleşme Hazırlama
                      </span>
                    </div>
                  </Link>

                  {/* Kabul ve Ödeme */}
                  <Link
                    to="/dosya/kabul-ve-odeme"
                    className="group p-4 bg-slate-50/50 hover:bg-purple-50/40 dark:bg-slate-900/50 dark:hover:bg-purple-950/10 border border-slate-200/60 hover:border-purple-200 dark:border-slate-800 dark:hover:border-purple-900/40 rounded-2xl transition-all flex flex-col justify-between min-h-[96px] cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-650 dark:text-purple-400 flex items-center justify-center">
                        <Coins className="w-4 h-4" />
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Kabul, Ödeme & Hakediş
                      </span>
                      <span className="text-[9.5px] text-slate-500 dark:text-slate-400 block leading-tight mt-0.5">
                        Muayene Kabul, TİF & Ödeme Emri
                      </span>
                    </div>
                  </Link>

                  {/* Çıktı Merkezi */}
                  <Link
                    to="/dosya/cikti-merkezi"
                    className="group p-4 bg-slate-50/50 hover:bg-pink-50/40 dark:bg-slate-900/50 dark:hover:bg-pink-950/10 border border-slate-200/60 hover:border-pink-200 dark:border-slate-800 dark:hover:border-pink-900/40 rounded-2xl transition-all flex flex-col justify-between min-h-[96px] cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                        <Printer className="w-4 h-4" />
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Dosya Çıktı Merkezi
                      </span>
                      <span className="text-[9.5px] text-slate-500 dark:text-slate-400 block leading-tight mt-0.5">
                        İndeks, Sırtlıklar & Tüm Çıktılar
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* PROCESS PROGRESS BAR */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-2 border-b border-slate-100 dark:border-slate-800/60">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  İşlem Aşaması İlerleme Durumu
                </h3>
                <Link
                  to="/yardim"
                  search={{ doc: 'dogrudan_temin_islem_sureci' }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-750 dark:text-blue-400 dark:hover:text-blue-305 flex items-center gap-1.5 bg-blue-50 dark:bg-blue-955/20 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-900/40 transition-all cursor-pointer shadow-xs"
                >
                  <HelpCircle className="w-3.5 h-3.5 animate-pulse" />
                  İşlem Süreci Akış Şeması
                </Link>
              </div>

              {/* Progress Line stepper */}
              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-4 mt-4">
                {/* Horizontal connection line */}
                <div className="absolute top-5 left-5 right-5 h-1 bg-slate-100 dark:bg-slate-800 hidden md:block z-0" />

                {stages.map((asama) => {
                  const isCompleted = asama.asama_sira < currentAsamaSira
                  const isActive = asama.asama_sira === currentAsamaSira

                  return (
                    <div
                      key={asama.asama_sira}
                      className="flex md:flex-col items-start md:items-center text-left md:text-center flex-1 relative z-10 gap-3 md:gap-2 group"
                    >
                      {/* Step node */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
                            : isActive
                              ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20 scale-110'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                        ) : (
                          <span className="text-xs font-bold">{asama.asama_sira}</span>
                        )}
                      </div>

                      {/* Step Labels */}
                      <div className="flex flex-col md:items-center mt-1">
                        <span
                          className={`text-xs font-extrabold transition-colors duration-300 ${
                            isActive
                              ? 'text-blue-600 dark:text-blue-450'
                              : isCompleted
                                ? 'text-emerald-600 dark:text-emerald-500'
                                : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {asama.asama_adi}
                        </span>
                        <p className="text-[10px] text-slate-450 mt-1 max-w-[160px] line-clamp-2 md:block hidden">
                          {asama.aciklama}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* MALZEMELER VE FİRMALAR GRİDİ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Malzemeler */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-855 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  📦 Malzeme / Hizmet Kalemleri
                </h3>
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-inner max-h-[220px] overflow-y-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-655 dark:text-slate-400">
                      <tr>
                        <th className="p-3">Malzeme Adı</th>
                        <th className="p-3 text-center">Miktar</th>
                        <th className="p-3 text-center">Birim</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-600 dark:text-slate-450">
                      {kalemler.map((item: any) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/55 dark:hover:bg-slate-900/10"
                        >
                          <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                            {item.kalem_adi}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                            {item.miktar}
                          </td>
                          <td className="p-3 text-center text-slate-500 dark:text-slate-400">
                            {item.olcu_birimi || 'Adet'}
                          </td>
                        </tr>
                      ))}
                      {kalemler.length === 0 && (
                        <tr>
                          <td colSpan={3} className="p-6 text-center text-slate-400 italic">
                            Dosyada henüz kayıtlı malzeme bulunmuyor.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tedarikçiler */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-855 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  💼 Teklif Veren İstekliler / Firmalar
                </h3>
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-inner max-h-[220px] overflow-y-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-655 dark:text-slate-400">
                      <tr>
                        <th className="p-3">Firma Ünvanı</th>
                        <th className="p-3 text-center">Teklif Durumu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-600 dark:text-slate-450">
                      {firmalar.map((f: any) => (
                        <tr key={f.id} className="hover:bg-slate-50/55 dark:hover:bg-slate-900/10">
                          <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                            {f.unvan}
                          </td>
                          <td className="p-3 text-center">
                            <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 px-2.5 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-800 font-extrabold tracking-tight">
                              Teklif Eklendi
                            </span>
                          </td>
                        </tr>
                      ))}
                      {firmalar.length === 0 && (
                        <tr>
                          <td colSpan={2} className="p-6 text-center text-slate-400 italic">
                            Dosyada henüz kayıtlı firma teklifi bulunmuyor.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* DETAIL CARDS FOR STAGES */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Aşama Detayları ve Açıklamalar
              </h3>

              {stages.map((asama) => {
                const isActive = asama.asama_sira === currentAsamaSira
                const isCompleted = asama.asama_sira < currentAsamaSira

                return (
                  <div
                    key={asama.asama_sira}
                    className={`p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                      isActive
                        ? 'bg-blue-50/50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900/50 shadow-xs'
                        : isCompleted
                          ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-850 opacity-80'
                          : 'bg-slate-50/40 dark:bg-slate-900/20 border-slate-100 dark:border-slate-900/50 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : isCompleted
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {asama.asama_sira}. Aşama: {asama.asama_adi}
                        </h4>
                        {isActive && (
                          <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-500/10 uppercase tracking-wider">
                            Aktif İşlem Aşaması
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-100/50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/10 uppercase tracking-wider">
                            Tamamlandı
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
                        {asama.aciklama || 'Bu aşama için bir açıklama girilmemiş.'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm sticky top-6">
              {/* UPLOAD SIGNED DOCUMENTS SECTION */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <FileCheck className="w-5 h-5 text-indigo-500" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Üretilen Belgeler ve İmza Takibi
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Sistemden üretilmiş dosyaların ıslak imzalı kopyalarını buradan takip
                    edebilirsiniz.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {dbBelgeler.length === 0 ? (
                  <div className="p-3 text-xs text-slate-500 text-center italic bg-slate-50 dark:bg-slate-900 rounded-lg">
                    Henüz bu dosya için belge üretilmemiş.
                  </div>
                ) : (
                  dbBelgeler.map((belge) => (
                    <div
                      key={belge.id}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors duration-200 ${
                        belge.is_signed
                          ? 'bg-emerald-50/30 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30'
                          : 'bg-slate-50/50 border-slate-200 dark:bg-slate-900 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                            belge.is_signed ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                          }`}
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {belge.belge_adi}
                        </span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={belge.is_signed ? 'true' : 'false'}
                        onClick={() => handleToggleSign(belge.id, belge.is_signed)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer ${
                          belge.is_signed
                            ? 'bg-emerald-500 focus:ring-emerald-400'
                            : 'bg-slate-300 dark:bg-slate-600 focus:ring-slate-400'
                        }`}
                        title={belge.is_signed ? 'İmzayı kaldır' : 'İmzalandı olarak işaretle'}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                            belge.is_signed ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                      <span
                        className={`text-[10px] font-bold flex items-center gap-1 min-w-[70px] justify-end ${
                          belge.is_signed
                            ? 'text-emerald-600 dark:text-emerald-500'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {belge.is_signed ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> İmzalandı
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5" /> Bekliyor
                          </>
                        )}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* NO ACTIVE DOSSIER SELECTED STATE - GENEL METRİK PANELİ */
        <div className="flex flex-col gap-6 max-w-5xl mx-auto my-6 w-full">
          <div className="p-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-955/50 text-blue-600 dark:text-blue-450 flex items-center justify-center">
              <ClipboardList className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-105">
                Takip Edilecek Aktif Dosya Seçilmedi
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
                Süreçlerin aşama aşama takibini ve evrak kontrolünü görmek için listeden bir dosya
                seçerek aktif hale getirin veya aşağıdaki genel durumu inceleyin.
              </p>
            </div>
            <Link to="/dosyalar">
              <Button className="bg-blue-600 hover:bg-blue-700 text-xs font-semibold py-2 px-5 flex items-center gap-2 mt-2">
                <Building className="w-4 h-4" />
                Tüm Dosyaları Gör
              </Button>
            </Link>
          </div>

          {/* GENEL METRİK KARTLARI */}
          {dosyalar.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Toplam Dosya */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                      <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                    {dosyalar.length}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Toplam Dosya</p>
                </div>

                {/* İmza Bekleyen Belge */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                    {allBelgeler.filter((b) => !b.is_signed).length}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">İmza Bekleyen Belge</p>
                </div>

                {/* İmzalanan Belge */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                    {allBelgeler.filter((b) => b.is_signed).length}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">İmzalanan Belge</p>
                </div>

                {/* Toplam Yaklaşık Maliyet */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center">
                      <Building className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    </div>
                  </div>
                  <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                    {formatCurrency(
                      dosyalar.reduce((sum, d) => sum + (d.yaklasik_maliyet || 0), 0)
                    )}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Toplam Yaklaşık Maliyet</p>
                </div>
              </div>

              {/* AŞAMA DAĞILIMI */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <Layers className="w-5 h-5 text-indigo-500" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Aşama Dağılımı
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Tüm dosyaların süreç aşamalarına göre dağılımı
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {stages.map((asama) => {
                    const count = dosyalar.filter(
                      (d) => (d.durum_asama_id || 1) === asama.asama_sira
                    ).length
                    const pct = dosyalar.length > 0 ? (count / dosyalar.length) * 100 : 0
                    return (
                      <div
                        key={asama.asama_sira}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {asama.asama_sira}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                              {asama.asama_adi}
                            </span>
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 ml-2 shrink-0">
                              {count} dosya
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* SON İŞLEM GÖREN DOSYALAR */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Son İşlem Gören Dosyalar
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Hızlıca çalışmaya devam etmek için bir dosyaya tıklayın
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {dosyalar.slice(0, 5).map((dosya) => {
                    const stageInfo = dbAsamalar.find(
                      (a) => a.asama_sira === (dosya.durum_asama_id || 1)
                    )
                    const stageName = stageInfo?.asama_adi || 'Süreç Başlangıcı'

                    return (
                      <div
                        key={dosya.id}
                        onClick={() => setActiveDosyaId(dosya.id)}
                        className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 hover:bg-blue-50 dark:bg-slate-900/30 dark:hover:bg-blue-900/10 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-colors">
                            <FileCheck className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                              {dosya.konu || 'İsimsiz Temin'}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                              <span className="font-mono bg-slate-200/50 dark:bg-slate-700/50 px-1 rounded">
                                {dosya.temin_no}
                              </span>
                              <span>•</span>
                              <span>{dosya.tur} Alımı</span>
                              <span>•</span>
                              <span>{formatCurrency(dosya.yaklasik_maliyet || 0)}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-200/50 dark:bg-slate-850 text-slate-600 dark:text-slate-300">
                            {stageName}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
