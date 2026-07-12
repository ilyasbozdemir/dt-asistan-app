import React, { useEffect, useState } from "react";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  Cpu,
  FileArchive,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { ProcessStats } from "./components/ProcessStats";
import { DteTransfer } from "./components/DteTransfer";
import { PackageStructure } from "./components/PackageStructure";
import { SelectedFileInspector } from "./components/SelectedFileInspector";
import { UpdaterWidget } from "./components/UpdaterWidget";
import { ChangelogWidget } from "./components/ChangelogWidget";

interface TableStat {
  tableName: string;
  label: string;
  count: number;
  description: string;
}

type PackageFile = "meta.json" | "database.sqlite" | "attachments/";

export default function DosyaScreen(): React.JSX.Element {
  const { activeMeta, activeFilePath, fileName } = useWorkspaceStore();
  const [selectedFile, setSelectedFile] = useState<PackageFile>("meta.json");
  const [copied, setCopied] = useState(false);

  const queryClient = useQueryClient();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [changelog, setChangelog] = useState<
    { version: string; notes: string; schema_max: number }[]
  >([]);
  const [backlog, setBacklog] = useState<{ title: string; items: string[] }[]>(
    [],
  );
  const [activeHistoryTab, setActiveHistoryTab] = useState<
    "releases" | "backlog"
  >("releases");

  // Süreç Yönetimi States
  const [processStats, setProcessStats] = useState({
    asama1: 0,
    asama2: 0,
    asama3: 0,
    asama4: 0,
    tamamlandi: 0,
  });
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  useEffect(() => {
    if (!window.electron) return;
    window.electron.ipcRenderer
      .invoke("get-changelog")
      .then((res) => {
        if (res && res.success) {
          setChangelog(res.changelog || []);
          setBacklog(res.backlog || []);
        } else if (Array.isArray(res)) {
          setChangelog(res);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!window.electron || !activeFilePath) return;
    const fetchProcessStats = async () => {
      try {
        const res = await window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT durum_asama_id, COUNT(*) as count FROM DATA_TeminDosyasi GROUP BY durum_asama_id",
        );
        if (res.success && res.data) {
          const stats = {
            asama1: 0,
            asama2: 0,
            asama3: 0,
            asama4: 0,
            tamamlandi: 0,
          };
          res.data.forEach((row: any) => {
            const asama = row.durum_asama_id || 1;
            if (asama === 1) stats.asama1 += row.count;
            else if (asama === 2) stats.asama2 += row.count;
            else if (asama === 3) stats.asama3 += row.count;
            else if (asama === 4) stats.asama4 += row.count;
            else if (asama === 5) stats.tamamlandi += row.count;
          });
          setProcessStats(stats);
        }
      } catch (e) {
        console.error("Süreç istatistikleri alınamadı", e);
      }
    };
    fetchProcessStats();
  }, [activeFilePath, refreshTrigger]);

  // DTE Data Transfer States
  const [dteContentType, setDteContentType] = useState<
    "firms" | "items" | "all"
  >("firms");
  const [dteStatus, setDteStatus] = useState<
    {
      type: "success" | "error" | "info";
      message: string;
    } | null
  >(null);
  const [dteLoading, setDteLoading] = useState(false);

  const handleExportDte = async (): Promise<void> => {
    setDteLoading(true);
    setDteStatus(null);
    try {
      const res = await window.electron.ipcRenderer.invoke(
        "db:export-dte",
        dteContentType,
      );
      if (res.success) {
        setDteStatus({
          type: "success",
          message:
            `Veriler başarıyla dışa aktarıldı. (${res.recordCount} kayıt)`,
        });
      } else {
        if (res.error !== "İptal edildi") {
          setDteStatus({
            type: "error",
            message: `Dışa aktarma hatası: ${res.error}`,
          });
        }
      }
    } catch (err: any) {
      setDteStatus({
        type: "error",
        message: err.message || "Dışa aktarım sırasında beklenmedik hata.",
      });
    } finally {
      setDteLoading(false);
    }
  };

  const handleImportDte = async (): Promise<void> => {
    setDteLoading(true);
    setDteStatus(null);
    try {
      const res = await window.electron.ipcRenderer.invoke("db:import-dte");
      if (res.success) {
        let msg = "";
        if (res.importedFirmsCount > 0) {
          msg += `${res.importedFirmsCount} adet firma `;
        }
        if (res.importedItemsCount > 0) {
          msg += `${
            msg ? "ve " : ""
          }${res.importedItemsCount} adet malzeme/hizmet kalemi `;
        }

        if (res.totalImportedCount > 0 && !msg) {
          msg = `Toplam ${res.totalImportedCount} adet kayıt `;
        }

        if (!msg && res.totalImportedCount === 0) {
          msg = "Aktarılacak yeni kayıt bulunamadı veya atlandı.";
        } else {
          msg += "başarıyla içe aktarıldı.";
        }

        if (res.warnings && res.warnings.length > 0) {
          msg += ` (Uyarı: ${res.warnings.join(", ")})`;
        }

        setDteStatus({
          type: "success",
          message: msg,
        });

        // Invalidate react-query cache
        queryClient.invalidateQueries();
        // Refresh local stats
        setRefreshTrigger((prev) => prev + 1);
      } else {
        if (res.error !== "İptal edildi") {
          setDteStatus({
            type: "error",
            message: `İçe aktarma hatası: ${res.error}`,
          });
        }
      }
    } catch (err: any) {
      setDteStatus({
        type: "error",
        message: err.message || "İçe aktarım sırasında beklenmedik hata.",
      });
    } finally {
      setDteLoading(false);
    }
  };

  // Database stats state
  const [dbStats, setDbStats] = useState<TableStat[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Auto-Updater States
  const [updaterStatus, setUpdaterStatus] = useState<string>("idle"); // idle, checking, available, not-available, downloaded, error
  const [updateVersion, setUpdateVersion] = useState<string>("");
  const [updaterError, setUpdaterError] = useState<string>("");

  useEffect(() => {
    if (!window.electron) return;

    const removeListener = window.electron.ipcRenderer.on(
      "updater:status",
      (_, data: { status: string; version?: string; error?: string }) => {
        setUpdaterStatus(data.status);
        if (data.version) setUpdateVersion(data.version);
        if (data.error) setUpdaterError(data.error);
      },
    );

    return () => {
      if (removeListener) removeListener();
    };
  }, []);

  const handleCheckUpdates = async (): Promise<void> => {
    setUpdaterStatus("checking");
    setUpdaterError("");
    try {
      const res = await window.electron.ipcRenderer.invoke("updater:check");
      if (!res.success) {
        setUpdaterStatus("error");
        setUpdaterError(res.error || "Güncelleme kontrolü başarısız.");
      }
    } catch (err: any) {
      setUpdaterStatus("error");
      setUpdaterError(err.message || "Hata oluştu.");
    }
  };

  const handleQuitAndInstall = async (): Promise<void> => {
    try {
      await window.electron.ipcRenderer.invoke("updater:quit-and-install");
    } catch (err: any) {
      alert("Güncelleme yüklenirken hata oluştu: " + err.message);
    }
  };

  // Fetch SQLite stats when workspace changes or database.sqlite is selected
  useEffect(() => {
    if (!window.electron || !activeFilePath) return;

    const fetchStats = async (): Promise<void> => {
      setLoadingStats(true);
      setStatsError(null);
      try {
        const tables = [
          {
            name: "DATA_TeminDosyasi",
            label: "Doğrudan Temin Dosyaları",
            desc: "Süreçteki doğrudan temin dosyaları ve ihale teklifleri",
          },
          {
            name: "TANIM_Birim",
            label: "Kurum Birimleri",
            desc: "Bütçe harcaması yapan belediye müdürlükleri/birimleri",
          },
          {
            name: "TANIM_Personel",
            label: "Personel Havuzu",
            desc: "Evraklarda imza yetkilisi olan kurum çalışanları",
          },
          {
            name: "TANIM_Mevzuat",
            label: "Mevzuat ve Limitler",
            desc: "Yıllara göre doğrudan temin bütçe ve KDV limitleri",
          },
          {
            name: "TANIM_Firma",
            label: "Kayıtlı Firmalar",
            desc: "Sistemde kayıtlı tedarikçiler ve firmalar havuzu",
          },
          {
            name: "TANIM_Kalem",
            label: "Malzeme/Hizmet Kütüphanesi",
            desc: "Yaklaşık maliyet kalem kütüphanesi",
          },
          {
            name: "settings",
            label: "Sistem Ayarları",
            desc: "Uygulamanın yerel yapılandırma anahtar-değer çiftleri",
          },
        ];

        const statsPromises = tables.map(async (table) => {
          const res = await window.electron.ipcRenderer.invoke(
            "db:query",
            `SELECT COUNT(*) as row_count FROM ${table.name}`,
          );
          if (res.success && res.data && res.data.length > 0) {
            return {
              tableName: table.name,
              label: table.label,
              count: res.data[0].row_count,
              description: table.desc,
            };
          }
          return {
            tableName: table.name,
            label: table.label,
            count: 0,
            description: table.desc,
          };
        });

        const results = await Promise.all(statsPromises);
        setDbStats(results);
      } catch (err: any) {
        console.error("Veritabanı istatistikleri alınamadı:", err);
        setStatsError(err.message || "İstatistikler okunamadı.");
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [activeFilePath, refreshTrigger]);

  const handleCopyPath = (): void => {
    if (!activeFilePath) return;
    navigator.clipboard.writeText(activeFilePath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Prettified JSON representation of activeMeta
  const rawJson = activeMeta
    ? JSON.stringify(
      {
        dtal_version: activeMeta.dtal_version,
        app_version: activeMeta.app_version,
        created_at: activeMeta.created_at,
        institution: activeMeta.institution,
        schema_version: activeMeta.schema_version,
      },
      null,
      2,
    )
    : "";

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full">
      {/* Üst Başlık Bölümü */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 hover:shadow-sm active:scale-95 transition-all"
            title="Gösterge Paneline Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-855 dark:text-slate-100 flex items-center gap-2">
              <FileArchive className="w-7 h-7 text-amber-500" />
              Aktif Çalışma Dosyası (.dtal)
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs">
              Uygulamanın veri alışverişi yaptığı sıkıştırılmış veritabanı arşiv
              paketinin detayları.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Uyarılar (Varsa) */}
        {activeMeta?.warnings && activeMeta.warnings.length > 0 && (
          <div className="lg:col-span-12 bg-rose-50 dark:bg-rose-955/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-4 flex flex-col gap-3 shadow-sm mb-2 animate-in slide-in-from-top-2">
            {activeMeta.warnings.map((warn, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-rose-700 dark:text-rose-450 text-xs font-bold"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{warn}</p>
              </div>
            ))}
          </div>
        )}

        {/* SÜREÇ YÖNETİMİ (İŞ AKIŞI) */}
        <div className="lg:col-span-12 mb-2">
          <ProcessStats processStats={processStats} />
        </div>

        {/* AYIRICI VE TEKNİK DETAY AÇ/KAPA */}
        <div className="lg:col-span-12">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-200 dark:bg-slate-800 rounded-xl group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:bg-blue-900/40 dark:group-hover:text-blue-400 transition-colors">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Sistem ve Teknik Detaylar
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Arşiv yapısı, veritabanı yedeği (DTE) ve sistem güncellemeleri
                </p>
              </div>
            </div>
            {showTechnicalDetails ? (
              <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
            )}
          </button>
        </div>

        {showTechnicalDetails && (
          <>
            {/* SOL KOLON: PAKET YAPISI VE İÇERİK GÖRSELLEŞTİRME */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Paket Yapısı Kartı */}
              <PackageStructure
                fileName={fileName || ""}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
              />

              {/* Veri Alışverişi (.dte) Kartı */}
              <DteTransfer
                dteContentType={dteContentType}
                setDteContentType={setDteContentType}
                handleExportDte={handleExportDte}
                handleImportDte={handleImportDte}
                dteLoading={dteLoading}
                dteStatus={dteStatus}
              />

              {/* Hızlı Bilgi Bilgisi */}
              <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                <h2 className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider">
                  Dosya Değişiklik Davranışı
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-medium font-sans">
                  Uygulama çalışırken SQLite veritabanında yaptığınız tüm
                  işlemler anlık kaydedilir. Uygulamadan çıkış yaparken veya
                  dosya kapatılırken tüm veriler ve ekler otomatik olarak tekrar
                  sıkıştırılıp tek bir <strong>.dtal</strong>{" "}
                  arşiv dosyası olarak paketlenir.
                </p>
              </div>
            </div>

            {/* SAĞ KOLON: SEÇİLEN DOSYANIN INTERAKTIF DETAYI */}
            <SelectedFileInspector
              selectedFile={selectedFile}
              rawJson={rawJson}
              activeMeta={activeMeta}
              loadingStats={loadingStats}
              statsError={statsError}
              dbStats={dbStats}
              activeFilePath={activeFilePath}
              copied={copied}
              handleCopyPath={handleCopyPath}
            />
          </>
        )}
      </div>

      {/* Yol Haritası & Sürüm Notları (Changelog & Backlog) */}
      <ChangelogWidget
        activeHistoryTab={activeHistoryTab}
        setActiveHistoryTab={setActiveHistoryTab}
        changelog={changelog}
        backlog={backlog}
        activeMeta={activeMeta}
      />

      {/* Güncelleme Bölümü */}
      <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
      <UpdaterWidget
        activeMeta={activeMeta}
        updaterStatus={updaterStatus}
        updaterError={updaterError}
        handleCheckUpdates={handleCheckUpdates}
        handleQuitAndInstall={handleQuitAndInstall}
      />
    </div>
  );
}
