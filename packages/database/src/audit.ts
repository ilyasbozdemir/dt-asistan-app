import { TableColumn } from './types'

export const auditColumns: TableColumn[] = [
  { name: 'createdBy', type: 'INTEGER', constraints: ['REFERENCES TANIM_Personel(id)'] },
  { name: 'createdAt', type: 'DATETIME', constraints: ['DEFAULT CURRENT_TIMESTAMP'] },
  { name: 'updatedBy', type: 'INTEGER', constraints: ['REFERENCES TANIM_Personel(id)'] },
  { name: 'updatedAt', type: 'DATETIME', constraints: ['DEFAULT CURRENT_TIMESTAMP'] },
  { name: 'isActive', type: 'INTEGER', constraints: ['DEFAULT 1'] },
  { name: 'isDeleted', type: 'INTEGER', constraints: ['DEFAULT 0'] }
]

export const auditColumnsNoRef: TableColumn[] = [
  { name: 'createdBy', type: 'INTEGER' },
  { name: 'createdAt', type: 'DATETIME', constraints: ['DEFAULT CURRENT_TIMESTAMP'] },
  { name: 'updatedBy', type: 'INTEGER' },
  { name: 'updatedAt', type: 'DATETIME', constraints: ['DEFAULT CURRENT_TIMESTAMP'] },
  { name: 'isActive', type: 'INTEGER', constraints: ['DEFAULT 1'] },
  { name: 'isDeleted', type: 'INTEGER', constraints: ['DEFAULT 0'] }
]
