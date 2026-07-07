import { ProcessMapping } from './types'

export const LuzumMuzekkeresiMapping: ProcessMapping = {
  antetSatirlari: {
    tablo: 'TANIM_Kurum',
    sutun: 'kurum_anteti',
    aciklama: 'DosyanÄ±n antet satÄ±rlarÄ±'
  },
  dosyaKonusu: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Dosya Konusu' },
  evrakSayisi: {
    formul:
      '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no_clean}}',
    aciklama: 'DETSÄ°S No - YÄ±l - Dosya No birleÅŸimi olarak otomatik Ã¼retilir'
  },
  sunulacakMakamAdi: {
    tablo: 'TANIM_Kurum',
    sutun: 'makam_adi',
    aciklama: 'Sunulacak makam adÄ±'
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
    aciklama: 'LÃ¼zum MÃ¼zekkeresi kalemleri'
  },
  ihtiyacYeri: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'ihtiyac_yeri',
    aciklama: 'LÃ¼zum MÃ¼zekkeresi yerleri'
  },
  isinAciklamasi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'isin_aciklamasi',
    aciklama: 'Ä°ÅŸin AÃ§Ä±klamasÄ±/AÃ§Ä±klama'
  },
  olurYazisi: {
    deger: true,
    aciklama: 'Olur yazÄ±sÄ± oluÅŸturulacak'
  },
  kurumIci: {
    deger: true,
    aciklama: 'Kurum iÃ§i mi?'
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
  hazirlayanTelefon: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'hazirlayan_telefon',
    varsayilan: '',
    aciklama: 'HazÄ±rlayan personelin irtibat numarasÄ±'
  },
  ilgiliTelefon: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'irtibat_telefon',
    varsayilan: '',
    aciklama: 'Ä°rtibat yetkilisinin telefon numarasÄ±'
  },
  talepEdenTelefon: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'talep_eden_telefon',
    varsayilan: '',
    aciklama: 'Talep eden personelin telefon numarasÄ±'
  },
  sunanTelefon: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'sunan_telefon',
    varsayilan: '',
    aciklama: 'Sunan personelin telefon numarasÄ±'
  },
  talepEdenPersonelAdi: {
    tablo: 'TANIM_Personel',
    sutun: 'ad_soyad',
    aciklama: 'Talep eden personelin adÄ± soyadÄ±'
  },
  talepEdenPersonelUnvan: {
    tablo: 'TANIM_Personel',
    sutun: 'unvan',
    aciklama: 'Talep eden personelin Ã¼nvanÄ±'
  }
}

