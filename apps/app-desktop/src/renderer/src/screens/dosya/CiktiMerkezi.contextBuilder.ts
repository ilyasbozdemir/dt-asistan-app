import { SAYI_YAZI_MAP, sayiyiYaziyaCevir, paraYaziyaCevir } from '../../constants/sayiEslesmeleri'
import { getInstitutionSuffixes } from '../../utils/kurumHelper'

export function formatDateString(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null
  try {
    const cleanStr = String(dateStr).trim()
    if (/^\d{4}-\d{2}-\d{2}/.test(cleanStr)) {
      const [y, m, d] = cleanStr.split(' ')[0].split('-')
      return `${d}.${m}.${y}`
    }
    if (/^\d{2}\.\d{2}\.\d{4}/.test(cleanStr)) {
      return cleanStr
    }
    const d = new Date(cleanStr)
    if (isNaN(d.getTime())) return null
    return new Intl.DateTimeFormat('tr-TR', {
      timeZone: 'Europe/Istanbul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d)
  } catch {
    return null
  }
}

export function buildDocumentContext(
  dosyaResData: any,
  kalemlerData: any[],
  firms: any[],
  bidsMap: Record<string, number>,
  commission: any[],
  muayeneKomisyonu: any[],
  kurum: any,
  settings: any,
  resolvedMappings: Record<string, any>
): any {
  const subInstType = settings?.subInstitutionType || ''

  // Antet satırlarını parse et
  let antetSatirlari: string[] = []
  if (kurum?.kurum_anteti) {
    try {
      const parsed = JSON.parse(kurum.kurum_anteti)
      if (Array.isArray(parsed)) {
        antetSatirlari = parsed.filter((s: string) => s && s.trim() !== '')
      }
    } catch {
      antetSatirlari = kurum.kurum_anteti ? [kurum.kurum_anteti] : []
    }
  }

  const suffixes = getInstitutionSuffixes(subInstType, {
    label: settings?.customSubInstitutionLabel,
    kurumumuz: settings?.customSubInstitutionKurumumuz,
    kurumunuz: settings?.customSubInstitutionKurumumuz,
    kurumu: settings?.customSubInstitutionKurumu,
    kurumlari: settings?.customSubInstitutionKurumlari
  })

  const today = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date())

  const fileDate =
    formatDateString(dosyaResData?.tarih) ||
    formatDateString(dosyaResData?.temin_tarihi) ||
    formatDateString(dosyaResData?.dosya_acilis_tarihi) ||
    formatDateString(dosyaResData?.created_at) ||
    today

  const kalemSayisi = kalemlerData?.length || 0
  const kalemSayisiYazi = sayiyiYaziyaCevir(kalemSayisi)

  // Para birimi formatlayıcı
  const formatTR = (val: number) => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val)
  }

  // Firma toplamlarını hesapla
  const firmaToplamlari = firms.map((f: any) => {
    let sum = 0
    kalemlerData?.forEach((k: any) => {
      const price = bidsMap[`${k.id}_${f.temin_firma_id}`] || 0
      sum += price * (k.miktar || 0)
    })
    return {
      toplam: formatTR(sum)
    }
  })

  const calculatedTeklifler = firms
    .map((f: any, index: number) => {
      let sum = 0
      kalemlerData?.forEach((k: any) => {
        const price = bidsMap[`${k.id}_${f.temin_firma_id}`] || 0
        sum += price * (k.miktar || 0)
      })
      return {
        siraNo: index + 1,
        istekliUnvani: f.unvan,
        teklifBedeli: formatTR(sum),
        teklifBedeliRaw: sum,
        yaziIle: paraYaziyaCevir(sum)
      }
    })
    .sort((a: any, b: any) => a.teklifBedeliRaw - b.teklifBedeliRaw)

  const enAvantajliTeklifSahibi = calculatedTeklifler[0]?.istekliUnvani || ''
  const enAvantajliTeklifBedeli = calculatedTeklifler[0]?.teklifBedeli || ''
  const ikinciAvantajliTeklifSahibi = calculatedTeklifler[1]?.istekliUnvani || ''
  const ikinciAvantajliTeklifBedeli = calculatedTeklifler[1]?.teklifBedeli || ''

  // Fiyatlar ve genel toplam hesaplama (aktif dosyanın hesaplama esasına göre)
  const isAverageBasis = dosyaResData?.hesaplama_esasi?.toLowerCase().includes('ortalama')
  const isLowestBasis = !isAverageBasis

  let grandTotal = 0
  const needItems =
    kalemlerData?.map((k: any, index: number) => {
      const itemPrices = firms.map((f: any) => ({
        unvan: f.unvan,
        price: bidsMap[`${k.id}_${f.temin_firma_id}`] || 0
      }))
      const validPrices = itemPrices.filter((p: any) => p.price > 0)
      const minPrice =
        validPrices.length > 0 ? Math.min(...validPrices.map((p: any) => p.price)) : 0
      const avgPrice =
        validPrices.length > 0 ? (validPrices.reduce((sum: number, p: any) => sum + p.price, 0) / validPrices.length) : 0
      
      const chosenPrice = isLowestBasis ? minPrice : avgPrice
      const toplamBedel = chosenPrice * (k.miktar || 0)
      grandTotal += toplamBedel

      const enUygunFirma =
        validPrices.length > 0
          ? validPrices.reduce((prev: any, curr: any) => (prev.price < curr.price ? prev : curr))
          : null
      const enUygunFirmaAdi = enUygunFirma ? enUygunFirma.unvan : 'Teklif Yok'

      const firmaTeklifleri = firms.map((f: any) => {
        const price = bidsMap[`${k.id}_${f.temin_firma_id}`] || 0
        return {
          fiyat: price > 0 ? formatTR(price) : '-'
        }
      })

      const firmaTeklifleriDetay = firms.map((f: any) => {
        const price = bidsMap[`${k.id}_${f.temin_firma_id}`] || 0
        const total = price * (k.miktar || 0)
        return {
          birimFiyat: price > 0 ? formatTR(price) : '-',
          tutar: total > 0 ? formatTR(total) : '-',
          hasPrice: price > 0
        }
      })

      return {
        siraNo: index + 1,
        kodu: k.tasinir_kodu || k.okas_kodu || '-',
        malzemeAdi: k.kalem_adi,
        ozelligi: k.aciklama || '',
        birimi: k.birim,
        kdvOrani: k.kdv_orani,
        miktar: formatTR(k.miktar || 0),
        firmaTeklifleri,
        firmaTeklifleriDetay,
        enUygunFirmaAdi,
        enDusukFiyat: minPrice > 0 ? formatTR(minPrice) : '-',
        toplamBedel: toplamBedel > 0 ? formatTR(toplamBedel) : '-'
      }
    }) || []

  const genelToplam = formatTR(grandTotal)

  const rawHarcamaBirimi = settings?.harcamaBirimAdi || dosyaResData?.harcama_birimi || ''
  const parentInstitutionName = settings?.parentInstitution || ''
  const institutionName = settings?.institutionName || 'Kurum Adı Belirtilmedi'
  const idareAdi = rawHarcamaBirimi ? `${institutionName} - ${rawHarcamaBirimi}` : institutionName

  const rawTur = dosyaResData?.tur || 'mal'
  let alimTuruText = 'Mal Alımı'
  if (rawTur === 'hizmet') alimTuruText = 'Hizmet Alımı'
  else if (rawTur === 'yapim_isi' || rawTur === 'yapim') alimTuruText = 'Yapım İşi'
  else if (rawTur === 'danismanlik') alimTuruText = 'Danışmanlık Hizmet Alımı'

  const isMal = rawTur === 'mal'
  const isHizmet = rawTur === 'hizmet' || rawTur === 'danismanlik'
  const isYapim = rawTur === 'yapim_isi' || rawTur === 'yapim'

  const rawButceKodu = dosyaResData?.butce_kodu || ''
  const butceTertibiArray = rawButceKodu
    .split(/[\n,;]+/)
    .map((item: string) => item.trim())
    .filter((item: string) => item.length > 0)
    .map((item: string) => {
      let cleanItem = item
      if (cleanItem.startsWith('630.')) {
        cleanItem = cleanItem.substring(4)
      } else if (cleanItem.startsWith('630')) {
        cleanItem = cleanItem.substring(3)
      }
      return cleanItem
    })

  const dbYaklasikMaliyet = dosyaResData?.yaklasik_maliyet || 0
  const yaklasikMaliyetText = dbYaklasikMaliyet > 0 ? formatTR(dbYaklasikMaliyet) : '0,00'

  const teminSekliText =
    dosyaResData?.ihale_sekli || "4734 sayılı Kanun'un 22/d maddesi gereğince Doğrudan Temin"

  let totalKdv = 0
  kalemlerData?.forEach((k: any) => {
    const itemPrices = firms.map((f: any) => ({
      price: bidsMap[`${k.id}_${f.temin_firma_id}`] || 0
    }))
    const validPrices = itemPrices.filter((p: any) => p.price > 0)
    const minPrice = validPrices.length > 0 ? Math.min(...validPrices.map((p: any) => p.price)) : 0
    const avgPrice = validPrices.length > 0 ? (validPrices.reduce((sum: number, p: any) => sum + p.price, 0) / validPrices.length) : 0
    const chosenPrice = isLowestBasis ? minPrice : avgPrice

    const lineTotal = chosenPrice * (k.miktar || 0)
    const kdvRate = k.kdv_orani || 0
    totalKdv += lineTotal * (kdvRate / 100)
  })

  const rawKapakDetaylari: any[] = []
  if (dosyaResData?.butce_yili) {
    rawKapakDetaylari.push({ label: 'BÜTÇE YILI', value: String(dosyaResData.butce_yili) })
  }
  rawKapakDetaylari.push({
    label: 'İŞİN TÜRÜ / ALIM USULÜ',
    value: [alimTuruText, teminSekliText]
  })
  if (dosyaResData?.temin_no) {
    rawKapakDetaylari.push({ label: 'DOĞRUDAN TEMİN NUMARASI', value: dosyaResData.temin_no })
  }
  if (dosyaResData?.tarih) {
    rawKapakDetaylari.push({ label: 'DOSYA TARİHİ', value: dosyaResData.tarih })
  }
  if (dosyaResData?.konu) {
    rawKapakDetaylari.push({ label: 'İŞİN ADI', value: dosyaResData.konu, isBold: true })
  }
  if (dosyaResData?.isin_aciklamasi) {
    rawKapakDetaylari.push({ label: 'İŞİN AÇIKLAMASI', value: dosyaResData.isin_aciklamasi })
  }
  if (dbYaklasikMaliyet > 0) {
    rawKapakDetaylari.push({ label: 'YAKLAŞIK MALİYET', value: `${yaklasikMaliyetText} TL` })
  }
  if (butceTertibiArray.length > 0) {
    rawKapakDetaylari.push({ label: 'BÜTÇE TERTİBİ', value: butceTertibiArray })
  }
  if (dosyaResData?.yuklenici_firma_adi) {
    rawKapakDetaylari.push({
      label: 'YÜKLENİCİ FİRMA',
      value: dosyaResData.yuklenici_firma_adi,
      isBold: true
    })
    if (grandTotal > 0) {
      rawKapakDetaylari.push({
        label: 'SÖZLEŞME BEDELİ',
        value: [
          `${formatTR(grandTotal)} TL (KDV Hariç)`,
          `${formatTR(totalKdv)} TL (KDV)`,
          `${formatTR(grandTotal + totalKdv)} TL (KDV Dahil)`
        ],
        isBold: true
      })
    }
  }

  const kapakDetaylari = rawKapakDetaylari.map((item) => ({
    label: item.label,
    lines: Array.isArray(item.value) ? item.value : [item.value],
    isBold: item.isBold || false
  }))

  // evrakSayisi formatting: detsisno-yil-sayisi
  const detsisNo = kurum?.detsis_kodu || ''
  const dosyaYili =
    dosyaResData?.butce_yili ||
    (dosyaResData?.tarih ? dosyaResData.tarih.split('.')[2] : new Date().getFullYear())
  const dosyaSayisi = dosyaResData?.temin_no || ''

  let formattedEvrakSayisi = 'Belirtilmedi'
  if (detsisNo) {
    if (dosyaYili && dosyaSayisi) {
      const cleanSayi = dosyaSayisi.includes('/')
        ? dosyaSayisi.split('/').pop()
        : dosyaSayisi.includes('-')
          ? dosyaSayisi.split('-').pop()
          : dosyaSayisi
      formattedEvrakSayisi = `${detsisNo}-${dosyaYili}/${cleanSayi}`
    } else {
      formattedEvrakSayisi = detsisNo
    }
  } else if (dosyaSayisi) {
    formattedEvrakSayisi = dosyaSayisi
  }

  const rawMaddeler = dosyaResData?.isin_aciklama_maddeleri
  let aciklamaMaddeleri: any[] = []
  if (rawMaddeler) {
    try {
      const parsed = JSON.parse(rawMaddeler)
      if (Array.isArray(parsed)) {
        aciklamaMaddeleri = parsed.map((m: string, idx: number) => ({
          siraNo: idx + 1,
          maddeMetni: m
        }))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const context: any = {
    aciklamaMaddeleri,
    hasAciklamaMaddeleri: aciklamaMaddeleri.length > 0,
    dosyaYili: dosyaYili,
    kapakDetaylari,
    tarih: fileDate,
    alimTuru: alimTuruText,
    isMal,
    isHizmet,
    isYapim,
    dosyaTarihi: fileDate,
    yukleniciFirma: dosyaResData?.yuklenici_firma_adi || null,
    yukleniciAdresi: dosyaResData?.yuklenici_firma_adresi || '',
    yukleniciIlce: dosyaResData?.yuklenici_firma_ilcesi || '',
    yukleniciIl: dosyaResData?.yuklenici_firma_ili || '',
    yukleniciTelefon: dosyaResData?.yuklenici_firma_telefon || '',
    yukleniciFaks: dosyaResData?.yuklenici_firma_faks || '',
    yukleniciEposta: dosyaResData?.yuklenici_firma_email || '',
    yukleniciVergiDairesi: dosyaResData?.yuklenici_firma_vergi_dairesi || '',
    yukleniciVergiNo: dosyaResData?.yuklenici_firma_vergi_no || '',
    idareAdresi: kurum?.adres || settings?.kurumAdres || 'İdare Adresi Belirtilmedi',
    idareTelefon: kurum?.telefon || settings?.kurumTelefon || 'Telefon Belirtilmedi',
    idareEposta: kurum?.eposta || settings?.kurumEposta || 'E-posta Belirtilmedi',
    kurumAdres: kurum?.adres || settings?.kurumAdres || '',
    kurumTelefon: kurum?.telefon || settings?.kurumTelefon || '',
    kurumEposta: kurum?.eposta || settings?.kurumEposta || '',
    kurumKep: kurum?.kep_adresi || '',
    kurumWeb: kurum?.web_sitesi || '',
    kurumIci: true,
    evrakSayisi: formattedEvrakSayisi,
    dosyaKonusu: undefined,
    isAdi: dosyaResData?.konu || 'Konu Belirtilmedi',
    isinAdi: dosyaResData?.konu || 'Konu Belirtilmedi',
    sayiYazıyla: SAYI_YAZI_MAP,
    kurumumuz: suffixes.kurumumuz,
    kurumunuz: suffixes.kurumunuz,
    kurumu: suffixes.kurumu,
    kurumlari: suffixes.kurumlari,
    kalemSayisi,
    kalemSayisiYazi,
    solLogo: settings?.logoLeft || null,
    sagLogo: settings?.logoRight || null,
    kurumUst: parentInstitutionName,
    kurumAdi: institutionName,
    mudurluk: rawHarcamaBirimi,
    idareAdi: idareAdi,
    baskanAdi: dosyaResData?.onaylayan_ad_soyad || 'Harcama Yetkilisi Belirtilmedi',
    baskanUnvan: dosyaResData?.onaylayan_unvan || 'Harcama Yetkilisi',
    teminNo: dosyaResData?.temin_no || 'Belirtilmedi',
    teminSekli: teminSekliText,
    maddeNo: dosyaResData?.ihale_sekli || '22/d',
    yaklasikMaliyet: yaklasikMaliyetText,
    odenekTutari: settings?.kullanilabilirOdenek || '500.000,00 TL',
    projeNo: dosyaResData?.yatirim_proje_no || 'Yok',
    butceTertibi: butceTertibiArray,
    butceKodu: rawButceKodu || 'Belirtilmedi',
    avansSartlari:
      dosyaResData?.avans_verilecek_mi === 1 ? 'Avans verilecektir.' : 'Avans verilmeyecek',
    fiyatFarkiSartlari: dosyaResData?.fiyat_farki_dayanagi || 'Fiyat Farkı Ödenmeyecek',
    yillaraYaygin: dosyaResData?.yillara_yaygin === 1 ? 'Yıllara Yaygın Hizmet Alımı' : 'Hayır',
    sozlesmeYapilacak: dosyaResData?.sozlesme_yapilacak_mi === 1 ? 'Evet' : 'Hayır',
    hesaplamaEsasi: dosyaResData?.hesaplama_esasi || 'Ortalama fiyat esasına göre',
    isOrtalama: isAverageBasis,
    isEnDusuk: isLowestBasis,
    vkomisyontakdiri:
      dosyaResData?.komisyon_takdiri || 'Sadece araştırma fiyatları dikkate alınacak',
    komisyonTakdiri:
      dosyaResData?.komisyon_takdiri || 'Sadece araştırma fiyatları dikkate alınacak',
    dokumanHazirlik: 'Hazırlanmayacaktır.',
    isinAciklamasi: dosyaResData?.isin_aciklamasi || dosyaResData?.konu || 'Belirtilmedi',
    onaylayanPersonelAdi: dosyaResData?.onaylayan_ad_soyad || 'Harcama Yetkilisi Belirtilmedi',
    onaylayanPersonelUnvan: dosyaResData?.onaylayan_unvan || 'Harcama Yetkilisi',
    onaylayanlar: [
      {
        onaylayanPersonelAdi: dosyaResData?.onaylayan_ad_soyad || 'Harcama Yetkilisi Belirtilmedi',
        onaylayanPersonelUnvan: dosyaResData?.onaylayan_unvan || 'Harcama Yetkilisi'
      }
    ],
    komisyon: commission.map((c: any) => ({
      adSoyad: c.ad_soyad,
      unvan: c.unvan,
      gorevi: c.gorevi
    })),
    fiyatKomisyonu: commission.map((c: any) => ({
      adSoyad: c.ad_soyad,
      unvan: c.unvan,
      gorevi: c.gorevi
    })),
    muayeneKomisyonu: muayeneKomisyonu.map((c: any) => ({
      adSoyad: c.ad_soyad,
      unvan: c.unvan,
      gorevi: c.gorevi
    })),
    hazirlayanPersonelAdi: dosyaResData?.hazirlayan_ad_soyad || 'Görevli Personel',
    hazirlayanPersonelUnvan: dosyaResData?.hazirlayan_unvan || 'Unvan Belirtilmedi',
    hazirlayanTelefon: dosyaResData?.hazirlayan_telefon || '',
    hazirlayanEposta: dosyaResData?.hazirlayan_eposta || '',
    // Turkish characters compatibility helper
    hazırlayanPersonelUnvan: dosyaResData?.hazirlayan_unvan || 'Unvan Belirtilmedi',
    hazırlayanEposta: dosyaResData?.hazirlayan_eposta || '',
    talepEdenPersonelAdi: dosyaResData?.talep_eden_ad_soyad || 'Belirtilmedi',
    talepEdenPersonelUnvan: dosyaResData?.talep_eden_unvan || '',
    talepEdenTelefon: dosyaResData?.talep_eden_telefon || '',
    sunanPersonelAdi: dosyaResData?.sunan_ad_soyad || 'Belirtilmedi',
    sunanPersonelUnvan: dosyaResData?.sunan_unvan || '',
    sunanTelefon: dosyaResData?.sunan_telefon || '',
    ilgiliPersonelAdi: dosyaResData?.irtibat_ad_soyad || 'Belirtilmedi',
    ilgiliPersonelUnvan: dosyaResData?.irtibat_unvan || '',
    ilgiliTelefon: dosyaResData?.irtibat_telefon || '',
    irtibatTelefon: dosyaResData?.irtibat_telefon || '',
    firmalar: firms.map((f: any) => ({ unvan: f.unvan })),
    firmalarColspan: firms.length + 2,
    firmaToplamlari,
    firmaToplamlariDetay: firmaToplamlari,
    genelToplam,
    genelToplamYazi: paraYaziyaCevir(grandTotal),
    sozlesmeBedeli: genelToplam,
    sozlesmeBedeliYazi: paraYaziyaCevir(grandTotal),
    pulBedeli: formatTR(grandTotal * 0.00948),
    teklifler: calculatedTeklifler,
    enAvantajliTeklifSahibi,
    enAvantajliTeklifBedeli,
    ikinciAvantajliTeklifSahibi,
    ikinciAvantajliTeklifBedeli,
    ihaleKomisyonu: commission.map((c: any) => ({
      adSoyad: c.ad_soyad,
      unvan: c.unvan,
      gorevi: c.gorevi
    }))
  }

  // Güvenli birleştirme (Safe Merge): resolvedMappings içindeki placeholder (örn. [Belirtilmedi:...])
  // olan değerlerin, veritabanından gelen dolu/geçerli değerlerin üzerine yazmasını engeller.
  for (const [key, val] of Object.entries(resolvedMappings || {})) {
    if (val !== undefined && val !== null) {
      const isPlaceholder = typeof val === 'string' && val.startsWith('[Belirtilmedi')
      const hasRealValue =
        context[key] !== undefined &&
        context[key] !== '' &&
        !String(context[key]).startsWith('[Belirtilmedi')
      if (isPlaceholder && hasRealValue) {
        continue
      }
      context[key] = val
    }
  }

  // Evrak sayısı için özel durum kontrolü (eğer veritabanından ham temin_no gelmişse veya belirtilmemişse formatlanmış halini kullanalım)
  let finalEvrakSayisi = resolvedMappings.evrakSayisi
  if (
    !finalEvrakSayisi ||
    String(finalEvrakSayisi).startsWith('[Belirtilmedi') ||
    finalEvrakSayisi === dosyaSayisi
  ) {
    finalEvrakSayisi = formattedEvrakSayisi
  }
  context.evrakSayisi = finalEvrakSayisi

  // Sadece mapping dosyasında tanımlıysa şablona gönderilsin
  if (
    resolvedMappings.antetSatirlari !== undefined &&
    (resolvedMappings.antetSatirlari === null ||
      String(resolvedMappings.antetSatirlari).startsWith('[Belirtilmedi'))
  ) {
    context.antetSatirlari = antetSatirlari
  } else if (resolvedMappings.antetSatirlari !== undefined) {
    context.antetSatirlari = resolvedMappings.antetSatirlari
  }

  if (
    resolvedMappings.ihtiyacKalemleri !== undefined &&
    (resolvedMappings.ihtiyacKalemleri === null ||
      String(resolvedMappings.ihtiyacKalemleri).startsWith('[Belirtilmedi'))
  ) {
    context.ihtiyacKalemleri = needItems
  } else if (resolvedMappings.ihtiyacKalemleri !== undefined) {
    context.ihtiyacKalemleri = resolvedMappings.ihtiyacKalemleri
  }

  return context
}
