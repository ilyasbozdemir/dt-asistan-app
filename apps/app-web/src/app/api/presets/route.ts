import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name = "Varsayılan Paket", docs = [] } = body;

    return NextResponse.json({
      success: true,
      message: "Belge paketi sunucu şablon havuzuna başarıyla kaydedildi.",
      preset: {
        id: Math.floor(Math.random() * 1000000000).toString(),
        name,
        docs,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 },
    );
  }
}
