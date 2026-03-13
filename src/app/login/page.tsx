"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRaw = searchParams.get("next") ?? "";
  const nextPath =
    nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "";

  const [name, setName] = useState("dispatcher");
  const [password, setPassword] = useState("disp123");
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, password }),
    });
    const t = await r.text();
    let j: { user?: { role: string }; error?: string } = {};
    try {
      if (t) j = JSON.parse(t);
    } catch {
      setErr("Ответ сервера не JSON (возможна ошибка БД).");
      return;
    }
    if (!r.ok) {
      setErr(j.error ?? `Ошибка ${r.status}`);
      return;
    }
    window.dispatchEvent(new Event("auth-changed"));
    if (nextPath) {
      router.push(nextPath);
      router.refresh();
      return;
    }
    if (j.user?.role === "dispatcher") router.push("/dispatcher");
    else router.push("/master");
    router.refresh();
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2";

  return (
    <div className="mx-auto max-w-md space-y-4 py-6 sm:py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold sm:text-xl">Вход</h1>
        <Link href="/" className="text-sm text-[var(--accent)] hover:underline">
          На главную
        </Link>
      </div>
      <p className="text-sm text-[var(--muted)]">
        Тест: dispatcher/disp123, master1/m1pass, master2/m2pass
      </p>
      {nextPath && (
        <p className="rounded-lg bg-[var(--nav)] px-3 py-2 text-sm text-[var(--muted)]">
          После входа откроется:{" "}
          <code className="text-[var(--foreground)]">{nextPath}</code>
        </p>
      )}
      <form
        onSubmit={onSubmit}
        className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5"
      >
        <div>
          <label className="block text-sm font-medium">Логин</label>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Пароль</label>
          <input
            type="password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {err && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            {err}
          </p>
        )}
        <button
          type="submit"
          className="w-full rounded-lg bg-[var(--accent)] py-2.5 font-medium text-white hover:opacity-90"
        >
          Войти
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <p className="py-8 text-center text-[var(--muted)]">Загрузка…</p>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
