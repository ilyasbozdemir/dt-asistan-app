import { ProcessMapping } from './types'

// ===========================================================
// 1. AraÅŸtÄ±rma Mektubu
// ===========================================================
export const ArastirmaMektubuMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  dosyaKonusu: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Dosya Konusu' },
  hazirlayanPersonelAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'hazirlayan_personel_ad', aciklama: 'HazÄ±rlayan Personel' },
  hazirlayanPersonelUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'hazirlayan_personel_unvan', aciklama: 'HazÄ±rlayan Personel ÃœnvanÄ±' },
  kurumAdres: { tablo: 'TANIM_Kurum', sutun: 'adres', aciklama: 'Kurum Adresi' },
  kurumTelefon: { tablo: 'TANIM_Kurum', sutun: 'telefon', aciklama: 'Kurum Telefonu' },
  kurumEposta: { tablo: 'TANIM_Kurum', sutun: 'eposta', aciklama: 'Kurum E-Posta' },
  kurumKep: { tablo: 'TANIM_Kurum', sutun: 'kep_adresi', aciklama: 'Kurum KEP Adresi' },
  kurumIci: { deger: true },
  ihtiyacKalemleri: {
    tablo: 'DATA_TeminKalem', sutun: '*', iliskili_id: 'temin_dosya_id',
    altEslestirme: { malzemeAdi: 'kalem_adi', ozelligi: 'aciklama', birimi: 'birim', miktar: 'miktar' }
  }
}

// ===========================================================
// 2. Birim Fiyat Teklif Cetveli
// ===========================================================
export const BirimFiyatTeklifCetveliMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  dosyaKonusu: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Dosya Konusu' },
  idareAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Ä°dare AdÄ±' },
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Ä°ÅŸin AdÄ±' },
  hazirlayanPersonelAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'hazirlayan_personel_ad', aciklama: 'HazÄ±rlayan Personel' },
  hazirlayanPersonelUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'hazirlayan_personel_unvan', aciklama: 'HazÄ±rlayan Personel ÃœnvanÄ±' },
  kurumAdres: { tablo: 'TANIM_Kurum', sutun: 'adres', aciklama: 'Kurum Adresi' },
  kurumTelefon: { tablo: 'TANIM_Kurum', sutun: 'telefon', aciklama: 'Kurum Telefonu' },
  kurumEposta: { tablo: 'TANIM_Kurum', sutun: 'eposta', aciklama: 'Kurum E-Posta' },
  kurumKep: { tablo: 'TANIM_Kurum', sutun: 'kep_adresi', aciklama: 'Kurum KEP Adresi' },
  kurumIci: { deger: true },
  ihtiyacKalemleri: {
    tablo: 'DATA_TeminKalem', sutun: '*', iliskili_id: 'temin_dosya_id',
    altEslestirme: { malzemeAdi: 'kalem_adi', ozelligi: 'aciklama', birimi: 'birim', miktar: 'miktar' }
  }
}

// ===========================================================
// 3. Birim Fiyat Teklif Mektubu
// ===========================================================
export const BirimFiyatTeklifMektubuMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Ä°ÅŸin AdÄ±' },
  hazirlayanPersonelAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'hazirlayan_personel_ad', aciklama: 'HazÄ±rlayan Personel' },
  hazirlayanPersonelUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'hazirlayan_personel_unvan', aciklama: 'HazÄ±rlayan Personel ÃœnvanÄ±' },
  kurumAdres: { tablo: 'TANIM_Kurum', sutun: 'adres', aciklama: 'Kurum Adresi' },
  kurumTelefon: { tablo: 'TANIM_Kurum', sutun: 'telefon', aciklama: 'Kurum Telefonu' },
  kurumEposta: { tablo: 'TANIM_Kurum', sutun: 'eposta', aciklama: 'Kurum E-Posta' },
  kurumKep: { tablo: 'TANIM_Kurum', sutun: 'kep_adresi', aciklama: 'Kurum KEP Adresi' },
  kurumIci: { deger: true },
  ihtiyacKalemleri: {
    tablo: 'DATA_TeminKalem', sutun: '*', iliskili_id: 'temin_dosya_id',
    altEslestirme: { malzemeAdi: 'kalem_adi', ozelligi: 'aciklama', birimi: 'birim', miktar: 'miktar' }
  }
}

