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

type Master = { id: number; name: string };

export default function DispatcherPage() {
  const [list, setList] = useState<Row[]>([]);
  const [masters, setMasters] = useState<Master[]>([]);
  const [filter, setFilter] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const url = filter ? `/api/requests?status=${filter}` : "/api/requests";
    const r = await fetch(url, { credentials: "include" });
    if (r.status === 401) {
      window.location.href = "/login";
      return;
    }
    setList(await r.json());
  }

  useEffect(() => {
    fetch("/api/users/masters", { credentials: "include" })
      .then((r) => r.json())
      .then(setMasters);
  }, []);

  useEffect(() => {
    load();
  }, [filter]);

  async function assign(id: number, masterId: number) {
    setMsg("");
    const r = await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "assign", masterId }),
    });
    const j = await r.json();
    if (!r.ok) setMsg(j.error);
    else load();
  }

  async function cancel(id: number) {
    setMsg("");
    const r = await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    const j = await r.json();
    if (!r.ok) setMsg(j.error);
    else load();
  }

  return (
    <div className="space-y-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">Панель диспетчера</h1>
        <select
          className="rounded border border-white/20 bg-black/30 px-2 py-1"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">Все статусы</option>
          <option value="new">new</option>
          <option value="assigned">assigned</option>
          <option value="in_progress">in_progress</option>
          <option value="done">done</option>
          <option value="canceled">canceled</option>
        </select>
      </div>
      {msg && <p className="text-amber-400">{msg}</p>}
      <ul className="space-y-3">
        {list.map((row) => (
          <li
            key={row.id}
            className="rounded-lg border border-white/10 bg-[var(--card)] p-3 text-sm"
          >
            <div className="font-medium">
              #{row.id} {row.clientName} — {row.status}
            </div>
            <div className="text-white/70">{row.phone} · {row.address}</div>
            <div className="mt-1">{row.problemText}</div>
            {row.status === "new" && (
              <div className="mt-2 flex flex-wrap gap-2">
                {masters.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="rounded bg-blue-600 px-2 py-1 text-xs"
                    onClick={() => assign(row.id, m.id)}
                  >
                    Назначить {m.name}
                  </button>
                ))}
                <button
                  type="button"
                  className="rounded bg-red-900/80 px-2 py-1 text-xs"
                  onClick={() => cancel(row.id)}
                >
                  Отменить
                </button>
              </div>
            )}
            {row.status !== "new" && row.status !== "done" && row.status !== "canceled" && (
              <button
                type="button"
                className="mt-2 rounded bg-red-900/80 px-2 py-1 text-xs"
                onClick={() => cancel(row.id)}
              >
                Отменить
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
