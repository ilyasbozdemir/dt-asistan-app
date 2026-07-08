import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, FileText, Filter, Star } from "lucide-react";
import {
  BUTTON_COLORS,
  CATEGORY_LABELS,
  normalizeForMatch,
} from "./useDosyaAsamasiSablons";

// -----------------------------------------------------------------------
// SurecBelgeleriPanel
// -----------------------------------------------------------------------

interface SurecBelgeleriPanelProps {
  stageSablons: any[];
  activeStarredDocs?: string[] | null;
  ciktiLoading: boolean;
  onSablonClick: (sablon: any, title: string) => void;
  isSablonDisabled?: (cleanName: string) => boolean;
}

const getSablonDescription = (cleanName: string) => {
  const lower = cleanName.toLowerCase();

  // 1. İhtiyaç Tespiti & Başlangıç
  if (lower.includes("harcama talimatı") || lower.includes("idare onay")) {
    return "Alım veya yapım işi için Harcama Yetkilisi tarafından verilen harcama talimatı/onay belgesini oluşturur.";
  }
  if (lower.includes("ihtiyaç listesi") || lower.includes("ihtiyaç talep")) {
    return "Malzeme ve hizmet alımları için talep edilen kalemlerin ihtiyaç listesini ve talep formunu hazırlar.";
  }
  if (lower.includes("lüzum müzekkeresi")) {
    return "İhtiyacın temini için gerekli gerekçeleri içeren lüzum müzekkeresi belgesini ve onay eklerini döker.";
  }
  if (lower.includes("son alım")) {
    return "Daha önce yapılan benzer alımların listesini, fiyat analizini ve cetvelini içeren dökümandır.";
  }

  // 2. Piyasa Fiyat Araştırması
  if (lower.includes("komisyon") || lower.includes("görevlendirme")) {
    return "İlgili alım süreci için komisyon üyelerinin görevlendirme ve onay belgesini otomatik oluşturur.";
  }
  if (lower.includes("yaklaşık maliyet")) {
    return "Piyasa araştırması sonucu oluşan fiyatların yaklaşık maliyet cetvelini hesaplayarak hazırlar.";
  }
  if (
    lower.includes("piyasa fiyat") ||
    lower.includes("fiyat araştırma tutanağı") ||
    lower.includes("araştırma tutanağı")
  ) {
    return "Firma tekliflerini ve piyasa araştırma sonuçlarını detaylı gösteren resmi tutanağı döker.";
  }
  if (
    lower.includes("teklif mektubu") || lower.includes("teklif formu") ||
    lower.includes("teklif cetveli") || lower.includes("araştırma mektubu")
  ) {
    return "İstekli firmalara gönderilecek veya firmalardan alınacak standart birim fiyat teklif mektubu/formudur.";
  }
  if (lower.includes("dağıtım çizelgesi")) {
    return "Alım kalemlerinin firmalara göre dağılımını ve teklif detaylarını gösteren çizelgedir.";
  }

  // 3. Sipariş & Sözleşme
  if (lower.includes("doğrudan temin onay") || lower.includes("sonuç onay")) {
    return "Doğrudan temin usulü ile yapılan alımın sonuçlandırılmasına ilişkin onay belgesidir.";
  }
  if (lower.includes("sözleşme") || lower.includes("sözleşmeye davet")) {
    return "Tedarikçi ile imzalanacak sözleşme taslağını, genel şartları ve davet mektubunu içerir.";
  }
  if (lower.includes("bütçe sorgusu")) {
    return "Alım işlemi için ayrılan bütçe tertibi ve kullanılabilir ödenek sorgusunu gösteren belgedir.";
  }

  // 4. Kabul & Ödeme İşlemleri
  if (lower.includes("muayene") || lower.includes("kabul")) {
    return "Alınan mal veya hizmetin muayene ve kabul işlemlerine dair tutanak ve komisyon kararını hazırlar.";
  }
  if (lower.includes("hakediş")) {
    return "Yükleniciye yapılacak ödemeye esas teşkil eden hakediş raporunu ve eklerini oluşturur.";
  }
  if (lower.includes("harcama pusulası")) {
    return "Vergi mükellefi olmayanlardan yapılan alımlar için düzenlenen harcama pusulasıdır.";
  }
  if (lower.includes("ödeme emri") || lower.includes("ödeme yazısı")) {
    return "Harcama birimince mali hizmetler birimine gönderilen ödeme emri belgesi ve üst yazısıdır.";
  }
  if (lower.includes("taşınır işlem")) {
    return "Alınan malzemelerin ambar giriş/çıkış kayıtlarını gösteren Taşınır İşlem Fişi (TİF) evrakıdır.";
  }

  // 5. Klasör & Kapaklar
  if (lower.includes("kapak") || lower.includes("indeks")) {
    return "İhale/alım dosyasının kapağını ve içindeki evrakların indeks (fihrist) dökümünü hazırlar.";
  }
  if (lower.includes("sırtlık") || lower.includes("klasör")) {
    return "Fiziksel arşivleme için farklı ölçülerde (3cm, 5cm, 7.5cm) klasör sırtlığı oluşturur.";
  }

  // Genel Fallback
  return `${cleanName} evrakını güncel dosya verilerinizle (malzemeler, firmalar vb.) otomatik doldurarak PDF/Word formatında oluşturur.`;
};