// ===========================================================
// 4. DaÄŸÄ±tÄ±m Ã‡izelgesi
// ===========================================================
export const DagitimCizelgesiMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  kurumUst: { tablo: 'TANIM_Kurum', sutun: 'ust_idari_birim', aciklama: 'Ãœst Ä°dari Birim' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum AdÄ±' },
  mudurluk: { tablo: 'TANIM_Kurum', sutun: 'makam_adi', aciklama: 'MÃ¼dÃ¼rlÃ¼k / Makam' },
  isAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Ä°ÅŸin AdÄ±' },
  baskanAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_ad', aciklama: 'BaÅŸkan (Onaylayan)' },
  baskanUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_unvan', aciklama: 'BaÅŸkan ÃœnvanÄ±' }
}

// ===========================================================
// 5. DaÄŸÄ±tÄ±m Ã‡izelgesi Karma
// ===========================================================
export const DagitimCizelgesiKarmaMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  kurumUst: { tablo: 'TANIM_Kurum', sutun: 'ust_idari_birim', aciklama: 'Ãœst Ä°dari Birim' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum AdÄ±' },
  mudurluk: { tablo: 'TANIM_Kurum', sutun: 'makam_adi', aciklama: 'MÃ¼dÃ¼rlÃ¼k / Makam' },
  isAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Ä°ÅŸin AdÄ±' },
  baskanAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_ad', aciklama: 'BaÅŸkan (Onaylayan)' },
  baskanUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_unvan', aciklama: 'BaÅŸkan ÃœnvanÄ±' }
}

// ===========================================================
// 6. Fiyat AraÅŸtÄ±rma Mektubu
// ===========================================================
export const FiyatArastirmaMektubuMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Ä°ÅŸin AdÄ±' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum AdÄ±' },
  kurumAdres: { tablo: 'TANIM_Kurum', sutun: 'adres', aciklama: 'Kurum Adresi' },
  kurumTelefon: { tablo: 'TANIM_Kurum', sutun: 'telefon', aciklama: 'Kurum Telefonu' },
  kurumEposta: { tablo: 'TANIM_Kurum', sutun: 'eposta', aciklama: 'Kurum E-Posta' },
  kurumKep: { tablo: 'TANIM_Kurum', sutun: 'kep_adresi', aciklama: 'Kurum KEP Adresi' },
  kurumIci: { deger: true },
  hazirlayanPersonelAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'hazirlayan_personel_ad', aciklama: 'HazÄ±rlayan Personel' },
  hazirlayanPersonelUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'hazirlayan_personel_unvan', aciklama: 'HazÄ±rlayan Personel ÃœnvanÄ±' },
  ihtiyacKalemleri: {
    tablo: 'DATA_TeminKalem', sutun: '*', iliskili_id: 'temin_dosya_id',
    altEslestirme: { malzemeAdi: 'kalem_adi', ozelligi: 'aciklama', birimi: 'birim', miktar: 'miktar' }
  }
}

// ===========================================================
// 7. Fiyat AraÅŸtÄ±rmasÄ± (Tutanak)
// ===========================================================
export const FiyatArastirmasiMapping: ProcessMapping = {
  evrakSayisi: {
    formul: '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no_clean}}',
    aciklama: 'Evrak SayÄ±sÄ±'
  },
  dosyaKonusu: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Dosya Konusu' },
  sunulacakMakamAdi: { tablo: 'TANIM_Kurum', sutun: 'makam_adi', aciklama: 'Sunulacak Makam AdÄ±' },
  hazirlayanPersonelAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'hazirlayan_personel_ad', aciklama: 'HazÄ±rlayan Personel' },
  hazirlayanPersonelUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'hazirlayan_personel_unvan', aciklama: 'HazÄ±rlayan Personel ÃœnvanÄ±' },
  kurumAdres: { tablo: 'TANIM_Kurum', sutun: 'adres', aciklama: 'Kurum Adresi' },
  kurumEposta: { tablo: 'TANIM_Kurum', sutun: 'eposta', aciklama: 'Kurum E-Posta' },
  kurumFaks: { tablo: 'TANIM_Kurum', sutun: 'faks', aciklama: 'Kurum FaksÄ±' },
  kurumTelefon: { tablo: 'TANIM_Kurum', sutun: 'telefon', aciklama: 'Kurum Telefonu' },
  kurumKep: { tablo: 'TANIM_Kurum', sutun: 'kep_adresi', aciklama: 'Kurum KEP Adresi' },
  kurumIci: { deger: true },
  ihtiyacKalemleri: {
    tablo: 'DATA_TeminKalem', sutun: '*', iliskili_id: 'temin_dosya_id',
    altEslestirme: { malzemeAdi: 'kalem_adi', ozelligi: 'aciklama', birimi: 'birim', miktar: 'miktar' }
  }
}

