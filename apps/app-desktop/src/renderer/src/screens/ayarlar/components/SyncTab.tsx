import React from 'react'
import { Upload, Download, RefreshCw, Code, Save } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'

interface SyncTabProps {
  syncServerUrl: string
  setSyncServerUrl: (val: string) => void
  syncServerPort: string
  setSyncServerPort: (val: string) => void
  syncServerToken: string
  setSyncServerToken: (val: string) => void
  syncTestStatus: 'idle' | 'loading' | 'ok' | 'error'
  syncTestMsg: string
  isSyncing: boolean
  isPushing: boolean
  isPulling: boolean
  saving: boolean
  syncLastResult: { type: 'ok' | 'error'; msg: string } | null
  handleSyncTestConnection: () => void
  handleManualSync: () => void
  handlePushToServer: () => void
  handlePullFromServer: () => void
  handleSaveTab: (tab: any) => void
}

export const SyncTab: React.FC<SyncTabProps> = ({
  syncServerUrl,
  setSyncServerUrl,
  syncServerPort,
  setSyncServerPort,
  syncServerToken,
  setSyncServerToken,
  syncTestStatus,
  syncTestMsg,
  isSyncing,
  isPushing,
  isPulling,
  saving,
  syncLastResult,
  handleSyncTestConnection,
  handleManualSync,
  handlePushToServer,
  handlePullFromServer,
  handleSaveTab
}) => {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <div>
          <h2 className="text-lg font-bold text-slate-855 dark:text-slate-100">
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
              ? 'bg-emerald-505/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
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
            className="text-[10px] font-bold py-1.5 px-3 rounded-lg bg-white/80 dark:bg-slate-955/80 hover:bg-white dark:hover:bg-slate-950 text-slate-805 dark:text-slate-100 shadow-sm border border-black/5"
          >
            {syncTestStatus === 'loading' ? 'Bağlantı Sınanıyor...' : 'Bağlantıyı Şimdi Sına'}
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
              {syncTestStatus === 'loading' ? '⏳ Test Ediliyor...' : '⚡ Bağlantıyı Test Et'}
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
              <span className="text-xs font-semibold text-red-505 dark:text-red-400">
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
            Yerel veritabanındaki güncel verileri (dosyalar, belgeler, ayarlar) uzak web sunucusuna
            göndererek yayınlar.
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
            Uzak sunucudaki güncel verileri yerel veritabanına indirir. Mevcut yereldeki veriler
            üzerine yazılabilir.
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
        <p className="text-xs text-slate-500 leading-relaxed">
          Masaüstündeki yerel verileri merkezi bir bulut veri tabanında toplamak ve eşitlemek için,
          projenin{' '}
          <code className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-blue-600 dark:text-blue-450 font-mono text-[10px] rounded">
            web/
          </code>{' '}
          klasöründeki API sunucusunu Docker ile saniyeler içinde ayağa kaldırabilirsiniz. Eşitleme
          sonrası yerel dosya (.dtal) workspace'leriniz bulut sunucunuza aktarılır.
        </p>

        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3.5 space-y-2.5 font-mono text-[10px] text-slate-700 dark:text-slate-400">
          <div className="text-slate-400">
            {'// 1. Terminalde projenin ana klasörüne gidin ve derleyin'}
          </div>
          <div className="text-blue-600 dark:text-blue-450">
            docker build -t dt-asistan-server ./web
          </div>

          <div className="text-slate-400 mt-2">{'// 2. Sunucuyu 3000 portundan çalıştırın'}</div>
          <div className="text-blue-600 dark:text-blue-450">
            docker run -p 3000:3000 --name dt-server -d dt-asistan-server
          </div>

          <div className="text-slate-400 mt-2">
            {'// 3. Masaüstü bağlantısında Sunucu Adresi alanına girilecek değer'}
          </div>
          <div>
            Varsayılan Adres:{' '}
            <span className="text-emerald-600 dark:text-emerald-450 font-bold">
              http://localhost:3000
            </span>{' '}
            veya{' '}
            <span className="text-emerald-600 dark:text-emerald-450 font-bold">
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
  )
}
