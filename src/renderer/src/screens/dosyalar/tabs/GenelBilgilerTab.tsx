import React from "react";
import {
  Building2,
  ChevronDown,
  Copy,
  DollarSign,
  FileText,
  HelpCircle,
  Info,
  Loader2,
  Search,
  Sparkles,
  User,
} from "lucide-react";
import { YeniDosyaTabProps } from "../types";
import { cn } from "../../../../utils/cn";

export function GenelBilgilerTab(props: YeniDosyaTabProps) {
  const {
    formData,
    setFormData,
    isEdit,
    birimler,
    personeller,
    kodSozlugu,
    dosyalar,
    isDescLoading,
    showKonuSuggestions,
    setShowKonuSuggestions,
    exactMatchCount,
    matchedSuggestions,
    handleAiDescGenerate,
    handleCopyKonuToAciklama,
    openTextGenerator,
    showBirimSearch,
    setShowBirimSearch,
    birimSearchQuery,
    setBirimSearchQuery,
    filteredBirimler,
    handleSelectBirim,
    showPersonelSearch,
    setShowPersonelSearch,
    personelSearchQuery,
    setPersonelSearchQuery,
    filteredPersoneller,
  } = props;

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
          <FileText className="text-blue-500 w-5 h-5" />
          <h2 className="text-base font-bold text-slate-800 dark:text-white">
            Genel Bilgiler & İdari Antet Yapısı
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2 relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-450">
                İhale / Dosya Konusu (İşin Adı) *
              </label>
              <button
                type="button"
                onClick={() =>
                  openTextGenerator(
                    "konu",
                    "Konuyu AI ile Üret",
                    "İhale Konusu",
                    'Verilen metin veya alım işlemine göre en uygun, resmi ve kısa ihale konusunu (İşin Adı) üret. Başka hiçbir açıklama yazma. KESİNLİKLE metnin içerisine veya sonuna "Doğrudan Temin", "Doğrudan Temini" veya "Doğrudan Temin İşi" gibi ifadeler EKLEME. (Örn: "Bez Bayrak ve Sopalı Bayrak Alımı", "Kırtasiye Malzemesi Alımı" şeklinde bitir).',
                  )}
                className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded border-none"
              >
                <Sparkles size={11} /> AI ile Üret
              </button>
            </div>
            <input
              type="text"
              required
              value={formData.konu || ""}
              onChange={(e) => {
                setFormData({ ...formData, konu: e.target.value });
                setShowKonuSuggestions(true);
              }}
              onFocus={() => setShowKonuSuggestions(true)}
              onBlur={() => {
                setTimeout(
                  () => setShowKonuSuggestions(false),
                  200,
                );
              }}
              placeholder="Alımın konusunu resmi dilde açıklayıcı şekilde girin (Örn: Fen İşleri Kırtasiye Malzemesi Alımı)"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-semibold"
            />
            {exactMatchCount > 0 && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-1.5 flex items-center gap-1 animate-in fade-in duration-200">
                ⚠️ Bu isimde daha önce {exactMatchCount}{" "}
                adet dosya açılmış. Kaydedildiğinde otomatik olarak
                "({exactMatchCount + 1})" son eki eklenecektir.
              </p>
            )}
            {showKonuSuggestions && matchedSuggestions.length > 0 &&
              (
                <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950/50 text-[10px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    {formData.konu
                      ? "Önceki İhale Konuları"
                      : "Sık Kullanılan İhale Konuları"}
                  </div>
                  <ul className="max-h-48 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/50">
                    {matchedSuggestions.map((suggestion, index) => (
                      <li key={index}>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              konu: suggestion,
                            }));
                            setShowKonuSuggestions(false);
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/10 text-xs text-slate-700 dark:text-slate-300 font-semibold transition-colors flex items-center gap-2 cursor-pointer border-none bg-transparent"
                        >
                          <FileText className="text-slate-400 w-3.5 h-3.5" />
                          <span>{suggestion}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-455">
                İşin Açıklaması / Kapsamı
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAiDescGenerate}
                  disabled={isDescLoading}
                  title="İşin adına göre yapay zeka ile profesyonel açıklama metni oluştur"
                  className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded disabled:opacity-50"
                >
                  {isDescLoading
                    ? <Loader2 size={11} className="animate-spin" />
                    : <Sparkles size={11} />}
                  {isDescLoading ? "Üretiliyor..." : "AI ile Üret"}
                </button>
                <button
                  type="button"
                  onClick={handleCopyKonuToAciklama}
                  className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer bg-blue-50 dark:bg-blue-900/10 px-2 py-1 rounded"
                >
                  <Copy size={11} />
                  İşin Adını Kopyala
                </button>
              </div>
            </div>
            <textarea
              rows={3}
              value={formData.isin_aciklamasi || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isin_aciklamasi: e.target.value,
                })}
              placeholder="İşin detaylı açıklaması veya şartnamedeki kapsam açıklaması..."
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-800 dark:text-white leading-normal resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
              Doğrudan Temin Numarası
            </label>
            <input
              type="text"
              value={formData.temin_no || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  temin_no: e.target.value,
                })}
              placeholder="Örn: 2026/5"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
              Dosya Açılış Tarihi
            </label>
            <input
              type="date"
              value={formData.dosya_acilis_tarihi || ""}
              onChange={(e) => {
                const newDate = e.target.value;
                const oldDate = formData.dosya_acilis_tarihi;
                const newYear = newDate
                  ? new Date(newDate).getFullYear()
                  : null;
                const oldYear = oldDate
                  ? new Date(oldDate).getFullYear()
                  : null;

                let updatedTeminNo = formData.temin_no;
                if (newYear && newYear !== oldYear) {
                  const oldYearStr = oldYear ? oldYear.toString() : "";
                  const isOldPattern = !formData.temin_no ||
                    formData.temin_no.startsWith(
                      `${oldYearStr}/`,
                    ) ||
                    formData.temin_no.startsWith(
                      `DT${oldYearStr}/`,
                    );

                  if (isOldPattern) {
                    updatedTeminNo = getNextTeminNo(newYear);
                  }
                }

                setFormData({
                  ...formData,
                  dosya_acilis_tarihi: newDate,
                  butce_yili: newYear || formData.butce_yili,
                  temin_no: updatedTeminNo,
                });
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="relative">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
              İhalesi Yapılacak Birim / Müdürlük
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowBirimSearch(!showBirimSearch)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200 hover:bg-slate-100/50 text-left"
              >
                <span>
                  {formData.birim_id
                    ? birimler.find((b) => b.id === formData.birim_id)
                      ?.birim_adi
                    : "Birim Seçiniz..."}
                </span>
                <Search size={14} className="text-slate-400" />
              </button>

              {showBirimSearch && (
                <div className="absolute left-0 mt-1.5 w-full bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <input
                    type="text"
                    placeholder="Birim ara..."
                    value={birimSearchQuery}
                    onChange={(e) => setBirimSearchQuery(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                    autoFocus
                  />
                  <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-0.5">
                    {filteredBirimler.length === 0
                      ? (
                        <div className="p-3 text-center text-xs text-slate-450">
                          Birim bulunamadı.
                        </div>
                      )
                      : (
                        filteredBirimler.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => handleSelectBirim(b)}
                            className={cn(
                              "w-full text-left p-2 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-colors",
                              formData.birim_id === b.id &&
                                "bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 font-bold",
                            )}
                          >
                            {b.birim_adi}
                          </button>
                        ))
                      )}
                  </div>
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              Birim seçildiğinde antet, sunum makamı ve bütçe kodları otomatik
              doldurulur.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
              İdari Antet Ek Satır
            </label>
            <input
              type="text"
              value={formData.antet_ek_satir || ""}
              onChange={(e) => setFormData({
                ...formData,
                antet_ek_satir: e.target.value,
              })}
              placeholder="Örn: Fen İşleri Dairesi Başkanlığı"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
              Evrakın Sunulacağı Makam
            </label>
            <input
              type="text"
              value={formData.sunulacak_makam || ""}
              onChange={(e) => setFormData({
                ...formData,
                sunulacak_makam: e.target.value,
              })}
              placeholder="Örn: BAŞKANLIK MAKAMINA veya MÜDÜRLÜK MAKAMINA"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
              İhtiyaç Yeri
            </label>
            <input
              type="text"
              value={formData.ihtiyac_yeri || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  ihtiyac_yeri: e.target.value,
                })}
              placeholder="Örn: Fen İşleri Şantiyesi"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>
      </div>

      {/* TAB 2: MALİ & BÜTÇE KODLARI (Artık Genel Bilgilerin devamı) */}
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
          <DollarSign className="text-blue-500 w-5 h-5" />
          <h2 className="text-base font-bold text-slate-800 dark:text-white">
            Mali Analiz & Bütçe Harcama Kodları
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
              Bütçe Yılı
            </label>
            <input
              type="number"
              value={formData.butce_yili ||
                new Date().getFullYear()}
              onChange={(e) => {
                const newYear = parseInt(e.target.value, 10);
                const oldYear = formData.butce_yili;
                let updatedTeminNo = formData.temin_no;

                if (newYear && newYear !== oldYear) {
                  const oldYearStr = oldYear ? oldYear.toString() : "";
                  const isOldPattern = !formData.temin_no ||
                    formData.temin_no.startsWith(
                      `${oldYearStr}/`,
                    ) ||
                    formData.temin_no.startsWith(
                      `DT${oldYearStr}/`,
                    );

                  if (isOldPattern) {
                    updatedTeminNo = getNextTeminNo(newYear);
                  }
                }

                setFormData({
                  ...formData,
                  butce_yili: newYear,
                  temin_no: updatedTeminNo,
                });
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
              Bütçe Tipi
            </label>
            <select
              value={formData.butce_tipi || "Genel Bütçe"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  butce_tipi: e.target.value,
                })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            >
              <option value="Genel Bütçe">Genel Bütçe</option>
              <option value="Döner Sermaye">Döner Sermaye</option>
              <option value="Özel Bütçe">Özel Bütçe</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
              Finansman Kodu
            </label>
            <input
              type="text"
              value={formData.finansman_kodu || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  finansman_kodu: e.target.value,
                })}
              placeholder="Örn: 2, 5 veya 8"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="md:col-span-3">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-455">
                Bütçe Kodu / Harcama Tertibi (Ekonomik Kod)
              </label>
              <button
                type="button"
                onClick={() =>
                  openTextGenerator(
                    "butce_kodu",
                    "Bütçe/Ekonomik Kod Tahmini",
                    "Bütçe Kodu",
                    "Alımın konusuna ve türüne göre (Örn: Mal Alımı, Hizmet Alımı) uygun bir kamu maliyesi ekonomik bütçe kodu veya harcama tertibi tahmin et. Sadece kodu yaz. (Örn: 03.2.1.01 veya 46.30.11.23-01.3.9.00-5-03.2.1.01)",
                  )}
                className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded border-none"
              >
                <Sparkles size={11} /> AI ile Tahmin Et
              </button>
            </div>
            <input
              type="text"
              value={formData.butce_kodu || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  butce_kodu: e.target.value,
                })}
              placeholder="Örn: 46.30.11.23-01.3.9.00-5-03.2.1.01"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-850 dark:text-slate-200 font-mono font-bold"
            />
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-4">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Mevzuat ve Sistem Parametreleri
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
                Kurumsal Kod (Düzey 1-2-3-4)
              </label>
              <select
                value={formData.e_butce || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    e_butce: e.target.value,
                  })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl py-2 px-3 focus:outline-none text-slate-800 dark:text-slate-200"
              >
                <option value="">Seçiniz...</option>
                {kodSozlugu
                  .filter((k) => k.tur === "kurumsal")
                  .map((k) => (
                    <option key={k.id} value={k.kod}>
                      {k.kod} - {k.aciklama}
                    </option>
                  ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Eksik kodları{" "}
                <Link
                  to="/mevzuat"
                  className="text-blue-600 underline font-semibold"
                >
                  Mevzuat & Kodlar
                </Link>{" "}
                ekranından ekleyebilirsiniz.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
                Fonksiyonel Kod (Düzey 1-2-3-4)
              </label>
              <select
                value={formData.fonksiyonel_kod || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fonksiyonel_kod: e.target.value,
                  })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl py-2 px-3 focus:outline-none text-slate-800 dark:text-slate-200"
              >
                <option value="">Seçiniz...</option>
                {kodSozlugu
                  .filter((k) => k.tur === "fonksiyonel")
                  .map((k) => (
                    <option key={k.id} value={k.kod}>
                      {k.kod} - {k.aciklama}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
                Muhasebe Birimi (Birim Kodu & Adı)
              </label>
              <select
                value={formData.muhasebe_birimi || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    muhasebe_birimi: e.target.value,
                  })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl py-2 px-3 focus:outline-none text-slate-800 dark:text-slate-200"
              >
                <option value="">Seçiniz...</option>
                {kodSozlugu
                  .filter((k) => k.tur === "muhasebe_birimi")
                  .map((k) => (
                    <option key={k.id} value={k.kod}>
                      {k.kod} - {k.aciklama}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
                Harcama Birimi (Birim Kodu & Adı)
              </label>
              <select
                value={formData.harcama_birimi || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    harcama_birimi: e.target.value,
                  })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl py-2 px-3 focus:outline-none text-slate-800 dark:text-slate-200"
              >
                <option value="">Seçiniz...</option>
                {kodSozlugu
                  .filter((k) => k.tur === "harcama_birimi")
                  .map((k) => (
                    <option key={k.id} value={k.kod}>
                      {k.kod} - {k.aciklama}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* TAB 3: İHALE, TEKLİF & HESAPLAMA (Artık Genel Bilgilerin devamı) */}
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
              onChange={(e) =>
                setFormData({ ...formData, tur: e.target.value })}
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
                title={getIhaleSekliExplanation(
                  formData.ihale_sekli,
                )}
              >
                <HelpCircle
                  size={13}
                  className="text-slate-450 cursor-help"
                />
              </span>
            </label>
            <select
              title="Doğrudan Temin Maddesi Seçin"
              value={formData.ihale_sekli ||
                (limitType === "buyuksehir" ? "22/d*" : "22/d**")}
              onChange={(e) => setFormData({
                ...formData,
                ihale_sekli: e.target.value,
              })}
              className="w-full px-3.5 py-2.5 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            >
              {limitType === "buyuksehir"
                ? <option value="22/d*">22/d* (Büyükşehir)</option>
                : (
                  <option value="22/d**">
                    22/d** (Diğer İdareler)
                  </option>
                )}
              <option value="22/a">22/a (Tek Yetkili)</option>
              <option value="22/b">22/b (Özel Hak)</option>
              <option value="22/c">22/c (Uyum Alımı)</option>
            </select>
            {formData.ihale_sekli?.startsWith("22/d") && (
              <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1 font-medium bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded-lg border border-blue-100 dark:border-blue-800/50">
                <Info className="w-3 h-3 inline-block mr-1 mb-0.5" />
                22/d limiti, kurum ayarlarındaki "Kamu İhale Mevzuatı Limit
                Tipi" (
                {limitType === "buyuksehir" ? "Büyükşehir" : "Diğer İdareler"})
                ayarına göre otomatik seçilmiştir.
              </p>
            )}
            {!formData.ihale_sekli?.startsWith("22/d") && (
              <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-1 leading-normal">
                {getIhaleSekliExplanation(formData.ihale_sekli)}
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
              <option value="Birim Fiyat">
                Birim Fiyatlı Teklif
              </option>
              <option value="Götürü Bedel">
                Götürü Bedel Teklif
              </option>
              <option value="Sözleşmesiz">
                Sözleşme Yapılmayacak
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
              KDV Oranı (%)
            </label>
            <select
              value={formData.kdv || "20"}
              onChange={(e) =>
                setFormData({ ...formData, kdv: e.target.value })}
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
              onChange={(e) => setFormData({
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
                  Kanun 22/d KİK limitini (₺{currentLimit?.toLocaleString(
                    "tr-TR",
                  )}) aşmaktadır!
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
              Yaklaşık Maliyet Hesaplama Esası
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

      {/* TAB 4: SORUMLULAR, TARİH & KOMİSYON (Artık Genel Bilgilerin devamı) */}
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
          <User className="text-blue-500 w-5 h-5" />
          <h2 className="text-base font-bold text-slate-800 dark:text-white">
            Yetkililer, Süreç Tarihleri ve İdari Kayıtlar
          </h2>
        </div>

        <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 p-4 rounded-xl text-xs text-blue-700 dark:text-blue-300">
          <Info className="w-5 h-5 shrink-0 text-blue-500 dark:text-blue-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">
              Yetkili Personel & Tarih Bilgilendirmesi
            </p>
            <p className="leading-relaxed opacity-90">
              Doğrudan temin evraklarının alt bilgileri, onay ve imza
              alanlarında yer alacak personelleri (İrtibat Yetkilisi, Dosyayı
              Hazırlayan, Talep Eden, Sunan ve Onaylayan) buradan
              belirleyebilirsiniz. Ayrıca talebe ait resmî evrak numarası,
              teklif alma ve teslim tarihlerini girerek şablonların otomatik
              dolmasını sağlayabilirsiniz.
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 italic mt-2 block">
              * Not: Bu alanlar üzerinde ilerleyen süreçlerde daha da
              sadeleştirme ve otomatik tamamlama iyileştirmeleri yapılabilir.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* İRTİBAT YETKİLİSİ AUTOCOMPLETE */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
              İrtibat Yetkilisi (Personel)
            </label>
            <button
              type="button"
              onClick={() => setShowPersonelSearch(
                showPersonelSearch === "irtibat" ? null : "irtibat",
              )}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200 text-left"
            >
              <span>
                {formData.irtibat_yetkilisi_id
                  ? personeller.find((p) =>
                    p.id === formData.irtibat_yetkilisi_id
                  )
                    ?.ad_soyad
                  : "İrtibat Personeli Seçin..."}
              </span>
              <Search size={14} className="text-slate-400" />
            </button>

            {showPersonelSearch === "irtibat" && (
              <div className="absolute left-0 mt-1.5 w-full bg-white dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <input
                  type="text"
                  placeholder="Personel ara..."
                  value={personelSearchQuery}
                  onChange={(e) => setPersonelSearchQuery(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                  autoFocus
                />
                <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-0.5">
                  {filteredPersoneller.length === 0
                    ? (
                      <div className="p-3 text-center text-xs text-slate-450">
                        Personel bulunamadı.
                      </div>
                    )
                    : (
                      filteredPersoneller.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              irtibat_yetkilisi_id: p.id,
                            }));
                            setShowPersonelSearch(null);
                            setPersonelSearchQuery("");
                          }}
                          className="w-full text-left p-2 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                        >
                          {p.ad_soyad} -{" "}
                          <span className="text-[10px] text-slate-400">
                            {p.unvan || "Unvansız"}
                          </span>
                        </button>
                      ))
                    )}
                </div>
              </div>
            )}
          </div>

          {/* HAZIRLAYAN PERSONEL */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
              Dosyayı Hazırlayan Personel
            </label>
            <button
              type="button"
              onClick={() => setShowPersonelSearch(
                showPersonelSearch === "hazirlayan" ? null : "hazirlayan",
              )}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200 text-left"
            >
              <span>
                {formData.hazirlayan_personel_id
                  ? personeller.find((p) =>
                    p.id === formData.hazirlayan_personel_id
                  )
                    ?.ad_soyad
                  : "Hazırlayan Seçin..."}
              </span>
              <Search size={14} className="text-slate-400" />
            </button>

            {showPersonelSearch === "hazirlayan" && (
              <div className="absolute left-0 mt-1.5 w-full bg-white dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50">
                <input
                  type="text"
                  placeholder="Personel ara..."
                  value={personelSearchQuery}
                  onChange={(e) => setPersonelSearchQuery(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                  autoFocus
                />
                <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-0.5">
                  {filteredPersoneller.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          hazirlayan_personel_id: p.id,
                        }));
                        setShowPersonelSearch(null);
                        setPersonelSearchQuery("");
                      }}
                      className="w-full text-left p-2 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    >
                      {p.ad_soyad}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* TALEP EDEN PERSONEL */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
              Talep Eden Personel
            </label>
            <button
              type="button"
              onClick={() =>
                setShowPersonelSearch(
                  showPersonelSearch === "talep_eden" ? null : "talep_eden",
                )}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200 text-left"
            >
              <span>
                {formData.talep_eden_personel_id
                  ? personeller.find((p) =>
                    p.id === formData.talep_eden_personel_id
                  )
                    ?.ad_soyad
                  : "Talep Edeni Seçin..."}
              </span>
              <Search size={14} className="text-slate-400" />
            </button>

            {showPersonelSearch === "talep_eden" && (
              <div className="absolute left-0 mt-1.5 w-full bg-white dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50">
                <input
                  type="text"
                  placeholder="Personel ara..."
                  value={personelSearchQuery}
                  onChange={(e) => setPersonelSearchQuery(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                  autoFocus
                />
                <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-0.5">
                  {filteredPersoneller.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          talep_eden_personel_id: p.id,
                        }));
                        setShowPersonelSearch(null);
                        setPersonelSearchQuery("");
                      }}
                      className="w-full text-left p-2 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    >
                      {p.ad_soyad}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SUNAN PERSONEL */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
              Sunan Personel
            </label>
            <button
              type="button"
              onClick={() =>
                setShowPersonelSearch(
                  showPersonelSearch === "sunan" ? null : "sunan",
                )}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200 text-left"
            >
              <span>
                {formData.sunan_personel_id
                  ? personeller.find((p) => p.id === formData.sunan_personel_id)
                    ?.ad_soyad
                  : "Sunan Kişiyi Seçin..."}
              </span>
              <Search size={14} className="text-slate-400" />
            </button>

            {showPersonelSearch === "sunan" && (
              <div className="absolute left-0 mt-1.5 w-full bg-white dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50">
                <input
                  type="text"
                  placeholder="Personel ara..."
                  value={personelSearchQuery}
                  onChange={(e) => setPersonelSearchQuery(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                  autoFocus
                />
                <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-0.5">
                  {filteredPersoneller.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          sunan_personel_id: p.id,
                        }));
                        setShowPersonelSearch(null);
                        setPersonelSearchQuery("");
                      }}
                      className="w-full text-left p-2 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    >
                      {p.ad_soyad}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* HARCAMA YETKİLİSİ (ONAY VEREN) */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
              Harcama Yetkilisi (Onaylayan)
            </label>
            <button
              type="button"
              onClick={() =>
                setShowPersonelSearch(
                  showPersonelSearch === "onay" ? null : "onay",
                )}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200 text-left"
            >
              <span>
                {formData.onay_personel_id
                  ? personeller.find((p) => p.id === formData.onay_personel_id)
                    ?.ad_soyad
                  : "Harcama Yetkilisi Seçin..."}
              </span>
              <Search size={14} className="text-slate-400" />
            </button>

            {showPersonelSearch === "onay" && (
              <div className="absolute left-0 mt-1.5 w-full bg-white dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50">
                <input
                  type="text"
                  placeholder="Personel ara..."
                  value={personelSearchQuery}
                  onChange={(e) => setPersonelSearchQuery(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                  autoFocus
                />
                <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-0.5">
                  {filteredPersoneller.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          onay_personel_id: p.id,
                        }));
                        setShowPersonelSearch(null);
                        setPersonelSearchQuery("");
                      }}
                      className="w-full text-left p-2 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    >
                      {p.ad_soyad} {p.harcama_yetkilisi_mi === 1 && "★"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
              Son Teklif Verme Tarih &amp; Saati
            </label>
            <input
              type="datetime-local"
              value={formData.son_teklif_verme_tarihi || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  son_teklif_verme_tarihi: e.target.value,
                })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
              Tahmini İşi Bitiş / Teslim Tarihi
            </label>
            <input
              type="date"
              value={formData.teslim_tarihi || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  teslim_tarihi: e.target.value,
                })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>
      </div>
    </>
  );
}
