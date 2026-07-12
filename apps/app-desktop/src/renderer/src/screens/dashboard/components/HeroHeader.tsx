import React from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  Mail,
  ShieldAlert,
  Info,
  ChevronRight,
  Calendar,
  ChevronDown,
  FileText,
  Plus
} from 'lucide-react'
import { Button } from '../../../components/ui/Button'

interface HeroHeaderProps {
  isMailConfigured: boolean
  smartAlerts: any[]
  institutionName: string
  kurumTuruLabel: string
  greeting: string
  currentDate: string
  activeSummary: any
  isActivePopoverOpen: boolean
  setIsActivePopoverOpen: (open: boolean) => void
  formatCurrency: (value: number) => string
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({
  isMailConfigured,
  smartAlerts,
  institutionName,
  kurumTuruLabel,
  greeting,
  currentDate,
  activeSummary,
  isActivePopoverOpen,
  setIsActivePopoverOpen,
  formatCurrency
}) => {
  return (
    <div className="flex flex-col gap-3">
      {!isMailConfigured && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3 text-amber-700 dark:text-amber-500">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold">Mail (SMTP) Ayarları Yapılandırılmamış</h4>
              <p className="text-xs mt-0.5 opacity-90">
                Sistem üzerinden şifre sıfırlama veya onay mailleri alabilmeniz için posta
                sunucunuzu ayarlamanız gerekmektedir. Şifrenizi unutursanız sisteme erişiminizi
                kaybedebilirsiniz!
              </p>
            </div>
          </div>
          <Link to="/ayarlar" search={{ tab: 'smtp' }}>
            <Button className="shrink-0 text-xs py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm">
              <Mail className="w-4 h-4 mr-1.5" />
              Ayarları Yapılandır
            </Button>
          </Link>
        </div>
      )}

      {smartAlerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {smartAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 shadow-sm ${
                alert.type === 'error'
                  ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400'
                  : alert.type === 'warning'
                    ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50 text-orange-700 dark:text-orange-400'
                    : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-400'
              }`}
            >
              <div className="flex items-start gap-3">
                {alert.type === 'error' ? (
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                ) : alert.type === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-sm font-bold">{alert.title}</h4>
                  <p className="text-xs mt-0.5 opacity-90 leading-relaxed">{alert.message}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Link to={alert.actionLink} search={alert.actionSearch}>
                  <Button
                    variant="outline"
                    className={`h-7 px-3 text-[10px] font-bold uppercase tracking-wider rounded-lg border-current hover:bg-white/50 dark:hover:bg-black/20 ${
                      alert.type === 'error'
                        ? 'text-red-700 dark:text-red-400'
                        : alert.type === 'warning'
                          ? 'text-orange-700 dark:text-orange-400'
                          : 'text-blue-700 dark:text-blue-400'
                    }`}
                  >
                    {alert.actionText} <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-6 rounded-3xl bg-linear-to-r from-blue-600/10 via-indigo-600/5 to-transparent border border-blue-500/10 dark:border-blue-500/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-450 uppercase tracking-widest bg-blue-100/40 dark:bg-blue-950/40 px-2.5 py-1 rounded-full border border-blue-500/15">
              {institutionName || 'Kurum Adı Bekleniyor...'}
            </span>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-100/40 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full border border-indigo-500/15">
              {kurumTuruLabel}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-850 dark:text-slate-100 tracking-tight">
            {greeting}, Kontrol Paneline Hoş Geldiniz.
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-600" />
            {currentDate}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative">
          {activeSummary && (
            <div className="relative">
              <Button
                onClick={() => setIsActivePopoverOpen(!isActivePopoverOpen)}
                variant="outline"
                className="text-xs font-bold py-2 border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-blue-600 dark:text-blue-450 flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Aktif Dosya
                <ChevronDown
                  className={`w-3.5 h-3.5 transform transition-transform ${
                    isActivePopoverOpen ? 'rotate-180' : ''
                  }`}
                />
              </Button>
              {isActivePopoverOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100 dark:border-slate-850">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        Çalışılan Aktif Dosya
                      </h4>
                      <p className="text-[9px] text-slate-400">
                        Şu anda üzerinde işlem yapılan doğrudan temin dosyası
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850/50">
                        <span className="text-[9px] font-bold text-slate-450 uppercase block">
                          No & Konu
                        </span>
                        <span className="font-mono text-blue-650 dark:text-blue-450 font-bold block">
                          {activeSummary.dosyaNo}
                        </span>
                        <span
                          className="font-semibold text-slate-700 dark:text-slate-350 truncate block mt-0.5"
                          title={activeSummary.konu}
                        >
                          {activeSummary.konu}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850/50">
                        <span className="text-[9px] font-bold text-slate-450 uppercase block">
                          Maliyet & KDV
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-100 block">
                          {formatCurrency(activeSummary.yaklasikMaliyet)}
                        </span>
                        <span className="text-slate-450 block mt-0.5">
                          KDV: %{activeSummary.kdv}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850/50">
                        <span className="text-[9px] font-bold text-slate-450 uppercase block">
                          Birim & Tür
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-305 block truncate">
                          {activeSummary.birimAdi}
                        </span>
                        <span className="text-slate-450 capitalize block mt-0.5">
                          {activeSummary.tur} Alımı
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850/50">
                        <span className="text-[9px] font-bold text-slate-450 uppercase block">
                          Yüklenici Firma
                        </span>
                        <span
                          className="font-semibold text-emerald-650 dark:text-emerald-450 block truncate"
                          title={activeSummary.secilenFirma}
                        >
                          {activeSummary.secilenFirma}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/30">
                        <span className="font-bold text-indigo-600">Firmalar:</span>
                        <span className="font-bold text-indigo-700 dark:text-indigo-400">
                          {activeSummary.katilanFirmaSayisi} Firma
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/30 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/30">
                        <span className="font-bold text-amber-600">Kalemler:</span>
                        <span className="font-bold text-amber-700 dark:text-amber-400">
                          {activeSummary.malzemeSayisi} Kalem
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <Link to="/dosyalar">
            <Button className="bg-blue-600 hover:bg-blue-700 text-xs font-semibold py-2 px-4 shadow-md shadow-blue-500/10 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Yeni Temin Dosyası
            </Button>
          </Link>
          <Link to="/mevzuat">
            <Button
              variant="outline"
              className="text-xs font-semibold py-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              Limitleri Gör
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
