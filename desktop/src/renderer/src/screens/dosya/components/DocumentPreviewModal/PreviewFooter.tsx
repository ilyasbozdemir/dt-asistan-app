import React from 'react'
import { Download, Printer, RefreshCw } from 'lucide-react'

interface PreviewFooterProps {
  onClose: () => void
  handlePrint: () => Promise<void>
  handlePdf: () => Promise<void>
  isProcessingPrint: boolean
  isProcessingPdf: boolean
  jsonError: string
  activeTab: 'form' | 'json'
  onRefreshSnapshot?: () => Promise<void>
  onRefreshClick: () => Promise<void>
}

export const PreviewFooter: React.FC<PreviewFooterProps> = ({
  onClose,
  handlePrint,
  handlePdf,
  isProcessingPrint,
  isProcessingPdf,
  jsonError,
  activeTab,
  onRefreshSnapshot,
  onRefreshClick
}) => {
  return (
    <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 flex items-center justify-between">
      <button
        onClick={onClose}
        className="px-6 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all text-sm"
      >
        İptal
      </button>

      <div className="flex items-center gap-3">
        {onRefreshSnapshot && (
          <button
            onClick={onRefreshClick}
            disabled={isProcessingPdf || isProcessingPrint || !!jsonError}
            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 text-sm shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Güncel Verileri Al
          </button>
        )}
        <button
          onClick={handlePdf}
          disabled={isProcessingPdf || isProcessingPrint || !!jsonError}
          className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 text-sm shadow-sm"
        >
          {isProcessingPdf ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          PDF Olarak Kaydet
        </button>
        <button
          onClick={handlePrint}
          disabled={isProcessingPrint || isProcessingPdf || !!jsonError}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 text-sm shadow-sm shadow-blue-600/20"
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
