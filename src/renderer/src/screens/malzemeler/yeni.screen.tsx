import React, { useState } from 'react'
import { ArrowLeft, Save, Search, PackageSearch, Barcode, Database, Activity } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useMalzemelerHooks, Kalem } from './malzemeler.hooks'
import { useOlcuBirimleri } from '../olcubirimleri/olcubirimleri.hooks'

export default function YeniMalzemeScreen(): React.JSX.Element {
  const navigate = useNavigate()
  const { addKalem } = useMalzemelerHooks()
  const { data: birimler = [] } = useOlcuBirimleri()

  // Form State
  const [formData, setFormData] = useState<Partial<Kalem>>(() => ({
    tipi: 'Mal',
    birim: 'Adet',
    kdv_orani: 20,
    aktif_mi: 1,
    personel_asgari_fark_oran: 0,
    barkod_id: `UID-${Math.random().toString(36).substring(2, 11).toUpperCase()}`
  }))

  // Mock OKAS and Tasinir selection state
  const [isOkasModalOpen, setIsOkasModalOpen] = useState(false)
  const [isTasinirModalOpen, setIsTasinirModalOpen] = useState(false)

  const handleSave = async () => {
    if (!formData.kalem_adi || !formData.barkod_id) {
      alert('Lütfen zorunlu alanları (Adı, Kodu/Barkodu) doldurunuz.')
      return
    }

    try {
      await addKalem(formData)
      navigate({ to: '/malzemeler' })
    } catch (err) {
      alert('Kaydedilirken hata oluştu: ' + (err as Error).message)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
      {/* Header */}
      <div className="flex-none p-4 md:p-6 pb-0 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to="/malzemeler"
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <PackageSearch className="text-primary" size={24} />
              Yeni Kayıt (Mal/Hizmet/Yapım İşi)
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Sisteme yeni bir malzeme, hizmet veya yapım işi tanımı ekleyin
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => navigate({ to: '/malzemeler' })}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <Save size={18} />
              Kaydet
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Kimlik Bilgileri */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <Barcode className="text-primary" size={20} />
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Kimlik & Sınıflandırma</h2>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Barkod / Benzersiz ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.barkod_id || ''}
                    onChange={(e) => setFormData({ ...formData, barkod_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <p className="text-xs text-slate-500 mt-1">Sistem tarafından otomatik atanmıştır, değiştirebilirsiniz.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Taşınır Kodu
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.tasinir_kodu || ''}
                      onChange={(e) => setFormData({ ...formData, tasinir_kodu: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Örn: 150.01.01.01"
                    />
                    <button 
                      onClick={() => setIsTasinirModalOpen(true)}
                      className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 shrink-0 border border-slate-200"
                    >
                      <Search size={16} />
                      <span className="hidden sm:inline">Listeden Seç</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Mal/Hizmet/Yapım Adı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.kalem_adi || ''}
                    onChange={(e) => setFormData({ ...formData, kalem_adi: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Örn: A4 Fotokopi Kağıdı 80gr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    OKAS Kodu
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.okas_kodu || ''}
                      onChange={(e) => setFormData({ ...formData, okas_kodu: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="OKAS Kodu giriniz veya seçiniz"
                    />
                    <button 
                      onClick={() => setIsOkasModalOpen(true)}
                      className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 shrink-0 border border-slate-200"
                    >
                      <Search size={16} />
                      <span className="hidden sm:inline">Listeden Seç</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Temel Özellikler */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <Database className="text-primary" size={20} />
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Temel Özellikler & Birimler</h2>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Türü
                  </label>
                  <select
                    value={formData.tipi || 'Mal'}
                    onChange={(e) => setFormData({ ...formData, tipi: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="Mal">Mal</option>
                    <option value="Hizmet, Personel">Hizmet, Personel</option>
                    <option value="Hizmet, Diğer">Hizmet, Diğer</option>
                    <option value="Yapım">Yapım İşi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Birim
                  </label>
                  <select
                    value={formData.birim || 'Adet'}
                    onChange={(e) => setFormData({ ...formData, birim: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {birimler.filter(b => b.aktif_mi).map(birim => (
                      <option key={birim.id} value={birim.ad}>{birim.ad}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    KDV Oranı (%)
                  </label>
                  <select
                    value={formData.kdv_orani || 20}
                    onChange={(e) => setFormData({ ...formData, kdv_orani: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value={0}>%0</option>
                    <option value={1}>%1</option>
                    <option value={10}>%10</option>
                    <option value={20}>%20</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Özelliği
                  </label>
                  <textarea
                    value={formData.ozelligi || ''}
                    onChange={(e) => setFormData({ ...formData, ozelligi: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[95px] resize-y"
                    placeholder="Teknik özellikleri, detayları..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Menşei
                  </label>
                  <input
                    type="text"
                    value={formData.mensei || ''}
                    onChange={(e) => setFormData({ ...formData, mensei: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Örn: Yerli, İthal"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hizmet (Personel) Özel Alanlar */}
          {formData.tipi === 'Hizmet, Personel' && (
            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-800/30 overflow-hidden">
              <div className="px-6 py-4 border-b border-indigo-100 dark:border-indigo-800/30 flex items-center gap-2">
                <Activity className="text-indigo-600 dark:text-indigo-400" size={20} />
                <h2 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">Personel Hizmeti Detayları</h2>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Asgari Ücret Fark Oranı (%)
                  </label>
                  <input
                    type="number"
                    value={formData.personel_asgari_fark_oran || 0}
                    onChange={(e) => setFormData({ ...formData, personel_asgari_fark_oran: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <p className="text-xs text-slate-500 mt-1">Sadece personel ihalelerinde katsayı hesaplaması için</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Mock Modals for Selection (These would be complex components in reality) */}
      {isOkasModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col p-6">
            <h3 className="text-lg font-bold mb-4">OKAS Kodu Seçin</h3>
            <p className="text-sm text-slate-500 mb-4">Bu özellik yapım aşamasındadır. Şimdilik manuel giriş yapabilirsiniz.</p>
            <div className="mt-auto flex justify-end">
              <button 
                onClick={() => setIsOkasModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {isTasinirModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col p-6">
            <h3 className="text-lg font-bold mb-4">Taşınır Kodu Seçin</h3>
            <p className="text-sm text-slate-500 mb-4">Bu özellik yapım aşamasındadır. Şimdilik manuel giriş yapabilirsiniz.</p>
            <div className="mt-auto flex justify-end">
              <button 
                onClick={() => setIsTasinirModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
