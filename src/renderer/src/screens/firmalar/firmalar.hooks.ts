import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Firma {
  id: number
  firma_kodu: string
  unvan: string
  ilgili_adi: string
  uyrugu: string
  istigal_konusu: string
  adres: string
  ilce: string
  posta_kodu: string
  il: string
  telefon: string
  faks: string
  email: string
  web_adresi: string
  banka_adi: string
  sube_kodu_adi: string
  hesap_no: string
  tc_kimlik_no: string
  dogum_tarihi: string
  vergi_dairesi: string
  vergi_no: string
  aktif_mi: number
  created_at: string
}

export type FirmaInput = Omit<Firma, 'id' | 'aktif_mi' | 'created_at'>

const fetchFirmalar = async (): Promise<Firma[]> => {
  const res = await window.electron.ipcRenderer.invoke(
    'db:query',
    'SELECT * FROM TANIM_Firma ORDER BY unvan ASC'
  )
  if (!res.success) throw new Error(res.error)
  return res.data
}

export function useFirmalarHooks() {
  const queryClient = useQueryClient()

  const { data: firmalar = [], isLoading: isLoadingFirmalar } = useQuery({
    queryKey: ['firmalar'],
    queryFn: fetchFirmalar
  })

  const addFirmaMutation = useMutation({
    mutationFn: async (firma: FirmaInput) => {
      const cols = [
        'firma_kodu', 'unvan', 'ilgili_adi', 'uyrugu', 'istigal_konusu',
        'adres', 'ilce', 'posta_kodu', 'il', 'telefon', 'faks', 'email',
        'web_adresi', 'banka_adi', 'sube_kodu_adi', 'hesap_no',
        'tc_kimlik_no', 'dogum_tarihi', 'vergi_dairesi', 'vergi_no'
      ]
      const placeholders = cols.map(() => '?').join(', ')
      const values = cols.map((col) => (firma as any)[col] || '')
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        `INSERT INTO TANIM_Firma (${cols.join(', ')}) VALUES (${placeholders})`,
        values
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['firmalar'] })
  })

  const updateFirmaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<FirmaInput> }) => {
      const entries = Object.entries(data).filter(([, v]) => v !== undefined)
      if (entries.length === 0) return
      const setClause = entries.map(([k]) => `${k} = ?`).join(', ')
      const values = [...entries.map(([, v]) => v), id]
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        `UPDATE TANIM_Firma SET ${setClause} WHERE id = ?`,
        values
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['firmalar'] })
  })

  const deleteFirmaMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM TANIM_Firma WHERE id = ?',
        [id]
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['firmalar'] })
  })

  return {
    firmalar,
    isLoadingFirmalar,
    addFirma: addFirmaMutation.mutateAsync,
    updateFirma: updateFirmaMutation.mutateAsync,
    deleteFirma: deleteFirmaMutation.mutateAsync
  }
}
