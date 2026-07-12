import React from 'react'
import { Megaphone, Info, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react'

interface Announcement {
  id: string | number
  title: string
  content: string
  date: string
  type: 'info' | 'success' | 'warning' | 'error' | string
}

interface AnnouncementsPanelProps {
  isAnnouncementsLoading: boolean
  announcements: Announcement[]
}

export const AnnouncementsPanel: React.FC<AnnouncementsPanelProps> = ({
  isAnnouncementsLoading,
  announcements
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col max-h-[360px] overflow-hidden">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <Megaphone className="w-5 h-5 text-amber-500" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Duyurular ve İşlem Logları
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4 min-h-0 custom-scrollbar">
        {isAnnouncementsLoading ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
            Duyurular yükleniyor...
          </div>
        ) : announcements.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
            Aktif duyuru bulunmuyor.
          </div>
        ) : (
          announcements.map((ann) => {
            let DotIcon = Info
            let colorClass = 'bg-blue-500 text-white'

            if (ann.type === 'success') {
              DotIcon = CheckCircle2
              colorClass = 'bg-emerald-500 text-white'
            } else if (ann.type === 'warning') {
              DotIcon = AlertTriangle
              colorClass = 'bg-amber-500 text-white'
            } else if (ann.type === 'error') {
              DotIcon = ShieldAlert
              colorClass = 'bg-red-500 text-white'
            }

            return (
              <div key={ann.id} className="flex gap-3 items-start">
                <div
                  className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}
                >
                  <DotIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {ann.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {ann.content}
                  </p>
                  <span className="text-[9px] text-slate-400 font-medium mt-1 block">
                    {ann.date}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
