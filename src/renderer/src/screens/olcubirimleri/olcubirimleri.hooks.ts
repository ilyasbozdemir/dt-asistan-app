import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface OlcuBirimi {
  id: number
  ad: string
  aktif_mi: number
  created_at: string
}

export function useOlcuBirimleri() {
  return useQuery({
    queryKey: ['olcu-birimleri'],
    queryFn: async (): Promise<OlcuBirimi[]> => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_OlcuBirimi ORDER BY ad ASC'
      )
      if (!res.success) throw new Error(res.error)
      return res.data
    }
  })
}

export function useSaveOlcuBirimi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (birim: Partial<OlcuBirimi>) => {
      let res
      if (birim.id) {
        // Update
        res = await window.electron.ipcRenderer.invoke(
          'db:run',
          'UPDATE TANIM_OlcuBirimi SET ad = ?, aktif_mi = ? WHERE id = ?',
          [birim.ad, birim.aktif_mi ?? 1, birim.id]
        )
      } else {
        // Insert
        res = await window.electron.ipcRenderer.invoke(
          'db:run',
          'INSERT INTO TANIM_OlcuBirimi (ad, aktif_mi) VALUES (?, ?)',
          [birim.ad, birim.aktif_mi ?? 1]
        )
      }
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['olcu-birimleri'] })
    }
  })
}

export function useDeleteOlcuBirimi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM TANIM_OlcuBirimi WHERE id = ?',
        [id]
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['olcu-birimleri'] })
    }
  })
}
