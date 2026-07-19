import React, { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck,
  PackageSearch,
  Percent,
  ShieldCheck,
  TrendingDown,
  Trophy
} from 'lucide-react'
import { cn } from '../../../../utils/cn'
import { SubScreen } from '../../SubScreens.screen'
import { DocumentPreviewModal } from '../../components/DocumentPreviewModal'
import { normalizeForMatch, useDosyaAsamasiSablons } from './useDosyaAsamasiSablons'
import { PrintDropdownButton } from '../../components/PrintDropdownButton'
import { useSettingsStore } from '../../../../store/settingsStore'
import { useWorkspaceStore } from '../../../../store/workspaceStore'
import { APP_ROUTES } from '../../../../constants/routeConstants'
import { WinnerDocumentsMenu } from './components/WinnerDocumentsMenu'

export function SiparisVeSozlesme(): React.JSX.Element {
  const {
    activeStarredDocs,
    sablons,
    ciktiLoading,
    masterHtml,
    dosyaContext,
    placeholders,
    contextsByPath,
    personelListesi,
    previewModalOpen,
    setPreviewModalOpen,
    previewData,
    handleOpenPreviewForSablon,
    executePrint,
    executeExportPdf,
    executeExportDocx,
    executeExportUdf,
    quickPrint,
    quickExport,
    quickOpenExternal,
    toggleStar,
    refreshSnapshot,
    saveSnapshot,
    isSablonDisabled
  } = useDosyaAsamasiSablons()

  const { disableDocumentGuidance } = useSettingsStore()
  const { activeDosyaId } = useWorkspaceStore()

  const stageSablons = sablons.filter(
    (s) => s.kategori === '3-siparis-ve-sozlesme' || s.kategori === '3. Sipariş & Sözleşme'
  )

  // Kazanan firma guard state
  const [kazananFirmaId, setKazananFirmaId] = useState<number | null | undefined>(undefined) // undefined = yükleniyor
  const [kazananFirmaUnvan, setKazananFirmaUnvan] = useState<string>('')

  // İstatistik verileri
  const [firmaStats, setFirmaStats] = useState<{
    teklifToplami: number | null
    yaklasikMaliyet: number | null
    teslimTarihi: string | null
    yasaklilikDurumu: string | null
    vergiNo: string | null
    teklifSozlesmeTuru: string | null
    sozlesmeYapilacakMi: number
    istekliFirmaSayisi: number
  }>({
    teklifToplami: null,
    yaklasikMaliyet: null,
    teslimTarihi: null,
    yasaklilikDurumu: null,
    vergiNo: null,
    teklifSozlesmeTuru: null,
    sozlesmeYapilacakMi: 0,
    istekliFirmaSayisi: 0
  })

  useEffect(() => {
    if (!activeDosyaId) return

    const checkKazananFirma = async (): Promise<void> => {
      try {
        // Ana dosya + firma bilgisi
        const res = await window.electron.ipcRenderer.invoke(
          'db:query',
          `SELECT d.firma_id, f.unvan, f.vergi_no,
                  d.yaklasik_maliyet, d.teslim_tarihi,
                  d.teklif_sozlesme_turu, d.sozlesme_yapilacak_mi
           FROM DATA_TeminDosyasi d
           LEFT JOIN TANIM_Firma f ON d.firma_id = f.id
           WHERE d.id = ?`,
          [activeDosyaId]
        )

        if (res.success && res.data && res.data.length > 0) {
          const row = res.data[0]
          setKazananFirmaId(row.firma_id || null)
          setKazananFirmaUnvan(row.unvan || '')

          // Kazanan firmanın teklif toplamı ve yasaklılık durumu
          let teklifToplami: number | null = null
          let yasaklilikDurumu: string | null = null
          if (row.firma_id) {
            const teklifRes = await window.electron.ipcRenderer.invoke(
              'db:query',
              `SELECT tf.teklif_toplami, tf.yasaklilik_durumu
               FROM DATA_TeminFirma tf
               WHERE tf.temin_dosya_id = ? AND tf.firma_id = ?`,
              [activeDosyaId, row.firma_id]
            )
            if (teklifRes.success && teklifRes.data?.length > 0) {
              teklifToplami = teklifRes.data[0].teklif_toplami
              yasaklilikDurumu = teklifRes.data[0].yasaklilik_durumu
            }
          }

          // İstekli firma sayısı
          const firmCountRes = await window.electron.ipcRenderer.invoke(
            'db:query',
            `SELECT COUNT(*) as cnt FROM DATA_TeminFirma WHERE temin_dosya_id = ?`,
            [activeDosyaId]
          )
          const istekliFirmaSayisi =
            firmCountRes.success && firmCountRes.data?.length > 0 ? firmCountRes.data[0].cnt : 0

          setFirmaStats({
            teklifToplami,
            yaklasikMaliyet: row.yaklasik_maliyet || null,
            teslimTarihi: row.teslim_tarihi || null,
            yasaklilikDurumu,
            vergiNo: row.vergi_no || null,
            teklifSozlesmeTuru: row.teklif_sozlesme_turu || null,
            sozlesmeYapilacakMi: row.sozlesme_yapilacak_mi || 0,
            istekliFirmaSayisi
          })
        } else {
          setKazananFirmaId(null)
        }
      } catch {
        setKazananFirmaId(null)
      }
    }

    checkKazananFirma()
  }, [activeDosyaId])

  // Hesaplamalar
  const tasarrufOrani =
    firmaStats.yaklasikMaliyet && firmaStats.teklifToplami
      ? ((firmaStats.yaklasikMaliyet - firmaStats.teklifToplami) / firmaStats.yaklasikMaliyet) * 100
      : null

  const formatCurrency = (val: number | null): string => {
    if (val === null || val === undefined) return '—'
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(val)
  }

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '—'
    try {
      const d = new Date(dateStr)
      return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }).format(d)
    } catch {
      return dateStr
    }
  }

  if (previewData && previewModalOpen) {
    const isStarred = previewData?.title
      ? activeStarredDocs.some(
          (d) => normalizeForMatch(d) === normalizeForMatch(previewData.title || '')
        )
      : false

    return (
      <DocumentPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title={previewData.title}
        templateHtml={previewData.templateHtml}
        masterHtml={masterHtml || ''}
        baseContext={
          previewData.snapshotContext || contextsByPath[previewData.processPath] || dosyaContext
        }
        placeholders={placeholders}
        personelListesi={personelListesi}
        onPrint={executePrint}
        onExportPdf={executeExportPdf}
        onExportDocx={executeExportDocx}
        onExportUdf={executeExportUdf}
        isStarred={isStarred}
        onToggleStar={() => previewData?.title && toggleStar(previewData.title)}
        isInline={true}
        templateTestVerisi={previewData.templateTestVerisi}
        dosyaAdi={previewData.dosyaAdi}
        onRefreshSnapshot={refreshSnapshot}
        onSaveSnapshot={saveSnapshot}
      />
    )
  }

  return (
    <SubScreen
      title="Sipariş & Sözleşme"
      icon={FileCheck}
      description="Doğrudan temin onay belgesi, ihale komisyon kararı ve sözleşmeye davet gibi dökümanları hazırlayabilir, doğrudan temin sözleşme süreçlerinizi bu panelden yönetebilirsiniz."
    >
      {/* Yükleniyor durumu */}
      {kazananFirmaId === undefined && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-sm text-slate-500">Kontrol ediliyor...</span>
        </div>
      )}

      {/* Kazanan firma YOK → Guard uyarısı */}
      {kazananFirmaId === null && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
          {/* Uyarı Banner */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700/60 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 border border-amber-300/50 dark:border-amber-700/40">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-extrabold text-amber-800 dark:text-amber-300">
                  Kazanan Firma Belirlenmedi
                </h3>
                <p className="text-xs text-amber-700 dark:text-amber-400/90 leading-relaxed max-w-xl">
                  Sipariş &amp; Sözleşme belgelerini oluşturabilmek için önce{' '}
                  <strong>Piyasa Fiyat Araştırması</strong> adımında kazanan firmayı belirlemeniz
                  gerekir. Tutanağı kaydederken <em>&ldquo;En Düşük Teklifi Kazanan Yap&rdquo;</em>{' '}
                  seçeneğini işaretleyin ya da açılan firma listesinden kazananı elle seçin.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-amber-200 dark:border-amber-800/60 pt-4">
              <Link
                to={APP_ROUTES.PIYASA_FIYAT_ARASTIRMASI}
                className="flex items-center gap-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer border-0"
              >
                <PackageSearch className="w-4 h-4" />
                Piyasa Fiyat Araştırması&apos;na Git
              </Link>
              <Link
                to={APP_ROUTES.PIYASA_FIYAT_ARASTIRMASI}
                className="flex items-center gap-2 text-xs font-bold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Geri Dön
              </Link>
            </div>
          </div>

          {/* Adım akışı bilgi kartı */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Süreç Adımları
            </h4>
            <ol className="flex flex-col gap-2">
              {[
                { step: '1', label: 'Hazırlık & İhtiyaç', done: true },
                {
                  step: '2',
                  label: 'Piyasa Fiyat Araştırması — Kazanan firma belirle',
                  done: false,
                  current: true
                },
                { step: '3', label: 'Sipariş & Sözleşme', done: false },
                {
                  step: '4',
                  label: 'Muayene & Kabul & Ödeme İşlemleri',
                  done: false
                },
                { step: '5', label: 'Klasör & Kapaklar', done: false }
              ].map((item) => (
                <li
                  key={item.step}
                  className={`flex items-center gap-3 text-xs font-bold px-3 py-2 rounded-xl transition-colors ${
                    item.current
                      ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
                      : item.done
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400 dark:text-slate-600'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                      item.current
                        ? 'bg-amber-500 text-white'
                        : item.done
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {item.step}
                  </span>
                  {item.label}
                  {item.current && (
                    <span className="ml-auto text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20">
                      Bekliyor
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Kazanan firma VAR → Normal içerik */}
      {kazananFirmaId && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
          {/* ═══ Kazanan Firma Bilgi Kartı (Genişletilmiş) ═══ */}
          <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50/30 dark:from-emerald-950/20 dark:via-slate-900 dark:to-teal-950/10 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-5 shadow-sm">
            {/* Üst: Firma adı + badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0 border border-emerald-300/40 dark:border-emerald-700/40">
                  <Trophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">
                    Kazanan / Yüklenici Firma
                  </span>
                  <span className="text-sm font-extrabold text-emerald-800 dark:text-emerald-300">
                    {kazananFirmaUnvan || 'Seçili Firma'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Yasaklılık durumu badge */}
                {firmaStats.yasaklilikDurumu && (
                  <span
                    className={cn(
                      'px-2 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1',
                      firmaStats.yasaklilikDurumu === 'Temiz' &&
                        'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50',
                      firmaStats.yasaklilikDurumu === 'Yasaklı' &&
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50',
                      firmaStats.yasaklilikDurumu === 'Sorgulanmadı' &&
                        'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    )}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    {firmaStats.yasaklilikDurumu}
                  </span>
                )}
                {firmaStats.vergiNo && (
                  <span className="px-2 py-1 rounded-lg text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-mono">
                    VKN: {firmaStats.vergiNo}
                  </span>
                )}
              </div>
            </div>

            {/* Alt: İstatistik kartları */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Teklif Tutarı */}
              <div className="bg-white/70 dark:bg-slate-800/50 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <Banknote className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Teklif Tutarı
                  </span>
                </div>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                  {formatCurrency(firmaStats.teklifToplami)}
                </span>
              </div>

              {/* Yaklaşık Maliyet */}
              <div className="bg-white/70 dark:bg-slate-800/50 rounded-xl p-3 border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingDown className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Yaklaşık Maliyet
                  </span>
                </div>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                  {formatCurrency(firmaStats.yaklasikMaliyet)}
                </span>
              </div>

              {/* Tasarruf Oranı */}
              <div className="bg-white/70 dark:bg-slate-800/50 rounded-xl p-3 border border-violet-100 dark:border-violet-900/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <Percent className="w-3.5 h-3.5 text-violet-500" />
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Tasarruf
                  </span>
                </div>
                <span
                  className={cn(
                    'text-sm font-extrabold',
                    tasarrufOrani !== null && tasarrufOrani >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400',
                    tasarrufOrani === null && 'text-slate-400'
                  )}
                >
                  {tasarrufOrani !== null ? `%${tasarrufOrani.toFixed(1)}` : '—'}
                </span>
              </div>

              {/* Teslim Tarihi / Firma Sayısı */}
              <div className="bg-white/70 dark:bg-slate-800/50 rounded-xl p-3 border border-amber-100 dark:border-amber-900/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Teslim Tarihi
                  </span>
                </div>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                  {formatDate(firmaStats.teslimTarihi)}
                </span>
              </div>
            </div>

            {/* Alt bilgi çubuğu */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-emerald-100 dark:border-emerald-900/30">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {firmaStats.istekliFirmaSayisi} istekli firma
              </span>
              {firmaStats.teklifSozlesmeTuru && (
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  📋 {firmaStats.teklifSozlesmeTuru}
                </span>
              )}
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                📝 Sözleşme: {firmaStats.sozlesmeYapilacakMi ? 'Yapılacak' : 'Yapılmayacak'}
              </span>
            </div>
          </div>

          {/* ═══ Ana İçerik Kartı ═══ */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-end border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2 relative">
                <WinnerDocumentsMenu
                  onPrintResultApproval={() => {
                    // Sonuç Onay Belgesi
                  }}
                  onPrintAcceptanceLetter={() => {
                    // Kabul Yazısı
                  }}
                  onEkapBlacklistQuery={() => {
                    window.electron?.ipcRenderer.send('window:open-external', {
                      url: 'https://ekapv2.kik.gov.tr/sorgulamalar/yasak-sorgulama',
                      title: 'EKAP Kamu İhale Yasaklı Sorgulama'
                    })
                  }}
                  onEdevletBlacklistQuery={() => {
                    window.electron?.ipcRenderer.send('window:open-external', {
                      url: 'https://www.turkiye.gov.tr/kik-yasakli-sorgula',
                      title: 'e-Devlet KİK Yasaklılık Sorgulama'
                    })
                  }}
                />

                {stageSablons.length > 0 && (
                  <div>
                    <PrintDropdownButton
                      kategori="3-siparis-ve-sozlesme"
                      sablons={sablons}
                      overrideSablons={stageSablons}
                      activeStarredDocs={activeStarredDocs}
                      ciktiLoading={ciktiLoading}
                      handleOpenPreviewForSablon={handleOpenPreviewForSablon}
                      quickPrint={quickPrint}
                      quickExport={quickExport}
                      quickOpenExternal={quickOpenExternal}
                      isSablonDisabled={isSablonDisabled}
                      buttonHeightClass="h-10"
                      label={disableDocumentGuidance ? 'İşlemler' : 'Belgeleri Yazdır'}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ═══ Süreç Adımları Timeline ═══ */}
            <div className="flex flex-col gap-0">
              {[
                {
                  icon: FileCheck,
                  label: 'Sonuç Onay Belgesi',
                  desc: 'Piyasa fiyat araştırması sonuç onay belgesini hazırlayın',
                  color: 'emerald' as const
                },
                {
                  icon: ShieldCheck,
                  label: 'Yasaklılık Sorgulaması',
                  desc: 'Kazanan firmanın EKAP ve e-Devlet yasaklılık kontrolünü yapın',
                  color: 'orange' as const
                },
                {
                  icon: Building2,
                  label: 'Kabul Yazısı / Tebligat',
                  desc: 'Kazanan firmaya sonucun tebliğ edilmesi',
                  color: 'blue' as const
                },
                {
                  icon: Clock,
                  label: 'Sözleşmeye Davet',
                  desc: 'Firmayı sözleşme imzalamaya davet edin (10 gün süre)',
                  color: 'violet' as const
                },
                {
                  icon: CheckCircle2,
                  label: 'Sözleşme İmzalama',
                  desc: 'Doğrudan temin sözleşmesini hazırlayın ve imzalayın',
                  color: 'cyan' as const
                }
              ].map((step, index, arr) => {
                const colorClasses = {
                  emerald: {
                    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
                    border: 'border-emerald-300 dark:border-emerald-700',
                    text: 'text-emerald-600 dark:text-emerald-400',
                    line: 'bg-emerald-200 dark:bg-emerald-800'
                  },
                  orange: {
                    bg: 'bg-orange-100 dark:bg-orange-900/30',
                    border: 'border-orange-300 dark:border-orange-700',
                    text: 'text-orange-600 dark:text-orange-400',
                    line: 'bg-orange-200 dark:bg-orange-800'
                  },
                  blue: {
                    bg: 'bg-blue-100 dark:bg-blue-900/30',
                    border: 'border-blue-300 dark:border-blue-700',
                    text: 'text-blue-600 dark:text-blue-400',
                    line: 'bg-blue-200 dark:bg-blue-800'
                  },
                  violet: {
                    bg: 'bg-violet-100 dark:bg-violet-900/30',
                    border: 'border-violet-300 dark:border-violet-700',
                    text: 'text-violet-600 dark:text-violet-400',
                    line: 'bg-violet-200 dark:bg-violet-800'
                  },
                  cyan: {
                    bg: 'bg-cyan-100 dark:bg-cyan-900/30',
                    border: 'border-cyan-300 dark:border-cyan-700',
                    text: 'text-cyan-600 dark:text-cyan-400',
                    line: 'bg-cyan-200 dark:bg-cyan-800'
                  }
                }
                const c = colorClasses[step.color]
                const StepIcon = step.icon
                const isLast = index === arr.length - 1

                return (
                  <div key={step.label} className="flex gap-3">
                    {/* Timeline çizgisi */}
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border',
                          c.bg,
                          c.border
                        )}
                      >
                        <StepIcon className={cn('w-4 h-4', c.text)} />
                      </div>
                      {!isLast && (
                        <div className={cn('w-0.5 flex-1 min-h-4 my-1 rounded-full', c.line)} />
                      )}
                    </div>
                    {/* İçerik */}
                    <div className={cn('pb-4', isLast && 'pb-0')}>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {step.label}
                      </span>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </SubScreen>
  )
}
