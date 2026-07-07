import { ProcessMapping } from './types'

// Ortak alanların atanmasını kolaylaştıran yardımcı fonksiyon
const makeCommonFields = (title: string) => ({
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  kurumUst: { tablo: 'TANIM_Kurum', sutun: 'ust_idari_birim', aciklama: 'Üst İdari Birim' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum Adı' },
  mudurluk: { tablo: 'TANIM_Kurum', sutun: 'makam_adi', aciklama: 'Müdürlük / Makam' },
  kurumumuz: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum Adı' },
  dosyaKonusu: { deger: title, aciklama: 'Belge Başlığı / Konusu' },
  evrakSayisi: {
    formul: '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no_clean}}',
    aciklama: 'DETSİS No - Yıl - Dosya No birleşimi'
  },
  kurumAdres: { tablo: 'TANIM_Kurum', sutun: 'adres', aciklama: 'Kurum Adresi' },
  kurumTelefon: { tablo: 'TANIM_Kurum', sutun: 'telefon', aciklama: 'Kurum Telefonu' },
  kurumFaks: { tablo: 'TANIM_Kurum', sutun: 'faks', aciklama: 'Kurum Faksı' },
  kurumWeb: { tablo: 'TANIM_Kurum', sutun: 'web_sitesi', aciklama: 'Kurum Web Sitesi' },
  kurumEposta: { tablo: 'TANIM_Kurum', sutun: 'eposta', aciklama: 'Kurum E-Posta' },
  kurumKep: { tablo: 'TANIM_Kurum', sutun: 'kep_adresi', aciklama: 'Kurum KEP Adresi' },
  kurumIci: { deger: true, aciklama: 'Kurum İçi mi?' }
})

// 1. Araştırma Mektubu
export const ArastirmaMektubuMapping: ProcessMapping = {
  ...makeCommonFields('Araştırma Mektubu'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' },
  tarih: { tablo: 'DATA_TeminDosyasi', sutun: 'onay_tarihi', aciklama: 'Tarih' }
}

// 2. Birim Fiyat Teklif Cetveli
export const BirimFiyatTeklifCetveliMapping: ProcessMapping = {
  ...makeCommonFields('Birim Fiyat Teklif Cetveli'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 3. Birim Fiyat Teklif Mektubu
export const BirimFiyatTeklifMektubuMapping: ProcessMapping = {
  ...makeCommonFields('Birim Fiyat Teklif Mektubu'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 4. Dağıtım Çizelgesi
export const DagitimCizelgesiMapping: ProcessMapping = {
  ...makeCommonFields('Dağıtım Çizelgesi'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 5. Dağıtım Çizelgesi Karma
export const DagitimCizelgesiKarmaMapping: ProcessMapping = {
  ...makeCommonFields('Dağıtım Çizelgesi (Karma)'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 6. Fiyat Araştırma Mektubu
export const FiyatArastirmaMektubuMapping: ProcessMapping = {
  ...makeCommonFields('Fiyat Araştırma Mektubu'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 7. Fiyat Araştırması
export const FiyatArastirmasiMapping: ProcessMapping = {
  ...makeCommonFields('Fiyat Araştırması'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 8. Görevlendirme Yazısı
export const GorevlendirmeYazisiMapping: ProcessMapping = {
  ...makeCommonFields('Görevlendirme Yazısı'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 9. Piyasa Fiyat Araştırma Tutanağı
export const PiyasaFiyatArastirmaTutanagiMapping: ProcessMapping = {
  ...makeCommonFields('Piyasa Fiyat Araştırma Tutanağı'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' },
  toplamBedel: { tablo: 'DATA_TeminDosyasi', sutun: 'yaklasik_maliyet', aciklama: 'Toplam Bedel' }
}

// 10. Teklif Mektubu Dağıtım Çizelgesi
export const TeklifMektubuDagitimCizelgesiMapping: ProcessMapping = {
  ...makeCommonFields('Teklif Mektubu Dağıtım Çizelgesi'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 11. Bütçe Sorgusu
export const ButceSorgusuMapping: ProcessMapping = {
  ...makeCommonFields('Bütçe Sorgusu'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 12. Doğrudan Temin Onay Belgesi
export const DogrudanTeminOnayBelgesiMapping: ProcessMapping = {
  ...makeCommonFields('Doğrudan Temin Onay Belgesi'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' },
  yaklasikMaliyet: { tablo: 'DATA_TeminDosyasi', sutun: 'yaklasik_maliyet', aciklama: 'Yaklaşık Maliyet' }
}

// 13. Doğrudan Temin Sonuç Onay Belgesi
export const DogrudanTeminSonucOnayBelgesiMapping: ProcessMapping = {
  ...makeCommonFields('Doğrudan Temin Sonuç Onay Belgesi'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 14. Doğrudan Temin Sözleşmesi
export const DogrudanTeminSozlesmesiMapping: ProcessMapping = {
  ...makeCommonFields('Doğrudan Temin Sözleşmesi'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 15. Doğrudan Temin Sözleşmesi Alternatif
export const DogrudanTeminSozlesmesiAlternatifMapping: ProcessMapping = {
  ...makeCommonFields('Doğrudan Temin Sözleşmesi (Alternatif)'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 16. Doğrudan Temin Sözleşmesi Uzun
export const DogrudanTeminSozlesmesiUzunMapping: ProcessMapping = {
  ...makeCommonFields('Doğrudan Temin Sözleşmesi (Uzun)'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 17. İdare Onay Belgesi
export const IdareOnayBelgesiMapping: ProcessMapping = {
  ...makeCommonFields('İdare Onay Belgesi'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 18. İhale Komisyon Kararı
export const IhaleKomisyonKarariMapping: ProcessMapping = {
  ...makeCommonFields('İhale Komisyon Kararı'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 19. Kabul Edilen Teklif
export const KabulEdilenTeklifMapping: ProcessMapping = {
  ...makeCommonFields('Kabul Edilen Teklif'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 20. Sözleşmeye Davet
export const SozlesmeyeDavetMapping: ProcessMapping = {
  ...makeCommonFields('Sözleşmeye Davet'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 21. Teklif Mektubu
export const TeklifMektubuMapping: ProcessMapping = {
  ...makeCommonFields('Teklif Mektubu'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 22. Hakediş Raporu
export const HakedisRaporuMapping: ProcessMapping = {
  ...makeCommonFields('Hakediş Raporu'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 23. Harcama Pusulası
export const HarcamaPusulasiMapping: ProcessMapping = {
  ...makeCommonFields('Harcama Pusulası'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 24. Hizmet İşleri Kabul Teklif Belgesi
export const HizmetIsleriKabulTeklifBelgesiMapping: ProcessMapping = {
  ...makeCommonFields('Hizmet İşleri Kabul Teklif Belgesi'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 25. Hizmet İşleri Kabul Tutanağı
export const HizmetIsleriKabulTutanagiMapping: ProcessMapping = {
  ...makeCommonFields('Hizmet İşleri Kabul Tutanağı'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 26. Kabul Edilen Teklif Ödeme
export const KabulEdilenTeklifOdemeMapping: ProcessMapping = {
  ...makeCommonFields('Kabul Edilen Teklif (Ödeme)'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 27. Muayene Kabul Tutanağı
export const MuayeneKabulTutanagiMapping: ProcessMapping = {
  ...makeCommonFields('Muayene Kabul Tutanağı'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 28. Ödeme Emri Belgesi
export const OdemeEmriBelgesiMapping: ProcessMapping = {
  ...makeCommonFields('Ödeme Emri Belgesi'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 29. Ödeme Yazısı
export const OdemeYazisiMapping: ProcessMapping = {
  ...makeCommonFields('Ödeme Yazısı'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 30. Taşınır İşlem Fişi
export const TasinirIslemFisiMapping: ProcessMapping = {
  ...makeCommonFields('Taşınır İşlem Fişi'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 31. İhale Kapağı
export const IhaleKapagiMapping: ProcessMapping = {
  ...makeCommonFields('İhale Kapağı'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 32. Kapak İçi İndeks Şablonu
export const KapakIciIndeksSablonuMapping: ProcessMapping = {
  ...makeCommonFields('Kapak İçi İndeks Şablonu'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 33. Klasör Sırtlığı 3cm
export const KlasorSirtligi3cmMapping: ProcessMapping = {
  ...makeCommonFields('Klasör Sırtlığı 3cm'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 34. Klasör Sırtlığı 5cm
export const KlasorSirtligi5cmMapping: ProcessMapping = {
  ...makeCommonFields('Klasör Sırtlığı 5cm'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}

// 35. Klasör Sırtlığı 7.5cm
export const KlasorSirtligi75cmMapping: ProcessMapping = {
  ...makeCommonFields('Klasör Sırtlığı 7.5cm'),
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_adi', aciklama: 'İşin Adı' }
}