// ===========================================================
// 8. GÃ¶revlendirme YazÄ±sÄ±
// ===========================================================
export const GorevlendirmeYazisiMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum AdÄ±' },
  kurumUst: { tablo: 'TANIM_Kurum', sutun: 'ust_idari_birim', aciklama: 'Ãœst Ä°dari Birim' },
  mudurluk: { tablo: 'TANIM_Kurum', sutun: 'makam_adi', aciklama: 'MÃ¼dÃ¼rlÃ¼k / Makam' },
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Ä°ÅŸin AdÄ±' },
  evrakSayisi: {
    formul: '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no_clean}}',
    aciklama: 'Evrak SayÄ±sÄ±'
  }
}

// ===========================================================
// 9. Piyasa Fiyat AraÅŸtÄ±rma TutanaÄŸÄ±
// ===========================================================
export const PiyasaFiyatArastirmaTutanagiMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  kurumUst: { tablo: 'TANIM_Kurum', sutun: 'ust_idari_birim', aciklama: 'Ãœst Ä°dari Birim' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum AdÄ±' },
  mudurluk: { tablo: 'TANIM_Kurum', sutun: 'makam_adi', aciklama: 'MÃ¼dÃ¼rlÃ¼k / Makam' },
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Ä°ÅŸin AdÄ±' },
  toplamBedel: { tablo: 'DATA_TeminDosyasi', sutun: 'yaklasik_maliyet', aciklama: 'Toplam Bedel' }
}

// ===========================================================
// 10. Teklif Mektubu DaÄŸÄ±tÄ±m Ã‡izelgesi
// ===========================================================
export const TeklifMektubuDagitimCizelgesiMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  kurumUst: { tablo: 'TANIM_Kurum', sutun: 'ust_idari_birim', aciklama: 'Ãœst Ä°dari Birim' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum AdÄ±' },
  mudurluk: { tablo: 'TANIM_Kurum', sutun: 'makam_adi', aciklama: 'MÃ¼dÃ¼rlÃ¼k / Makam' },
  isAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Ä°ÅŸin AdÄ±' },
  baskanAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_ad', aciklama: 'BaÅŸkan (Onaylayan)' },
  baskanUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_unvan', aciklama: 'BaÅŸkan ÃœnvanÄ±' }
}

// ===========================================================
// 11. BÃ¼tÃ§e Sorgusu
// ===========================================================
export const ButceSorgusuMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum AdÄ±' },
  dosyaKonusu: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Dosya Konusu' },
  evrakSayisi: {
    formul: '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no_clean}}',
    aciklama: 'Evrak SayÄ±sÄ±'
  },
  butceYili: { tablo: 'DATA_TeminDosyasi', sutun: 'butce_yili', aciklama: 'BÃ¼tÃ§e YÄ±lÄ±' },
  butceTertibi: { tablo: 'DATA_TeminDosyasi', sutun: 'butce_tertibi', aciklama: 'BÃ¼tÃ§e Tertibi' },
  isAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Ä°ÅŸin AdÄ±' },
  hazirlayanPersonelAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'hazirlayan_personel_ad', aciklama: 'HazÄ±rlayan Personel' },
  hazirlayanPersonelUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'hazirlayan_personel_unvan', aciklama: 'HazÄ±rlayan Personel ÃœnvanÄ±' }
}

