import React from 'react'
import { Link } from '@tanstack/react-router'
import { ClipboardList, Printer } from 'lucide-react'
import { useWorkspaceStore } from '../../store/workspaceStore'

export function ActiveFileToolbar(): React.JSX.Element | null {
  const { activeDosyaId } = useWorkspaceStore()

  if (!activeDosyaId) return null

  return (
    <div className="min-h-12 py-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-sm border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 gap-4 shrink-0 z-40 relative">
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
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-indigo-900/30 dark:text-emerald-300 dark:hover:bg-indigo-900/50 rounded-md transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          Çıktı Merkezi
        </Link>
      </div>
    </div>
  )
}
