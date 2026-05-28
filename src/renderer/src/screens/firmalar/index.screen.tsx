import React, { useState } from 'react'
import { useFirmalarHooks, FirmaInput } from './firmalar.hooks'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Building2, Plus, Trash2, Search, ChevronDown, ChevronUp } from 'lucide-react'

const emptyFirma: FirmaInput = {
  firma_kodu: '', unvan: '', ilgili_adi: '', uyrugu: 'T.C.',
  istigal_konusu: '', adres: '', ilce: '', posta_kodu: '', il: '',
  telefon: '', faks: '', email: '', web_adresi: '',
  banka_adi: '', sube_kodu_adi: '', hesap_no: '',
  tc_kimlik_no: '', dogum_tarihi: '', vergi_dairesi: '', vergi_no: ''
}

export default function FirmalarScreen(): React.JSX.Element {
  const { firmalar, isLoadingFirmalar, addFirma, deleteFirma } = useFirmalarHooks()
  const [form, setForm] = useState<FirmaInput>({ ...emptyFirma })
  const [searchQuery, setSearchQuery] = useState('')
  const [showExtraFields, setShowExtraFields] = useState(false)

  const handleChange = (key: keyof FirmaInput, value: string): void => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleAdd = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!form.unvan.trim()) return
    try {
      await addFirma(form)
      setForm({ ...emptyFirma })
      setShowExtraFields(false)
    } catch (err: any) {
      if (err.message?.includes('UNIQUE')) {
        alert('Bu firma zaten kayıtlı!')
      } else {
        alert('Firma eklenirken hata oluştu!')
      }
    }
  }

  const handleDelete = async (id: number): Promise<void> => {
    if (confirm('Bu firmayı silmek istediğinize emin misiniz?')) {
      try {
        await deleteFirma(id)
      } catch {
        alert('Silme sırasında hata oluştu!')
      }
    }
  }

  const filtered = firmalar.filter((f) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      f.unvan?.toLowerCase().includes(q) ||
      f.firma_kodu?.toLowerCase().includes(q) ||
      f.vergi_no?.toLowerCase().includes(q) ||
      f.il?.toLowerCase().includes(q)
    )
  })

  const Field = ({ label, field, required, placeholder }: { label: string; field: keyof FirmaInput; required?: boolean; placeholder?: string }) => (
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
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full">
      {/* BAŞLIK */}
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-slate-850 dark:text-slate-100">
            <Building2 className="w-8 h-8 text-blue-600" />
            İstekli Firma Yönetimi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Doğrudan temin süreçlerinde kullanılacak firma ve tedarikçi havuzunu yönetin.
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{firmalar.length}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Kayıtlı Firma</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SOL: FORM */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" />
            Yeni Firma Ekle
          </h3>

          <form onSubmit={handleAdd} className="space-y-3">
            {/* Temel Bilgiler */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Firma Kodu" field="firma_kodu" placeholder="Örn: FRM-001" />
              <Field label="Firma Ünvanı" field="unvan" required placeholder="Firma ticari ünvanı" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="İlgili Kişi" field="ilgili_adi" />
              <Field label="Uyruğu" field="uyrugu" />
            </div>
            <Field label="İştigal Konusu" field="istigal_konusu" placeholder="Yapı malzemesi, kırtasiye vb." />

            {/* Genişletilebilir Bölüm */}
            <button
              type="button"
              onClick={() => setShowExtraFields(!showExtraFields)}
              className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold mt-1 cursor-pointer"
            >
              {showExtraFields ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {showExtraFields ? 'Ek Bilgileri Gizle' : 'Adres, Banka & Vergi Bilgileri'}
            </button>

            {showExtraFields && (
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
                {/* Adres */}
                <Field label="Adres" field="adres" />
                <div className="grid grid-cols-3 gap-3">
                  <Field label="İlçe" field="ilce" />
                  <Field label="Posta Kodu" field="posta_kodu" />
                  <Field label="İl" field="il" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Telefon" field="telefon" />
                  <Field label="Faks" field="faks" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="E-mail" field="email" />
                  <Field label="Web Adresi" field="web_adresi" />
                </div>

                {/* Banka */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Banka Adı" field="banka_adi" />
                  <Field label="Şube Kodu / Adı" field="sube_kodu_adi" />
                </div>
                <Field label="Hesap No" field="hesap_no" />

                {/* Vergi & TC */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="TC Kimlik No" field="tc_kimlik_no" />
                  <Field label="Doğum Tarihi" field="dogum_tarihi" placeholder="GG.AA.YYYY" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Vergi Dairesi" field="vergi_dairesi" />
                  <Field label="Vergi No" field="vergi_no" />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/10 text-xs font-semibold py-2 mt-2">
              Firmayı Kaydet
            </Button>
          </form>
        </div>

        {/* SAĞ: LİSTE */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">Kayıtlı Firmalar</h3>
            <div className="relative w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Firma ara..."
                className="pl-8 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs py-1.5 h-8"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {isLoadingFirmalar ? (
              <div className="text-sm text-slate-450 dark:text-slate-500 py-4 italic">Firmalar yükleniyor...</div>
            ) : filtered.length === 0 ? (
              <div className="text-sm text-slate-450 dark:text-slate-500 py-4 italic">
                {searchQuery ? 'Arama sonucu bulunamadı.' : 'Kayıtlı firma bulunmamaktadır.'}
              </div>
            ) : (
              filtered.map((firma) => (
                <div
                  key={firma.id}
                  className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {firma.firma_kodu && (
                          <span className="font-mono font-bold text-[10px] text-blue-600 dark:text-blue-450 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                            {firma.firma_kodu}
                          </span>
                        )}
                        {firma.il && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                            {firma.il}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{firma.unvan}</h4>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                        {firma.telefon && <span>📞 {firma.telefon}</span>}
                        {firma.email && <span>✉️ {firma.email}</span>}
                        {firma.vergi_no && <span>🏛️ VN: {firma.vergi_no}</span>}
                      </div>
                    </div>
                    <Button
                      title="Sil"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(firma.id)}
                      className="h-8 w-8 p-0 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15 transition-all shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
