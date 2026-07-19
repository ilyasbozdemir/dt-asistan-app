export const DATA_AmbarStok = {
  name: 'DATA_AmbarStok',
  description: 'Ambar anlık stok durumu',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'ambar_id', type: 'INTEGER', notNull: true, description: 'Ambar FK' },
    { name: 'tasinir_kodu', type: 'TEXT', description: 'Taşınır kodu' },
    { name: 'kalem_adi', type: 'TEXT', notNull: true, description: 'Kalem adı' },
    { name: 'olcu_birimi', type: 'TEXT', description: 'Ölçü birimi' },
    { name: 'toplam_miktar', type: 'REAL', notNull: true, default: 0, description: 'Toplam stok miktarı' },
    { name: 'birim_fiyat', type: 'REAL', description: 'Son birim fiyat' },
    {
      name: 'son_guncelleme',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Son güncelleme tarihi'
    }
  ],
  constraints: ['UNIQUE(ambar_id, kalem_adi)'],
  initialData: []
}
