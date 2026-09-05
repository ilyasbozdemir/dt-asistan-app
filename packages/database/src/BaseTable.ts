import { auditColumns, auditColumnsNoRef } from './audit'

/**
 * 🛡️ Kozmik Tablo Fabrikası (Base Table & Audit Inheritance)
 * Tablo tanımlarını alır, audit / denetim kolonlarını (istisnalar hariç) otomatik enjekte eder.
 */
export const defineTable = (schema: any): any => {
  if (!schema || !schema.columns) return schema
  // 1. Audit istenmiyorsa (hasAudit: false) direkt dön
  if (schema.hasAudit === false) return schema

  // 2. Kolon listesini al
  const baseAuditCols = schema.name === 'TANIM_Personel' ? auditColumnsNoRef : auditColumns

  const existingColNames = new Set((schema.columns || []).map((c: any) => c.name?.toLowerCase()))
  const columnsToAdd = baseAuditCols.filter(
    (auditCol: any) => !existingColNames.has(auditCol.name.toLowerCase())
  )

  return {
    ...schema,
    columns: [...schema.columns, ...columnsToAdd]
  }
}

