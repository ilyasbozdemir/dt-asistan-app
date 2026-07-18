"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cpu,
  Database,
  Download,
  Eye,
  EyeOff,
  Key,
  LogOut,
  Menu,
  Moon,
  Play,
  RefreshCw,
  Shield,
  Smartphone,
  Sun,
  Terminal,
  User,
  X,
} from "lucide-react";

// Define interfaces for state
interface LogEntry {
  id: string;
  time: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  status: number;
  duration: number;
}

interface Endpoint {
  method: "GET" | "POST" | "PUT";
  path: string;
  description: string;
  requestBody?: string;
  responseBody: string;
}

export default function Home(): React.JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<
    "stats" | "docs" | "logs" | "sync" | "setup"
  >("stats");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Sidebar Collapse & Mobile Menu Drawer States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mock stats
  const [requestCount, setRequestCount] = useState(14890);
  const [avgResponseTime, setAvgResponseTime] = useState(38);
  const [syncProgress, setSyncProgress] = useState(100);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<number>(0);
  const [apiResponseText, setApiResponseText] = useState("");
  const [testingEndpoint, setTestingEndpoint] = useState(false);

  // GitHub Latest Release state
  const [latestRelease, setLatestRelease] = useState<{
    tag: string;
    size: string;
    date: string;
    url: string;
    downloadUrlExe: string;
    downloadUrlDmg: string;
  }>({
    tag: "v1.0.4-stable",
    size: "68.4 MB",
    date: "10.07.2026",
    url: "https://github.com/ilyasbozdemir/dt-asistan-app/releases",
    downloadUrlExe:
      "https://github.com/ilyasbozdemir/dt-asistan-app/releases/latest",
    downloadUrlDmg:
      "https://github.com/ilyasbozdemir/dt-asistan-app/releases/latest",
  });

  // Live Logs state
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "1",
      time: "17:45:02",
      method: "GET",
      path: "/api/sync",
      status: 200,
      duration: 42,
    },
    {
      id: "2",
      time: "17:45:15",
      method: "POST",
      path: "/api/presets",
      status: 201,
      duration: 15,
    },
    {
      id: "3",
      time: "17:45:32",
      method: "GET",
      path: "/api/documents",
      status: 200,
      duration: 28,
    },
    {
      id: "4",
      time: "17:46:01",
      method: "GET",
      path: "/api/sync/status",
      status: 200,
      duration: 10,
    },
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Initialize theme & load remember me credentials
  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as "dark" | "light") ||
      "dark";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");

    const savedRememberMe = localStorage.getItem("remember_me") === "true";
    setRememberMe(savedRememberMe);
    if (savedRememberMe) {
      const savedUser = localStorage.getItem("remembered_user") || "";
      const savedPass = localStorage.getItem("remembered_pass") || "";
      setUsername(savedUser);
      setPassword(savedPass);
      if (savedUser === "admin" && savedPass === "admin123") {
        setIsLoggedIn(true);
      }
    }
  }, []);

  // Fetch GitHub Latest Release dynamically
  useEffect(() => {
    fetch(
      "https://api.github.com/repos/ilyasbozdemir/dt-asistan-app/releases/latest",
    )
      .then((res) => res.json())
      .then((data) => {
        if (data && data.tag_name) {
          const exeAsset = data.assets?.find((a: any) =>
            a.name.endsWith(".exe")
          );
          const dmgAsset = data.assets?.find((a: any) =>
            a.name.endsWith(".dmg")
          );
          const mainAsset = exeAsset || dmgAsset || data.assets?.[0];
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
            downloadUrlExe: exeAsset?.browser_download_url ||
              data.html_url ||
              "https://github.com/ilyasbozdemir/dt-asistan-app/releases/latest",
            downloadUrlDmg: dmgAsset?.browser_download_url ||
              data.html_url ||
              "https://github.com/ilyasbozdemir/dt-asistan-app/releases/latest",
          });
        }
      })
      .catch((err) => {
        console.error("Failed to fetch github release:", err);
      });
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  // Auto-increment request count and add random logs in dashboard
  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(() => {
      setRequestCount((prev) => prev + Math.floor(Math.random() * 3) + 1);
      setAvgResponseTime((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = prev + delta;
        return next > 20 && next < 60 ? next : prev;
      });

      // Generate random log
      const paths = [
        "/api/sync",
        "/api/documents",
        "/api/presets",
        "/api/sync/status",
        "/api/auth/verify",
      ];
      const randomPath = paths[Math.floor(Math.random() * paths.length)];
      const randomMethod =
        randomPath.includes("preset") || randomPath.includes("verify")
          ? "POST"
          : "GET";
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];
      const newLog: LogEntry = {
        id: Date.now().toString(),
        time: timeStr,
        method: randomMethod,
        path: randomPath,
        status: Math.random() > 0.05 ? 200 : 500,
        duration: Math.floor(Math.random() * 50) + 12,
      };
      setLogs((prev) => [...prev.slice(-30), newLog]);
    }, 4000);

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Scroll terminal logs to bottom
  useEffect(() => {
    if (activeTab === "logs" && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, activeTab]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "admin123") {
      setIsLoggedIn(true);
      setLoginError("");
      if (rememberMe) {
        localStorage.setItem("remember_me", "true");
        localStorage.setItem("remembered_user", username);
        localStorage.setItem("remembered_pass", password);
      } else {
        localStorage.removeItem("remember_me");
        localStorage.removeItem("remembered_user");
        localStorage.removeItem("remembered_pass");
      }
    } else {
      setLoginError("Kullanıcı adı veya şifre hatalı!");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    if (!rememberMe) {
      setUsername("");
      setPassword("");
    }
  };

  const startSyncSimulation = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncProgress(0);

    const interval = setInterval(() => {
      setSyncProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSyncing(false);
          // Add custom log about sync finished
          const now = new Date();
          const timeStr = now.toTimeString().split(" ")[0];
          setLogs((prevLogs) => [
            ...prevLogs,
            {
              id: Date.now().toString(),
              time: timeStr,
              method: "GET",
              path: "/api/sync/complete",
              status: 200,
              duration: 420,
            },
          ]);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const endpoints: Endpoint[] = [
    {
      method: "GET",
      path: "/api/documents",
      description:
        "Aktif dosya süreçlerine bağlı tüm şablon ve belgelerin listesini döner.",
      responseBody: "",
    },
    {
      method: "POST",
      path: "/api/presets",
      description:
        "Yeni bir belge paketi taslağı oluşturur veya mevcutları listeler.",
      requestBody: JSON.stringify(
        {
          name: "Yeni Belge Paketi",
          docs: ["İhtiyaç Listesi", "Harcama Talimatı"],
        },
        null,
        2,
      ),
      responseBody: "",
    },
    {
      method: "GET",
      path: "/api/sync",
      description:
        "Masaüstü uygulaması ile sunucu veritabanı arasında çift yönlü senkronizasyonu tetikler.",
      responseBody: "",
    },
  ];

  const handleTestEndpoint = async () => {
    setTestingEndpoint(true);
    setApiResponseText("");
    try {
      const ep = endpoints[selectedEndpoint];
      const options: RequestInit = {
        method: ep.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer dta_token_9f83a2bcde7582506e",
        },
      };
      if (ep.method === "POST" && ep.requestBody) {
        options.body = ep.requestBody;
      }

      const res = await fetch(ep.path, options);
      const data = await res.json();
      setApiResponseText(JSON.stringify(data, null, 2));

      // Log the real request in terminal logs
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];
      setLogs((prevLogs) => [
        ...prevLogs,
        {
          id: Date.now().toString(),
          time: timeStr,
          method: ep.method as any,
          path: ep.path,
          status: res.status,
          duration: Math.floor(Math.random() * 20) + 10,
        },
      ]);
    } catch (err: any) {
      setApiResponseText(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setTestingEndpoint(false);
    }
  };

  // --- LOGIN SCREEN ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-955 text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center relative overflow-hidden font-sans transition-colors duration-300">
        {/* Theme Toggle in Login */}
        <div className="absolute top-6 right-6 z-25">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-855 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all cursor-pointer shadow-sm"
          >
            {theme === "dark"
              ? <Sun className="w-4 h-4" />
              : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Glow Effects (Dark Mode Only) */}
        <div className="hidden dark:block absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
        <div className="hidden dark:block absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md p-8 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-1 mb-2 bg-blue-500/5 dark:bg-blue-500/10 rounded-2xl border border-blue-500/20">
              <img
                src="/logo.png"
                alt="DT Asistan Logo"
                className="w-14 h-14 object-contain"
              />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-2">
              DT ASİSTAN{" "}
              <span className="text-xs bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                API GATEWAY
              </span>
            </h1>
            <p className="text-xs text-slate-505 dark:text-slate-400">
              Veri tabanı senkronizasyon ve şablon API entegrasyonu yönetim
              paneli.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-555">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-250 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 dark:text-white focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Şifre
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-555">
                  <Key className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-250 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white rounded-xl py-2.5 pl-10 pr-10 text-xs text-slate-800 dark:text-white focus:outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-slate-650 dark:text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-blue-600 bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-700 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs font-semibold">Beni Hatırla</span>
              </label>
            </div>

            {loginError && (
              <p className="text-xs text-rose-600 dark:text-rose-500 font-semibold bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 rounded-lg p-2 text-center">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 flex items-center justify-center gap-1.5 cursor-pointer mt-6"
            >
              Paneli Aç
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <span className="text-[10px] text-slate-455 dark:text-slate-500 font-medium">
              Varsayılan Test Girişi:{" "}
              <code className="text-slate-600 dark:text-slate-400">admin</code>
              {" "}
              /{" "}
              <code className="text-slate-600 dark:text-slate-400">
                admin123
              </code>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // --- API DASHBOARD SCREEN ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-855 dark:text-slate-100 flex flex-col font-sans antialiased relative overflow-hidden transition-colors duration-300">
      {/* Top Navbar */}
      <header className="bg-white/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-855 backdrop-blur-md px-4 md:px-6 py-3 flex items-center justify-between shrink-0 relative z-25">
        <div className="flex items-center gap-3">
          {/* Mobile Hamburg menu trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
          >
            {isMobileMenuOpen
              ? <X className="w-4 h-4" />
              : <Menu className="w-4 h-4" />}
          </button>

          <div className="p-0.5 bg-blue-500/5 dark:bg-blue-500/10 rounded-xl border border-blue-500/10 dark:border-blue-500/20">
            <img
              src="/logo.png"
              alt="DT Asistan Logo"
              className="w-8 h-8 md:w-9 md:h-9 object-contain"
            />
          </div>
          <div>
            <h1 className="text-xs md:text-sm font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              DT ASİSTAN{" "}
              <span className="text-[8px] md:text-[9px] bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-500/30 px-1.5 py-0.5 rounded-full font-bold">
                API GATEWAY
              </span>
            </h1>
            <p className="text-[9px] md:text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
              <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-emerald-500 animate-pulse">
              </span>
              Servis Aktif: mock_database_v1
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Theme Toggle inside App */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
            title={theme === "dark" ? "Açık Mod" : "Karanlık Mod"}
          >
            {theme === "dark"
              ? <Sun className="w-4 h-4" />
              : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-650 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer border border-slate-250 dark:border-slate-700/50"
            title="Oturumu Kapat"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 relative z-10">
        {/* Left Sidebar Menu (Desktop + Mobile drawer behavior) */}
        <aside
          className={`bg-slate-100/90 dark:bg-slate-900/95 md:bg-slate-100/50 md:dark:bg-slate-900/30 border-r border-slate-200 dark:border-slate-855 p-4 space-y-2 shrink-0 transition-all duration-350 ease-in-out md:translate-x-0 ${
            isSidebarCollapsed ? "md:w-20" : "md:w-64"
          } ${
            isMobileMenuOpen
              ? "translate-x-0 fixed inset-y-16 left-0 w-64 z-30 shadow-xl"
              : "-translate-x-full fixed inset-y-16 left-0 w-64 z-30 md:relative md:inset-auto md:w-auto"
          }`}
        >
          {/* Desktop Collapse / Expand Button */}
          <div className="hidden md:flex justify-end mb-4">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all cursor-pointer border border-slate-200 dark:border-slate-800"
              title={isSidebarCollapsed ? "Menüyü Genişlet" : "Menüyü Daralt"}
            >
              {isSidebarCollapsed
                ? <ChevronRight className="w-4 h-4" />
                : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={() => {
              setActiveTab("stats");
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              isSidebarCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3"
            } ${
              activeTab === "stats"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/10"
                : "text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-900/50"
            }`}
          >
            <Activity className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Sistem Durumu</span>}
          </button>

          <button
            onClick={() => {
              setActiveTab("docs");
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              isSidebarCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3"
            } ${
              activeTab === "docs"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/10"
                : "text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-900/50"
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>API Dokümantasyonu</span>}
          </button>

          <button
            onClick={() => {
              setActiveTab("logs");
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              isSidebarCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3"
            } ${
              activeTab === "logs"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/10"
                : "text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-900/50"
            }`}
          >
            <Terminal className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Canlı İstek Logları</span>}
          </button>

          <button
            onClick={() => {
              setActiveTab("sync");
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              isSidebarCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3"
            } ${
              activeTab === "sync"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/10"
                : "text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-900/50"
            }`}
          >
            <Database className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Veri Eşitleme (Sync)</span>}
          </button>

          <button
            onClick={() => {
              setActiveTab("setup");
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              isSidebarCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3"
            } ${
              activeTab === "setup"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/10"
                : "text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-900/50"
            }`}
          >
            <Cpu className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Masaüstü Entegrasyonu</span>}
          </button>
        </aside>

        {/* Mobile Menu Backdrop */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden fixed inset-0 bg-slate-950/45 backdrop-blur-xs z-15"
          />
        )}

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto min-h-0 bg-slate-50 dark:bg-slate-950/20">
          {/* TAB 1: SYSTEM HEALTH STATS */}
          {activeTab === "stats" && (
            <div className="space-y-6">
              <div className="text-left">
                <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                  Sistem Durumu
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  API gateway sunucunuzun canlı performans göstergeleri.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-855 p-5 rounded-2xl space-y-2 relative overflow-hidden shadow-xs">
                  <div className="absolute right-4 top-4 text-blue-500/10 dark:text-blue-500/20">
                    <Activity className="w-12 h-12" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider block">
                    Toplam İstek
                  </span>
                  <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                    {requestCount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">
                    ▲ Canlı Akış Aktif
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-855 p-5 rounded-2xl space-y-2 relative overflow-hidden shadow-xs">
                  <div className="absolute right-4 top-4 text-blue-500/10 dark:text-blue-500/20">
                    <Clock className="w-12 h-12" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider block">
                    Ort. Yanıt Süresi
                  </span>
                  <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                    {avgResponseTime}ms
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">
                    ● Mükemmel (200 OK)
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-855 p-5 rounded-2xl space-y-2 relative overflow-hidden shadow-xs">
                  <div className="absolute right-4 top-4 text-blue-500/10 dark:text-blue-500/20">
                    <Database className="w-12 h-12" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider block">
                    Veritabanı Durumu
                  </span>
                  <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                    {syncProgress === 100 ? "Hazır" : `%${syncProgress}`}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">
                    Bulut Veritabanı
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-855 p-5 rounded-2xl space-y-2 relative overflow-hidden shadow-xs">
                  <div className="absolute right-4 top-4 text-blue-500/10 dark:text-blue-500/20">
                    <Shield className="w-12 h-12" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider block">
                    Gateway Güvenliği
                  </span>
                  <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                    SSL / Active
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">
                    JWT Yetkilendirme
                  </span>
                </div>
              </div>

              {/* Request Performance Table */}
              <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-855 rounded-2xl p-4 md:p-5 space-y-4 text-left shadow-xs">
                <h3 className="text-xs font-bold text-slate-505 dark:text-slate-400 uppercase tracking-wider">
                  Son 10 API İsteği
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left min-w-[500px]">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-855 pb-2 text-slate-400 dark:text-slate-550 font-bold">
                        <th className="py-2">Tarih</th>
                        <th className="py-2">Metot</th>
                        <th className="py-2">İstek Yolu</th>
                        <th className="py-2">Durum</th>
                        <th className="py-2 text-right">Yanıt Süresi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850/50">
                      {logs
                        .slice(-10)
                        .reverse()
                        .map((l) => (
                          <tr
                            key={l.id}
                            className="text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-900/20"
                          >
                            <td className="py-2.5 font-medium text-slate-450 dark:text-slate-550">
                              {l.time}
                            </td>
                            <td className="py-2.5">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                                  l.method === "POST"
                                    ? "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
                                    : "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                                }`}
                              >
                                {l.method}
                              </span>
                            </td>
                            <td className="py-2.5 font-mono text-slate-800 dark:text-slate-355">
                              {l.path}
                            </td>
                            <td className="py-2.5">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                                  l.status === 200 || l.status === 201
                                    ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                                    : "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
                                }`}
                              >
                                {l.status}
                              </span>
                            </td>
                            <td className="py-2.5 text-right font-mono text-slate-650 dark:text-slate-455">
                              {l.duration}ms
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: API PLAYGROUND */}
          {activeTab === "docs" && (
            <div className="space-y-6">
              <div className="text-left">
                <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                  API Entegrasyon Dokümantasyonu
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Uygulamanız için geçerli olan API uçları ve canlı test modülü.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Endpoints list */}
                <div className="lg:col-span-1 space-y-2">
                  {endpoints.map((ep, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedEndpoint(idx);
                        setApiResponseText("");
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                        selectedEndpoint === idx
                          ? "bg-blue-600/5 dark:bg-blue-600/10 border-blue-400 dark:border-blue-505 text-slate-900 dark:text-white font-semibold"
                          : "bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-855 text-slate-550 dark:text-slate-400 hover:border-slate-350 dark:hover:border-slate-700 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[8px] font-black ${
                            ep.method === "POST"
                              ? "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-500/10 dark:border-indigo-500/30"
                              : "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/10 dark:border-blue-500/30"
                          }`}
                        >
                          {ep.method}
                        </span>
                        <code className="text-xs font-mono font-bold text-slate-700 dark:text-slate-355">
                          {ep.path}
                        </code>
                      </div>
                      <p className="text-[10px] text-slate-550 dark:text-slate-500 line-clamp-2 leading-relaxed">
                        {ep.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Tester panel */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-855 rounded-2xl p-4 md:p-5 space-y-4 flex flex-col text-left shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-850 pb-3">
                    <div>
                      <h3 className="text-xs font-bold text-slate-600 dark:text-slate-355 uppercase tracking-wider">
                        İstek Test Laboratuvarı
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Uç noktayı canlı olarak tetikleyin ve JSON cevabını
                        görün.
                      </p>
                    </div>
                    <button
                      onClick={handleTestEndpoint}
                      disabled={testingEndpoint}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer transition-all shadow-md shadow-blue-500/10"
                    >
                      {testingEndpoint
                        ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        : <Play className="w-3.5 h-3.5" />}
                      İstek Gönder
                    </button>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      İstek Adresi
                    </span>
                    <div className="bg-slate-100 dark:bg-slate-955 border border-slate-200 dark:border-slate-855 rounded-lg p-2.5 font-mono text-xs text-slate-700 dark:text-slate-300">
                      <span className="text-slate-450 dark:text-slate-500 font-bold">
                        http://localhost:3000
                      </span>
                      {endpoints[selectedEndpoint].path}
                    </div>
                  </div>

                  {endpoints[selectedEndpoint].requestBody && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Request Payload (JSON)
                      </span>
                      <pre className="bg-slate-100 dark:bg-slate-955 border border-slate-200 dark:border-slate-855 rounded-lg p-3 font-mono text-[10px] text-indigo-600 dark:text-indigo-300 overflow-x-auto max-h-32">
                        {endpoints[selectedEndpoint].requestBody}
                      </pre>
                    </div>
                  )}

                  <div className="flex-1 flex flex-col space-y-1 min-h-[160px]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Dönen Yanıt (Response)
                    </span>
                    <pre className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-[10px] text-emerald-400 overflow-auto max-h-60">
                      {testingEndpoint ? (
                        <span className="text-slate-550 italic">
                          İstek işleniyor...
                        </span>
                      ) : apiResponseText ? (
                        apiResponseText
                      ) : (
                        <span className="text-slate-500 italic">
                          Cevabı tetiklemek için sağ üstteki butona tıklayın.
                        </span>
                      )}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE TERMINAL LOGS */}
          {activeTab === "logs" && (
            <div className="space-y-4 h-full flex flex-col">
              <div className="shrink-0 text-left">
                <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                  Canlı İstek Logları
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  API gateway üzerinden geçen tüm HTTP trafik verisi gerçek
                  zamanlı listelenir.
                </p>
              </div>

              <div className="flex-1 bg-slate-900 dark:bg-slate-955 border border-slate-800 dark:border-slate-855 rounded-2xl p-4 font-mono text-xs text-slate-350 flex flex-col overflow-hidden min-h-[400px]">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-3 text-slate-500">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping">
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    gateway_terminal_stream.log
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-2 text-left">
                  {logs.map((l) => (
                    <div
                      key={l.id}
                      className="hover:bg-slate-800/40 py-0.5 px-1 rounded transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-505 font-bold text-[10px] shrink-0">
                          [{l.time}]
                        </span>
                        <span
                          className={`px-1 rounded text-[8px] font-black shrink-0 ${
                            l.method === "POST"
                              ? "bg-indigo-500/20 text-indigo-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {l.method}
                        </span>
                        <span className="text-slate-300 break-all">
                          {l.path}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 ml-4 sm:ml-0 self-start sm:self-center">
                        <span
                          className={`px-1 py-0.2 rounded text-[8px] font-black ${
                            l.status === 200 || l.status === 201
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-rose-500/20 text-rose-400"
                          }`}
                        >
                          {l.status}
                        </span>
                        <span className="text-slate-550 text-[10px] font-mono shrink-0">
                          {l.duration}ms
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DATABASE SYNC */}
          {activeTab === "sync" && (
            <div className="space-y-6">
              <div className="text-left">
                <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                  Veritabanı Eşitleme (Sync)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Bulut veritabanı şemasını sunucu arşivi ile eşitleyin.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sync status card */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-855 rounded-2xl p-5 space-y-4 text-left shadow-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Senkronizasyon Kontrolü
                  </span>

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20">
                      <CheckCircle className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Veri Durumu Güncel
                      </h4>
                      <p className="text-[10px] text-slate-505 mt-0.5">
                        En son senkronizasyon: 2 dk önce
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        Veritabanı Dosya Boyutu:
                      </span>
                      <span className="font-mono font-semibold text-slate-850 dark:text-slate-200">
                        12.4 MB
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-550 dark:text-slate-400">
                        Toplam Tablo Sayısı:
                      </span>
                      <span className="font-mono font-semibold text-slate-850 dark:text-slate-200">
                        8
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-550 dark:text-slate-400">
                        Son Değişen Tablo:
                      </span>
                      <span className="font-mono font-semibold text-slate-850 dark:text-slate-200">
                        DATA_DosyaSablonVeri
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={startSyncSimulation}
                    disabled={isSyncing}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${
                        isSyncing ? "animate-spin" : ""
                      }`}
                    />
                    {isSyncing
                      ? "Senkronize Ediliyor..."
                      : "Şimdi Senkronize Et"}
                  </button>

                  {isSyncing && (
                    <div className="space-y-1.5 pt-2 animate-in fade-in">
                      <div className="w-full bg-slate-200 dark:bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-300 dark:border-slate-855">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-100"
                          style={{ width: `${syncProgress}%` }}
                        >
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 block text-right">
                        Progress: {syncProgress}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Table schemes visualization */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-855 rounded-2xl p-5 space-y-4 text-left shadow-xs">
                  <div>
                    <h3 className="text-xs font-bold text-slate-650 dark:text-slate-355 uppercase tracking-wider">
                      Veritabanı Tablo Yapısı
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Uygulamanın aktif olarak kullandığı ana veri tabloları.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {[
                      {
                        name: "DATA_TeminDosyasi",
                        records: 48,
                        desc:
                          "İhale/Doğrudan Temin dosyaları genel ayarları ve meta verileri.",
                      },
                      {
                        name: "DATA_DosyaSablonVeri",
                        records: 120,
                        desc:
                          "Dosyalara özel oluşturulmuş dondurulmuş (snapshot) şablon girdi verileri.",
                      },
                      {
                        name: "DATA_Malzeme",
                        records: 342,
                        desc:
                          "Yaklaşık maliyet hesaplamaları için girilen malzeme kalem bilgileri.",
                      },
                      {
                        name: "DATA_Firma",
                        records: 86,
                        desc:
                          "Piyasa fiyat teklifi alınan davetli veya yüklenici firmaların listesi.",
                      },
                    ].map((tbl, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 rounded-xl flex items-center justify-between gap-3 text-left"
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0">
                            </span>
                            <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                              {tbl.name}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {tbl.desc}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-[10px] bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 text-slate-650 dark:text-slate-350 px-2 py-0.5 rounded font-mono font-bold shadow-2xs">
                            {tbl.records} Kayıt
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DESKTOP INTEGRATION & SETUP */}
          {activeTab === "setup" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-left">
                <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                  Masaüstü & Mobil Entegrasyonu
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  DT Asistan uygulamalarını indirin, kurun ve gateway sunucunuza
                  kolayca bağlayın.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Installation steps */}
                <div className="lg:col-span-2 space-y-4 text-left">
                  <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-855 rounded-2xl p-5 md:p-6 space-y-6 shadow-xs">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Adım Adım Kurulum Rehberi
                    </h3>

                    <div className="space-y-4">
                      {[
                        {
                          step: "1",
                          title: "Masaüstü Uygulamasını İndirin",
                          desc:
                            "Sağ tarafta bulunan indirme bağlantılarından bilgisayarınıza uygun olan versiyonu (.exe veya .dmg) indirin ve kurun.",
                        },
                        {
                          step: "2",
                          title: "Bulut Entegrasyonunu Aktifleştirin",
                          desc:
                            'Masaüstü uygulamasında **Ayarlar > Entegrasyon** sekmesine gidin ve "Bulut Veri Eşitleme" seçeneğini aktif konuma getirin.',
                        },
                        {
                          step: "3",
                          title: "Gateway Sunucu Bilgilerini Tanımlayın",
                          desc:
                            "Masaüstü uygulamasındaki Bulut Popover'ına Next.js sunucunuzun IP/alan adını ve yetkilendirme anahtarınızı girin.",
                        },
                        {
                          step: "4",
                          title: "Eşitlemeyi Başlatın",
                          desc:
                            "Masaüstündeki yerel veritabanınız anında Next.js API Gateway sunucunuz ile senkronize olacak ve verileri buluta aktaracaktır.",
                        },
                      ].map((s, idx) => (
                        <div key={idx} className="flex gap-4">
                          <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">
                            {s.step}
                          </span>
                          <div className="space-y-1">
                            <h4 className="text-xs font-black text-slate-850 dark:text-slate-200">
                              {s.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              {s.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Downloads & quick settings mock */}
                <div className="lg:col-span-1 space-y-4 text-left">
                  {/* Downloads Card */}
                  <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-855 rounded-2xl p-5 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        İndirme Kanalları
                      </span>
                      <a
                        href="https://github.com/ilyas-bozdemir/dt-desktop-app/releases"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-bold"
                      >
                        <svg
                          className="w-4 h-4 fill-current"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                          />
                        </svg>
                        GitHub
                      </a>
                    </div>

                    <div className="space-y-3">
                      <a
                        href={latestRelease.downloadUrlExe}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer text-center"
                      >
                        <Download className="w-4 h-4" />
                        Windows Installer (.exe) İndir
                      </a>

                      <a
                        href={latestRelease.downloadUrlDmg}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold border border-slate-250 dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                      >
                        <Download className="w-4 h-4" />
                        macOS Installer (.dmg) İndir
                      </a>

                      {/* Mobile APK Coming Soon */}
                      <div className="relative group border border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-955/20">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-5 h-5 text-slate-400" />
                          <div className="text-left">
                            <h5 className="text-[10px] font-bold text-slate-700 dark:text-slate-350">
                              Android & iOS Mobil
                            </h5>
                            <p className="text-[9px] text-slate-500">
                              Çok yakında mobil mağazalarda!
                            </p>
                          </div>
                        </div>
                        <span className="text-[8px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                          Yakında
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-slate-150 dark:border-slate-850 pt-3 text-[10px] text-slate-550 space-y-1">
                      <div className="flex justify-between">
                        <span>Latest Release (GitHub):</span>
                        <a
                          href={latestRelease.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-emerald-600 dark:text-emerald-400 font-mono hover:underline"
                        >
                          {latestRelease.tag}
                        </a>
                      </div>
                      <div>{"**Dosya Boyutu:** ~" + latestRelease.size}</div>
                      <div>{"**Yayınlanma:** " + latestRelease.date}</div>
                    </div>
                  </div>

                  {/* Settings JSON Card */}
                  <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-855 rounded-2xl p-5 space-y-3 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Masaüstü Görsel Ayarları (Önizleme)
                    </span>

                    <div className="space-y-2 border border-slate-200 dark:border-slate-800 p-3 rounded-xl bg-slate-50 dark:bg-slate-955 font-mono text-[9px] text-slate-550 dark:text-slate-400">
                      <div className="text-blue-500 dark:text-blue-400">
                        {"// desktop/settings.json"}
                      </div>
                      <div>{"{"}</div>
                      <div className="pl-4">{'"cloudSyncEnabled": true,'}</div>
                      <div className="pl-4">{'"syncIntervalMinutes": 10,'}</div>
                      <div className="pl-4">
                        {'"gatewayUrl": "http://localhost:3000",'}
                      </div>
                      <div className="pl-4">
                        {'"apiKey": "dta_key_8e4a90f..."'}
                      </div>
                      <div>{"}"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
