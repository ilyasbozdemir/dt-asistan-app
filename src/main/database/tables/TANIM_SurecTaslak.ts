export const TANIM_SurecTaslak = {
  name: 'TANIM_SurecTaslak',
  description: 'Özel İşlem Taslakları (Hızlı Erişim ve Atlanan Evraklar Konfigürasyonu)',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'taslak_adi', type: 'TEXT', notNull: true },
    { name: 'tur', type: 'TEXT' }, // Hangi alım türüne ait taslak olduğu
    { name: 'starred_docs', type: 'TEXT' }, // JSON array of strings
    { name: 'skipped_docs', type: 'TEXT' }, // JSON array of strings
    { name: 'aktif_mi', type: 'INTEGER', default: 1 },
    { name: 'created_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' },
    { name: 'updated_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' }
  ],
  initialData: []
}
