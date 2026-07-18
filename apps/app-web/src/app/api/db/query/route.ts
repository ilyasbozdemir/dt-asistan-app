import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sql, params = [], action } = body;

    if (!sql) {
      return NextResponse.json({
        success: false,
        error: "SQL query string is required.",
      }, { status: 400 });
    }

    const db = getDatabase();
    const stmt = db.prepare(sql);

    // Auto-detect action if not specified
    const isQuery = action === "query" || (!action && sql.trim().toLowerCase().startsWith("select"));

    if (isQuery) {
      const rows = stmt.all(...params);
      return NextResponse.json({
        success: true,
        data: rows,
      });
    } else {
      const info = stmt.run(...params);
      return NextResponse.json({
        success: true,
        lastInsertRowid: info.lastInsertRowid,
        changes: info.changes,
      });
    }
  } catch (error: any) {
    console.error("Database query execution failed:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
