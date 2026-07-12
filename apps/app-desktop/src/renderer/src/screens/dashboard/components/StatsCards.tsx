import React from 'react'
import { FileText, Clock, Briefcase, Building, Landmark, TrendingUp, Users } from 'lucide-react'

interface StatsCardsProps {
  isLoading: boolean
  stats: any
  formatCurrency: (value: number) => string
}

export const StatsCards: React.FC<StatsCardsProps> = ({ isLoading, stats, formatCurrency }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* İhale Dosya Sayısı */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-blue-500/30 transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-450 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
            İhale Dosya Sayısı
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
            {isLoading ? '-' : stats.ihaleDosyaSayisi}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="text-[8px] bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded text-blue-650 dark:text-blue-400 font-bold">
              Mal: {stats.malDosyaSayisi}
            </span>
            <span className="text-[8px] bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-600 dark:text-emerald-450 font-bold">
              Hizmet: {stats.hizmetDosyaSayisi}
            </span>
            <span className="text-[8px] bg-amber-50 dark:bg-amber-950 px-1.5 py-0.5 rounded text-amber-600 dark:text-amber-450 font-bold">
              Yapım: {stats.yapimDosyaSayisi}
            </span>
            {stats.danismanlikDosyaSayisi > 0 && (
              <span className="text-[8px] bg-purple-50 dark:bg-purple-950 px-1.5 py-0.5 rounded text-purple-600 dark:text-purple-400 font-bold">
                Danış: {stats.danismanlikDosyaSayisi}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* İhale Süreç Dağılımı */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-cyan-500/30 transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-450 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
            Aktif & Tamamlanan
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
            {isLoading ? '-' : stats.ihaleDosyaSayisi}
          </div>
          <div className="text-[9px] text-slate-500 dark:text-slate-450 mt-2 flex flex-col gap-0.5 font-semibold">
            <div className="flex justify-between">
              <span>Aktif Süreç:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {stats.aktifDosyaSayisi}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tamamlanan:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {stats.tamamlananDosyaSayisi}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* İhalelere Katılan Firma Sayısı */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-indigo-500/30 transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-450 flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
            İhalelere Katılan Firma Sayısı
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
            {isLoading ? '-' : stats.ihalelereKatilanFirmaSayisi}
          </div>
          <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-2">
            Dosyalarda teklif veren veya davet edilen tekil firmalar.
          </div>
        </div>
      </div>

      {/* İhalelere Seçilen Firma Sayısı */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-emerald-500/30 transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-450 flex items-center justify-center shrink-0">
            <Building className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
            İhalelere Seçilen Firma Sayısı
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
            {isLoading ? '-' : stats.ihalelereSecilenFirmaSayisi}
          </div>
          <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-2">
            Satın alma yapılması kararlaştırılan kazanan firma sayısı.
          </div>
        </div>
      </div>

      {/* En Çok İhale Alan İstekli */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-violet-500/30 transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 px-2.5 py-0.5 rounded-full border border-violet-500/10">
            Lider Tedarikçi
          </span>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
            En Çok Tercih Edilen
          </div>
          <div
            className="text-xs font-black text-slate-850 dark:text-slate-100 mt-1 truncate"
            title={stats.enCokSecilenFirma?.unvan || 'Veri Yok'}
          >
            {stats.enCokSecilenFirma?.unvan || 'Kayıt Bulunamadı'}
          </div>
          {stats.enCokSecilenFirma && (
            <div className="text-[10px] text-violet-600 dark:text-violet-400 font-bold mt-1">
              {stats.enCokSecilenFirma.count} Dosya İhalesi
            </div>
          )}
        </div>
      </div>

      {/* En Çok Harcama Yapan Birim */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-pink-500/30 transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-900/20 text-pink-650 dark:text-pink-450 flex items-center justify-center shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-bold text-pink-600 dark:text-pink-450 bg-pink-50 dark:bg-pink-950/30 px-2.5 py-0.5 rounded-full border border-pink-500/10">
            Lider Birim
          </span>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
            En Çok Harcama Yapan
          </div>
          <div
            className="text-xs font-black text-slate-850 dark:text-slate-100 mt-1 truncate"
            title={stats.enCokHarcamaYapanBirim?.birim_adi || 'Veri Yok'}
          >
            {stats.enCokHarcamaYapanBirim?.birim_adi || 'Kayıt Bulunamadı'}
          </div>
          {stats.enCokHarcamaYapanBirim && (
            <div className="text-[10px] text-pink-650 dark:text-pink-400 font-bold mt-1">
              {formatCurrency(stats.enCokHarcamaYapanBirim.total)}
            </div>
          )}
        </div>
      </div>

      {/* İhale Edilen Malzeme Sayısı */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-amber-500/30 transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-450 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
            İhale Edilen Kalem Sayısı
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
            {isLoading ? '-' : stats.ihaleEdilenMalzemeSayisi}
          </div>
          <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-2">
            Tüm dosyalarda talep edilen toplam kalem miktarı.
          </div>
        </div>
      </div>

      {/* Kurumda Kayıtlı İstekli Firma Sayısı */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-purple-500/30 transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-450 flex items-center justify-center shrink-0">
            <Building className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
            Kayıtlı Tedarikçi Havuzu
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
            {isLoading ? '-' : stats.kayitliFirmaSayisi}
          </div>
          <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-2">
            Sistem havuzuna kayıtlı olan toplam tedarikçi firma.
          </div>
        </div>
      </div>

      {/* Kurumda Kayıtlı Personel Sayısı */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-pink-500/30 transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-900/20 text-pink-650 dark:text-pink-450 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
            Kayıtlı Personel Sayısı
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
            {isLoading ? '-' : stats.kayitliPersonelSayisi}
          </div>
          <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-2">
            Süreçlerde görev alabilecek toplam personel sayısı.
          </div>
        </div>
      </div>
    </div>
  )
}
