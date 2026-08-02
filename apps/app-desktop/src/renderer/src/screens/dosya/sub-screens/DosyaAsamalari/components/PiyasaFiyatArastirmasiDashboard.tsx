import React, { useMemo } from "react";
import {
  Calculator,
  FileCheck2,
  FileSignature,
  LayoutGrid,
  List,
  Table,
  TrendingUp,
} from "lucide-react";
import { cn } from "../../../../../utils/cn";
import { DocumentsDashboard } from "./DocumentsDashboard";
import { PricesSummaryDashboard } from "./PricesSummaryDashboard";
import { PrintDropdownButtonV2 } from "@renderer/screens/dosya/components/PrintDropdownButtonV2";
import { MalzemeTabloPopover } from "../../components/MalzemeListesi/components/MalzemeTabloPopover";
import { normalizeForMatch } from "../useDosyaAsamasiSablons";
import { FiyatIstenenFirmalarınSecilmesi } from "./FiyatIstenenFirmalarınSecilmesi";
import { PoolFirm } from "../hooks/usePiyasaFiyatArastirmasi";
import { SABLON_ALIAS_MAP } from "../constants/sablonAliases";
import { BelgeItem, BelgeListesi } from "./BelgeListesi";
import { formatDateString } from "../../../CiktiMerkezi.contextBuilder";

interface PiyasaFiyatArastirmasiDashboardProps {
  setIsFormOpen: (val: boolean) => void;
  handleNewDocument: (mode: "maliyet" | "tutanak") => void;
  dashboardViewMode: "documents" | "prices";
  setDashboardViewMode: (val: "documents" | "prices") => void;
  stageDocs: any[];
  docViewMode: "grid" | "list" | "table";
  changeDocViewMode: (mode: "grid" | "list" | "table") => void;
  stageSablons: any[];
  sablons: any[];
  activeStarredDocs: any[];
  ciktiLoading: boolean;
  handleOpenPreviewForSablon: any;
  quickPrint: any;
  quickExport: any;
  quickOpenExternal: any;
  isSablonDisabled: (sablon: any) => boolean;
  disableDocumentGuidance: boolean;
  invitedFirms: any[];
  allPoolFirms?: PoolFirm[];
  handleAddSingleFirm?: (firma: PoolFirm) => void;
  handleRemoveFirm?: (id: number) => void;
  items: any[];
  bids: any;
  setActiveFormTab: (tab: "firms" | "matrix") => void;
  activeActionDropdown: string | null;
  setActiveActionDropdown: (val: string | null) => void;
  handleUpdateDocumentDate: (
    docId: number,
    newDate: string,
    docName: string,
  ) => void;
  setIsFirmModalOpen?: (val: boolean) => void;
  handleDeleteDocument?: (id: number) => void;
}

