export const TANIM_Sablon = {
  name: 'TANIM_Sablon',
  description: 'Şablon dosyalarının ana tablosu',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'ad', type: 'TEXT', notNull: true, description: 'Adı' },
    { name: 'dosya_adi', type: 'TEXT', notNull: true, description: 'Dosya Adi' },
    { name: 'dosya_turu', type: 'TEXT', notNull: true, description: 'Dosya Turu' },
    { name: 'icerik', type: 'BLOB', notNull: true, description: 'Icerik' },
    { name: 'aciklama', type: 'TEXT', description: 'Aciklama' },
    { name: 'aktif_mi', type: 'INTEGER', notNull: true, default: 1, description: 'Aktif mı?' },
    { name: 'parent_id', type: 'INTEGER', description: 'Parent ID' },
    { name: 'versiyon', type: 'INTEGER', default: 1, description: 'Versiyon' },
    { name: 'kategori', type: 'TEXT', description: 'Kategori' },
    { name: 'test_verisi', type: 'TEXT', description: 'Test Verisi' },
    { name: 'html_yolu', type: 'TEXT', description: 'Html Yolu' },
    { name: 'json_yolu', type: 'TEXT', description: 'Json Yolu' },
    {
      name: 'grup_adi',
      type: 'TEXT',
      description: 'Şablon Grubu - aynı grup adına sahip şablonlar tek kart altında birleştirilir'
    },
    {
      name: 'grup_siralama',
      type: 'INTEGER',
      default: 0,
      description: 'Grup içindeki sıralama (0 = ana belge)'
    },
    { name: 'route_path', type: 'TEXT', description: 'Route Path' },
    {
      name: 'created_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Created At'
    },
    {
      name: 'updated_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Updated At'
    }
  ],
  constraints: [
    "CHECK(dosya_turu IN ('xlsx', 'docx', 'html'))",
    'FOREIGN KEY(parent_id) REFERENCES TANIM_Sablon(id) ON DELETE SET NULL'
  ],
  initialData: []
}
