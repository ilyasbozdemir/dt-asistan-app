import React from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Check,
  Lock,
  Settings,
  TrendingUp,
  Unlock
} from 'lucide-react'
import { cn } from '../../../../../utils/cn'
import { PiyasaFiyatArastirmasiFirmsTab } from './PiyasaFiyatArastirmasiFirmsTab'
import { PiyasaFiyatArastirmasiMatrixTab } from './PiyasaFiyatArastirmasiMatrixTab'

interface PiyasaFiyatArastirmasiFormProps {
  isFormFullscreen: boolean
  setIsFormOpen: (val: boolean) => void
  activeFormTab: 'firms' | 'matrix'
  setActiveFormTab: (tab: 'firms' | 'matrix') => void
  hesaplamaEsasi: string
  invitedFirms: any[]
  items: any[]
  bids: any
  getEstimatedCostTotal: () => number
  getLowestBidInfo: (itemId: number) => any
  getAverageBid: (itemId: number) => number
  handlePriceChange: (kalemId: number, teminFirmaId: number, priceStr: string) => Promise<void>
  handleSaveToDosya: () => void
  maliyetCetveliTarihi: string
  setMaliyetCetveliTarihi: (val: string) => void
  tutanakTarihi: string
  setTutanakTarihi: (val: string) => void
  syncTutanak: boolean
  setSyncTutanak: (val: boolean) => void
  setLowestFirmAsWinner: boolean
  setSetLowestFirmAsWinner: (val: boolean) => void
  manualWinnerFirmaId: number | null
  setManualWinnerFirmaId: (id: number | null) => void
  belgeleriKaydet: boolean
  setBelgeleriKaydet: (val: boolean) => void
  formMode: 'maliyet' | 'tutanak'
  isEditingFirms: boolean
  setIsEditingFirms: (val: boolean) => void
  setIsFirmModalOpen: (val: boolean) => void
  lowestTotalFirmaId: number | null
  handleRemoveFirm: (id: number) => void
}

