import { createClient, SupabaseClient } from '@supabase/supabase-js'

export interface SupabaseConfig {
  url: string
  anonKey: string
  serviceRoleKey?: string
  bucketDocuments?: string
  bucketBackups?: string
}

export interface SupabaseConnectionResult {
  success: boolean
  message: string
  latencyMs?: number
  version?: string
  tablesCount?: number
}

let cachedClient: SupabaseClient | null = null
let currentConfig: SupabaseConfig | null = null

export function getSupabaseClient(config?: SupabaseConfig): SupabaseClient | null {
  if (config) {
    if (
      !cachedClient ||
      currentConfig?.url !== config.url ||
      currentConfig?.anonKey !== config.anonKey
    ) {
      if (!config.url || !config.anonKey) {
        return null
      }
      cachedClient = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      })
      currentConfig = config
    }
    return cachedClient
  }
  return cachedClient
}

export async function testSupabaseConnection(config: SupabaseConfig): Promise<SupabaseConnectionResult> {
  if (!config.url || !config.anonKey) {
    return {
      success: false,
      message: 'Supabase URL ve Anon Key zorunludur.'
    }
  }

  const startTime = Date.now()
  try {
    const client = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })

    // Basit bir health check tablosu sorgusu (DATA_TeminDosyasi veya TANIM_Kurum)
    const { error } = await client
      .from('DATA_TeminDosyasi')
      .select('id', { count: 'exact', head: true })

    const latencyMs = Date.now() - startTime

    if (error) {
      // Eğer tablo henüz oluşturulmamışsa ancak endpoint yanıt veriyorsa (örn: PGRST204)
      if (error.code === 'PGRST204' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: true,
          latencyMs,
          message: `Supabase sunucusuna bağlanıldı (${latencyMs}ms), ancak tablolar henüz oluşturulmamış. Lütfen 'supabase_schema.sql' dosyasını SQL editöründe çalıştırın.`
        }
      }

      return {
        success: false,
        latencyMs,
        message: `Bağlantı hatası: ${error.message} (Kod: ${error.code || 'Bilinmiyor'})`
      }
    }

    return {
      success: true,
      latencyMs,
      message: `Supabase bağlantısı başarılı! Yanıt süresi: ${latencyMs}ms.`
    }
  } catch (err: any) {
    const latencyMs = Date.now() - startTime
    return {
      success: false,
      latencyMs,
      message: `Sunucuya erişilemedi: ${err?.message || 'Bilinmeyen ağ hatası'}`
    }
  }
}
