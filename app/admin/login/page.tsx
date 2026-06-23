"use client";

import { FormEvent, useState } from "react";

export default function AdminLoginPage() {
  const [keyValue, setKeyValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key: keyValue }),
    });

    const raw = await res.text();

    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error(`Server returned non-JSON response: ${raw.slice(0, 120)}`);
    }

    if (!res.ok) {
      throw new Error(data?.error || "Login failed");
    }

    window.location.href = "/admin";
  } catch (err) {
    setError(err instanceof Error ? err.message : "Login failed");
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07111b] px-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="mb-2 text-2xl font-bold">Admin Access</h1>
        <p className="mb-6 text-sm text-white/65">
          Enter the dashboard key to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={keyValue}
            onChange={(e) => setKeyValue(e.target.value)}
            placeholder="Enter admin key"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
          />

          {error ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={!keyValue.trim() || loading}
            className="w-full rounded-xl bg-[#fff200] px-4 py-3 text-sm font-semibold text-[#1a2332] transition disabled:opacity-50"
          >
            {loading ? "Checking..." : "Unlock Dashboard"}
          </button>
        </form>
      </div>
    </main>
  );
}