import React from 'react'
import { Download, Upload } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'

interface DatabaseArchiveTabProps {
  archiveYear: number
  setArchiveYear: (year: number) => void
  isArchiving: boolean
  setIsArchiving: (val: boolean) => void
}

export const DatabaseArchiveTab: React.FC<DatabaseArchiveTabProps> = ({
  archiveYear,
  setArchiveYear,
  isArchiving,
  setIsArchiving
}) => {
  return (
    <div className="space-y-6">
      {/* 1. VERİTABANI YEDEKLEME / GERİ YÜKLEME */}
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div>
            <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">Veritabanı İşlemleri</h2>
            <p className="text-xs text-slate-500">
              Mevcut çalışma alanınızdaki tüm veritabanını dışa aktarabilir veya yedekten geri yükleyebilirsiniz.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg text-blue-600 dark:text-blue-450">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Veritabanını Dışa Aktar</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 h-10">
              Tüm kalemlerinizi, dosyalarınızı ve komisyon bilgilerinizi içeren .sqlite dosyasını yedekleyin.
            </p>
            <Button
              onClick={async () => {
                try {
                  const res = await window.electron.ipcRenderer.invoke('db:export-sqlite')
                  if (res.success) {
                    alert('Veritabanı başarıyla dışa aktarıldı.')
                  } else if (res.error && res.error !== 'İptal edildi') {
                    alert('Dışa aktarma hatası: ' + res.error)
                  }
                } catch (e: any) {
                  alert('Hata: ' + e.message)
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Dışa Aktar
            </Button>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg text-amber-600 dark:text-amber-400">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Veritabanını İçe Aktar</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 h-10">
              Daha önce aldığınız bir .sqlite yedeğini geri yükleyin. Mevcut verilerin üzerine yazılır.
            </p>
            <Button
              onClick={async () => {
                if (
                  !window.confirm(
                    'DİKKAT: Bu işlem mevcut veritabanınızın üzerine yazacaktır. Devam etmek istiyor musunuz?'
                  )
                )
                  return
                try {
                  const res = await window.electron.ipcRenderer.invoke('db:import-sqlite')
                  if (res.success) {
                    alert(
                      'Veritabanı başarıyla içe aktarıldı. Değişikliklerin etkili olması için uygulamayı yeniden başlatmanızı öneririz.'
                    )
                    window.location.reload()
                  } else if (res.error && res.error !== 'İptal edildi') {
                    alert('İçe aktarma hatası: ' + res.error)
                  }
                } catch (e: any) {
                  alert('Hata: ' + e.message)
                }
              }}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              İçe Aktar
            </Button>
          </div>
        </div>
      </div>

      {/* 2. ARŞİVLEME */}
      <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div>
            <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">Eski Yılları Arşivle</h2>
            <p className="text-xs text-slate-500">
              Belirlediğiniz yıldan daha eski olan doğrudan temin dosyalarını ana veritabanından çıkartıp, sıkıştırılmış
              arşiv dosyasına (.dtz) aktarır. Böylece sisteminiz daha hızlı çalışır ve dosya boyutu küçülür.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mt-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Hangi yıldan öncekiler arşivlensin? (Seçili yıl DAHİL arşivlenir)
            </label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={archiveYear}
                onChange={(e) => setArchiveYear(parseInt(e.target.value))}
                className="w-32 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                min={2000}
                max={new Date().getFullYear()}
              />
              <Button
                onClick={async () => {
                  if (
                    window.confirm(
                      `${archiveYear} ve öncesindeki tüm dosyalar sistemden silinip arşiv dosyasına taşınacak. Onaylıyor musunuz?`
                    )
                  ) {
                    setIsArchiving(true)
                    try {
                      const res = await window.electron.ipcRenderer.invoke('db:archive-old-records', archiveYear)
                      if (res.success) {
                        alert(`Başarılı! ${res.count} adet dosya arşivlendi.\nKaydedilen Yer: ${res.filePath}`)
                        window.location.reload()
                      } else {
                        alert('Hata: ' + res.message)
                      }
                    } catch (e: any) {
                      alert('Beklenmeyen hata: ' + e.message)
                    } finally {
                      setIsArchiving(false)
                    }
                  }
                }}
                disabled={isArchiving}
                className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-4"
              >
                {isArchiving ? 'Arşivleniyor...' : 'Arşivlemeyi Başlat'}
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Not: Firma, personel ve birim tanımlarınız silinmez. Yalnızca eski temin dosyaları arşivlenir. Oluşan{' '}
              <b>.dtz</b> dosyasını daha sonra uygulamadan tekrar açıp inceleyebilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
