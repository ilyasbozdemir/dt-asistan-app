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
    { key: 'onayaSunulanTarih', label: 'Onaya Sunulan Tarih', type: 'text', category: 'tarih' },
    { key: 'onayTarihi', label: 'Onay Tarihi (OLUR Tarihi)', type: 'text', category: 'tarih' },
    { key: 'hazirlayanPersonelAdi', label: 'Hazırlayan Personel Adı', type: 'text', category: 'personel' },
    { key: 'hazirlayanPersonelUnvan', label: 'Hazırlayan Personel Ünvanı', type: 'text', category: 'personel' },
    { key: 'onaylayanPersonelAdi', label: 'Harcama Yetkilisi Adı', type: 'text', category: 'personel' },
    { key: 'onaylayanPersonelUnvan', label: 'Harcama Yetkilisi Ünvanı', type: 'text', category: 'personel' },
  ],
  'harcama-pusulasi': [
    { key: 'alimTuru', label: 'Alım Türü', type: 'text', category: 'genel' },
    { key: 'isAdi', label: 'İşin Adı', type: 'text', category: 'genel' },
    { key: 'miktar', label: 'Miktar', type: 'text', category: 'detay' },
    { key: 'birimFiyat', label: 'Birim Fiyat', type: 'text', category: 'detay' },
    { key: 'tutar', label: 'Tutar', type: 'text', category: 'detay' },
    { key: 'tutarYazi', label: 'Tutar (Yazı İle)', type: 'text', category: 'detay' },
    { key: 'saticiAdiSoyadi', label: 'Satıcı Adı Soyadı', type: 'text', category: 'personel' },
    { key: 'saticiTcNo', label: 'Satıcı T.C. Kimlik No', type: 'text', category: 'personel' },
    { key: 'saticiAdres', label: 'Satıcı Adresi', type: 'textarea', category: 'personel' },
    { key: 'aciklama', label: 'Açıklama', type: 'textarea', category: 'genel' },
    { key: 'evrakSayisi', label: 'Evrak Sayısı (Sayı)', type: 'text', category: 'tarih' },
    { key: 'tarih', label: 'Tarih', type: 'text', category: 'tarih' },
    { key: 'onaylayanPersonelAdi', label: 'Harcama Yetkilisi Adı', type: 'text', category: 'personel' },
    { key: 'onaylayanPersonelUnvan', label: 'Harcama Yetkilisi Ünvanı', type: 'text', category: 'personel' },
  ],
  'fiyat-arastirma-mektubu': [
    { key: 'isinAdi', label: 'İşin Adı', type: 'text', category: 'genel' },
    { key: 'gunSayisi', label: 'Süre (Gün Sayısı)', type: 'text', category: 'detay' },
    { key: 'teklifSahibi', label: 'Teklif Sahibinin Ünvanı', type: 'text', category: 'personel' },
    { key: 'tebligatAdresi', label: 'Tebligat Adresi', type: 'textarea', category: 'personel' },
    { key: 'vergiNo', label: 'Vergi Dairesi / VKN', type: 'text', category: 'personel' },
    { key: 'telefonFaks', label: 'Telefon / Faks', type: 'text', category: 'personel' },
    { key: 'eposta', label: 'E-Posta', type: 'text', category: 'personel' },
    { key: 'aciklama', label: 'Açıklama / Taahhüt Metni', type: 'textarea', category: 'genel' },
    { key: 'tarih', label: 'Tarih', type: 'text', category: 'tarih' },
  ],
  'birim-fiyat-teklif-mektubu': [
    { key: 'isinAdi', label: 'İşin Adı', type: 'text', category: 'genel' },
    { key: 'hitap', label: 'Makam / İdare Adı (Hitap)', type: 'text', category: 'genel' },
    { key: 'teklifSahibi', label: 'Teklif Sahibi Ad / Ünvan', type: 'text', category: 'personel' },
    { key: 'uyrugu', label: 'Uyruğu', type: 'text', category: 'personel' },
    { key: 'tcKimlikNo', label: 'T.C. Kimlik No', type: 'text', category: 'personel' },
    { key: 'vergiNo', label: 'Vergi No / VKN', type: 'text', category: 'personel' },
    { key: 'tebligatAdresi', label: 'Tebligat Adresi', type: 'textarea', category: 'personel' },
    { key: 'telefonFaks', label: 'Telefon / Faks', type: 'text', category: 'personel' },
    { key: 'eposta', label: 'E-Posta', type: 'text', category: 'personel' },
    { key: 'aciklama', label: 'Açıklama / Taahhüt Metni', type: 'textarea', category: 'genel' },
    { key: 'dosyaTarihi', label: 'Tarih', type: 'text', category: 'tarih' },
  ],
  'arastirma-mektubu': [
    { key: 'evrakSayisi', label: 'Sayı / Evrak No', type: 'text', category: 'tarih' },
    { key: 'dosyaKonusu', label: 'Konu', type: 'text', category: 'genel' },
    { key: 'sayinIlgili', label: 'Hitap (Sayın İlgili / Firma)', type: 'text', category: 'genel' },
    { key: 'aciklamaMetni', label: 'Açıklama Metni', type: 'textarea', category: 'genel' },
    { key: 'tarih', label: 'Tarih', type: 'text', category: 'tarih' },
  ],
  'ihtiyac-listesi': [
    { key: 'evrakSayisi', label: 'Evrak Sayısı (Sayı)', type: 'text', category: 'tarih' },
    { key: 'onayaSunulanTarih', label: 'Onaya Sunulan Tarih', type: 'text', category: 'tarih' },
    { key: 'onayTarihi', label: 'Onay Tarihi (OLUR Tarihi)', type: 'text', category: 'tarih' },
    { key: 'hazirlayanPersonelAdi', label: 'Hazırlayan Personel Adı', type: 'text', category: 'personel' },
    { key: 'hazirlayanPersonelUnvan', label: 'Hazırlayan Personel Ünvanı', type: 'text', category: 'personel' },
  ],
  'luzum-muzekkeresi': [
    { key: 'isAdi', label: 'İşin Adı', type: 'text', category: 'genel' },
    { key: 'sunulacakMakamAdi', label: 'Sunulacak Makam', type: 'text', category: 'genel' },
    { key: 'gerekce', label: 'Lüzum Gerekçesi', type: 'textarea', category: 'genel' },
    { key: 'evrakSayisi', label: 'Sayı / Evrak No', type: 'text', category: 'tarih' },
    { key: 'onayaSunulanTarih', label: 'Onaya Sunulan Tarih', type: 'text', category: 'tarih' },
    { key: 'onayTarihi', label: 'Onay Tarihi (OLUR Tarihi)', type: 'text', category: 'tarih' },
    { key: 'hazirlayanPersonelAdi', label: 'Hazırlayan Personel Adı', type: 'text', category: 'personel' },
    { key: 'hazirlayanPersonelUnvan', label: 'Hazırlayan Personel Ünvanı', type: 'text', category: 'personel' },
    { key: 'onaylayanPersonelAdi', label: 'Onaylayan Yetkili Adı', type: 'text', category: 'personel' },
    { key: 'onaylayanPersonelUnvan', label: 'Onaylayan Yetkili Ünvanı', type: 'text', category: 'personel' },
  ],
  'luzum-muzekkeresi-onay-eki': [
    { key: 'isAdi', label: 'İşin Adı', type: 'text', category: 'genel' },
    { key: 'evrakSayisi', label: 'Sayı / Evrak No', type: 'text', category: 'tarih' },
    { key: 'onayaSunulanTarih', label: 'Onaya Sunulan Tarih', type: 'text', category: 'tarih' },
    { key: 'hazirlayanPersonelAdi', label: 'Hazırlayan Personel Adı', type: 'text', category: 'personel' },
    { key: 'hazirlayanPersonelUnvan', label: 'Hazırlayan Personel Ünvanı', type: 'text', category: 'personel' },
  ],
  'luzum-muzekkeresi-teslim-tesellum': [
    { key: 'isAdi', label: 'İşin Adı', type: 'text', category: 'genel' },
    { key: 'evrakSayisi', label: 'Sayı / Evrak No', type: 'text', category: 'tarih' },
    { key: 'onayaSunulanTarih', label: 'Onaya Sunulan Tarih', type: 'text', category: 'tarih' },
    { key: 'teslimEdenAd', label: 'Teslim Eden Personel', type: 'text', category: 'personel' },
    { key: 'teslimEdenUnvan', label: 'Teslim Eden Ünvanı', type: 'text', category: 'personel' },
    { key: 'teslimAlanAd', label: 'Teslim Alan Personel', type: 'text', category: 'personel' },
    { key: 'teslimAlanUnvan', label: 'Teslim Alan Ünvanı', type: 'text', category: 'personel' },
  ],
  'komisyon-gorevlendirme-onayi': [
    { key: 'isAdi', label: 'İşin Adı', type: 'text', category: 'genel' },
    { key: 'konu', label: 'Konu', type: 'text', category: 'genel' },
    { key: 'evrakSayisi', label: 'Sayı / Evrak No', type: 'text', category: 'tarih' },
    { key: 'onayaSunulanTarih', label: 'Onaya Sunulan Tarih', type: 'text', category: 'tarih' },
    { key: 'onayTarihi', label: 'Onay Tarihi (OLUR Tarihi)', type: 'text', category: 'tarih' },
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
