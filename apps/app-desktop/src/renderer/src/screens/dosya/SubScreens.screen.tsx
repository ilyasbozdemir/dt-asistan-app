/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useState } from 'react'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { Link, useLocation } from '@tanstack/react-router'
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Check,
  Compass,
  Copy,
  CreditCard,
  Edit2,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Layers,
  Package,
  Plus,
  Printer,
  Search,
  Trash2,
  TrendingUp,
  Upload,
  UserPlus,
  Users,
  X
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { Modal } from '../../components/ui/Modal'
import { VerticalStepper } from './components/VerticalStepper'
import { useSettingsStore } from '../../store/settingsStore'

interface SubScreenProps {
  title: string
  icon: React.ElementType
  description: string
  children?: React.ReactNode
}

import { Star } from 'lucide-react'

export function SubScreen({
  title,
  icon: Icon,
  description,
  children
}: SubScreenProps): React.JSX.Element {
  const { activeDosyaId, activeStarredDocs, setActiveStarredDocs } = useWorkspaceStore()
  const { unifiedStepperMode } = useSettingsStore()
  const location = useLocation()
  const [activeDosya, setActiveDosya] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const isDosyaAsamasi = [
    '/dosya/hazirlik-ve-ihtiyac',
    '/dosya/piyasa-fiyat-arastirmasi',
    '/dosya/siparis-ve-sozlesme',
    '/dosya/kabul-ve-odeme',
    '/dosya/klasor-ve-kapaklar'
  ].some((path) => location.pathname.includes(path))

  const showVerticalStepper = unifiedStepperMode && isDosyaAsamasi

  useEffect(() => {
    document.title = `${title} - Doğrudan Temin`
  }, [title])

  useEffect(() => {
    if (!activeDosyaId) return
    setLoading(true)
    window.electron.ipcRenderer
      .invoke(
        'db:query',
        'SELECT d.*, b.birim_adi FROM DATA_TeminDosyasi d LEFT JOIN TANIM_Birim b ON d.birim_id = b.id WHERE d.id = ?',
        [activeDosyaId]
      )
      .then((res) => {
        if (res.success && res.data.length > 0) {
          setActiveDosya(res.data[0])
          try {
            const docs = res.data[0].starred_docs ? JSON.parse(res.data[0].starred_docs) : []
            setActiveStarredDocs(docs) // Sync to global store
          } catch (e) {}
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [activeDosyaId, title, setActiveStarredDocs])

  return (
    <div
      className={cn(
        'p-6 md:p-8 max-w-[1600px] mx-auto flex gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500',
        !showVerticalStepper && 'flex-col gap-6'
      )}
    >
      {showVerticalStepper && <VerticalStepper />}

      <div className="flex-1 flex flex-col gap-6 min-w-0">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-855 dark:text-slate-100 flex items-center gap-2">
                <Icon className="w-7 h-7 text-blue-600" />
                {title}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs">{description}</p>
            </div>
          </div>
        </div>

        {/* ACTIVE DOSYA CONTEXT */}
        {!activeDosyaId && (
          <div className="bg-amber-50/50 dark:bg-amber-955/10 border border-amber-200 dark:border-amber-900/20 rounded-2xl p-4 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-400 font-semibold shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
            <div>
              Aktif bir doğrudan temin dosyası seçmediniz. Bu ekranda işlem yapabilmek için lütfen
              önce{' '}
              <Link to="/dosyalar" className="underline font-bold text-blue-600 dark:text-blue-400">
                dosyalar listesinden
              </Link>{' '}
              bir dosya seçin.
            </div>
          </div>
        )}

        {/* AKTİF DOSYA & DOĞRUDAN TEMİN TİPİ BİLGİ KART BARI (TÜM ADIMLARDA GENEL RENDER EDİLİR) */}
        {activeDosyaId && activeDosya && (
          <div className="bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-900/30">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    {activeDosya.konu || 'İsimsiz Dosya'}
                  </h3>
                  {activeDosya.temin_no && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-semibold">
                      #{activeDosya.temin_no}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                  {activeDosya.birim_adi && <span>{activeDosya.birim_adi}</span>}
                  {activeDosya.birim_adi && <span>•</span>}
                  <span>Bütçe Yılı: {activeDosya.butce_yili || new Date().getFullYear()}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Doğrudan Temin Tipi / Usulü Badge */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shrink-0" />
                <span className="text-indigo-600/80 dark:text-indigo-400/80">Temin Usulü:</span>
                <strong className="font-bold text-indigo-800 dark:text-indigo-200">
                  {activeDosya.ihale_sekli ||
                    activeDosya.ihale_usulu ||
                    activeDosya.usul ||
                    activeDosya.temin_usulu ||
                    '4734 / 22-d'}
                </strong>
              </div>

              {/* Alım Türü Badge (Mal / Hizmet / Yapım) */}
              <div
                className={cn(
                  'px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5',
                  (activeDosya.ihale_tipi || activeDosya.tur)?.toLowerCase().includes('hizmet')
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                    : (activeDosya.ihale_tipi || activeDosya.tur)?.toLowerCase().includes('yapım')
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-300'
                      : 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900/40 text-sky-700 dark:text-sky-300'
                )}
              >
                <span className="opacity-80">Alım Türü:</span>
                <strong className="font-bold">
                  {activeDosya.ihale_tipi || activeDosya.tur || 'Mal Alımı'}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* CHILDREN VIEW */}
        {activeDosyaId && children}
      </div>
    </div>
  )
}

// 1. MALZEME LİSTESİ SCREEN

export * from './SubScreen'
export * from './sub-screens/DosyaAsamalari/HazirlikVeIhtiyac'
export * from './sub-screens/DosyaAsamalari/PiyasaFiyatArastirmasi'
export * from './sub-screens/DosyaAsamalari/SiparisVeSozlesme'
export * from './sub-screens/DosyaAsamalari/KabulVeOdeme'
export * from './sub-screens/DosyaAsamalari/KlasorVeKapaklar'
export * from './sub-screens/YaklasikMaliyetCetveli'
export * from './sub-screens/FaturaVeIrsaliye'
export * from './sub-screens/ImzaliBelgeler'
export * from './sub-screens/DatabaseBrowserScreen'
export * from './CiktiMerkezi.screen'
export * from './CiktiMerkezi'