// ===========================================================
// 12. DoÄŸrudan Temin Onay Belgesi
// ===========================================================
export const DogrudanTeminOnayBelgesiMapping: ProcessMapping = {
  kurumUst: { tablo: 'TANIM_Kurum', sutun: 'ust_idari_birim', aciklama: 'Ãœst Ä°dari Birim' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum AdÄ±' },
  mudurluk: { tablo: 'TANIM_Kurum', sutun: 'makam_adi', aciklama: 'MÃ¼dÃ¼rlÃ¼k / Makam' },
  idareAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Ä°dare AdÄ±' },
  evrakSayisi: {
    formul: '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no_clean}}',
    aciklama: 'Evrak SayÄ±sÄ±'
  },
  teminNo: { tablo: 'DATA_TeminDosyasi', sutun: 'temin_no_clean', aciklama: 'Temin NumarasÄ±' },
  isAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Ä°ÅŸin AdÄ±' },
  isinAciklamasi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_aciklamasi', aciklama: 'Ä°ÅŸin AÃ§Ä±klamasÄ±' },
  yaklasikMaliyet: { tablo: 'DATA_TeminDosyasi', sutun: 'yaklasik_maliyet', aciklama: 'YaklaÅŸÄ±k Maliyet' },
  odenekTutari: { tablo: 'DATA_TeminDosyasi', sutun: 'odenek_tutari', aciklama: 'Ã–denek TutarÄ±' },
  butceTertibi: { tablo: 'DATA_TeminDosyasi', sutun: 'butce_tertibi', aciklama: 'BÃ¼tÃ§e Tertibi' },
  teminSekli: { tablo: 'DATA_TeminDosyasi', sutun: 'ihale_usulu', aciklama: 'Temin Åekli' },
  alimTuru: { tablo: 'DATA_TeminDosyasi', sutun: 'alim_turu', aciklama: 'AlÄ±m TÃ¼rÃ¼' },
  tarih: { tablo: 'DATA_TeminDosyasi', sutun: 'onay_tarihi', aciklama: 'Onay Tarihi' },
  hazirlayanPersonelAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'hazirlayan_personel_ad', aciklama: 'HazÄ±rlayan Personel' },
  hazirlayanPersonelUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'hazirlayan_personel_unvan', aciklama: 'HazÄ±rlayan Personel ÃœnvanÄ±' },
  onaylayanPersonelAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_ad', aciklama: 'Onaylayan Yetkili' },
  onaylayanPersonelUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_unvan', aciklama: 'Onaylayan Yetkili ÃœnvanÄ±' },
  baskanAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_ad', aciklama: 'BaÅŸkan / Harcama Yetkilisi' },
  baskanUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_unvan', aciklama: 'BaÅŸkan ÃœnvanÄ±' }
}

// ===========================================================
// 13. DoÄŸrudan Temin SonuÃ§ Onay Belgesi
// ===========================================================
export const DogrudanTeminSonucOnayBelgesiMapping: ProcessMapping = {
  kurumUst: { tablo: 'TANIM_Kurum', sutun: 'ust_idari_birim', aciklama: 'Ãœst Ä°dari Birim' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum AdÄ±' },
  mudurluk: { tablo: 'TANIM_Kurum', sutun: 'makam_adi', aciklama: 'MÃ¼dÃ¼rlÃ¼k / Makam' },
  idareAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Ä°dare AdÄ±' },
  evrakSayisi: {
    formul: '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no_clean}}',
    aciklama: 'Evrak SayÄ±sÄ±'
  },
  isAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Ä°ÅŸin AdÄ±' },
  isinAciklamasi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_aciklamasi', aciklama: 'Ä°ÅŸin AÃ§Ä±klamasÄ±' },
  yaklasikMaliyet: { tablo: 'DATA_TeminDosyasi', sutun: 'yaklasik_maliyet', aciklama: 'YaklaÅŸÄ±k Maliyet' },
  teminSekli: { tablo: 'DATA_TeminDosyasi', sutun: 'ihale_usulu', aciklama: 'Temin Åekli' },
  alimTuru: { tablo: 'DATA_TeminDosyasi', sutun: 'alim_turu', aciklama: 'AlÄ±m TÃ¼rÃ¼' },
  tarih: { tablo: 'DATA_TeminDosyasi', sutun: 'onay_tarihi', aciklama: 'Onay Tarihi' },
  hazirlayanPersonelAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'hazirlayan_personel_ad', aciklama: 'HazÄ±rlayan Personel' },
  hazirlayanPersonelUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'hazirlayan_personel_unvan', aciklama: 'HazÄ±rlayan Personel ÃœnvanÄ±' },
  onaylayanPersonelAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_ad', aciklama: 'Onaylayan Yetkili' },
  onaylayanPersonelUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_unvan', aciklama: 'Onaylayan Yetkili ÃœnvanÄ±' },
  baskanAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_ad', aciklama: 'BaÅŸkan / Harcama Yetkilisi' },
  baskanUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_unvan', aciklama: 'BaÅŸkan ÃœnvanÄ±' }
}

