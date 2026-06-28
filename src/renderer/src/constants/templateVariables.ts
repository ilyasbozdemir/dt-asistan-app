export interface TemplateVariableDef {
  label: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
}

export const TemplateVariablesSchema: Record<string, TemplateVariableDef> = {
  antetSatirlari: { label: 'Antet Satırları', type: 'array' },
  evrakSayisi: { label: 'Evrak Sayısı', type: 'string' },
  dosyaKonusu: { label: 'Dosya Konusu', type: 'string' },
  tarih: { label: 'Tarih', type: 'string' },
  sunulacakMakamAdi: { label: 'Sunulacak Makam Adı', type: 'string' },
  talepEdenPersonelAdi: { label: 'Talep Eden Personel Adı', type: 'string' },
  talepEdenPersonelUnvan: { label: 'Talep Eden Personel Ünvanı', type: 'string' },
  kurumIci: { label: 'Kurum İçi Mi?', type: 'boolean' },
  kurumAdres: { label: 'Kurum Adresi', type: 'string' },
  kurumTelefon: { label: 'Kurum Telefonu', type: 'string' },
  kurumFaks: { label: 'Kurum Faks', type: 'string' },
  kurumWeb: { label: 'Kurum Web Sitesi', type: 'string' },
  kurumEposta: { label: 'Kurum E-Posta', type: 'string' },
  kurumKep: { label: 'Kurum KEP Adresi', type: 'string' },
  ilgiliPersonelAdi: { label: 'İlgili Personel Adı', type: 'string' },
  ilgiliPersonelUnvan: { label: 'İlgili Personel Ünvanı', type: 'string' },
  solLogo: { label: 'Sol Logo URL', type: 'string' },
  sagLogo: { label: 'Sağ Logo URL', type: 'string' },
  ihtiyacYeri: { label: 'İhtiyaç Yeri', type: 'string' },
  ihtiyacKalemleri: { label: 'İhtiyaç Kalemleri', type: 'array', description: 'Kodu, Malzeme Adı, Miktar gibi detayları içerir.' },
  olurYazisi: { label: 'Olur Yazısı Gösterilsin mi?', type: 'boolean' },
  dosyaTarihi: { label: 'Dosya Tarihi', type: 'string' },
  onaylayanPersonelAdi: { label: 'Onaylayan Personel Adı', type: 'string' },
  onaylayanPersonelUnvan: { label: 'Onaylayan Personel Ünvanı', type: 'string' },
  
  // Diğer Şablonlarda (Kapak vs.) Görülen Değişkenler
  kapakDetaylari: { label: 'Kapak Detayları', type: 'array' },
  alimTuru: { label: 'Alım Türü', type: 'string' },
  yukleniciFirma: { label: 'Yüklenici Firma', type: 'object' },
  yukleniciAdresi: { label: 'Yüklenici Adresi', type: 'string' },
  yukleniciIlce: { label: 'Yüklenici İl/İlçe', type: 'string' },

  // Gelecekte eklenebilecek diğer standart anahtarlar:
  hazirlayanPersonelAdi: { label: 'Hazırlayan Personel Adı', type: 'string' },
  hazirlayanPersonelUnvan: { label: 'Hazırlayan Personel Ünvanı', type: 'string' },
  firmaAdi: { label: 'Firma Adı', type: 'string' },
  toplamTutar: { label: 'Toplam Tutar', type: 'string' }
};
