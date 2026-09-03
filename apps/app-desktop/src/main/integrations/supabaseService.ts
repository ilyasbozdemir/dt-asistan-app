import fs from 'fs'
import path from 'path'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { workspaceManager } from '../database/workspace'

export interface SupabaseSettings {
  url: string
  anonKey: string
  serviceRoleKey?: string
  bucketDocuments?: string
  bucketBackups?: string
  autoSyncEnabled?: boolean
}

class SupabaseService {
  private client: SupabaseClient | null = null
  private currentConfig: SupabaseSettings | null = null

  public getConfig(): SupabaseSettings {
    try {
      const db = workspaceManager.getDb()
      const rows = db.prepare('SELECT key, value FROM settings WHERE key LIKE "supabase_%"').all() as {
        key: string
        value: string
      }[]

      const configMap: Record<string, string> = {}
      for (const row of rows) {
        configMap[row.key] = row.value
      }

      return {
        url: configMap['supabase_url'] || '',
        anonKey: configMap['supabase_anon_key'] || '',
        serviceRoleKey: configMap['supabase_service_role_key'] || '',
        bucketDocuments: configMap['supabase_bucket_documents'] || 'hakim-pro-documents',
        bucketBackups: configMap['supabase_bucket_backups'] || 'hakim-pro-backups',
        autoSyncEnabled: configMap['supabase_auto_sync'] === 'true'
      }
    } catch {
      return {
        url: '',
        anonKey: '',
        serviceRoleKey: '',
        bucketDocuments: 'hakim-pro-documents',
        bucketBackups: 'hakim-pro-backups',
        autoSyncEnabled: false
      }
    }
  }

  public saveConfig(config: SupabaseSettings): { success: boolean; message?: string } {
    try {
      const db = workspaceManager.getDb()
      const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')

      db.transaction(() => {
        upsert.run('supabase_url', config.url || '')
        upsert.run('supabase_anon_key', config.anonKey || '')
        upsert.run('supabase_service_role_key', config.serviceRoleKey || '')
        upsert.run('supabase_bucket_documents', config.bucketDocuments || 'hakim-pro-documents')
        upsert.run('supabase_bucket_backups', config.bucketBackups || 'hakim-pro-backups')
        upsert.run('supabase_auto_sync', config.autoSyncEnabled ? 'true' : 'false')
      })()

      workspaceManager.save()
      this.client = null // reset client to re-init with new config
      this.currentConfig = config
      return { success: true }
    } catch (err: any) {
      return { success: false, message: err?.message || 'Ayarlar kaydedilemedi.' }
    }
  }

