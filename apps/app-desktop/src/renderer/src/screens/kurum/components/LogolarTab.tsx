import React from 'react'
import { ImageIcon, Info, Upload, X } from 'lucide-react'
import { Input } from '../../../components/ui/Input'

interface LogolarTabProps {
  institutionLogo: string | null
  setInstitutionLogo: (logo: string | null) => void
  logoLeft: string | null
  setLogoLeft: (logo: string | null) => void
  logoRight: string | null
  setLogoRight: (logo: string | null) => void
  showLogoLeft: boolean
  setShowLogoLeft: (val: boolean) => void
  showLogoRight: boolean
  setShowLogoRight: (val: boolean) => void
}

export function LogolarTab(props: LogolarTabProps): React.ReactElement {
  const {
    institutionLogo,
    setInstitutionLogo,
    logoLeft,
    setLogoLeft,
    logoRight,
    setLogoRight,
    showLogoLeft,
    setShowLogoLeft,
    showLogoRight,
    setShowLogoRight
  } = props

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
          Kurum Logoları
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Uygulama arayüzünde ve belge çıktılarında kullanılacak logoları buradan
          ayarlayabilirsiniz.
        </p>
      </div>

      <div className="flex items-start gap-2 p-3 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          <strong>Önerilen boyutlar:</strong> Uygulama Logosu için <strong>256×256 px</strong> veya{' '}
          <strong>512×512 px</strong> (kare, şeffaf arka planlı PNG tercih edilir). Belge logoları
          (Sol/Sağ) için <strong>300×150 px</strong> önerilir. Maksimum dosya boyutu:{' '}
          <strong>2 MB</strong>.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* === UYGULAMA LOGOSU === */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col gap-4 shadow-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-0.5">
              Uygulama Logosu
            </label>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-normal">
              Giriş/Kilit ekranı ve sol menüde gösterilen genel logo.
            </p>
          </div>

          <label className="group relative flex flex-col items-center justify-center w-full h-36 bg-white dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden cursor-pointer hover:border-blue-400 dark:hover:border-blue-700 transition-all duration-200 shadow-inner">
            {institutionLogo ? (
              <>
                <img
                  src={institutionLogo}
                  alt="Uygulama Logosu"
                  className="w-full h-full object-contain p-3"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                  <Upload className="w-5 h-5 text-white" />
                  <span className="text-white text-[10px] font-semibold">Değiştir</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-600">
                <ImageIcon className="w-8 h-8" />
                <span className="text-[10px] font-medium text-center leading-tight px-2">
                  Logo seçmek için
                  <br />
                  tıklayın
                </span>
                <span className="text-[9px] text-slate-350 dark:text-slate-700">
                  PNG, JPG, SVG · Maks. 2MB
                </span>
              </div>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                if (file.size > 2 * 1024 * 1024) {
                  alert("Dosya boyutu 2 MB'ı aşmamalıdır!")
                  return
                }
                const reader = new FileReader()
                reader.onload = () => {
                  if (typeof reader.result === 'string') {
                    setInstitutionLogo(reader.result)
                  }
                }
                reader.readAsDataURL(file)
              }}
            />
          </label>

          <div className="flex flex-col gap-3">
            <Input
              value={institutionLogo?.startsWith('http') ? institutionLogo : ''}
              onChange={(e) => setInstitutionLogo(e.target.value)}
              placeholder="Veya web URL'si yapıştırın (https://...)"
              className="text-xs bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800"
            />
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-slate-400 dark:text-slate-600 font-mono">
                Önerilen: 256×256 px
              </span>
              {institutionLogo && (
                <button
                  type="button"
                  onClick={() => setInstitutionLogo(null)}
                  className="flex items-center gap-1 py-1 px-2 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg text-[10px] font-bold transition-all"
                >
                  <X className="w-3 h-3" />
                  Kaldır
                </button>
              )}
            </div>
          </div>
        </div>

        {/* === SOL LOGO === */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col gap-4 shadow-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-0.5">
              Sol Logo (Kurum)
            </label>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-normal">
              Resmi belgelerin sol üstünde yer alacak kurum logosu.
            </p>
          </div>

          <label className="group relative flex flex-col items-center justify-center w-full h-36 bg-white dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden cursor-pointer hover:border-blue-400 dark:hover:border-blue-700 transition-all duration-200 shadow-inner">
            {logoLeft ? (
              <>
                <img src={logoLeft} alt="Sol Logo" className="w-full h-full object-contain p-3" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                  <Upload className="w-5 h-5 text-white" />
                  <span className="text-white text-[10px] font-semibold">Değiştir</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-600">
                <ImageIcon className="w-8 h-8" />
                <span className="text-[10px] font-medium text-center leading-tight px-2">
                  Logo seçmek için
                  <br />
                  tıklayın
                </span>
                <span className="text-[9px] text-slate-350 dark:text-slate-700">
                  PNG, JPG, SVG · Maks. 2MB
                </span>
              </div>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                if (file.size > 2 * 1024 * 1024) {
                  alert("Dosya boyutu 2 MB'ı aşmamalıdır!")
                  return
                }
                const reader = new FileReader()
                reader.onload = () => {
                  if (typeof reader.result === 'string') {
                    setLogoLeft(reader.result)
                  }
                }
                reader.readAsDataURL(file)
              }}
            />
          </label>

          <div className="flex flex-col gap-3">
            <Input
              value={logoLeft?.startsWith('http') ? logoLeft : ''}
              onChange={(e) => setLogoLeft(e.target.value)}
              placeholder="Veya web URL'si yapıştırın (https://...)"
              className="text-xs bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800"
            />
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-slate-400 dark:text-slate-600 font-mono">
                Önerilen: 300×150 px
              </span>
              {logoLeft && (
                <button
                  type="button"
                  onClick={() => setLogoLeft(null)}
                  className="flex items-center gap-1 py-1 px-2 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg text-[10px] font-bold transition-all"
                >
                  <X className="w-3 h-3" />
                  Kaldır
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
              <input
                id="show-logo-left"
                type="checkbox"
                checked={showLogoLeft}
                onChange={(e) => setShowLogoLeft(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <label htmlFor="show-logo-left" className="text-[10px] font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                Belgelerde Sol Logoyu Göster
              </label>
            </div>
          </div>
        </div>

        {/* === SAĞ LOGO === */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col gap-4 shadow-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-0.5">
              Sağ Logo (Bakanlık)
            </label>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-normal">
              Resmi belgelerin sağ üstünde yer alacak logo.
            </p>
          </div>

          <label className="group relative flex flex-col items-center justify-center w-full h-36 bg-white dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden cursor-pointer hover:border-blue-400 dark:hover:border-blue-700 transition-all duration-200 shadow-inner">
            {logoRight ? (
              <>
                <img src={logoRight} alt="Sağ Logo" className="w-full h-full object-contain p-3" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                  <Upload className="w-5 h-5 text-white" />
                  <span className="text-white text-[10px] font-semibold">Değiştir</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-600">
                <ImageIcon className="w-8 h-8" />
                <span className="text-[10px] font-medium text-center leading-tight px-2">
                  Logo seçmek için
                  <br />
                  tıklayın
                </span>
                <span className="text-[9px] text-slate-350 dark:text-slate-700">
                  PNG, JPG, SVG · Maks. 2MB
                </span>
              </div>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                if (file.size > 2 * 1024 * 1024) {
                  alert("Dosya boyutu 2 MB'ı aşmamalıdır!")
                  return
                }
                const reader = new FileReader()
                reader.onload = () => {
                  if (typeof reader.result === 'string') {
                    setLogoRight(reader.result)
                  }
                }
                reader.readAsDataURL(file)
              }}
            />
          </label>

          <div className="flex flex-col gap-3">
            <Input
              value={logoRight?.startsWith('http') ? logoRight : ''}
              onChange={(e) => setLogoRight(e.target.value)}
              placeholder="Veya web URL'si yapıştırın (https://...)"
              className="text-xs bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800"
            />
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-slate-400 dark:text-slate-600 font-mono">
                Önerilen: 300×150 px
              </span>
              {logoRight && (
                <button
                  type="button"
                  onClick={() => setLogoRight(null)}
                  className="flex items-center gap-1 py-1 px-2 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg text-[10px] font-bold transition-all"
                >
                  <X className="w-3 h-3" />
                  Kaldır
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
              <input
                id="show-logo-right"
                type="checkbox"
                checked={showLogoRight}
                onChange={(e) => setShowLogoRight(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <label htmlFor="show-logo-right" className="text-[10px] font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                Belgelerde Sağ Logoyu Göster
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
