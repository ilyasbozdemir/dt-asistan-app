import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Personel {
  id: number
  ad_soyad: string
  unvan: string | null
  birim: string | null
  sicil_no: string | null
  telefon: string | null
  eposta: string | null
  ihale_yetkilisi_mi: number
  harcama_yetkilisi_mi: number
  aktif_mi: number
  notlar: string | null
}

const fetchPersonel = async (): Promise<Personel[]> => {
  const res = await window.electron.ipcRenderer.invoke(
    'db:query',
    'SELECT * FROM TANIM_Personel ORDER BY id DESC'
  )
  if (!res.success) throw new Error(res.error)
  return res.data
}

export function usePersonelHooks() {
  const queryClient = useQueryClient()

  const { data: personelList = [], isLoading } = useQuery({
    queryKey: ['personel'],
    queryFn: fetchPersonel
  })

  const addPersonelMutation = useMutation({
    mutationFn: async (personel: Partial<Personel>) => {
      const sql = `INSERT INTO TANIM_Personel (ad_soyad, unvan, birim, sicil_no, telefon, eposta, ihale_yetkilisi_mi, harcama_yetkilisi_mi, aktif_mi) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      const params = [
        personel.ad_soyad,
        personel.unvan || null,
        personel.birim || null,
        personel.sicil_no || null,
        personel.telefon || null,
        personel.eposta || null,
        personel.ihale_yetkilisi_mi || 0,
        personel.harcama_yetkilisi_mi || 0,
        personel.aktif_mi !== undefined ? personel.aktif_mi : 1
      ]
      const res = await window.electron.ipcRenderer.invoke('db:run', sql, params)
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel'] })
    }
  })

  const updatePersonelMutation = useMutation({
    mutationFn: async (personel: Partial<Personel> & { id: number }) => {
      const sql = `UPDATE TANIM_Personel SET ad_soyad = ?, unvan = ?, birim = ?, sicil_no = ?, telefon = ?, eposta = ?, ihale_yetkilisi_mi = ?, harcama_yetkilisi_mi = ?, aktif_mi = ? WHERE id = ?`
      const params = [
        personel.ad_soyad,
        personel.unvan || null,
        personel.birim || null,
        personel.sicil_no || null,
        personel.telefon || null,
        personel.eposta || null,
        personel.ihale_yetkilisi_mi || 0,
        personel.harcama_yetkilisi_mi || 0,
        personel.aktif_mi !== undefined ? personel.aktif_mi : 1,
        personel.id
      ]
      const res = await window.electron.ipcRenderer.invoke('db:run', sql, params)
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel'] })
    }
  })

  const deletePersonelMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM TANIM_Personel WHERE id = ?',
        [id]
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel'] })
    }
  })

  return {
    personelList,
    isLoading,
    addPersonel: addPersonelMutation.mutateAsync,
    updatePersonel: updatePersonelMutation.mutateAsync,
    deletePersonel: deletePersonelMutation.mutateAsync
  }
}
