import React from 'react'
import { AlertCircle, Bot, Loader2 } from 'lucide-react'
import Editor from '@monaco-editor/react'

interface PreviewJsonViewProps {
  overrideJson: string
  aiPrompt: string
  setAiPrompt: (val: string) => void
  isAiGenerating: boolean
  jsonError: string
  handleAiEdit: () => Promise<void>
  handleJsonChange: (val: string) => void
}

export const PreviewJsonView: React.FC<PreviewJsonViewProps> = ({
  overrideJson,
  aiPrompt,
  setAiPrompt,
  isAiGenerating,
  jsonError,
  handleAiEdit,
  handleJsonChange
}) => {
  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0">
      <div className="p-3 bg-amber-50 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-start gap-2 text-amber-800 dark:text-amber-300 text-xs shadow-sm">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">⚠️ Gelişmiş Ayarlar (Geliştirici Modu)</span>
          Değişkenlerin yapısını veya JSON formatını bilmiyorsanız lütfen bu alanlardaki kodları
          değiştirmeyin. Hatalı JSON dosyanın yazdırılmasını bozabilir.
        </div>
      </div>

      <div className="p-3 bg-blue-50/50 dark:bg-blue-955/20 border border-blue-150 dark:border-blue-900/40 rounded-xl flex flex-col gap-2 shadow-sm">
        <span className="text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
          <Bot className="w-4 h-4 text-blue-500" /> AI Değişken Asistanı
        </span>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Örn: Tarihi 15.06.2026 yap..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="flex-1 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleAiEdit}
            disabled={isAiGenerating || !aiPrompt.trim()}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer shrink-0"
          >
            {isAiGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
            Uygula
          </button>
        </div>
      </div>

      <div className="flex-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-955 min-h-[250px]">
        <Editor
          height="100%"
          defaultLanguage="json"
          theme={document.documentElement.classList.contains('dark') ? 'vs-dark' : 'light'}
          value={overrideJson}
          onChange={(value) => handleJsonChange(value || '{}')}
          options={{
            minimap: { enabled: false },
            wordWrap: 'on',
            fontSize: 12,
            lineNumbers: 'on',
            folding: true,
            formatOnPaste: true
          }}
        />
      </div>
      {jsonError && (
        <div className="p-3 bg-rose-50 dark:bg-rose-955/30 border border-rose-200 dark:border-rose-900/30 rounded-lg flex items-start gap-2 text-rose-600 dark:text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{jsonError}</span>
        </div>
      )}
    </div>
  )
}
