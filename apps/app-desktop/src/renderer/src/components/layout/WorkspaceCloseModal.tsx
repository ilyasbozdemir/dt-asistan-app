import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { FileText, Save, Mail, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

interface WorkspaceCloseModalProps {
  isOpen: boolean
  onClose: () => void
  fileName: string
  isMailConfigured: boolean
  onConfirm: (type: 'none' | 'backup' | 'email') => Promise<void>
}

export function WorkspaceCloseModal({
  isOpen,
  onClose,
  fileName,
  isMailConfigured,
  onConfirm
}: WorkspaceCloseModalProps): React.JSX.Element {
  const [selectedOption, setSelectedOption] = useState<'none' | 'backup' | 'email'>(
    isMailConfigured ? 'email' : 'backup'
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)
    try {
      await onConfirm(selectedOption)
      onClose()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'İşlem gerçekleştirilirken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      title="Çalışma Dosyasını Kapat"
      description={`${fileName} dosyasını kapatmak üzeresiniz.`}
    >
      <div className="flex flex-col gap-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Kapatmadan önce veri kaybı veya dosya bozulması riskine karşı veri dosyanızın güncel bir
          yedek kopyasını almak ister misiniz?
        </p>

        {/* Options */}
        <div className="flex flex-col gap-2.5">
          {/* Option: Email Backup */}
          <button
            disabled={loading}
            onClick={() => setSelectedOption('email')}
            className={cn(
              'flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer',
              selectedOption === 'email'
                ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/10'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/20 dark:bg-slate-900/20',
              !isMailConfigured && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div
              className={cn(
                'p-2.5 rounded-xl shrink-0',
                selectedOption === 'email'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              )}
            >
              <Mail className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4
                className={cn(
                  'text-sm font-bold',
                  selectedOption === 'email'
                    ? 'text-blue-900 dark:text-blue-300'
                    : 'text-slate-800 dark:text-slate-200'
                )}
              >
                E-Posta ile Yedekle ve Kapat
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {isMailConfigured
                  ? 'Dosyayı SMTP sunucunuz üzerinden kayıtlı yedek e-posta adresine ek olarak gönderir.'
                  : 'Mail (SMTP) ayarları yapılandırılmadığı için kullanılamaz.'}
              </p>
            </div>
          </button>

          {/* Option: Local Backup */}
          <button
            disabled={loading}
            onClick={() => setSelectedOption('backup')}
            className={cn(
              'flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer',
              selectedOption === 'backup'
                ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/10'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/20 dark:bg-slate-900/20'
            )}
          >
            <div
              className={cn(
                'p-2.5 rounded-xl shrink-0',
                selectedOption === 'backup'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              )}
            >
              <Save className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4
                className={cn(
                  'text-sm font-bold',
                  selectedOption === 'backup'
                    ? 'text-blue-900 dark:text-blue-300'
                    : 'text-slate-800 dark:text-slate-200'
                )}
              >
                Yedek Kaydet ve Kapat
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Çalışma dosyanızın (.dtal) bir kopyasını bilgisayarınızda seçeceğiniz güvenli bir
                klasöre kaydeder.
              </p>
            </div>
          </button>

          {/* Option: No Backup */}
          <button
            disabled={loading}
            onClick={() => setSelectedOption('none')}
            className={cn(
              'flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer',
              selectedOption === 'none'
                ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-955/10'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/20 dark:bg-slate-900/20'
            )}
          >
            <div
              className={cn(
                'p-2.5 rounded-xl shrink-0',
                selectedOption === 'none'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              )}
            >
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4
                className={cn(
                  'text-sm font-bold',
                  selectedOption === 'none'
                    ? 'text-amber-900 dark:text-amber-300'
                    : 'text-slate-800 dark:text-slate-200'
                )}
              >
                Yedeklemeden Doğrudan Kapat
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Dosyada yaptığınız son değişiklikler kaydedilir ancak ek bir yedek kopyası
                oluşturulmaz.
              </p>
            </div>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer disabled:opacity-50"
          >
            Vazgeç
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className={cn(
              'px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 min-w-[110px] justify-center',
              selectedOption === 'none'
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-blue-600 hover:bg-blue-700'
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>İşleniyor...</span>
              </>
            ) : (
              <span>Onayla ve Kapat</span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}
