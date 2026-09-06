import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { getMetrics, recordRequest } from "@/lib/metrics";
import fs from "fs";
import path from "path";

export async function GET() {
  const startTime = Date.now();
  try {
    const db = getDatabase();
    const dbPath = path.join(process.cwd(), "temin360_web.db");
    
    let fileSize = "0 KB";
    try {
      if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        fileSize = stats.size > 1024 * 1024 
          ? `${(stats.size / (1024 * 1024)).toFixed(2)} MB`
          : `${(stats.size / 1024).toFixed(1)} KB`;
      }
    } catch {
      fileSize = "N/A";
    }

    // Query tables and row counts dynamically from SQLite
    const tablesQuery = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
      .all() as { name: string }[];

    const tables = tablesQuery.map((t) => {
      let count = 0;
      try {
        const row = db.prepare(`SELECT COUNT(*) as count FROM "${t.name}"`).get() as { count: number };
        count = row?.count || 0;
      } catch {
        count = 0;
      }

      // Turkish descriptions for well known tables
      const descriptions: Record<string, string> = {
        dosyalar: "İhale ve doğrudan temin dosya kayıtları ve genel ayarları.",
        sablonlar: "Dosyalara bağlı dinamik evrak ve şablon snapshot verileri.",
        firmalar: "Piyasa fiyat araştırması yapılan yüklenici/davetli firmalar.",
        malzemeler: "Yaklaşık maliyet cetvelindeki malzeme ve hizmet kalemleri.",
        harcama_yetkilileri: "Yetkili harcama ve gerçekleştirme görevlisi tanımları.",
        settings: "Sistem, kurum bilgileri ve veritabanı şema ayarları.",
        audit_logs: "Sistemde gerçekleşen tüm veri işlem ve değişiklik kayıtları.",
        teklifler: "Firmalar tarafından verilen fiyat teklif dökümleri.",
      };

      return {
        name: t.name,
        records: count,
        desc: descriptions[t.name] || `${t.name} tablosu canlı veri kayıtları.`,
      };
    });

    // Schema version
    let schemaVersion = "1.0.0";
    try {
      const verRow = db.prepare("SELECT value FROM settings WHERE key = 'dbSchemaVersion'").get() as { value: string };
      if (verRow) schemaVersion = verRow.value;
    } catch {
      // ignore
    }

    const metrics = getMetrics();
    const duration = Date.now() - startTime;
    recordRequest("GET", "/api/stats", 200, duration);

    return NextResponse.json({
      success: true,
      database: {
        status: "connected",
        fileSize,
        schemaVersion,
        tableCount: tables.length,
        tables,
      },
      metrics: {
        totalRequests: metrics.totalRequests,
        avgResponseTime: metrics.avgDuration || Math.max(duration, 4),
        recentLogs: metrics.recentLogs,
      },
      server: {
        uptime: Math.floor(process.uptime()),
        memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Failed to fetch live stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

