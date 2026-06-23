"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Menu, Plus, Send, ThumbsDown, ThumbsUp } from "lucide-react";
import Image from "next/image";

type Role = "user" | "assistant";

type Message = {
  r: Role;
  c: string;
};

type Conversation = {
  id: string;
  t: string;
  m: Message[];
  ca: string;
};

type ThemeMode = "light" | "dark";

type Theme = {
  pg: string;
  o1: string;
  o2: string;
  sb: string;
  sbb: string;
  top: string;
  tx: string;
  sf: string;
  mu: string;
  cb: string;
  cbd: string;
  csh: string;
  ub: string;
  ut: string;
  ab: string;
  abd: string;
  at: string;
  ac: string;
  acs: string;
  yl: string;
  ib: string;
  ibd: string;
  ish: string;
  bl: string;
  rd: string;
  gn: string;
  ca: string;
  dt: string;
  ov: string;
  ft: string;
  gw: string;
  ob: string;
  os: string;
  tg: string;
  si: string;
  sid: string;
  sis: string;
};

type ApiChatResponse = {
  reply: string;
};

const STORAGE_KEYS = {
  convs: "rtla_convs",
  activeId: "rtla_aId",
  mode: "rtla_mode",
};

const suggestions = [
  { i: "🍺", t: "What is the blood alcohol limit?" },
  { i: "🚔", t: "Imodoka ifungwa ryari?" },
  { i: "📋", t: "Amende pour conduite sans permis ?" },
  { i: "⚖️", t: "How to appeal a traffic fine?" },
];

const TH: Record<ThemeMode, Theme> = {
  light: {
    pg: "linear-gradient(135deg,#e8edf5,#f0eff5 30%,#f5f0f0 60%,#f6f5f0)",
    o1: "radial-gradient(circle at 20% 20%,rgba(43,87,151,0.08),transparent 60%)",
    o2: "radial-gradient(circle at 80% 80%,rgba(180,130,80,0.06),transparent 60%)",
    sb: "rgba(255,255,255,0.85)",
    sbb: "rgba(43,87,151,0.08)",
    top: "rgba(255,255,255,0.7)",
    tx: "#1a2332",
    sf: "#4a5e73",
    mu: "#94a3b5",
    cb: "rgba(255,255,255,0.8)",
    cbd: "rgba(43,87,151,0.08)",
    csh: "0 2px 12px rgba(43,87,151,0.06)",
    ub: "linear-gradient(135deg,#2b5797,#1e4a8a,#1a3d75)",
    ut: "#fff",
    ab: "rgba(255,255,255,0.85)",
    abd: "rgba(43,87,151,0.08)",
    at: "#2d3e50",
    ac: "#2b5797",
    acs: "rgba(43,87,151,0.06)",
    yl: "#e8ae00",
    ib: "rgba(255,255,255,0.9)",
    ibd: "rgba(43,87,151,0.12)",
    ish: "0 2px 12px rgba(0,0,0,0.04)",
    bl: "#2b5797",
    rd: "#c9201a",
    gn: "#1a9e48",
    ca: "rgba(43,87,151,0.08)",
    dt: "#2b5797",
    ov: "rgba(15,24,33,0.25)",
    ft: "#a0aebb",
    gw: "radial-gradient(ellipse at 50% 35%,rgba(43,87,151,0.06),transparent 70%)",
    ob: "linear-gradient(135deg,rgba(43,87,151,0.08),rgba(255,255,255,0.9))",
    os: "0 8px 32px rgba(43,87,151,0.1)",
    tg: "#cdd5de",
    si: "rgba(255,242,0,0.12)",
    sid: "rgba(255,242,0,0.2)",
    sis: "rgba(180,160,0,0.4)",
  },
  dark: {
    pg: "linear-gradient(135deg,#0a1219,#0f1a28 30%,#121520 60%,#0d1118)",
    o1: "radial-gradient(circle at 20% 20%,rgba(43,87,151,0.12),transparent 60%)",
    o2: "radial-gradient(circle at 80% 80%,rgba(180,130,80,0.06),transparent 60%)",
    sb: "rgba(10,18,25,0.9)",
    sbb: "rgba(43,87,151,0.1)",
    top: "rgba(10,18,25,0.7)",
    tx: "#dce4ec",
    sf: "#7e96ab",
    mu: "#3d5468",
    cb: "rgba(43,87,151,0.06)",
    cbd: "rgba(43,87,151,0.1)",
    csh: "none",
    ub: "linear-gradient(135deg,#2b5797,#1a3a6b)",
    ut: "#e8f0f8",
    ab: "rgba(43,87,151,0.06)",
    abd: "rgba(43,87,151,0.1)",
    at: "#b0c4d8",
    ac: "#5b9bd5",
    acs: "rgba(43,87,151,0.1)",
    yl: "#fff200",
    ib: "rgba(43,87,151,0.04)",
    ibd: "rgba(43,87,151,0.1)",
    ish: "none",
    bl: "#fff200",
    rd: "#d9251c",
    gn: "#00c853",
    ca: "rgba(43,87,151,0.15)",
    dt: "#fff200",
    ov: "rgba(0,0,0,0.6)",
    ft: "#1e3348",
    gw: "radial-gradient(ellipse at 50% 35%,rgba(43,87,151,0.08),transparent 65%)",
    ob: "radial-gradient(circle at 35% 30%,#1a3652,#0a1219)",
    os: "0 0 50px rgba(43,87,151,0.2)",
    tg: "rgba(43,87,151,0.3)",
    si: "rgba(255,242,0,0.06)",
    sid: "rgba(255,242,0,0.1)",
    sis: "rgba(255,242,0,0.25)",
  },
};

