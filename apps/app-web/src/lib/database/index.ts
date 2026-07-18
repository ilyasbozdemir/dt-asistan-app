import Database from 'better-sqlite3'
import path from 'path'
import { schema, runMigrations, initializeDatabase } from '@dt/database'

let dbInstance: Database.Database | null = null

export function getDatabase(): Database.Database {
  if (dbInstance) return dbInstance

  const dbPath = path.join(process.cwd(), 'dt_asistan_web.db')
  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  // Get current schema version
  let currentSchemaVer = 0
  try {
    const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='settings'").get()
    if (tableCheck) {
      const versionRes = db.prepare("SELECT value FROM settings WHERE key = 'dbSchemaVersion'").get() as { value: string }
      if (versionRes) {
        currentSchemaVer = parseInt(versionRes.value) || 0
      }
    }
  } catch {
    // settings doesn't exist yet
  }

  if (currentSchemaVer === 0) {
    console.log('Veritabanı sıfırdan kuruluyor...')
    initializeDatabase(db, 'Ankara İl Sağlık Müdürlüğü', '1.0.0-web.1')
  } else {
    // Run migrations if needed
    runMigrations(db, currentSchemaVer, schema)
  }

  dbInstance = db
  return dbInstance
}
