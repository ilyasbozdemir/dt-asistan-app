import Database from 'better-sqlite3'
import { migrations } from './migrations/index'

export const CURRENT_SCHEMA_VERSION = 3

/**
 * Runs pending database migrations sequentially.
 * Wraps execution inside a database transaction to ensure atomicity.
 */
export function runMigrations(db: Database.Database, fromVersion: number): void {
  const pendingMigrations = migrations
    .filter((m) => m.version > fromVersion)
    .sort((a, b) => a.version - b.version)

  if (pendingMigrations.length === 0) {
    console.log('Veritabanı şeması zaten güncel.')
    return
  }

  console.log(`v${fromVersion} sürümünden v${CURRENT_SCHEMA_VERSION} sürümüne veritabanı göçü başlatılıyor...`)

  // Ensure the settings table exists to store schema version updates
  db.exec('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);')

  // Run migrations within an atomic transaction
  const executeMigrationsTransaction = db.transaction(() => {
    for (const migration of pendingMigrations) {
      console.log(`v${migration.version} şema sürümüne geçiş adımı çalıştırılıyor...`)
      migration.migrate(db)
      
      // Update schema version in the settings table
      db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('dbSchemaVersion', ?);").run(
        migration.version.toString()
      )
    }
  })

  executeMigrationsTransaction()
  console.log('Tüm veritabanı göç adımları başarıyla tamamlandı.')
}
