import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const rows = db
      .prepare(`
        SELECT
          COALESCE(NULLIF(topic, ''), 'other') as topic,
          COUNT(*) as count
        FROM questions
        GROUP BY COALESCE(NULLIF(topic, ''), 'other')
        ORDER BY count DESC
      `)
      .all() as { topic: string; count: number }[];

    return NextResponse.json({ items: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}