import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { default: db } = await import("@/lib/db");

    const rows = db
      .prepare(`
        SELECT
          id,
          question,
          answer,
          language,
          citations,
          topic,
          response_time_ms,
          conversation_id,
          created_at
        FROM questions
        WHERE date(created_at) = date('now', 'localtime')
        ORDER BY datetime(created_at) DESC
        LIMIT 20
      `)
      .all()
      .map((row: any) => ({
        ...row,
        citations: row.citations ? JSON.parse(row.citations) : [],
      }));

    return NextResponse.json({ items: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
