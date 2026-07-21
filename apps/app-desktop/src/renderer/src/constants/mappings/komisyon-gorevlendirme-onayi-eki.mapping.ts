import { ProcessMapping } from './types'

export const KomisyonGorevlendirmeOnayiEkiMapping: ProcessMapping = {
  kurumUst: {
    tablo: 'TANIM_Kurum',
    sutun: 'ust_idari_birim',
    aciklama: 'Üst İdari Birim'
  },
  kurumAdi: {
    tablo: 'TANIM_Kurum',
    sutun: 'kurum_adi',
    aciklama: 'Kurum Adı'
  },
  mudurluk: {
    tablo: 'TANIM_Kurum',
    sutun: 'makam_adi',
    aciklama: 'Müdürlük / Makam'
  },
  kurumumuz: {
    tablo: 'TANIM_Kurum',
    sutun: 'kurum_adi',
    aciklama: 'Kurum Adı'
  },
  alimTuru: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'alim_turu',
    aciklama: 'Alım Türü'
  },
  evrakSayisi: {
    formul:
      '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no_clean}}',
    aciklama: 'DETSİS No - Yıl - Dosya No birleşimi'
  },
  tarih: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onay_tarihi',
    aciklama: 'Onay Tarihi'
  },
  dosyaTarihi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'dosya_tarihi',
    aciklama: 'Dosya Tarihi'
  },
  isAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'konu',
    aciklama: 'İşin Adı'
  },
  hazirlayanPersonelAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'hazirlayan_personel_ad',
    aciklama: 'Hazırlayan Personel'
  },
  hazirlayanPersonelUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'hazirlayan_personel_unvan',
    aciklama: 'Hazırlayan Personel Ünvanı'
  },
  baskanAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_ad',
    aciklama: 'Belediye Başkanı / Harcama Yetkilisi'
  },
  baskanUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_unvan',
    aciklama: 'Onaylayan Personel Ünvanı'
  },
  ekNo: {
    deger: '2',
    aciklama: 'Onay Eki Numarası'
  },
  kurumIci: {
    deger: true,
    aciklama: 'Kurum içi mi?'
  },
  fiyatKomisyonu: {
    tablo: 'DATA_TeminKomisyon',
    sutun: '*',
    aciklama: 'Piyasa Araştırma ve Satınalma Komisyon Üyeleri'
  },
  muayeneKomisyonu: {
    tablo: 'DATA_TeminKomisyon',
    sutun: '*',
    aciklama: 'Muayene Kabul ve Teslim Alma Komisyon Üyeleri'
  }
}
