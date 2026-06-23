import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const totalQuestionsRow = db
      .prepare(`SELECT COUNT(*) as count FROM questions`)
      .get() as { count: number };

    const todayQuestionsRow = db
      .prepare(`
        SELECT COUNT(*) as count
        FROM questions
        WHERE date(created_at) = date('now', 'localtime')
      `)
      .get() as { count: number };

    const conversationsRow = db
      .prepare(`
        SELECT COUNT(DISTINCT conversation_id) as count
        FROM questions
        WHERE conversation_id IS NOT NULL AND conversation_id != ''
      `)
      .get() as { count: number };

    const helpfulRow = db
      .prepare(`
        SELECT COUNT(*) as count
        FROM feedback
        WHERE feedback_type = 'up'
      `)
      .get() as { count: number };

    const notHelpfulRow = db
      .prepare(`
        SELECT COUNT(*) as count
        FROM feedback
        WHERE feedback_type = 'down'
      `)
      .get() as { count: number };

    const helpful = helpfulRow.count ?? 0;
    const notHelpful = notHelpfulRow.count ?? 0;
    const totalFeedback = helpful + notHelpful;

    const satisfaction =
      totalFeedback > 0 ? Number(((helpful / totalFeedback) * 100).toFixed(1)) : 0;

    return NextResponse.json({
      totalQuestions: totalQuestionsRow.count ?? 0,
      todayQuestions: todayQuestionsRow.count ?? 0,
      conversations: conversationsRow.count ?? 0,
      satisfaction,
      helpful,
      notHelpful,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}