import React, { useEffect, useState } from 'react'
import { Modal } from './Modal'
import { Upload, Download, RefreshCw, Key, CheckCircle, AlertCircle, HardDrive, FileSpreadsheet, ExternalLink, LogIn, Eye, EyeOff } from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'

interface GoogleDriveModalProps {
  isOpen: boolean
  onClose: () => void
}

interface GDriveFile {
  id: string
  name: string
  size?: string
  modifiedTime?: string
}

export function GoogleDriveModal({ isOpen, onClose }: GoogleDriveModalProps): React.JSX.Element {
  const [token, setToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [isSavedToken, setIsSavedToken] = useState(false)
  const [files, setFiles] = useState<GDriveFile[]>([])
  const [isLoadingList, setIsLoadingList] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)

  const fetchDriveFiles = async (currentToken?: string) => {
    const rawToken = currentToken || token
    const useToken = rawToken.trim().replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').replace(/[\r\n\s]+/g, '')
    if (!useToken) return

    setIsLoadingList(true)
    setStatusMsg(null)
    try {
      const res = await window.electron.ipcRenderer.invoke('workspace:list-gdrive-files', {
        token: useToken
      })
      if (res.success) {
        setFiles(res.files || [])
        if (res.files?.length === 0) {
          setStatusMsg({ text: 'Google Drive hesabınızda henüz `.dtal` uzantılı yedek dosyası bulunamadı.', type: 'info' })
        }
      } else {
        setStatusMsg({ text: res.error || 'Google Drive dosyaları çekilemedi.', type: 'error' })
      }
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Listeleme sırasında bir hata oluştu.', type: 'error' })
    } finally {
      setIsLoadingList(false)
    }
  }

  useEffect(() => {
    if (!isOpen) return

    // Load saved settings
    window.electron?.ipcRenderer
      .invoke('db:get-settings')
      .then((settings) => {
        if (settings?.gdriveAccessToken) {
          const clean = settings.gdriveAccessToken.trim().replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').replace(/[\r\n\s]+/g, '')
          setToken(clean)
          setIsSavedToken(true)
          fetchDriveFiles(clean)
        }
      })
      .catch(console.error)
  }, [isOpen])

  const handleOpenGoogleAuth = () => {
    const authUrl = 'https://developers.google.com/oauthplayground'
    if (window.electron?.ipcRenderer) {
      window.electron.ipcRenderer.send('open-external-url', authUrl)
    } else {
      window.open(authUrl, '_blank')
    }
    setStatusMsg({
      text: 'Google Yetkilendirme sayfası tarayıcıda açıldı. Oturum açıp Access Token aldıktan sonra aşağıdaki alana yapıştırın.',
      type: 'info'
    })
  }

  const handleSaveToken = async () => {
    const cleanToken = token.trim().replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').replace(/[\r\n\s]+/g, '')
    if (!cleanToken) {
      setStatusMsg({ text: 'Lütfen geçerli bir Access Token girin.', type: 'error' })
      return
    }

    try {
      await window.electron.ipcRenderer.invoke('db:save-settings', {
        gdriveAccessToken: cleanToken
      })
      setToken(cleanToken)
      setIsSavedToken(true)
      setStatusMsg({ text: 'Google Drive erişim jetonu kaydedildi. Bulut verileriniz senkronize ediliyor...', type: 'success' })
      fetchDriveFiles(cleanToken)
    } catch (err: any) {
      setStatusMsg({ text: `Token kaydetme hatası: ${err.message}`, type: 'error' })
    }
  }

  const handleUploadCurrentFile = async () => {
    const cleanToken = token.trim().replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').replace(/[\r\n\s]+/g, '')
    if (!cleanToken) {
      setStatusMsg({ text: 'Lütfen önce Google Giriş / Access Token tanımlayın.', type: 'error' })
      return
    }

    setIsUploading(true)
    setStatusMsg({ text: 'Aktif dosya Google Drive bulutuna yükleniyor...', type: 'info' })
    try {
      const res = await window.electron.ipcRenderer.invoke('workspace:backup-gdrive', {
        token: cleanToken
      })

      if (res.success) {
        setStatusMsg({ text: res.message || 'Dosya Google Drive hesabınıza başarıyla yüklendi.', type: 'success' })
        fetchDriveFiles(cleanToken)
      } else {
        setStatusMsg({ text: res.error || 'Yükleme başarısız.', type: 'error' })
      }
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Yükleme hatası oluştu.', type: 'error' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownloadFile = async (file: GDriveFile) => {
    const cleanToken = token.trim().replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').replace(/[\r\n\s]+/g, '')
    setDownloadingId(file.id)
    setStatusMsg({ text: `${file.name} indiriliyor ve çalışma alanı olarak açılıyor...`, type: 'info' })
    try {
      const res = await window.electron.ipcRenderer.invoke('workspace:download-gdrive-file', {
        fileId: file.id,
        fileName: file.name,
        token: cleanToken
      })

      if (res.success) {
        setStatusMsg({ text: res.message || 'Dosya indirildi ve başarıyla açıldı.', type: 'success' })
        setTimeout(() => {
          onClose()
          window.location.reload()
        }, 1200)
      } else {
        setStatusMsg({ text: res.error || 'İndirme hatası oluştu.', type: 'error' })
      }
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'İndirme işlemi sırasında hata oluştu.', type: 'error' })
    } finally {
      setDownloadingId(null)
    }
  }

  const formatFileSize = (bytes?: string | number) => {
    if (!bytes) return '—'
    const num = Number(bytes)
    if (isNaN(num)) return '—'
    if (num < 1024) return `${num} B`
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`
    return `${(num / (1024 * 1024)).toFixed(2)} MB`
  }

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '—'
    try {
      return new Date(isoStr).toLocaleString('tr-TR', {
        dateStyle: 'short',
        timeStyle: 'short'
      })
    } catch {
      return isoStr
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Google Drive Bulut Entegrasyonu"
      description="Google hesabınızla giriş yaparak çalışma dosyalarınızı buluta yedekleyin veya mevcut yedeklerinizi indirin."
      className="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Google Authentication Header & Login Action */}
        <div className="bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-emerald-900/10 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-emerald-950/40 p-4 rounded-2xl border border-blue-200/60 dark:border-blue-800/40 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wider">
                <LogIn size={16} className="text-blue-500" /> Google Drive Hesabı ile Bağlan
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Google hesabınızı bağlayın ve Drive erişim jetonunu kaydedin.
              </p>
            </div>
            <Button
              onClick={handleOpenGoogleAuth}
              className="bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl shrink-0 flex items-center gap-2 shadow-xs"
            >
              <ExternalLink size={14} className="text-blue-500" /> Google Hesabı ile Giriş Yap / Token Al
            </Button>
          </div>

          <div className="flex gap-2 pt-1 items-center">
            <div className="relative flex-1">
              <Input
                type={showToken ? 'text' : 'password'}
                placeholder="ya29.a0Ax... (Google OAuth Access Token)"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs font-mono pr-9"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title={showToken ? 'Gizle' : 'Göster'}
              >
                {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <Button
              onClick={handleSaveToken}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shrink-0 flex items-center gap-1.5"
            >
              {isSavedToken ? <CheckCircle size={14} /> : <Key size={14} />}
              {isSavedToken ? 'Kaydedildi' : 'Token Kaydet'}
            </Button>
          </div>
        </div>

        {/* Notification Alert */}
        {statusMsg && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2.5 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : statusMsg.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                  : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
            }`}
          >
            {statusMsg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
            <span className="flex-1">{statusMsg.text}</span>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/60 dark:border-blue-800/40 p-4 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs">
              <Upload size={16} /> Google Drive'a Yükle
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Mevcut çalışma dosyanızı (`.dtal`) doğrudan Google Drive hesabınıza yedek olarak aktarır.
            </p>
            <Button
              onClick={handleUploadCurrentFile}
              disabled={isUploading || !token}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-2 shadow-xs"
            >
              {isUploading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Yükleniyor...
                </>
              ) : (
                <>
                  <Upload size={14} /> Aktif Dosyayı Buluta Yükle
                </>
              )}
            </Button>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200/60 dark:border-emerald-800/40 p-4 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              <Download size={16} /> Buluttan İndir & Çek
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Google Drive hesabınızdaki `.dtal` yedeklerinizi dökerek seçtiğiniz dosyayı indirir ve açar.
            </p>
            <Button
              onClick={() => fetchDriveFiles()}
              disabled={isLoadingList || !token}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-2 shadow-xs"
            >
              {isLoadingList ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Yükleniyor...
                </>
              ) : (
                <>
                  <RefreshCw size={14} /> Bulut Listesini Yenile
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Files List Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <HardDrive size={15} /> Google Drive Bulut Yedekleri ({files.length})
            </h4>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950 max-h-56 overflow-y-auto">
            {isLoadingList ? (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw size={16} className="animate-spin text-blue-500" /> Dosyalar listeleniyor...
              </div>
            ) : files.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
                {!token ? 'Devam etmek için lütfen Google Giriş / Access Token girin.' : 'Drive hesabınızda listelenecek `.dtal` uzantılı yedek bulunamadı.'}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-850">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
                        <FileSpreadsheet size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate" title={file.name}>
                          {file.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-3">
                          <span>Boyut: {formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>Tarih: {formatDate(file.modifiedTime)}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleDownloadFile(file)}
                      disabled={downloadingId === file.id}
                      className="bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 transition-colors"
                    >
                      {downloadingId === file.id ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" /> İndiriliyor...
                        </>
                      ) : (
                        <>
                          <Download size={12} /> İndir & Aç
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
