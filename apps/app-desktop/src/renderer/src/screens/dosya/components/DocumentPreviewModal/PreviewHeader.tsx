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

  const [isVarsExpanded, setIsVarsExpanded] = React.useState(false)

  if (isInline) {
    return (
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs mr-1"
            title="İşlemler ve İhtiyaç Listesi Ekranına Dön"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>İşlemlere Dön</span>
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
              <div className="mt-1.5">
                <button
                  type="button"
                  onClick={() => setIsVarsExpanded((prev) => !prev)}
                  className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <svg
                    className={`w-3 h-3 transition-transform duration-200 ${
                      isVarsExpanded ? 'rotate-90' : 'rotate-0'
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                  Değişkenler ({varsList.length})
                </button>

                {isVarsExpanded && (
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
