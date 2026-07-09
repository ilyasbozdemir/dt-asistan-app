import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ClipboardList,
  CreditCard,
  FileCheck,
  FileText,
  FolderTree,
  PackageSearch,
  Printer,
} from "lucide-react";
import { useCiktiMerkeziData } from "../../screens/dosya/CiktiMerkezi.hooks";
import { useQuery } from "@tanstack/react-query";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { subPagesMapping } from "../../constants/surecler";
import { APP_ROUTES } from "../../constants/routeConstants";
import { checkIsSablonDisabled } from "../../screens/dosya/sub-screens/DosyaAsamalari/useDosyaAsamasiSablons";
import { cn } from "../../utils/cn";

const parseStatusAndName = (
  name?: string | null,
): { status: string | null; cleanName: string } => {
  if (!name) return { status: null, cleanName: "" };
  let status: string | null = null;
  let cleanName = name;

  const nameMatch = name.match(/^\[(.*?)\]\s*(.*)$/);
  if (nameMatch) {
    status = nameMatch[1].trim();
    cleanName = nameMatch[2].trim();
  }

  return { status, cleanName };
};

const getStatusBadgeClass = (status: string): string => {
  const lower = status.toLowerCase();
  if (
    lower.includes("bakım") ||
    lower.includes("güncel") ||
    lower.includes("geliş") ||
    lower.includes("maint")
  ) {
    return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-500/20";
  }
  if (
    lower.includes("aktif") ||
    lower.includes("hazır") ||
    lower.includes("tamam") ||
    lower.includes("ready") ||
    lower.includes("active")
  ) {
    return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-500/20";
  }
  if (
    lower.includes("pasif") ||
    lower.includes("iptal") ||
    lower.includes("eski") ||
    lower.includes("disable") ||
    lower.includes("deprec")
  ) {
    return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-500/20";
  }
  return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-500/20";
};

