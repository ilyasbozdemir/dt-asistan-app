import React, { useEffect, useState } from 'react'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  Settings,
  AlertCircle,
  FileText,
  Users,
  Package,
  Layers,
  Compass,
  FileCheck,
  CreditCard,
  FileSpreadsheet
} from 'lucide-react'

interface SubScreenProps {
  title: string
  icon: React.ElementType
  description: string
}

export function SubScreen({ title, icon: Icon, description }: SubScreenProps): React.JSX.Element {
  const { activeDosyaId } = useWorkspaceStore()
  const [activeDosya, setActiveDosya] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.title = `${title} - Doğrudan Temin`
  }, [title])

  useEffect(() => {
    if (!activeDosyaId) return
    setLoading(true)
    window.electron.ipcRenderer.invoke(
      'db:query',
      'SELECT id, konu, temin_no FROM DATA_TeminDosyasi WHERE id = ?',
      [activeDosyaId]
    ).then((res) => {
      if (res.success && res.data.length > 0) {
        setActiveDosya(res.data[0])
      }
    }).finally(() => {
      setLoading(false)
    })
  }, [activeDosyaId])

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <Link
          to="/dosyalar"
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 transition-all shadow-sm"
          title="Dosyalara Dön"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-855 dark:text-slate-100 flex items-center gap-2">
            <Icon className="w-7 h-7 text-blue-600" />
            {title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs">
            {description}
          </p>
        </div>
      </div>

      {/* ACTIVE DOSYA CONTEXT */}
      {activeDosyaId ? (
        <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block">
                İLİŞKİLİ AKTİF ÇALIŞMA DOSYASI
              </span>
              {loading ? (
                <span className="text-xs text-slate-500 italic">Yükleniyor...</span>
              ) : activeDosya ? (
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {activeDosya.temin_no || 'No Bekliyor'} — {activeDosya.konu} (ID: #{activeDosya.id})
                </h3>
              ) : (
                <span className="text-xs text-slate-500">Dosya bulunamadı (#{activeDosyaId})</span>
              )}
            </div>
          </div>
          <Link
            to="/dosyalar"
            className="px-3.5 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors inline-block text-center cursor-pointer shrink-0 shadow-sm"
          >
            Dosyayı Değiştir
          </Link>
        </div>
      ) : (
        <div className="bg-amber-50/50 dark:bg-amber-955/10 border border-amber-200 dark:border-amber-900/20 rounded-2xl p-4 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-400 font-semibold shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
          <div>
            Aktif bir doğrudan temin dosyası seçmediniz. Bu ekranda işlem yapabilmek için lütfen önce{' '}
            <Link to="/dosyalar" className="underline font-bold text-blue-600 dark:text-blue-400">
              dosyalar listesinden
            </Link>{' '}
            bir dosya seçin.
          </div>
        </div>
      )}

      {/* COMING SOON VIEW */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[300px] shadow-sm mt-2">
        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center text-slate-450 border border-slate-150 dark:border-slate-850/60 mb-4 animate-pulse">
          <Icon className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">{title}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
          Yakında burası aktif çalışma dosyası ({activeDosyaId ? `ID: #${activeDosyaId}` : 'Seçilmedi'}) ile entegre edilerek eklenecektir.
        </p>
        <div className="mt-6 flex items-center gap-1.5 text-[10px] font-bold text-slate-450 bg-slate-55 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-150 dark:border-slate-850">
          <Settings className="w-3.5 h-3.5 animate-spin" />
          <span>Geliştirme Süreci Devam Ediyor</span>
        </div>
      </div>
    </div>
  )
}

// 1. KOMİSYON ATAMA SUB-SCREENS
export function FiyatArastirmaKomisyonu(): React.JSX.Element {
  return (
    <SubScreen
      title="Fiyat Araştırma Komisyonu"
      icon={Users}
      description="Piyasa fiyat araştırması için görevlendirilecek komisyon üyelerini tanımlayın."
    />
  )
}

export function MuayeneKabulKomisyonu(): React.JSX.Element {
  return (
    <SubScreen
      title="Muayene Kabul ve Tespit Komisyonu"
      icon={Users}
      description="Teslim alınan mal veya hizmetlerin muayene ve kabul işlemlerini yapacak komisyon."
    />
  )
}

export function FiyatArastirmaMuayeneKomisyonu(): React.JSX.Element {
  return (
    <SubScreen
      title="Fiyat Araştırma ve Muayene Komisyonu"
      icon={Users}
      description="Ortak fiyat araştırma ve muayene işlemlerini yürütecek kurul tanımları."
    />
  )
}

export function KomisyonAtamaOnayEki(): React.JSX.Element {
  return (
    <SubScreen
      title="Komisyon Atama Onay Eki"
      icon={Users}
      description="Komisyon atamalarına ait üst onay yazıları ve ek belgeleri."
    />
  )
}

// 2. MALZEME / İHTİYAÇ LİSTELERİ SUB-SCREENS
export function MalzemeListesi(): React.JSX.Element {
  return (
    <SubScreen
      title="Malzeme Listesi"
      icon={Package}
      description="İhale dosyasına ait satın alınacak malzeme kalemlerinin listesi."
    />
  )
}

export function IhtiyacListesiTalepFormu(): React.JSX.Element {
  return (
    <SubScreen
      title="İhtiyaç Listesi &amp; Talep Formu"
      icon={Package}
      description="Talep formu ve ihtiyaç gerekçelerinin resmi listesi."
    />
  )
}

// 3. LÜZUM MÜZEKKERESİ SUB-SCREENS
export function LuzumMuzekkeresiBelgesi(): React.JSX.Element {
  return (
    <SubScreen
      title="Lüzum Müzekkeresi Belgesi"
      icon={Layers}
      description="Lüzum onay belgesi ve talep müzekkeresi evrağı."
    />
  )
}

export function LuzumOnayEki(): React.JSX.Element {
  return (
    <SubScreen
      title="Lüzum Onay Eki"
      icon={Layers}
      description="Lüzum onay belgesine ait resmi ekler ve tablolar."
    />
  )
}

export function LuzumTeslimTesellum(): React.JSX.Element {
  return (
    <SubScreen
      title="Teslim Tesellüm Belgesi"
      icon={Layers}
      description="Mal ve hizmetlerin teslim edildiğine dair teslim tesellüm tutanağı."
    />
  )
}

// 4. FİRMALAR & MALİYET SUB-SCREENS
export function IstekliFirmalar(): React.JSX.Element {
  return (
    <SubScreen
      title="İstekli Firmalar"
      icon={Compass}
      description="Teklif vermesi için davet edilen veya teklif sunan tedarikçiler."
    />
  )
}

export function YaklasikMaliyetCetveli(): React.JSX.Element {
  return (
    <SubScreen
      title="Yaklaşık Maliyet"
      icon={FileSpreadsheet}
      description="Yaklaşık maliyet hesap cetveli ve piyasa fiyat ortalamaları."
    />
  )
}

export function PiyasaArastirmaTutanağı(): React.JSX.Element {
  return (
    <SubScreen
      title="Piyasa Araştırma Tutanağı"
      icon={Compass}
      description="Fiyat araştırma komisyonu tarafından düzenlenen piyasa fiyat araştırma tutanağı."
    />
  )
}

// 5. ONAY BELGESİ SUB-SCREENS
export function DogrudanTeminOnayBelgesi(): React.JSX.Element {
  return (
    <SubScreen
      title="Doğrudan Temin Onay Belgesi"
      icon={FileCheck}
      description="Harcama yetkilisi onayına sunulacak Doğrudan Temin Onay Belgesi."
    />
  )
}

export function IhaleOnayBelgesi(): React.JSX.Element {
  return (
    <SubScreen
      title="İhale Onay Belgesi"
      icon={FileCheck}
      description="İhale onay formu ve resmi karar şablonu."
    />
  )
}

export function ButceSorgusu(): React.JSX.Element {
  return (
    <SubScreen
      title="Bütçe Sorgusu"
      icon={FileCheck}
      description="Kullanılabilir bütçe ödenek limitlerinin ve harcama sorgularının detayları."
    />
  )
}

// 6. HARCAMA SUB-SCREENS
export function HarcamaTalimati(): React.JSX.Element {
  return (
    <SubScreen
      title="Harcama Talimatı"
      icon={CreditCard}
      description="Harcama yetkilisinden alınan resmi harcama talimatı evrağı."
    />
  )
}

export function HarcamaPusulasi(): React.JSX.Element {
  return (
    <SubScreen
      title="Harcama Pusulası"
      icon={CreditCard}
      description="Yapılan giderler için düzenlenen harcama pusulası belgesi."
    />
  )
}
