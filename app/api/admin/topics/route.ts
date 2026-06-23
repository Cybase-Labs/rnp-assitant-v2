import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { default: db } = await import("@/lib/db");

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
