import { AlertCircle, Building2, CheckCircle2, X } from "lucide-react";
import React from "react";

interface BiddingFirm {
  id: number;
  unvan: string;
  vergi_no?: string;
  teklif_toplami?: number;
  para_birimi?: string;
}

interface DavetEdilenFirmalarProps {
  invitedFirms: BiddingFirm[];
  lowestTotalFirmaId: number | null;
  isEditing?: boolean;
  onRemoveFirm?: (teminFirmaId: number) => void;
}

export const DavetEdilenFirmalar: React.FC<DavetEdilenFirmalarProps> = ({
  invitedFirms,
  lowestTotalFirmaId,
  isEditing,
  onRemoveFirm,
}) => {
  if (invitedFirms.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-full">
          <Building2 className="w-6 h-6" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-350">
            Bu dosyaya henüz teklif veren/davet edilen firma eklenmemiş.
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Teklif fiyat giriş matrisini açmak için lütfen yukarıdaki menüden firma ekleyin veya firma havuzunu düzenleyerek havuzu genişletin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {invitedFirms.map((firma) => (
        <div
          key={firma.id}
          className={`p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900 dark:to-slate-955/40 border ${
            lowestTotalFirmaId === firma.id
              ? "border-emerald-500/30 dark:border-emerald-500/20 shadow-emerald-500/5 ring-1 ring-emerald-500/10"
              : "border-slate-200 dark:border-slate-800"
          } rounded-xl flex flex-col justify-between gap-3 shadow-sm hover:shadow-md hover:border-slate-350 dark:hover:border-slate-700 transition-all group relative overflow-hidden text-left`}
        >
          {/* Visual accent top-right */}
          <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-blue-600"></div>

          {isEditing && onRemoveFirm && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFirm(firma.id);
              }}
              className="absolute top-3 right-3 p-1 text-rose-500 hover:text-rose-700 dark:text-rose-450 dark:hover:text-rose-350 bg-rose-50 dark:bg-rose-950/20 rounded-md hover:bg-rose-100 transition-all cursor-pointer z-10"
              title="Firmayı Kaldır"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                lowestTotalFirmaId === firma.id
                  ? "bg-emerald-50 dark:bg-emerald-955/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}
            >
              <Building2 className="w-5 h-5" />
            </div>
            <div className="space-y-1 overflow-hidden pr-6">
              <h4
                className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate group-hover:text-primary transition-colors"
                title={firma.unvan}
              >
                {firma.unvan}
              </h4>
              <p className="text-[10px] text-slate-450 truncate">
                {firma.vergi_no ? `Vergi/TC: ${firma.vergi_no}` : "Vergi No Yok"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-850">
            <div className="space-y-0.5">
              <p className="text-[9px] text-slate-450 font-medium uppercase tracking-wider">
                Teklif Toplamı
              </p>
              <p
                className={`text-xs font-extrabold ${
                  lowestTotalFirmaId === firma.id
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-700 dark:text-slate-300"
                }`}
              >
                {firma.teklif_toplami
                  ? `${firma.teklif_toplami.toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} ${firma.para_birimi || "TL"}`
                  : "Fiyat Girişi Yok"}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Status Badge */}
              {firma.teklif_toplami && firma.teklif_toplami > 0 ? (
                <span
                  className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    lowestTotalFirmaId === firma.id
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  }`}
                >
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  {lowestTotalFirmaId === firma.id ? "En Uygun" : "Girildi"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-2.5 h-2.5" />
                  Bekliyor
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
