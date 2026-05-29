import React, { useState } from 'react'
import { useBirimlerHooks, BirimInput, usePersonelList } from './birimler.hooks'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { LayoutGrid, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

const emptyBirim: BirimInput = {
  birim_adi: '', antet_ek_satir: '', ihtiyac_yeri_eki: '',
  sunum_makami: '', kurumsal_kod: '', dtvt_kodu: '', ayrintili_bilgi_personel: '', ilgili_personel_id: null
}

export default function BirimlerScreen(): React.ReactNode {
  const { birimler, isLoadingBirimler, addBirim, deleteBirim } = useBirimlerHooks()
  const { personeller, isLoading: isLoadingPersonel } = usePersonelList()
  const [form, setForm] = useState<BirimInput>({ ...emptyBirim })
  const [showExtraFields, setShowExtraFields] = useState(false)

  const handleChange = (key: keyof BirimInput, value: string | number | null): void => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleAddBirim = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!form.birim_adi.trim()) return
    try {
      await addBirim(form)
      setForm({ ...emptyBirim })
      setShowExtraFields(false)
    } catch (err: any) {
      if (err.message?.includes('UNIQUE')) {
        alert('Bu birim zaten ekli!')
      } else {
        console.error(err)
        alert('Birim eklenirken hata oluştu!')
      }
    }
  }

  const handleDeleteBirim = async (id: number): Promise<void> => {
    if (confirm('Bu birimi silmek istediğinize emin misiniz?')) {
      try {
        await deleteBirim(id)
      } catch (err) {
        alert('Silme sırasında hata oluştu!')
      }
    }
  }

const Field = ({ label, field, form, handleChange, required, placeholder }: { label: string; field: keyof BirimInput; form: BirimInput; handleChange: (field: keyof BirimInput, value: string) => void; required?: boolean; placeholder?: string }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Input
      value={form[field] as string || ''}
      onChange={(e) => handleChange(field, e.target.value)}
      placeholder={placeholder || label}
      required={required}
      className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs py-1.5 h-9"
    />
  </div>
)

export default function BirimlerScreen(): React.ReactNode {

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col h-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-850 dark:text-slate-100 flex items-center gap-3">
            <LayoutGrid className="w-8 h-8 text-blue-600" />
            Birim &amp; Müdürlük Yönetimi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Kurumunuza ait idari birimleri ve müdürlükleri buradan tanımlayarak personellere atayabilirsiniz.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SOL: BİRİM EKLEME FORMU */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" />
            Yeni Birim Tanımla
          </h3>

          <form onSubmit={handleAddBirim} className="space-y-3">
            <Field label="Birim / Müdürlük Adı" field="birim_adi" form={form} handleChange={handleChange} required placeholder="Örn: Fen İşleri Müdürlüğü" />

            <button
              type="button"
              onClick={() => setShowExtraFields(!showExtraFields)}
              className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold mt-1 cursor-pointer"
            >
              {showExtraFields ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {showExtraFields ? 'Ek Bilgileri Gizle' : 'Antet, Kod & Sunum Bilgileri'}
            </button>

            {showExtraFields && (
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
                <Field label="Antet Ek Satır" field="antet_ek_satir" form={form} handleChange={handleChange} placeholder="Antet yazısında ek satır" />
                <Field label="İhtiyaç Yeri Eki" field="ihtiyac_yeri_eki" form={form} handleChange={handleChange} placeholder="İhtiyaç yeri ek bilgisi" />
                <Field label="Sunum Makamı" field="sunum_makami" form={form} handleChange={handleChange} placeholder="Sunulacak makam" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Kurumsal Kod" field="kurumsal_kod" form={form} handleChange={handleChange} />
                  <Field label="DTVT Kodu" field="dtvt_kodu" form={form} handleChange={handleChange} />
                </div>
                
                {/* PERSONEL SELECT */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    İlgili Personel (Ayrıntılı Bilgi)
                  </label>
                  <select
                    value={form.ilgili_personel_id || ''}
                    onChange={(e) => handleChange('ilgili_personel_id', e.target.value ? Number(e.target.value) : null)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs py-1.5 h-9 rounded-xl px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={isLoadingPersonel}
                  >
                    <option value="">-- Personel Seçiniz --</option>
                    {personeller.map(p => (
                      <option key={p.id} value={p.id}>{p.ad_soyad}</option>
                    ))}
                  </select>
                </div>
                {/* Legacy text field removed from UI but still in form/DB for backwards compat */}
              </div>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/10 text-xs font-semibold py-2 mt-2">
              Birimi Ekle
            </Button>
          </form>
        </div>

        {/* SAĞ: BİRİM LİSTESİ */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 mb-4">
            Kayıtlı İdari Birimler
          </h3>

          <div className="flex flex-col gap-2.5">
            {isLoadingBirimler ? (
              <div className="text-sm text-slate-450 dark:text-slate-500 py-4 italic">Birimler yükleniyor...</div>
            ) : birimler.length === 0 ? (
              <div className="text-sm text-slate-450 dark:text-slate-500 py-4 italic">Kayıtlı birim bulunmamaktadır.</div>
            ) : (
              birimler.map((birim) => {
                const personel = personeller.find(p => p.id === birim.ilgili_personel_id)
                const legacyPersonelText = birim.ayrintili_bilgi_personel
                
                return (
                  <div
                    key={birim.id}
                    className="flex justify-between items-start p-3.5 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                          {birim.birim_adi}
                        </span>
                        {birim.kurumsal_kod && (
                          <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                            {birim.kurumsal_kod}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400">
                        {birim.sunum_makami && <span>📋 {birim.sunum_makami}</span>}
                        {birim.dtvt_kodu && <span>🏷️ DTVT: {birim.dtvt_kodu}</span>}
                        {(personel || legacyPersonelText) && (
                          <span>👤 {personel ? personel.ad_soyad : legacyPersonelText}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      title="Sil"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBirim(birim.id)}
                      className="h-8 w-8 p-0 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15 transition-all shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
