import { ProcessMapping } from './types'

export const HarcamaTalimatiMapping: ProcessMapping = {
  evrakSayisi: {
    formul: '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no_clean}}',
    aciklama: 'DETSİS No - Yıl - Dosya No'
  },
  tarih: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onay_tarihi',
    aciklama: 'Onay Tarihi'
  },
  idareAdi: {
    tablo: 'TANIM_Kurum',
    sutun: 'kurum_adi',
    aciklama: 'İdare Adı'
  },
  gerekce: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'isin_gerekcesi',
    aciklama: 'Alımın Gerekçesi'
  },
  isAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'konu',
    aciklama: 'İşin Adı'
  },
  sure: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'isin_suresi',
    aciklama: 'İşin Süresi'
  },
  teminSekli: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'ihale_usulu',
    aciklama: 'Temin Åekli / Usulü'
  },
  yaklasikMaliyet: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'yaklasik_maliyet',
    aciklama: 'Yaklaşık Maliyet'
  },
  odenekTutari: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'odenek_tutari',
    aciklama: 'Ödenek Tutarı'
  },
  butceTertibi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'butce_tertibi',
    aciklama: 'Bütçe Tertibi'
  },
  aciklama: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'isin_aciklamasi',
    aciklama: 'İşin Açıklaması'
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
  onaylayanPersonelAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_ad',
    aciklama: 'Harcama Yetkilisi / Onaylayan Yetkili'
  },
  onaylayanPersonelUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_unvan',
    aciklama: 'Onaylayan Personel Ünvanı'
  }
}

