import React from 'react'
import { cn } from '../../../utils/cn'

export function DetailField({
  icon,
  label,
  value
}: {
  icon: React.ReactNode
  label: string
  value: string
}): React.ReactNode {
  return (
    <div className="p-2 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl">
      <div className="flex items-center gap-1 text-slate-400 mb-0.5">
        {icon}
        <span className="text-[9px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{value}</p>
    </div>
  )
}

export function DetailRow({
  label,
  value,
  mono
}: {
  label: string
  value: string
  mono?: boolean
}): React.ReactNode {
  return (
    <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-850/80 last:border-0">
      <span className="text-[10px] text-slate-500 dark:text-slate-450 font-medium shrink-0 mr-2">
        {label}:
      </span>
      <span
        className={cn(
          'text-[10px] font-bold text-slate-700 dark:text-slate-300 text-right truncate max-w-[180px]',
          mono && 'font-mono'
        )}
      >
        {value}
      </span>
    </div>
  )
}
