import fs from 'fs';
import path from 'path';

export interface PdfData {
  templateId: string;
  data: any;
  timestamp: number;
}

const CACHE_DIR = path.join(process.cwd(), '.pdf-cache');

export class PdfStore {
  constructor() {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
  }

  set(id: string, templateId: string, data: any) {
    const filePath = path.join(CACHE_DIR, `${id}.json`);
    const payload: PdfData = {
      templateId,
      data,
      timestamp: Date.now()
    };
    
    fs.writeFileSync(filePath, JSON.stringify(payload), 'utf-8');

    // Cleanup old entries (older than 5 minutes)
    this.cleanup();
  }

  get(id: string): PdfData | undefined {
    const filePath = path.join(CACHE_DIR, `${id}.json`);
    if (!fs.existsSync(filePath)) {
      return undefined;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as PdfData;
    } catch (e) {
      return undefined;
    }
  }

  remove(id: string) {
    const filePath = path.join(CACHE_DIR, `${id}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  private cleanup() {
    try {
      const files = fs.readdirSync(CACHE_DIR);
      const now = Date.now();
      
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        const filePath = path.join(CACHE_DIR, file);
        const stats = fs.statSync(filePath);
        
        // 5 dakikadan eski dosyaları sil
        if (now - stats.mtimeMs > 5 * 60 * 1000) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (e) {
      // ignore
    }
  }
}

export const pdfStore = new PdfStore();
