/**
 * HAKİM Pro — Desteklenen Dosya Formatları
 *
 * Tüm uzantılar burada tanımlanır.
 * Yeni bir format eklemek için bu dosyaya bir kayıt eklemek yeterlidir;
 * dialog filtreleri, argv kontrolü ve electron-builder config otomatik güncellenir.
 */

export interface FileFormat {
  /** Uzantı (nokta olmadan, örn: 'dtm') */
  ext: string
  /** Kullanıcıya gösterilecek açıklama */
  label: string
  /** Kısa açıklama (dialog filtresi adı) */
  dialogName: string
  /** Bu format varsayılan yeni dosya uzantısı mı? */
  isDefault?: boolean
}

export const SUPPORTED_FORMATS: FileFormat[] = [
  {
    ext: 'hkmp',
    label: 'HAKİM Pro Proje Dosyası',
    dialogName: 'HAKİM Pro Dosyası (*.hkmp)',
    isDefault: true
  },
  {
    ext: 'dtal',
    label: 'HAKİM Pro / DTAL Veri Dosyası (Eski)',
    dialogName: 'HAKİM Pro / DTAL Dosyası (*.dtal)'
  }
]

/** Tüm desteklenen uzantıları ['dtm', 'dta', ...] olarak döner */
export const allExtensions = SUPPORTED_FORMATS.map((f) => f.ext)

/** Varsayılan uzantı (yeni dosya oluştururken kullanılır) */
export const defaultFormat = SUPPORTED_FORMATS.find((f) => f.isDefault) ?? SUPPORTED_FORMATS[0]

/** Electron dialog filter listesi — tüm formatları tek grupta gösterir */
export const allFormatsFilter = {
  name: 'HAKİM Pro Dosyaları',
  extensions: allExtensions
}

/** Her format için ayrı ayrı dialog filter listesi */
export const perFormatFilters = SUPPORTED_FORMATS.map((f) => ({
  name: f.dialogName,
  extensions: [f.ext]
}))

export function isSupportedFile(filePath: string): boolean {
  if (!filePath) return false
  const cleanPath = filePath.replace(/^"+|"+$/g, '').trim()
  const lower = cleanPath.toLowerCase()
  return allExtensions.some((ext) => lower.endsWith('.' + ext))
}
