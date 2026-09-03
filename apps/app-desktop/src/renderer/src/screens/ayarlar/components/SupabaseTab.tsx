import React, { useState, useEffect } from 'react'
import {
  Cloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UploadCloud,
  Server,
  FileCode,
  ShieldCheck,
  HardDrive,
  Check
} from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'

interface SupabaseConfig {
  url: string
  anonKey: string
  serviceRoleKey?: string
  bucketDocuments?: string
  bucketBackups?: string
  autoSyncEnabled?: boolean
}

export const SupabaseTab: React.FC = () => {
  const [url, setUrl] = useState('')
  const [anonKey, setAnonKey] = useState('')
  const [serviceRoleKey, setServiceRoleKey] = useState('')
  const [bucketDocuments, setBucketDocuments] = useState('hakim-pro-documents')
  const [bucketBackups, setBucketBackups] = useState('hakim-pro-backups')
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null)
  const [backingUp, setBackingUp] = useState(false)
  const [backupResult, setBackupResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async (): Promise<void> => {
    setLoading(true)
    try {
      if (window.electron) {
        const res = await window.electron.ipcRenderer.invoke('supabase:get-config')
        if (res?.success && res.data) {
          setUrl(res.data.url || '')
          setAnonKey(res.data.anonKey || '')
          setServiceRoleKey(res.data.serviceRoleKey || '')
          setBucketDocuments(res.data.bucketDocuments || 'hakim-pro-documents')
          setBucketBackups(res.data.bucketBackups || 'hakim-pro-backups')
          setAutoSyncEnabled(!!res.data.autoSyncEnabled)
        }
      }
    } catch (err) {
      console.error('Supabase config yükleme hatası:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (): Promise<void> => {
    setSaving(true)
    try {
      if (window.electron) {
        const payload: SupabaseConfig = {
          url,
          anonKey,
          serviceRoleKey,
          bucketDocuments,
          bucketBackups,
          autoSyncEnabled
        }
        const res = await window.electron.ipcRenderer.invoke('supabase:save-config', payload)
        if (res?.success) {
          alert('Supabase entegrasyon ayarları başarıyla kaydedildi.')
        } else {
          alert(`Kayıt hatası: ${res?.message || 'Bilinmeyen hata'}`)
        }
      }
    } catch (err: any) {
      alert(`Kayıt hatası: ${err?.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async (): Promise<void> => {
    setTesting(true)
    setTestResult(null)
    try {
      if (window.electron) {
        const res = await window.electron.ipcRenderer.invoke('supabase:test-connection', {
          url,
          anonKey,
          serviceRoleKey
        })
        setTestResult(res)
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Bağlantı sırasında hata oluştu.'
      })
    } finally {
      setTesting(false)
    }
  }

  const handleUploadBackup = async (): Promise<void> => {
    setBackingUp(true)
    setBackupResult(null)
    try {
      if (window.electron) {
        const res = await window.electron.ipcRenderer.invoke('supabase:upload-backup')
        setBackupResult(res)
      }
    } catch (err: any) {
      setBackupResult({
        success: false,
        message: err?.message || 'Yedekleme sırasında hata oluştu.'
      })
    } finally {
      setBackingUp(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Banner */}
      <div className="p-5 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex items-start gap-4">
        <div className="p-3 bg-primary/20 text-primary rounded-xl shrink-0">
          <Cloud className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            Supabase / Self-Hosted Bulut Entegrasyonu
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
              PostgreSQL + Storage + RLS
            </span>
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            HAKİM Pro verilerini kendi kurum içi sunucunuzda (Docker Self-Hosted) veya resmi Supabase bulutunda barındırabilir,
            ihaleleri ve resmi evrakları merkezi olarak senkronize edebilirsiniz.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-muted-foreground gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span>Ayarlar yükleniyor...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bağlantı Ayarları */}
          <div className="p-5 rounded-xl border border-border bg-card space-y-4">
            <h4 className="font-semibold text-sm flex items-center gap-2 text-foreground border-b border-border pb-3">
              <Server className="w-4 h-4 text-primary" />
              Sunucu & Erişim Bilgileri
            </h4>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Supabase API URL
                </label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="http://sunucu-ip:8000 veya https://xyz.supabase.co"
                  className="font-mono text-xs"
                />
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  Self-hosted Docker sunucunuzun veya Supabase projenizin API adresi.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Supabase Anon (Public) Key
                </label>
                <textarea
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  rows={3}
                  className="w-full p-2.5 text-xs font-mono rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  İstemci tarafında güvenle çalışan anonim JWT anahtarı.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Service Role (Admin) Key <span className="text-muted-foreground font-normal">(İsteğe Bağlı)</span>
                </label>
                <Input
                  type="password"
                  value={serviceRoleKey}
                  onChange={(e) => setServiceRoleKey(e.target.value)}
                  placeholder="Yalnızca sunucu içi özel yönetim görevleri için"
                  className="font-mono text-xs"
                />
              </div>
            </div>

            {/* Test Connection Button & Result */}
            <div className="pt-2 border-t border-border space-y-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={testing || !url || !anonKey}
                className="w-full flex items-center justify-center gap-2"
              >
                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 text-primary" />}
                Bağlantıyı Test Et
              </Button>

              {testResult && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-start gap-2 border ${
                    testResult.success
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                      : 'bg-destructive/10 text-destructive border-destructive/20'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <p className="font-medium">{testResult.message}</p>
                    {testResult.latencyMs && (
                      <p className="text-[10px] opacity-80">Gecikme: {testResult.latencyMs} ms</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Depolama & Yedekleme */}
          <div className="p-5 rounded-xl border border-border bg-card space-y-4">
            <h4 className="font-semibold text-sm flex items-center gap-2 text-foreground border-b border-border pb-3">
              <HardDrive className="w-4 h-4 text-primary" />
              Depolama (Storage) & Yedekleme
            </h4>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Evrak Deposu Bucket Adı
                </label>
                <Input
                  value={bucketDocuments}
                  onChange={(e) => setBucketDocuments(e.target.value)}
                  placeholder="hakim-pro-documents"
                  className="font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Veritabanı Yedekleri Bucket Adı
                </label>
                <Input
                  value={bucketBackups}
                  onChange={(e) => setBucketBackups(e.target.value)}
                  placeholder="hakim-pro-backups"
                  className="font-mono text-xs"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={autoSyncEnabled}
                    onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span>Otomatik Bulut Yedekleme (Dosya kapandığında yedekle)</span>
                </label>
              </div>
            </div>

            {/* Manuel Buluta Yedekleme Butonu */}
            <div className="pt-3 border-t border-border space-y-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUploadBackup}
                disabled={backingUp || !url || !anonKey}
                className="w-full flex items-center justify-center gap-2"
              >
                {backingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4 text-primary" />}
                Aktif SQLite Veritabanını Buluta Yedekle
              </Button>

              {backupResult && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-start gap-2 border ${
                    backupResult.success
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                      : 'bg-destructive/10 text-destructive border-destructive/20'
                  }`}
                >
                  {backupResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <p className="font-medium">{backupResult.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SQL Şema & Kurulum Yardım Kartı */}
      <div className="p-5 rounded-xl border border-border bg-muted/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-primary" />
            <h4 className="font-semibold text-xs text-foreground">
              PostgreSQL & Supabase Kurulum Şeması (DDL & RLS)
            </h4>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">
            packages/database/src/supabase/schema.sql
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Kendi kurduğunuz Supabase sunucusundaki <strong>SQL Editor</strong> alanına giderek projedeki tüm kamu ihale tablolarını,
          Sayıştay denetim izi (audit trigger) mekanizmasını ve Storage bucket yetkilerini tek tıkla oluşturabilirsiniz.
        </p>
      </div>

      {/* Kaydet Butonu */}
      <div className="flex justify-end pt-4 border-t border-border">
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Supabase Ayarlarını Kaydet
        </Button>
      </div>
    </div>
  )
}
