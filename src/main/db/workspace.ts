import AdmZip from 'adm-zip'
import Database from 'better-sqlite3'
import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import { initializeDatabase } from '../database/index'
import { runMigrations, CURRENT_SCHEMA_VERSION } from './migrate'

export interface WorkspaceMeta {
  dtm_version: string      // format versiyonu (örn: "1.0")
  app_version: string      // oluşturan/güncelleyen uygulama versiyonu (örn: "1.0.0-alpha.2")
  created_at: string       // oluşturulma tarihi (YYYY-MM-DD)
  institution: string      // kurum adı
  schema_version: number   // veritabanı şema versiyonu (örn: 3)
  updated_at?: string      // son düzenlenme zamanı (ISO string)
}

function normalizeMeta(raw: any): WorkspaceMeta {
  return {
    dtm_version: raw.dtm_version || '1.0',
    app_version: raw.app_version || raw.version || '1.0.0',
    created_at: raw.created_at || (raw.createdAt ? raw.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
    institution: raw.institution || raw.institutionName || 'Bilinmeyen Kurum',
    schema_version: parseInt(raw.schema_version || raw.schemaVersion || '1', 10) || 1,
    updated_at: raw.updated_at || raw.updatedAt || new Date().toISOString()
  }
}


export class DtmWorkspace {
  private tempDir: string
  private db: Database.Database | null = null
  private currentFilePath: string | null = null
  private meta: WorkspaceMeta | null = null

  constructor() {
    // Generate a unique temp directory for this workspace session
    this.tempDir = path.join(app.getPath('userData'), 'dtm_temp', Date.now().toString())
  }

  /**
   * Opens an existing .dtm file, extracts it to the temp directory, and connects to the database.
   */
  public openWorkspace(filePath: string): WorkspaceMeta {
    this.currentFilePath = filePath
    this.ensureTempDir()

    // 1. Extract the .dtm zip file
    const zip = new AdmZip(filePath)
    zip.extractAllTo(this.tempDir, true)

    // 2. Read metadata
    const metaPath = path.join(this.tempDir, 'meta.json')
    let rawMeta: any = {}
    if (fs.existsSync(metaPath)) {
      const rawMetaContent = fs.readFileSync(metaPath, 'utf-8')
      rawMeta = JSON.parse(rawMetaContent)
    } else {
      throw new Error('Geçersiz dosya: meta.json bulunamadı.')
    }

    const meta = normalizeMeta(rawMeta)

    // Version checks
    const SUPPORTED_DTM_VERSION = 1.0
    if (parseFloat(meta.dtm_version) > SUPPORTED_DTM_VERSION) {
      throw new Error(
        `Bu dosya daha yeni bir uygulama sürümü gerektirir. (Gereken Format: ${meta.dtm_version}, Desteklenen En Yüksek Format: ${SUPPORTED_DTM_VERSION})`
      )
    }

    const fromVersion = meta.schema_version || 1

    if (fromVersion > CURRENT_SCHEMA_VERSION) {
      console.warn(
        `Uyarı: Dosya şema sürümü (v${meta.schema_version}) uygulamadan yüksek. Şema sürümü v${CURRENT_SCHEMA_VERSION} olarak sıfırlanıyor.`
      )
      meta.schema_version = CURRENT_SCHEMA_VERSION
      meta.app_version = app.getVersion()
      meta.updated_at = new Date().toISOString()
      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2))
      
      const dbPath = path.join(this.tempDir, 'database.sqlite')
      this.db = new Database(dbPath)
      
      try {
        this.db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('dbSchemaVersion', ?);").run(
          CURRENT_SCHEMA_VERSION.toString()
        )
      } catch (e) {
        console.error('Failed to reset dbSchemaVersion in settings table:', e)
      }
      
      this.saveWorkspace()
    } else if (fromVersion < CURRENT_SCHEMA_VERSION) {

      // 1. Create backup before applying migrations
      const backupPath = filePath + '.bak'
      try {
        fs.copyFileSync(filePath, backupPath)
      } catch (err: any) {
        throw new Error(`Dosya yedeklenirken hata oluştu: ${err.message}`)
      }

      try {
        // 2. Connect to the SQLite database in temp directory
        const dbPath = path.join(this.tempDir, 'database.sqlite')
        this.db = new Database(dbPath)

        // 3. Run sequential migration steps in transaction
        runMigrations(this.db, fromVersion)
        
        // 4. Update metadata to reflect new schema version and current app version
        meta.schema_version = CURRENT_SCHEMA_VERSION
        meta.app_version = app.getVersion()
        meta.updated_at = new Date().toISOString()
        fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2))
        
        // 5. Save changes back to zip archive immediately
        this.saveWorkspace()


        // 6. Delete backup file upon successful migration
        if (fs.existsSync(backupPath)) {
          fs.unlinkSync(backupPath)
        }
      } catch (migrationError: any) {
        console.error('Veritabanı güncellemesi başarısız oldu, değişiklikler geri alınıyor:', migrationError)
        
        // Close DB connection if it was initialized
        if (this.db) {
          try {
            this.db.close()
          } catch (e) {
            // ignore close error
          }
          this.db = null
        }

        // Restore original file state from backup
        try {
          if (fs.existsSync(backupPath)) {
            fs.copyFileSync(backupPath, filePath)
            fs.unlinkSync(backupPath)
          }
        } catch (rollbackErr: any) {
          console.error('Yedek dosya geri yüklenirken hata oluştu:', rollbackErr)
        }

        // Clear temp directory
        this.ensureTempDir()

        // Throw Turkish error
        throw new Error(
          `Dosya güncellenirken kritik bir hata oluştu ve işlem iptal edildi. Veri kaybı olmaması için dosya eski haline döndürüldü.\nHata Detayı: ${migrationError.message}`
        )
      }
    } else {
      // No migration needed, just connect to database
      const dbPath = path.join(this.tempDir, 'database.sqlite')
      this.db = new Database(dbPath)
    }

    this.meta = meta
    return meta
  }

  /**
   * Creates a brand new .dtm workspace
   */
  public createWorkspace(filePath: string, institutionName: string): WorkspaceMeta {
    this.currentFilePath = filePath
    this.ensureTempDir()

    // 1. Create a new SQLite database
    const dbPath = path.join(this.tempDir, 'database.sqlite')
    this.db = new Database(dbPath)

    // Initialize Schema using our centralized index.ts logic
    initializeDatabase(this.db, institutionName)

    // 2. Create metadata using new schema
    const meta: WorkspaceMeta = {
      dtm_version: '1.0',
      app_version: app.getVersion(),
      created_at: new Date().toISOString().split('T')[0],
      institution: institutionName,
      schema_version: CURRENT_SCHEMA_VERSION,
      updated_at: new Date().toISOString()
    }
    const metaPath = path.join(this.tempDir, 'meta.json')
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2))

    // 3. Create attachments folder
    fs.mkdirSync(path.join(this.tempDir, 'attachments'))

    // 4. Save to the actual .dtm file
    this.saveWorkspace()

    this.meta = meta
    return meta
  }

  /**
   * Packages the temp directory back into the .dtm file.
   */
  public saveWorkspace(): void {
    if (!this.currentFilePath || !this.db) {
      throw new Error('Hiçbir veri dosyası açık değil.')
    }

    this.db.pragma('wal_checkpoint(TRUNCATE)')

    // Update updated_at, app_version and sync institution name in meta
    const metaPath = path.join(this.tempDir, 'meta.json')
    if (fs.existsSync(metaPath)) {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8')) as WorkspaceMeta
      meta.updated_at = new Date().toISOString()
      meta.app_version = app.getVersion()

      // Fetch institution name from settings table to keep meta.json in sync
      try {
        const row = this.db.prepare("SELECT value FROM settings WHERE key = 'institutionName'").get() as
          | { value: string }
          | undefined
        if (row && row.value) {
          meta.institution = row.value
        }
      } catch (e) {
        console.error('Failed to sync institution name from DB to meta.json:', e)
      }

      // Fetch dbSchemaVersion from settings table to keep meta.json in sync
      try {
        const row = this.db.prepare("SELECT value FROM settings WHERE key = 'dbSchemaVersion'").get() as
          | { value: string }
          | undefined
        if (row && row.value) {
          meta.schema_version = parseInt(row.value, 10) || CURRENT_SCHEMA_VERSION
        }
      } catch (e) {
        console.error('Failed to sync dbSchemaVersion from DB to meta.json:', e)
      }

      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2))
      this.meta = meta
    }


    const zip = new AdmZip()
    zip.addLocalFolder(this.tempDir)
    zip.writeZip(this.currentFilePath)
  }

  /**
   * Closes the workspace and cleans up the temp directory.
   */
  public closeWorkspace(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
    this.currentFilePath = null
    this.meta = null

    if (fs.existsSync(this.tempDir)) {
      fs.rmSync(this.tempDir, { recursive: true, force: true })
    }
  }

  public getDb(): Database.Database {
    if (!this.db) throw new Error('Veritabanı bağlı değil.')
    return this.db
  }

  public getMeta(): WorkspaceMeta | null {
    return this.meta
  }

  private ensureTempDir() {
    if (fs.existsSync(this.tempDir)) {
      fs.rmSync(this.tempDir, { recursive: true, force: true })
    }
    fs.mkdirSync(this.tempDir, { recursive: true })
  }
}

// Global active workspace manager
let activeWorkspace: DtmWorkspace | null = null

export const workspaceManager = {
  create: (filePath: string, institutionName: string) => {
    if (activeWorkspace) activeWorkspace.closeWorkspace()
    activeWorkspace = new DtmWorkspace()
    return activeWorkspace.createWorkspace(filePath, institutionName)
  },
  open: (filePath: string) => {
    if (activeWorkspace) activeWorkspace.closeWorkspace()
    activeWorkspace = new DtmWorkspace()
    return activeWorkspace.openWorkspace(filePath)
  },
  save: () => {
    if (activeWorkspace) activeWorkspace.saveWorkspace()
  },
  close: () => {
    if (activeWorkspace) {
      activeWorkspace.closeWorkspace()
      activeWorkspace = null
    }
  },
  getDb: () => {
    if (!activeWorkspace) throw new Error('Açık bir veri dosyası yok.')
    return activeWorkspace.getDb()
  },
  getMeta: () => {
    if (!activeWorkspace) return null
    return activeWorkspace.getMeta()
  }
}
