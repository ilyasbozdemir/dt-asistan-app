import React, { useState } from 'react'
import { Plus, Trash2, Edit2, Search } from 'lucide-react'
import { useOlcuBirimleri, useSaveOlcuBirimi, useDeleteOlcuBirimi, OlcuBirimi } from './olcubirimleri.hooks'

export default function OlcuBirimleriScreen(): React.JSX.Element {
  const { data: birimler = [], isLoading } = useOlcuBirimleri()
  const saveMutation = useSaveOlcuBirimi()
  const deleteMutation = useDeleteOlcuBirimi()

  const [searchQuery, setSearchQuery] = useState('')
  const [editingBirim, setEditingBirim] = useState<Partial<OlcuBirimi> | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredBirimler = birimler.filter(b => 
    b.ad.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEdit = (birim: OlcuBirimi) => {
    setEditingBirim(birim)
    setIsModalOpen(true)
  }

  const handleAddNew = () => {
    setEditingBirim({ ad: '', aktif_mi: 1 })
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Bu ölçü birimini silmek istediğinize emin misiniz?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleSave = () => {
    if (!editingBirim?.ad?.trim()) {
      alert('Lütfen birim adı girin.')
      return
    }
    saveMutation.mutate(editingBirim, {
      onSuccess: () => {
        setIsModalOpen(false)
        setEditingBirim(null)
      }
    })
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Header */}
      <div className="flex-none p-4 md:p-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
              Ölçü Birimleri
            </h1>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1">
              Malzeme ve hizmetler için sistemde kayıtlı ölçü birimleri. Toplam {birimler.length} kayıt.
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm w-full sm:w-auto"
          >
            <Plus size={20} />
            <span className="font-medium">Yeni Birim Ekle</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-4 md:px-6 pb-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full min-h-[400px]">
          {/* Toolbar */}
          <div className="flex-none p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Ölçü birimi ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 w-16">ID</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">Ölçü Birimi</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 w-32 text-center">Durum</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 w-24 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">Yükleniyor...</td>
                  </tr>
                ) : filteredBirimler.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      {searchQuery ? 'Aramanızla eşleşen sonuç bulunamadı.' : 'Henüz ölçü birimi eklenmemiş.'}
                    </td>
                  </tr>
                ) : (
                  filteredBirimler.map((birim) => (
                    <tr key={birim.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">#{birim.id}</td>
                      <td className="py-3 px-4 text-sm text-slate-900 dark:text-white font-medium">{birim.ad}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          birim.aktif_mi 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400'
                        }`}>
                          {birim.aktif_mi ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(birim)}
                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                            title="Düzenle"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(birim.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && editingBirim && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-full border border-slate-200 dark:border-slate-800">
            <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {editingBirim.id ? 'Ölçü Birimi Düzenle' : 'Yeni Ölçü Birimi'}
              </h2>
              <button 
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingBirim(null)
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                &times;
              </button>
            </div>
            
            <div className="p-4 md:p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Ölçü Birimi Adı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingBirim.ad || ''}
                    onChange={(e) => setEditingBirim({ ...editingBirim, ad: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Örn: Adet, Kutu, Saat..."
                    autoFocus
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="aktif_mi"
                    checked={editingBirim.aktif_mi === 1}
                    onChange={(e) => setEditingBirim({ ...editingBirim, aktif_mi: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 text-primary bg-slate-100 border-slate-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="aktif_mi" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Aktif (Sistemde Kullanılabilir)
                  </label>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingBirim(null)
                }}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {saveMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
