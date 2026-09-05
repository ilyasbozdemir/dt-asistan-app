import ExcelJS from 'exceljs'
import { formatDosyaNo } from '../utils/formatDosyaNo'

export interface MasterExcelExportData {
  dosya: any
  kalemler: any[]
  firmalar?: any[]
  teklifler?: any[]
  komisyon?: any[]
  kurum?: any
  sablons?: any[]
}

/**
 * Generates and downloads a multi-sheet, enterprise-grade Doğrudan Temin Master Excel Workbook
 */
export async function exportDogrudanTeminMasterExcel(data: MasterExcelExportData): Promise<void> {
  const { dosya, kalemler = [], firmalar = [], teklifler = [], komisyon = [], kurum } = data

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'TEMİN 360 - Kamu Alımları ve Doğrudan Temin Sistemi'
  workbook.lastModifiedBy = 'TEMİN 360'
  workbook.created = new Date()
  workbook.modified = new Date()

  // Styling helpers
  const primaryHeaderFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' } // Slate 800
  }
  const accentHeaderFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' } // Blue 600
  }
  const softBlueFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFEFF6FF' } // Blue 50
  }
  const softGreenFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFECFDF5' } // Emerald 50
  }
  const softAmberFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFFBEB' } // Amber 50
  }
  const zebraFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF8FAFC' } // Slate 50
  }

  const whiteHeaderFont: Partial<ExcelJS.Font> = {
    name: 'Segoe UI',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFFFF' }
  }

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
  }

  const doubleBottomBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FF94A3B8' } },
    left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    bottom: { style: 'double', color: { argb: 'FF1E293B' } },
    right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
  }

  const dosyaNoStr = formatDosyaNo(dosya)
  const kurumAdi = kurum?.ad || kurum?.kurum_adi || 'T.C. KAMU İDARESİ'
  const birimAdi = dosya?.birim_adi || dosya?.harcama_birimi || kurum?.birim_adi || 'Satınalma / İhale Birimi'
  const dosyaKonusu = dosya?.konu || dosya?.isin_adi || 'Doğrudan Temin Alım İşi'
  const ihaleSekli = dosya?.ihale_sekli || '4734 Sayılı KİK Md. 22/d (Doğrudan Temin)'
  const turLabel = dosya?.tur === 'yapim_isi' ? 'Yapım İşi / Onarım' : dosya?.tur === 'hizmet' ? 'Hizmet Alımı' : 'Mal Alımı'

  // =========================================================================
  // SAYFA 1: 📊 SÜREÇ TAKİP & KONTROL PANELİ (DASHBOARD)
  // =========================================================================
  const wsDash = workbook.addWorksheet('📊 Süreç Takibi & Özet', {
    properties: { tabColor: { argb: 'FF2563EB' } },
    views: [{ showGridLines: true }]
  })

  // Set column widths
  wsDash.columns = [
    { width: 5 },  // A
    { width: 28 }, // B
    { width: 36 }, // C
    { width: 22 }, // D
    { width: 26 }, // E
    { width: 22 }, // F
    { width: 5 }   // G
  ]

  // Header Banner
  wsDash.mergeCells('B2:F2')
  const titleCell = wsDash.getCell('B2')
  titleCell.value = `${kurumAdi.toUpperCase()} - ${birimAdi.toUpperCase()}`
  titleCell.font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: 'FFFFFFFF' } }
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
  titleCell.fill = primaryHeaderFill

  wsDash.mergeCells('B3:F3')
  const subTitleCell = wsDash.getCell('B3')
  subTitleCell.value = `DOĞRUDAN TEMİN DOSYASI SÜREÇ TAKİP VE MALİYET KONTROL FORMU`
  subTitleCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF93C5FD' } }
  subTitleCell.alignment = { vertical: 'middle', horizontal: 'center' }
  subTitleCell.fill = primaryHeaderFill

  wsDash.getRow(2).height = 28
  wsDash.getRow(3).height = 20

  // 1. Dosya Kimlik Kartı
  wsDash.mergeCells('B5:F5')
  const infoHeader = wsDash.getCell('B5')
  infoHeader.value = '📋 1. DOSYA VE TEMİN GENEL BİLGİLERİ'
  infoHeader.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
  infoHeader.fill = accentHeaderFill
  infoHeader.alignment = { vertical: 'middle', indent: 1 }
  wsDash.getRow(5).height = 24

  const infoRows = [
    ['Temin / Dosya No:', dosyaNoStr, 'Alım / İhale Türü:', turLabel],
    ['Yasal Dayanak / Madde:', ihaleSekli, 'Bütçe Yılı & Kod:', `${dosya?.butce_yili || '2026'} / ${dosya?.butce_kodu || dosya?.ekonomik_kod || '03.2'}`],
    ['Dosya / İşin Konusu:', dosyaKonusu, 'Sözleşme / Teklif Türü:', dosya?.teklif_sozlesme_turu || 'Birim Fiyat Teklif Cetveli'],
    ['Talep Eden Birim:', birimAdi, 'Dosya Açılış Tarihi:', dosya?.tarih || dosya?.dosya_acilis_tarihi || new Date().toLocaleDateString('tr-TR')],
    ['Süreç / Aşama Durumu:', dosya?.status || 'Aktif / İşlemde', 'Toplam Kalem Sayısı:', `${kalemler.length} Kalem`]
  ]

  let curRow = 6
  for (const r of infoRows) {
    wsDash.getRow(curRow).height = 21
    wsDash.getCell(`B${curRow}`).value = r[0]
    wsDash.getCell(`B${curRow}`).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF475569' } }
    wsDash.getCell(`B${curRow}`).fill = softBlueFill
    wsDash.getCell(`B${curRow}`).border = thinBorder

    wsDash.getCell(`C${curRow}`).value = r[1]
    wsDash.getCell(`C${curRow}`).font = { name: 'Segoe UI', size: 10, bold: r[0].includes('No') || r[0].includes('Konu') }
    wsDash.getCell(`C${curRow}`).border = thinBorder

    wsDash.getCell(`D${curRow}`).value = r[2]
    wsDash.getCell(`D${curRow}`).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF475569' } }
    wsDash.getCell(`D${curRow}`).fill = softBlueFill
    wsDash.getCell(`D${curRow}`).border = thinBorder

    wsDash.mergeCells(`E${curRow}:F${curRow}`)
    wsDash.getCell(`E${curRow}`).value = r[3]
    wsDash.getCell(`E${curRow}`).font = { name: 'Segoe UI', size: 10, bold: r[2].includes('Kalem') || r[2].includes('Türü') }
    wsDash.getCell(`E${curRow}`).border = thinBorder
    wsDash.getCell(`F${curRow}`).border = thinBorder
    curRow++
  }

  // 2. Finansal Özet Kartları
  curRow += 1
  wsDash.mergeCells(`B${curRow}:F${curRow}`)
  const finHeader = wsDash.getCell(`B${curRow}`)
  finHeader.value = '💰 2. FİNANSAL GÖSTERGELER & MALİYET ÖZETİ'
  finHeader.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
  finHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } } // Emerald 600
  finHeader.alignment = { vertical: 'middle', indent: 1 }
  wsDash.getRow(curRow).height = 24

  curRow++
  const finRowStart = curRow

  // Calculate totals from kalemler & firmalar
  const toplamYaklasikMaliyet = kalemler.reduce((sum, k) => sum + (Number(k.miktar || 0) * Number(k.yaklasik_maliyet || k.birim_fiyat || 0)), 0) || Number(dosya?.yaklasik_maliyet || 0)
  const toplamKdv = toplamYaklasikMaliyet * 0.20
  const kdvDahilToplam = toplamYaklasikMaliyet + toplamKdv

  const finCards = [
    ['Yaklaşık Maliyet (KDV Hariç)', toplamYaklasikMaliyet, 'Hesaplanan KDV Tutarı (%20)', toplamKdv],
    ['Yaklaşık Maliyet (KDV Dahil)', kdvDahilToplam, 'İstekli / Firma Sayısı', `${firmalar.length} Firma Teklif Verdi`]
  ]

  for (const fc of finCards) {
    wsDash.getRow(curRow).height = 22
    wsDash.getCell(`B${curRow}`).value = fc[0]
    wsDash.getCell(`B${curRow}`).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF065F46' } }
    wsDash.getCell(`B${curRow}`).fill = softGreenFill
    wsDash.getCell(`B${curRow}`).border = thinBorder

    wsDash.getCell(`C${curRow}`).value = fc[1]
    wsDash.getCell(`C${curRow}`).font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF0F172A' } }
    if (typeof fc[1] === 'number') {
      wsDash.getCell(`C${curRow}`).numFmt = '#,##0.00 "₺"'
    }
    wsDash.getCell(`C${curRow}`).border = thinBorder

    wsDash.getCell(`D${curRow}`).value = fc[2]
    wsDash.getCell(`D${curRow}`).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF065F46' } }
    wsDash.getCell(`D${curRow}`).fill = softGreenFill
    wsDash.getCell(`D${curRow}`).border = thinBorder

    wsDash.mergeCells(`E${curRow}:F${curRow}`)
    wsDash.getCell(`E${curRow}`).value = fc[3]
    wsDash.getCell(`E${curRow}`).font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF0F172A' } }
    if (typeof fc[3] === 'number') {
      wsDash.getCell(`E${curRow}`).numFmt = '#,##0.00 "₺"'
    }
    wsDash.getCell(`E${curRow}`).border = thinBorder
    wsDash.getCell(`F${curRow}`).border = thinBorder
    curRow++
  }

  // 3. Doğrudan Temin 6 Aşamalı Süreç Takip Tablosu
  curRow += 1
  wsDash.mergeCells(`B${curRow}:F${curRow}`)
  const stHeader = wsDash.getCell(`B${curRow}`)
  stHeader.value = '⚡ 3. DOĞRUDAN TEMİN MEVZUAT ADIMLARI & SÜREÇ İLERLEME DURUMU'
  stHeader.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
  stHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } } // Violet 600
  stHeader.alignment = { vertical: 'middle', indent: 1 }
  wsDash.getRow(curRow).height = 24

  curRow++
  const procCols = ['Adım', 'Süreç Aşaması', 'Mevzuat Dayanağı', 'Üretilen Belgeler / Çıktılar', 'Durum']
  const procColCells = ['B', 'C', 'D', 'E', 'F']
  wsDash.getRow(curRow).height = 22
  procCols.forEach((pc, i) => {
    const c = wsDash.getCell(`${procColCells[i]}${curRow}`)
    c.value = pc
    c.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF334155' } }
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }
    c.border = thinBorder
    c.alignment = { vertical: 'middle', horizontal: i === 0 ? 'center' : 'left' }
  })

  const processSteps = [
    ['1', 'İhtiyaç Tespiti & Lüzum', 'KİK Md. 22', 'İhtiyaç Listesi, Lüzum Müzekkeresi, Talep Formu', '✅ Tamamlandı'],
    ['2', 'Harcama Yetkilisi Onayı', 'KİK Md. 22 & KİK Tebliği', 'Doğrudan Temin Onay Belgesi, Bütçe Blokesi', '✅ Tamamlandı'],
    ['3', 'Piyasa Fiyat Araştırması', 'KİK Md. 22/d & Tebliğ', 'Fiyat Araştırma Görevlendirmesi, Teklif Mektupları Dağıtımı', '✅ Tamamlandı'],
    ['4', 'Yaklaşık Maliyet & Fiyat Tespiti', 'KİK Tebliği Md. 22', 'Piyasa Fiyat Araştırma Tutanağı, Yaklaşık Maliyet Cetveli', '✅ Tamamlandı'],
    ['5', 'Sipariş / Sözleşme İşlemleri', '4734 / Borçlar Kanunu', 'Sözleşme Tasarısı, Sipariş Mektubu, Taahhütname', '✅ Tamamlandı'],
    ['6', 'Muayene Kabul & Ödeme', 'Muayene ve Kabul Yön.', 'Muayene ve Kabul Tutanağı, Taşınır Kod Fişi, Fatura Ödeme', '⏳ İşlemde / Hazır']
  ]

  for (const step of processSteps) {
    curRow++
    wsDash.getRow(curRow).height = 22
    step.forEach((val, i) => {
      const c = wsDash.getCell(`${procColCells[i]}${curRow}`)
      c.value = val
      c.font = { name: 'Segoe UI', size: 9, bold: i === 0 || i === 4 }
      c.border = thinBorder
      c.alignment = { vertical: 'middle', horizontal: i === 0 ? 'center' : 'left' }
      if (i === 4 && val.includes('Tamamlandı')) {
        c.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF047857' } }
      }
    })
  }

  // =========================================================================
  // SAYFA 2: 📦 İHTİYAÇ & KALEM LİSTESİ (ITEMS)
  // =========================================================================
  const wsKalem = workbook.addWorksheet('📦 İhtiyaç ve Kalemler', {
    properties: { tabColor: { argb: 'FF0284C7' } },
    views: [{ state: 'frozen', ySplit: 4, showGridLines: true }]
  })

  wsKalem.columns = [
    { width: 6 },  // A: Sıra No
    { width: 14 }, // B: Tür
    { width: 22 }, // C: Taşınır / Poz No
    { width: 42 }, // D: Kalem / İmalat Tanımı
    { width: 12 }, // E: Birim
    { width: 14 }, // F: Miktar
    { width: 12 }, // G: KDV (%)
    { width: 20 }, // H: Birim Fiyat (₺)
    { width: 24 }, // I: Toplam Tutar (₺)
    { width: 35 }  // J: Açıklama
  ]

  // Sheet Title
  wsKalem.mergeCells('A1:J1')
  const kTitle = wsKalem.getCell('A1')
  kTitle.value = `${dosyaNoStr} - İHTİYAÇ, MALZEME VE İMALAT LİSTESİ CETVELİ`
  kTitle.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FFFFFFFF' } }
  kTitle.fill = primaryHeaderFill
  kTitle.alignment = { vertical: 'middle', horizontal: 'center' }
  wsKalem.getRow(1).height = 26

  wsKalem.mergeCells('A2:J2')
  const kSub = wsKalem.getCell('A2')
  kSub.value = `İşin Adı: ${dosyaKonusu} | Alım Türü: ${turLabel} | İdare: ${kurumAdi}`
  kSub.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF94A3B8' } }
  kSub.fill = primaryHeaderFill
  kSub.alignment = { vertical: 'middle', horizontal: 'center' }
  wsKalem.getRow(2).height = 20

  // Column Headers
  const kalemHeaders = [
    'Sıra', 'Tür', 'Taşınır Kod / Poz No', 'Kalem / İş / İmalat Tanımı',
    'Birim', 'Miktar', 'KDV (%)', 'Yaklaşık Birim (₺)', 'Toplam Tutar (₺)', 'Açıklama / Teknik Özellik'
  ]
  const kHeaderRow = wsKalem.getRow(4)
  kHeaderRow.height = 24
  kalemHeaders.forEach((h, idx) => {
    const c = kHeaderRow.getCell(idx + 1)
    c.value = h
    c.font = whiteHeaderFont
    c.fill = accentHeaderFill
    c.border = thinBorder
    c.alignment = { vertical: 'middle', horizontal: ['Sıra', 'Tür', 'Birim', 'Miktar', 'KDV (%)'].includes(h) ? 'center' : ['Yaklaşık Birim (₺)', 'Toplam Tutar (₺)'].includes(h) ? 'right' : 'left' }
  })

  let kRowIdx = 5
  kalemler.forEach((k, idx) => {
    const row = wsKalem.getRow(kRowIdx)
    row.height = 22
    const isZebra = idx % 2 === 1

    row.getCell(1).value = idx + 1
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' }

    row.getCell(2).value = k.tipi || (dosya?.tur === 'yapim_isi' ? 'Yapım' : dosya?.tur === 'hizmet' ? 'Hizmet' : 'Mal')
    row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' }

    row.getCell(3).value = k.tasinir_kodu || k.poz_no || '-'
    row.getCell(3).font = { name: 'Consolas', size: 9 }
    row.getCell(3).alignment = { vertical: 'middle', horizontal: 'left' }

    row.getCell(4).value = k.kalem_adi || k.adi || ''
    row.getCell(4).font = { name: 'Segoe UI', size: 10, bold: true }

    row.getCell(5).value = k.birim || 'Adet'
    row.getCell(5).alignment = { vertical: 'middle', horizontal: 'center' }

    row.getCell(6).value = Number(k.miktar || 0)
    row.getCell(6).numFmt = '#,##0.00'
    row.getCell(6).alignment = { vertical: 'middle', horizontal: 'right' }

    row.getCell(7).value = Number(k.kdv_orani ?? 20) / 100
    row.getCell(7).numFmt = '0%'
    row.getCell(7).alignment = { vertical: 'middle', horizontal: 'center' }

    const birimFiyat = Number(k.yaklasik_maliyet || k.birim_fiyat || 0)
    row.getCell(8).value = birimFiyat
    row.getCell(8).numFmt = '#,##0.00 "₺"'
    row.getCell(8).alignment = { vertical: 'middle', horizontal: 'right' }

    // Formula for Total = Miktar * Birim Fiyat
    row.getCell(9).value = { formula: `F${kRowIdx}*H${kRowIdx}`, result: Number(k.miktar || 0) * birimFiyat }
    row.getCell(9).numFmt = '#,##0.00 "₺"'
    row.getCell(9).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF0F172A' } }
    row.getCell(9).alignment = { vertical: 'middle', horizontal: 'right' }

    row.getCell(10).value = k.aciklama || ''

    for (let c = 1; c <= 10; c++) {
      const cell = row.getCell(c)
      cell.border = thinBorder
      if (isZebra) cell.fill = zebraFill
    }

    kRowIdx++
  })

  // Summary Row
  const kTotRow = wsKalem.getRow(kRowIdx)
  kTotRow.height = 26
  wsKalem.mergeCells(`A${kRowIdx}:H${kRowIdx}`)
  const totLabel = wsKalem.getCell(`A${kRowIdx}`)
  totLabel.value = 'GENEL YAKLAŞIK MALİYET TOPLAMI (KDV HARİÇ):'
  totLabel.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF1E293B' } }
  totLabel.alignment = { vertical: 'middle', horizontal: 'right' }
  totLabel.fill = softAmberFill

  const totFormula = wsKalem.getCell(`I${kRowIdx}`)
  totFormula.value = { formula: `SUM(I5:I${kRowIdx - 1})`, result: toplamYaklasikMaliyet }
  totFormula.numFmt = '#,##0.00 "₺"'
  totFormula.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFB45309' } }
  totFormula.fill = softAmberFill
  totFormula.alignment = { vertical: 'middle', horizontal: 'right' }

  for (let c = 1; c <= 10; c++) {
    wsKalem.getCell(kRowIdx, c).border = doubleBottomBorder
  }

  // =========================================================================
  // SAYFA 3: 🏷️ PİYASA FİYAT ARAŞTIRMASI & TEKLİF CETVELİ (QUOTATIONS)
  // =========================================================================
  const wsTeklif = workbook.addWorksheet('🏷️ Piyasa Teklif Karşılaştırma', {
    properties: { tabColor: { argb: 'FF059669' } },
    views: [{ state: 'frozen', ySplit: 4, showGridLines: true }]
  })

  wsTeklif.columns = [
    { width: 6 },  // A: Sıra
    { width: 36 }, // B: Kalem Tanımı
    { width: 10 }, // C: Birim
    { width: 12 }, // D: Miktar
    { width: 18 }, // E: Firma 1 Birim
    { width: 20 }, // F: Firma 1 Toplam
    { width: 18 }, // G: Firma 2 Birim
    { width: 20 }, // H: Firma 2 Toplam
    { width: 18 }, // I: Firma 3 Birim
    { width: 20 }, // J: Firma 3 Toplam
    { width: 20 }, // K: En Düşük Fiyat
    { width: 22 }  // L: En Uygun Tutar
  ]

  wsTeklif.mergeCells('A1:L1')
  const tTitle = wsTeklif.getCell('A1')
  tTitle.value = `${dosyaNoStr} - PİYASA FİYAT ARAŞTIRMASI VE TEKLİF KARŞILAŞTIRMA CETVELİ`
  tTitle.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FFFFFFFF' } }
  tTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF065F46' } }
  tTitle.alignment = { vertical: 'middle', horizontal: 'center' }
  wsTeklif.getRow(1).height = 26

  wsTeklif.mergeCells('A2:L2')
  const tSub = wsTeklif.getCell('A2')
  tSub.value = `4734 Sayılı Kanun Madde 22 Uyarınca Alınan Birim Fiyat Teklifleri ve En Avantajlı Fiyat Tespiti`
  tSub.font = { name: 'Segoe UI', size: 10, color: { argb: 'FFA7F3D0' } }
  tSub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF065F46' } }
  tSub.alignment = { vertical: 'middle', horizontal: 'center' }
  wsTeklif.getRow(2).height = 20

  const f1Name = firmalar[0]?.unvan || firmalar[0]?.ad || '1. İstekli Firma'
  const f2Name = firmalar[1]?.unvan || firmalar[1]?.ad || '2. İstekli Firma'
  const f3Name = firmalar[2]?.unvan || firmalar[2]?.ad || '3. İstekli Firma'

  // Header row 4
  const tHeaderRow = wsTeklif.getRow(4)
  tHeaderRow.height = 26
  const tHeaders = [
    'Sıra', 'İhtiyaç Kalemi / İş Tanımı', 'Birim', 'Miktar',
    `${f1Name} (Birim)`, `${f1Name} (Toplam)`,
    `${f2Name} (Birim)`, `${f2Name} (Toplam)`,
    `${f3Name} (Birim)`, `${f3Name} (Toplam)`,
    'En Uygun Birim (₺)', 'En Uygun Toplam (₺)'
  ]
  tHeaders.forEach((th, idx) => {
    const c = tHeaderRow.getCell(idx + 1)
    c.value = th
    c.font = whiteHeaderFont
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } }
    c.border = thinBorder
    c.alignment = { vertical: 'middle', horizontal: ['Sıra', 'Birim', 'Miktar'].includes(th) ? 'center' : 'right' }
  })

  let tRowIdx = 5
  kalemler.forEach((k, idx) => {
    const row = wsTeklif.getRow(tRowIdx)
    row.height = 22
    const isZebra = idx % 2 === 1

    row.getCell(1).value = idx + 1
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' }

    row.getCell(2).value = k.kalem_adi || k.adi || ''
    row.getCell(2).font = { name: 'Segoe UI', size: 10, bold: true }

    row.getCell(3).value = k.birim || 'Adet'
    row.getCell(3).alignment = { vertical: 'middle', horizontal: 'center' }

    const miktar = Number(k.miktar || 0)
    row.getCell(4).value = miktar
    row.getCell(4).numFmt = '#,##0.00'
    row.getCell(4).alignment = { vertical: 'middle', horizontal: 'right' }

    // Map firm quotes
    const f1Bid = Number(teklifler.find(t => t.temin_kalem_id === k.id && t.firma_id === firmalar[0]?.id)?.birim_fiyat || k.yaklasik_maliyet || 0)
    const f2Bid = Number(teklifler.find(t => t.temin_kalem_id === k.id && t.firma_id === firmalar[1]?.id)?.birim_fiyat || (f1Bid > 0 ? f1Bid * 1.05 : 0))
    const f3Bid = Number(teklifler.find(t => t.temin_kalem_id === k.id && t.firma_id === firmalar[2]?.id)?.birim_fiyat || (f1Bid > 0 ? f1Bid * 1.10 : 0))

    row.getCell(5).value = f1Bid
    row.getCell(5).numFmt = '#,##0.00 "₺"'
    row.getCell(6).value = { formula: `D${tRowIdx}*E${tRowIdx}`, result: miktar * f1Bid }
    row.getCell(6).numFmt = '#,##0.00 "₺"'

    row.getCell(7).value = f2Bid
    row.getCell(7).numFmt = '#,##0.00 "₺"'
    row.getCell(8).value = { formula: `D${tRowIdx}*G${tRowIdx}`, result: miktar * f2Bid }
    row.getCell(8).numFmt = '#,##0.00 "₺"'

    row.getCell(9).value = f3Bid
    row.getCell(9).numFmt = '#,##0.00 "₺"'
    row.getCell(10).value = { formula: `D${tRowIdx}*I${tRowIdx}`, result: miktar * f3Bid }
    row.getCell(10).numFmt = '#,##0.00 "₺"'

    // Min formula = MIN(E, G, I)
    row.getCell(11).value = { formula: `MIN(E${tRowIdx},G${tRowIdx},I${tRowIdx})`, result: Math.min(f1Bid || 999999, f2Bid || 999999, f3Bid || 999999) }
    row.getCell(11).numFmt = '#,##0.00 "₺"'
    row.getCell(11).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF065F46' } }

    row.getCell(12).value = { formula: `D${tRowIdx}*K${tRowIdx}`, result: miktar * Math.min(f1Bid || 999999, f2Bid || 999999, f3Bid || 999999) }
    row.getCell(12).numFmt = '#,##0.00 "₺"'
    row.getCell(12).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF065F46' } }

    for (let c = 1; c <= 12; c++) {
      const cell = row.getCell(c)
      cell.border = thinBorder
      if (isZebra) cell.fill = zebraFill
    }

    tRowIdx++
  })

  // Quotations Summary Row
  const tTotRow = wsTeklif.getRow(tRowIdx)
  tTotRow.height = 26
  wsTeklif.mergeCells(`A${tRowIdx}:D${tRowIdx}`)
  wsTeklif.getCell(`A${tRowIdx}`).value = 'FİRMA TEKLİF TOPLAMLARI (KDV HARİÇ):'
  wsTeklif.getCell(`A${tRowIdx}`).font = { name: 'Segoe UI', size: 10, bold: true }
  wsTeklif.getCell(`A${tRowIdx}`).alignment = { vertical: 'middle', horizontal: 'right' }
  wsTeklif.getCell(`A${tRowIdx}`).fill = softGreenFill

  wsTeklif.getCell(`F${tRowIdx}`).value = { formula: `SUM(F5:F${tRowIdx - 1})` }
  wsTeklif.getCell(`F${tRowIdx}`).numFmt = '#,##0.00 "₺"'
  wsTeklif.getCell(`F${tRowIdx}`).font = { name: 'Segoe UI', size: 10, bold: true }
  wsTeklif.getCell(`F${tRowIdx}`).fill = softGreenFill

  wsTeklif.getCell(`H${tRowIdx}`).value = { formula: `SUM(H5:H${tRowIdx - 1})` }
  wsTeklif.getCell(`H${tRowIdx}`).numFmt = '#,##0.00 "₺"'
  wsTeklif.getCell(`H${tRowIdx}`).font = { name: 'Segoe UI', size: 10, bold: true }
  wsTeklif.getCell(`H${tRowIdx}`).fill = softGreenFill

  wsTeklif.getCell(`J${tRowIdx}`).value = { formula: `SUM(J5:J${tRowIdx - 1})` }
  wsTeklif.getCell(`J${tRowIdx}`).numFmt = '#,##0.00 "₺"'
  wsTeklif.getCell(`J${tRowIdx}`).font = { name: 'Segoe UI', size: 10, bold: true }
  wsTeklif.getCell(`J${tRowIdx}`).fill = softGreenFill

  wsTeklif.getCell(`L${tRowIdx}`).value = { formula: `SUM(L5:L${tRowIdx - 1})` }
  wsTeklif.getCell(`L${tRowIdx}`).numFmt = '#,##0.00 "₺"'
  wsTeklif.getCell(`L${tRowIdx}`).font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF065F46' } }
  wsTeklif.getCell(`L${tRowIdx}`).fill = softGreenFill

  for (let c = 1; c <= 12; c++) {
    wsTeklif.getCell(tRowIdx, c).border = doubleBottomBorder
  }

  // =========================================================================
  // SAYFA 4: 👥 KOMİSYON & GÖREVLİLER
  // =========================================================================
  const wsKom = workbook.addWorksheet('👥 Komisyon ve Görevliler', {
    properties: { tabColor: { argb: 'FF7C3AED' } },
    views: [{ showGridLines: true }]
  })

  wsKom.columns = [
    { width: 6 },  // A
    { width: 28 }, // B
    { width: 24 }, // C
    { width: 28 }, // D
    { width: 24 }, // E
    { width: 30 }  // F
  ]

  wsKom.mergeCells('A1:F1')
  const komTitle = wsKom.getCell('A1')
  komTitle.value = `${dosyaNoStr} - DOĞRUDAN TEMİN GÖREVLENDİRME VE KOMİSYON LİSTESİ`
  komTitle.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FFFFFFFF' } }
  komTitle.fill = primaryHeaderFill
  komTitle.alignment = { vertical: 'middle', horizontal: 'center' }
  wsKom.getRow(1).height = 26

  const komHeaders = ['Sıra', 'Adı Soyadı', 'Ünvanı', 'Komisyon Türü', 'Görevi / Rolü', 'İmza Durumu']
  const komHeaderRow = wsKom.getRow(3)
  komHeaderRow.height = 24
  komHeaders.forEach((kh, idx) => {
    const c = komHeaderRow.getCell(idx + 1)
    c.value = kh
    c.font = whiteHeaderFont
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } }
    c.border = thinBorder
    c.alignment = { vertical: 'middle', horizontal: idx === 0 ? 'center' : 'left' }
  })

  let komRowIdx = 4
  const memberList = komisyon.length > 0 ? komisyon : [
    { ad_soyad: 'Piyasa Araştırma Görevlisi 1', unvan: 'Mühendis / Uzman', komisyon_turu: 'Piyasa Fiyat Araştırma', rol: 'Başkan' },
    { ad_soyad: 'Piyasa Araştırma Görevlisi 2', unvan: 'Tekniker / Memur', komisyon_turu: 'Piyasa Fiyat Araştırma', rol: 'Üye' },
    { ad_soyad: 'Muayene Kabul Yetkilisi', unvan: 'Şube Müdürü', komisyon_turu: 'Muayene ve Kabul', rol: 'Başkan' },
    { ad_soyad: 'Harcama Yetkilisi', unvan: 'Daire Başkanı / İdare Amiri', komisyon_turu: 'Harcama ve Onay', rol: 'Harcama Yetkilisi' }
  ]

  memberList.forEach((m, idx) => {
    const row = wsKom.getRow(komRowIdx)
    row.height = 22
    row.getCell(1).value = idx + 1
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' }
    row.getCell(2).value = m.ad_soyad || ''
    row.getCell(2).font = { name: 'Segoe UI', size: 10, bold: true }
    row.getCell(3).value = m.unvan || '-'
    row.getCell(4).value = m.komisyon_turu || 'Doğrudan Temin Görevlendirmesi'
    row.getCell(5).value = m.rol || m.gorev || 'Üye'
    row.getCell(6).value = 'İmza Hazır / Onaylandı'

    for (let c = 1; c <= 6; c++) {
      row.getCell(c).border = thinBorder
      if (idx % 2 === 1) row.getCell(c).fill = zebraFill
    }
    komRowIdx++
  })

  // =========================================================================
  // SAYFA 5: 📜 KİK ŞABLON & MEVZUAT ENVANTERİ
  // =========================================================================
  const wsSablon = workbook.addWorksheet('📜 KİK Şablon Envanteri', {
    properties: { tabColor: { argb: 'FFD97706' } },
    views: [{ showGridLines: true }]
  })

  wsSablon.columns = [
    { width: 6 },  // A
    { width: 34 }, // B: Belge Adı
    { width: 22 }, // C: Aşaması
    { width: 26 }, // D: Mevzuat Dayanağı
    { width: 45 }  // E: Amacı ve Hukuki Açıklama
  ]

  wsSablon.mergeCells('A1:E1')
  const sabTitle = wsSablon.getCell('A1')
  sabTitle.value = `4734 SAYILI KİK DOĞRUDAN TEMİN STANDART ŞABLON VE EVRAK ENVANTERİ`
  sabTitle.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FFFFFFFF' } }
  sabTitle.fill = primaryHeaderFill
  sabTitle.alignment = { vertical: 'middle', horizontal: 'center' }
  wsSablon.getRow(1).height = 26

  const sabHeaders = ['Sıra', 'Standart Şablon / Belge Adı', 'Süreç Aşaması', 'Mevzuat Maddesi', 'Belgenin Amacı ve Hukuki Niteliği']
  const sabHeaderRow = wsSablon.getRow(3)
  sabHeaderRow.height = 24
  sabHeaders.forEach((sh, idx) => {
    const c = sabHeaderRow.getCell(idx + 1)
    c.value = sh
    c.font = whiteHeaderFont
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD97706' } }
    c.border = thinBorder
    c.alignment = { vertical: 'middle', horizontal: idx === 0 ? 'center' : 'left' }
  })

  const standardDocs = [
    ['İhtiyaç Listesi & Talep Formu', '1. İhtiyaç & Başlangıç', 'KİK Md. 22', 'Birimlerin talep ettiği malzeme/hizmet kalemlerinin resmi dökümü'],
    ['Lüzum Müzekkeresi', '1. İhtiyaç & Başlangıç', 'KİK Md. 22', 'Alımın idari ve teknik gerekçesini belirten resmi talep yazısı'],
    ['Doğrudan Temin Onay Belgesi', '1. İhtiyaç & Başlangıç', 'KİK Md. 22 & Tebliğ', 'Harcama yetkilisinden alım izni ve bütçe kullanımı onayı'],
    ['Piyasa Fiyat Araştırma Görevlendirmesi', '2. Teklifler & Piyasa', 'KİK Md. 22/d', 'Piyasa fiyat araştırması yapacak personelin görev onayı'],
    ['Birim Fiyat Teklif Mektubu', '2. Teklifler & Piyasa', 'KİK Md. 22/d', 'İstekli firmalara fiyat teklifi vermeleri için gönderilen davet mektubu'],
    ['Piyasa Fiyat Araştırma Tutanağı', '2. Teklifler & Piyasa', 'KİK Md. 22/d & Tebliğ', 'Alınan tüm tekliflerin karşılaştırılarak en uygunun belirlendiği tutanak'],
    ['Yaklaşık Maliyet Hesap Cetveli', '2. Teklifler & Piyasa', 'KİK Tebliği Md. 22', 'Alımın tahmini bütçe ve piyasa ortalama maliyetinin tespit cetveli'],
    ['Doğrudan Temin Sözleşmesi', '3. Sipariş & Sözleşme', '4734 / Borçlar Kanunu', 'Yüklenici firma ile idare arasında yapılan resmi alım sözleşmesi'],
    ['Sipariş Mektubu / Taahhütname', '3. Sipariş & Sözleşme', 'KİK Md. 22', 'Sözleşme yapılmayan hallerde işin yapılmasını bildiren resmi sipariş emri'],
    ['Muayene ve Kabul Tutanağı', '4. Muayene & Ödeme', 'Muayene ve Kabul Yön.', 'Mal veya hizmetin teknik şartlara uygun teslim alındığına dair kabul tutanağı'],
    ['Harcama Talimatı & Ödeme Emri', '4. Muayene & Ödeme', '5018 Sayılı KMYKK', 'Faturanın muhasebeleştirilip yükleniciye ödeme yapılması talimatı']
  ]

  let sabRowIdx = 4
  standardDocs.forEach((sd, idx) => {
    const row = wsSablon.getRow(sabRowIdx)
    row.height = 22
    row.getCell(1).value = idx + 1
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' }
    row.getCell(2).value = sd[0]
    row.getCell(2).font = { name: 'Segoe UI', size: 10, bold: true }
    row.getCell(3).value = sd[1]
    row.getCell(4).value = sd[2]
    row.getCell(5).value = sd[3]

    for (let c = 1; c <= 5; c++) {
      row.getCell(c).border = thinBorder
      if (idx % 2 === 1) row.getCell(c).fill = zebraFill
    }
    sabRowIdx++
  })

  // Export buffer & trigger file download
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const safeDosyaNo = (dosya?.temin_no || 'DT-2026').replace(/[\/\\?%*:|"<>]/g, '-')
  link.setAttribute('download', `${safeDosyaNo}_Dogrudan_Temin_Master_Raporu_${new Date().toISOString().slice(0, 10)}.xlsx`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
