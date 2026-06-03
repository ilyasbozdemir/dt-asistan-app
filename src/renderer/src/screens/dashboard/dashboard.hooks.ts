/* eslint-disable */
import { useState, useEffect, useCallback } from 'react'

export interface DashboardStats {
  ihaleDosyaSayisi: number
  kayitliFirmaSayisi: number
  kayitliPersonelSayisi: number
  toplamYaklasikMaliyet: number
  malYaklasikMaliyet: number
  hizmetYaklasikMaliyet: number
  yapimYaklasikMaliyet: number
  danismanlikYaklasikMaliyet: number
  aylikHarcamalar: { ay: string; tutar: number }[]
  ihalelereSecilenFirmaSayisi: number
  ihalelereKatilanFirmaSayisi: number
  ihaleEdilenMalzemeSayisi: number
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    ihaleDosyaSayisi: 0,
    kayitliFirmaSayisi: 0,
    kayitliPersonelSayisi: 0,
    toplamYaklasikMaliyet: 0,
    malYaklasikMaliyet: 0,
    hizmetYaklasikMaliyet: 0,
    yapimYaklasikMaliyet: 0,
    danismanlikYaklasikMaliyet: 0,
    aylikHarcamalar: [],
    ihalelereSecilenFirmaSayisi: 0,
    ihalelereKatilanFirmaSayisi: 0,
    ihaleEdilenMalzemeSayisi: 0
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

      // 4. Toplam Yaklaşık Maliyet
      const toplamMaliyetRes = await window.electron.ipcRenderer.invoke('db:query', 'SELECT SUM(yaklasik_maliyet) as total FROM DATA_TeminDosyasi')
      const toplamYaklasikMaliyet = toplamMaliyetRes.data[0]?.total || 0

      // 5. Türlere Göre Yaklaşık Maliyetler
      const turRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT tur, SUM(yaklasik_maliyet) as total FROM DATA_TeminDosyasi GROUP BY tur'
      )
      
      let malYaklasikMaliyet = 0
      let hizmetYaklasikMaliyet = 0
      let yapimYaklasikMaliyet = 0
      let danismanlikYaklasikMaliyet = 0

      if (turRes.success && turRes.data) {
        turRes.data.forEach((row: any) => {
          if (row.tur === 'mal') malYaklasikMaliyet = row.total || 0
          else if (row.tur === 'hizmet') hizmetYaklasikMaliyet = row.total || 0
          else if (row.tur === 'yapim_isi' || row.tur === 'yapim') yapimYaklasikMaliyet = row.total || 0
          else if (row.tur === 'danismanlik') danismanlikYaklasikMaliyet = row.total || 0
        })
      }

      // 6. Aylık Harcamalar
      const aylikRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        "SELECT strftime('%m', created_at) as ay_no, SUM(yaklasik_maliyet) as total FROM DATA_TeminDosyasi GROUP BY ay_no ORDER BY ay_no ASC"
      )
      const aylarTR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
      const aylikHarcamalar = aylarTR.map((ayAd, index) => {
        const key = (index + 1).toString().padStart(2, '0')
        const found = aylikRes.success && aylikRes.data ? aylikRes.data.find((r: any) => r.ay_no === key) : null
        return { ay: ayAd, tutar: found ? (found.total || 0) : 0 }
      })

      // 7. İhalelere Seçilen Firma Sayısı (Unique selected firms in all dossiers)
      const secilenFirmaRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT COUNT(DISTINCT firma_id) as count FROM DATA_TeminDosyasi WHERE firma_id IS NOT NULL'
      )
      const ihalelereSecilenFirmaSayisi = secilenFirmaRes.data[0]?.count || 0

      // 8. İhalelere Katılan Firma Sayısı (Placeholder/0 for now since bids/offers table does not exist yet)
      const ihalelereKatilanFirmaSayisi = 0

      // 9. İhale Edilen Malzeme Sayısı (Count from TANIM_Kalem table)
      const malzemeRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT COUNT(*) as count FROM TANIM_Kalem'
      )
      const ihaleEdilenMalzemeSayisi = malzemeRes.data[0]?.count || 0

      setStats({
        ihaleDosyaSayisi,
        kayitliFirmaSayisi,
        kayitliPersonelSayisi,
        toplamYaklasikMaliyet,
        malYaklasikMaliyet,
        hizmetYaklasikMaliyet,
        yapimYaklasikMaliyet,
        danismanlikYaklasikMaliyet,
        aylikHarcamalar,
        ihalelereSecilenFirmaSayisi,
        ihalelereKatilanFirmaSayisi,
        ihaleEdilenMalzemeSayisi
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

export interface ActiveDosyaSummary {
  kurumAdi: string
  kurumTuru: string
  dosyaNo: string
  konu: string
  tur: string
  birimAdi: string
  secilenFirma: string
  katilanFirmaSayisi: number
  malzemeSayisi: number
  yaklasikMaliyet: number
  butceKodu: string
  ihaleSekli: string
  kdv: string
  teklifSozlesmeTuru: string
}

export function useActiveDosyaSummary(activeDosyaId: number | null, institutionName: string, institutionTypeLabel: string) {
  const [summary, setSummary] = useState<ActiveDosyaSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadSummary = useCallback(async () => {
    if (!activeDosyaId) {
      setSummary(null)
      return
    }

    setIsLoading(true)
    try {
      const q = `
        SELECT 
          d.temin_no, d.konu, d.tur, d.yaklasik_maliyet, d.butce_kodu, d.ihale_sekli, d.kdv, d.teklif_sozlesme_turu, d.tekrar_no,
          b.birim_adi,
          f.unvan as firma_unvani
        FROM DATA_TeminDosyasi d
        LEFT JOIN TANIM_Birim b ON d.birim_id = b.id
        LEFT JOIN TANIM_Firma f ON d.firma_id = f.id
        WHERE d.id = ?
      `
      const res = await window.electron.ipcRenderer.invoke('db:query', q, [activeDosyaId])
      
      if (res.success && res.data.length > 0) {
        const row = res.data[0]
        
        const katilanFirmaSayisi = 0 
        const malzemeSayisi = 0

        const formattedKonu = row.tekrar_no && row.tekrar_no > 1
          ? `${row.konu || 'Konu Belirtilmedi'} (${row.tekrar_no})`
          : (row.konu || 'Konu Belirtilmedi')

        setSummary({
          kurumAdi: institutionName,
          kurumTuru: institutionTypeLabel,
          dosyaNo: row.temin_no || 'No Belirtilmedi',
          konu: formattedKonu,
          tur: row.tur || 'mal',
          birimAdi: row.birim_adi || 'Birim Seçilmedi',
          secilenFirma: row.firma_unvani || 'Henüz Seçilmedi',
          katilanFirmaSayisi,
          malzemeSayisi,
          yaklasikMaliyet: row.yaklasik_maliyet || 0,
          butceKodu: row.butce_kodu || '-',
          ihaleSekli: row.ihale_sekli || '-',
          kdv: row.kdv || '20',
          teklifSozlesmeTuru: row.teklif_sozlesme_turu || '-'
        })
      } else {
        setSummary(null)
      }
    } catch (e) {
      console.error('Failed to load active dosya summary', e)
    } finally {
      setIsLoading(false)
    }
  }, [activeDosyaId, institutionName, institutionTypeLabel])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  return { summary, isLoading, refetch: loadSummary }
}
