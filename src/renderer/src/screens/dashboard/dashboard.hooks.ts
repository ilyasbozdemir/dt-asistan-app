/* eslint-disable */
import { useState, useEffect, useCallback } from 'react'
import fallbackAnnouncements from '../../constants/announcements.fallback.json'

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

  // New Metrics
  kayitliBirimSayisi: number
  kayitliAmbarSayisi: number
  aktifDosyaSayisi: number
  tamamlananDosyaSayisi: number
  malDosyaSayisi: number
  hizmetDosyaSayisi: number
  yapimDosyaSayisi: number
  danismanlikDosyaSayisi: number
  enCokSecilenFirma: { unvan: string; count: number } | null
  enCokHarcamaYapanBirim: { birim_adi: string; total: number } | null
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
    ihaleEdilenMalzemeSayisi: 0,
    
    // New Metrics Default Values
    kayitliBirimSayisi: 0,
    kayitliAmbarSayisi: 0,
    aktifDosyaSayisi: 0,
    tamamlananDosyaSayisi: 0,
    malDosyaSayisi: 0,
    hizmetDosyaSayisi: 0,
    yapimDosyaSayisi: 0,
    danismanlikDosyaSayisi: 0,
    enCokSecilenFirma: null,
    enCokHarcamaYapanBirim: null
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

      // 8. İhalelere Katılan Firma Sayısı (Unique firms that have been added/invited to any direct procurement file)
      const katilanFirmaSayisiRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT COUNT(DISTINCT firma_id) as count FROM DATA_TeminFirma'
      )
      const ihalelereKatilanFirmaSayisi = katilanFirmaSayisiRes.data[0]?.count || 0

      // 9. İhale Edilen Malzeme Sayısı (Count from TANIM_Kalem table)
      const malzemeRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT COUNT(*) as count FROM TANIM_Kalem'
      )
      const ihaleEdilenMalzemeSayisi = malzemeRes.data[0]?.count || 0

      // NEW METRICS QUERIES:
      // 10. Kayıtlı Birim Sayısı
      const birimCountRes = await window.electron.ipcRenderer.invoke('db:query', 'SELECT COUNT(*) as count FROM TANIM_Birim')
      const kayitliBirimSayisi = birimCountRes.data[0]?.count || 0

      // 11. Kayıtlı Ambar Sayısı
      const ambarCountRes = await window.electron.ipcRenderer.invoke('db:query', 'SELECT COUNT(*) as count FROM TANIM_Ambar')
      const kayitliAmbarSayisi = ambarCountRes.data[0]?.count || 0

      // 12. Aktif Dosya Sayısı (durum_asama_id < 5 veya null)
      const aktifDosyaCountRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT COUNT(*) as count FROM DATA_TeminDosyasi WHERE durum_asama_id < 5 OR durum_asama_id IS NULL'
      )
      const aktifDosyaSayisi = aktifDosyaCountRes.data[0]?.count || 0

      // 13. Tamamlanan Dosya Sayısı (durum_asama_id = 5)
      const tamamlananDosyaCountRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT COUNT(*) as count FROM DATA_TeminDosyasi WHERE durum_asama_id = 5'
      )
      const tamamlananDosyaSayisi = tamamlananDosyaCountRes.data[0]?.count || 0

      // 14. Dosya Türlerine Göre Sayılar
      const malDosyaCountRes = await window.electron.ipcRenderer.invoke('db:query', "SELECT COUNT(*) as count FROM DATA_TeminDosyasi WHERE tur = 'mal'")
      const malDosyaSayisi = malDosyaCountRes.data[0]?.count || 0

      const hizmetDosyaCountRes = await window.electron.ipcRenderer.invoke('db:query', "SELECT COUNT(*) as count FROM DATA_TeminDosyasi WHERE tur = 'hizmet'")
      const hizmetDosyaSayisi = hizmetDosyaCountRes.data[0]?.count || 0

      const yapimDosyaCountRes = await window.electron.ipcRenderer.invoke('db:query', "SELECT COUNT(*) as count FROM DATA_TeminDosyasi WHERE tur IN ('yapim', 'yapim_isi')")
      const yapimDosyaSayisi = yapimDosyaCountRes.data[0]?.count || 0

      const danismanlikDosyaCountRes = await window.electron.ipcRenderer.invoke('db:query', "SELECT COUNT(*) as count FROM DATA_TeminDosyasi WHERE tur = 'danismanlik'")
      const danismanlikDosyaSayisi = danismanlikDosyaCountRes.data[0]?.count || 0

      // 15. En Çok Seçilen Firma (Kazanan)
      const topFirmaRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT f.unvan, COUNT(*) as count FROM DATA_TeminDosyasi d JOIN TANIM_Firma f ON d.firma_id = f.id WHERE d.firma_id IS NOT NULL GROUP BY d.firma_id ORDER BY count DESC LIMIT 1'
      )
      const enCokSecilenFirma = topFirmaRes.success && topFirmaRes.data?.[0]
        ? { unvan: topFirmaRes.data[0].unvan, count: topFirmaRes.data[0].count }
        : null

      // 16. En Çok Harcama Yapan Birim
      const topBirimRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT b.birim_adi, SUM(d.yaklasik_maliyet) as total FROM DATA_TeminDosyasi d JOIN TANIM_Birim b ON d.birim_id = b.id GROUP BY d.birim_id ORDER BY total DESC LIMIT 1'
      )
      const enCokHarcamaYapanBirim = topBirimRes.success && topBirimRes.data?.[0]
        ? { birim_adi: topBirimRes.data[0].birim_adi, total: topBirimRes.data[0].total || 0 }
        : null

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
        ihaleEdilenMalzemeSayisi,
        
        // New Metrics
        kayitliBirimSayisi,
        kayitliAmbarSayisi,
        aktifDosyaSayisi,
        tamamlananDosyaSayisi,
        malDosyaSayisi,
        hizmetDosyaSayisi,
        yapimDosyaSayisi,
        danismanlikDosyaSayisi,
        enCokSecilenFirma,
        enCokHarcamaYapanBirim
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
        
        // Count invited/participating firms in DATA_TeminFirma for this dossier
        const katilanFirmaSayisiRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT COUNT(*) as count FROM DATA_TeminFirma WHERE temin_dosya_id = ?',
          [activeDosyaId]
        )
        const katilanFirmaSayisi = katilanFirmaSayisiRes.data?.[0]?.count || 0

        // Count items in DATA_TeminKalem for this dossier
        const malzemeSayisiRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT COUNT(*) as count FROM DATA_TeminKalem WHERE temin_dosya_id = ?',
          [activeDosyaId]
        )
        const malzemeSayisi = malzemeSayisiRes.data?.[0]?.count || 0

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

export interface Announcement {
  id: number
  title: string
  content: string
  date: string
  type: 'info' | 'success' | 'warning' | 'error'
}

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadAnnouncements = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch from GitHub raw URL
      const response = await fetch('https://raw.githubusercontent.com/ilyas-bozdemir/dt-desktop-app/main/docs/announcements.json')
      if (!response.ok) {
        throw new Error('Server returned non-200 response')
      }
      const data = await response.json()
      if (Array.isArray(data)) {
        setAnnouncements(data)
      } else {
        throw new Error('Announcements data is not an array')
      }
    } catch (error) {
      console.warn('Failed to fetch remote announcements, using local fallback:', error)
      setAnnouncements(fallbackAnnouncements as Announcement[])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAnnouncements()
  }, [loadAnnouncements])

  return { announcements, isLoading, refetch: loadAnnouncements }
}
