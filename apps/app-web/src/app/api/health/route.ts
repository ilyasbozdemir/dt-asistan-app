import { NextResponse } from "next/server";
import { recordRequest } from "@/lib/metrics";

export async function GET() {
  const startTime = Date.now();
  const duration = Math.max(Date.now() - startTime, 2);
  recordRequest("GET", "/api/health", 200, duration);

  return NextResponse.json({
    status: "ok",
    version: "1.0.0-beta.90",
    message: "TEMİN 360 API Gateway & Senkronizasyon Sunucusu Aktif.",
    serverTime: new Date().toISOString(),
  });
}
