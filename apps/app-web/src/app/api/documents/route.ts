import { NextResponse } from "next/server";

export async function GET() {
  const documents = [
    {
      id: 1,
      name: "HARCAMA TALİMATI",
      category: "1-ihtiyac-tespiti-ve-baslangic",
    },
    {
      id: 2,
      name: "LÜZUM MÜZEKKERESİ",
      category: "1-ihtiyac-tespiti-ve-baslangic",
    },
    {
      id: 3,
      name: "İHTİYAÇ LİSTESİ",
      category: "1-ihtiyac-tespiti-ve-baslangic",
    },
    {
      id: 4,
      name: "KOMİSYON GÖREVLENDİRME ONAYI",
      category: "1-ihtiyac-tespiti-ve-baslangic",
    },
    {
      id: 5,
      name: "SON ALIM FİYAT CETVELİ",
      category: "1-ihtiyac-tespiti-ve-baslangic",
    },
  ];

  return NextResponse.json({
    success: true,
    count: documents.length,
    data: documents,
    serverTime: new Date().toISOString(),
  });
}
