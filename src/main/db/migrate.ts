import Database from 'better-sqlite3'
import { app } from 'electron'
import yaml from 'js-yaml'
import manifestRaw from './schema-manifest.yaml?raw'
// database/index.ts importu, oradaki table definition'larını kullanarak DDL oluşturmak için
import { schema as dbSchemaDef } from '../database/index'

export interface SchemaChange {
  schema: number
  type: string
  description: string
  tables_added?: string[]
  columns_added?: { table: string; column: string }[]
}

export interface AppVersionManifest {
  app: string
  schema_min: number
  schema_max: number
  release_date: string
  changes: SchemaChange[]
}

export interface SchemaManifest {
  versions: AppVersionManifest[]
}

export const manifest: SchemaManifest = yaml.load(manifestRaw) as SchemaManifest

export function getCurrentAppManifest(): AppVersionManifest {
  // Use app version from electron, default to last available if not matched
  const appVersion = app.getVersion()
  const found = manifest.versions.find(v => v.app === appVersion)
  if (found) return found
  return manifest.versions[manifest.versions.length - 1]
}

// Artık CURRENT_SCHEMA_VERSION bir fonksiyon ya da property getter gibi davranabilir.
// Mevcut app'e izin verilen max DB şeması:
export const CURRENT_SCHEMA_VERSION = getCurrentAppManifest().schema_max

export interface PendingMigrationInfo {
  schema: number
  description: string
}

export function getPendingMigrations(fromVersion: number): PendingMigrationInfo[] {
  const appManifest = getCurrentAppManifest()
  const pending: PendingMigrationInfo[] = []
  if (fromVersion >= appManifest.schema_max) return pending

  const allChanges: SchemaChange[] = []
  for (const v of manifest.versions) {
    if (v.changes) {
      for (const change of v.changes) {
        if (!allChanges.find(c => c.schema === change.schema)) {
          allChanges.push(change)
        }
      }
    }
  }
  allChanges.sort((a, b) => a.schema - b.schema)

  for (const change of allChanges) {
    if (change.schema > fromVersion && change.schema <= appManifest.schema_max) {
      pending.push({
        schema: change.schema,
        description: change.description
      })
    }
  }
  return pending
}

export function runMigrations(db: Database.Database, fromVersion: number): void {
  const MAX_SCHEMA = getCurrentAppManifest().schema_max
  if (fromVersion >= MAX_SCHEMA) return

  const allChanges: SchemaChange[] = []
  for (const v of manifest.versions) {
    if (v.changes) {
      for (const change of v.changes) {
        if (!allChanges.find(c => c.schema === change.schema)) {
          allChanges.push(change)
        }
      }
    }
  }
  allChanges.sort((a, b) => a.schema - b.schema)

  const pendingChanges = allChanges.filter(c => c.schema > fromVersion && c.schema <= MAX_SCHEMA)

  if (pendingChanges.length === 0) return

  console.log(`v${fromVersion} sürümünden v${MAX_SCHEMA} sürümüne veritabanı göçü başlatılıyor...`)

  db.exec('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);')

  const executeMigrationsTransaction = db.transaction(() => {
    for (const change of pendingChanges) {
      console.log(`[Migration v${change.schema}] ${change.description} çalıştırılıyor...`)
      try {
        if (change.tables_added && change.tables_added.length > 0) {
          for (const tableName of change.tables_added) {
            const tableDef = dbSchemaDef.tables.find(t => t.name === tableName)
            if (!tableDef) throw new Error(`Tablo tanımı bulunamadı: ${tableName}`)

            const columnsSql = tableDef.columns.map((col: any) => {
              let colDef = '"' + col.name + '" ' + col.type
              if (col.primaryKey) colDef += ' PRIMARY KEY'
              if (col.autoIncrement) colDef += ' AUTOINCREMENT'
              if (col.unique) colDef += ' UNIQUE'
              if (col.notNull) colDef += ' NOT NULL'
              if (col.default !== undefined) {
                colDef += ' DEFAULT ' + (typeof col.default === 'string' ? col.default : col.default)
              }
              return colDef
            }).join(', ')

            const constraintsSql = (tableDef as any).constraints ? ', ' + (tableDef as any).constraints.join(', ') : ''
            db.exec(`CREATE TABLE IF NOT EXISTS ${tableName} (${columnsSql}${constraintsSql});`)
            
            // Eğer varsa varsayılan verilerini de bas
            if (tableDef.initialData && tableDef.initialData.length > 0) {
              tableDef.initialData.forEach((row: any) => {
                const keys = Object.keys(row)
                const values = Object.values(row).map(v => typeof v === 'string' ? "'" + v.replace(/'/g, "''") + "'" : v)
                db.exec(`INSERT OR IGNORE INTO ${tableName} (${keys.join(', ')}) VALUES (${values.join(', ')});`)
              })
            }
          }
        }

        if (change.columns_added && change.columns_added.length > 0) {
          for (const colAdd of change.columns_added) {
            const tableDef = dbSchemaDef.tables.find(t => t.name === colAdd.table)
            if (!tableDef) throw new Error(`Tablo tanımı bulunamadı: ${colAdd.table}`)
            const colDef = tableDef.columns.find((c: any) => c.name === colAdd.column)
            if (!colDef) throw new Error(`Kolon tanımı bulunamadı: ${colAdd.table}.${colAdd.column}`)

            let sqlDef = '"' + colDef.name + '" ' + colDef.type
            if ((colDef as any).unique) sqlDef += ' UNIQUE'
            if ((colDef as any).notNull) sqlDef += ' NOT NULL'
            if ((colDef as any).default !== undefined) {
              sqlDef += ' DEFAULT ' + (typeof (colDef as any).default === 'string' ? (colDef as any).default : (colDef as any).default)
            }

            try {
              db.exec(`ALTER TABLE ${colAdd.table} ADD COLUMN ${sqlDef};`)
            } catch (err: any) {
              if (err.message && err.message.includes('duplicate column name')) {
                // Ignore duplicate column errors to make it idempotent
                console.log(`Column ${colAdd.table}.${colAdd.column} already exists, skipping.`)
              } else {
                throw err
              }
            }
          }
        }
        
        db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('dbSchemaVersion', ?);").run(
          change.schema.toString()
        )
      } catch (error: any) {
        throw new Error(`[Sürüm ${change.schema} - ${change.description}] adımı sırasında hata oluştu: ${error.message}`)
      }
    }
  })

  try {
    executeMigrationsTransaction()
  } catch (error: any) {
    throw error // Yüksek seviyeye fırlatıyoruz, workspace.ts dosyayı rollback yapacak.
  }
  console.log('Tüm veritabanı göç adımları başarıyla tamamlandı.')
}
