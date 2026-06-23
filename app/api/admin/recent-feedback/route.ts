import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const rows = db
      .prepare(`
        SELECT
          id,
          question,
          answer,
          feedback_type,
          language,
          citations,
          conversation_id,
          created_at
        FROM feedback
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