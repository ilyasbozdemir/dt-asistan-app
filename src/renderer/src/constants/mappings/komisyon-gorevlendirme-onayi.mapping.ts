import { ProcessMapping } from './types'

export const KomisyonGorevlendirmeOnayiMapping: ProcessMapping = {
  kurumUst: {
    tablo: 'TANIM_Kurum',
    sutun: 'ust_idari_birim',
    aciklama: 'Ãœst Ä°dari Birim'
  },
  kurumAdi: {
    tablo: 'TANIM_Kurum',
    sutun: 'kurum_adi',
    aciklama: 'Kurum AdÄ±'
  },
  mudurluk: {
    tablo: 'TANIM_Kurum',
    sutun: 'makam_adi',
    aciklama: 'MÃ¼dÃ¼rlÃ¼k / Makam'
  },
  kurumumuz: {
    tablo: 'TANIM_Kurum',
    sutun: 'kurum_adi',
    aciklama: 'Kurum AdÄ±'
  },
  alimTuru: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'alim_turu',
    aciklama: 'AlÄ±m TÃ¼rÃ¼'
  },
  evrakSayisi: {
    formul: '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no_clean}}',
    aciklama: 'DETSÄ°S No - YÄ±l - Dosya No birleÅŸimi'
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
  baskanAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_ad',
    aciklama: 'Belediye BaÅŸkanÄ± / Harcama Yetkilisi'
  },
  baskanUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_unvan',
    aciklama: 'Onaylayan Personel ÃœnvanÄ±'
  },
  kurumIci: {
    deger: true,
    aciklama: 'Kurum iÃ§i mi?'
  }
}

