import React from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { FirmaInput } from '../firmalar.hooks'

const Field = ({
  label,
  field,
  form,
  handleChange,
  required,
  placeholder
}: {
  label: string
  field: keyof FirmaInput
  form: FirmaInput
  handleChange: (field: keyof FirmaInput, value: string) => void
  required?: boolean
  placeholder?: string
}) => (
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

interface FirmaModalProps {
  isOpen: boolean
  onClose: () => void
  editingId: number | null
  form: FirmaInput
  handleChange: (key: keyof FirmaInput, value: string) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  showExtraFields: boolean
  setShowExtraFields: (val: boolean) => void
}

export const FirmaModal: React.FC<FirmaModalProps> = ({
  isOpen,
  onClose,
  editingId,
  form,
  handleChange,
  handleSubmit,
  showExtraFields,
  setShowExtraFields
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingId ? 'Firma Düzenle' : 'Yeni Firma Ekle'}
      description={
        editingId
          ? 'Firma bilgilerini güncelleyin.'
          : 'Tedarikçi firma bilgilerini sisteme kaydedin.'
      }
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Firma Kodu"
            field="firma_kodu"
            form={form}
            handleChange={handleChange}
            placeholder="Örn: FRM-001"
          />
          <Field
            label="Firma Ünvanı"
            field="unvan"
            form={form}
            handleChange={handleChange}
            required
            placeholder="Firma ticari ünvanı"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="İlgili Kişi" field="ilgili_adi" form={form} handleChange={handleChange} />
          <Field label="Uyruğu" field="uyrugu" form={form} handleChange={handleChange} />
        </div>
        <Field
          label="İştigal Konusu"
          field="istigal_konusu"
          form={form}
          handleChange={handleChange}
          placeholder="Yapı malzemesi, kırtasiye vb."
        />

        <button
          type="button"
          onClick={() => setShowExtraFields(!showExtraFields)}
          className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold mt-2 cursor-pointer w-full justify-center bg-blue-50 dark:bg-blue-900/20 py-2 rounded-lg transition-colors"
        >
          {showExtraFields ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
          {showExtraFields ? 'Ek Bilgileri Gizle' : 'Adres, Banka & Vergi Bilgileri Göster'}
        </button>

        {showExtraFields && (
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
            <Field label="Adres" field="adres" form={form} handleChange={handleChange} />
            <div className="grid grid-cols-3 gap-4">
              <Field label="İlçe" field="ilce" form={form} handleChange={handleChange} />
              <Field
                label="Posta Kodu"
                field="posta_kodu"
                form={form}
                handleChange={handleChange}
              />
              <Field label="İl" field="il" form={form} handleChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Telefon" field="telefon" form={form} handleChange={handleChange} />
              <Field label="Faks" field="faks" form={form} handleChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="E-mail" field="email" form={form} handleChange={handleChange} />
              <Field
                label="Web Adresi"
                field="web_adresi"
                form={form}
                handleChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Banka Adı"
                field="banka_adi"
                form={form}
                handleChange={handleChange}
              />
              <Field
                label="Şube Kodu / Adı"
                field="sube_kodu_adi"
                form={form}
                handleChange={handleChange}
              />
            </div>
            <Field label="Hesap No" field="hesap_no" form={form} handleChange={handleChange} />

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="TC Kimlik No"
                field="tc_kimlik_no"
                form={form}
                handleChange={handleChange}
              />
              <Field
                label="Doğum Tarihi"
                field="dogum_tarihi"
                form={form}
                handleChange={handleChange}
                placeholder="GG.AA.YYYY"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Vergi Dairesi"
                field="vergi_dairesi"
                form={form}
                handleChange={handleChange}
              />
              <Field label="Vergi No" field="vergi_no" form={form} handleChange={handleChange} />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            İptal
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 shadow-md">
            {editingId ? 'Güncelle' : 'Firmayı Kaydet'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
