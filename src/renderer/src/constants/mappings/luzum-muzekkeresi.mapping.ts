import { ProcessMapping } from './types'

export const LuzumMuzekkeresiMapping: ProcessMapping = {
  antetSatirlari: {
    tablo: 'TANIM_Kurum',
    sutun: 'kurum_anteti',
    aciklama: 'Dosyanın antet satırları'
  },
  dosyaKonusu: {
    deger: 'Lüzum Müzekkeresi'
  },
  evrakSayisi: {
    formul:
      '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no_clean}}',
    aciklama: 'DETSİS No - Yıl - Dosya No birleşimi olarak otomatik üretilir'
  },
  sunulacakMakamAdi: {
    tablo: 'TANIM_Kurum',
    sutun: 'makam_adi',
    aciklama: 'Sunulacak makam adı'
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
    aciklama: 'Lüzum Müzekkeresi kalemleri'
  },
  ihtiyacYeri: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'ihtiyac_yeri',
    aciklama: 'Lüzum Müzekkeresi yerleri'
  },
  isinAciklamasi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'isin_aciklamasi',
    aciklama: 'İşin Açıklaması/Açıklama'
  },
  olurYazisi: {
    deger: true,
    aciklama: 'Olur yazısı oluşturulacak'
  },
  kurumIci: {
    deger: true,
    aciklama: 'Kurum içi mi?'
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
    aciklama: 'Hazırlayan personelin irtibat numarası'
  },
  ilgiliTelefon: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'irtibat_telefon',
    varsayilan: '',
    aciklama: 'İrtibat yetkilisinin telefon numarası'
  },
  talepEdenTelefon: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'talep_eden_telefon',
    varsayilan: '',
    aciklama: 'Talep eden personelin telefon numarası'
  },
  sunanTelefon: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'sunan_telefon',
    varsayilan: '',
    aciklama: 'Sunan personelin telefon numarası'
  },
  talepEdenPersonelAdi: {
    tablo: 'TANIM_Personel',
    sutun: 'ad_soyad',
    aciklama: 'Talep eden personelin adı soyadı'
  },
  talepEdenPersonelUnvan: {
    tablo: 'TANIM_Personel',
    sutun: 'unvan',
    aciklama: 'Talep eden personelin ünvanı'
  }
}
