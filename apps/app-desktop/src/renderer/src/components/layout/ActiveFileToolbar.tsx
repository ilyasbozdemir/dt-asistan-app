import React from 'react'
import { Link } from '@tanstack/react-router'
import { ClipboardList, LogOut, Printer } from 'lucide-react'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { useSettingsStore } from '../../store/settingsStore'

export function ActiveFileToolbar(): React.JSX.Element | null {
  const { activeDosyaId, setActiveDosyaId } = useWorkspaceStore()
  const { adminUsername } = useSettingsStore()

  const searchParams = new URLSearchParams(window.location.search)
  const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '')
  const isDosyaWindowMode =
    searchParams.get('mode') === 'dosya_window' || hashParams.get('mode') === 'dosya_window'

  if (!activeDosyaId) return null

  return (
    <div className="min-h-12 py-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-sm border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 gap-4 shrink-0 z-40 relative">
      {!isDosyaWindowMode && (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveDosyaId(null)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-red-650 dark:text-red-400 hover:text-white hover:bg-red-600 dark:hover:bg-red-600/90 bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 rounded-md transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
            title="Aktif Doğrudan Temin Dosyasını Kapat ve Başlangıç Ekranına Dön"
          >
            <LogOut className="w-3.5 h-3.5" />
            Doğrudan Temin Dosyasını Kapat
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 ml-auto shrink-0">
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
