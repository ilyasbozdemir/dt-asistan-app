import React from 'react'
import { Link } from '@tanstack/react-router'
import { Building2, Lock, Settings } from 'lucide-react'
import { DavetEdilenFirmalar } from './DavetEdilenFirmalar'

interface PiyasaFiyatArastirmasiFirmsTabProps {
  isEditingFirms: boolean
  setIsEditingFirms: (val: boolean) => void
  setIsFirmModalOpen: (val: boolean) => void
  invitedFirms: any[]
  lowestTotalFirmaId: number | null
  handleRemoveFirm: (id: number) => void
}

export function PiyasaFiyatArastirmasiFirmsTab({
  isEditingFirms,
  setIsEditingFirms,
  setIsFirmModalOpen,
  invitedFirms,
  lowestTotalFirmaId,
  handleRemoveFirm
}: PiyasaFiyatArastirmasiFirmsTabProps): React.JSX.Element {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-6 animate-in fade-in duration-200">
      <div className="flex flex-col gap-5 border-b border-slate-100 dark:border-slate-800 pb-5">
        {/* Header and Actions Row */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-855 dark:text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              Sürece Katılan İstekli Firmalar
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Piyasa araştırması kapsamında davet edilen ve teklif formu dolduran firmaları
              belirleyin.
              <br />
              Dağıtılan teklif formlarından gelen verileri bu alana ekleyebilir, yaklaşık maliyet
              cetveli ve piyasa fiyat araştırma tutanağı belgelerini çıkartabilirsiniz.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 mt-2 md:mt-0">
            <button
              type="button"
              onClick={() => {
                setIsEditingFirms(true)
                setIsFirmModalOpen(true)
              }}
              className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl transition-all h-9 cursor-pointer shadow-md border-0"
            >
              <Building2 className="w-4 h-4 text-white" />
              <span>İstekli Firma Seç / Ekle</span>
            </button>

            <Link
              to="/firmalar"
              className="text-xs bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 font-bold px-4 py-2 rounded-xl transition-all flex items-center justify-center h-9 cursor-pointer shadow-xs border-0"
            >
              <Settings className="w-3.5 h-3.5 text-white/90" />
              <span>Firma Havuzunu Yönet</span>
            </Link>

            {isEditingFirms && (
              <button
                type="button"
                onClick={() => setIsEditingFirms(false)}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 border-0 cursor-pointer"
                title="Düzenlemeyi Bitir / Kilitle"
              >
                <Lock className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
            )}
          </div>
        </div>

        {/* Info Alert Row */}
        <div className="p-3.5 bg-blue-50/50 dark:bg-blue-955/20 rounded-xl border border-blue-100 dark:border-blue-900/30 text-xs text-blue-700 dark:text-blue-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-2.5">
            <span className="text-base mt-0.5">ℹ️</span>
            <span className="leading-relaxed">
              Bu alandaki verileri bir önceki adım olan{' '}
              <strong>İhtiyaç Listesi & Maliyet & Onay</strong> aşamasında da güncelleyebilirsiniz.
              Orada yapılan değişiklikler otomatik olarak buraya yansır.
            </span>
          </div>
          <Link
            to="/dosya/hazirlik-ve-ihtiyac"
            className="shrink-0 text-[11px] bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg transition-all border-0 cursor-pointer text-center whitespace-nowrap shadow-sm shadow-blue-600/20"
          >
            İhtiyaç Listesi & Maliyet & Onay'a Git
          </Link>
        </div>
      </div>

      {/* DAVET EDİLEN FİRMALARIN KART GÖRÜNÜMÜ */}
      <DavetEdilenFirmalar
        invitedFirms={invitedFirms}
        lowestTotalFirmaId={lowestTotalFirmaId}
        isEditing={isEditingFirms}
        onRemoveFirm={handleRemoveFirm}
        onAddClick={() => setIsFirmModalOpen(true)}
      />
    </div>
  )
}
