import React, { useEffect, useRef, useState } from "react";
import { renderToString } from "react-dom/server";
import {
  Download,
  Eye,
  FileText,
  MoreVertical,
  Printer,
  RefreshCw,
  X,
} from "lucide-react";
import { useWorkspaceStore } from "../../../../store/workspaceStore";
import { useSettingsStore } from "../../../../store/settingsStore";
import {
  IhtiyacListesiType,
  TEMPLATE_REGISTRY,
  TemplateComponentType,
  TemplateResolver,
} from "@dt-asistan/document-templates";
import * as Templates from "@dt-asistan/document-templates";
import { getDefaultMappingForProcess } from "../../../../constants/mappings";
import { getInstitutionSuffixes } from "../../../../utils/kurumHelper";

interface DocumentPreviewModalV2Props {
  isOpen: boolean;
  documentId: string | null;
  onClose: () => void;
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
  const [previewScale, setPreviewScale] = useState(1);
  const [isPrinting, setIsPrinting] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

        finalData.tarih = finalData.tarih || finalData.onayaSunulanTarih || '';
        finalData.onayTarihi = finalData.onayTarihi || finalData.dosyaTarihi || '';

        // Derive kurumumuz from institution type suffix (e.g. "Belediyemiz", "Müdürlüğümüz")
        const suffixes = getInstitutionSuffixes(subInstitutionType || 'belediye', {
          label: customSubInstitutionLabel,
          kurumumuz: customSubInstitutionKurumumuz,
          kurumu: customSubInstitutionKurumu,
          kurumlari: customSubInstitutionKurumlari,
        });
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

  // 5. Generate compiled HTML string containing current CSS stylesheets
  const getCompiledHtml = (): string => {
    const bodyHtml = renderToString(
      <ActiveComponent
        data={{
          ...formData,
          tarih: formData.tarih || formData.onayaSunulanTarih || '',
          onayTarihi: formData.onayTarihi || formData.dosyaTarihi || '',
          solLogo: showLogoLeft ? formData.solLogo : null,
          sagLogo: showLogoRight ? formData.sagLogo : null,
        }}
      />,
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

      const suffixes = getInstitutionSuffixes(subInstitutionType || 'belediye', {
        label: customSubInstitutionLabel,
        kurumumuz: customSubInstitutionKurumumuz,
        kurumu: customSubInstitutionKurumu,
        kurumlari: customSubInstitutionKurumlari,
      });

      setFormData({
        ...resolved,
        tarih: resolved.tarih || resolved.onayaSunulanTarih || '',
        onayTarihi: resolved.onayTarihi || resolved.dosyaTarihi || '',
        kurumumuz: suffixes.kurumumuz,
      });
    } catch (e) {
      console.error("Failed to refresh template resolution:", e);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-[95vw] h-[95vh] rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
                {activeTemplateConf?.name.replace(/([A-Z])/g, " $1").trim() ||
                  "Belge Düzenleyici"}
                <span className="text-[9px] px-2 py-0.5 rounded bg-blue-50 text-blue-655 dark:bg-blue-900/40 dark:text-blue-400 font-extrabold uppercase tracking-wider">
                  Akıllı Belge
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                İhtiyaçlarınızı doğru ve eksiksiz şekilde belgelemek, satın alma
                sürecinizin başarısı için en önemli adımdır. Aşağıdaki
                alanlardan belgenizi anlık düzenleyebilirsiniz.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-1 overflow-hidden">
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
                        ⚠️ Belge şablonu çizilirken bir hata oluştu.
                        Değişkenleri kontrol edip tekrar deneyiniz.
                      </div>
                    }
                  >
                    <ActiveComponent
                      data={{
                        ...formData,
                        tarih: formData.tarih || formData.onayaSunulanTarih || '',
                        onayTarihi: formData.onayTarihi || formData.dosyaTarihi || '',
                        solLogo: showLogoLeft ? formData.solLogo : null,
                        sagLogo: showLogoRight ? formData.sagLogo : null,
                      }}
                    />
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

        {/* Footer controls */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Belge Tarihi:
              </label>
              <input
                type="text"
                value={formData.tarih || formData.onayaSunulanTarih || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    tarih: e.target.value,
                    onayaSunulanTarih: e.target.value,
                  }))}
                placeholder="GG.AA.YYYY"
                className="w-28 px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Onay Tarihi (OLUR):
              </label>
              <input
                type="text"
                value={formData.onayTarihi || formData.dosyaTarihi || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    onayTarihi: e.target.value,
                    dosyaTarihi: e.target.value,
                  }))}
                placeholder="GG.AA.YYYY"
                className="w-28 px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Options Dropdown (3-Dots Menu) */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDownloadOpen((v) => !v)}
                disabled={isPrinting}
                title="Diğer Seçenekler"
                className="p-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all flex items-center justify-center disabled:opacity-50 text-sm shadow-2xs cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {downloadOpen && (
                <div className="absolute bottom-full mb-2 right-0 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 overflow-hidden">
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

            {/* Main Print Button */}
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 text-sm shadow-sm shadow-blue-600/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Yazdır</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentPreviewModalV2;
