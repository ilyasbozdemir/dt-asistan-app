"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Activity,
  CheckCircle,
  Code,
  Download,
  FileText,
  Laptop,
  Lock,
  Moon,
  Smartphone,
  Sun,
  Terminal,
  Wifi,
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    "features" | "architecture" | "docker"
  >("features");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isScrolled, setIsScrolled] = useState(false);

  // GitHub Latest Release states
  const [latestRelease, setLatestRelease] = useState<{
    tag: string;
    size: string;
    date: string;
    url: string;
  }>({
    tag: "v1.0.0-beta.38",
    size: "68.4 MB",
    date: "10.07.2026",
    url: "https://github.com/ilyasbozdemir/dt-asistan-app/releases",
  });

  // Fetch GitHub Release info on mount
  useEffect(() => {
    fetch(
      "https://api.github.com/repos/ilyasbozdemir/dt-asistan-app/releases/latest",
    )
      .then((res) => res.json())
      .then((data) => {
        if (data && data.tag_name) {
          const mainAsset = data.assets?.[0];
          const sizeMb = mainAsset
            ? `${(mainAsset.size / (1024 * 1024)).toFixed(1)} MB`
            : "68.4 MB";
          const dateStr = data.published_at
            ? new Date(data.published_at).toLocaleDateString("tr-TR")
            : "10.07.2026";
          setLatestRelease({
            tag: data.tag_name,
            size: sizeMb,
            date: dateStr,
            url: data.html_url ||
              "https://github.com/ilyasbozdemir/dt-asistan-app/releases",
          });
        }
      })
      .catch((err) => {
        console.error("Failed to fetch github release:", err);
      });
  }, []);

  // Initialize theme from localStorage & set up scroll listener
  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as "dark" | "light") ||
      "dark";
    if (savedTheme !== "dark") {
      setTimeout(() => {
        setTheme(savedTheme);
      }, 0);
    }
    document.documentElement.classList.toggle("dark", savedTheme === "dark");

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Theme Toggle
  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden transition-colors duration-300">
      {/* BACKGROUND GLOWS */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-10 w-[400px] h-[400px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] left-10 w-[600px] h-[600px] bg-violet-650/5 dark:bg-violet-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* HEADER / NAVIGATION */}
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 dark:bg-slate-955/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-900 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 overflow-hidden">
              <Image
                src="/icon.png"
                alt="DT Asistan Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                DT ASİSTAN
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-500 dark:text-slate-400">
            <a
              href="#features"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Özellikler
            </a>
            <a
              href="#how-it-works"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Nasıl Çalışır?
            </a>
            <a
              href="#install"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Kurulum & Docker
            </a>
            <a
              href="#downloads"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Yüklemeler
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 cursor-pointer"
              title="Tema Değiştir"
            >
              {theme === "dark"
                ? <Sun className="w-4 h-4" />
                : <Moon className="w-4 h-4" />}
            </button>

            <a
              href="#downloads"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/10 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              İndir
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 max-w-7xl mx-auto px-6 text-center space-y-8 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] md:text-xs font-black tracking-wider text-blue-600 dark:text-blue-400 uppercase">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Masaüstünün Gücü, Bulutun Senkronizasyonu
        </div>

        <h1 className="max-w-4xl mx-auto text-4xl md:text-6xl font-black tracking-tight leading-[1.1] text-slate-900 dark:text-white">
          Süreç ve Hakediş Yönetiminde{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-500 dark:to-indigo-400 bg-clip-text text-transparent">
            Yeni Nesil Hibrit Dönem
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed font-medium">
          DT Asistan, kamu ve özel sektör projelerinizde lokal bilgisayarınızın
          performansından ödün vermeden, merkezi sunucuyla çift yönlü
          eşleşebilen gelişmiş bir iş asistanıdır. Çevrimdışı çalışın, tek tıkla
          buluta aktarın.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <a
            href="#downloads"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Masaüstü Uygulamasını İndir
          </a>
          <a
            href="#install"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Code className="w-4 h-4 text-blue-500" />
            Docker Sunucu Kurulumu
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] md:text-xs text-slate-500 font-bold">
          <span>✓ Windows 10/11 & macOS Desteği</span>
          <span className="hidden sm:inline w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/ilyasbozdemir/dt-asistan-app/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block hover:opacity-90 transition-opacity"
            >
              <img
                src="https://img.shields.io/github/v/release/ilyasbozdemir/dt-asistan-app?style=flat-square&logo=github&label=Son%20S%C3%BCr%C3%BCm"
                alt="Latest Release"
                className="h-5 rounded"
              />
            </a>
            <a
              href="https://github.com/ilyasbozdemir/dt-asistan-app/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block hover:opacity-90 transition-opacity"
            >
              <img
                src="https://img.shields.io/github/downloads/ilyasbozdemir/dt-asistan-app/total?style=flat-square&logo=github&color=blue"
                alt="Downloads"
                className="h-5 rounded"
              />
            </a>
          </div>
        </div>

        {/* Dashboard UI Preview Container */}
        <div className="pt-10 max-w-5xl mx-auto">
          <div className="relative rounded-2xl border border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-slate-950 p-2 shadow-2xl shadow-blue-500/5">
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-transparent to-transparent z-10" />
            <div className="bg-white/80 dark:bg-slate-900/60 rounded-xl overflow-hidden aspect-video border border-slate-200 dark:border-slate-800/40 flex flex-col">
              {/* Mock App Header */}
              <div className="h-10 bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800/80 px-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                </div>
                <div className="px-6 py-0.5 rounded-md bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800/60 text-[10px] text-slate-500 font-mono">
                  dt-asistan://dashboard
                </div>
                <div className="w-12" />
              </div>
              {/* Mock App Content */}
              <div className="flex-1 grid grid-cols-12 p-4 gap-4 text-left">
                {/* Mock Sidebar */}
                <div className="col-span-3 space-y-2 border-r border-slate-200 dark:border-slate-800/30 pr-3">
                  <div className="h-6 w-full bg-blue-600/10 rounded-lg border border-blue-500/15" />
                  <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800/40 rounded-lg" />
                  <div className="h-6 w-4/5 bg-slate-200 dark:bg-slate-800/40 rounded-lg" />
                  <div className="h-6 w-2/3 bg-slate-200 dark:bg-slate-800/40 rounded-lg" />
                </div>
                {/* Mock Main Content */}
                <div className="col-span-9 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-16 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60 rounded-xl p-2.5 space-y-1.5">
                      <div className="w-8 h-1 bg-slate-400 dark:bg-slate-700 rounded" />
                      <div className="w-14 h-4 bg-slate-800/10 dark:bg-white/10 rounded" />
                    </div>
                    <div className="h-16 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60 rounded-xl p-2.5 space-y-1.5">
                      <div className="w-8 h-1 bg-slate-400 dark:bg-slate-700 rounded" />
                      <div className="w-14 h-4 bg-slate-800/10 dark:bg-white/10 rounded" />
                    </div>
                    <div className="h-16 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60 rounded-xl p-2.5 space-y-1.5">
                      <div className="w-8 h-1 bg-slate-400 dark:bg-slate-700 rounded" />
                      <div className="w-14 h-4 bg-emerald-500/10 rounded" />
                    </div>
                  </div>
                  <div className="h-40 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/40 rounded-xl p-4 space-y-3">
                    <div className="w-1/3 h-3 bg-slate-800/10 dark:bg-white/10 rounded" />
                    <div className="space-y-1.5">
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-800/40 rounded" />
                      <div className="w-4/5 h-2 bg-slate-200 dark:bg-slate-800/40 rounded" />
                      <div className="w-11/12 h-2 bg-slate-200 dark:bg-slate-800/40 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES / TABS SECTION */}
      <section
        id="features"
        className="py-20 bg-slate-50 dark:bg-slate-950 border-t border-slate-150 dark:border-slate-900"
      >
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Neden DT Asistan?
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Geleneksel bulut tabanlı yavaş sistemleri ve hantal yerel
              yazılımları bir kenara bırakın. Hibrit mimarimiz ile iki dünyanın
              da en iyi özelliklerine sahip olun.
            </p>
          </div>

          {/* Tab buttons */}
          <div className="flex justify-center gap-2 max-w-md mx-auto bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl">
            <button
              onClick={() => setActiveTab("features")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "features"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/5"
                  : "text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Özellikler
            </button>
            <button
              onClick={() => setActiveTab("architecture")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "architecture"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/5"
                  : "text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Mimari
            </button>
            <button
              onClick={() => setActiveTab("docker")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "docker"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/5"
                  : "text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Docker Kurulumu
            </button>
          </div>

          {/* TAB 1: FEATURES GRID */}
          {activeTab === "features" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {[
                {
                  icon: (
                    <Wifi className="w-5 h-5 text-blue-550 dark:text-blue-550" />
                  ),
                  title: "Akıllı Çevrimdışı Çalışma",
                  desc:
                    "İnternet bağlantınız kopsa veya şantiyede olsanız bile işiniz durmaz. Tüm işlemler yerel veritabanında gerçekleştirilir.",
                },
                {
                  icon: <Activity className="w-5 h-5 text-indigo-500" />,
                  title: "Çift Yönlü Eşitleme (Sync)",
                  desc:
                    "Ofis moduna geçtiğinizde veya internet sağlandığında yereldeki verilerinizi tek tuşla merkezi bulut API sunucunuza aktarın.",
                },
                {
                  icon: (
                    <Lock className="w-5 h-5 text-emerald-550 dark:text-emerald-500" />
                  ),
                  title: "Yerel Veri Güvenliği (.dtal)",
                  desc:
                    "Proje dosyalarınız şifrelenmiş .dtal formatında bilgisayarınızda saklanır. Verilerinizin kontrolü tamamen sizdedir.",
                },
                {
                  icon: (
                    <FileText className="w-5 h-5 text-amber-550 dark:text-amber-500" />
                  ),
                  title: "Gelişmiş Çıktı Merkezi",
                  desc:
                    "Rapor, dilekçe ve hakedişlerinizi anında Word (docx), Excel (xlsx), PDF veya UYAP (.udf) formatlarında ihraç edin.",
                },
                {
                  icon: (
                    <Laptop className="w-5 h-5 text-violet-550 dark:text-violet-500" />
                  ),
                  title: "Masaüstü Performansı",
                  desc:
                    "Electron tabanlı güçlü yapısıyla bilgisayarınızın RAM ve işlemci gücünü verimli kullanır, tarayıcı kasmaları yaşanmaz.",
                },
                {
                  icon: (
                    <Smartphone className="w-5 h-5 text-rose-550 dark:text-rose-500" />
                  ),
                  title: "Mobil Entegrasyon",
                  desc:
                    "Android ve iOS mobil cihazlarınızdan merkezi sunucuya bağlanarak sahadan anlık veri akışı sağlayın.",
                },
              ].map((f, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-900 rounded-2xl p-5 hover:border-slate-350 dark:hover:border-slate-800 transition-all text-left space-y-3 shadow-sm dark:shadow-none"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                    {f.icon}
                  </div>
                  <h4 className="text-sm font-bold text-slate-850 dark:text-white">
                    {f.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed font-medium">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: ARCHITECTURE & HOW IT WORKS */}
          {activeTab === "architecture" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
              <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 text-left space-y-4 shadow-sm dark:shadow-none">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-550 flex items-center justify-center font-bold">
                  1
                </div>
                <h4 className="text-sm font-bold text-slate-850 dark:text-white">
                  İstemci Katmanı (Desktop App)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed font-medium">
                  Kullanıcının bilgisayarında çalışan yerel istemcidir. SQLite
                  tabanlı veritabanı sayesinde sıfır ağ gecikmesi ile çalışır.
                  İnternet bağımsızdır.
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 text-left space-y-4 shadow-sm dark:shadow-none">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-500 flex items-center justify-center font-bold">
                  2
                </div>
                <h4 className="text-sm font-bold text-slate-850 dark:text-white">
                  API Gateway (Next.js Server)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed font-medium">
                  Merkezi veri tabanını ve yetkilendirmeleri (Auth) yöneten
                  sunucudur. Docker container olarak yerel ağda veya bulutta
                  güvenle yayınlanır.
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 text-left space-y-4 shadow-sm dark:shadow-none">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-500 flex items-center justify-center font-bold">
                  3
                </div>
                <h4 className="text-sm font-bold text-slate-850 dark:text-white">
                  Eşitleme Modları (Ofis / Ev)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed font-medium">
                  Ofisteyken sunucuyla doğrudan, evde/sahadayken ise çevrimdışı
                  çalışarak verileri lokalde biriktirir, ardından tek komutla
                  buluta aktarır.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: DOCKER SETUP */}
          {activeTab === "docker" && (
            <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 text-left space-y-4 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                <h4 className="text-sm font-bold text-slate-850 dark:text-white">
                  Docker ile API Gateway Kurulumu
                </h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed font-medium">
                Sunucunuzu Docker yardımıyla yerel ağınızda (LAN) veya dış ip
                adresinizde saniyeler içinde ayağa kaldırabilirsiniz. Masaüstü
                uygulamalarınız bu adrese bağlanarak ortak veritabanını
                eşitleyecektir.
              </p>

              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl p-4 space-y-2.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                <div className="text-slate-400 dark:text-slate-550">
                  {"# 1. Proje ana dizinindeyken web klasörünü docker imajı olarak derleyin"}
                </div>
                <div className="text-blue-600 dark:text-blue-400">
                  docker build -t dt-asistan-server ./web
                </div>

                <div className="text-slate-400 dark:text-slate-550 mt-2">
                  {"# 2. İmajı 3000 portu üzerinden arka planda çalıştırın"}
                </div>
                <div className="text-blue-600 dark:text-blue-400">
                  docker run -p 3000:3000 --name dt-server -d dt-asistan-server
                </div>

                <div className="text-slate-400 dark:text-slate-550 mt-2">
                  {"# 3. Masaüstü uygulamasındaki Sunucu Adresi alanına girilecek IP"}
                </div>
                <div>
                  URL:{" "}
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    http://localhost:3000
                  </span>{" "}
                  veya{" "}
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    http://[LAN_IP]:3000
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* DOWNLOADS SECTION */}
      <section
        id="downloads"
        className="py-20 bg-slate-50/50 dark:bg-slate-950/40 relative border-t border-slate-100 dark:border-slate-900"
      >
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left space-y-4">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-850 dark:text-white leading-tight">
              DT Asistan Uygulamalarını <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-500 dark:to-indigo-400 bg-clip-text text-transparent">
                Hemen İndirin
              </span>
            </h2>
            <p className="text-xs md:text-sm text-slate-550 dark:text-slate-400 leading-relaxed font-medium max-w-md">
              Bilgisayarınıza uygun istemciyi indirin, kurun ve gateway
              sunucunuza kolayca bağlayın. Mobil uygulamalarımız yakında Google
              Play Store ve Apple App Store mağazalarında yayında olacaktır.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs font-bold text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                Sürüm: {latestRelease.tag}
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                Güvenli & Reklamsız
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 rounded-3xl p-6 md:p-8 space-y-6 text-left shadow-sm dark:shadow-none">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Platformlar
            </h4>

            <div className="space-y-4">
              <a
                href={latestRelease.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs md:text-sm transition-all shadow-md shadow-blue-500/10 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Laptop className="w-5 h-5 text-white" />
                  <div>
                    <p className="font-bold text-white">
                      Windows Installer (.exe)
                    </p>
                    <p className="text-[10px] text-blue-200 mt-0.5">
                      Windows 10 / 11 64-bit | Boyut: {latestRelease.size}
                    </p>
                  </div>
                </div>
                <Download className="w-4 h-4" />
              </a>

              <a
                href={latestRelease.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-bold text-xs md:text-sm transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Laptop className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="font-bold">macOS Installer (.dmg)</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Intel & Apple Silicon (M1/M2/M3)
                    </p>
                  </div>
                </div>
                <Download className="w-4 h-4" />
              </a>

              {/* Mobile app placeholder */}
              <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-slate-400" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500">
                      Android & iOS Mobil
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-655 mt-0.5">
                      Google Play & App Store
                    </p>
                  </div>
                </div>
                <span className="text-[9px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Yakında
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 text-xs text-slate-500 font-bold transition-colors">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden">
              <Image
                src="/icon.png"
                alt="DT Asistan Footer Logo"
                width={24}
                height={24}
                className="w-full h-full object-contain"
              />
            </div>
            <span>© 2026 DT Asistan. Tüm hakları saklıdır.</span>
          </div>

          <div className="flex gap-6">
            <a
              href="https://github.com/ilyasbozdemir/dt-asistan-app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              GitHub Repository
            </a>
            <span className="text-slate-300 dark:text-slate-850">|</span>
            <a
              href="#"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Kullanım Koşulları
            </a>
            <span className="text-slate-300 dark:text-slate-850">|</span>
            <a
              href="#"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Gizlilik Politikası
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
