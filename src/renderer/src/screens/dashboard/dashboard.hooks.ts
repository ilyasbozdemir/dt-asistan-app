import { useState, useEffect, useCallback } from 'react'

export interface DashboardStats {
  ihaleDosyaSayisi: number
  ihalelereSecilenFirmaSayisi: number
  ihalelereKatilanFirmaSayisi: number
  ihaleEdilenMalzemeSayisi: number
  kayitliFirmaSayisi: number
  kayitliPersonelSayisi: number
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    ihaleDosyaSayisi: 0,
    ihalelereSecilenFirmaSayisi: 0,
    ihalelereKatilanFirmaSayisi: 0,
    ihaleEdilenMalzemeSayisi: 0,
    kayitliFirmaSayisi: 0,
    kayitliPersonelSayisi: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  const loadStats = useCallback(async () => {
    setIsLoading(true)
    try {
      // 1. İhale dosya sayısı
      const dosyaRes = await window.electron.ipcRenderer.invoke('db:query', 'SELECT COUNT(*) as count FROM DATA_TeminDosyasi')
      const ihaleDosyaSayisi = dosyaRes.data[0]?.count || 0

      // 2. Kayıtlı Firma Sayısı
      const firmaRes = await window.electron.ipcRenderer.invoke('db:query', 'SELECT COUNT(*) as count FROM TANIM_Firma')
      const kayitliFirmaSayisi = firmaRes.data[0]?.count || 0

      // 3. Kayıtlı Personel Sayısı
      const personelRes = await window.electron.ipcRenderer.invoke('db:query', 'SELECT COUNT(*) as count FROM TANIM_Personel')
      const kayitliPersonelSayisi = personelRes.data[0]?.count || 0

      // Mock Data for unimplemented tables
      // If there's a table for items in a file, we could count them. Currently we don't have them.
      const ihaleEdilenMalzemeSayisi = 65
      const ihalelereSecilenFirmaSayisi = 60
      const ihalelereKatilanFirmaSayisi = 0

      setStats({
        ihaleDosyaSayisi,
        ihalelereSecilenFirmaSayisi,
        ihalelereKatilanFirmaSayisi,
        ihaleEdilenMalzemeSayisi,
        kayitliFirmaSayisi,
        kayitliPersonelSayisi
      })
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  return { stats, isLoading, refetch: loadStats }
}
