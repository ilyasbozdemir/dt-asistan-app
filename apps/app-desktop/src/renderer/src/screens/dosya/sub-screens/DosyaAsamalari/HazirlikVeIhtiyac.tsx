import React from "react";
import { Package } from "lucide-react";
import { SubScreen } from "../../SubScreens.screen";
import { DocumentPreviewModal } from "../../components/DocumentPreviewModal";
import {
  normalizeForMatch,
  useDosyaAsamasiSablons,
} from "./useDosyaAsamasiSablons";
import { useMalzemeListesi } from "../components/MalzemeListesi/useMalzemeListesi";
import { MalzemeEkleModal } from "../components/MalzemeListesi/MalzemeEkleModal";
import { MalzemeTablosu } from "../components/MalzemeListesi/MalzemeTablosu";

export function HazirlikVeIhtiyac(): React.JSX.Element {
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
    activeDosya,
  } = useDosyaAsamasiSablons();

  const state = useMalzemeListesi(activeDosyaId);

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

  const stageSablons = sablons
    .filter(
      (s) =>
        s.kategori === "1-ihtiyac-tespiti-ve-baslangic" ||
        s.kategori === "1. İhtiyaç Tespiti & Başlangıç" ||
        s.dosya_adi === "dogrudan-temin-onay-belgesi.html" ||
        s.dosya_adi === "komisyon-gorevlendirme-onayi.html" ||
        s.dosya_adi === "piyasa-fiyat-arastirma-gorevlendirmesi.html",
    )
    .sort((a, b) => a.ad.localeCompare(b.ad, "tr"));

  const dagitimSablons = sablons
    .filter(
      (s) =>
        s.dosya_adi === "birim-fiyat-teklif-mektubu.html" ||
        s.dosya_adi === "fiyat-arastirma-mektubu.html" ||
        s.dosya_adi === "teklif-mektubu-dagitim-cizelgesi.html" ||
        s.dosya_adi === "dagitim-cizelgesi-karma.html",
    )
    .sort((a, b) => a.ad.localeCompare(b.ad, "tr"));

  return (
    <SubScreen
      title="İhtiyaç Listesi & Maliyet & Onay"
      icon={Package}
      description="Dosyanıza malzeme, hizmet veya yapım işi ekleyebilir ve yönetebilirsiniz. Son Alım Fiyat Cetveli şablonu sayesinde, malzemelerin son alım fiyatları, kimden/hangi firmadan alındığı gibi geçmiş analiz verileri otomatik olarak listelenir."
    >
      <MalzemeEkleModal state={state} />

      <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs">
        {"BUTONLARIN KATEGORİLERİ DAHA İYİ DENEİYM İÇİN SU AN HEPSİ ACIKTIR TEST EDİLMEKTEDİR."}
      </p>
      <MalzemeTablosu
        state={state}
        stageSablons={stageSablons}
        dagitimSablons={dagitimSablons}
        sablons={sablons}
        onSablonClick={handleOpenPreviewForSablon}
        ciktiLoading={ciktiLoading}
        activeStarredDocs={activeStarredDocs}
        onQuickPrint={quickPrint}
        onExport={quickExport}
        onOpenExternal={quickOpenExternal}
        isSablonDisabled={isSablonDisabled}
        activeDosya={activeDosya}
        activeDosyaId={activeDosyaId}
      />
    </SubScreen>
  );
}
