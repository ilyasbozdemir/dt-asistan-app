import { AIFormContext } from '../../components/ui/AIFormFillModal'
import { TeminDosyasi } from './dosyalar.hooks'
import { DBBirim } from './types'

export const DOLDURULACAK_ALANLAR: AIFormContext['doldurulacakAlanlar'] = [
  {
    alan: 'konu',
    etiket: 'İhale / Dosya Konusu',
    tip: 'text',
    zorunlu: true,
    ornekDeger: 'Fen İşleri Kırtasiye Malzemesi Alımı'
  },
  {
    alan: 'isin_aciklamasi',
    etiket: 'İşin Açıklaması / Kapsamı',
    tip: 'textarea'
  },
  {
    alan: 'temin_no',
    etiket: 'Doğrudan Temin Numarası',
    tip: 'text',
    ornekDeger: '2026/DT-001'
  },
  {
    alan: 'dosya_acilis_tarihi',
    etiket: 'Dosya Açılış Tarihi',
    tip: 'date'
  },
  { alan: 'butce_yili', etiket: 'Bütçe Yılı', tip: 'number' },
  { alan: 'butce_tipi', etiket: 'Bütçe Tipi', tip: 'text' },
  {
    alan: 'sunulacak_makam',
    etiket: 'Evrakın Sunulacağı Makam',
    tip: 'text',
    ornekDeger: 'BAŞKANLIK MAKAMINA'
  },
  { alan: 'ihtiyac_yeri', etiket: 'İhtiyaç Yeri', tip: 'text' },
  {
    alan: 'antet_ek_satir',
    etiket: 'Antet Ek Satır',
    tip: 'text'
  },
  { alan: 'e_butce', etiket: 'e-Bütçe Kodu', tip: 'text' },
  {
    alan: 'fonksiyonel_kod',
    etiket: 'Fonksiyonel Kod',
    tip: 'text'
  },
  {
    alan: 'muhasebe_birimi',
    etiket: 'Muhasebe Birimi Kodu',
    tip: 'text'
  },
  {
    alan: 'harcama_birimi',
    etiket: 'Harcama Birimi Kodu',
    tip: 'text'
  },
  {
    alan: 'finansman_kodu',
    etiket: 'Finansman Kodu',
    tip: 'text'
  },
  { alan: 'ekonomik_kod', etiket: 'Ekonomik Kod', tip: 'text' },
  { alan: 'ihale_tipi', etiket: 'İhale Tipi', tip: 'text' },
  {
    alan: 'tur',
    etiket: 'Tür (mal/hizmet/yapim/danismanlik)',
    tip: 'text'
  },
  {
    alan: 'ihale_sekli',
    etiket: 'İhale Şekli (22/d* vb.)',
    tip: 'text'
  },
  {
    alan: 'teklif_sozlesme_turu',
    etiket: 'Teklif/Sözleşme Türü',
    tip: 'text'
  },
  {
    alan: 'alt_yuklenici_olacak_mi',
    etiket: 'Alt Yüklenici (0/1)',
    tip: 'number'
  },
  {
    alan: 'kismi_teklif_verilecek_mi',
    etiket: 'Kısmi Teklif (0/1)',
    tip: 'number'
  },
  {
    alan: 'fiyat_farki_dayanagi',
    etiket: 'Fiyat Farkı Dayanağı',
    tip: 'text'
  },
  {
    alan: 'yatirim_proje_no',
    etiket: 'Yatırım Proje No',
    tip: 'text'
  },
  {
    alan: 'avans_verilecek_mi',
    etiket: 'Avans Verilecek (0/1)',
    tip: 'number'
  },
  {
    alan: 'yillara_yaygin',
    etiket: 'Yıllara Yaygın Hizmet (0/1)',
    tip: 'number'
  },
  {
    alan: 'sozlesme_yapilacak_mi',
    etiket: 'Sözleşme Yapılacak mı (0/1)',
    tip: 'number'
  },
  {
    alan: 'yaklasik_maliyet_hesaplamasi',
    etiket: 'Yaklaşık Maliyet Hesaplama Yöntemi',
    tip: 'text'
  },
  { alan: 'kdv', etiket: 'KDV Oranı (%)', tip: 'text' },
  {
    alan: 'hesaplama_esasi',
    etiket: 'Hesaplama Esası',
    tip: 'text'
  },
  {
    alan: 'komisyon_takdiri',
    etiket: 'Hesaplama Yöntemi / Dayanağı',
    tip: 'text'
  },
  {
    alan: 'tibbi_cihaz_alimi_mi',
    etiket: 'Tıbbi Cihaz Alımı (0/1)',
    tip: 'number'
  },
  {
    alan: 'son_teklif_verme_tarihi',
    etiket: 'Son Teklif Verme Tarihi',
    tip: 'date'
  },
  {
    alan: 'teslim_tarihi',
    etiket: 'Teslim Tarihi',
    tip: 'date'
  },
  {
    alan: 'yaklasik_maliyet',
    etiket: 'Yaklaşık Maliyet (₺)',
    tip: 'number'
  },
  { alan: 'butce_kodu', etiket: 'Bütçe Kodu', tip: 'text' },
  { alan: 'temin_tarihi', etiket: 'Temin Tarihi', tip: 'date' },
  { alan: 'notlar', etiket: 'Notlar', tip: 'textarea' }
]

export function buildAIFormContext(
  formData: Partial<TeminDosyasi>,
  birimler: DBBirim[],
  institutionName: string
): AIFormContext {
  const selectedBirim = birimler.find((b) => b.id === formData.birim_id)
  return {
    formTitle: 'Yeni Doğrudan Temin Dosyası',
    kurumBilgisi: {
      birimAdi: selectedBirim?.birim_adi,
      sunulacakMakam: formData.sunulacak_makam || selectedBirim?.sunum_makami,
      antetEkSatir: formData.antet_ek_satir || selectedBirim?.antet_ek_satir,
      ihtiyacYeri: formData.ihtiyac_yeri || selectedBirim?.ihtiyac_yeri_eki,
      kurumAdi: institutionName !== 'Kurum Adı Bulunamadı' ? institutionName : 'Kurum'
    },
    mevcutDegerler: {
      konu: formData.konu,
      temin_no: formData.temin_no,
      sunulacak_makam: formData.sunulacak_makam,
      birim: selectedBirim?.birim_adi,
      butce_yili: formData.butce_yili
    },
    doldurulacakAlanlar: DOLDURULACAK_ALANLAR
  }
}
