import React, { useState } from 'react'
import { useBirimlerHooks, BirimInput, usePersonelList } from './birimler.hooks'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { LayoutGrid, Plus, Trash2, Edit2, ChevronDown, ChevronUp } from 'lucide-react'

import { Modal } from '../../components/ui/Modal'

const emptyBirim: BirimInput = {
  birim_adi: '', antet_ek_satir: '', ihtiyac_yeri_eki: '',
  sunum_makami: '', kurumsal_kod: '', ayrintili_bilgi_personel: '', ilgili_personel_id: null
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
  const { birimler, isLoadingBirimler, addBirim, updateBirim, deleteBirim } = useBirimlerHooks()
  const { personeller, isLoading: isLoadingPersonel } = usePersonelList()
  const [form, setForm] = useState<BirimInput>({ ...emptyBirim })
  const [showExtraFields, setShowExtraFields] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBirimId, setEditingBirimId] = useState<number | null>(null)

  const handleChange = (key: keyof BirimInput, value: string | number | null): void => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveBirim = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!form.birim_adi.trim()) return
    try {
      if (editingBirimId) {
        await updateBirim({ id: editingBirimId, data: form })
      } else {
        await addBirim(form)
      }
      setForm({ ...emptyBirim })
      setShowExtraFields(false)
      setIsModalOpen(false)
      setEditingBirimId(null)
    } catch (err: any) {
      if (err.message?.includes('UNIQUE')) {
        alert('Bu birim zaten ekli!')
      } else {
        console.error(err)
        alert('Birim kaydedilirken hata oluştu!')
      }
    }
  }

  const handleEditClick = (birim: any) => {
    setForm({
      birim_adi: birim.birim_adi || '',
      antet_ek_satir: birim.antet_ek_satir || '',
      ihtiyac_yeri_eki: birim.ihtiyac_yeri_eki || '',
      sunum_makami: birim.sunum_makami || '',
      kurumsal_kod: birim.kurumsal_kod || '',
      ayrintili_bilgi_personel: birim.ayrintili_bilgi_personel || '',
      ilgili_personel_id: birim.ilgili_personel_id || null
    })
    setEditingBirimId(birim.id)
    setShowExtraFields(true)
    setIsModalOpen(true)
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

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col h-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-855 dark:text-slate-100 flex items-center gap-3">
            <LayoutGrid className="w-8 h-8 text-blue-600" />
            Birim &amp; Müdürlük Yönetimi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Kurumunuza ait idari birimleri ve müdürlükleri buradan tanımlayarak personellere atayabilirsiniz.
          </p>
        </div>
        <Button 
          onClick={() => {
            setForm({ ...emptyBirim })
            setEditingBirimId(null)
            setShowExtraFields(false)
            setIsModalOpen(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 shadow-md flex items-center gap-2 px-4 py-2 text-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Yeni Birim Ekle
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoadingBirimler ? (
            <div className="col-span-full text-sm text-slate-450 dark:text-slate-500 py-4 italic">Birimler yükleniyor...</div>
          ) : birimler.length === 0 ? (
            <div className="col-span-full text-sm text-slate-450 dark:text-slate-500 py-4 italic">Kayıtlı birim bulunmamaktadır.</div>
          ) : (
            birimler.map((birim) => {
              const personel = personeller.find(p => p.id === birim.ilgili_personel_id)
              const legacyPersonelText = birim.ayrintili_bilgi_personel
              
              return (
                <div
                  key={birim.id}
                  className="flex flex-col p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-xl hover:border-blue-300 dark:hover:border-blue-800 transition-colors group relative"
                >
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <Button
                      title="Düzenle"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(birim)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      title="Sil"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBirim(birim.id)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2 pr-8">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200 leading-tight">
                      {birim.birim_adi}
                    </span>
                    {birim.kurumsal_kod && (
                      <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                        {birim.kurumsal_kod}
                      </span>
                    )}
                    {birim.personel_sayisi ? (
                      <span className="text-[10px] font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded ml-auto">
                        {birim.personel_sayisi} Personel
                      </span>
                    ) : null}
                  </div>
                  
                  <div className="space-y-1.5 mt-auto pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
                    {birim.sunum_makami && (
                      <div className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="opacity-70 mt-0.5">📋</span>
                        <span className="line-clamp-2">{birim.sunum_makami}</span>
                      </div>
                    )}
                    {(personel || legacyPersonelText) && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="opacity-70">👤</span>
                        <span className="font-medium">{personel ? personel.ad_soyad : legacyPersonelText}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingBirimId(null)
        }}
        title={editingBirimId ? "Birimi Düzenle" : "Yeni Birim Tanımla"}
        description={editingBirimId ? "İdari birim bilgilerini güncelleyin." : "Kurumunuza ait idari birim veya müdürlük ekleyin."}
      >
        <form onSubmit={handleSaveBirim} className="space-y-4">
          <Field label="Birim / Müdürlük Adı" field="birim_adi" form={form} handleChange={handleChange} required placeholder="Örn: Fen İşleri Müdürlüğü" />

          <button
            type="button"
            onClick={() => setShowExtraFields(!showExtraFields)}
            className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold mt-2 cursor-pointer w-full justify-center bg-blue-50 dark:bg-blue-900/20 py-2 rounded-lg transition-colors"
          >
            {showExtraFields ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showExtraFields ? 'Ek Bilgileri Gizle' : 'Antet, Kod & Sunum Bilgileri Göster'}
          </button>

          {showExtraFields && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
              <Field label="Antet Ek Satır" field="antet_ek_satir" form={form} handleChange={handleChange} placeholder="Antet yazısında ek satır" />
              <Field label="İhtiyaç Yeri Eki" field="ihtiyac_yeri_eki" form={form} handleChange={handleChange} placeholder="İhtiyaç yeri ek bilgisi" />
              <Field label="Sunum Makamı" field="sunum_makami" form={form} handleChange={handleChange} placeholder="Sunulacak makam" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Kurumsal Kod" field="kurumsal_kod" form={form} handleChange={handleChange} />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  İlgili Personel (Ayrıntılı Bilgi)
                </label>
                <select
                  value={form.ilgili_personel_id || ''}
                  onChange={(e) => handleChange('ilgili_personel_id', e.target.value ? Number(e.target.value) : null)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm py-2 h-10 rounded-xl px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  disabled={isLoadingPersonel}
                >
                  <option value="">-- Personel Seçiniz --</option>
                  {personeller.map(p => (
                    <option key={p.id} value={p.id}>{p.ad_soyad}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
            <Button type="button" variant="outline" onClick={() => {
              setIsModalOpen(false)
              setEditingBirimId(null)
            }}>
              İptal
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 shadow-md">
              {editingBirimId ? "Güncelle" : "Birimi Kaydet"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
