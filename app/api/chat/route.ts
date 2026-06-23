import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  findRelevantArticles,
  formatArticlesForPrompt,
  getLawMetadata,
} from "@/lib/law-search";
import db from "@/lib/db";

type IncomingMessage = {
  role: "user" | "assistant";
  content: string;
};

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function getLastUserMessage(messages: IncomingMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user" && messages[i].content.trim()) {
      return messages[i].content.trim();
    }
  }
  return "";
}

function detectLanguage(text: string): string {
  const q = text.toLowerCase();

  const frenchHints = [
    "bonjour",
    "comment",
    "pourquoi",
    "amende",
    "permis",
    "véhicule",
    "circulation",
    "loi",
    "français",
    "assurance",
  ];

  const kinyarwandaHints = [
    "amakuru",
    "bite",
    "bishoboka",
    "ingingo",
    "ikinyabiziga",
    "uruhushya",
    "ihazabu",
    "umuhanda",
    "kinyarwanda",
    "gufunga",
    "kubuza",
    "arukoro",
  ];

  if (frenchHints.some((word) => q.includes(word))) return "FR";
  if (kinyarwandaHints.some((word) => q.includes(word))) return "RW";
  return "EN";
}

function detectTopic(text: string): string {
  const q = text.toLowerCase();

  if (
    ["alcohol", "bac", "arukoro", "drunk", "alcool"].some((word) =>
      q.includes(word),
    )
  ) {
    return "alcohol bac";
  }

  if (
    ["fine", "amende", "ihazabu", "penalty", "penalties"].some((word) =>
      q.includes(word),
    )
  ) {
    return "fines penalties";
  }

  if (
    ["licence", "license", "permit", "uruhushya", "permis"].some((word) =>
      q.includes(word),
    )
  ) {
    return "driving licence";
  }

  if (
    [
      "impound",
      "impoundment",
      "gufunga",
      "immobilisation",
      "immobilization",
      "kubuza",
    ].some((word) => q.includes(word))
  ) {
    return "vehicle impoundment";
  }

  if (
    ["insurance", "assurance", "ubwishingizi"].some((word) =>
      q.includes(word),
    )
  ) {
    return "insurance";
  }

  return "other";
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const body = await req.json();
    const incomingMessages = Array.isArray(body?.messages) ? body.messages : [];

    const cleanMessages: IncomingMessage[] = incomingMessages
      .slice(-12)
      .map((message: IncomingMessage) => ({
        role: message?.role === "user" ? "user" : "assistant",
        content: String(message?.content ?? "").trim(),
      }))
      .filter((message: IncomingMessage) => message.content.length > 0);

    if (!cleanMessages.length) {
      return NextResponse.json(
        { error: "No valid messages provided" },
        { status: 400 },
      );
    }

    const userQuestion = getLastUserMessage(cleanMessages);
    if (!userQuestion) {
      return NextResponse.json(
        { error: "No user question found" },
        { status: 400 },
      );
    }

    const startedAt = Date.now();

    const law = getLawMetadata();
    const retrievedArticles = findRelevantArticles(userQuestion, 4);
    const retrievedContext = formatArticlesForPrompt(retrievedArticles);

    const systemPrompt = `
You are the "Road Traffic Law Assistant" for Rwanda National Police.

You must answer ONLY using the retrieved law context provided to you.
Do not invent article numbers, penalties, procedures, or legal details.
If the answer is not clearly supported by the retrieved context, say that clearly.
Prefer the user's language when possible (English, Kinyarwanda, or French).
Always mention the relevant article number(s) when supported by the context.
Always end with a short disclaimer that the response is informational only and not legal advice.

The law is:
- Law n° ${law.number}
- Date: ${law.date}
- Published: ${law.published}
- Title (EN): ${law.title_en ?? ""}
- Title (RW): ${law.title_rw ?? ""}
- Title (FR): ${law.title_fr ?? ""}
    `.trim();

    const conversationText = cleanMessages
      .slice(-8)
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    const userContent = `
Retrieved legal context:
${retrievedContext}

Conversation:
${conversationText}

Current user question:
${userQuestion}
    `.trim();

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 900,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userContent,
        },
      ],
    });

    const reply = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n\n")
      .trim();

    const finalReply = reply || "I could not generate a response.";
    const responseTimeMs = Date.now() - startedAt;
    const language = detectLanguage(userQuestion);
    const topic = detectTopic(userQuestion);

    const insertQuestion = db.prepare(`
      INSERT INTO questions (
        question,
        answer,
        language,
        citations,
        topic,
        response_time_ms,
        conversation_id,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertQuestion.run(
      userQuestion,
      finalReply,
      language,
      JSON.stringify(retrievedArticles.map((article) => article.article_number)),
      topic,
      responseTimeMs,
      body?.conversationId ? String(body.conversationId) : null,
      new Date().toISOString(),
    );

    return NextResponse.json({
      reply: finalReply,
      citations: retrievedArticles.map((article) => ({
        article_number: article.article_number,
        title_en: article.title_en ?? "",
        title_rw: article.title_rw ?? "",
        title_fr: article.title_fr ?? "",
      })),
      language,
      topic,
      responseTimeMs,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}