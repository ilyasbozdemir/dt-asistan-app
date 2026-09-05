import ExcelJS from 'exceljs'
import { formatDosyaNo } from '../utils/formatDosyaNo'
import { buildExportFileName } from '../utils/exportFileName'

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
 * 2026 Yılı KİK Doğrudan Temin (22/d) Eşik Değer Sabiti
 */
export const KIK_2026_ESIK_DEGER_TL = 1021827.0

/**
 * Generates and downloads a multi-sheet, enterprise-grade Doğrudan Temin Master Excel Workbook
 */
export async function exportDogrudanTeminMasterExcel(data: MasterExcelExportData): Promise<void> {
  const {
    dosya,
    kalemler = [],
    firmalar = [],
    teklifler = [],
    komisyon = [],
    kurum,
    sablons = []
  } = data

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'TEMİN 360 - Kamu Alımları ve Doğrudan Temin Sistemi'
  workbook.lastModifiedBy = 'TEMİN 360'
  workbook.created = new Date()
  workbook.modified = new Date()

  // Styling helpers
  const primaryHeaderFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F172A' } // Slate 900
  }
  const accentHeaderFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1D4ED8' } // Blue 700
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
  const softPurpleFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF5F3FF' } // Purple 50
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
    bottom: { style: 'double', color: { argb: 'FF0F172A' } },
    right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
  }

  const dosyaNoStr = formatDosyaNo(dosya)
  const kurumAdi = kurum?.ad || kurum?.kurum_adi || 'T.C. KAMU İDARESİ'
  const birimAdi =
    dosya?.birim_adi || dosya?.harcama_birimi || kurum?.birim_adi || 'Satınalma / İhale Birimi'
  const dosyaKonusu = dosya?.konu || dosya?.isin_adi || 'Doğrudan Temin Alım İşi'
  const ihaleSekli = dosya?.ihale_sekli || '4734 Sayılı KİK Md. 22/d (Doğrudan Temin)'
  const turLabel =
    dosya?.tur === 'yapim_isi' || dosya?.tur === 'yapim'
      ? 'Yapım İşi / Onarım'
      : dosya?.tur === 'hizmet'
        ? 'Hizmet Alımı'
        : 'Mal Alımı'

  // Tevkifat orani belirleme
  const isYapim = dosya?.tur === 'yapim_isi' || dosya?.tur === 'yapim'
  const isHizmet = dosya?.tur === 'hizmet'
  const tevkifatOraniText = isYapim ? '4/10' : isHizmet ? '7/10' : '0 (Tevkifatsız)'
  const tevkifatCarpani = isYapim ? 0.4 : isHizmet ? 0.7 : 0.0

  // Calculate totals from kalemler
  const toplamYaklasikMaliyet =
    kalemler.reduce(
      (sum, k) =>
        sum + Number(k.miktar || 0) * Number(k.yaklasik_maliyet || k.birim_fiyat || 0),
      0
    ) || Number(dosya?.yaklasik_maliyet || 0)

  const toplamKdv = toplamYaklasikMaliyet * 0.2
  const kdvDahilToplam = toplamYaklasikMaliyet + toplamKdv
  const tevkifatTutari = toplamKdv * tevkifatCarpani
  const netOdenecekKdvDahil = kdvDahilToplam - tevkifatTutari
  const esikKalanLimit = Math.max(0, KIK_2026_ESIK_DEGER_TL - toplamYaklasikMaliyet)
  const esikKullanimOrani =
    KIK_2026_ESIK_DEGER_TL > 0
      ? (toplamYaklasikMaliyet / KIK_2026_ESIK_DEGER_TL) * 100
      : 0

  // =========================================================================
  // SAYFA 1: 📊 SÜREÇ TAKİP & KONTROL PANELİ (DASHBOARD)
  // =========================================================================
  const wsDash = workbook.addWorksheet('📊 Süreç Takibi & Özet', {
    properties: { tabColor: { argb: 'FF2563EB' } },
    views: [{ showGridLines: true }]
  })

  wsDash.columns = [
    { width: 5 }, // A
    { width: 30 }, // B
    { width: 38 }, // C
    { width: 24 }, // D
    { width: 28 }, // E
    { width: 24 }, // F
    { width: 5 } // G
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
  subTitleCell.value = `4734 SAYILI KİK DOĞRUDAN TEMİN MASTER RAPORU & BÜTÇE KONTROL PANELİ`
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
    [
      'Yasal Dayanak / Madde:',
      ihaleSekli,
      'Bütçe Yılı & Kod:',
      `${dosya?.butce_yili || '2026'} / ${dosya?.butce_kodu || dosya?.ekonomik_kod || '03.2'}`
    ],
    [
      'Dosya / İşin Konusu:',
      dosyaKonusu,
      'Sözleşme / Teklif Türü:',
      dosya?.teklif_sozlesme_turu || 'Birim Fiyat Teklif Cetveli'
    ],
    [
      'Talep Eden Birim:',
      birimAdi,
      'Dosya Açılış Tarihi:',
      dosya?.tarih || dosya?.dosya_acilis_tarihi || new Date().toLocaleDateString('tr-TR')
    ],
    [
      'Süreç / Aşama Durumu:',
      dosya?.status || 'Aktif / İşlemde',
      'Toplam Kalem Sayısı:',
      `${kalemler.length} Kalem`
    ]
  ]

  let curRow = 6
  for (const r of infoRows) {
    wsDash.getRow(curRow).height = 21
    wsDash.getCell(`B${curRow}`).value = r[0]
    wsDash.getCell(`B${curRow}`).font = {
      name: 'Segoe UI',
      size: 10,
      bold: true,
      color: { argb: 'FF475569' }
    }
    wsDash.getCell(`B${curRow}`).fill = softBlueFill
    wsDash.getCell(`B${curRow}`).border = thinBorder

    wsDash.getCell(`C${curRow}`).value = r[1]
    wsDash.getCell(`C${curRow}`).font = {
      name: 'Segoe UI',
      size: 10,
      bold: r[0].includes('No') || r[0].includes('Konu')
    }
    wsDash.getCell(`C${curRow}`).border = thinBorder

    wsDash.getCell(`D${curRow}`).value = r[2]
    wsDash.getCell(`D${curRow}`).font = {
      name: 'Segoe UI',
      size: 10,
      bold: true,
      color: { argb: 'FF475569' }
    }
    wsDash.getCell(`D${curRow}`).fill = softBlueFill
    wsDash.getCell(`D${curRow}`).border = thinBorder

    wsDash.mergeCells(`E${curRow}:F${curRow}`)
    wsDash.getCell(`E${curRow}`).value = r[3]
    wsDash.getCell(`E${curRow}`).font = {
      name: 'Segoe UI',
      size: 10,
      bold: r[2].includes('Kalem') || r[2].includes('Türü')
    }
    wsDash.getCell(`E${curRow}`).border = thinBorder
    wsDash.getCell(`F${curRow}`).border = thinBorder
    curRow++
  }

  // 2. 2026 Yılı KİK Eşik Değer & Bütçe Limit Kontrolü
  curRow += 1
  wsDash.mergeCells(`B${curRow}:F${curRow}`)
  const esikHeader = wsDash.getCell(`B${curRow}`)
  esikHeader.value = '⚖️ 2. 2026 YILI KİK BÜTÇE LİMİTİ & EŞİK DEĞER KONTROLÜ (Md. 22/d)'
  esikHeader.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
  esikHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD97706' } } // Amber 600
  esikHeader.alignment = { vertical: 'middle', indent: 1 }
  wsDash.getRow(curRow).height = 24

  curRow++
  const esikRows = [
    [
      '2026 Güncel Md. 22/d Eşik Değeri:',
      KIK_2026_ESIK_DEGER_TL,
      'Dosya Yaklaşık Maliyet Toplamı:',
      toplamYaklasikMaliyet
    ],
    [
      'Kalan Eşik Değer Limiti:',
      esikKalanLimit,
      'Eşik Değer Kullanım Oranı (%):',
      `${esikKullanimOrani.toFixed(2)}%`
    ],
    [
      'Mevzuat Uygunluk Durumu:',
      toplamYaklasikMaliyet <= KIK_2026_ESIK_DEGER_TL
        ? '✅ Eşik Değer Altında (Doğrudan Temin Uygun)'
        : '⚠️ Eşik Değer Aşımı (İhale Usulü Gereklidir)',
      'Tevkifat Matrisi Uygulaması:',
      `KDV Tevkifatı: ${tevkifatOraniText}`
    ]
  ]

  for (const er of esikRows) {
    wsDash.getRow(curRow).height = 22
    wsDash.getCell(`B${curRow}`).value = er[0]
    wsDash.getCell(`B${curRow}`).font = {
      name: 'Segoe UI',
      size: 10,
      bold: true,
      color: { argb: 'FF92400E' }
    }
    wsDash.getCell(`B${curRow}`).fill = softAmberFill
    wsDash.getCell(`B${curRow}`).border = thinBorder

    wsDash.getCell(`C${curRow}`).value = er[1]
    wsDash.getCell(`C${curRow}`).font = {
      name: 'Segoe UI',
      size: 10,
      bold: true,
      color: typeof er[1] === 'string' && er[1].includes('Aşımı') ? { argb: 'FFDC2626' } : { argb: 'FF0F172A' }
    }
    if (typeof er[1] === 'number') {
      wsDash.getCell(`C${curRow}`).numFmt = '#,##0.00 "₺"'
    }
    wsDash.getCell(`C${curRow}`).border = thinBorder

    wsDash.getCell(`D${curRow}`).value = er[2]
    wsDash.getCell(`D${curRow}`).font = {
      name: 'Segoe UI',
      size: 10,
      bold: true,
      color: { argb: 'FF92400E' }
    }
    wsDash.getCell(`D${curRow}`).fill = softAmberFill
    wsDash.getCell(`D${curRow}`).border = thinBorder

    wsDash.mergeCells(`E${curRow}:F${curRow}`)
    wsDash.getCell(`E${curRow}`).value = er[3]
    wsDash.getCell(`E${curRow}`).font = { name: 'Segoe UI', size: 10, bold: true }
    if (typeof er[3] === 'number') {
      wsDash.getCell(`E${curRow}`).numFmt = '#,##0.00 "₺"'
    }
    wsDash.getCell(`E${curRow}`).border = thinBorder
    wsDash.getCell(`F${curRow}`).border = thinBorder
    curRow++
  }

  // 3. Finansal Göstergeler & Tevkifat Dağılımı
  curRow += 1
  wsDash.mergeCells(`B${curRow}:F${curRow}`)
  const finHeader = wsDash.getCell(`B${curRow}`)
  finHeader.value = '💰 3. FİNANSAL GÖSTERGELER & KDV TEVKİFAT MATRİSİ'
  finHeader.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
  finHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } } // Emerald 600
  finHeader.alignment = { vertical: 'middle', indent: 1 }
  wsDash.getRow(curRow).height = 24

  curRow++
  const finCards = [
    [
      'Yaklaşık Maliyet (KDV Hariç):',
      toplamYaklasikMaliyet,
      'Hesaplanan KDV Tutarı (%20):',
      toplamKdv
    ],
    [
      'Tevkifat Oranı & Çarpanı:',
      tevkifatOraniText,
      'Kesilecek Tevkifat Tutarı:',
      tevkifatTutari
    ],
    [
      'KDV Dahil Toplam Tutar:',
      kdvDahilToplam,
      'Yükleniciye Ödenecek Net Tutar:',
      netOdenecekKdvDahil
    ]
  ]

  for (const fc of finCards) {
    wsDash.getRow(curRow).height = 22
    wsDash.getCell(`B${curRow}`).value = fc[0]
    wsDash.getCell(`B${curRow}`).font = {
      name: 'Segoe UI',
      size: 10,
      bold: true,
      color: { argb: 'FF065F46' }
    }
    wsDash.getCell(`B${curRow}`).fill = softGreenFill
    wsDash.getCell(`B${curRow}`).border = thinBorder

    wsDash.getCell(`C${curRow}`).value = fc[1]
    wsDash.getCell(`C${curRow}`).font = {
      name: 'Segoe UI',
      size: 10,
      bold: true,
      color: { argb: 'FF0F172A' }
    }
    if (typeof fc[1] === 'number') {
      wsDash.getCell(`C${curRow}`).numFmt = '#,##0.00 "₺"'
    }
    wsDash.getCell(`C${curRow}`).border = thinBorder

    wsDash.getCell(`D${curRow}`).value = fc[2]
    wsDash.getCell(`D${curRow}`).font = {
      name: 'Segoe UI',
      size: 10,
      bold: true,
      color: { argb: 'FF065F46' }
    }
    wsDash.getCell(`D${curRow}`).fill = softGreenFill
    wsDash.getCell(`D${curRow}`).border = thinBorder

    wsDash.mergeCells(`E${curRow}:F${curRow}`)
    wsDash.getCell(`E${curRow}`).value = fc[3]
    wsDash.getCell(`E${curRow}`).font = {
      name: 'Segoe UI',
      size: 10,
      bold: true,
      color: { argb: 'FF0F172A' }
    }
    if (typeof fc[3] === 'number') {
      wsDash.getCell(`E${curRow}`).numFmt = '#,##0.00 "₺"'
    }
    wsDash.getCell(`E${curRow}`).border = thinBorder
    wsDash.getCell(`F${curRow}`).border = thinBorder
    curRow++
  }

  // 4. Doğrudan Temin 6 Aşamalı Süreç Takip Tablosu
  curRow += 1
  wsDash.mergeCells(`B${curRow}:F${curRow}`)
  const stHeader = wsDash.getCell(`B${curRow}`)
  stHeader.value = '⚡ 4. DOĞRUDAN TEMİN MEVZUAT ADIMLARI & SÜREÇ İLERLEME DURUMU'
  stHeader.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
  stHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } } // Violet 600
  stHeader.alignment = { vertical: 'middle', indent: 1 }
  wsDash.getRow(curRow).height = 24

  curRow++
  const procCols = [
    'Adım',
    'Süreç Aşaması',
    'Mevzuat Dayanağı',
    'Üretilen Belgeler / Çıktılar',
    'Durum'
  ]
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
    [
      '1',
      'İhtiyaç Tespiti & Lüzum',
      'KİK Md. 22',
      'İhtiyaç Listesi, Lüzum Müzekkeresi, Talep Formu',
      '✅ Tamamlandı'
    ],
    [
      '2',
      'Harcama Yetkilisi Onayı',
      'KİK Md. 22 & KİK Tebliği',
      'Doğrudan Temin Onay Belgesi, Bütçe Blokesi',
      '✅ Tamamlandı'
    ],
    [
      '3',
      'Piyasa Fiyat Araştırması',
      'KİK Md. 22/d & Tebliğ',
      'Fiyat Araştırma Görevlendirmesi, Teklif Mektupları Dağıtımı',
      '✅ Tamamlandı'
    ],
    [
      '4',
      'Yaklaşık Maliyet & Fiyat Tespiti',
      'KİK Tebliği Md. 22',
      'Piyasa Fiyat Araştırma Tutanağı, Yaklaşık Maliyet Cetveli',
      '✅ Tamamlandı'
    ],
    [
      '5',
      'Sipariş / Sözleşme İşlemleri',
      '4734 / Borçlar Kanunu',
      'Sözleşme Tasarısı, Sipariş Mektubu, Taahhütname',
      '✅ Tamamlandı'
    ],
    [
      '6',
      'Muayene Kabul & Ödeme',
      'Muayene ve Kabul Yön.',
      'Muayene ve Kabul Tutanağı, Taşınır Kod Fişi, Fatura Ödeme',
      '⏳ İşlemde / Hazır'
    ]
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
    { width: 6 }, // A: Sıra No
    { width: 14 }, // B: Tür
    { width: 22 }, // C: Taşınır / Poz No
    { width: 16 }, // D: OKAS Kodu
    { width: 44 }, // E: Kalem / İmalat Tanımı
    { width: 12 }, // F: Birim
    { width: 14 }, // G: Miktar
    { width: 12 }, // H: KDV (%)
    { width: 20 }, // I: Yaklaşık Birim Fiyat (₺)
    { width: 24 }, // J: Toplam Tutar (₺)
    { width: 35 } // K: Açıklama / Teknik Şartname
  ]

  // Sheet Title
  wsKalem.mergeCells('A1:K1')
  const kTitle = wsKalem.getCell('A1')
  kTitle.value = `${dosyaNoStr} - İHTİYAÇ, MALZEME VE İMALAT LİSTESİ CETVELİ`
  kTitle.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FFFFFFFF' } }
  kTitle.fill = primaryHeaderFill
  kTitle.alignment = { vertical: 'middle', horizontal: 'center' }
  wsKalem.getRow(1).height = 26

  wsKalem.mergeCells('A2:K2')
  const kSub = wsKalem.getCell('A2')
  kSub.value = `İşin Adı: ${dosyaKonusu} | Alım Türü: ${turLabel} | İdare: ${kurumAdi}`
  kSub.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF94A3B8' } }
  kSub.fill = primaryHeaderFill
  kSub.alignment = { vertical: 'middle', horizontal: 'center' }
  wsKalem.getRow(2).height = 20

  // Column Headers
  const kalemHeaders = [
    'Sıra',
    'Tür',
    'Taşınır Kod / Poz No',
    'OKAS Kodu',
    'Kalem / İş / İmalat Tanımı',
    'Birim',
    'Miktar',
    'KDV (%)',
    'Yaklaşık Birim (₺)',
    'Toplam Tutar (₺)',
    'Açıklama / Teknik Özellik'
  ]
  const kHeaderRow = wsKalem.getRow(4)
  kHeaderRow.height = 24
  kalemHeaders.forEach((h, idx) => {
    const c = kHeaderRow.getCell(idx + 1)
    c.value = h
    c.font = whiteHeaderFont
    c.fill = accentHeaderFill
    c.border = thinBorder
    c.alignment = {
      vertical: 'middle',
      horizontal: ['Sıra', 'Tür', 'Birim', 'Miktar', 'KDV (%)', 'OKAS Kodu'].includes(h)
        ? 'center'
        : ['Yaklaşık Birim (₺)', 'Toplam Tutar (₺)'].includes(h)
          ? 'right'
          : 'left'
    }
  })

  let kRowIdx = 5
  kalemler.forEach((k, idx) => {
    const row = wsKalem.getRow(kRowIdx)
    row.height = 22
    const isZebra = idx % 2 === 1

    row.getCell(1).value = idx + 1
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' }

    row.getCell(2).value =
      k.tipi ||
      (dosya?.tur === 'yapim_isi' || dosya?.tur === 'yapim'
        ? 'Yapım'
        : dosya?.tur === 'hizmet'
          ? 'Hizmet'
          : 'Mal')
    row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' }

    row.getCell(3).value = k.tasinir_kodu || k.poz_no || '-'
    row.getCell(3).font = { name: 'Consolas', size: 9 }
    row.getCell(3).alignment = { vertical: 'middle', horizontal: 'left' }

    row.getCell(4).value = k.okas_kodu || '-'
    row.getCell(4).font = { name: 'Consolas', size: 9 }
    row.getCell(4).alignment = { vertical: 'middle', horizontal: 'center' }

    row.getCell(5).value = k.kalem_adi || k.adi || ''
    row.getCell(5).font = { name: 'Segoe UI', size: 10, bold: true }

    row.getCell(6).value = k.birim || 'Adet'
    row.getCell(6).alignment = { vertical: 'middle', horizontal: 'center' }

    row.getCell(7).value = Number(k.miktar || 0)
    row.getCell(7).numFmt = '#,##0.00'
    row.getCell(7).alignment = { vertical: 'middle', horizontal: 'right' }

    row.getCell(8).value = Number(k.kdv_orani ?? 20) / 100
    row.getCell(8).numFmt = '0%'
    row.getCell(8).alignment = { vertical: 'middle', horizontal: 'center' }

    const birimFiyat = Number(k.yaklasik_maliyet || k.birim_fiyat || 0)
    row.getCell(9).value = birimFiyat
    row.getCell(9).numFmt = '#,##0.00 "₺"'
    row.getCell(9).alignment = { vertical: 'middle', horizontal: 'right' }

    // Formula for Total = Miktar * Birim Fiyat (Column G * Column I)
    row.getCell(10).value = {
      formula: `G${kRowIdx}*I${kRowIdx}`,
      result: Number(k.miktar || 0) * birimFiyat
    }
    row.getCell(10).numFmt = '#,##0.00 "₺"'
    row.getCell(10).font = {
      name: 'Segoe UI',
      size: 10,
      bold: true,
      color: { argb: 'FF0F172A' }
    }
    row.getCell(10).alignment = { vertical: 'middle', horizontal: 'right' }

    row.getCell(11).value = k.aciklama || ''

    for (let c = 1; c <= 11; c++) {
      const cell = row.getCell(c)
      cell.border = thinBorder
      if (isZebra) cell.fill = zebraFill
    }

    kRowIdx++
  })

  // Summary Row
  const kTotRow = wsKalem.getRow(kRowIdx)
  kTotRow.height = 26
  wsKalem.mergeCells(`A${kRowIdx}:I${kRowIdx}`)
  const totLabel = wsKalem.getCell(`A${kRowIdx}`)
  totLabel.value = 'GENEL YAKLAŞIK MALİYET TOPLAMI (KDV HARİÇ):'
  totLabel.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF1E293B' } }
  totLabel.alignment = { vertical: 'middle', horizontal: 'right' }
  totLabel.fill = softAmberFill

  const totFormula = wsKalem.getCell(`J${kRowIdx}`)
  totFormula.value = {
    formula: `SUM(J5:J${kRowIdx - 1})`,
    result: toplamYaklasikMaliyet
  }
  totFormula.numFmt = '#,##0.00 "₺"'
  totFormula.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFB45309' } }
  totFormula.fill = softAmberFill
  totFormula.alignment = { vertical: 'middle', horizontal: 'right' }

  for (let c = 1; c <= 11; c++) {
    wsKalem.getCell(kRowIdx, c).border = doubleBottomBorder
  }

  // =========================================================================
  // SAYFA 3: 🏷️ PİYASA FİYAT ARAŞTIRMASI & DİNAMİK TEKLİF CETVELİ
  // =========================================================================
  const wsTeklif = workbook.addWorksheet('🏷️ Piyasa Teklif Karşılaştırma', {
    properties: { tabColor: { argb: 'FF059669' } },
    views: [{ state: 'frozen', ySplit: 4, showGridLines: true }]
  })

  // Determine firms
  const effectiveFirms =
    firmalar.length > 0
      ? firmalar
      : [
          { id: 1, unvan: '1. İstekli Firma' },
          { id: 2, unvan: '2. İstekli Firma' },
          { id: 3, unvan: '3. İstekli Firma' }
        ]

  // Column definitions for teklif
  // A: Sıra, B: Kalem Tanımı, C: Birim, D: Miktar, then for each firm (Birim, Toplam), then En Uygun Birim, En Uygun Toplam
  const tColDefs: Partial<ExcelJS.Column>[] = [
    { width: 6 }, // A: Sıra
    { width: 38 }, // B: Kalem
    { width: 10 }, // C: Birim
    { width: 12 } // D: Miktar
  ]

  effectiveFirms.forEach(() => {
    tColDefs.push({ width: 18 }) // Birim
    tColDefs.push({ width: 20 }) // Toplam
  })

  tColDefs.push({ width: 20 }) // En Uygun Birim
  tColDefs.push({ width: 22 }) // En Uygun Toplam

  wsTeklif.columns = tColDefs

  const totalColsCount = 4 + effectiveFirms.length * 2 + 2
  const lastColLetter = getColumnLetter(totalColsCount)

  wsTeklif.mergeCells(`A1:${lastColLetter}1`)
  const tTitle = wsTeklif.getCell('A1')
  tTitle.value = `${dosyaNoStr} - PİYASA FİYAT ARAŞTIRMASI VE TEKLİF KARŞILAŞTIRMA CETVELİ`
  tTitle.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FFFFFFFF' } }
  tTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF065F46' } }
  tTitle.alignment = { vertical: 'middle', horizontal: 'center' }
  wsTeklif.getRow(1).height = 26

  wsTeklif.mergeCells(`A2:${lastColLetter}2`)
  const tSub = wsTeklif.getCell('A2')
  tSub.value = `4734 Sayılı Kanun Madde 22/d Uyarınca Alınan Birim Fiyat Teklifleri ve En Avantajlı Fiyat Tespiti (${effectiveFirms.length} İstekli)`
  tSub.font = { name: 'Segoe UI', size: 10, color: { argb: 'FFA7F3D0' } }
  tSub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF065F46' } }
  tSub.alignment = { vertical: 'middle', horizontal: 'center' }
  wsTeklif.getRow(2).height = 20

  // Header row 4
  const tHeaderRow = wsTeklif.getRow(4)
  tHeaderRow.height = 26
  const tHeaders = ['Sıra', 'İhtiyaç Kalemi / İş Tanımı', 'Birim', 'Miktar']

  effectiveFirms.forEach((f) => {
    const fName = f.unvan || f.ad || 'İstekli'
    tHeaders.push(`${fName} (Birim)`)
    tHeaders.push(`${fName} (Toplam)`)
  })

  tHeaders.push('En Uygun Birim (₺)')
  tHeaders.push('En Uygun Toplam (₺)')

  tHeaders.forEach((th, idx) => {
    const c = tHeaderRow.getCell(idx + 1)
    c.value = th
    c.font = whiteHeaderFont
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } }
    c.border = thinBorder
    c.alignment = {
      vertical: 'middle',
      horizontal: ['Sıra', 'Birim', 'Miktar'].includes(th) ? 'center' : 'right'
    }
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

    const firmUnitColLetters: string[] = []
    let colCursor = 5

    effectiveFirms.forEach((f, fIdx) => {
      const unitCol = colCursor
      const totCol = colCursor + 1
      const unitColLetter = getColumnLetter(unitCol)
      const totColLetter = getColumnLetter(totCol)
      firmUnitColLetters.push(unitColLetter)

      const fBid = Number(
        teklifler.find((t) => t.temin_kalem_id === k.id && t.firma_id === f.id)
          ?.birim_fiyat || (fIdx === 0 ? k.yaklasik_maliyet || 0 : (k.yaklasik_maliyet || 0) * (1 + fIdx * 0.05))
      )

      row.getCell(unitCol).value = fBid
      row.getCell(unitCol).numFmt = '#,##0.00 "₺"'
      row.getCell(totCol).value = {
        formula: `D${tRowIdx}*${unitColLetter}${tRowIdx}`,
        result: miktar * fBid
      }
      row.getCell(totCol).numFmt = '#,##0.00 "₺"'

      colCursor += 2
    })

    // Min formula for best unit price
    const minUnitCol = colCursor
    const minTotCol = colCursor + 1
    const minUnitColLetter = getColumnLetter(minUnitCol)

    const minFormulaCells = firmUnitColLetters.map((l) => `${l}${tRowIdx}`).join(',')
    row.getCell(minUnitCol).value = { formula: `MIN(${minFormulaCells})` }
    row.getCell(minUnitCol).numFmt = '#,##0.00 "₺"'
    row.getCell(minUnitCol).font = {
      name: 'Segoe UI',
      size: 10,
      bold: true,
      color: { argb: 'FF065F46' }
    }

    row.getCell(minTotCol).value = {
      formula: `D${tRowIdx}*${minUnitColLetter}${tRowIdx}`
    }
    row.getCell(minTotCol).numFmt = '#,##0.00 "₺"'
    row.getCell(minTotCol).font = {
      name: 'Segoe UI',
      size: 10,
      bold: true,
      color: { argb: 'FF065F46' }
    }

    for (let c = 1; c <= totalColsCount; c++) {
      const cell = row.getCell(c)
      cell.border = thinBorder
      if (isZebra) cell.fill = zebraFill
    }

    tRowIdx++
  })

  // Summary Row for Teklifler
  const tTotRow = wsTeklif.getRow(tRowIdx)
  tTotRow.height = 26
  wsTeklif.mergeCells(`A${tRowIdx}:D${tRowIdx}`)
  wsTeklif.getCell(`A${tRowIdx}`).value = 'FİRMA TEKLİF TOPLAMLARI (KDV HARİÇ):'
  wsTeklif.getCell(`A${tRowIdx}`).font = { name: 'Segoe UI', size: 10, bold: true }
  wsTeklif.getCell(`A${tRowIdx}`).alignment = { vertical: 'middle', horizontal: 'right' }
  wsTeklif.getCell(`A${tRowIdx}`).fill = softGreenFill

  let summaryCursor = 5
  effectiveFirms.forEach(() => {
    const totCol = summaryCursor + 1
    const totColLetter = getColumnLetter(totCol)
    wsTeklif.getCell(`${totColLetter}${tRowIdx}`).value = {
      formula: `SUM(${totColLetter}5:${totColLetter}${tRowIdx - 1})`
    }
    wsTeklif.getCell(`${totColLetter}${tRowIdx}`).numFmt = '#,##0.00 "₺"'
    wsTeklif.getCell(`${totColLetter}${tRowIdx}`).font = { name: 'Segoe UI', size: 10, bold: true }
    wsTeklif.getCell(`${totColLetter}${tRowIdx}`).fill = softGreenFill
    summaryCursor += 2
  })

  const minTotColLetter = getColumnLetter(totalColsCount)
  wsTeklif.getCell(`${minTotColLetter}${tRowIdx}`).value = {
    formula: `SUM(${minTotColLetter}5:${minTotColLetter}${tRowIdx - 1})`
  }
  wsTeklif.getCell(`${minTotColLetter}${tRowIdx}`).numFmt = '#,##0.00 "₺"'
  wsTeklif.getCell(`${minTotColLetter}${tRowIdx}`).font = {
    name: 'Segoe UI',
    size: 11,
    bold: true,
    color: { argb: 'FF065F46' }
  }
  wsTeklif.getCell(`${minTotColLetter}${tRowIdx}`).fill = softGreenFill

  for (let c = 1; c <= totalColsCount; c++) {
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
    { width: 6 }, // A
    { width: 28 }, // B
    { width: 24 }, // C
    { width: 28 }, // D
    { width: 24 }, // E
    { width: 30 } // F
  ]

  wsKom.mergeCells('A1:F1')
  const komTitle = wsKom.getCell('A1')
  komTitle.value = `${dosyaNoStr} - DOĞRUDAN TEMİN GÖREVLENDİRME VE KOMİSYON LİSTESİ`
  komTitle.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FFFFFFFF' } }
  komTitle.fill = primaryHeaderFill
  komTitle.alignment = { vertical: 'middle', horizontal: 'center' }
  wsKom.getRow(1).height = 26

  const komHeaders = [
    'Sıra',
    'Adı Soyadı',
    'Ünvanı / Mesleği',
    'Komisyon Türü',
    'Görevi / Rolü',
    'İmza ve Onay Durumu'
  ]
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
  const memberList =
    komisyon.length > 0
      ? komisyon
      : [
          {
            ad_soyad: 'Piyasa Araştırma Görevlisi 1',
            unvan: 'Mühendis / Uzman',
            komisyon_turu: 'Piyasa Fiyat Araştırma',
            rol: 'Başkan'
          },
          {
            ad_soyad: 'Piyasa Araştırma Görevlisi 2',
            unvan: 'Tekniker / Memur',
            komisyon_turu: 'Piyasa Fiyat Araştırma',
            rol: 'Üye'
          },
          {
            ad_soyad: 'Muayene Kabul Yetkilisi',
            unvan: 'Şube Müdürü',
            komisyon_turu: 'Muayene ve Kabul',
            rol: 'Başkan'
          },
          {
            ad_soyad: 'Harcama Yetkilisi',
            unvan: 'Daire Başkanı / Harcama Yetkilisi',
            komisyon_turu: 'Harcama ve Onay',
            rol: 'Harcama Yetkilisi'
          }
        ]

  memberList.forEach((m, idx) => {
    const row = wsKom.getRow(komRowIdx)
    row.height = 22
    row.getCell(1).value = idx + 1
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' }
    row.getCell(2).value = m.ad_soyad || m.personel_adi || ''
    row.getCell(2).font = { name: 'Segoe UI', size: 10, bold: true }
    row.getCell(3).value = m.unvan || '-'
    row.getCell(4).value = m.komisyon_turu || 'Doğrudan Temin Görevlendirmesi'
    row.getCell(5).value = m.rol || m.gorev || 'Üye'
    row.getCell(6).value = '✅ Görevlendirme Onaylandı'

    for (let c = 1; c <= 6; c++) {
      row.getCell(c).border = thinBorder
      if (idx % 2 === 1) row.getCell(c).fill = zebraFill
    }
    komRowIdx++
  })

  // =========================================================================
  // SAYFA 5: 📜 KİK ŞABLON & MEVZUAT ENVANTERİ
  // =========================================================================
  const wsSablon = workbook.addWorksheet('📜 Belge ve Şablon Envanteri', {
    properties: { tabColor: { argb: 'FFD97706' } },
    views: [{ showGridLines: true }]
  })

  wsSablon.columns = [
    { width: 6 }, // A
    { width: 34 }, // B: Belge Adı
    { width: 24 }, // C: Aşaması
    { width: 28 }, // D: Dosya / Şablon Adı
    { width: 24 }, // E: Mevzuat Dayanağı
    { width: 45 } // F: Amacı ve Hukuki Açıklama
  ]

  wsSablon.mergeCells('A1:F1')
  const sabTitle = wsSablon.getCell('A1')
  sabTitle.value = `${dosyaNoStr} - 4734 SAYILI KİK DOĞRUDAN TEMİN STANDART ŞABLON VE EVRAK ENVANTERİ`
  sabTitle.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FFFFFFFF' } }
  sabTitle.fill = primaryHeaderFill
  sabTitle.alignment = { vertical: 'middle', horizontal: 'center' }
  wsSablon.getRow(1).height = 26

  const sabHeaders = [
    'Sıra',
    'Standart Şablon / Belge Adı',
    'Süreç Aşaması',
    'Şablon Dosyası (.html / .tsx)',
    'Mevzuat Maddesi',
    'Belgenin Amacı ve Hukuki Niteliği'
  ]
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

  const standardDocs =
    sablons.length > 0
      ? sablons.map((s, idx) => [
          String(idx + 1),
          s.ad || 'Şablon',
          s.kategori || 'Doğrudan Temin Süreci',
          s.dosya_adi || s.route_path || `${s.id}.html`,
          '4734 Sayılı KİK & Tebliğ',
          s.aciklama || 'Doğrudan temin süreci resmi evrak çıktısı'
        ])
      : [
          [
            '1',
            'İhtiyaç Listesi & Talep Formu',
            '1. İhtiyaç & Başlangıç',
            'ihtiyac-listesi.html',
            'KİK Md. 22',
            'Birimlerin talep ettiği malzeme/hizmet kalemlerinin resmi dökümü'
          ],
          [
            '2',
            'Lüzum Müzekkeresi',
            '1. İhtiyaç & Başlangıç',
            'luzum-muzekkeresi.html',
            'KİK Md. 22',
            'Alımın idari ve teknik gerekçesini belirten resmi talep yazısı'
          ],
          [
            '3',
            'Doğrudan Temin Onay Belgesi / Harcama Talimatı',
            '1. İhtiyaç & Başlangıç',
            'harcama-talimati.html',
            'KİK Md. 22 & Tebliğ',
            'Harcama yetkilisinden alım izni ve bütçe kullanımı onayı'
          ],
          [
            '4',
            'Piyasa Fiyat Araştırma Görevlendirmesi',
            '2. Teklifler & Piyasa',
            'piyasa-fiyat-arastirma-gorevlendirmesi.html',
            'KİK Md. 22/d',
            'Piyasa fiyat araştırması yapacak personelin görev onayı'
          ],
          [
            '5',
            'Birim Fiyat Teklif Mektubu',
            '2. Teklifler & Piyasa',
            'birim-fiyat-teklif-mektubu.html',
            'KİK Md. 22/d',
            'İstekli firmalara fiyat teklifi vermeleri için gönderilen davet mektubu'
          ],
          [
            '6',
            'Piyasa Fiyat Araştırma Tutanağı',
            '2. Teklifler & Piyasa',
            'piyasa-fiyat-arastirma-tutanagi.html',
            'KİK Md. 22/d & Tebliğ',
            'Alınan tüm tekliflerin karşılaştırılarak en uygunun belirlendiği tutanak'
          ],
          [
            '7',
            'Yaklaşık Maliyet Hesap Cetveli',
            '2. Teklifler & Piyasa',
            'yaklasik-maliyet-cetveli.html',
            'KİK Tebliği Md. 22',
            'Alımın tahmini bütçe ve piyasa ortalama maliyetinin tespit cetveli'
          ],
          [
            '8',
            'Doğrudan Temin Sözleşmesi',
            '3. Sipariş & Sözleşme',
            'dogrudan-temin-sozlesmesi.html',
            '4734 / Borçlar Kanunu',
            'Yüklenici firma ile idare arasında yapılan resmi alım sözleşmesi'
          ],
          [
            '9',
            'Sipariş Mektubu / Taahhütname',
            '3. Sipariş & Sözleşme',
            'siparis-mektubu.html',
            'KİK Md. 22',
            'Sözleşme yapılmayan hallerde işin yapılmasını bildiren resmi sipariş emri'
          ],
          [
            '10',
            'Muayene ve Kabul Tutanağı',
            '4. Muayene & Ödeme',
            'muayene-kabul-tutanagi.html',
            'Muayene ve Kabul Yön.',
            'Mal veya hizmetin teknik şartlara uygun teslim alındığına dair kabul tutanağı'
          ],
          [
            '11',
            'Harcama Pusulası & Ödeme Emri',
            '4. Muayene & Ödeme',
            'harcama-pusulasi.html',
            '5018 Sayılı KMYKK',
            'Faturanın muhasebeleştirilip yükleniciye ödeme yapılması talimatı'
          ]
        ]

  let sabRowIdx = 4
  standardDocs.forEach((sd, idx) => {
    const row = wsSablon.getRow(sabRowIdx)
    row.height = 22
    row.getCell(1).value = idx + 1
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' }
    row.getCell(2).value = sd[1]
    row.getCell(2).font = { name: 'Segoe UI', size: 10, bold: true }
    row.getCell(3).value = sd[2]
    row.getCell(4).value = sd[3]
    row.getCell(4).font = { name: 'Consolas', size: 9 }
    row.getCell(5).value = sd[4]
    row.getCell(6).value = sd[5]

    for (let c = 1; c <= 6; c++) {
      row.getCell(c).border = thinBorder
      if (idx % 2 === 1) row.getCell(c).fill = zebraFill
    }
    sabRowIdx++
  })

  // =========================================================================
  // SAYFA 6: 🏢 İSTEKLİ FİRMALAR & İLETİŞİM CETVELİ
  // =========================================================================
  if (firmalar.length > 0) {
    const wsFirm = workbook.addWorksheet('🏢 İstekli Firmalar', {
      properties: { tabColor: { argb: 'FF0EA5E9' } },
      views: [{ showGridLines: true }]
    })

    wsFirm.columns = [
      { width: 6 }, // A
      { width: 34 }, // B: Firma Ünvanı
      { width: 18 }, // C: Vergi No / TC
      { width: 22 }, // D: Vergi Dairesi
      { width: 18 }, // E: Telefon
      { width: 28 }, // F: E-Posta
      { width: 38 } // G: Adres
    ]

    wsFirm.mergeCells('A1:G1')
    const firmTitle = wsFirm.getCell('A1')
    firmTitle.value = `${dosyaNoStr} - TEKLİF VEREN / DAVET EDİLEN İSTEKLİ FİRMALAR LİSTESİ`
    firmTitle.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FFFFFFFF' } }
    firmTitle.fill = primaryHeaderFill
    firmTitle.alignment = { vertical: 'middle', horizontal: 'center' }
    wsFirm.getRow(1).height = 26

    const firmHeaders = [
      'Sıra',
      'Firma Ticari Ünvanı',
      'Vergi Kimlik No / TC',
      'Vergi Dairesi',
      'Telefon No',
      'E-Posta Adresi',
      'Tebligat Adresi'
    ]
    const fHeaderRow = wsFirm.getRow(3)
    fHeaderRow.height = 24
    firmHeaders.forEach((fh, idx) => {
      const c = fHeaderRow.getCell(idx + 1)
      c.value = fh
      c.font = whiteHeaderFont
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0284C7' } }
      c.border = thinBorder
      c.alignment = { vertical: 'middle', horizontal: idx === 0 ? 'center' : 'left' }
    })

    let fRowIdx = 4
    firmalar.forEach((f, idx) => {
      const row = wsFirm.getRow(fRowIdx)
      row.height = 22
      row.getCell(1).value = idx + 1
      row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' }
      row.getCell(2).value = f.unvan || f.ad || ''
      row.getCell(2).font = { name: 'Segoe UI', size: 10, bold: true }
      row.getCell(3).value = f.vergi_no || f.tc_kimlik || '-'
      row.getCell(3).font = { name: 'Consolas', size: 9 }
      row.getCell(4).value = f.vergi_dairesi || '-'
      row.getCell(5).value = f.telefon || '-'
      row.getCell(6).value = f.email || f.eposta || '-'
      row.getCell(7).value = f.adres || '-'

      for (let c = 1; c <= 7; c++) {
        row.getCell(c).border = thinBorder
        if (idx % 2 === 1) row.getCell(c).fill = zebraFill
      }
      fRowIdx++
    })
  }

  // Export buffer & trigger file download with standardized filename: butceYili-dtNo-Master_Excel_Raporu.xlsx
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url

  const downloadFileName = buildExportFileName({
    dosya,
    belgeAdi: 'Master_Excel_Raporu',
    extension: 'xlsx'
  })

  link.setAttribute('download', downloadFileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Excel Column index (1-based) to Letter converter (1 -> A, 27 -> AA, etc.)
 */
function getColumnLetter(colIndex: number): string {
  let temp = colIndex
  let letter = ''
  while (temp > 0) {
    const mod = (temp - 1) % 26
    letter = String.fromCharCode(65 + mod) + letter
    temp = Math.floor((temp - mod) / 26)
  }
  return letter
}
