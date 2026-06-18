import { BrowserWindow } from 'electron'

/**
 * Renders HTML to a PDF Buffer using Paged.js for pagination.
 */
export async function renderPdfBuffer(htmlContent: string): Promise<Buffer> {
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      offscreen: true,
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  try {
    // 1. Load the HTML content
    await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)

    // 2. Base64 encode images and extract header/footer
    const extracted = await win.webContents.executeJavaScript(`
      (async () => {
        // Base64 encode images for native header/footer support
        const imgs = document.querySelectorAll('img');
        for (let img of imgs) {
          if (img.src.startsWith('http')) {
            try {
              const res = await fetch(img.src);
              const blob = await res.blob();
              const reader = new FileReader();
              await new Promise((resolve) => {
                reader.onloadend = () => {
                  img.src = reader.result;
                  resolve();
                };
                reader.readAsDataURL(blob);
              });
            } catch (e) {
              console.error('Failed to encode image', e);
            }
          }
        }

        const footerEl = document.querySelector('.paged-footer');
        
        const footerHtml = footerEl ? footerEl.outerHTML : '<div></div>';
        
        // Remove footer from body so it doesn't print in the main content at the end
        if (footerEl) footerEl.remove();
        
        return { footerHtml };
      })()
    `)

    // 3. Generate PDF using Electron Native
    const pdfBuffer = await win.webContents.printToPDF({
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>', // We leave the header in the body so it only prints on page 1
      footerTemplate: `<div style="width: 100%; font-size: 10px; padding: 0 1.5cm; -webkit-print-color-adjust: exact;">${extracted.footerHtml}</div>`,
      margins: {
        top: 0.98, // ~2.5cm
        bottom: 1.0, // ~2.5cm (Footer alt boslugunu azalttik)
        left: 0.59, // ~1.5cm
        right: 0.59 // ~1.5cm
      },
      pageSize: 'A4'
    })

    return pdfBuffer
  } finally {
    if (!win.isDestroyed()) {
      win.destroy()
    }
  }
}
