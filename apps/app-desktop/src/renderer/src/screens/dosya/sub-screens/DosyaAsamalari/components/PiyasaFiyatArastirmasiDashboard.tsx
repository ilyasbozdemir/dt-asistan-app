import React from "react";
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
import { PrintDropdownButton } from "../../../components/PrintDropdownButton";

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
  items,
  bids,
  setActiveFormTab,
  activeActionDropdown,
  setActiveActionDropdown,
  handleUpdateDocumentDate,
}: PiyasaFiyatArastirmasiDashboardProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Top Header Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-1.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        {/* Left side: View switch tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/40 w-fit shrink-0">
          <button
            type="button"
            onClick={() => setDashboardViewMode("documents")}
            className={cn(
              "flex items-center gap-1.5 py-1.5 px-3 text-[11px] font-black rounded-lg transition-all cursor-pointer border-0",
              dashboardViewMode === "documents"
                ? "bg-white dark:bg-slate-900 text-slate-855 dark:text-slate-100 shadow-3xs"
                : "text-slate-500 hover:text-slate-755 dark:hover:text-slate-355 bg-transparent",
            )}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            Belgeler & İşlemler
          </button>
          <button
            type="button"
            onClick={() => setDashboardViewMode("prices")}
            className={cn(
              "flex items-center gap-1.5 py-1.5 px-3 text-[11px] font-black rounded-lg transition-all cursor-pointer border-0",
              dashboardViewMode === "prices"
                ? "bg-white dark:bg-slate-900 text-slate-855 dark:text-slate-100 shadow-3xs"
                : "text-slate-500 hover:text-slate-755 dark:hover:text-slate-355 bg-transparent",
            )}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Fiyat & Teklif Özeti
          </button>
        </div>

        {/* Right side: Primary CTA and layout controls */}
        <div className="flex flex-wrap items-center justify-end gap-3 w-fit">
          {/* Separate Actions */}
          <button
            onClick={() => handleNewDocument("maliyet")}
            className="group relative inline-flex items-center justify-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-300 h-10 cursor-pointer shrink-0 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white border border-blue-400/30 dark:border-blue-500/40 overflow-hidden"
            title="Yeni yaklaşık maliyet hesap cetveli oluşturma ve teklif/proforma giriş alanı"
          >
            <span className="p-1 rounded-lg bg-white/20 text-white group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300 flex items-center justify-center">
              <Calculator className="w-3.5 h-3.5" />
            </span>
            <span className="tracking-wide">Yeni YMHC Oluştur</span>
          </button>

          <button
            onClick={() => handleNewDocument("tutanak")}
            className="group relative inline-flex items-center justify-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-300 h-10 cursor-pointer shrink-0 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/30 dark:border-emerald-500/40 overflow-hidden"
            title="Yeni piyasa fiyat araştırma tutanağı (PFAT) oluşturma ve teklif/proforma giriş alanı"
          >
            <span className="p-1 rounded-lg bg-white/20 text-white group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300 flex items-center justify-center">
              <FileSignature className="w-3.5 h-3.5" />
            </span>
            <span className="tracking-wide">Yeni PFAT Oluştur</span>
          </button>

          {dashboardViewMode === "documents" && (
            <>
              {stageDocs.length > 0 && (
                <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/40 shrink-0 h-10">
                  <button
                    type="button"
                    title="Izgara Görünümü"
                    onClick={() => changeDocViewMode("grid")}
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-all cursor-pointer border-0 bg-transparent",
                      docViewMode === "grid"
                        ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-3xs"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-400",
                    )}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title="Liste Görünümü"
                    onClick={() => changeDocViewMode("list")}
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-all cursor-pointer border-0 bg-transparent",
                      docViewMode === "list"
                        ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-3xs"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-400",
                    )}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title="Tablo Görünümü"
                    onClick={() => changeDocViewMode("table")}
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-all cursor-pointer border-0 bg-transparent",
                      docViewMode === "table"
                        ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-3xs"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-400",
                    )}
                  >
                    <Table className="w-4 h-4" />
                  </button>
                </div>
              )}

              {stageSablons.length > 0 && (
                <PrintDropdownButton
                  kategori="2-piyasa-fiyat-arastirmasi"
                  sablons={sablons}
                  overrideSablons={stageSablons}
                  activeStarredDocs={activeStarredDocs || []}
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
              )}
            </>
          )}
        </div>
      </div>

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
          <DocumentsDashboard
            stageDocs={stageDocs}
            docViewMode={docViewMode}
            sablons={sablons}
            disableDocumentGuidance={disableDocumentGuidance}
            activeActionDropdown={activeActionDropdown}
            setActiveActionDropdown={setActiveActionDropdown}
            handleOpenPreviewForSablon={handleOpenPreviewForSablon}
            quickOpenExternal={quickOpenExternal}
            quickPrint={quickPrint}
            handleUpdateDocumentDate={handleUpdateDocumentDate}
          />
        )}
    </div>
  );
}
