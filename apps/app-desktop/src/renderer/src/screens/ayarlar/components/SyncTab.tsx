import React, { useEffect } from 'react'
import { Upload, Download, RefreshCw, Code, Save, Cloud, Shield, Wifi, WifiOff } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { useSyncStore } from '../../../store/syncStore'
import packageJson from '../../../../../../package.json'

export const SyncTab: React.FC = () => {
  const {
    syncUrl,
    setSyncUrl,
    syncPort,
    setSyncPort,
    syncToken,
    setSyncToken,
    isOnlineMode,
    setIsOnlineMode,
    syncStatus,
    syncMessage,
    isSyncing,
    isPushing,
    isPulling,
    syncLastResult,
    dbVersionLocal,
    dbVersionCloud,
    activeProvider,
    setActiveProvider,
    loadSettings,
    saveSettings,
    testConnection,
    triggerSync,
    triggerPush,
    triggerPull
  } = useSyncStore()

  useEffect(() => {
    loadSettings()
  }, [])

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-855 dark:text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Bulut Entegrasyonu ve Senkronizasyon
          </h2>
          <p className="text-xs text-slate-500">
            Yerel verilerinizi ve çalışma dosyalarınızı (.dtal) bulut sunucusu veya Google Drive ile eşitleyin.
          </p>
        </div>

        {/* Bulut Sağlayıcı Seçim Sekmeleri */}
        <div className="flex bg-slate-200/60 dark:bg-slate-950 p-1 rounded-xl gap-1 border border-slate-200 dark:border-slate-800 shrink-0">
          <button
            onClick={() => setActiveProvider('server')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeProvider === 'server'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            🌐 API Web Sunucu
          </button>
          <button
            onClick={() => setActiveProvider('gdrive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeProvider === 'gdrive'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            ☁️ Google Drive
          </button>
        </div>
      </div>

      {activeProvider === 'server' ? (
        <>
          {/* Sunucu Durum & Güncelleme Bilgi Paneli */}
          <div
            className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-3 ${
              syncUrl
                ? syncStatus === 'ok'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                  : syncStatus === 'error'
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300'
                    : 'bg-blue-500/10 border-blue-500/20 text-blue-800 dark:text-blue-300'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                  syncUrl
                    ? syncStatus === 'ok'
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : syncStatus === 'error'
                        ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                        : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                    : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                }`}
              >
                {syncUrl
                  ? syncStatus === 'ok'
                    ? '✓'
                    : syncStatus === 'error'
                      ? '✗'
                      : '⏳'
                  : '!'}
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  {!syncUrl
                    ? 'Bağlantı Kurulmadı'
                    : syncStatus === 'ok'
                      ? 'Sunucu Aktif & Bağlı'
                      : syncStatus === 'error'
                        ? 'Bağlantı Başarısız'
                        : 'Bağlantı Test Edilmedi'}

                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 border ${
                      isOnlineMode
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    }`}
                  >
                    {isOnlineMode ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    {isOnlineMode ? 'Ofis (Online)' : 'Ev (Offline)'}
                  </span>
                </div>
                <div className="text-[11px] opacity-90 mt-0.5">
                  {!syncUrl
                    ? 'Lütfen veri senkronizasyonu için geçerli bir Sunucu Adresi girin.'
                    : syncStatus === 'ok'
                      ? `Uzak sunucu (${syncUrl}) ile iletişim başarıyla sağlandı. Değişiklikler otomatik senkronize edilir.`
                      : syncStatus === 'error'
                        ? 'Girdiğiniz adrese ulaşılamadı. Sunucu ayarlarınızı veya internetinizi kontrol edin.'
                        : 'Sunucu adresi tanımlandı. Lütfen aşağıdaki buton ile bağlantıyı test edin.'}
                </div>
              </div>
            </div>

            {syncUrl && (
              <Button
                onClick={() => testConnection()}
                disabled={syncStatus === 'loading'}
                className="text-[10px] font-bold py-1.5 px-3 rounded-lg bg-white/80 dark:bg-slate-955/80 hover:bg-white dark:hover:bg-slate-950 text-slate-805 dark:text-slate-100 shadow-sm border border-black/5"
              >
                {syncStatus === 'loading' ? (
                  <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                ) : null}
                {syncStatus === 'loading' ? 'Bağlantı Sınanıyor...' : 'Sına & Kaydet'}
              </Button>
            )}
          </div>

          {/* Sürüm Bilgisi */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
              <div>
                Yerel Sürüm:{' '}
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  v{packageJson.version}
                </span>
              </div>
              <div className="text-slate-300 dark:text-slate-700">•</div>
              <div>
                Bulut Sürüm:{' '}
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  v{packageJson.version}
                </span>
              </div>
            </div>
            {dbVersionLocal < dbVersionCloud && (
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold animate-pulse">
                ▲ Sunucuda yeni değişiklikler var! Lütfen eşitleyin.
              </div>
            )}
          </div>

          {/* Bağlantı Ayarları */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Sunucu Bağlantı Ayarları
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Sunucu Adresi (Domain / IP)
                </label>
                <Input
                  type="text"
                  placeholder="https://temin360app.demo.ilyasbozdemir.dev/"
                  value={syncUrl}
                  onChange={(e) => setSyncUrl(e.target.value)}
                  className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Port (Opsiyonel)
                </label>
                <Input
                  type="text"
                  placeholder="3000"
                  value={syncPort}
                  onChange={(e) => setSyncPort(e.target.value)}
                  className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Güvenlik Tokenı (Auth Key)
                </label>
                <Input
                  type="password"
                  placeholder="dta_key_..."
                  value={syncToken}
                  onChange={(e) => setSyncToken(e.target.value)}
                  className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-mono text-xs"
                />
              </div>
            </div>

            {/* Çalışma Modu Toggle */}
            <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800/80 pt-3">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Çalışma Modu
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {isOnlineMode
                    ? 'Ofis (Online) - Değişiklikler canlı olarak sunucuya aktarılır'
                    : 'Ev (Offline) - Yerel SQLite veritabanı üzerinden bağımsız çalışılır'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOnlineMode}
                  onChange={(e) => setIsOnlineMode(e.target.checked)}
                  className="sr-only peer cursor-pointer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => saveSettings()}
                  className="text-xs py-1.5 px-4 rounded-lg bg-slate-700 hover:bg-slate-900 text-white gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Ayarları Kaydet
                </Button>
                <Button
                  onClick={() => testConnection()}
                  disabled={syncStatus === 'loading'}
                  className="text-xs py-1.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                >
                  {syncStatus === 'loading' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : null}
                  Sına & Bağlan
                </Button>
              </div>

              {syncMessage && (
                <span
                  className={`text-xs font-semibold ${
                    syncStatus === 'ok'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {syncMessage}
                </span>
              )}
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
                Yerel veritabanındaki güncel verileri (dosyalar, belgeler, ayarlar) uzak web sunucusuna
                göndererek yayınlar.
              </p>
              <Button
                onClick={() => triggerPush()}
                disabled={isPushing || !syncUrl}
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
                    Uzak sunucudaki güncellemeleri çek (Pull)
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                Uzak sunucudaki verileri yerel veritabanınıza indirerek günceller.
              </p>
              <Button
                onClick={() => triggerPull()}
                disabled={isPulling || !syncUrl}
                className="mt-auto w-full text-sm py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPulling ? '⏳ Alınıyor...' : '📥 Sunucudan Al'}
              </Button>
            </div>
          </div>

          {/* Senkronizasyon Sonuç Bildirim Alanı */}
          {syncLastResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200 ${
                syncLastResult.type === 'ok'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
              }`}
            >
              <span>{syncLastResult.msg}</span>
            </div>
          )}

          {/* Genel Eşitle */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3">
            <RefreshCw className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500 flex-1">
              İki yönlü otomatik eşitleme (Push + Pull)
            </span>
            <Button
              onClick={() => triggerSync()}
              disabled={isSyncing || !syncUrl}
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
            <p className="text-xs text-slate-500 leading-relaxed">
              Masaüstündeki yerel verileri merkezi bir bulut veri tabanında toplamak ve eşitlemek için,
              projenin root dizinindeki{' '}
              <code className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-mono text-[10px] rounded">
                docker-compose.yml
              </code>{' '}
              ile PostgreSQL ve API sunucusunu saniyeler içinde ayağa kaldırabilirsiniz.
            </p>

            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3.5 space-y-2.5 font-mono text-[10px] text-slate-700 dark:text-slate-400">
              <div className="text-slate-400">
                {'# 1. PostgreSQL & TEMİN 360 Web Sunucusunu Docker ile başlatın:'}
              </div>
              <div className="text-blue-600 dark:text-blue-400 font-bold">
                docker compose up -d
              </div>
              <div className="text-slate-400 dark:text-slate-500 mt-2">
                # Veya sadece Web Gateway imajını derleyin:
              </div>
              <div className="text-blue-600 dark:text-blue-400">
                docker build -f Dockerfile.web -t temin360-web .
              </div>
              <div className="text-blue-600 dark:text-blue-400">
                docker run -p 3000:3000 --name temin360-server -d temin360-web
              </div>

              <div className="text-slate-400 mt-2">
                {'// 2. Masaüstü bağlantısında Sunucu Adresi alanına girilecek değerler:'}
              </div>
              <div className="space-y-1">
                <div>
                  Canlı Demo:{' '}
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    https://temin360app.demo.ilyasbozdemir.dev/
                  </span>
                </div>
                <div>
                  Yerel / LAN Sunucu:{' '}
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    http://localhost:3000
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-5">
          {/* Google Drive Bulut Depo Paneli */}
          <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-blue-500/10 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-blue-950/40 rounded-2xl p-6 border border-emerald-200/60 dark:border-emerald-800/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Cloud className="w-6 h-6 text-emerald-500" />
                  Google Drive Bulut Depolama & Eşitleme Yöneticisi
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                  Çalışma (.dtal) dosyalarınızı doğrudan kişisel Google Drive hesabınıza yedekleyin, mevcut yedeklerinizi listeleyin ve istediğiniz dosyayı seçip bilgisayarınıza indirin.
                </p>
              </div>
              <Button
                onClick={() => {
                  const event = new CustomEvent('open-gdrive-modal')
                  window.dispatchEvent(event)
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-5 rounded-xl shadow-md shrink-0 flex items-center gap-2"
              >
                <Cloud size={16} /> Google Drive Bulut Yöneticisini Aç
              </Button>
            </div>
          </div>

          {/* Quick Actions Grid for Google Drive */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                  <Upload size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    Buluta Yükleme (Export)
                  </h4>
                  <p className="text-xs text-slate-500">Aktif .dtal dosyanızı Drive'a gönderir</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Çalışma alanınızdaki tüm verileri ve belgeleri paketleyerek Google Drive hesabınıza yeni bir yedek olarak kaydeder.
              </p>
              <Button
                onClick={() => {
                  const event = new CustomEvent('open-gdrive-modal')
                  window.dispatchEvent(event)
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-xl"
              >
                Dosyayı Buluta Yükle
              </Button>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <Download size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    Buluttan İndirme (Import)
                  </h4>
                  <p className="text-xs text-slate-500">Drive'daki .dtal yedeklerini listeler</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Google Drive hesabınızdaki geçmiş çalışma dosyalarını çekerek seçtiğiniz yedeği indirir ve aktif çalışma alanı yapar.
              </p>
              <Button
                onClick={() => {
                  const event = new CustomEvent('open-gdrive-modal')
                  window.dispatchEvent(event)
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl"
              >
                Bulut Yedeklerini Listele & İndir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
