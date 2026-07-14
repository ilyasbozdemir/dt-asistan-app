import React, { useEffect, useState } from "react";
import { useDosyalarHooks } from "./dosyalar.hooks";
import { useTabStore } from "../../store/tabStore";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  AlertCircle,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  DollarSign,
  Edit,
  ExternalLink,
  FileText,
  FolderOpen,
  Grid,
  Hash,
  List,
  Lock,
  Plus,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  Unlock,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { AITextGeneratorModal } from "../../components/ui/AITextGeneratorModal";
import { logActivity } from "../../utils/logger";
import { Button } from "../../components/ui/Button";

// Tur badge renk ve label helper
function TurBadge({ tur }: { tur: string }): React.ReactElement {
  const map: Record<string, { label: string; cls: string }> = {
    mal: {
      label: "Mal",
      cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
    hizmet: {
      label: "Hizmet",
      cls:
        "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
    },
    yapim_isi: {
      label: "Yapım",
      cls:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    },
    danismanlik: {
      label: "Danışmanlık",
      cls: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    },
  };
  const { label, cls } = map[tur] ?? {
    label: tur,
    cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };
  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide",
        cls,
      )}
    >
      {label}
    </span>
  );
}

function DurumBadge({
  durumAsamaId,
  isDeleted,
  status,
}: {
  durumAsamaId: number | null;
  isDeleted?: number;
  status?: string;
}): React.ReactElement {
  if (isDeleted === 1) {
    return (
      <span className="flex items-center gap-0.5 text-[9px] font-bold text-red-600 dark:text-red-400">
        <Trash2 size={9} /> Silindi
      </span>
    );
  }
  if (status === "tamamlandi") {
    return (
      <span className="flex items-center gap-0.5 text-[9px] font-bold text-purple-600 dark:text-purple-400">
        <CheckCircle2 size={9} /> Tamamlandı
      </span>
    );
  }
  if (!durumAsamaId) {
    return (
      <span className="flex items-center gap-0.5 text-[9px] font-bold text-slate-400 dark:text-slate-500">
        <Clock size={9} /> Taslak
      </span>
    );
  }
  return (
    <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
      <CheckCircle2 size={9} /> Aktif
    </span>
  );
}

