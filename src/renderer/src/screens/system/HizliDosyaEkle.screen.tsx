import React, { useState, useRef } from 'react'
import {
  Plus,
  Trash2,
  Save,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useQueryClient } from '@tanstack/react-query'

interface DosyaRow {
  _key: string
  dosya_no: string
  dt_no: string
  dosya_adi: string
  aciklama: string
  ihale_turu: string
  ihale_sekli: string
  ihale_tarihi: string
  ihale_asamasi: string
}

const IHALE_TURLERI = ['Mal', 'Hizmet', 'Yapım İşi', 'Danışmanlık']
const IHALE_SEKILLERI = ['22/d', '22/a', '22/b', '22/c', 'İhale (4734)', 'Diğer']
const IHALE_ASAMALARI = [
  'Hazırlık',
  'Piyasa Araştırması',
  'Teklif Aşaması',
  'Sözleşme',
  'Kabul & Ödeme',
  'Tamamlandı',
  'İptal',
]

const emptyRow = (): DosyaRow => ({
  _key: Math.random().toString(36).slice(2),
  dosya_no: '',
  dt_no: '',
  dosya_adi: '',
  aciklama: '',
  ihale_turu: 'Mal',
  ihale_sekli: '22/d',
  ihale_tarihi: '',
  ihale_asamasi: 'Hazırlık',
})

