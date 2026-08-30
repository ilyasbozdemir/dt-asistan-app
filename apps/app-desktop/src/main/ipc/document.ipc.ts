import { ipcMain, dialog, BrowserWindow, shell, app } from 'electron'
import { join } from 'path'
import fs from 'fs'
import { renderDocxBuffer } from '../docxService'
import { renderPdfBuffer } from '../pdfService'

export function registerDocumentIpcHandlers(): void {
  // Helper to register both namespaced channel and legacy alias
  const handleDoc = (
    channel: string,
    alias: string,
    handler: (event: any, ...args: any[]) => Promise<any>
  ) => {
    ipcMain.handle(channel, handler)
    if (alias) {
      ipcMain.handle(alias, handler)
    }
  }

  // 1. DOCX Export
  handleDoc('belge:export-docx', 'export-docx', async (_, htmlContent: string, fileName?: string) => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Word (DOCX) Olarak Kaydet',
        defaultPath: fileName ? `${fileName}.docx` : 'Cikti.docx',
        filters: [{ name: 'Word Dosyası', extensions: ['docx'] }]
      })
      if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

      const buffer = await renderDocxBuffer(htmlContent)
      fs.writeFileSync(filePath, buffer)

      return { success: true, filePath }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 2. UDF Export
  handleDoc('belge:export-udf', 'export-udf', async (_, htmlContent: string, fileName?: string) => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'UDF Olarak Kaydet',
        defaultPath: fileName ? `${fileName}.udf` : 'Cikti.udf',
        filters: [{ name: 'UYAP Dokümanı', extensions: ['udf'] }]
      })
      if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

      const stripHtml = htmlContent.replace(/<[^>]+>/g, ' ')
      const udfContent = `<?xml version="1.0" encoding="utf-8"?>\n<Document>\n<content>\n<![CDATA[\n${stripHtml}\n]]>\n</content>\n</Document>`
      fs.writeFileSync(filePath, udfContent, 'utf-8')

      return { success: true, filePath }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 3. Print HTML
  handleDoc('belge:print-html', 'print-html', async (_, htmlContent: string, printOptions?: any) => {
    try {
      const win = new BrowserWindow({ show: false })
      await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)

      await new Promise((resolve) => setTimeout(resolve, 500))

      return await new Promise((resolve) => {
        win.webContents.print(
          { printBackground: true, ...printOptions },
          (success, failureReason) => {
            if (!win.isDestroyed()) {
              win.destroy()
            }
            if (success) {
              resolve({ success: true })
            } else {
              resolve({
                success: false,
                error: failureReason || 'Yazdırma işlemi iptal edildi veya başarısız oldu'
              })
            }
          }
        )
      })
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 4. Preview PDF
  handleDoc('belge:preview-pdf', 'preview-pdf', async (_, htmlContent: string) => {
    try {
      const pdfBuffer = await renderPdfBuffer(htmlContent)
      return { success: true, data: pdfBuffer.toString('base64') }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 5. Open PDF External
  handleDoc('belge:open-pdf-external', 'open-pdf-external', async (_, htmlContent: string) => {
    try {
      const pdfBuffer = await renderPdfBuffer(htmlContent)
      const tempPath = join(app.getPath('temp'), `hakim-pro_preview_${Date.now()}.pdf`)
      fs.writeFileSync(tempPath, pdfBuffer)
      await shell.openPath(tempPath)
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 6. Export HTML
  handleDoc('belge:export-html', 'export-html', async (_, htmlContent: string, options?: { paperSize?: string }, fileName?: string) => {
    try {
      const paperSize = options?.paperSize || 'A4'
      const isA4 = paperSize === 'A4'
      const width = isA4 ? '210mm' : 'auto'

      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'HTML Olarak Kaydet',
        defaultPath: fileName ? `${fileName}.html` : 'Cikti.html',
        filters: [{ name: 'HTML Dosyası', extensions: ['html'] }]
      })
      if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

      const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Belge</title>
  <style>
    @page { size: ${paperSize}; margin: 20mm; }
    body { 
      width: ${width}; 
      margin: 0 auto; 
      font-family: 'Times New Roman', Times, serif; 
      font-size: 12pt;
      line-height: 1.5;
      background: white;
      padding: 0;
      box-sizing: border-box;
    }
    table { border-collapse: collapse; width: 100%; margin-bottom: 1em; table-layout: fixed; }
    td, th { border: 1px solid #000; padding: 6px; }
    th { font-weight: bold; background-color: #f1f5f9; text-align: left; }
    p { margin-bottom: 1em; margin-top: 0; }
    ul { list-style-type: disc; padding-left: 20px; margin-bottom: 1em; }
    ol { list-style-type: decimal; padding-left: 20px; margin-bottom: 1em; }
    h1 { font-size: 16pt; font-weight: bold; margin-bottom: 0.5em; }
    h2 { font-size: 14pt; font-weight: bold; margin-bottom: 0.5em; }
    h3 { font-size: 12pt; font-weight: bold; margin-bottom: 0.5em; }
    @media print {
      body { margin: 0; width: 100%; }
      @page { margin: 20mm; }
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`

      fs.writeFileSync(filePath, fullHtml, 'utf8')
      return { success: true, filePath }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 7. XLSX Export
  handleDoc('belge:export-xlsx', 'export-xlsx', async (_, bufferData: Uint8Array | ArrayBuffer) => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'XLSX Olarak Kaydet',
        defaultPath: 'Tablo.xlsx',
        filters: [{ name: 'Excel Dosyası', extensions: ['xlsx'] }]
      })
      if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

      fs.writeFileSync(filePath, Buffer.from(bufferData as ArrayBuffer))
      return { success: true, filePath }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 8. DOCX Import
  handleDoc('belge:import-docx', 'import-docx', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'DOCX Seç',
        filters: [{ name: 'Word Document', extensions: ['docx'] }],
        properties: ['openFile']
      })
      if (canceled || !filePaths || filePaths.length === 0)
        return { success: false, error: 'İptal edildi' }

      const mammoth = require('mammoth')
      const result = await mammoth.convertToHtml({ path: filePaths[0] })
      return { success: true, html: result.value, messages: result.messages }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 9. XLSX Import
  handleDoc('belge:import-xlsx', 'import-xlsx', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'XLSX Seç',
        filters: [{ name: 'Excel Dosyası', extensions: ['xlsx', 'xls'] }],
        properties: ['openFile']
      })
      if (canceled || !filePaths || filePaths.length === 0)
        return { success: false, error: 'İptal edildi' }

      const buffer = fs.readFileSync(filePaths[0])
      return { success: true, buffer: buffer.buffer }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 10. Open Excel External
  handleDoc('belge:open-excel', 'open-excel', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Excel Dosyası Aç',
        filters: [{ name: 'Excel Dosyası', extensions: ['xlsx', 'xls', 'csv'] }],
        properties: ['openFile']
      })
      if (canceled || !filePaths || filePaths.length === 0)
        return { success: false, error: 'İptal edildi' }

      await shell.openPath(filePaths[0])
      return { success: true, filePath: filePaths[0] }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })
}