  public getClient(): SupabaseClient | null {
    const config = this.getConfig()
    if (!config.url || !config.anonKey) {
      return null
    }

    if (!this.client || this.currentConfig?.url !== config.url || this.currentConfig?.anonKey !== config.anonKey) {
      this.client = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      })
      this.currentConfig = config
    }
    return this.client
  }

  public async testConnection(customConfig?: SupabaseSettings): Promise<{
    success: boolean
    message: string
    latencyMs?: number
  }> {
    const config = customConfig || this.getConfig()
    if (!config.url || !config.anonKey) {
      return {
        success: false,
        message: 'Supabase URL ve Anon Key bilgileri eksik.'
      }
    }

    const start = Date.now()
    try {
      const testClient = createClient(config.url, config.anonKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      })

      // Test query to check if server is reachable
      const { error } = await testClient
        .from('DATA_TeminDosyasi')
        .select('id', { count: 'exact', head: true })

      const latencyMs = Date.now() - start

      if (error) {
        if (error.code === 'PGRST204' || error.message.includes('relation') || error.message.includes('does not exist')) {
          return {
            success: true,
            latencyMs,
            message: `Supabase sunucusuna bağlanıldı (${latencyMs}ms), ancak tablolar bulunamadı. Lütfen 'supabase_schema.sql' dosyasını SQL editöründe çalıştırın.`
          }
        }
        return {
          success: false,
          latencyMs,
          message: `Bağlantı hatası: ${error.message}`
        }
      }

      return {
        success: true,
        latencyMs,
        message: `Supabase bağlantısı başarılı! (${latencyMs}ms)`
      }
    } catch (err: any) {
      const latencyMs = Date.now() - start
      return {
        success: false,
        latencyMs,
        message: `Sunucuya erişilemedi: ${err?.message || 'Bilinmeyen ağ hatası'}`
      }
    }
  }

  public async uploadBackup(backupPath?: string): Promise<{ success: boolean; message: string; data?: any }> {
    const client = this.getClient()
    const config = this.getConfig()

    if (!client) {
      return { success: false, message: 'Supabase bağlantısı yapılandırılmamış.' }
    }

    try {
      const targetFilePath = backupPath || workspaceManager.getCurrentFilePath()
      if (!targetFilePath || !fs.existsSync(targetFilePath)) {
        return { success: false, message: 'Yedeklenecek veritabanı dosyası bulunamadı.' }
      }

      const fileBuffer = fs.readFileSync(targetFilePath)
      const fileName = `backup_${path.basename(targetFilePath, path.extname(targetFilePath))}_${Date.now()}.sqlite`
      const bucket = config.bucketBackups || 'hakim-pro-backups'

      const { data, error } = await client.storage
        .from(bucket)
        .upload(fileName, fileBuffer, {
          contentType: 'application/x-sqlite3',
          upsert: true
        })

      if (error) {
        return { success: false, message: `Yedekleme yüklenemedi: ${error.message}` }
      }

      // Log backup into app_backups table if available
      try {
        await client.from('app_backups').insert({
          backup_name: fileName,
          file_size: fileBuffer.length,
          storage_path: data?.path || fileName,
          backup_type: 'sqlite_snapshot',
          created_by: 'Masaüstü Uygulaması'
        })
      } catch {
        // non-fatal if table not created yet
      }

      return {
        success: true,
        message: `Veritabanı yedeği Supabase (${bucket}/${fileName}) üzerine başarıyla yüklendi.`,
        data
      }
    } catch (err: any) {
      return { success: false, message: `Yedekleme hatası: ${err?.message || 'Bilinmeyen hata'}` }
    }
  }

  public async listBackups(): Promise<{ success: boolean; data?: any[]; message?: string }> {
    const client = this.getClient()
    const config = this.getConfig()

    if (!client) {
      return { success: false, message: 'Supabase bağlantısı yapılandırılmamış.' }
    }

    try {
      const bucket = config.bucketBackups || 'hakim-pro-backups'
      const { data, error } = await client.storage.from(bucket).list('', {
        limit: 50,
        sortBy: { column: 'created_at', order: 'desc' }
      })

      if (error) {
        return { success: false, message: error.message }
      }

      return { success: true, data: data || [] }
    } catch (err: any) {
      return { success: false, message: err?.message || 'Yedekler listelenemedi.' }
    }
  }

  public async uploadDocument(
    filePath: string,
    remoteFolder: string = 'documents'
  ): Promise<{ success: boolean; message: string; signedUrl?: string; storagePath?: string }> {
    const client = this.getClient()
    const config = this.getConfig()

    if (!client) {
      return { success: false, message: 'Supabase bağlantısı yapılandırılmamış.' }
    }

    try {
      if (!fs.existsSync(filePath)) {
        return { success: false, message: 'Yüklenecek yerel dosya bulunamadı.' }
      }

      const fileBuffer = fs.readFileSync(filePath)
      const baseName = path.basename(filePath)
      const storagePath = `${remoteFolder}/${Date.now()}_${baseName}`
      const bucket = config.bucketDocuments || 'hakim-pro-documents'

      const { error } = await client.storage
        .from(bucket)
        .upload(storagePath, fileBuffer, {
          upsert: true
        })

      if (error) {
        return { success: false, message: `Dosya yükleme hatası: ${error.message}` }
      }

      // Generate signed URL valid for 60 minutes
      const { data: signedData } = await client.storage
        .from(bucket)
        .createSignedUrl(storagePath, 3600)

      return {
        success: true,
        message: 'Belge Supabase Storage üzerine yüklendi.',
        storagePath,
        signedUrl: signedData?.signedUrl
      }
    } catch (err: any) {
      return { success: false, message: `Belge yükleme hatası: ${err?.message || 'Bilinmeyen hata'}` }
    }
  }

  public async getDocumentSignedUrl(
    storagePath: string,
    expiresInSeconds: number = 3600
  ): Promise<{ success: boolean; signedUrl?: string; message?: string }> {
    const client = this.getClient()
    const config = this.getConfig()

    if (!client) {
      return { success: false, message: 'Supabase bağlantısı yapılandırılmamış.' }
    }

    try {
      const bucket = config.bucketDocuments || 'hakim-pro-documents'
      const { data, error } = await client.storage
        .from(bucket)
        .createSignedUrl(storagePath, expiresInSeconds)

      if (error) {
        return { success: false, message: error.message }
      }

      return { success: true, signedUrl: data?.signedUrl }
    } catch (err: any) {
      return { success: false, message: err?.message || 'İmzalı URL üretilemedi.' }
    }
  }
}

export const supabaseService = new SupabaseService()
