import { ProcessMapping } from './types'

export const IhtiyacListesiMapping: ProcessMapping = {
  // DATA_TeminDosyasi Tablosundan Çekilecekler
  dosyaTarihi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'tarih',
    aciklama: 'Dosyanın oluşturulma tarihi'
  },
  isAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'konu',
    aciklama: 'Dosyanın konusu veya işin adı'
  },
  teminSekli: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'ihale_sekli',
    aciklama: 'Temin usulü (Örn: 22/d)'
  },
  evrakSayisi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'temin_no',
    aciklama: 'Temin numarası veya evrak kayıt sayısı'
  },
  yaklasikMaliyet: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'yaklasik_maliyet',
    aciklama: 'KDV hariç yaklaşık maliyet tutarı'
  },
  
  // TANIM_Personel Tablosundan Çekilecekler (Örnek)
  personelAdi: {
    tablo: 'TANIM_Personel',
    sutun: 'ad_soyad',
    iliskili_id: 'onay_personel_id',
    aciklama: 'Dosyayı onaylayan harcama yetkilisi veya personel adı'
  },
  personelUnvan: {
    tablo: 'TANIM_Personel',
    sutun: 'unvan',
    iliskili_id: 'onay_personel_id',
    aciklama: 'Dosyayı onaylayan personelin unvanı'
  },

  // TANIM_Firma Tablosundan Çekilecekler (Örnek)
  firmaUnvan: {
    tablo: 'TANIM_Firma',
    sutun: 'unvan',
    iliskili_id: 'firma_id',
    aciklama: 'İhaleyi alan veya teklif veren firmanın unvanı'
  },
  firmaAdres: {
    tablo: 'TANIM_Firma',
    sutun: 'adres',
    iliskili_id: 'firma_id',
    aciklama: 'Firmanın açık adresi'
  },
  firmaVergiNo: {
    tablo: 'TANIM_Firma',
    sutun: 'vergi_no',
    iliskili_id: 'firma_id',
    aciklama: 'Firmanın vergi kimlik numarası'
  }
}