export function ActiveFileToolbar(): React.JSX.Element | null {
  const { activeDosyaId, setActiveDosyaId, activeStarredDocs } =
    useWorkspaceStore();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { data: dbAsamalar = [] } = useQuery<any[]>({
    queryKey: ["sidebar_asamalar"],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        "db:query",
        "SELECT * FROM TANIM_Asama WHERE aktif_mi = 1 ORDER BY asama_sira ASC",
      );
      if (!res.success) return [];
      return res.data;
    },
  });

  const stagesToUse = dbAsamalar.length > 0 ? [...dbAsamalar] : [
    { asama_sira: 1, asama_adi: "İhtiyaç Tespiti & Başlangıç" },
    { asama_sira: 2, asama_adi: "Piyasa Fiyat Araştırması" },
    { asama_sira: 3, asama_adi: "Sipariş & Sözleşme" },
    { asama_sira: 4, asama_adi: "Kabul & Ödeme İşlemleri" },
    { asama_sira: 5, asama_adi: "Klasör & Kapaklar" },
  ];

  if (dbAsamalar.length > 0 && !stagesToUse.some((a) => a.asama_sira === 5)) {
    stagesToUse.push({ asama_sira: 5, asama_adi: "Klasör & Kapaklar" });
  }

  // Override stage names from subPagesMapping to ensure titles are synchronized
  const stagesToUseMapped = stagesToUse.map((asama) => {
    const match = subPagesMapping.find((p) => p.stage === asama.asama_sira);
    return {
      ...asama,
      asama_adi: match ? match.name : asama.asama_adi,
    };
  });

  const stepperStages = stagesToUseMapped.filter((a) => a.asama_sira <= 4);
  const archiveStage = stagesToUseMapped.find((a) => a.asama_sira === 5);

  // Şablon verileri – aktif dosyanın kategorisine göre süzülecek
  const { sablons, dosyaContext, activeDosya } = useCiktiMerkeziData(
    activeDosyaId,
  );

  // asama_sira → kategori slug eşleşmesi
  const STAGE_KATEGORI: Record<number, string[]> = {
    1: ["1-ihtiyac-tespiti-ve-baslangic", "1. İhtiyaç Tespiti & Başlangıç"],
    2: ["2-piyasa-fiyat-arastirmasi", "2. Piyasa Fiyat Araştırması"],
    3: ["3-siparis-ve-sozlesme", "3. Sipariş & Sözleşme"],
    4: ["4-kabul-ve-odeme-islemleri", "4. Kabul & Ödeme İşlemleri"],
    5: ["5-klasor-ve-kapaklar", "5. Klasör & Kapaklar"],
  };

  // asama_sira → o aşamanın birincil route'u
  const STAGE_ROUTE: Record<number, string> = {
    1: APP_ROUTES.HAZIRLIK_VE_IHTIYAC,
    2: APP_ROUTES.PIYASA_FIYAT_ARASTIRMASI,
    3: APP_ROUTES.SIPARIS_VE_SOZLESME,
    4: APP_ROUTES.KABUL_VE_ODEME,
    5: APP_ROUTES.KLASOR_VE_KAPAKLAR,
  };

  // Kurallar: Dosya verisine göre şablonun hazır/disabled olup olmadığını kontrol eder
  const isSablonDisabled = (cleanName: string): boolean => {
    return checkIsSablonDisabled(cleanName, dosyaContext);
  };

  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(
    window.location.hash.split("?")[1] || "",
  );
  const isDosyaWindowMode = searchParams.get("mode") === "dosya_window" ||
    hashParams.get("mode") === "dosya_window";

  const navigate = useNavigate();

  return (
    <div className="min-h-[3rem] py-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-sm border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center px-4 gap-2 shrink-0 z-40 relative">
      {!isDosyaWindowMode && (
        <button
          onClick={() => setActiveDosyaId(null)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700 rounded-md transition-colors mr-2"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Dosyadan Çık
        </button>
      )}

      <div
        className="flex-1 flex items-center gap-2 flex-wrap"
        ref={dropdownRef}
      >
        {/* Stepper (1-4 Aşamalar) */}
        <div className="flex items-center bg-slate-50 dark:bg-slate-950/40 p-1 rounded-lg border border-slate-200/60 dark:border-slate-800/60 gap-1.5">
          {stepperStages.map((asama, idx) => {
            const kategoriler = STAGE_KATEGORI[asama.asama_sira] || [];
            let stageSablons = sablons.filter((s: any) =>
              kategoriler.includes(s.kategori)
            );

            // Kullanıcı menüde (Hızlı Erişim panelinde) sadece hızlı erişimdekileri görmek istiyor
            if (activeStarredDocs && activeStarredDocs.length > 0) {
              stageSablons = stageSablons.filter((sablon: any) => {
                const { cleanName } = parseStatusAndName(sablon.ad);
                const normalize = (str: string) =>
                  str
                    .replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ]/g, "")
                    .toLowerCase()
                    .trim();
                return activeStarredDocs.some(
                  (d: string) =>
                    normalize(d) === normalize(sablon.ad) ||
                    normalize(d) === normalize(cleanName),
                );
              });
            } else {
              stageSablons = []; // Eğer hiç yıldızlanan yoksa menüyü boş göster (Aşamaya Git linki kalır)
            }
            const stageRoute = STAGE_ROUTE[asama.asama_sira];
            const dropdownKey = `asama_sablon_${asama.asama_sira}`;

            let IconComponent: React.ElementType = FolderTree;
            if (asama.asama_sira === 1) IconComponent = FolderTree;
            else if (asama.asama_sira === 2) IconComponent = PackageSearch;
            else if (asama.asama_sira === 3) IconComponent = FileCheck;
            else if (asama.asama_sira === 4) IconComponent = CreditCard;

            const isCompleted = activeDosya?.durum_asama_id
              ? asama.asama_sira < activeDosya.durum_asama_id
              : false;
            const isActive = activeDosya?.durum_asama_id
              ? asama.asama_sira === activeDosya.durum_asama_id
              : asama.asama_sira === 1;

            return (
              <React.Fragment key={asama.asama_sira}>
                {idx > 0 && (
                  <span className="text-slate-350 dark:text-slate-700 text-[10px] mx-0.5 select-none font-bold">
                    ➔
                  </span>
                )}

                <div className="relative inline-block">
                  <button
                    onClick={() => {
                      if (stageSablons.length === 0) {
                        navigate({ to: stageRoute as any });
                      } else {
                        setOpenDropdown(
                          openDropdown === dropdownKey ? null : dropdownKey,
                        );
                      }
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors",
                      isActive
                        ? "bg-blue-600 text-white dark:bg-blue-600/90 dark:text-white shadow-sm"
                        : isCompleted
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400"
                        : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
                    )}
                    title={`${asama.asama_sira}. AŞAMA: ${asama.asama_adi}`}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0",
                        isActive
                          ? "bg-white text-blue-600"
                          : isCompleted
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                      )}
                    >
                      {isCompleted
                        ? <Check className="w-2.5 h-2.5" />
                        : asama.asama_sira}
                    </div>
                    <span className="hidden lg:inline">{asama.asama_adi}</span>
                    {stageSablons.length > 0 && (
                      <ChevronDown
                        className={cn(
                          "w-3 h-3 transition-transform",
                          openDropdown === dropdownKey ? "rotate-180" : "",
                        )}
                      />
                    )}
                  </button>

                  {openDropdown === dropdownKey && stageSablons.length > 0 && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl rounded-lg py-1 z-50">
                      {/* Aşamaya git linki */}
                      <Link
                        to={stageRoute as any}
                        onClick={() => setOpenDropdown(null)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800"
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                        {asama.asama_sira}. {asama.asama_adi} →
                      </Link>
                      {/* O aşamaya ait şablonlar */}
                      {stageSablons.map((sablon: any) => {
                        const { status, cleanName } = parseStatusAndName(
                          sablon.ad,
                        );
                        const disabled = isSablonDisabled(cleanName);

                        return (
                          <button
                            key={sablon.id || sablon.ad}
                            onClick={() => {
                              if (disabled) return;
                              setOpenDropdown(null);
                              navigate({
                                to: stageRoute as any,
                                search: { sablonAd: sablon.ad } as any,
                              });
                            }}
                            disabled={disabled}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-2 text-xs transition-colors",
                              disabled
                                ? "opacity-40 cursor-not-allowed text-slate-500 bg-slate-50/50 dark:bg-slate-900/50"
                                : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer",
                            )}
                          >
                            <div className="flex items-center gap-2 truncate flex-1 min-w-0 pr-2 text-left">
                              <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{cleanName}</span>
                            </div>
                            {status && (
                              <span
                                className={cn(
                                  "px-1 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide shrink-0",
                                  getStatusBadgeClass(status),
                                )}
                              >
                                {status}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-2">
        {/* Klasör & Kapak (Görsel olarak ayrı ve stepper dışında) */}
        {archiveStage && (() => {
          const kategoriler = STAGE_KATEGORI[5] || [];
          let stageSablons = sablons.filter((s: any) =>
            kategoriler.includes(s.kategori)
          );

          if (activeStarredDocs && activeStarredDocs.length > 0) {
            stageSablons = stageSablons.filter((sablon: any) => {
              const { cleanName } = parseStatusAndName(sablon.ad);
              const normalize = (str: string) =>
                str
                  .replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ]/g, "")
                  .toLowerCase()
                  .trim();
              return activeStarredDocs.some(
                (d: string) =>
                  normalize(d) === normalize(sablon.ad) ||
                  normalize(d) === normalize(cleanName),
              );
            });
          } else {
            stageSablons = [];
          }
          const dropdownKey = `asama_sablon_5`;

          return (
            <div className="relative inline-block">
              <button
                onClick={() => {
                  if (stageSablons.length === 0) {
                    navigate({ to: STAGE_ROUTE[5] as any });
                  } else {
                    setOpenDropdown(
                      openDropdown === dropdownKey ? null : dropdownKey,
                    );
                  }
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors border",
                  openDropdown === dropdownKey
                    ? "bg-slate-200 text-slate-900 border-slate-300 dark:bg-slate-700 dark:text-white dark:border-slate-650"
                    : "text-slate-700 bg-slate-50 border-slate-200 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:bg-slate-800/40 dark:border-slate-800 dark:hover:bg-slate-850",
                )}
                title="Klasör & Kapaklar (Arşiv/Yardımcı Araçlar)"
              >
                <FolderTree className="w-3.5 h-3.5 shrink-0" />
                <span>Klasör & Kapak</span>
                {stageSablons.length > 0 && (
                  <ChevronDown
                    className={cn(
                      "w-3 h-3 transition-transform",
                      openDropdown === dropdownKey ? "rotate-180" : "",
                    )}
                  />
                )}
              </button>

              {openDropdown === dropdownKey && stageSablons.length > 0 && (
                <div className="absolute top-full right-0 mt-1 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl rounded-lg py-1 z-50">
                  <Link
                    to={STAGE_ROUTE[5] as any}
                    onClick={() => setOpenDropdown(null)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800"
                  >
                    <FolderTree className="w-3.5 h-3.5" />
                    Klasör & Kapak Aşamasına Git →
                  </Link>
                  {stageSablons.map((sablon: any) => {
                    const { status, cleanName } = parseStatusAndName(sablon.ad);
                    const disabled = isSablonDisabled(cleanName);

                    return (
                      <button
                        key={sablon.id || sablon.ad}
                        onClick={() => {
                          if (disabled) return;
                          setOpenDropdown(null);
                          navigate({
                            to: STAGE_ROUTE[5] as any,
                            search: { sablonAd: sablon.ad } as any,
                          });
                        }}
                        disabled={disabled}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 text-xs transition-colors",
                          disabled
                            ? "opacity-40 cursor-not-allowed text-slate-500 bg-slate-50/50 dark:bg-slate-900/50"
                            : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer",
                        )}
                      >
                        <div className="flex items-center gap-2 truncate flex-1 min-w-0 pr-2 text-left">
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{cleanName}</span>
                        </div>
                        {status && (
                          <span
                            className={cn(
                              "px-1 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide shrink-0",
                              getStatusBadgeClass(status),
                            )}
                          >
                            {status}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        <Link
          to="/takip"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 rounded-md transition-colors"
        >
          <ClipboardList className="w-3.5 h-3.5" />
          Süreç & Durum
        </Link>
        <Link
          to="/cikti-merkezi"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50 rounded-md transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          Çıktı Merkezi
        </Link>
      </div>
    </div>
  );
}
