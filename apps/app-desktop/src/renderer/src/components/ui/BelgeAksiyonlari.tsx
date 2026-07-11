import React, { useState, useEffect, useRef } from 'react'
import { Eye, Printer, Download, Star, ExternalLink } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { parseStatusAndName, normalizeForMatch } from '../../screens/system/utils/statusUtils'

export interface Sablon {
  id: number
  ad: string
  dosya_adi: string
  kategori: string
  icerik: string
  route_path?: string
  test_verisi?: string
}

export interface DocumentPreset {
  id: string
  name: string
  docs: string[]
}

interface BelgeAksiyonlariProps {
  isStarred: boolean
  onPreview: () => void
  onQuickPrint: () => void
  onExport: (format: 'pdf' | 'docx' | 'udf') => void
  onToggleStar: () => void
  onOpenExternal: () => void
  disabled?: boolean
  docName?: string
}

export function BelgeAksiyonlari({
  isStarred,
  onPreview,
  onQuickPrint,
  onExport,
  onToggleStar,
  onOpenExternal,
  disabled,
  docName = ''
}: BelgeAksiyonlariProps): React.JSX.Element {
  const [indirMenuOpen, setIndirMenuOpen] = useState(false)
  const [presetMenuOpen, setPresetMenuOpen] = useState(false)
  const [newPresetInput, setNewPresetInput] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const presetDropdownRef = useRef<HTMLDivElement>(null)

  const { activeDosyaId, activeStarredDocs, setActiveStarredDocs } = useWorkspaceStore()

  const [presets, setPresets] = useState<DocumentPreset[]>(() => {
    try {
      const saved = localStorage.getItem('dta_document_presets')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [globalStarred, setGlobalStarred] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('global_starred_docs')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIndirMenuOpen(false)
      }
      if (presetDropdownRef.current && !presetDropdownRef.current.contains(event.target as Node)) {
        setPresetMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const handlePresetsChange = () => {
      try {
        const saved = localStorage.getItem('dta_document_presets')
        setPresets(saved ? JSON.parse(saved) : [])
      } catch {}
    }
    const handleGlobalChange = () => {
      try {
        const saved = localStorage.getItem('global_starred_docs')
        setGlobalStarred(saved ? JSON.parse(saved) : [])
      } catch {}
    }
    window.addEventListener('dta_presets_changed', handlePresetsChange)
    window.addEventListener('global_starred_changed', handleGlobalChange)
    return () => {
      window.removeEventListener('dta_presets_changed', handlePresetsChange)
      window.removeEventListener('global_starred_changed', handleGlobalChange)
    }
  }, [])

  const targetName = docName || ''
  const cleanTarget = parseStatusAndName(targetName).cleanName
  const normalizedDocName = normalizeForMatch(cleanTarget)

  const isInDefaultList = activeDosyaId
    ? activeStarredDocs.some(
        (d) => normalizeForMatch(parseStatusAndName(d).cleanName) === normalizedDocName
      )
    : globalStarred.some(
        (d) => normalizeForMatch(parseStatusAndName(d).cleanName) === normalizedDocName
      )

  const isInAnyPreset = presets.some((p) =>
    p.docs.some((d) => normalizeForMatch(parseStatusAndName(d).cleanName) === normalizedDocName)
  )

  const isStarredComputed = isInDefaultList || isInAnyPreset

  const handleToggleDefaultList = async () => {
    if (!targetName) return
    const currentList = activeDosyaId ? activeStarredDocs : globalStarred
    let newDocs = [...currentList]
    const idx = newDocs.findIndex(
      (d) => normalizeForMatch(parseStatusAndName(d).cleanName) === normalizedDocName
    )
    if (idx >= 0) {
      newDocs.splice(idx, 1)
    } else {
      newDocs.push(cleanTarget)
    }

    if (activeDosyaId) {
      setActiveStarredDocs(newDocs)
      await window.electron.ipcRenderer.invoke(
        'db:run',
        'UPDATE DATA_TeminDosyasi SET starred_docs = ? WHERE id = ?',
        [JSON.stringify(newDocs), activeDosyaId]
      )
    } else {
      setGlobalStarred(newDocs)
      localStorage.setItem('global_starred_docs', JSON.stringify(newDocs))
      window.dispatchEvent(new Event('global_starred_changed'))
    }
  }

  const handleTogglePreset = (presetId: string) => {
    if (!targetName) return
    const updatedPresets = presets.map((p) => {
      if (p.id === presetId) {
        const exists = p.docs.some(
          (d) => normalizeForMatch(parseStatusAndName(d).cleanName) === normalizedDocName
        )
        let newDocs = [...p.docs]
        if (exists) {
          newDocs = newDocs.filter(
            (d) => normalizeForMatch(parseStatusAndName(d).cleanName) !== normalizedDocName
          )
        } else {
          newDocs.push(cleanTarget)
        }
        return { ...p, docs: newDocs }
      }
      return p
    })
    setPresets(updatedPresets)
    localStorage.setItem('dta_document_presets', JSON.stringify(updatedPresets))
    window.dispatchEvent(new Event('dta_presets_changed'))
  }

  const handleCreatePreset = () => {
    if (!newPresetInput.trim() || !targetName) return
    const newPreset: DocumentPreset = {
      id: Date.now().toString(),
      name: newPresetInput.trim(),
      docs: [cleanTarget]
    }
    const updatedPresets = [...presets, newPreset]
    setPresets(updatedPresets)
    localStorage.setItem('dta_document_presets', JSON.stringify(updatedPresets))
    setNewPresetInput('')
    window.dispatchEvent(new Event('dta_presets_changed'))
  }

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={onPreview}
        disabled={disabled}
        title="Önizle / Düzenle"
        className={cn(
          'p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
          'hover:bg-blue-50 text-blue-500 dark:hover:bg-blue-900/20'
        )}
      >
        <Eye className="w-4 h-4" />
      </button>

      <button
        onClick={onOpenExternal}
        disabled={disabled}
        title="Tarayıcıda PDF Olarak Aç"
        className={cn(
          'p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
          'hover:bg-emerald-50 text-emerald-500 dark:hover:bg-emerald-900/20'
        )}
      >
        <ExternalLink className="w-4 h-4" />
      </button>

      <button
        onClick={onQuickPrint}
        disabled={disabled}
        title="Hızlı Yazdır"
        className={cn(
          'p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
          'hover:bg-slate-100 text-slate-400 dark:text-slate-500 dark:hover:bg-slate-800'
        )}
      >
        <Printer className="w-4 h-4" />
      </button>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIndirMenuOpen((v) => !v)}
          disabled={disabled}
          title="İndir"
          className={cn(
            'p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
            'hover:bg-slate-100 text-slate-400 dark:text-slate-500 dark:hover:bg-slate-800',
            indirMenuOpen && 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350'
          )}
        >
          <Download className="w-4 h-4" />
        </button>
        {indirMenuOpen && (
          <div className="absolute right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-50 w-28 py-1">
            {(['pdf', 'docx', 'udf'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => {
                  onExport(fmt)
                  setIndirMenuOpen(false)
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 uppercase font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                {fmt}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative" ref={presetDropdownRef}>
        <button
          onClick={() => setPresetMenuOpen((v) => !v)}
          disabled={disabled}
          title="Pakete Ekle / Çıkar"
          className={cn(
            'p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
            isStarredComputed
              ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
              : 'text-slate-300 hover:text-amber-500 hover:bg-slate-100 dark:text-slate-650 dark:hover:bg-slate-850',
            presetMenuOpen && 'bg-amber-50 dark:bg-amber-900/30'
          )}
        >
          <Star className={cn('w-4 h-4', isStarredComputed && 'fill-amber-500')} />
        </button>
        {presetMenuOpen && (
          <div className="absolute right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-55 w-56 py-2 px-3 space-y-2 text-[11px] animate-in fade-in duration-100">
            <div className="font-bold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-1">
              Paket Seçimi
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1.5 py-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={isInDefaultList}
                  onChange={handleToggleDefaultList}
                  className="w-3.5 h-3.5 rounded text-blue-600 bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-700 focus:ring-blue-500 cursor-pointer"
                />
                <span className="truncate">⭐ Genel Hızlı Erişim</span>
              </label>

              {presets.map((p) => {
                const checked = p.docs.some(
                  (d) => normalizeForMatch(parseStatusAndName(d).cleanName) === normalizedDocName
                )
                return (
                  <label
                    key={p.id}
                    className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleTogglePreset(p.id)}
                      className="w-3.5 h-3.5 rounded text-blue-600 bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-700 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="truncate">📦 {p.name}</span>
                  </label>
                )
              })}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex gap-1 items-center">
              <input
                type="text"
                placeholder="Yeni Paket Ekle..."
                value={newPresetInput}
                onChange={(e) => setNewPresetInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleCreatePreset()
                  }
                }}
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={handleCreatePreset}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded px-2 py-1 text-[9px] font-bold cursor-pointer whitespace-nowrap"
              >
                Ekle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
