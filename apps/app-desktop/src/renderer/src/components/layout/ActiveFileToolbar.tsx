import React, { useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronLeft, ClipboardList, Printer } from 'lucide-react'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { useSettingsStore } from '../../store/settingsStore'

export function ActiveFileToolbar(): React.JSX.Element | null {
  const { activeDosyaId, setActiveDosyaId, fileName } = useWorkspaceStore()
  const { institutionName, adminUsername, eButceKodu, loadSettings } = useSettingsStore()

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const searchParams = new URLSearchParams(window.location.search)
  const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '')
  const isDosyaWindowMode =
    searchParams.get('mode') === 'dosya_window' || hashParams.get('mode') === 'dosya_window'

  if (!activeDosyaId) return null

  return (
    <div className="min-h-[3rem] py-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-sm border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 gap-4 shrink-0 z-40 relative">
      {!isDosyaWindowMode && (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveDosyaId(null)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-650 dark:text-red-400 hover:text-white hover:bg-red-600 dark:hover:bg-red-600/90 bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 rounded-md transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
            title="Mevcut Kurum Dosyasını Kapat ve Başlangıç Ekranına Dön"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Dosyayı Kapat
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 border-l border-slate-200 dark:border-slate-850 pl-3 select-none">
            <span className="font-bold text-[9px] uppercase text-slate-450 dark:text-slate-500 tracking-wider">
              Dosya:
            </span>
            <span
              className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px] lg:max-w-[200px]"
              title={fileName}
            >
              {fileName}
            </span>

            {institutionName &&
              institutionName !== 'Kurum Adı Bulunamadı' &&
              institutionName !== 'Kurum Bilgisi Bekleniyor...' && (
                <>
                  <span className="text-slate-300 dark:text-slate-800 font-light">|</span>
                  <span className="font-bold text-[9px] uppercase text-slate-450 dark:text-slate-500 tracking-wider">
                    Kurum:
                  </span>
                  <span
                    className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[150px] lg:max-w-[280px]"
                    title={institutionName}
                  >
                    {institutionName}
                  </span>
                </>
              )}

            {eButceKodu && (
              <>
                <span className="text-slate-300 dark:text-slate-800 font-light">|</span>
                <span className="font-bold text-[9px] uppercase text-slate-450 dark:text-slate-500 tracking-wider">
                  Kod:
                </span>
                <span className="font-mono font-semibold text-slate-705 dark:text-slate-295">
                  {eButceKodu}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 ml-auto shrink-0">
        {adminUsername && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 border-r border-slate-200 dark:border-slate-800 pr-3 mr-1 shrink-0 select-none">
            <span className="font-bold text-[9px] uppercase text-slate-450 dark:text-slate-500 tracking-wider">
              Kullanıcı:
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-350 uppercase bg-slate-100/80 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
              {adminUsername}
            </span>
          </div>
        )}

        <Link
          to="/takip"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 rounded-md transition-colors"
        >
          <ClipboardList className="w-3.5 h-3.5" />
          Süreç & Durum
        </Link>
        <Link
          to="/cikti-merkezi"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50 rounded-md transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          Çıktı Merkezi
        </Link>
      </div>
    </div>
  )
}
