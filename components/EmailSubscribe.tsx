"use client";

import { useEffect, useState } from "react";

type Status = "loading" | "unset" | "pending" | "verified";

export default function EmailSubscribe() {
  const [status, setStatus] = useState<Status>("loading");
  const [email, setEmail] = useState("");
  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data: { email: string | null; verified: boolean }) => {
        setSavedEmail(data.email);
        if (!data.email) setStatus("unset");
        else if (data.verified) setStatus("verified");
        else setStatus("pending");
      })
      .catch(() => setStatus("unset"));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSavedEmail(email);
      setStatus("pending");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") return null;

  if (status === "verified") {
    return (
      <div className="rounded-xl border border-green-300 bg-green-50 p-3 text-sm text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100">
        ✅ メール通知 有効（{savedEmail}）
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-100">
        📩 {savedEmail} に確認メールを送信しました。メール内のリンクをクリックすると通知が有効になります。
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 rounded-xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-black/20"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="メールアドレスで通知を受け取る"
        className="min-w-0 flex-1 rounded-lg border border-black/15 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
      />
      <button
        type="submit"
        disabled={submitting}
        className="shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        登録
      </button>
    </form>
  );
}
