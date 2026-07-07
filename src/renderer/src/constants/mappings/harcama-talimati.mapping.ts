import { ProcessMapping } from './types'

export const HarcamaTalimatiMapping: ProcessMapping = {
  evrakSayisi: {
    formul: '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no_clean}}',
    aciklama: 'DETSÄ°S No - YÄ±l - Dosya No'
  },
  tarih: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onay_tarihi',
    aciklama: 'Onay Tarihi'
  },
  idareAdi: {
    tablo: 'TANIM_Kurum',
    sutun: 'kurum_adi',
    aciklama: 'Ä°dare AdÄ±'
  },
  gerekce: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'isin_gerekcesi',
    aciklama: 'AlÄ±mÄ±n GerekÃ§esi'
  },
  isAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'konu',
    aciklama: 'Ä°ÅŸin AdÄ±'
  },
  sure: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'isin_suresi',
    aciklama: 'Ä°ÅŸin SÃ¼resi'
  },
  teminSekli: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'ihale_usulu',
    aciklama: 'Temin Åekli / UsulÃ¼'
  },
  yaklasikMaliyet: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'yaklasik_maliyet',
    aciklama: 'YaklaÅŸÄ±k Maliyet'
  },
  odenekTutari: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'odenek_tutari',
    aciklama: 'Ã–denek TutarÄ±'
  },
  butceTertibi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'butce_tertibi',
    aciklama: 'BÃ¼tÃ§e Tertibi'
  },
  aciklama: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'isin_aciklamasi',
    aciklama: 'Ä°ÅŸin AÃ§Ä±klamasÄ±'
  },
  hazirlayanPersonelAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'hazirlayan_personel_ad',
    aciklama: 'HazÄ±rlayan Personel'
  },
  hazirlayanPersonelUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'hazirlayan_personel_unvan',
    aciklama: 'HazÄ±rlayan Personel ÃœnvanÄ±'
  },
  onaylayanPersonelAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_ad',
    aciklama: 'Harcama Yetkilisi / Onaylayan Yetkili'
  },
  onaylayanPersonelUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_unvan',
    aciklama: 'Onaylayan Personel ÃœnvanÄ±'
  }
}

