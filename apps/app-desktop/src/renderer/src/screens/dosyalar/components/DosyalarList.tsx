import React from "react";
import { cn } from "../../../utils/cn";
import {
  AlertCircle,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Edit,
  ExternalLink,
  FileText,
  FolderOpen,
  Hash,
  Lock,
  MoreVertical,
  Trash2,
  TrendingUp,
  Unlock,
} from "lucide-react";
import { DurumBadge, TurBadge } from "./Badges";
import { useNavigate } from "@tanstack/react-router";
import { LogType } from "../../../utils/logger";

export function DosyalarList({
  isLoadingDosyalar,
  filteredDosyalar,
  dosyalar,
  viewMode,
  filterYil,
  filterTur,
  groupedDosyalar,
  expandedGroups,
  searchQuery,
  toggleGroup,
  activeDosyaId,
  setActiveDosyaId,
  getDosyaNoLabel,
  formatMoney,
  formatDate,
  handleDelete,
  handleHardDelete,
  handleUpdateStatus,
  handleEkapGonder,
  handleKilidiAc,
  logActivity,
  handleOpenInNewWindow,
  handleOpenAI,
}: {
  isLoadingDosyalar: boolean;
  filteredDosyalar: any[];
  dosyalar: any[];
  viewMode: "grid" | "list" | "table";
  filterYil: string;
  filterTur: string;
  groupedDosyalar: { baseKonu: string; files: any[] }[];
  expandedGroups: string[];
  searchQuery: string;
  toggleGroup: (baseKonu: string) => void;
  activeDosyaId: number | null;
  setActiveDosyaId: (id: number | null) => void;
  getDosyaNoLabel: (d: any) => string;
  formatMoney: (val: number) => string;
  formatDate: (val: string | null | undefined) => string;
  handleDelete?: (id: number) => Promise<void>;
  handleHardDelete?: (id: number) => Promise<void>;
  handleUpdateStatus?: (id: number, status: string) => Promise<void>;
  handleEkapGonder?: (id: number) => void;
  handleKilidiAc?: (id: number) => Promise<void>;
  logActivity?: (
    title: string,
    message: string,
    type?: LogType,
  ) => Promise<void>;
  handleOpenInNewWindow?: (dosya: any) => void;
  handleOpenAI?: (dosya: any) => void;
}) {
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = React.useState<number | null>(null);
  const [selectedDosyaIds, setSelectedDosyaIds] = React.useState<number[]>([]);

  const toggleSelection = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setSelectedDosyaIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Dışarı tıklanınca menüyü kapat
  React.useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  if (isLoadingDosyalar) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-slate-500 italic">
        Dosyalar yükleniyor...
      </div>
    );
  }

  if (filteredDosyalar.length === 0) {
    return (
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center">
        <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
          Temin Dosyası Bulunamadı
        </h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Arama kriterlerinize uyan veya kayıtlı herhangi bir doğrudan temin
          dosyası bulunmamaktadır.
        </p>
        <button
          onClick={() => navigate({ to: "/dosyalar/yeni" })}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
        >
          Yeni Temin Dosyası Ekle
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {selectedDosyaIds.length > 0 && (
        <div className="flex-none mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 p-3 rounded-2xl shadow-sm flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
              {selectedDosyaIds.length}
            </span>
            <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
              dosya seçildi
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                if (
                  confirm(
                    `${selectedDosyaIds.length} dosyayı silmek/arşivlemek istediğinize emin misiniz?`,
                  )
                ) {
                  if (handleDelete) {
                    for (const id of selectedDosyaIds) {
                      await handleDelete(id);
                    }
                    setSelectedDosyaIds([]);
                  }
                }
              }}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
            >
              <Trash2 size={14} /> Seçilenleri Sil
            </button>
            <button
              onClick={() => setSelectedDosyaIds([])}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      )}
      <div className="flex-none mb-4 flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-sm md:text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Calendar className="text-blue-500" size={18} />
            {filterYil === "hepsi"
              ? "Tüm Yıllara Ait Dosyalar"
              : `${filterYil} Yılı Dosyaları`}
          </h2>
          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-3">
            <span>Toplam {filteredDosyalar.length} kayıt listeleniyor.</span>
            {filteredDosyalar.length > 0 && (
              <button
                onClick={() => {
                  if (selectedDosyaIds.length === filteredDosyalar.length) {
                    setSelectedDosyaIds([]);
                  } else {
                    setSelectedDosyaIds(filteredDosyalar.map((d) => d.id));
                  }
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-1"
              >
                <input
                  type="checkbox"
                  checked={selectedDosyaIds.length ===
                      filteredDosyalar.length && filteredDosyalar.length > 0}
                  readOnly
                  className="w-3 h-3 rounded border-slate-300 text-blue-600 cursor-pointer"
                />
                {selectedDosyaIds.length === filteredDosyalar.length
                  ? "Tüm Seçimi Kaldır"
                  : "Tümünü Seç"}
              </button>
            )}
          </div>
        </div>
        {filterTur !== "hepsi" && (
          <span className="bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/30 dark:border-blue-800/50 dark:text-blue-400 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wide">
            {filterTur === "mal"
              ? "Mal Alımı"
              : filterTur === "hizmet"
              ? "Hizmet Alımı"
              : filterTur === "yapim_isi"
              ? "Yapım İşi"
              : "Danışmanlık"}
          </span>
        )}
      </div>

      {viewMode === "grid" || viewMode === "list"
        ? (
          /* KART / LİSTE GÖRÜNÜMÜ */
          <div
            className={cn(
              "flex-1 overflow-y-auto custom-scrollbar pr-1 grid gap-4 pb-4 auto-rows-max",
              viewMode === "grid"
                ? "grid-cols-1 xl:grid-cols-2"
                : "grid-cols-1",
            )}
          >
            {groupedDosyalar.map((group) => {
              const hasMultiple = group.files.length > 1;
              const isExpanded = expandedGroups.includes(group.baseKonu) ||
                searchQuery.length > 0;

              return (
                <div key={group.baseKonu} className="col-span-full contents">
                  {hasMultiple && (
                    <div
                      className="col-span-full flex items-center justify-between mt-2 mb-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => toggleGroup(group.baseKonu)}
                    >
                      <div className="flex items-center gap-3">
                        <ChevronRight
                          size={16}
                          className={cn(
                            "text-slate-400 transition-transform",
                            isExpanded && "rotate-90",
                          )}
                        />
                        <FolderOpen size={16} className="text-blue-500" />
                        <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                          {group.baseKonu}
                        </h3>
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                          {group.files.length} Alım İşlemi
                        </span>
                      </div>
                    </div>
                  )}
                  {(isExpanded || !hasMultiple) &&
                    group.files.map((dosya) => (
                      <div
                        key={dosya.id}
                        onClick={() => setActiveDosyaId(dosya.id)}
                        onDoubleClick={() => {
                          setActiveDosyaId(dosya.id);
                          navigate({ to: "/dosya" });
                        }}
                        className={cn(
                          "bg-white dark:bg-slate-900 border rounded-2xl cursor-pointer hover:shadow-lg transition-all flex flex-col group relative overflow-hidden min-h-[180px] h-full",
                          activeDosyaId === dosya.id
                            ? "border-blue-500 dark:border-blue-700 ring-2 ring-blue-500/15 shadow-md"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700",
                        )}
                      >
                        {/* Kart Başlık Bölümü */}
                        <div className="p-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) =>
                                  toggleSelection(e, dosya.id)}
                                className={cn(
                                  "transition-all cursor-pointer",
                                  selectedDosyaIds.includes(dosya.id) ||
                                    selectedDosyaIds.length > 0
                                    ? "opacity-100"
                                    : "opacity-0 group-hover:opacity-100",
                                )}
                              >
                                <CheckCircle2
                                  size={16}
                                  className={cn(
                                    selectedDosyaIds.includes(dosya.id)
                                      ? "text-blue-600 dark:text-blue-400 fill-blue-100 dark:fill-blue-900/30"
                                      : "text-slate-300 dark:text-slate-600 hover:text-blue-400",
                                  )}
                                />
                              </button>
                              <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-800 truncate max-w-[120px]">
                                {getDosyaNoLabel(dosya)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <DurumBadge
                                durumAsamaId={dosya.durum_asama_id}
                                isDeleted={dosya.is_deleted}
                                status={dosya.status}
                              />
                              <TurBadge tur={dosya.tur} />

                              <div
                                className="relative"
                                onClick={(e) =>
                                  e.stopPropagation()}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(
                                      openMenuId === dosya.id ? null : dosya.id,
                                    );
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                  <MoreVertical size={14} />
                                </button>

                                {openMenuId === dosya.id && (
                                  <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-[999] py-1 flex flex-col text-xs font-semibold">
                                    {dosya.is_deleted !== 1 &&
                                      dosya.is_ekap_sent !== 1 && (
                                      <button
                                        disabled={selectedDosyaIds.length > 1}
                                        onClick={() => {
                                          setOpenMenuId(null);
                                          navigate({
                                            to: `/dosyalar/yeni?id=${dosya.id}`,
                                          });
                                        }}
                                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        <Edit
                                          size={13}
                                          className="text-slate-400"
                                        />{" "}
                                        Düzenle
                                      </button>
                                    )}

                                    {dosya.is_deleted !== 1 &&
                                      dosya.is_ekap_sent !== 1 && (
                                      <>
                                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2" />
                                        <button
                                          onClick={() => {
                                            setOpenMenuId(null);
                                            handleDelete &&
                                              handleDelete(dosya.id);
                                          }}
                                          className="w-full text-left px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2"
                                        >
                                          <Trash2 size={13} /> Arşivle / Sil
                                        </button>
                                      </>
                                    )}

                                    {import.meta.env.DEV && (
                                      <>
                                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2" />
                                        <button
                                          onClick={() => {
                                            setOpenMenuId(null);
                                            handleHardDelete &&
                                              handleHardDelete(dosya.id);
                                          }}
                                          className="w-full text-left px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2"
                                        >
                                          <AlertCircle size={13} />{" "}
                                          Kalıcı Sil (Dev Mode)
                                        </button>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <h3
                            className="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                            title={dosya.konu}
                          >
                            {dosya.konu}
                            {dosya.tekrar_no && dosya.tekrar_no > 1
                              ? (
                                <span className="ml-1 text-[9px] font-black text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1 py-0.5 rounded">
                                  #{dosya.tekrar_no}
                                </span>
                              )
                              : null}
                          </h3>
                        </div>

                        {/* Birim */}
                        <div className="px-4 py-2 bg-blue-50/40 dark:bg-blue-950/20 border-b border-blue-100/50 dark:border-blue-900/20 flex items-center gap-1.5">
                          <Building2
                            size={10}
                            className="text-blue-500 shrink-0"
                          />
                          <span className="text-[9px] font-semibold text-blue-700 dark:blue-400 truncate">
                            {dosya.birim_adi || "Birim Seçilmemiş"}
                          </span>
                        </div>

                        {/* Açıklama */}
                        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/60">
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed min-h-[28px]">
                            {dosya.isin_aciklamasi || (
                              <span className="italic text-slate-350 dark:text-slate-600">
                                Açıklama girilmemiş.
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Detay Grid */}
                        <div className="px-4 py-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[9px] border-b border-slate-100 dark:border-slate-800/60">
                          <div className="flex items-center gap-1 truncate">
                            <BookOpen
                              size={9}
                              className="text-slate-400 shrink-0"
                            />
                            <span className="text-slate-400 font-semibold shrink-0">
                              Madde:
                            </span>
                            <span className="font-bold text-slate-700 dark:text-slate-300 truncate">
                              {dosya.ihale_sekli || "-"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 truncate">
                            <Calendar
                              size={9}
                              className="text-slate-400 shrink-0"
                            />
                            <span className="text-slate-400 font-semibold shrink-0">
                              Bütçe:
                            </span>
                            <span className="font-bold text-slate-700 dark:text-slate-300 truncate">
                              {dosya.butce_yili || "-"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 truncate">
                            <ClipboardList
                              size={9}
                              className="text-slate-400 shrink-0"
                            />
                            <span className="text-slate-400 font-semibold shrink-0">
                              Sözleşme:
                            </span>
                            <span className="font-bold text-slate-700 dark:text-slate-300 truncate">
                              {dosya.teklif_sozlesme_turu || "-"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 truncate">
                            <Hash
                              size={9}
                              className="text-slate-400 shrink-0"
                            />
                            <span className="text-slate-400 font-semibold shrink-0">
                              Ek. Kodu:
                            </span>
                            <span
                              className="font-bold text-slate-700 dark:text-slate-300 truncate font-mono"
                              title={dosya.ekonomik_kod || ""}
                            >
                              {dosya.ekonomik_kod || "-"}
                            </span>
                          </div>
                        </div>

                        {/* Alt Bölüm: Maliyet + Tarih */}
                        <div className="px-4 py-3 flex justify-between items-center">
                          <div className="flex items-center gap-1">
                            <TrendingUp
                              size={12}
                              className="text-emerald-500"
                            />
                            <span className="font-black text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                              ₺ {formatMoney(dosya.yaklasik_maliyet || 0)}
                            </span>
                            {dosya.kdv && (
                              <span className="text-[9px] text-emerald-500/70 font-semibold">
                                (+%{dosya.kdv} KDV)
                              </span>
                            )}
                          </div>
                          <span className="text-slate-400 text-[9px] flex items-center gap-1">
                            <Calendar size={10} />
                            {dosya.dosya_acilis_tarihi
                              ? formatDate(dosya.dosya_acilis_tarihi)
                              : formatDate(dosya.created_at)}
                          </span>
                        </div>

                        {/* Seçili göstergesi */}
                        {activeDosyaId === dosya.id && (
                          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-2xl" />
                        )}
                      </div>
                    ))}
                </div>
              );
            })}
          </div>
        )
        : (
          /* TABLO GÖRÜNÜMÜ */
          <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 z-10">
                  <tr>
                    <th className="p-3.5 pl-5">Dosya No</th>
                    <th className="p-3.5">İhale Konusu (İşin Adı)</th>
                    <th className="p-3.5">Birim</th>
                    <th className="p-3.5">Tür</th>
                    <th className="p-3.5 text-right">Yaklaşık Maliyet</th>
                    <th className="p-3.5 text-center">Tarih</th>
                    <th className="p-3.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {groupedDosyalar.map((group) => {
                    const hasMultiple = group.files.length > 1;
                    const isExpanded =
                      expandedGroups.includes(group.baseKonu) ||
                      searchQuery.length > 0;

                    return (
                      <React.Fragment key={group.baseKonu}>
                        {hasMultiple && (
                          <tr
                            className="bg-slate-50/80 dark:bg-slate-900/80 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-y border-slate-200 dark:border-slate-700"
                            onClick={() => toggleGroup(group.baseKonu)}
                          >
                            <td colSpan={7} className="p-3 pl-5">
                              <div className="flex items-center gap-3">
                                <ChevronRight
                                  size={16}
                                  className={cn(
                                    "text-slate-400 transition-transform",
                                    isExpanded && "rotate-90",
                                  )}
                                />
                                <FolderOpen
                                  size={16}
                                  className="text-blue-500"
                                />
                                <span className="font-bold text-slate-700 dark:text-slate-300">
                                  {group.baseKonu}
                                </span>
                                <span className="text-[9px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-md">
                                  {group.files.length} Alım İşlemi
                                </span>
                              </div>
                            </td>
                          </tr>
                        )}
                        {(isExpanded || !hasMultiple) &&
                          group.files.map((dosya) => (
                            <tr
                              key={dosya.id}
                              onClick={() => setActiveDosyaId(dosya.id)}
                              onDoubleClick={() => {
                                setActiveDosyaId(dosya.id);
                                navigate({ to: "/dosya" });
                              }}
                              className={cn(
                                "group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors",
                                activeDosyaId === dosya.id &&
                                  "bg-blue-50/30 dark:bg-blue-900/10",
                                dosya.is_deleted === 1 &&
                                  "opacity-50 grayscale",
                              )}
                            >
                              <td className="p-3.5 pl-5 font-mono font-bold text-slate-500 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) =>
                                      toggleSelection(e, dosya.id)}
                                    className={cn(
                                      "transition-all cursor-pointer",
                                      selectedDosyaIds.includes(dosya.id) ||
                                        selectedDosyaIds.length > 0
                                        ? "opacity-100"
                                        : "opacity-0 group-hover:opacity-100",
                                    )}
                                  >
                                    <CheckCircle2
                                      size={16}
                                      className={cn(
                                        selectedDosyaIds.includes(dosya.id)
                                          ? "text-blue-600 dark:text-blue-400 fill-blue-100 dark:fill-blue-900/30"
                                          : "text-slate-300 dark:text-slate-600 hover:text-blue-400",
                                      )}
                                    />
                                  </button>
                                  <span>{getDosyaNoLabel(dosya)}</span>
                                </div>
                              </td>
                              <td
                                className="p-3.5 font-bold text-slate-800 dark:text-slate-200 max-w-xs truncate"
                                title={dosya.konu}
                              >
                                {dosya.konu}
                                {dosya.tekrar_no && dosya.tekrar_no > 1
                                  ? (
                                    <span className="ml-1 text-[9px] text-amber-500 font-black">
                                      #{dosya.tekrar_no}
                                    </span>
                                  )
                                  : null}
                              </td>
                              <td className="p-3.5 text-slate-500 max-w-[120px] truncate text-[10px]">
                                {dosya.birim_adi || "-"}
                              </td>
                              <td className="p-3.5">
                                <TurBadge tur={dosya.tur} />
                              </td>
                              <td className="p-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono whitespace-nowrap">
                                ₺ {formatMoney(dosya.yaklasik_maliyet || 0)}
                              </td>
                              <td className="p-3.5 text-center text-slate-450 whitespace-nowrap">
                                {dosya.dosya_acilis_tarihi
                                  ? formatDate(dosya.dosya_acilis_tarihi)
                                  : formatDate(dosya.created_at)}
                              </td>
                              <td className="p-3.5 text-right pr-5">
                                <div
                                  className="relative inline-block"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenMenuId(
                                        openMenuId === dosya.id
                                          ? null
                                          : dosya.id,
                                      );
                                    }}
                                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                  >
                                    <MoreVertical size={16} />
                                  </button>
                                  {openMenuId === dosya.id && (
                                    <div className="absolute right-full mr-2 top-0 mt-0 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-50 py-1 flex flex-col text-xs font-semibold text-left">
                                      <button
                                        onClick={() => {
                                          setOpenMenuId(null);
                                          handleOpenInNewWindow &&
                                            handleOpenInNewWindow(dosya);
                                        }}
                                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                                      >
                                        <ExternalLink
                                          size={13}
                                          className="text-slate-400"
                                        />{" "}
                                        Yeni Pencerede Aç
                                      </button>

                                      {dosya.is_deleted !== 1 &&
                                        dosya.is_ekap_sent !== 1 && (
                                        <button
                                          disabled={selectedDosyaIds.length > 1}
                                          onClick={() => {
                                            setOpenMenuId(null);
                                            navigate({
                                              to:
                                                `/dosyalar/yeni?id=${dosya.id}`,
                                            });
                                          }}
                                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          <Edit
                                            size={13}
                                            className="text-slate-400"
                                          />{" "}
                                          Düzenle
                                        </button>
                                      )}

                                      {dosya.is_deleted !== 1 && (
                                        <button
                                          onClick={() => {
                                            setOpenMenuId(null);
                                            handleUpdateStatus &&
                                              handleUpdateStatus(
                                                dosya.id,
                                                dosya.status === "tamamlandi"
                                                  ? "devam_ediyor"
                                                  : "tamamlandi",
                                              );
                                          }}
                                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                                        >
                                          {dosya.status === "tamamlandi"
                                            ? (
                                              <>
                                                <Clock
                                                  size={13}
                                                  className="text-amber-500"
                                                />{" "}
                                                Aktife Al
                                              </>
                                            )
                                            : (
                                              <>
                                                <CheckCircle2
                                                  size={13}
                                                  className="text-emerald-500"
                                                />{" "}
                                                Tamamlandı İşaretle
                                              </>
                                            )}
                                        </button>
                                      )}

                                      {dosya.is_deleted !== 1 && (
                                        <button
                                          onClick={() => {
                                            setOpenMenuId(null);
                                            dosya.is_ekap_sent === 1
                                              ? handleKilidiAc &&
                                                handleKilidiAc(dosya.id)
                                              : handleEkapGonder &&
                                                handleEkapGonder(dosya.id);
                                          }}
                                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                                        >
                                          {dosya.is_ekap_sent === 1
                                            ? (
                                              <>
                                                <Unlock
                                                  size={13}
                                                  className="text-amber-500"
                                                />{" "}
                                                Kilidi Aç / EKAP İptal
                                              </>
                                            )
                                            : (
                                              <>
                                                <Lock
                                                  size={13}
                                                  className="text-indigo-500"
                                                />{" "}
                                                Dosyayı Kilitle (EKAP)
                                              </>
                                            )}
                                        </button>
                                      )}

                                      {dosya.is_deleted !== 1 && (
                                        <button
                                          onClick={() => {
                                            setOpenMenuId(null);
                                            handleOpenAI && handleOpenAI(dosya);
                                          }}
                                          className="w-full text-left px-3 py-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center gap-2"
                                        >
                                          <AlertCircle
                                            size={13}
                                            className="text-indigo-500"
                                          />{" "}
                                          Yapay Zeka Asistanı
                                        </button>
                                      )}

                                      {dosya.is_deleted !== 1 &&
                                        dosya.is_ekap_sent !== 1 && (
                                        <>
                                          <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2" />
                                          <button
                                            onClick={() => {
                                              setOpenMenuId(null);
                                              handleDelete &&
                                                handleDelete(dosya.id);
                                            }}
                                            className="w-full text-left px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2"
                                          >
                                            <Trash2 size={13} /> Arşivle / Sil
                                          </button>
                                        </>
                                      )}

                                      {import.meta.env.DEV && (
                                        <>
                                          <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2" />
                                          <button
                                            onClick={() => {
                                              setOpenMenuId(null);
                                              handleHardDelete &&
                                                handleHardDelete(dosya.id);
                                            }}
                                            className="w-full text-left px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2"
                                          >
                                            <AlertCircle size={13} />{" "}
                                            Kalıcı Sil (Dev Mode)
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
}
