import { useEffect, useRef, useState } from "react";
import { renderToString } from "react-dom/server";
import React from "react";
import {
  IhtiyacListesiType,
  TemplateEditProvider,
  TemplateResolver,
} from "@temin360/document-templates";
import { useWorkspaceStore } from "../../../../../store/workspaceStore";
import { useSettingsStore } from "../../../../../store/settingsStore";
import { usePrintQueueStore } from "../../../../../store/printQueueStore";
import { getDefaultMappingForProcess } from "../../../../../constants/mappings";
import { getInstitutionSuffixes } from "../../../../../utils/kurumHelper";
import { Personel } from "../types";
import {
  resolveTemplateConfig,
  TEMPLATE_OPTIONS,
} from "../templateResolver";
import { buildExportFileName } from "../../../../../utils/exportFileName";
import { documentPreloadService } from "../../../../../services/documentPreloadService";

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
    Number(sessionStorage.getItem("workspace_dosya_id") || 0) ||
    Number(localStorage.getItem("active_dosya_id") || 0);

  const [selectedDocId, setSelectedDocId] = useState<string>(
    () => documentId || "ihtiyac-listesi",
  );
  const [prevPropDocId, setPrevPropDocId] = useState<string | null>(documentId);

  if (documentId !== prevPropDocId) {
    setPrevPropDocId(documentId);
    if (documentId) {
      setSelectedDocId(documentId);
    }
  }

  const {
    logoLeft,
    logoRight,
    institutionLogo,
    showLogoLeft,
    showLogoRight,
    subInstitutionType,
    customSubInstitutionLabel,
    customSubInstitutionKurumumuz,
    customSubInstitutionKurumu,
    customSubInstitutionKurumlari,
  } = useSettingsStore();

  const {
    config: activeTemplateConf,
    component: ActiveComponent,
    resolvedId,
  } = resolveTemplateConfig(selectedDocId);

  const initialPreloaded = documentPreloadService.getCachedDocument(
    resolvedId,
    activeDosyaId,
  );

  const [formData, setFormData] = useState<Partial<IhtiyacListesiType>>(() => {
    if (initialPreloaded?.resolvedData) {
      return initialPreloaded.resolvedData;
    }
    if (propInvitedFirms && propInvitedFirms.length > 0) {
      return {
        firmalar: propInvitedFirms.map((f: any) => ({
          unvan: f.unvan || f.firma_adi || "İstekli Firma",
          yetkili_ad_soyad: f.yetkili_ad_soyad || "",
        })),
      };
    }
    return {};
  });

  const [personelListesi, setPersonelListesi] = useState<Personel[]>(() => {
    return initialPreloaded?.payloadData?.personelListesi || [];
  });
  const [firmaListesi, setFirmaListesi] = useState<any[]>(() => {
    if (initialPreloaded?.payloadData?.firmaListesi) {
      return initialPreloaded.payloadData.firmaListesi;
    }
    if (propInvitedFirms && propInvitedFirms.length > 0) {
      return propInvitedFirms.map((f: any) => ({
        temin_firma_id: f.temin_firma_id || f.id,
        id: f.id || f.firma_id || f.temin_firma_id,
        unvan: f.unvan || f.firma_adi || "İstekli Firma",
        yetkili_ad_soyad: f.yetkili_ad_soyad || "",
        telefon: f.telefon || "",
        eposta: f.eposta || f.email || "",
      }));
    }
    return [];
  });

  const [localShowLogoLeft, setLocalShowLogoLeft] = useState(showLogoLeft);
  const [localShowLogoRight, setLocalShowLogoRight] = useState(showLogoRight);
  const [dosyaRecord, setDosyaRecord] = useState<any>(
    () => initialPreloaded?.payloadData?.dosya || null,
  );
  const [isLoading, setIsLoading] = useState(!initialPreloaded);
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

  // Auto-scale: belge genişliği A4 = 800px (portrait) / 1131px (landscape)
  // Container'ın içine sığacak şekilde scale hesapla
  useEffect(() => {
    const container = previewContainerRef.current
    if (!container) return

    const DOC_W = orientation === 'landscape' ? 1131 : 800
    const PADDING = 64 // py-8 = 32px * 2

    const recalculate = () => {
      if (zoomMode === 'manual') {
        setPreviewScale(manualZoom)
        return
      }
      const availableW = container.clientWidth - PADDING
      if (availableW <= 0) return
      const scale = Math.min(availableW / DOC_W, 1) // max 1x, sığmıyorsa küçült
      setPreviewScale(Math.round(scale * 1000) / 1000)
    }

    recalculate()

    const observer = new ResizeObserver(recalculate)
    observer.observe(container)
    return () => observer.disconnect()
  }, [orientation, zoomMode, manualZoom])
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const preloaded = documentPreloadService.getCachedDocument(
      resolvedId,
      activeDosyaId,
    );
    if (!preloaded) {
      setIsLoading(true);
    }

    const loadInitialData = async (): Promise<void> => {
      try {
        const queryExecutor = async (
          sql: string,
          params: any[],
        ): Promise<any[]> => {
          if (!window.electron?.ipcRenderer) return [];
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

        const mapping = getDefaultMappingForProcess(resolvedId);
        const resolver = new TemplateResolver(queryExecutor);

        // Fetch complete pre-computed document payload via single native Electron IPC handler + resolver in parallel
        const [payloadRes, resolved] = await Promise.all([
          window.electron?.ipcRenderer
            ? window.electron.ipcRenderer.invoke("belge:get-document-payload", {
                dosyaId: activeDosyaId,
                documentId: resolvedId,
              })
            : Promise.resolve({ success: false, data: {} }),
          resolver.resolve(mapping, activeDosyaId || 0),
        ]);

        if (!isMounted) return;

        const payloadData = payloadRes?.success ? payloadRes.data : {};
        if (payloadData.dosya) {
          setDosyaRecord(payloadData.dosya);
        } else if (activeDosyaId) {
          queryExecutor("SELECT * FROM DATA_TeminDosyasi WHERE id = ?", [activeDosyaId]).then((res) => {
            if (res && res[0]) setDosyaRecord(res[0]);
          });
        }
        const personelList = payloadData.personelListesi || [];
        const fileFirms = payloadData.fileFirms || [];
        const combinedFirms = payloadData.firmaListesi || [];
        const items = payloadData.items || [];
        const bids = payloadData.bids || [];
        const snapshotData = payloadData.savedSnapshot;

        setPersonelListesi(personelList);
        setFirmaListesi(combinedFirms);

        let finalData = { ...resolved };
        if (snapshotData) {
          try {
            const savedData = snapshotData;
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
                let cleanVal = val;
                if (typeof cleanVal === "string") {
                  const str = cleanVal as string;
                  const jsonMatch = str.match(
                    /"?[a-zA-Z0-9_]+"?\s*:\s*"([^"]+)"/,
                  );
                  const baseStr = jsonMatch ? jsonMatch[1] : str;
                  cleanVal = baseStr.replace(/^["']|["',]+$/g, "").trim();
                }
                finalData[key] = cleanVal;
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

        const resolvedSolLogo =
          payloadData.solLogo ||
          resolved.solLogo ||
          logoLeft ||
          institutionLogo ||
          null;
        const resolvedSagLogo =
          payloadData.sagLogo || resolved.sagLogo || logoRight || null;

        if (resolvedSolLogo) {
          finalData.solLogo = resolvedSolLogo;
        }
        if (resolvedSagLogo) {
          finalData.sagLogo = resolvedSagLogo;
        }

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

        setLocalShowLogoLeft(showLogoLeft);
        setLocalShowLogoRight(showLogoRight);
        setFormData(finalData);
      } catch (err) {
        console.error("Error loading V2 template data:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadInitialData();
  }, [
    isOpen,
    activeDosyaId,
    selectedDocId,
    resolvedId,
    propInvitedFirms,
    showLogoLeft,
    showLogoRight,
    logoLeft,
    logoRight,
    institutionLogo,
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
  }, [isOpen, selectedDocId, orientation, zoomMode, manualZoom]);

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
    if (!activeDosyaId || !resolvedId) return;
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
        "SELECT id FROM TANIM_Sablon WHERE dosya_adi = ? OR dosya_adi = ? LIMIT 1",
        [`${resolvedId}.html`, `${selectedDocId}.html`],
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
        usePrintQueueStore.getState().invalidateReadyStatus(activeDosyaId, resolvedId, "Belge içeriği güncellendi");
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
      React.createElement(
        TemplateEditProvider,
        {
          isEditing: false,
          personelListesi,
          firmaListesi,
          firstPageLimit: formData.firstPageLimit,
        },
        React.createElement(ActiveComponent, {
          data: {
            ...formData,
            personelListesi,
            firmaListesi,
            tarih: formData.tarih || formData.onayaSunulanTarih || "",
            onayTarihi: formData.onayTarihi || formData.dosyaTarihi || "",
            solLogo: localShowLogoLeft ? formData.solLogo : null,
            sagLogo: localShowLogoRight ? formData.sagLogo : null,
            olurYazisi: formData.olurYazisi !== false,
            orientation,
          },
          orientation,
        }),
      ),
    );

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${activeTemplateConf?.name || "Belge Önizleme"}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page {
              size: A4 ${orientation};
              margin: 10mm;
            }
            body {
              font-family: Arial, Helvetica, sans-serif;
              color: #000;
              margin: 0;
              padding: 0;
              background-color: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            @media print {
              body {
                background: white !important;
                padding: 0 !important;
              }
              .page-break {
                page-break-before: always;
              }
            }
          </style>
        </head>
        <body>
          <div class="a4-document-root ${orientation}">
            ${bodyHtml}
          </div>
        </body>
      </html>
    `;
  };

  // 6. Print handler
  const handlePrint = async (): Promise<void> => {
    setIsPrinting(true);
    try {
      const htmlContent = getCompiledHtml();
      await window.electron.ipcRenderer.invoke("app:print-html", {
        html: htmlContent,
        orientation,
      });
    } catch (e) {
      console.error("Yazdırma hatası:", e);
    } finally {
      setIsPrinting(false);
    }
  };

  // 7. PDF Export (Standardized {butceYili}-{dtNo}-{belgeAdi}.pdf)
  const handlePdf = async (): Promise<void> => {
    setIsPrinting(true);
    try {
      const htmlContent = getCompiledHtml();
      const defaultFilename = buildExportFileName({
        dosya: dosyaRecord,
        butceYili: (formData as any)?.butceYili || (formData as any)?.butce_yili || dosyaRecord?.butce_yili,
        teminNo: (formData as any)?.teminNo || (formData as any)?.temin_no || dosyaRecord?.temin_no,
        belgeAdi: activeTemplateConf?.name || "Belge",
        extension: "pdf",
      });

      try {
        const res = await window.electron.ipcRenderer.invoke("app:save-pdf-as", {
          html: htmlContent,
          orientation,
          defaultFilename,
        });
        if (res && res.success) {
          alert("PDF başarıyla kaydedildi.");
          return;
        }
      } catch {
        // Fallback: Doğrudan harici PDF oluşturucu kanalını çalıştır
        await window.electron.ipcRenderer.invoke("belge:open-pdf-external", htmlContent);
      }
    } catch (e) {
      console.error("PDF kaydetme hatası:", e);
    } finally {
      setIsPrinting(false);
      setDownloadOpen(false);
    }
  };

  // 7.1 Word (DOCX) Export (Standardized {butceYili}-{dtNo}-{belgeAdi}.docx)
  const handleDocx = async (): Promise<void> => {
    setIsPrinting(true);
    try {
      const htmlContent = getCompiledHtml();
      const defaultFilename = buildExportFileName({
        dosya: dosyaRecord,
        butceYili: (formData as any)?.butceYili || (formData as any)?.butce_yili || dosyaRecord?.butce_yili,
        teminNo: (formData as any)?.teminNo || (formData as any)?.temin_no || dosyaRecord?.temin_no,
        belgeAdi: activeTemplateConf?.name || "Belge",
        extension: "docx",
      });

      const res = await window.electron.ipcRenderer.invoke("belge:export-docx", {
        html: htmlContent,
        defaultFilename,
      });
      if (res && res.success) {
        alert("Word (DOCX) belgesi başarıyla kaydedildi.");
      }
    } catch (e) {
      console.error("Word (DOCX) kaydetme hatası:", e);
    } finally {
      setIsPrinting(false);
      setDownloadOpen(false);
    }
  };

  // 8. Open PDF in New Tab / External Viewer
  const handleOpenPdfInNewTab = async (): Promise<void> => {
    setIsPrinting(true);
    try {
      const htmlContent = getCompiledHtml();
      try {
        await window.electron.ipcRenderer.invoke("app:open-pdf-preview", {
          html: htmlContent,
          orientation,
        });
      } catch {
        // Fallback: Standart harici PDF önizleme kanalını çağır
        await window.electron.ipcRenderer.invoke("belge:open-pdf-external", htmlContent);
      }
    } catch (e) {
      console.error("PDF önizleme penceresi açılırken hata:", e);
    } finally {
      setIsPrinting(false);
      setDownloadOpen(false);
    }
  };

  // 9. Reset and refresh data from database
  const handleRefreshFromDb = async (): Promise<void> => {
    const isConfirmed = confirm(
      "Belge üzerindeki tüm verileri veritabanındaki güncel değerlerle sıfırlamak istiyor musunuz? Canlı düzenlemeleriniz kaybolabilir.",
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

      const mapping = getDefaultMappingForProcess(resolvedId);
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
    isLoading,
    activeDosyaId,
    dosyaRecord,
    selectedDocId,
    setSelectedDocId,
    resolvedId,
    templateOptions: TEMPLATE_OPTIONS,
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
    handleDocx,
    handleOpenPdfInNewTab,
    handleRefreshFromDb,
  };
}
