import React, { useEffect, useRef, useState } from "react";
import { renderToString } from "react-dom/server";
import {
  Download,
  Eye,
  FileText,
  Plus,
  Printer,
  RefreshCw,
  Save,
  X,
} from "lucide-react";
import { useWorkspaceStore } from "../../../../store/workspaceStore";
import {
  IhtiyacListesiType,
  TEMPLATE_REGISTRY,
  TemplateComponentType,
  TemplateResolver,
} from "@dt-asistan/document-templates";
import * as Templates from "@dt-asistan/document-templates";
import { IhtiyacListesiMapping } from "../../../../constants/mappings/ihtiyac-listesi.mapping";

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
  const [formData, setFormData] = useState<Partial<IhtiyacListesiType>>({});
  const [personelListesi, setPersonelListesi] = useState<Personel[]>([]);
  const [previewScale, setPreviewScale] = useState(1);
  const [isPrinting, setIsPrinting] = useState(false);

  const previewContainerRef = useRef<HTMLDivElement>(null);

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

        const resolver = new TemplateResolver(queryExecutor);

        // Resolve using the pre-defined mapping
        const resolved = await resolver.resolve(
          IhtiyacListesiMapping,
          activeDosyaId,
        );

        // Fetch or load saved snapshot values if exists
        const snapshotRes = await window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT veri_json FROM DATA_DosyaSablonVeri WHERE temin_dosya_id = ? AND sablon_id = (SELECT id FROM TANIM_Sablon WHERE dosya_adi = 'ihtiyac-listesi.html' LIMIT 1)",
          [activeDosyaId],
        );

        let finalData = { ...resolved };
        if (snapshotRes.success && snapshotRes.data.length > 0) {
          try {
            const savedData = JSON.parse(snapshotRes.data[0].veri_json);
            finalData = { ...finalData, ...savedData };
          } catch (e) {
            console.error("Failed to parse saved snapshot JSON", e);
          }
        }

        setFormData(finalData);
      } catch (err) {
        console.error("Error loading V2 template data:", err);
      }
    };

    loadInitialData();
  }, [isOpen, activeDosyaId, documentId]);

  // 3. Document scaling logic based on preview container size
  useEffect(() => {
    if (!previewContainerRef.current || !isOpen) return;

    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      const A4_WIDTH = 800; // Base layout width
      const PADDING = 32;
      const availableWidth = width - PADDING;

      if (availableWidth < A4_WIDTH) {
        setPreviewScale(availableWidth / A4_WIDTH);
      } else {
        setPreviewScale(1);
      }
    });

    observer.observe(previewContainerRef.current);
    return () => observer.disconnect();
  }, [isOpen, documentId]);

  if (!isOpen) return null;

  // 4. Form inputs helpers
  const handleInputChange = (key: string, value: unknown): void => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // 5. Generate compiled HTML string containing current CSS stylesheets
  const getCompiledHtml = (): string => {
    if (!ActiveComponent) return "";
    const bodyHtml = renderToString(<ActiveComponent data={formData} />);
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

  const handleSaveSnapshot = async (): Promise<void> => {
    if (!activeDosyaId) return;
    try {
      // Find sablon ID
      const sablonRes = await window.electron.ipcRenderer.invoke(
        "db:query",
        "SELECT id FROM TANIM_Sablon WHERE dosya_adi = 'ihtiyac-listesi.html' LIMIT 1",
      );
      if (sablonRes.success && sablonRes.data.length > 0) {
        const sablonId = sablonRes.data[0].id;
        const serialized = JSON.stringify(formData);

        await window.electron.ipcRenderer.invoke(
          "db:run",
          `INSERT INTO DATA_DosyaSablonVeri (temin_dosya_id, sablon_id, veri_json, guncelleme_tarihi)
           VALUES (?, ?, ?, datetime('now', 'localtime'))
           ON CONFLICT(temin_dosya_id, sablon_id) DO UPDATE SET
           veri_json = excluded.veri_json,
           guncelleme_tarihi = excluded.guncelleme_tarihi`,
          [activeDosyaId, sablonId, serialized],
        );
        alert("Şablon verileri başarıyla dosyaya kaydedildi!");
      }
    } catch (e) {
      console.error("Failed to save snapshot:", e);
      alert("Kaydetme işlemi sırasında bir hata oluştu.");
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

      const resolver = new TemplateResolver(queryExecutor);
      const resolved = await resolver.resolve(
        IhtiyacListesiMapping,
        activeDosyaId,
      );

      setFormData(resolved);
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
          {/* Left panel: Form editor */}
          <div className="w-96 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {/* Antet Satirlari */}
              {formData.antetSatirlari && (
                <div className="space-y-2 border border-slate-250 dark:border-slate-800 p-3.5 rounded-xl bg-white dark:bg-slate-950/40">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Kurum Antet Satırları
                  </label>
                  {formData.antetSatirlari.map((line: string, idx: number) => (
                    <input
                      key={idx}
                      type="text"
                      value={line}
                      onChange={(e) => {
                        const newAntet = [...(formData.antetSatirlari || [])];
                        newAntet[idx] = e.target.value;
                        handleInputChange("antetSatirlari", newAntet);
                      }}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ))}
                </div>
              )}

              {/* Dynamic text / number / boolean variables */}
              {Object.keys(formData)
                .filter((key) => {
                  const EXCLUDED_KEYS = new Set([
                    "antetSatirlari",
                    "ihtiyacKalemleri",
                    "hazirlayanPersonelAdi",
                    "hazirlayanPersonelUnvan",
                    "onaylayanPersonelAdi",
                    "onaylayanPersonelUnvan",
                    "solLogo",
                    "sagLogo",
                  ]);
                  return !EXCLUDED_KEYS.has(key);
                })
                .map((key) => {
                  const val = formData[key];
                  const label = {
                    evrakSayisi: "Sayı / Evrak Numarası",
                    dosyaKonusu: "Dosya Konusu / Başlık",
                    maddeNo: "Kanun Maddesi",
                    tarih: "Belge Tarihi",
                    sunulacakMakamAdi: "Sunulacak Makam",
                    ihtiyacYeri: "İhtiyacın Yapılacağı Yer",
                    isinAciklamasi: "İşin Açıklaması",
                    kurumAdres: "Kurum Adresi",
                    kurumTelefon: "Kurum Telefonu",
                    kurumWeb: "Kurum Web Adresi",
                    kurumEposta: "Kurum E-Posta Adresi",
                    kurumKep: "Kurum KEP Adresi",
                    olurBaslik: "Onay Başlığı",
                    olurYazisi: "Olur Yazısı Eklensin mi?",
                    kurumIci: "Kurum İçi Belge mi?",
                    firstPageLimit: "1. Sayfa Satır Sayısı",
                    middlePageLimit: "Ara Sayfa Satır Sayısı",
                    lastPageLimit: "Son Sayfa Satır Sayısı",
                  }[key] ||
                    key.replace(/([A-Z])/g, " $1").replace(/^./, (str) =>
                      str.toUpperCase());

                  if (typeof val === "boolean") {
                    return (
                      <div key={key} className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {label}
                        </label>
                        <select
                          value={val ? "true" : "false"}
                          onChange={(e) =>
                            handleInputChange(key, e.target.value === "true")}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                          <option value="true">Evet / Aktif</option>
                          <option value="false">Hayır / Pasif</option>
                        </select>
                      </div>
                    );
                  }

                  if (typeof val === "number") {
                    return (
                      <div key={key} className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {label}
                        </label>
                        <input
                          type="number"
                          value={val}
                          onChange={(e) =>
                            handleInputChange(key, Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    );
                  }

                  if (typeof val === "string") {
                    return (
                      <div key={key} className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {label}
                        </label>
                        <input
                          type="text"
                          value={val || ""}
                          onChange={(e) =>
                            handleInputChange(key, e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700 dark:text-slate-200"
                        />
                      </div>
                    );
                  }

                  return null;
                })}

              {/* İhtiyaç Kalemleri (Table data editor) */}
              {formData.ihtiyacKalemleri && (
                <div className="space-y-3.5 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl bg-white dark:bg-slate-950/40">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    İhtiyaç Kalemleri Tablosu
                  </label>
                  <div className="space-y-3">
                    {formData.ihtiyacKalemleri.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="border border-slate-200 dark:border-slate-800 p-3 rounded-lg bg-slate-50/50 dark:bg-slate-900/30 space-y-2.5 relative"
                      >
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                          <span>Kalem #{idx + 1}</span>
                          <button
                            onClick={() => {
                              const list = (formData.ihtiyacKalemleri || [])
                                .filter(
                                  (_: any, i: number) => i !== idx,
                                );
                              handleInputChange("ihtiyacKalemleri", list);
                            }}
                            className="text-red-500 hover:text-red-650 cursor-pointer text-[10px]"
                          >
                            Sil
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <span className="text-[9px] text-slate-400 font-semibold">
                              Kalem Adı
                            </span>
                            <input
                              type="text"
                              value={item.malzemeAdi || ""}
                              onChange={(e) => {
                                const list = [
                                  ...(formData.ihtiyacKalemleri || []),
                                ];
                                list[idx] = {
                                  ...list[idx],
                                  malzemeAdi: e.target.value,
                                };
                                handleInputChange("ihtiyacKalemleri", list);
                              }}
                              className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] text-slate-400 font-semibold">
                              Tasinir Kodu
                            </span>
                            <input
                              type="text"
                              value={item.kodu || ""}
                              onChange={(e) => {
                                const list = [
                                  ...(formData.ihtiyacKalemleri || []),
                                ];
                                list[idx] = {
                                  ...list[idx],
                                  kodu: e.target.value,
                                };
                                handleInputChange("ihtiyacKalemleri", list);
                              }}
                              className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] text-slate-400 font-semibold">
                              Miktar
                            </span>
                            <input
                              type="number"
                              value={item.miktar ?? 0}
                              onChange={(e) => {
                                const list = [
                                  ...(formData.ihtiyacKalemleri || []),
                                ];
                                list[idx] = {
                                  ...list[idx],
                                  miktar: Number(e.target.value),
                                };
                                handleInputChange("ihtiyacKalemleri", list);
                              }}
                              className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] text-slate-400 font-semibold">
                              Birim
                            </span>
                            <input
                              type="text"
                              value={item.birimi || ""}
                              onChange={(e) => {
                                const list = [
                                  ...(formData.ihtiyacKalemleri || []),
                                ];
                                list[idx] = {
                                  ...list[idx],
                                  birimi: e.target.value,
                                };
                                handleInputChange("ihtiyacKalemleri", list);
                              }}
                              className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newKalem = {
                          siraNo: (formData.ihtiyacKalemleri?.length || 0) + 1,
                          kodu: "",
                          malzemeAdi: "",
                          ozelligi: "",
                          birimi: "Adet",
                          kdvOrani: "20",
                          miktar: 1,
                        };
                        handleInputChange("ihtiyacKalemleri", [
                          ...(formData.ihtiyacKalemleri || []),
                          newKalem,
                        ]);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-slate-300 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Yeni İhtiyaç Kalemi Ekle</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Signatures / Personnel Selection */}
              <div className="space-y-3.5 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl bg-white dark:bg-slate-950/40">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  İmza Yetkilileri
                </label>

                {/* Hazirlayan Personel */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Hazırlayan Personel
                  </span>
                  <select
                    value={personelListesi.find((p) =>
                      p.ad_soyad === formData.hazirlayanPersonelAdi
                    )
                      ?.ad_soyad || ""}
                    onChange={(e) => {
                      const p = personelListesi.find((pers) =>
                        pers.ad_soyad === e.target.value
                      );
                      if (p) {
                        handleInputChange("hazirlayanPersonelAdi", p.ad_soyad);
                        handleInputChange(
                          "hazirlayanPersonelUnvan",
                          p.unvan || "",
                        );
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">Seçilmedi</option>
                    {personelListesi.map((p) => (
                      <option key={p.id} value={p.ad_soyad}>
                        {p.ad_soyad} ({p.unvan || "Görevi Yok"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Onaylayan Personel */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Harcama Yetkilisi (En Üst Amir)
                  </span>
                  <select
                    value={personelListesi.find((p) =>
                      p.ad_soyad === formData.onaylayanPersonelAdi
                    )
                      ?.ad_soyad || ""}
                    onChange={(e) => {
                      const p = personelListesi.find((pers) =>
                        pers.ad_soyad === e.target.value
                      );
                      if (p) {
                        handleInputChange("onaylayanPersonelAdi", p.ad_soyad);
                        handleInputChange(
                          "onaylayanPersonelUnvan",
                          p.unvan || "",
                        );
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">Seçilmedi</option>
                    {personelListesi.map((p) => (
                      <option key={p.id} value={p.ad_soyad}>
                        {p.ad_soyad} ({p.unvan || "Görevi Yok"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Save snapshot buttons */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between gap-2.5">
              <button
                onClick={handleRefreshFromDb}
                className="flex items-center gap-1.5 px-3 py-2 text-slate-655 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                title="Şablon Verilerini Sıfırla"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Yenile</span>
              </button>

              <button
                onClick={handleSaveSnapshot}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm shadow-blue-500/10"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Kaydet</span>
              </button>
            </div>
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
                ? <ActiveComponent data={formData} />
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
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex-none select-none">
          <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Canlı Önizleme Aktif
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenPdfInNewTab}
              disabled={isPrinting}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs transition-colors text-xs disabled:opacity-50 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Yeni Sekmede Aç</span>
            </button>

            <button
              onClick={handlePdf}
              disabled={isPrinting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs transition-colors text-xs disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF İndir</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold rounded-xl shadow-xs transition-colors text-xs disabled:opacity-50 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentPreviewModalV2;