export default function HizliDosyaEkleScreen(): React.JSX.Element {
  const queryClient = useQueryClient()
  const [rows, setRows] = useState<DosyaRow[]>([emptyRow(), emptyRow(), emptyRow()])
  const [isSaving, setIsSaving] = useState(false)
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null)
  const tableRef = useRef<HTMLDivElement>(null)

  const updateRow = (key: string, field: keyof DosyaRow, value: string) => {
    setRows((prev) => prev.map((r) => (r._key === key ? { ...r, [field]: value } : r)))
  }

  const addRow = () => {
    setRows((prev) => [...prev, emptyRow()])
    setTimeout(() => {
      tableRef.current?.scrollTo({ top: tableRef.current.scrollHeight, behavior: 'smooth' })
    }, 50)
  }

  const removeRow = (key: string) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r._key !== key) : prev))
  }

  const mapTur = (t: string) => {
    if (t === 'Hizmet') return 'hizmet'
    if (t === 'Yapım İşi') return 'yapim_isi'
    if (t === 'Danışmanlık') return 'danismanlik'
    return 'mal'
  }

  const mapStatus = (a: string) => {
    if (a === 'Tamamlandı') return 'tamamlandi'
    if (a === 'İptal') return 'iptal'
    return 'devam_ediyor'
  }

  const handleSave = async () => {
    const filled = rows.filter((r) => r.dosya_adi.trim() !== '')
    if (filled.length === 0) {
      alert('En az bir dosya adı girilmelidir.')
      return
    }
    setIsSaving(true)
    setResult(null)
    let successCount = 0
    const errors: string[] = []
    for (const row of filled) {
      try {
        const res = await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO DATA_TeminDosyasi
            (temin_no, ekap_no, konu, isin_aciklamasi, ihale_tipi, ihale_sekli, dosya_acilis_tarihi, status, tur, is_deleted)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
          [
            row.dosya_no || null,
            row.dt_no || null,
            row.dosya_adi.trim(),
            row.aciklama || null,
            row.ihale_turu || 'Mal',
            row.ihale_sekli || null,
            row.ihale_tarihi || null,
            mapStatus(row.ihale_asamasi),
            mapTur(row.ihale_turu),
          ]
        )
        if (res.success) {
          successCount++
        } else {
          errors.push(`"${row.dosya_adi}" — ${res.error}`)
        }
      } catch (err: unknown) {
        errors.push(`"${row.dosya_adi}" — ${err instanceof Error ? err.message : String(err)}`)
      }
    }
    setResult({ success: successCount, errors })
    setIsSaving(false)
    if (successCount > 0) {
      queryClient.invalidateQueries({ queryKey: ['dosyalar'] })
      const erroredNames = new Set(
        errors.map((e) => e.split(' — ')[0].replace(/^"/, '').replace(/"$/, ''))
      )
      setRows((prev) =>
        prev.filter((r) => r.dosya_adi.trim() === '' || erroredNames.has(r.dosya_adi.trim()))
      )
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      const lines = text.trim().split('\n').filter(Boolean)
      const newRows: DosyaRow[] = lines.map((line) => {
        const c = line.split('\t')
        return {
          _key: Math.random().toString(36).slice(2),
          dosya_no: c[0]?.trim() || '',
          dt_no: c[1]?.trim() || '',
          dosya_adi: c[2]?.trim() || '',
          aciklama: c[3]?.trim() || '',
          ihale_turu: c[4]?.trim() || 'Mal',
          ihale_sekli: c[5]?.trim() || '22/d',
          ihale_tarihi: c[6]?.trim() || '',
          ihale_asamasi: c[7]?.trim() || 'Hazırlık',
        }
      })
      if (newRows.length > 0) {
        setRows((prev) => {
          const allEmpty = prev.every((r) => r.dosya_adi === '')
          return allEmpty ? newRows : [...prev, ...newRows]
        })
      }
    } catch {
      alert('Pano okuma başarısız.')
    }
  }

  const filledCount = rows.filter((r) => r.dosya_adi.trim() !== '').length

  const cell = 'w-full h-8 px-2 text-sm bg-transparent border border-transparent focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 rounded-lg outline-none transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-700'
  const sel = 'w-full h-8 pl-2 pr-6 text-sm bg-transparent border border-transparent focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 rounded-lg outline-none transition-colors appearance-none cursor-pointer'

  return (
    <div className="flex flex-col gap-5 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-blue-600" />
            Hızlı Dosya Ekle
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Eski verileri toplu olarak sisteme aktarın. Excel'den kopyalayıp yapıştırabilirsiniz.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" className="gap-2 text-sm rounded-xl h-9 px-4" onClick={handlePaste}>
            <ClipboardList className="w-4 h-4" /> Panodan Yapıştır
          </Button>
          <Button variant="outline" className="gap-2 text-sm rounded-xl h-9 px-4" onClick={addRow}>
            <Plus className="w-4 h-4" /> Satır Ekle
          </Button>
          <Button
            className="gap-2 text-sm rounded-xl h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-60"
            onClick={handleSave}
            disabled={isSaving || filledCount === 0}
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Kaydediliyor...' : `${filledCount} Dosyayı Kaydet`}
          </Button>
        </div>
      </div>

      {result && (
        <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${result.errors.length === 0 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'}`}>
          {result.errors.length === 0 ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
          <div>
            <p className="font-semibold">{result.success} dosya başarıyla eklendi.{result.errors.length > 0 && ` ${result.errors.length} kayıt hatalı.`}</p>
            {result.errors.map((e, i) => <p key={i} className="text-xs mt-0.5 opacity-80">• {e}</p>)}
          </div>
        </div>
      )}

      <p className="text-xs text-slate-400 dark:text-slate-500 -mb-2">
        💡 Excel'den kopyalanan sütun sırası: <strong>Dosya No | DT No | Dosya Adı | Açıklama | İhale Türü | İhale Şekli | Tarih | Aşama</strong>
      </p>

      <div ref={tableRef} className="flex-1 overflow-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <table className="w-full text-sm border-collapse min-w-[1050px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="w-10 px-3 py-3 text-center">#</th>
              <th className="px-3 py-3 text-left whitespace-nowrap">Dosya No</th>
              <th className="px-3 py-3 text-left whitespace-nowrap">D.T. No</th>
              <th className="px-3 py-3 text-left whitespace-nowrap">Dosya Adı *</th>
              <th className="px-3 py-3 text-left whitespace-nowrap">Açıklama</th>
              <th className="px-3 py-3 text-left whitespace-nowrap">İhale Türü</th>
              <th className="px-3 py-3 text-left whitespace-nowrap">İhale Şekli</th>
              <th className="px-3 py-3 text-left whitespace-nowrap">İhale Tarihi</th>
              <th className="px-3 py-3 text-left whitespace-nowrap">İhale Aşaması</th>
              <th className="w-10 px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {rows.map((row, idx) => (
              <tr key={row._key} className={`group transition-colors ${row.dosya_adi.trim() ? 'bg-white dark:bg-slate-900 hover:bg-blue-50/30 dark:hover:bg-blue-900/10' : 'bg-slate-50/60 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}>
                <td className="px-3 py-1.5 text-center text-xs text-slate-400 font-mono">{idx + 1}</td>
                <td className="px-2 py-1.5"><input type="text" value={row.dosya_no} onChange={(e) => updateRow(row._key, 'dosya_no', e.target.value)} placeholder="2025/001" className={`${cell} min-w-[90px]`} /></td>
                <td className="px-2 py-1.5"><input type="text" value={row.dt_no} onChange={(e) => updateRow(row._key, 'dt_no', e.target.value)} placeholder="DT-001" className={`${cell} min-w-[80px]`} /></td>
                <td className="px-2 py-1.5"><input type="text" value={row.dosya_adi} onChange={(e) => updateRow(row._key, 'dosya_adi', e.target.value)} placeholder="Kırtasiye Alımı…" className={`${cell} min-w-[200px]`} /></td>
                <td className="px-2 py-1.5"><input type="text" value={row.aciklama} onChange={(e) => updateRow(row._key, 'aciklama', e.target.value)} placeholder="Opsiyonel…" className={`${cell} min-w-[130px]`} /></td>
                <td className="px-2 py-1.5">
                  <div className="relative min-w-[100px]">
                    <select title="İhale türü" value={row.ihale_turu} onChange={(e) => updateRow(row._key, 'ihale_turu', e.target.value)} className={sel}>
                      {IHALE_TURLERI.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                  </div>
                </td>
                <td className="px-2 py-1.5">
                  <div className="relative min-w-[85px]">
                    <select title="İhale şekli" value={row.ihale_sekli} onChange={(e) => updateRow(row._key, 'ihale_sekli', e.target.value)} className={sel}>
                      {IHALE_SEKILLERI.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                  </div>
                </td>
                <td className="px-2 py-1.5"><input type="date" value={row.ihale_tarihi} onChange={(e) => updateRow(row._key, 'ihale_tarihi', e.target.value)} className={`${cell} min-w-[130px]`} /></td>
                <td className="px-2 py-1.5">
                  <div className="relative min-w-[120px]">
                    <select title="İhale aşaması" value={row.ihale_asamasi} onChange={(e) => updateRow(row._key, 'ihale_asamasi', e.target.value)} className={sel}>
                      {IHALE_ASAMALARI.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                  </div>
                </td>
                <td className="px-2 py-1.5">
                  <button type="button" onClick={() => removeRow(row._key)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="button" onClick={addRow} className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-sm text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors">
        <Plus className="w-4 h-4" /> Yeni Satır Ekle
      </button>
    </div>
  )
}
