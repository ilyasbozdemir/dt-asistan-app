import React from 'react'
import { Building2, Edit2, Trash2 } from 'lucide-react'
import { Button } from '../../../components/ui/Button'

interface FirmaGridProps {
  filtered: any[]
  handleViewClick: (firma: any) => void
  openEditModal: (e: React.MouseEvent, firma: any) => void
  handleDelete: (e: React.MouseEvent, id: number) => void
}

export const FirmaGrid: React.FC<FirmaGridProps> = ({
  filtered,
  handleViewClick,
  openEditModal,
  handleDelete
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filtered.map((firma) => (
        <div
          key={firma.id}
          onClick={() => handleViewClick(firma)}
          className="flex flex-col p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-xl hover:border-blue-300 dark:hover:border-blue-800 transition-colors group relative cursor-pointer"
        >
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              title="Düzenle"
              variant="ghost"
              size="sm"
              onClick={(e) => openEditModal(e, firma)}
              className="h-7 w-7 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              title="Sil"
              variant="ghost"
              size="sm"
              onClick={(e) => handleDelete(e, firma.id)}
              className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="flex items-center gap-2 mb-2 pr-8">
            {firma.firma_kodu && (
              <span className="font-mono font-bold text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-100/20 dark:border-blue-900/10 px-1.5 py-0.5 rounded">
                {firma.firma_kodu}
              </span>
            )}
            {firma.il && (
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {firma.il}
              </span>
            )}
          </div>

          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 line-clamp-2 mb-2 leading-tight flex-1">
            {firma.unvan}
          </h4>

          <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400 mb-3">
            {firma.vergi_no && <div className="truncate">🏢 {firma.vergi_no}</div>}
            {firma.telefon && <div>📞 {firma.telefon}</div>}
            {firma.ilgili_adi && <div className="truncate">👤 {firma.ilgili_adi}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}
