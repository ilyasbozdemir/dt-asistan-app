export interface TemplateFieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'date' | 'number';
  placeholder?: string;
  category?: 'genel' | 'tarih' | 'personel' | 'detay';
}

export const TEMPLATE_EDITABLE_FIELDS: Record<string, TemplateFieldConfig[]> = {
  'harcama-talimati': [
    { key: 'isAdi', label: 'İşin Adı / Konusu', type: 'text', category: 'genel' },
    { key: 'gerekce', label: 'Alımın Gerekçesi', type: 'textarea', category: 'genel' },
    { key: 'aciklama', label: 'Açıklama', type: 'textarea', category: 'genel' },
    { key: 'sure', label: 'İşin Süresi', type: 'text', category: 'detay' },
    { key: 'teminSekli', label: 'Temin Şekli / Usulü', type: 'text', category: 'detay' },
    { key: 'yaklasikMaliyet', label: 'Yaklaşık Maliyet', type: 'text', category: 'detay' },
    { key: 'odenekTutari', label: 'Ödenek Tutarı', type: 'text', category: 'detay' },
    { key: 'butceTertibi', label: 'Bütçe Tertibi', type: 'text', category: 'detay' },
    { key: 'evrakSayisi', label: 'Evrak Sayısı (Sayı)', type: 'text', category: 'tarih' },
    { key: 'tarih', label: 'Talimat Tarihi', type: 'text', category: 'tarih' },
    { key: 'hazirlayanPersonelAdi', label: 'Hazırlayan Personel Adı', type: 'text', category: 'personel' },
    { key: 'hazirlayanPersonelUnvan', label: 'Hazırlayan Personel Ünvanı', type: 'text', category: 'personel' },
    { key: 'onaylayanPersonelAdi', label: 'Harcama Yetkilisi Adı', type: 'text', category: 'personel' },
    { key: 'onaylayanPersonelUnvan', label: 'Harcama Yetkilisi Ünvanı', type: 'text', category: 'personel' },
  ],
  'ihtiyac-listesi': [
    { key: 'isAdi', label: 'İşin Adı', type: 'text', category: 'genel' },
    { key: 'gerekce', label: 'İhtiyaç Gerekçesi', type: 'textarea', category: 'genel' },
    { key: 'evrakSayisi', label: 'Evrak Sayısı (Sayı)', type: 'text', category: 'tarih' },
    { key: 'tarih', label: 'Belge Tarihi', type: 'text', category: 'tarih' },
    { key: 'hazirlayanPersonelAdi', label: 'Hazırlayan Personel Adı', type: 'text', category: 'personel' },
    { key: 'hazirlayanPersonelUnvan', label: 'Hazırlayan Personel Ünvanı', type: 'text', category: 'personel' },
  ],
  'luzum-muzekkeresi': [
    { key: 'isAdi', label: 'İşin Adı', type: 'text', category: 'genel' },
    { key: 'sunulacakMakamAdi', label: 'Sunulacak Makam', type: 'text', category: 'genel' },
    { key: 'gerekce', label: 'Lüzum Gerekçesi', type: 'textarea', category: 'genel' },
    { key: 'evrakSayisi', label: 'Sayı / Evrak No', type: 'text', category: 'tarih' },
    { key: 'tarih', label: 'Müzekkere Tarihi', type: 'text', category: 'tarih' },
    { key: 'hazirlayanPersonelAdi', label: 'Hazırlayan Personel Adı', type: 'text', category: 'personel' },
    { key: 'hazirlayanPersonelUnvan', label: 'Hazırlayan Personel Ünvanı', type: 'text', category: 'personel' },
    { key: 'onaylayanPersonelAdi', label: 'Onaylayan Yetkili Adı', type: 'text', category: 'personel' },
    { key: 'onaylayanPersonelUnvan', label: 'Onaylayan Yetkili Ünvanı', type: 'text', category: 'personel' },
  ],
  'luzum-muzekkeresi-onay-eki': [
    { key: 'isAdi', label: 'İşin Adı', type: 'text', category: 'genel' },
    { key: 'evrakSayisi', label: 'Sayı / Evrak No', type: 'text', category: 'tarih' },
    { key: 'tarih', label: 'Belge Tarihi', type: 'text', category: 'tarih' },
    { key: 'hazirlayanPersonelAdi', label: 'Hazırlayan Personel Adı', type: 'text', category: 'personel' },
    { key: 'hazirlayanPersonelUnvan', label: 'Hazırlayan Personel Ünvanı', type: 'text', category: 'personel' },
  ],
  'luzum-muzekkeresi-teslim-tesellum': [
    { key: 'isAdi', label: 'İşin Adı', type: 'text', category: 'genel' },
    { key: 'evrakSayisi', label: 'Sayı / Evrak No', type: 'text', category: 'tarih' },
    { key: 'tarih', label: 'Belge Tarihi', type: 'text', category: 'tarih' },
    { key: 'teslimEdenAd', label: 'Teslim Eden Personel', type: 'text', category: 'personel' },
    { key: 'teslimEdenUnvan', label: 'Teslim Eden Ünvanı', type: 'text', category: 'personel' },
    { key: 'teslimAlanAd', label: 'Teslim Alan Personel', type: 'text', category: 'personel' },
    { key: 'teslimAlanUnvan', label: 'Teslim Alan Ünvanı', type: 'text', category: 'personel' },
  ],
  'komisyon-gorevlendirme-onayi': [
    { key: 'isAdi', label: 'İşin Adı', type: 'text', category: 'genel' },
    { key: 'konu', label: 'Konu', type: 'text', category: 'genel' },
    { key: 'evrakSayisi', label: 'Sayı / Evrak No', type: 'text', category: 'tarih' },
    { key: 'tarih', label: 'Onay Tarihi', type: 'text', category: 'tarih' },
    { key: 'hazirlayanPersonelAdi', label: 'Hazırlayan Personel Adı', type: 'text', category: 'personel' },
    { key: 'hazirlayanPersonelUnvan', label: 'Hazırlayan Personel Ünvanı', type: 'text', category: 'personel' },
    { key: 'baskanAdi', label: 'Onaylayan Yetkili Adı', type: 'text', category: 'personel' },
    { key: 'baskanUnvan', label: 'Onaylayan Yetkili Ünvanı', type: 'text', category: 'personel' },
  ],
  'komisyon-gorevlendirme-onayi-eki': [
    { key: 'ekNo', label: 'Ek Numarası', type: 'text', category: 'genel' },
    { key: 'alimTuru', label: 'Alım Türü / İşin Adı', type: 'text', category: 'genel' },
    { key: 'hazirlayanPersonelAdi', label: 'Hazırlayan Personel Adı', type: 'text', category: 'personel' },
    { key: 'hazirlayanPersonelUnvan', label: 'Hazırlayan Personel Ünvanı', type: 'text', category: 'personel' },
  ]
};

export function getTemplateEditableFields(documentId: string): TemplateFieldConfig[] {
  return TEMPLATE_EDITABLE_FIELDS[documentId] || [];
}
