type Stats = {
  totalQuestions: number;
  todayQuestions: number;
  conversations: number;
  satisfaction: number;
  helpful: number;
  notHelpful: number;
};

type LanguageItem = {
  language: string;
  count: number;
  percentage: number;
};

type PeakHourItem = {
  hour: number;
  count: number;
};

type TopicItem = {
  topic: string;
  count: number;
};

type FeedbackItem = {
  id: number;
  question: string;
  answer: string | null;
  feedback_type: "up" | "down";
  language: string | null;
  citations: number[] | { article_number: number }[];
  conversation_id: string | null;
  created_at: string;
};

type TodayQuestionItem = {
  id: number;
  question: string;
  answer: string | null;
  language: string | null;
  citations: number[] | { article_number: number }[];
  topic: string | null;
  response_time_ms: number | null;
  conversation_id: string | null;
  created_at: string;
};

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "http://localhost:3000"
  );
}

async function getStats(): Promise<Stats> {
  const res = await fetch(`${getBaseUrl()}/api/admin/stats`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return {
      totalQuestions: 0,
      todayQuestions: 0,
      conversations: 0,
      satisfaction: 0,
      helpful: 0,
      notHelpful: 0,
    };
  }

  return res.json();
}

async function getLanguages(): Promise<LanguageItem[]> {
  const res = await fetch(`${getBaseUrl()}/api/admin/languages`, {
    cache: "no-store",
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.items ?? [];
}

async function getPeakHours(): Promise<PeakHourItem[]> {
  const res = await fetch(`${getBaseUrl()}/api/admin/peak-hours`, {
    cache: "no-store",
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.items ?? [];
}

async function getTopics(): Promise<TopicItem[]> {
  const res = await fetch(`${getBaseUrl()}/api/admin/topics`, {
    cache: "no-store",
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.items ?? [];
}

async function getRecentFeedback(): Promise<FeedbackItem[]> {
  const res = await fetch(`${getBaseUrl()}/api/admin/recent-feedback`, {
    cache: "no-store",
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.items ?? [];
}

async function getTodayQuestions(): Promise<TodayQuestionItem[]> {
  const res = await fetch(`${getBaseUrl()}/api/admin/today-questions`, {
    cache: "no-store",
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.items ?? [];
}

function formatTime(value: string) {
  try {
    return new Date(value).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return value;
  }
}

function topicLabel(topic: string) {
  return topic.replace(/\b\w/g, (c) => c.toUpperCase());
}

function languageBadgeClass(language: string) {
  if (language === "RW")
    return "bg-yellow-500/15 text-yellow-300 border-yellow-500/20";
  if (language === "EN")
    return "bg-blue-500/15 text-blue-300 border-blue-500/20";
  if (language === "FR")
    return "bg-green-500/15 text-green-300 border-green-500/20";
  return "bg-white/5 text-white/45 border-white/10";
}

export default async function AdminPage() {
  const [stats, languages, peakHours, topics, recentFeedback, todayQuestions] =
    await Promise.all([
      getStats(),
      getLanguages(),
      getPeakHours(),
      getTopics(),
      getRecentFeedback(),
      getTodayQuestions(),
    ]);

  const maxPeakCount = Math.max(...peakHours.map((item) => item.count), 1);
  const maxTopicCount = Math.max(...topics.map((item) => item.count), 1);

  return (
    <main className="min-h-screen bg-[#07111b] px-4 py-6 text-white md:px-6 md:py-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-full bg-white/10 p-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#07111b] text-sm font-bold">
              📊
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">
              Analytics Dashboard
            </h1>
            <p className="mt-1 text-sm text-white/55">Last 30 days</p>
          </div>
        </div>

        {/* Top cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-[#071727] p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">
              Total Questions
            </p>
            <h2 className="mt-2 text-4xl font-bold">{stats.totalQuestions}</h2>
            <p className="mt-2 text-xs text-white/35">30 day period</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#071727] p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">
              Today
            </p>
            <h2 className="mt-2 text-4xl font-bold">{stats.todayQuestions}</h2>
            <p className="mt-2 text-xs text-white/35">questions today</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#071727] p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">
              Conversations
            </p>
            <h2 className="mt-2 text-4xl font-bold">{stats.conversations}</h2>
            <p className="mt-2 text-xs text-white/35">total sessions</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#071727] p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">
              Satisfaction
            </p>
            <h2 className="mt-2 text-4xl font-bold">{stats.satisfaction}%</h2>
            <p className="mt-2 text-xs text-white/35">
              👍 {stats.helpful} / 👎 {stats.notHelpful}
            </p>
          </div>
        </div>

        {/* Language distribution */}
        <section className="mb-8">
          <h3 className="mb-4 text-lg font-semibold">
            📊 Language Distribution
          </h3>
          <div className="flex flex-wrap gap-3">
            {languages.map((item) => (
              <div
                key={item.language}
                className={`rounded-xl border px-4 py-2 text-sm ${languageBadgeClass(item.language)}`}
              >
                {item.count} {item.language} ({item.percentage}%)
              </div>
            ))}
          </div>
        </section>

        {/* Peak hours */}
        <section className="mb-10">
          <h3 className="mb-4 text-lg font-semibold">⏰ Peak Hours (CAT)</h3>
          <div className="rounded-2xl border border-white/10 bg-[#071727] p-4">
            <div className="flex h-[160px] items-end gap-1 overflow-x-auto">
              {peakHours.map((item) => {
                const height =
                  item.count > 0 ? (item.count / maxPeakCount) * 120 : 2;
                return (
                  <div
                    key={item.hour}
                    className="flex min-w-[48px] flex-col items-center justify-end"
                  >
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-[#4b7ac7] to-[#7eb4f0]"
                      style={{ height }}
                    />
                    <span className="mt-2 text-[11px] text-white/40">
                      {item.hour}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Top topics */}
        <section className="mb-10">
          <h3 className="mb-4 text-lg font-semibold">🔥 Top Question Topics</h3>
          <div className="space-y-3">
            {topics.map((item) => (
              <div
                key={item.topic}
                className="grid grid-cols-[160px_1fr_40px] items-center gap-3"
              >
                <span className="text-sm text-white/70">{item.topic}</span>
                <div className="h-8 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#416db6] to-[#7eb4f0]"
                    style={{ width: `${(item.count / maxTopicCount) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-white/60">{item.count}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Feedback summary */}
        <section className="mb-10">
          <h3 className="mb-4 text-lg font-semibold">👍 Feedback</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-green-500/10 bg-green-500/5 p-6 text-center">
              <div className="text-4xl font-bold text-green-400">
                👍 {stats.helpful}
              </div>
              <div className="mt-2 text-sm text-white/50">Helpful</div>
            </div>

            <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-6 text-center">
              <div className="text-4xl font-bold text-red-400">
                👎 {stats.notHelpful}
              </div>
              <div className="mt-2 text-sm text-white/50">Not helpful</div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-lg font-semibold">Recent Feedback</h3>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#071727]">
                {recentFeedback.length === 0 ? (
                  <div className="p-6 text-sm text-white/60">
                    No feedback yet.
                  </div>
                ) : (
                  <div className="divide-y divide-white/10">
                    {recentFeedback.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-4 px-4 py-4 md:px-5"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="pt-0.5 text-lg">
                            {item.feedback_type === "up" ? "👍" : "👎"}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm text-white">
                              {item.question}
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/45">
                              {item.language ? (
                                <span>{item.language}</span>
                              ) : null}

                              {Array.isArray(item.citations) &&
                              item.citations.length > 0 ? (
                                <span>
                                  Articles:{" "}
                                  {item.citations
                                    .map((c: any) =>
                                      typeof c === "number"
                                        ? c
                                        : c.article_number,
                                    )
                                    .filter(Boolean)
                                    .join(", ")}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 text-xs text-white/35">
                          {formatTime(item.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">
                💬 Today&apos;s Questions
              </h3>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#071727]">
                {todayQuestions.length === 0 ? (
                  <div className="p-6 text-sm text-white/60">
                    No questions today.
                  </div>
                ) : (
                  <div className="divide-y divide-white/10">
                    {todayQuestions.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-4 px-4 py-4 md:px-5"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {item.language ? (
                              <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-white/50">
                                {item.language}
                              </span>
                            ) : null}

                            {item.topic ? (
                              <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-300">
                                {topicLabel(item.topic)}
                              </span>
                            ) : null}
                          </div>

                          <p className="mt-2 text-sm text-white">
                            {item.question}
                          </p>
                        </div>

                        <div className="shrink-0 text-xs text-white/35">
                          {formatTime(item.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Today's Questions */}
        <section></section>
      </div>
    </main>
  );
}
