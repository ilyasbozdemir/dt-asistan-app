import React, { useRef, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { useAnnouncements } from '../../../screens/dashboard/dashboard.hooks'

interface NotificationPopoverProps {
  isOpen: boolean
  onToggle: (open: boolean) => void
}

export function NotificationPopover({
  isOpen,
  onToggle
}: NotificationPopoverProps): React.JSX.Element {
  const { announcements } = useAnnouncements()
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onToggle(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onToggle])

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => onToggle(!isOpen)}
        className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-all rounded hover:bg-slate-200/50 dark:hover:bg-slate-800/50 relative cursor-pointer"
        title="Bildirimler"
      >
        <Bell className="w-3.5 h-3.5" />
        <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full border border-white dark:border-slate-900 shadow-sm animate-pulse"></span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 font-bold text-sm text-slate-700 dark:text-slate-200 flex justify-between items-center">
            Bildirimler ve İşlem Logları
            <button
              onClick={() => onToggle(false)}
              className="text-slate-400 hover:text-slate-650 cursor-pointer"
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
                  className="p-3 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight mb-1">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-slate-550 line-clamp-2 leading-relaxed">
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
  )
}
