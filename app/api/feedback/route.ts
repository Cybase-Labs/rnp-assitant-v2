import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const question = String(body?.question ?? "").trim();
    const answer = String(body?.answer ?? "").trim();
    const feedbackType = String(body?.feedbackType ?? "").trim();
    const language = String(body?.language ?? "").trim();
    const conversationId = String(body?.conversationId ?? "").trim();
    const citations = Array.isArray(body?.citations) ? body.citations : [];

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    if (feedbackType !== "up" && feedbackType !== "down") {
      return NextResponse.json({ error: "Invalid feedback type" }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO feedback (
        question,
        answer,
        feedback_type,
        language,
        citations,
        conversation_id,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      question,
      answer || null,
      feedbackType,
      language || null,
      JSON.stringify(citations),
      conversationId || null,
      new Date().toISOString(),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}