import React from 'react'
import { Printer, Download, FileText } from 'lucide-react'

interface CiktiSidebarProps {
  selectedCount: number
  processing: boolean
  hasStarredDocs: boolean
  onPrintClick: () => void
  onDownloadClick: (action: 'pdf' | 'docx' | 'udf') => void
}

export function CiktiSidebar({
  selectedCount,
  processing,
  hasStarredDocs,
  onPrintClick,
  onDownloadClick
}: CiktiSidebarProps): React.JSX.Element {
  return (
    <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-900/50 p-6 flex flex-col gap-4">
      <div className="mb-2">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Toplu İşlemler</h3>
        <p className="text-[11px] text-slate-500">
          Seçtiğiniz {selectedCount} belge için uygulamak istediğiniz işlemi seçin.
        </p>
      </div>

      <button
        onClick={onPrintClick}
        disabled={processing || (selectedCount === 0 && !hasStarredDocs)}
        className="w-full flex items-center gap-3 p-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-slate-900/10 cursor-pointer"
      >
        <Printer className="w-5 h-5 text-slate-300" />
        <div className="text-left flex-1">
          <div className="text-sm font-bold">Sırayla Yazdır</div>
          <div className="text-[10px] text-slate-400">Varsayılan yazıcıya gönderilir</div>
        </div>
      </button>

      <div className="h-px bg-slate-200 dark:bg-slate-800 my-2"></div>

      <button
        onClick={() => onDownloadClick('pdf')}
        disabled={processing || selectedCount === 0}
        className="w-full flex items-center gap-3 p-4 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-900 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 shrink-0">
          <Download className="w-4 h-4" />
        </div>
        <div className="text-left flex-1">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            PDF Olarak İndir
          </div>
          <div className="text-[9px] text-slate-500">Orijinal sayfa yapısıyla</div>
        </div>
      </button>

      <button
        onClick={() => onDownloadClick('docx')}
        disabled={processing || selectedCount === 0}
        className="w-full flex items-center gap-3 p-4 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-900 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 shrink-0">
          <FileText className="w-4 h-4" />
        </div>
        <div className="text-left flex-1">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            ODF / DOCX İndir
          </div>
          <div className="text-[9px] text-slate-500">Düzenlenebilir ofis belgesi</div>
        </div>
      </button>

      <button
        onClick={() => onDownloadClick('udf')}
        disabled={processing || selectedCount === 0}
        className="w-full flex items-center gap-3 p-4 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-900 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 shrink-0">
          <Download className="w-4 h-4" />
        </div>
        <div className="text-left flex-1">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">UDF İndir</div>
          <div className="text-[9px] text-slate-500">UYAP formatında (Salt metin)</div>
        </div>
      </button>
    </div>
  )
}