// ===========================================================
// 14. DoÄŸrudan Temin SÃ¶zleÅŸmesi
// ===========================================================
export const DogrudanTeminSozlesmesiMapping: ProcessMapping = {
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum AdÄ±' },
  idareAdresi: { tablo: 'TANIM_Kurum', sutun: 'adres', aciklama: 'Ä°dare Adresi' },
  idareTelefon: { tablo: 'TANIM_Kurum', sutun: 'telefon', aciklama: 'Ä°dare Telefonu' },
  idareFaks: { tablo: 'TANIM_Kurum', sutun: 'faks', aciklama: 'Ä°dare FaksÄ±' },
  idareEposta: { tablo: 'TANIM_Kurum', sutun: 'eposta', aciklama: 'Ä°dare E-Posta' },
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Ä°ÅŸin AdÄ±' },
  genelToplam: { tablo: 'DATA_TeminDosyasi', sutun: 'yaklasik_maliyet', aciklama: 'SÃ¶zleÅŸme Genel ToplamÄ±' },
  baskanAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_ad', aciklama: 'Ä°dare Yetkilisi' },
  baskanUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_unvan', aciklama: 'Ä°dare Yetkilisi ÃœnvanÄ±' }
}

// ===========================================================
// 15. DoÄŸrudan Temin SÃ¶zleÅŸmesi Alternatif
// ===========================================================
export const DogrudanTeminSozlesmesiAlternatifMapping: ProcessMapping = {
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum AdÄ±' },
  idareAdresi: { tablo: 'TANIM_Kurum', sutun: 'adres', aciklama: 'Ä°dare Adresi' },
  idareTelefon: { tablo: 'TANIM_Kurum', sutun: 'telefon', aciklama: 'Ä°dare Telefonu' },
  idareFaks: { tablo: 'TANIM_Kurum', sutun: 'faks', aciklama: 'Ä°dare FaksÄ±' },
  idareEposta: { tablo: 'TANIM_Kurum', sutun: 'eposta', aciklama: 'Ä°dare E-Posta' },
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Ä°ÅŸin AdÄ±' },
  genelToplam: { tablo: 'DATA_TeminDosyasi', sutun: 'yaklasik_maliyet', aciklama: 'SÃ¶zleÅŸme Genel ToplamÄ±' },
  baskanAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_ad', aciklama: 'Ä°dare Yetkilisi' },
  baskanUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_unvan', aciklama: 'Ä°dare Yetkilisi ÃœnvanÄ±' }
}

// ===========================================================
// 16. DoÄŸrudan Temin SÃ¶zleÅŸmesi Uzun
// ===========================================================
export const DogrudanTeminSozlesmesiUzunMapping: ProcessMapping = {
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum AdÄ±' },
  idareAdresi: { tablo: 'TANIM_Kurum', sutun: 'adres', aciklama: 'Ä°dare Adresi' },
  idareTelefon: { tablo: 'TANIM_Kurum', sutun: 'telefon', aciklama: 'Ä°dare Telefonu' },
  idareFaks: { tablo: 'TANIM_Kurum', sutun: 'faks', aciklama: 'Ä°dare FaksÄ±' },
  idareEposta: { tablo: 'TANIM_Kurum', sutun: 'eposta', aciklama: 'Ä°dare E-Posta' },
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Ä°ÅŸin AdÄ±' },
  genelToplam: { tablo: 'DATA_TeminDosyasi', sutun: 'yaklasik_maliyet', aciklama: 'SÃ¶zleÅŸme Genel ToplamÄ±' },
  baskanAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_ad', aciklama: 'Ä°dare Yetkilisi' },
  baskanUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_unvan', aciklama: 'Ä°dare Yetkilisi ÃœnvanÄ±' }
}

// ===========================================================
// 17. Ä°dare Onay Belgesi (Ä°hale Onay Belgesi)
// ===========================================================
export const IdareOnayBelgesiMapping: ProcessMapping = {
  kurumUst: { tablo: 'TANIM_Kurum', sutun: 'ust_idari_birim', aciklama: 'Ãœst Ä°dari Birim' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum AdÄ±' },
  mudurluk: { tablo: 'TANIM_Kurum', sutun: 'makam_adi', aciklama: 'MÃ¼dÃ¼rlÃ¼k / Makam' },
  idareAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Ä°dare AdÄ±' },
  evrakSayisi: {
    formul: '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no_clean}}',
    aciklama: 'Evrak SayÄ±sÄ±'
  },
  teminNo: { tablo: 'DATA_TeminDosyasi', sutun: 'temin_no_clean', aciklama: 'Temin NumarasÄ±' },
  isAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Ä°ÅŸin AdÄ±' },
  isinAciklamasi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_aciklamasi', aciklama: 'Ä°ÅŸin AÃ§Ä±klamasÄ±' },
  yaklasikMaliyet: { tablo: 'DATA_TeminDosyasi', sutun: 'yaklasik_maliyet', aciklama: 'YaklaÅŸÄ±k Maliyet' },
  odenekTutari: { tablo: 'DATA_TeminDosyasi', sutun: 'odenek_tutari', aciklama: 'Ã–denek TutarÄ±' },
  butceTertibi: { tablo: 'DATA_TeminDosyasi', sutun: 'butce_tertibi', aciklama: 'BÃ¼tÃ§e Tertibi' },
  teminSekli: { tablo: 'DATA_TeminDosyasi', sutun: 'ihale_usulu', aciklama: 'Temin Åekli' },
  tarih: { tablo: 'DATA_TeminDosyasi', sutun: 'onay_tarihi', aciklama: 'Onay Tarihi' },
  hazirlayanPersonelAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'hazirlayan_personel_ad', aciklama: 'HazÄ±rlayan Personel' },
  hazirlayanPersonelUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'hazirlayan_personel_unvan', aciklama: 'HazÄ±rlayan Personel ÃœnvanÄ±' },
  onaylayanPersonelAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_ad', aciklama: 'Onaylayan Yetkili' },
  onaylayanPersonelUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_unvan', aciklama: 'Onaylayan Yetkili ÃœnvanÄ±' }
}

