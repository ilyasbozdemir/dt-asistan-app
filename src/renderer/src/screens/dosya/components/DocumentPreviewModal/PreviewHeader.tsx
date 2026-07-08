import React from 'react'
import { ArrowLeft, FileText, X } from 'lucide-react'

interface PreviewHeaderProps {
  isInline: boolean
  onClose: () => void
  title: string
  usedVars: Set<string>
}

export const PreviewHeader: React.FC<PreviewHeaderProps> = ({
  isInline,
  onClose,
  title,
  usedVars
}) => {
  const varsList = React.useMemo(() => {
    return Array.from(usedVars).filter((k) => k !== 'icerik')
  }, [usedVars])

  if (isInline) {
    return (
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-600 dark:text-slate-400 mr-1"
            title="Geri Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {title} Önizleme
            </h2>
            <p className="text-xs text-slate-500">
              Form veya JSON üzerinden değişkenleri ezerek sonucu canlı görebilirsiniz.
            </p>
            {varsList.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5 max-h-16 overflow-y-auto custom-scrollbar">
                {varsList.map((key) => (
                  <span
                    key={key}
                    className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono border border-slate-200/50 dark:border-slate-800"
                  >
                    {key}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title} Önizleme</h2>
          <p className="text-xs text-slate-500">
            Form veya JSON üzerinden değişkenleri ezerek sonucu canlı görebilirsiniz.
          </p>
          {varsList.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5 max-h-16 overflow-y-auto custom-scrollbar">
              {varsList.map((key) => (
                <span
                  key={key}
                  className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono border border-slate-200/50 dark:border-slate-800"
                >
                  {key}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}
