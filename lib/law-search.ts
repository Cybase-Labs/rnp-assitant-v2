import fs from "fs";
import path from "path";

type LawArticle = {
  article_number: number;
  title_en?: string;
  title_rw?: string;
  title_fr?: string;
  content_en?: string;
  content_rw?: string;
  content_fr?: string;
  chapter?: string | null;
  section?: string | null;
  subsection?: string | null;
};

type LawJson = {
  law: {
    law_id: string;
    number: string;
    date: string;
    published: string;
    title_en?: string;
    title_rw?: string;
    title_fr?: string;
  };
  articles: LawArticle[];
};

export type RetrievedArticle = LawArticle & {
  score: number;
  matchedTerms: string[];
};

let cachedLaw: LawJson | null = null;

function loadLaw(): LawJson {
  if (cachedLaw) return cachedLaw;

  const filePath = path.join(process.cwd(), "data", "rwanda_traffic_law.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  cachedLaw = JSON.parse(raw) as LawJson;
  return cachedLaw;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractArticleNumber(query: string): number | null {
  const normalized = normalize(query);

  const patterns = [
    /article\s+(\d{1,3})/,
    /art\s+(\d{1,3})/,
    /ingingo\s+ya\s+(\d{1,3})/,
    /ingingo\s+(\d{1,3})/,
    /article\s+num[eé]ro\s+(\d{1,3})/,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) return Number(match[1]);
  }

  return null;
}

function tokenize(query: string): string[] {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "is",
    "are",
    "of",
    "for",
    "to",
    "and",
    "or",
    "what",
    "how",
    "when",
    "does",
    "do",
    "i",
    "me",
    "my",
    "we",
    "it",
    "this",
    "that",
    "ni",
    "ya",
    "ku",
    "mu",
    "kwa",
    "bya",
    "na",
    "de",
    "la",
    "le",
    "les",
    "des",
    "du",
    "et",
    "pour",
    "que",
  ]);

  return normalize(query)
    .split(" ")
    .filter((t) => t.length > 1 && !stopWords.has(t));
}

function expandTokens(tokens: string[]): string[] {
  const synonyms: Record<string, string[]> = {
    alcohol: ["bac", "drunk", "arukoro", "alcool"],
    drunk: ["alcohol", "bac", "arukoro", "alcool"],
    bac: ["alcohol", "drunk", "arukoro", "alcool"],
    arukoro: ["alcohol", "bac", "drunk", "alcool"],

    impound: ["impoundment", "pound", "gufunga", "fourriere"],
    impoundment: ["impound", "gufunga", "fourriere"],
    gufunga: ["impound", "impoundment", "immobilisation", "fourriere"],

    immobilisation: ["immobilize", "immobilization", "kubuza", "guhagarika"],
    immobilization: ["immobilisation", "kubuza", "guhagarika"],
    kubuza: ["immobilisation", "immobilization", "guhagarika"],
    guhagarika: ["kubuza", "immobilisation", "immobilization"],

    insurance: ["assurance", "ubwishingizi"],
    assurance: ["insurance", "ubwishingizi"],
    ubwishingizi: ["insurance", "assurance"],

    fine: ["amende", "ihazabu", "penalty"],
    amende: ["fine", "ihazabu", "penalty"],
    ihazabu: ["fine", "amende", "penalty"],

    licence: ["license", "permit", "uruhushya", "permis"],
    license: ["licence", "permit", "uruhushya", "permis"],
    permit: ["licence", "license", "uruhushya", "permis"],
    uruhushya: ["licence", "license", "permit", "permis"],

    appeal: ["appeals", "ubujurire", "recours"],
    ubujurire: ["appeal", "appeals", "recours"],

    inspection: ["technical", "control", "isuzuma"],
    isuzuma: ["inspection", "technical", "control"],
  };

  const expanded = new Set(tokens);
  for (const token of tokens) {
    const related = synonyms[token];
    if (related) {
      for (const s of related) expanded.add(s);
    }
  }
  return Array.from(expanded);
}

function articleText(article: LawArticle): string {
  return normalize([
    article.title_en,
    article.title_rw,
    article.title_fr,
    article.content_en,
    article.content_rw,
    article.content_fr,
  ]
    .filter(Boolean)
    .join(" "));
}

function scoreArticle(article: LawArticle, query: string): RetrievedArticle {
  const normalizedQuery = normalize(query);
  const tokens = expandTokens(tokenize(query));
  const text = articleText(article);

  let score = 0;
  const matchedTerms: string[] = [];

  const requestedArticle = extractArticleNumber(query);
  if (requestedArticle !== null && article.article_number === requestedArticle) {
    score += 1000;
    matchedTerms.push(`article:${requestedArticle}`);
  }

  // Phrase boosts
  const phraseChecks = [
    { phrase: "blood alcohol", boost: 60 },
    { phrase: "alcohol limit", boost: 60 },
    { phrase: "driving licence", boost: 50 },
    { phrase: "technical inspection", boost: 50 },
    { phrase: "administrative fine", boost: 50 },
    { phrase: "road safety", boost: 30 },
  ];

  for (const item of phraseChecks) {
    if (normalizedQuery.includes(item.phrase) && text.includes(item.phrase)) {
      score += item.boost;
      matchedTerms.push(item.phrase);
    }
  }

  // Token scoring
  for (const token of tokens) {
    if (!token) continue;

    const titleText = normalize(
      [article.title_en, article.title_rw, article.title_fr].filter(Boolean).join(" ")
    );

    if (titleText.includes(token)) {
      score += 25;
      matchedTerms.push(token);
    } else if (text.includes(token)) {
      score += 10;
      matchedTerms.push(token);
    }
  }

  // Slight boosts for known important articles
  if (
    ["alcohol", "bac", "arukoro", "drunk"].some((t) => normalizedQuery.includes(t)) &&
    [9, 10, 37, 38].includes(article.article_number)
  ) {
    score += 25;
  }

  if (
    ["immobil", "kubuza", "guhagarika", "insurance", "ubwishingizi"].some((t) =>
      normalizedQuery.includes(t)
    ) &&
    [11, 12, 13, 16].includes(article.article_number)
  ) {
    score += 25;
  }

  if (
    ["impound", "gufunga", "fourriere"].some((t) => normalizedQuery.includes(t)) &&
    [17, 18, 19, 20, 21, 22].includes(article.article_number)
  ) {
    score += 25;
  }

  return {
    ...article,
    score,
    matchedTerms: Array.from(new Set(matchedTerms)),
  };
}

export function findRelevantArticles(query: string, limit = 4): RetrievedArticle[] {
  const law = loadLaw();
  const scored = law.articles
    .map((article) => scoreArticle(article, query))
    .filter((article) => article.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}

export function formatArticlesForPrompt(articles: RetrievedArticle[]): string {
  if (!articles.length) return "No matching articles were found.";

  return articles
    .map((article) => {
      return [
        `Article ${article.article_number}`,
        article.title_en ? `Title (EN): ${article.title_en}` : null,
        article.title_rw ? `Title (RW): ${article.title_rw}` : null,
        article.title_fr ? `Title (FR): ${article.title_fr}` : null,
        article.content_en ? `Content (EN): ${article.content_en}` : null,
        article.content_rw ? `Content (RW): ${article.content_rw}` : null,
        article.content_fr ? `Content (FR): ${article.content_fr}` : null,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n---\n\n");
}

export function getLawMetadata() {
  const law = loadLaw();
  return law.law;
}