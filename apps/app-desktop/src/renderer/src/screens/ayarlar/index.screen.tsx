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
  Palette,
  Code,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react'
import { InnerMenu, InnerMenuItem } from '../../components/ui/InnerMenu'
import TemaScreen from './TemaScreen'
import { useLocation } from '@tanstack/react-router'
import { Bot, Archive } from 'lucide-react'

type TabType = 'smtp' | 'tema' | 'developer' | 'ai' | 'archive' | 'sync'

export default function AyarlarScreen(): React.ReactNode {
  const { settings, isLoadingSettings, saveSettings, importSmtp, exportSmtp } = useAyarlarHooks()
  const { loadSettings: reloadSettingsStore } = useSettingsStore()

  const location = useLocation()
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const params = new URLSearchParams(location.search)
    const tabParam = params.get('tab') as TabType
    if (
      tabParam === 'smtp' ||
      tabParam === 'tema' ||
      tabParam === 'developer' ||
      tabParam === 'ai' ||
      tabParam === 'archive' ||
      tabParam === 'sync'
    ) {
      return tabParam
    }
    return 'smtp'
  })

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tabParam = params.get('tab') as TabType
    if (
      tabParam === 'smtp' ||
      tabParam === 'tema' ||
      tabParam === 'developer' ||
      tabParam === 'ai' ||
      tabParam === 'archive' ||
      tabParam === 'sync'
    ) {
      setActiveTab(tabParam)
    }
  }, [location.search])

  const [saving, setSaving] = useState(false)

  // Tab 5: SMTP Ayarları
  const [smtpHost, setSmtpHost] = useState('')
  const [smtpPort, setSmtpPort] = useState('')
  const [smtpUser, setSmtpUser] = useState('')
  const [smtpPass, setSmtpPass] = useState('')
  const [showSmtpPass, setShowSmtpPass] = useState(false)
  const [smtpSecure, setSmtpSecure] = useState(false)

  // Tab 6: Geliştirici Ayarları
  const [devUpdateTestMode, setDevUpdateTestMode] = useState(false)
  const [devUpdateVersion, setDevUpdateVersion] = useState('')
  const [githubReleases, setGithubReleases] = useState<string[]>([])

  // Tab 7: Yapay Zeka
  const [aiProvider, setAiProvider] = useState('gemini')
  const [aiGeminiApiKey, setAiGeminiApiKey] = useState('')
  const [aiOpenaiApiKey, setAiOpenaiApiKey] = useState('')
  const [aiAnthropicApiKey, setAiAnthropicApiKey] = useState('')
  const [aiTestStatus, setAiTestStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [aiTestMsg, setAiTestMsg] = useState('')

  const [isPackaged, setIsPackaged] = useState(false)

  // Tab 8: Arşiv
  const [archiveYear, setArchiveYear] = useState<number>(new Date().getFullYear() - 1)
  const [isArchiving, setIsArchiving] = useState(false)

  // Tab 9: Web Sync Ayarları
  const [syncServerUrl, setSyncServerUrl] = useState('')
  const [syncServerPort, setSyncServerPort] = useState('')
  const [syncServerToken, setSyncServerToken] = useState('')
  const [syncTestStatus, setSyncTestStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [syncTestMsg, setSyncTestMsg] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)
  const [isPushing, setIsPushing] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
  const [syncLastResult, setSyncLastResult] = useState<{
    type: 'ok' | 'error'
    msg: string
  } | null>(null)

  useEffect(() => {
    window.electron.ipcRenderer
      .invoke('app:isPackaged')
      .then((packaged: boolean) => {
        setIsPackaged(packaged)
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (settings) {
      setTimeout(() => {
        setSmtpHost(settings.smtp_host || '')
        setSmtpPort(settings.smtp_port || '')
        setSmtpUser(settings.smtp_user || '')
        setSmtpPass(settings.smtp_pass || '')
        setSmtpSecure(settings.smtp_secure === 'true')

        const mode = settings.devUpdateTestMode === 'true'
        const ver = settings.devUpdateVersion || ''
        setDevUpdateTestMode(mode)
        setDevUpdateVersion(ver)
        if ((window as any).api?.setDevVersion) {
          ;(window as any).api.setDevVersion(mode, ver)
          window.dispatchEvent(new Event('app-version-changed'))
          window.electron?.ipcRenderer.invoke('updater:check')
        }

        setAiProvider(settings.ai_provider || 'gemini')
        setAiGeminiApiKey(settings.ai_gemini_api_key || '')
        setAiOpenaiApiKey(settings.ai_openai_api_key || '')
        setAiAnthropicApiKey(settings.ai_anthropic_api_key || '')

        setSyncServerUrl(settings.sync_server_url || '')
        setSyncServerPort(settings.sync_server_port || '')
        setSyncServerToken(settings.sync_server_token || '')
      }, 0)
    }
  }, [settings])

  useEffect(() => {
    if (activeTab === 'developer') {
      fetch('https://api.github.com/repos/ilyasbozdemir/dt-asistan-desktop-app/releases')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const versions = data.map((r: any) => r.tag_name.replace(/^v/, ''))
            setGithubReleases(versions)
          }
        })
        .catch(console.error)
    }
  }, [activeTab])

  // Sağlayıcıya göre aktif API anahtarını döndür
  const getActiveApiKey = (): string => {
    if (aiProvider === 'gemini') return aiGeminiApiKey
    if (aiProvider === 'openai') return aiOpenaiApiKey
    if (aiProvider === 'anthropic') return aiAnthropicApiKey
    return ''
  }

  const handleTestConnection = async (): Promise<void> => {
    const key = getActiveApiKey()
    if (!key) {
      setAiTestStatus('error')
      setAiTestMsg('Lütfen önce API anahtarını girin.')
      return
    }
    setAiTestStatus('loading')
    setAiTestMsg('')
    try {
      const res = await (window as any).api.aiTest(aiProvider, key)
      if (res.success) {
        setAiTestStatus('ok')
        setAiTestMsg('Bağlantı başarılı! ✓')
      } else {
        setAiTestStatus('error')
        setAiTestMsg(res.error || 'Bağlantı başarısız.')
      }
    } catch {
      setAiTestStatus('error')
      setAiTestMsg('Beklenmeyen bir hata oluştu.')
    }
  }

  const handleSaveTab = async (tab: TabType): Promise<void> => {
    if (tab !== 'smtp' && tab !== 'developer' && tab !== 'ai' && tab !== 'sync') return
    setSaving(true)
    try {
      const dataToSave: Record<string, string> = {}

      if (tab === 'smtp') {
        dataToSave.smtp_host = smtpHost
        dataToSave.smtp_port = smtpPort
        dataToSave.smtp_user = smtpUser
        dataToSave.smtp_pass = smtpPass
        dataToSave.smtp_secure = smtpSecure ? 'true' : 'false'
      } else if (tab === 'developer') {
        dataToSave.devUpdateTestMode = devUpdateTestMode ? 'true' : 'false'
        dataToSave.devUpdateVersion = devUpdateVersion
        if ((window as any).api?.setDevVersion) {
          ;(window as any).api.setDevVersion(devUpdateTestMode, devUpdateVersion)
          window.dispatchEvent(new Event('app-version-changed'))
          window.electron?.ipcRenderer.invoke('updater:check')
        }
      } else if (tab === 'ai') {
        dataToSave.ai_provider = aiProvider
        dataToSave.ai_gemini_api_key = aiGeminiApiKey
        dataToSave.ai_openai_api_key = aiOpenaiApiKey
        dataToSave.ai_anthropic_api_key = aiAnthropicApiKey
      } else if (tab === 'sync') {
        dataToSave.sync_server_url = syncServerUrl
        dataToSave.sync_server_port = syncServerPort
        dataToSave.sync_server_token = syncServerToken
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

  const handleSyncTestConnection = async (): Promise<void> => {
    if (!syncServerUrl) {
      setSyncTestStatus('error')
      setSyncTestMsg('Lütfen sunucu adresini girin.')
      return
    }
    setSyncTestStatus('loading')
    setSyncTestMsg('')
    try {
      const res = await window.electron.ipcRenderer.invoke('sync:test-connection', {
        url: syncServerUrl,
        port: syncServerPort,
        token: syncServerToken
      })
      if (res.success) {
        setSyncTestStatus('ok')
        setSyncTestMsg('Bağlantı başarılı! ✓')
      } else {
        setSyncTestStatus('error')
        setSyncTestMsg(res.message || 'Bağlantı başarısız.')
      }
    } catch (err: any) {
      setSyncTestStatus('error')
      setSyncTestMsg('Hata: ' + err.message)
    }
  }

  const handleManualSync = async (): Promise<void> => {
    setIsSyncing(true)
    setSyncLastResult(null)
    try {
      const res = await window.electron.ipcRenderer.invoke('sync:run-sync')
      setSyncLastResult({
        type: res.success ? 'ok' : 'error',
        msg: res.success ? 'Senkronizasyon tamamlandı.' : res.message || 'Hata'
      })
    } catch (err: any) {
      setSyncLastResult({ type: 'error', msg: err.message })
    } finally {
      setIsSyncing(false)
    }
  }

  const handlePushToServer = async (): Promise<void> => {
    setIsPushing(true)
    setSyncLastResult(null)
    try {
      const res = await window.electron.ipcRenderer.invoke('sync:push', {
        url: syncServerUrl,
        port: syncServerPort,
        token: syncServerToken
      })
      setSyncLastResult({
        type: res.success ? 'ok' : 'error',
        msg: res.success
          ? '✅ Veriler başarıyla sunucuya gönderildi.'
          : res.message || 'Push hatası'
      })
    } catch (err: any) {
      setSyncLastResult({ type: 'error', msg: '❌ ' + err.message })
    } finally {
      setIsPushing(false)
    }
  }

  const handlePullFromServer = async (): Promise<void> => {
    setIsPulling(true)
    setSyncLastResult(null)
    try {
      const res = await window.electron.ipcRenderer.invoke('sync:pull', {
        url: syncServerUrl,
        port: syncServerPort,
        token: syncServerToken
      })
      setSyncLastResult({
        type: res.success ? 'ok' : 'error',
        msg: res.success ? '✅ Veriler başarıyla sunucudan alındı.' : res.message || 'Pull hatası'
      })
    } catch (err: any) {
      setSyncLastResult({ type: 'error', msg: '❌ ' + err.message })
    } finally {
      setIsPulling(false)
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

  const menuItems: InnerMenuItem[] = [
    { id: 'smtp', label: 'SMTP Ayarları', icon: <Mail className="w-4 h-4 shrink-0" /> },
    { id: 'div1', label: '', icon: null, isDivider: true },
    { id: 'tema', label: 'Renk & Tema', icon: <Palette className="w-4 h-4 shrink-0" /> },
    { id: 'div2', label: '', icon: null, isDivider: true },
    { id: 'ai', label: 'Yapay Zeka', icon: <Bot className="w-4 h-4 shrink-0" /> },
    { id: 'div3', label: '', icon: null, isDivider: true },
    { id: 'archive', label: 'Veri & Arşiv', icon: <Archive className="w-4 h-4 shrink-0" /> },
    { id: 'div4', label: '', icon: null, isDivider: true },
    { id: 'sync', label: 'Web Senkronizasyon', icon: <RefreshCw className="w-4 h-4 shrink-0" /> },
    ...(import.meta.env.DEV
      ? [
          { id: 'div5', label: '', icon: null, isDivider: true },
          {
            id: 'developer',
            label: 'Geliştirici & Test',
            icon: <Code className="w-4 h-4 shrink-0" />
          }
        ]
      : [])
  ] as InnerMenuItem[]

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
        <InnerMenu
          className="lg:col-span-3"
          items={menuItems}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as TabType)}
        />

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
                        <div className="relative">
                          <input
                            type={showSmtpPass ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={smtpPass}
                            onChange={(e) => setSmtpPass(e.target.value)}
                            className="w-full pr-10 px-3 py-2 text-sm rounded-lg bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSmtpPass(!showSmtpPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                            title={showSmtpPass ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
                          >
                            {showSmtpPass ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="md:col-span-3 flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="smtpSecure"
                          checked={smtpSecure}
                          onChange={(e) => setSmtpSecure(e.target.checked)}
                          className="rounded border-slate-300 dark:border-slate-700 bg-slate-55 dark:bg-slate-950 text-primary focus:ring-primary accent-primary"
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

                {/* TAB: VERİ VE ARŞİV */}
                {activeTab === 'archive' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <div>
                        <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
                          Veritabanı İşlemleri
                        </h2>
                        <p className="text-xs text-slate-500">
                          Mevcut çalışma alanınızdaki tüm veritabanını dışa aktarabilir veya
                          yedekten geri yükleyebilirsiniz.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                            <Download className="w-5 h-5" />
                          </div>
                          <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                            Veritabanını Dışa Aktar
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 h-10">
                          Tüm kalemlerinizi, dosyalarınızı ve komisyon bilgilerinizi içeren .sqlite
                          dosyasını yedekleyin.
                        </p>
                        <Button
                          onClick={async () => {
                            try {
                              const res =
                                await window.electron.ipcRenderer.invoke('db:export-sqlite')
                              if (res.success) {
                                alert('Veritabanı başarıyla dışa aktarıldı.')
                              } else if (res.error && res.error !== 'İptal edildi') {
                                alert('Dışa aktarma hatası: ' + res.error)
                              }
                            } catch (e: any) {
                              alert('Hata: ' + e.message)
                            }
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Dışa Aktar
                        </Button>
                      </div>

                      <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg text-amber-600 dark:text-amber-400">
                            <Upload className="w-5 h-5" />
                          </div>
                          <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                            Veritabanını İçe Aktar
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 h-10">
                          Daha önce aldığınız bir .sqlite yedeğini geri yükleyin. Mevcut verilerin
                          üzerine yazılır.
                        </p>
                        <Button
                          onClick={async () => {
                            if (
                              !window.confirm(
                                'DİKKAT: Bu işlem mevcut veritabanınızın üzerine yazacaktır. Devam etmek istiyor musunuz?'
                              )
                            )
                              return
                            try {
                              const res =
                                await window.electron.ipcRenderer.invoke('db:import-sqlite')
                              if (res.success) {
                                alert(
                                  'Veritabanı başarıyla içe aktarıldı. Değişikliklerin etkili olması için uygulamayı yeniden başlatmanızı öneririz.'
                                )
                                window.location.reload()
                              } else if (res.error && res.error !== 'İptal edildi') {
                                alert('İçe aktarma hatası: ' + res.error)
                              }
                            } catch (e: any) {
                              alert('Hata: ' + e.message)
                            }
                          }}
                          className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          İçe Aktar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 6: GELİŞTİRİCİ AYARLARI */}
                {activeTab === 'developer' && (
                  <div className="space-y-4">
                    {isPackaged ? (
                      <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 p-4 rounded-xl text-sm font-medium">
                        Bu ayarlar yalnızca geliştirici modunda (uygulama paketlenmemişken)
                        kullanılabilir.
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                          <div>
                            <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
                              Geliştirici ve Test Ayarları
                            </h2>
                            <p className="text-xs text-slate-500">
                              Geliştirme modunda otomatik güncellemeleri test etmek için kullanılır.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="md:col-span-2 flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="devUpdateTestMode"
                              checked={devUpdateTestMode}
                              onChange={(e) => {
                                const mode = e.target.checked
                                setDevUpdateTestMode(mode)
                                if ((window as any).api?.setDevVersion) {
                                  ;(window as any).api.setDevVersion(mode, devUpdateVersion)
                                  window.dispatchEvent(new Event('app-version-changed'))
                                  window.electron?.ipcRenderer.invoke('updater:check')
                                }
                              }}
                              className="rounded border-slate-300 dark:border-slate-700 bg-slate-55 dark:bg-slate-950 text-primary focus:ring-primary accent-primary"
                            />
                            <label
                              htmlFor="devUpdateTestMode"
                              className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer"
                            >
                              Geliştirici Modunda (Dev Mode) Güncelleme Testini Etkinleştir
                            </label>
                          </div>

                          {devUpdateTestMode && (
                            <div className="md:col-span-1">
                              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                Şu Anki Versiyonu Şöyle Göster (GitHub Releases)
                              </label>
                              <select
                                value={devUpdateVersion}
                                onChange={(e) => {
                                  const ver = e.target.value
                                  setDevUpdateVersion(ver)
                                  if ((window as any).api?.setDevVersion) {
                                    ;(window as any).api.setDevVersion(devUpdateTestMode, ver)
                                    window.dispatchEvent(new Event('app-version-changed'))
                                    window.electron?.ipcRenderer.invoke('updater:check')
                                  }
                                }}
                                className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 text-slate-800 dark:text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                              >
                                <option value="">-- Versiyon Seçiniz --</option>
                                {githubReleases.map((v) => (
                                  <option key={v} value={v}>
                                    {v}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* TAB 7: YAPAY ZEKA AYARLARI */}
                {activeTab === 'ai' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <div>
                        <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
                          Yapay Zeka (AI) Ayarları
                        </h2>
                        <p className="text-xs text-slate-500">
                          Yer tutucular ve metin üretimi için kullanılacak AI sağlayıcısını seçin.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {/* Sağlayıcı Seçimi */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Aktif AI Sağlayıcısı
                        </label>
                        <select
                          value={aiProvider}
                          onChange={(e) => {
                            setAiProvider(e.target.value)
                            setAiTestStatus('idle')
                            setAiTestMsg('')
                          }}
                          className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 text-slate-800 dark:text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="gemini">Google Gemini (Önerilen)</option>
                          <option value="openai">OpenAI (GPT-4o mini)</option>
                          <option value="anthropic">Anthropic (Claude Haiku)</option>
                        </select>
                      </div>

                      {/* Gemini */}
                      {aiProvider === 'gemini' && (
                        <div className="md:col-span-2 space-y-1">
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                            Google Gemini API Anahtarı
                          </label>
                          <Input
                            type="password"
                            placeholder="AIzaSy..."
                            value={aiGeminiApiKey}
                            onChange={(e) => setAiGeminiApiKey(e.target.value)}
                            className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                          />
                          <p className="text-xs text-slate-400 mt-1">
                            API anahtarını{' '}
                            <a
                              href="https://aistudio.google.com/app/apikey"
                              target="_blank"
                              rel="noreferrer noopener"
                              className="text-primary hover:underline font-medium"
                              onClick={(e) => {
                                e.preventDefault()
                                window.electron.shell.openExternal(
                                  'https://aistudio.google.com/app/apikey'
                                )
                              }}
                            >
                              Google AI Studio
                            </a>{' '}
                            üzerinden ücretsiz edinebilirsiniz. Anahtar yalnızca bu cihazda
                            saklanır.
                          </p>
                        </div>
                      )}

                      {/* OpenAI */}
                      {aiProvider === 'openai' && (
                        <div className="md:col-span-2 space-y-1">
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                            OpenAI API Anahtarı
                          </label>
                          <Input
                            type="password"
                            placeholder="sk-..."
                            value={aiOpenaiApiKey}
                            onChange={(e) => setAiOpenaiApiKey(e.target.value)}
                            className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                          />
                          <p className="text-xs text-slate-400 mt-1">
                            API anahtarını{' '}
                            <a
                              href="https://platform.openai.com/api-keys"
                              target="_blank"
                              rel="noreferrer noopener"
                              className="text-primary hover:underline font-medium"
                              onClick={(e) => {
                                e.preventDefault()
                                window.electron.shell.openExternal(
                                  'https://platform.openai.com/api-keys'
                                )
                              }}
                            >
                              OpenAI API Keys
                            </a>{' '}
                            üzerinden edinebilirsiniz. Anahtar yalnızca bu cihazda saklanır.
                          </p>
                        </div>
                      )}

                      {/* Anthropic */}
                      {aiProvider === 'anthropic' && (
                        <div className="md:col-span-2 space-y-1">
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                            Anthropic API Anahtarı
                          </label>
                          <Input
                            type="password"
                            placeholder="sk-ant-..."
                            value={aiAnthropicApiKey}
                            onChange={(e) => setAiAnthropicApiKey(e.target.value)}
                            className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                          />
                          <p className="text-xs text-slate-400 mt-1">
                            API anahtarını{' '}
                            <a
                              href="https://console.anthropic.com/settings/keys"
                              target="_blank"
                              rel="noreferrer noopener"
                              className="text-primary hover:underline font-medium"
                              onClick={(e) => {
                                e.preventDefault()
                                window.electron.shell.openExternal(
                                  'https://console.anthropic.com/settings/keys'
                                )
                              }}
                            >
                              Anthropic Console
                            </a>{' '}
                            üzerinden edinebilirsiniz. Anahtar yalnızca bu cihazda saklanır.
                          </p>
                        </div>
                      )}

                      {/* Bağlantı Testi */}
                      <div className="md:col-span-2 flex items-center gap-3 pt-1">
                        <Button
                          onClick={handleTestConnection}
                          disabled={aiTestStatus === 'loading'}
                          className="text-xs py-1.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 gap-1.5"
                        >
                          {aiTestStatus === 'loading'
                            ? '⏳ Test Ediliyor...'
                            : '⚡ Bağlantıyı Test Et'}
                        </Button>
                        {aiTestStatus === 'ok' && (
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            {aiTestMsg}
                          </span>
                        )}
                        {aiTestStatus === 'error' && (
                          <span className="text-xs font-semibold text-red-500 dark:text-red-400">
                            {aiTestMsg}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 8: ARŞİV */}
                {activeTab === 'archive' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <div>
                        <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
                          Eski Yılları Arşivle
                        </h2>
                        <p className="text-xs text-slate-500">
                          Belirlediğiniz yıldan daha eski olan doğrudan temin dosyalarını ana
                          veritabanından çıkartıp, sıkıştırılmış arşiv dosyasına (.dtz) aktarır.
                          Böylece sisteminiz daha hızlı çalışır ve dosya boyutu küçülür.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mt-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Hangi yıldan öncekiler arşivlensin? (Seçili yıl DAHİL arşivlenir)
                        </label>
                        <div className="flex items-center gap-3">
                          <Input
                            type="number"
                            value={archiveYear}
                            onChange={(e) => setArchiveYear(parseInt(e.target.value))}
                            className="w-32 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                            min={2000}
                            max={new Date().getFullYear()}
                          />
                          <Button
                            onClick={async () => {
                              if (
                                window.confirm(
                                  `${archiveYear} ve öncesindeki tüm dosyalar sistemden silinip arşiv dosyasına taşınacak. Onaylıyor musunuz?`
                                )
                              ) {
                                setIsArchiving(true)
                                try {
                                  const res = await window.electron.ipcRenderer.invoke(
                                    'db:archive-old-records',
                                    archiveYear
                                  )
                                  if (res.success) {
                                    alert(
                                      `Başarılı! ${res.count} adet dosya arşivlendi.\nKaydedilen Yer: ${res.filePath}`
                                    )
                                    window.location.reload()
                                  } else {
                                    alert('Hata: ' + res.message)
                                  }
                                } catch (e: any) {
                                  alert('Beklenmeyen hata: ' + e.message)
                                } finally {
                                  setIsArchiving(false)
                                }
                              }
                            }}
                            disabled={isArchiving}
                            className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-4"
                          >
                            {isArchiving ? 'Arşivleniyor...' : 'Arşivlemeyi Başlat'}
                          </Button>
                        </div>
                        <p className="text-xs text-slate-500 mt-3">
                          Not: Firma, personel ve birim tanımlarınız silinmez. Yalnızca eski temin
                          dosyaları arşivlenir. Oluşan <b>.dtz</b> dosyasını daha sonra uygulamadan
                          tekrar açıp inceleyebilirsiniz.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 9: WEB SENKRONİZASYON */}
                {activeTab === 'sync' && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <div>
                        <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
                          Sunucu Senkronizasyonu
                        </h2>
                        <p className="text-xs text-slate-500">
                          Yereldeki verileri uzak web sunucusu ile eşitleyin.
                        </p>
                      </div>
                    </div>

                    {/* Sunucu Durum & Güncelleme Bilgi Paneli */}
                    <div
                      className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                        syncServerUrl
                          ? syncTestStatus === 'ok'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                            : syncTestStatus === 'error'
                              ? 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300'
                              : 'bg-blue-500/10 border-blue-500/20 text-blue-800 dark:text-blue-300'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                            syncServerUrl
                              ? syncTestStatus === 'ok'
                                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                : syncTestStatus === 'error'
                                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                                  : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                              : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {syncServerUrl
                            ? syncTestStatus === 'ok'
                              ? '✓'
                              : syncTestStatus === 'error'
                                ? '✗'
                                : '⏳'
                            : '!'}
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider">
                            {!syncServerUrl
                              ? 'Bağlantı Kurulmadı'
                              : syncTestStatus === 'ok'
                                ? 'Sunucu Aktif & Bağlı'
                                : syncTestStatus === 'error'
                                  ? 'Bağlantı Başarısız'
                                  : 'Bağlantı Test Edilmedi'}
                          </div>
                          <div className="text-[11px] opacity-90 mt-0.5">
                            {!syncServerUrl
                              ? 'Lütfen veri senkronizasyonu için geçerli bir Sunucu Adresi girin.'
                              : syncTestStatus === 'ok'
                                ? `Uzak sunucu (${syncServerUrl}) ile iletişim başarıyla sağlandı. Verileri senkronize edebilirsiniz.`
                                : syncTestStatus === 'error'
                                  ? 'Girdiğiniz adrese ulaşılamadı. Sunucu ayarlarınızı veya internetinizi kontrol edin.'
                                  : 'Sunucu adresi tanımlandı. Lütfen aşağıdaki buton ile bağlantıyı test edin.'}
                          </div>
                        </div>
                      </div>

                      {syncServerUrl && syncTestStatus !== 'ok' && (
                        <Button
                          onClick={handleSyncTestConnection}
                          disabled={syncTestStatus === 'loading'}
                          className="text-[10px] font-bold py-1.5 px-3 rounded-lg bg-white/80 dark:bg-slate-950/80 hover:bg-white dark:hover:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-sm border border-black/5"
                        >
                          {syncTestStatus === 'loading'
                            ? 'Bağlantı Sınanıyor...'
                            : 'Bağlantıyı Şimdi Sına'}
                        </Button>
                      )}
                    </div>

                    {/* Bağlantı Ayarları */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
                      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Bağlantı Ayarları
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Sunucu Adresi (Domain / IP)
                          </label>
                          <Input
                            type="text"
                            placeholder="https://dt-sunucu.com veya http://192.168.1.100"
                            value={syncServerUrl}
                            onChange={(e) => setSyncServerUrl(e.target.value)}
                            className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Port (Opsiyonel)
                          </label>
                          <Input
                            type="text"
                            placeholder="3000"
                            value={syncServerPort}
                            onChange={(e) => setSyncServerPort(e.target.value)}
                            className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Güvenlik Tokenı / API Key
                          </label>
                          <Input
                            type="password"
                            placeholder="Bağlantı şifresi veya token"
                            value={syncServerToken}
                            onChange={(e) => setSyncServerToken(e.target.value)}
                            className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                          />
                        </div>

                        <div className="md:col-span-2 flex items-center gap-3">
                          <Button
                            onClick={handleSyncTestConnection}
                            disabled={syncTestStatus === 'loading'}
                            className="text-xs py-1.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 gap-1.5"
                          >
                            {syncTestStatus === 'loading'
                              ? '⏳ Test Ediliyor...'
                              : '⚡ Bağlantıyı Test Et'}
                          </Button>
                          <Button
                            onClick={() => handleSaveTab('sync')}
                            disabled={saving}
                            className="text-xs py-1.5 px-4 rounded-lg bg-slate-700 hover:bg-slate-900 text-white gap-1.5"
                          >
                            <Save className="w-3 h-3" />
                            {saving ? 'Kaydediliyor...' : 'Kaydet'}
                          </Button>
                          {syncTestStatus === 'ok' && (
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              {syncTestMsg}
                            </span>
                          )}
                          {syncTestStatus === 'error' && (
                            <span className="text-xs font-semibold text-red-500 dark:text-red-400">
                              {syncTestMsg}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Aksiyon Kartları */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* PUSH */}
                      <div className="flex flex-col gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 shrink-0">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                              Ana Sunucuya Gönder
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Yereldeki değişiklikleri uzak sunucuya ilet (Push)
                            </div>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                          Yerel veritabanındaki güncel verileri (dosyalar, belgeler, ayarlar) uzak
                          web sunucusuna göndererek yayınlar.
                        </p>
                        <Button
                          onClick={handlePushToServer}
                          disabled={isPushing || !syncServerUrl}
                          className="mt-auto w-full text-sm py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isPushing ? '⏳ Gönderiliyor...' : '🚀 Sunucuya Gönder'}
                        </Button>
                      </div>

                      {/* PULL */}
                      <div className="flex flex-col gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 shrink-0">
                            <Download className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                              Sunucudan Al
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Uzak sunucudaki verileri yerele çek (Pull)
                            </div>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                          Uzak sunucudaki güncel verileri yerel veritabanına indirir. Mevcut
                          yereldeki veriler üzerine yazılabilir.
                        </p>
                        <Button
                          onClick={handlePullFromServer}
                          disabled={isPulling || !syncServerUrl}
                          className="mt-auto w-full text-sm py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isPulling ? '⏳ Alınıyor...' : '📥 Sunucudan Al'}
                        </Button>
                      </div>
                    </div>

                    {/* Genel Eşitle */}
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3">
                      <RefreshCw className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-xs text-slate-500 flex-1">
                        İki yönlü otomatik eşitleme (Push + Pull)
                      </span>
                      <Button
                        onClick={handleManualSync}
                        disabled={isSyncing || !syncServerUrl}
                        className="text-xs py-1.5 px-3 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                      >
                        {isSyncing ? '⏳ Eşitleniyor...' : '🔄 Şimdi Eşitle'}
                      </Button>
                    </div>

                    {/* Sunucu Kurulumu & Docker Kılavuzu */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <Code className="w-4 h-4 text-blue-500" />
                        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                          API Gateway & Sunucu Docker Kurulumu
                        </h3>
                      </div>
                      <p className="text-xs text-slate-550 leading-relaxed">
                        Masaüstündeki yerel verileri merkezi bir bulut veri tabanında toplamak ve
                        eşitlemek için, projenin{' '}
                        <code className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-805 text-blue-600 dark:text-blue-400 font-mono text-[10px] rounded">
                          web/
                        </code>{' '}
                        klasöründeki API sunucusunu Docker ile saniyeler içinde ayağa
                        kaldırabilirsiniz. Eşitleme sonrası yerel dosya (.dtal) workspace{"'"}
                        leriniz bulut sunucunuza aktarılır.
                      </p>

                      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3.5 space-y-2.5 font-mono text-[10px] text-slate-700 dark:text-slate-400">
                        <div className="text-slate-400">
                          {'// 1. Terminalde projenin ana klasörüne gidin ve derleyin'}
                        </div>
                        <div className="text-blue-600 dark:text-blue-400">
                          docker build -t dt-asistan-server ./web
                        </div>

                        <div className="text-slate-400 mt-2">
                          {'// 2. Sunucuyu 3000 portundan çalıştırın'}
                        </div>
                        <div className="text-blue-600 dark:text-blue-400">
                          docker run -p 3000:3000 --name dt-server -d dt-asistan-server
                        </div>

                        <div className="text-slate-400 mt-2">
                          {'// 3. Masaüstü bağlantısında Sunucu Adresi alanına girilecek değer'}
                        </div>
                        <div>
                          Varsayılan Adres:{' '}
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            http://localhost:3000
                          </span>{' '}
                          veya{' '}
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            http://[LAN_SUNUCU_IP]:3000
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sonuç */}
                    {syncLastResult && (
                      <div
                        className={`rounded-xl px-4 py-3 text-sm font-medium ${
                          syncLastResult.type === 'ok'
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                        }`}
                      >
                        {syncLastResult.msg}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SEKMEYİ KAYDET BUTONU */}
              {activeTab !== 'archive' && (
                <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-4 mt-6">
                  <Button
                    onClick={() => handleSaveTab(activeTab)}
                    disabled={saving}
                    className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-2 px-5 text-sm font-semibold transition-all shadow-md shadow-primary/20"
                  >
                    <Save className="w-4 h-4" /> Sekme Ayarlarını Kaydet
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
