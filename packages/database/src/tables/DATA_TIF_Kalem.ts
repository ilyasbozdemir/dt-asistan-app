export const DATA_TIF_Kalem = {
  name: 'DATA_TIF_Kalem',
  description: 'Taşınır İşlem Fişi kalem satırları',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'tif_id', type: 'INTEGER', notNull: true, description: 'DATA_TIF FK' },
    { name: 'temin_kalem_id', type: 'INTEGER', description: 'DATA_TeminKalem FK (varsa)' },
    { name: 'kalem_adi', type: 'TEXT', notNull: true, description: 'Kalem adı' },
    { name: 'miktar', type: 'REAL', notNull: true, default: 1, description: 'Miktar' },
    { name: 'olcu_birimi', type: 'TEXT', description: 'Ölçü birimi (Adet, Kg vb.)' },
    { name: 'birim_fiyat', type: 'REAL', description: 'Birim fiyat' },
    { name: 'tasinir_kodu', type: 'TEXT', description: 'Taşınır kod (150.01.01 vb.)' },
    {
      name: 'created_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Oluşturma tarihi'
    }
  ],
  initialData: []
}
