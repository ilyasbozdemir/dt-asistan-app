import { ProcessMapping } from './types'

export const SonAlimFiyatCetveliMapping: ProcessMapping = {
  antetSatirlari: {
    tablo: 'TANIM_Kurum',
    sutun: 'kurum_anteti',
    aciklama: 'DosyanÄ±n antet satÄ±rlarÄ±'
  },
  dosyaKonusu: {
    deger: 'Son AlÄ±m Fiyat Cetveli',
    aciklama: 'Belgenin konusu'
  },
  evrakSayisi: {
    formul:
      '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no_clean}}',
    aciklama: 'DETSÄ°S No - YÄ±l - Dosya No birleÅŸimi'
  },
  tarih: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'olusturma_tarihi',
    aciklama: 'Dosya tarihi'
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
  hazirlayanPersonelAdi: {
    tablo: 'TANIM_Personel',
    sutun: 'ad_soyad',
    aciklama: 'HazÄ±rlayan personelin adÄ± soyadÄ±'
  },
  hazirlayanPersonelUnvan: {
    tablo: 'TANIM_Personel',
    sutun: 'unvan',
    aciklama: 'HazÄ±rlayan personelin Ã¼nvanÄ±'
  },
  hazirlayanTelefon: {
    tablo: 'TANIM_Personel',
    sutun: 'telefon',
    varsayilan: '',
    aciklama: 'HazÄ±rlayan personelin telefonu'
  },
  hazirlayanEposta: {
    tablo: 'TANIM_Personel',
    sutun: 'eposta',
    varsayilan: '',
    aciklama: 'HazÄ±rlayan personelin e-postasÄ±'
  },
  kontrolEdenPersonelAdi: {
    tablo: 'TANIM_Personel',
    sutun: 'ad_soyad',
    aciklama: 'Kontrol eden personelin adÄ± soyadÄ±'
  },
  kontrolEdenPersonelUnvan: {
    tablo: 'TANIM_Personel',
    sutun: 'unvan',
    aciklama: 'Kontrol eden personelin Ã¼nvanÄ±'
  },
  fiyatKalemleri: {
    tablo: 'DATA_TeminKalem',
    sutun: '*',
    iliskili_id: 'temin_dosya_id',
    altEslestirme: {
      malzemeKodu: 'tasinir_kodu',
      malzemeAdi: 'kalem_adi',
      ozelligi: 'aciklama',
      birimi: 'birim',
      kdvOrani: 'kdv_orani',
      miktar: 'miktar',
      birimFiyat: 'birim_fiyat',
      toplamTutar: 'toplam_tutar',
      kazananFirma: 'kazanan_firma',
      alimTarihi: 'alim_tarihi'
    },
    aciklama: 'Son alÄ±m fiyat cetveli kalemleri'
  }
}