// ===========================================================
// 18. Ä°hale Komisyon KararÄ±
// ===========================================================
export const IhaleKomisyonKarariMapping: ProcessMapping = {
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum AdÄ±' },
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Ä°ÅŸin AdÄ±' }
}

// ===========================================================
// 19. Kabul Edilen Teklif
// ===========================================================
export const KabulEdilenTeklifMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum AdÄ±' },
  evrakSayisi: {
    formul: '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no_clean}}',
    aciklama: 'Evrak SayÄ±sÄ±'
  },
  hazirlayanPersonelAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'hazirlayan_personel_ad', aciklama: 'HazÄ±rlayan Personel' },
  hazirlayanPersonelUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'hazirlayan_personel_unvan', aciklama: 'HazÄ±rlayan Personel ÃœnvanÄ±' },
  baskanAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_ad', aciklama: 'Onaylayan Yetkili' },
  baskanUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_unvan', aciklama: 'Onaylayan Yetkili ÃœnvanÄ±' },
  ihtiyacKalemleri: {
    tablo: 'DATA_TeminKalem', sutun: '*', iliskili_id: 'temin_dosya_id',
    altEslestirme: { malzemeAdi: 'kalem_adi', ozelligi: 'aciklama', birimi: 'birim', miktar: 'miktar' }
  }
}

// ===========================================================
// 20. SÃ¶zleÅŸmeye Davet
// ===========================================================
export const SozlesmeyeDavetMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum AdÄ±' },
  evrakSayisi: {
    formul: '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no_clean}}',
    aciklama: 'Evrak SayÄ±sÄ±'
  },
  baskanAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_ad', aciklama: 'Onaylayan Yetkili' },
  baskanUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_unvan', aciklama: 'Onaylayan Yetkili ÃœnvanÄ±' },
  ihtiyacKalemleri: {
    tablo: 'DATA_TeminKalem', sutun: '*', iliskili_id: 'temin_dosya_id',
    altEslestirme: { malzemeAdi: 'kalem_adi', ozelligi: 'aciklama', birimi: 'birim', miktar: 'miktar' }
  }
}

// ===========================================================
// 21. Teklif Mektubu
// ===========================================================
export const TeklifMektubuMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum AdÄ±' },
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Ä°ÅŸin AdÄ±' }
}

// ===========================================================
// 22. HakediÅŸ Raporu
// ===========================================================
export const HakedisRaporuMapping: ProcessMapping = {
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum AdÄ±' },
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Ä°ÅŸin AdÄ±' },
  onaylayanPersonelAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_ad', aciklama: 'Onaylayan Yetkili' },
  onaylayanPersonelUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_unvan', aciklama: 'Onaylayan Yetkili ÃœnvanÄ±' }
}

// ===========================================================
// 23. Harcama PusulasÄ±
// ===========================================================
export const HarcamaPusulasiMapping: ProcessMapping = {
  idareAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Ä°dare AdÄ±' },
  isAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Ä°ÅŸin AdÄ±' },
  alimTuru: { tablo: 'DATA_TeminDosyasi', sutun: 'alim_turu', aciklama: 'AlÄ±m TÃ¼rÃ¼' },
  onaylayanPersonelAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_ad', aciklama: 'Onaylayan Yetkili' },
  onaylayanPersonelUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_unvan', aciklama: 'Onaylayan Yetkili ÃœnvanÄ±' }
}

