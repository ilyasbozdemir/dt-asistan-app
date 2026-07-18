import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    // simple token verification check if provided
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/, "");
      console.log(
        `[Sync] Request authorized with token: ${token.substring(0, 4)}...`,
      );
    }

    const body = await req.json();
    const { dosyalar = [], sablonlar = [], syncedAt } = body;

    console.log(
      `[Sync] Received synchronization package at ${syncedAt}. Files count: ${dosyalar.length}, Templates count: ${sablonlar.length}`,
    );

    // TODO: Connect Prisma/Drizzle here in next phase to upsert into PostgreSQL

    return NextResponse.json({
      success: true,
      message: "Senkronizasyon paketi başarıyla işlendi (Server-side Mock).",
      syncedCount: dosyalar.length + sablonlar.length,
      serverTime: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Sync Error]", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
