import { ProcessMapping } from './types'

export const LuzumTeslimTesellumMapping: ProcessMapping = {
  antetSatirlari: {
    tablo: 'TANIM_Kurum',
    sutun: 'kurum_anteti',
    aciklama: 'DosyanÄ±n antet satÄ±rlarÄ±'
  },
  dosyaKonusu: {
    deger: 'TESLÄ°M TESELLÃœM BELGESÄ°',
    aciklama: 'Belgenin konusu'
  },
  isinAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'dosya_adi',
    aciklama: 'Ä°ÅŸin adÄ±'
  },
  kurumIci: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'kurum_ici',
    deger: true,
    aciklama: 'Kurum iÃ§i mi?'
  },
  kurumumu: {
    tablo: 'TANIM_Kurum',
    sutun: 'kurum_adi',
    aciklama: 'Kurumun adÄ±'
  },
  dosyaNumarasi: {
    formul: '{{DATA_TeminDosyasi.butce_yili}}-{{DATA_TeminDosyasi.temin_no_clean}}',
    aciklama: 'YÄ±l-Dosya no birleÅŸimi'
  },
  dosyaTarihi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'olusturma_tarihi',
    aciklama: 'Dosya tarihi'
  },

  kurumAdres: {
    tablo: 'TANIM_Kurum',
    sutun: 'adres',
    varsayilan: '[Adres Belirtilmedi]',
    aciklama: 'Kurum adresi'
  },
  kurumTelefon: {
    tablo: 'TANIM_Kurum',
    sutun: 'telefon',
    varsayilan: '[Telefon Belirtilmedi]',
    aciklama: 'Kurum telefonu'
  },
  kurumFaks: {
    tablo: 'TANIM_Kurum',
    sutun: 'faks',
    varsayilan: '[Faks Belirtilmedi]',
    aciklama: 'Kurum faks'
  },
  kurumWeb: {
    tablo: 'TANIM_Kurum',
    sutun: 'web_sitesi',
    varsayilan: '[Web Adresi Belirtilmedi]',
    aciklama: 'Kurum web sitesi'
  },
  kurumEposta: {
    tablo: 'TANIM_Kurum',
    sutun: 'eposta',
    varsayilan: '[E-Posta Belirtilmedi]',
    aciklama: 'Kurum e-posta adresi'
  },
  kurumKep: {
    tablo: 'TANIM_Kurum',
    sutun: 'kep_adresi',
    varsayilan: '[Kep Adresi Belirtilmedi]',
    aciklama: 'Kurum kep adresi'
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
    aciklama: 'Teslim tesellÃ¼m kalemleri'
  },
  teslimAlanlar: {
    tablo: 'DATA_TeminKomisyonUye',
    sutun: '*',
    iliskili_id: 'temin_dosya_id',
    altEslestirme: {
      adSoyad: 'ad_soyad',
      unvan: 'unvan'
    },
    aciklama: 'Teslim alan kiÅŸiler'
  }
}

