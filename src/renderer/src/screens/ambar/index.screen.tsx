import React, { useState } from 'react'
import { useAmbarHooks, AmbarInput } from './ambar.hooks'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Database, Plus, Trash2, Archive, MapPin, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react'

const emptyAmbar: AmbarInput = {
  ambar_adi: '', aciklama: '', adres: '', semt: '', posta_kodu: '', sehir: '',
  telefon: '', faks: '', web_adresi: '', email: '', tasinir_kodu: '', tasinir_adi: ''
}

export default function AmbarScreen(): React.JSX.Element {
  const { ambarlar, isLoadingAmbarlar, addAmbar, deleteAmbar } = useAmbarHooks()
  const [form, setForm] = useState<AmbarInput>({ ...emptyAmbar })
  const [showExtraFields, setShowExtraFields] = useState(false)

  const handleChange = (key: keyof AmbarInput, value: string): void => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleAdd = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!form.ambar_adi.trim()) return
    try {
      await addAmbar(form)
      setForm({ ...emptyAmbar })
      setShowExtraFields(false)
    } catch (err: any) {
      if (err.message?.includes('UNIQUE')) {
        alert('Bu ambar zaten kayıtlı!')
      } else {
        alert('Ambar eklenirken hata oluştu!')
      }
    }
  }

  const handleDelete = async (id: number): Promise<void> => {
    if (confirm('Bu ambar kaydını silmek istediğinize emin misiniz?')) {
      try {
        await deleteAmbar(id)
      } catch {
        alert('Silme sırasında hata oluştu!')
      }
    }
  }

  const Field = ({ label, field, required, placeholder }: { label: string; field: keyof AmbarInput; required?: boolean; placeholder?: string }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Input
        value={form[field] as string}
        onChange={(e) => handleChange(field, e.target.value)}
        placeholder={placeholder || label}
        required={required}
        className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs py-1.5 h-9"
      />
    </div>
  )

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full">
      {/* BAŞLIK */}
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-slate-850 dark:text-slate-100">
            <Database className="w-8 h-8 text-blue-600" />
            Ambar Tanımları &amp; Depo Yönetimi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Kurumunuza ait ana ambar, depo, stok grupları ve depo sorumlularını tanımlayın.
          </p>
        </div>
      </div>

      {/* İSTATİSTİK KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Tanımlı Ambar Deposu</div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">{ambarlar.length} Adet</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Farklı Şehir</div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {new Set(ambarlar.filter(a => a.sehir).map(a => a.sehir)).size || 0} Bölge
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Taşınır Kodlu</div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {ambarlar.filter(a => a.tasinir_kodu).length} Adet
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SOL: FORM */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" />
            Yeni Ambar Deposu Tanımla
          </h3>

          <form onSubmit={handleAdd} className="space-y-3">
            <Field label="Ambar Adı" field="ambar_adi" required placeholder="Örn: Fen İşleri Yedek Parça Ambarı" />
            <Field label="Açıklama" field="aciklama" placeholder="Ambar hakkında kısa bilgi" />

            <button
              type="button"
              onClick={() => setShowExtraFields(!showExtraFields)}
              className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold mt-1 cursor-pointer"
            >
              {showExtraFields ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {showExtraFields ? 'Ek Bilgileri Gizle' : 'Adres, İletişim & Taşınır Bilgileri'}
            </button>

            {showExtraFields && (
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
                <Field label="Adres" field="adres" />
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Semt" field="semt" />
                  <Field label="Posta Kodu" field="posta_kodu" />
                  <Field label="Şehir" field="sehir" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Telefon" field="telefon" />
                  <Field label="Faks" field="faks" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Web Adresi" field="web_adresi" />
                  <Field label="Email" field="email" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Taşınır Kodu" field="tasinir_kodu" />
                  <Field label="Taşınır Adı" field="tasinir_adi" />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/10 text-xs font-semibold py-2 mt-2">
              Ambar Kaydını Ekle
            </Button>
          </form>
        </div>

        {/* SAĞ: LİSTE */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 mb-4">Kayıtlı Ambar Depoları</h3>

          <div className="flex flex-col gap-3">
            {isLoadingAmbarlar ? (
              <div className="text-sm text-slate-450 dark:text-slate-500 py-4 italic">Ambar depoları yükleniyor...</div>
            ) : ambarlar.length === 0 ? (
              <div className="text-sm text-slate-450 dark:text-slate-500 py-4 italic">Kayıtlı ambar deposu bulunmamaktadır.</div>
            ) : (
              ambarlar.map((ambar) => (
                <div
                  key={ambar.id}
                  className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors flex items-start justify-between gap-4 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      {ambar.tasinir_kodu && (
                        <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-100/20 dark:border-blue-900/10 px-2 py-0.5 rounded">
                          {ambar.tasinir_kodu}
                        </span>
                      )}
                      {ambar.sehir && (
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          {ambar.sehir}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1 leading-normal">{ambar.ambar_adi}</h4>
                    {ambar.aciklama && (
                      <p className="text-xs text-slate-500 mb-1">{ambar.aciklama}</p>
                    )}
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400">
                      {ambar.adres && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          {ambar.adres}
                        </span>
                      )}
                      {ambar.telefon && <span>📞 {ambar.telefon}</span>}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(ambar.id)}
                    title="Sil"
                    className="h-8 w-8 p-0 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15 transition-all shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