// ===========================================================
// 24. Hizmet Ä°ÅŸleri Kabul Teklif Belgesi
// ===========================================================
export const HizmetIsleriKabulTeklifBelgesiMapping: ProcessMapping = {
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum AdÄ±' },
  dosyaKonusu: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Dosya Konusu' },
  baskanAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_ad', aciklama: 'Onaylayan Yetkili' },
  baskanUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_unvan', aciklama: 'Onaylayan Yetkili ÃœnvanÄ±' }
}

// ===========================================================
// 25. Hizmet Ä°ÅŸleri Kabul TutanaÄŸÄ±
// ===========================================================
export const HizmetIsleriKabulTutanagiMapping: ProcessMapping = {
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum AdÄ±' },
  dosyaKonusu: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Dosya Konusu' },
  baskanAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_ad', aciklama: 'Onaylayan Yetkili' },
  baskanUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_unvan', aciklama: 'Onaylayan Yetkili ÃœnvanÄ±' }
}

// ===========================================================
// 26. Kabul Edilen Teklif Ã–deme
// ===========================================================
export const KabulEdilenTeklifOdemeMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum AdÄ±' },
  evrakSayisi: {
    formul: '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no_clean}}',
    aciklama: 'Evrak SayÄ±sÄ±'
  },
  hazirlayanPersonelAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'hazirlayan_personel_ad', aciklama: 'HazÄ±rlayan Personel' },
  hazirlayanPersonelUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'hazirlayan_personel_unvan', aciklama: 'HazÄ±rlayan Personel ÃœnvanÄ±' },
  baskanAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_ad', aciklama: 'Onaylayan Yetkili' },
  baskanUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_unvan', aciklama: 'Onaylayan Yetkili ÃœnvanÄ±' },
  ihtiyacKalemleri: {
    tablo: 'DATA_TeminKalem', sutun: '*', iliskili_id: 'temin_dosya_id',
    altEslestirme: { malzemeAdi: 'kalem_adi', ozelligi: 'aciklama', birimi: 'birim', miktar: 'miktar' }
  }
}

// ===========================================================
// 27. Muayene Kabul TutanaÄŸÄ±
// ===========================================================
export const MuayeneKabulTutanagiMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum AdÄ±' },
  evrakSayisi: {
    formul: '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no_clean}}',
    aciklama: 'Evrak SayÄ±sÄ±'
  },
  baskanAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_ad', aciklama: 'Onaylayan Yetkili' },
  baskanUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_unvan', aciklama: 'Onaylayan Yetkili ÃœnvanÄ±' },
  ihtiyacKalemleri: {
    tablo: 'DATA_TeminKalem', sutun: '*', iliskili_id: 'temin_dosya_id',
    altEslestirme: { malzemeAdi: 'kalem_adi', ozelligi: 'aciklama', birimi: 'birim', miktar: 'miktar' }
  }
}

// ===========================================================
// 28. Ã–deme Emri Belgesi
// ===========================================================
export const OdemeEmriBelgesiMapping: ProcessMapping = {
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum AdÄ±' },
  dosyaKonusu: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Dosya Konusu' },
  butceYili: { tablo: 'DATA_TeminDosyasi', sutun: 'butce_yili', aciklama: 'BÃ¼tÃ§e YÄ±lÄ±' },
  hazirlayanPersonelAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'hazirlayan_personel_ad', aciklama: 'HazÄ±rlayan Personel' },
  hazirlayanPersonelUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'hazirlayan_personel_unvan', aciklama: 'HazÄ±rlayan Personel ÃœnvanÄ±' },
  onaylayanPersonelAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_ad', aciklama: 'Onaylayan Yetkili' },
  onaylayanPersonelUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_unvan', aciklama: 'Onaylayan Yetkili ÃœnvanÄ±' },
  baskanAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_ad', aciklama: 'Onaylayan Yetkili' },
  baskanUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_unvan', aciklama: 'Onaylayan Yetkili ÃœnvanÄ±' },
  gerceklestirmeGorevlisiAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'hazirlayan_personel_ad', aciklama: 'GerÃ§ekleÅŸtirme GÃ¶revlisi' },
  gerceklestirmeGorevlisiUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'hazirlayan_personel_unvan', aciklama: 'GerÃ§ekleÅŸtirme GÃ¶revlisi ÃœnvanÄ±' }
}

