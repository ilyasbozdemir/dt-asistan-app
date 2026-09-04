import { ipcMain, dialog, BrowserWindow, shell, app } from 'electron'
import { join } from 'path'
import fs from 'fs'
import { renderDocxBuffer } from '../docxService'
import { renderPdfBuffer } from '../pdfService'

export function registerDocumentIpcHandlers(): void {
  // Helper to register both namespaced channel and legacy alias
  const handleDoc = (
    channel: string,
    alias: string,
    handler: (event: any, ...args: any[]) => Promise<any>
  ) => {
    ipcMain.handle(channel, handler)
    if (alias) {
      ipcMain.handle(alias, handler)
    }
  }

  // 1. DOCX Export
  handleDoc('belge:export-docx', 'export-docx', async (_, htmlContent: string, fileName?: string) => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Word (DOCX) Olarak Kaydet',
        defaultPath: fileName ? `${fileName}.docx` : 'Cikti.docx',
        filters: [{ name: 'Word Dosyası', extensions: ['docx'] }]
      })
      if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

      const buffer = await renderDocxBuffer(htmlContent)
      fs.writeFileSync(filePath, buffer)

      return { success: true, filePath }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 2. UDF Export
  handleDoc('belge:export-udf', 'export-udf', async (_, htmlContent: string, fileName?: string) => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'UDF Olarak Kaydet',
        defaultPath: fileName ? `${fileName}.udf` : 'Cikti.udf',
        filters: [{ name: 'UYAP Dokümanı', extensions: ['udf'] }]
      })
      if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

      const stripHtml = htmlContent.replace(/<[^>]+>/g, ' ')
      const udfContent = `<?xml version="1.0" encoding="utf-8"?>\n<Document>\n<content>\n<![CDATA[\n${stripHtml}\n]]>\n</content>\n</Document>`
      fs.writeFileSync(filePath, udfContent, 'utf-8')

      return { success: true, filePath }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 3. Print HTML
  handleDoc('belge:print-html', 'print-html', async (_, htmlContent: string, printOptions?: any) => {
    try {
      const win = new BrowserWindow({ show: false })
      await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)

      await new Promise((resolve) => setTimeout(resolve, 500))

      return await new Promise((resolve) => {
        win.webContents.print(
          { printBackground: true, ...printOptions },
          (success, failureReason) => {
            if (!win.isDestroyed()) {
              win.destroy()
            }
            if (success) {
              resolve({ success: true })
            } else {
              resolve({
                success: false,
                error: failureReason || 'Yazdırma işlemi iptal edildi veya başarısız oldu'
              })
            }
          }
        )
      })
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 4. Preview PDF
  handleDoc('belge:preview-pdf', 'preview-pdf', async (_, htmlContent: string) => {
    try {
      const pdfBuffer = await renderPdfBuffer(htmlContent)
      return { success: true, data: pdfBuffer.toString('base64') }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 5. Open PDF External
  handleDoc('belge:open-pdf-external', 'open-pdf-external', async (_, htmlContent: string) => {
    try {
      const pdfBuffer = await renderPdfBuffer(htmlContent)
      const tempPath = join(app.getPath('temp'), `hakim-pro_preview_${Date.now()}.pdf`)
      fs.writeFileSync(tempPath, pdfBuffer)
      await shell.openPath(tempPath)
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 6. Export HTML
  handleDoc('belge:export-html', 'export-html', async (_, htmlContent: string, options?: { paperSize?: string }, fileName?: string) => {
    try {
      const paperSize = options?.paperSize || 'A4'
      const isA4 = paperSize === 'A4'
      const width = isA4 ? '210mm' : 'auto'

      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'HTML Olarak Kaydet',
        defaultPath: fileName ? `${fileName}.html` : 'Cikti.html',
        filters: [{ name: 'HTML Dosyası', extensions: ['html'] }]
      })
      if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

      const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Belge</title>
  <style>
    @page { size: ${paperSize}; margin: 20mm; }
    body { 
      width: ${width}; 
      margin: 0 auto; 
      font-family: 'Times New Roman', Times, serif; 
      font-size: 12pt;
      line-height: 1.5;
      background: white;
      padding: 0;
      box-sizing: border-box;
    }
    table { border-collapse: collapse; width: 100%; margin-bottom: 1em; table-layout: fixed; }
    td, th { border: 1px solid #000; padding: 6px; }
    th { font-weight: bold; background-color: #f1f5f9; text-align: left; }
    p { margin-bottom: 1em; margin-top: 0; }
    ul { list-style-type: disc; padding-left: 20px; margin-bottom: 1em; }
    ol { list-style-type: decimal; padding-left: 20px; margin-bottom: 1em; }
    h1 { font-size: 16pt; font-weight: bold; margin-bottom: 0.5em; }
    h2 { font-size: 14pt; font-weight: bold; margin-bottom: 0.5em; }
    h3 { font-size: 12pt; font-weight: bold; margin-bottom: 0.5em; }
    @media print {
      body { margin: 0; width: 100%; }
      @page { margin: 20mm; }
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`

      fs.writeFileSync(filePath, fullHtml, 'utf8')
      return { success: true, filePath }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 7. XLSX Export
  handleDoc('belge:export-xlsx', 'export-xlsx', async (_, bufferData: Uint8Array | ArrayBuffer) => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'XLSX Olarak Kaydet',
        defaultPath: 'Tablo.xlsx',
        filters: [{ name: 'Excel Dosyası', extensions: ['xlsx'] }]
      })
      if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

      fs.writeFileSync(filePath, Buffer.from(bufferData as ArrayBuffer))
      return { success: true, filePath }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 8. DOCX Import
  handleDoc('belge:import-docx', 'import-docx', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'DOCX Seç',
        filters: [{ name: 'Word Document', extensions: ['docx'] }],
        properties: ['openFile']
      })
      if (canceled || !filePaths || filePaths.length === 0)
        return { success: false, error: 'İptal edildi' }

      const mammoth = require('mammoth')
      const result = await mammoth.convertToHtml({ path: filePaths[0] })
      return { success: true, html: result.value, messages: result.messages }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 9. XLSX Import
  handleDoc('belge:import-xlsx', 'import-xlsx', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'XLSX Seç',
        filters: [{ name: 'Excel Dosyası', extensions: ['xlsx', 'xls'] }],
        properties: ['openFile']
      })
      if (canceled || !filePaths || filePaths.length === 0)
        return { success: false, error: 'İptal edildi' }

      const buffer = fs.readFileSync(filePaths[0])
      return { success: true, buffer: buffer.buffer }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 10. Open Excel External
  handleDoc('belge:open-excel', 'open-excel', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Excel Dosyası Aç',
        filters: [{ name: 'Excel Dosyası', extensions: ['xlsx', 'xls', 'csv'] }],
        properties: ['openFile']
      })
      if (canceled || !filePaths || filePaths.length === 0)
        return { success: false, error: 'İptal edildi' }

      await shell.openPath(filePaths[0])
      return { success: true, filePath: filePaths[0] }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 11. Complete Document & Stage Data Resolver (Direct Fast Electron SQLite Query)
  handleDoc('belge:get-document-payload', 'get-document-payload', async (_, payload: { dosyaId?: number; documentId?: string }) => {
    try {
      const { workspaceManager } = require('../database/workspace')
      const db = workspaceManager.getDb()
      const dosyaId = Number(payload?.dosyaId || 0)
      const documentId = payload?.documentId || ''

      // 1. Fetch active personnel list
      const personelListesi = db.prepare(
        'SELECT id, ad_soyad, unvan, telefon, eposta FROM TANIM_Personel WHERE aktif_mi = 1 ORDER BY ad_soyad ASC'
      ).all()

      // 2. Fetch institution and app settings
      const kurum = db.prepare('SELECT * FROM TANIM_Kurum LIMIT 1').get() || {}
      let settingsMap: Record<string, string> = {}
      try {
        const settingsRows = db.prepare('SELECT key, value FROM settings').all()
        settingsRows.forEach((r: any) => {
          if (r.key) settingsMap[r.key] = r.value
        })
      } catch {}

      const solLogo = (kurum as any)?.logo_sol || (kurum as any)?.logo_url || settingsMap.logoLeft || settingsMap.institutionLogo || null
      const sagLogo = (kurum as any)?.logo_sag || settingsMap.logoRight || null

      // 3. Fetch file details
      const dosya = dosyaId ? db.prepare('SELECT * FROM DATA_TeminDosyasi WHERE id = ?').get(dosyaId) || {} : {}

      // 4. Fetch items
      const items = dosyaId ? db.prepare('SELECT id, kalem_adi, aciklama, birim, miktar, tasinir_kodu, kdv_orani FROM DATA_TeminKalem WHERE temin_dosya_id = ? ORDER BY id ASC').all(dosyaId) : []

      // 5. Fetch invited firms
      let fileFirms: any[] = []
      if (dosyaId) {
        fileFirms = db.prepare(`
          SELECT 
            df.id as temin_firma_id,
            COALESCE(f.id, df.firma_id, df.id) as id,
            COALESCE(NULLIF(df.unvan, ''), NULLIF(f.unvan, ''), NULLIF(f.firma_adi, ''), NULLIF(df.firma_adi, ''), 'İstekli Firma') as unvan,
            COALESCE(NULLIF(f.yetkili_ad_soyad, ''), NULLIF(df.yetkili_ad_soyad, '')) as yetkili_ad_soyad,
            COALESCE(NULLIF(f.telefon, ''), NULLIF(df.telefon, '')) as telefon,
            COALESCE(NULLIF(f.eposta, ''), NULLIF(df.email, '')) as eposta
          FROM DATA_TeminFirma df
          LEFT JOIN TANIM_Firma f ON df.firma_id = f.id
          WHERE df.temin_dosya_id = ?
          ORDER BY df.id ASC
        `).all(dosyaId)
      }

      // 6. Fetch global firms for fallback/selection
      const globalFirms = db.prepare(
        "SELECT id, unvan, yetkili_ad_soyad, telefon, eposta FROM TANIM_Firma WHERE aktif_mi = 1 AND unvan IS NOT NULL AND unvan != '' ORDER BY unvan ASC"
      ).all()

      // 7. Fetch bids
      const bids = dosyaId ? db.prepare(
        'SELECT temin_kalem_id, temin_firma_id, birim_fiyat FROM DATA_TeminKalemTeklif WHERE temin_dosya_id = ?'
      ).all(dosyaId) : []

      // 8. Fetch commissions
      const komisyonlar = dosyaId ? db.prepare(`
        SELECT tk.*, 
               COALESCE(NULLIF(tk.ad_soyad, ''), NULLIF(p.ad_soyad, ''), '') as resolved_ad_soyad,
               COALESCE(NULLIF(tk.unvan, ''), NULLIF(p.unvan, ''), '') as resolved_unvan,
               COALESCE(k.ad, tk.komisyon_turu) as komisyon_turu_adi
        FROM DATA_TeminKomisyon tk
        LEFT JOIN TANIM_Personel p ON tk.personel_id = p.id
        LEFT JOIN TANIM_Komisyon k ON tk.komisyon_id = k.id
        WHERE tk.temin_dosya_id = ?
      `).all(dosyaId) : []

      // 9. Fetch saved snapshot if exists
      let savedSnapshot: any = null
      if (dosyaId && documentId) {
        const snapRow = db.prepare(`
          SELECT veri_json FROM DATA_DosyaSablonVeri 
          WHERE temin_dosya_id = ? AND sablon_id = (SELECT id FROM TANIM_Sablon WHERE dosya_adi = ? LIMIT 1)
        `).get(dosyaId, `${documentId}.html`)
        if (snapRow?.veri_json) {
          try {
            savedSnapshot = JSON.parse(snapRow.veri_json)
          } catch {}
        }
      }

      // Calculate firm totals & winner
      fileFirms.forEach((firm: any) => {
        let total = 0
        items.forEach((item: any) => {
          const bid = bids.find(
            (b: any) =>
              b.temin_kalem_id === item.id &&
              (b.temin_firma_id === firm.temin_firma_id || b.temin_firma_id === firm.id)
          )
          if (bid && bid.birim_fiyat > 0) {
            total += bid.birim_fiyat * (item.miktar || 0)
          }
        })
        firm.total = total
      })

      const nonZeroTotals = fileFirms.filter((f) => f.total > 0)
      const lowestTotal = nonZeroTotals.length > 0 ? Math.min(...nonZeroTotals.map((f) => f.total)) : 0

      fileFirms.forEach((f) => {
        if (f.total > 0 && f.total === lowestTotal) {
          f.isWinner = true
          const formattedTotal = f.total.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          f.label = `🏆 ${f.unvan} (${formattedTotal} TL - En Düşük Teklif)`
        } else if (f.total > 0) {
          const formattedTotal = f.total.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          f.label = `🏢 ${f.unvan} (${formattedTotal} TL)`
        } else {
          f.label = `🏢 ${f.unvan}`
        }
      })

      fileFirms.sort((a, b) => (b.isWinner ? 1 : 0) - (a.isWinner ? 1 : 0))

      const combinedFirms = [...fileFirms]
      globalFirms.forEach((g: any) => {
        if (
          g.unvan &&
          !combinedFirms.some(
            (f: any) => f.unvan && String(f.unvan).trim().toLowerCase() === String(g.unvan).trim().toLowerCase()
          )
        ) {
          combinedFirms.push(g)
        }
      })

      // Complete Node.js Server-side Document Context Pre-computation
      const winnerFirm = fileFirms.find((f: any) => f.isWinner) || fileFirms[0] || combinedFirms[0] || {}

      const ihtiyacKalemleri = items.map((kalem: any, idx: number) => {
        const miktarNum = Number(kalem.miktar || 0)
        let minPrice = Infinity
        let bestFirmName = ''

        const teklifler = fileFirms.map((firm: any) => {
          const bid = bids.find(
            (b: any) =>
              b.temin_kalem_id === kalem.id &&
              (b.temin_firma_id === firm.temin_firma_id || b.temin_firma_id === firm.id)
          )
          const priceNum = bid ? Number(bid.birim_fiyat || 0) : 0
          if (priceNum > 0 && priceNum < minPrice) {
            minPrice = priceNum
            bestFirmName = firm.unvan || ''
          }
          const formattedPrice =
            priceNum > 0
              ? priceNum.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : ''
          const itemTotalNum = priceNum * miktarNum
          const formattedTutar =
            itemTotalNum > 0
              ? itemTotalNum.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : ''

          return {
            firmaId: firm.id,
            firmaUnvan: firm.unvan,
            birimFiyat: priceNum,
            fiyat: formattedPrice,
            tutar: formattedTutar
          }
        })

        const validMinPrice = minPrice !== Infinity ? minPrice : 0
        const itemCostNum = validMinPrice * miktarNum

        return {
          ...kalem,
          siraNo: idx + 1,
          malzemeAdi: kalem.kalem_adi || '',
          ozelligi: kalem.aciklama || '',
          birimi: kalem.birim || '',
          miktar: miktarNum,
          enUygunFirmaAdi: bestFirmName,
          enDusukFiyat:
            validMinPrice > 0
              ? validMinPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : '-',
          toplamBedel:
            itemCostNum > 0
              ? itemCostNum.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : '-',
          firmaTeklifleri: teklifler,
          firmaTeklifleriDetay: teklifler
        }
      })

      const firmaTotals = fileFirms.map((firm: any) => ({
        firmaId: firm.id,
        unvan: firm.unvan,
        toplam:
          firm.total > 0
            ? firm.total.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : '0,00'
      }))

      let grandTotalNum = 0
      if (winnerFirm && winnerFirm.total > 0) {
        grandTotalNum = winnerFirm.total
      } else {
        grandTotalNum = ihtiyacKalemleri.reduce((sum: number, k: any) => {
          const raw = String(k.toplamBedel).replace(/\./g, '').replace(/,/g, '.')
          const n = parseFloat(raw)
          return sum + (isNaN(n) ? 0 : n)
        }, 0)
      }

      const formattedGrandTotal =
        grandTotalNum > 0
          ? grandTotalNum.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : '0,00'

      const kurumAdi = (kurum as any)?.ad || settingsMap.institutionName || 'T.C. KAMU KURUMU'
      const harcamaBirimi =
        (dosya as any)?.harcama_birimi || settingsMap.spendingUnit || (dosya as any)?.konu || 'HARCAMA BİRİMİ'
      const antetSatirlari = ['T.C.', String(kurumAdi).toUpperCase(), String(harcamaBirimi).toUpperCase()]

      const resolvedContext = {
        kurumAdi,
        harcamaBirimi,
        antetSatirlari,
        solLogo,
        sagLogo,
        dosyaNo: (dosya as any)?.temin_no || '',
        konu: (dosya as any)?.konu || '',
        isinAdi: (dosya as any)?.konu || '',
        isinTanimi: (dosya as any)?.isin_aciklamasi || (dosya as any)?.konu || '',
        yaklasikMaliyet: (dosya as any)?.yaklasik_maliyet
          ? Number((dosya as any).yaklasik_maliyet).toLocaleString('tr-TR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
          : formattedGrandTotal,
        genelToplam: formattedGrandTotal,
        yukleniciFirma: winnerFirm.unvan || '',
        yukleniciYetkili: winnerFirm.yetkili_ad_soyad || '',
        ihtiyacKalemleri,
        firmaListesi: combinedFirms,
        firmalar: fileFirms,
        firmaToplamlari: firmaTotals,
        firmaToplamlariDetay: firmaTotals,
        komisyon: komisyonlar.map((k: any) => ({
          adSoyad: k.resolved_ad_soyad || k.ad_soyad || '',
          unvan: k.resolved_unvan || k.unvan || '',
          gorevi: k.gorevi || 'Üye'
        }))
      }

      return {
        success: true,
        data: {
          dosya,
          kurum,
          solLogo,
          sagLogo,
          settings: settingsMap,
          personelListesi,
          firmaListesi: combinedFirms,
          fileFirms,
          items,
          bids,
          komisyonlar,
          savedSnapshot,
          resolvedContext
        }
      }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })
}
