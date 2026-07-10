import React, { useRef, useState, useEffect } from 'react'
import {
  Bell,
  Moon,
  Sun,
  Minus,
  Square,
  X,
  DownloadCloud,
  Cloud,
  Shield,
  RefreshCw,
  Info
} from 'lucide-react'
import { useTheme } from '../providers/ThemeProvider'
import { TeminSelector } from './TeminSelector'
import { useAnnouncements } from '../../screens/dashboard/dashboard.hooks'

export function Header(): React.JSX.Element {
  const { theme, setTheme } = useTheme()
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

  const { announcements } = useAnnouncements()

  // Load settings on mount
  useEffect(() => {
    window.electron?.ipcRenderer.invoke('db:get-settings')
      .then((settings) => {
        if (settings) {
          setSyncUrl(settings.sync_server_url || '')
          setSyncToken(settings.sync_server_token || '')
        }
      })
      .catch(console.error)
  }, [])

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
      if (syncRef.current && !syncRef.current.contains(e.target as Node)) {
        setShowSyncPopover(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNotifications, showSyncPopover])

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
      } else {
        setSyncStatus('error')
        setSyncMessage(testRes.message || 'Bağlantı başarısız.')
      }
    } catch (err: any) {
      setSyncStatus('error')
      setSyncMessage(err.message || 'Bir hata oluştu.')
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
        // Reload workspace/data if needed
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

  return (
    <header
      className="h-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-6 shrink-0 z-50 shadow-sm transition-all duration-300 relative"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* SOL: Boş Alan */}
      <div className="flex-1 flex items-center gap-6"></div>

      {/* ORTA: TeminSelector */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center z-50"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <TeminSelector />
      </div>

      {/* SAĞ: Kontroller */}
      <div className="flex items-center space-x-1 pr-32">
        
        {/* Bulut Senkronizasyon Popover */}
        <div className="relative" ref={syncRef} style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <button
            onClick={() => setShowSyncPopover(!showSyncPopover)}
            className={`p-2 transition-all rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 relative mr-1 cursor-pointer ${
              syncUrl ? 'text-blue-500' : 'text-slate-500'
            }`}
            title="Bulut Senkronizasyon & Auth"
          >
            <Cloud className="w-4 h-4" />
            {syncUrl && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-sm animate-pulse"></span>
            )}
          </button>

          {showSyncPopover && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 space-y-4 z-[100] text-left animate-in fade-in slide-in-from-top-2">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-blue-500" />
                  Bulut Entegrasyon Ayarları
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Bulut API Gateway sunucunuza bağlanın.</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Sunucu Adresi</label>
                  <input
                    type="text"
                    placeholder="http://localhost:3000"
                    value={syncUrl}
                    onChange={(e) => setSyncUrl(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg p-2 font-mono text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Güvenlik Tokenı (Auth Key)</label>
                  <input
                    type="password"
                    placeholder="dta_key_..."
                    value={syncToken}
                    onChange={(e) => setSyncToken(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-lg p-2 font-mono text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSaveAndTest}
                    disabled={syncStatus === 'loading'}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    {syncStatus === 'loading' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Sına & Kaydet'}
                  </button>

                  <button
                    onClick={handleTriggerSync}
                    disabled={isSyncing || !syncUrl}
                    className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm shadow-blue-500/10"
                  >
                    {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Şimdi Eşitle'}
                  </button>
                </div>

                {syncMessage && (
                  <p className={`text-[10px] font-semibold p-2 rounded-lg text-center ${
                    syncStatus === 'ok' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  }`}>
                    {syncMessage}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-all rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
          title="Tema Değiştir"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {updateStatus &&
          (updateStatus.status === 'available' || updateStatus.status === 'downloaded') && (
            <button
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
              onClick={() => {
                if (updateStatus.status === 'downloaded') {
                  window.electron?.ipcRenderer.invoke('updater:quit-and-install')
                } else {
                  alert('Güncelleme arka planda indiriliyor, lütfen bekleyin...')
                }
              }}
              className="relative p-2 text-blue-500 hover:text-blue-600 transition-all rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30"
              title={
                updateStatus.status === 'downloaded'
                  ? `Yeni sürüm hazır: ${updateStatus.version} (Kurmak için tıkla)`
                  : `Yeni sürüm iniyor: ${updateStatus.version}...`
              }
            >
              <DownloadCloud className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-pulse"></span>
            </button>
          )}

        <div className="relative" ref={notificationRef}>
          <button
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-all rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 relative mr-2 cursor-pointer"
            title="Bildirimler"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-pulse"></span>
          </button>

          {showNotifications && (
            <div className="absolute top-full right-2 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2">
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
        className="absolute top-0 right-0 flex items-center h-8"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={handleMinimize}
          className="h-full w-12 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-none"
          title="Simge Durumuna Küçült"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleMaximize}
          className="h-full w-12 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-none"
          title="Ekranı Kapla"
        >
          <Square className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleClose}
          className="h-full w-12 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#e81123] transition-none"
          title="Kapat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
