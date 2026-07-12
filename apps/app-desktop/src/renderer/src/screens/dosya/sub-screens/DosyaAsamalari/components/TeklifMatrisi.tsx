import React from "react";
import { Award, Coins, TrendingUp } from "lucide-react";

interface BiddingFirm {
  id: number;
  unvan: string;
  teklif_toplami?: number;
  para_birimi?: string;
}

interface BiddingKalem {
  id: number;
  kalem_adi: string;
  miktar: number;
  birim: string;
}

interface TeklifMatrisiProps {
  invitedFirms: BiddingFirm[];
  items: BiddingKalem[];
  bids: Record<string, number>;
  getEstimatedCostTotal: () => number;
  getLowestBidInfo: (
    kalemId: number,
  ) => { price: number; firmaId: number | null };
  getAverageBid: (kalemId: number) => number;
  handlePriceChange: (
    kalemId: number,
    firmaId: number,
    val: string,
  ) => Promise<void>;
  handleSaveToDosya: () => Promise<void>;
  hesaplamaEsasi: string;
  teminTarihi: string;
  setTeminTarihi: (val: string) => void;
}

export const TeklifMatrisi: React.FC<TeklifMatrisiProps> = ({
  invitedFirms,
  items,
  bids,
  getEstimatedCostTotal,
  getLowestBidInfo,
  getAverageBid,
  handlePriceChange,
  handleSaveToDosya,
  hesaplamaEsasi,
  teminTarihi,
  setTeminTarihi,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="text-left">
          <h3 className="text-lg font-bold text-slate-855 dark:text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            Teklif Giriş Matrisi & Karşılaştırma
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Her firma için malzeme birim fiyatlarını girin. En uygun teklifler
            yeşil renkle vurgulanır ve yaklaşık maliyet otomatik hesaplanır.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 h-10">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Yöntem: {hesaplamaEsasi}</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-350 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 h-10">
            <span className="font-bold text-slate-450 dark:text-slate-500">
              Tutanak Tarihi:
            </span>
            <input
              type="date"
              value={teminTarihi}
              onChange={(e) => setTeminTarihi(e.target.value)}
              className="bg-transparent border-none text-xs font-extrabold focus:outline-none cursor-pointer text-slate-800 dark:text-slate-200"
            />
          </div>

          {getEstimatedCostTotal() > 0 && (
            <button
              onClick={handleSaveToDosya}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer h-10"
            >
              <TrendingUp className="w-4 h-4" />
              Maliyeti Dosyaya Kaydet
            </button>
          )}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 dark:bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 h-10">
            <Coins className="w-4 h-4 text-emerald-500" />
            <span>Para Birimi: TL</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto w-full border border-slate-150 dark:border-slate-850 rounded-xl shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-250 dark:border-slate-800">
              <th className="p-3.5 font-bold text-slate-700 dark:text-slate-300 w-48">
                Malzeme/Hizmet Adı
              </th>
              <th className="p-3.5 font-bold text-slate-700 dark:text-slate-300 text-center w-24">
                Miktar / Birim
              </th>
              {invitedFirms.map((firma) => (
                <th
                  key={firma.id}
                  className="p-3.5 font-bold text-slate-700 dark:text-slate-300 text-right min-w-[130px]"
                >
                  <div
                    className="truncate w-32 ml-auto text-right"
                    title={firma.unvan}
                  >
                    {firma.unvan}
                  </div>
                </th>
              ))}
              <th className="p-3.5 font-bold text-slate-700 dark:text-slate-300 text-right w-32 bg-slate-100/30 dark:bg-slate-950/20">
                Ort. (Yaklaşık)
              </th>
              <th className="p-3.5 font-bold text-slate-700 dark:text-slate-300 text-right w-32 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.01]">
                En Düşük
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-105 dark:divide-slate-855">
            {items.map((kalem) => {
              const lowest = getLowestBidInfo(kalem.id);
              const avgPrice = getAverageBid(kalem.id);

              return (
                <tr
                  key={kalem.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors"
                >
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                    {kalem.kalem_adi}
                  </td>
                  <td className="p-3 text-center text-slate-500">
                    {kalem.miktar} {kalem.birim}
                  </td>
                  {invitedFirms.map((firma) => {
                    const val = bids[`${kalem.id}_${firma.id}`] || 0;
                    const isLowest = lowest.price > 0 &&
                      lowest.firmaId === firma.id;

                    return (
                      <td
                        key={firma.id}
                        className={`p-2 text-right transition-colors ${
                          isLowest ? "bg-emerald-500/[0.04]" : ""
                        }`}
                      >
                        <div className="relative flex items-center w-28 ml-auto">
                          <span className="absolute left-2.5 text-[10px] font-bold text-slate-400 select-none">
                            ₺
                          </span>
                          <input
                            title="Fiyat Gir"
                            type="number"
                            step="any"
                            value={val === 0 ? "" : val}
                            placeholder="0.00"
                            onChange={(e) =>
                              handlePriceChange(
                                kalem.id,
                                firma.id,
                                e.target.value,
                              )}
                            className={`w-full text-right text-xs rounded-lg border ${
                              isLowest
                                ? "border-emerald-400 dark:border-emerald-600 bg-emerald-50/30 focus:ring-emerald-500 focus:border-emerald-500 font-semibold text-emerald-700 dark:text-emerald-400"
                                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:ring-primary focus:border-primary"
                            } pl-6 pr-2.5 py-1.5 focus:outline-none focus:ring-2 transition-all`}
                          />
                        </div>
                      </td>
                    );
                  })}
                  <td className="p-3 text-right font-bold text-slate-700 dark:text-slate-300 bg-slate-100/10 dark:bg-slate-950/10">
                    {avgPrice > 0
                      ? `${
                        avgPrice.toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      } ₺`
                      : "-"}
                  </td>
                  <td className="p-3 text-right font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.005]">
                    <div className="flex items-center justify-end gap-1">
                      {lowest.price > 0 && (
                        <Award className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                      <span>
                        {lowest.price > 0
                          ? `${
                            lowest.price.toLocaleString("tr-TR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          } ₺`
                          : "-"}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
            {/* TOPLAM TEKLİFLER SATIRI */}
            <tr className="bg-slate-50/80 dark:bg-slate-950/40 font-bold border-t border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-100">
              <td className="p-3.5">Toplam Teklif Tutarı</td>
              <td className="p-3.5"></td>
              {invitedFirms.map((firma) => (
                <td
                  key={firma.id}
                  className="p-3.5 text-right text-sm font-extrabold text-slate-900 dark:text-slate-100"
                >
                  {firma.teklif_toplami
                    ? `${
                      firma.teklif_toplami.toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    } ₺`
                    : "0.00 ₺"}
                </td>
              ))}
              <td className="p-3.5 bg-slate-100/10 dark:bg-slate-950/10 text-right font-extrabold text-slate-900 dark:text-slate-100">
                {getEstimatedCostTotal() > 0
                  ? `${
                    getEstimatedCostTotal().toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  } ₺`
                  : "-"}
              </td>
              <td className="p-3.5 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.005]">
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
