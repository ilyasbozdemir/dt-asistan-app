import { ipcMain, BrowserWindow, dialog } from 'electron'
import fs from 'fs'
import { startServer, stopServer, getSocketServer } from '../server'
import { connectToServer, disconnectFromServer, emitEvent } from '../client'
import { startExpressServer, stopExpressServer } from '../network/expressServer'
import { workspaceManager } from '../database/workspace'

export function registerNetworkIpcHandlers(): void {
  ipcMain.handle('network:start-server', (_, port: number) => {
    return startServer(port)
  })

  ipcMain.handle('network:stop-server', () => {
    stopServer()
    return { success: true }
  })

  ipcMain.handle('network:connect-client', (_, url: string) => {
    return connectToServer(url)
  })

  ipcMain.handle('network:disconnect-client', () => {
    disconnectFromServer()
    return { success: true }
  })

  ipcMain.on('network:emit', (_, eventName: string, data: any) => {
    emitEvent(eventName, data)
    const io = getSocketServer()
    if (io) {
      io.emit(eventName, data)
    }
  })

  ipcMain.handle('network:start-express', (_, port: number) => {
    return startExpressServer(port)
  })

  ipcMain.handle('network:stop-express', () => {
    stopExpressServer()
    return { success: true }
  })

  ipcMain.handle('network:pull-db', async (_, url: string) => {
    try {
      const response = await fetch(`${url}/api/network/pull`)
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Sunucu Hatası: ${response.status} - ${errorText}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      let currentFile = workspaceManager.getCurrentFilePath()
      let backupPath: string | null = null

      if (!currentFile) {
        const { canceled, filePath } = await dialog.showSaveDialog({
          title: 'Ağdan Gelen Veritabanını Kaydet',
          defaultPath: 'paylasim.dtal',
          filters: [{ name: 'DTAL Dosyaları', extensions: ['dtal'] }]
        })
        if (canceled || !filePath) throw new Error('İşlem iptal edildi.')
        currentFile = filePath
      } else {
        workspaceManager.close()
        backupPath = currentFile + '.syncbak'
        fs.copyFileSync(currentFile, backupPath)
      }

      try {
        fs.writeFileSync(currentFile, buffer)
        workspaceManager.open(currentFile, false)

        BrowserWindow.getAllWindows().forEach((win) => {
          if (!win.isDestroyed()) win.webContents.send('network:db-pulled')
        })

        return { success: true }
      } catch (e: any) {
        if (backupPath && fs.existsSync(backupPath)) {
          fs.copyFileSync(backupPath, currentFile)
          try {
            workspaceManager.open(currentFile, false)
          } catch {}
        }
        throw e
      }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('network:push-db', async (_, url: string) => {
    try {
      const currentFile = workspaceManager.getCurrentFilePath()
      if (!currentFile || !fs.existsSync(currentFile))
        throw new Error('Gönderilecek açık bir dosya yok.')

      workspaceManager.save()

      const fileData = fs.readFileSync(currentFile)

      const response = await fetch(`${url}/api/network/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream'
        },
        body: fileData
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Bilinmeyen Hata' }))
        throw new Error(`Hata: ${errData.error || response.statusText}`)
      }

      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('network:can-undo-sync', async () => {
    try {
      const currentFile = workspaceManager.getCurrentFilePath()
      if (!currentFile) return { canUndo: false }
      const backupPath = currentFile + '.syncbak'
      if (fs.existsSync(backupPath)) {
        const stats = fs.statSync(backupPath)
        return { canUndo: true, mtime: stats.mtime.toISOString() }
      }
      return { canUndo: false }
    } catch {
      return { canUndo: false }
    }
  })

  ipcMain.handle('network:undo-sync', async () => {
    try {
      const currentFile = workspaceManager.getCurrentFilePath()
      if (!currentFile) throw new Error('Açık bir çalışma dosyası yok.')

      const backupPath = currentFile + '.syncbak'
      if (!fs.existsSync(backupPath)) throw new Error('Geri alınacak yedek bulunamadı.')

      workspaceManager.close()
      fs.copyFileSync(backupPath, currentFile)
      fs.unlinkSync(backupPath)
      workspaceManager.open(currentFile, false)

      BrowserWindow.getAllWindows().forEach((win) => {
        if (!win.isDestroyed()) win.webContents.send('network:db-pulled')
      })

      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('sync:test-connection', async (_, { url, port, token }) => {
    try {
      const fullUrl = port ? `${url}:${port}/api/health` : `${url}/api/health`
      const res = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (res.ok) {
        return { success: true }
      }
      return { success: false, error: `Sunucu yanıt vermedi: ${res.status}` }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
