import React, { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  FileCheck,
  PackageSearch,
  Plus,
  Printer,
} from "lucide-react";
import { SubScreen } from "../../SubScreens.screen";
import { DocumentPreviewModal } from "../../components/DocumentPreviewModal";
import {
  normalizeForMatch,
  useDosyaAsamasiSablons,
} from "./useDosyaAsamasiSablons";
import { PrintDropdownButton } from "../../components/PrintDropdownButton";
import { useSettingsStore } from "../../../../store/settingsStore";
import { useWorkspaceStore } from "../../../../store/workspaceStore";
import { APP_ROUTES } from "../../../../constants/routeConstants";
import { WinnerDocumentsMenu } from "./components/WinnerDocumentsMenu";

export function SiparisVeSozlesme(): React.JSX.Element {
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

  const { disableDocumentGuidance } = useSettingsStore();
  const { activeDosyaId } = useWorkspaceStore();

  const stageSablons = sablons.filter(
    (s) =>
      s.kategori === "3-siparis-ve-sozlesme" ||
      s.kategori === "3. Sipariş & Sözleşme",
  );

  // Kazanan firma guard state
  const [kazananFirmaId, setKazananFirmaId] = useState<
    number | null | undefined
  >(undefined); // undefined = yükleniyor
  const [kazananFirmaUnvan, setKazananFirmaUnvan] = useState<string>("");

  useEffect(() => {
    if (!activeDosyaId) return;

    const checkKazananFirma = async (): Promise<void> => {
      try {
        const res = await window.electron.ipcRenderer.invoke(
          "db:query",
          `SELECT d.firma_id, f.unvan
           FROM DATA_TeminDosyasi d
           LEFT JOIN TANIM_Firma f ON d.firma_id = f.id
           WHERE d.id = ?`,
          [activeDosyaId],
        );
        if (res.success && res.data && res.data.length > 0) {
          setKazananFirmaId(res.data[0].firma_id || null);
          setKazananFirmaUnvan(res.data[0].unvan || "");
        } else {
          setKazananFirmaId(null);
        }
      } catch {
        setKazananFirmaId(null);
      }
    };

    checkKazananFirma();
  }, [activeDosyaId]);

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
      title="Sipariş & Sözleşme"
      icon={FileCheck}
      description="Doğrudan temin onay belgesi, ihale komisyon kararı ve sözleşmeye davet gibi dökümanları hazırlayabilir, doğrudan temin sözleşme süreçlerinizi bu panelden yönetebilirsiniz."
    >
      {/* Yükleniyor durumu */}
      {kazananFirmaId === undefined && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-sm text-slate-500">
            Kontrol ediliyor...
          </span>
        </div>
      )}

      {/* Kazanan firma YOK → Guard uyarısı */}
      {kazananFirmaId === null && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
          {/* Uyarı Banner */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700/60 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 border border-amber-300/50 dark:border-amber-700/40">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-extrabold text-amber-800 dark:text-amber-300">
                  Kazanan Firma Belirlenmedi
                </h3>
                <p className="text-xs text-amber-700 dark:text-amber-400/90 leading-relaxed max-w-xl">
                  Sipariş &amp; Sözleşme belgelerini oluşturabilmek için önce
                  {" "}
                  <strong>Piyasa Fiyat Araştırması</strong>{" "}
                  adımında kazanan firmayı belirlemeniz gerekir. Tutanağı
                  kaydederken{" "}
                  <em>&ldquo;En Düşük Teklifi Kazanan Yap&rdquo;</em>{" "}
                  seçeneğini işaretleyin ya da açılan firma listesinden kazananı
                  elle seçin.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-amber-200 dark:border-amber-800/60 pt-4">
              <Link
                to={APP_ROUTES.PIYASA_FIYAT_ARASTIRMASI}
                className="flex items-center gap-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer border-0"
              >
                <PackageSearch className="w-4 h-4" />
                Piyasa Fiyat Araştırması&apos;na Git
              </Link>
              <Link
                to={APP_ROUTES.PIYASA_FIYAT_ARASTIRMASI}
                className="flex items-center gap-2 text-xs font-bold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Geri Dön
              </Link>
            </div>
          </div>

          {/* Adım akışı bilgi kartı */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Süreç Adımları
            </h4>
            <ol className="flex flex-col gap-2">
              {[
                { step: "1", label: "Hazırlık & İhtiyaç", done: true },
                {
                  step: "2",
                  label: "Piyasa Fiyat Araştırması — Kazanan firma belirle",
                  done: false,
                  current: true,
                },
                { step: "3", label: "Sipariş & Sözleşme", done: false },
              ].map((item) => (
                <li
                  key={item.step}
                  className={`flex items-center gap-3 text-xs font-bold px-3 py-2 rounded-xl transition-colors ${
                    item.current
                      ? "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60"
                      : item.done
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-400 dark:text-slate-600"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                      item.current
                        ? "bg-amber-500 text-white"
                        : item.done
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                    }`}
                  >
                    {item.step}
                  </span>
                  {item.label}
                  {item.current && (
                    <span className="ml-auto text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20">
                      Bekliyor
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Kazanan firma VAR → Normal içerik */}
      {kazananFirmaId && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
          {/* Kazanan firma bilgi kartı */}
          <div className="bg-emerald-50/60 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl px-5 py-3.5 flex items-center gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 border border-emerald-300/40">
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500">
                Kazanan / Yüklenici Firma
              </span>
              <span className="text-sm font-extrabold text-emerald-800 dark:text-emerald-300">
                {kazananFirmaUnvan || "Seçili Firma"}
              </span>
            </div>
          </div>

          {/* Ana içerik kartı */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  Sözleşme Süreç Yönetimi
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  Doğrudan temin sözleşme ve sipariş işlemlerini bu panelden
                  takip edebilirsiniz.
                </p>
              </div>

              <div className="flex items-center gap-2 relative">
                <WinnerDocumentsMenu
                  onPrintResultApproval={() => {
                    // Sonuç Onay Belgesi
                  }}
                  onPrintAcceptanceLetter={() => {
                    // Kabul Yazısı
                  }}
                  onEkapBlacklistQuery={() => {
                    // EKAP Yasaklı Sorgula
                  }}
                  onEdevletBlacklistQuery={() => {
                    window.electron?.ipcRenderer.send("window:open-external", {
                      url: "https://www.turkiye.gov.tr/kik-yasakli-sorgula",
                      title: "e-Devlet KİK Yasaklılık Sorgulama",
                    });
                  }}
                />

                {stageSablons.length > 0 && (
                  <div>
                    <PrintDropdownButton
                      kategori="3-siparis-ve-sozlesme"
                      sablons={sablons}
                      overrideSablons={stageSablons}
                      activeStarredDocs={activeStarredDocs}
                      ciktiLoading={ciktiLoading}
                      handleOpenPreviewForSablon={handleOpenPreviewForSablon}
                      quickPrint={quickPrint}
                      quickExport={quickExport}
                      quickOpenExternal={quickOpenExternal}
                      isSablonDisabled={isSablonDisabled}
                      buttonHeightClass="h-10"
                      label={disableDocumentGuidance
                        ? "İşlemler"
                        : "Belgeleri Yazdır"}
                    />
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
              Bu süreç henüz tasarım aşamasındadır.
            </p>
          </div>
        </div>
      )}
    </SubScreen>
  );
}
