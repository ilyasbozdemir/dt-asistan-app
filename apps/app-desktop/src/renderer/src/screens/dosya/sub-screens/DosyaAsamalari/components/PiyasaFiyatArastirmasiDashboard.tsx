import React from "react";
import {
  FileCheck2,
  LayoutGrid,
  List,
  Plus,
  Table,
  TrendingUp,
} from "lucide-react";
import { cn } from "../../../../../utils/cn";
import { DocumentsDashboard } from "./DocumentsDashboard";
import { PricesSummaryDashboard } from "./PricesSummaryDashboard";
import { PrintDropdownButton } from "../../../components/PrintDropdownButton";

interface PiyasaFiyatArastirmasiDashboardProps {
  setIsFormOpen: (val: boolean) => void;
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
  handleUpdateDocumentDate: (docId: number, newDate: string, docName: string) => void;
}

export function PiyasaFiyatArastirmasiDashboard({
  setIsFormOpen,
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
      {/* Row 1: Title and Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-5">
        <div>
          <h3 className="text-base font-black text-slate-855 dark:text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse">
            </span>
            Piyasa Fiyat Araştırma Süreci
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            Tedarikçi tekliflerini girip karşılaştırabilir, en uygun teklifleri
            ve yaklaşık maliyet cetvelini hazırlayabilirsiniz.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="group flex items-center gap-2 text-xs font-semibold px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 h-10 cursor-pointer border border-blue-500/30 shrink-0 self-start sm:self-center"
          title="İstekli Teklif Formları Girişi & Piyasa Fiyat Araştırma Tutanağı / Yaklaşık Maliyet Oluşturma Alanı"
        >
          <Plus className="w-4.5 h-4.5 transition-transform group-hover:scale-110 group-hover:rotate-90 duration-300" />
          <span>Yeni Piyasa Fiyat Araştırma Tutanağı (PFAT) Oluştur</span>
        </button>
      </div>

      {/* Row 2: Sub-navigation Tabs & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/30 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800/80">
        {/* Left side: View Mode switcher tabs */}
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
            Belgeler
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

        {/* Right side: Active Tab specific layout controls */}
        {dashboardViewMode === "documents" && (
          <div className="flex flex-wrap items-center gap-3 w-fit">
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
          </div>
        )}
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
