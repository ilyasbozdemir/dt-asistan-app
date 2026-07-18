import React from 'react'
import { Edit2, Trash2 } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { cn } from '../../../utils/cn'
import { Kalem } from '../malzemeler.hooks'

interface MalzemeGridCardProps {
  item: Kalem
  isSelected: boolean
  onToggleSelect: (id: number) => void
  onEdit: (item: Kalem) => void
  onDelete: (item: Kalem) => void
}

export function MalzemeGridCard({
  item,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete
}: MalzemeGridCardProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col p-4 bg-slate-50/50 dark:bg-slate-950/20 border rounded-xl hover:border-blue-300 dark:hover:border-blue-800 transition-colors group relative cursor-pointer',
        isSelected
          ? 'border-blue-400 dark:border-blue-800 bg-blue-50/20 dark:bg-blue-900/10'
          : 'border-slate-150 dark:border-slate-850'
      )}
      onClick={() => onToggleSelect(item.id)}
    >
      <div className="absolute top-3 left-3" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(item.id)}
          className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500 cursor-pointer animate-in fade-in"
        />
      </div>

      <div
        className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(item)}
          className="h-7 w-7 p-0 text-slate-400 hover:text-blue-500"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
        <Button
          title="Sil"
          variant="ghost"
          size="sm"
          onClick={() => onDelete(item)}
          className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="flex flex-col gap-1 mb-2 pr-12 pl-6">
        <span className="font-mono font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          ID: {item.barkod_id}
        </span>
        {item.tasinir_kodu && (
          <span className="w-fit font-mono font-bold text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100/20 dark:border-emerald-900/10 px-1.5 py-0.5 rounded">
            T: {item.tasinir_kodu}
          </span>
        )}
        {item.okas_kodu && (
          <span className="w-fit font-mono font-bold text-[10px] text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100/20 dark:border-indigo-900/10 px-1.5 py-0.5 rounded">
            OKAS: {item.okas_kodu}
          </span>
        )}
      </div>

      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 leading-snug line-clamp-3">
        {item.kalem_adi}
      </h4>

      <div className="mt-auto border-t border-slate-200/60 dark:border-slate-800/60 pt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-slate-600 dark:text-slate-300">{item.tipi}</span>
        <span className="font-semibold text-slate-600 dark:text-slate-300">
          Birim: {item.birim}
        </span>
      </div>
    </div>
  )
}
