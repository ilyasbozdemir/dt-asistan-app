import React, { useState, useEffect } from 'react'
import { useAyarlarHooks } from './ayarlar.hooks'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useSettingsStore } from '../../store/settingsStore'
import {
  Save,
  Mail,
  Upload,
  Download,
  Settings,
  FileCode,
  X,
  Plus,
  ListPlus,
  Palette
} from 'lucide-react'
import {
  FONKSIYONEL_KODLAR,
  FINANSMAN_KODLARI,
  EKONOMIK_KODLAR
} from '../../constants/butce-kodlari'
import TemaScreen from './TemaScreen'
import { useLocation } from '@tanstack/react-router'

type TabType = 'mali' | 'smtp' | 'tema'

interface CodeItem {
  code: string
  description: string
}

interface PresetItem {
  kod: string
  aciklama: string
}

interface CodeListEditorProps {
  title: string
  description: string
  codes: CodeItem[]
  onChange: (newCodes: CodeItem[]) => void
  placeholderCode?: string
  placeholderDesc?: string
  presets?: PresetItem[]
  presetsLabel?: string
}

function CodeListEditor({
  title,
  description,
  codes,
  onChange,
  placeholderCode,
  placeholderDesc,
  presets,
  presetsLabel
}: CodeListEditorProps): React.JSX.Element {
  const [newCode, setNewCode] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const handleAdd = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!newCode.trim()) return
    const trimmedCode = newCode.trim()
    const trimmedDesc = newDesc.trim()

    // Kodun daha önce eklenip eklenmediğini kontrol et
    if (!codes.some((item) => item.code === trimmedCode)) {
      onChange([...codes, { code: trimmedCode, description: trimmedDesc }])
    }
    setNewCode('')
    setNewDesc('')
  }

  const handleLoadPresets = (): void => {
    if (!presets) return
    const existingCodes = new Set(codes.map((c) => c.code))
    const newItems = presets
      .filter((p) => !existingCodes.has(p.kod))
      .map((p) => ({ code: p.kod, description: p.aciklama }))
    if (newItems.length > 0) {
      onChange([...codes, ...newItems])
    }
  }

  const handleRemove = (indexToRemove: number): void => {
    onChange(codes.filter((_, idx) => idx !== indexToRemove))
  }

  return (
    <div className="border border-slate-150 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-955/20 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-350 mb-0.5">{title}</h3>
          <p className="text-[10px] text-slate-450 dark:text-slate-500">{description}</p>
        </div>
        {presets && presets.length > 0 && (
          <button
            type="button"
            onClick={handleLoadPresets}
            className="shrink-0 flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/30 rounded-lg px-2 py-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all"
            title={presetsLabel || 'ABS hazır kodlarını yükle'}
          >
            <ListPlus className="w-3 h-3" />
            {presetsLabel || 'Hazır Kodları Yükle'}
          </button>
        )}
      </div>

      <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
        <div className="sm:col-span-4">
          <Input
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder={placeholderCode || 'Kod...'}
            className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs py-1.5 h-8 w-full"
          />
        </div>
        <div className="sm:col-span-6">
          <Input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder={placeholderDesc || 'Açıklama (Örn: Mal Alımı)...'}
            className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs py-1.5 h-8 w-full"
          />
        </div>
        <div className="sm:col-span-2">
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 h-8 w-full rounded-lg shrink-0 flex items-center justify-center gap-1 font-semibold"
          >
            <Plus className="w-3.5 h-3.5" /> Ekle
          </Button>
        </div>
      </form>

      {codes.length === 0 ? (
        <div className="text-[10px] text-slate-450 dark:text-slate-500 italic p-3 text-center bg-slate-100/50 dark:bg-slate-900/30 rounded-lg">
          Kayıtlı kod bulunmuyor.
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto p-1 custom-scrollbar">
          {codes.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-[11px] text-slate-750 dark:text-slate-350 shadow-sm"
            >
              <div className="flex items-center gap-2 overflow-hidden flex-1">
                <span className="font-mono font-bold text-blue-600 dark:text-blue-450 shrink-0 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-100/30 dark:border-blue-900/20">
                  {item.code}
                </span>
                {item.description && (
                  <span
                    className="text-slate-500 dark:text-slate-400 truncate"
                    title={item.description}
                  >
                    — {item.description}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded transition-all shrink-0"
                title="Sil"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AyarlarScreen(): React.ReactNode {
  const { settings, isLoadingSettings, saveSettings, importSmtp, exportSmtp } = useAyarlarHooks()
  const { loadSettings: reloadSettingsStore } = useSettingsStore()

  const location = useLocation()
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const params = new URLSearchParams(location.search)
    const tabParam = params.get('tab') as TabType
    if (tabParam === 'mali' || tabParam === 'smtp' || tabParam === 'tema') {
      return tabParam
    }
    return 'mali'
  })

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tabParam = params.get('tab') as TabType
    if (tabParam === 'mali' || tabParam === 'smtp' || tabParam === 'tema') {
      setActiveTab(tabParam)
    }
  }, [location.search])

  const [saving, setSaving] = useState(false)

  // Tab 3: Mali & Kurumsal Kodlar
  // Kurumsal Kod → 4 düzey hiyerarşik (KOD1.KOD2.KOD3.KOD4)
  const [kurumsalKod1, setKurumsalKod1] = useState('')
  const [kurumsalKod2, setKurumsalKod2] = useState('')
  const [kurumsalKod3, setKurumsalKod3] = useState('')
  const [kurumsalKod4, setKurumsalKod4] = useState('')

  // Fonksiyonel Kod → 4 düzey hiyerarşik
  const [fonksiyonelKod1, setFonksiyonelKod1] = useState('')
  const [fonksiyonelKod2, setFonksiyonelKod2] = useState('')
  const [fonksiyonelKod3, setFonksiyonelKod3] = useState('')
  const [fonksiyonelKod4, setFonksiyonelKod4] = useState('')

  // Finansal Kod → tek hane
  const [finansalKod, setFinansalKod] = useState('')

  // Birim Kodu → düz kod
  const [birimKodu, setBirimKodu] = useState('')

  // Ekonomik Kodlar → liste (çoklu)
  const [economicCodes, setEconomicCodes] = useState<CodeItem[]>([])

  const [accountingCode, setAccountingCode] = useState('')
  const [accountingName, setAccountingName] = useState('')
  const [expenseCode, setExpenseCode] = useState('')
  const [expenseName, setExpenseName] = useState('')
  const [taxOffice, setTaxOffice] = useState('')
  const [taxNumber, setTaxNumber] = useState('')

  // Tab 5: SMTP Ayarları
  const [smtpHost, setSmtpHost] = useState('')
  const [smtpPort, setSmtpPort] = useState('')
  const [smtpUser, setSmtpUser] = useState('')
  const [smtpPass, setSmtpPass] = useState('')
  const [smtpSecure, setSmtpSecure] = useState(false)

  useEffect(() => {
    if (settings) {
      setTimeout(() => {
        const normalizeCodes = (raw: unknown): CodeItem[] => {
          if (!raw) return []
          try {
            const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
            if (Array.isArray(parsed)) {
              return parsed
                .map((item) => {
                  if (typeof item === 'string') {
                    return { code: item, description: '' }
                  }
                  if (item && typeof item === 'object') {
                    return {
                      code: (item.code || '').toString(),
                      description: (item.description || '').toString()
                    }
                  }
                  return null
                })
                .filter((item): item is CodeItem => item !== null && item.code !== '')
            }
          } catch (e) {
            console.error('Error normalizing codes:', e)
          }
          return []
        }

        // Kurumsal Kod (4 düzey)
        setKurumsalKod1(settings.kurumsalKod1 || '')
        setKurumsalKod2(settings.kurumsalKod2 || '')
        setKurumsalKod3(settings.kurumsalKod3 || '')
        setKurumsalKod4(settings.kurumsalKod4 || '')

        // Fonksiyonel Kod (4 düzey)
        setFonksiyonelKod1(settings.fonksiyonelKod1 || '01')
        setFonksiyonelKod2(settings.fonksiyonelKod2 || '')
        setFonksiyonelKod3(settings.fonksiyonelKod3 || '')
        setFonksiyonelKod4(settings.fonksiyonelKod4 || '')

        // Finansal Kod (tek)
        setFinansalKod(settings.finansalKod || settings.financialCode || '5')

        // Birim Kodu (tek)
        setBirimKodu(settings.birimKodu || settings.departmentCode || '')

        // Ekonomik Kodlar (liste)
        try {
          const parsed = settings.ekonomikKodlarList ? JSON.parse(settings.ekonomikKodlarList) : []
          const normalized = normalizeCodes(parsed)
          if (normalized.length === 0) {
            setEconomicCodes(
              EKONOMIK_KODLAR.map((item) => ({ code: item.kod, description: item.aciklama }))
            )
          } else {
            setEconomicCodes(normalized)
          }
        } catch {
          setEconomicCodes(
            EKONOMIK_KODLAR.map((item) => ({ code: item.kod, description: item.aciklama }))
          )
        }

        setAccountingCode(settings.accountingCode || '')
        setAccountingName(settings.accountingName || '')
        setExpenseCode(settings.expenseCode || '')
        setExpenseName(settings.expenseName || '')
        setTaxOffice(settings.taxOffice || '')
        setTaxNumber(settings.taxNumber || '')

        setSmtpHost(settings.smtp_host || '')
        setSmtpPort(settings.smtp_port || '')
        setSmtpUser(settings.smtp_user || '')
        setSmtpPass(settings.smtp_pass || '')
        setSmtpSecure(settings.smtp_secure === 'true')
      }, 0)
    }
  }, [settings])

  const handleSaveTab = async (tab: TabType): Promise<void> => {
    setSaving(true)
    try {
      const dataToSave: Record<string, string> = {}

      if (tab === 'mali') {
        // Kurumsal Kod (4 düzey)
        dataToSave.kurumsalKod1 = kurumsalKod1
        dataToSave.kurumsalKod2 = kurumsalKod2
        dataToSave.kurumsalKod3 = kurumsalKod3
        dataToSave.kurumsalKod4 = kurumsalKod4
        // Backwards compat: birleşik kurumsal kod
        dataToSave.institutionalCode = [kurumsalKod1, kurumsalKod2, kurumsalKod3, kurumsalKod4]
          .filter(Boolean)
          .join('.')

        // Fonksiyonel Kod (4 düzey)
        dataToSave.fonksiyonelKod1 = fonksiyonelKod1
        dataToSave.fonksiyonelKod2 = fonksiyonelKod2
        dataToSave.fonksiyonelKod3 = fonksiyonelKod3
        dataToSave.fonksiyonelKod4 = fonksiyonelKod4

        // Finansal Kod (tek)
        dataToSave.finansalKod = finansalKod
        dataToSave.financialCode = finansalKod

        // Birim Kodu (tek)
        dataToSave.birimKodu = birimKodu
        dataToSave.departmentCode = birimKodu

        // Ekonomik Kodlar (liste)
        dataToSave.ekonomikKodlarList = JSON.stringify(economicCodes)

        dataToSave.accountingCode = accountingCode
        dataToSave.accountingName = accountingName
        dataToSave.expenseCode = expenseCode
        dataToSave.expenseName = expenseName
        dataToSave.taxOffice = taxOffice
        dataToSave.taxNumber = taxNumber
      } else if (tab === 'smtp') {
        dataToSave.smtp_host = smtpHost
        dataToSave.smtp_port = smtpPort
        dataToSave.smtp_user = smtpUser
        dataToSave.smtp_pass = smtpPass
        dataToSave.smtp_secure = smtpSecure ? 'true' : 'false'
      }

      await saveSettings(dataToSave)
      await reloadSettingsStore()
      alert('Ayarlar başarıyla kaydedildi.')
    } catch {
      alert('Kaydetme hatası!')
    } finally {
      setSaving(false)
    }
  }

  const handleImportSmtp = async (): Promise<void> => {
    try {
      await importSmtp()
      alert('SMTP Ayarları başarıyla içe aktarıldı.')
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      if (errorMsg !== 'İptal edildi') {
        alert('İçe aktarma hatası: ' + errorMsg)
      }
    }
  }

  const handleExportSmtp = async (): Promise<void> => {
    try {
      await exportSmtp()
      alert('SMTP Ayarları başarıyla dışa aktarıldı.')
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      if (errorMsg !== 'İptal edildi') {
        alert('Dışa aktarma hatası: ' + errorMsg)
      }
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-slate-850 dark:text-slate-100">
            <Settings className="w-8 h-8 text-blue-605" />
            Sistem Ayarları
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Kurum/Belediye idari bilgilerini, mali kodlarını, SMTP sunucu ve tema ayarlarını yönetin.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SOL MENÜ (DİKEY SEKME LİSTESİ) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col gap-1.5">
          <button
            onClick={() => setActiveTab('mali')}
            className={`flex items-center gap-3 w-full text-left py-2.5 px-4 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'mali'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <FileCode className="w-4 h-4 shrink-0" />
            <span>Mali Kodlar</span>
          </button>

          <button
            onClick={() => setActiveTab('smtp')}
            className={`flex items-center gap-3 w-full text-left py-2.5 px-4 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'smtp'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Mail className="w-4 h-4 shrink-0" />
            <span>SMTP Ayarları</span>
          </button>

          <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />

          <button
            onClick={() => setActiveTab('tema')}
            className={`flex items-center gap-3 w-full text-left py-2.5 px-4 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'tema'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Palette className="w-4 h-4 shrink-0" />
            <span>Renk & Tema</span>
          </button>
        </div>

        {/* SAĞ PANEL (İÇERİK ALANI) */}
        <div className="lg:col-span-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[450px] flex flex-col justify-between">
          {isLoadingSettings ? (
            <div className="flex items-center justify-center flex-1 text-slate-500">
              Yükleniyor...
            </div>
          ) : activeTab === 'tema' ? (
            <TemaScreen isEmbedded={true} />
          ) : (
            <>
              <div className="space-y-6">

                {/* TAB 3: DİNAMİK MALİ & KURUMSAL KODLAR */}
                {activeTab === 'mali' && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                      <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
                        Mali ve Kurumsal Kod Yönetimi
                      </h2>
                      <p className="text-xs text-slate-500">
                        Maliye ve muhasebe süreçlerinde kullanılan kod listelerini yönetin. Kod
                        ekleyerek listeleri genişletebilirsiniz.
                      </p>
                    </div>

                    <div className="space-y-5">
                      {/* Kurumsal Kod — 4 düzey hiyerarşik */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                          Kurumsal Kod
                          <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500 ml-2">
                            4 düzey hiyerarşi (KOD1 . KOD2 . KOD3 . KOD4)
                          </span>
                        </label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={kurumsalKod1}
                            onChange={(e) => setKurumsalKod1(e.target.value)}
                            placeholder="KOD1"
                            className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-center font-mono w-24"
                          />
                          <span className="text-slate-400 font-bold">.</span>
                          <Input
                            value={kurumsalKod2}
                            onChange={(e) => setKurumsalKod2(e.target.value)}
                            placeholder="KOD2"
                            className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-center font-mono w-20"
                          />
                          <span className="text-slate-400 font-bold">.</span>
                          <Input
                            value={kurumsalKod3}
                            onChange={(e) => setKurumsalKod3(e.target.value)}
                            placeholder="KOD3"
                            className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-center font-mono w-20"
                          />
                          <span className="text-slate-400 font-bold">.</span>
                          <Input
                            value={kurumsalKod4}
                            onChange={(e) => setKurumsalKod4(e.target.value)}
                            placeholder="KOD4"
                            className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-center font-mono w-20"
                          />
                        </div>
                      </div>

                      {/* Birim Kodu — tek input */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                          Birim Kodu
                        </label>
                        <Input
                          value={birimKodu}
                          onChange={(e) => setBirimKodu(e.target.value)}
                          placeholder="Birim Kodu"
                          className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800 max-w-sm"
                        />
                      </div>

                      {/* Fonksiyonel Kod — 4 düzey hiyerarşik */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                          Fonksiyonel Kod (Düzey 1 ve Alt Düzeyler)
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                          <select
                            value={fonksiyonelKod1}
                            onChange={(e) => setFonksiyonelKod1(e.target.value)}
                            title="Fonksiyonel Kod Düzey 1"
                            className="bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 w-full sm:w-64"
                          >
                            {FONKSIYONEL_KODLAR.map((item) => (
                              <option key={item.kod} value={item.kod}>
                                {item.kod} - {item.aciklama}
                              </option>
                            ))}
                          </select>
                          <div className="flex items-center gap-1.5 w-full sm:w-auto">
                            <span className="text-slate-400 font-bold hidden sm:inline">.</span>
                            <Input
                              value={fonksiyonelKod2}
                              onChange={(e) => setFonksiyonelKod2(e.target.value)}
                              placeholder="KOD2"
                              className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-center font-mono w-16"
                            />
                            <span className="text-slate-400 font-bold">.</span>
                            <Input
                              value={fonksiyonelKod3}
                              onChange={(e) => setFonksiyonelKod3(e.target.value)}
                              placeholder="KOD3"
                              className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-center font-mono w-16"
                            />
                            <span className="text-slate-400 font-bold">.</span>
                            <Input
                              value={fonksiyonelKod4}
                              onChange={(e) => setFonksiyonelKod4(e.target.value)}
                              placeholder="KOD4"
                              className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-center font-mono w-16"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Finansal Kod — tek input */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                          Finansal Kod (Finansman Tipi)
                        </label>
                        <select
                          value={finansalKod}
                          onChange={(e) => setFinansalKod(e.target.value)}
                          title="Finansal Kod"
                          className="bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 w-full max-w-sm"
                        >
                          {FINANSMAN_KODLARI.map((item) => (
                            <option key={item.kod} value={item.kod}>
                              {item.kod} - {item.aciklama}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Gider Ekonomik Kodları */}
                    <div className="mt-6">
                      <CodeListEditor
                        title="Ekonomik Kodlar (Gider)"
                        description="Mal ve hizmet alım gider kodları (Örn: 03.2.1.01 - Kırtasiye)"
                        codes={economicCodes}
                        onChange={setEconomicCodes}
                        placeholderCode="Kod..."
                        placeholderDesc="Ekonomik Gider Açıklaması..."
                        presets={EKONOMIK_KODLAR}
                      />
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-6">
                      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                        Muhasebe ve Vergi Detayları
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Muhasebe Birim Kodu
                          </label>
                          <Input
                            value={accountingCode}
                            onChange={(e) => setAccountingCode(e.target.value)}
                            placeholder="Muhasebe Kodu"
                            className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Muhasebe Birim Adı
                          </label>
                          <Input
                            value={accountingName}
                            onChange={(e) => setAccountingName(e.target.value)}
                            placeholder="Muhasebe Birim Adı"
                            className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Harcama Birim Kodu
                          </label>
                          <Input
                            value={expenseCode}
                            onChange={(e) => setExpenseCode(e.target.value)}
                            placeholder="Harcama Birim Kodu"
                            className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Harcama Birim Adı
                          </label>
                          <Input
                            value={expenseName}
                            onChange={(e) => setExpenseName(e.target.value)}
                            placeholder="Harcama Birim Adı"
                            className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Vergi Dairesi
                          </label>
                          <Input
                            value={taxOffice}
                            onChange={(e) => setTaxOffice(e.target.value)}
                            placeholder="Vergi Dairesi"
                            className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Vergi Numarası
                          </label>
                          <Input
                            value={taxNumber}
                            onChange={(e) => setTaxNumber(e.target.value)}
                            placeholder="Vergi Numarası"
                            className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: SMTP SUNUCU AYARLARI */}
                {activeTab === 'smtp' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <div>
                        <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
                          SMTP Sunucu Ayarları
                        </h2>
                        <p className="text-xs text-slate-500">
                          Şifre sıfırlama kodlarının gönderileceği SMTP ayarları.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleImportSmtp}
                          title="SMTP JSON İçe Aktar"
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 gap-1.5 text-xs py-1.5 px-3 rounded-lg"
                        >
                          <Upload className="w-3.5 h-3.5" /> İçe Aktar
                        </Button>
                        <Button
                          onClick={handleExportSmtp}
                          title="SMTP JSON Dışa Aktar"
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 gap-1.5 text-xs py-1.5 px-3 rounded-lg"
                        >
                          <Download className="w-3.5 h-3.5" /> Dışa Aktar
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          SMTP Host
                        </label>
                        <Input
                          placeholder="smtp.kurum.bel.tr"
                          value={smtpHost}
                          onChange={(e) => setSmtpHost(e.target.value)}
                          className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          SMTP Port
                        </label>
                        <Input
                          placeholder="587"
                          value={smtpPort}
                          onChange={(e) => setSmtpPort(e.target.value)}
                          className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          SMTP Kullanıcı Adı (User)
                        </label>
                        <Input
                          placeholder="noreply@kurum.bel.tr"
                          value={smtpUser}
                          onChange={(e) => setSmtpUser(e.target.value)}
                          className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          SMTP Şifre (Password)
                        </label>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={smtpPass}
                          onChange={(e) => setSmtpPass(e.target.value)}
                          className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                        />
                      </div>
                      <div className="md:col-span-3 flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="smtpSecure"
                          checked={smtpSecure}
                          onChange={(e) => setSmtpSecure(e.target.checked)}
                          className="rounded border-slate-300 dark:border-slate-700 bg-slate-55 dark:bg-slate-950 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                          htmlFor="smtpSecure"
                          className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer"
                        >
                          SSL/TLS Bağlantısı (Güvenli)
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SEKMEYİ KAYDET BUTONU */}
              <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-4 mt-6">
                <Button
                  onClick={() => handleSaveTab(activeTab)}
                  disabled={saving}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 px-5 text-sm font-semibold transition-all shadow-md shadow-blue-500/10"
                >
                  <Save className="w-4 h-4" /> Sekme Ayarlarını Kaydet
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
