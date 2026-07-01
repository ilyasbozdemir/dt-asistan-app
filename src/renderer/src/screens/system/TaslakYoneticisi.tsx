import React, { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, Star, Trash2 } from "lucide-react";
import { useSablonlar } from "../sablonlar/sablonlar.hooks";
import { subPagesMapping } from "../../constants/surecler";

const FALLBACK_ROUTE = "/dosya/hazirlik-ve-ihtiyac";

const parseStatusAndName = (
  name: string,
  description?: string | null,
): { status: string | null; cleanName: string } => {
  let status: string | null = null;
  let cleanName = name;

  const nameMatch = name.match(/^\[(.*?)\]\s*(.*)$/);
  if (nameMatch) {
    status = nameMatch[1].trim();
    cleanName = nameMatch[2].trim();
  } else if (description) {
    const descMatch = description.match(/^\[(.*?)\]/);
    if (descMatch) {
      status = descMatch[1].trim();
    }
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
    return "bg-amber-500/20 text-amber-300 border border-amber-500/30";
  }
  if (
    lower.includes("aktif") ||
    lower.includes("hazır") ||
    lower.includes("tamam") ||
    lower.includes("ready") ||
    lower.includes("active")
  ) {
    return "bg-green-500/20 text-green-300 border border-green-500/30";
  }
  return "bg-blue-500/20 text-blue-300 border border-blue-500/30";
};

const getStatusBadgeLightClass = (status: string): string => {
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
  return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-500/20";
};

const normalizeForMatch = (str: string): string => {
  return str
    .toLocaleLowerCase("tr-TR")
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]/g, "");
};

