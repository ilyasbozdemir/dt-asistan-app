import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useDosyaAsamasiSablons, normalizeForMatch } from "../useDosyaAsamasiSablons";

export interface BiddingFirm {
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

export interface PoolFirm {
  id: number;
  unvan: string;
  firma_kodu?: string;
  istigal_konusu?: string;
  il?: string;
  vergi_no?: string;
  telefon?: string;
  email?: string;
}

export interface BiddingKalem {
  id: number;
  kalem_adi: string;
  miktar: number;
  birim: string;
}

export function usePiyasaFiyatArastirmasiLogic() {
  const sablonsContext = useDosyaAsamasiSablons();
  const { activeDosyaId, sablons, activeStarredDocs, toggleStar } = sablonsContext;

  const [invitedFirms, setInvitedFirms] = useState<BiddingFirm[]>([]);
  const [allPoolFirms, setAllPoolFirms] = useState<PoolFirm[]>([]);
  const [items, setItems] = useState<BiddingKalem[]>([]);
  const [bids, setBids] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const [hesaplamaEsasi, setHesaplamaEsasi] = useState<string>("Ortalama fiyat esasına göre");
  const [komisyonTakdiri, setKomisyonTakdiri] = useState<string>("Sadece araştırma fiyatları dikkate alınacak");

  const [isFirmModalOpen, setIsFirmModalOpen] = useState(false);
  const [selectedFirmIds, setSelectedFirmIds] = useState<number[]>([]);
  const [modalSearchQuery, setModalSearchQuery] = useState("");

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

  const stageSablons = useMemo(() => {
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

  const starredDocsForFilter = useMemo(() => {
    const activePresetId = selectedPresetId ||
      (presets.length > 0 ? presets[0].id : "");
    if (activePresetId) {
      const preset = presets.find((p) => p.id === activePresetId);
      return preset ? preset.docs : [];
    }
    return activeStarredDocs || [];
  }, [selectedPresetId, presets, activeStarredDocs]);

  const hasStarred = useMemo(() => {
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

  const displaySablons = useMemo(() => {
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

  const loadData = useCallback(async (): Promise<void> => {
    if (!activeDosyaId) return;
    setLoading(true);
    try {
      const resInvited = await window.electron.ipcRenderer.invoke(
        "db:query",
        "SELECT * FROM DATA_TeminFirma WHERE temin_dosya_id = ? AND aktif_mi = 1 ORDER BY unvan ASC",
        [activeDosyaId],
      );

      const resPool = await window.electron.ipcRenderer.invoke(
        "db:query",
        "SELECT * FROM TANIM_Firma WHERE aktif_mi = 1 ORDER BY unvan ASC",
      );

      const resItems = await window.electron.ipcRenderer.invoke(
        "db:query",
        "SELECT id, kalem_adi, miktar, birim FROM DATA_TeminKalem WHERE temin_dosya_id = ? ORDER BY id ASC",
        [activeDosyaId],
      );

      const resBids = await window.electron.ipcRenderer.invoke(
        "db:query",
        "SELECT temin_kalem_id, temin_firma_id, birim_fiyat FROM DATA_TeminKalemTeklif WHERE temin_dosya_id = ?",
        [activeDosyaId],
      );

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

  useEffect(() => {
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
      await window.electron.ipcRenderer.invoke(
        "db:run",
        "DELETE FROM DATA_TeminKalemTeklif WHERE temin_firma_id = ?",
        [teminFirmaId],
      );
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

  const getLowestBidInfo = useCallback((
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
  }, [invitedFirms, bids]);

  const getAverageBid = useCallback((kalemId: number): number => {
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
  }, [invitedFirms, bids]);

  const getEstimatedCostTotal = useCallback((): number => {
    return items.reduce((sum, item) => {
      const avg = getAverageBid(item.id);
      return sum + (item.miktar || 0) * avg;
    }, 0);
  }, [items, getAverageBid]);

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

  const lowestTotalFirmaId = useMemo(() => {
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

  return {
    sablonsContext,
    invitedFirms,
    allPoolFirms,
    items,
    bids,
    loading,
    hesaplamaEsasi,
    komisyonTakdiri,
    isFirmModalOpen,
    setIsFirmModalOpen,
    selectedFirmIds,
    setSelectedFirmIds,
    modalSearchQuery,
    setModalSearchQuery,
    belgeMenuOpen,
    setBelgeMenuOpen,
    dropdownRef,
    selectedPresetId,
    setSelectedPresetId,
    isChangingPreset,
    setIsChangingPreset,
    presets,
    stageSablons,
    getCleanName,
    filter,
    setManualFilter,
    displaySablons,
    handleBulkAddFirms,
    handleRemoveFirm,
    handlePriceChange,
    getLowestBidInfo,
    getAverageBid,
    getEstimatedCostTotal,
    handleSaveToDosya,
    lowestTotalFirmaId,
  };
}
