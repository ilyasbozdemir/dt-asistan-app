import Database from 'better-sqlite3'

export function migrate(db: Database.Database): void {
  console.log('Migrating database schema from v1 to v2 (adding code columns)...')
  try {
    db.exec('ALTER TABLE DATA_TeminDosyasi ADD COLUMN fonksiyonel_kod TEXT;')
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    db.exec('ALTER TABLE DATA_TeminDosyasi ADD COLUMN ekonomik_kod TEXT;')
  } catch (e) {
    // Column already exists, ignore
  }
}
