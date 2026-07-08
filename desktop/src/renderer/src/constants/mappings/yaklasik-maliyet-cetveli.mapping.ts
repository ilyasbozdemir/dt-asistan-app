import { ProcessMapping } from './types'

export const YaklasikMaliyetCetveliMapping: ProcessMapping = {
  antetSatirlari: {
    tablo: 'TANIM_Kurum',
    sutun: 'kurum_anteti',
    aciklama: 'Kurum Anteti'
  },
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
  isAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'konu',
    aciklama: 'İşin Adı'
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
  genelToplam: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'yaklasik_maliyet',
    aciklama: 'Genel Yaklaşık Maliyet Toplamı'
  },
  baskanAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_ad',
    aciklama: 'Onaylayan Yetkili (Harcama Yetkilisi)'
  },
  baskanUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_unvan',
    aciklama: 'Onaylayan Personel Ünvanı'
  },
  ihtiyacKalemleri: {
    tablo: 'DATA_TeminKalem',
    sutun: '*',
    iliskili_id: 'temin_dosya_id',
    altEslestirme: {
      siraNo: 'id',
      malzemeAdi: 'kalem_adi',
      ozelligi: 'aciklama',
      birimi: 'birim',
      miktar: 'miktar'
    },
    aciklama: 'Yaklaşık Maliyet Malzeme Kalemleri'
  }
}
