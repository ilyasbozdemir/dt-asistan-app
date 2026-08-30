import { useEffect, useRef, useState } from "react";
import { renderToString } from "react-dom/server";
import React from "react";
import {
  IhtiyacListesiType,
  TEMPLATE_REGISTRY,
  TemplateComponentType,
  TemplateResolver,
} from "@hakim-pro-app/document-templates";
import { useWorkspaceStore } from "../../../../../store/workspaceStore";
import { useSettingsStore } from "../../../../../store/settingsStore";
import { getDefaultMappingForProcess } from "../../../../../constants/mappings";
import { getInstitutionSuffixes } from "../../../../../utils/kurumHelper";
import { Personel } from "../types";
import { V2_TEMPLATES_MAP } from "../constants";

interface UseDocumentPreviewDataParams {
  isOpen: boolean;
  documentId: string | null;
  dosyaId?: number | null;
  invitedFirms?: any[];
}

export function useDocumentPreviewData({
  isOpen,
  documentId,
  dosyaId: propDosyaId,
  invitedFirms: propInvitedFirms,
}: UseDocumentPreviewDataParams) {
  const { activeDosyaId: storeDosyaId } = useWorkspaceStore();
  const activeDosyaId =
    propDosyaId ||
    storeDosyaId ||
    Number(sessionStorage.getItem("workspace_dosya_id") || 0);

  const {
    showLogoLeft,
    showLogoRight,
    subInstitutionType,
    customSubInstitutionLabel,
    customSubInstitutionKurumumuz,
    customSubInstitutionKurumu,
    customSubInstitutionKurumlari,
  } = useSettingsStore();

  const [formData, setFormData] = useState<Partial<IhtiyacListesiType>>({});
  const [personelListesi, setPersonelListesi] = useState<Personel[]>([]);
  const [firmaListesi, setFirmaListesi] = useState<any[]>([]);
  const [localShowLogoLeft, setLocalShowLogoLeft] = useState(showLogoLeft);
  const [localShowLogoRight, setLocalShowLogoRight] = useState(showLogoRight);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait",
  );
  const [isEditingMode, setIsEditingMode] = useState(true);
  const [previewScale, setPreviewScale] = useState(1);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [zoomMode, setZoomMode] = useState<"auto" | "manual">("auto");
  const [manualZoom, setManualZoom] = useState(1.0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeTemplateConf = TEMPLATE_REGISTRY.find((t) => t.id === documentId);
  const ActiveComponent = activeTemplateConf
    ? V2_TEMPLATES_MAP[activeTemplateConf.name]
    : null;

  // 1. Load Data from DB
  useEffect(() => {
    if (!isOpen) return;

    const loadInitialData = async (): Promise<void> => {
      try {
        const personelRes = await window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT id, ad_soyad, unvan, telefon, eposta FROM TANIM_Personel WHERE aktif_mi = 1 ORDER BY ad_soyad ASC",
        );
        if (personelRes.success) {
          setPersonelListesi(personelRes.data);
        }

        let fileFirms: any[] = [];
        if (propInvitedFirms && propInvitedFirms.length > 0) {
          fileFirms = propInvitedFirms.map((f: any) => ({
            temin_firma_id: f.temin_firma_id || f.id,
            id: f.id || f.firma_id || f.temin_firma_id,
            unvan: f.unvan || f.firma_adi || "İstekli Firma",
            yetkili_ad_soyad: f.yetkili_ad_soyad || "",
            telefon: f.telefon || "",
            eposta: f.eposta || f.email || "",
          }));
        } else if (activeDosyaId) {
          const dosyaFirmaRes = await window.electron.ipcRenderer.invoke(
            "db:query",
            `SELECT 
                 df.id as temin_firma_id,
                 COALESCE(f.id, df.firma_id, df.id) as id,
                 COALESCE(
                   NULLIF(df.unvan, ''),
                   NULLIF(f.unvan, ''),
                   NULLIF(f.firma_adi, ''),
                   NULLIF(df.firma_adi, ''),
                   'İstekli Firma'
                 ) as unvan,
                 COALESCE(NULLIF(f.yetkili_ad_soyad, ''), NULLIF(df.yetkili_ad_soyad, '')) as yetkili_ad_soyad,
                 COALESCE(NULLIF(f.telefon, ''), NULLIF(df.telefon, '')) as telefon,
                 COALESCE(NULLIF(f.eposta, ''), NULLIF(df.email, '')) as eposta
               FROM DATA_TeminFirma df
               LEFT JOIN TANIM_Firma f ON df.firma_id = f.id
               WHERE df.temin_dosya_id = ?
               ORDER BY df.id ASC`,
            [activeDosyaId],
          );
          if (dosyaFirmaRes.success && dosyaFirmaRes.data.length > 0) {
            fileFirms = dosyaFirmaRes.data.filter(
              (f: any) => f.unvan && String(f.unvan).trim() !== "",
            );
          }
        }

        // Calculate totals for firm bidding
        const itemsRes = await window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT id, kalem_adi, aciklama, birim, miktar FROM DATA_TeminKalem WHERE temin_dosya_id = ? ORDER BY id ASC",
          [activeDosyaId],
        );
        const items = itemsRes.success ? itemsRes.data : [];

        const bidsRes = await window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT temin_kalem_id, temin_firma_id, birim_fiyat FROM DATA_TeminKalemTeklif WHERE temin_dosya_id = ?",
          [activeDosyaId],
        );
        const bids = bidsRes.success ? bidsRes.data : [];

        fileFirms.forEach((firm: any) => {
          let total = 0;
          items.forEach((item: any) => {
            const bid = bids.find(
              (b: any) =>
                b.temin_kalem_id === item.id &&
                (b.temin_firma_id === firm.temin_firma_id ||
                  b.temin_firma_id === firm.id),
            );
            if (bid && bid.birim_fiyat > 0) {
              total += bid.birim_fiyat * (item.miktar || 0);
            }
          });
          firm.total = total;
        });

        const nonZeroTotals = fileFirms.filter((f) => f.total > 0);
        const lowestTotal =
          nonZeroTotals.length > 0
            ? Math.min(...nonZeroTotals.map((f) => f.total))
            : 0;

        fileFirms.forEach((f) => {
          if (f.total > 0 && f.total === lowestTotal) {
            f.isWinner = true;
            const formattedTotal = f.total.toLocaleString("tr-TR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
            f.label = `🏆 ${f.unvan} (${formattedTotal} TL - En Düşük Teklif)`;
          } else if (f.total > 0) {
            const formattedTotal = f.total.toLocaleString("tr-TR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
            f.label = `🏢 ${f.unvan} (${formattedTotal} TL)`;
          } else {
            f.label = `🏢 ${f.unvan}`;
          }
        });

        fileFirms.sort((a, b) => (b.isWinner ? 1 : 0) - (a.isWinner ? 1 : 0));

        if (fileFirms.length === 0) {
          const allTeminFirmsRes = await window.electron.ipcRenderer.invoke(
            "db:query",
            `SELECT 
               COALESCE(f.id, df.firma_id, df.id) as id,
               COALESCE(
                 NULLIF(df.unvan, ''),
                 NULLIF(f.unvan, ''),
                 NULLIF(f.firma_adi, ''),
                 NULLIF(df.firma_adi, ''),
                 'İstekli Firma'
               ) as unvan,
               COALESCE(NULLIF(f.yetkili_ad_soyad, ''), NULLIF(df.yetkili_ad_soyad, '')) as yetkili_ad_soyad,
               COALESCE(NULLIF(f.telefon, ''), NULLIF(df.telefon, '')) as telefon,
               COALESCE(NULLIF(f.eposta, ''), NULLIF(df.email, '')) as eposta
             FROM DATA_TeminFirma df
             LEFT JOIN TANIM_Firma f ON df.firma_id = f.id
             ORDER BY df.id DESC`,
          );
          if (allTeminFirmsRes.success && allTeminFirmsRes.data.length > 0) {
            fileFirms = allTeminFirmsRes.data.filter(
              (f: any) => f.unvan && String(f.unvan).trim() !== "",
            );
          }
        }

        const globalFirmaRes = await window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT id, unvan, yetkili_ad_soyad, telefon, eposta FROM TANIM_Firma WHERE aktif_mi = 1 AND unvan IS NOT NULL AND unvan != '' ORDER BY unvan ASC",
        );
        const globalFirms = globalFirmaRes.success ? globalFirmaRes.data : [];

        const combinedFirms = [...fileFirms];
        globalFirms.forEach((g: any) => {
          if (
            g.unvan &&
            !combinedFirms.some(
              (f: any) =>
                f.unvan &&
                String(f.unvan).trim().toLowerCase() ===
                  String(g.unvan).trim().toLowerCase(),
            )
          ) {
            combinedFirms.push(g);
          }
        });

        setFirmaListesi(combinedFirms);

        const queryExecutor = async (
          sql: string,
          params: any[],
        ): Promise<any[]> => {
          const res = await window.electron.ipcRenderer.invoke(
            "db:query",
            sql,
            params,
          );
          if (res && res.success) {
            return res.data;
          }
          return [];
        };

        const mapping = getDefaultMappingForProcess(documentId || "");
        const resolver = new TemplateResolver(queryExecutor);
        const resolved = await resolver.resolve(mapping, activeDosyaId || 0);

        const snapshotRes = await window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT veri_json FROM DATA_DosyaSablonVeri WHERE temin_dosya_id = ? AND sablon_id = (SELECT id FROM TANIM_Sablon WHERE dosya_adi = ? LIMIT 1)",
          [activeDosyaId, `${documentId}.html`],
        );

        let finalData = { ...resolved };
        if (snapshotRes.success && snapshotRes.data.length > 0) {
          try {
            const savedData = JSON.parse(snapshotRes.data[0].veri_json);
            for (const [key, val] of Object.entries(savedData)) {
              if (val !== undefined && val !== null && val !== "") {
                if (
                  key === "antetSatirlari" &&
                  resolved.antetSatirlari &&
                  Array.isArray(resolved.antetSatirlari) &&
                  resolved.antetSatirlari.length > 0
                ) {
                  finalData.antetSatirlari = resolved.antetSatirlari;
                  continue;
                }
                if (
                  key === "ihtiyacKalemleri" &&
                  resolved.ihtiyacKalemleri &&
                  Array.isArray(resolved.ihtiyacKalemleri) &&
                  resolved.ihtiyacKalemleri.length > 0 &&
                  (!Array.isArray(val) || val.length === 0)
                ) {
                  finalData.ihtiyacKalemleri = resolved.ihtiyacKalemleri;
                  continue;
                }
                if (
                  (key === "komisyon" ||
                    key === "fiyatKomisyonu" ||
                    key === "gorevlendirilenler") &&
                  resolved[key] &&
                  Array.isArray(resolved[key]) &&
                  resolved[key].length > 0 &&
                  (!Array.isArray(val) ||
                    val.length === 0 ||
                    val.every(
                      (c: any) =>
                        !c.adSoyad || String(c.adSoyad).includes("BELİRTİLMESİ"),
                    ))
                ) {
                  finalData[key] = resolved[key];
                  continue;
                }
                const isSavedPlaceholder =
                  typeof val === "string" && val.includes("[Belirtilmedi");
                const isSavedAcme =
                  typeof val === "string" && val.toUpperCase().includes("ACME");
                const isSavedAntetPlaceholder =
                  Array.isArray(val) &&
                  val.some((s: any) => String(s).includes("[Belirtilmedi"));
                const hasFreshRealValue =
                  resolved[key] &&
                  !String(resolved[key]).includes("[Belirtilmedi");

                if (
                  (isSavedPlaceholder ||
                    isSavedAcme ||
                    isSavedAntetPlaceholder) &&
                  hasFreshRealValue
                ) {
                  continue;
                }
                finalData[key] = val;
              }
            }
            if (savedData.showLogoLeft !== undefined) {
              setLocalShowLogoLeft(Boolean(savedData.showLogoLeft));
            }
            if (savedData.showLogoRight !== undefined) {
              setLocalShowLogoRight(Boolean(savedData.showLogoRight));
            }
            if (savedData.olurYazisi !== undefined) {
              finalData.olurYazisi = savedData.olurYazisi;
            }
            if (savedData.orientation) {
              setOrientation(savedData.orientation);
            }
          } catch (e) {
            console.error("Failed to parse saved snapshot JSON", e);
          }
        }

        if (
          resolved.antetSatirlari &&
          Array.isArray(resolved.antetSatirlari) &&
          resolved.antetSatirlari.length > 0
        ) {
          finalData.antetSatirlari = resolved.antetSatirlari;
        }

        finalData.tarih = finalData.tarih || finalData.onayaSunulanTarih || "";
        finalData.onayTarihi =
          finalData.onayTarihi || finalData.dosyaTarihi || "";

        const suffixes = getInstitutionSuffixes(subInstitutionType || "belediye", {
          label: customSubInstitutionLabel,
          kurumumuz: customSubInstitutionKurumumuz,
          kurumu: customSubInstitutionKurumu,
          kurumlari: customSubInstitutionKurumlari,
        });
        const activeFirms = fileFirms.length > 0 ? fileFirms : combinedFirms;
        finalData.firmalar = activeFirms;
        finalData.firmaListesi = combinedFirms;

        const baseKalemler =
          finalData.ihtiyacKalemleri &&
          Array.isArray(finalData.ihtiyacKalemleri) &&
          finalData.ihtiyacKalemleri.length > 0
            ? finalData.ihtiyacKalemleri
            : items;

        if (baseKalemler && Array.isArray(baseKalemler)) {
          let grandTotalNum = 0;

          finalData.ihtiyacKalemleri = baseKalemler.map((kalem: any, idx: number) => {
            const miktarNum = Number(kalem.miktar || 0);
            let minPrice = Infinity;
            let bestFirmName = "";

            const teklifler = activeFirms.map((firm: any) => {
              const bid = bids.find(
                (b: any) =>
                  (b.temin_kalem_id === kalem.id || b.temin_kalem_id === kalem.siraNo) &&
                  (b.temin_firma_id === firm.temin_firma_id || b.temin_firma_id === firm.id)
              );

              const priceNum = bid ? Number(bid.birim_fiyat || 0) : 0;
              if (priceNum > 0 && priceNum < minPrice) {
                minPrice = priceNum;
                bestFirmName = firm.unvan || "";
              }

              const formattedPrice = priceNum > 0
                ? priceNum.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : "";

              const itemTotalNum = priceNum * miktarNum;
              const formattedTutar = itemTotalNum > 0
                ? itemTotalNum.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : "";

              return {
                firmaId: firm.id,
                firmaUnvan: firm.unvan,
                birimFiyat: priceNum,
                fiyat: formattedPrice,
                tutar: formattedTutar,
              };
            });

            const validMinPrice = minPrice !== Infinity ? minPrice : 0;
            const itemCostNum = validMinPrice * miktarNum;
            grandTotalNum += itemCostNum;

            return {
              ...kalem,
              siraNo: kalem.siraNo || idx + 1,
              malzemeAdi: kalem.malzemeAdi || kalem.kalem_adi || "",
              ozelligi: kalem.ozelligi || kalem.aciklama || "",
              birimi: kalem.birimi || kalem.birim || "",
              miktar: miktarNum,
              enUygunFirmaAdi: bestFirmName,
              enDusukFiyat: validMinPrice > 0
                ? validMinPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : "-",
              toplamBedel: itemCostNum > 0
                ? itemCostNum.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : "-",
              firmaTeklifleri: teklifler,
              firmaTeklifleriDetay: teklifler,
            };
          });

          // Build firm totals row
          const firmTotals = activeFirms.map((firm: any) => {
            let firmTotalNum = 0;
            finalData.ihtiyacKalemleri.forEach((kalem: any) => {
              const miktarNum = Number(kalem.miktar || 0);
              const tf = (kalem.firmaTeklifleriDetay || []).find(
                (t: any) => t.firmaId === firm.id || t.firmaUnvan === firm.unvan
              );
              if (tf && tf.birimFiyat > 0) {
                firmTotalNum += tf.birimFiyat * miktarNum;
              }
            });

            return {
              firmaId: firm.id,
              unvan: firm.unvan,
              toplam: firmTotalNum > 0
                ? firmTotalNum.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : "0,00",
            };
          });

          finalData.firmaToplamlari = firmTotals;
          finalData.firmaToplamlariDetay = firmTotals;

          if (!finalData.genelToplam || finalData.genelToplam === "0" || finalData.genelToplam === "0,00") {
            const winnerFirm = activeFirms.find((f: any) => f.isWinner);
            const calcTotal = winnerFirm && winnerFirm.total > 0 ? winnerFirm.total : grandTotalNum;
            if (calcTotal > 0) {
              finalData.genelToplam = calcTotal.toLocaleString("tr-TR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });
            }
          }
        }

        const defaultFirm =
          fileFirms.find((f: any) => f.isWinner) ||
          fileFirms[0] ||
          combinedFirms[0];
        if (defaultFirm) {
          if (!finalData.yukleniciFirma) {
            finalData.yukleniciFirma = defaultFirm.unvan;
          }
          if (
            !finalData.teslimEden_0_adSoyad ||
            finalData.teslimEden_0_adSoyad === ""
          ) {
            finalData.teslimEden_0_adSoyad = defaultFirm.unvan;
            finalData.teslimEden_0_unvan = defaultFirm.yetkili_ad_soyad
              ? `Yetkili: ${defaultFirm.yetkili_ad_soyad}`
              : "Yüklenici Firma / Yetkilisi";
          }
        }

        setFormData(finalData);
      } catch (err) {
        console.error("Error loading V2 template data:", err);
      }
    };

    loadInitialData();
  }, [
    isOpen,
    activeDosyaId,
    documentId,
    propInvitedFirms,
    subInstitutionType,
    customSubInstitutionLabel,
    customSubInstitutionKurumumuz,
    customSubInstitutionKurumu,
    customSubInstitutionKurumlari,
  ]);

  // 2. Document Scaling Logic
  useEffect(() => {
    if (zoomMode === "manual") {
      setPreviewScale(manualZoom);
      return;
    }
    if (!previewContainerRef.current || !isOpen) return;

    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      const targetWidth = orientation === "landscape" ? 1131 : 800;
      const PADDING = 64;
      const availableWidth = width - PADDING;

      if (availableWidth > 250 && availableWidth < targetWidth) {
        setPreviewScale(availableWidth / targetWidth);
      } else {
        setPreviewScale(1);
      }
    });

    observer.observe(previewContainerRef.current);
    return () => observer.disconnect();
  }, [isOpen, documentId, orientation, zoomMode, manualZoom]);

  // 3. Dropdown outside click handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDownloadOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 4. Save handler
  const handleSaveToDb = async (): Promise<void> => {
    if (!activeDosyaId || !documentId) return;
    setIsSaving(true);
    try {
      const dataToSave = {
        ...formData,
        showLogoLeft: localShowLogoLeft,
        showLogoRight: localShowLogoRight,
        olurYazisi: formData.olurYazisi !== false,
        orientation,
      };
      const jsonStr = JSON.stringify(dataToSave);
      const sablonRes = await window.electron.ipcRenderer.invoke(
        "db:query",
        "SELECT id FROM TANIM_Sablon WHERE dosya_adi = ? LIMIT 1",
        [`${documentId}.html`],
      );
      if (sablonRes.success && sablonRes.data.length > 0) {
        const sablonId = sablonRes.data[0].id;
        await window.electron.ipcRenderer.invoke(
          "db:query",
          `INSERT INTO DATA_DosyaSablonVeri (temin_dosya_id, sablon_id, veri_json, guncelleme_tarihi)
           VALUES (?, ?, ?, CURRENT_TIMESTAMP)
           ON CONFLICT(temin_dosya_id, sablon_id)
           DO UPDATE SET veri_json = excluded.veri_json, guncelleme_tarihi = CURRENT_TIMESTAMP`,
          [activeDosyaId, sablonId, jsonStr],
        );
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (e) {
      console.error("Belge kaydetme hatası:", e);
    } finally {
      setIsSaving(false);
    }
  };

  // 5. HTML compiler
  const getCompiledHtml = (): string => {
    if (!ActiveComponent) return "";
    const bodyHtml = renderToString(
      React.createElement(ActiveComponent, {
        data: {
          ...formData,
          tarih: formData.tarih || formData.onayaSunulanTarih || "",
          onayTarihi: formData.onayTarihi || formData.dosyaTarihi || "",
          solLogo: localShowLogoLeft ? formData.solLogo : null,
          sagLogo: localShowLogoRight ? formData.sagLogo : null,
          olurYazisi: formData.olurYazisi !== false,
          orientation,
        },
        orientation,
      }),
    );
    const styles = Array.from(
      document.querySelectorAll("style, link[rel='stylesheet']"),
    )
      .map((el) => el.outerHTML)
      .join("\n");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${activeTemplateConf?.name || "Belge"}</title>
          ${styles}
          <style>
            @page {
              size: A4 ${orientation};
              margin: 0;
            }
            body {
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .document-container {
              box-shadow: none !important;
              margin: 0 !important;
            }
          </style>
        </head>
        <body>
          ${bodyHtml}
        </body>
      </html>
    `;
  };

  // 6. Print & PDF Action Handlers
  const handlePrint = async (): Promise<void> => {
    setIsPrinting(true);
    try {
      const html = getCompiledHtml();
      await window.electron.ipcRenderer.invoke("print-html", html, {
        silent: false,
      });
    } catch (error) {
      console.error("Yazdırma hatası:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePdf = async (): Promise<void> => {
    setIsPrinting(true);
    try {
      const html = getCompiledHtml();
      const titleForFile = activeTemplateConf?.name || "Belge";
      await window.electron.ipcRenderer.invoke(
        "export-pdf",
        html,
        null,
        titleForFile,
      );
    } catch (error) {
      console.error("PDF kaydetme hatası:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleOpenPdfInNewTab = async (): Promise<void> => {
    setIsPrinting(true);
    try {
      const html = getCompiledHtml();
      await window.electron.ipcRenderer.invoke("open-pdf-external", html);
    } catch (error) {
      console.error("PDF önizleme hatası:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleRefreshFromDb = async (): Promise<void> => {
    const isConfirmed = window.confirm(
      "Şablonu veritabanındaki güncel verilerle yenilemek istediğinize emin misiniz? Yaptığınız manuel değişiklikler silinecektir.",
    );
    if (!isConfirmed || !activeDosyaId) return;

    try {
      const queryExecutor = async (
        sql: string,
        params: any[],
      ): Promise<any[]> => {
        const res = await window.electron.ipcRenderer.invoke(
          "db:query",
          sql,
          params,
        );
        if (res && res.success) {
          return res.data;
        }
        return [];
      };

      const mapping = getDefaultMappingForProcess(documentId || "");
      const resolver = new TemplateResolver(queryExecutor);
      const resolved = await resolver.resolve(mapping, activeDosyaId);

      const suffixes = getInstitutionSuffixes(subInstitutionType || "belediye", {
        label: customSubInstitutionLabel,
        kurumumuz: customSubInstitutionKurumumuz,
        kurumu: customSubInstitutionKurumu,
        kurumlari: customSubInstitutionKurumlari,
      });

      setFormData({
        ...resolved,
        tarih: resolved.tarih || resolved.onayaSunulanTarih || "",
        onayTarihi: resolved.onayTarihi || resolved.dosyaTarihi || "",
        kurumumuz: suffixes.kurumumuz,
      });
    } catch (e) {
      console.error("Failed to refresh template resolution:", e);
    }
  };

  return {
    activeDosyaId,
    activeTemplateConf,
    ActiveComponent,
    formData,
    setFormData,
    personelListesi,
    firmaListesi,
    localShowLogoLeft,
    setLocalShowLogoLeft,
    localShowLogoRight,
    setLocalShowLogoRight,
    orientation,
    setOrientation,
    isEditingMode,
    setIsEditingMode,
    previewScale,
    isPrinting,
    isSaving,
    saveSuccess,
    downloadOpen,
    setDownloadOpen,
    sidebarOpen,
    setSidebarOpen,
    zoomMode,
    setZoomMode,
    manualZoom,
    setManualZoom,
    isFullScreen,
    setIsFullScreen,
    previewContainerRef,
    dropdownRef,
    handleSaveToDb,
    handlePrint,
    handlePdf,
    handleOpenPdfInNewTab,
    handleRefreshFromDb,
  };
}
