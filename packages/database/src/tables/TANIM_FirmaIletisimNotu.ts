export const TANIM_FirmaIletisimNotu = {
  name: 'TANIM_FirmaIletisimNotu',
  description: 'Firmalarla yapılan görüşmeler ve iletişim notları',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'firma_id', type: 'INTEGER', notNull: true, description: 'Firma ID (FK → TANIM_Firma)' },
    { name: 'not_metni', type: 'TEXT', notNull: true, description: 'Not İçeriği' },
    { name: 'gorusen_kisi', type: 'TEXT', description: 'Görüşmeyi Yapan Kişi / Personel' },
    { name: 'iletisim_tarihi', type: 'TEXT', description: 'İletişim Tarihi (YYYY-MM-DD)' },
    {
      name: 'created_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Created At'
    }
  ],
  constraints: [
    'FOREIGN KEY(firma_id) REFERENCES TANIM_Firma(id) ON DELETE CASCADE'
  ],
  initialData: []
}