// ===========================================================
// 29. Ã–deme YazÄ±sÄ±
// ===========================================================
export const OdemeYazisiMapping: ProcessMapping = {
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum AdÄ±' },
  dosyaKonusu: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Dosya Konusu' },
  evrakSayisi: {
    formul: '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no_clean}}',
    aciklama: 'Evrak SayÄ±sÄ±'
  },
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Ä°ÅŸin AdÄ±' },
  hazirlayanPersonelAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'hazirlayan_personel_ad', aciklama: 'HazÄ±rlayan Personel' },
  hazirlayanPersonelUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'hazirlayan_personel_unvan', aciklama: 'HazÄ±rlayan Personel ÃœnvanÄ±' },
  baskanAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_ad', aciklama: 'Onaylayan Yetkili' },
  baskanUnvan: { tablo: 'DATA_TeminDosyasi', sutun: 'onaylayan_personel_unvan', aciklama: 'Onaylayan Yetkili ÃœnvanÄ±' }
}

// ===========================================================
// 30. TaÅŸÄ±nÄ±r Ä°ÅŸlem FiÅŸi
// ===========================================================
export const TasinirIslemFisiMapping: ProcessMapping = {
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum AdÄ±' },
  ihtiyacKalemleri: {
    tablo: 'DATA_TeminKalem', sutun: '*', iliskili_id: 'temin_dosya_id',
    altEslestirme: { malzemeAdi: 'kalem_adi', ozelligi: 'aciklama', birimi: 'birim', miktar: 'miktar' }
  }
}

// ===========================================================
// 31. Ä°hale KapaÄŸÄ±
// ===========================================================
export const IhaleKapagiMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  isAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Ä°ÅŸin AdÄ±' },
  isinAciklamasi: { tablo: 'DATA_TeminDosyasi', sutun: 'isin_aciklamasi', aciklama: 'Ä°ÅŸin AÃ§Ä±klamasÄ±' },
  yaklasikMaliyet: { tablo: 'DATA_TeminDosyasi', sutun: 'yaklasik_maliyet', aciklama: 'YaklaÅŸÄ±k Maliyet' },
  teminNo: { tablo: 'DATA_TeminDosyasi', sutun: 'temin_no_clean', aciklama: 'Temin NumarasÄ±' },
  alimTuru: { tablo: 'DATA_TeminDosyasi', sutun: 'alim_turu', aciklama: 'AlÄ±m TÃ¼rÃ¼' },
  butceTertibi: { tablo: 'DATA_TeminDosyasi', sutun: 'butce_tertibi', aciklama: 'BÃ¼tÃ§e Tertibi' }
}

// ===========================================================
// 32. Kapak Ä°Ã§i Ä°ndeks Åablonu
// ===========================================================
export const KapakIciIndeksSablonuMapping: ProcessMapping = {
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum AdÄ±' },
  isAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Ä°ÅŸin AdÄ±' }
}

// ===========================================================
// 33. KlasÃ¶r SÄ±rtlÄ±ÄŸÄ± 3cm
// ===========================================================
export const KlasorSirtligi3cmMapping: ProcessMapping = {
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum AdÄ±' },
  solLogo: { tablo: 'TANIM_Kurum', sutun: 'logo_sol', aciklama: 'Sol Logo (Base64)' },
  yil: { tablo: 'DATA_TeminDosyasi', sutun: 'butce_yili', aciklama: 'BÃ¼tÃ§e YÄ±lÄ±' },
  konu: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Ä°ÅŸin AdÄ±' }
}

// ===========================================================
// 34. KlasÃ¶r SÄ±rtlÄ±ÄŸÄ± 5cm
// ===========================================================
export const KlasorSirtligi5cmMapping: ProcessMapping = {
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum AdÄ±' },
  solLogo: { tablo: 'TANIM_Kurum', sutun: 'logo_sol', aciklama: 'Sol Logo (Base64)' },
  yil: { tablo: 'DATA_TeminDosyasi', sutun: 'butce_yili', aciklama: 'BÃ¼tÃ§e YÄ±lÄ±' },
  konu: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Ä°ÅŸin AdÄ±' }
}

// ===========================================================
// 35. KlasÃ¶r SÄ±rtlÄ±ÄŸÄ± 7.5cm
// ===========================================================
export const KlasorSirtligi75cmMapping: ProcessMapping = {
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum AdÄ±' },
  solLogo: { tablo: 'TANIM_Kurum', sutun: 'logo_sol', aciklama: 'Sol Logo (Base64)' },
  yil: { tablo: 'DATA_TeminDosyasi', sutun: 'butce_yili', aciklama: 'BÃ¼tÃ§e YÄ±lÄ±' },
  konu: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Ä°ÅŸin AdÄ±' }
}
