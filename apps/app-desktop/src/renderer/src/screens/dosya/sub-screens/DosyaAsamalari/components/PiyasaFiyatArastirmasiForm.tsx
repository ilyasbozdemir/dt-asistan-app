import React from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Check,
  Lock,
  Settings,
  TrendingUp,
  Unlock,
} from "lucide-react";
import { cn } from "../../../../../utils/cn";
import { DavetEdilenFirmalar } from "./DavetEdilenFirmalar";
import { TeklifMatrisi } from "./TeklifMatrisi";

interface PiyasaFiyatArastirmasiFormProps {
  isFormFullscreen: boolean;
  setIsFormOpen: (val: boolean) => void;
  activeFormTab: "firms" | "matrix";
  setActiveFormTab: (tab: "firms" | "matrix") => void;
  hesaplamaEsasi: string;
  invitedFirms: any[];
  items: any[];
  bids: any;
  getEstimatedCostTotal: () => number;
  getLowestBidInfo: (itemId: number) => any;
  getAverageBid: (itemId: number) => number;
  handlePriceChange: (kalemId: number, teminFirmaId: number, priceStr: string) => Promise<void>;
  handleSaveToDosya: () => void;
  maliyetCetveliTarihi: string;
  setMaliyetCetveliTarihi: (val: string) => void;
  tutanakTarihi: string;
  setTutanakTarihi: (val: string) => void;
  syncTutanak: boolean;
  setSyncTutanak: (val: boolean) => void;
  setLowestFirmAsWinner: boolean;
  setSetLowestFirmAsWinner: (val: boolean) => void;
  manualWinnerFirmaId: number | null;
  setManualWinnerFirmaId: (id: number | null) => void;
  belgeleriKaydet: boolean;
  setBelgeleriKaydet: (val: boolean) => void;
  isEditingFirms: boolean;
  setIsEditingFirms: (val: boolean) => void;
  setIsFirmModalOpen: (val: boolean) => void;
  lowestTotalFirmaId: number | null;
  handleRemoveFirm: (id: number) => void;
}

