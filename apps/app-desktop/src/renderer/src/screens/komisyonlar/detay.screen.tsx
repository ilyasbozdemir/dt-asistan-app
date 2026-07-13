import React, { useState } from 'react'
import { Users, Plus, UserPlus, CheckCircle, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { PersonelAtaModal } from './components/PersonelAtaModal'
import { useTabStore } from '../../store/tabStore'

interface KomisyonUyeInfo {
  role_id: number
  komisyon_id: number
  personel_id: number | null
  gorev_id: number
  asil_mi: number
  ad_soyad?: string | null
  unvan?: string | null
  gorev_adi?: string | null
}

export default function KomisyonDetayScreen(): React.JSX.Element {
  const queryClient = useQueryClient()

  // Tab sisteminde aktif path "/komisyonlar/detay?id=5" şeklinde geliyor
  // window.location.hash yerine tabStore'dan okuyoruz
  const { activeTabPath } = useTabStore()
  const tabParams = new URLSearchParams(activeTabPath.split('?')[1] || '')
  const komisyonIdStr = tabParams.get('id')
  const komisyonId = komisyonIdStr ? parseInt(komisyonIdStr, 10) : null

  const [isAtaModalOpen, setIsAtaModalOpen] = useState(false)
  const [ataRoleId, setAtaRoleId] = useState<number | null>(null)

  const [isAddingUye, setIsAddingUye] = useState(false)
  const [newGorevId, setNewGorevId] = useState<number | null>(null)
  const [newAsilMi, setNewAsilMi] = useState(1)
  const [isSavingUye, setIsSavingUye] = useState(false)

  const { data: gorevler = [] } = useQuery({
    queryKey: ['komisyon_gorevleri'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_KomisyonGorevi ORDER BY id ASC'
      )
      if (!res.success) throw new Error(res.error)
      return res.data as { id: number; ad: string; aciklama: string | null }[]
    }
  })

  const handleAddUye = async (): Promise<void> => {
    if (!newGorevId || !komisyonId) return
    setIsSavingUye(true)
    try {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'INSERT INTO TANIM_KomisyonUye (komisyon_id, gorev_id, asil_mi) VALUES (?, ?, ?)',
        [komisyonId, newGorevId, newAsilMi]
      )
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: ['komisyon_detay', komisyonId]
        })
        setIsAddingUye(false)
        setNewGorevId(null)
        setNewAsilMi(1)
      } else {
        alert('Kontenjan eklenirken hata oluştu: ' + res.error)
      }
    } catch (err: unknown) {
      alert('Hata: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setIsSavingUye(false)
    }
  }

  const {
    data: komisyon,
    isLoading,
    error
  } = useQuery({
    queryKey: ['komisyon_detay', komisyonId],
    queryFn: async () => {
      if (!komisyonId) throw new Error('Komisyon ID bulunamadı')

      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Komisyon WHERE id = ?',
        [komisyonId]
      )
      if (!res.success || res.data.length === 0) {
        throw new Error('Komisyon bulunamadı')
      }

      const komisyonData = res.data[0]

      const membersRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT u.id as role_id, u.komisyon_id, u.personel_id, u.gorev_id, u.asil_mi, p.ad_soyad, p.unvan, g.ad as gorev_adi
         FROM TANIM_KomisyonUye u
         LEFT JOIN TANIM_Personel p ON u.personel_id = p.id
         LEFT JOIN TANIM_KomisyonGorevi g ON u.gorev_id = g.id
         WHERE u.komisyon_id = ?
         ORDER BY u.id ASC`,
        [komisyonId]
      )

      if (membersRes.success) {
        komisyonData.uyeler = membersRes.data
      } else {
        komisyonData.uyeler = []
      }

      return komisyonData
    },
    enabled: !!komisyonId
  })

  if (!komisyonId) {
    return (
      <div className="p-6 md:p-8 max-w-6xl mx-auto flex flex-col gap-6 w-full animate-in fade-in duration-500">
        Geçersiz komisyon kimliği. Lütfen listeye geri dönün.
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-6xl mx-auto flex flex-col gap-6 w-full animate-in fade-in duration-500">
        <div className="flex items-center gap-2 text-slate-500">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
          Yükleniyor...
        </div>
      </div>
    )
  }

  if (error || !komisyon) {
    return (
      <div className="p-6 md:p-8 max-w-6xl mx-auto flex flex-col gap-6 w-full animate-in fade-in duration-500 text-rose-500">
        Bir hata oluştu: {(error as Error)?.message || 'Komisyon yüklenemedi'}
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-855 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-7 h-7 text-blue-600" />
              {komisyon.ad}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs">
              Komisyon Üyeleri ve Detayları
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            Görevli Personeller
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
              Toplam {komisyon.uyeler?.length || 0} Kontenjan
            </span>
            <Button
              className="gap-1.5 text-xs px-3 py-1.5 h-auto bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
              onClick={() => setIsAddingUye((v) => !v)}
            >
              <Plus className="w-3.5 h-3.5" />
              Kontenjan Ekle
            </Button>
          </div>
        </div>

        {/* Inline ekleme formu */}
        {isAddingUye && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Görev / Rol
              </label>
              <select
                title="Görev seçin"
                value={newGorevId ?? ''}
                onChange={(e) => setNewGorevId(e.target.value ? Number(e.target.value) : null)}
                className="w-full h-9 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Görev Seçin --</option>
                {gorevler.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.ad}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Tür
              </label>
              <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setNewAsilMi(1)}
                  className={`px-4 py-2 text-xs font-semibold transition-colors ${
                    newAsilMi === 1
                      ? 'bg-green-600 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  Asil
                </button>
                <button
                  type="button"
                  onClick={() => setNewAsilMi(0)}
                  className={`px-4 py-2 text-xs font-semibold transition-colors ${
                    newAsilMi === 0
                      ? 'bg-orange-500 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  Yedek
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="text-xs h-9 px-3 rounded-lg"
                onClick={() => {
                  setIsAddingUye(false)
                  setNewGorevId(null)
                  setNewAsilMi(1)
                }}
              >
                İptal
              </Button>
              <Button
                disabled={!newGorevId || isSavingUye}
                className="text-xs h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                onClick={handleAddUye}
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                {isSavingUye ? 'Ekleniyor...' : 'Ekle'}
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {komisyon.uyeler && komisyon.uyeler.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {komisyon.uyeler.map((uye: KomisyonUyeInfo, idx: number) => (
                <div
                  key={idx}
                  className="flex flex-col p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-slate-800 dark:text-slate-200">
                        {uye.personel_id ? (
                          uye.ad_soyad
                        ) : (
                          <span className="text-slate-400 italic">Boş Kontenjan</span>
                        )}
                      </span>
                      {uye.asil_mi === 1 ? (
                        <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Asil
                        </span>
                      ) : (
                        <span className="text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Yedek
                        </span>
                      )}
                    </div>
                    <button
                      onClick={async () => {
                        if (confirm('Bu kontenjanı tamamen silmek istediğinize emin misiniz?')) {
                          const res = await window.electron.ipcRenderer.invoke(
                            'db:run',
                            'DELETE FROM TANIM_KomisyonUye WHERE id = ?',
                            [uye.role_id]
                          )
                          if (res.success) {
                            queryClient.invalidateQueries({
                              queryKey: ['komisyon_detay', komisyonId]
                            })
                          }
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-1.5 rounded-lg transition-colors"
                      title="Kontenjanı Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {uye.personel_id && (
                      <>
                        <span className="bg-slate-200/50 dark:bg-slate-700/50 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                          {uye.unvan}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                      </>
                    )}
                    <span className="text-blue-600 dark:text-blue-400">{uye.gorev_adi}</span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/50">
                    {!uye.personel_id ? (
                      <Button
                        variant="outline"
                        className="w-full text-xs py-2 h-auto rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                        onClick={() => {
                          setAtaRoleId(uye.role_id)
                          setIsAtaModalOpen(true)
                        }}
                      >
                        Personel Ata
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 text-xs py-2 h-auto rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 bg-white dark:bg-slate-900"
                          onClick={() => {
                            setAtaRoleId(uye.role_id)
                            setIsAtaModalOpen(true)
                          }}
                        >
                          Değiştir
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 text-xs py-2 h-auto rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 bg-white dark:bg-slate-900"
                          onClick={async () => {
                            if (confirm('Personeli bu görevden almak istediğinize emin misiniz?')) {
                              const res = await window.electron.ipcRenderer.invoke(
                                'db:run',
                                'UPDATE TANIM_KomisyonUye SET personel_id = NULL WHERE id = ?',
                                [uye.role_id]
                              )
                              if (res.success) {
                                queryClient.invalidateQueries({
                                  queryKey: ['komisyon_detay', komisyonId]
                                })
                              }
                            }
                          }}
                        >
                          Kaldır
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : !isAddingUye ? (
            <div className="py-12 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <UserPlus className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-4">
                Bu komisyona henüz üye kontenjanı tanımlanmamış.
              </p>
              <Button
                className="gap-2 text-xs px-4 py-2 h-auto bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                onClick={() => setIsAddingUye(true)}
              >
                <Plus className="w-3.5 h-3.5" />
                İlk Kontenjanı Oluştur
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <PersonelAtaModal
        isOpen={isAtaModalOpen}
        onClose={() => {
          setIsAtaModalOpen(false)
          setAtaRoleId(null)
          queryClient.invalidateQueries({
            queryKey: ['komisyon_detay', komisyonId]
          })
        }}
        roleId={ataRoleId}
        komisyonId={komisyonId}
      />
    </div>
  )
}
