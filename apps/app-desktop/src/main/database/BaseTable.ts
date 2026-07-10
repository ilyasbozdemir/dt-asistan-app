import { auditColumns, auditColumnsNoRef } from './audit'
import { TableSchema } from './types'

/**
 * 🛡️ Kozmik Tablo Fabrikası
 * Tablo tanımlarını alır, audit kolonlarını (istisnalar hariç) otomatik enjekte eder.
 */
export const defineTable = (schema: TableSchema): TableSchema => {
  // 1. Audit istenmiyorsa (Finansal/Sistem) direkt dön
  if (schema.hasAudit === false) return schema

  // 2. TANIM_Personel için dairesel referans içermeyen audit kolonlarını kullan
  const columnsToAdd = schema.name === 'TANIM_Personel' ? auditColumnsNoRef : auditColumns

  return {
    ...schema,
    columns: [...schema.columns, ...columnsToAdd]
  }
}
