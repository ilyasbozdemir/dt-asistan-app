import React from "react";
import {
  ArrowLeft,
  Bot,
  ChevronDown,
  ChevronRight,
  Copy,
  FileText,
  HelpCircle,
  Save,
  Sparkles,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "../../utils/cn";
import { AIFormFillModal } from "../../components/ui/AIFormFillModal";
import { AITextGeneratorModal } from "../../components/ui/AITextGeneratorModal";
import { EskiDosyaKopyalaModal } from "./components/EskiDosyaKopyalaModal";
import { GenelBilgilerTab } from "./tabs/GenelBilgilerTab";
import { IhtiyacListesiTab } from "./tabs/IhtiyacListesiTab";
import { useYeniDosyaScreen } from "./yeni.hooks";

export default function YeniDosyaScreen(): React.JSX.Element {
  const {
    dosyalar,
    donemTanimsizMi,
    isDescLoading,
    showKonuSuggestions,
    setShowKonuSuggestions,
    isEdit,
    editId,
    birimler,
    personeller,
    kodSozlugu,
    loadingDb,
    formData,
    setFormData,
    activeTab,
    setActiveTab,
    showKopyalaModal,
    setShowKopyalaModal,
    showBirimSearch,
    setShowBirimSearch,
    birimSearchQuery,
    setBirimSearchQuery,
    showPersonelSearch,
    setShowPersonelSearch,
    personelSearchQuery,
    setPersonelSearchQuery,
    filteredBirimler,
    filteredPersoneller,
    handleCopyKonuToAciklama,
    showAIModal,
    setShowAIModal,
    showAiMenu,
    setShowAiMenu,
    textGenConfig,
    setTextGenConfig,
    aiKalemConfig,
    setAiKalemConfig,
    openTextGenerator,
    getAIFormContext,
    handleAIApply,
    handleAiDescGenerate,
    handleAiFormValidation,
    handleAiFullFormGenerate,
    handleSelectBirim,
    handleSave,
    handleCopyDosya,
    matchedSuggestions,
    exactMatchCount,
    getNextTeminNo,
  } = useYeniDosyaScreen();

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* HEADER */}
      <div className="flex-none p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dosyalar"
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-850 dark:text-white flex items-center gap-2">
              <FileText className="text-blue-600" size={24} />
              {isEdit
                ? "Doğrudan Temin Dosyası Detaylarını Düzenle"
                : "Yeni Doğrudan Temin Dosyası"}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tüm idari, mali, hukuki ve komisyon alanlarını bu panel üzerinden
              yönetin.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Eski Dosyadan Kopyala Butonu */}
          {!isEdit && (
            <button
              type="button"
              onClick={() => setShowKopyalaModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
              title="Geçmişteki bir alımı seçerek formun %80'ini otomatik doldurun"
            >
              <Copy size={14} />
              Mevcut Dosyalardan Kopyala
            </button>
          )}

          {/* YAPAY ZEKA MENÜSÜ */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAiMenu(!showAiMenu)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Sparkles size={14} />
              Yapay Zeka
              <ChevronDown
                size={14}
                className={cn(
                  "transition-transform",
                  showAiMenu ? "rotate-180" : "",
                )}
              />
              <span className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border border-white/20 shadow-sm animate-pulse">
                BETA
              </span>
            </button>

            {showAiMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-100 overflow-hidden flex flex-col py-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowAiMenu(false);
                    handleAiFormValidation();
                  }}
                  className="px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Bot size={14} className="text-teal-500" />
                  Hata ve Tutarsızlık Kontrolü
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setShowAiMenu(false);
                    handleAiFullFormGenerate();
                  }}
                  className="px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Sparkles size={14} className="text-indigo-500" />
                  Metinden Dosya Üret
                </button>
              </div>
            )}
          </div>

          {import.meta.env.DEV && (
            <button
              type="button"
              onClick={() => {
                const currentYear = new Date().getFullYear();
                setFormData({
                  temin_no: getNextTeminNo(currentYear),
                  dosya_acilis_tarihi: `${currentYear}-06-03`,
                  butce_yili: currentYear,
                  butce_tipi: "Genel Bütçe",
                  konu:
                    "Park Bahçeler Müdürlüğü Elektrik Kablosu ve Aydınlatma Armatürü Alımı",
                  isin_aciklamasi:
                    "X Belediyesi Park Bahçeler Müdürlüğü tarafından yeşil alanlar ve çocuk oyun parklarının aydınlatılmasında kullanılmak üzere elektrik kablosu ve aydınlatma armatürü alımı işi.",
                  birim_id: birimler[0]?.id || null,
                  antet_ek_satir: "Fen İşleri Dairesi Başkanlığı",
                  sunulacak_makam: "BAŞKANLIK MAKAMINA",
                  ihtiyac_yeri: "X Belediyesi Merkez Şantiyesi",
                  e_butce: "",
                  fonksiyonel_kod: "",
                  muhasebe_birimi: "",
                  harcama_birimi: "",
                  finansman_kodu: "",
                  ekonomik_kod: "",
                  butce_kodu: "",
                  ihale_tipi: "Doğrudan Temin",
                  tur: "mal",
                  ihale_sekli: "22/d*",
                  teklif_sozlesme_turu: "Birim Fiyat",
                  alt_yuklenici_olacak_mi: 0,
                  kismi_teklif_verilecek_mi: 0,
                  fiyat_farki_dayanagi: "Fiyat Farkı Ödenmeyecek",
                  yatirim_proje_no: "",
                  avans_verilecek_mi: 0,
                  yillara_yaygin: 0,
                  sozlesme_yapilacak_mi: 0,
                  yaklasik_maliyet_hesaplamasi: "Piyasa Fiyat Araştırması",
                  kdv: "20",
                  hesaplama_esasi: "",
                  komisyon_takdiri:
                    "Sadece araştırma fiyatları dikkate alınacak",
                  tibbi_cihaz_alimi_mi: 0,
                  irtibat_yetkilisi_id: personeller[0]?.id || null,
                  onay_personel_id: personeller.find((p) =>
                    p.harcama_yetkilisi_mi === 1
                  )?.id ||
                    personeller[1]?.id ||
                    null,
                  hazirlayan_personel_id: personeller[0]?.id || null,
                  son_teklif_verme_tarihi: "2026-06-10T14:00",
                  teslim_tarihi: "2026-06-30",
                  yaklasik_maliyet: 145005,
                });
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-605 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Test Verisi Doldur
            </button>
          )}
          <Link
            to="/dosyalar"
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            İptal
          </Link>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 flex items-center gap-2 cursor-pointer"
          >
            <Save size={16} />
            {isEdit ? "Dosyayı Güncelle" : "Dosyayı Kaydet"}
          </button>
        </div>
      </div>

      {/* STEPPER UI */}
      <div className="flex-none bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-12 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex justify-between">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 rounded-full z-0">
            </div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => setActiveTab("genel")}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 transition-all",
                  activeTab === "genel" || activeTab === "ihtiyac"
                    ? "bg-blue-600 border-blue-100 dark:border-blue-900/30 text-white shadow-lg shadow-blue-500/20"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400",
                )}
              >
                1
              </button>
              <span
                className={cn(
                  "mt-2 text-[11px] font-bold uppercase tracking-wider",
                  activeTab === "genel"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-500 dark:text-slate-400",
                )}
              >
                Genel Bilgiler
              </span>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => setActiveTab("ihtiyac")}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 transition-all",
                  activeTab === "ihtiyac"
                    ? "bg-blue-500 border-blue-100 dark:border-blue-900/30 text-white shadow-lg shadow-blue-500/20"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400",
                )}
              >
                2
              </button>
              <span
                className={cn(
                  "mt-2 text-[11px] font-bold uppercase tracking-wider",
                  activeTab === "ihtiyac"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-500 dark:text-slate-400",
                )}
              >
                İhtiyaç Listesi
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FORM BODY */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <form
          onSubmit={handleSave}
          className="max-w-5xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6"
        >
          {loadingDb
            ? (
              <div className="p-8 text-center text-sm text-slate-500 italic">
                Bilgiler yükleniyor...
              </div>
            )
            : (
              <>
                {donemTanimsizMi(formData.dosya_acilis_tarihi || undefined) && (
                  <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl mb-6 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-lg">
                        <HelpCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-red-800 dark:text-red-300">
                          Kritik Hata: 22/d Limit Dönemi Bulunamadı!
                        </h3>
                        <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                          Sistemde, seçtiğiniz "Dosya Açılış Tarihi" ({formData
                            .dosya_acilis_tarihi}) ile eşleşen bir Doğrudan
                          Temin Limit Dönemi bulunamadı. Lütfen{" "}
                          <strong>
                            Sistem Ayarları &gt; Mevzuat ve Parametreler
                          </strong>{" "}
                          bölümünden ilgili tarihe ait limiti ekleyiniz. Limit
                          olmadan bu dosyaya tahmini bedel kontrolü yapılamaz.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 1: GENEL BİLGİLER */}
                {activeTab === "genel" && (
                  <GenelBilgilerTab
                    formData={formData}
                    setFormData={setFormData}
                    isEdit={isEdit}
                    birimler={birimler}
                    personeller={personeller}
                    kodSozlugu={kodSozlugu}
                    dosyalar={dosyalar}
                    isDescLoading={isDescLoading}
                    showKonuSuggestions={showKonuSuggestions}
                    setShowKonuSuggestions={setShowKonuSuggestions}
                    exactMatchCount={exactMatchCount}
                    matchedSuggestions={matchedSuggestions}
                    handleAiDescGenerate={handleAiDescGenerate}
                    handleCopyKonuToAciklama={handleCopyKonuToAciklama}
                    openTextGenerator={openTextGenerator}
                    showBirimSearch={showBirimSearch}
                    setShowBirimSearch={setShowBirimSearch}
                    birimSearchQuery={birimSearchQuery}
                    setBirimSearchQuery={setBirimSearchQuery}
                    filteredBirimler={filteredBirimler}
                    handleSelectBirim={handleSelectBirim}
                    showPersonelSearch={showPersonelSearch}
                    setShowPersonelSearch={setShowPersonelSearch}
                    personelSearchQuery={personelSearchQuery}
                    setPersonelSearchQuery={setPersonelSearchQuery}
                    filteredPersoneller={filteredPersoneller}
                  />
                )}

                {/* TAB 2: İHTİYAÇ LİSTESİ */}
                {activeTab === "ihtiyac" && (
                  <IhtiyacListesiTab
                    formData={formData}
                    setFormData={setFormData}
                    isEdit={isEdit}
                    birimler={birimler}
                    personeller={personeller}
                    kodSozlugu={kodSozlugu}
                    dosyalar={dosyalar}
                  />
                )}
              </>
            )}
          {/* TAB CONTINUATION ACTION BUTTONS */}
          <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-5 mt-6">
            <div className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold uppercase tracking-wider">
              {isEdit ? `Dosya ID: #${editId}` : "Yeni Kayıt Yapılıyor"}
            </div>

            <div className="flex gap-3">
              {activeTab !== "genel" && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === "ihtiyac") setActiveTab("genel");
                  }}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-transparent rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Geri Git
                </button>
              )}

              {activeTab !== "ihtiyac"
                ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === "genel") setActiveTab("ihtiyac");
                    }}
                    className="px-4 py-2 bg-slate-800 dark:bg-slate-100 hover:bg-slate-900 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                  >
                    Sonraki Adım
                    <ChevronRight size={14} />
                  </button>
                )
                : (
                  <button
                    onClick={handleSave}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/25 flex items-center gap-2 cursor-pointer"
                  >
                    <Save size={16} />
                    {isEdit ? "Değişiklikleri Kaydet" : "Dosyayı Oluştur"}
                  </button>
                )}
            </div>
          </div>
        </form>
      </div>

      {/* AI Form Fill Modal */}
      <AIFormFillModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        context={getAIFormContext()}
        onApply={handleAIApply}
      />

      {/* AI Text Generator Modal */}
      <AITextGeneratorModal
        isOpen={textGenConfig.isOpen}
        onClose={() => setTextGenConfig((prev) => ({ ...prev, isOpen: false }))}
        title={textGenConfig.title}
        fieldName={textGenConfig.fieldName}
        initialSubject={formData.konu}
        systemInstruction={textGenConfig.systemInstruction}
        placeholderMappings={{
          "[DOSYA_KONU]": formData.konu || "Belirtilmemiş",
          "[DOSYA_NO]": formData.temin_no || "Belirtilmemiş",
          "[DOSYA_MALIYET]": formData.yaklasik_maliyet
            ? String(formData.yaklasik_maliyet)
            : "Belirtilmemiş",
        }}
        onApply={(text) => {
          setFormData((prev) => ({
            ...prev,
            [textGenConfig.targetField]: text,
          }));
        }}
      />

      {/* AI Kalem Asistanı Modal */}
      <AITextGeneratorModal
        isOpen={aiKalemConfig.isOpen}
        onClose={() => setAiKalemConfig({ isOpen: false })}
        title="Yapay Zeka ile Kalem Tanımlama"
        fieldName="Kalem (OKAS ve Ortak Alımlar Sözlüğü)"
        initialSubject={formData.konu}
        mode="json"
        expectedJsonFormat={'{ "kalemAdi": "Örn: A4 Fotokopi Kağıdı 80gr", "miktari": 50, "birimi": "Paket", "okasKodu": "Örn: 30197630-1" }'}
        systemInstruction={`Sen bir kamu ihale ve doğrudan temin uzmanısın. Kullanıcı bir mal, hizmet veya yapım işi için listeye kalem eklemek istiyor. 
Kullanıcının girdiği genel tanıma ve alımın konusuna ([DOSYA_KONU]) bakarak:
1. En uygun, resmi, şartnameye uygun "Kalem Adı"nı belirle.
2. Bu kalem için EKAP sisteminde kullanılan en uygun "OKAS Kodunu" (Ortak Alımlar Sözlüğü CPV kodu) veya Taşınır/Taşınmaz mal kodunu bul. Bulamazsan uygun bir üst kategori OKAS kodu tahmin et.
3. Uygun miktar ve ölçü birimi (Adet, Paket, Kg, Ton, Ay, Gün, m2 vb.) öner.
Yanıtını SADECE JSON formatında ver.`}
        placeholderMappings={{
          "[DOSYA_KONU]": formData.konu || formData.tur || "Belirtilmemiş",
        }}
        onApply={(data) => {
          console.log("AI Kalem Verisi:", data);
          alert(
            `Yapay Zeka şu kalemi buldu:\n\nAdı: ${data.kalemAdi}\nOKAS Kodu: ${data.okasKodu}\nMiktar: ${data.miktari} ${data.birimi}\n\nNot: Kalem listesi altyapısı tamamlandığında bu kalem otomatik olarak listeye eklenecektir.`,
          );
        }}
      />

      {/* Eski Dosya Kopyala Modal */}
      <EskiDosyaKopyalaModal
        isOpen={showKopyalaModal}
        onClose={() => setShowKopyalaModal(false)}
        dosyalar={dosyalar}
        onSelect={handleCopyDosya}
      />
    </div>
  );
}
