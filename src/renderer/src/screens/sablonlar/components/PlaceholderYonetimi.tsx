import React, { useState, useEffect } from 'react'
import { Key, LayoutTemplate, Save } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { cn } from '../../../utils/cn'
import { useSablonlar, Sablon } from '../sablonlar.hooks'
import { subPagesMapping } from '../../../constants/surecler'

function TemplateBindingSettings({ sablon }: { sablon: Sablon }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [boundProcess, setBoundProcess] = useState<string>('')

  const loadSettings = async () => {
    try {
      setLoading(true)
      const res = await (window as any).electron.ipcRenderer.invoke('db:get-settings')
      let foundProcess = ''
      
      // Look for any process mapped to this template
      if (res) {
        for (const process of subPagesMapping) {
          const mappingKey = `MAPPING_${process.path}_SABLON_ID`
          if (res[mappingKey] === sablon.id.toString()) {
            foundProcess = process.path
            break
          }
        }
      }
      
      setBoundProcess(foundProcess)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [sablon.id])

  const handleSave = async () => {
    try {
      setSaving(true)
      const current = await (window as any).electron.ipcRenderer.invoke('db:get-settings')
      const newSettings = { ...current }
      
      // First, remove this template from any process it might be bound to
      for (const process of subPagesMapping) {
         const mappingKey = `MAPPING_${process.path}_SABLON_ID`
         if (newSettings[mappingKey] === sablon.id.toString()) {
            newSettings[mappingKey] = null
         }
      }
      
      // Then bind it to the newly selected process, if any
      if (boundProcess) {
        newSettings[`MAPPING_${boundProcess}_SABLON_ID`] = sablon.id.toString()
      }

      const res = await (window as any).electron.ipcRenderer.invoke('db:save-settings', newSettings)
      if (res.success) {
        alert('Süreç bağlaması başarıyla kaydedildi!')
      } else {
        alert('Kaydetme hatası: ' + res.error)
      }
    } catch (e: any) {
      alert('İşlem sırasında hata: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-4 text-xs text-slate-500">Yükleniyor...</div>

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-3">Bu Şablonu Bir Sürece Bağla</h3>
      
      <div className="flex items-center gap-4 mb-4">
        <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Süreç Seçimi:</label>
        <select 
          value={boundProcess}
          title="Süreç Seçimi"
          onChange={e => setBoundProcess(e.target.value)}
          className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-800 dark:text-slate-200"
        >
          <option value="">-- Sürece Bağlı Değil --</option>
          {subPagesMapping.map(p => (
            <option key={p.path} value={p.path}>{p.stage}. {p.name} ({p.path})</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-1.5 rounded-lg flex items-center gap-2">
           <Save className="w-3.5 h-3.5" />
           {saving ? 'Kaydediliyor...' : 'Bağlamayı Kaydet'}
        </Button>
      </div>
    </div>
  )
}

export function PlaceholderYonetimi(): React.JSX.Element {
  const [selectedSablonId, setSelectedSablonId] = useState<number | null>(null)
  const { data: sablonlar = [] } = useSablonlar()
  
  const selectedSablon = sablonlar.find(s => s.id === selectedSablonId)
  
  const templatePlaceholders = React.useMemo(() => {
    if (!selectedSablon) return null
    if (selectedSablon.test_verisi) {
      try {
        const parsed = JSON.parse(selectedSablon.test_verisi)
        return Object.keys(parsed)
      } catch (e) {
        console.error('Test verisi JSON parse hatası:', e)
      }
    }
    return []
  }, [selectedSablon])

  // Automatically select the first template if none is selected
  useEffect(() => {
    if (!selectedSablonId && sablonlar.length > 0) {
      setSelectedSablonId(sablonlar[0].id)
    }
  }, [sablonlar, selectedSablonId])

  return (
    <div className="flex flex-col h-full gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-500" />
            Şablon Süreç Yönetimi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Şablonlarınızı hangi ekranlarda yazdırılacağına (süreçlere) bağlayın.
          </p>
        </div>
      </div>

      <div className="flex h-full gap-4 overflow-hidden">
        {/* SIDEBAR */}
        <div className="w-72 shrink-0 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
           <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
             <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wider">Şablon Seçimi</h3>
           </div>
           <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5 custom-scrollbar">
              {sablonlar.map(s => (
                 <button 
                  key={s.id}
                  onClick={() => setSelectedSablonId(s.id)}
                  className={cn("px-3 py-2.5 text-sm text-left rounded-xl transition-all flex items-center gap-3 truncate", selectedSablonId === s.id ? "bg-indigo-50 text-indigo-700 font-bold dark:bg-indigo-900/40 dark:text-indigo-300 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800")}
                  title={s.ad}
                >
                  <LayoutTemplate className={cn("w-4 h-4 shrink-0", selectedSablonId === s.id ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400")} /> <span className="truncate">{s.ad}</span>
                </button>
              ))}
              {sablonlar.length === 0 && (
                <div className="text-center p-4 text-xs text-slate-500 italic">Hiç şablon bulunamadı.</div>
              )}
           </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {selectedSablon ? (
              <>
                <TemplateBindingSettings sablon={selectedSablon} />

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Şablondaki Değişkenler (Test Verisinden)</h3>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Bu değişkenlerin veritabanı eşleşmeleri <code>placeholder-mappings.json</code> dosyasından yönetilmektedir.
                    </p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {!templatePlaceholders || templatePlaceholders.length === 0 ? (
                      <div className="text-center text-sm text-slate-500 italic p-8">Test verisi bulunamadı veya çözümlenemedi.</div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {templatePlaceholders.map(key => (
                           <div key={key} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-700 dark:text-slate-300">
                             {`{{${key}}}`}
                           </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex-1 flex items-center justify-center">
                 <div className="text-center text-slate-400">
                    <LayoutTemplate className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">İşlem yapmak için sol menüden bir şablon seçin</p>
                 </div>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
