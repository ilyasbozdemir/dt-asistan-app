import { ipcMain, BrowserWindow, dialog } from 'electron'
import { basename } from 'path'
import fs from 'fs'
import nodemailer from 'nodemailer'
import { workspaceManager } from '../database/workspace'

export function registerWorkspaceIpcHandlers(closeAllSecondaryWindows: () => void): void {
  ipcMain.handle('workspace:create', async (_, filePath: string, institutionName: string) => {
    try {
      const meta = workspaceManager.create(filePath, institutionName)
      return { success: true, meta, newFilePath: workspaceManager.getCurrentFilePath() }
    } catch (error: any) {
      console.error('Create workspace error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(
    'workspace:open',
    async (_, filePath: string, allowMigration: boolean = false) => {
      try {
        closeAllSecondaryWindows()
        const meta = workspaceManager.open(filePath, allowMigration)
        return { success: true, meta, newFilePath: workspaceManager.getCurrentFilePath() }
      } catch (error: any) {
        if (error.message && error.message.startsWith('MIGRATION_REQUIRED|')) {
          const payloadStr = error.message.split('|')[1]
          const payload = JSON.parse(payloadStr)
          return { success: false, ...payload }
        }
        console.error('Open workspace error:', error)
        return { success: false, error: error.message }
      }
    }
  )

  ipcMain.handle('workspace:close', async () => {
    try {
      closeAllSecondaryWindows()
      workspaceManager.close()
      return { success: true }
    } catch (error: any) {
      console.error('Close workspace error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('workspace:backup', async (event) => {
    try {
      const filePath = workspaceManager.getCurrentFilePath()
      if (!filePath) {
        return { success: false, error: 'Aktif bir çalışma dosyası bulunamadı!' }
      }
      workspaceManager.save()

      const win = BrowserWindow.fromWebContents(event.sender)
      const { filePath: destPath } = await dialog.showSaveDialog(win!, {
        title: 'Yedek Dosyasını Kaydet',
        defaultPath: basename(filePath),
        filters: [{ name: 'DT Asistan Veri Dosyası', extensions: ['dtal'] }]
      })

      if (!destPath) {
        return { success: false, error: 'Yedekleme iptal edildi' }
      }

      fs.copyFileSync(filePath, destPath)
      return { success: true, backupPath: destPath }
    } catch (error: any) {
      console.error('Backup workspace error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('workspace:backup-server', async () => {
    try {
      const filePath = workspaceManager.getCurrentFilePath()
      if (!filePath) {
        return { success: false, error: 'Aktif bir çalışma dosyası bulunamadı!' }
      }
      workspaceManager.save()
      console.log(`[Mock] Uploading ${filePath} to web server as a backup...`)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      return { success: true, message: 'Web sunucusuna başarıyla yüklendi.' }
    } catch (error: any) {
      console.error('Backup to server error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('workspace:backup-email', async () => {
    try {
      const filePath = workspaceManager.getCurrentFilePath()
      if (!filePath) {
        return { success: false, error: 'Aktif bir çalışma dosyası bulunamadı!' }
      }
      workspaceManager.save()

      const db = workspaceManager.getDb()
      const hostRow = db.prepare("SELECT value FROM settings WHERE key = 'smtpHost'").get() as {
        value: string
      }
      const portRow = db.prepare("SELECT value FROM settings WHERE key = 'smtpPort'").get() as {
        value: string
      }
      const userRow = db.prepare("SELECT value FROM settings WHERE key = 'smtpUser'").get() as {
        value: string
      }
      const passRow = db.prepare("SELECT value FROM settings WHERE key = 'smtpPass'").get() as {
        value: string
      }
      const emailRow = db
        .prepare("SELECT value FROM settings WHERE key = 'smtpReceiver'")
        .get() as { value: string }
      const secureRow = db
        .prepare("SELECT value FROM settings WHERE key = 'smtpSecure'")
        .get() as { value: string }

      if (!hostRow?.value || !userRow?.value || !passRow?.value) {
        return { success: false, error: 'SMTP ayarları yapılandırılmamış!' }
      }

      const receiver = emailRow?.value || userRow.value
      const port = parseInt(portRow.value) || 587
      const userSecure = secureRow?.value === 'true'
      const actualSecure = port === 465 ? true : port === 587 ? false : userSecure

      const transporter = nodemailer.createTransport({
        host: hostRow.value,
        port: port,
        secure: actualSecure,
        auth: {
          user: userRow.value,
          pass: passRow.value
        },
        tls: {
          rejectUnauthorized: false
        }
      })

      const fileName = basename(filePath)
      await transporter.sendMail({
        from: `"DT Asistan Yedekleme" <${userRow.value}>`,
        to: receiver,
        subject: `DT Asistan Veritabanı Yedeği - ${fileName}`,
        text: `Kurum dosyası yedeğiniz ektedir.\nDosya adı: ${fileName}\nTarih: ${new Date().toLocaleString('tr-TR')}`,
        attachments: [
          {
            filename: fileName,
            path: filePath
          }
        ]
      })

      return { success: true, email: receiver }
    } catch (error: any) {
      console.error('Email backup error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('workspace:get-meta', async () => {
    try {
      const meta = workspaceManager.getMeta()
      return { success: true, meta }
    } catch (error: any) {
      console.error('Get meta error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('workspace:upload-file', async (_, sourcePath: string) => {
    try {
      const result = workspaceManager.uploadAttachment(sourcePath)
      return { success: true, ...result }
    } catch (error: any) {
      console.error('Upload attachment error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('workspace:open-file', async (_, relativePath: string) => {
    try {
      const success = await workspaceManager.openAttachment(relativePath)
      return { success }
    } catch (error: any) {
      console.error('Open attachment error:', error)
      return { success: false, error: error.message }
    }
  })
}
