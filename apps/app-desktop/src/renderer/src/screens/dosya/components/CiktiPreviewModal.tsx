import React from 'react'
import { Star, X } from 'lucide-react'
import { Sablon } from '../../sablonlar/sablonlar.hooks'

interface CiktiPreviewModalProps {
  previewSablon: Sablon
  activeStarredDocs: string[]
  onClose: () => void
  onToggleStar: (sablonAd: string, e?: React.MouseEvent) => void
  srcDoc: string
}

export function CiktiPreviewModal({
  previewSablon,
  activeStarredDocs,
  onClose,
  onToggleStar,
  srcDoc
}: CiktiPreviewModalProps): React.JSX.Element {
  const isStarred = activeStarredDocs.some(
    (d) => d.localeCompare(previewSablon.ad, 'tr', { sensitivity: 'base' }) === 0
  )

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-8 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">
              {previewSablon.ad}
            </h3>
            <p className="text-xs text-slate-500">{previewSablon.dosya_adi}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => onToggleStar(previewSablon.ad, e)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                isStarred
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-700/50'
                  : 'bg-white text-slate-600 hover:text-amber-600 hover:border-amber-400 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
              }`}
            >
              <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
              {isStarred ? 'Hızlı Erişimden Çıkar' : 'Hızlı Erişime Ekle'}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-955 p-4 relative min-h-0">
          <iframe
            srcDoc={srcDoc}
            className="w-full h-full bg-white rounded-xl shadow-inner border border-slate-200 dark:border-slate-800"
            sandbox="allow-same-origin"
            title="Belge Önizleme"
          />
        </div>
      </div>
    </div>
  )
}
