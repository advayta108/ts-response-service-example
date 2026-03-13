"use client";

import { useEffect, useState } from "react";

type Row = {
  id: number;
  clientName: string;
  phone: string;
  address: string;
  problemText: string;
  status: string;
  assignedTo: number | null;
};

export default function MasterPage() {
  const [list, setList] = useState<Row[]>([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const r = await fetch("/api/requests", { credentials: "include" });
    if (r.status === 401) {
      window.location.href = "/login";
      return;
    }
    const all: Row[] = await r.json();
    const uid = await fetch("/api/auth/me", { credentials: "include" })
      .then((x) => x.json())
      .then((j) => j.user?.id);
    if (!uid) {
      window.location.href = "/login";
      return;
    }
    setList(all.filter((x) => x.assignedTo === uid && x.status !== "done" && x.status !== "canceled"));
  }

  useEffect(() => {
    load();
  }, []);

  async function take(id: number) {
    setMsg("");
    const r = await fetch(`/api/requests/${id}/take`, {
      method: "POST",
      credentials: "include",
    });
    const j = await r.json();
    if (r.status === 409) setMsg(`#${id}: ${j.error} (ожидаемо при гонке)`);
    else if (!r.ok) setMsg(j.error);
    load();
  }

  async function complete(id: number) {
    setMsg("");
    const r = await fetch(`/api/requests/${id}/complete`, {
      method: "POST",
      credentials: "include",
    });
    const j = await r.json();
    if (!r.ok) setMsg(j.error);
    else load();
  }

  return (
    <div className="space-y-4 py-6">
      <h1 className="text-xl font-bold">Панель мастера</h1>
      <p className="text-sm text-white/60">Заявки, назначенные на вас</p>
      {msg && <p className="text-amber-400">{msg}</p>}
      <ul className="space-y-3">
        {list.map((row) => (
          <li
            key={row.id}
            className="rounded-lg border border-white/10 bg-[var(--card)] p-3 text-sm"
          >
            <div className="font-medium">#{row.id} {row.clientName} — {row.status}</div>
            <div className="text-white/70">{row.phone} · {row.address}</div>
            <div className="mt-1">{row.problemText}</div>
            <div className="mt-2 flex gap-2">
              {row.status === "assigned" && (
                <button
                  type="button"
                  className="rounded bg-green-600 px-2 py-1 text-xs"
                  onClick={() => take(row.id)}
                >
                  Взять в работу
                </button>
              )}
              {row.status === "in_progress" && (
                <button
                  type="button"
                  className="rounded bg-blue-600 px-2 py-1 text-xs"
                  onClick={() => complete(row.id)}
                >
                  Завершить
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