export function PiyasaFiyatArastirmasiDashboard({
  setIsFormOpen,
  handleNewDocument,
  dashboardViewMode,
  setDashboardViewMode,
  stageDocs,
  docViewMode,
  changeDocViewMode,
  stageSablons,
  sablons,
  activeStarredDocs,
  ciktiLoading,
  handleOpenPreviewForSablon,
  quickPrint,
  quickExport,
  quickOpenExternal,
  isSablonDisabled,
  disableDocumentGuidance,
  invitedFirms,
  allPoolFirms,
  handleAddSingleFirm,
  handleRemoveFirm,
  items,
  bids,
  setActiveFormTab,
  activeActionDropdown,
  setActiveActionDropdown,
  handleUpdateDocumentDate,
  setIsFirmModalOpen,
  handleDeleteDocument,
}: PiyasaFiyatArastirmasiDashboardProps): React.JSX.Element {
  const handleOpenSablonByDosyaAdi = (targetKey: string) => {
    if (!handleOpenPreviewForSablon || !sablons || sablons.length === 0) return;

    const cleanTarget = targetKey.replace(/\.html$/, "").toLowerCase().trim();
    const candidateKeys = SABLON_ALIAS_MAP[cleanTarget] || [cleanTarget];

    let foundSablon: any = null;

    for (const key of candidateKeys) {
      foundSablon = sablons.find((s: any) => {
        const fileBase = (s.dosya_adi || "").replace(/\.html$/, "")
          .toLowerCase().trim();
        return fileBase === key;
      });
      if (foundSablon) break;
    }

    if (!foundSablon) {
      for (const key of candidateKeys) {
        foundSablon = sablons.find((s: any) => {
          const route = (s.route_path || s.id || "").toLowerCase().trim();
          return route === key;
        });
        if (foundSablon) break;
      }
    }

    if (!foundSablon) {
      for (const key of candidateKeys) {
        const normKey = normalizeForMatch(key);
        foundSablon = sablons.find((s: any) => {
          const normSablonName = normalizeForMatch(s.ad || s.dosya_adi || "");
          return normSablonName === normKey;
        });
        if (foundSablon) break;
      }
    }

    if (foundSablon) {
      handleOpenPreviewForSablon(foundSablon, foundSablon.ad);
    } else {
      console.warn("Şablon bulunamadı:", targetKey);
    }
  };

  const mappedBelgeler = useMemo(() => {
    if (!stageDocs) return [];

    // Group and sort by id to determine siraNo sequentially
    const sortedDocs = [...stageDocs].sort((a, b) => a.id - b.id);
    const counts: Record<string, number> = {};

    return sortedDocs.map((doc) => {
      const isMaliyet = doc.belge_adi === "Yaklaşık Maliyet Cetveli" ||
        doc.belge_adi?.toLowerCase().includes("maliyet");
      const typeId = isMaliyet
        ? "yaklasik-maliyet"
        : "piyasa-fiyat-arastirmasi";

      counts[typeId] = (counts[typeId] || 0) + 1;

      return {
        id: doc.id,
        belgeTipiId: typeId,
        belgeAdi: doc.belge_adi,
        belgeTarihi: doc.belge_tarihi
          ? formatDateString(doc.belge_tarihi) || doc.belge_tarihi
          : "-",
        durum: "Tamamlandı" as const,
        siraNo: counts[typeId],
        data: doc,
      };
    });
  }, [stageDocs]);

  const handleOpenBelgePreview = (belge: BelgeItem) => {
    const targetSablon = sablons.find((s: any) => {
      const lowerAd = s.ad.toLowerCase();
      const lowerDocName = belge.belgeAdi.toLowerCase();
      return lowerAd.includes(lowerDocName) || lowerDocName.includes(lowerAd);
    });

    if (targetSablon) {
      let snapshotCtx = undefined;
      const originalDoc = belge.data as any;
      if (originalDoc?.veri_json) {
        try {
          snapshotCtx = JSON.parse(originalDoc.veri_json);
        } catch (e) {
          console.error("Error parsing saved document JSON:", e);
        }
      }
      handleOpenPreviewForSablon(targetSablon, targetSablon.ad, snapshotCtx);
    } else {
      alert("Bu belge için uygun şablon bulunamadı.");
    }
  };

  const firmaColumns = useMemo(
    () => [
      { key: "unvan", label: "Firma Unvanı" },
      { key: "vergi_no", label: "Vergi No / VKN" },
      { key: "telefon", label: "Telefon" },
      { key: "email", label: "E-Posta" },
      { key: "sehir", label: "İl / Semt" },
    ],
    [],
  );

  const formattedFirms = useMemo(() => {
    if (!allPoolFirms) return [];
    return allPoolFirms.map((pf) => {
      const existingInvited = invitedFirms?.find(
        (ifrm) => ifrm.firma_id === pf.id,
      );
      return {
        ...pf,
        temin_firma_id: existingInvited?.id,
        isAdded: Boolean(existingInvited),
        sehir: pf.il || (pf as any).sehir || "-",
        telefon: pf.telefon || "-",
        email: pf.email || (pf as any).eposta || "-",
        vergi_no: pf.vergi_no || "-",
      };
    });
  }, [allPoolFirms, invitedFirms]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Top Header Controls Bar */}

      <FiyatIstenenFirmalarınSecilmesi
        title="Fiyat İstenen Firmaların Seçilmesi"
        firms={formattedFirms}
        columns={firmaColumns}
        onFiyatGir={() => {
          setIsFormOpen(true);
          setActiveFormTab("matrix");
        }}
        onFiyatPiyasaFormu={() => {
          handleOpenSablonByDosyaAdi("arastirma-mektubu");
        }}
        onBirimFiyatArastirmasi={() => {
          handleOpenSablonByDosyaAdi("birim-fiyat-arastirmasi");
        }}
        onFirmaEkle={(firma) => {
          if (handleAddSingleFirm) {
            handleAddSingleFirm(firma);
          }
        }}
        onFirmaCikar={(firma) => {
          if (handleRemoveFirm && (firma as any).temin_firma_id) {
            handleRemoveFirm((firma as any).temin_firma_id);
          }
        }}
        onOpenFirmaSecmeModali={() => {
          if (setIsFirmModalOpen) {
            setIsFirmModalOpen(true);
          }
        }}
        extraHeaderAction={
          <MalzemeTabloPopover
            step={2}
            disableDocumentGuidance={disableDocumentGuidance}
            onGorevlendirmeOnayi={() =>
              handleOpenSablonByDosyaAdi("komisyon-gorevlendirme-onayi")}
            onGorevlendirmeOnayEki={() =>
              handleOpenSablonByDosyaAdi("komisyon-gorevlendirme-onayi-eki")}
            onFiyatArastirmaKomisyonu={() =>
              handleOpenSablonByDosyaAdi("piyasa-fiyat-arastirma-tutanagi")}
            onPiyasaArastirmaGorevlendirmesi={() =>
              handleOpenSablonByDosyaAdi(
                "piyasa-fiyat-arastirma-gorevlendirmesi",
              )}
            onPiyasaArastirmaTutanagi={() =>
              handleOpenSablonByDosyaAdi("piyasa-fiyat-arastirma-tutanagi")}
            onYaklasikMaliyetHesapCetveli={() =>
              handleOpenSablonByDosyaAdi("yaklasik-maliyet-cetveli")}
            onSonAlimCetveli={() =>
              handleOpenSablonByDosyaAdi("son-alim-fiyat-cetveli")}
            onPiyasaSonucCetveli={() =>
              handleOpenSablonByDosyaAdi(
                "piyasa-fiyat-arastirmasi-sonuc-cetveli",
              )}
            onTeklifIstemeMektubu={() =>
              handleOpenSablonByDosyaAdi("arastirma-mektubu")}
            onTeklifMektubuDagitim={() =>
              handleOpenSablonByDosyaAdi("teklif-mektubu-dagitim")}
            onTeklifMektubuKarma={() =>
              handleOpenSablonByDosyaAdi("teklif-mektubu-dagitim-karma")}
            onFirmalarTeklifCetveli={() =>
              handleOpenSablonByDosyaAdi("firmalar-teklif-cetveli")}
            onYasaklilikSorgulama={() =>
              handleOpenSablonByDosyaAdi("yasaklilik-sorgulama-tutanagi")}
            onOnayBelgesi={() =>
              handleOpenSablonByDosyaAdi("dogrudan-temin-onay-belgesi")}
          />
        }
      />
      {dashboardViewMode === "prices"
        ? (
          <PricesSummaryDashboard
            invitedFirms={invitedFirms}
            items={items}
            bids={bids}
            onManageFirmsClick={() => {
              setIsFormOpen(true);
              setActiveFormTab("firms");
            }}
          />
        )
        : (
          <>
            <BelgeListesi
              title="Hazırlanan Tutanaklar"
              belgeler={mappedBelgeler}
              viewMode={docViewMode}
              onViewModeChange={changeDocViewMode}
              onView={handleOpenBelgePreview}
              onEdit={handleOpenBelgePreview}
              onDelete={(belge) => {
                if (handleDeleteDocument) {
                  handleDeleteDocument(belge.id);
                }
              }}
              onCreateBelge={(type) => {
                if (type === "yaklasik-maliyet") {
                  handleNewDocument("maliyet");
                } else {
                  handleNewDocument("tutanak");
                }
              }}
            />
            <DocumentsDashboard
              stageDocs={stageDocs}
              docViewMode={docViewMode}
              sablons={sablons}
              disableDocumentGuidance={disableDocumentGuidance}
              activeActionDropdown={activeActionDropdown}
              setActiveActionDropdown={setActiveActionDropdown}
              handleOpenPreviewForSablon={handleOpenPreviewForSablon}
              quickPrint={quickPrint}
              quickOpenExternal={quickOpenExternal}
              handleUpdateDocumentDate={handleUpdateDocumentDate}
            />
          </>
        )}
    </div>
  );
}
