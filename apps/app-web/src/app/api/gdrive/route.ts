import { NextRequest, NextResponse } from "next/server";
import { recordRequest } from "@/lib/metrics";

// GET /api/gdrive - List Google Drive backup files
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "") ||
      req.nextUrl.searchParams.get("token");

    if (!token) {
      recordRequest("GET", "/api/gdrive", 401, 2);
      return NextResponse.json(
        { success: false, error: "Google Drive Access Token gereklidir." },
        { status: 401 },
      );
    }

    const query = encodeURIComponent(
      "trashed = false and (name contains '.dtal' or name contains '.db')",
    );
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,size,modifiedTime,createdTime)&orderBy=modifiedTime%20desc`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const duration = Math.max(Date.now() - startTime, 15);
    recordRequest("GET", "/api/gdrive", res.status, duration);

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        {
          success: false,
          error: `Google Drive API Hatası (${res.status}): ${errText}`,
        },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json({ success: true, files: data.files || [] });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Bilinmeyen hata";
    const duration = Math.max(Date.now() - startTime, 15);
    recordRequest("GET", "/api/gdrive", 500, duration);
    return NextResponse.json({ success: false, error: msg }, {
      status: 500,
    });
  }
}

// POST /api/gdrive - Upload workspace file to Google Drive
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      recordRequest("POST", "/api/gdrive", 401, 2);
      return NextResponse.json(
        { success: false, error: "Google Drive Access Token gereklidir." },
        { status: 401 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      recordRequest("POST", "/api/gdrive", 400, 2);
      return NextResponse.json({
        success: false,
        error: "Yüklenecek dosya bulunamadı.",
      }, { status: 400 });
    }

    const fileName = file.name || "workspace_backup.dtal";
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const boundary = "--------------------------" + Date.now().toString(16);
    const metadata = JSON.stringify({
      name: fileName,
      description: "TEMİN 360 Web Çalışma Dosyası Yedeği",
    });

    const metadataPart =
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`;
    const fileHeaderPart =
      `--${boundary}\r\nContent-Type: application/octet-stream\r\n\r\n`;
    const closingPart = `\r\n--${boundary}--`;

    const multipartBody = Buffer.concat([
      Buffer.from(metadataPart, "utf-8"),
      Buffer.from(fileHeaderPart, "utf-8"),
      fileBuffer,
      Buffer.from(closingPart, "utf-8"),
    ]);

    const res = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body: multipartBody,
      },
    );

    const duration = Math.max(Date.now() - startTime, 25);
    recordRequest("POST", "/api/gdrive", res.status, duration);

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        {
          success: false,
          error: `Google Drive API Yükleme Hatası (${res.status}): ${errText}`,
        },
        { status: res.status },
      );
    }

    const uploadedFile = await res.json();
    return NextResponse.json({
      success: true,
      message: `${fileName} Google Drive hesabınıza başarıyla yüklendi.`,
      fileId: uploadedFile.id,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Bilinmeyen hata";
    const duration = Math.max(Date.now() - startTime, 25);
    recordRequest("POST", "/api/gdrive", 500, duration);
    return NextResponse.json({ success: false, error: msg }, {
      status: 500,
    });
  }
}
