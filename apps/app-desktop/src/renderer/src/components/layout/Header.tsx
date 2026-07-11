import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Bell,
  Cloud,
  DownloadCloud,
  Minus,
  Moon,
  RefreshCw,
  Shield,
  Square,
  Sun,
  Wifi,
  WifiOff,
  X
} from 'lucide-react'
import { useTheme } from '../providers/ThemeProvider'
import { TeminSelector } from './TeminSelector'
import { useAnnouncements } from '../../screens/dashboard/dashboard.hooks'
import { useSettingsStore } from '../../store/settingsStore'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { useQueryClient } from '@tanstack/react-query'

export function Header(): React.JSX.Element {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const { loadSettings } = useSettingsStore()
  const { closeWorkspace } = useWorkspaceStore()
  const queryClient = useQueryClient()

  const handleCloseWorkspace = async (): Promise<void> => {
    await closeWorkspace()
    queryClient.clear()
  }
  const [updateStatus, setUpdateStatus] = useState<{
    status: string
    version?: string
  } | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)

  // Sync Popover States
  const [showSyncPopover, setShowSyncPopover] = useState(false)
  const [syncUrl, setSyncUrl] = useState('')
  const [syncToken, setSyncToken] = useState('')
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [syncMessage, setSyncMessage] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)
  const syncRef = useRef<HTMLDivElement>(null)

  // Online / Offline & Version Tracker States
  const [isOnline, setIsOnline] = useState(true)
  const [dbVersionLocal, setDbVersionLocal] = useState(104)
  const [dbVersionCloud, setDbVersionCloud] = useState(104)
  const [isOfflineMode, setIsOfflineMode] = useState(false)

  const { announcements } = useAnnouncements()

  // Load settings on mount & set up online listener
  useEffect(() => {
    window.electron?.ipcRenderer
      .invoke('db:get-settings')
      .then((settings) => {
        if (settings) {
          setSyncUrl(settings.sync_server_url || '')
          setSyncToken(settings.sync_server_token || '')
          if (settings.db_version_local) {
            setDbVersionLocal(Number(settings.db_version_local))
            setDbVersionCloud(Number(settings.db_version_cloud || settings.db_version_local))
          }
          if (settings.is_offline_mode) {
            setIsOfflineMode(settings.is_offline_mode === 'true')
          }
        }
      })
      .catch(console.error)

    // Online status
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
      if (syncRef.current && !syncRef.current.contains(e.target as Node)) {
        setShowSyncPopover(false)
      }
      const menuBar = document.getElementById('native-menu-bar')
      if (menuBar && !menuBar.contains(e.target as Node)) {
        setActiveMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNotifications, showSyncPopover, activeMenu])

  useEffect(() => {
    const removeListener = window.electron?.ipcRenderer.on('updater:status', (_event, data) => {
      setUpdateStatus(data as any)
    })
    return () => {
      if (removeListener) removeListener()
    }
  }, [])

  const handleMinimize = () => window.electron?.ipcRenderer.send('window-minimize')
  const handleMaximize = () => window.electron?.ipcRenderer.send('window-maximize')
  const handleClose = () => window.electron?.ipcRenderer.send('window-close')

  const handleSaveAndTest = async () => {
    setSyncStatus('loading')
    setSyncMessage('Bağlantı test ediliyor...')
    try {
      // Save settings first
      await window.electron.ipcRenderer.invoke('db:save-settings', {
        sync_server_url: syncUrl,
        sync_server_token: syncToken
      })

      // Test connection
      const testRes = await window.electron.ipcRenderer.invoke('sync:test-connection', {
        url: syncUrl,
        port: '',
        token: syncToken
      })

      if (testRes.success) {
        setSyncStatus('ok')
        setSyncMessage('Bağlantı Başarılı!')
        setIsOnline(true)
      } else {
        setSyncStatus('error')
        setSyncMessage(testRes.message || 'Bağlantı başarısız.')
        setIsOnline(false)
      }
    } catch (err: any) {
      setSyncStatus('error')
      setSyncMessage(err.message || 'Bir hata oluştu.')
      setIsOnline(false)
    }
  }

  const handleTriggerSync = async () => {
    if (isSyncing) return
    setIsSyncing(true)
    setSyncMessage('Veriler eşitleniyor...')
    try {
      const syncRes = await window.electron.ipcRenderer.invoke('sync:run-sync')
      if (syncRes.success) {
        setSyncStatus('ok')
        setSyncMessage('Senkronizasyon Tamamlandı!')
        // Increment version on successful sync
        const newVer = dbVersionLocal + 1
        setDbVersionLocal(newVer)
        setDbVersionCloud(newVer)

        // Save version info to DB
        await window.electron.ipcRenderer.invoke('db:save-settings', {
          db_version_local: String(newVer),
          db_version_cloud: String(newVer)
        })

        window.dispatchEvent(new Event('db-synced'))
      } else {
        setSyncStatus('error')
        setSyncMessage(syncRes.message || 'Senkronizasyon hatası.')
      }
    } catch (err: any) {
      setSyncStatus('error')
      setSyncMessage(err.message || 'Eşitleme sırasında hata oluştu.')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleToggleOfflineMode = async (checked: boolean) => {
    setIsOfflineMode(checked)
    try {
      await window.electron.ipcRenderer.invoke('db:save-settings', {
        is_offline_mode: String(checked)
      })
      if (checked) {
        // Ev/Saha (Offline) moduna geçerken sunucudan son veriyi çek
        setSyncMessage('Ev Moduna geçiliyor: Son veriler sunucudan çekiliyor...')
        await handleTriggerSync()
      } else {
        setSyncStatus('idle')
        setSyncMessage('Ofis Moduna geçildi: Bulut veri tabanı aktif.')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const menus = [
    {
      name: 'Dosya',
      items: [
        {
          label: 'Gösterge Paneli',
          onClick: () => navigate({ to: '/' as any })
        },
        {
          label: 'Yeni Dosya Oluştur',
          onClick: () => navigate({ to: '/dosyalar/yeni' as any })
        },
        {
          label: 'Veri Dosyası Detayları (.dtal)',
          onClick: () => navigate({ to: '/dosya' as any })
        },
        {
          label: 'Kullanıcı Profili',
          onClick: () => navigate({ to: '/profil' as any })
        },
        { divider: true },
        {
          label: 'Kurum Dosyasını Kapat (.dtal)',
          onClick: handleCloseWorkspace
        },
        { divider: true },
        { label: 'Verileri Eşitle (Sync)', onClick: handleTriggerSync },
        { divider: true },
        { label: 'Uygulamadan Çık (Alt+F4)', onClick: handleClose }
      ]
    },
    {
      name: 'Süreç Yönetimi',
      items: [
        {
          label: 'Doğrudan Temin Dosyaları',
          onClick: () => navigate({ to: '/dosyalar' as any })
        },
        {
          label: 'Hızlı Dosya Ekle / Güncelle',
          onClick: () => navigate({ to: '/hizli-dosya-ekle' as any })
        },
        {
          label: 'Süreç Takip & Durum',
          onClick: () => navigate({ to: '/takip' as any })
        },
        {
          label: 'Belge Çıktı Merkezi',
          onClick: () => navigate({ to: '/cikti-merkezi' as any })
        }
      ]
    },
    {
      name: 'Doğrudan Temin',
      items: [
        {
          label: '1. Hazırlık ve İhtiyaç',
          onClick: () => navigate({ to: '/dosya/hazirlik-ve-ihtiyac' as any })
        },
        {
          label: '2. Piyasa Fiyat Araştırması',
          onClick: () => navigate({ to: '/dosya/piyasa-fiyat-arastirmasi' as any })
        },
        {
          label: '3. Yaklaşık Maliyet',
          onClick: () => navigate({ to: '/dosya/firmalar-maliyet/yaklasik' as any })
        },
        {
          label: '4. Sipariş & Sözleşme',
          onClick: () => navigate({ to: '/dosya/siparis-ve-sozlesme' as any })
        },
        {
          label: '5. Kabul & Ödeme İşlemleri',
          onClick: () => navigate({ to: '/dosya/kabul-ve-odeme' as any })
        },
        { divider: true },
        {
          label: '6. Fatura & İrsaliye',
          onClick: () => navigate({ to: '/dosya/fatura-ve-irsaliye' as any })
        },
        {
          label: '7. Klasör & Kapaklar',
          onClick: () => navigate({ to: '/dosya/klasor-ve-kapaklar' as any })
        },
        {
          label: '8. İmzalı Belgeler',
          onClick: () => navigate({ to: '/dosya/imzali-belgeler' as any })
        }
      ]
    },
    {
      name: 'Hakediş (Beta)',
      items: [
        {
          label: 'Hakediş Raporları',
          onClick: () => navigate({ to: '/hakedis' as any })
        },
        {
          label: 'Yeni Hakediş Dosyası',
          onClick: () => navigate({ to: '/hakedis' as any })
        },
        { divider: true },
        {
          label: 'Hakediş Mevzuat Tanımları',
          onClick: () => navigate({ to: '/hakedis' as any })
        }
      ]
    },
    {
      name: 'Tanımlar',
      items: [
        {
          label: 'Kurum Bilgileri',
          onClick: () => navigate({ to: '/kurum' as any })
        },
        {
          label: 'Birim Yönetimi',
          onClick: () => navigate({ to: '/birimler' as any })
        },
        {
          label: 'Personel Yönetimi',
          onClick: () => navigate({ to: '/personel' as any })
        },
        {
          label: 'Ambar Tanımları',
          onClick: () => navigate({ to: '/ambar' as any })
        },
        {
          label: 'Komisyon Yönetimi',
          onClick: () => navigate({ to: '/komisyonlar' as any })
        },
        {
          label: 'Görev Tanımları',
          onClick: () => navigate({ to: '/komisyon-gorevleri' as any })
        },
        { divider: true },
        {
          label: 'İstekli Firma Yönetimi',
          onClick: () => navigate({ to: '/firmalar' as any })
        }
      ]
    },
    {
      name: 'Malzeme & Kodlar',
      items: [
        {
          label: 'Mal/Hizmet/Yapım İşleri Listesi',
          onClick: () => navigate({ to: '/malzemeler' as any })
        },
        {
          label: 'Taşınır Kodları',
          onClick: () => navigate({ to: '/tasinirkod' as any })
        },
        {
          label: 'OKAS Kodları',
          onClick: () => navigate({ to: '/okaskod' as any })
        },
        {
          label: 'Ölçü Birimleri',
          onClick: () => navigate({ to: '/olcubirimleri' as any })
        }
      ]
    },
    {
      name: 'Ayarlar & Raporlar',
      items: [
        {
          label: 'Genel Ayarlar',
          onClick: () => navigate({ to: '/ayarlar' as any })
        },
        {
          label: 'Mevzuat ve Parametreler',
          onClick: () => navigate({ to: '/mevzuat' as any })
        },
        {
          label: 'Toplu İçe Aktarma',
          onClick: () => navigate({ to: '/import' as any })
        },
        {
          label: 'Şablon & Kategori Yönetimi',
          onClick: () => navigate({ to: '/degiskenler' as any })
        },
        { divider: true },
        {
          label: 'Raporlar',
          onClick: () => navigate({ to: '/raporlar' as any })
        },
        {
          label: 'Şablon Listesi ve Süreçler',
          onClick: () => navigate({ to: '/taslakyonetim' as any })
        }
      ]
    },
    {
      name: 'Görünüm',
      items: [
        { label: 'Koyu Tema', onClick: () => setTheme('dark') },
        { label: 'Açık Tema', onClick: () => setTheme('light') },
        { divider: true },
        {
          label: 'Arayüzü Yenile (Ctrl+R)',
          onClick: () => window.location.reload()
        },
        {
          label: 'Geliştirici Araçları (DevTools)',
          onClick: () => window.electron?.ipcRenderer.send('window-toggle-devtools')
        }
      ]
    },
    {
      name: 'Senkronizasyon',
      items: [
        {
          label: isOfflineMode ? '✓ Ev Modu (Çevrimdışı)' : 'Ev Modu (Çevrimdışı)',
          onClick: () => handleToggleOfflineMode(true)
        },
        {
          label: !isOfflineMode ? '✓ Ofis Modu (Çevrimiçi)' : 'Ofis Modu (Çevrimiçi)',
          onClick: () => handleToggleOfflineMode(false)
        },
        { divider: true },
        {
          label: 'Bağlantı Ayarları...',
          onClick: () => setShowSyncPopover(true)
        }
      ]
    },
    {
      name: 'Yardım',
      items: [
        {
          label: 'Kullanım Kılavuzu & Yardım',
          onClick: () => navigate({ to: '/yardim' as any })
        },
        {
          label: 'Sürüm Notları (Changelog)',
          onClick: () => navigate({ to: '/changelog' as any })
        },
        { divider: true },
        {
          label: 'Dokümantasyon (GitHub)',
          onClick: () =>
            window.electron?.ipcRenderer.send(
              'open-external-url',
              'https://github.com/ilyasbozdemir/dt-asistan-desktop-app'
            )
        },
        {
          label: 'Hakkında...',
          onClick: () =>
            alert(
              'DT Asistan Lite v1.0.0-beta.38\nDoğrudan Temin ve Satın Alma Süreçleri Yönetim Sistemi'
            )
        }
      ]
    }
  ]

  const handleMenuHover = (menuName: string) => {
    if (activeMenu) {
      setActiveMenu(menuName)
    }
  }

  return (
    <header
      className="flex flex-col bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shrink-0 z-50 shadow-xs transition-all duration-300 relative select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* ÜST SATIR: Menü Çubuğu ve Sistem/Pencere Kontrolleri */}
      <div className="h-9 flex items-center justify-between px-3 border-b border-slate-200/40 dark:border-slate-800/40 relative">
        {/* SOL: VS Code-Style Menu Bar */}
        <div
          id="native-menu-bar"
          className="flex items-center gap-1 z-50 text-[11px] font-medium"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {menus.map((m) => (
            <div key={m.name} className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === m.name ? null : m.name)}
                onMouseEnter={() => handleMenuHover(m.name)}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  activeMenu === m.name
                    ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-650 dark:text-slate-350 hover:bg-slate-200/40 dark:hover:bg-slate-850 hover:text-slate-905 dark:hover:text-white'
                }`}
              >
                {m.name}
              </button>

              {activeMenu === m.name && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl py-1 z-[100] animate-in fade-in slide-in-from-top-1">
                  {m.items.map((item, idx) =>
                    item.divider ? (
                      <div key={idx} className="h-[1px] bg-slate-150 dark:bg-slate-800 my-1" />
                    ) : (
                      <button
                        key={idx}
                        onClick={() => {
                          item.onClick?.()
                          setActiveMenu(null)
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <span>{item.label}</span>
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* SAĞ: Sistem Kontrolleri (Tema, Eşitleme, Bildirim, vb.) */}
        <div
          className="flex items-center space-x-1.5 pr-36"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {/* Bulut Senkronizasyon Popover (Birleşik Gösterge & Buton) */}
          <div className="relative" ref={syncRef}>
            <button
              onClick={() => setShowSyncPopover(!showSyncPopover)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                isOfflineMode
                  ? 'bg-amber-500/10 text-amber-650 border-amber-500/20 dark:text-amber-400 hover:bg-amber-500/20'
                  : isOnline
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-650 border-rose-500/20 dark:text-rose-400 hover:bg-rose-500/20'
              }`}
              title="Bulut Senkronizasyon"
            >
              <Cloud className="w-3 h-3" />
              <span
                className={`w-1 h-1 rounded-full ${
                  isOfflineMode
                    ? 'bg-amber-500 animate-pulse'
                    : isOnline
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-rose-500 animate-pulse'
                }`}
              />
            </button>

            {showSyncPopover && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 space-y-4 z-[100] text-left animate-in fade-in slide-in-from-top-2">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-blue-500" />
                      Bulut Entegrasyon Ayarları
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                      Bulut API Gateway sunucunuza bağlanın.
                    </p>
                  </div>

                  <div
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 border ${
                      isOnline
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    }`}
                  >
                    {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    {isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
                  </div>
                </div>

                {/* Version Tracker Info */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl p-2.5 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Yerel Veri Sürümü:</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      v{dbVersionLocal}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Bulut Sunucu Sürümü:</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      v{dbVersionCloud}
                    </span>
                  </div>
                  {dbVersionLocal < dbVersionCloud && (
                    <div className="text-[9px] text-amber-600 dark:text-amber-400 font-bold animate-pulse text-right">
                      ▲ Sunucuda yeni değişiklikler var! Eşitleyin.
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">
                      Sunucu Adresi
                    </label>
                    <input
                      type="text"
                      placeholder="http://localhost:3000"
                      value={syncUrl}
                      onChange={(e) => setSyncUrl(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-250 dark:border-slate-800/80 rounded-lg p-2 font-mono text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">
                      Güvenlik Tokenı (Auth Key)
                    </label>
                    <input
                      type="password"
                      placeholder="dta_key_..."
                      value={syncToken}
                      onChange={(e) => setSyncToken(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-250 dark:border-slate-800/80 rounded-lg p-2 font-mono text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Auto sync / Mode Switch */}
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-550 dark:text-slate-450 uppercase tracking-wider">
                        Çalışma Modu
                      </span>
                      <span className="text-[8px] text-slate-400">
                        Ofis (Online) / Ev (Offline)
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isOfflineMode}
                        onChange={(e) => handleToggleOfflineMode(e.target.checked)}
                        className="sr-only peer cursor-pointer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleSaveAndTest}
                      disabled={syncStatus === 'loading'}
                      className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border border-slate-250 dark:border-slate-700"
                    >
                      {syncStatus === 'loading' ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        'Sına & Kaydet'
                      )}
                    </button>

                    <button
                      onClick={handleTriggerSync}
                      disabled={isSyncing || !syncUrl || !isOnline}
                      className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm shadow-blue-500/10"
                    >
                      {isSyncing ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        'Şimdi Eşitle'
                      )}
                    </button>
                  </div>

                  {syncMessage && (
                    <p
                      className={`text-[10px] font-semibold p-2 rounded-lg text-center ${
                        syncStatus === 'ok'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {syncMessage}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-all rounded hover:bg-slate-200/50 dark:hover:bg-slate-805/50"
            title="Tema Değiştir"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {updateStatus &&
            (updateStatus.status === 'available' || updateStatus.status === 'downloaded') && (
              <button
                onClick={() => {
                  if (updateStatus.status === 'downloaded') {
                    window.electron?.ipcRenderer.invoke('updater:quit-and-install')
                  } else {
                    alert('Güncelleme arka planda indiriliyor, lütfen bekleyin...')
                  }
                }}
                className="relative p-1 text-blue-500 hover:text-blue-600 transition-all rounded hover:bg-blue-50 dark:hover:bg-blue-900/30"
                title={
                  updateStatus.status === 'downloaded'
                    ? `Yeni sürüm hazır: ${updateStatus.version} (Kurmak için tıkla)`
                    : `Yeni sürüm iniyor: ${updateStatus.version}...`
                }
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-blue-500 rounded-full border border-white dark:border-slate-900 shadow-sm animate-pulse"></span>
              </button>
            )}

          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-all rounded hover:bg-slate-200/50 dark:hover:bg-slate-800/50 relative cursor-pointer"
              title="Bildirimler"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full border border-white dark:border-slate-900 shadow-sm animate-pulse"></span>
            </button>

            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 font-bold text-sm text-slate-700 dark:text-slate-200 flex justify-between items-center">
                  Bildirimler ve İşlem Logları
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-slate-600"
                    title="Kapat"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar flex flex-col">
                  {announcements && announcements.length > 0 ? (
                    announcements.slice(0, 10).map((item, i) => (
                      <div
                        key={i}
                        className="p-3 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight mb-1">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                          {item.content}
                        </p>
                        <p className="text-[9px] text-slate-400 mt-1.5 font-mono">
                          {new Date(item.date).toLocaleString('tr-TR')}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      Henüz bildirim bulunmuyor.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Native-style Window Controls */}
        <div
          className="absolute top-0 right-0 flex items-center h-full"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            onClick={handleMinimize}
            className="h-full w-11 flex items-center justify-center text-slate-400 hover:text-slate-750 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-none cursor-pointer"
            title="Simge Durumuna Küçült"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleMaximize}
            className="h-full w-11 flex items-center justify-center text-slate-400 hover:text-slate-750 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-none cursor-pointer"
            title="Ekranı Kapla"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={handleClose}
            className="h-full w-11 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#e81123] transition-none cursor-pointer"
            title="Kapat"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ALT SATIR: Çalışma Dosyası Seçimi */}
      <div
        className="min-h-9 py-1 flex items-center justify-center bg-slate-100/50 dark:bg-slate-950/20 border-t border-slate-200/30 dark:border-slate-800/30 select-none"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <TeminSelector />
      </div>
    </header>
  )
}