export function SurecBelgeleriPanel({
  stageSablons,
  activeStarredDocs,
  ciktiLoading,
  onSablonClick,
  isSablonDisabled,
}: SurecBelgeleriPanelProps): React.JSX.Element | null {
  const hasStarred = stageSablons.some((sablon) => {
    if (!activeStarredDocs) return false;
    const cleanName = sablon.ad.match(/^\[(.*?)\]\s*(.*)$/)
      ? sablon.ad.match(/^\[(.*?)\]\s*(.*)$/)![2].trim()
      : sablon.ad;
    return activeStarredDocs.some(
      (d) =>
        normalizeForMatch(d) === normalizeForMatch(sablon.ad) ||
        normalizeForMatch(d) === normalizeForMatch(cleanName),
    );
  });

  const [filter, setFilter] = useState<"all" | "starred">("starred");

  React.useEffect(() => {
    if (activeStarredDocs) {
      setFilter(hasStarred ? "starred" : "all");
    }
  }, [activeStarredDocs, stageSablons, hasStarred]);

  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );

  const toggleGroup = (gn: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(gn)) next.delete(gn);
      else next.add(gn);
      return next;
    });
  };

  const displaySablons = React.useMemo(() => {
    if (filter === "starred" && activeStarredDocs) {
      return stageSablons.filter((sablon) => {
        const cleanName = sablon.ad.match(/^\[(.*?)\]\s*(.*)$/)
          ? sablon.ad.match(/^\[(.*?)\]\s*(.*)$/)![2].trim()
          : sablon.ad;
        return activeStarredDocs.some(
          (d) =>
            normalizeForMatch(d) === normalizeForMatch(sablon.ad) ||
            normalizeForMatch(d) === normalizeForMatch(cleanName),
        );
      });
    }
    return stageSablons;
  }, [filter, activeStarredDocs, stageSablons]);

  // Gruplama mantığı
  const groups = React.useMemo(() => {
    const map = new Map<string, any[]>();
    displaySablons.forEach((sablon) => {
      let groupName = "Genel Belgeler";
      const match = sablon.ad.match(/^\[(.*?)\]\s*(.*)$/);
      if (match) {
        groupName = match[1].trim();
      }
      if (!map.has(groupName)) map.set(groupName, []);
      map.get(groupName)!.push(sablon);
    });
    return map;
  }, [displaySablons]);

  const groupNames = Array.from(groups.keys());

  // EARLY RETURN HOOKS'LARDAN SONRA OLMALI
  if (stageSablons.length === 0) return null;

  return (
    <div className="flex flex-col mb-6 print:hidden animate-in fade-in duration-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between w-full pb-4 mb-4 border-b border-slate-100 dark:border-slate-800/80 gap-3">
        <div className="flex items-center gap-2 select-none">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            Süreç Belgeleri ve Otomatik Şablonlar
          </h3>
        </div>

        <div className="flex flex-col md:flex-row items-end md:items-center gap-3 shrink-0">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${
                filter === "all"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setFilter("starred")}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors flex items-center gap-1 ${
                filter === "starred"
                  ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              }`}
            >
              <Star
                className={`w-3 h-3 ${
                  filter === "starred" ? "fill-current" : ""
                }`}
              />
              Hızlı Erişim
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {filter === "starred" && displaySablons.length === 0
          ? (
            <div className="text-xs text-slate-400 dark:text-slate-500 italic py-1">
              Bu aşama için henüz hızlı erişim belgesi seçilmemiş.
              <Link
                to="/dosya/cikti-merkezi"
                className="text-blue-500 hover:underline ml-1"
              >
                Çıktı Merkezi'nden ekleyebilirsiniz.
              </Link>
            </div>
          )
          : (
            groupNames
              .map((groupName, groupIdx) => {
                const isCollapsed = collapsedGroups.has(groupName);

                return (
                  <div key={groupName} className="flex flex-col gap-3">
                    {/* Group Header */}
                    <div
                      className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 pb-1.5 cursor-pointer group"
                      onClick={() => toggleGroup(groupName)}
                    >
                      <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600">
                        </span>
                        {groupName} {groupName.toLowerCase().includes("belge")
                          ? ""
                          : "Belgeleri"}
                      </h4>
                      <div className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                        {isCollapsed
                          ? <ChevronDown className="w-4 h-4" />
                          : <ChevronUp className="w-4 h-4" />}
                      </div>
                    </div>

                    {/* Group Items Grid */}
                    {!isCollapsed && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {(() => {
                          const sablonsInGroup = groups.get(groupName)!;
                          const clusters = new Map<string, any[]>();

                          sablonsInGroup.forEach((sablon) => {
                            let cleanName = sablon.ad;
                            const matchStatus = cleanName.match(
                              /^\[(.*?)\]\s*(.*)$/,
                            );
                            if (matchStatus) cleanName = matchStatus[2].trim();

                            const matchVariant = cleanName.match(
                              /^(.*?)\s*\((.*?)\)$/,
                            );
                            const baseName = matchVariant
                              ? matchVariant[1].trim()
                              : cleanName;

                            if (!clusters.has(baseName)) {
                              clusters.set(baseName, []);
                            }
                            clusters.get(baseName)!.push(sablon);
                          });

                          return Array.from(clusters.entries()).map(
                            ([baseName, clusteredSablons], idx) => {
                              return (
                                <SablonCard
                                  key={baseName}
                                  baseName={baseName}
                                  sablons={clusteredSablons}
                                  idx={idx}
                                  ciktiLoading={ciktiLoading}
                                  isSablonDisabled={isSablonDisabled}
                                  onSablonClick={onSablonClick}
                                />
                              );
                            },
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })
          )}
      </div>
    </div>
  );
}

function SablonCard({
  baseName,
  sablons,
  idx,
  onSablonClick,
  ciktiLoading,
  isSablonDisabled,
}: {
  baseName: string;
  sablons: any[];
  idx: number;
  onSablonClick: (sablon: any, title: string) => void;
  ciktiLoading: boolean;
  isSablonDisabled?: (cleanName: string) => boolean;
}) {
  const sortedSablons = [...sablons].sort((a, b) => {
    const aHasParen = a.ad.includes("(");
    const bHasParen = b.ad.includes("(");
    if (!aHasParen && bHasParen) return -1;
    if (aHasParen && !bHasParen) return 1;
    return 0;
  });

  const [selectedId, setSelectedId] = useState(
    sortedSablons[0].id || sortedSablons[0].ad,
  );

  const activeSablon =
    sortedSablons.find((s) => (s.id || s.ad) === selectedId) ||
    sortedSablons[0];

  let cleanName = activeSablon.ad;
  const matchStatus = cleanName.match(/^\[(.*?)\]\s*(.*)$/);
  if (matchStatus) cleanName = matchStatus[2].trim();

  const description = getSablonDescription(baseName);
  const isDisabled = ciktiLoading ||
    (isSablonDisabled && isSablonDisabled(cleanName));

  return (
    <div
      className={`text-left p-3.5 rounded-xl border transition-all flex flex-col gap-2 group relative overflow-visible ${
        isDisabled
          ? "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 opacity-60 grayscale"
          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500/50 hover:shadow-md"
      }`}
    >
      <div
        className={`absolute top-0 left-0 w-1 h-full ${
          BUTTON_COLORS[idx % BUTTON_COLORS.length].replace("bg-", "bg-").split(
            " ",
          )[0]
        }`}
      >
      </div>

      <div className="flex items-start gap-3 pl-1">
        <button
          className={`p-2 rounded-lg shrink-0 ${
            isDisabled
              ? "bg-slate-100 dark:bg-slate-800 text-slate-400"
              : "bg-blue-50 dark:bg-blue-900/20 text-blue-500 cursor-pointer"
          }`}
          onClick={() =>
            !isDisabled && onSablonClick(activeSablon, activeSablon.ad)}
          disabled={isDisabled}
        >
          <FileText className="w-4 h-4" />
        </button>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <button
              className={`font-bold text-sm line-clamp-1 text-left ${
                isDisabled
                  ? "text-slate-500 dark:text-slate-400"
                  : "text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
              }`}
              onClick={() =>
                !isDisabled && onSablonClick(activeSablon, activeSablon.ad)}
              disabled={isDisabled}
              title={baseName}
            >
              {baseName}
            </button>
          </div>
          <span
            className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed line-clamp-2"
            title={description}
          >
            {description}
          </span>

          {sortedSablons.length > 1 && (
            <div
              className="mt-2.5"
              onClick={(e) => e.stopPropagation()}
            >
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                disabled={isDisabled}
                className="w-full text-[10px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-medium"
              >
                {sortedSablons.map((s) => {
                  let variant = "Varsayılan";
                  let cName = s.ad;
                  const mStatus = cName.match(/^\[(.*?)\]\s*(.*)$/);
                  if (mStatus) cName = mStatus[2].trim();

                  const vMatch = cName.match(/\((.*?)\)$/);
                  if (vMatch) variant = vMatch[1];

                  return (
                    <option key={s.id || s.ad} value={s.id || s.ad}>
                      📄 Sürüm: {variant}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
