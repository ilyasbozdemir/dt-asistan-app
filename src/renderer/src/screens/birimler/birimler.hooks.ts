import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Birim {
  id: number
  birim_adi: string
  antet_ek_satir: string
  ihtiyac_yeri_eki: string
  sunum_makami: string
  kurumsal_kod: string
  dtvt_kodu: string
  ayrintili_bilgi_personel: string
  aktif_mi: number
  created_at: string
}

export type BirimInput = Omit<Birim, 'id' | 'aktif_mi' | 'created_at'>

const fetchBirimler = async (): Promise<Birim[]> => {
  const res = await window.electron.ipcRenderer.invoke(
    'db:query',
    'SELECT * FROM TANIM_Birim ORDER BY birim_adi ASC'
  )
  if (!res.success) throw new Error(res.error)
  return res.data
}

export function useBirimlerHooks() {
  const queryClient = useQueryClient()

  const { data: birimler = [], isLoading: isLoadingBirimler } = useQuery({
    queryKey: ['birimler'],
    queryFn: fetchBirimler
  })

  const addBirimMutation = useMutation({
    mutationFn: async (birim: BirimInput) => {
      const cols = [
        'birim_adi', 'antet_ek_satir', 'ihtiyac_yeri_eki',
        'sunum_makami', 'kurumsal_kod', 'dtvt_kodu', 'ayrintili_bilgi_personel'
      ]
      const placeholders = cols.map(() => '?').join(', ')
      const values = cols.map((col) => (birim as any)[col] || '')
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        `INSERT INTO TANIM_Birim (${cols.join(', ')}, aktif_mi) VALUES (${placeholders}, 1)`,
        values
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['birimler'] })
  })

  const updateBirimMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<BirimInput> }) => {
      const entries = Object.entries(data).filter(([, v]) => v !== undefined)
      if (entries.length === 0) return
      const setClause = entries.map(([k]) => `${k} = ?`).join(', ')
      const values = [...entries.map(([, v]) => v), id]
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        `UPDATE TANIM_Birim SET ${setClause} WHERE id = ?`,
        values
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['birimler'] })
  })

  const deleteBirimMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM TANIM_Birim WHERE id = ?',
        [id]
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['birimler'] })
  })

  return {
    birimler,
    isLoadingBirimler,
    addBirim: addBirimMutation.mutateAsync,
    updateBirim: updateBirimMutation.mutateAsync,
    deleteBirim: deleteBirimMutation.mutateAsync
  }
}
