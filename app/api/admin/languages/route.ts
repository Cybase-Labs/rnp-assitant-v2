import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const rows = db
      .prepare(`
        SELECT
          COALESCE(NULLIF(UPPER(language), ''), 'UNKNOWN') as language,
          COUNT(*) as count
        FROM questions
        GROUP BY COALESCE(NULLIF(UPPER(language), ''), 'UNKNOWN')
        ORDER BY count DESC
      `)
      .all() as { language: string; count: number }[];

    const normalized = ["RW", "EN", "FR", "UNKNOWN"].map((lang) => {
      const found = rows.find((row) => row.language === lang);
      return {
        language: lang,
        count: found?.count ?? 0,
      };
    });

    const total = normalized.reduce((sum, item) => sum + item.count, 0);

    return NextResponse.json({
      items: normalized.map((item) => ({
        ...item,
        percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}