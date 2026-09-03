import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Bot,
  Building2,
  CheckCircle2,
  ChevronRight,
  Coins,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Gavel,
  Landmark,
  Layers,
  PieChart,
  Plus,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

import { useSettingsStore } from "../../store/settingsStore";
import { useWorkspaceStore } from "../../store/workspaceStore";
import {
  useAnnouncements,
  useDashboardStats,
  useSmartAlerts,
} from "./dashboard.hooks";
import { useDosyalarHooks } from "../dosyalar/dosyalar.hooks";
import { useAyarlarHooks } from "../ayarlar/ayarlar.hooks";
import { logActivity } from "../../utils/logger";
import { Button } from "../../components/ui/Button";
import { AITextGeneratorModal } from "../../components/ui/AITextGeneratorModal";
import { TakipScreen } from "../system/TakipScreen";
import { cn } from "../../utils/cn";

export default function DashboardScreenV2(): React.JSX.Element {
  const {
    institutionName,
    limitType,
    institutionType,
    kurumsalKod,
    fonksiyonelKod,
    muhasebeBirimAdi,
    harcamaBirimAdi,
    adminName,
    adminTitle,
    adminUsername,
  } = useSettingsStore();

  const { activeDosyaId } = useWorkspaceStore();
  const { stats, isLoading } = useDashboardStats();
  const { announcements, isLoading: isAnnouncementsLoading } =
    useAnnouncements();
  const { dosyalar } = useDosyalarHooks();
  const { settings } = useAyarlarHooks();
  const isMailConfigured = !!settings.smtp_host;

  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedFileForAI, setSelectedFileForAI] = useState<any>(null);
  const [activeHakimPillar, setActiveHakimPillar] = useState<
    "H" | "A" | "K" | "I" | "M"
  >("H");
  const [searchTerm, setSearchTerm] = useState("");

  // Zaman tabanlı karşılama
  const greeting = (() => {
    const hours = new Date().getHours();
    if (hours >= 6 && hours < 12) return "Günaydın";
    if (hours >= 12 && hours < 18) return "İyi Günler";
    if (hours >= 18 && hours < 23) return "İyi Akşamlar";
    return "İyi Geceler";
  })();

  const currentDate = new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  // Kurum Türü Başlığı
  const getInstitutionTypeLabel = (type: string): string => {
    switch (type) {
      case "belediye":
        return "Belediye / Mahalli İdare";
      case "genel_butce":
        return "Bakanlık / Genel Bütçe";
      case "ozel_butce":
        return "Üniversite / Özel Bütçe";
      case "duzenleyici":
        return "Düzenleyici / Denetleyici Kurum";
      case "diger":
        return "Diğer Kurum";
      default:
        return "Kurum Tipi Belirtilmedi";
    }
  };
  const kurumTuruLabel = getInstitutionTypeLabel(institutionType || "");

  // Para Biçimlendirme
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  // 4734 Sayılı Kanun Madde 22/d KİK Eşik Değeri
  const kikLimit = limitType === "buyuksehir" ? 1021827 : 340391;

  // Bütçe / Harcama Tür Dağılımı
  const totalCat = (stats.malYaklasikMaliyet || 0) +
      (stats.hizmetYaklasikMaliyet || 0) +
      (stats.yapimYaklasikMaliyet || 0) +
      (stats.danismanlikYaklasikMaliyet || 0) || 1;
  const malPct = Math.round(((stats.malYaklasikMaliyet || 0) / totalCat) * 100);
  const hizmetPct = Math.round(
    ((stats.hizmetYaklasikMaliyet || 0) / totalCat) * 100,
  );
  const yapimPct = Math.round(
    ((stats.yapimYaklasikMaliyet || 0) / totalCat) * 100,
  );
  const danismanlikPct = Math.max(0, 100 - malPct - hizmetPct - yapimPct);

  // Asamalar Sorgusu
  const fetchAsamalar = async (): Promise<any[]> => {
    const res = await window.electron.ipcRenderer.invoke(
      "db:query",
      "SELECT * FROM TANIM_Asama WHERE aktif_mi = 1 ORDER BY asama_sira ASC",
    );
    if (!res.success) throw new Error(res.error);
    return res.data;
  };

  const { data: asamalar = [] } = useQuery<any[]>({
    queryKey: ["asamalar_dashboard_v2"],
    queryFn: fetchAsamalar,
  });

  // Harcama Yetkilisi
  const fetchHarcamaYetkilisi = async (): Promise<
    { ad_soyad: string; unvan: string | null } | null
  > => {
    const res = await window.electron.ipcRenderer.invoke(
      "db:query",
      `SELECT p.ad_soyad, p.unvan 
       FROM TANIM_Roller r 
       LEFT JOIN TANIM_Personel p ON r.varsayilan_personel_id = p.id 
       WHERE r.rol_kodu = 'harcama_yetkilisi'`,
    );
    if (!res.success) throw new Error(res.error);
    return res.data[0] || null;
  };

  const { data: harcamaYetkilisi = null } = useQuery({
    queryKey: ["harcama_yetkilisi_dashboard_v2"],
    queryFn: fetchHarcamaYetkilisi,
  });

  const smartAlerts = useSmartAlerts(settings, activeDosyaId, null);

  useEffect(() => {
    if (isLoading || isAnnouncementsLoading) return;

    const notifiedStr = localStorage.getItem("dta_notified_syslog_keys") ||
      "[]";
    let notifiedKeys: string[] = [];
    try {
      notifiedKeys = JSON.parse(notifiedStr);
    } catch {
      notifiedKeys = [];
    }

    const newNotifiedKeys = [...notifiedKeys];
    let hasNewLog = false;

    if (!isMailConfigured) {
      const key = "smtp_not_configured";
      if (!notifiedKeys.includes(key)) {
        logActivity(
          "Mail (SMTP) Yapılandırılmamış",
          "Posta sunucu ayarlarınız eksik. Bildirimler ve onay mailleri devre dışı kalabilir.",
          "warning",
        );
        newNotifiedKeys.push(key);
        hasNewLog = true;
      }
    }

    smartAlerts.forEach((alert) => {
      if (alert.type === "error" || alert.type === "warning") {
        const key = `alert_${alert.id}`;
        if (!notifiedKeys.includes(key)) {
          logActivity(alert.title, alert.message, alert.type);
          newNotifiedKeys.push(key);
          hasNewLog = true;
        }
      }
    });

    if (hasNewLog) {
      localStorage.setItem(
        "dta_notified_syslog_keys",
        JSON.stringify(newNotifiedKeys),
      );
    }
  }, [smartAlerts, isMailConfigured, isLoading, isAnnouncementsLoading]);

  // Aşama Renk ve İsim Tanımlayıcı
  const getAsamaDetails = (
    asamaSira: number,
  ): { name: string; color: string } => {
    const asama = asamalar.find((a: any) => a.asama_sira === asamaSira);
    if (asama) {
      return {
        name: asama.asama_adi,
        color:
          "border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60",
      };
    }

    switch (asamaSira) {
      case 1:
        return {
          name: "1. İhtiyaç & Lüzum",
          color:
            "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/60",
        };
      case 2:
        return {
          name: "2. Piyasa Fiyat Araştırması",
          color:
            "border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60",
        };
      case 3:
        return {
          name: "3. Teklif Değerlendirme",
          color:
            "border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60",
        };
      case 4:
        return {
          name: "4. Karar & Onay Belgesi",
          color:
            "border-purple-200 dark:border-purple-800/80 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60",
        };
      case 5:
        return {
          name: "5. Muayene Kabul & Ödeme",
          color:
            "border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60",
        };
      default:
        return {
          name: "Süreç İlerliyor",
          color:
            "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-900",
        };
    }
  };

  // Filtrelenmiş Dosyalar
  const filteredDosyalar = dosyalar.filter((d) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      d.temin_no?.toLowerCase().includes(q) ||
      d.konu?.toLowerCase().includes(q) ||
      d.harcama_birimi?.toLowerCase().includes(q)
    );
  });

  // Eğer açık aktif bir dosya varsa takip ekranını render et
  if (activeDosyaId) {
    return <TakipScreen />;
  }

  // HAKİM Modülleri Bilgisi
  const hakimPillars = [
    {
      key: "H" as const,
      letter: "H",
      title: "Harcama & Bütçe Yönetimi",
      subtitle: "4734 / 22-d ve 5018 Sayılı Mali Yönetim",
      icon: Coins,
      badge: `${formatCurrency(stats.toplamYaklasikMaliyet)} Toplam Harcama`,
      description:
        "KİK doğrudan temin eşik limitlerini, harcama birimi bütçe tertiplerini ve analitik bütçe kodlarını gerçek zamanlı kontrol altında tutar.",
      statsText: `Yıllık KİK Eşik Sınırı: ${formatCurrency(kikLimit)} (${
        limitType === "buyuksehir" ? "Büyükşehir" : "Normal"
      })`,
    },
    {
      key: "A" as const,
      letter: "A",
      title: "Akıllı Analiz & Yapay Zeka",
      subtitle: "HAKİM AI Karar Destek & Anomali Tespiti",
      icon: Sparkles,
      badge: "Yapay Zeka Aktif",
      description:
        "Piyasa fiyat tekliflerini analiz eder, standart sapma ve aşırı düşük teklif risklerini tespit eder, otomatik şartname ve gerekçe raporları üretir.",
      statsText:
        `${stats.ihaleDosyaSayisi} Dosyada Akıllı Denetim & Form Doldurma`,
    },
    {
      key: "K" as const,
      letter: "K",
      title: "Kamu İhale & Doğrudan Temin",
      subtitle: "Uçtan Uca 4 Aşamalı Dijital Dosya Yaşam Döngüsü",
      icon: Scale,
      badge: `${stats.ihaleDosyaSayisi} Kayıtlı Dosya`,
      description:
        "İhtiyaç lüzumundan piyasa araştırmasına, teklif mektubu dağıtımından onay belgesine kadar tüm doğrudan temin adımlarını kanuna uygun yürütür.",
      statsText: `${
        stats.aktifDosyaSayisi || stats.ihaleDosyaSayisi
      } Aktif Süreç Devam Ediyor`,
    },
    {
      key: "I" as const,
      letter: "İ",
      title: "İşlem, Evrak & E-İmza",
      subtitle: "Resmi Yazışma Standartları & EBYS Uyumluluğu",
      icon: FileCheck,
      badge: "Baskıya & EBYS Hazır",
      description:
        "React TSX şablon motoruyla Onay Belgesi, Piyasa Araştırma Tutanağı, Muayene Kabul ve Ödeme Emri belgelerini tek tıkla mühürlü/imzalı PDF olarak üretir.",
      statsText: `${stats.kayitliFirmaSayisi} İstekli Firma & Tedarikçi Havuzu`,
    },
    {
      key: "M" as const,
      letter: "M",
      title: "Mevzuat & Denetim Güvencesi",
      subtitle: "Sayıştay, KİK ve İç Denetim Uyum Kalkanı",
      icon: ShieldCheck,
      badge: "%100 Mevzuat Uyum Skoru",
      description:
        "Tüm süreçleri 4734, 4735 ve 5018 sayılı kanunlar, Sayıştay denetim kriterleri ve Kamu İhale Tebliğlerine göre anlık denetler, riskleri engeller.",
      statsText:
        `${stats.kayitliPersonelSayisi} Yetkili & Komisyon Üyesi Kayıtlı`,
    },
  ];

  const currentPillar = hakimPillars.find((p) => p.key === activeHakimPillar) ||
    hakimPillars[0];

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1650px] mx-auto pb-12 animate-in fade-in slide-in-from-bottom-3 duration-500 text-slate-800 dark:text-slate-100">
      {/* 1. HAKİM PRO KOMUTA MERKEZİ HERO HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 dark:bg-slate-950 text-white p-7 md:p-8 shadow-xl border border-slate-800">
        {/* Dekoratif Glow Işıkları */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -ml-20 -mb-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                HAKİM Pro • Komuta & Karar Destek Merkezi
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                4734 / 22-d & 5018 Mevzuat Uyumlu
              </span>
              <span className="text-xs text-slate-400">{currentDate}</span>
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-3">
                {greeting}, {adminName || adminUsername || "Kullanıcı"}
                <span className="text-sm font-semibold px-2.5 py-0.5 rounded-lg bg-white/10 text-slate-200 border border-white/10 hidden sm:inline-block">
                  {adminTitle || "Sistem Kullanıcısı"}
                </span>
              </h1>
              <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">
                <strong className="text-white font-semibold">
                  {institutionName || "T.C. Kamu Kurumu"}
                </strong>{" "}
                bünyesindeki doğrudan temin süreçleri, yaklaşık maliyet
                analizleri, KİK limit kontrolleri ve Sayıştay denetim kriterleri
                tek ekranda yönetiliyor.
              </p>
            </div>
          </div>

          {/* Hızlı Aksiyon Butonları */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link to="/dosyalar/yeni">
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.02] text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Doğrudan Temin (22/d)</span>
              </button>
            </Link>

            <Link to="/harcama-merkezi">
              <button
                type="button"
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.02] text-xs"
              >
                <Gavel className="w-4 h-4" />
                <span>Açık İhale & Hakediş Başlat</span>
              </button>
            </Link>

            <Link to="/dosyalar">
              <button
                type="button"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                <span>Tüm Dosyalar ({dosyalar.length})</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Akıllı Durum Uyarıları (Smart Alerts) */}
        {smartAlerts.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-950/30 -mx-7 md:-mx-8 -mb-7 md:-mb-8 px-7 md:px-8 py-3.5 border-t-amber-500/20">
            <div className="flex items-center gap-2.5 text-amber-200 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Sistem Uyarısı:</strong> {smartAlerts[0].title} —{" "}
                {smartAlerts[0].message}
              </span>
            </div>
            <Link
              to={smartAlerts[0].actionLink as any}
              search={smartAlerts[0].actionSearch as any}
            >
              <button className="text-xs font-bold text-amber-300 hover:text-amber-100 underline flex items-center gap-1 cursor-pointer shrink-0">
                {smartAlerts[0].actionText} <ChevronRight className="w-3 h-3" />
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* 2. HAKİM 5 TEMEL DİREK (PILLARS) İNTERAKTİF NAVİGASYON MATRİSİ */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm border border-blue-100 dark:border-blue-900/50">
              🏛️
            </div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              HAKİM Entegre Kamu Satın Alma Mimarisi
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline-block">
            Modül detayını görmek için aşağıdaki harflere tıklayın
          </span>
        </div>

        {/* H - A - K - İ - M Buton Şeridi */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {hakimPillars.map((pillar) => {
            const isSelected = activeHakimPillar === pillar.key;
            const Icon = pillar.icon;
            return (
              <button
                key={pillar.key}
                onClick={() => setActiveHakimPillar(pillar.key)}
                className={cn(
                  "flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden",
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 scale-[1.02]"
                    : "bg-slate-50 hover:bg-slate-100/80 text-slate-800 border-slate-200/90 dark:bg-slate-800/60 dark:hover:bg-slate-800 dark:text-slate-200 dark:border-slate-700/80",
                )}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-xl flex items-center justify-center font-black text-sm shadow-xs",
                      isSelected
                        ? "bg-white text-blue-600 font-black"
                        : "bg-blue-600 text-white dark:bg-blue-500",
                    )}
                  >
                    {pillar.letter}
                  </div>
                  <Icon
                    className={cn(
                      "w-4 h-4",
                      isSelected
                        ? "text-white"
                        : "text-slate-400 dark:text-slate-400",
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-xs font-extrabold tracking-tight leading-tight",
                    isSelected
                      ? "text-white"
                      : "text-slate-900 dark:text-slate-100",
                  )}
                >
                  {pillar.title.split("&")[0]}
                </span>
                <span
                  className={cn(
                    "text-[10px] mt-0.5 truncate font-medium",
                    isSelected
                      ? "text-blue-100"
                      : "text-slate-500 dark:text-slate-400",
                  )}
                >
                  {pillar.subtitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* Seçili Pillar Detay Kartı */}
        <div className="mt-4 p-4 md:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                {currentPillar.letter} SÜTUNU: {currentPillar.title}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-blue-600 text-white shadow-xs">
                {currentPillar.badge}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {currentPillar.description}
            </p>
            <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 pt-0.5">
              <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{currentPillar.statsText}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeHakimPillar === "A" && (
              <button
                type="button"
                onClick={() => {
                  setSelectedFileForAI({
                    temin_no: "GENEL-ANALIZ",
                    konu:
                      "Genel Doğrudan Temin Süreçleri ve Piyasa Fiyat Analizi",
                    yaklasik_maliyet: stats.toplamYaklasikMaliyet,
                  });
                  setShowAIModal(true);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>HAKİM AI Asistanını Aç</span>
              </button>
            )}
            {activeHakimPillar === "H" && (
              <Link to="/harcama-merkezi">
                <button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Harcama Merkezini İncele</span>
                </button>
              </Link>
            )}
            {activeHakimPillar === "K" && (
              <Link to="/dosyalar/yeni">
                <button
                  type="button"
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Yeni Temin Oluştur</span>
                </button>
              </Link>
            )}
            {activeHakimPillar === "I" && (
              <Link to="/dosyalar">
                <button
                  type="button"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Evrak Şablonları & Dosyalar</span>
                </button>
              </Link>
            )}
            {activeHakimPillar === "M" && (
              <Link to="/mevzuat">
                <button
                  type="button"
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Mevzuat & KİK Parametreleri</span>
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 3. ANA KPI & METRİK KARTLARI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Kart 1: Toplam Yaklaşık Maliyet & Bütçe */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Toplam Yaklaşık Maliyet
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {isLoading
                  ? "..."
                  : formatCurrency(stats.toplamYaklasikMaliyet)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              KİK Eşik Durumu:
            </span>
            <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
              {formatCurrency(kikLimit)} / limit
            </span>
          </div>
        </div>

        {/* Kart 2: Dosya & Süreç Hacmi */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Toplam Doğrudan Temin
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {isLoading ? "..." : stats.ihaleDosyaSayisi}{" "}
                <span className="text-sm font-bold text-slate-400">Dosya</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/50">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Aktif İşlemde:
            </span>
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {stats.aktifDosyaSayisi || stats.ihaleDosyaSayisi} dosya açık
            </span>
          </div>
        </div>

        {/* Kart 3: İstekli Firma & Piyasa Katılımı */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Tedarikçi & İstekli Havuzu
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {isLoading ? "..." : stats.kayitliFirmaSayisi}{" "}
                <span className="text-sm font-bold text-slate-400">Firma</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Teklif Verenler:
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {stats.ihalelereKatilanFirmaSayisi || stats.kayitliFirmaSayisi}
              {" "}
              katılım
            </span>
          </div>
        </div>

        {/* Kart 4: Personel & Mevzuat Uyum Skoru */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-rose-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Mevzuat & Denetim Güvencesi
              </span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-6 h-6" /> %100 Uyum
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-900/50">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Görevli Personel:
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {stats.kayitliPersonelSayisi} yetkili tanımlı
            </span>
          </div>
        </div>
      </div>

      {/* 4. İKİ SÜTUNLU ANALİTİK & OPERASYON PANELİ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SOL TARAF: SATIN ALMA TÜR DAĞILIMI & AKTİF DOSYALAR (8 Kolon) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Alım Türlerine Göre Dağılım Barı */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Alım Türlerine Göre Maliyet Dağılımı
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  4734 Sayılı Kanun kapsamındaki Mal, Hizmet ve Yapım
                  harcamaları
                </p>
              </div>
              <span className="text-xs font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 font-mono">
                {formatCurrency(totalCat)}
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex gap-0.5 mb-4 p-0.5">
              <div
                style={{ width: `${malPct}%` }}
                className="h-full bg-blue-500 rounded-l-full transition-all duration-500"
                title={`Mal Alımı: %${malPct}`}
              />
              <div
                style={{ width: `${hizmetPct}%` }}
                className="h-full bg-indigo-500 transition-all duration-500"
                title={`Hizmet Alımı: %${hizmetPct}`}
              />
              <div
                style={{ width: `${yapimPct}%` }}
                className="h-full bg-amber-500 transition-all duration-500"
                title={`Yapım İşi: %${yapimPct}`}
              />
              <div
                style={{ width: `${danismanlikPct}%` }}
                className="h-full bg-purple-500 rounded-r-full transition-all duration-500"
                title={`Danışmanlık: %${danismanlikPct}`}
              />
            </div>

            {/* Dağılım İstatistik Kutuları */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
                <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-400 font-bold mb-1">
                  <span>Mal Alımı</span>
                  <span>%{malPct}</span>
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
                  {formatCurrency(stats.malYaklasikMaliyet)}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50">
                <div className="flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-400 font-bold mb-1">
                  <span>Hizmet Alımı</span>
                  <span>%{hizmetPct}</span>
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
                  {formatCurrency(stats.hizmetYaklasikMaliyet)}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 font-bold mb-1">
                  <span>Yapım İşi</span>
                  <span>%{yapimPct}</span>
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
                  {formatCurrency(stats.yapimYaklasikMaliyet)}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50">
                <div className="flex items-center justify-between text-xs text-purple-700 dark:text-purple-400 font-bold mb-1">
                  <span>Danışmanlık</span>
                  <span>%{danismanlikPct}</span>
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
                  {formatCurrency(stats.danismanlikYaklasikMaliyet)}
                </div>
              </div>
            </div>
          </div>

          {/* AKTİF SÜREÇLER & DOĞRUDAN TEMİN PİPELİNE */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Canlı Süreç Akış Hattı (Dosya Pipeline)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Hazırlıktan kabul ve ödemeye kadar doğrudan temin dosyaları
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Dosya no veya konu ara..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <Link to="/dosyalar/yeni">
                  <button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-3 rounded-xl cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Yeni</span>
                  </button>
                </Link>
              </div>
            </div>

            {filteredDosyalar.length === 0
              ? (
                <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700">
                  <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Henüz Kayıtlı Dosya Bulunmuyor
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                    Yeni bir doğrudan temin dosyası başlatarak 4 aşamalı satın
                    alma sürecinizi anında devreye alın.
                  </p>
                  <Link to="/dosyalar/yeni">
                    <button
                      type="button"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
                    >
                      İlk Dosyayı Oluştur
                    </button>
                  </Link>
                </div>
              )
              : (
                <div className="space-y-3">
                  {filteredDosyalar.slice(0, 6).map((dosya) => {
                    const asamaInfo = getAsamaDetails(
                      (dosya as any).durum_asama_id || 1,
                    );
                    return (
                      <div
                        key={dosya.id}
                        className="p-4 rounded-2xl bg-slate-50 hover:bg-white dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-xs hover:shadow-sm"
                      >
                        <div className="space-y-1.5 max-w-xl">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono font-black text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                              {dosya.temin_no || `#${dosya.id}`}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${asamaInfo.color}`}
                            >
                              {asamaInfo.name}
                            </span>
                            <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                              {dosya.tur?.toUpperCase() || "MAL"}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {dosya.konu || "Konu belirtilmemiş"}
                          </h4>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-3 font-medium">
                            <span>
                              Birim:{" "}
                              {dosya.harcama_birimi || harcamaBirimAdi ||
                                "Genel Birim"}
                            </span>
                            <span>•</span>
                            <span>
                              Tarih: {dosya.dosya_acilis_tarihi
                                ? dosya.dosya_acilis_tarihi.substring(0, 10)
                                : "Bugün"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700">
                          <div className="text-right">
                            <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                              {formatCurrency(dosya.yaklasik_maliyet || 0)}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              Yaklaşık Maliyet
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedFileForAI(dosya);
                                setShowAIModal(true);
                              }}
                              className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-600 dark:text-purple-300 transition-colors cursor-pointer border border-purple-200 dark:border-purple-800"
                              title="HAKİM AI Süreç Tavsiyesi Al"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                            <Link to="/takip">
                              <button
                                type="button"
                                className="text-xs font-bold py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer flex items-center gap-1 transition-colors"
                              >
                                <span>Aç</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        </div>

        {/* SAĞ TARAF: KURUM KİMLİK KARTI & DUYURULAR & SİSTEM KONTROLÜ (4 Kolon) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Kurumsal Mali Kimlik & Bütçe Kartı */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 font-black shadow-md shadow-blue-500/20">
                <Landmark className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                  {institutionName || "Kurum Adı Tanımlanmamış"}
                </h3>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold truncate block">
                  {kurumTuruLabel}
                </span>
              </div>
            </div>

            {/* Bütçe & Analitik Kod Matrisi */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-medium">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">
                  Limit Statüsü
                </span>
                <span className="font-bold text-slate-900 dark:text-white uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] border border-slate-200 dark:border-slate-700">
                  {limitType === "buyuksehir"
                    ? "Büyükşehir Kapsamı"
                    : "Normal İdare"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">
                  Harcama Birimi
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                  {harcamaBirimAdi || "Belirtilmedi"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">
                  Kurumsal / Fonk. Kod
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {kurumsalKod || "00.00"} / {fonksiyonelKod || "00.0"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">
                  Muhasebe Birimi
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                  {muhasebeBirimAdi || "Belirtilmedi"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">
                  Harcama Yetkilisi
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {harcamaYetkilisi?.ad_soyad || "Atanmamış"}
                </span>
              </div>
            </div>

            <Link to="/mevzuat" search={{ tab: "mali" } as any}>
              <button
                type="button"
                className="w-full text-xs font-bold py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
              >
                Mali Parametreleri Düzenle
              </button>
            </Link>
          </div>

          {/* HAKİM Akıllı Asistan & Mevzuat Bülteni */}
          <div className="p-6 rounded-3xl bg-slate-900 dark:bg-slate-950 text-white shadow-md border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                <Bot className="w-4 h-4 text-purple-300" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-purple-200">
                  HAKİM AI Karar Desteği
                </h4>
                <span className="text-[10px] text-purple-300/80">
                  4734 Sayılı Kanun & KİK Mevzuatı
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Doğrudan temin lüzum yazıları, yaklaşık maliyet piyasa araştırması
              ve onay belgesi gerekçelerini mevzuata tam uyumlu olarak otomatik
              oluşturun.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setSelectedFileForAI({
                    temin_no: "MEVZUAT-REHBERI",
                    konu:
                      "4734 Sayılı Kamu İhale Kanunu 22/d Maddesi Kapsamında Alım Esasları",
                    yaklasik_maliyet: kikLimit,
                  });
                  setShowAIModal(true);
                }}
                className="w-full text-left p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-purple-100 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>💡 22/d Eşik Limit ve KDV Kuralları</span>
                <ChevronRight className="w-3.5 h-3.5 text-purple-300" />
              </button>

              <button
                onClick={() => {
                  setSelectedFileForAI({
                    temin_no: "DENETIM-KONTROL",
                    konu:
                      "Sayıştay ve İç Denetim Standartlarına Göre Doğrudan Temin Dosya Hazırlığı",
                    yaklasik_maliyet: stats.toplamYaklasikMaliyet,
                  });
                  setShowAIModal(true);
                }}
                className="w-full text-left p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-purple-100 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>🛡️ Sayıştay Denetim Kontrol Listesi</span>
                <ChevronRight className="w-3.5 h-3.5 text-purple-300" />
              </button>
            </div>
          </div>

          {/* Sistem Duyuruları ve Güncellemeler */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Sürüm & Mevzuat Bülteni
              </h4>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900/40">
                v1.0.0-beta.79
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {announcements && announcements.length > 0
                ? (
                  announcements.slice(0, 3).map((ann, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                    >
                      <div className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                        {ann.title}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed font-normal">
                        {ann.content}
                      </p>
                    </div>
                  ))
                )
                : (
                  <div className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
                    Sistem güncel, aktif bildirim bulunmuyor.
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. HAKİM AI ASİSTAN MODALI */}
      {showAIModal && selectedFileForAI && (
        <AITextGeneratorModal
          isOpen={true}
          isAdvisorMode={true}
          fieldName="HAKİM AI Karar Desteği"
          title={`HAKİM AI Asistanı - ${
            selectedFileForAI.temin_no || "Mevzuat Rehberi"
          }`}
          initialPrompt={`Aşağıdaki konu ve bütçe detaylarına sahip kamu satın alma süreci için çalışıyorum:\n- Dosya/Konu: ${selectedFileForAI.konu}\n- Yaklaşık Maliyet: ${
            formatCurrency(
              selectedFileForAI.yaklasik_maliyet || 0,
            )
          }\n\nLütfen 4734 Sayılı Kamu İhale Kanunu ve ilgili mevzuata göre dikkat edilmesi gereken hususlar, piyasa araştırması esasları ve sonraki adımlar hakkında uzman tavsiyesi sun.`}
          placeholderMappings={{
            "[DOSYA_NO]": selectedFileForAI.temin_no || "Belirtilmemiş",
            "[DOSYA_KONU]": selectedFileForAI.konu || "Belirtilmemiş",
            "[DOSYA_MALIYET]": formatCurrency(
              selectedFileForAI.yaklasik_maliyet || 0,
            ),
          }}
          onClose={() => setShowAIModal(false)}
          onApply={(text) => {
            console.log("HAKİM AI Yanıtı:", text);
            setShowAIModal(false);
          }}
          systemInstruction="Sen yetkin bir HAKİM Pro Doğrudan Temin, Harcama ve Kamu İhale (4734 ve 5018 Sayılı Kanunlar) mevzuat uzmanı ve karar destek asistanısın. Kullanıcıya net, Sayıştay denetim standartlarına uygun, pratik ve yasal tavsiyeler ver. ÖNEMLİ GİZLİLİK KURALI: Eğer kullanıcıdan gelen metin içinde belirli bir Kurum Adı, Belediye, Kişi Adı-Soyadı, TC No veya açık adres geçiyorsa; cevabında bu özel isimleri asla açıkça kullanma, '[İlgili Kurum]' veya '[İlgili Kişi]' şeklinde sansürle (maskele)."
        />
      )}
    </div>
  );
}
