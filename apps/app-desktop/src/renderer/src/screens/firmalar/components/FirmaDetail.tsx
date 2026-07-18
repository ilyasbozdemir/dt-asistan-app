import React, { useState } from 'react'
import {
  ArrowLeft,
  Building2,
  Phone,
  Landmark,
  FileText,
  User,
  MapPin,
  ClipboardList,
  Info
} from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { FirmaGecmisTeminler } from './FirmaGecmisTeminler'
import { cn } from '../../../utils/cn'

interface FirmaDetailProps {
  viewingFirma: any
  setViewingFirma: (firma: any | null) => void
}

export const FirmaDetail: React.FC<FirmaDetailProps> = ({ viewingFirma, setViewingFirma }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'teminler'>('info')

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full">
      <Button
        variant="ghost"
        onClick={() => setViewingFirma(null)}
        className="w-fit mb-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Listeye Geri Dön
      </Button>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
        {/* Header Section */}
        <div className="flex items-start gap-5 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold shadow-sm shrink-0 border border-blue-200 dark:border-blue-800">
            <Building2 className="w-10 h-10" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {viewingFirma.firma_kodu && (
                <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-100/20 dark:border-blue-900/10 px-2.5 py-1 rounded">
                  {viewingFirma.firma_kodu}
                </span>
              )}
              {viewingFirma.uyrugu && (
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded uppercase tracking-wider">
                  {viewingFirma.uyrugu}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight mb-2">
              {viewingFirma.unvan}
            </h2>
            {viewingFirma.istigal_konusu && (
              <div className="text-base text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-500">İştigal:</span>{' '}
                {viewingFirma.istigal_konusu}
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800 mb-6 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={cn(
              'flex items-center gap-1.5 py-2 px-4 text-xs font-black rounded-lg transition-all cursor-pointer border-0',
              activeTab === 'info'
                ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-3xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-400 bg-transparent'
            )}
          >
            <Info className="w-3.5 h-3.5" />
            Firma Bilgileri
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('teminler')}
            className={cn(
              'flex items-center gap-1.5 py-2 px-4 text-xs font-black rounded-lg transition-all cursor-pointer border-0',
              activeTab === 'teminler'
                ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-3xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-400 bg-transparent'
            )}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Geçmiş Doğrudan Teminler
          </button>
        </div>

        {activeTab === 'info' ? (
          /* FIRMA BİLGİLERİ TAB */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-200">
            {/* Sol Kolon: İletişim */}
            <div className="space-y-5">
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Phone className="w-5 h-5 text-slate-400" /> İletişim & Adres
              </h4>

              <div className="space-y-4">
                {(viewingFirma.telefon || viewingFirma.faks) && (
                  <div className="flex flex-col gap-1.5 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Telefon / Faks
                    </span>
                    <div className="text-base text-slate-800 dark:text-slate-200 font-medium">
                      {viewingFirma.telefon && (
                        <span className="mr-4">📞 {viewingFirma.telefon}</span>
                      )}
                      {viewingFirma.faks && <span>📠 {viewingFirma.faks}</span>}
                    </div>
                  </div>
                )}

                {(viewingFirma.email || viewingFirma.web_adresi) && (
                  <div className="flex flex-col gap-1.5 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Dijital İletişim
                    </span>
                    <div className="text-base text-slate-800 dark:text-slate-200 font-medium">
                      {viewingFirma.email && <div className="mb-1">✉️ {viewingFirma.email}</div>}
                      {viewingFirma.web_adresi && (
                        <div>
                          🌐{' '}
                          <a
                            href={
                              viewingFirma.web_adresi.startsWith('http')
                                ? viewingFirma.web_adresi
                                : `https://${viewingFirma.web_adresi}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {viewingFirma.web_adresi}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> Adres Bilgileri
                  </span>
                  <div className="text-base text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    {viewingFirma.adres ? (
                      <div className="mb-2.5 font-medium leading-relaxed">{viewingFirma.adres}</div>
                    ) : (
                      <div className="text-slate-400 italic mb-2.5">Adres girilmemiş.</div>
                    )}
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {viewingFirma.ilce && <span>{viewingFirma.ilce}</span>}
                      {viewingFirma.ilce && viewingFirma.il && <span>/</span>}
                      {viewingFirma.il && <span>{viewingFirma.il}</span>}
                      {viewingFirma.posta_kodu && (
                        <span className="ml-auto text-slate-400 font-mono bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">
                          {viewingFirma.posta_kodu}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {viewingFirma.ilgili_adi && (
                  <div className="flex flex-col gap-1.5 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-4 h-4" /> İlgili Kişi
                    </span>
                    <div className="text-base text-slate-800 dark:text-slate-200 font-bold">
                      {viewingFirma.ilgili_adi}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sağ Kolon: Banka & Vergi */}
            <div className="space-y-5">
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Landmark className="w-5 h-5 text-slate-400" /> Finansal & Resmi Bilgiler
              </h4>

              <div className="space-y-4">
                <div className="flex flex-col gap-2 bg-amber-50/50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                  <span className="text-[11px] font-bold text-amber-600/70 dark:text-amber-500/70 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> Vergi Bilgileri
                  </span>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Vergi Dairesi</div>
                      <div className="text-base font-bold text-slate-800 dark:text-slate-200">
                        {viewingFirma.vergi_dairesi || '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Vergi No</div>
                      <div className="text-base font-mono font-bold text-slate-800 dark:text-slate-200">
                        {viewingFirma.vergi_no || '-'}
                      </div>
                    </div>
                    <div className="col-span-2 pt-3 border-t border-amber-200/50 dark:border-amber-800/50 mt-1">
                      <div className="text-xs text-slate-500 mb-1">TC Kimlik No</div>
                      <div className="text-base font-mono font-bold text-slate-800 dark:text-slate-200">
                        {viewingFirma.tc_kimlik_no || '-'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                  <span className="text-[11px] font-bold text-emerald-600/70 dark:text-emerald-500/70 uppercase tracking-wider flex items-center gap-1.5">
                    <Landmark className="w-4 h-4" /> Banka Bilgileri
                  </span>
                  <div className="space-y-4 mt-2">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Banka Adı</div>
                      <div className="text-base font-bold text-slate-800 dark:text-slate-200">
                        {viewingFirma.banka_adi || '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Şube</div>
                      <div className="text-base font-medium text-slate-800 dark:text-slate-200">
                        {viewingFirma.sube_kodu_adi || '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">IBAN / Hesap No</div>
                      <div className="text-base font-mono font-bold text-slate-800 dark:text-slate-200">
                        {viewingFirma.hesap_no || '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* GEÇMİŞ DOĞRUDAN TEMİNLER TAB */
          <FirmaGecmisTeminler firmaId={viewingFirma.id} firmaUnvan={viewingFirma.unvan} />
        )}
      </div>
    </div>
  )
}
