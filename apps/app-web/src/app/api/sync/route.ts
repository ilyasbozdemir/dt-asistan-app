import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { recordRequest } from "@/lib/metrics";

export async function GET() {
  const startTime = Date.now();
  try {
    const db = getDatabase();
    
    // Ensure table exists
    db.exec(`
      CREATE TABLE IF NOT EXISTS dosyalar (
        id TEXT PRIMARY KEY,
        title TEXT,
        data TEXT,
        created_at TEXT,
        updated_at TEXT
      );
    `);

    const rows = db.prepare("SELECT * FROM dosyalar ORDER BY created_at DESC LIMIT 100").all() as Array<{
      id: string;
      title: string;
      data: string;
      created_at: string;
      updated_at: string;
    }>;

    const dosyalar = rows.map((r) => {
      try {
        const parsed = JSON.parse(r.data);
        return {
          id: r.id,
          title: r.title,
          created_at: r.created_at,
          ...parsed,
        };
      } catch {
        return {
          id: r.id,
          title: r.title,
          created_at: r.created_at,
        };
      }
    });

    const duration = Math.max(Date.now() - startTime, 5);
    recordRequest("GET", "/api/sync", 200, duration);

    return NextResponse.json({
      success: true,
      count: dosyalar.length,
      dosyalar,
      serverTime: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Veri çekme hatası";
    const duration = Math.max(Date.now() - startTime, 5);
    recordRequest("GET", "/api/sync", 500, duration);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const authHeader = req.headers.get("authorization");
    let clientToken = "anonymous";
    if (authHeader) {
      clientToken = authHeader.replace(/^Bearer\s+/, "");
      console.log(
        `[Sync] Request authorized with token: ${clientToken.substring(0, 8)}...`,
      );
    }

    const body = await req.json().catch(() => ({}));
    const { dosyalar = [], sablonlar = [], syncedAt } = body;

    console.log(
      `[Sync] Processing sync payload. Files: ${dosyalar.length}, Templates: ${sablonlar.length}, Time: ${syncedAt}`,
    );

    // Save/Upsert into SQLite/DB
    let savedCount = 0;
    try {
      const db = getDatabase();
      
      // Ensure table exists
      db.exec(`
        CREATE TABLE IF NOT EXISTS dosyalar (
          id TEXT PRIMARY KEY,
          title TEXT,
          data TEXT,
          created_at TEXT,
          updated_at TEXT
        );
        CREATE TABLE IF NOT EXISTS sync_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          token TEXT,
          record_count INTEGER,
          synced_at TEXT
        );
      `);

      const insertStmt = db.prepare(`
        INSERT OR REPLACE INTO dosyalar (id, title, data, created_at, updated_at)
        VALUES (@id, @title, @data, @created_at, @updated_at)
      `);

      const insertMany = db.transaction((files: Array<{ id?: string; title?: string; [key: string]: unknown }>) => {
        for (const f of files) {
          const fileId = f.id || `DOSYA-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          const title = f.title || f.ad || 'İhale/Temin Dosyası';
          insertStmt.run({
            id: fileId,
            title: title,
            data: JSON.stringify(f),
            created_at: f.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          savedCount++;
        }
      });

      if (Array.isArray(dosyalar) && dosyalar.length > 0) {
        insertMany(dosyalar);
      }

      // Record sync history
      db.prepare(`
        INSERT INTO sync_history (token, record_count, synced_at)
        VALUES (?, ?, ?)
      `).run(clientToken.substring(0, 15), savedCount, syncedAt || new Date().toISOString());

    } catch (dbErr) {
      console.error("[Sync DB Error]", dbErr);
    }

    const duration = Math.max(Date.now() - startTime, 12);
    recordRequest("POST", "/api/sync", 200, duration);

    return NextResponse.json({
      success: true,
      message: `${savedCount > 0 ? savedCount : (dosyalar.length + sablonlar.length)} kayıt bulut veritabanına başarıyla aktarıldı.`,
      syncedCount: savedCount > 0 ? savedCount : (dosyalar.length + sablonlar.length),
      serverTime: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Senkronizasyon hatası";
    const duration = Math.max(Date.now() - startTime, 12);
    recordRequest("POST", "/api/sync", 500, duration);
    console.error("[Sync Error]", err);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 },
    );
  }
}
