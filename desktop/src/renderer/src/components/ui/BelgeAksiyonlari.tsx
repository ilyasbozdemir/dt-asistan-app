import React, { useState, useEffect, useRef } from 'react'
import { Eye, Printer, Download, Star } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface Sablon {
  id: number
  ad: string
  dosya_adi: string
  kategori: string
  icerik: string
  route_path?: string
  test_verisi?: string
}

interface BelgeAksiyonlariProps {
  isStarred: boolean
  onPreview: () => void
  onQuickPrint: () => void
  onExport: (format: 'pdf' | 'docx' | 'udf') => void
  onToggleStar: () => void
  disabled?: boolean
}

export function BelgeAksiyonlari({
  isStarred,
  onPreview,
  onQuickPrint,
  onExport,
  onToggleStar,
  disabled
}: BelgeAksiyonlariProps): React.JSX.Element {
  const [indirMenuOpen, setIndirMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIndirMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={onPreview}
        disabled={disabled}
        title="Önizle / Düzenle"
        className={cn(
          'p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
          'hover:bg-blue-50 text-blue-500 dark:hover:bg-blue-900/20'
        )}
      >
        <Eye className="w-4 h-4" />
      </button>

      <button
        onClick={onQuickPrint}
        disabled={disabled}
        title="Hızlı Yazdır"
        className={cn(
          'p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
          'hover:bg-slate-100 text-slate-400 dark:text-slate-500 dark:hover:bg-slate-800'
        )}
      >
        <Printer className="w-4 h-4" />
      </button>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIndirMenuOpen((v) => !v)}
          disabled={disabled}
          title="İndir"
          className={cn(
            'p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
            'hover:bg-slate-100 text-slate-400 dark:text-slate-500 dark:hover:bg-slate-800',
            indirMenuOpen && 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350'
          )}
        >
          <Download className="w-4 h-4" />
        </button>
        {indirMenuOpen && (
          <div className="absolute right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-50 w-28 py-1">
            {(['pdf', 'docx', 'udf'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => {
                  onExport(fmt)
                  setIndirMenuOpen(false)
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 uppercase font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                {fmt}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onToggleStar}
        disabled={disabled}
        title={isStarred ? 'Hızlı Erişimden Çıkar' : 'Hızlı Erişime Ekle'}
        className={cn(
          'p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
          isStarred
            ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
            : 'text-slate-300 hover:text-amber-500 hover:bg-slate-100 dark:text-slate-650 dark:hover:bg-slate-850'
        )}
      >
        <Star className={cn('w-4 h-4', isStarred && 'fill-amber-500')} />
      </button>
    </div>
  )
}
