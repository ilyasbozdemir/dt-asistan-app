import React, { useState } from 'react'
import {
  FileText,
  BarChart2,
  TrendingUp,
  Wallet,
  Calendar,
  ChevronRight,
  Filter
} from 'lucide-react'

// Subcomponents
import { KayitFormuView } from './components/KayitFormuView'
import { AylikOzetView } from './components/AylikOzetView'
import { YillikOzetView } from './components/YillikOzetView'
import { ButceView } from './components/ButceView'

// ─── TYPES ────────────────────────────────────────────────────────────────────
type RaporTipi = 'kayit-formu' | 'aylik-ozet' | 'yillik-ozet' | 'butce'

const RAPOR_TIPLERI: { id: RaporTipi; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    id: 'kayit-formu',
    label: 'Doğrudan Temin Kayıt Formu',
    icon: <FileText className="w-5 h-5" />,
    desc: 'Seçilen dönem için tüm doğrudan temin kayıtlarının listesi'
  },
  {
    id: 'aylik-ozet',
    label: 'Aylık Özet Raporu',
    icon: <BarChart2 className="w-5 h-5" />,
    desc: 'Aylık harcama ve işlem adedi özeti'
  },
  {
    id: 'yillik-ozet',
    label: 'Yıllık Özet Raporu',
    icon: <TrendingUp className="w-5 h-5" />,
    desc: 'Seçilen yıla ait toplam harcama ve istatistikler'
  },
  {
    id: 'butce',
    label: 'Bütçe Durum Raporu',
    icon: <Wallet className="w-5 h-5" />,
    desc: 'Genel, özel ve dış bütçe kullanım durumu'
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

export default function RaporlarScreen(): React.ReactNode {
  const [seciliTip, setSeciliTip] = useState<RaporTipi>('kayit-formu')
  const [dinamikYillar, setDinamikYillar] = useState<string[]>([])
  const [seciliYil, setSeciliYil] = useState('')
  const [seciliAy, setSeciliAy] = useState('Ocak')
  const [raporAktif, setRaporAktif] = useState(false)
  const [raporYil, setRaporYil] = useState('')
  const [raporAy, setRaporAy] = useState('Ocak')

  React.useEffect(() => {
    // Veritabanındaki tüm farklı bütçe yıllarını sorgula
    window.electron.ipcRenderer
      .invoke(
        'db:query',
        'SELECT DISTINCT butce_yili FROM DATA_TeminDosyasi WHERE butce_yili IS NOT NULL AND is_deleted = 0 ORDER BY butce_yili DESC'
      )
      .then((res: any) => {
        if (res.success && res.data && res.data.length > 0) {
          const list = res.data.map((row: any) => String(row.butce_yili))
          setDinamikYillar(list)
          setSeciliYil(list[0])
          setRaporYil(list[0])
        } else {
          // Fallback if no files exist yet
          const currentYear = new Date().getFullYear().toString()
          setDinamikYillar([currentYear])
          setSeciliYil(currentYear)
          setRaporYil(currentYear)
        }
      })
      .catch((err) => {
        console.error('Yıllar yüklenirken hata:', err)
        const currentYear = new Date().getFullYear().toString()
        setDinamikYillar([currentYear])
        setSeciliYil(currentYear)
        setRaporYil(currentYear)
      })
  }, [])

  const handleRaporla = () => {
    setRaporYil(seciliYil)
    setRaporAy(seciliAy)
    setRaporAktif(true)
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="w-9 h-9 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
          <BarChart2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">Raporlar</h1>
          <p className="text-xs text-slate-505 dark:text-slate-400">Harcama ve bütçe raporları</p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sol Panel – Rapor Seçimi & Filtreler */}
        <div className="w-72 flex-shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col overflow-y-auto">
          <div className="p-4 space-y-1">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-505 px-2 mb-2">
              Rapor Türü
            </div>
            {RAPOR_TIPLERI.map((tip) => (
              <button
                key={tip.id}
                onClick={() => {
                  setSeciliTip(tip.id)
                  setRaporAktif(false)
                }}
                className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  seciliTip === tip.id
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <span
                  className={`mt-0.5 ${seciliTip === tip.id ? 'text-primary' : 'text-slate-400'}`}
                >
                  {tip.icon}
                </span>
                <div>
                  <div className="text-sm font-medium leading-tight">{tip.label}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-505 mt-0.5 leading-tight">
                    {tip.desc}
                  </div>
                </div>
                {seciliTip === tip.id && (
                  <ChevronRight className="w-4 h-4 ml-auto mt-0.5 text-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Filtreler */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-700 space-y-3 mt-auto">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-505 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Dönem Seçimi
            </div>

            <div className="space-y-2">
              <label className="block text-xs text-slate-505 dark:text-slate-400">
                <Calendar className="w-3.5 h-3.5 inline mr-1" />
                Yıl
              </label>
              <select
                value={seciliYil}
                onChange={(e) => {
                  setSeciliYil(e.target.value)
                  setRaporAktif(false)
                }}
                className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-55 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {dinamikYillar.map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
            </div>

            {(seciliTip === 'kayit-formu' || seciliTip === 'aylik-ozet') && (
              <div className="space-y-2">
                <label className="block text-xs text-slate-505 dark:text-slate-400 font-semibold mb-1">
                  Ay
                </label>
                <select
                  value={seciliAy}
                  onChange={(e) => {
                    setSeciliAy(e.target.value)
                    setRaporAktif(false)
                  }}
                  className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-55 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {AYLAR.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleRaporla}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold transition-colors shadow-sm cursor-pointer"
            >
              <BarChart2 className="w-4 h-4" /> Raporla
            </button>
          </div>
        </div>

        {/* Sağ Panel – Rapor İçeriği */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900">
          {!raporAktif ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-slate-400 dark:text-slate-600">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <BarChart2 className="w-8 h-8" />
              </div>
              <div>
                <div className="font-semibold text-slate-500 dark:text-slate-500">
                  Rapor Önizlemesi
                </div>
                <div className="text-xs mt-1 leading-relaxed">
                  Sol panelden rapor türü ve dönemi seçerek
                  <br />
                  "Raporla" butonuna basın.
                </div>
              </div>
            </div>
          ) : (
            <>
              {seciliTip === 'kayit-formu' && <KayitFormuView ay={raporAy} yil={raporYil} />}
              {seciliTip === 'aylik-ozet' && <AylikOzetView yil={raporYil} />}
              {seciliTip === 'yillik-ozet' && <YillikOzetView yil={raporYil} />}
              {seciliTip === 'butce' && <ButceView yil={raporYil} />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
