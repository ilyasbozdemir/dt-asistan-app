import { ProcessMapping } from './types'

export const MuayeneKabulKomisyonuMapping: ProcessMapping = {
  antetSatirlari: {
    tablo: 'TANIM_Kurum',
    sutun: 'kurum_anteti',
    aciklama: 'Kurum Anteti'
  },
  detsisNo: {
    tablo: 'TANIM_Kurum',
    sutun: 'detsis_kodu',
    aciklama: 'Kurum DETSÄ°S NumarasÄ±'
  },
  yili: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'butce_yili',
    aciklama: 'BÃ¼tÃ§e YÄ±lÄ±'
  },
  sayisi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'temin_no_clean',
    aciklama: 'Temin NumarasÄ±'
  },
  dosyaKonusu: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Dosya Konusu' },
  dosyaTarihi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'dosya_tarihi',
    aciklama: 'Dosya Tarihi'
  },
  kurumumuz: {
    tablo: 'TANIM_Kurum',
    sutun: 'kurum_adi',
    aciklama: 'Kurum AdÄ±'
  },
  isinAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'konu',
    aciklama: 'Ä°ÅŸin AdÄ±'
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
    aciklama: 'Onaylayan Yetkili (Harcama Yetkilisi)'
  },
  onaylayanPersonelUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_unvan',
    aciklama: 'Onaylayan Yetkili ÃœnvanÄ±'
  },
  kurumAdres: {
    tablo: 'TANIM_Kurum',
    sutun: 'adres',
    aciklama: 'Kurum Adresi'
  },
  kurumTelefon: {
    tablo: 'TANIM_Kurum',
    sutun: 'telefon',
    aciklama: 'Kurum Telefonu'
  },
  kurumFaks: {
    tablo: 'TANIM_Kurum',
    sutun: 'faks',
    aciklama: 'Kurum FaksÄ±'
  },
  kurumWeb: {
    tablo: 'TANIM_Kurum',
    sutun: 'web_sitesi',
    aciklama: 'Kurum Web Sitesi'
  },
  kurumEposta: {
    tablo: 'TANIM_Kurum',
    sutun: 'eposta',
    aciklama: 'Kurum E-Posta'
  },
  kurumKep: {
    tablo: 'TANIM_Kurum',
    sutun: 'kep_adresi',
    aciklama: 'Kurum KEP Adresi'
  },
  kurumIci: {
    deger: true,
    aciklama: 'Kurum iÃ§i mi?'
  }
}

