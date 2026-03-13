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
    const j = await r.json();
    if (!r.ok) {
      setErr(j.error ?? "Ошибка");
      return;
    }
    setDone(j.id);
  }

  if (done !== null)
    return (
      <div className="space-y-4 py-8">
        <h1 className="text-xl font-bold text-green-400">Заявка #{done} создана</h1>
        <p>Статус: <strong>new</strong></p>
        <Link href="/" className="text-blue-400 hover:underline">На главную</Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-lg space-y-4 py-8">
      <h1 className="text-xl font-bold">Новая заявка</h1>
      <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-white/10 bg-[var(--card)] p-4">
        <div>
          <label className="block text-sm">Клиент</label>
          <input
            required
            className="mt-1 w-full rounded border border-white/20 bg-black/30 px-3 py-2"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm">Телефон</label>
          <input
            required
            className="mt-1 w-full rounded border border-white/20 bg-black/30 px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm">Адрес</label>
          <input
            required
            className="mt-1 w-full rounded border border-white/20 bg-black/30 px-3 py-2"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm">Описание проблемы</label>
          <textarea
            required
            className="mt-1 w-full rounded border border-white/20 bg-black/30 px-3 py-2"
            rows={4}
            value={problemText}
            onChange={(e) => setProblemText(e.target.value)}
          />
        </div>
        {err && <p className="text-sm text-red-400">{err}</p>}
        <button type="submit" className="w-full rounded-lg bg-blue-600 py-2 font-medium">
          Отправить
        </button>
      </form>
    </div>
  );
}
