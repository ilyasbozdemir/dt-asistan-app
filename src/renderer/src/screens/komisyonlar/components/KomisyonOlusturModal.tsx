import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  X,
  Users,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'

interface KomisyonOlusturModalProps {
  isOpen: boolean
  onClose: () => void
}

export function KomisyonOlusturModal({ isOpen, onClose }: KomisyonOlusturModalProps): React.JSX.Element | null {
  const queryClient = useQueryClient()
  const [ad, setAd] = useState('')
  
  // Üyeler state: { personelId: number, gorevId: number, asilMi: boolean }
  const [uyeler, setUyeler] = useState<any[]>([])

  const { data: personeller = [] } = useQuery({
    queryKey: ['personel_listesi_komisyon'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Personel WHERE aktif_mi = 1'
      )
      if (!res.success) throw new Error(res.error)
      return res.data
    },
    enabled: isOpen
  })

  const { data: gorevler = [] } = useQuery({
    queryKey: ['komisyon_gorevleri'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_KomisyonGorevi WHERE aktif_mi = 1 ORDER BY id ASC'
      )
      if (!res.success) throw new Error(res.error)
      return res.data
    },
    enabled: isOpen
  })

  const handleAddUye = () => {
    setUyeler([...uyeler, { id: Date.now(), personelId: '', gorevId: '', asilMi: 1 }])
  }

  const handleRemoveUye = (id: number) => {
    setUyeler(uyeler.filter(u => u.id !== id))
  }

  const handleUyeChange = (id: number, field: string, value: any) => {
    setUyeler(uyeler.map(u => u.id === id ? { ...u, [field]: value } : u))
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!ad) throw new Error('Lütfen komisyon adı giriniz.')
      if (uyeler.some(u => !u.personelId || !u.gorevId)) {
        throw new Error('Lütfen tüm üyelerin personel ve görev seçimlerini yapınız.')
      }

      const res = await window.electron.ipcRenderer.invoke('db:transaction', [
        {
          sql: 'INSERT INTO TANIM_Komisyon (ad) VALUES (?)',
          params: [ad]
        }
      ])
      
      if (!res.success) throw new Error(res.error)
      const komisyonId = res.lastInsertRowid

      const uyeQueries = uyeler.map(u => ({
        sql: 'INSERT INTO TANIM_KomisyonUye (komisyon_id, personel_id, gorev_id, asil_mi) VALUES (?, ?, ?, ?)',
        params: [komisyonId, u.personelId, u.gorevId, u.asilMi]
      }))

      if (uyeQueries.length > 0) {
        const uyeRes = await window.electron.ipcRenderer.invoke('db:transaction', uyeQueries)
        if (!uyeRes.success) throw new Error(uyeRes.error)
      }

      return komisyonId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['komisyonlar'] })
      onClose()
      setAd('')
      setUyeler([])
    }
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-500" />
              Yeni Komisyon Oluştur
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Komisyon türünü belirleyin ve personelleri görevlendirin.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          {saveMutation.isError && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {saveMutation.error?.message}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Komisyon Adı</label>
              <Input
                type="text"
                placeholder="Örn: Bilişim Sistemleri Fiyat Araştırma Komisyonu"
                value={ad}
                onChange={e => setAd(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Komisyon Üyeleri</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Bu komisyonda görev alacak personelleri ve rollerini belirleyin.</p>
              </div>
              <Button onClick={handleAddUye} variant="outline" className="gap-2 text-sm border-dashed">
                <Plus className="w-4 h-4" /> Üye Ekle
              </Button>
            </div>

            <div className="space-y-3">
              {uyeler.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 border-dashed">
                  <p className="text-sm text-slate-500">Henüz üye eklenmedi. "Üye Ekle" butonunu kullanarak personelleri görevlendirebilirsiniz.</p>
                </div>
              ) : (
                uyeler.map((uye, index) => (
                  <div key={uye.id} className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 text-xs font-bold shrink-0">
                      {index + 1}
                    </div>
                    
                    <select
                      title="Personel Seç"
                      value={uye.personelId}
                      onChange={e => handleUyeChange(uye.id, 'personelId', e.target.value ? Number(e.target.value) : '')}
                      className="flex-1 min-w-[200px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white"
                    >
                      <option value="">-- Personel Seç --</option>
                      {personeller.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.ad_soyad} ({p.unvan})</option>
                      ))}
                    </select>

                    <select
                      title="Görev Seç"
                      value={uye.gorevId}
                      onChange={e => handleUyeChange(uye.id, 'gorevId', e.target.value ? Number(e.target.value) : '')}
                      className="flex-1 min-w-[150px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white"
                    >
                      <option value="">-- Görev Seç --</option>
                      {gorevler.map((g: any) => (
                        <option key={g.id} value={g.id}>{g.ad}</option>
                      ))}
                    </select>

                    <select
                      title="Durum"
                      value={uye.asilMi}
                      onChange={e => handleUyeChange(uye.id, 'asilMi', Number(e.target.value))}
                      className="w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white"
                    >
                      <option value={1}>Asil Üye</option>
                      <option value={0}>Yedek Üye</option>
                    </select>

                    <button 
                      onClick={() => handleRemoveUye(uye.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 shrink-0">
          <Button variant="outline" onClick={onClose} disabled={saveMutation.isPending}>
            İptal
          </Button>
          <Button 
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white" 
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? 'Kaydediliyor...' : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Komisyonu Kaydet
              </>
            )}
          </Button>
        </div>

      </div>
    </div>
  )
}
