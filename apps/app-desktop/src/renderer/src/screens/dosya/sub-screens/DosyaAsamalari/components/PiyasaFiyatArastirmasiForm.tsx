import React from "react";
import {
  ArrowLeft,
  Award,
  Calendar,
  Check,
  FileSpreadsheet,
  FileText,
  Save,
} from "lucide-react";
import { cn } from "../../../../../utils/cn";
import { PiyasaFiyatArastirmasiMatrixTab } from "./PiyasaFiyatArastirmasiMatrixTab";

interface PiyasaFiyatArastirmasiFormProps {
  isFormFullscreen?: boolean;
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
  handlePriceChange: (
    kalemId: number,
    teminFirmaId: number,
    priceStr: string,
  ) => Promise<void>;
  handleSaveToDosya: (docType?: "maliyet" | "tutanak" | "save_only") => void;
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
  formMode: "maliyet" | "tutanak";
  isEditingFirms: boolean;
  setIsEditingFirms: (val: boolean) => void;
  setIsFirmModalOpen: (val: boolean) => void;
  lowestTotalFirmaId: number | null;
  handleRemoveFirm: (id: number) => void;
}

export function PiyasaFiyatArastirmasiForm({
  isFormFullscreen,
  setIsFormOpen,
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
  setLowestFirmAsWinner,
  setSetLowestFirmAsWinner,
  manualWinnerFirmaId,
  setManualWinnerFirmaId,
}: PiyasaFiyatArastirmasiFormProps): React.JSX.Element {
  const estimatedCostTotal = getEstimatedCostTotal();

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
          isFormFullscreen ? "sticky top-0 z-50 shadow-xs" : "",
        )}
      >
        {/* Top Row: Title, Summary & Main Action Buttons */}
        <div className="p-4 md:px-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-2xs border border-slate-200 dark:border-slate-700 shrink-0"
              title="Geri Dön / Kapat"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-left">
              <h3 className="text-base font-black text-slate-850 dark:text-slate-100 flex items-center gap-2 leading-none">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0">
                </span>
                Teklif & Fiyat Giriş Paneli
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                <span>
                  Yöntem:{" "}
                  <strong className="text-slate-700 dark:text-slate-300">
                    {hesaplamaEsasi}
                  </strong>
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span>
                  Yaklaşık Maliyet:{" "}
                  <strong className="font-mono text-emerald-600 dark:text-emerald-400">
                    ₺{" "}
                    {estimatedCostTotal.toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </span>
              </p>
            </div>
          </div>

          {/* Action Buttons: Direct Document Generation */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end flex-wrap sm:flex-nowrap shrink-0">
            <button
              type="button"
              onClick={() => handleSaveToDosya("save_only")}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200/80 dark:border-slate-700 h-10 shrink-0"
              title="Yalnızca veritabanındaki teklifleri kaydeder"
            >
              <Save className="w-4 h-4 text-slate-500" />
              <span>Sadece Fiyatları Kaydet</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveToDosya("maliyet")}
              className="px-4 py-2 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer h-10 shrink-0 border-0"
              title="Yaklaşık Maliyet Cetveli resmi belgesini üretir ve önizlemesini açar"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
              <span>Yaklaşık Maliyet Cetveli Üret</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveToDosya("tutanak")}
              className="px-4 py-2 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2 cursor-pointer h-10 shrink-0 border-0"
              title="Piyasa Fiyat Araştırma Tutanağı resmi belgesini üretir ve önizlemesini açar"
            >
              <FileText className="w-4 h-4 text-indigo-100" />
              <span>Piyasa Araştırma Tutanağı Üret</span>
            </button>
          </div>
        </div>

        {/* Sub Settings Bar: Dates & Winner Selection Settings */}
        <div className="bg-slate-50/80 dark:bg-slate-900/60 p-3 px-4 md:px-8 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-100 dark:border-slate-800/40">
          {/* Dates Group */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs h-9">
              <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Maliyet Cetveli Tarihi:
              </span>
              <input
                type="date"
                value={maliyetCetveliTarihi}
                onChange={(e) => setMaliyetCetveliTarihi(e.target.value)}
                className="bg-transparent border-none text-xs font-extrabold focus:outline-none cursor-pointer text-slate-800 dark:text-slate-100 w-28"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs h-9">
              <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Tutanak Tarihi:
              </span>
              <input
                type="date"
                value={tutanakTarihi}
                onChange={(e) => setTutanakTarihi(e.target.value)}
                className="bg-transparent border-none text-xs font-extrabold focus:outline-none cursor-pointer text-slate-800 dark:text-slate-100 w-28"
              />
            </div>
          </div>

          {/* Winner Firm Settings */}
          <div className="flex flex-wrap items-center gap-2.5">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs h-9 cursor-pointer select-none hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
              <input
                type="checkbox"
                checked={setLowestFirmAsWinner}
                onChange={(e) => setSetLowestFirmAsWinner(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer accent-indigo-600"
              />
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500 shrink-0" />
                <span>En Düşük Teklifi Kazanan Yap</span>
              </span>
            </label>

            {!setLowestFirmAsWinner && invitedFirms.length > 0 && (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-300/60 dark:border-amber-900/60 h-9">
                <span className="text-amber-700 dark:text-amber-400 shrink-0 font-semibold">
                  Kazanan Firma:
                </span>
                <select
                  value={manualWinnerFirmaId ?? ""}
                  onChange={(e) =>
                    setManualWinnerFirmaId(
                      e.target.value ? Number(e.target.value) : null,
                    )}
                  className="bg-transparent border-none text-xs font-extrabold focus:outline-none cursor-pointer text-slate-800 dark:text-slate-200 max-w-45 truncate"
                >
                  <option value="">-- Firma Seç --</option>
                  {invitedFirms.map((f, idx) => (
                    <option
                      key={`winner_firm_${f.id || f.firma_id}_${idx}`}
                      value={f.firma_id}
                    >
                      {f.unvan}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Content Area */}
      <div
        className={cn(
          "p-6 flex flex-col gap-6 w-full flex-1",
          isFormFullscreen ? "md:p-8" : "",
        )}
      >
        <PiyasaFiyatArastirmasiMatrixTab
          invitedFirms={invitedFirms}
          items={items}
          bids={bids}
          getEstimatedCostTotal={getEstimatedCostTotal}
          getLowestBidInfo={getLowestBidInfo}
          getAverageBid={getAverageBid}
          handlePriceChange={handlePriceChange}
        />
      </div>
    </div>
  );
}
