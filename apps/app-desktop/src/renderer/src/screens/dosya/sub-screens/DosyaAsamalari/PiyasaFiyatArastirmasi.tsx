import React, { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  Award,
  Building2,
  CheckCircle2,
  ChevronDown,
  Coins,
  FileText,
  PackageSearch,
  Printer,
  Search,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { SubScreen } from "../../SubScreens.screen";
import { DocumentPreviewModal } from "../../components/DocumentPreviewModal";
import {
  normalizeForMatch,
  useDosyaAsamasiSablons,
} from "./useDosyaAsamasiSablons";
import { cn } from "../../../../utils/cn";
import { BelgeAksiyonlari } from "../../../../components/ui/BelgeAksiyonlari";

interface BiddingFirm {
  id: number;
  temin_dosya_id: number;
  firma_id: number;
  unvan: string;
  vergi_no?: string;
  ilgili_kisi?: string;
  telefon?: string;
  email?: string;
  teklif_toplami?: number;
  para_birimi?: string;
}

interface PoolFirm {
  id: number;
  unvan: string;
  firma_kodu?: string;
  istigal_konusu?: string;
  il?: string;
  vergi_no?: string;
  telefon?: string;
  email?: string;
}

interface BiddingKalem {
  id: number;
  kalem_adi: string;
  miktar: number;
  birim: string;
}

export function PiyasaFiyatArastirmasi(): React.JSX.Element {
  const {
    activeDosyaId,
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

  const [invitedFirms, setInvitedFirms] = React.useState<BiddingFirm[]>([]);
  const [allPoolFirms, setAllPoolFirms] = React.useState<PoolFirm[]>([]);
  const [items, setItems] = React.useState<BiddingKalem[]>([]);
  const [bids, setBids] = React.useState<Record<string, number>>({}); // key: `${kalemId}_${firmaId}` -> birim_fiyat
  const [, setLoading] = React.useState(true);

  const [hesaplamaEsasi, setHesaplamaEsasi] = React.useState<string>("Ortalama fiyat esasına göre");
  const [komisyonTakdiri, setKomisyonTakdiri] = React.useState<string>("Sadece araştırma fiyatları dikkate alınacak");

  const [isFirmModalOpen, setIsFirmModalOpen] = React.useState(false);
  const [selectedFirmIds, setSelectedFirmIds] = React.useState<number[]>([]);
  const [modalSearchQuery, setModalSearchQuery] = React.useState("");

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

  const stageSablons = React.useMemo(() => {
    return sablons.filter(
      (s) =>
        s.kategori === "2-piyasa-fiyat-arastirmasi" ||
        s.kategori === "2. Piyasa Fiyat Araştırması",
    );
  }, [sablons]);

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

  const loadData = React.useCallback(async (): Promise<void> => {
    if (!activeDosyaId) return;
    setLoading(true);
    try {
      // 1. Load invited firms for this dossier
      const resInvited = await window.electron.ipcRenderer.invoke(
        "db:query",
        "SELECT * FROM DATA_TeminFirma WHERE temin_dosya_id = ? AND aktif_mi = 1 ORDER BY unvan ASC",
        [activeDosyaId],
      );

      // 2. Load all pool firms
      const resPool = await window.electron.ipcRenderer.invoke(
        "db:query",
        "SELECT * FROM TANIM_Firma WHERE aktif_mi = 1 ORDER BY unvan ASC",
      );

      // 3. Load items
      const resItems = await window.electron.ipcRenderer.invoke(
        "db:query",
        "SELECT id, kalem_adi, miktar, birim FROM DATA_TeminKalemi WHERE temin_dosya_id = ? AND aktif_mi = 1 ORDER BY id ASC",
        [activeDosyaId],
      );

      // 4. Load existing bids/teklifs
      const resBids = await window.electron.ipcRenderer.invoke(
        "db:query",
        "SELECT temin_kalem_id, temin_firma_id, birim_fiyat FROM DATA_TeminKalemTeklif WHERE temin_dosya_id = ?",
        [activeDosyaId],
      );

      // 5. Load dossier config
      const resDosya = await window.electron.ipcRenderer.invoke(
        "db:query",
        "SELECT hesaplama_esasi, komisyon_takdiri FROM DATA_TeminDosyasi WHERE id = ?",
        [activeDosyaId],
      );

      if (resInvited.success) setInvitedFirms(resInvited.data || []);
      if (resPool.success) setAllPoolFirms(resPool.data || []);
      if (resItems.success) setItems(resItems.data || []);
      if (resDosya.success && resDosya.data && resDosya.data.length > 0) {
        setHesaplamaEsasi(resDosya.data[0].hesaplama_esasi || "Ortalama fiyat esasına göre");
        setKomisyonTakdiri(resDosya.data[0].komisyon_takdiri || "Sadece araştırma fiyatları dikkate alınacak");
      }

      if (resBids.success && resBids.data) {
        const bidsMap: Record<string, number> = {};
        resBids.data.forEach((row: any) => {
          bidsMap[`${row.temin_kalem_id}_${row.temin_firma_id}`] =
            row.birim_fiyat || 0;
        });
        setBids(bidsMap);
      }
    } catch (err) {
      console.error("Error loading bidding data:", err);
    } finally {
      setLoading(false);
    }
  }, [activeDosyaId]);

  React.useEffect(() => {
    loadData();
  }, [activeDosyaId, loadData]);

  const handleBulkAddFirms = async (): Promise<void> => {
    if (!activeDosyaId || selectedFirmIds.length === 0) return;
    try {
      for (const fId of selectedFirmIds) {
        const poolFirm = allPoolFirms.find((pf) => pf.id === fId);
        if (!poolFirm) continue;

        await window.electron.ipcRenderer.invoke(
          "db:run",
          `INSERT INTO DATA_TeminFirma (temin_dosya_id, firma_id, unvan, vergi_no, telefon, email, davet_edildi_mi, teklif_durumu) VALUES (?, ?, ?, ?, ?, ?, 1, 'Davet Edildi')`,
          [
            activeDosyaId,
            poolFirm.id,
            poolFirm.unvan,
            poolFirm.vergi_no || "",
            poolFirm.telefon || "",
            poolFirm.email || "",
          ],
        );
      }
      setSelectedFirmIds([]);
      setIsFirmModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert("Hata: " + err.message);
    }
  };

  const handleRemoveFirm = async (teminFirmaId: number): Promise<void> => {
    if (
      !window.confirm(
        "Bu firmayı dosyadan ve ilişkili tekliflerden kaldırmak istediğinize emin misiniz?",
      )
    ) {
      return;
    }
    try {
      // 1. Delete bids
      await window.electron.ipcRenderer.invoke(
        "db:run",
        "DELETE FROM DATA_TeminKalemTeklif WHERE temin_firma_id = ?",
        [teminFirmaId],
      );
      // 2. Delete invited firm
      const res = await window.electron.ipcRenderer.invoke(
        "db:run",
        "DELETE FROM DATA_TeminFirma WHERE id = ?",
        [teminFirmaId],
      );
      if (res.success) {
        await loadData();
      }
    } catch (err: any) {
      alert("Hata: " + err.message);
    }
  };

  const handlePriceChange = async (
    kalemId: number,
    teminFirmaId: number,
    priceStr: string,
  ): Promise<void> => {
    const price = parseFloat(priceStr) || 0;
    const key = `${kalemId}_${teminFirmaId}`;

    // Optimistic UI state update
    setBids((prev) => ({
      ...prev,
      [key]: price,
    }));

    try {
      await window.electron.ipcRenderer.invoke(
        "db:run",
        `INSERT OR REPLACE INTO DATA_TeminKalemTeklif (temin_dosya_id, temin_kalem_id, temin_firma_id, birim_fiyat, kdv_tutari, teklif_verildi_mi) VALUES (?, ?, ?, ?, 0, 1)`,
        [activeDosyaId, kalemId, teminFirmaId, price],
      );

      // Calculate total bids for this firm
      let total = 0;
      items.forEach((kalem) => {
        const kPrice = kalem.id === kalemId
          ? price
          : bids[`${kalem.id}_${teminFirmaId}`] || 0;
        total += kPrice * (kalem.miktar || 0);
      });

      await window.electron.ipcRenderer.invoke(
        "db:run",
        `UPDATE DATA_TeminFirma SET teklif_toplami = ?, teklif_verdi_mi = 1, teklif_durumu = 'Teklif Verildi' WHERE id = ?`,
        [total, teminFirmaId],
      );

      // Reload invited list to show total changes
      const resInvited = await window.electron.ipcRenderer.invoke(
        "db:query",
        "SELECT * FROM DATA_TeminFirma WHERE temin_dosya_id = ? AND aktif_mi = 1 ORDER BY unvan ASC",
        [activeDosyaId],
      );
      if (resInvited.success) setInvitedFirms(resInvited.data || []);
    } catch (err) {
      console.error("Error saving bid:", err);
    }
  };



  // Find lowest price for a kalem
  const getLowestBidInfo = (
    kalemId: number,
  ): { price: number; firmaId: number | null } => {
    let minPrice = Infinity;
    let minFirmaId: number | null = null;

    invitedFirms.forEach((firma) => {
      const price = bids[`${kalemId}_${firma.id}`];
      if (price > 0 && price < minPrice) {
        minPrice = price;
        minFirmaId = firma.id;
      }
    });

    return {
      price: minPrice === Infinity ? 0 : minPrice,
      firmaId: minFirmaId,
    };
  };

  // Calculate average price (Yaklaşık Maliyet basis) for a kalem
  const getAverageBid = (kalemId: number): number => {
    let sum = 0;
    let count = 0;
    invitedFirms.forEach((firma) => {
      const price = bids[`${kalemId}_${firma.id}`];
      if (price > 0) {
        sum += price;
        count++;
      }
    });
    return count > 0 ? sum / count : 0;
  };

  const getEstimatedCostTotal = React.useCallback((): number => {
    return items.reduce((sum, item) => {
      const avg = getAverageBid(item.id);
      return sum + (item.miktar || 0) * avg;
    }, 0);
  }, [items, bids, invitedFirms]);

  const handleSaveToDosya = async (): Promise<void> => {
    const total = getEstimatedCostTotal();
    if (total === 0) {
      alert("Yaklaşık maliyet ₺0.00 olamaz. Lütfen önce teklif fiyatları girin.");
      return;
    }
    try {
      const res = await window.electron.ipcRenderer.invoke(
        "db:run",
        "UPDATE DATA_TeminDosyasi SET yaklasik_maliyet = ? WHERE id = ?",
        [total, activeDosyaId],
      );
      if (res.success) {
        alert(
          `Yaklaşık maliyet başarıyla güncellendi: ₺ ${
            total.toLocaleString("tr-TR", {
              minimumFractionDigits: 2,
            })
          }`,
        );
      } else {
        alert(res.error);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Find lowest total bid amount and its associated firm ID
  const lowestTotalFirmaId = React.useMemo(() => {
    let minTotal = Infinity;
    let minId: number | null = null;
    invitedFirms.forEach((firma) => {
      if (
        firma.teklif_toplami && firma.teklif_toplami > 0 &&
        firma.teklif_toplami < minTotal
      ) {
        minTotal = firma.teklif_toplami;
        minId = firma.id;
      }
    });
    return minId;
  }, [invitedFirms]);

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
      title="Teklifler & Piyasa Fiyat Araştırması"
      icon={PackageSearch}
      description="Piyasa araştırması yapıp birim fiyat tekliflerinizi toplayabilir, komisyon görevlendirme onay belgesi hazırlayabilir ve tüm süreç dökümanlarınızı bu panel üzerinden oluşturup çıktı alabilirsiniz."
    >
      {/* İSTEKLİ FİRMALARI YÖNETME ALANI */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-855 dark:text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              Sürece Katılan İstekli Firmalar
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Piyasa araştırması kapsamında davet edilen ve teklif formu
              dolduran firmaları belirleyin. (En az 3 firma önerilir)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {stageSablons.length > 0 && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() =>
                    setBelgeMenuOpen((v) =>
                      !v
                    )}
                  disabled={ciktiLoading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed h-10"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-500" />
                  Belgeleri Yazdır
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {belgeMenuOpen && (
                  <div className="absolute right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 w-80 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150 overflow-visible text-left">
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
                                        (presets.length > 0
                                          ? presets[0].id
                                          : ""))
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
                          ).trim();

                          const isDisabled = ciktiLoading ||
                            (isSablonDisabled && isSablonDisabled(cleanName));
                          const isStarred = activeStarredDocs
                            ? activeStarredDocs.some(
                              (d) =>
                                normalizeForMatch(d) ===
                                  normalizeForMatch(cleanName),
                            )
                            : false;

                          return (
                            <div
                              key={sablon.id || sablon.ad}
                              className="w-full flex items-center justify-between px-3 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors gap-2"
                            >
                              <button
                                disabled={isDisabled}
                                onClick={() => {
                                  handleOpenPreviewForSablon(sablon, sablon.ad);
                                  setBelgeMenuOpen(false);
                                }}
                                className="flex-1 text-left text-xs text-slate-700 dark:text-slate-300 font-semibold transition-colors cursor-pointer flex items-center gap-2 truncate disabled:opacity-50 disabled:cursor-not-allowed hover:text-blue-650 dark:hover:text-blue-400"
                              >
                                <FileText className="w-3.5 h-3.5 text-slate-450 dark:text-slate-500 shrink-0" />
                                <span className="truncate">{cleanTitle}</span>
                              </button>

                              <div className="shrink-0">
                                <BelgeAksiyonlari
                                  isStarred={isStarred}
                                  onPreview={() => {
                                    handleOpenPreviewForSablon(
                                      sablon,
                                      sablon.ad,
                                    );
                                    setBelgeMenuOpen(false);
                                  }}
                                  onQuickPrint={() => quickPrint(sablon)}
                                  onExport={(fmt) => quickExport(sablon, fmt)}
                                  onToggleStar={() => toggleStar(cleanName)}
                                  onOpenExternal={() =>
                                    quickOpenExternal(sablon)}
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
              onClick={() => setIsFirmModalOpen(true)}
              className="flex items-center gap-2 text-xs bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all h-10"
            >
              <Building2 className="w-4 h-4" />
              İstekli Firmalardan Seç
            </button>

            <Link
              to="/firmalar"
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center h-10"
            >
              Tedarikçi Listesini Yönet
            </Link>
          </div>
        </div>

        {/* DAVET EDİLEN FİRMALARIN KART GÖRÜNÜMÜ */}
        {invitedFirms.length === 0
          ? (
            <div className="p-12 text-center bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-full">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-350">
                  Bu dosyaya henüz teklif veren/davet edilen firma eklenmemiş.
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-md">
                  Teklif fiyat giriş matrisini açmak için lütfen yukarıdaki
                  menüden firma ekleyin veya firma havuzunu düzenleyerek havuzu
                  genişletin.
                </p>
              </div>
            </div>
          )
          : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {invitedFirms.map((firma) => (
                <div
                  key={firma.id}
                  className={`p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900 dark:to-slate-950/40 border ${
                    lowestTotalFirmaId === firma.id
                      ? "border-emerald-500/30 dark:border-emerald-500/20 shadow-emerald-500/5 ring-1 ring-emerald-500/10"
                      : "border-slate-200 dark:border-slate-800"
                  } rounded-xl flex flex-col justify-between gap-3 shadow-sm hover:shadow-md hover:border-slate-350 dark:hover:border-slate-700 transition-all group relative overflow-hidden`}
                >
                  {/* Visual accent top-right */}
                  <div
                    className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-blue-600`}
                  >
                  </div>

                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        lowestTotalFirmaId === firma.id
                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
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
                        {firma.vergi_no
                          ? `Vergi/TC: ${firma.vergi_no}`
                          : "Vergi No Yok"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">
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
                          ? `${
                            firma.teklif_toplami.toLocaleString("tr-TR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          } ${firma.para_birimi || "TL"}`
                          : "Fiyat Girişi Yok"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Status Badge */}
                      {firma.teklif_toplami && firma.teklif_toplami > 0
                        ? (
                          <span
                            className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              lowestTotalFirmaId === firma.id
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            }`}
                          >
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            {lowestTotalFirmaId === firma.id
                              ? "En Uygun"
                              : "Girildi"}
                          </span>
                        )
                        : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <AlertCircle className="w-2.5 h-2.5" />
                            Bekliyor
                          </span>
                        )}

                      <button
                        onClick={() => handleRemoveFirm(firma.id)}
                        className="text-slate-400 hover:text-red-50 hover:bg-red-50 hover:dark:bg-red-950/30 hover:text-red-650 p-1.5 rounded-lg transition-all shrink-0"
                        title="Firmayı Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* TEKLİF VE BİRİM FİYAT GİRİŞ MATRİSİ */}
      {invitedFirms.length > 0 && items.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-855 dark:text-slate-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600">
                </span>
                Teklif Giriş Matrisi & Karşılaştırma
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Her firma için malzeme birim fiyatlarını girin. En düşük
                teklifler yeşil renkle vurgulanır ve yaklaşık maliyet otomatik
                hesaplanır.
              </p>
            </div>

            <div className="flex items-center gap-2">
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
                        className="truncate w-32 ml-auto"
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
              <tbody className="divide-y divide-slate-100 dark:divide-slate-855">
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
                      <td className="p-3 text-center text-slate-550">
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
      )}

      {isFirmModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[85vh] overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  İstekli Firmaları Seçin
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Sürece dahil etmek istediğiniz tedarikçileri aşağıdan seçiniz.
                </p>
              </div>
              <button
                onClick={() => setIsFirmModalOpen(false)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Kapat
              </button>
            </div>

            {/* Arama Barı */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-850 flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Firma adı, kodu, vergi no, iştigal konusu veya şehir ara..."
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-medium"
                />
              </div>
            </div>

            <div className="p-5 overflow-y-auto flex-1 bg-slate-50/20 dark:bg-slate-950/20">
              {(() => {
                const unselectedFirms = allPoolFirms.filter((pf) =>
                  !invitedFirms.some((ifrm) => ifrm.firma_id === pf.id)
                );

                const filteredFirms = unselectedFirms.filter((pf) => {
                  if (!modalSearchQuery.trim()) return true;
                  const q = modalSearchQuery.toLowerCase();
                  return (
                    pf.unvan?.toLowerCase().includes(q) ||
                    pf.firma_kodu?.toLowerCase().includes(q) ||
                    pf.vergi_no?.toLowerCase().includes(q) ||
                    pf.il?.toLowerCase().includes(q) ||
                    pf.istigal_konusu?.toLowerCase().includes(q)
                  );
                });

                if (filteredFirms.length === 0) {
                  return (
                    <div className="text-center py-12 text-sm text-slate-550 dark:text-slate-450 italic">
                      Arama kriterlerinize uygun veya eklenebilecek yeni tedarikçi bulunamadı.
                    </div>
                  );
                }

                return (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950 font-bold border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                          <th className="p-3 w-12 text-center">Seç</th>
                          <th className="p-3 w-28">Firma Kodu</th>
                          <th className="p-3">Firma Ünvanı</th>
                          <th className="p-3">İştigal Konusu / İl</th>
                          <th className="p-3 w-32">Vergi No</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredFirms.map((pf) => {
                          const isSelected = selectedFirmIds.includes(pf.id);
                          return (
                            <tr
                              key={pf.id}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedFirmIds((prev) =>
                                    prev.filter((id) => id !== pf.id)
                                  );
                                } else {
                                  setSelectedFirmIds((prev) => [...prev, pf.id]);
                                }
                              }}
                              className={`hover:bg-slate-50/50 dark:hover:bg-slate-850/20 cursor-pointer transition-colors ${
                                isSelected ? "bg-blue-50/30 dark:bg-blue-950/10 font-medium" : ""
                              }`}
                            >
                              <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedFirmIds((prev) => [...prev, pf.id]);
                                    } else {
                                      setSelectedFirmIds((prev) =>
                                        prev.filter((id) => id !== pf.id)
                                      );
                                    }
                                  }}
                                  className="w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-slate-700 focus:ring-blue-500 cursor-pointer"
                                />
                              </td>
                              <td className="p-3 font-semibold text-slate-500 dark:text-slate-400">
                                {pf.firma_kodu || "-"}
                              </td>
                              <td className="p-3 font-bold text-slate-850 dark:text-slate-200">
                                {pf.unvan}
                              </td>
                              <td className="p-3 text-slate-650 dark:text-slate-400">
                                <div className="truncate max-w-[200px]" title={pf.istigal_konusu}>{pf.istigal_konusu || "-"}</div>
                                <div className="text-[10px] text-slate-450 mt-0.5">{pf.il || "-"}</div>
                              </td>
                              <td className="p-3 text-slate-500 dark:text-slate-400 font-mono">
                                {pf.vergi_no || "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {selectedFirmIds.length} tedarikçi seçildi
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsFirmModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  İptal
                </button>
                <button
                  onClick={handleBulkAddFirms}
                  disabled={selectedFirmIds.length === 0}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
                >
                  Seçilenleri Dosyaya Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SubScreen>
  );
}
