"use client";

import { useState } from "react";
import Link from "next/link";

export default function NewRequestPage() {
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [problemText, setProblemText] = useState("");
  const [done, setDone] = useState<number | null>(null);
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const r = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientName, phone, address, problemText }),
    });
    const t = await r.text();
    let j: { id?: number; error?: string } = {};
    try {
      if (t) j = JSON.parse(t);
    } catch {
      setErr("Сервер вернул не JSON");
      return;
    }
    if (!r.ok) {
      setErr(j.error ?? `Ошибка ${r.status}`);
      return;
    }
    if (j.id != null) setDone(j.id);
    else setErr("Нет id в ответе");
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]";

  if (done !== null)
    return (
      <div className="mx-auto max-w-lg space-y-4 py-6 sm:py-8">
        <h1 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 sm:text-xl">
          Заявка #{done} создана
        </h1>
        <p className="text-[var(--muted)]">
          Статус: <strong className="text-[var(--foreground)]">new</strong>
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex rounded-lg border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--nav)]"
          >
            На главную
          </Link>
          <Link
            href="/request/new"
            className="inline-flex rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
          >
            Ещё одна заявка
          </Link>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-lg space-y-4 py-4 sm:py-8">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-lg font-bold sm:text-xl">Новая заявка</h1>
        <Link
          href="/"
          className="shrink-0 rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--nav)]"
          aria-label="Закрыть и на главную"
        >
          ✕ Закрыть
        </Link>
      </div>
      <p className="text-sm text-[var(--muted)]">
        Заполните форму или закройте страницу кнопкой выше.
      </p>
      <form
        onSubmit={onSubmit}
        className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:p-5"
      >
        <div>
          <label className="block text-sm font-medium">Клиент</label>
          <input
            required
            className={inputClass}
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Телефон</label>
          <input
            required
            className={inputClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Адрес</label>
          <input
            required
            className={inputClass}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Описание проблемы</label>
          <textarea
            required
            className={inputClass}
            rows={4}
            value={problemText}
            onChange={(e) => setProblemText(e.target.value)}
          />
        </div>
        {err && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            {err}
          </p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="submit"
            className="w-full rounded-lg bg-[var(--accent)] py-2.5 text-sm font-medium text-white hover:opacity-90 sm:flex-1"
          >
            Отправить
          </button>
          <Link
            href="/"
            className="w-full rounded-lg border border-[var(--border)] py-2.5 text-center text-sm hover:bg-[var(--nav)] sm:w-auto sm:px-4"
          >
            Отмена
          </Link>
        </div>
      </form>
    </div>
  );
}
