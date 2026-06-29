import { ProcessMapping } from './types'

export const LuzumOnayEkiMapping: ProcessMapping = {
  antetSatirlari: {
    tablo: 'TANIM_Kurum',
    sutun: 'kurum_anteti',
    aciklama: 'Dosyanın antet satırları'
  },
  dosyaKonusu: {
    deger: 'Lüzum Müzekkeresi',
    aciklama: 'Belgenin konusu'
  },
  ekNo: {
    deger: '1',
    aciklama: 'Ek numarası'
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
  }
}
