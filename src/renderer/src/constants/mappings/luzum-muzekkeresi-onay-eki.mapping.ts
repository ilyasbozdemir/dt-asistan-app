import { ProcessMapping } from './types'

export const LuzumOnayEkiMapping: ProcessMapping = {
  antetSatirlari: {
    tablo: 'TANIM_Kurum',
    sutun: 'kurum_anteti',
    aciklama: 'DosyanÄ±n antet satÄ±rlarÄ±'
  },
  dosyaKonusu: {
    deger: 'LÃ¼zum MÃ¼zekkeresi',
    aciklama: 'Belgenin konusu'
  },
  ekNo: {
    deger: '1',
    aciklama: 'Ek numarasÄ±'
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
    aciklama: 'Onay eki kalemleri'
  },
  dosyaTarihi: {
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
  }
}

