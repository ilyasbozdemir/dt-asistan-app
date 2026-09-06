import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { recordRequest } from "@/lib/metrics";

// In-memory / initial registered API keys with expiration and scopes
interface ApiKeyInfo {
  id: string;
  key: string;
  name: string;
  createdAt: string;
  lastUsedAt?: string;
  scope: "read" | "write" | "admin";
}

const activeKeys: ApiKeyInfo[] = [
  {
    id: "key-default-01",
    key: "dta_live_8e4a90f1b2c3d4e59071f",
    name: "Masaüstü İstemci (Varsayılan)",
    createdAt: new Date().toISOString(),
    scope: "admin",
  },
  {
    id: "key-demo-02",
    key: "dta_demo_key_77a90f23b1",
    name: "Web Demo Entegrasyon Anahtarı",
    createdAt: new Date().toISOString(),
    scope: "write",
  },
];

export async function GET() {
  const startTime = Date.now();
  const duration = Math.max(Date.now() - startTime, 2);
  recordRequest("GET", "/api/keys", 200, duration);

  return NextResponse.json({
    success: true,
    keys: activeKeys.map((k) => ({
      id: k.id,
      name: k.name,
      maskedKey: `${k.key.substring(0, 10)}...${k.key.slice(-4)}`,
      rawKey: k.key,
      scope: k.scope,
      createdAt: k.createdAt,
      lastUsedAt: k.lastUsedAt || "Henüz kullanılmadı",
    })),
  });
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json().catch(() => ({}));
    const keyName = body.name || `Masaüstü İstemci (${new Date().toLocaleDateString("tr-TR")})`;
    const scope = body.scope || "admin";

    const randomBytes = crypto.randomBytes(16).toString("hex");
    const generatedKey = `dta_live_${randomBytes}`;

    const newKeyInfo: ApiKeyInfo = {
      id: `key-${Date.now()}`,
      key: generatedKey,
      name: keyName,
      createdAt: new Date().toISOString(),
      scope: scope as "read" | "write" | "admin",
    };

    activeKeys.unshift(newKeyInfo);

    const duration = Math.max(Date.now() - startTime, 4);
    recordRequest("POST", "/api/keys", 200, duration);

    return NextResponse.json({
      success: true,
      message: "Yeni API Anahtarı başarıyla oluşturuldu.",
      key: newKeyInfo,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Anahtar üretilemedi";
    const duration = Math.max(Date.now() - startTime, 4);
    recordRequest("POST", "/api/keys", 500, duration);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