export default function TaslakYoneticisi(): React.JSX.Element {
  const { data: sablonlar = [] } = useSablonlar();
  const [globalStarred, setGlobalStarred] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("global_starred_docs");
      return saved
        ? JSON.parse(saved)
        : ["İhtiyaç Listesi", "Lüzum Müzekkeresi"];
    } catch {
      return [];
    }
  });

  const saveStarred = (updated: string[]): void => {
    setGlobalStarred(updated);
    localStorage.setItem("global_starred_docs", JSON.stringify(updated));
    window.dispatchEvent(new Event("global_starred_changed"));
  };

  const routeMap = useMemo(() => {
    const map: Record<string, string> = {};
    subPagesMapping.forEach((p) => {
      map[p.name] = p.path;
    });
    sablonlar.forEach((s) => {
      if (s.route_path) {
        map[s.ad] = s.route_path;
      }
    });
    return map;
  }, [sablonlar]);

  const toggleStar = (docName: string): void => {
    const normalizedTarget = normalizeForMatch(docName);
    let updated = [...globalStarred];
    const exists = updated.some((d) =>
      normalizeForMatch(d) === normalizedTarget
    );

    if (exists) {
      updated = updated.filter((d) =>
        normalizeForMatch(d) !== normalizedTarget
      );
    } else {
      updated.push(docName);
    }
    saveStarred(updated);
  };

  const moveShortcut = (index: number, direction: "up" | "down"): void => {
    const updated = [...globalStarred];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.length) return;

    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    saveStarred(updated);
  };

  const groupedSablonlar = useMemo(() => {
    const groups: Record<string, typeof sablonlar> = {
      "1. İhtiyaç Tespiti & Başlangıç": [],
      "2. Teklifler & Piyasa Fiyat Araştırması": [],
      "3. Sipariş & Sözleşme": [],
      "4. Kabul & Ödeme İşlemleri": [],
      "5. Klasör & Kapaklar": [],
    };

    sablonlar.forEach((s) => {
      const cat = (s.kategori || "").toLowerCase();
      if (
        cat.includes("1") ||
        cat.includes("ihtiyac") ||
        cat.includes("başlangıç") ||
        cat.includes("baslangic")
      ) {
        groups["1. İhtiyaç Tespiti & Başlangıç"].push(s);
      } else if (
        cat.includes("2") ||
        cat.includes("fiyat") ||
        cat.includes("araştırma") ||
        cat.includes("arastirma") ||
        cat.includes("maliyet") ||
        cat.includes("piyasa")
      ) {
        groups["2. Teklifler & Piyasa Fiyat Araştırması"].push(s);
      } else if (
        cat.includes("3") ||
        cat.includes("sipariş") ||
        cat.includes("siparis") ||
        cat.includes("sözleşme") ||
        cat.includes("sozlesme") ||
        cat.includes("ihale") ||
        cat.includes("onay")
      ) {
        groups["3. Sipariş & Sözleşme"].push(s);
      } else if (
        cat.includes("4") ||
        cat.includes("kabul") ||
        cat.includes("ödeme") ||
        cat.includes("odeme") ||
        cat.includes("teslim")
      ) {
        groups["4. Kabul & Ödeme İşlemleri"].push(s);
      } else if (
        cat.includes("5") ||
        cat.includes("klasör") ||
        cat.includes("klasor") ||
        cat.includes("kapak")
      ) {
        groups["5. Klasör & Kapaklar"].push(s);
      } else {
        groups["1. İhtiyaç Tespiti & Başlangıç"].push(s);
      }
    });

    return groups;
  }, [sablonlar]);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
            Hızlı Erişim Paneli
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-2xl">
            Sık kullandığınız belge şablonlarını yıldızlayarak hızlı erişim
            listesine ekleyin. Yıldızladığınız belgeler sol panelde ve menülerde
            görünecektir.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol Panel: Genel Yıldızlı Kısayollar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-linear-to-br from-slate-900 to-slate-800 text-white border border-slate-700/50 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 opacity-10">
                <Star className="w-40 h-40 fill-white text-white" />
              </div>
              <div className="relative z-10">
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded border border-amber-500/30 uppercase tracking-wider">
                  Hızlı Erişim Belgeleri (Sıralama)
                </span>

                <div className="mt-5 pt-4">
                  {globalStarred.length === 0
                    ? (
                      <p className="text-xs italic text-slate-400">
                        Henüz kısayol eklenmemiş. Sağ taraftaki belgelerin
                        yanındaki yıldız butonuna basarak kısayol
                        ekleyebilirsiniz.
                      </p>
                    )
                    : (
                      <div className="space-y-2 mb-4">
                        {globalStarred.map((docName: string, idx: number) => {
                          const route = routeMap[docName];
                          const { status, cleanName } = parseStatusAndName(
                            docName,
                          );
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 p-2 rounded-xl"
                            >
                              {route
                                ? (
                                  <Link
                                    to={route}
                                    className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 truncate flex-1 min-w-0 pr-2"
                                  >
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                                    <span className="truncate">
                                      {cleanName}
                                    </span>
                                    {status && (
                                      <span
                                        className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide shrink-0 ${
                                          getStatusBadgeClass(status)
                                        }`}
                                      >
                                        {status}
                                      </span>
                                    )}
                                  </Link>
                                )
                                : (
                                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 truncate flex-1 min-w-0 pr-2 select-none">
                                    <Star className="w-3.5 h-3.5 fill-slate-600 text-slate-600 shrink-0" />
                                    <span className="truncate">
                                      {cleanName}
                                    </span>
                                    {status && (
                                      <span
                                        className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide shrink-0 ${
                                          getStatusBadgeClass(status)
                                        }`}
                                      >
                                        {status}
                                      </span>
                                    )}
                                  </div>
                                )}
                              <div className="flex items-center gap-1 shrink-0 ml-2">
                                <button
                                  onClick={() => moveShortcut(idx, "up")}
                                  disabled={idx === 0}
                                  className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                                  title="Yukarı Taşı"
                                >
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => moveShortcut(idx, "down")}
                                  disabled={idx === globalStarred.length - 1}
                                  className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                                  title="Aşağı Taşı"
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => toggleStar(docName)}
                                  className="p-1 hover:bg-red-955/50 rounded text-slate-400 hover:text-red-400 cursor-pointer"
                                  title="Kısayoldan Kaldır"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Panel: Süreç Belgeleri Listesi */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                Süreç Adımları & Belgeler Listesi
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Sistemdeki tüm süreç belgeleri aşağıda listelenmiştir. Doğrudan
                tıklayarak ilgili aşamaya hızlıca gidebilir, yıldız ikonuna
                tıklayarak genel hızlı erişime ekleyebilirsiniz.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(groupedSablonlar).map(([stageName, list]) => (
                  <div
                    key={stageName}
                    className="border border-slate-150 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950/20"
                  >
                    <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                      {stageName}
                    </h4>
                    <div className="space-y-1.5">
                      {list.map((sablon) => {
                        const route = routeMap[sablon.ad];
                        const isStarred = globalStarred.includes(sablon.ad);
                        const { status, cleanName } = parseStatusAndName(
                          sablon.ad,
                          sablon.aciklama,
                        );
                        return (
                          <div
                            key={sablon.id}
                            className="flex items-center justify-between p-2 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all"
                          >
                            {route
                              ? (
                                <Link
                                  to={route}
                                  className="flex items-center gap-2 truncate flex-1 min-w-0 pr-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                                >
                                  <span>{cleanName}</span>
                                  {status && (
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide shrink-0 ${
                                        getStatusBadgeLightClass(status)
                                      }`}
                                    >
                                      {status}
                                    </span>
                                  )}
                                </Link>
                              )
                              : (
                                <div className="flex items-center gap-2 truncate flex-1 min-w-0 pr-2 text-xs font-medium text-slate-400 dark:text-slate-500 cursor-default select-none">
                                  <span>{cleanName}</span>
                                  {status && (
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide shrink-0 ${
                                        getStatusBadgeLightClass(status)
                                      }`}
                                    >
                                      {status}
                                    </span>
                                  )}
                                </div>
                              )}

                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                toggleStar(sablon.ad);
                              }}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded shrink-0 cursor-pointer"
                              title={isStarred
                                ? "Kısayoldan Kaldır"
                                : "Kısayol Ekle (Yıldızla)"}
                            >
                              <Star
                                className={`w-3.5 h-3.5 ${
                                  isStarred
                                    ? "fill-amber-500 text-amber-500"
                                    : "text-slate-400 hover:text-amber-500"
                                }`}
                              />
                            </button>
                          </div>
                        );
                      })}
                      {list.length === 0 && (
                        <span className="text-xs italic text-slate-400 block py-1">
                          Bu aşamada bağlı şablon bulunamadı.
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