export function PiyasaFiyatArastirmasiForm({
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
  handleRemoveFirm,
}: PiyasaFiyatArastirmasiFormProps): React.JSX.Element {
  return (
    <div
      className={cn(
        isFormFullscreen
          ? "fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 overflow-y-auto flex flex-col animate-in fade-in duration-300"
          : "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col gap-6 animate-in fade-in duration-300 mt-4 overflow-hidden",
      )}
    >
      {/* Form Header */}
      <div
        className={cn(
          "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex flex-col",
          isFormFullscreen ? "sticky top-0 z-50" : "",
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
              <h3 className="text-base font-black text-slate-850 dark:text-slate-100 flex items-center gap-2 leading-none">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                Piyasa Fiyat Araştırma Formu
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
              onClick={() => setActiveFormTab("firms")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-1.5 px-3 text-[11px] font-black rounded-lg transition-all cursor-pointer border-0",
                activeFormTab === "firms"
                  ? "bg-white dark:bg-slate-900 text-slate-855 dark:text-slate-100 shadow-3xs"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-400 bg-transparent",
              )}
            >
              <Building2 className="w-3.5 h-3.5" />
              İstekli Firmalar ({invitedFirms.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFormTab("matrix")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-1.5 px-3 text-[11px] font-black rounded-lg transition-all cursor-pointer border-0",
                activeFormTab === "matrix"
                  ? "bg-white dark:bg-slate-900 text-slate-855 dark:text-slate-100 shadow-3xs"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-400 bg-transparent",
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
        {activeFormTab === "matrix" && (
          <div className="bg-slate-50/50 dark:bg-slate-900/30 p-3 px-6 md:px-8 flex flex-wrap items-center justify-between gap-4 text-xs border-b border-slate-100 dark:border-slate-800/40 animate-in slide-in-from-top-1 duration-200">
            {/* Dates Group */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-355 bg-white dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800 h-9">
                <span className="text-slate-400">Maliyet Cetveli Tarihi:</span>
                <input
                  type="date"
                  value={maliyetCetveliTarihi}
                  onChange={(e) => {
                    setMaliyetCetveliTarihi(e.target.value);
                    if (syncTutanak) {
                      setTutanakTarihi(e.target.value);
                    }
                  }}
                  className="bg-transparent border-none text-xs font-extrabold focus:outline-none cursor-pointer text-slate-800 dark:text-slate-250 w-28"
                />
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-355 bg-white dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800 h-9">
                <span className="text-slate-400">Tutanak Tarihi:</span>
                <input
                  type="date"
                  value={tutanakTarihi}
                  disabled={syncTutanak}
                  onChange={(e) => setTutanakTarihi(e.target.value)}
                  className="bg-transparent border-none text-xs font-extrabold focus:outline-none cursor-pointer text-slate-800 dark:text-slate-250 disabled:opacity-60 w-28"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800 h-9 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={syncTutanak}
                  onChange={(e) => setSyncTutanak(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span>Tarihleri Senkronize Et</span>
              </label>
            </div>

            {/* Winner Selection & Doc Generation Group */}
            <div className="flex flex-wrap items-center gap-2.5">
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
                  <span className="text-amber-600 dark:text-amber-400 shrink-0">
                    Kazanan:
                  </span>
                  <select
                    value={manualWinnerFirmaId ?? ""}
                    onChange={(e) =>
                      setManualWinnerFirmaId(
                        e.target.value ? Number(e.target.value) : null,
                      )
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

              {/* Resmi Belgeleri Oluştur Checkbox */}
              <label
                className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-blue-50/50 dark:bg-blue-955/10 px-3 py-1.5 rounded-xl border border-blue-200/60 dark:border-blue-900/40 h-9 cursor-pointer select-none"
                title="Eğer işaretlenirse Yaklaşık Maliyet Cetveli ve Fiyat Araştırma Tutanağı dökümanları oluşturulur. İşaretlenmezse sadece girilen teklif verileri kaydedilir."
              >
                <input
                  type="checkbox"
                  checked={belgeleriKaydet}
                  onChange={(e) => setBelgeleriKaydet(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span>Resmi Belgeleri Oluştur (Tutanak & Cetvel)</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Form Content Area */}
      <div
        className={cn(
          "p-6 flex flex-col gap-6 w-full flex-1",
          isFormFullscreen ? "md:p-8" : "",
        )}
      >
        {activeFormTab === "firms" ? (
          /* İSTEKLİ FİRMALARI YÖNETME ALANI */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-6 animate-in fade-in duration-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-855 dark:text-slate-100 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  Sürece Katılan İstekli Firmalar
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Piyasa araştırması kapsamında davet edilen ve teklif formu dolduran firmaları belirleyin.
                </p>
                <div className="mt-2.5 p-3 bg-blue-50/50 dark:bg-blue-955/20 rounded-xl border border-blue-100 dark:border-blue-900/30 text-xs text-blue-700 dark:text-blue-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span>
                    ℹ️ Bu alandaki verileri bir önceki adım olan{" "}
                    <strong>Hazırlık ve İhtiyaç</strong> aşamasında da güncelleyebilirsiniz. Orada yapılan değişiklikler otomatik olarak buraya yansır.
                  </span>
                  <Link
                    to="/dosya/hazirlik-ve-ihtiyac"
                    className="shrink-0 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg transition-all border-0 cursor-pointer text-center"
                  >
                    Hazırlık ve İhtiyaç&apos;a Git
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {!isEditingFirms ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingFirms(true)}
                    className="flex items-center gap-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-4.5 py-2 rounded-xl transition-all h-8 cursor-pointer shadow-xs border-0"
                    title="Firmaları ve teklif formlarını düzenlemek için düzenleme modunu açın."
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    Firmaları Düzenle
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-955 p-1 rounded-2xl border border-slate-100 dark:border-slate-800/80 animate-in fade-in slide-in-from-left-2 duration-300">
                    <button
                      type="button"
                      onClick={() => setIsFirmModalOpen(true)}
                      className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 font-semibold px-4.5 py-2 rounded-xl transition-all h-8 cursor-pointer shadow-xs border-0"
                    >
                      <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      Seç
                    </button>

                    <Link
                      to="/firmalar"
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4.5 py-2 rounded-xl transition-all flex items-center justify-center h-8 cursor-pointer shadow-xs border-0"
                    >
                      <Settings className="w-3.5 h-3.5 text-white/90" />
                      Listeyi Yönet
                    </Link>

                    <button
                      type="button"
                      onClick={() => setIsEditingFirms(false)}
                      className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-200 hover:bg-slate-350 dark:bg-slate-800 dark:hover:bg-slate-700 border-0 cursor-pointer"
                      title="Düzenlemeyi Bitir / Kilitle"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    </button>
                  </div>
                )}
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
        ) : (
          /* TEKLİF VE BİRİM FİYAT GİRİŞ MATRİSİ */
          <div className="animate-in fade-in duration-200">
            {invitedFirms.length > 0 && items.length > 0 ? (
              <TeklifMatrisi
                invitedFirms={invitedFirms}
                items={items}
                bids={bids}
                getEstimatedCostTotal={getEstimatedCostTotal}
                getLowestBidInfo={getLowestBidInfo}
                getAverageBid={getAverageBid}
                handlePriceChange={handlePriceChange}
              />
            ) : invitedFirms.length > 0 && items.length === 0 ? (
              <div className="bg-amber-50 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 text-left flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-amber-800 dark:text-amber-400">
                    İhtiyaç Kalemi Bulunamadı
                  </h4>
                  <p className="text-xs text-amber-600 dark:text-amber-500/90 mt-1">
                    Teklif fiyat giriş tablosunu görüntülemek için bu dosyaya ait ihtiyaç kalemlerinin girilmiş olması gerekir. Lütfen ilgili adımda ihtiyaç listesini tanımlayın.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 text-left flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-amber-800 dark:text-amber-400">
                    Davet Edilen İstekli Firma Yok
                  </h4>
                  <p className="text-xs text-amber-600 dark:text-amber-550 mt-1">
                    Fiyat girişi yapabilmek için lütfen önce{" "}
                    <strong>İstekli Firmalar</strong> sekmesinden en az 1 firma seçin veya ekleyin.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
