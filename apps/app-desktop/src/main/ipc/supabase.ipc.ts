import { ipcMain } from 'electron'
import { supabaseService, SupabaseSettings } from '../integrations/supabaseService'

export function registerSupabaseIpcHandlers(): void {
  ipcMain.handle('supabase:get-config', async () => {
    try {
      const config = supabaseService.getConfig()
      return { success: true, data: config }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('supabase:save-config', async (_, config: SupabaseSettings) => {
    try {
      const res = supabaseService.saveConfig(config)
      return res
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('supabase:test-connection', async (_, config?: SupabaseSettings) => {
    try {
      const res = await supabaseService.testConnection(config)
      return res
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  })

  ipcMain.handle('supabase:upload-backup', async (_, backupPath?: string) => {
    try {
      const res = await supabaseService.uploadBackup(backupPath)
      return res
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  })

  ipcMain.handle('supabase:list-backups', async () => {
    try {
      const res = await supabaseService.listBackups()
      return res
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  })

  ipcMain.handle('supabase:upload-file', async (_, filePath: string, folder?: string) => {
    try {
      const res = await supabaseService.uploadDocument(filePath, folder)
      return res
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  })

  ipcMain.handle('supabase:get-file-url', async (_, storagePath: string, expiresIn?: number) => {
    try {
      const res = await supabaseService.getDocumentSignedUrl(storagePath, expiresIn)
      return res
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  })
}
