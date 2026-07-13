import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Edit2,
  FileText,
  Package,
  Plus,
  Printer,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { cn } from "../../../../../utils/cn";
import { BelgeAksiyonlari } from "../../../../../components/ui/BelgeAksiyonlari";
import { normalizeForMatch } from "../../DosyaAsamalari/useDosyaAsamasiSablons";

export function MalzemeTablosu({
  state,
  stageSablons = [],
  sablons = [],
  onSablonClick,
  ciktiLoading,
  activeStarredDocs = [],
  onQuickPrint,
  onExport,
  onOpenExternal,
  isSablonDisabled,
  activeDosya,
  activeDosyaId,
}: {
  state: any;
  stageSablons?: any[];
  sablons?: any[];
  onSablonClick?: (sablon: any, title: string) => void;
  ciktiLoading?: boolean;
  activeStarredDocs?: string[] | null;
  onQuickPrint?: (sablon: any) => void;
  onExport?: (sablon: any, format: "pdf" | "docx" | "udf") => void;
  onOpenExternal?: (sablon: any) => void;
  isSablonDisabled?: (cleanName: string) => boolean;
  activeDosya?: any;
  activeDosyaId?: number | null;
}): React.JSX.Element {
  const {
    items,
    units,
    loading,
    setIsAddModalOpen,
    editingId,
    setEditingId,
    editMiktar,
    setEditMiktar,
    editBirim,
    setEditBirim,
    editKdv,
    setEditKdv,
    handleStartEdit,
    handleSaveEdit,
    handleDeleteItem,
  } = state;

  // Çoklu komisyon seçimi (checkbox)
  const [selectedKomisyonlar, setSelectedKomisyonlar] = useState<string[]>([]);
  // Belge tipi: "tek" = Görevlendirme Onayı, "ek" = Onay + Ek
  const [belgeTipi, setBelgeTipi] = useState<"tek" | "ek">("tek");
  // Komisyon paneli açık/kapalı
  const [komisyonPanelOpen, setKomisyonPanelOpen] = useState(false);
  // Eski compat — workflowSteps için hâlâ gerekli
  const selectedKomisyon = selectedKomisyonlar.length > 0
    ? (selectedKomisyonlar.includes("muayene_kabul_tespit") ? "muayene_kabul_tespit" : "fiyat_arastirma_muayene")
    : "";
  const [selectedStepIdx, setSelectedStepIdx] = useState<string>("0");

  useEffect(() => {
    if (activeDosyaId) {
      const saved = localStorage.getItem(`dta_selected_komisyonlar_${activeDosyaId}`);
      const timer = setTimeout(() => {
        if (saved) {
          try { setSelectedKomisyonlar(JSON.parse(saved)); } catch { /* ignore */ }
        }
      }, 0);
      return () => clearTimeout(timer);
    }
    return;
  }, [activeDosyaId]);

  // Çoklu komisyon onaylama — seçilen komisyon ID'lerine göre DB'yi güncelle
  const handleKomisyonlarOnayla = async (seciliTurler: string[]): Promise<void> => {
    if (!activeDosyaId) return;
    try {
      await (window as any).electron.ipcRenderer.invoke(
        "db:run",
        "DELETE FROM DATA_TeminKomisyon WHERE temin_dosya_id = ?",
        [activeDosyaId],
      );

      // komisyon_id eşlemesi: fiyat_arastirma = 1, muayene_kabul_tespit = 3
      const turMap: Record<string, { id: number; tur: string }> = {
        fiyat_arastirma: { id: 1, tur: "Fiyat Araştırma" },
        muayene_kabul_tespit: { id: 3, tur: "Muayene Kabul" },
      };

      for (const tur of seciliTurler) {
        const meta = turMap[tur];
        if (!meta) continue;
        const res = await (window as any).electron.ipcRenderer.invoke(
          "db:query",
          `SELECT u.*, p.ad_soyad, p.unvan, g.ad as gorev_adi 
           FROM TANIM_KomisyonUye u 
           JOIN TANIM_Personel p ON u.personel_id = p.id 
           JOIN TANIM_KomisyonGorevi g ON u.gorev_id = g.id 
           WHERE u.komisyon_id = ?`,
          [meta.id],
        );
        if (res.success && res.data) {
          for (const member of res.data) {
            await (window as any).electron.ipcRenderer.invoke(
              "db:run",
              `INSERT INTO DATA_TeminKomisyon 
               (temin_dosya_id, komisyon_id, personel_id, ad_soyad, unvan, gorev, rol, komisyon_turu) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                activeDosyaId,
                meta.id,
                member.personel_id,
                member.ad_soyad,
                member.unvan || null,
                member.gorev_adi === "Komisyon Başkanı" ? "Başkan" : "Üye",
                member.asil_mi === 1 ? "Asil" : "Yedek",
                meta.tur,
              ],
            );
          }
        }
      }

      localStorage.setItem(`dta_selected_komisyonlar_${activeDosyaId}`, JSON.stringify(seciliTurler));
      setSelectedKomisyonlar(seciliTurler);
      setKomisyonPanelOpen(false);
      setSelectedStepIdx("0");
    } catch (e: any) {
      alert("Komisyon güncellenirken hata oluştu: " + e.message);
    }
  };

  const workflowSteps = useMemo(() => {
    if (!selectedKomisyon || !sablons) return [];

    const getSablonByDosyaAdi = (name: string) => {
      return sablons.find(
        (s: any) => s.dosya_adi === name || s.dosya_adi === `${name}.html`,
      );
    };

    const steps: { title: string; description: string; sablon: any }[] = [];

    // Her iki komisyon seçeneğinde de görevlendirme onayı var
    const gorevlendirmeOnayi = getSablonByDosyaAdi(
      "komisyon-gorevlendirme-onayi",
    );
    if (gorevlendirmeOnayi) {
      steps.push({
        title: "Komisyon Görevlendirme Onayı",
        description:
          "Komisyon üyelerinin atanması için resmi görevlendirme yazısı.",
        sablon: gorevlendirmeOnayi,
      });
    }

    const gorevlendirmeEki = getSablonByDosyaAdi(
      "komisyon-gorevlendirme-onayi-eki",
    );
    if (gorevlendirmeEki) {
      steps.push({
        title: "Görevlendirme Onay Eki",
        description:
          "Görevlendirilen komisyon üyelerinin listesini içeren onay eki.",
        sablon: gorevlendirmeEki,
      });
    }

    if (selectedKomisyon === "muayene_kabul_tespit") {
      const muayeneKabulKomisyonu = getSablonByDosyaAdi(
        "muayene-kabul-komisyonu",
      );
      if (muayeneKabulKomisyonu) {
        steps.push({
          title: "Muayene Kabul Komisyonu Tutanağı",
          description:
            "Muayene ve kabul komisyonu teslim alma ve inceleme belgesi.",
          sablon: muayeneKabulKomisyonu,
        });
      }

      const muayeneKabulTutanagi = getSablonByDosyaAdi(
        "muayene-kabul-tutanagi",
      );
      if (muayeneKabulTutanagi) {
        steps.push({
          title: "Muayene Kabul Tutanağı",
          description:
            "Malzemenin kabul edildiğine dair nihai komisyon tutanağı.",
          sablon: muayeneKabulTutanagi,
        });
      }
    }

    return steps;
  }, [selectedKomisyon, sablons]);

  const [belgeMenuOpen, setBelgeMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [selectedPresetId, setSelectedPresetId] = useState<string>(() => {
    try {
      return localStorage.getItem("dta_selected_preset_id") || "";
    } catch {
      return "";
    }
  });
  const [isChangingPreset, setIsChangingPreset] = useState(false);
  const [presets, setPresets] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("dta_document_presets");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handlePresetsChange = () => {
      try {
        const saved = localStorage.getItem("dta_document_presets");
        setPresets(saved ? JSON.parse(saved) : []);
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener("dta_presets_changed", handlePresetsChange);
    return () =>
      window.removeEventListener("dta_presets_changed", handlePresetsChange);
  }, []);

  function getCleanName(ad: string): string {
    let clean = ad;
    const matchStatus = clean.match(/^\[(.*?)\]\s*(.*)$/);
    if (matchStatus) clean = matchStatus[2].trim();
    return clean;
  }

  const starredDocsForFilter = React.useMemo(() => {
    const activePresetId = selectedPresetId ||
      (presets.length > 0 ? presets[0].id : "");
    if (activePresetId) {
      const preset = presets.find((p) => p.id === activePresetId);
      return preset ? preset.docs : [];
    }
    return activeStarredDocs || [];
  }, [selectedPresetId, presets, activeStarredDocs]);

  const hasStarred = React.useMemo(() => {
    return stageSablons.some((sablon) => {
      const cleanName = getCleanName(sablon.ad);
      return starredDocsForFilter.some((d) =>
        normalizeForMatch(d) === normalizeForMatch(cleanName)
      );
    });
  }, [stageSablons, starredDocsForFilter]);

  const [manualFilter, setManualFilter] = useState<"all" | "starred" | null>(
    null,
  );

  const filter = manualFilter !== null
    ? manualFilter
    : (hasStarred ? "starred" : "all");

  const displaySablons = React.useMemo(() => {
    if (filter === "starred") {
      return stageSablons.filter((sablon) => {
        const cleanName = getCleanName(sablon.ad);
        return starredDocsForFilter.some(
          (d) => normalizeForMatch(d) === normalizeForMatch(cleanName),
        );
      });
    }
    return stageSablons;
  }, [filter, starredDocsForFilter, stageSablons]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setBelgeMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col min-h-[400px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Package className="w-4 h-4 text-blue-600" />
          Dosyadaki İhtiyaç Kalemleri
          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full font-bold">
            {items.length}
          </span>
        </h3>
        <div className="flex items-center gap-2 relative">
          {stageSablons.length > 0 && onSablonClick && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() =>
                  setBelgeMenuOpen((v) =>
                    !v
                  )}
                disabled={ciktiLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="w-3.5 h-3.5 text-blue-500" />
                Belgeleri Yazdır
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {belgeMenuOpen && (
                <div className="absolute right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 w-80 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150 overflow-visible">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1 space-y-2">
                    <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      <span>Bu Aşamanın Belgeleri</span>
                    </div>

                    <div className="flex items-center bg-slate-100 dark:bg-slate-950/40 rounded-lg p-0.5 w-full">
                      <button
                        type="button"
                        onClick={() => setManualFilter("all")}
                        className={cn(
                          "flex-1 py-1 text-[10px] font-extrabold rounded-md transition-colors text-center cursor-pointer",
                          filter === "all"
                            ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-350",
                        )}
                      >
                        Tümü
                      </button>
                      <button
                        type="button"
                        onClick={() => setManualFilter("starred")}
                        className={cn(
                          "flex-1 py-1 text-[10px] font-extrabold rounded-md transition-colors text-center cursor-pointer",
                          filter === "starred"
                            ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-350",
                        )}
                      >
                        Hızlı Erişim / Paket
                      </button>
                    </div>

                    {filter === "starred" && presets.length > 0 && (
                      <div className="relative w-full pt-0.5">
                        {isChangingPreset
                          ? (
                            <select
                              value={selectedPresetId ||
                                (presets.length > 0 ? presets[0].id : "")}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSelectedPresetId(val);
                                localStorage.setItem(
                                  "dta_selected_preset_id",
                                  val,
                                );
                                setIsChangingPreset(false);
                              }}
                              onBlur={() => setIsChangingPreset(false)}
                              autoFocus
                              className="w-full bg-slate-55 dark:bg-slate-850 border border-blue-500 dark:border-blue-600 rounded-lg py-1 px-2 text-[10px] font-extrabold text-blue-600 dark:text-blue-400 focus:outline-none cursor-pointer shadow-xs"
                            >
                              {presets.map((p) => (
                                <option key={p.id} value={p.id}>
                                  📦 {p.name}
                                </option>
                              ))}
                            </select>
                          )
                          : (
                            <button
                              type="button"
                              onClick={() => setIsChangingPreset(true)}
                              className="w-full flex items-center justify-between bg-blue-50/40 dark:bg-blue-955/10 hover:bg-blue-50 dark:hover:bg-blue-900/25 border border-blue-100 dark:border-blue-900/30 hover:border-blue-200 dark:hover:border-blue-800 text-blue-600 dark:text-blue-400 rounded-lg py-1 px-2.5 text-[10px] font-extrabold transition-all cursor-pointer shadow-2xs"
                            >
                              <span className="truncate">
                                📦 {presets.find((p) =>
                                  p.id ===
                                    (selectedPresetId ||
                                      (presets.length > 0 ? presets[0].id : ""))
                                )?.name || "Paket Seçilmedi"}
                              </span>
                              <ChevronDown className="w-3 h-3 text-blue-400 shrink-0 ml-1" />
                            </button>
                          )}
                      </div>
                    )}
                  </div>

                  {displaySablons.length === 0
                    ? (
                      <div className="px-3 py-4 text-center text-slate-450 dark:text-slate-500 text-xs italic">
                        Listelenecek belge bulunamadı.
                      </div>
                    )
                    : (
                      displaySablons.map((sablon: any) => {
                        let cleanName = sablon.ad;
                        const matchStatus = cleanName.match(
                          /^\[(.*?)\]\s*(.*)$/,
                        );
                        if (matchStatus) cleanName = matchStatus[2].trim();
                        const cleanTitle = cleanName.replace(
                          /\s*\(.*?\)\s*$/,
                          "",
                        )
                          .trim();

                        const isDisabled = ciktiLoading ||
                          (isSablonDisabled && isSablonDisabled(cleanName));

                        return (
                          <div
                            key={sablon.id || sablon.ad}
                            className="w-full flex items-center justify-between px-3 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors gap-2"
                          >
                            <button
                              disabled={isDisabled}
                              onClick={() => {
                                if (onSablonClick) {
                                  onSablonClick(sablon, sablon.ad);
                                }
                                setBelgeMenuOpen(false);
                              }}
                              className="flex-1 text-left text-xs text-slate-700 dark:text-slate-300 font-semibold transition-colors cursor-pointer flex items-center gap-2 truncate disabled:opacity-50 disabled:cursor-not-allowed hover:text-blue-650 dark:hover:text-blue-400"
                            >
                              <FileText className="w-3.5 h-3.5 text-slate-450 dark:text-slate-500 shrink-0" />
                              <span className="truncate">{cleanTitle}</span>
                            </button>

                            <div className="shrink-0">
                              <BelgeAksiyonlari
                                onPreview={() => {
                                  if (onSablonClick) {
                                    onSablonClick(sablon, sablon.ad);
                                  }
                                  setBelgeMenuOpen(false);
                                }}
                                onQuickPrint={() =>
                                  onQuickPrint && onQuickPrint(sablon)}
                                onExport={(fmt) =>
                                  onExport && onExport(sablon, fmt)}
                                onOpenExternal={() =>
                                  onOpenExternal && onOpenExternal(sablon)}
                                disabled={isDisabled}
                                docName={cleanName}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            İhtiyaç Kalemi Ekle
          </button>
        </div>
      </div>

      {/* Komisyon Onay Belgeleri Paneli */}
      {items.length > 0 && activeDosya?.tur === "mal" && (
        <div className="mx-4 mb-4">
          {/* Panel Başlığı / Tetikleyici */}
          <button
            type="button"
            onClick={() => setKomisyonPanelOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/70 dark:bg-slate-800/20 border border-slate-200/70 dark:border-slate-800/70 rounded-2xl hover:bg-slate-100/60 dark:hover:bg-slate-800/30 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                Komisyon Onay Belgeleri
              </span>
              {selectedKomisyonlar.length > 0 && (
                <span className="flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                  </span>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                    {selectedKomisyonlar.length} komisyon seçili
                  </span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">
                Bu belge {items.length} ihtiyaç kalemi için düzenlenecektir
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${komisyonPanelOpen ? "rotate-180" : ""}`} />
            </div>
          </button>

          {/* Açılan Panel */}
          {komisyonPanelOpen && (() => {
            const KOMISYON_SECENEKLERI = [
              { value: "fiyat_arastirma", label: "Fiyat Araştırma ve Yaklaşık Maliyet Tespit Komisyonu" },
              { value: "muayene_kabul_tespit", label: "Muayene Kabul ve Teslim Alma Komisyonu" },
            ];

            const autoSuggestBelge = selectedKomisyonlar.length === 2 ? "ek" : "tek";
            const effectiveBelgeTipi = belgeTipi || autoSuggestBelge;

            const gorevlendirmeOnayi = workflowSteps.find((s) =>
              s.sablon.dosya_adi === "komisyon-gorevlendirme-onayi" ||
              s.sablon.dosya_adi === "komisyon-gorevlendirme-onayi.html"
            );
            const gorevlendirmeEki = workflowSteps.find((s) =>
              s.sablon.dosya_adi === "komisyon-gorevlendirme-onayi-eki" ||
              s.sablon.dosya_adi === "komisyon-gorevlendirme-onayi-eki.html"
            );

            const hedefSablon = effectiveBelgeTipi === "ek"
              ? (gorevlendirmeEki ?? gorevlendirmeOnayi)
              : gorevlendirmeOnayi;
            const isDisabled = ciktiLoading || !hedefSablon || selectedKomisyonlar.length === 0;

            return (
              <div className="mt-1.5 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                {/* Görevlendirilecek Komisyonlar */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Görevlendirilecek Komisyonlar
                  </p>
                  <div className="space-y-2">
                    {KOMISYON_SECENEKLERI.map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all ${
                          selectedKomisyonlar.includes(opt.value)
                            ? "border-blue-500 bg-blue-50/60 dark:bg-blue-900/20"
                            : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                          checked={selectedKomisyonlar.includes(opt.value)}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...selectedKomisyonlar, opt.value]
                              : selectedKomisyonlar.filter((v) => v !== opt.value);
                            setSelectedKomisyonlar(next);
                            setBelgeTipi(next.length === 2 ? "ek" : "tek");
                          }}
                        />
                        <span className={`text-xs font-semibold ${
                          selectedKomisyonlar.includes(opt.value)
                            ? "text-blue-700 dark:text-blue-400"
                            : "text-slate-700 dark:text-slate-300"
                        }`}>
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Yazdırılacak Belge */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Yazdırılacak Belge
                  </p>
                  <div className="space-y-1.5">
                    <label className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all ${
                      effectiveBelgeTipi === "tek"
                        ? "border-blue-500 bg-blue-50/60 dark:bg-blue-900/20"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}>
                      <input
                        type="radio"
                        name="belge_tipi"
                        className="w-4 h-4 text-blue-600 cursor-pointer"
                        checked={effectiveBelgeTipi === "tek"}
                        onChange={() => setBelgeTipi("tek")}
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Görevlendirme Onayı
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Tek belge — seçili komisyonlar birlikte
                        </div>
                      </div>
                    </label>
                    <label className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all ${
                      effectiveBelgeTipi === "ek"
                        ? "border-blue-500 bg-blue-50/60 dark:bg-blue-900/20"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}>
                      <input
                        type="radio"
                        name="belge_tipi"
                        className="w-4 h-4 text-blue-600 cursor-pointer"
                        checked={effectiveBelgeTipi === "ek"}
                        onChange={() => setBelgeTipi("ek")}
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Görevlendirme Onayı + Ek
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Ayrı komisyon tabloları{selectedKomisyonlar.length === 2 ? " — önerilen ✓" : ""}
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Aksiyon Butonları */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setKomisyonPanelOpen(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    Kapat
                  </button>
                  <div className="flex items-center gap-2">
                    {hedefSablon && (
                      <button
                        type="button"
                        disabled={isDisabled}
                        onClick={async () => {
                          await handleKomisyonlarOnayla(selectedKomisyonlar);
                          if (hedefSablon && onSablonClick) {
                            onSablonClick(hedefSablon.sablon, hedefSablon.sablon.ad);
                          }
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Önizle
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={selectedKomisyonlar.length === 0}
                      onClick={() => handleKomisyonlarOnayla(selectedKomisyonlar)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Komisyonları Kaydet
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {loading
        ? (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-400 italic">
            Yükleniyor...
          </div>
        )
        : items.length === 0
        ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Package className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-xs">
              Bu dosyada henüz herhangi bir ihtiyaç kalemi eklenmemiş.
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              Sol taraftaki paneli kullanarak ilk ihtiyaç kalemi
              ekleyebilirsiniz.
            </p>
          </div>
        )
        : (
          <div className="overflow-x-auto custom-scrollbar flex-1">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3 pl-4">Sıra No</th>
                  <th className="p-3 pl-4">Kodu</th>
                  <th className="p-3 pl-4">İhtiyaç Kalemi Adı</th>
                  <th className="p-3">Tür</th>
                  <th className="p-3 text-center">Miktar</th>
                  <th className="p-3">Birim</th>
                  <th className="p-3 text-center">KDV (%)</th>
                  <th className="p-3 text-right pr-4">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {items.map((item: any, index: number) => {
                  const isEditing = editingId === item.id;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10"
                    >
                      <td className="p-3 pl-4 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                        {index + 1}
                      </td>

                      <td className="p-3 pl-4 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                        {item.tasinir_kodu || "-"}
                      </td>

                      <td className="p-3 pl-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {item.kalem_adi}
                        </div>
                        {item.okas_kodu && (
                          <div className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                            OKAS: {item.okas_kodu}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase",
                            item.tipi === "Mal" &&
                              "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
                            item.tipi === "Hizmet" &&
                              "bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400",
                            item.tipi === "Yapım" &&
                              "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
                            item.tipi === "Danışmanlık" &&
                              "bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400",
                          )}
                        >
                          {item.tipi}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {isEditing
                          ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editMiktar}
                              onChange={(e) =>
                                setEditMiktar(parseFloat(e.target.value) || 1)}
                              className="w-16 p-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-955 rounded text-center text-xs font-bold"
                            />
                          )
                          : (
                            <span className="font-black text-slate-750 dark:text-slate-300">
                              {item.miktar}
                            </span>
                          )}
                      </td>
                      <td className="p-3">
                        {isEditing
                          ? (
                            <select
                              value={editBirim}
                              onChange={(e) => setEditBirim(e.target.value)}
                              className="p-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-955 rounded text-xs"
                            >
                              {units.map((u: any, idx: number) => (
                                <option key={idx} value={u.ad}>
                                  {u.ad}
                                </option>
                              ))}
                            </select>
                          )
                          : <span>{item.birim}</span>}
                      </td>
                      <td className="p-3 text-center">
                        {isEditing
                          ? (
                            <select
                              value={editKdv}
                              onChange={(e) =>
                                setEditKdv(parseInt(e.target.value, 10))}
                              className="p-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-955 rounded text-xs"
                            >
                              <option value="0">%0</option>
                              <option value="1">%1</option>
                              <option value="10">%10</option>
                              <option value="20">%20</option>
                            </select>
                          )
                          : <span>%{item.kdv_orani}</span>}
                      </td>
                      <td className="p-3 text-right pr-4">
                        <div className="flex justify-end gap-2">
                          {isEditing
                            ? (
                              <>
                                <button
                                  onClick={() => handleSaveEdit(item.id)}
                                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 border border-emerald-250 dark:border-emerald-900/40 hover:border-emerald-300 dark:hover:border-emerald-800 text-emerald-600 dark:text-emerald-450 rounded-lg transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 flex items-center justify-center"
                                  title="Değişiklikleri Kaydet"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-955/20 dark:hover:bg-red-950/30 border border-red-250 dark:border-red-900/40 hover:border-red-300 dark:hover:border-red-800 text-red-500 dark:text-red-400 rounded-lg transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 flex items-center justify-center"
                                  title="İptal"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )
                            : (
                              <>
                                <button
                                  onClick={() => handleStartEdit(item)}
                                  className="p-1.5 bg-slate-50 hover:bg-blue-50 dark:bg-slate-950 dark:hover:bg-blue-955/30 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-900/50 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-lg transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 flex items-center justify-center"
                                  title="İhtiyaç Kalemi Düzenle"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-1.5 bg-slate-50 hover:bg-red-50 dark:bg-slate-950 dark:hover:bg-red-955/20 border border-slate-200 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-900/50 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 rounded-lg transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 flex items-center justify-center"
                                  title="İhtiyaç Kalemi Sil"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}
