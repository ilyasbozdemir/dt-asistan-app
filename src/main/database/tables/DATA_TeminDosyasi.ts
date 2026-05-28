export const DATA_TeminDosyasi = {
  name: 'DATA_TeminDosyasi',
  description: 'Doğrudan temin dosyalarının ana kayıtları',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'temin_no', type: 'TEXT' }, // Kurum içi numara (örn: 2026/DT-001)
    { name: 'konu', type: 'TEXT', notNull: true }, // Temin konusu
    { name: 'birim_id', type: 'INTEGER' }, // TANIM_Birim referansı
    { name: 'tur', type: 'TEXT', notNull: true, default: "'mal'" }, // mal | hizmet | yapim_isi
    { name: 'yaklasik_maliyet', type: 'REAL', default: 0 },
    { name: 'butce_kodu', type: 'TEXT' },
    { name: 'temin_tarihi', type: 'DATE' },
    { name: 'teslim_tarihi', type: 'DATE' },
    { name: 'firma_id', type: 'INTEGER' }, // Seçilen kazanan firma
    { name: 'onay_personel_id', type: 'INTEGER' }, // Onay veren / harcama yetkilisi
    { name: 'hazirlayan_personel_id', type: 'INTEGER' },
    { name: 'durum_asama_id', type: 'INTEGER' }, // TANIM_Asama referansı
    { name: 'mevzuat_id', type: 'INTEGER' }, // TANIM_Mevzuat kaydına referans
    { name: 'notlar', type: 'TEXT' },
    { name: 'fonksiyonel_kod', type: 'TEXT' },
    { name: 'ekonomik_kod', type: 'TEXT' },
    { name: 'created_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' },

    { name: 'updated_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' }
  ],
  initialData: []
}
