import React, { useEffect, useState } from 'react'
import { PreviewHeader } from './PreviewHeader'
import { PreviewFormView } from './PreviewFormView'
import { PreviewJsonView } from './PreviewJsonView'
import { PreviewFooter } from './PreviewFooter'
import { useDocumentPreview } from './useDocumentPreview'

interface DocumentPreviewModalProps<T = any> {
  isOpen: boolean
  onClose: () => void
  title: string
  templateHtml: string
  masterHtml: string
  baseContext: T
  placeholders?: any[]
  personelListesi?: any[]
  onPrint: (html: string) => Promise<void>
  onExportPdf: (html: string, filenameTitle?: string) => Promise<void>
  onExportDocx?: (html: string, filenameTitle?: string) => Promise<void>
  onExportUdf?: (html: string, filenameTitle?: string) => Promise<void>
  isStarred?: boolean
  onToggleStar?: () => void
  isInline?: boolean
  templateTestVerisi?: string
  onRefreshSnapshot?: () => Promise<void>
  onSaveSnapshot?: (overrideData: Partial<T>) => Promise<void>
  dosyaAdi?: string
}

export function DocumentPreviewModal<T = any>({
  isOpen,
  onClose,
  title,
  templateHtml,
  masterHtml,
  baseContext,
  placeholders = [],
  personelListesi = [],
  onPrint,
  onExportPdf,
  onExportDocx,
  onExportUdf,
  isStarred = false,
  onToggleStar,
  isInline = false,
  templateTestVerisi = '',
  onRefreshSnapshot,
  onSaveSnapshot,
  dosyaAdi
}: DocumentPreviewModalProps<T>): React.JSX.Element | null {
  const [schemaJson, setSchemaJson] = useState<Partial<T> | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveClick = async () => {
    if (!onSaveSnapshot) return
    setIsSaving(true)
    try {
      await onSaveSnapshot(overrideData)
    } catch (e) {
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  // Load Schema JSON dynamically
  useEffect(() => {
    if (isOpen && dosyaAdi) {
      const cleanName = dosyaAdi.endsWith('.html') ? dosyaAdi.replace('.html', '') : dosyaAdi
      const jsonFileName = `${cleanName}.html.json`
      window.electron.ipcRenderer
        .invoke('template:read-system', jsonFileName)
        .then((res) => {
          if (res) {
            try {
              const parsed = JSON.parse(res)
              setSchemaJson(parsed)
            } catch (e) {
              console.error('Failed to parse schema JSON:', e)
              setSchemaJson(null)
            }
          } else {
            setSchemaJson(null)
          }
        })
        .catch((err) => {
          console.error('Failed to read schema JSON:', err)
          setSchemaJson(null)
        })
    } else {
      setSchemaJson(null)
    }
  }, [isOpen, dosyaAdi])

  const extractUsedVars = React.useCallback((html: string) => {
    const matches = Array.from(html.matchAll(/\{\{(\{?)([#^\/]?)([a-zA-Z0-9_]+)(\}?)\}\}/g))
    return matches.map((m) => m[3])
  }, [])

  const usedVars = React.useMemo(() => {
    return new Set([...extractUsedVars(templateHtml || ''), ...extractUsedVars(masterHtml || '')])
  }, [templateHtml, masterHtml, extractUsedVars])

  const {
    overrideData,
    setOverrideData,
    useSampleData,
    setUseSampleData,
    activeTab,
    setActiveTab,
    overrideJson,
    setOverrideJson,
    jsonError,
    previewHtml,
    isProcessingPrint,
    isProcessingPdf,
    aiPrompt,
    setAiPrompt,
    isAiGenerating,
    isProcessingDocx,
    isProcessingUdf,
    mergedContext,
    handleFormChange,
    handleJsonChange,
    getMissingRequiredFields,
    handlePrint,
    handlePdf,
    handleDocx,
    handleUdf,
    updatePreview,
    handleAiEdit
  } = useDocumentPreview<T>({
    isOpen,
    title,
    templateHtml,
    masterHtml,
    baseContext,
    usedVars,
    templateTestVerisi,
    schemaJson,
    onPrint,
    onExportPdf,
    onExportDocx,
    onExportUdf
  })

  if (!isOpen) return null

  // Personnel definition fields (context key -> { adiKey, unvanKey, etiket })
  const PERSONNEL_FIELDS: Record<string, { adiKey: string; unvanKey: string; etiket: string }> = {
    hazirlayanPersonelAdi: {
      adiKey: 'hazirlayanPersonelAdi',
      unvanKey: 'hazirlayanPersonelUnvan',
      etiket: 'Hazırlayan Personel'
    },
    talepEdenPersonelAdi: {
      adiKey: 'talepEdenPersonelAdi',
      unvanKey: 'talepEdenPersonelUnvan',
      etiket: 'Talep Eden Personel'
    },
    sunanPersonelAdi: {
      adiKey: 'sunanPersonelAdi',
      unvanKey: 'sunanPersonelUnvan',
      etiket: 'Sunan Personel'
    },
    onaylayanPersonelAdi: {
      adiKey: 'onaylayanPersonelAdi',
      unvanKey: 'onaylayanPersonelUnvan',
      etiket: 'Onaylayan (Harcama Yetkilisi)'
    },
    ilgiliPersonelAdi: {
      adiKey: 'ilgiliPersonelAdi',
      unvanKey: 'ilgiliPersonelUnvan',
      etiket: 'İrtibat Yetkilisi'
    }
  }

  const personnelContextKeys = Object.keys(PERSONNEL_FIELDS)

  const formFields = Object.keys(mergedContext || {}).filter((k) => {
    if (k === 'icerik' || k.toLowerCase().includes('logo')) return false
    if (!usedVars.has(k)) return false

    const val = mergedContext[k]
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return true
    if (Array.isArray(val) && val.every((v) => typeof v === 'string')) {
      return true
    }

    return false
  })

  const activePersonnelFields = personnelContextKeys.filter(
    (k) => usedVars.has(k) || usedVars.has(PERSONNEL_FIELDS[k].unvanKey)
  )

  const handlePersonelSelect = (field: any, selectedPersonel: any) => {
    const newData = {
      ...overrideData,
      [field.adiKey]: selectedPersonel.ad_soyad,
      [field.unvanKey]: selectedPersonel.unvan || ''
    }
    if (field.adiKey === 'hazirlayanPersonelAdi') {
      newData['haz\u0131rlayanPersonelAdi'] = selectedPersonel.ad_soyad
      newData['haz\u0131rlayanPersonelUnvan'] = selectedPersonel.unvan || ''
      newData['hazirlayanTelefon'] = selectedPersonel.telefon || ''
      newData['haz\u0131rlayanTelefon'] = selectedPersonel.telefon || ''
      newData['hazirlayanEposta'] = selectedPersonel.eposta || ''
      newData['haz\u0131rlayanEposta'] = selectedPersonel.eposta || ''
    }
    if (field.adiKey === 'onaylayanPersonelAdi') {
      newData['baskanAdi'] = selectedPersonel.ad_soyad
      newData['baskanUnvan'] = selectedPersonel.unvan || ''
    }
    setOverrideData(newData)
    setOverrideJson(JSON.stringify(newData, null, 2))
    const merged = { ...baseContext, ...newData }
    updatePreview(merged)
  }

  const handlePersonelClear = (field: any) => {
    const newData = { ...overrideData }
    delete newData[field.adiKey]
    delete newData[field.unvanKey]
    setOverrideData(newData)
    setOverrideJson(JSON.stringify(newData, null, 2))
    const merged = { ...baseContext, ...newData }
    updatePreview(merged)
  }

  const onRefreshClick = async () => {
    const isConfirmed = window.confirm(
      "Güncel dosya verilerini şablona aktarmak istediğinize emin misiniz?\n\nNOT: Onaylarsanız bu şablona özel yaptığınız manuel değişiklikler silinecek ve dosyanın güncel verisi üzerine yazılacaktır.\n\nDevam etmek için 'Tamam', iptal etmek için 'İptal'e tıklayın."
    )
    if (isConfirmed && onRefreshSnapshot) {
      await onRefreshSnapshot()
      setOverrideData({})
    }
  }

  if (isInline) {
    return (
      <div className="bg-white dark:bg-slate-900 w-full h-[calc(100vh-235px)] rounded-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
        <PreviewHeader isInline={true} onClose={onClose} title={title} usedVars={usedVars} />

        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/3 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            {/* DATA SOURCE SELECTION */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100/30 dark:bg-slate-950/20">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
                Veri Kaynağı
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUseSampleData(false)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all border ${
                    !useSampleData
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                  }`}
                >
                  Aktif Dosya Verisi
                </button>
                <button
                  type="button"
                  onClick={() => setUseSampleData(true)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all border ${
                    useSampleData
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                  }`}
                >
                  Örnek Şablon Verisi
                </button>
              </div>
            </div>

            {/* TABS */}
            <div className="flex p-2 gap-1 border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/50">
              <button
                onClick={() => setActiveTab('form')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeTab === 'form'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                Form Görünümü
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeTab === 'json'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                JSON (Gelişmiş)
              </button>
            </div>

            {/* WARNING BANNER */}
            {!useSampleData && getMissingRequiredFields().length > 0 && (
              <div className="mx-3 mt-3 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-800 dark:text-rose-400 rounded-xl text-xs flex flex-col gap-1.5 shadow-sm">
                <span className="font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
                  ⚠️ Eksik Zorunlu Alanlar:
                </span>
                <ul className="list-disc pl-4 space-y-0.5 text-rose-600 dark:text-rose-400">
                  {getMissingRequiredFields().map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                  Bu alanlar dolmadan belgenin yazdırılmasına/çıktı alınmasına izin verilmez.
                  Dilerseniz yukarıdan <strong>&quot;Örnek Şablon Verisi&quot;</strong> moduna
                  geçerek taslak çıktısı alabilirsiniz.
                </p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 relative flex flex-col">
              {activeTab === 'form' ? (
                <PreviewFormView
                  formFields={formFields}
                  mergedContext={mergedContext}
                  overrideData={overrideData}
                  placeholders={placeholders}
                  activePersonnelFields={activePersonnelFields}
                  personelListesi={personelListesi}
                  PERSONNEL_FIELDS={PERSONNEL_FIELDS}
                  handleFormChange={handleFormChange}
                  handlePersonelSelect={handlePersonelSelect}
                  handlePersonelClear={handlePersonelClear}
                />
              ) : (
                <PreviewJsonView
                  overrideJson={overrideJson}
                  aiPrompt={aiPrompt}
                  setAiPrompt={setAiPrompt}
                  isAiGenerating={isAiGenerating}
                  jsonError={jsonError}
                  handleAiEdit={handleAiEdit}
                  handleJsonChange={handleJsonChange}
                />
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              İpucu: Buradaki değişiklikler sadece bu yazdırma işlemi için geçerlidir.
            </div>
          </div>

          <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative">
            <iframe
              srcDoc={previewHtml}
              className="w-full h-full bg-white border-0"
              title="Print Preview"
            />
          </div>
        </div>

        <PreviewFooter
          onClose={onClose}
          handlePrint={handlePrint}
          handlePdf={handlePdf}
          handleSave={onSaveSnapshot ? handleSaveClick : undefined}
          isProcessingPrint={isProcessingPrint}
          isProcessingPdf={isProcessingPdf}
          isProcessingSave={isSaving}
          jsonError={jsonError}
          activeTab={activeTab}
          onRefreshSnapshot={onRefreshSnapshot}
          onRefreshClick={onRefreshClick}
        />
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-[90vw] h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <PreviewHeader isInline={false} onClose={onClose} title={title} usedVars={usedVars} />

        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/3 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            {/* DATA SOURCE SELECTION */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100/30 dark:bg-slate-950/20">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
                Veri Kaynağı
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUseSampleData(false)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all border ${
                    !useSampleData
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                  }`}
                >
                  Aktif Dosya Verisi
                </button>
                <button
                  type="button"
                  onClick={() => setUseSampleData(true)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all border ${
                    useSampleData
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                  }`}
                >
                  Örnek Şablon Verisi
                </button>
              </div>
            </div>

            {/* TABS */}
            <div className="flex p-2 gap-1 border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/50">
              <button
                onClick={() => setActiveTab('form')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeTab === 'form'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                Form Görünümü
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeTab === 'json'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                JSON (Gelişmiş)
              </button>
            </div>

            {/* WARNING BANNER */}
            {!useSampleData && getMissingRequiredFields().length > 0 && (
              <div className="mx-3 mt-3 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-800 dark:text-rose-400 rounded-xl text-xs flex flex-col gap-1.5 shadow-sm">
                <span className="font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
                  ⚠️ Eksik Zorunlu Alanlar:
                </span>
                <ul className="list-disc pl-4 space-y-0.5 text-rose-600 dark:text-rose-400">
                  {getMissingRequiredFields().map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                  Bu alanlar dolmadan belgenin yazdırılmasına/çıktı alınmasına izin verilmez.
                  Dilerseniz yukarıdan <strong>&quot;Örnek Şablon Verisi&quot;</strong> moduna
                  geçerek taslak çıktısı alabilirsiniz.
                </p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 relative flex flex-col">
              {activeTab === 'form' ? (
                <PreviewFormView
                  formFields={formFields}
                  mergedContext={mergedContext}
                  overrideData={overrideData}
                  placeholders={placeholders}
                  activePersonnelFields={activePersonnelFields}
                  personelListesi={personelListesi}
                  PERSONNEL_FIELDS={PERSONNEL_FIELDS}
                  handleFormChange={handleFormChange}
                  handlePersonelSelect={handlePersonelSelect}
                  handlePersonelClear={handlePersonelClear}
                />
              ) : (
                <PreviewJsonView
                  overrideJson={overrideJson}
                  aiPrompt={aiPrompt}
                  setAiPrompt={setAiPrompt}
                  isAiGenerating={isAiGenerating}
                  jsonError={jsonError}
                  handleAiEdit={handleAiEdit}
                  handleJsonChange={handleJsonChange}
                />
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              İpucu: Buradaki değişiklikler sadece bu yazdırma işlemi için geçerlidir.
            </div>
          </div>

          <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative">
            <iframe
              srcDoc={previewHtml}
              className="w-full h-full bg-white border-0"
              title="Print Preview"
            />
          </div>
        </div>

        <PreviewFooter
          onClose={onClose}
          handlePrint={handlePrint}
          handlePdf={handlePdf}
          handleDocx={onExportDocx ? handleDocx : undefined}
          handleUdf={onExportUdf ? handleUdf : undefined}
          handleSave={onSaveSnapshot ? handleSaveClick : undefined}
          isProcessingPrint={isProcessingPrint}
          isProcessingPdf={isProcessingPdf}
          isProcessingDocx={isProcessingDocx}
          isProcessingUdf={isProcessingUdf}
          isProcessingSave={isSaving}
          isStarred={isStarred}
          onToggleStar={onToggleStar}
          jsonError={jsonError}
          activeTab={activeTab}
          onRefreshSnapshot={onRefreshSnapshot}
          onRefreshClick={onRefreshClick}
          handleOpenExternal={async () => {
            if (!previewHtml) return
            await window.electron.ipcRenderer.invoke('open-pdf-external', previewHtml)
          }}
        />
      </div>
    </div>
  )
}
export default DocumentPreviewModal
