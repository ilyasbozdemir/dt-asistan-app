import { TeminDosyasi } from '../screens/dosyalar/dosyalar.hooks'
import { emitAppEvent } from './appEvents'

export interface CloneDosyaResult {
  success: boolean
  newId?: number
  nextTeminNo?: string
  error?: string
  clonedItemCount?: number
}

/**
 * Mevcut Doğrudan Temin Dosyasını Kalemleri, Firmaları ve Komisyonlarıyla Birlikte Klonlar.
 * Yeni dosya numarasını otomatik olarak o yılın en son numarasından +1 olarak atar.
 */
export async function cloneDosyaWithItems(
  eskiDosya: TeminDosyasi,
  dosyalarList: TeminDosyasi[],
  addDosyaFn: (data: Partial<TeminDosyasi>) => Promise<any>
): Promise<CloneDosyaResult> {
  try {
    const currentYear = new Date().getFullYear()
    const targetYear = currentYear
    const yearStr = String(targetYear)

    // 1. O yılın en büyük sıra numarasını hesapla (en son kaçsa + 1)
    let maxSeq = 0

    dosyalarList.forEach((d) => {
      const raw = (d.temin_no || '').trim()
      if (!raw) return
      const parts = raw.split(/[/_ -]+/)
      for (let i = parts.length - 1; i >= 0; i--) {
        const num = parseInt(parts[i], 10)
        if (!isNaN(num) && num !== targetYear && num > 0) {
          if (num > maxSeq) maxSeq = num
          break
        }
      }
    })

    // SQLite veritabanını doğrudan sorgulayarak garantile
    if (window.electron?.ipcRenderer) {
      try {
        const dbRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT temin_no, butce_yili FROM DATA_TeminDosyasi'
        )
        if (dbRes?.success && Array.isArray(dbRes.data)) {
          dbRes.data.forEach((r: any) => {
            const raw = (r.temin_no || '').trim()
            if (!raw) return
            const parts = raw.split(/[/_ -]+/)
            for (let i = parts.length - 1; i >= 0; i--) {
              const num = parseInt(parts[i], 10)
              if (!isNaN(num) && num !== targetYear && num > 0) {
                if (num > maxSeq) maxSeq = num
                break
              }
            }
          })
        }
      } catch (err) {
        console.warn('DB temin_no listeleme uyarısı:', err)
      }
    }

    const nextTeminNo = `${yearStr}/${maxSeq + 1}`

    // 2. Eski dosyanın kalemlerini, firmalarını ve komisyonlarını çek
    let oldItems: any[] = []
    let oldFirms: any[] = []
    let oldCommissions: any[] = []

    if (window.electron?.ipcRenderer && eskiDosya.id) {
      try {
        const [itemsRes, firmsRes, commRes] = await Promise.all([
          window.electron.ipcRenderer.invoke(
            'db:query',
            'SELECT * FROM DATA_TeminKalem WHERE temin_dosya_id = ? ORDER BY id ASC',
            [eskiDosya.id]
          ),
          window.electron.ipcRenderer.invoke(
            'db:query',
            'SELECT * FROM DATA_TeminFirma WHERE temin_dosya_id = ?',
            [eskiDosya.id]
          ),
          window.electron.ipcRenderer.invoke(
            'db:query',
            'SELECT * FROM DATA_TeminKomisyon WHERE temin_dosya_id = ?',
            [eskiDosya.id]
          )
        ])
        if (itemsRes?.success && Array.isArray(itemsRes.data)) oldItems = itemsRes.data
        if (firmsRes?.success && Array.isArray(firmsRes.data)) oldFirms = firmsRes.data
        if (commRes?.success && Array.isArray(commRes.data)) oldCommissions = commRes.data
      } catch (err) {
        console.error('Eski dosya verilerini okuma hatası:', err)
      }
    }

    // 3. Yeni dosya kaydını oluştur
    const newDosyaPayload: any = {
      ...eskiDosya,
      id: undefined,
      temin_no: nextTeminNo,
      butce_yili: targetYear,
      konu: `${eskiDosya.konu || 'Doğrudan Temin'} (Kopya)`,
      dosya_acilis_tarihi: new Date().toISOString().split('T')[0],
      son_teklif_verme_tarihi: '',
      teslim_tarihi: '',
      status: 'devam_ediyor',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Tabloda olmayan join ve UI alanlarını temizle
    delete newDosyaPayload.birim_adi
    delete newDosyaPayload.hazirlayan_ad
    delete newDosyaPayload.onaylayan_ad
    delete newDosyaPayload.sunan_ad
    delete newDosyaPayload.talep_eden_ad
    delete newDosyaPayload.irtibat_ad
    delete newDosyaPayload.firma_sayisi
    delete newDosyaPayload.kalem_sayisi
    delete newDosyaPayload.toplam_tutar
    delete newDosyaPayload.kazanan_firma_adi

    const createRes = await addDosyaFn(newDosyaPayload)
    const newId =
      (createRes as any)?.lastInsertRowid ||
      (createRes as any)?.data?.lastInsertRowid ||
      (createRes as any)?.id

    if (newId && window.electron?.ipcRenderer) {
      // 4. Kalemleri klonla
      for (const it of oldItems) {
        await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO DATA_TeminKalem 
           (temin_dosya_id, kalem_adi, aciklama, birim, miktar, tasinir_kodu, okas_kodu, kdv_orani, tipi)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newId,
            it.kalem_adi || it.malzeme_adi || '',
            it.aciklama || '',
            it.birim || 'Adet',
            it.miktar || 1,
            it.tasinir_kodu || '',
            it.okas_kodu || '',
            it.kdv_orani ?? 20,
            it.tipi || 'Mal'
          ]
        )
      }

      // 5. İstekli firmaları klonla
      for (const f of oldFirms) {
        await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO DATA_TeminFirma 
           (temin_dosya_id, firma_id, unvan, yetkili_ad_soyad, telefon, email, adres, vergi_no, vergi_dairesi)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newId,
            f.firma_id,
            f.unvan,
            f.yetkili_ad_soyad || '',
            f.telefon || '',
            f.email || '',
            f.adres || '',
            f.vergi_no || '',
            f.vergi_dairesi || ''
          ]
        )
      }

      // 6. Komisyon üyelerini klonla
      for (const c of oldCommissions) {
        await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO DATA_TeminKomisyon 
           (temin_dosya_id, komisyon_id, personel_id, ad_soyad, unvan, gorevi, komisyon_turu)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            newId,
            c.komisyon_id || null,
            c.personel_id || null,
            c.ad_soyad || '',
            c.unvan || '',
            c.gorevi || 'Üye',
            c.komisyon_turu || ''
          ]
        )
      }

      // Realtime eventler
      emitAppEvent('dossier:created', { dosyaId: newId })
      emitAppEvent('dossier:updated', { dosyaId: newId })
      emitAppEvent('items:changed', { dosyaId: newId })
      emitAppEvent('workspace:refreshed', {})

      return {
        success: true,
        newId,
        nextTeminNo,
        clonedItemCount: oldItems.length
      }
    }

    return { success: false, error: 'Dosya kaydı veritabanına eklenemedi.' }
  } catch (err: any) {
    console.error('Klonlama motoru hatası:', err)
    return { success: false, error: err.message }
  }
}
