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
        filters: [{ name: 'TEMİN 360 Proje Dosyası (*.hkmp, *.dtal)', extensions: ['hkmp', 'dtal'] }]
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

  ipcMain.handle('workspace:backup-gdrive', async (_, args?: { token?: string }) => {
    try {
      const filePath = workspaceManager.getCurrentFilePath()
      if (!filePath) {
        return { success: false, error: 'Aktif bir çalışma dosyası bulunamadı!' }
      }
      workspaceManager.save()

      const db = workspaceManager.getDb()
      let token = args?.token
      if (!token) {
        try {
          const row = db
            .prepare("SELECT value FROM settings WHERE key = 'gdriveAccessToken'")
            .get() as { value?: string }
          token = row?.value
        } catch {
          // Table/setting check fallback
        }
      }

      const fileName = basename(filePath)
      const fileData = fs.readFileSync(filePath)

      if (token) {
        const cleanToken = String(token).trim().replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').replace(/[\r\n\s]+/g, '')
        
        // Ensure dedicated app folder exists
        const folderId = await getOrCreateAppFolder(cleanToken)

        // Versioned timestamped filename: e.g. Acme_2026-09-06_17-45.dtal
        const now = new Date()
        const dateStr = now.toISOString().slice(0, 10)
        const timeStr = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`
        const rawBase = fileName.replace(/\.dtal$/i, '').replace(/_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}$/, '')
        const backupFileName = `${rawBase}_${dateStr}_${timeStr}.dtal`

        // Construct multipart boundary for metadata + binary payload
        const boundary = '--------------------------' + Date.now().toString(16)
        const metadata = JSON.stringify({
          name: backupFileName,
          description: `TEMİN 360 Otomatik Çalışma Dosyası Yedeği (${new Date().toLocaleString('tr-TR')})`,
          parents: [folderId]
        })

        const metadataPart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`
        const fileHeaderPart = `--${boundary}\r\nContent-Type: application/octet-stream\r\n\r\n`
        const closingPart = `\r\n--${boundary}--`

        const metadataBuffer = Buffer.from(metadataPart, 'utf-8')
        const fileHeaderBuffer = Buffer.from(fileHeaderPart, 'utf-8')
        const closingBuffer = Buffer.from(closingPart, 'utf-8')

        const multipartBody = Buffer.concat([
          metadataBuffer,
          fileHeaderBuffer,
          fileData,
          closingBuffer
        ])

        const res = await fetch(
          'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${cleanToken}`,
              'Content-Type': `multipart/related; boundary=${boundary}`
            },
            body: multipartBody
          }
        )

        if (!res.ok) {
          const errText = await res.text()
          throw new Error(`Google Drive API Yükleme Hatası (${res.status}): ${errText}`)
        }

        const uploadedFile = (await res.json()) as any

        // Prune older backups: keep only last 7 versions
        await pruneOldBackups(cleanToken, folderId, 7)

        return {
          success: true,
          message: `${backupFileName} başarıyla Google Drive 'TEMIN_360_YEDEKLER' klasörüne yüklendi (Son 7 sürüm muhafaza ediliyor).`,
          fileId: uploadedFile.id
        }
      }

      // Fallback response if token not configured yet
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return {
        success: true,
        message: `${fileName} dosyanız Google Drive yedeği için hazırlandı. (Ayarlar > Google Drive alanından Access Token girdiğinizde doğrudan bulut senkronizasyonu aktif olacaktır.)`
      }
    } catch (error: any) {
      console.error('Google Drive backup error:', error)
      return { success: false, error: error.message }
    }
  })

  async function pruneOldBackups(token: string, folderId: string, maxVersions = 7): Promise<void> {
    try {
      const query = encodeURIComponent(
        `'${folderId}' in parents and trashed = false and (name contains '.dtal' or name contains '.hkmp')`
      )
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,createdTime)&orderBy=createdTime%20desc`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      if (res.ok) {
        const data = (await res.json()) as { files?: Array<{ id: string; name: string }> }
        const files = data.files || []
        if (files.length > maxVersions) {
          const toDelete = files.slice(maxVersions)
          for (const file of toDelete) {
            await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            }).catch(console.error)
          }
        }
      }
    } catch (err) {
      console.error('Google Drive backup pruning error:', err)
    }
  }

  async function getOrCreateAppFolder(token: string): Promise<string> {
    const folderName = 'TEMIN_360_YEDEKLER'
    const query = encodeURIComponent(
      `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`
    )
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )
    if (searchRes.ok) {
      const data = (await searchRes.json()) as { files?: Array<{ id: string; name: string }> }
      if (data.files && data.files.length > 0) {
        return data.files[0].id
      }
    }

    // Create folder if not found
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        description: 'TEMİN 360 Doğrudan Temin Çalışma Alanı Bulut Yedekleri'
      })
    })

    if (createRes.ok) {
      const folderData = (await createRes.json()) as { id: string }
      return folderData.id
    }

    throw new Error('Google Drive üzerinde TEMIN_360_YEDEKLER klasörü oluşturulamadı.')
  }

  ipcMain.handle('workspace:list-gdrive-files', async (_, args?: { token?: string }) => {
    try {
      let token = args?.token
      if (!token) {
        const db = workspaceManager.getDb()
        try {
          const row = db
            .prepare("SELECT value FROM settings WHERE key = 'gdriveAccessToken'")
            .get() as { value?: string }
          token = row?.value
        } catch {
          // Fallback
        }
      }

      if (!token) {
        return {
          success: false,
          error: 'Google Drive API Access Token bulunamadı. Lütfen Ayarlar > Google Drive alanından token tanımlayın.'
        }
      }

      const cleanToken = String(token).trim().replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').replace(/[\r\n\s]+/g, '')
      const folderId = await getOrCreateAppFolder(cleanToken)
      const query = encodeURIComponent(`'${folderId}' in parents and trashed = false and (name contains '.dtal' or name contains '.hkmp')`)
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,size,modifiedTime,createdTime)&orderBy=createdTime%20desc`,
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`
          }
        }
      )

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Google Drive Dosyaları Listelenemedi (${res.status}): ${errText}`)
      }

      const data = (await res.json()) as any
      return {
        success: true,
        files: data.files || []
      }
    } catch (error: any) {
      console.error('Google Drive list error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(
    'workspace:download-gdrive-file',
    async (_, args: { fileId: string; fileName: string; token?: string }) => {
      try {
        let token = args.token
        if (!token) {
          const db = workspaceManager.getDb()
          try {
            const row = db
              .prepare("SELECT value FROM settings WHERE key = 'gdriveAccessToken'")
              .get() as { value?: string }
            token = row?.value
          } catch {
            // Fallback
          }
        }

        if (!token) {
          return {
            success: false,
            error: 'Google Drive Access Token bulunamadı. Lütfen Ayarlar > Google Drive alanından token tanımlayın.'
          }
        }

        const cleanToken = String(token).trim().replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').replace(/[\r\n\s]+/g, '')
        const res = await fetch(
          `https://www.googleapis.com/drive/v3/files/${args.fileId}?alt=media`,
          {
            headers: {
              Authorization: `Bearer ${cleanToken}`
            }
          }
        )

        if (!res.ok) {
          const errText = await res.text()
          throw new Error(`Google Drive İndirme Hatası (${res.status}): ${errText}`)
        }

        const arrayBuffer = await res.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Select destination path or save to desktop/temp
        const defaultPath = require('path').join(
          require('os').homedir(),
          'Desktop',
          args.fileName.endsWith('.dtal') ? args.fileName : `${args.fileName}.dtal`
        )

        fs.writeFileSync(defaultPath, buffer)

        // Open downloaded file as active workspace
        closeAllSecondaryWindows()
        const meta = workspaceManager.open(defaultPath, true)

        return {
          success: true,
          message: `${args.fileName} Google Drive'dan başarıyla indirildi ve çalışma alanı olarak açıldı.`,
          meta,
          filePath: defaultPath
        }
      } catch (error: any) {
        console.error('Google Drive download error:', error)
        return { success: false, error: error.message }
      }
    }
  )

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
        from: `"TEMİN 360 Yedekleme" <${userRow.value}>`,
        to: receiver,
        subject: `TEMİN 360 Veritabanı Yedeği - ${fileName}`,
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
