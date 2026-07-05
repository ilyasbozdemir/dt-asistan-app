import React from "react";
import { Building2, HelpCircle, Info } from "lucide-react";
import { cn } from "../../../../../utils/cn";
import { YeniDosyaTabProps } from "../../../types";

export function IhaleVeTeklifFinansalSection(
  props: YeniDosyaTabProps,
): React.JSX.Element {
  const {
    formData,
    setFormData,
    limitType,
    currentLimit,
    isLimitExceeded,
    getIhaleSekliExplanation,
  } = props;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
        <Building2 className="text-indigo-500 w-5 h-5" />
        <h2 className="text-base font-bold text-slate-800 dark:text-white">
          İhale Koşulları, Teklif ve Finansal Detaylar
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
            İhale Tipi
          </label>
          <input
            type="text"
            disabled
            value={formData.ihale_tipi || "Doğrudan Temin"}
            className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
            Alım / İhale Türü
          </label>
          <select
            value={formData.tur || "mal"}
            onChange={(e) => setFormData({ ...formData, tur: e.target.value })}
            title="Alım / İhale Türü"
            className="w-full px-3.5 py-2.5 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          >
            <option value="mal">Mal Alımı</option>
            <option value="hizmet">Hizmet Alımı</option>
            <option value="yapim_isi">Yapım İşi</option>
            <option value="danismanlik">Danışmanlık Alımı</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5 flex items-center gap-1">
            Doğrudan Temin Maddesi (İhale Şekli)
            <span
              title={getIhaleSekliExplanation?.(
                formData.ihale_sekli ?? undefined,
              ) || ""}
            >
              <HelpCircle size={13} className="text-slate-450 cursor-help" />
            </span>
          </label>
          <select
            title="Doğrudan Temin Maddesi Seçin"
            value={formData.ihale_sekli ||
              (limitType === "buyuksehir" ? "22/d*" : "22/d**")}
            onChange={(e) =>
              setFormData({
                ...formData,
                ihale_sekli: e.target.value,
              })}
            className="w-full px-3.5 py-2.5 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          >
            {limitType === "buyuksehir"
              ? <option value="22/d*">22/d* (Büyükşehir)</option>
              : <option value="22/d**">22/d** (Diğer İdareler)</option>}
            <option value="22/a">22/a (Tek Yetkili)</option>
            <option value="22/b">22/b (Özel Hak)</option>
            <option value="22/c">22/c (Uyum Alımı)</option>
          </select>
          {formData.ihale_sekli?.startsWith("22/d") && (
            <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1 font-medium bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded-lg border border-blue-100 dark:border-blue-800/50">
              <Info className="w-3 h-3 inline-block mr-1 mb-0.5" />
              22/d limiti, kurum ayarlarındaki "Kamu İhale Mevzuatı Limit Tipi"
              (
              {limitType === "buyuksehir" ? "Büyükşehir" : "Diğer İdareler"})
              ayarına göre otomatik seçilmiştir.
            </p>
          )}
          {!formData.ihale_sekli?.startsWith("22/d") && (
            <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-1 leading-normal">
              {getIhaleSekliExplanation?.(formData.ihale_sekli ?? undefined)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
            Teklif / Sözleşme Türü
          </label>
          <select
            value={formData.teklif_sozlesme_turu || "Birim Fiyat"}
            onChange={(e) =>
              setFormData({
                ...formData,
                teklif_sozlesme_turu: e.target.value,
              })}
            className="w-full px-3.5 py-2.5 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          >
            <option value="Birim Fiyat">Birim Fiyatlı Teklif</option>
            <option value="Götürü Bedel">Götürü Bedel Teklif</option>
            <option value="Sözleşmesiz">Sözleşme Yapılmayacak</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
            KDV Oranı (%)
          </label>
          <select
            value={formData.kdv || "20"}
            onChange={(e) => setFormData({ ...formData, kdv: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          >
            <option value="0">KDV Hariç (%0)</option>
            <option value="1">KDV (%1)</option>
            <option value="10">KDV (%10)</option>
            <option value="20">KDV (%20)</option>
            <option value="Tevkifat">Tevkifatlı KDV</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-450">
              Tahmini Yaklaşık Maliyet (KDV Hariç ₺)
            </label>
            {currentLimit && (
              <span className="text-[10px] text-slate-400">
                (Limit: ₺ {currentLimit.toLocaleString("tr-TR")})
              </span>
            )}
          </div>

          <input
            type="number"
            step="0.01"
            value={formData.yaklasik_maliyet || 0}
            onChange={(e) =>
              setFormData({
                ...formData,
                yaklasik_maliyet: parseFloat(e.target.value) || 0,
              })}
            placeholder="₺ 0.00"
            className={cn(
              "w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border rounded-xl text-xs focus:outline-none focus:ring-1 font-bold",
              isLimitExceeded
                ? "border-red-500 focus:ring-red-500 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20"
                : "border-slate-200 dark:border-slate-800 focus:ring-blue-500 text-slate-800 dark:text-slate-200",
            )}
          />
          {isLimitExceeded && (
            <p className="mt-2 text-xs font-semibold text-red-500 flex items-start gap-1">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                DİKKAT: Girdiğiniz tutar, seçili bütçe yılındaki 4734 Sayılı
                Kanun 22/d KİK limitini (₺
                {currentLimit?.toLocaleString("tr-TR")}) aşmaktadır!
              </span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
            Fiyat Farkı Dayanağı (Varsa)
          </label>
          <input
            type="text"
            value={formData.fiyat_farki_dayanagi || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                fiyat_farki_dayanagi: e.target.value,
              })}
            placeholder="Örn: 2026/123 Fiyat Farkı Kararnamesi"
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
            Yatırım Proje Numarası
          </label>
          <input
            type="text"
            value={formData.yatirim_proje_no || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                yatirim_proje_no: e.target.value,
              })}
            placeholder="Örn: 2026-03-Y-12"
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
            Hesaplama Yöntemi / Dayanağı
          </label>
          <input
            type="text"
            value={formData.yaklasik_maliyet_hesaplamasi || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                yaklasik_maliyet_hesaplamasi: e.target.value,
              })}
            placeholder="Örn: Piyasa Fiyat Araştırması"
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
            Hesaplama Esası
          </label>
          <select
            value={formData.hesaplama_esasi || "En Düşük fiyat esasına göre"}
            onChange={(e) =>
              setFormData({
                ...formData,
                hesaplama_esasi: e.target.value,
              })}
            className="w-full px-3.5 py-2.5 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          >
            <option value="En Düşük fiyat esasına göre">En Düşük fiyat esasına göre</option>
            <option value="Ortalama fiyat esasına göre">Ortalama fiyat esasına göre</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-55 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="alt_yuklenici"
            checked={formData.alt_yuklenici_olacak_mi === 1}
            onChange={(e) =>
              setFormData({
                ...formData,
                alt_yuklenici_olacak_mi: e.target.checked ? 1 : 0,
              })}
            className="w-4 h-4 text-blue-600 border-slate-350 dark:border-slate-800 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="alt_yuklenici"
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Alt Yüklenici Olabilir
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="kismi_teklif"
            checked={formData.kismi_teklif_verilecek_mi === 1}
            onChange={(e) =>
              setFormData({
                ...formData,
                kismi_teklif_verilecek_mi: e.target.checked ? 1 : 0,
              })}
            className="w-4 h-4 text-blue-600 border-slate-350 dark:border-slate-800 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="kismi_teklif"
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Kısmi Teklife Açık
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="avans"
            checked={formData.avans_verilecek_mi === 1}
            onChange={(e) =>
              setFormData({
                ...formData,
                avans_verilecek_mi: e.target.checked ? 1 : 0,
              })}
            className="w-4 h-4 text-blue-600 border-slate-350 dark:border-slate-800 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="avans"
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Avans Ödemesi Var
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="tibbi_cihaz"
            checked={formData.tibbi_cihaz_alimi_mi === 1}
            onChange={(e) =>
              setFormData({
                ...formData,
                tibbi_cihaz_alimi_mi: e.target.checked ? 1 : 0,
              })}
            className="w-4 h-4 text-blue-600 border-slate-350 dark:border-slate-800 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="tibbi_cihaz"
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Tıbbi Cihaz Alımı
          </label>
        </div>
      </div>
    </div>
  );
}
