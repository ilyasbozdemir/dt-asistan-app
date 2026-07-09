import { useState, useEffect, useMemo, useCallback } from 'react'
import Mustache from 'mustache'
import { useWorkspaceStore } from '../../../../store/workspaceStore'
import { parseMarkdownToHtml } from './utils'

export interface UseDocumentPreviewProps<T> {
  isOpen: boolean
  title: string
  templateHtml: string
  masterHtml: string
  baseContext: T
  usedVars: Set<string>
  templateTestVerisi?: string
  schemaJson: Partial<T> | null
  onPrint: (html: string) => Promise<void>
  onExportPdf: (html: string, filenameTitle?: string) => Promise<void>
  onExportDocx?: (html: string, filenameTitle?: string) => Promise<void>
  onExportUdf?: (html: string, filenameTitle?: string) => Promise<void>
}

export function useDocumentPreview<T = any>({
  isOpen,
  title,
  templateHtml,
  masterHtml,
  baseContext,
  usedVars,
  templateTestVerisi = '',
  schemaJson,
  onPrint,
  onExportPdf,
  onExportDocx,
  onExportUdf
}: UseDocumentPreviewProps<T>) {
  const [overrideData, setOverrideData] = useState<Partial<T>>({})
  const [useSampleData, setUseSampleData] = useState(false)
  const [activeTab, setActiveTab] = useState<'form' | 'json'>('form')
  const [overrideJson, setOverrideJson] = useState('{\n  \n}')
  const [jsonError, setJsonError] = useState('')
  const [previewHtml, setPreviewHtml] = useState('')
  const [isProcessingPrint, setIsProcessingPrint] = useState(false)
  const [isProcessingPdf, setIsProcessingPdf] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [isAiGenerating, setIsAiGenerating] = useState(false)
  const [isProcessingDocx, setIsProcessingDocx] = useState(false)
  const [isProcessingUdf, setIsProcessingUdf] = useState(false)

  const updatePreview = useCallback(
    (contextData: any) => {
      try {
        const parsedContext = { ...contextData }
        const markdownKeys = ['isinAciklamasi', 'gerekce', 'aciklama', 'altNotlar']
        for (const k of markdownKeys) {
          if (typeof parsedContext[k] === 'string') {
            parsedContext[k] = parseMarkdownToHtml(parsedContext[k])
          }
        }

        let dynamicTemplateHtml = templateHtml || ''
        for (const k of markdownKeys) {
          const doubleBraceRegex = new RegExp('(?<!\\{)\\{\\{(' + k + ')\\}\\}(?!\\})', 'g')
          dynamicTemplateHtml = dynamicTemplateHtml.replace(doubleBraceRegex, '{{{$1}}}')
        }

        const renderedContent = Mustache.render(dynamicTemplateHtml, parsedContext)
        const finalContext = { ...parsedContext, icerik: renderedContent }
        const finalHtml = Mustache.render(masterHtml, finalContext)
        setPreviewHtml(finalHtml)
      } catch (err: any) {
        console.error('Render error:', err)
      }
    },
    [templateHtml, masterHtml]
  )

  const mergedContext = useMemo<T>(() => {
    if (useSampleData && schemaJson && Object.keys(schemaJson).length > 0) {
      return schemaJson as T
    }

    let testData: any = {}
    if (templateTestVerisi) {
      try {
        testData = JSON.parse(templateTestVerisi)
      } catch (e) {
        console.error('Failed to parse template test verisi:', e)
      }
    }
    const activeDosyaId = useWorkspaceStore.getState().activeDosyaId
    const hasRealData =
      activeDosyaId !== null && baseContext && Object.keys(baseContext as any).length > 2
    const rawContext = hasRealData
      ? { ...testData, ...baseContext }
      : { ...baseContext, ...testData }

    if (schemaJson && Object.keys(schemaJson).length > 0) {
      const filtered: any = {}
      for (const key of Object.keys(schemaJson)) {
        filtered[key] =
          (rawContext as any)[key] !== undefined
            ? (rawContext as any)[key]
            : ''
      }
      return filtered as T
    }

    const filtered: any = {}
    const keysToKeep = new Set(usedVars)
    keysToKeep.add('icerik')
    keysToKeep.add('solLogo')
    keysToKeep.add('sagLogo')

    for (const key of Object.keys(rawContext)) {
      if (keysToKeep.has(key)) {
        filtered[key] = (rawContext as any)[key]
      }
    }
    return filtered as T
  }, [baseContext, templateTestVerisi, schemaJson, usedVars, useSampleData])

  // Initialization: Format context to JSON on open
  useEffect(() => {
    if (isOpen) {
      setOverrideData({})
      setOverrideJson(JSON.stringify(mergedContext, null, 2))
      setJsonError('')
      updatePreview(mergedContext)
    }
  }, [isOpen, mergedContext, updatePreview])

  const handleFormChange = (key: string, value: any) => {
    const newData = { ...overrideData, [key]: value }
    setOverrideData(newData)
    setOverrideJson(JSON.stringify(newData, null, 2))

    const merged = { ...baseContext, ...newData }
    updatePreview(merged)
  }

  const handleJsonChange = (val: string) => {
    setOverrideJson(val)
    try {
      const parsedOverride = JSON.parse(val || '{}')
      setJsonError('')
      setOverrideData(parsedOverride)
      const merged = { ...baseContext, ...parsedOverride }
      updatePreview(merged)
    } catch (err: any) {
      setJsonError('Geçersiz JSON formatı: ' + err.message)
    }
  }

  const getMissingRequiredFields = useCallback(() => {
    if (useSampleData) return []

    const missing: string[] = []
    const requiredKeys = [
      'onaylayanPersonelAdi',
      'onaylayanPersonelUnvan',
      'hazirlayanPersonelAdi',
      'hazirlayanPersonelUnvan',
      'dosyaTarihi',
      'evrakSayisi'
    ]

    for (const key of requiredKeys) {
      if (usedVars.has(key)) {
        const val = (mergedContext as any)[key]
        if (
          val === undefined ||
          val === null ||
          String(val).trim() === '' ||
          String(val).includes('Belirtilmedi') ||
          String(val).includes('……')
        ) {
          let label = key
          if (key === 'onaylayanPersonelAdi') label = 'Onaylayan Adı'
          if (key === 'onaylayanPersonelUnvan') label = 'Onaylayan Unvanı'
          if (key === 'hazirlayanPersonelAdi') label = 'Hazırlayan Adı'
          if (key === 'hazirlayanPersonelUnvan') label = 'Hazırlayan Unvanı'
          if (key === 'dosyaTarihi') label = 'Dosya Tarihi'
          if (key === 'evrakSayisi') label = 'Evrak Sayısı'
          missing.push(label)
        }
      }
    }
    return missing
  }, [useSampleData, usedVars, mergedContext])

  const handlePrint = async () => {
    if (jsonError && activeTab === 'json') {
      alert('Geçersiz JSON yapılandırması varken çıktı alamazsınız.')
      return
    }
    const missing = getMissingRequiredFields()
    if (missing.length > 0) {
      alert(
        `Yazdırma engellendi. Lütfen şu zorunlu alanları doldurun:\n- ${missing.join(
          '\n- '
        )}\n\n(Dilerseniz sol üstten 'Örnek Şablon Verisi' moduna geçerek taslak çıktısı alabilirsiniz.)`
      )
      return
    }
    setIsProcessingPrint(true)
    try {
      await onPrint(previewHtml)
    } finally {
      setIsProcessingPrint(false)
    }
  }

  const handlePdf = async () => {
    if (jsonError && activeTab === 'json') {
      alert('Geçersiz JSON yapılandırması varken PDF alamazsınız.')
      return
    }
    const missing = getMissingRequiredFields()
    if (missing.length > 0) {
      alert(
        `PDF oluşturma engellendi. Lütfen şu zorunlu alanları doldurun:\n- ${missing.join(
          '\n- '
        )}\n\n(Dilerseniz sol üstten 'Örnek Şablon Verisi' moduna geçerek taslak çıktısı alabilirsiniz.)`
      )
      return
    }
    setIsProcessingPdf(true)
    try {
      const rawTeminNo = (mergedContext as any).teminNo || ''
      const cleanTeminNo =
        (rawTeminNo.includes('Belirtilmedi')
          ? ''
          : rawTeminNo.includes('/')
            ? rawTeminNo.split('/').pop()
            : rawTeminNo.includes('-')
              ? rawTeminNo.split('-').pop()
              : rawTeminNo) || ''

      const fileYil = (mergedContext as any).dosyaYili || new Date().getFullYear()

      const cleanTitle = title
        .toLocaleLowerCase('tr-TR')
        .replace(/\s+/g, '-')
        .replace(/[\\/:*?"<>|]/g, '')
        .trim()

      const combinedTitle = [fileYil, cleanTeminNo, cleanTitle].filter(Boolean).join('-')

      await onExportPdf(previewHtml, combinedTitle)
    } finally {
      setIsProcessingPdf(false)
    }
  }

  const handleDocx = async () => {
    if (!onExportDocx || !previewHtml) return
    setIsProcessingDocx(true)
    try {
      await onExportDocx(previewHtml, title)
    } catch (e) {
      console.error(e)
    } finally {
      setIsProcessingDocx(false)
    }
  }

  const handleUdf = async () => {
    if (!onExportUdf || !previewHtml) return
    setIsProcessingUdf(true)
    try {
      await onExportUdf(previewHtml, title)
    } catch (e) {
      console.error(e)
    } finally {
      setIsProcessingUdf(false)
    }
  }

  const handleAiEdit = async () => {
    if (!aiPrompt.trim()) return
    setIsAiGenerating(true)
    try {
      // TODO: AI entegrasyonu buraya gelecek
      console.log('AI edit prompt:', aiPrompt)
      setAiPrompt('')
    } catch (e) {
      console.error(e)
    } finally {
      setIsAiGenerating(false)
    }
  }

  return {
    overrideData,
    setOverrideData,
    useSampleData,
    setUseSampleData,
    activeTab,
    setActiveTab,
    overrideJson,
    setOverrideJson,
    jsonError,
    setJsonError,
    previewHtml,
    setPreviewHtml,
    isProcessingPrint,
    isProcessingPdf,
    aiPrompt,
    setAiPrompt,
    isAiGenerating,
    setIsAiGenerating,
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
    handleAiEdit,
    updatePreview
  }
}
