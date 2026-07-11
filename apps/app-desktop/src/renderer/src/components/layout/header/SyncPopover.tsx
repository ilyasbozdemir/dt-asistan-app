import React, { useState, useEffect, useRef } from 'react'
import { Cloud, Shield, Wifi, WifiOff, RefreshCw } from 'lucide-react'

export function SyncPopover(): React.JSX.Element {
  const [showSyncPopover, setShowSyncPopover] = useState(false)
  const [syncUrl, setSyncUrl] = useState('')
  const [syncToken, setSyncToken] = useState('')
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [syncMessage, setSyncMessage] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [dbVersionLocal, setDbVersionLocal] = useState(104)
  const [dbVersionCloud, setDbVersionCloud] = useState(104)
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const syncRef = useRef<HTMLDivElement>(null)

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
    function handleClickOutside(event: MouseEvent) {
      if (syncRef.current && !syncRef.current.contains(event.target as Node)) {
        setShowSyncPopover(false)
      }
    }
    if (showSyncPopover) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSyncPopover])

  const handleSaveAndTest = async () => {
    setSyncStatus('loading')
    setSyncMessage('Bağlantı test ediliyor...')
    try {
      await window.electron.ipcRenderer.invoke('db:save-settings', {
        sync_server_url: syncUrl,
        sync_server_token: syncToken
      })

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
        const newVer = dbVersionLocal + 1
        setDbVersionLocal(newVer)
        setDbVersionCloud(newVer)

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

  return (
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

            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-550 dark:text-slate-450 uppercase tracking-wider">
                  Çalışma Modu
                </span>
                <span className="text-[8px] text-slate-400 font-medium">
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
                {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Şimdi Eşitle'}
              </button>
            </div>

            {syncMessage && (
              <p
                className={`text-[10px] font-semibold p-2 rounded-lg text-center ${
                  syncStatus === 'ok'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 text-rose-650 dark:text-rose-400'
                }`}
              >
                {syncMessage}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
