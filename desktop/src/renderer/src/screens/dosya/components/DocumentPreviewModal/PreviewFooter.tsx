import React, { useState, useRef, useEffect } from 'react'
import { Download, Printer, RefreshCw, Star, ChevronUp } from 'lucide-react'
import { cn } from '../../../../utils/cn'

interface PreviewFooterProps {
  onClose: () => void
  handlePrint: () => Promise<void>
  handlePdf: () => Promise<void>
  handleDocx?: () => Promise<void>
  handleUdf?: () => Promise<void>
  isProcessingPrint: boolean
  isProcessingPdf: boolean
  isProcessingDocx?: boolean
  isProcessingUdf?: boolean
  isStarred?: boolean
  onToggleStar?: () => void
  jsonError: string
  activeTab: 'form' | 'json'
  onRefreshSnapshot?: () => Promise<void>
  onRefreshClick: () => Promise<void>
  handleOpenExternal?: () => Promise<void>
}

export const PreviewFooter: React.FC<PreviewFooterProps> = ({
  onClose,
  handlePrint,
  handlePdf,
  handleDocx,
  handleUdf,
  isProcessingPrint,
  isProcessingPdf,
  isProcessingDocx = false,
  isProcessingUdf = false,
  isStarred = false,
  onToggleStar,
  jsonError,
  activeTab,
  onRefreshSnapshot,
  onRefreshClick,
  handleOpenExternal
}) => {
  const [downloadOpen, setDownloadOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDownloadOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const isAnyProcessing =
    isProcessingPdf || isProcessingPrint || isProcessingDocx || isProcessingUdf

  return (
    <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 flex items-center justify-between">
      <button
        onClick={onClose}
        className="px-6 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all text-sm cursor-pointer"
      >
        İptal
      </button>

      <div className="flex items-center gap-3">
        {onRefreshSnapshot && (
          <button
            onClick={onRefreshClick}
            disabled={isAnyProcessing || !!jsonError}
            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 text-sm shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Güncel Verileri Al
          </button>
        )}

        {onToggleStar && (
          <button
            onClick={onToggleStar}
            disabled={isAnyProcessing}
            title={isStarred ? 'Hızlı Erişimden Çıkar' : 'Hızlı Erişime Ekle'}
            className={cn(
              'p-2.5 rounded-xl border transition-all cursor-pointer disabled:opacity-50',
              isStarred
                ? 'bg-amber-50 border-amber-200 text-amber-500 dark:bg-amber-900/20 dark:border-amber-900/50'
                : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800'
            )}
          >
            <Star className={cn('w-4 h-4', isStarred && 'fill-amber-500')} />
          </button>
        )}

        {/* Unified Download Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDownloadOpen((v) => !v)}
            disabled={isAnyProcessing || !!jsonError}
            className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 text-sm shadow-sm cursor-pointer"
          >
            {isProcessingPdf || isProcessingDocx || isProcessingUdf ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Dışa Aktar / İndir</span>
            <ChevronUp
              className={cn('w-3.5 h-3.5 transition-transform', downloadOpen && 'rotate-180')}
            />
          </button>

          {downloadOpen && (
            <div className="absolute bottom-full mb-1 right-0 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50">
              <button
                onClick={async () => {
                  setDownloadOpen(false)
                  await handlePdf()
                }}
                className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between cursor-pointer"
              >
                <span>PDF Olarak Kaydet</span>
                <span className="text-[10px] text-slate-400">.pdf</span>
              </button>

              {handleDocx && (
                <button
                  onClick={async () => {
                    setDownloadOpen(false)
                    await handleDocx()
                  }}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between cursor-pointer"
                >
                  <span>Word (DOCX) Kaydet</span>
                  <span className="text-[10px] text-slate-400">.docx</span>
                </button>
              )}

              {handleUdf && (
                <button
                  onClick={async () => {
                    setDownloadOpen(false)
                    await handleUdf()
                  }}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between cursor-pointer"
                >
                  <span>UDF (UYAP) Kaydet</span>
                  <span className="text-[10px] text-slate-400">.udf</span>
                </button>
              )}
            </div>
          )}
        </div>
        {handleOpenExternal && (
          <button
            onClick={handleOpenExternal}
            disabled={isAnyProcessing || !!jsonError}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 text-sm border border-slate-200 dark:border-slate-700 cursor-pointer"
            title="Tarayıcıda PDF Olarak Aç"
          >
            <span>Tarayıcıda Aç</span>
          </button>
        )}

        <button
          onClick={handlePrint}
          disabled={isAnyProcessing || !!jsonError}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 text-sm shadow-sm shadow-blue-600/20 cursor-pointer"
        >
          {isProcessingPrint ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Printer className="w-4 h-4" />
          )}
          Yazdır
        </button>
      </div>
    </div>
  )
}
