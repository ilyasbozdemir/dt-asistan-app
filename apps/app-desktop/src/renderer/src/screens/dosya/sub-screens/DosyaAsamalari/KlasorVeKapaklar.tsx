import React, { useState } from "react";
import {
  Archive,
  Check,
  CheckCircle2,
  FolderTree,
  ListChecks,
  Lock,
  MapPin,
  Printer,
  Save,
} from "lucide-react";
import { SubScreen } from "../../SubScreens.screen";
import { DocumentPreviewModal } from "../../components/DocumentPreviewModal";
import {
  normalizeForMatch,
  useDosyaAsamasiSablons,
} from "./useDosyaAsamasiSablons";
import { PrintDropdownButton } from "../../components/PrintDropdownButton";
import { useSettingsStore } from "../../../../store/settingsStore";

export function KlasorVeKapaklar(): React.JSX.Element {
  const {
    activeStarredDocs,
    sablons,
    ciktiLoading,
    masterHtml,
    dosyaContext,
    placeholders,
    contextsByPath,
    personelListesi,
    previewModalOpen,
    setPreviewModalOpen,
    previewData,
    handleOpenPreviewForSablon,
    executePrint,
    executeExportPdf,
    executeExportDocx,
    executeExportUdf,
    quickPrint,
    quickExport,
    quickOpenExternal,
    toggleStar,
    refreshSnapshot,
    saveSnapshot,
    isSablonDisabled,
  } = useDosyaAsamasiSablons();

  const stageSablons = sablons.filter(
    (s) =>
      s.kategori === "5-klasor-ve-kapaklar" ||
      s.kategori === "5. Klasör & Kapaklar",
  );

  // --- MOCK STATES FOR DASHBOARD ---
  const [isDosyaClosed, setIsDosyaClosed] = useState(false);
  const [arsivLokasyon, setArsivLokasyon] = useState("");
  const [klasorNo, setKlasorNo] = useState("");
  const [rafNo, setRafNo] = useState("");

  // Simulated global settings for Archive Locations
  const globalArsivLokasyonlari = [
    "Muhasebe Arşivi 1. Dolap",
    "Muhasebe Arşivi 2. Dolap",
    "Satınalma Arşivi",
    "Bodrum Kat Genel Arşiv",
    "Müdüriyet Odası",
  ];

  const globalBelgeler = [
    { id: "g1", label: "İhtiyaç Belgesi / Talep Yazısı" },
    { id: "g2", label: "Harcama Talimatı / Onay Belgesi" },
    { id: "g3", label: "Yaklaşık Maliyet Cetveli" },
    { id: "g4", label: "Piyasa Fiyat Araştırması Görevlendirme Oluru" },
    { id: "g5", label: "Piyasa Fiyat Araştırma Tutanağı" },
    { id: "g6", label: "Firma Teklif Mektupları (Kaşeli/İmzalı)" },
    { id: "g7", label: "Sözleşme / Sipariş Formu" },
    { id: "g8", label: "Muayene ve Kabul Komisyonu Oluru" },
    { id: "g9", label: "Muayene Kabul Tutanağı" },
    { id: "g10", label: "Taşınır İşlem Fişi (TİF)" },
    { id: "g11", label: "Fatura Aslı" },
    { id: "g12", label: "Vergi Borcu Yoktur Yazısı" },
    { id: "g13", label: "SGK Borcu Yoktur Yazısı" },
    { id: "g14", label: "Ödeme Emri Belgesi (ÖEB) ve Ekleri" },
  ];

  const [checklist, setChecklist] = useState([
    { id: "1", label: "Onay Belgesi", checked: true },
    { id: "2", label: "Yaklaşık Maliyet Cetveli", checked: true },
    { id: "3", label: "Piyasa Fiyat Araştırma Tutanağı", checked: true },
    {
      id: "4",
      label: "Firma Teklif Mektupları (Kaşeli/İmzalı)",
      checked: false,
    },
    { id: "5", label: "Sözleşme / Sipariş Formu", checked: false },
  ]);

  const [isEditMode, setIsEditMode] = useState(false);
  const [customItemText, setCustomItemText] = useState("");

  const handleToggleChecklist = (id: string): void => {
    if (isEditMode) return; // Don't check off items while in edit mode
    setChecklist(
      checklist.map((
        item,
      ) => (item.id === id ? { ...item, checked: !item.checked } : item)),
    );
  };

  const handleRemoveItem = (id: string): void => {
    setChecklist(checklist.filter((c) => c.id !== id));
  };

  const handleAddFromGlobal = (
    globalItem: { id: string; label: string },
  ): void => {
    if (!checklist.some((c) => c.label === globalItem.label)) {
      setChecklist((
        prev,
      ) => [...prev, {
        id: crypto.randomUUID(),
        label: globalItem.label,
        checked: false,
      }]);
    }
  };

  const handleAddCustomItem = (): void => {
    if (customItemText.trim() === "") return;
    setChecklist((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label: customItemText.trim(),
        checked: false,
      },
    ]);
    setCustomItemText("");
  };

  const handleMoveUp = (index: number): void => {
    if (index === 0) return;
    const newList = [...checklist];
    const temp = newList[index - 1];
    newList[index - 1] = newList[index];
    newList[index] = temp;
    setChecklist(newList);
  };

  const handleMoveDown = (index: number): void => {
    if (index === checklist.length - 1) return;
    const newList = [...checklist];
    const temp = newList[index + 1];
    newList[index + 1] = newList[index];
    newList[index] = temp;
    setChecklist(newList);
  };

  const completedCount = checklist.filter((c) => c.checked).length;
  const progressPercent = checklist.length > 0
    ? Math.round((completedCount / checklist.length) * 100)
    : 0;

  if (previewData && previewModalOpen) {
    const isStarred = previewData?.title
      ? activeStarredDocs.some(
        (d) =>
          normalizeForMatch(d) === normalizeForMatch(previewData.title || ""),
      )
      : false;

    return (
      <DocumentPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title={previewData.title}
        templateHtml={previewData.templateHtml}
        masterHtml={masterHtml || ""}
        baseContext={previewData.snapshotContext ||
          contextsByPath[previewData.processPath] || dosyaContext}
        placeholders={placeholders}
        personelListesi={personelListesi}
        onPrint={executePrint}
        onExportPdf={executeExportPdf}
        onExportDocx={executeExportDocx}
        onExportUdf={executeExportUdf}
        isStarred={isStarred}
        onToggleStar={() => previewData?.title && toggleStar(previewData.title)}
        isInline={true}
        templateTestVerisi={previewData.templateTestVerisi}
        dosyaAdi={previewData.dosyaAdi}
        onRefreshSnapshot={refreshSnapshot}
        onSaveSnapshot={saveSnapshot}
      />
    );
  }

  return (
    <SubScreen
      title="Klasör & Kapaklar"
      icon={FolderTree}
      description="İhale kapağı, kapak içi indeks şablonu ve fiziksel arşiv dosyalarınızı hazırlayabilirsiniz. Süreci tamamlayıp dosyayı kapatabilirsiniz."
    >
      <div className="flex flex-col gap-6 animate-in fade-in duration-300">
        {/* TOP STATUS BAR */}
        <div
          className={`flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border shadow-sm transition-colors ${
            isDosyaClosed
              ? "bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
              : "bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800/50"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                isDosyaClosed
                  ? "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  : "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300/40 dark:border-emerald-700/40"
              }`}
            >
              {isDosyaClosed
                ? (
                  <Lock className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                )
                : (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                )}
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">
                {isDosyaClosed
                  ? "Dosya Kapatıldı (Arşivlendi)"
                  : "Süreç Tamamlandı: Arşivlemeye Hazır"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isDosyaClosed
                  ? "Bu dosyadaki işlemler bitmiş ve fiziksel olarak arşive kaldırılmıştır."
                  : "Tüm adımlar tamamlandı. Fiziksel dosyanızı hazırlayıp kapatabilirsiniz."}
              </p>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setIsDosyaClosed(!isDosyaClosed)}
              className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 ${
                isDosyaClosed
                  ? "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 hover:shadow-emerald-500/30"
              }`}
            >
              {isDosyaClosed ? <>Kilidi Aç & Düzenle</> : (
                <>
                  <Lock className="w-4 h-4" /> İşleri Bitir & Dosyayı Kapat
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN: Checklist & Content */}
          <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-blue-500" />
                  Fiziksel Dosya İçerik Kontrol Listesi
                </h4>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    disabled={isDosyaClosed}
                    className="text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isEditMode ? "Bitti" : "Düzenle"}
                  </button>
                  <span className="text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-md border border-blue-200 dark:border-blue-800">
                    {progressPercent}% Tamamlandı
                  </span>
                </div>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-5 overflow-hidden">
                <div
                  className="bg-blue-500 h-1.5 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                >
                </div>
              </div>

              <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {checklist.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                      item.checked
                        ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {!isEditMode && (
                      <label className="flex items-center gap-3 flex-1 cursor-pointer">
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                            item.checked
                              ? "bg-emerald-500 border-emerald-600 text-white"
                              : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          {item.checked && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span
                          className={`text-xs font-semibold ${
                            item.checked
                              ? "text-emerald-800 dark:text-emerald-300 line-through opacity-70"
                              : "text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {item.label}
                        </span>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={item.checked}
                          onChange={() => handleToggleChecklist(item.id)}
                          disabled={isDosyaClosed}
                        />
                      </label>
                    )}

                    {isEditMode && (
                      <div className="flex items-center justify-between flex-1">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {item.label}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 disabled:opacity-30"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => handleMoveDown(index)}
                            disabled={index === checklist.length - 1}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 disabled:opacity-30"
                          >
                            ▼
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 hover:bg-red-100 text-red-500 rounded ml-2"
                          >
                            X
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {isEditMode && (
                <div className="mt-4 flex flex-col gap-4">
                  <div className="p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl flex flex-col gap-3">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      Özel / Serbest Madde Ekle:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customItemText}
                        onChange={(e) => setCustomItemText(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleAddCustomItem()}
                        placeholder="Örn: Garanti Belgesi..."
                        className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={handleAddCustomItem}
                        disabled={!customItemText.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Ekle
                      </button>
                    </div>
                  </div>

                  <div className="p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                      Genel Listeden Ekle:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {globalBelgeler.filter((g) =>
                        !checklist.some((c) => c.label === g.label)
                      ).map((g) => (
                        <button
                          key={g.id}
                          onClick={() => handleAddFromGlobal(g)}
                          className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 dark:border-slate-700 rounded-md transition-colors"
                        >
                          + {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Physical Location & Covers */}
          <div className="flex flex-col gap-6">
            {/* Physical Location Tracking */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-5">
                <MapPin className="w-4 h-4 text-amber-500" />
                Fiziksel Arşiv Konumu
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Arşiv Lokasyonu / Dolap
                    <span className="ml-2 font-normal text-slate-400">
                      (Genel Ayarlardan)
                    </span>
                  </label>
                  <select
                    disabled={isDosyaClosed}
                    value={arsivLokasyon}
                    onChange={(e) => setArsivLokasyon(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all disabled:opacity-60"
                  >
                    <option value="">-- Lokasyon Seçiniz --</option>
                    {globalArsivLokasyonlari.map((lokasyon) => (
                      <option key={lokasyon} value={lokasyon}>
                        {lokasyon}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Klasör / Sıra No
                  </label>
                  <input
                    type="text"
                    disabled={isDosyaClosed}
                    placeholder="Örn: 2026-05"
                    value={klasorNo}
                    onChange={(e) => setKlasorNo(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all disabled:opacity-60"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Raf No
                  </label>
                  <input
                    type="text"
                    disabled={isDosyaClosed}
                    placeholder="Örn: 3. Raf"
                    value={rafNo}
                    onChange={(e) => setRafNo(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all disabled:opacity-60"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  disabled={isDosyaClosed}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg transition-colors border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" /> Konumu Kaydet
                </button>
              </div>
            </div>

            {/* Print Covers & Indices */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col h-full">
              <div className="flex items-center justify-between mb-5">
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Printer className="w-4 h-4 text-violet-500" />
                  Kapak & Sırtlık Çıktıları
                </h4>
                {stageSablons.length > 0 && (
                  <PrintDropdownButton
                    kategori="5-klasor-ve-kapaklar"
                    sablons={sablons}
                    overrideSablons={stageSablons}
                    activeStarredDocs={activeStarredDocs}
                    ciktiLoading={ciktiLoading}
                    handleOpenPreviewForSablon={handleOpenPreviewForSablon}
                    quickPrint={quickPrint}
                    quickExport={quickExport}
                    quickOpenExternal={quickOpenExternal}
                    isSablonDisabled={isSablonDisabled}
                    buttonHeightClass="h-9"
                    label="Kapakları Yazdır"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <Archive className="w-8 h-8 text-slate-400" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Klasör Sırtlığı (Geniş/Dar)
                    </h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Klasörünüzün dışı için sırtlık etiketi yazdırın.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <FolderTree className="w-8 h-8 text-slate-400" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Kapak İçi İndeks (Dizi Pusulası)
                    </h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Fiziksel dosya içindeki evrak listesi indeksini yazdırın.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SubScreen>
  );
}
