import { ipcMain } from 'electron'
import { workspaceManager, ensureSchemaIntegrity } from '../database/workspace'
import { validateSqlQuery } from './utils/sqlGuard'
import { withSchemaRetry } from './utils/schemaRetry'

export function registerDbIpcHandlers(): void {
  // 1. SELECT query handler
  ipcMain.handle('db:query', async (_, sql: string, params: any[] = []) => {
    try {
      validateSqlQuery(sql, params)
      const executeQuery = async () => {
        const db = workspaceManager.getDb()
        const stmt = db.prepare(sql)
        const rows = stmt.all(...params)
        return { success: true, data: rows }
      }

      return await withSchemaRetry(executeQuery, async () => {
        const db = workspaceManager.getDb()
        ensureSchemaIntegrity(db)
      })
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 2. INSERT, UPDATE, DELETE run handler
  ipcMain.handle('db:run', async (_, sql: string, params: any[] = []) => {
    try {
      validateSqlQuery(sql, params)
      const executeRun = async () => {
        const db = workspaceManager.getDb()
        const stmt = db.prepare(sql)
        const info = stmt.run(...params)
        workspaceManager.save()
        return { success: true, lastInsertRowid: info.lastInsertRowid, changes: info.changes }
      }

      return await withSchemaRetry(executeRun, async () => {
        const db = workspaceManager.getDb()
        ensureSchemaIntegrity(db)
      })
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 3. Alternative statement execution handler
  ipcMain.handle('db:execute', async (_, sql: string, ...params: any[]) => {
    try {
      const actualParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params
      validateSqlQuery(sql, actualParams)
      const executeStmt = async () => {
        const db = workspaceManager.getDb()
        const stmt = db.prepare(sql)
        const info = stmt.run(...actualParams)
        workspaceManager.save()
        return { success: true, lastInsertRowid: info.lastInsertRowid, changes: info.changes }
      }

      return await withSchemaRetry(executeStmt, async () => {
        const db = workspaceManager.getDb()
        ensureSchemaIntegrity(db)
      })
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 4. Multi-query Transaction Handler
  ipcMain.handle('db:transaction', async (_, queries: { sql: string; params: any[] }[]) => {
    try {
      const db = workspaceManager.getDb()
      for (const q of queries) {
        validateSqlQuery(q.sql, q.params)
      }

      let lastInsertRowid: number | bigint = 0
      let totalChanges = 0

      const transaction = db.transaction((stmts: { sql: string; params: any[] }[]) => {
        for (const q of stmts) {
          const stmt = db.prepare(q.sql)
          const info = stmt.run(...q.params)
          lastInsertRowid = info.lastInsertRowid
          totalChanges += info.changes
        }
      })

      transaction(queries)
      workspaceManager.save()

      return { success: true, lastInsertRowid, changes: totalChanges }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 5. Settings Handler (Sanitized Public Settings Retrieval - Option 1)
  ipcMain.handle('db:get-settings', async () => {
    try {
      const db = workspaceManager.getDb()
      const rows = db.prepare('SELECT key, value FROM settings').all() as {
        key: string
        value: string
      }[]
      const settingsObj: Record<string, string> = {}
      for (const row of rows) {
        // Do not leak raw password hashes/secrets in default settings query if not authenticated
        if (row.key !== 'adminPassword') {
          settingsObj[row.key] = row.value
        }
      }

      return {
        activeKurumId: settingsObj.activeKurumId || '1',
        institutionName: settingsObj.institutionName || 'Bilinmeyen Kurum',
        institutionLogo: settingsObj.institutionLogo || null,
        logoLeft: settingsObj.logoLeft || null,
        logoRight: settingsObj.logoRight || null,
        adminName: settingsObj.adminName || 'Sistem Yöneticisi',
        adminTitle: settingsObj.adminTitle || 'Destek Sorumlusu',
        adminUsername: settingsObj.adminUsername || 'admin',
        eButceKodu: settingsObj.eButceKodu || '',
        say2000iKodu: settingsObj.say2000iKodu || '',
        themeLightVars: settingsObj.themeLightVars || '',
        themeDarkVars: settingsObj.themeDarkVars || '',
        ...settingsObj
      }
    } catch {
      return {
        activeKurumId: '1',
        institutionName: null,
        institutionLogo: null,
        logoLeft: null,
        logoRight: null,
        adminName: 'Sistem Yöneticisi',
        adminTitle: 'Destek Sorumlusu',
        adminUsername: 'admin',
        eButceKodu: '',
        say2000iKodu: '',
        themeLightVars: '',
        themeDarkVars: ''
      }
    }
  })

  // 6. Check Auth Setup Handler
  ipcMain.handle('db:check-auth-setup', async () => {
    try {
      const db = workspaceManager.getDb()
      const userRow = db
        .prepare("SELECT value FROM settings WHERE key = 'adminUsername'")
        .get() as { value: string } | undefined
      const passRow = db
        .prepare("SELECT value FROM settings WHERE key = 'adminPassword'")
        .get() as { value: string } | undefined

      const hasUser = !!userRow?.value
      const hasPass = !!passRow?.value

      return { hasCredentials: hasUser && hasPass }
    } catch (error: any) {
      console.error('Check auth setup error:', error)
      return { hasCredentials: false, error: error.message }
    }
  })

  // 7. Setup Auth Handler
  ipcMain.handle('db:setup-auth', async (_, code: string, user: string, pass: string) => {
    try {
      const db = workspaceManager.getDb()
      const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
      stmt.run('eButceKodu', code)
      stmt.run('adminUsername', user)
      stmt.run('adminPassword', pass)
      workspaceManager.save()
      return { success: true }
    } catch (error: any) {
      console.error('Setup auth error:', error)
      return { success: false, error: error.message }
    }
  })

  // 8. Login Handler
  ipcMain.handle('db:login', async (_, _code: string, user: string, pass: string) => {
    try {
      const db = workspaceManager.getDb()
      const userRow = db
        .prepare("SELECT value FROM settings WHERE key = 'adminUsername'")
        .get() as { value: string } | undefined
      const passRow = db
        .prepare("SELECT value FROM settings WHERE key = 'adminPassword'")
        .get() as { value: string } | undefined

      const expectedUser = userRow?.value || ''
      const expectedPass = passRow?.value || ''

      if (user === expectedUser && pass === expectedPass) {
        return { success: true }
      }
      return { success: false, error: 'Kullanıcı adı veya şifre hatalı!' }
    } catch (error: any) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    }
  })

  // 9. Save Settings Handler
  ipcMain.handle('db:save-settings', async (_, settingsMap: Record<string, string>) => {
    try {
      const db = workspaceManager.getDb()
      const insertStmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
      const transaction = db.transaction((settings: Record<string, string>) => {
        for (const [key, value] of Object.entries(settings)) {
          insertStmt.run(key, value)
        }
      })
      transaction(settingsMap)
      workspaceManager.save()
      return { success: true }
    } catch (error: any) {
      console.error('Save settings error:', error)
      return { success: false, error: error.message }
    }
  })
}
