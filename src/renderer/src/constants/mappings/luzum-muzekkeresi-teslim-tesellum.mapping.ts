import { ProcessMapping } from './types'

export const LuzumTeslimTesellumMapping: ProcessMapping = {
  antetSatirlari: {
    tablo: 'TANIM_Kurum',
    sutun: 'kurum_anteti',
    aciklama: 'Dosyanın antet satırları'
  },
  dosyaKonusu: {
    deger: 'TESLİM TESELLÜM BELGESİ',
    aciklama: 'Belgenin konusu'
  },
  isinAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'dosya_adi',
    aciklama: 'İşin adı'
  },
  kurumIci: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'kurum_ici',
    deger: false,
    aciklama: 'Kurum içi mi?'
  },
  kurumumu: {
    tablo: 'TANIM_Kurum',
    sutun: 'kurum_adi',
    aciklama: 'Kurumun adı'
  },
  dosyaNumarasi: {
    formul: '{{DATA_TeminDosyasi.butce_yili}}-{{DATA_TeminDosyasi.temin_no_clean}}',
    aciklama: 'Yıl-Dosya no birleşimi'
  },
  dosyaTarihi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'olusturma_tarihi',
    aciklama: 'Dosya tarihi'
  },
  ihtiyacKalemleri: {
    tablo: 'DATA_TeminKalem',
    sutun: '*',
    iliskili_id: 'temin_dosya_id',
    altEslestirme: {
      kodu: 'tasinir_kodu',
      malzemeAdi: 'kalem_adi',
      ozelligi: 'aciklama',
      birimi: 'birim',
      kdvOrani: 'kdv_orani',
      miktar: 'miktar'
    },
    aciklama: 'Teslim tesellüm kalemleri'
  },
  teslimAlanlar: {
    tablo: 'DATA_TeminKomisyonUye',
    sutun: '*',
    iliskili_id: 'temin_dosya_id',
    altEslestirme: {
      adSoyad: 'ad_soyad',
      unvan: 'unvan'
    },
    aciklama: 'Teslim alan kişiler'
  }
}
