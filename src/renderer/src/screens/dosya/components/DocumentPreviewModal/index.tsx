import React, { useEffect, useState } from "react";
import Mustache from "mustache";
import { useWorkspaceStore } from "../../../../store/workspaceStore";
import { PreviewHeader } from "./PreviewHeader";
import { PreviewFormView } from "./PreviewFormView";
import { PreviewJsonView } from "./PreviewJsonView";
import { PreviewFooter } from "./PreviewFooter";

interface DocumentPreviewModalProps<T = any> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  templateHtml: string;
  masterHtml: string;
  baseContext: T;
  placeholders?: any[];
  personelListesi?: any[];
  onPrint: (html: string) => Promise<void>;
  onExportPdf: (html: string, filenameTitle?: string) => Promise<void>;
  isInline?: boolean;
  templateTestVerisi?: string;
  onRefreshSnapshot?: () => Promise<void>;
  onSaveSnapshot?: (overrideData: Partial<T>) => Promise<void>;
  dosyaAdi?: string;
}

export function DocumentPreviewModal<T = any>({
  isOpen,
  onClose,
  title,
  templateHtml,
  masterHtml,
  baseContext,
  placeholders = [],
  personelListesi = [],
  onPrint,
  onExportPdf,
  isInline = false,
  templateTestVerisi = "",
  onRefreshSnapshot,
  onSaveSnapshot,
  dosyaAdi,
}: DocumentPreviewModalProps<T>): React.JSX.Element | null {
  const [overrideData, setOverrideData] = useState<Partial<T>>({});
  const [activeTab, setActiveTab] = useState<"form" | "json">("form");
  const [overrideJson, setOverrideJson] = useState("{\n  \n}");
  const [jsonError, setJsonError] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [isProcessingPrint, setIsProcessingPrint] = useState(false);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [schemaJson, setSchemaJson] = useState<Partial<T> | null>(null);

  const extractUsedVars = React.useCallback((html: string) => {
    const matches = Array.from(
      html.matchAll(/\{\{(\{?)([#^\/]?)([a-zA-Z0-9_]+)(\}?)\}\}/g),
    );
    return matches.map((m) => m[3]);
  }, []);

  const usedVars = React.useMemo(() => {
    return new Set([
      ...extractUsedVars(templateHtml || ""),
      ...extractUsedVars(masterHtml || ""),
    ]);
  }, [templateHtml, masterHtml, extractUsedVars]);

  useEffect(() => {
    if (isOpen && dosyaAdi) {
      const cleanName = dosyaAdi.endsWith(".html")
        ? dosyaAdi.replace(".html", "")
        : dosyaAdi;
      const jsonFileName = `${cleanName}.html.json`;
      window.electron.ipcRenderer.invoke("template:read-system", jsonFileName)
        .then((res) => {
          if (res) {
            try {
              const parsed = JSON.parse(res);
              setSchemaJson(parsed);
            } catch (e) {
              console.error("Failed to parse schema JSON:", e);
              setSchemaJson(null);
            }
          } else {
            setSchemaJson(null);
          }
        })
        .catch((err) => {
          console.error("Failed to read schema JSON:", err);
          setSchemaJson(null);
        });
    } else {
      setSchemaJson(null);
    }
  }, [isOpen, dosyaAdi]);

  const handleAiEdit = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);
    try {
      const res = await window.electron.ipcRenderer.invoke("ai:generate", {
        prompt:
          `Mevcut JSON Yapısı:\n${overrideJson}\n\nKullanıcı Talimatı: ${aiPrompt}\n\nLütfen talimata göre JSON verisini güncelle. Sadece geçerli JSON çıktısı döndür. Markdown kod blokları (\`\`\`json) veya açıklama ekleme.`,
        systemInstruction:
          "Sen JSON verilerini talimata göre güncelleyen bir yardımcı asistansın. Çıktın her zaman sadece geçerli bir JSON olmalıdır, hiçbir açıklama veya markdown bloğu içermemelidir.",
      });
      if (res && res.success) {
        let cleanText = res.data.trim();

        // Extract JSON substring robustly
        const firstBrace = cleanText.indexOf("{");
        const firstBracket = cleanText.indexOf("[");
        let startIndex = -1;
        if (firstBrace !== -1 && firstBracket !== -1) {
          startIndex = Math.min(firstBrace, firstBracket);
        } else {
          startIndex = firstBrace !== -1 ? firstBrace : firstBracket;
        }

        const lastBrace = cleanText.lastIndexOf("}");
        const lastBracket = cleanText.lastIndexOf("]");
        let endIndex = -1;
        if (lastBrace !== -1 && lastBracket !== -1) {
          endIndex = Math.max(lastBrace, lastBracket);
        } else {
          endIndex = lastBrace !== -1 ? lastBrace : lastBracket;
        }

        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
          cleanText = cleanText.substring(startIndex, endIndex + 1);
        }

        const parsed = JSON.parse(cleanText);
        setOverrideData(parsed);
        setOverrideJson(JSON.stringify(parsed, null, 2));
        const mergedContextData = { ...baseContext, ...parsed };
        updatePreview(mergedContextData);
        setAiPrompt("");
      } else {
        alert("AI işlemi başarısız oldu: " + (res?.error || "Bilinmeyen hata"));
      }
    } catch (err: any) {
      alert("Hata: " + err.message);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const updatePreview = (contextData: any) => {
    try {
      const renderedContent = Mustache.render(templateHtml, contextData);
      const finalContext = { ...contextData, icerik: renderedContent };
      const finalHtml = Mustache.render(masterHtml, finalContext);
      setPreviewHtml(finalHtml);
    } catch (err: any) {
      console.error("Render error:", err);
    }
  };

  const mergedContext = React.useMemo<T>(() => {
    let testData: any = {};
    if (templateTestVerisi) {
      try {
        testData = JSON.parse(templateTestVerisi);
      } catch (e) {
        console.error("Failed to parse template test verisi:", e);
      }
    }
    const activeDosyaId = useWorkspaceStore.getState().activeDosyaId;
    const hasRealData = activeDosyaId !== null && baseContext &&
      Object.keys(baseContext as any).length > 2;
    const rawContext = hasRealData
      ? { ...testData, ...baseContext }
      : { ...baseContext, ...testData };

    if (schemaJson && Object.keys(schemaJson).length > 0) {
      const filtered: any = {};
      for (const key of Object.keys(schemaJson)) {
        filtered[key] = (rawContext as any)[key] !== undefined
          ? (rawContext as any)[key]
          : (schemaJson as any)[key];
      }
      return filtered as T;
    }

    const filtered: any = {};
    const keysToKeep = new Set(usedVars);
    keysToKeep.add("icerik");
    keysToKeep.add("solLogo");
    keysToKeep.add("sagLogo");

    for (const key of Object.keys(rawContext)) {
      if (keysToKeep.has(key)) {
        filtered[key] = (rawContext as any)[key];
      }
    }
    return filtered as T;
  }, [baseContext, templateTestVerisi, schemaJson, usedVars]);

  // Initialization: Format context to JSON on open
  useEffect(() => {
    if (isOpen) {
      setOverrideData({});
      // JSON tab'ı tam context ile başlat (tüm anahtarları göster)
      setOverrideJson(JSON.stringify(mergedContext, null, 2));
      setJsonError("");
      updatePreview(mergedContext);
    }
  }, [isOpen, mergedContext, templateHtml, masterHtml]);

  const handleFormChange = (key: string, value: any) => {
    const newData = { ...overrideData, [key]: value };
    setOverrideData(newData);
    setOverrideJson(JSON.stringify(newData, null, 2));

    const mergedContext = { ...baseContext, ...newData };
    updatePreview(mergedContext);
  };

  const handleJsonChange = (val: string) => {
    setOverrideJson(val);
    try {
      const parsedOverride = JSON.parse(val || "{}");
      setJsonError("");
      setOverrideData(parsedOverride);
      const mergedContext = { ...baseContext, ...parsedOverride };
      updatePreview(mergedContext);
    } catch (err: any) {
      setJsonError("Geçersiz JSON formatı: " + err.message);
    }
  };

  const handlePrint = async () => {
    if (jsonError && activeTab === "json") {
      alert("Geçersiz JSON yapılandırması varken çıktı alamazsınız.");
      return;
    }
    setIsProcessingPrint(true);
    try {
      await onPrint(previewHtml);
    } finally {
      setIsProcessingPrint(false);
    }
  };

  const handlePdf = async () => {
    if (jsonError && activeTab === "json") {
      alert("Geçersiz JSON yapılandırması varken PDF alamazsınız.");
      return;
    }
    setIsProcessingPdf(true);
    try {
      const fileWorkName = (mergedContext as any).isAdi || "";
      const cleanFileWorkName = fileWorkName.replace(/[\\/:*?"<>|]/g, "")
        .trim();
      const combinedTitle = cleanFileWorkName
        ? `${cleanFileWorkName} - ${title}`
        : title;
      await onExportPdf(previewHtml, combinedTitle);
    } finally {
      setIsProcessingPdf(false);
    }
  };

  if (!isOpen) return null;

  // Orijinal bağlamdaki (mergedContext) verilerden SADECE şablonda kullanılan form alanlarını üret
  // Personel alanları haritası (context key -> { adiKey, unvanKey, etiket })
  const PERSONNEL_FIELDS: Record<
    string,
    { adiKey: string; unvanKey: string; etiket: string }
  > = {
    hazirlayanPersonelAdi: {
      adiKey: "hazirlayanPersonelAdi",
      unvanKey: "hazirlayanPersonelUnvan",
      etiket: "Hazırlayan Personel",
    },
    talepEdenPersonelAdi: {
      adiKey: "talepEdenPersonelAdi",
      unvanKey: "talepEdenPersonelUnvan",
      etiket: "Talep Eden Personel",
    },
    sunanPersonelAdi: {
      adiKey: "sunanPersonelAdi",
      unvanKey: "sunanPersonelUnvan",
      etiket: "Sunan Personel",
    },
    onaylayanPersonelAdi: {
      adiKey: "onaylayanPersonelAdi",
      unvanKey: "onaylayanPersonelUnvan",
      etiket: "Onaylayan (Harcama Yetkilisi)",
    },
    ilgiliPersonelAdi: {
      adiKey: "ilgiliPersonelAdi",
      unvanKey: "ilgiliPersonelUnvan",
      etiket: "İrtibat Yetkilisi",
    },
  };

  const personnelContextKeys = Object.keys(PERSONNEL_FIELDS);

  const formFields = Object.keys(mergedContext || {}).filter((k) => {
    if (k === "icerik" || k.toLowerCase().includes("logo")) return false;
    if (!usedVars.has(k)) return false;

    const val = mergedContext[k];
    if (
      typeof val === "string" || typeof val === "number" ||
      typeof val === "boolean"
    ) return true;
    if (Array.isArray(val) && val.every((v) => typeof v === "string")) {
      return true;
    }

    return false;
  });

  // Personel alanları için: şablonda kullanılan personel key'lerini tespit et
  // (usedVars'ta olmasa bile, şablonda kullanılıyor olabilir — örn. hazirlayanPersonelAdi)
  const activePersonnelFields = personnelContextKeys.filter(
    (k) => usedVars.has(k) || usedVars.has(PERSONNEL_FIELDS[k].unvanKey),
  );

  const handlePersonelSelect = (field: any, selectedPersonel: any) => {
    // Hem adı hem unvanı birlikte güncelle
    const newData = {
      ...overrideData,
      [field.adiKey]: selectedPersonel.ad_soyad,
      [field.unvanKey]: selectedPersonel.unvan || "",
    };
    // Türkçe karakter uyumluluk (hazırlayan için)
    if (field.adiKey === "hazirlayanPersonelAdi") {
      newData["haz\u0131rlayanPersonelAdi"] = selectedPersonel.ad_soyad;
      newData["haz\u0131rlayanPersonelUnvan"] = selectedPersonel.unvan || "";
      newData["hazirlayanTelefon"] = selectedPersonel.telefon || "";
      newData["haz\u0131rlayanTelefon"] = selectedPersonel.telefon || "";
      newData["hazirlayanEposta"] = selectedPersonel.eposta || "";
      newData["haz\u0131rlayanEposta"] = selectedPersonel.eposta || "";
    }
    if (field.adiKey === "onaylayanPersonelAdi") {
      newData["baskanAdi"] = selectedPersonel.ad_soyad;
      newData["baskanUnvan"] = selectedPersonel.unvan || "";
    }
    setOverrideData(newData);
    setOverrideJson(JSON.stringify(newData, null, 2));
    const merged = {
      ...baseContext,
      ...newData,
    };
    updatePreview(merged);
  };

  const handlePersonelClear = (field: any) => {
    // Temizle — orijinal değere dön
    const newData = { ...overrideData };
    delete newData[field.adiKey];
    delete newData[field.unvanKey];
    setOverrideData(newData);
    setOverrideJson(JSON.stringify(newData, null, 2));
    const merged = {
      ...baseContext,
      ...newData,
    };
    updatePreview(merged);
  };

  const onRefreshClick = async () => {
    const isConfirmed = window.confirm(
      "Güncel dosya verilerini şablona aktarmak istediğinize emin misiniz?\n\nNOT: Onaylarsanız bu şablona özel yaptığınız manuel değişiklikler silinecek ve dosyanın güncel verisi üzerine yazılacaktır.\n\nDevam etmek için 'Tamam', iptal etmek için 'İptal'e tıklayın.",
    );
    if (isConfirmed && onRefreshSnapshot) {
      await onRefreshSnapshot();
      setOverrideData({});
    }
  };

  if (isInline) {
    return (
      <div className="bg-white dark:bg-slate-900 w-full h-[calc(100vh-235px)] rounded-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
        <PreviewHeader
          isInline={true}
          onClose={onClose}
          title={title}
          usedVars={usedVars}
        />

        {/* BODY */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT SIDEBAR - FORM / JSON EDITOR */}
          <div className="w-1/3 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            {/* TABS */}
            <div className="flex p-2 gap-1 border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/50">
              <button
                onClick={() => setActiveTab("form")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeTab === "form"
                    ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm border border-slate-200 dark:border-slate-700"
                    : "text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                }`}
              >
                Form Görünümü
              </button>
              <button
                onClick={() => setActiveTab("json")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeTab === "json"
                    ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm border border-slate-200 dark:border-slate-700"
                    : "text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                }`}
              >
                JSON (Gelişmiş)
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 relative flex flex-col">
              {activeTab === "form"
                ? (
                  <PreviewFormView
                    formFields={formFields}
                    mergedContext={mergedContext}
                    overrideData={overrideData}
                    placeholders={placeholders}
                    activePersonnelFields={activePersonnelFields}
                    personelListesi={personelListesi}
                    PERSONNEL_FIELDS={PERSONNEL_FIELDS}
                    handleFormChange={handleFormChange}
                    handlePersonelSelect={handlePersonelSelect}
                    handlePersonelClear={handlePersonelClear}
                  />
                )
                : (
                  <PreviewJsonView
                    overrideJson={overrideJson}
                    aiPrompt={aiPrompt}
                    setAiPrompt={setAiPrompt}
                    isAiGenerating={isAiGenerating}
                    jsonError={jsonError}
                    handleAiEdit={handleAiEdit}
                    handleJsonChange={handleJsonChange}
                  />
                )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              İpucu: Buradaki değişiklikler sadece bu yazdırma işlemi için
              geçerlidir.
            </div>
          </div>

          {/* RIGHT SIDEBAR - PREVIEW */}
          <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative">
            <iframe
              srcDoc={previewHtml}
              className="w-full h-full bg-white border-0"
              title="Print Preview"
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        </div>

        <PreviewFooter
          onClose={onClose}
          handlePrint={handlePrint}
          handlePdf={handlePdf}
          isProcessingPrint={isProcessingPrint}
          isProcessingPdf={isProcessingPdf}
          jsonError={jsonError}
          activeTab={activeTab}
          onRefreshSnapshot={onRefreshSnapshot}
          onRefreshClick={onRefreshClick}
        />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-[90vw] h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <PreviewHeader
          isInline={false}
          onClose={onClose}
          title={title}
          usedVars={usedVars}
        />

        {/* BODY */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT SIDEBAR - FORM / JSON EDITOR */}
          <div className="w-1/3 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            {/* TABS */}
            <div className="flex p-2 gap-1 border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/50">
              <button
                onClick={() => setActiveTab("form")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeTab === "form"
                    ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm border border-slate-200 dark:border-slate-700"
                    : "text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                }`}
              >
                Form Görünümü
              </button>
              <button
                onClick={() => setActiveTab("json")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeTab === "json"
                    ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm border border-slate-200 dark:border-slate-700"
                    : "text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                }`}
              >
                JSON (Gelişmiş)
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 relative flex flex-col">
              {activeTab === "form"
                ? (
                  <PreviewFormView
                    formFields={formFields}
                    mergedContext={mergedContext}
                    overrideData={overrideData}
                    placeholders={placeholders}
                    activePersonnelFields={activePersonnelFields}
                    personelListesi={personelListesi}
                    PERSONNEL_FIELDS={PERSONNEL_FIELDS}
                    handleFormChange={handleFormChange}
                    handlePersonelSelect={handlePersonelSelect}
                    handlePersonelClear={handlePersonelClear}
                  />
                )
                : (
                  <PreviewJsonView
                    overrideJson={overrideJson}
                    aiPrompt={aiPrompt}
                    setAiPrompt={setAiPrompt}
                    isAiGenerating={isAiGenerating}
                    jsonError={jsonError}
                    handleAiEdit={handleAiEdit}
                    handleJsonChange={handleJsonChange}
                  />
                )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              İpucu: Buradaki değişiklikler sadece bu yazdırma işlemi için
              geçerlidir.
            </div>
          </div>

          {/* RIGHT SIDEBAR - PREVIEW */}
          <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative">
            <iframe
              srcDoc={previewHtml}
              className="w-full h-full bg-white border-0"
              title="Print Preview"
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        </div>

        <PreviewFooter
          onClose={onClose}
          handlePrint={handlePrint}
          handlePdf={handlePdf}
          isProcessingPrint={isProcessingPrint}
          isProcessingPdf={isProcessingPdf}
          jsonError={jsonError}
          activeTab={activeTab}
          onRefreshSnapshot={onRefreshSnapshot}
          onRefreshClick={onRefreshClick}
        />
      </div>
    </div>
  );
}
export default DocumentPreviewModal;