export function PiyasaFiyatArastirmasiForm({
  formMode,
  isFormFullscreen,
  setIsFormOpen,
  activeFormTab,
  setActiveFormTab,
  hesaplamaEsasi,
  invitedFirms,
  items,
  bids,
  getEstimatedCostTotal,
  getLowestBidInfo,
  getAverageBid,
  handlePriceChange,
  handleSaveToDosya,
  maliyetCetveliTarihi,
  setMaliyetCetveliTarihi,
  tutanakTarihi,
  setTutanakTarihi,
  syncTutanak,
  setSyncTutanak,
  setLowestFirmAsWinner,
  setSetLowestFirmAsWinner,
  manualWinnerFirmaId,
  setManualWinnerFirmaId,
  belgeleriKaydet,
  setBelgeleriKaydet,
  isEditingFirms,
  setIsEditingFirms,
  setIsFirmModalOpen,
  lowestTotalFirmaId,
  handleRemoveFirm
}: PiyasaFiyatArastirmasiFormProps): React.JSX.Element {
  return (
    <div
      className={cn(
        isFormFullscreen
          ? 'fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 overflow-y-auto flex flex-col animate-in fade-in duration-300'
          : 'w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col gap-6 animate-in fade-in duration-300 mt-4 overflow-hidden'
      )}
    >
      {/* Form Header */}
      <div
        className={cn(
          'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex flex-col',
          isFormFullscreen ? 'sticky top-0 z-50' : ''
        )}
      >
        {/* Top Row: Navigation, Tabs and Save Button */}
        <div className="p-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-3xs border border-slate-200 dark:border-slate-700"
              title="Geri Dön / Kapat"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-left">
              <h3 className="text-base font-black text-slate-855 dark:text-slate-100 flex items-center gap-2 leading-none">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                {formMode === 'maliyet'
                  ? 'Yaklaşık Maliyet Cetveli Formu'
                  : 'Piyasa Fiyat Araştırma Tutanağı (PFAT) Formu'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Yöntem: {hesaplamaEsasi}
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800 max-w-sm w-full mx-auto md:mx-0">
            <button
              type="button"
              onClick={() => setActiveFormTab('firms')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-1.5 px-3 text-[11px] font-black rounded-lg transition-all cursor-pointer border-0',
                activeFormTab === 'firms'
                  ? 'bg-white dark:bg-slate-900 text-slate-855 dark:text-slate-100 shadow-3xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-400 bg-transparent'
              )}
            >
              <Building2 className="w-3.5 h-3.5" />
              İstekli Firmalar ({invitedFirms.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFormTab('matrix')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-1.5 px-3 text-[11px] font-black rounded-lg transition-all cursor-pointer border-0',
                activeFormTab === 'matrix'
                  ? 'bg-white dark:bg-slate-900 text-slate-855 dark:text-slate-100 shadow-3xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-400 bg-transparent'
              )}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Tutanak / Teklif Girişi
            </button>
          </div>

          <div className="flex items-center justify-end">
            {getEstimatedCostTotal() > 0 && (
              <button
                type="button"
                onClick={handleSaveToDosya}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-650 hover:from-emerald-600 hover:to-teal-750 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer h-10 border-0"
              >
                <Check className="w-4 h-4" />
                Fiyat & Verileri Kaydet
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row (Sub Settings Bar): Only visible when Tutanak / Teklif Girişi tab is active */}
        {activeFormTab === 'matrix' && (
          <div className="bg-slate-50/50 dark:bg-slate-900/30 p-3 px-6 md:px-8 flex flex-wrap items-center justify-between gap-4 text-xs border-b border-slate-100 dark:border-slate-800/40 animate-in slide-in-from-top-1 duration-200">
            {/* Dates Group */}
            <div className="flex flex-wrap items-center gap-2.5">
              {formMode === 'maliyet' ? (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-355 bg-white dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800 h-9">
                  <span className="text-slate-400">Maliyet Cetveli Tarihi:</span>
                  <input
                    type="date"
                    value={maliyetCetveliTarihi}
                    onChange={(e) => setMaliyetCetveliTarihi(e.target.value)}
                    className="bg-transparent border-none text-xs font-extrabold focus:outline-none cursor-pointer text-slate-800 dark:text-slate-250 w-28"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-355 bg-white dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800 h-9">
                  <span className="text-slate-400">Tutanak Tarihi:</span>
                  <input
                    type="date"
                    value={tutanakTarihi}
                    onChange={(e) => setTutanakTarihi(e.target.value)}
                    className="bg-transparent border-none text-xs font-extrabold focus:outline-none cursor-pointer text-slate-800 dark:text-slate-250 w-28"
                  />
                </div>
              )}
            </div>

            {/* Winner Selection & Doc Generation Group */}
            <div className="flex flex-wrap items-center gap-2.5">
              {formMode === 'tutanak' && (
                <>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800 h-9 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={setLowestFirmAsWinner}
                      onChange={(e) => setSetLowestFirmAsWinner(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span>En Düşük Teklifi Kazanan Yap</span>
                  </label>

                  {/* Manual winner selector */}
                  {!setLowestFirmAsWinner && invitedFirms.length > 0 && (
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-amber-50 dark:bg-amber-955/20 px-3 py-1.5 rounded-xl border border-amber-300/40 dark:border-amber-900/40 h-9">
                      <span className="text-amber-600 dark:text-amber-400 shrink-0">Kazanan:</span>
                      <select
                        value={manualWinnerFirmaId ?? ''}
                        onChange={(e) =>
                          setManualWinnerFirmaId(e.target.value ? Number(e.target.value) : null)
                        }
                        className="bg-transparent border-none text-xs font-extrabold focus:outline-none cursor-pointer text-slate-800 dark:text-slate-200 max-w-[180px] truncate"
                      >
                        <option value="">-- Firma Seç --</option>
                        {invitedFirms.map((f) => (
                          <option key={f.id} value={f.firma_id}>
                            {f.unvan}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              {/* Resmi Belgeleri Oluştur Checkbox */}
              <label
                className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-blue-50/50 dark:bg-blue-955/10 px-3 py-1.5 rounded-xl border border-blue-200/60 dark:border-blue-900/40 h-9 cursor-pointer select-none"
                title={
                  formMode === 'maliyet'
                    ? 'Eğer işaretlenirse Yaklaşık Maliyet Cetveli dökümanı oluşturulur.'
                    : 'Eğer işaretlenirse Fiyat Araştırma Tutanağı dökümanı oluşturulur.'
                }
              >
                <input
                  type="checkbox"
                  checked={belgeleriKaydet}
                  onChange={(e) => setBelgeleriKaydet(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span>
                  Resmi Belgeyi Oluştur ({formMode === 'maliyet' ? 'Yaklaşık Maliyet' : 'Tutanak'})
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Form Content Area */}
      <div
        className={cn('p-6 flex flex-col gap-6 w-full flex-1', isFormFullscreen ? 'md:p-8' : '')}
      >
        {activeFormTab === 'firms' ? (
          <PiyasaFiyatArastirmasiFirmsTab
            isEditingFirms={isEditingFirms}
            setIsEditingFirms={setIsEditingFirms}
            setIsFirmModalOpen={setIsFirmModalOpen}
            invitedFirms={invitedFirms}
            lowestTotalFirmaId={lowestTotalFirmaId}
            handleRemoveFirm={handleRemoveFirm}
          />
        ) : (
          <PiyasaFiyatArastirmasiMatrixTab
            invitedFirms={invitedFirms}
            items={items}
            bids={bids}
            getEstimatedCostTotal={getEstimatedCostTotal}
            getLowestBidInfo={getLowestBidInfo}
            getAverageBid={getAverageBid}
            handlePriceChange={handlePriceChange}
          />
        )}
      </div>
    </div>
  )
}
