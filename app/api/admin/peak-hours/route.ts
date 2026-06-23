import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { default: db } = await import("@/lib/db");

    const rows = db
      .prepare(`
        SELECT
          CAST(strftime('%H', datetime(created_at, 'localtime')) AS INTEGER) as hour,
          COUNT(*) as count
        FROM questions
        GROUP BY hour
        ORDER BY hour ASC
      `)
      .all() as { hour: number; count: number }[];

    const items = Array.from({ length: 24 }, (_, hour) => {
      const found = rows.find((row) => row.hour === hour);
      return {
        hour,
        count: found?.count ?? 0,
      };
    });

    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