export default function DosyalarScreen(): React.ReactNode {
  const {
    dosyalar,
    isLoadingDosyalar,
    deleteDosya,
    hardDeleteDosya,
    updateDosya,
  } = useDosyalarHooks();
  const { activeDosyaId, setActiveDosyaId } = useWorkspaceStore();
  const { updateTabLabel } = useTabStore();
  const routerState = useRouterState();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(window.location.search);
  const isWindowMode = searchParams.get("mode") === "window";
  const urlId = searchParams.get("id");

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "table">("grid");
  const [filterTur, setFilterTur] = useState<string>("hepsi");
  const [filterYil, setFilterYil] = useState<string>("hepsi");

  const fileId = urlId ? parseInt(urlId, 10) : activeDosyaId;
  const selectedDosya = dosyalar.find((d) => d.id === fileId);

  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const toggleGroup = (baseKonu: string) => {
    setExpandedGroups((prev) =>
      prev.includes(baseKonu)
        ? prev.filter((g) => g !== baseKonu)
        : [...prev, baseKonu]
    );
  };

  // Dinamik tab label kapatıldı - Kullanıcı isteği: farklı sekme adı verme
  useEffect(() => {
    if (isWindowMode) return;
    const currentHref = routerState.location.href;
    // Sadece sabit ad veya ana sayfaysa anasayfa
    if (currentHref === "/" || currentHref.includes("dashboard")) {
      updateTabLabel(currentHref, "Anasayfa");
    } else {
      updateTabLabel(currentHref, "Doğrudan Temin");
    }
  }, [routerState.location.href, updateTabLabel, isWindowMode]);

  // AI Modal State
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedFileForAI, setSelectedFileForAI] = useState<any>(null);

  // EKAP Modal State
  const [ekapModalOpen, setEkapModalOpen] = useState(false);
  const [ekapInputVal, setEkapInputVal] = useState("");
  const [ekapTargetId, setEkapTargetId] = useState<number | null>(null);

  const handleOpenAI = (dosya: any) => {
    setSelectedFileForAI(dosya);
    setShowAIModal(true);
  };

  const handleOpenInNewWindow = () => {
    if (!selectedDosya) return;
    window.electron?.ipcRenderer.send("window:open-secondary", {
      path: "/dosyalar",
      search: `?id=${selectedDosya.id}&mode=window`,
      title: `DT: ${selectedDosya.konu}`,
    });
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (
      confirm(
        'Bu dosyayı Arşivlemek / Silmek istediğinize emin misiniz? Dosya listelerde "Silindi/Arşivlendi" olarak işaretlenecektir.',
      )
    ) {
      const dosya = dosyalar.find((d) => d.id === id);
      await deleteDosya(id);
      if (dosya) {
        await logActivity(
          "Dosya Arşivlendi",
          `${
            dosya.temin_no || "NO BELİRSİZ"
          } numaralı dosya arşivlendi/silindi olarak işaretlendi.`,
          "warning",
        );
      }
      if (activeDosyaId === id) setActiveDosyaId(null);
    }
  };

  const handleHardDelete = async (id: number): Promise<void> => {
    if (
      confirm(
        "DİKKAT (Geliştirici Modu Özel): Bu dosyayı veritabanından KALICI OLARAK SİLMEK (Hard Delete) istediğinize emin misiniz? Bu işlem geri alınamaz!",
      )
    ) {
      await hardDeleteDosya(id);
      if (activeDosyaId === id) setActiveDosyaId(null);
    }
  };

  const handleUpdateStatus = async (
    id: number,
    status: string,
  ): Promise<void> => {
    await updateDosya({ id, status });
    const dosya = dosyalar.find((d) => d.id === id);
    if (dosya) {
      if (status === "tamamlandi") {
        await logActivity(
          "Dosya Tamamlandı",
          `${
            dosya.temin_no || "NO BELİRSİZ"
          } numaralı dosya tamamlandı olarak işaretlendi.`,
          "success",
        );
      } else if (status === "devam_ediyor") {
        await logActivity(
          "Dosya Aktife Alındı",
          `${
            dosya.temin_no || "NO BELİRSİZ"
          } numaralı dosya tekrar aktife alındı.`,
          "info",
        );
      }
    }
  };

  const handleEkapGonder = (id: number): void => {
    setEkapTargetId(id);
    setEkapInputVal("");
    setEkapModalOpen(true);
  };

  const handleEkapGonderSubmit = async (): Promise<void> => {
    if (!ekapTargetId) return;
    const id = ekapTargetId;
    const ekapNo = ekapInputVal.trim();
    if (!ekapNo) return;

    await updateDosya({ id, is_ekap_sent: 1, ekap_no: ekapNo });
    const dosya = dosyalar.find((d) => d.id === id);
    if (dosya) {
      await logActivity(
        "EKAP Kilit",
        `${
          dosya.temin_no || "NO BELİRSİZ"
        } numaralı dosya kilitlendi (İKN: ${ekapNo}).`,
        "success",
      );
    }
    setEkapModalOpen(false);
    setEkapTargetId(null);
  };

  const handleKilidiAc = async (id: number): Promise<void> => {
    if (
      confirm(
        "Kilidi açarsanız dosyanın EKAP bağlantısı/kilit durumu iptal edilecektir. Düzenlemeye devam edebilmek için emin misiniz?",
      )
    ) {
      await updateDosya({ id, is_ekap_sent: 0, ekap_no: null });
      const dosya = dosyalar.find((d) => d.id === id);
      if (dosya) {
        await logActivity(
          "EKAP Kilit Açıldı",
          `${dosya.temin_no || "NO BELİRSİZ"} numaralı dosyanın kilidi açıldı.`,
          "warning",
        );
      }
    }
  };

  const uniqueYillar = Array.from(
    new Set(
      dosyalar
        .map((d) => {
          if (d.butce_yili) return d.butce_yili;
          if (d.dosya_acilis_tarihi) {
            return new Date(d.dosya_acilis_tarihi).getFullYear();
          }
          if (d.created_at) return new Date(d.created_at).getFullYear();
          return new Date().getFullYear();
        })
        .filter(Boolean),
    ),
  ).sort((a, b) => b - a);

  const filteredDosyalar = dosyalar.filter((d) => {
    const matchSearch =
      (d.konu || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.temin_no || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.birim_adi || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchTur = filterTur === "hepsi" || d.tur === filterTur;

    const dosyaYili = d.butce_yili ||
      (d.dosya_acilis_tarihi
        ? new Date(d.dosya_acilis_tarihi).getFullYear()
        : new Date(d.created_at).getFullYear());
    const matchYil = filterYil === "hepsi" ||
      dosyaYili.toString() === filterYil;

    return matchSearch && matchTur && matchYil;
  });

  // İstatistikler (Sadece silinmemiş olanlar baz alınsın)
  const aktifDosyalar = dosyalar.filter((d) => d.is_deleted !== 1);

  // Gruplanmış Dosyalar (Aynı isimli alımlar birleştirilir)
  const groupedDosyalar = React.useMemo(() => {
    const groups: { baseKonu: string; files: typeof dosyalar }[] = [];

    filteredDosyalar.forEach((dosya) => {
      const baseMatch = (dosya.konu || "").match(/^(.*?)\s*\(\d+\)$/);
      const baseKonu = baseMatch
        ? baseMatch[1].trim()
        : (dosya.konu || "").trim();

      let group = groups.find((g) =>
        g.baseKonu.toLowerCase() === baseKonu.toLowerCase()
      );
      if (!group) {
        group = { baseKonu, files: [] };
        groups.push(group);
      }
      group.files.push(dosya);
    });

    // Her grubun içindeki en güncel dosyaya göre grupları sırala
    groups.sort((a, b) => {
      const maxA = Math.max(...a.files.map((f) => f.id));
      const maxB = Math.max(...b.files.map((f) => f.id));
      return maxB - maxA;
    });

    return groups;
  }, [filteredDosyalar]);

  const toplamMaliyet = aktifDosyalar.reduce(
    (s, d) => s + (d.yaklasik_maliyet || 0),
    0,
  );
  const aktifCount = aktifDosyalar.filter(
    (d) => d.durum_asama_id && d.status !== "tamamlandi",
  ).length;
  const taslakCount = aktifDosyalar.filter(
    (d) => !d.durum_asama_id && d.status !== "tamamlandi",
  ).length;
  // const tamamlananCount = aktifDosyalar.filter((d) => d.status === 'tamamlandi').length

  const formatMoney = (val: number) =>
    val ? val.toLocaleString("tr-TR", { minimumFractionDigits: 2 }) : "0.00";

  const formatDate = (val: string | null | undefined) => {
    if (!val) return "-";
    return new Date(val).toLocaleDateString("tr-TR");
  };

  const getDosyaNoLabel = (d: any) => {
    if (!d || !d.temin_no) return "NO BELİRSİZ";
    const yil = d.butce_yili ||
      (d.dosya_acilis_tarihi
        ? new Date(d.dosya_acilis_tarihi).getFullYear()
        : new Date(d.created_at).getFullYear());
    return `${yil}/${d.temin_no}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 p-4 md:p-6 overflow-hidden gap-4">
      {/* ÜST BAR */}
      <div className="flex-none flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-850 dark:text-white flex items-center gap-2">
            <FileText className="text-blue-600" size={24} />
            Doğrudan Temin Dosyaları
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dosya süreçlerinizi başlatın, tekliflerinizi ve yaklaşık
            maliyetlerinizi takip edin.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* VIEW SWITCHER */}
          <div className="flex bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                viewMode === "grid"
                  ? "bg-slate-100 dark:bg-slate-800 text-blue-600"
                  : "text-slate-400 hover:text-slate-600",
              )}
              title="Izgara (Grid) Görünümü"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                viewMode === "list"
                  ? "bg-slate-100 dark:bg-slate-800 text-blue-600"
                  : "text-slate-400 hover:text-slate-600",
              )}
              title="Liste Görünümü"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                viewMode === "table"
                  ? "bg-slate-100 dark:bg-slate-800 text-blue-600"
                  : "text-slate-400 hover:text-slate-600",
              )}
              title="Tablo Görünümü"
            >
              <FileText size={16} />
            </button>
          </div>

          {/* GENEL YAPAY ZEKA BUTONU */}
          <button
            onClick={() => {
              setSelectedFileForAI({
                konu: "Genel Mevzuat Danışmanlığı",
                yaklasik_maliyet: 0,
                temin_no: "Belirtilmemiş",
              });
              setShowAIModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-violet-500/20 flex items-center gap-1.5 cursor-pointer shrink-0"
            title="Mevzuat ve Genel Süreçler Hakkında AI'a Danışın"
          >
            <Sparkles size={16} />
            <span className="hidden md:inline">Yapay Zeka Asistanı</span>
            <span className="md:hidden">AI</span>
          </button>

          {/* YENİ EKLE */}
          <button
            onClick={() => navigate({ to: "/dosyalar/yeni" })}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus size={16} />
            Yeni Dosya
          </button>
        </div>
      </div>

      {/* ÖZET İSTATİSTİK BARI */}
      <div className="flex-none grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <FileText size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-medium">
              Toplam Dosya
            </p>
            <p className="text-lg font-black text-slate-800 dark:text-white leading-tight">
              {dosyalar.length}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
            <CheckCircle2
              size={16}
              className="text-emerald-600 dark:text-emerald-400"
            />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-medium">Aktif</p>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 leading-tight">
              {aktifCount}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
            <Clock size={16} className="text-slate-500 dark:text-slate-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-medium">Taslak</p>
            <p className="text-lg font-black text-slate-600 dark:text-slate-300 leading-tight">
              {taslakCount}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
            <DollarSign
              size={16}
              className="text-green-600 dark:text-green-400"
            />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-medium">
              Toplam Yaklaşık Maliyet
            </p>
            <p className="text-sm font-black text-green-600 dark:text-green-400 leading-tight">
              ₺ {formatMoney(toplamMaliyet)}
            </p>
          </div>
        </div>
      </div>

      {/* FİLTRE SATIRI */}
      <div className="flex-none flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-1.5 flex-wrap">
          <select
            value={filterYil}
            onChange={(e) => setFilterYil(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="hepsi">Tüm Yıllar</option>
            {uniqueYillar.map((yil) => (
              <option key={yil} value={yil.toString()}>
                {yil} Yılı
              </option>
            ))}
          </select>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block">
          </div>
          {["hepsi", "mal", "hizmet", "yapim_isi", "danismanlik"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterTur(t)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer border",
                filterTur === t
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300",
              )}
            >
              {t === "hepsi"
                ? "Tümü"
                : t === "mal"
                ? "Mal"
                : t === "hizmet"
                ? "Hizmet"
                : t === "yapim_isi"
                ? "Yapım"
                : "Danışmanlık"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* ARAMA */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Dosya Konusu, No veya Birim ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-800 dark:text-slate-200"
            />
          </div>
          {filteredDosyalar.length < dosyalar.length && (
            <span className="text-[10px] font-bold text-slate-500 shrink-0 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
              {filteredDosyalar.length} / {dosyalar.length}
            </span>
          )}
        </div>
      </div>

      {/* İÇERİK - İKİ SÜTUN YAPI */}
      <div className="flex-1 flex flex-col lg:flex-row gap-5 overflow-hidden">
        {/* SOL TARAF: LİSTE VEYA KARTLAR */}
        <div className="w-full lg:w-3/5 xl:w-2/3 flex flex-col h-full overflow-hidden">
          {isLoadingDosyalar
            ? (
              <div className="flex-1 flex items-center justify-center text-sm text-slate-500 italic">
                Dosyalar yükleniyor...
              </div>
            )
            : filteredDosyalar.length === 0
            ? (
              <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center">
                <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Temin Dosyası Bulunamadı
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Arama kriterlerinize uyan veya kayıtlı herhangi bir doğrudan
                  temin dosyası bulunmamaktadır.
                </p>
                <button
                  onClick={() => navigate({ to: "/dosyalar/yeni" })}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Yeni Temin Dosyası Ekle
                </button>
              </div>
            )
            : (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex-none mb-4 flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
                  <div>
                    <h2 className="text-sm md:text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                      <Calendar className="text-blue-500" size={18} />
                      {filterYil === "hepsi"
                        ? "Tüm Yıllara Ait Dosyalar"
                        : `${filterYil} Yılı Dosyaları`}
                    </h2>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Toplam {filteredDosyalar.length} kayıt listeleniyor.
                    </p>
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
                        const isExpanded =
                          expandedGroups.includes(group.baseKonu) ||
                          searchQuery.length > 0;

                        return (
                          <div
                            key={group.baseKonu}
                            className="col-span-full contents"
                          >
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
                                  <FolderOpen
                                    size={16}
                                    className="text-blue-500"
                                  />
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
                                      <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-800 truncate max-w-[120px]">
                                        {getDosyaNoLabel(dosya)}
                                      </span>
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <DurumBadge
                                          durumAsamaId={dosya.durum_asama_id}
                                          isDeleted={dosya.is_deleted}
                                          status={dosya.status}
                                        />
                                        <TurBadge tur={dosya.tur} />
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
                                        ₺ {formatMoney(
                                          dosya.yaklasik_maliyet || 0,
                                        )}
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
                              <th className="p-3.5 text-right">
                                Yaklaşık Maliyet
                              </th>
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
                                      onClick={() =>
                                        toggleGroup(group.baseKonu)}
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
                                        onClick={() =>
                                          setActiveDosyaId(dosya.id)}
                                        onDoubleClick={() => {
                                          setActiveDosyaId(dosya.id);
                                          navigate({ to: "/dosya" });
                                        }}
                                        className={cn(
                                          "hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors",
                                          activeDosyaId === dosya.id &&
                                            "bg-blue-50/30 dark:bg-blue-900/10",
                                          dosya.is_deleted === 1 &&
                                            "opacity-50 grayscale",
                                        )}
                                      >
                                        <td className="p-3.5 pl-5 font-mono font-bold text-slate-500 whitespace-nowrap">
                                          {getDosyaNoLabel(dosya)}
                                        </td>
                                        <td
                                          className="p-3.5 font-bold text-slate-800 dark:text-slate-200 max-w-xs truncate"
                                          title={dosya.konu}
                                        >
                                          {dosya.konu}
                                          {dosya.tekrar_no &&
                                              dosya.tekrar_no > 1
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
                                          ₺ {formatMoney(
                                            dosya.yaklasik_maliyet || 0,
                                          )}
                                        </td>
                                        <td className="p-3.5 text-center text-slate-450 whitespace-nowrap">
                                          {dosya.dosya_acilis_tarihi
                                            ? formatDate(
                                              dosya.dosya_acilis_tarihi,
                                            )
                                            : formatDate(dosya.created_at)}
                                        </td>
                                        <td className="p-3.5 text-right pr-5">
                                          <ChevronRight
                                            size={16}
                                            className="text-slate-400"
                                          />
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
            )}
        </div>

        {/* SAĞ TARAF: DETAY PANELİ */}
        <div className="w-full lg:w-2/5 xl:w-1/3 flex flex-col h-full">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col h-full shadow-sm overflow-hidden">
            {!selectedDosya
              ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-800/80">
                    <FileText size={28} className="text-slate-400" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-350">
                    Dosya Seçilmedi
                  </h3>
                  <p className="text-[11px] text-slate-500 max-w-xs mt-1.5 mb-6">
                    İşlem yapmak, detaylarını incelemek veya düzenlemek
                    istediğiniz doğrudan temin dosyasını soldaki listeden seçin. Veya
                    genel süreçler hakkında Yapay Zeka'ya danışın.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedFileForAI({
                        konu: "Genel Mevzuat Danışmanlığı",
                        yaklasik_maliyet: 0,
                        temin_no: "Belirtilmemiş",
                      });
                      setShowAIModal(true);
                    }}
                    className="px-6 py-3 bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-violet-500/20 flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles size={16} />
                    Yapay Zeka'ya Danış
                  </button>
                </div>
              )
              : (
                <>
                  {/* Detay Panel Başlığı */}
                  <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20">
                    <div className="flex flex-col gap-2 mb-2">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest break-words leading-tight">
                          {selectedDosya.is_deleted === 1
                            ? "SİLİNMİŞ DOSYA"
                            : selectedDosya.is_ekap_sent === 1
                            ? "EKAP'A GÖNDERİLDİ"
                            : selectedDosya.status === "tamamlandi"
                            ? "TAMAMLANMIŞ DOSYA"
                            : "AKTİF DOĞRUDAN TEMİN DOSYASI"}
                        </span>
                        <div className="shrink-0 mt-0.5 flex flex-wrap items-center gap-2">
                          {selectedDosya.is_ekap_sent === 1 && (
                            <span className="bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800 text-[9px] font-bold">
                              EKAP İKN: {selectedDosya.ekap_no || "-"}
                            </span>
                          )}
                          <DurumBadge
                            durumAsamaId={selectedDosya.durum_asama_id}
                            isDeleted={selectedDosya.is_deleted}
                            status={selectedDosya.status}
                          />
                        </div>
                      </div>
                    </div>
                    <h2
                      className="text-sm font-bold text-slate-850 dark:text-white leading-snug line-clamp-3"
                      title={selectedDosya.konu}
                    >
                      {selectedDosya.konu}
                      {selectedDosya.tekrar_no && selectedDosya.tekrar_no > 1
                        ? (
                          <span className="ml-1.5 text-[10px] font-black text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">
                            #{selectedDosya.tekrar_no}
                          </span>
                        )
                        : null}
                    </h2>
                    {selectedDosya.temin_no && (
                      <span className="mt-1.5 inline-block text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-sm">
                        {getDosyaNoLabel(selectedDosya)}
                      </span>
                    )}
                  </div>

                  {/* Detay İçeriği */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
                    {/* Birim */}
                    <div className="flex items-center gap-2 p-2.5 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                      <Building2 size={14} className="text-blue-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] text-blue-400 font-semibold uppercase tracking-wide">
                          Birim / Müdürlük
                        </p>
                        <p className="text-[11px] font-bold text-blue-700 dark:text-blue-300 truncate">
                          {selectedDosya.birim_adi || "Birim Seçilmemiş"}
                        </p>
                      </div>
                    </div>

                    {/* Tür + Madde */}
                    <div className="grid grid-cols-2 gap-2">
                      <DetailField
                        icon={<FileText size={11} />}
                        label="Tür"
                        value={selectedDosya.tur === "mal"
                          ? "Mal Alımı"
                          : selectedDosya.tur === "hizmet"
                          ? "Hizmet Alımı"
                          : selectedDosya.tur === "yapim_isi"
                          ? "Yapım İşi"
                          : "Danışmanlık"}
                      />
                      <DetailField
                        icon={<BookOpen size={11} />}
                        label="DT Maddesi"
                        value={selectedDosya.ihale_sekli || "-"}
                      />
                    </div>

                    {/* Maliyet */}
                    <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
                      <p className="text-[9px] text-emerald-500 font-semibold uppercase tracking-wide mb-0.5">
                        Yaklaşık Maliyet
                      </p>
                      <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        ₺ {formatMoney(selectedDosya.yaklasik_maliyet || 0)}
                      </p>
                      {selectedDosya.kdv && (
                        <p className="text-[9px] text-emerald-500/70 font-semibold mt-0.5">
                          +%{selectedDosya.kdv} KDV dahil edilmemiş
                        </p>
                      )}
                    </div>

                    {/* Bütçe Bilgileri */}
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        Bütçe & Muhasebe
                      </p>
                      <div className="space-y-1">
                        <DetailRow
                          label="Bütçe Tipi"
                          value={selectedDosya.butce_tipi || "-"}
                        />
                        <DetailRow
                          label="Bütçe Yılı"
                          value={selectedDosya.butce_yili?.toString() || "-"}
                        />
                        {selectedDosya.butce_kodu && (
                          <DetailRow
                            label="Bütçe Kodu"
                            value={selectedDosya.butce_kodu}
                            mono
                          />
                        )}
                        {selectedDosya.ekonomik_kod && (
                          <DetailRow
                            label="Ekonomik Kod"
                            value={selectedDosya.ekonomik_kod}
                            mono
                          />
                        )}
                        {selectedDosya.e_butce && (
                          <DetailRow
                            label="Kurumsal Kod"
                            value={selectedDosya.e_butce}
                            mono
                          />
                        )}
                      </div>
                    </div>

                    {/* İhale Bilgileri */}
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        İhale & Sözleşme
                      </p>
                      <div className="space-y-1">
                        <DetailRow
                          label="Sözleşme Türü"
                          value={selectedDosya.teklif_sozlesme_turu || "-"}
                        />

                        {selectedDosya.son_teklif_verme_tarihi && (
                          <DetailRow
                            label="Son Teklif Tarihi"
                            value={new Date(
                              selectedDosya.son_teklif_verme_tarihi,
                            ).toLocaleString(
                              "tr-TR",
                            )}
                          />
                        )}
                        {selectedDosya.teslim_tarihi && (
                          <DetailRow
                            label="Teslim Tarihi"
                            value={formatDate(selectedDosya.teslim_tarihi)}
                          />
                        )}
                      </div>
                    </div>

                    {/* İşin Tanımı */}
                    {selectedDosya.isin_aciklamasi && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-xl">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          İşin Tanımı / Kapsamı
                        </p>
                        <p className="text-[10px] text-slate-600 dark:text-slate-350 leading-relaxed line-clamp-4">
                          {selectedDosya.isin_aciklamasi}
                        </p>
                      </div>
                    )}

                    {/* Notlar */}
                    {selectedDosya.notlar && (
                      <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                        <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <AlertCircle size={10} /> Notlar
                        </p>
                        <p className="text-[10px] text-amber-700 dark:text-amber-300 leading-relaxed">
                          {selectedDosya.notlar}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Aksiyon Butonları */}
                  <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    {selectedDosya.is_deleted !== 1 && (
                      <button
                        onClick={() => {
                          setActiveDosyaId(selectedDosya.id);
                          navigate({ to: "/dosya" });
                        }}
                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
                      >
                        <FolderOpen size={14} />
                        Dosyayı Aç
                      </button>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      {selectedDosya.is_deleted !== 1 &&
                        selectedDosya.is_ekap_sent !== 1 && (
                        <button
                          onClick={() =>
                            navigate({
                              to: `/dosyalar/yeni?id=${selectedDosya.id}`,
                            })}
                          className="px-4 py-2.5 bg-bg-200 border border-bg-300 hover:bg-bg-300 text-text-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Edit size={14} />
                          Düzenle
                        </button>
                      )}
                      {selectedDosya.is_deleted !== 1 &&
                        selectedDosya.is_ekap_sent !== 1 && (
                        <button
                          onClick={() => handleDelete(selectedDosya.id)}
                          className="px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Dosyayı Arşivler (Soft Delete)"
                        >
                          <Trash2 size={14} />
                          Arşivle
                        </button>
                      )}
                      {/* Sadece Geliştirme Ortamında Gözüken Kalıcı Sil Butonu */}
                      {import.meta.env.DEV && (
                        <button
                          onClick={() => handleHardDelete(selectedDosya.id)}
                          className="col-span-2 px-4 py-2.5 bg-rose-100 dark:bg-rose-900/40 border border-rose-300 dark:border-rose-700/60 hover:bg-rose-200 dark:hover:bg-rose-800/60 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Veritabanından Kalıcı Olarak Siler"
                        >
                          <Trash2 size={14} />
                          Kalıcı Sil (Dev Mode)
                        </button>
                      )}
                      {selectedDosya.is_deleted !== 1 &&
                        selectedDosya.is_ekap_sent !== 1 &&
                        selectedDosya.status !== "tamamlandi" && (
                        <button
                          onClick={() => {
                            if ((selectedDosya.durum_asama_id || 1) < 5) {
                              alert(
                                "Dosya süreçleri tamamlanmadan (5. aşamaya gelmeden) tamamlandı olarak işaretlenemez.",
                              );
                              return;
                            }
                            handleUpdateStatus(selectedDosya.id, "tamamlandi");
                          }}
                          disabled={(selectedDosya.durum_asama_id || 1) < 5}
                          className="col-span-2 px-4 py-2.5 bg-primary-200 border border-primary-300 hover:bg-primary-300 text-bg-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          title={(selectedDosya.durum_asama_id || 1) < 5
                            ? "Süreçler tamamlanmadan tamamlandı işaretlenemez"
                            : ""}
                        >
                          <CheckCircle2 size={14} />
                          Tamamlandı İşaretle
                        </button>
                      )}
                      {selectedDosya.is_deleted !== 1 &&
                        selectedDosya.is_ekap_sent !== 1 &&
                        selectedDosya.status === "tamamlandi" && (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateStatus(
                                selectedDosya.id,
                                "devam_ediyor",
                              )}
                            className="px-4 py-2.5 bg-primary-100 border border-primary-200 hover:bg-primary-200 text-primary-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Clock size={14} />
                            Aktife Al
                          </button>
                          <button
                            onClick={() => {
                              if ((selectedDosya.durum_asama_id || 1) < 5) {
                                alert(
                                  "Dosya süreçleri tamamlanmadan (5. aşamaya gelmeden) EKAP kilitlemesi yapılamaz.",
                                );
                                return;
                              }
                              handleEkapGonder(selectedDosya.id);
                            }}
                            disabled={(selectedDosya.durum_asama_id || 1) < 5}
                            className="px-4 py-2.5 bg-bg-200 border border-bg-300 hover:bg-bg-300 text-text-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title={(selectedDosya.durum_asama_id || 1) < 5
                              ? "Süreçler tamamlanmadan kilitleme yapılamaz"
                              : ""}
                          >
                            <Lock size={14} />
                            Kilitle (EKAP)
                          </button>
                        </>
                      )}
                      {selectedDosya.is_deleted !== 1 &&
                        selectedDosya.is_ekap_sent === 1 && (
                        <button
                          onClick={() => handleKilidiAc(selectedDosya.id)}
                          className="col-span-2 px-4 py-2.5 bg-bg-200 border border-bg-300 hover:bg-bg-300 text-text-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Unlock size={14} />
                          Kilidi Aç
                        </button>
                      )}
                      {selectedDosya.is_deleted === 1 && (
                        <Button
                          asChild
                          desc={`${
                            selectedDosya.temin_no || "Dosya"
                          } Silinmişi Geri Al (Buton Tıklaması)`}
                        >
                          <button
                            onClick={() =>
                              handleUpdateStatus(
                                selectedDosya.id,
                                "devam_ediyor",
                              ).then(() => {
                                updateDosya({
                                  id: selectedDosya.id,
                                  is_deleted: 0,
                                });
                                logActivity(
                                  "Dosya Geri Alındı",
                                  `${
                                    selectedDosya.temin_no || "NO BELİRSİZ"
                                  } numaralı silinmiş dosya geri alındı.`,
                                  "info",
                                );
                              })}
                            className="col-span-2 px-4 py-2.5 bg-primary-100 border border-primary-200 hover:bg-primary-200 text-primary-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Edit size={14} />
                            Silinmişi Geri Al
                          </button>
                        </Button>
                      )}
                    </div>

                    {!isWindowMode && (
                      <Button
                        asChild
                        desc={`${
                          selectedDosya.temin_no || "Dosya"
                        } Yeni Pencerede Aç (Buton Tıklaması)`}
                      >
                        <button
                          onClick={handleOpenInNewWindow}
                          className="w-full px-4 py-2.5 bg-primary-100 border border-primary-200 hover:bg-primary-200 text-primary-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ExternalLink size={14} />
                          Yeni Pencerede Aç
                        </button>
                      </Button>
                    )}

                    {/* YAPAY ZEKA ASİSTANI BUTONU */}
                    <Button
                      asChild
                      desc={`${
                        selectedDosya.temin_no || "Dosya"
                      } Yapay Zeka Asistanı (Buton Tıklaması)`}
                    >
                      <button
                        onClick={() => handleOpenAI(selectedDosya)}
                        className="w-full px-4 py-2.5 bg-accent-100 hover:bg-accent-200 text-bg-100 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                      >
                        <Sparkles size={14} />
                        Yapay Zeka Asistanı
                      </button>
                    </Button>
                  </div>
                </>
              )}
          </div>
        </div>
      </div>

      {showAIModal && selectedFileForAI && (
        <AITextGeneratorModal
          isOpen={true}
          isAdvisorMode={true}
          fieldName="Mevzuat Analizi"
          title="Yapay Zeka Asistanı"
          initialPrompt=""
          systemInstruction={selectedFileForAI.konu ===
              "Genel Mevzuat Danışmanlığı"
            ? "Sen profesyonel bir kamu ihale ve doğrudan temin (4734 Sayılı Kanun) asistanısın. Kullanıcıya genel mevzuat veya idari işleyiş hakkında rehberlik edeceksin.\n\nÖNEMLİ GİZLİLİK KURALI: Gerçek kurum veya kişi isimlerini maskele."
            : `Sen profesyonel bir kamu ihale ve doğrudan temin (4734 Sayılı Kanun) asistanısın. Kullanıcı sana sistemdeki bir dosyası hakkında danışacak.\n\nŞu anki Aktif Dosya Bilgileri:\n- Dosya No: ${
              selectedFileForAI.temin_no || "Belirtilmemiş"
            }\n- Konu: ${selectedFileForAI.konu}\n- Maliyet: ${
              selectedFileForAI.yaklasik_maliyet || 0
            } TL\n- İhale Şekli (Madde): ${
              selectedFileForAI.ihale_sekli || "Belirtilmemiş"
            }\n\nÖNEMLİ GİZLİLİK KURALI: Gerçek kurum, şahıs isimleri veya adresleri [Kurum Adı], [İlgili Kişi] şeklinde maskele.`}
          onClose={() => {
            setShowAIModal(false);
            setSelectedFileForAI(null);
          }}
          onApply={(text) => {
            console.log("AI tavsiyesi:", text);
            setShowAIModal(false);
            setSelectedFileForAI(null);
          }}
        />
      )}

      {/* EKAP İKN Giriş Modalı */}
      {ekapModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">
              EKAP İhale Kayıt Numarası (İKN)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Lütfen doğrudan temin dosyasını kilitlemek için geçerli bir EKAP
              İKN giriniz.
            </p>
            <input
              type="text"
              value={ekapInputVal}
              onChange={(e) => setEkapInputVal(e.target.value)}
              placeholder="Örn: 2026/12345"
              className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 mb-4 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && ekapInputVal.trim()) {
                  handleEkapGonderSubmit();
                }
              }}
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setEkapModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400 transition-all cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                onClick={handleEkapGonderSubmit}
                disabled={!ekapInputVal.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50 transition-all cursor-pointer"
              >
                Kilitle ve Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- Yardımcı bileşenler ---- */
function DetailField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="p-2 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl">
      <div className="flex items-center gap-1 text-slate-400 mb-0.5">
        {icon}
        <span className="text-[9px] font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
        {value}
      </p>
    </div>
  );
}

function DetailRow(
  { label, value, mono }: { label: string; value: string; mono?: boolean },
) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-850/80 last:border-0">
      <span className="text-[10px] text-slate-500 dark:text-slate-450 font-medium shrink-0 mr-2">
        {label}:
      </span>
      <span
        className={cn(
          "text-[10px] font-bold text-slate-700 dark:text-slate-300 text-right truncate max-w-[180px]",
          mono && "font-mono",
        )}
      >
        {value}
      </span>
    </div>
  );
}
