import React, { useEffect, useRef, useState } from "react";
import { renderToString } from "react-dom/server";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Eye,
  FileText,
  MoreVertical,
  Printer,
  RefreshCw,
  Save,
  X,
} from "lucide-react";
import { useWorkspaceStore } from "../../../../store/workspaceStore";
import { useSettingsStore } from "../../../../store/settingsStore";
import {
  IhtiyacListesiType,
  TEMPLATE_REGISTRY,
  TemplateComponentType,
  TemplateEditProvider,
  TemplateResolver,
} from "@dt-asistan/document-templates";
import * as Templates from "@dt-asistan/document-templates";
import { getDefaultMappingForProcess } from "../../../../constants/mappings";
import { getInstitutionSuffixes } from "../../../../utils/kurumHelper";

interface DocumentPreviewModalV2Props {
  isOpen: boolean;
  documentId: string | null;
  onClose: () => void;
  isModal?: boolean;
  backLabel?: string;
}

interface Personel {
  id: number;
  ad_soyad: string;
  unvan?: string;
  telefon?: string;
  eposta?: string;
}

const V2_TEMPLATES_MAP: Record<string, TemplateComponentType> = {
  IhtiyacListesi: Templates.IhtiyacListesi as TemplateComponentType,
  LuzumMuzekkeresi: Templates.LuzumMuzekkeresi as TemplateComponentType,
  LuzumMuzekkeresiOnayEki: Templates
    .LuzumMuzekkeresiOnayEki as TemplateComponentType,
  LuzumMuzekkeresiTeslimTesellum: Templates
    .LuzumMuzekkeresiTeslimTesellum as TemplateComponentType,
  HarcamaTalimati: Templates.HarcamaTalimati as TemplateComponentType,
  KomisyonGorevlendirmeOnayi: Templates
    .KomisyonGorevlendirmeOnayi as TemplateComponentType,
  KomisyonGorevlendirmeOnayiEki: Templates
    .KomisyonGorevlendirmeOnayiEki as TemplateComponentType,
};

class TemplateErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Template rendering error:", error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function DocumentPreviewModalV2({
  isOpen,
  documentId,
  onClose,
  isModal = false,
  backLabel = "İşlemlere Dön",
}: DocumentPreviewModalV2Props): React.JSX.Element | null {
  const { activeDosyaId } = useWorkspaceStore();
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
  const [localShowLogoLeft, setLocalShowLogoLeft] = useState(showLogoLeft);
  const [localShowLogoRight, setLocalShowLogoRight] = useState(showLogoRight);
  const [isEditingMode, setIsEditingMode] = useState(true);
  const [previewScale, setPreviewScale] = useState(1);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSaveToDb = async (): Promise<void> => {
    if (!activeDosyaId || !documentId) return;
    setIsSaving(true);
    try {
      const dataToSave = {
        ...formData,
        showLogoLeft: localShowLogoLeft,
        showLogoRight: localShowLogoRight,
        olurYazisi: formData.olurYazisi !== false,
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

  // 1. Find template config in registry
  const activeTemplateConf = TEMPLATE_REGISTRY.find((t) => t.id === documentId);

  const ActiveComponent = activeTemplateConf
    ? V2_TEMPLATES_MAP[activeTemplateConf.name]
    : null;

  // 2. Fetch data from DB & personnel list on open
  useEffect(() => {
    if (!isOpen || !activeDosyaId) return;

    const loadInitialData = async (): Promise<void> => {
      try {
        // Fetch personnel list for signature dropdowns
        const personelRes = await window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT id, ad_soyad, unvan, telefon, eposta FROM TANIM_Personel WHERE aktif_mi = 1 ORDER BY ad_soyad ASC",
        );
        if (personelRes.success) {
          setPersonelListesi(personelRes.data);
        }

        // Setup TemplateResolver
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // Resolve using the pre-defined mapping
        const resolved = await resolver.resolve(
          mapping,
          activeDosyaId,
        );

        // Fetch or load saved snapshot values if exists
        const snapshotRes = await window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT veri_json FROM DATA_DosyaSablonVeri WHERE temin_dosya_id = ? AND sablon_id = (SELECT id FROM TANIM_Sablon WHERE dosya_adi = ? LIMIT 1)",
          [activeDosyaId, `${documentId}.html`],
        );

        let finalData = { ...resolved };
        if (snapshotRes.success && snapshotRes.data.length > 0) {
          try {
            const savedData = JSON.parse(snapshotRes.data[0].veri_json);
            // Smart merge inspired by V1: do not let stale placeholders or old hardcoded antets overwrite fresh resolved data
            for (const [key, val] of Object.entries(savedData)) {
              if (val !== undefined && val !== null && val !== "") {
                if (
                  key === "antetSatirlari" && resolved.antetSatirlari &&
                  Array.isArray(resolved.antetSatirlari) &&
                  resolved.antetSatirlari.length > 0
                ) {
                  finalData.antetSatirlari = resolved.antetSatirlari;
                  continue;
                }
                const isSavedPlaceholder = typeof val === "string" &&
                  val.includes("[Belirtilmedi");
                const isSavedAcme = typeof val === "string" &&
                  val.toUpperCase().includes("ACME");
                const isSavedAntetPlaceholder = Array.isArray(val) &&
                  val.some((s: any) => String(s).includes("[Belirtilmedi"));
                const hasFreshRealValue = resolved[key] &&
                  !String(resolved[key]).includes("[Belirtilmedi");

                if (
                  (isSavedPlaceholder || isSavedAcme ||
                    isSavedAntetPlaceholder) && hasFreshRealValue
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
          } catch (e) {
            console.error("Failed to parse saved snapshot JSON", e);
          }
        }

        if (
          resolved.antetSatirlari && Array.isArray(resolved.antetSatirlari) &&
          resolved.antetSatirlari.length > 0
        ) {
          finalData.antetSatirlari = resolved.antetSatirlari;
        }

        finalData.tarih = finalData.tarih || finalData.onayaSunulanTarih || "";
        finalData.onayTarihi = finalData.onayTarihi || finalData.dosyaTarihi ||
          "";

        // Derive kurumumuz from institution type suffix (e.g. "Belediyemiz", "Müdürlüğümüz")
        const suffixes = getInstitutionSuffixes(
          subInstitutionType || "belediye",
          {
            label: customSubInstitutionLabel,
            kurumumuz: customSubInstitutionKurumumuz,
            kurumu: customSubInstitutionKurumu,
            kurumlari: customSubInstitutionKurumlari,
          },
        );
        finalData.kurumumuz = suffixes.kurumumuz;

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
    subInstitutionType,
    customSubInstitutionLabel,
    customSubInstitutionKurumumuz,
    customSubInstitutionKurumu,
    customSubInstitutionKurumlari,
  ]);

  // 3. Document scaling logic based on preview container size
  useEffect(() => {
    if (!previewContainerRef.current || !isOpen) return;

    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      const A4_WIDTH = 800; // Base layout width
      const PADDING = 64;
      const availableWidth = width - PADDING;

      if (availableWidth > 250 && availableWidth < A4_WIDTH) {
        setPreviewScale(availableWidth / A4_WIDTH);
      } else {
        setPreviewScale(1);
      }
    });

    observer.observe(previewContainerRef.current);
    return () => observer.disconnect();
  }, [isOpen, documentId]);

  // 4. Dropdown closing logic
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

  if (!isOpen) return null;

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
        },
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

  // 6. Action handlers
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      const resolved = await resolver.resolve(
        mapping,
        activeDosyaId,
      );

      const suffixes = getInstitutionSuffixes(
        subInstitutionType || "belediye",
        {
          label: customSubInstitutionLabel,
          kurumumuz: customSubInstitutionKurumumuz,
          kurumu: customSubInstitutionKurumu,
          kurumlari: customSubInstitutionKurumlari,
        },
      );

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

  const mainContent = (
    <div
      className={isModal
        ? "bg-white dark:bg-slate-900 w-full max-w-[95vw] h-[95vh] rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden"
        : "bg-white dark:bg-slate-900 w-full h-full min-h-[85vh] rounded-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"}
      onClick={(e) => isModal && e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 gap-4">
        {/* Left: Back Button & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-xl transition-colors cursor-pointer shrink-0 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs"
            title={`${backLabel} seçeneğine geri dön`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{backLabel}</span>
          </button>

          <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2 truncate">
              {activeTemplateConf?.name.replace(/([A-Z])/g, " $1").trim() ||
                "Belge Düzenleyici"}
              <span className="text-[9px] px-2 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 font-extrabold uppercase tracking-wider shrink-0">
                Akıllı Belge
              </span>
            </h2>
          </div>
        </div>

        {/* Right: Actions (Save, Print, Options, Close) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Main Save Button */}
          <button
            onClick={handleSaveToDb}
            disabled={isSaving}
            className={`px-4 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 text-xs cursor-pointer shadow-2xs ${
              saveSuccess
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600"
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>
              {saveSuccess
                ? "Kaydedildi!"
                : isSaving
                ? "Kaydediliyor..."
                : "Kaydet"}
            </span>
          </button>

          {/* Main Print Button */}
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="px-4.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 text-xs shadow-2xs shadow-blue-600/20 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Yazdır</span>
          </button>

          {/* Options Dropdown (3-Dots Menu) */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDownloadOpen((v) => !v)}
              disabled={isPrinting}
              title="Diğer Seçenekler"
              className="p-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all flex items-center justify-center disabled:opacity-50 text-xs shadow-2xs cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {downloadOpen && (
              <div className="absolute top-full mt-2 right-0 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
                <button
                  onClick={async () => {
                    setDownloadOpen(false);
                    await handleRefreshFromDb();
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Güncel Verileri Al</span>
                </button>

                <button
                  onClick={async () => {
                    setDownloadOpen(false);
                    await handlePdf();
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2.5 cursor-pointer transition-colors border-t border-slate-100 dark:border-slate-800/50"
                >
                  <Download className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>PDF Olarak Kaydet</span>
                </button>

                <button
                  onClick={async () => {
                    setDownloadOpen(false);
                    await handleOpenPdfInNewTab();
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2.5 cursor-pointer transition-colors border-t border-slate-100 dark:border-slate-800/50"
                >
                  <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Tarayıcıda Aç</span>
                </button>
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel: Document Settings */}
        <div
          className={`bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 flex flex-col ${
            sidebarOpen ? "w-72" : "w-12"
          }`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  Belge Ayarları
                </span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg transition-colors cursor-pointer mx-auto"
              title={sidebarOpen ? "Paneli Daralt" : "Paneli Genişlet"}
            >
              {sidebarOpen
                ? <ChevronLeft className="w-4 h-4" />
                : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {sidebarOpen && (
            <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 rounded-xl text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
                💡 <strong>Canlı Düzenleme:</strong>{" "}
                Belge üzerindeki metin, sayı, tarih ve imza alanlarını sağdaki
                A4 sayfasında doğrudan tıklayarak düzenleyebilirsiniz.
              </div>

              {/* Toggles & Settings */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Görünüm & Düzenleme Kontrolleri
                </span>

                <label className="flex items-center justify-between p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 rounded-xl cursor-pointer hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                        Metin Düzenleme Modu
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                        {isEditingMode
                          ? "Canlı düzenleme açık"
                          : "Önizleme modu (Sabit Metin)"}
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isEditingMode}
                    onChange={(e) => setIsEditingMode(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-slate-300 transition-colors">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    OLUR Bloğunu Göster
                  </span>
                  <input
                    type="checkbox"
                    checked={formData.olurYazisi !== false}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        olurYazisi: e.target.checked,
                      }))}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-slate-300 transition-colors">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Sol Amblem / Logo
                  </span>
                  <input
                    type="checkbox"
                    checked={localShowLogoLeft}
                    onChange={(e) => setLocalShowLogoLeft(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-slate-300 transition-colors">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Sağ Amblem / Logo
                  </span>
                  <input
                    type="checkbox"
                    checked={localShowLogoRight}
                    onChange={(e) => setLocalShowLogoRight(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Right panel: Live A4 PDF Layout Preview */}
        <div
          ref={previewContainerRef}
          className="flex-1 bg-slate-200/50 dark:bg-slate-950 flex justify-center items-start overflow-y-auto shadow-inner border-l border-slate-200 dark:border-slate-800 h-full py-8 custom-scrollbar"
        >
          <div
            className="bg-white shadow-2xl origin-top transition-transform duration-200 ease-out"
            style={{
              transform: `scale(${previewScale})`,
              width: "800px",
              minHeight: "1131px",
            }}
          >
            {ActiveComponent
              ? (
                <TemplateErrorBoundary
                  fallback={
                    <div className="p-8 text-center text-red-500 font-semibold bg-red-50 dark:bg-red-950/20 border border-red-250 dark:border-red-900 rounded-xl m-4">
                      ⚠️ Belge şablonu çizilirken bir hata oluştu. Değişkenleri
                      kontrol edip tekrar deneyiniz.
                    </div>
                  }
                >
                  <TemplateEditProvider
                    isEditing={isEditingMode}
                    onFieldChange={(key, val) =>
                      setFormData((prev) => ({ ...prev, [key]: val }))}
                  >
                    {React.createElement(ActiveComponent, {
                      data: {
                        ...formData,
                        tarih: formData.tarih || formData.onayaSunulanTarih ||
                          "",
                        onayTarihi: formData.onayTarihi ||
                          formData.dosyaTarihi || "",
                        solLogo: localShowLogoLeft ? formData.solLogo : null,
                        sagLogo: localShowLogoRight ? formData.sagLogo : null,
                        olurYazisi: formData.olurYazisi !== false,
                      },
                    })}
                  </TemplateEditProvider>
                </TemplateErrorBoundary>
              )
              : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 mt-32">
                  <FileText className="w-12 h-12 mb-3 opacity-20" />
                  <p className="font-medium">
                    Şablon Yüklenemedi veya Seçilmedi
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        {mainContent}
      </div>
    );
  }

  return mainContent;
}

export default DocumentPreviewModalV2;