function getDisclaimer(text: string) {
  const q = (text || "").toLowerCase();

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
  ];

  if (frenchHints.some((word) => q.includes(word))) {
    return "L’assistant juridique RNP utilise l’IA et peut se tromper. Veuillez vérifier les réponses.";
  }

  if (kinyarwandaHints.some((word) => q.includes(word))) {
    return "RNP Law Assistant ikoresha AI kandi ishobora kwibeshya. Nyamuneka genzura neza ibisubizo.";
  }

  return "RNP Law Assistant is AI and can make mistakes. Please double-check responses.";
}
async function submitFeedback(params: {
  question: string;
  answer: string;
  feedbackType: "up" | "down";
  conversationId?: string | null;
}) {
  try {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: params.question,
        answer: params.answer,
        feedbackType: params.feedbackType,
        conversationId: params.conversationId ?? null,
        language: null,
        citations: [],
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error || "Failed to submit feedback");
    }

    return true;
  } catch (error) {
    console.error("Feedback submission failed:", error);
    return false;
  }
}

function formatAssistant(text: string, color: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} style={{ color, fontWeight: 600 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function RoadTrafficAssistant() {
  const [mounted, setMounted] = useState(false);
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [input, setInput] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const theme = TH[mode];

  // const [feedbackState, setFeedbackState] = useState<{
  //   [key: number]: "up" | "down" | null;
  // }>({});
  const [feedbackState, setFeedbackState] = useState<
    Record<string, "up" | "down">
  >({});

  useEffect(() => {
    setMounted(true);

    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    try {
      const saved = localStorage.getItem(STORAGE_KEYS.convs);
      const savedId = localStorage.getItem(STORAGE_KEYS.activeId);
      const savedMode = localStorage.getItem(
        STORAGE_KEYS.mode,
      ) as ThemeMode | null;

      if (saved) {
        const parsed = JSON.parse(saved) as Conversation[];
        setConvs(Array.isArray(parsed) ? parsed : []);
      }

      if (savedId) setActiveId(savedId);
      if (savedMode === "light" || savedMode === "dark") setMode(savedMode);
    } catch {}
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    try {
      localStorage.setItem(
        STORAGE_KEYS.convs,
        JSON.stringify(convs.slice(0, 50)),
      );
      localStorage.setItem(STORAGE_KEYS.activeId, activeId ?? "");
      localStorage.setItem(STORAGE_KEYS.mode, mode);
    } catch {}
  }, [convs, activeId, mode, mounted]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [convs, loading, activeId]);

  const activeConversation = useMemo(
    () => convs.find((conversation) => conversation.id === activeId) ?? null,
    [convs, activeId],
  );

  const todayString = new Date().toDateString();
  const todayConversations = convs.filter(
    (conversation) => new Date(conversation.ca).toDateString() === todayString,
  );
  const previousConversations = convs.filter(
    (conversation) => new Date(conversation.ca).toDateString() !== todayString,
  );

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "☀️ Good morning";
    if (hour < 17) return "🌤️ Good afternoon";
    if (hour < 21) return "🌅 Good evening";
    return "🌙 Good evening";
  }, []);

  function updateConversation(
    id: string,
    updater: (conversation: Conversation) => Conversation,
  ) {
    setConvs((current) =>
      current.map((conversation) =>
        conversation.id === id ? updater(conversation) : conversation,
      ),
    );
  }

  function createNewConversation(firstMessage: string) {
    const id = String(Date.now());

    const conversation: Conversation = {
      id,
      t:
        firstMessage.length > 38
          ? `${firstMessage.slice(0, 38)}…`
          : firstMessage,
      m: [],
      ca: new Date().toISOString(),
    };

    setConvs((current) => [conversation, ...current]);
    setActiveId(id);

    return id;
  }

  async function sendMessage(prefilled?: string) {
    const text = (prefilled ?? input).trim();
    if (!text || loading) return;

    setInput("");

    const targetId = activeId ?? createNewConversation(text);

    const existingConversation = convs.find(
      (conversation) => conversation.id === targetId,
    );

    const history = existingConversation?.m ?? [];
    const nextMessages = [...history, { r: "user" as const, c: text }];

    updateConversation(targetId, (conversation) => ({
      ...conversation,
      t: conversation.m.length
        ? conversation.t
        : text.length > 38
          ? `${text.slice(0, 38)}…`
          : text,
      m: [...conversation.m, { r: "user", c: text }],
    }));

    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: targetId,
          messages: nextMessages.map((message) => ({
            role: message.r,
            content: message.c,
          })),
        }),
      });

      const raw = await response.text();
      let data: ApiChatResponse | { error?: string };

      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(`Invalid server response: ${raw.slice(0, 200)}`);
      }

      if (!response.ok) {
        throw new Error(
          "error" in data ? data.error || "Request failed" : "Request failed",
        );
      }

      if (!("reply" in data) || !data.reply) {
        throw new Error("Empty reply from server");
      }

      updateConversation(targetId, (conversation) => ({
        ...conversation,
        m: [...conversation.m, { r: "assistant", c: data.reply }],
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";

      updateConversation(targetId, (conversation) => ({
        ...conversation,
        m: [...conversation.m, { r: "assistant", c: `⚠️ ${message}` }],
      }));
    } finally {
      setLoading(false);
    }
  }

  function deleteConversation(id: string) {
    setConvs((current) =>
      current.filter((conversation) => conversation.id !== id),
    );

    if (activeId === id) setActiveId(null);
  }

  if (!mounted) return null;

  return (
    <div
      className="relative flex h-screen w-full overflow-hidden"
      style={{ background: theme.pg }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: theme.o1 }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: theme.o2 }}
      />

      {isMobile && sidebarOpen && (
        <button
          aria-label="Close sidebar overlay"
          className="absolute inset-0 z-30"
          style={{ background: theme.ov }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "z-40 flex h-full flex-col overflow-hidden border-r backdrop-blur-xl transition-all duration-300",
          sidebarOpen ? "w-[276px] md:w-[260px]" : "w-0 border-r-0",
          isMobile ? "absolute bottom-0 left-0 top-0" : "relative",
        )}
        style={{
          background: theme.sb,
          borderColor: sidebarOpen ? theme.sbb : "transparent",
          boxShadow:
            isMobile && sidebarOpen ? "6px 0 30px rgba(0,0,0,0.15)" : "none",
        }}
      >
        <div className="shrink-0 px-4 pb-2 pt-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 p-[3px] ring-1 ring-white/10">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white overflow-hidden">
                <Image
                  src="/images/rnp-logo.png"
                  alt="RNP Logo"
                  width={44}
                  height={44}
                  className="object-cover scale-150"
                />
              </div>
            </div>
            <div>
              <div
                className="text-[13px] font-semibold leading-tight"
                style={{ color: theme.tx }}
              >
                Rwanda National Police
              </div>
              <div
                className="text-[10px] font-medium"
                style={{ color: theme.ac }}
              >
                Road Traffic Law Assistant
              </div>
            </div>
          </div>

          <button
            className="flex w-full items-center gap-2 rounded-[10px] border px-3 py-2 text-left text-[12.5px] font-medium"
            style={{
              background: theme.acs,
              borderColor: theme.cbd,
              color: theme.ac,
            }}
            onClick={() => {
              setActiveId(null);
              if (isMobile) setSidebarOpen(false);
            }}
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>

        <div className="mx-4 h-px" style={{ background: theme.cbd }} />

        <div
          className="mx-4 mt-3 rounded-xl border px-3 py-2 text-[10px] leading-[1.4]"
          style={{
            background: theme.cb,
            borderColor: theme.cbd,
            color: theme.sf,
          }}
        >
          Live mode: this version calls a real Next.js API route.
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-3 pt-2">
          {!convs.length ? (
            <div
              className="px-2 py-8 text-center text-[11px]"
              style={{ color: theme.mu }}
            >
              No conversations yet
            </div>
          ) : (
            <>
              {!!todayConversations.length && (
                <>
                  <div
                    className="px-2 pb-1 pt-3 text-[9.5px] font-semibold uppercase tracking-[1.2px]"
                    style={{ color: theme.mu }}
                  >
                    Today
                  </div>

                  {todayConversations.map((conversation) => (
                    <ConversationRow
                      key={conversation.id}
                      conversation={conversation}
                      active={conversation.id === activeId}
                      theme={theme}
                      onOpen={() => {
                        setActiveId(conversation.id);
                        if (isMobile) setSidebarOpen(false);
                      }}
                      onDelete={() => deleteConversation(conversation.id)}
                    />
                  ))}
                </>
              )}

              {!!previousConversations.length && (
                <>
                  <div
                    className="px-2 pb-1 pt-4 text-[9.5px] font-semibold uppercase tracking-[1.2px]"
                    style={{ color: theme.mu }}
                  >
                    Previous
                  </div>

                  {previousConversations.map((conversation) => (
                    <ConversationRow
                      key={conversation.id}
                      conversation={conversation}
                      active={conversation.id === activeId}
                      theme={theme}
                      onOpen={() => {
                        setActiveId(conversation.id);
                        if (isMobile) setSidebarOpen(false);
                      }}
                      onDelete={() => deleteConversation(conversation.id)}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </div>

        <div
          className="flex shrink-0 items-center justify-between border-t px-4 py-3"
          style={{ borderColor: theme.cbd }}
        >
          <span
            className="text-[9px] tracking-[0.3px]"
            style={{ color: theme.ft }}
          >
            Service · Protection · Integrity
          </span>

          <ThemeToggle
            mode={mode}
            theme={theme}
            onToggle={() => setMode(mode === "light" ? "dark" : "light")}
          />
        </div>
      </aside>

      <main className="relative z-10 flex min-w-0 flex-1 flex-col">
        <div
          className="flex shrink-0 items-center justify-between border-b px-3 py-3 md:px-4"
          style={{ background: theme.top, borderColor: theme.cbd }}
        >
          <div className="flex items-center gap-3">
            <button
              className="p-1"
              onClick={() => setSidebarOpen((current) => !current)}
              style={{ color: theme.sf }}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex gap-[3.5px]">
              <span
                className="h-[4.5px] w-[4.5px] rounded-full"
                style={{ background: theme.rd }}
              />
              <span
                className="h-[4.5px] w-[4.5px] rounded-full"
                style={{ background: theme.yl }}
              />
              <span
                className="h-[4.5px] w-[4.5px] rounded-full"
                style={{ background: theme.gn }}
              />
            </div>

            <span className="text-xs" style={{ color: theme.mu }}>
              Law n° 014/2026
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className="h-[5px] w-[5px] rounded-full"
                style={{ background: theme.gn }}
              />
              <span className="text-[10px]" style={{ color: theme.mu }}>
                Live API
              </span>
            </div>

            <ThemeToggle
              mode={mode}
              theme={theme}
              onToggle={() => setMode(mode === "light" ? "dark" : "light")}
            />
          </div>
        </div>

        <section className="flex-1 overflow-y-auto">
          {!activeConversation?.m.length ? (
            <div className="relative flex h-full flex-col items-center justify-center gap-5 px-4 text-center md:px-6">
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: theme.gw }}
              />

              <div
                className="relative flex h-20 w-20 items-center justify-center rounded-full border"
                style={{
                  background: theme.ob,
                  boxShadow: theme.os,
                  borderColor: theme.cbd,
                }}
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold"
                  style={{
                    background: "linear-gradient(135deg,#2b5797,#0a1219)",
                    color: "#fff200",
                  }}
                >
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-white overflow-hidden">
                    <Image
                      src="/images/rnp-logo.png"
                      alt="RNP Logo"
                      width={100}
                      height={100}
                      className="object-cover scale-150"
                    />
                  </div>
                </div>
              </div>

              <div className="relative z-10">
                <p
                  className="mb-1 text-sm md:text-base"
                  style={{ color: theme.sf }}
                >
                  {greeting}
                </p>

                <h1
                  className="text-[23px] font-bold"
                  style={{ color: theme.tx }}
                >
                  Road Traffic Law Assistant
                </h1>

                <div className="my-2 flex justify-center gap-1">
                  <span className="h-[3px] w-[18px] rounded-full bg-[#2b5797]" />
                  <span
                    className="h-[3px] w-[18px] rounded-full"
                    style={{ background: theme.yl }}
                  />
                  <span
                    className="h-[3px] w-[18px] rounded-full"
                    style={{ background: theme.gn }}
                  />
                </div>

                <p
                  className="mx-auto max-w-[340px] text-[13px] leading-6"
                  style={{ color: theme.sf }}
                >
                  How can I help you today? Ask in Kinyarwanda, English, or
                  French.
                </p>
              </div>

              <div className="relative z-10 grid w-full max-w-[440px] grid-cols-1 gap-2 md:grid-cols-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.t}
                    onClick={() => void sendMessage(suggestion.t)}
                    className="flex items-start gap-3 rounded-xl border p-3 text-left text-[12.5px] leading-5"
                    style={{
                      background: theme.cb,
                      borderColor: theme.cbd,
                      color: theme.sf,
                      boxShadow: theme.csh,
                    }}
                  >
                    <span className="text-[17px]">{suggestion.i}</span>
                    <span>{suggestion.t}</span>
                  </button>
                ))}
              </div>

              <div
                className="relative z-10 text-[10px]"
                style={{ color: theme.mu }}
              >
                ⚖️ Informational tool only — not legal advice
              </div>
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-[740px] flex-col gap-4 px-3 py-4 md:px-6 md:py-5">
              {activeConversation.m.map((message, index) => (
                <div
                  key={`${message.r}-${index}`}
                  className={cn(
                    "flex gap-3",
                    message.r === "user" && "justify-end",
                  )}
                >
                  {message.r === "assistant" && (
                    <div
                      className="mt-0.5 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border text-[10px] font-bold"
                      style={{
                        background: "linear-gradient(135deg,#2b5797,#0a1219)",
                        color: "#fff200",
                        borderColor: theme.cbd,
                      }}
                    >
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-white overflow-hidden">
                        <Image
                          src="/images/rnp-logo.png"
                          alt="RNP Logo"
                          width={44}
                          height={44}
                          className="object-cover scale-150"
                        />
                      </div>
                    </div>
                  )}

                  <div className="max-w-[88%] md:max-w-[76%]">
                    <div
                      className="whitespace-pre-wrap break-words rounded-[18px] px-4 py-3 text-[13.5px] leading-7"
                      style={{
                        background: message.r === "user" ? theme.ub : theme.ab,
                        color: message.r === "user" ? theme.ut : theme.at,
                        border:
                          message.r === "assistant"
                            ? `1px solid ${theme.abd}`
                            : "none",
                        borderRadius:
                          message.r === "user"
                            ? "18px 18px 4px 18px"
                            : "18px 18px 18px 4px",
                        boxShadow:
                          message.r === "user"
                            ? "0 2px 12px rgba(43,87,151,0.12)"
                            : theme.csh,
                      }}
                    >
                      {message.r === "assistant"
                        ? formatAssistant(message.c, theme.bl)
                        : message.c}
                    </div>

                    {message.r === "assistant" && (
                      <div className="mt-2 flex items-center gap-2">
                        {(() => {
                          const feedbackKey = `${activeId || "no-conversation"}-${index}`;
                          const selected = feedbackState[feedbackKey];

                          return (
                            <>
                              <button
                                type="button"
                                className="flex items-center justify-center rounded-full p-2 transition-all duration-200"
                                style={{
                                  border: `1px solid ${theme.cbd}`,
                                  color:
                                    selected === "up" ? "#1a2332" : theme.mu,
                                  backgroundColor:
                                    selected === "up"
                                      ? "#fff200"
                                      : "transparent",
                                }}
                                onMouseEnter={(e) => {
                                  if (selected !== "up") {
                                    e.currentTarget.style.backgroundColor =
                                      "#fff200";
                                    e.currentTarget.style.color = "#1a2332";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (selected !== "up") {
                                    e.currentTarget.style.backgroundColor =
                                      "transparent";
                                    e.currentTarget.style.color = theme.mu;
                                  }
                                }}
                                onClick={async () => {
                                  const previousUserMessage =
                                    activeConversation?.m
                                      .slice(0, index)
                                      .reverse()
                                      .find((m) => m.r === "user");

                                  const ok = await submitFeedback({
                                    question: previousUserMessage?.c || "",
                                    answer: message.c,
                                    feedbackType: "up",
                                    conversationId: activeId,
                                  });

                                  if (ok) {
                                    setFeedbackState((prev) => ({
                                      ...prev,
                                      [feedbackKey]: "up",
                                    }));
                                  }
                                }}
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                className="flex items-center justify-center rounded-full p-2 transition-all duration-200"
                                style={{
                                  border: `1px solid ${theme.cbd}`,
                                  color:
                                    selected === "down" ? "#1a2332" : theme.mu,
                                  backgroundColor:
                                    selected === "down"
                                      ? "#fff200"
                                      : "transparent",
                                }}
                                onMouseEnter={(e) => {
                                  if (selected !== "down") {
                                    e.currentTarget.style.backgroundColor =
                                      "#fff200";
                                    e.currentTarget.style.color = "#1a2332";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (selected !== "down") {
                                    e.currentTarget.style.backgroundColor =
                                      "transparent";
                                    e.currentTarget.style.color = theme.mu;
                                  }
                                }}
                                onClick={async () => {
                                  const previousUserMessage =
                                    activeConversation?.m
                                      .slice(0, index)
                                      .reverse()
                                      .find((m) => m.r === "user");

                                  const ok = await submitFeedback({
                                    question: previousUserMessage?.c || "",
                                    answer: message.c,
                                    feedbackType: "down",
                                    conversationId: activeId,
                                  });

                                  if (ok) {
                                    setFeedbackState((prev) => ({
                                      ...prev,
                                      [feedbackKey]: "down",
                                    }));
                                  }
                                }}
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </button>

                              {selected ? (
                                <span
                                  className="ml-1 text-xs"
                                  style={{ color: theme.mu }}
                                >
                                  Thanks for the feedback
                                </span>
                              ) : null}
                            </>
                          );
                        })()}
                      </div>
                    )}
                    <div className="mt-2">
                      {feedbackState[index] ? (
                        <div
                          className="flex items-center gap-2 text-sm font-medium"
                          style={{ color: "#00c853" }}
                        >
                          Thanks for the feedback!
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          {/* 👍 button */}
                          {/* 👎 button */}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div
                    className="mt-0.5 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border text-[10px] font-bold"
                    style={{
                      background: "linear-gradient(135deg,#2b5797,#0a1219)",
                      color: "#fff200",
                      borderColor: theme.cbd,
                    }}
                  >
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-white overflow-hidden">
                      <Image
                        src="/images/rnp-logo.png"
                        alt="RNP Logo"
                        width={40}
                        height={40}
                        className="object-cover scale-150"
                      />
                    </div>
                  </div>

                  <div
                    className="flex gap-1.5 rounded-[18px] px-4 py-3"
                    style={{
                      background: theme.ab,
                      border: `1px solid ${theme.abd}`,
                    }}
                  >
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        className="h-1.5 w-1.5 animate-bounce rounded-full"
                        style={{
                          background: theme.dt,
                          animationDelay: `${dot * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </section>

        <div className="shrink-0 px-3 pb-3 pt-2 md:px-4 md:pb-4">
          <div
            className="mx-auto flex max-w-[700px] items-end rounded-[26px] border px-[18px] py-[5px] pr-[5px] backdrop-blur-xl"
            style={{
              background: theme.ib,
              borderColor: theme.ibd,
              boxShadow: theme.ish,
            }}
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              rows={1}
              placeholder="Ask anything..."
              className="min-h-[38px] max-h-[110px] flex-1 resize-none bg-transparent px-0 py-2.5 text-sm outline-none"
              style={{ color: theme.tx }}
            />

            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={!input.trim() || loading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all"
              style={{
                background: input.trim() && !loading ? "#fff200" : theme.si,
                border:
                  input.trim() && !loading ? "none" : `1px solid ${theme.sid}`,
                boxShadow:
                  input.trim() && !loading
                    ? "0 2px 10px rgba(255,242,0,0.3)"
                    : "none",
                opacity: input.trim() && !loading ? 1 : 0.5,
                transform: input.trim() && !loading ? "scale(1)" : "scale(0.9)",
              }}
            >
              <Send
                className="h-4 w-4"
                style={{
                  color: input.trim() && !loading ? "#1a2332" : theme.sis,
                }}
              />
            </button>
          </div>

          <p
            className="mx-auto mt-3 max-w-[700px] text-center text-[12px] leading-5"
            style={{ color: theme.mu }}
          >
            {getDisclaimer(
              activeConversation?.m
                ?.slice()
                .reverse()
                .find((message) => message.r === "user")?.c || "",
            )}
          </p>
        </div>
      </main>
    </div>
  );
}

function ConversationRow({
  conversation,
  active,
  theme,
  onOpen,
  onDelete,
}: {
  conversation: Conversation;
  active: boolean;
  theme: Theme;
  onOpen: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="mb-px flex cursor-pointer items-center justify-between gap-1.5 rounded-lg px-2.5 py-2"
      style={{
        background: active ? theme.ca : "transparent",
        borderLeft: `2.5px solid ${active ? theme.yl : "transparent"}`,
      }}
      onClick={onOpen}
    >
      <span
        className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[12.5px]"
        style={{
          color: active ? theme.tx : theme.sf,
          fontWeight: active ? 500 : 400,
        }}
      >
        {conversation.t}
      </span>

      <button
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
        className="px-1 text-xs opacity-30"
        style={{ color: theme.mu }}
      >
        ×
      </button>
    </div>
  );
}

function ThemeToggle({
  mode,
  theme,
  onToggle,
}: {
  mode: ThemeMode;
  theme: Theme;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="relative h-5 w-9 rounded-full"
      style={{ background: theme.tg }}
      aria-label="Toggle theme"
    >
      <span
        className="absolute top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] shadow"
        style={{ left: mode === "dark" ? 18 : 2 }}
      >
        {mode === "dark" ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
