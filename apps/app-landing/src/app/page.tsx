"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Activity,
  ArrowRight,
  CheckCircle,
  Code,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Laptop,
  Lock,
  Menu,
  Moon,
  Server,
  Shield,
  Smartphone,
  Sparkles,
  Sun,
  Terminal,
  Wifi,
  X,
  Zap,
} from "lucide-react";

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function LinkedinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    "features" | "architecture" | "docker"
  >("features");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic Web App Link (Dev vs Prod Demo)
  const webAppUrl = process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" &&
        window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1"
      ? "https://temin360app.demo.ilyasbozdemir.dev"
      : "https://temin360app.demo.ilyasbozdemir.dev");

  // GitHub Latest Release states
  const [latestRelease, setLatestRelease] = useState<{
    tag: string;
    size: string;
    date: string;
    url: string;
  }>({
    tag: "v1.0.0-beta.90",
    size: "68.4 MB",
    date: "06.09.2026",
    url: "https://github.com/ilyasbozdemir/temin-360-app/releases",
  });

  // Fetch GitHub Release info on mount
  useEffect(() => {
    fetch(
      "https://api.github.com/repos/ilyasbozdemir/temin-360-app/releases/latest",
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
            : "06.09.2026";
          setLatestRelease({
            tag: data.tag_name,
            size: sizeMb,
            date: dateStr,
            url: data.html_url ||
              "https://github.com/ilyasbozdemir/temin-360-app/releases",
          });
        }
      })
      .catch((err) => {
        console.error("Failed to fetch github release:", err);
      });
  }, []);

  // Initialize theme from localStorage & set up scroll listener
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const initialTheme = savedTheme === "light" ? "light" : "dark";
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Theme Toggle
  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden transition-colors duration-300 flex flex-col">
      {/* BACKGROUND GLOWS */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[18%] right-10 w-[450px] h-[450px] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] left-10 w-[600px] h-[600px] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* HEADER / NAVIGATION */}
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 py-3 shadow-xs"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo & Brand */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 p-1 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Image
                src="/icon.png"
                alt="TEMİN 360 Logo"
                width={36}
                height={36}
                priority
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg tracking-tight bg-gradient-to-r from-slate-950 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  TEMİN 360
                </span>
                <span className="hidden sm:inline-block text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide -mt-0.5 hidden sm:block">
                Kamu Satın Alma & Hakediş Mimarisi
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-600 dark:text-slate-300">
            <a
              href="#dashboard"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Komuta Merkezi
            </a>
            <a
              href="#features"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Özellikler
            </a>
            <a
              href="#how-it-works"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Nasıl Çalışır?
            </a>
            <a
              href="#install"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Kurulum & Docker
            </a>
            <a
              href="#downloads"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              İndir
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* GitHub Link */}
            <a
              href="https://github.com/ilyasbozdemir/temin-360-app"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900 dark:hover:bg-slate-800 transition-all border border-slate-200/80 dark:border-slate-800"
              title="GitHub Repository"
            >
              <GithubIcon className="w-4 h-4" />
            </a>

            {/* LinkedIn Link */}
            <a
              href="https://www.linkedin.com/in/ilyasbozdemir/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900 dark:hover:bg-slate-800 transition-all border border-slate-200/80 dark:border-slate-800"
              title="İlyas Bozdemir LinkedIn"
            >
              <LinkedinIcon className="w-4 h-4" />
            </a>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900 dark:hover:bg-slate-800 transition-all border border-slate-200/80 dark:border-slate-800 cursor-pointer"
              title="Tema Değiştir (Koyu / Açık)"
            >
              {theme === "dark"
                ? <Sun className="w-4 h-4 text-amber-400" />
                : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Main Download CTA */}
            <a
              href="#downloads"
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Uygulamayı</span> İndir
            </a>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 ml-1 cursor-pointer"
            >
              {mobileMenuOpen
                ? <X className="w-5 h-5" />
                : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-6 py-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex flex-col gap-3 text-sm font-bold animate-in fade-in slide-in-from-top-2">
            <a
              href="#dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-slate-700 dark:text-slate-200"
            >
              Komuta Merkezi
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-slate-700 dark:text-slate-200"
            >
              Özellikler
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-slate-700 dark:text-slate-200"
            >
              Nasıl Çalışır?
            </a>
            <a
              href="#install"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-slate-700 dark:text-slate-200"
            >
              Kurulum & Docker
            </a>
            <a
              href="#downloads"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-blue-600 dark:text-blue-400"
            >
              İndir & Sürümler
            </a>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Sosyal & Kod:
              </span>
              <div className="flex gap-2">
                <a
                  href="https://github.com/ilyasbozdemir/temin-360-app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                >
                  <GithubIcon className="w-4 h-4" />
                </a>
                <a
                  href="https://www.linkedin.com/in/ilyasbozdemir/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-blue-600"
                >
                  <LinkedinIcon className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-8 relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-[11px] font-black tracking-wider text-blue-700 dark:text-blue-300 uppercase shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Masaüstünün Hızı, Bulutun Senkronizasyon Gücü
        </div>

        <h1 className="max-w-4xl mx-auto text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.12] text-slate-950 dark:text-white">
          Süreç, İhale ve Hakedişte{" "}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 dark:from-blue-400 dark:via-indigo-400 dark:to-cyan-300 bg-clip-text text-transparent">
            Yeni Nesil Hibrit Mimarisi
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed font-medium">
          TEMİN 360; 4734 Sayılı Kamu İhale Kanunu Madde 22/d ve 5018 Sayılı
          Kanun standartlarında, doğrudan temin ve hakediş evraklarını saniyeler
          içinde mevzuata tam uyumlu üreten, yerel SQLite ile sıfır gecikmeli
          çalışıp merkezi sunucuyla çift yönlü eşleşebilen gelişmiş iş
          asistanıdır.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <a
            href="#downloads"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-extrabold transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2.5 active:scale-95"
          >
            <Download className="w-4 h-4" />
            Masaüstü Uygulamasını İndir
          </a>
          <a
            href={webAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <Globe className="w-4 h-4 text-blue-500" />
            Web Sürümünü Dene (Demo)
          </a>
          <a
            href="https://github.com/ilyasbozdemir/temin-360-app"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-sm font-bold transition-all flex items-center justify-center gap-2"
          >
            <GithubIcon className="w-4 h-4" />
            Kaynak Kodlar
          </a>
        </div>

        {/* Release Badges & OS support */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500 font-bold pt-2">
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            Windows 10 / 11 & macOS Desteği
          </span>
          <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/ilyasbozdemir/temin-360-app/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block hover:opacity-90 transition-opacity"
            >
              <img
                src="https://img.shields.io/github/v/release/ilyasbozdemir/temin-360-app?style=flat-square&logo=github&label=Son%20S%C3%BCr%C3%BCm"
                alt="Latest Release"
                className="h-5 rounded"
              />
            </a>
            <a
              href="https://github.com/ilyasbozdemir/temin-360-app/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block hover:opacity-90 transition-opacity"
            >
              <img
                src="https://img.shields.io/github/downloads/ilyasbozdemir/temin-360-app/total?style=flat-square&logo=github&color=blue"
                alt="Downloads"
                className="h-5 rounded"
              />
            </a>
          </div>
        </div>

        {/* ═══ REAL DASHBOARD UI PREVIEW SECTION ═══ */}
        <div id="dashboard" className="pt-8 max-w-6xl mx-auto">
          <div className="relative rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-2 sm:p-3 shadow-2xl shadow-blue-500/10 backdrop-blur-xs">
            {/* Glowing Accent Ring */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-cyan-500/20 rounded-3xl blur-md -z-10 opacity-70" />

            {/* Desktop Window Container */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-2xl flex flex-col">
              {/* Window Header / Mac-Windows Titlebar */}
              <div className="h-10 bg-slate-100 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800/80 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 transition-colors cursor-pointer" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-colors cursor-pointer" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors cursor-pointer" />
                </div>

                <div className="flex items-center gap-2 px-4 py-1 rounded-lg bg-white/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 font-mono shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-semibold">TEMİN 360</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    Komuta & Karar Destek Merkezi (KİK 4734 / 22-d)
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span className="hidden sm:inline px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20 font-bold">
                    v1.0.0 PRO
                  </span>
                </div>
              </div>

              {/* Real Dashboard Image */}
              <div className="relative aspect-video w-full bg-slate-900 overflow-hidden group">
                <Image
                  src="/dashboard-preview.png"
                  alt="TEMİN 360 Komuta & Karar Destek Merkezi Canlı Gösterge Paneli"
                  width={1920}
                  height={1080}
                  priority
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.01]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES / TABS SECTION */}
      <section
        id="features"
        className="py-20 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-900 transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Neden TEMİN 360?
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
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Temel Özellikler
            </button>
            <button
              onClick={() => setActiveTab("architecture")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "architecture"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Hibrit Mimari
            </button>
            <button
              onClick={() => setActiveTab("docker")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "docker"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Docker & API
            </button>
          </div>

          {/* TAB 1: FEATURES */}
          {activeTab === "features" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Sıfır Gecikme, Yerel Güç
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Tüm işlemler doğrudan bilgisayarınızdaki SQLite motoru
                  üzerinde çalışır. İnternet bağlantınız kopsa bile kesintisiz
                  evrak hazırlamaya ve hakediş hesaplamaya devam edin.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  4734 ve 5018 Mevzuat Uyumu
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Piyasa fiyat araştırma tutanakları, onay belgeleri, sözleşme
                  ve muayene-kabul tutanakları gibi tüm resmi şablonlar kamu
                  ihale mevzuatına 100% uyumludur.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <Wifi className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Akıllı Çift Yönlü Eşitleme
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Çevrimdışı yapılan değişiklikler ağa bağlanıldığı anda merkezi
                  Docker/Web sunucusuna otomatik aktarılır. Ekip
                  arkadaşlarınızla çakışmasız ortak çalışın.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: ARCHITECTURE */}
          {activeTab === "architecture" && (
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-8 animate-in fade-in duration-300">
              <div className="max-w-2xl mx-auto text-center space-y-2">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Lokal ve Bulutun Mükemmel Uyumu
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Verileriniz öncelikle sizin kontrolünüzde. İhtiyaç anında
                  merkezi kurum ağına veya bulut sunucuya senkronize olur.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-3">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                    <Laptop className="w-4 h-4" />
                    <span>Lokal Masaüstü (Client Engine)</span>
                  </div>
                  <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2">
                    <li>
                      • SQLite ile mikro-saniye seviyesinde okuma/yazma hızı
                    </li>
                    <li>• Tam çevrimdışı (offline-first) çalışma garantisi</li>
                    <li>
                      • Yerel yazıcı ve şablon motoruyla PDF/UDF/Docx çıktısı
                    </li>
                    <li>• Hassas veriler lokalde şifrelenerek saklanır</li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <Globe className="w-4 h-4" />
                    <span>Merkezi Sunucu & Web Paneli (Sync Server)</span>
                  </div>
                  <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2">
                    <li>• Docker Container ile kolay ve bağımsız kurulum</li>
                    <li>
                      • RESTful API ve WebSocket üzerinden canlı senkronizasyon
                    </li>
                    <li>• Çok kullanıcılı yetkilendirme ve rol yönetimi</li>
                    <li>• Günlük otomatik yedekleme ve merkezi arşivleme</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DOCKER */}
          {activeTab === "docker" && (
            <div className="p-8 rounded-3xl bg-slate-950 text-white border border-slate-800 space-y-6 animate-in fade-in duration-300 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-blue-400">
                  <Terminal className="w-4 h-4" />
                  <span>Tek Satırda Docker Kurulumu</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  docker-compose.yml
                </span>
              </div>

              <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
{`version: '3.8'
services:
  temin360-server:
    image: ilyasbozdemir/temin360-sync:latest
    container_name: temin360-hub
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_STORAGE=/data/temin360.db
    volumes:
      - ./temin-data:/data
    restart: always`}
              </pre>

              <div className="text-xs text-slate-400 leading-relaxed">
                Sunucunuzda{" "}
                <code className="text-blue-300 bg-slate-900 px-1.5 py-0.5 rounded">
                  docker compose up -d
                </code>{" "}
                komutunu çalıştırarak kurum içi senkronizasyon merkezini 10
                saniyede hazır hale getirebilirsiniz.
              </div>
            </div>
          )}
        </div>
      </section>

      {/* DOWNLOADS SECTION */}
      <section
        id="downloads"
        className="py-20 bg-slate-100/70 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800 transition-colors"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8">
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
              TEMİN 360&apos;ı Hemen İndirin
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
              İşletim sisteminize uygun kurulum dosyasını indirin ve doğrudan
              temin süreçlerinizi hızlandırın.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {/* Windows Download Card */}
            <a
              href="https://github.com/ilyasbozdemir/temin-360-app/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 shadow-md hover:shadow-xl transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Laptop className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {latestRelease.tag}
                </span>
              </div>
              <div className="mt-5 space-y-1">
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  Windows Kurulum Paketi (.exe)
                </h4>
                <p className="text-xs text-slate-500">
                  Windows 10, 11 (64-bit) Tam Uyumlu
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                <span>İndir ({latestRelease.size})</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            {/* macOS Download Card */}
            <a
              href="https://github.com/ilyasbozdemir/temin-360-app/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-md hover:shadow-xl transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Laptop className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  {latestRelease.tag}
                </span>
              </div>
              <div className="mt-5 space-y-1">
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                  macOS Kurulum Paketi (.dmg)
                </h4>
                <p className="text-xs text-slate-500">
                  Apple Silicon (M1/M2/M3) & Intel Desteği
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <span>İndir ({latestRelease.size})</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto py-12 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 text-xs text-slate-500 font-medium transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 flex items-center justify-center p-1">
              <Image
                src="/icon.png"
                alt="TEMİN 360 Footer Logo"
                width={28}
                height={28}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="font-extrabold text-slate-800 dark:text-slate-200">
                TEMİN 360
              </p>
              <p className="text-[11px] text-slate-400">
                © {new Date().getFullYear()}{" "}
                İlyas Bozdemir. Tüm hakları saklıdır.
              </p>
            </div>
          </div>

          {/* Social Links & Navigation */}
          <div className="flex flex-wrap items-center gap-6 font-bold text-slate-600 dark:text-slate-400">
            <a
              href="https://github.com/ilyasbozdemir/temin-360-app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/ilyasbozdemir/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <LinkedinIcon className="w-3.5 h-3.5" />
              LinkedIn
            </a>
            <a
              href={webAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              Web Panel
            </a>
            <a
              href="https://github.com/ilyasbozdemir/temin-360-app/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Sürümler (Releases)
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
