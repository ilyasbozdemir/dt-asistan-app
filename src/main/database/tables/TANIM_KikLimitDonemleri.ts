export const TANIM_KikLimitDonemleri = {
  name: 'TANIM_KikLimitDonemleri',
  description: 'KİK Madde 22/d Doğrudan Temin parasal limitlerinin dönemsel olarak tutulduğu tablo',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'donem_kodu', type: 'TEXT', notNull: true, unique: true },
    { name: 'baslangic_tarihi', type: 'TEXT', notNull: true },
    { name: 'bitis_tarihi', type: 'TEXT', notNull: true },
    { name: 'buyuksehir_limit', type: 'REAL', notNull: true },
    { name: 'diger_limit', type: 'REAL', notNull: true },
    { name: 'guncelleme_orani', type: 'TEXT' },
    { name: 'kaynak', type: 'TEXT' },
    { name: 'created_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' },
    { name: 'updated_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' }
  ],
  initialData: [
    {
      donem_kodu: '2026',
      baslangic_tarihi: '2026-02-01',
      bitis_tarihi: '2027-01-31',
      buyuksehir_limit: 1021827.00,
      diger_limit: 340391.00,
      guncelleme_orani: '%43.93',
      kaynak: 'Sistem Kurulumu'
    }
  ]
}
