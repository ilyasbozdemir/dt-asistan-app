export const DATA_TeminFirma = {
  name: 'DATA_TeminFirma',
  description: 'Dosyaya davet edilen veya teklif veren istekli firmalar',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'temin_dosya_id', type: 'INTEGER', notNull: true },
    { name: 'firma_id', type: 'INTEGER', notNull: true },
    { name: 'teklif_durumu', type: 'TEXT', default: "'Davet Edildi'" }, // Davet Edildi | Teklif Verdi | Teklif Vermedi | Geçersiz Teklif
    { name: 'davet_tarihi', type: 'DATE' },
    { name: 'teklif_tarihi', type: 'DATE' },
    { name: 'teslim_suresi', type: 'TEXT' },
    { name: 'para_birimi', type: 'TEXT', default: "'TRY'" },
    { name: 'aktif_mi', type: 'INTEGER', default: 1 },
    { name: 'yasaklilik_durumu', type: 'TEXT', default: "'Sorgulanmadı'" },
    { name: 'yasaklilik_belgesi', type: 'TEXT' },
    { name: 'created_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' },
    { name: 'updated_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' }
  ],
  constraints: [
    'FOREIGN KEY(temin_dosya_id) REFERENCES DATA_TeminDosyasi(id) ON DELETE CASCADE',
    'FOREIGN KEY(firma_id) REFERENCES TANIM_Firma(id) ON DELETE CASCADE'
  ],
  initialData: []
}
