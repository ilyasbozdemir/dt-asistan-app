export const auditColumns: any[] = [
  {
    name: 'created_by',
    type: 'INTEGER',
    default: 'NULL',
    description: 'Kaydı Oluşturan Personel / Kullanıcı ID'
  },
  {
    name: 'created_at',
    type: 'DATETIME',
    default: 'CURRENT_TIMESTAMP',
    description: 'Oluşturulma Zamanı'
  },
  {
    name: 'updated_by',
    type: 'INTEGER',
    default: 'NULL',
    description: 'Son Güncelleyen Personel / Kullanıcı ID'
  },
  {
    name: 'updated_at',
    type: 'DATETIME',
    default: 'CURRENT_TIMESTAMP',
    description: 'Son Güncellenme Zamanı'
  },
  {
    name: 'is_active',
    type: 'INTEGER',
    default: 1,
    description: 'Aktiflik Durumu (1: Aktif, 0: Pasif)'
  },
  {
    name: 'is_deleted',
    type: 'INTEGER',
    default: 0,
    description: 'Silinme Durumu (1: Silinmiş, 0: Normal)'
  }
]

export const auditColumnsNoRef = auditColumns

