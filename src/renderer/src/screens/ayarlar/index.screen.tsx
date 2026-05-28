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
  Palette
} from 'lucide-react'
import TemaScreen from './TemaScreen'
import { useLocation } from '@tanstack/react-router'

type TabType = 'smtp' | 'tema'  


export default function AyarlarScreen(): React.ReactNode {
  const { settings, isLoadingSettings, saveSettings, importSmtp, exportSmtp } = useAyarlarHooks()
  const { loadSettings: reloadSettingsStore } = useSettingsStore()

  const location = useLocation()
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const params = new URLSearchParams(location.search)
    const tabParam = params.get('tab') as TabType
    if (tabParam === 'smtp' || tabParam === 'tema') {
      return tabParam
    }
    return 'smtp'
  })

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tabParam = params.get('tab') as TabType
    if (tabParam === 'smtp' || tabParam === 'tema') {
      setActiveTab(tabParam)
    }
  }, [location.search])

  const [saving, setSaving] = useState(false)

  // Tab 5: SMTP Ayarları
  const [smtpHost, setSmtpHost] = useState('')
  const [smtpPort, setSmtpPort] = useState('')
  const [smtpUser, setSmtpUser] = useState('')
  const [smtpPass, setSmtpPass] = useState('')
  const [smtpSecure, setSmtpSecure] = useState(false)

  useEffect(() => {
    if (settings) {
      setTimeout(() => {
        setSmtpHost(settings.smtp_host || '')
        setSmtpPort(settings.smtp_port || '')
        setSmtpUser(settings.smtp_user || '')
        setSmtpPass(settings.smtp_pass || '')
        setSmtpSecure(settings.smtp_secure === 'true')
      }, 0)
    }
  }, [settings])

  const handleSaveTab = async (tab: TabType): Promise<void> => {
    if (tab !== 'smtp') return
    setSaving(true)
    try {
      const dataToSave: Record<string, string> = {
        smtp_host: smtpHost,
        smtp_port: smtpPort,
        smtp_user: smtpUser,
        smtp_pass: smtpPass,
        smtp_secure: smtpSecure ? 'true' : 'false'
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
            SMTP sunucu ve tema ayarlarını yönetin.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SOL MENÜ (DİKEY SEKME LİSTESİ) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col gap-1.5">
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
